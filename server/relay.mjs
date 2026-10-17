import 'dotenv/config';
import express from 'express';
import { Contract, Interface, JsonRpcProvider, Wallet, isAddress } from 'ethers';

const CHAIN_ID = 97n;
const FEE = '1000000000000000000';
const MAX_RELAY_GAS = 4_000_000n;
const FORWARDER_ABI = [
    'function verify((address from,address to,uint256 value,uint256 gas,uint48 deadline,bytes data,bytes signature) request) view returns (bool)',
    'function execute((address from,address to,uint256 value,uint256 gas,uint48 deadline,bytes data,bytes signature) request) payable'
];
const ESCROW_ABI = [
    'function createAgreement(string title,string scope,address contractor,address arbitrator,uint64 reviewWindow,(string title,string criteria,uint128 amount,uint64 dueAt,uint8 revisionQuota)[] milestoneInputs)',
    'function submitMilestone(uint256 agreementId,uint256 milestoneId,bytes32 proofHash,string proofUri)',
    'function requestRevision(uint256 agreementId,uint256 milestoneId,string note)',
    'function explainFeasibility(uint256 agreementId,uint256 milestoneId,string explanation)',
    'function adjustRevisionNote(uint256 agreementId,uint256 milestoneId,string adjustedNote)',
    'function acceptRevision(uint256 agreementId,uint256 milestoneId)',
    'function approveMilestone(uint256 agreementId,uint256 milestoneId)',
    'function triggerAntiGhosting(uint256 agreementId,uint256 milestoneId)',
    'function raiseDispute(uint256 agreementId,uint256 milestoneId,string reason)',
    'function resolveDispute(uint256 agreementId,uint256 milestoneId,bool releaseToContractor)'
];

const required = ['RPC_URL', 'RELAYER_PRIVATE_KEY', 'FORWARDER_ADDRESS', 'ESCROW_ADDRESS'];
for (const key of required) {
    if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}
for (const key of ['FORWARDER_ADDRESS', 'ESCROW_ADDRESS']) {
    if (!isAddress(process.env[key])) throw new Error(`${key} must be a valid address.`);
}

const provider = new JsonRpcProvider(process.env.RPC_URL);
const relayer = new Wallet(process.env.RELAYER_PRIVATE_KEY, provider);
const network = await provider.getNetwork();
if (network.chainId !== CHAIN_ID) throw new Error(`Refusing to run outside BNB Testnet (chain 97); connected to ${network.chainId}.`);
const [forwarderCode, escrowCode] = await Promise.all([
    provider.getCode(process.env.FORWARDER_ADDRESS),
    provider.getCode(process.env.ESCROW_ADDRESS)
]);
if (forwarderCode === '0x' || escrowCode === '0x') throw new Error('Forwarder and Escrow must be deployed on BNB Testnet before starting the relayer.');

const forwarder = new Contract(process.env.FORWARDER_ADDRESS, FORWARDER_ABI, relayer);
const escrowInterface = new Interface(ESCROW_ABI);
const allowedFunctions = new Set(ESCROW_ABI.map(fragment => escrowInterface.getFunction(fragment.split('(')[0]).selector));
const app = express();
const origins = new Set((process.env.APP_ORIGINS || 'http://127.0.0.1:5173,http://localhost:5173').split(',').map(value => value.trim()));
const recentBySender = new Map();

app.use(express.json({ limit: '64kb' }));
app.use((request, response, next) => {
    const origin = request.headers.origin;
    if (origin && origins.has(origin)) {
        response.setHeader('Access-Control-Allow-Origin', origin);
        response.setHeader('Vary', 'Origin');
    }
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    if (request.method === 'OPTIONS') return response.sendStatus(204);
    next();
});

app.get('/api/health', (_request, response) => {
    response.json({ chainId: Number(CHAIN_ID), fee: FEE, escrowAddress: process.env.ESCROW_ADDRESS, ready: true });
});

app.post('/api/relay', async (request, response) => {
    try {
        const signed = request.body?.request;
        if (!signed || !isAddress(signed.from) || signed.to?.toLowerCase() !== process.env.ESCROW_ADDRESS.toLowerCase()) {
            return response.status(400).json({ error: 'Invalid relay target or signer.' });
        }
        if (signed.value !== '0' && signed.value !== 0) return response.status(400).json({ error: 'Native value is not accepted.' });
        const gas = BigInt(signed.gas);
        if (gas < 21_000n || gas > MAX_RELAY_GAS) return response.status(400).json({ error: 'Requested gas is outside the allowed range.' });
        if (BigInt(signed.deadline) < BigInt(Math.floor(Date.now() / 1000)) || BigInt(signed.deadline) > BigInt(Math.floor(Date.now() / 1000) + 600)) {
            return response.status(400).json({ error: 'Request deadline must be within the next 10 minutes.' });
        }
        const selector = String(signed.data).slice(0, 10).toLowerCase();
        if (!allowedFunctions.has(selector)) return response.status(403).json({ error: 'Function is not allowed by the relayer.' });

        const now = Date.now();
        const senderKey = signed.from.toLowerCase();
        const recent = (recentBySender.get(senderKey) || []).filter(timestamp => now - timestamp < 60_000);
        if (recent.length >= 8) return response.status(429).json({ error: 'Relay rate limit reached. Try again shortly.' });
        recent.push(now);
        recentBySender.set(senderKey, recent);

        const requestData = {
            from: signed.from,
            to: signed.to,
            value: 0n,
            gas,
            deadline: BigInt(signed.deadline),
            data: signed.data,
            signature: signed.signature
        };
        if (!(await forwarder.verify(requestData))) return response.status(400).json({ error: 'Forwarder rejected the signature or nonce.' });

        const transaction = await forwarder.execute(requestData, { gasLimit: gas + gas / 5n });
        const receipt = await transaction.wait();
        if (receipt.status !== 1) return response.status(502).json({ error: 'The forwarded transaction reverted.', transactionHash: transaction.hash });
        response.json({ transactionHash: transaction.hash, blockNumber: receipt.blockNumber, gasUsed: receipt.gasUsed.toString(), feeSya: '1' });
    } catch (error) {
        const status = error?.code === 'CALL_EXCEPTION' ? 422 : 400;
        response.status(status).json({ error: error instanceof Error ? error.shortMessage || error.message : 'Relay request failed.' });
    }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, '127.0.0.1', () => console.log(`SANYA Testnet relayer listening on http://127.0.0.1:${port}`));