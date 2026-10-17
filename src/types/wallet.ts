export interface EthereumRequestArguments {
  method: string;
  params?: readonly unknown[] | object;
}

export type EthereumProviderListener = (...args: unknown[]) => void;

/** The provider selected for every RPC call; never mix calls between wallets. */
export interface EthereumProvider {
  request: (args: EthereumRequestArguments) => Promise<unknown>;
  isMetaMask?: boolean;
  providers?: readonly EthereumProvider[];
  on?: (event: string, listener: EthereumProviderListener) => void;
  removeListener?: (event: string, listener: EthereumProviderListener) => void;
}

export interface EIP6963ProviderDetail {
  info: {
    uuid: string;
    name: string;
    icon: string;
    rdns: string;
  };
  provider: EthereumProvider;
}

export interface WalletWindow extends Window {
  ethereum?: EthereumProvider;
}

export interface WalletSession {
  address: string | null;
  chainId: string | null;
  /** Exact decimal native balance, read from eth_getBalance on BNB Testnet. */
  balanceBNB: string | null;
  balanceError: string | null;
}

export interface WalletConnectResult {
  success: boolean;
  address?: string;
  chainId?: string;
  error?: string;
}

export interface MetaMaskWallet extends WalletSession {
  isAvailable: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  isRefreshing: boolean;
  error: string | null;
  errorMessage: string | null;
  connect: () => Promise<WalletConnectResult>;
  refresh: () => Promise<WalletSession>;
  /** Clear the app session; this does not revoke permissions inside MetaMask. */
  disconnect: () => void;
  /** Re-read authorization and network without opening a wallet prompt. */
  readSession: () => Promise<WalletSession>;
}
