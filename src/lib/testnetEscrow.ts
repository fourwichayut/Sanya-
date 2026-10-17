import {
    BrowserProvider,
    Contract,
    Interface,
    ZeroHash,
    formatUnits,
    isAddress,
    keccak256,
    parseUnits,
    toUtf8Bytes,
    type Eip1193Provider
} from 'ethers';
import { discoverMetaMaskProvider, BNB_TESTNET } from './metamask';

export const TESTNET_ESCROW_CONFIG = {
    sya: import.meta.env.VITE_SYA_TOKEN_ADDRESS || '',
    testUsd: import.meta.env.VITE_TEST_USD_ADDRESS || '',
    forwarder: import.meta.env.VITE_FORWARDER_ADDRESS || '',
    escrow: import.meta.env.VITE_ESCROW_ADDRESS || '',
    arbitrator: import.meta.env.VITE_ARBITRATOR_ADDRESS || '',
    relayUrl: import.meta.env.VITE_RELAYER_URL || '/api/relay'
} as const;

export const TESTNET_TOKEN_ABI = [
    'function balanceOf(address) view returns (uint256)',
    'function allowance(address,address) view returns (uint256)',
    'function approve(address,uint256) returns (bool)',
    'function mint(address,uint256)'
];

export const TESTNET_ESCROW_ABI = [
    'function nextAgreementId() view returns (uint256)',
    'function getAgreementsFor(address) view returns (uint256[])',
    'function getAgreement(uint256) view returns (address client,address contractor,address arbitrator,string title,string scope,uint64 reviewWindow,uint128 total,uint128 released,bool disputed,uint256 milestoneCount)',
    'function getMilestone(uint256,uint256) view returns (tuple(string title,string criteria,string proofUri,string revisionNote,string feasibilityExplanation,bytes32 proofHash,uint128 amount,uint64 dueAt,uint64 submittedAt,uint64 reviewDeadline,uint8 revisionQuota,uint8 revisionsUsed,uint8 state))',
    'function createAgreement(string,string,address,address,uint64,tuple(string title,string criteria,uint128 amount,uint64 dueAt,uint8 revisionQuota)[])',
    'function submitMilestone(uint256,uint256,bytes32,string)',
    'function requestRevision(uint256,uint256,string)',
    'function explainFeasibility(uint256,uint256,string)',
    'function adjustRevisionNote(uint256,uint256,string)',
    'function acceptRevision(uint256,uint256)',
    'function approveMilestone(uint256,uint256)',
    'function triggerAntiGhosting(uint256,uint256)',
    'function raiseDispute(uint256,uint256,string)',
    'function resolveDispute(uint256,uint256,bool)'
];

export const FORWARDER_ABI = [
    'function nonces(address) view returns (uint256)',
    'function verify((address from,address to,uint256 value,uint256 gas,uint48 deadline,bytes data,bytes signature) request) view returns (bool)'
];

export const TOKEN_APPROVAL_BUFFER = parseUnits('10', 18);
const FEE_PER_RELAY = parseUnits('1', 18);
const DOMAIN_NAME = 'SANYA Testnet Relay';

export interface EscrowAddresses {
    sya: string;
    testUsd: string;
    forwarder: string;
    escrow: string;
    arbitrator: string;
}

export interface RelayResult {
    transactionHash: string;
    blockNumber: number;
    gasUsed: string;
    feeSya: string;
}

export function getEscrowAddresses(): EscrowAddresses {
    const entries = Object.entries(TESTNET_ESCROW_CONFIG).filter(([key]) => key !== 'relayUrl');
    const invalid = entries.filter(([, value]) => !isAddress(value));
    if (invalid.length) throw new Error(`ตั้งค่า address ใน .env ไม่ครบหรือไม่ถูกต้อง: ${invalid.map(([key]) => key).join(', ')}`);
    return {
        sya: TESTNET_ESCROW_CONFIG.sya,
        testUsd: TESTNET_ESCROW_CONFIG.testUsd,
        forwarder: TESTNET_ESCROW_CONFIG.forwarder,
        escrow: TESTNET_ESCROW_CONFIG.escrow,
        arbitrator: TESTNET_ESCROW_CONFIG.arbitrator
    };
}

export async function getTestnetSigner() {
    const injected = await discoverMetaMaskProvider();
    if (!injected) throw new Error('ไม่พบ MetaMask ในเบราว์เซอร์');
    const provider = new BrowserProvider(injected as unknown as Eip1193Provider);
    const network = await provider.getNetwork();
    if (network.chainId !== BigInt(BNB_TESTNET.chainId)) throw new Error('กรุณาเปลี่ยน MetaMask เป็น BNB Smart Chain Testnet');
    const signer = await provider.getSigner();
    return { provider, signer, address: await signer.getAddress(), injected };
}

export async function readTestnetBalances(address: string) {
    const addresses = getEscrowAddresses();
    const { provider, address: activeAddress } = await getTestnetSigner();
    if (activeAddress.toLowerCase() !== address.toLowerCase()) throw new Error('บัญชี MetaMask เปลี่ยน กรุณาเชื่อมต่อใหม่');
    const sya = new Contract(addresses.sya, TESTNET_TOKEN_ABI, provider);
    const testUsd = new Contract(addresses.testUsd, TESTNET_TOKEN_ABI, provider);
    const [syaRaw, allowanceRaw, testUsdRaw, depositAllowanceRaw] = await Promise.all([
        sya.balanceOf(address),
        sya.allowance(address, addresses.escrow),
        testUsd.balanceOf(address),
        testUsd.allowance(address, addresses.escrow)
    ]);
    return {
        sya: formatUnits(syaRaw, 18),
        syaAllowance: formatUnits(allowanceRaw, 18),
        testUsd: formatUnits(testUsdRaw, 6),
        testUsdAllowance: formatUnits(depositAllowanceRaw, 6)
    };
}

export async function approveSyaBuffer() {
    const addresses = getEscrowAddresses();
    const { signer } = await getTestnetSigner();
    const token = new Contract(addresses.sya, TESTNET_TOKEN_ABI, signer);
    const transaction = await token.approve(addresses.escrow, TOKEN_APPROVAL_BUFFER);
    return transaction.wait();
}

export async function approveTestUsd(amount: bigint) {
    const addresses = getEscrowAddresses();
    const { signer } = await getTestnetSigner();
    const token = new Contract(addresses.testUsd, TESTNET_TOKEN_ABI, signer);
    const transaction = await token.approve(addresses.escrow, amount);
    return transaction.wait();
}

export async function mintTestUsd(amount: bigint) {
    const addresses = getEscrowAddresses();
    const { signer, address } = await getTestnetSigner();
    const token = new Contract(addresses.testUsd, TESTNET_TOKEN_ABI, signer);
    const transaction = await token.mint(address, amount);
    return transaction.wait();
}

export async function readAgreements(address: string) {
    const addresses = getEscrowAddresses();
    const { provider, address: activeAddress } = await getTestnetSigner();
    if (activeAddress.toLowerCase() !== address.toLowerCase()) throw new Error('บัญชี MetaMask เปลี่ยน กรุณาเชื่อมต่อใหม่');
    const escrow = new Contract(addresses.escrow, TESTNET_ESCROW_ABI, provider);
    const ids = await escrow.getAgreementsFor(address) as bigint[];
    const agreements = await Promise.all(ids.map(async id => {
        const summary = await escrow.getAgreement(id);
        const milestones = await Promise.all(
            Array.from({ length: Number(summary.milestoneCount) }, (_, index) => escrow.getMilestone(id, index))
        );
        return { id: id.toString(), summary, milestones };
    }));
    return agreements.reverse();
}

export async function sendRelayedAction(method: string, args: readonly unknown[]): Promise<RelayResult> {
    const addresses = getEscrowAddresses();
    const { provider, signer, address } = await getTestnetSigner();
    const escrowInterface = new Interface(TESTNET_ESCROW_ABI);
    const forwarder = new Contract(addresses.forwarder, FORWARDER_ABI, provider);
    const data = escrowInterface.encodeFunctionData(method, [...args]);
    const estimatedGas = await provider.estimateGas({ from: address, to: addresses.escrow, data });
    const gas = estimatedGas * 120n / 100n + 50_000n;
    if (gas > 4_000_000n) throw new Error('ธุรกรรมนี้ใช้ Gas เกินขีดจำกัด Testnet Relay');
    const nonce = await forwarder.nonces(address) as bigint;
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);
    const domain = { name: DOMAIN_NAME, version: '1', chainId: 97, verifyingContract: addresses.forwarder };
    const types = {
        ForwardRequest: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'gas', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint48' },
            { name: 'data', type: 'bytes' }
        ]
    };
    const message = { from: address, to: addresses.escrow, value: 0n, gas, nonce, deadline, data };
    const signature = await signer.signTypedData(domain, types, message);
    const signedRequest = { ...message, gas: gas.toString(), value: '0', deadline: deadline.toString(), nonce: nonce.toString(), signature };
    const verified = await forwarder.verify(signedRequest);
    if (!verified) throw new Error('ลายเซ็น Relay ไม่ผ่านการตรวจสอบ กรุณาลองใหม่');

    const response = await fetch(TESTNET_ESCROW_CONFIG.relayUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request: signedRequest })
    });
    const result = await response.json() as RelayResult | { error?: string };
    if (!response.ok) throw new Error('error' in result && result.error ? result.error : 'ส่งธุรกรรมผ่าน relayer ไม่สำเร็จ');
    return result as RelayResult;
}

export function toTestUsd(value: string): bigint {
    return parseUnits(value, 6);
}

export function hashProof(proof: string): string {
    return proof.trim() ? keccak256(toUtf8Bytes(proof.trim())) : ZeroHash;
}

export function feeDisplay(): string {
    return formatUnits(FEE_PER_RELAY, 18);
}

export function isValidWalletAddress(address: string): boolean {
    return isAddress(address);
}
