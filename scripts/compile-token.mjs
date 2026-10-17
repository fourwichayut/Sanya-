import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import solc from 'solc';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const tokenSource = await readFile(resolve(projectRoot, 'contracts/SanyaToken.sol'), 'utf8');
const escrowSource = await readFile(resolve(projectRoot, 'contracts/SanyaEscrow.sol'), 'utf8');
const input = {
    language: 'Solidity',
    sources: {
        'contracts/SanyaToken.sol': { content: tokenSource },
        'contracts/SanyaEscrow.sol': { content: escrowSource }
    },
    settings: {
        optimizer: { enabled: true, runs: 200 },
        outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } }
    }
};

const output = JSON.parse(solc.compile(JSON.stringify(input), {
    import(importPath) {
        try {
            return { contents: require('node:fs').readFileSync(require.resolve(importPath, { paths: [projectRoot] }), 'utf8') };
        } catch {
            return { error: `Unable to resolve Solidity import: ${importPath}` };
        }
    }
}));
const errors = (output.errors || []).filter(error => error.severity === 'error');
if (errors.length) {
    throw new Error(errors.map(error => error.formattedMessage).join('\n'));
}

const artifacts = [
    ['SANYA_TOKEN_ARTIFACT', 'contracts/SanyaToken.sol', 'SanyaToken'],
    ['SANYA_TEST_USD_ARTIFACT', 'contracts/SanyaEscrow.sol', 'SanyaTestUSD'],
    ['SANYA_FORWARDER_ARTIFACT', 'contracts/SanyaEscrow.sol', 'SanyaForwarder'],
    ['SANYA_ESCROW_ARTIFACT', 'contracts/SanyaEscrow.sol', 'SanyaEscrow']
];
const artifactLines = [];
const artifactDirectory = resolve(projectRoot, 'server/artifacts');
await mkdir(artifactDirectory, { recursive: true });
for (const [exportName, sourceName, contractName] of artifacts) {
    const artifact = output.contracts?.[sourceName]?.[contractName];
    if (!artifact?.evm?.bytecode?.object) throw new Error(`Solidity compiler did not produce ${contractName} deployment bytecode`);
    const compiledArtifact = {
        abi: artifact.abi,
        bytecode: `0x${artifact.evm.bytecode.object}`
    };
    artifactLines.push(`export const ${exportName} = ${JSON.stringify(compiledArtifact)} as const;`);
    await writeFile(resolve(artifactDirectory, `${contractName}.json`), JSON.stringify(compiledArtifact), 'utf8');
}
await writeFile(resolve(projectRoot, 'src/data/sanyaTokenArtifact.ts'), `${artifactLines[0]}\n`, 'utf8');
await writeFile(resolve(projectRoot, 'src/data/sanyaEscrowArtifacts.ts'), `${artifactLines.slice(1).join('\n')}\n`, 'utf8');
console.log(`Compiled SANYA Testnet contracts with solc ${solc.version()}`);