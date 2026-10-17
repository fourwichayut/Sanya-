import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BNB_TESTNET,
  connectMetaMaskProvider,
  discoverMetaMaskProvider,
  ensureBNBTestnet,
  formatWeiBalance,
  getWalletErrorCode,
  getWalletErrorMessage,
  observeMetaMaskProvider,
  parseWalletAccounts,
  parseWalletChainId,
  readWalletSession,
  selectMetaMaskProvider
} from '../src/lib/metamask';
import type {
  EIP6963ProviderDetail,
  EthereumProvider,
  EthereumRequestArguments,
  WalletWindow
} from '../src/types/wallet';

const ADDRESS = '0x1111111111111111111111111111111111111111';
const NEXT_ADDRESS = '0x2222222222222222222222222222222222222222';

class FakeProvider implements EthereumProvider {
  isMetaMask = true;
  calls: EthereumRequestArguments[] = [];
  chainId = BNB_TESTNET.chainId as string;
  accounts: unknown = [ADDRESS];
  requestedAccounts: unknown = undefined;
  balance: unknown = '0xde0b6b3a7640000';
  override?: (args: EthereumRequestArguments) => unknown | Promise<unknown>;

  async request(args: EthereumRequestArguments): Promise<unknown> {
    this.calls.push(args);
    if (this.override) {
      const value = await this.override(args);
      if (value !== undefined) return value;
    }
    switch (args.method) {
      case 'eth_requestAccounts': return this.requestedAccounts ?? this.accounts;
      case 'eth_accounts': return this.accounts;
      case 'eth_chainId': return this.chainId;
      case 'eth_getBalance': return this.balance;
      case 'wallet_switchEthereumChain': this.chainId = BNB_TESTNET.chainId; return null;
      case 'wallet_addEthereumChain': return null;
      default: throw new Error(`Unexpected method ${args.method}`);
    }
  }
}

const detail = (provider: EthereumProvider, rdns = 'io.metamask'): EIP6963ProviderDetail => ({
  info: { uuid: 'test-id', name: 'Test Wallet', icon: 'data:image/svg+xml;base64,', rdns },
  provider
});

function announce(target: EventTarget, value: unknown) {
  const event = new Event('eip6963:announceProvider');
  Object.defineProperty(event, 'detail', { value });
  target.dispatchEvent(event);
}

test('prefers the EIP-6963 MetaMask provider over another injected wallet', () => {
  const announced = new FakeProvider();
  announced.isMetaMask = false;
  const injected = new FakeProvider();
  assert.equal(selectMetaMaskProvider([detail(announced)], injected), announced);
});

test('selects MetaMask from a multi-provider injection rather than the default wallet', () => {
  const metamask = new FakeProvider();
  const other = new FakeProvider();
  other.isMetaMask = false;
  const injected = { ...other, request: other.request.bind(other), providers: [other, metamask] };
  assert.equal(selectMetaMaskProvider([], injected), metamask);
  assert.equal(selectMetaMaskProvider([], other), null);
  assert.equal(selectMetaMaskProvider([], metamask), metamask);
  assert.equal(selectMetaMaskProvider([detail(other, 'com.otherwallet')]), null);
});

test('discovers a synchronous announcement and removes discovery listeners on cleanup', () => {
  const target = new EventTarget() as unknown as WalletWindow;
  const metamask = new FakeProvider();
  target.addEventListener('eip6963:requestProvider', () => announce(target, detail(metamask)));
  const observed: (EthereumProvider | null)[] = [];
  const stop = observeMetaMaskProvider(provider => observed.push(provider), target);
  assert.deepEqual(observed, [metamask]);
  stop();
  announce(target, detail(new FakeProvider()));
  target.dispatchEvent(new Event('ethereum#initialized'));
  assert.deepEqual(observed, [metamask]);
});

test('ignores malformed announcements and supports delayed extension injection', () => {
  const target = new EventTarget() as unknown as WalletWindow;
  const observed: (EthereumProvider | null)[] = [];
  const stop = observeMetaMaskProvider(provider => observed.push(provider), target);
  announce(target, { info: { rdns: 'io.metamask' }, provider: {} });
  assert.deepEqual(observed, [null]);
  const metamask = new FakeProvider();
  target.ethereum = metamask;
  target.dispatchEvent(new Event('ethereum#initialized'));
  assert.deepEqual(observed, [null, metamask]);
  stop();
});

test('allows a delayed EIP-6963 announcement to replace the legacy fallback', async () => {
  const target = new EventTarget() as unknown as WalletWindow;
  target.ethereum = new FakeProvider();
  const announced = new FakeProvider();
  target.addEventListener('eip6963:requestProvider', () => {
    setTimeout(() => announce(target, detail(announced)), 1);
  });
  assert.equal(await discoverMetaMaskProvider(target, 20), announced);
});

test('connects and reads the actual authorized account and exact native balance', async () => {
  const provider = new FakeProvider();
  const session = await connectMetaMaskProvider(provider);
  assert.deepEqual(session, { address: ADDRESS, chainId: '0x61', balanceBNB: '1', balanceError: null });
  assert.equal(provider.calls[0].method, 'eth_requestAccounts');
  assert.ok(!provider.calls.some(call => call.method === 'wallet_switchEthereumChain'));
  assert.deepEqual(provider.calls.find(call => call.method === 'eth_getBalance')?.params, [ADDRESS, 'latest']);
});

test('switches from another chain and verifies the result before reporting success', async () => {
  const provider = new FakeProvider();
  provider.chainId = '0x1';
  const session = await connectMetaMaskProvider(provider);
  assert.equal(session.chainId, '0x61');
  const switchIndex = provider.calls.findIndex(call => call.method === 'wallet_switchEthereumChain');
  assert.deepEqual(provider.calls[switchIndex].params, [{ chainId: '0x61' }]);
  assert.ok(provider.calls.slice(switchIndex + 1).some(call => call.method === 'eth_chainId'));
});

for (const unknownChain of [{ code: 4902 }, { code: -32603, data: { originalError: { code: 4902 } } }]) {
  test(`adds an unknown chain and explicitly switches it (${unknownChain.code})`, async () => {
    const provider = new FakeProvider();
    provider.chainId = '0x1';
    let switches = 0;
    provider.override = ({ method }) => {
      if (method === 'wallet_switchEthereumChain' && switches++ === 0) throw unknownChain;
    };
    const session = await connectMetaMaskProvider(provider);
    assert.equal(session.chainId, '0x61');
    assert.equal(switches, 2);
    assert.deepEqual(provider.calls.find(call => call.method === 'wallet_addEthereumChain')?.params, [BNB_TESTNET]);
    assert.equal(BNB_TESTNET.rpcUrls[0], 'https://bsc-testnet-dataseed.bnbchain.org');
    assert.equal(BNB_TESTNET.blockExplorerUrls[0], 'https://testnet.bscscan.com');
  });
}

test('does not report success when switching resolves but the chain remains wrong', async () => {
  const provider = new FakeProvider();
  provider.chainId = '0x1';
  provider.override = ({ method }) => method === 'wallet_switchEthereumChain' ? null : undefined;
  await assert.rejects(connectMetaMaskProvider(provider), { code: 'WRONG_NETWORK' });
});

test('propagates account or network rejection and does not add an unrelated chain', async () => {
  for (const rejectedMethod of ['eth_requestAccounts', 'wallet_switchEthereumChain', 'wallet_addEthereumChain']) {
    const provider = new FakeProvider();
    provider.chainId = '0x1';
    provider.override = ({ method }) => {
      if (method === rejectedMethod) throw { code: 4001 };
      if (rejectedMethod === 'wallet_addEthereumChain' && method === 'wallet_switchEthereumChain') throw { code: 4902 };
    };
    await assert.rejects(connectMetaMaskProvider(provider), error => getWalletErrorCode(error) === 'USER_REJECTED');
    if (rejectedMethod !== 'wallet_addEthereumChain') {
      assert.ok(!provider.calls.some(call => call.method === 'wallet_addEthereumChain'));
    }
  }
});

test('rejects empty authorization and rechecks accounts after a switch', async () => {
  const empty = new FakeProvider();
  empty.accounts = [];
  await assert.rejects(connectMetaMaskProvider(empty), { code: 'NO_ACCOUNTS_RETURNED' });
  assert.equal(empty.calls.length, 1);
  const revoked = new FakeProvider();
  revoked.requestedAccounts = [ADDRESS];
  revoked.accounts = [];
  await assert.rejects(connectMetaMaskProvider(revoked), { code: 'NO_ACCOUNTS_RETURNED' });
  const changed = new FakeProvider();
  changed.requestedAccounts = [ADDRESS];
  changed.accounts = [NEXT_ADDRESS];
  assert.equal((await connectMetaMaskProvider(changed)).address, NEXT_ADDRESS);
});

test('restores silently without authorization or network prompts', async () => {
  const provider = new FakeProvider();
  const session = await readWalletSession(provider);
  assert.equal(session.address, ADDRESS);
  assert.deepEqual(provider.calls.map(call => call.method), ['eth_accounts', 'eth_chainId', 'eth_getBalance']);
  provider.accounts = [];
  assert.equal((await readWalletSession(provider)).address, null);
});

test('does not read or display another network native balance as BNB', async () => {
  const provider = new FakeProvider();
  provider.chainId = '0x1';
  const session = await readWalletSession(provider);
  assert.equal(session.balanceBNB, null);
  assert.ok(!provider.calls.some(call => call.method === 'eth_getBalance'));
});

test('a balance RPC failure leaves a verified connection usable with a separate balance error', async () => {
  const provider = new FakeProvider();
  provider.override = ({ method }) => {
    if (method === 'eth_getBalance') throw new Error('RPC unavailable');
  };
  const session = await connectMetaMaskProvider(provider);
  assert.equal(session.address, ADDRESS);
  assert.equal(session.chainId, '0x61');
  assert.equal(session.balanceBNB, null);
  assert.equal(session.balanceError, getWalletErrorMessage('BALANCE_UNAVAILABLE'));
});

test('handles malformed account, chain and balance data conservatively', async () => {
  for (const value of [null, ADDRESS, ['0x1234'], [ADDRESS, 42]]) {
    assert.throws(() => parseWalletAccounts(value), { code: 'INVALID_PROVIDER_RESPONSE' });
  }
  for (const value of [null, 97, '97', '0x', '0x0', '0xgg']) {
    assert.throws(() => parseWalletChainId(value), { code: 'INVALID_PROVIDER_RESPONSE' });
  }
  assert.equal(parseWalletChainId('0x0061'), '0x61');
  const provider = new FakeProvider();
  provider.balance = '1234';
  assert.equal((await readWalletSession(provider)).balanceBNB, null);
  provider.accounts = ['invalid'];
  await assert.rejects(readWalletSession(provider), { code: 'INVALID_PROVIDER_RESPONSE' });
});

test('formats zero, fractional and large balances without floating point precision loss', () => {
  assert.equal(formatWeiBalance('0x0'), '0');
  assert.equal(formatWeiBalance('0x1'), '0.000000000000000001');
  assert.equal(formatWeiBalance(`0x${(123456789012345678901234567890n).toString(16)}`), '123456789012.34567890123456789');
});

test('maps wrapped rejections, pending requests and disconnected providers', () => {
  assert.equal(getWalletErrorCode({ code: -32603, data: { originalError: { code: '4001' } } }), 'USER_REJECTED');
  assert.equal(getWalletErrorCode({ code: -32002 }), 'REQUEST_PENDING');
  assert.equal(getWalletErrorCode({ code: 4900 }), 'PROVIDER_DISCONNECTED');
  assert.equal(getWalletErrorCode({ code: 4901 }), 'PROVIDER_DISCONNECTED');
  assert.equal(getWalletErrorCode(new Error('unexpected')), 'REQUEST_FAILED');
  assert.ok(getWalletErrorMessage({ code: -32002 }).includes('MetaMask'));
});

test('rejects a malformed chain before attempting a switch', async () => {
  const provider = new FakeProvider();
  provider.chainId = 'not-a-chain';
  await assert.rejects(ensureBNBTestnet(provider), { code: 'INVALID_PROVIDER_RESPONSE' });
  assert.deepEqual(provider.calls.map(call => call.method), ['eth_chainId']);
});
