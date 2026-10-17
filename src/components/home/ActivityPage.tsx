import React from 'react';
import { Activity, ArrowUpRight, FileText, Plus, Wallet } from 'lucide-react';
import { useContracts } from '../../context/ContractContext';

const TESTNET_BALANCE_TOOL = 'https://testnet.bscscan.com/balancecheck-tool';
const TESTNET_ADDRESS_URL = 'https://testnet.bscscan.com/address/';

function formatDate(value: string): string {
    return new Intl.DateTimeFormat('th-TH', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(new Date(value));
}

export const ActivityPage: React.FC<{ onStartCreate: () => void }> = ({ onStartCreate }) => {
    const { agreements, activePersona, isWalletConnected, walletAddress } = useContracts();
    const myAgreements = agreements.filter(agreement =>
        agreement.clientId === activePersona.id ||
        agreement.contractorId === activePersona.id ||
        agreement.arbitratorId === activePersona.id
    );
    const hasWallet = isWalletConnected && Boolean(walletAddress);

    return (
        <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-5">
                <div>
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase text-zinc-500"><Activity className="h-4 w-4" />Activity</p>
                    <h1 className="mt-2 text-2xl font-bold text-zinc-900">กิจกรรมของ {activePersona.name}</h1>
                    <p className="mt-1 text-sm text-zinc-500">ร่างสัญญาและสถานะที่บันทึกไว้ในเบราว์เซอร์นี้</p>
                </div>
                <button type="button" onClick={onStartCreate} className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700">
                    <Plus className="h-4 w-4" /> ร่างสัญญาใหม่
                </button>
            </div>

            <section className="mt-6 border-b border-zinc-200 pb-5" aria-label="ตรวจสอบยอดกระเป๋า">
                <h2 className="text-sm font-semibold text-zinc-900">ตรวจสอบยอดบน BscScan Testnet</h2>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">เครื่องมือนี้ตรวจยอดของ address เท่านั้น ไม่ได้ยืนยันว่าเงินถูกฝากเข้า Escrow หรือว่าสัญญาถูก deploy แล้ว</p>
                {hasWallet && <a href={`${TESTNET_ADDRESS_URL}${walletAddress}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex max-w-full items-center gap-2 break-all font-mono text-xs text-zinc-700 underline">
                    <Wallet className="h-3.5 w-3.5 shrink-0" />{walletAddress}<ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                </a>}
                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                    <a href={TESTNET_BALANCE_TOOL} target="_blank" rel="noreferrer" className="font-semibold text-zinc-900 underline">เปิด Balance Checker</a>
                    {!hasWallet && <span className="text-zinc-500">เชื่อม MetaMask เพื่อดู address ของคุณ</span>}
                </div>
            </section>

            <section className="mt-5" aria-label="รายการกิจกรรม">
                {myAgreements.length === 0 ? (
                    <div className="flex min-h-56 flex-col items-center justify-center text-center">
                        <FileText className="h-8 w-8 text-zinc-300" />
                        <p className="mt-3 text-sm font-semibold text-zinc-700">ยังไม่มีกิจกรรมสัญญา</p>
                        <p className="mt-1 text-xs text-zinc-500">ร่างแรกของคุณจะแสดงที่นี่</p>
                        <button type="button" onClick={onStartCreate} className="mt-4 rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50">เริ่มร่างสัญญา</button>
                    </div>
                ) : (
                    <ol className="divide-y divide-zinc-200">
                        {myAgreements.map(agreement => {
                            const isDraft = agreement.status === 'DRAFT';
                            return <li key={agreement.id} className="py-4 first:pt-2">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isDraft ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-600'}`}><FileText className="h-4 w-4" /></span>
                                        <div className="min-w-0">
                                            <h3 className="break-words text-sm font-semibold text-zinc-900">{agreement.title}</h3>
                                            <p className="mt-1 text-xs text-zinc-500">{formatDate(agreement.createdAt)} · {agreement.id}</p>
                                            <p className="mt-2 text-xs text-zinc-600">คู่สัญญา: {activePersona.id === agreement.clientId ? agreement.contractorName : activePersona.name}</p>
                                        </div>
                                    </div>
                                    <span className={`rounded-md px-2 py-1 text-[11px] font-semibold ${isDraft ? 'bg-amber-100 text-amber-900' : 'bg-zinc-100 text-zinc-700'}`}>
                                        {isDraft ? 'ร่างในเครื่อง · ยังไม่ขึ้นเชน' : 'ข้อมูล Sandbox · ไม่ใช่สถานะบนเชน'}
                                    </span>
                                </div>
                                <p className="ml-11 mt-2 text-xs text-zinc-600">วงเงินที่ระบุในร่าง: {agreement.totalEscrow.toLocaleString('th-TH')} USDT · {agreement.milestones.length} งวด</p>
                                {isDraft && <p className="ml-11 mt-1 text-[11px] text-zinc-500">ยังไม่มี Contract Address หรือ Transaction Hash สำหรับตรวจใน BscScan</p>}
                            </li>;
                        })}
                    </ol>
                )}
            </section>

            <p className="mt-5 border-t border-zinc-200 pt-4 text-[11px] leading-relaxed text-zinc-500">ร่างถูกเก็บใน localStorage ของเบราว์เซอร์นี้ ยังไม่ได้ sync กับคู่สัญญา อย่าใส่ seed phrase, private key หรือข้อมูลลับในร่าง</p>
        </div>
    );
};