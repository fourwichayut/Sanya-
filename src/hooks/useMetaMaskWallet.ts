import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BNB_TESTNET,
  EMPTY_WALLET_SESSION,
  WalletError,
  connectMetaMaskProvider,
  discoverMetaMaskProvider,
  getWalletErrorCode,
  getWalletErrorMessage,
  observeMetaMaskProvider,
  parseWalletAccounts,
  parseWalletChainId,
  readWalletSession
} from '../lib/metamask';
import type {
  EthereumProvider,
  EthereumProviderListener,
  MetaMaskWallet,
  WalletConnectResult,
  WalletSession
} from '../types/wallet';

export function useMetaMaskWallet(): MetaMaskWallet {
  const [session, setSession] = useState<WalletSession>(EMPTY_WALLET_SESSION);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(false);
  const providerRef = useRef<EthereumProvider | null>(null);
  const removeListeners = useRef<(() => void) | null>(null);
  const locallyDisconnected = useRef(false);
  // Lifecycle changes invalidate every outstanding RPC; wallet events invalidate snapshots.
  const lifecycle = useRef(0);
  const revision = useRef(0);
  const readSequence = useRef(0);
  const activeRefreshes = useRef(new Set<number>());
  const connecting = useRef(false);
  const connectionPhase = useRef<'discovering' | 'requesting' | null>(null);
  const connectSequence = useRef(0);
  const inFlight = useRef<{ sequence: number; promise: Promise<WalletConnectResult> } | null>(null);

  const readSession = useCallback(async (): Promise<WalletSession> => {
    const provider = providerRef.current;
    if (!provider || locallyDisconnected.current) return { ...EMPTY_WALLET_SESSION };
    const lifecycleAtStart = lifecycle.current;
    const sequence = ++readSequence.current;
    activeRefreshes.current.add(sequence);
    if (mounted.current) setIsRefreshing(true);
    try {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const revisionAtStart = revision.current;
        const latest = await readWalletSession(provider);
        if (!mounted.current || lifecycleAtStart !== lifecycle.current || locallyDisconnected.current) {
          throw new WalletError('SESSION_CHANGED');
        }
        if (revisionAtStart !== revision.current) continue;
        if (sequence === readSequence.current) {
          setSession(latest);
          setError(latest.address && latest.chainId !== BNB_TESTNET.chainId ? 'WRONG_NETWORK' : null);
        }
        return latest;
      }
      throw new WalletError('SESSION_CHANGED');
    } catch (caught) {
      if (mounted.current && lifecycleAtStart === lifecycle.current && sequence === readSequence.current) {
        setSession({ ...EMPTY_WALLET_SESSION });
        setError(getWalletErrorCode(caught));
      }
      throw caught;
    } finally {
      activeRefreshes.current.delete(sequence);
      if (mounted.current) setIsRefreshing(activeRefreshes.current.size > 0);
    }
  }, []);

  const installProvider = useCallback((provider: EthereumProvider | null) => {
    if (provider === providerRef.current) {
      if (mounted.current) setIsAvailable(Boolean(provider));
      return;
    }
    removeListeners.current?.();
    removeListeners.current = null;
    providerRef.current = provider;
    lifecycle.current += 1;
    revision.current += 1;
    activeRefreshes.current.clear();
    setIsRefreshing(false);
    if (connectionPhase.current !== 'discovering') {
      connectSequence.current += 1;
      connecting.current = false;
      connectionPhase.current = null;
      setIsConnecting(false);
    }
    setIsAvailable(Boolean(provider));
    setSession({ ...EMPTY_WALLET_SESSION });
    setError(null);
    if (!provider) return;

    const refreshAfterEvent = () => {
      if (!connecting.current) void readSession().catch(() => { /* Error is exposed in wallet state. */ });
    };
    const onAccountsChanged: EthereumProviderListener = (rawAccounts) => {
      if (!mounted.current || locallyDisconnected.current) return;
      revision.current += 1;
      try {
        const address = parseWalletAccounts(rawAccounts)[0] || null;
        setSession(current => ({ ...current, address, balanceBNB: null, balanceError: null }));
        setError(null);
        // Empty authorization is immediately disconnected and cannot restore a stale account.
        if (address) refreshAfterEvent();
      } catch {
        setSession({ ...EMPTY_WALLET_SESSION });
        setError('INVALID_PROVIDER_RESPONSE');
      }
    };
    const onChainChanged: EthereumProviderListener = (rawChainId) => {
      if (!mounted.current || locallyDisconnected.current) return;
      revision.current += 1;
      try {
        const chainId = parseWalletChainId(rawChainId);
        setSession(current => ({ ...current, chainId, balanceBNB: null, balanceError: null }));
        setError(chainId === BNB_TESTNET.chainId ? null : 'WRONG_NETWORK');
        refreshAfterEvent();
      } catch {
        setSession({ ...EMPTY_WALLET_SESSION });
        setError('INVALID_PROVIDER_RESPONSE');
      }
    };
    const onDisconnect: EthereumProviderListener = () => {
      if (!mounted.current) return;
      lifecycle.current += 1;
      revision.current += 1;
      activeRefreshes.current.clear();
      setIsRefreshing(false);
      connectSequence.current += 1;
      connecting.current = false;
      connectionPhase.current = null;
      setIsConnecting(false);
      setSession({ ...EMPTY_WALLET_SESSION });
      setError('PROVIDER_DISCONNECTED');
    };
    const listeners: [string, EthereumProviderListener][] = [
      ['accountsChanged', onAccountsChanged],
      ['chainChanged', onChainChanged],
      ['disconnect', onDisconnect]
    ];
    listeners.forEach(([event, listener]) => provider.on?.(event, listener));
    removeListeners.current = () => {
      listeners.forEach(([event, listener]) => provider.removeListener?.(event, listener));
    };
    if (!locallyDisconnected.current) {
      // Restoration only reads already authorized accounts; it never opens MetaMask.
      void readSession().catch(() => { /* Error is exposed in wallet state. */ });
    }
  }, [readSession]);

  useEffect(() => {
    mounted.current = true;
    const stopDiscovery = observeMetaMaskProvider(installProvider);
    return () => {
      mounted.current = false;
      lifecycle.current += 1;
      revision.current += 1;
      connectSequence.current += 1;
      activeRefreshes.current.clear();
      stopDiscovery();
      removeListeners.current?.();
      removeListeners.current = null;
      providerRef.current = null;
    };
  }, [installProvider]);

  const connect = useCallback((): Promise<WalletConnectResult> => {
    if (inFlight.current?.sequence === connectSequence.current) return inFlight.current.promise;
    const sequence = ++connectSequence.current;
    locallyDisconnected.current = false;
    connecting.current = true;
    connectionPhase.current = 'discovering';
    setIsConnecting(true);
    setError(null);
    const promise = (async (): Promise<WalletConnectResult> => {
      try {
        // Allow announced providers to take priority even with multiple injected wallets.
        const discovered = await discoverMetaMaskProvider();
        if (!mounted.current || sequence !== connectSequence.current) throw new WalletError('SESSION_CHANGED');
        const provider = discovered || providerRef.current;
        if (!provider) throw new WalletError('METAMASK_NOT_FOUND');
        if (provider !== providerRef.current) {
          installProvider(provider);
        }
        connectionPhase.current = 'requesting';
        const lifecycleAtStart = lifecycle.current;
        await connectMetaMaskProvider(provider);
        if (!mounted.current || sequence !== connectSequence.current || lifecycleAtStart !== lifecycle.current) {
          throw new WalletError('SESSION_CHANGED');
        }
        const verified = await readSession();
        if (!verified.address) throw new WalletError('NO_ACCOUNTS_RETURNED');
        if (verified.chainId !== BNB_TESTNET.chainId) throw new WalletError('WRONG_NETWORK');
        if (!mounted.current || sequence !== connectSequence.current) throw new WalletError('SESSION_CHANGED');
        setError(null);
        return { success: true, address: verified.address, chainId: verified.chainId };
      } catch (caught) {
        const code = getWalletErrorCode(caught);
        if (mounted.current && sequence === connectSequence.current) setError(code);
        return { success: false, error: code };
      } finally {
        if (mounted.current && sequence === connectSequence.current) {
          connecting.current = false;
          connectionPhase.current = null;
          setIsConnecting(false);
        }
        if (inFlight.current?.sequence === sequence) inFlight.current = null;
      }
    })();
    inFlight.current = { sequence, promise };
    return promise;
  }, [installProvider, readSession]);

  const disconnect = useCallback(() => {
    locallyDisconnected.current = true;
    lifecycle.current += 1;
    revision.current += 1;
    activeRefreshes.current.clear();
    setIsRefreshing(false);
    connectSequence.current += 1;
    connecting.current = false;
    connectionPhase.current = null;
    setIsConnecting(false);
    setSession({ ...EMPTY_WALLET_SESSION });
    setError(null);
  }, []);

  return {
    ...session,
    isAvailable,
    isConnected: Boolean(session.address && session.chainId === BNB_TESTNET.chainId),
    isConnecting,
    isRefreshing,
    error,
    errorMessage: error ? getWalletErrorMessage(error) : null,
    connect,
    refresh: readSession,
    disconnect,
    readSession
  };
}
