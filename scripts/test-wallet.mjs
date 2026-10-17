import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = await mkdtemp(path.join(tmpdir(), 'smart-contact-wallet-tests-'));
try {
  await writeFile(path.join(output, 'package.json'), '{"type":"module"}');
  for (const file of ['src/types/wallet.ts', 'src/lib/metamask.ts', 'tests/metamask.test.ts']) {
    const source = await readFile(path.join(root, file), 'utf8');
    const { outputText } = ts.transpileModule(source, {
      fileName: file,
      compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext }
    });
    const destination = path.join(output, file.replace(/\.ts$/, '.js'));
    await mkdir(path.dirname(destination), { recursive: true });
    const javascript = outputText.replace(/(from\s+['"])(\.{1,2}\/[^'"]+)(['"])/g, '$1$2.js$3');
    await writeFile(destination, javascript);
  }
  const result = spawnSync(process.execPath, ['--test', path.join(output, 'tests/metamask.test.js')], {
    stdio: 'inherit'
  });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  await rm(output, { recursive: true, force: true });
}
