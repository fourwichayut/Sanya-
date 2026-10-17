import React, { useMemo, useState } from 'react';
import type { EthereumProvider, WalletWindow } from '../../types/wallet';

const TESTNET_CHAIN_ID = '0x61';
const EXPLORER = 'https://testnet.bscscan.com/tx/';
const ADDRESS_RE = /^0x[\da-fA-F]{40}$/;

function toWei(value: string): bigint {
  if (!/^\d+(\.\d{0,18})?$/.test(value) || !value || Number(value) <= 0) {
    throw new Error('กรอกจำนวน tBNB มากกว่า 0 และไม่เกิน 18 ตำแหน่งทศนิยม');
  }
  const [whole, fraction = ''] = value.split('.');
  return BigInt(whole) * 10n ** 18n + BigInt((fraction + '0'.repeat(18)).slice(0, 18));
}
function hex(value: bigint): string { return `0x${value.toString(16)}`; }
function fromWei(value: bigint): string {
  const whole = value / 10n ** 18n;
  const fraction = (value % 10n ** 18n).toString().padStart(18, '0').replace(/0+$/, '');
  return `${whole}${fraction ? `.${fraction}` : ''}`;
}

export const OnChainTransferModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('0.001');
  const [busy, setBusy] = useState(false);
  const [estimate, setEstimate] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const amountWei = useMemo(() => { try { return toWei(amount); } catch { return null; } }, [amount]);

  const estimateGas = async () => {
    setError(null); setEstimate(null);
    try {
      if (!ADDRESS_RE.test(recipient)) throw new Error('ที่อยู่ผู้รับไม่ถูกต้อง ต้องเป็น address 0x จำนวน 42 ตัวอักษร');
      if (amountWei === null) throw new Error('จำนวน tBNB ไม่ถูกต้อง');
      const provider = (window as WalletWindow).ethereum as EthereumProvider | undefined;
      if (!provider) throw new Error('ไม่พบ MetaMask กรุณาติดตั้งและปลดล็อกก่อน');
      const chainId = await provider.request({ method: 'eth_chainId' });
      if (String(chainId).toLowerCase() !== TESTNET_CHAIN_ID) throw new Error('กรุณาเปลี่ยน MetaMask เป็น BNB Smart Chain Testnet (Chain ID 97)');
      const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
      if (!accounts?.[0]) throw new Error('ไม่พบบัญชีที่อนุญาต');
      const tx = { from: accounts[0], to: recipient, value: hex(amountWei) };
      const [gasRaw, gasPriceRaw] = await Promise.all([
        provider.request({ method: 'eth_estimateGas', params: [tx] }),
        provider.request({ method: 'eth_gasPrice' })
      ]);
      const gas = BigInt(String(gasRaw));
      const gasPrice = BigInt(String(gasPriceRaw));
      setEstimate(`${fromWei(gas * gasPrice)} tBNB (ประมาณการ; กระเป๋าจะแสดงค่าจริงก่อนยืนยัน)`);
      return { provider, tx };
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'ไม่สามารถประเมิน Gas ได้');
      return null;
    }
  };

  const send = async () => {
    setBusy(true); setError(null); setTxHash(null);
    try {
      const prepared = await estimateGas();
      if (!prepared) return;
      const result = await prepared.provider.request({ method: 'eth_sendTransaction', params: [prepared.tx] });
      if (typeof result !== 'string' || !/^0x[\da-fA-F]{64}$/.test(result)) throw new Error('MetaMask ไม่ได้ส่ง Transaction Hash ที่ถูกต้อง');
      setTxHash(result);
    } catch (caught) {
      const code = (caught as { code?: number })?.code;
      setError(code === 4001 ? 'คุณยกเลิกรายการใน MetaMask' : caught instanceof Error ? caught.message : 'ส่งธุรกรรมไม่สำเร็จ');
    } finally { setBusy(false); }
  };

  return <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="onchain-transfer-title">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 text-zinc-900">
      <div className="flex items-start justify-between gap-3"><div><h2 id="onchain-transfer-title" className="text-lg font-bold">ส่ง tBNB บนเชนจริง (Testnet)</h2><p className="text-xs text-zinc-500 mt-1">ทดสอบธุรกรรม native BNB บน BNB Smart Chain Testnet เท่านั้น</p></div><button onClick={onClose} className="text-zinc-500 hover:text-black" aria-label="ปิด">✕</button></div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">นี่เป็นการโอน tBNB ทดสอบ ไม่ใช่การล็อก Escrow ของ SANYA และไม่มีมูลค่าเงินจริง ห้ามใส่ private key หรือ seed phrase ในเว็บไซต์</div>
      <label className="block text-sm font-medium">ที่อยู่ผู้รับ (Recipient address)<input value={recipient} onChange={e => setRecipient(e.target.value.trim())} placeholder="0x..." className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm" autoComplete="off" /></label>
      <label className="block text-sm font-medium">จำนวน tBNB<input value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal" className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" /></label>
      {estimate && <p className="text-sm rounded-lg bg-zinc-50 p-3">ค่า Gas โดยประมาณ: <strong>{estimate}</strong></p>}
      {error && <p role="alert" className="text-sm text-red-700 rounded-lg bg-red-50 p-3">{error}</p>}
      {txHash && <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">ส่งคำขอธุรกรรมแล้ว<br/><a className="underline break-all" href={`${EXPLORER}${txHash}`} target="_blank" rel="noreferrer">ดู Transaction บน BscScan Testnet: {txHash}</a><p className="text-xs mt-1">ตรวจสอบสถานะยืนยันบน Explorer ก่อนถือว่าการโอนสำเร็จ</p></div>}
      <div className="flex flex-wrap justify-end gap-2"><button onClick={onClose} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm">ปิด</button><button onClick={estimateGas} disabled={busy} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm disabled:opacity-50">ประเมิน Gas</button><button onClick={send} disabled={busy} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'กำลังดำเนินการ…' : 'ส่งผ่าน MetaMask'}</button></div>
    </div>
  </div>;
};
