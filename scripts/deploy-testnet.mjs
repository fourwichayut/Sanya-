import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { ContractFactory, JsonRpcProvider, Wallet, getAddress } from 'ethers';

const rpcUrl = process.env.RPC_URL;
const privateKey = process.env.RELAYER_PRIVATE_KEY;
const syaAddress = process.env.SYA_TOKEN_ADDRESS;
if (!rpcUrl || !privateKey || !syaAddress) {
    throw new Error('Set RPC_URL, RELAYER_PRIVATE_KEY, and SYA_TOKEN_ADDRESS in .env first.');
}

const provider = new JsonRpcProvider(rpcUrl);
const signer = new Wallet(privateKey, provider);
const network = await provider.getNetwork();
if (network.chainId !== 97n) throw new Error(`Refusing to deploy outside BNB Testnet (chain 97); connected to ${network.chainId}.`);

const deploy = async (name, constructorArgs = []) => {
    const artifact = JSON.parse(await readFile(resolve('server/artifacts', `${name}.json`), 'utf8'));
    const contract = await new ContractFactory(artifact.abi, artifact.bytecode, signer).deploy(...constructorArgs);
    await contract.waitForDeployment();
    const address = await contract.getAddress();
    console.log(`${name}=${address}`);
    return address;
};

const treasury = getAddress(process.env.FEE_TREASURY_ADDRESS || signer.address);
const forwarder = await deploy('SanyaForwarder');
const testUsd = await deploy('SanyaTestUSD');
const escrow = await deploy('SanyaEscrow', [forwarder, getAddress(syaAddress), testUsd, treasury]);

console.log('\nCopy these addresses to .env, then start the relayer with npm run relay.');
console.log(`FORWARDER_ADDRESS=${forwarder}`);
console.log(`TEST_USD_ADDRESS=${testUsd}`);
console.log(`ESCROW_ADDRESS=${escrow}`);
console.log(`FEE_TREASURY_ADDRESS=${treasury}`);