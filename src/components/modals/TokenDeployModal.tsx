import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ExternalLink, Fuel, X } from 'lucide-react';
import { useContracts } from '../../context/ContractContext';
import { SANYA_TOKEN_ARTIFACT } from '../../data/sanyaTokenArtifact';
import { BNB_TESTNET, discoverMetaMaskProvider } from '../../lib/metamask';
import type { EthereumProvider } from '../../types/wallet';

const TESTNET_EXPLORER = 'https://testnet.bscscan.com';
const ADDRESS_RE = /^0x[\da-fA-F]{40}$/;

function formatNativeAmount(wei: bigint): string {
    const unit = 10n ** 18n;
    const fraction = (wei % unit).toString().padStart(18, '0').replace(/0+$/, '');
    return `${wei / unit}${fraction ? `.${fraction}` : ''}`;
}

async function getAuthorizedTestnetAccount(expectedAddress: string): Promise<{ provider: EthereumProvider; address: string }> {
    const provider = await discoverMetaMaskProvider();
    if (!provider) throw new Error('ไม่พบ MetaMask ที่เชื่อมต่อ กรุณาเชื่อมกระเป๋าก่อน');

    const [chainId, rawAccounts] = await Promise.all([
        provider.request({ method: 'eth_chainId' }),
        provider.request({ method: 'eth_accounts' })
    ]);
    const accounts = Array.isArray(rawAccounts) ? rawAccounts : [];
    const address = accounts[0];
    if (String(chainId).toLowerCase() !== BNB_TESTNET.chainId) {
        throw new Error('ฟีเจอร์ deploy นี้เปิดเฉพาะ BNB Smart Chain Testnet (Chain ID 97)');
    }
    if (typeof address !== 'string' || !ADDRESS_RE.test(address) || address.toLowerCase() !== expectedAddress.toLowerCase()) {
        throw new Error('บัญชี MetaMask ไม่ตรงกับบัญชีที่เชื่อมใน SANYA กรุณาเชื่อมบัญชีเดิมอีกครั้ง');
    }
    return { provider, address };
}

async function estimateDeployment(provider: EthereumProvider, address: string) {
    const transaction = { from: address, data: SANYA_TOKEN_ARTIFACT.bytecode };
    const [gasRaw, gasPriceRaw] = await Promise.all([
        provider.request({ method: 'eth_estimateGas', params: [transaction] }),
        provider.request({ method: 'eth_gasPrice' })
    ]);
    const gas = BigInt(String(gasRaw));
    const gasPrice = BigInt(String(gasPriceRaw));
    return { transaction, estimate: `${formatNativeAmount(gas * gasPrice)} tBNB (ประมาณการ)` };
}

export const TokenDeployModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { walletAddress, isWalletConnected, connectMetaMask, refreshWallet } = useContracts();
    const [estimate, setEstimate] = useState<string | null>(null);
    const [transactionHash, setTransactionHash] = useState<string | null>(null);
    const [contractAddress, setContractAddress] = useState<string | null>(null);
    const [isBusy, setIsBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleEstimate = async () => {
        setError(null);
        setEstimate(null);
        try {
            if (!isWalletConnected || !walletAddress) throw new Error('กรุณาเชื่อม MetaMask กับ BNB Testnet ก่อน');
            const { provider, address } = await getAuthorizedTestnetAccount(walletAddress);
            const prepared = await estimateDeployment(provider, address);
            setEstimate(prepared.estimate);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'ประเมินค่า Gas ไม่สำเร็จ');
        }
    };

    const handleDeploy = async () => {
        setError(null);
        setTransactionHash(null);
        setContractAddress(null);
        setIsBusy(true);
        try {
            if (!isWalletConnected || !walletAddress) {
                const result = await connectMetaMask();
                if (!result.success) throw new Error('เชื่อม MetaMask ไม่สำเร็จ กรุณาลองใหม่');
                throw new Error('เชื่อมกระเป๋าแล้ว กรุณากด Deploy อีกครั้งเพื่อทบทวนการทำรายการ');
            }

            const { provider, address } = await getAuthorizedTestnetAccount(walletAddress);
            const { transaction, estimate: currentEstimate } = await estimateDeployment(provider, address);
            setEstimate(currentEstimate);
            const result = await provider.request({ method: 'eth_sendTransaction', params: [transaction] });
            if (typeof result !== 'string' || !/^0x[\da-fA-F]{64}$/.test(result)) {
                throw new Error('MetaMask ไม่ได้ส่ง Transaction Hash ที่ถูกต้อง');
            }
            setTransactionHash(result);

            for (let attempt = 0; attempt < 60; attempt += 1) {
                const receipt = await provider.request({ method: 'eth_getTransactionReceipt', params: [result] });
                if (receipt && typeof receipt === 'object') {
                    const mined = receipt as { status?: string; contractAddress?: string | null };
                    if (mined.status === '0x0') throw new Error('ธุรกรรม revert ตรวจรายละเอียด Gas และเหตุผลบน BscScan');
                    if (mined.contractAddress && ADDRESS_RE.test(mined.contractAddress)) {
                        setContractAddress(mined.contractAddress);
                        await refreshWallet().catch(() => undefined);
                        return;
                    }
                }
                await new Promise(resolve => window.setTimeout(resolve, 2000));
            }
            setError('ส่งธุรกรรมแล้ว แต่ยังรอ receipt ไม่สำเร็จ เปิด Transaction บน BscScan เพื่อตรวจสถานะ');
        } catch (caught) {
            const code = (caught as { code?: number })?.code;
            setError(code === 4001
                ? 'คุณยกเลิกรายการใน MetaMask จึงไม่มีการ deploy'
                : caught instanceof Error ? caught.message : 'Deploy ไม่สำเร็จ');
        } finally {
            setIsBusy(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="token-deploy-title">
            <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-5 sm:p-6 space-y-4 text-zinc-900 shadow-2xl">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 id="token-deploy-title" className="text-lg font-bold">สร้าง SANYA Token บน Testnet</h2>
                        <p className="mt-1 text-xs text-zinc-500">ERC-20 · SYA · 1,000,000 เหรียญ · Fixed supply</p>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100" aria-label="ปิด"><X className="h-5 w-5" /></button>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
                    <strong>เฉพาะ BNB Testnet:</strong> การ deploy จะส่งธุรกรรมจริงผ่าน MetaMask และใช้ tBNB เป็นค่า Gas ซึ่งไม่มีมูลค่าเงินจริง โทเคนนี้เป็นโทเคนทดสอบ ไม่ใช่ USDT และไม่ใช่ Escrow
                </div>

                <dl className="space-y-2 rounded-xl border border-zinc-200 p-3 text-xs">
                    <div className="flex justify-between gap-3"><dt className="text-zinc-500">เครือข่าย</dt><dd className="font-semibold">BSC Testnet · Chain ID 97</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-zinc-500">ผู้รับเหรียญทั้งหมด</dt><dd className="font-semibold">กระเป๋าที่ deploy</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-zinc-500">สิทธิพิเศษ</dt><dd className="text-right font-semibold">ไม่มี mint เพิ่ม / ภาษีโอน / blacklist</dd></div>
                </dl>

                {estimate && <p className="flex items-center gap-2 rounded-lg bg-zinc-50 p-3 text-sm"><Fuel className="h-4 w-4 shrink-0" />ค่า Gas โดยประมาณ: <strong>{estimate}</strong></p>}
                {error && <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800"><AlertCircle className="h-4 w-4 shrink-0" />{error}</p>}

                {transactionHash && <div className="space-y-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
                    <p className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-4 w-4" />Transaction ส่งแล้ว</p>
                    <a className="block break-all underline" href={`${TESTNET_EXPLORER}/tx/${transactionHash}`} target="_blank" rel="noreferrer">ตรวจ Transaction บน BscScan</a>
                    {contractAddress && <>
                        <p className="break-all font-mono text-xs">Contract: {contractAddress}</p>
                        <a className="inline-flex items-center gap-1 underline" href={`${TESTNET_EXPLORER}/address/${contractAddress}`} target="_blank" rel="noreferrer">ดู Token Address <ExternalLink className="h-3 w-3" /></a>
                        <a className="block underline" href={`${TESTNET_EXPLORER}/balancecheck-tool`} target="_blank" rel="noreferrer">เปิด Balance Checker แล้วกรอก Address นี้</a>
                    </>}
                    {!contractAddress && <p className="text-xs">รอเครือข่ายยืนยันเพื่อแสดง Contract Address</p>}
                </div>}

                <p className="text-[11px] leading-relaxed text-zinc-500">ตรวจสอบชื่อเครือข่าย, จำนวน tBNB และค่า Gas ในหน้าต่าง MetaMask ทุกครั้งก่อนยืนยัน การกดยกเลิกใน MetaMask จะไม่ deploy</p>

                <div className="flex flex-wrap justify-end gap-2">
                    <button type="button" onClick={onClose} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm">ปิด</button>
                    <button type="button" onClick={handleEstimate} disabled={isBusy} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm disabled:opacity-50">ประเมิน Gas</button>
                    <button type="button" onClick={handleDeploy} disabled={isBusy || Boolean(contractAddress)} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                        {isBusy ? 'รอเครือข่ายยืนยัน...' : contractAddress ? 'Deploy สำเร็จ' : 'Deploy ผ่าน MetaMask'}
                    </button>
                </div>
            </div>
        </div>
    );
};