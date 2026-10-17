import type {
  EIP6963ProviderDetail,
  EthereumProvider,
  WalletSession,
  WalletWindow
} from '../types/wallet';

export const BNB_TESTNET = {
  chainId: '0x61',
  chainName: 'BNB Smart Chain Testnet',
  nativeCurrency: { name: 'Test BNB', symbol: 'tBNB', decimals: 18 },
  rpcUrls: ['https://bsc-testnet-dataseed.bnbchain.org'],
  blockExplorerUrls: ['https://testnet.bscscan.com']
} as const;

export const EMPTY_WALLET_SESSION: WalletSession = {
  address: null,
  chainId: null,
  balanceBNB: null,
  balanceError: null
};

export class WalletError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = 'WalletError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isEthereumProvider(value: unknown): value is EthereumProvider {
  return isRecord(value) && typeof value.request === 'function';
}

/** EIP-6963's MetaMask announcement takes priority over legacy injection. */
export function selectMetaMaskProvider(
  announcements: readonly EIP6963ProviderDetail[],
  injected?: EthereumProvider
): EthereumProvider | null {
  const announced = announcements.find(
    detail => detail.info.rdns === 'io.metamask' && isEthereumProvider(detail.provider)
  );
  if (announced) return announced.provider;
  const legacy = Array.isArray(injected?.providers)
    ? injected.providers.find(provider => isEthereumProvider(provider) && provider.isMetaMask === true)
    : null;
  if (legacy) return legacy;
  return injected?.isMetaMask === true && isEthereumProvider(injected) ? injected : null;
}

function readAnnouncement(event: Event): EIP6963ProviderDetail | null {
  const detail = (event as CustomEvent<unknown>).detail;
  if (!isRecord(detail) || !isRecord(detail.info) || !isEthereumProvider(detail.provider)) return null;
  const { uuid, name, icon, rdns } = detail.info;
  if ([uuid, name, icon, rdns].some(value => typeof value !== 'string')) return null;
  return detail as unknown as EIP6963ProviderDetail;
}

/** Keep discovery active so delayed extension injection is also supported. */
export function observeMetaMaskProvider(
  onProvider: (provider: EthereumProvider | null) => void,
  target: WalletWindow = window as WalletWindow
): () => void {
  const announcements: EIP6963ProviderDetail[] = [];
  let selected: EthereumProvider | null | undefined;
  const update = () => {
    const next = selectMetaMaskProvider(announcements, target.ethereum);
    if (next !== selected) {
      selected = next;
      onProvider(next);
    }
  };
  const onAnnouncement = (event: Event) => {
    const detail = readAnnouncement(event);
    if (!detail) return;
    if (!announcements.some(item => item.provider === detail.provider)) announcements.push(detail);
    update();
  };
  target.addEventListener('eip6963:announceProvider', onAnnouncement);
  target.addEventListener('ethereum#initialized', update);
  target.dispatchEvent(new Event('eip6963:requestProvider'));
  update();
  return () => {
    target.removeEventListener('eip6963:announceProvider', onAnnouncement);
    target.removeEventListener('ethereum#initialized', update);
  };
}

export function discoverMetaMaskProvider(
  target: WalletWindow = window as WalletWindow,
  waitMs = 120
): Promise<EthereumProvider | null> {
  return new Promise(resolve => {
    let selected: EthereumProvider | null = null;
    const stop = observeMetaMaskProvider(provider => { selected = provider; }, target);
    setTimeout(() => {
      stop();
      resolve(selected);
    }, waitMs);
  });
}

export function parseWalletAccounts(value: unknown): string[] {
  if (!Array.isArray(value) || value.some(account => typeof account !== 'string' || !/^0x[\da-f]{40}$/i.test(account))) {
    throw new WalletError('INVALID_PROVIDER_RESPONSE');
  }
  return value as string[];
}

export function parseWalletChainId(value: unknown): string {
  if (typeof value !== 'string' || !/^0x[\da-f]+$/i.test(value) || BigInt(value) <= 0n) {
    throw new WalletError('INVALID_PROVIDER_RESPONSE');
  }
  return `0x${BigInt(value).toString(16)}`;
}

export function formatWeiBalance(value: unknown): string {
  if (typeof value !== 'string' || !/^0x[\da-f]+$/i.test(value)) {
    throw new WalletError('INVALID_PROVIDER_RESPONSE');
  }
  const wei = BigInt(value);
  const unit = 10n ** 18n;
  const fraction = (wei % unit).toString().padStart(18, '0').replace(/0+$/, '');
  return `${wei / unit}${fraction ? `.${fraction}` : ''}`;
}

/** Wrapped errors are used by some wallet versions for unknown chains. */
export function hasProviderErrorCode(error: unknown, code: number): boolean {
  const visited = new Set<unknown>();
  const check = (value: unknown, depth: number): boolean => {
    if (!isRecord(value) || visited.has(value) || depth > 5) return false;
    visited.add(value);
    if (value.code === code || value.code === String(code)) return true;
    return [value.data, value.originalError, value.cause].some(nested => check(nested, depth + 1));
  };
  return check(error, 0);
}

export function getWalletErrorCode(error: unknown): string {
  if (error instanceof WalletError) return error.code;
  if (typeof error === 'string') return error;
  if (hasProviderErrorCode(error, 4001)) return 'USER_REJECTED';
  if (hasProviderErrorCode(error, -32002)) return 'REQUEST_PENDING';
  if (hasProviderErrorCode(error, 4900) || hasProviderErrorCode(error, 4901)) return 'PROVIDER_DISCONNECTED';
  return 'REQUEST_FAILED';
}

export function getWalletErrorMessage(error: unknown): string {
  const messages: Record<string, string> = {
    METAMASK_NOT_FOUND: 'ไม่พบ MetaMask กรุณาติดตั้งส่วนขยาย แล้วเปิดเว็บไซต์นี้ในเบราว์เซอร์ที่ติดตั้ง MetaMask',
    USER_REJECTED: 'คุณปฏิเสธคำขอใน MetaMask กรุณากดเชื่อมต่อและอนุมัติอีกครั้ง',
    REQUEST_PENDING: 'มีคำขอค้างอยู่ใน MetaMask กรุณาเปิด MetaMask และดำเนินการให้เสร็จ',
    NO_ACCOUNTS_RETURNED: 'MetaMask ยังไม่ได้อนุญาตบัญชีให้เว็บไซต์นี้ กรุณาปลดล็อกและเลือกบัญชี',
    WRONG_NETWORK: 'กรุณาอนุมัติการสลับไป BNB Smart Chain Testnet (Chain ID 97) ใน MetaMask',
    PROVIDER_DISCONNECTED: 'MetaMask ขาดการเชื่อมต่อ กรุณาเปิด MetaMask หรือลองโหลดหน้าใหม่',
    INVALID_PROVIDER_RESPONSE: 'ข้อมูลจาก MetaMask ไม่ถูกต้อง กรุณาลองเชื่อมต่อใหม่',
    SESSION_CHANGED: 'บัญชีหรือเครือข่ายเปลี่ยนระหว่างดำเนินการ กรุณาลองอีกครั้ง',
    BALANCE_UNAVAILABLE: 'อ่านยอด tBNB ไม่สำเร็จ กรุณาลองรีเฟรชยอดอีกครั้ง',
    REQUEST_FAILED: 'เชื่อมต่อ MetaMask ไม่สำเร็จ กรุณาตรวจสอบ MetaMask แล้วลองอีกครั้ง'
  };
  return messages[getWalletErrorCode(error)] || messages.REQUEST_FAILED;
}

export async function ensureBNBTestnet(provider: EthereumProvider): Promise<void> {
  const chainId = parseWalletChainId(await provider.request({ method: 'eth_chainId' }));
  if (chainId !== BNB_TESTNET.chainId) {
    try {
      await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: BNB_TESTNET.chainId }] });
    } catch (error) {
      if (!hasProviderErrorCode(error, 4902)) throw error;
      await provider.request({ method: 'wallet_addEthereumChain', params: [BNB_TESTNET] });
      // Adding a network does not guarantee the wallet selected it.
      await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: BNB_TESTNET.chainId }] });
    }
  }
  const confirmed = parseWalletChainId(await provider.request({ method: 'eth_chainId' }));
  if (confirmed !== BNB_TESTNET.chainId) throw new WalletError('WRONG_NETWORK');
}

export async function readWalletSession(provider: EthereumProvider): Promise<WalletSession> {
  const [rawAccounts, rawChainId] = await Promise.all([
    provider.request({ method: 'eth_accounts' }),
    provider.request({ method: 'eth_chainId' })
  ]);
  const accounts = parseWalletAccounts(rawAccounts);
  const chainId = parseWalletChainId(rawChainId);
  const address = accounts[0] || null;
  let balanceBNB: string | null = null;
  let balanceError: string | null = null;
  if (address && chainId === BNB_TESTNET.chainId) {
    try {
      balanceBNB = formatWeiBalance(await provider.request({ method: 'eth_getBalance', params: [address, 'latest'] }));
    } catch {
      // A balance RPC outage must not discard a verified account connection.
      balanceError = getWalletErrorMessage('BALANCE_UNAVAILABLE');
    }
  }
  return { address, chainId, balanceBNB, balanceError };
}

export async function connectMetaMaskProvider(provider: EthereumProvider): Promise<WalletSession> {
  const accounts = parseWalletAccounts(await provider.request({ method: 'eth_requestAccounts' }));
  if (!accounts.length) throw new WalletError('NO_ACCOUNTS_RETURNED');
  await ensureBNBTestnet(provider);
  // Never trust a requestAccounts result after a network switch or account event.
  const session = await readWalletSession(provider);
  if (!session.address) throw new WalletError('NO_ACCOUNTS_RETURNED');
  if (session.chainId !== BNB_TESTNET.chainId) throw new WalletError('WRONG_NETWORK');
  return session;
}
