import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, RefreshCw, Wallet, X } from 'lucide-react';
import { useContracts } from '../../context/ContractContext';
import { getWalletErrorMessage } from '../../lib/metamask';

interface PaymentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  clientName: string;
  contractorName: string;
  contractorAddress: string;
  amountUSDT: number;
  balanceUSDT: number;
  autoApproveDays: number;
  milestoneCount: number;
}

export const PaymentReviewModal: React.FC<PaymentReviewModalProps> = ({
  isOpen, onClose, onConfirm, clientName, contractorName, contractorAddress,
  amountUSDT, balanceUSDT, autoApproveDays, milestoneCount,
}) => {
  const { isWalletConnected, isWalletConnecting, isMetaMaskModalOpen, connectMetaMask } = useContracts();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const attempt = useRef(0);
  const inFlight = useRef(false);
  const money = (amount: number) => amount.toLocaleString('th-TH', { maximumFractionDigits: 6 });
  const canProceed = amountUSDT > 0 && Number.isFinite(amountUSDT) && balanceUSDT >= amountUSDT;
  const busy = isProcessing || isWalletConnecting;

  useEffect(() => {
    attempt.current += 1;
    setError(null);
    if (!isOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    return () => {
      attempt.current += 1;
      previousFocus?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && busy && !isMetaMaskModalOpen) dialogRef.current?.focus();
  }, [isOpen, busy, isMetaMaskModalOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (inFlight.current || busy || !canProceed) return;
    const request = ++attempt.current;
    inFlight.current = true;
    setIsProcessing(true);
    setError(null);
    try {
      if (!isWalletConnected) {
        const result = await connectMetaMask();
        if (!result.success && request === attempt.current) {
          setError(result.error === 'LOGIN_REQUIRED'
            ? 'กรุณาเข้าสู่ระบบก่อนเชื่อมกระเป๋า'
            : getWalletErrorMessage(result.error || 'REQUEST_FAILED'));
        }
        // After connecting, let the user confirm the unchanged amount themselves.
        return;
      }
      await onConfirm();
    } catch {
      if (request === attempt.current) setError('ยังทำรายการไม่สำเร็จ ข้อมูลสัญญายังอยู่ กรุณาลองอีกครั้ง');
    } finally {
      inFlight.current = false;
      if (request === attempt.current) setIsProcessing(false);
    }
  };

  const handleKeys = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && !busy) onClose();
    if (event.key !== 'Tab') return;
    const controls = dialogRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
    if (!controls?.length) {
      event.preventDefault();
      dialogRef.current?.focus();
      return;
    }
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => { if (!busy) onClose(); }}>
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal={!isMetaMaskModalOpen} aria-labelledby="payment-review-title"
        aria-describedby="payment-review-description" onKeyDown={handleKeys} onClick={event => event.stopPropagation()}
        className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-white border border-zinc-200 p-5 sm:p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 id="payment-review-title" className="text-base font-bold text-zinc-900">ตรวจยอดก่อนดำเนินการ</h2>
            <p id="payment-review-description" className="text-xs text-zinc-500 mt-1">ทบทวนเงินค้ำประกันและผู้รับเงิน ก่อนเชื่อม MetaMask หรือยืนยันสัญญา</p>
          </div>
          <button type="button" aria-label="ปิดหน้าต่างตรวจยอด" onClick={onClose} disabled={busy}
            className="shrink-0 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 disabled:opacity-40"><X className="w-5 h-5" /></button>
        </div>

        <div className="rounded-2xl bg-zinc-900 text-white p-4">
          <p className="text-xs text-zinc-300">ยอดค้ำประกันทั้งหมด · {milestoneCount} งวด</p>
          <p className="text-2xl font-bold mt-1">{money(amountUSDT)} <span className="text-sm font-normal">USDT จำลอง</span></p>
          <p className="text-[11px] text-zinc-300 mt-2">หักจากยอด Sandbox ของ {clientName} เมื่อกดยืนยันรายการ</p>
        </div>

        <dl className="text-xs space-y-3">
          <div className="flex justify-between gap-3"><dt className="text-zinc-500">ผู้รับเงินเมื่อตรวจรับผ่าน</dt><dd className="font-semibold text-right">{contractorName}</dd></div>
          <div><dt className="text-zinc-500 mb-1">กระเป๋ารับเงินตามสัญญา</dt><dd className="font-mono text-[11px] break-all text-zinc-700">{contractorAddress || 'ยังไม่ได้ระบุกระเป๋า'}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-zinc-500">ที่พักเงินค้ำประกัน</dt><dd className="font-semibold text-right">Escrow จำลองในแอป</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-zinc-500">เครือข่ายกระเป๋า</dt><dd className="font-semibold text-right">BNB Chain Testnet</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-zinc-500">ค่า Gas ของรายการนี้</dt><dd className="font-semibold text-right">ไม่มี · เดโมไม่ส่งธุรกรรม</dd></div>
          <div className="flex justify-between gap-3 border-t border-zinc-100 pt-3"><dt className="text-zinc-500">ยอด USDT จำลองหลังยืนยัน</dt><dd className="font-mono font-semibold">{money(Math.max(0, balanceUSDT - amountUSDT))} USDT</dd></div>
        </dl>

        <p className="rounded-xl bg-zinc-50 border border-zinc-200 p-3 text-xs text-zinc-600 leading-relaxed">
          เงินจำลองถูกพักไว้และจ่ายตามงวดเมื่อตรวจรับผ่าน หากไม่ตรวจรับภายใน {autoApproveDays} วันหลังส่งงาน สามารถทดสอบสิทธิปล่อยเงินตามเงื่อนไขได้ในเดโม
        </p>
        <p className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-900 leading-relaxed">
          โปรเจกต์รายวิชา: MetaMask ใช้เชื่อมบัญชีและเครือข่ายจริง ขั้นตอนนี้ไม่ขอลายเซ็น ไม่อนุมัติโทเคน และไม่โอน USDT หรือ tBNB
        </p>

        <div role="status" aria-live="polite" className="flex items-center gap-2 text-xs text-zinc-600">
          {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : isWalletConnected ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Wallet className="w-4 h-4" />}
          <span>{busy ? (isWalletConnected ? 'กำลังตรวจสถานะกระเป๋า...' : 'รอคุณอนุญาตบัญชีและเครือข่ายใน MetaMask...')
            : isWalletConnected ? 'กระเป๋าพร้อมแล้ว ตรวจยอดและกดยืนยันรายการจำลอง' : 'ตรวจยอดแล้ว กดเชื่อมกระเป๋าเพื่อดำเนินการต่อ'}</span>
        </div>
        {!canProceed && <p role="alert" className="text-xs text-red-600">ยอดค้ำประกันต้องมากกว่า 0 และไม่เกินยอด USDT จำลองของคุณ</p>}
        {error && <p role="alert" className="flex items-start gap-2 text-xs text-red-600"><AlertCircle className="w-4 h-4 shrink-0" />{error}</p>}
        <div className="flex items-center gap-2 pt-1">
          <button type="button" onClick={onClose} disabled={busy} className="rounded-xl border border-zinc-200 px-3 py-2.5 text-xs text-zinc-600 disabled:opacity-40">กลับไปตรวจสัญญา</button>
          <button type="button" onClick={handleConfirm} disabled={busy || !canProceed}
            className="flex-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 px-3 py-2.5 text-xs font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2">
            <span>{busy ? 'กำลังดำเนินการ...' : isWalletConnected ? 'ยืนยันสัญญาและ Escrow จำลอง' : 'เชื่อม MetaMask เพื่อดำเนินการต่อ'}</span>
            {!busy && <ArrowRight className="w-3.5 h-3.5 shrink-0" />}
          </button>
        </div>
      </div>
    </div>
  );
};
