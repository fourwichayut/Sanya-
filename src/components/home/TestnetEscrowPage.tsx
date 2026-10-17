import React, { useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw, Wallet, Coins, ShieldCheck, Send, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { formatUnits, parseUnits } from 'ethers';
import {
    approveSyaBuffer,
    approveTestUsd,
    feeDisplay,
    getEscrowAddresses,
    getTestnetSigner,
    hashProof,
    isValidWalletAddress,
    mintTestUsd,
    readAgreements,
    readTestnetBalances,
    sendRelayedAction,
    TESTNET_ESCROW_CONFIG,
    TOKEN_APPROVAL_BUFFER,
    toTestUsd
} from '../../lib/testnetEscrow';

interface ChainMilestone {
    title: string;
    criteria: string;
    proofUri: string;
    revisionNote: string;
    feasibilityExplanation: string;
    proofHash: string;
    amount: bigint;
    dueAt: bigint;
    submittedAt: bigint;
    reviewDeadline: bigint;
    revisionQuota: bigint;
    revisionsUsed: bigint;
    state: bigint;
}

interface ChainAgreement {
    id: string;
    summary: readonly [string, string, string, string, string, bigint, bigint, bigint, boolean, bigint];
    milestones: ChainMilestone[];
}

interface DraftMilestone {
    title: string;
    criteria: string;
    amount: string;
    dueDate: string;
    revisionQuota: string;
}

const emptyMilestone = (): DraftMilestone => ({ title: '', criteria: '', amount: '100', dueDate: '', revisionQuota: '2' });
const STATE_LABELS = ['รอส่งงาน', 'ส่งงานแล้ว', 'ขอแก้ไข', 'จ่ายแล้ว', 'มีข้อพิพาท', 'คืนเงินแล้ว'];
const STATE_STYLES = ['bg-zinc-100 text-zinc-700', 'bg-sky-100 text-sky-800', 'bg-amber-100 text-amber-800', 'bg-emerald-100 text-emerald-800', 'bg-red-100 text-red-800', 'bg-zinc-200 text-zinc-800'];
const explorerAddress = (address: string) => `https://testnet.bscscan.com/address/${address}`;
const explorerTx = (hash: string) => `https://testnet.bscscan.com/tx/${hash}`;

export const TestnetEscrowPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [account, setAccount] = useState('');
    const [balances, setBalances] = useState({ sya: '0', syaAllowance: '0', testUsd: '0', testUsdAllowance: '0' });
    const [agreements, setAgreements] = useState<ChainAgreement[]>([]);
    const [selectedId, setSelectedId] = useState('');
    const [milestoneIndex, setMilestoneIndex] = useState(0);
    const [title, setTitle] = useState('');
    const [scope, setScope] = useState('');
    const [contractor, setContractor] = useState('');
    const [reviewDays, setReviewDays] = useState('5');
    const [draftMilestones, setDraftMilestones] = useState<DraftMilestone[]>([emptyMilestone()]);
    const [actionNote, setActionNote] = useState('');
    const [proofUri, setProofUri] = useState('');
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [lastTransaction, setLastTransaction] = useState('');
    const [setupError, setSetupError] = useState('');
    const [relayReady, setRelayReady] = useState(false);
    const [checkingRelay, setCheckingRelay] = useState(false);

    const selected = agreements.find(agreement => agreement.id === selectedId) || agreements[0];
    const milestone = selected?.milestones[milestoneIndex];
    const addressesReady = [
        TESTNET_ESCROW_CONFIG.sya,
        TESTNET_ESCROW_CONFIG.testUsd,
        TESTNET_ESCROW_CONFIG.forwarder,
        TESTNET_ESCROW_CONFIG.escrow,
        TESTNET_ESCROW_CONFIG.arbitrator
    ].every(isValidWalletAddress);

    const refresh = async (wallet = account) => {
        if (!wallet || !addressesReady) return;
        const [nextBalances, nextAgreements] = await Promise.all([
            readTestnetBalances(wallet),
            readAgreements(wallet) as Promise<ChainAgreement[]>
        ]);
        setBalances(nextBalances);
        setAgreements(nextAgreements);
        setSelectedId(current => nextAgreements.some(item => item.id === current) ? current : nextAgreements[0]?.id || '');
    };

    const checkRelayer = async () => {
        if (!addressesReady) return;
        setCheckingRelay(true);
        try {
            const response = await fetch('/api/health');
            if (!response.ok) throw new Error('Relayer unavailable');
            const health = await response.json() as { chainId?: number; fee?: string; escrowAddress?: string; ready?: boolean };
            const expectedEscrow = TESTNET_ESCROW_CONFIG.escrow.toLowerCase();
            setRelayReady(health.ready === true && health.chainId === 97 && health.fee === parseUnits('1', 18).toString() && health.escrowAddress?.toLowerCase() === expectedEscrow);
        } catch {
            setRelayReady(false);
        } finally {
            setCheckingRelay(false);
        }
    };

    useEffect(() => {
        try {
            getEscrowAddresses();
            setSetupError('');
        } catch (caught) {
            setSetupError(caught instanceof Error ? caught.message : 'ตั้งค่า contract address ไม่ครบ');
        }
    }, []);

    useEffect(() => {
        void checkRelayer();
    }, [addressesReady]);

    const connect = async () => {
        setError('');
        setMessage('');
        setBusy(true);
        try {
            const session = await getTestnetSigner();
            setAccount(session.address);
            if (addressesReady) await refresh(session.address);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'เชื่อม MetaMask ไม่สำเร็จ');
        } finally {
            setBusy(false);
        }
    };

    const runWalletAction = async (action: () => Promise<unknown>, successMessage: string) => {
        setError('');
        setMessage('');
        setLastTransaction('');
        setBusy(true);
        try {
            const receipt = await action() as { hash?: string } | null;
            if (receipt?.hash) setLastTransaction(receipt.hash);
            setMessage(successMessage);
            if (account && addressesReady) await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'ธุรกรรมไม่สำเร็จ');
        } finally {
            setBusy(false);
        }
    };

    const runRelayed = async (method: string, args: readonly unknown[], successMessage: string) => {
        setError('');
        setMessage('');
        setLastTransaction('');
        setBusy(true);
        try {
            if (!relayReady) throw new Error('Relayer ยังไม่พร้อม กรุณารัน npm.cmd run relay และตรวจ address ใน .env');
            if (parseUnits(balances.sya, 18) < parseUnits('1', 18)) throw new Error('ยอด SYA ไม่พอสำหรับค่าธรรมเนียม 1 SYA');
            if (parseUnits(balances.syaAllowance, 18) < parseUnits('1', 18)) throw new Error('กรุณาอนุมัติ SYA ให้สัญญา Escrow ก่อน');
            const result = await sendRelayedAction(method, args);
            setLastTransaction(result.transactionHash);
            setMessage(`${successMessage} หักค่าบริการ ${result.feeSya} SYA แล้ว`);
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'ส่งธุรกรรมผ่าน relayer ไม่สำเร็จ');
        } finally {
            setBusy(false);
        }
    };

    const createOnChain = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setMessage('');
        try {
            if (!account) throw new Error('เชื่อม MetaMask ก่อน');
            if (!isValidWalletAddress(contractor) || !isValidWalletAddress(TESTNET_ESCROW_CONFIG.arbitrator)) throw new Error('กรอก address ผู้รับจ้างและคนกลางให้ถูกต้อง');
            const reviewSeconds = Math.floor(Number(reviewDays) * 24 * 60 * 60);
            if (!Number.isInteger(reviewSeconds) || reviewSeconds < 86400 || reviewSeconds > 30 * 86400) throw new Error('ช่วงตรวจรับต้องอยู่ระหว่าง 1 ถึง 30 วัน');
            const inputs = draftMilestones.map(item => {
                const amount = toTestUsd(item.amount);
                if (amount <= 0n) throw new Error('จำนวนเงินแต่ละงวดต้องมากกว่า 0');
                return {
                    title: item.title.trim(),
                    criteria: item.criteria.trim(),
                    amount: amount.toString(),
                    dueAt: item.dueDate ? Math.floor(new Date(`${item.dueDate}T23:59:59`).getTime() / 1000) : 0,
                    revisionQuota: Number(item.revisionQuota)
                };
            });
            if (inputs.some(item => !item.title || !item.criteria || !Number.isInteger(item.revisionQuota) || item.revisionQuota < 0 || item.revisionQuota > 10)) {
                throw new Error('กรอกชื่องวด เกณฑ์ส่งมอบ และโควตาแก้งาน 0-10 ครั้งให้ครบ');
            }
            const total = inputs.reduce((sum, item) => sum + BigInt(item.amount), 0n);
            const currentAllowance = toTestUsd(balances.testUsdAllowance);
            if (currentAllowance < total) throw new Error(`กรุณาอนุมัติ tUSD อย่างน้อย ${formatUnits(total, 6)} ก่อนสร้าง Escrow`);
            if (parseUnits(balances.syaAllowance, 18) < parseUnits('1', 18)) throw new Error('กรุณาอนุมัติ SYA ให้สัญญา Escrow ก่อน');
            if (!title.trim() || !scope.trim()) throw new Error('กรอกชื่อสัญญาและขอบเขตงานให้ครบ');
            await runRelayed('createAgreement', [title.trim(), scope.trim(), contractor, TESTNET_ESCROW_CONFIG.arbitrator, reviewSeconds, inputs], 'สร้างสัญญา Escrow บน Testnet สำเร็จ');
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'ข้อมูลสัญญาไม่ถูกต้อง');
        }
    };

    const updateDraftMilestone = (index: number, field: keyof DraftMilestone, value: string) => {
        setDraftMilestones(items => items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
    };

    const addDraftMilestone = () => {
        if (draftMilestones.length < 20) setDraftMilestones(items => [...items, emptyMilestone()]);
    };

    const milestoneId = milestoneIndex;
    const isClient = Boolean(selected && selected.summary[0].toLowerCase() === account.toLowerCase());
    const isContractor = Boolean(selected && selected.summary[1].toLowerCase() === account.toLowerCase());
    const isArbitrator = Boolean(selected && selected.summary[2].toLowerCase() === account.toLowerCase());

    return (
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between gap-4 border-b border-zinc-200 pb-4">
                <div>
                    <button onClick={onBack} className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-900"><ArrowLeft className="h-3.5 w-3.5" />กลับสู่แอป</button>
                    <h1 className="text-xl font-bold">SANYA Escrow · BNB Testnet</h1>
                    <p className="mt-1 text-xs text-zinc-500">Escrow ใช้ tUSD ทดสอบ · Relayer จ่าย tBNB · ค่าบริการคงที่ {feeDisplay()} SYA ต่อธุรกรรม</p>
                </div>
                <button onClick={connect} disabled={busy} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"><Wallet className="h-4 w-4" />{account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'เชื่อม MetaMask'}</button>
            </div>

            <div className="mb-5 grid gap-3 sm:grid-cols-3">
                <div className="border-l-2 border-amber-500 bg-white px-4 py-3"><p className="text-[11px] font-semibold text-zinc-500">SYA ที่ใช้จ่าย</p><p className="mt-1 text-lg font-bold">{balances.sya} SYA</p><p className="text-[11px] text-zinc-500">Allowance: {balances.syaAllowance} SYA</p></div>
                <div className="border-l-2 border-sky-600 bg-white px-4 py-3"><p className="text-[11px] font-semibold text-zinc-500">ยอด tUSD สำหรับ Escrow</p><p className="mt-1 text-lg font-bold">{balances.testUsd} tUSD</p><p className="text-[11px] text-zinc-500">Allowance: {balances.testUsdAllowance} tUSD</p></div>
                <div className="border-l-2 border-emerald-600 bg-white px-4 py-3"><p className="text-[11px] font-semibold text-zinc-500">ค่าบริการต่อรายการ</p><p className="mt-1 text-lg font-bold">{feeDisplay()} SYA</p><p className="text-[11px] text-zinc-500">คิดเมื่อ relayer ส่งธุรกรรมสำเร็จ</p></div>
            </div>

            {setupError && <div role="alert" className="mb-4 flex gap-2 border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950"><AlertTriangle className="h-4 w-4 shrink-0" /><span>{setupError}. คัดลอก .env.example เป็น .env และตั้ง address หลัง deploy contracts</span></div>}
            <div className="mb-5 border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950"><strong>Testnet เท่านั้น:</strong> tUSD ไม่มีมูลค่าเงินจริง แต่ธุรกรรมอนุมัติ SYA/tUSD จาก MetaMask ยังใช้ tBNB จริงบน Testnet ส่วนธุรกรรม Escrow หลังอนุมัติส่งผ่าน relayer และคิด 1 SYA ต่อรายการ ห้ามใส่ seed phrase หรือ private key ในเว็บ</div>
            {addressesReady && <div role="status" className={`mb-4 flex items-center justify-between gap-3 border px-3 py-2 text-xs ${relayReady ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-zinc-200 bg-white text-zinc-600'}`}><span>{relayReady ? 'Relayer พร้อม · BNB Testnet · 1 SYA ต่อรายการ' : 'Relayer ยังไม่พร้อม · ตรวจ .env และเปิด npm.cmd run relay'}</span><button onClick={() => void checkRelayer()} disabled={checkingRelay} className="shrink-0 font-semibold underline disabled:opacity-50">{checkingRelay ? 'กำลังตรวจ…' : 'ตรวจอีกครั้ง'}</button></div>}
            {(error || message) && <div role={error ? 'alert' : 'status'} className={`mb-4 flex items-start gap-2 border p-3 text-xs ${error ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`}>{error ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}{error || message}</div>}
            {lastTransaction && <a className="mb-4 inline-flex items-center gap-1 break-all text-xs font-semibold text-sky-800 underline" href={explorerTx(lastTransaction)} target="_blank" rel="noreferrer">ดูธุรกรรมบน BscScan <ExternalLink className="h-3 w-3 shrink-0" /></a>}

            <section className="mb-6 border-y border-zinc-200 py-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="text-sm font-bold">เตรียมกระเป๋า</h2>
                    <button onClick={() => void refresh()} disabled={busy || !account} className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600 disabled:opacity-40"><RefreshCw className="h-3.5 w-3.5" />รีเฟรชยอด</button>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => void runWalletAction(() => mintTestUsd(parseUnits('1000', 6)), 'เติม 1,000 tUSD สำหรับทดสอบแล้ว')} disabled={!account || busy} className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-2 text-xs font-semibold disabled:opacity-40"><Coins className="h-3.5 w-3.5" />รับ 1,000 tUSD</button>
                    <button onClick={() => void runWalletAction(() => approveSyaBuffer(), 'อนุมัติ 10 SYA สำหรับค่าบริการ relay แล้ว')} disabled={!account || busy} className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-2 text-xs font-semibold disabled:opacity-40"><ShieldCheck className="h-3.5 w-3.5" />อนุมัติ 10 SYA</button>
                    <button onClick={() => void runWalletAction(() => approveTestUsd(parseUnits('1000000', 6)), 'อนุมัติ tUSD สำหรับ Escrow แล้ว')} disabled={!account || busy} className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-2 text-xs font-semibold disabled:opacity-40"><ShieldCheck className="h-3.5 w-3.5" />อนุมัติสูงสุด 1,000,000 tUSD</button>
                </div>
                <p className="mt-2 text-[11px] text-zinc-500">การอนุมัติเป็นธุรกรรมจากกระเป๋าคุณและใช้ tBNB; 10 SYA เป็นวงเงิน allowance สูงสุด ไม่ได้ถูกหักทันที</p>
            </section>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
                <section>
                    <h2 className="mb-3 text-sm font-bold">สร้างสัญญา Escrow ใหม่</h2>
                    <form onSubmit={event => void createOnChain(event)} className="space-y-3 border-y border-zinc-200 py-4">
                        <label className="block text-xs font-semibold">ชื่อสัญญา<input required maxLength={120} value={title} onChange={event => setTitle(event.target.value)} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-normal" /></label>
                        <label className="block text-xs font-semibold">ขอบเขตงาน<textarea required maxLength={2000} value={scope} onChange={event => setScope(event.target.value)} rows={3} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-normal" /></label>
                        <label className="block text-xs font-semibold">Address ผู้รับจ้าง<input required value={contractor} onChange={event => setContractor(event.target.value.trim())} placeholder="0x..." className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono font-normal" /></label>
                        <label className="block text-xs font-semibold">ช่วงตรวจรับ (วัน)<input required type="number" min="1" max="30" value={reviewDays} onChange={event => setReviewDays(event.target.value)} className="mt-1 w-28 rounded-md border border-zinc-300 px-3 py-2 font-normal" /></label>
                        {draftMilestones.map((item, index) => <div key={index} className="space-y-2 border-l-2 border-zinc-300 pl-3">
                            <h3 className="text-xs font-bold">งวดที่ {index + 1}</h3>
                            <input required maxLength={100} placeholder="ชื่องวดงาน" value={item.title} onChange={event => updateDraftMilestone(index, 'title', event.target.value)} className="w-full rounded-md border border-zinc-300 px-3 py-2 text-xs" />
                            <textarea required maxLength={1000} placeholder="เกณฑ์ส่งมอบ" value={item.criteria} onChange={event => updateDraftMilestone(index, 'criteria', event.target.value)} rows={2} className="w-full rounded-md border border-zinc-300 px-3 py-2 text-xs" />
                            <div className="grid grid-cols-3 gap-2"><label className="text-[11px] font-semibold">tUSD<input required type="number" min="0.01" step="0.01" value={item.amount} onChange={event => updateDraftMilestone(index, 'amount', event.target.value)} className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-2 text-xs font-normal" /></label><label className="text-[11px] font-semibold">วันส่ง<input type="date" value={item.dueDate} onChange={event => updateDraftMilestone(index, 'dueDate', event.target.value)} className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-2 text-xs font-normal" /></label><label className="text-[11px] font-semibold">แก้ได้<input type="number" min="0" max="10" value={item.revisionQuota} onChange={event => updateDraftMilestone(index, 'revisionQuota', event.target.value)} className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-2 text-xs font-normal" /></label></div>
                        </div>)}
                        <div className="flex flex-wrap gap-2"><button type="button" onClick={addDraftMilestone} disabled={draftMilestones.length >= 20} className="rounded-md border border-zinc-300 px-3 py-2 text-xs font-semibold disabled:opacity-40">เพิ่มงวดงาน</button><button type="submit" disabled={!account || busy || !addressesReady || !relayReady} className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"><Send className="h-3.5 w-3.5" />สร้าง Escrow · 1 SYA</button></div>
                        <p className="text-[11px] text-zinc-500">ยอด tUSD รวมจะถูกโอนเข้า escrow เมื่อสร้างสำเร็จ โปรดตรวจสอบผู้รับจ้าง จำนวนเงิน และค่าธรรมเนียมก่อนเซ็นใน MetaMask</p>
                    </form>
                </section>

                <section>
                    <div className="mb-3 flex items-center justify-between gap-2"><h2 className="text-sm font-bold">สัญญาบน BNB Testnet</h2><button onClick={() => void refresh()} disabled={!account || busy} aria-label="โหลดสัญญาใหม่" className="p-1 text-zinc-600 disabled:opacity-40"><RefreshCw className="h-4 w-4" /></button></div>
                    {agreements.length === 0 ? <p className="border-y border-zinc-200 py-6 text-xs text-zinc-500">ยังไม่พบสัญญาของกระเป๋านี้</p> : <>
                        <label className="block text-xs font-semibold">เลือกสัญญา<select value={selected?.id || ''} onChange={event => { setSelectedId(event.target.value); setMilestoneIndex(0); }} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono font-normal">{agreements.map(item => <option key={item.id} value={item.id}>#{item.id} · {item.summary[3]}</option>)}</select></label>
                        {selected && <div className="mt-4 space-y-3 border-y border-zinc-200 py-4">
                            <p className="text-sm font-bold">{selected.summary[3]}</p><p className="text-xs leading-relaxed text-zinc-600">{selected.summary[4]}</p>
                            <dl className="grid grid-cols-2 gap-2 text-[11px]"><div><dt className="text-zinc-500">ผู้ว่าจ้าง</dt><dd className="break-all font-mono">{selected.summary[0]}</dd></div><div><dt className="text-zinc-500">ผู้รับจ้าง</dt><dd className="break-all font-mono">{selected.summary[1]}</dd></div><div><dt className="text-zinc-500">ยอด Escrow</dt><dd className="font-semibold">{formatUnits(selected.summary[6], 6)} tUSD</dd></div><div><dt className="text-zinc-500">ปล่อยแล้ว</dt><dd className="font-semibold">{formatUnits(selected.summary[7], 6)} tUSD</dd></div></dl>
                            <label className="block text-xs font-semibold">งวดงาน<select value={milestoneIndex} onChange={event => setMilestoneIndex(Number(event.target.value))} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-normal">{selected.milestones.map((item, index) => <option key={index} value={index}>งวด {index + 1}: {item.title} · {STATE_LABELS[Number(item.state)]}</option>)}</select></label>
                            {milestone && <>
                                <div className="flex items-center justify-between gap-2"><span className={`rounded-sm px-2 py-1 text-[10px] font-bold ${STATE_STYLES[Number(milestone.state)]}`}>{STATE_LABELS[Number(milestone.state)]}</span><strong className="text-xs">{formatUnits(milestone.amount, 6)} tUSD</strong></div>
                                <p className="text-xs text-zinc-600">เกณฑ์ส่งมอบ: {milestone.criteria}</p>
                                {milestone.proofUri && <a href={milestone.proofUri.startsWith('http') ? milestone.proofUri : undefined} target="_blank" rel="noreferrer" className="break-all text-xs text-sky-800 underline">หลักฐานส่งงาน: {milestone.proofUri}</a>}
                                {(isClient || isContractor) && <textarea value={actionNote} onChange={event => setActionNote(event.target.value)} rows={2} placeholder="หมายเหตุส่งงาน / ขอแก้ไข / ข้อพิพาท" className="w-full rounded-md border border-zinc-300 px-3 py-2 text-xs" />}
                                {isContractor && (Number(milestone.state) === 0 || Number(milestone.state) === 2) && <><input value={proofUri} onChange={event => setProofUri(event.target.value)} placeholder="ลิงก์หลักฐานส่งงาน" className="w-full rounded-md border border-zinc-300 px-3 py-2 text-xs" /><button onClick={() => void runRelayed('submitMilestone', [selected.id, milestoneId, hashProof(proofUri), proofUri], 'บันทึกหลักฐานส่งงานแล้ว')} disabled={busy || !proofUri.trim()} className="w-full rounded-md border border-zinc-300 px-3 py-2 text-xs font-semibold disabled:opacity-40">ส่งมอบงาน · 1 SYA</button></>}
                                {isClient && Number(milestone.state) === 1 && <div className="grid grid-cols-2 gap-2"><button onClick={() => void runRelayed('approveMilestone', [selected.id, milestoneId], 'ตรวจรับและปล่อย tUSD แล้ว')} disabled={busy} className="rounded-md bg-emerald-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">ตรวจรับ · 1 SYA</button><button onClick={() => void runRelayed('requestRevision', [selected.id, milestoneId, actionNote], 'ส่งคำขอแก้ไขแล้ว')} disabled={busy || !actionNote.trim()} className="rounded-md border border-zinc-300 px-3 py-2 text-xs font-semibold disabled:opacity-40">ขอแก้ไข · 1 SYA</button></div>}
                                {Number(milestone.state) === 2 && <div className="grid grid-cols-2 gap-2">{isContractor && <button onClick={() => void runRelayed('explainFeasibility', [selected.id, milestoneId, actionNote], 'บันทึกคำชี้แจงแล้ว')} disabled={busy || !actionNote.trim()} className="rounded-md border border-zinc-300 px-3 py-2 text-xs font-semibold disabled:opacity-40">ชี้แจง · 1 SYA</button>}{isContractor && <button onClick={() => void runRelayed('acceptRevision', [selected.id, milestoneId], 'ยอมรับคำขอแก้ไขแล้ว')} disabled={busy} className="rounded-md border border-zinc-300 px-3 py-2 text-xs font-semibold disabled:opacity-40">รับคำขอ · 1 SYA</button>}{isClient && <button onClick={() => void runRelayed('adjustRevisionNote', [selected.id, milestoneId, actionNote], 'ปรับขอบเขตคำขอแก้ไขแล้ว')} disabled={busy || !actionNote.trim()} className="rounded-md border border-zinc-300 px-3 py-2 text-xs font-semibold disabled:opacity-40">ปรับคำขอ · 1 SYA</button>}</div>}
                                {(isClient || isContractor) && Number(milestone.state) < 3 && <button onClick={() => void runRelayed('raiseDispute', [selected.id, milestoneId, actionNote], 'เปิดข้อพิพาทและพักงวดแล้ว')} disabled={busy || !actionNote.trim()} className="w-full rounded-md border border-red-300 px-3 py-2 text-xs font-semibold text-red-800 disabled:opacity-40">เปิดข้อพิพาท · 1 SYA</button>}
                                {isArbitrator && Number(milestone.state) === 4 && <div className="grid grid-cols-2 gap-2"><button onClick={() => void runRelayed('resolveDispute', [selected.id, milestoneId, true], 'ตัดสินปล่อยเงินให้ผู้รับจ้างแล้ว')} disabled={busy} className="rounded-md border border-zinc-300 px-3 py-2 text-xs font-semibold disabled:opacity-40">ปล่อยให้ผู้รับจ้าง · 1 SYA</button><button onClick={() => void runRelayed('resolveDispute', [selected.id, milestoneId, false], 'ตัดสินคืนเงินให้ผู้ว่าจ้างแล้ว')} disabled={busy} className="rounded-md border border-zinc-300 px-3 py-2 text-xs font-semibold disabled:opacity-40">คืนผู้ว่าจ้าง · 1 SYA</button></div>}
                                {Number(milestone.state) === 1 && BigInt(Math.floor(Date.now() / 1000)) >= milestone.reviewDeadline && <button onClick={() => void runRelayed('triggerAntiGhosting', [selected.id, milestoneId], 'ปล่อยเงินตามเงื่อนไข Anti-Ghosting แล้ว')} disabled={busy} className="w-full rounded-md border border-zinc-300 px-3 py-2 text-xs font-semibold disabled:opacity-40">ใช้สิทธิ Anti-Ghosting · 1 SYA</button>}
                            </>}
                            <a href={explorerAddress(TESTNET_ESCROW_CONFIG.escrow)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-800 underline">สัญญาบน BscScan <ExternalLink className="h-3 w-3" /></a>
                        </div>}
                    </>}
                </section>
            </div>
        </div>
    );
};
