import React from 'react';
import { CalendarDays, ChevronDown, FileCheck2 } from 'lucide-react';

export interface AgreementSummaryMilestone {
  title: string;
  description: string;
  amount: number;
  revisionQuota: number;
  dueDate?: string;
}

interface AgreementSummaryCardProps {
  title: string;
  description: string;
  clientName: string;
  contractorName: string;
  clientAddress?: string;
  contractorAddress?: string;
  milestones: AgreementSummaryMilestone[];
  autoApproveDays: number;
  jurisdiction?: string;
}

function formatDueDate(value?: string): string {
  if (!value) return 'ยังไม่ระบุกำหนดส่ง';
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return 'ยังไม่ระบุกำหนดส่ง';
  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

function formatAmount(value: number): string {
  return value.toLocaleString('th-TH', { maximumFractionDigits: 6 });
}

export const AgreementSummaryCard: React.FC<AgreementSummaryCardProps> = ({
  title,
  description,
  clientName,
  contractorName,
  clientAddress,
  contractorAddress,
  milestones,
  autoApproveDays,
  jurisdiction
}) => {
  const totalAmount = milestones.reduce((sum, milestone) => sum + milestone.amount, 0);

  return (
    <section className="rounded-2xl border border-zinc-200 overflow-hidden" aria-label="สรุปสัญญาใน 1 นาที">
      <div className="p-4 sm:p-5 space-y-5">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4" />
            สรุปสัญญาใน 1 นาที
          </p>
          <h3 className="text-base font-bold text-zinc-900 leading-relaxed break-words">{title || 'ยังไม่ระบุชื่อสัญญา'}</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-zinc-50">
            <p className="text-zinc-500 mb-1">ผู้ว่าจ้าง · ผู้จ่ายเงิน</p>
            <p className="font-semibold text-zinc-900">{clientName || 'ยังไม่ระบุผู้ว่าจ้าง'}</p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-50">
            <p className="text-zinc-500 mb-1">ผู้รับจ้าง · ผู้รับเงินตามงวด</p>
            <p className="font-semibold text-zinc-900">{contractorName || 'ยังไม่ระบุผู้รับจ้าง'}</p>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <h4 className="font-semibold text-zinc-900">ตกลงทำอะไร</h4>
          <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap break-words">{description.trim() || 'ยังไม่ระบุขอบเขตงาน'}</p>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-zinc-900">ส่งอะไร ตรวจรับอย่างไร ({milestones.length} งวด)</h4>
          {milestones.map((milestone, index) => (
            <article key={index} className="rounded-xl border border-zinc-200 p-3.5 space-y-3 text-xs">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <span className="w-5 h-5 rounded-md bg-zinc-100 text-zinc-600 text-[10px] font-bold flex items-center justify-center shrink-0">{index + 1}</span>
                  <h5 className="font-semibold text-zinc-900 leading-relaxed break-words">{milestone.title || 'ยังไม่ระบุชื่องวด'}</h5>
                </div>
                <p className="font-semibold text-zinc-900 whitespace-nowrap">{formatAmount(milestone.amount)} USDT</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-zinc-500">งานที่ต้องส่ง / เกณฑ์ตรวจรับ</p>
                <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap break-words">{milestone.description.trim() || 'ยังไม่ระบุเกณฑ์ตรวจรับ — ควรตกลงให้ชัดก่อนยืนยัน'}</p>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 border-t border-zinc-100 text-[11px] text-zinc-600">
                <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />กำหนดส่ง: {formatDueDate(milestone.dueDate)}</span>
                <span>แก้ไขได้: <strong className="text-zinc-800">{milestone.revisionQuota} ครั้ง</strong></span>
              </div>
            </article>
          ))}
        </div>

        <div className="space-y-2.5 text-xs">
          <h4 className="font-semibold text-zinc-900">ผู้รับจ้างได้เงินเมื่อไร</h4>
          <p className="text-zinc-600 leading-relaxed">
            ปล่อยยอดของแต่ละงวดเมื่อผู้ว่าจ้างตรวจรับผ่าน โดยมีเวลาตรวจรับ <strong className="text-zinc-900">{autoApproveDays} วัน</strong> นับจากส่งงาน
          </p>
          <p className="text-zinc-600 leading-relaxed">
            หากครบกำหนดและผู้ว่าจ้างยังไม่ตอบกลับ ผู้รับจ้างกดใช้สิทธิตรวจรับอัตโนมัติได้ ส่วนงวดที่มีข้อพิพาทจะพักยอดไว้ให้คนกลางตัดสิน
          </p>
        </div>

        <details className="group rounded-xl bg-zinc-50 text-xs">
          <summary className="p-3 font-medium text-zinc-600 cursor-pointer flex items-center justify-between list-none">
            ดู Address และข้อมูลคนกลาง
            <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-3 pb-3 space-y-2.5 border-t border-zinc-200 pt-3 text-zinc-600">
            <div>
              <p className="text-[11px] mb-1">Address ผู้ว่าจ้างที่บันทึกในแอป</p>
              <p className="font-mono text-[11px] break-all">{clientAddress || 'ยังไม่ได้บันทึก Address'}</p>
            </div>
            <div>
              <p className="text-[11px] mb-1">Address ผู้รับจ้าง</p>
              <p className="font-mono text-[11px] break-all">{contractorAddress || 'ยังไม่ระบุ Address'}</p>
            </div>
            {jurisdiction && <p className="leading-relaxed">คนกลาง: {jurisdiction}</p>}
          </div>
        </details>
      </div>

      <div className="p-4 sm:px-5 bg-zinc-900 text-white flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium text-zinc-300">รวมค่าจ้าง · USDT จำลอง</span>
        <strong className="text-base font-bold">{formatAmount(totalAmount)} USDT</strong>
      </div>
    </section>
  );
};
