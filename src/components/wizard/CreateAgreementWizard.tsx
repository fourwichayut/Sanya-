import React, { useState } from 'react';
import { useContracts } from '../../context/ContractContext';
import { AgreementSummaryCard } from '../common/AgreementSummaryCard';
import {
  FileCheck2,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  ShieldCheck,
  Clock,
  AlertCircle,
  Scale,
  Lock,
  Check,
  Layers,
  FileText,
  UserCheck,
  Users
} from 'lucide-react';

interface CreateAgreementWizardProps {
  onCancel: () => void;
  onCompleted: (agreementId: string) => void;
}

interface MilestoneInput {
  title: string;
  description: string;
  amount: number;
  revisionQuota: number;
  dueDate?: string;
}

export const CreateAgreementWizard: React.FC<CreateAgreementWizardProps> = ({
  onCancel,
  onCompleted
}) => {
  const {
    personas,
    activePersona,
    createAgreement
  } = useContracts();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Agreement Info
  const [title, setTitle] = useState('สัญญาจ้างเหมาพัฒนา Web Application & API Integration');
  const [agreementType, setAgreementType] = useState('พัฒนาซอฟต์แวร์และระบบงาน (Software Development)');
  const [description, setDescription] = useState('สัญญาจ้างพัฒนาและส่งมอบซอร์สโค้ดตามขอบเขตงาน แบ่งจ่ายตามงวด โดยมีเงินค้ำประกันและช่วงตรวจรับตามที่ตกลง');

  // Use an existing demo account so the displayed recipient matches the balance recipient.
  const availableContractors = personas.filter(persona => persona.id !== activePersona.id && persona.role !== 'ARBITRATOR');
  const defaultContractor = availableContractors.find(persona => persona.id === 'user_kitti') || availableContractors[0];
  const [contractorName, setContractorName] = useState(defaultContractor?.name || '');
  const [contractorAddress, setContractorAddress] = useState(defaultContractor?.address || '');
  const [contractorId, setContractorId] = useState(defaultContractor?.id || '');

  // Step 3: Milestones
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    {
      title: 'งวดที่ 1: การออกแบบโครงสร้างระบบ และ REST API Backend',
      description: 'ส่งมอบ Swagger API Specification, Database Schema และ Integration Test ผ่าน 100%',
      amount: 1000,
      revisionQuota: 2,
      dueDate: '2026-10-15'
    },
    {
      title: 'งวดที่ 2: หน้าจอ Web Application และเชื่อมต่อระบบฐานข้อมูลจริง',
      description: 'ส่งมอบ Source Code เว็บไซต์พร้อม Deploy สู่ Staging Server และคู่มือการติดตั้ง',
      amount: 1500,
      revisionQuota: 2,
      dueDate: '2026-10-31'
    }
  ]);

  // Step 4: Governing Rules
  const [autoApproveDays, setAutoApproveDays] = useState(5);
  const [agreementJurisdiction, setAgreementJurisdiction] = useState('LexEscrow Decentralized Arbitration DAO');

  const totalBudget = milestones.reduce((sum, m) => sum + (Number.isFinite(m.amount) ? m.amount : 0), 0);
  const hasInvalidMilestones = milestones.some(m =>
    !Number.isFinite(m.amount) || m.amount < 1 ||
    !Number.isInteger(m.revisionQuota) || m.revisionQuota < 0 || m.revisionQuota > 10
  );
  const hasInvalidReviewWindow = !Number.isInteger(autoApproveDays) || autoApproveDays < 1 || autoApproveDays > 14;
  const hasInvalidRecipient = !availableContractors.some(persona => persona.id === contractorId);

  const handleAddMilestone = () => {
    setMilestones(prev => [
      ...prev,
      {
        title: `งวดที่ ${prev.length + 1}: ส่งมอบงานส่วนต่อขยายและคู่มือ`,
        description: 'รายละเอียดการทดสอบและเอกสารส่งมอบงาน',
        amount: 500,
        revisionQuota: 2,
        dueDate: ''
      }
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    if (milestones.length <= 1) return;
    setMilestones(prev => prev.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index: number, field: keyof MilestoneInput, value: any) => {
    setMilestones(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleUsePresetContractor = (personaId: string) => {
    const p = personas.find(item => item.id === personaId);
    if (p) {
      setContractorId(p.id);
      setContractorName(p.name);
      setContractorAddress(p.address);
    }
  };

  const handleSaveDraft = () => {
    if (totalBudget <= 0 || hasInvalidMilestones || hasInvalidReviewWindow || hasInvalidRecipient) return;

    const agreementId = createAgreement({
      status: 'DRAFT',
      title,
      description,
      clientId: activePersona.id,
      contractorId,
      contractorName,
      contractorAddress,
      arbitratorId: 'user_charlie',
      totalEscrow: totalBudget,
      autoApproveDays,
      milestones: milestones.map((m, idx) => ({
        id: `m_${Date.now()}_${idx + 1}`,
        title: m.title,
        description: m.description,
        amount: Number(m.amount),
        status: 'PENDING',
        dueDate: m.dueDate ? m.dueDate : undefined,
        revisionQuota: Number(m.revisionQuota),
        revisionsUsed: 0
      }))
    });

    onCompleted(agreementId);
  };

  const steps = [
    { num: 1, label: 'ขอบเขตสัญญา' },
    { num: 2, label: 'ข้อมูลคู่สัญญา' },
    { num: 3, label: 'งวดงาน & ค่าจ้าง' },
    { num: 4, label: 'เงื่อนไขกำกับดูแล' },
    { num: 5, label: 'ตรวจทาน & ยืนยัน' },
  ];

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">

      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div>
          <button
            onClick={onCancel}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 flex items-center space-x-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ยกเลิก / กลับสู่หน้าหลัก</span>
          </button>
          <h1 className="text-xl font-bold text-zinc-900">
            ระบบร่างสัญญาอัจฉริยะ (Smart Agreement Wizard)
          </h1>
          <p className="text-xs text-zinc-500">
            ดำเนินการทีละขั้นตอนเพื่อร่างสัญญาและจำลองการวางเงินใน Escrow
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono text-zinc-400">ขั้นตอนที่</span>
          <div className="text-sm font-bold font-mono text-zinc-900">
            {currentStep} / {steps.length}
          </div>
        </div>
      </div>

      {/* Stepper Indicator */}
      <div className="bg-white border-0 rounded-[22px] p-5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => {
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center space-y-1.5 flex-1 text-center">
                  <div
                    className={`w-8 h-8 rounded-full text-xs font-bold font-mono flex items-center justify-center transition-all ${isDone
                        ? 'bg-zinc-900 text-white shadow-xs'
                        : isCurrent
                          ? 'bg-zinc-900 text-white ring-4 ring-[#f5f5f7] shadow-sm'
                          : 'bg-[#f5f5f7] text-zinc-400'
                      }`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className={`text-[11px] font-medium hidden sm:block ${isCurrent ? 'text-zinc-900 font-bold' : isDone ? 'text-zinc-700' : 'text-zinc-400'
                    }`}>
                    {s.label}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 ${currentStep > idx + 1 ? 'bg-zinc-900' : 'bg-black/[0.06]'
                    }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white border-0 rounded-[28px] p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] space-y-6">

        {/* STEP 1: AGREEMENT SCOPE */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="border-b border-zinc-100 pb-3">
              <h2 className="text-base font-bold text-zinc-900 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-zinc-700" />
                <span>ขั้นตอนที่ 1: วัตถุประสงค์และขอบเขตข้อตกลง (Agreement Scope)</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                ระบุสาระสำคัญของงานที่ตกลงจ้าง เพื่อใช้เป็นข้อผูกพันทางสัญญา
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">
                  ประเภทข้อตกลง (Agreement Category)
                </label>
                <select
                  value={agreementType}
                  onChange={(e) => setAgreementType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs focus:outline-none focus:border-zinc-500"
                >
                  <option value="พัฒนาซอฟต์แวร์และระบบงาน (Software Development)">พัฒนาซอฟต์แวร์และระบบงาน (Software Development)</option>
                  <option value="ออกแบบอัตลักษณ์แบรนด์และกราฟิก (Design & Creative)">ออกแบบอัตลักษณ์แบรนด์และกราฟิก (Design & Creative)</option>
                  <option value="บริการที่ปรึกษาทางธุรกิจและวิชาชีพ (Consulting)">บริการที่ปรึกษาทางธุรกิจและวิชาชีพ (Consulting)</option>
                  <option value="สัญญาจ้างงานวิจัยและวิเคราะห์ข้อมูล (Research & Analytics)">สัญญาจ้างงานวิจัยและวิเคราะห์ข้อมูล (Research & Analytics)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">
                  ชื่องาน / สัญญาจ้าง (Agreement Title) *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น สัญญาจ้างเหมาพัฒนา Full-stack Web Application..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs focus:outline-none focus:border-zinc-500 shadow-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">
                  รายละเอียดขอบเขตงานและหน้าที่ของคู่สัญญา (Scope of Work) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="อธิบายสรุปขอบเขตงาน, มาตรฐานการส่งมอบ, และผลงานที่ต้องได้รับ..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs focus:outline-none focus:border-zinc-500 shadow-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CONTRACTING PARTIES */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="border-b border-zinc-100 pb-3">
              <h2 className="text-base font-bold text-zinc-900 flex items-center space-x-2">
                <Users className="w-4 h-4 text-zinc-700" />
                <span>ขั้นตอนที่ 2: ข้อมูลคู่สัญญา (Contracting Parties)</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                ระบุตัวตนและ Wallet Address ของผู้ว่าจ้าง (Party A) และผู้รับจ้าง (Party B)
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Party A */}
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-800 uppercase tracking-wider text-[11px]">
                    Party A: ผู้ว่าจ้าง (Employer / Client)
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">บัญชีปัจจุบันของคุณ</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <img
                    src={activePersona.avatar}
                    alt={activePersona.name}
                    className="w-8 h-8 rounded-full object-cover border border-zinc-300"
                  />
                  <div>
                    <div className="font-bold text-zinc-900 text-xs">{activePersona.name}</div>
                    <div className="font-mono text-zinc-500 text-[11px]">{activePersona.address}</div>
                  </div>
                </div>
                <div className="text-[11px] text-zinc-600 font-mono pt-1 border-t border-zinc-200">
                  ยอด Sandbox ในแอป: ${activePersona.balanceUSDT.toLocaleString()} USDT (ไม่ใช่ยอดบน BNB Chain)
                </div>
              </div>

              {/* Party B */}
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-800 uppercase tracking-wider text-[11px]">
                    Party B: ผู้รับจ้าง (Contractor / Service Provider)
                  </span>
                </div>

                <div>
                  <label htmlFor="demo-contractor" className="text-zinc-600 block mb-1">เลือกผู้รับจ้างในเดโม</label>
                  <select
                    id="demo-contractor"
                    value={contractorId}
                    onChange={(e) => handleUsePresetContractor(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-zinc-300 text-zinc-900 text-xs"
                  >
                    <option value="" disabled>เลือกบัญชีผู้รับจ้าง</option>
                    {availableContractors.map(persona => <option key={persona.id} value={persona.id}>{persona.name} (@{persona.username})</option>)}
                  </select>
                  <p className="text-[11px] text-zinc-500 mt-1.5">ยอดจำลองจะจ่ายให้บัญชีที่เลือกนี้เมื่อตรวจรับผ่าน</p>
                </div>

                <div>
                  <p className="text-zinc-600 mb-1">Address ของบัญชีที่เลือก</p>
                  <p className="w-full px-3 py-2 rounded-lg bg-white border border-zinc-300 text-zinc-900 text-xs font-mono break-all">{contractorAddress || 'ยังไม่ระบุ Address'}</p>
                </div>
              </div>

              {/* Party C: Arbitrator */}
              <div className="p-3.5 rounded-xl bg-zinc-100/80 border border-zinc-200 flex items-center justify-between text-[11px] text-zinc-600">
                <div className="flex items-center space-x-2">
                  <Scale className="w-4 h-4 text-zinc-800 shrink-0" />
                  <span>
                    <strong>ผู้ระงับข้อพิพาท (Arbitrator):</strong> สถาบันอนุญาโตตุลาการดิจิทัล LexEscrow (0xEE41...51Fa)
                  </span>
                </div>
                <span className="text-zinc-400 font-mono">Multi-sig</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: MILESTONES & ESCROW BUDGET */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-zinc-900 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-zinc-700" />
                  <span>ขั้นตอนที่ 3: งวดการส่งมอบและการแบ่งจ่าย (Milestones Schedule)</span>
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  ระบุจำนวนเงินตามข้อตกลงไว้ในร่างเท่านั้น ขั้นตอนนี้ยังไม่พักหรือโอนเงินจริง
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddMilestone}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มงวดงาน</span>
              </button>
            </div>

            {/* Milestones list */}
            <div className="space-y-3 text-xs">
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2.5 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-zinc-800">
                      งวดที่ {idx + 1}
                    </span>
                    {milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(idx)}
                        className="text-zinc-400 hover:text-zinc-700 p-1"
                        title="ลบงวดนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <label className="text-zinc-500 block mb-1">ชื่องวดงาน</label>
                      <input
                        type="text"
                        required
                        value={m.title}
                        onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                        placeholder="เช่น ระบบ Backend และ Database..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-500 block mb-1">จำนวนเงินค้ำประกัน</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          min={1}
                          required
                          value={m.amount}
                          onChange={(e) => handleMilestoneChange(idx, 'amount', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-900 text-xs font-mono"
                        />
                        <span className="ml-1.5 text-zinc-500 font-mono">USDT</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="sm:col-span-2">
                      <label className="text-zinc-500 block mb-1">เกณฑ์ผลงานที่ต้องส่งมอบ (Deliverable Criteria)</label>
                      <input
                        type="text"
                        value={m.description}
                        onChange={(e) => handleMilestoneChange(idx, 'description', e.target.value)}
                        placeholder="เช่น Swagger API Spec และ Source Code..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-600 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-500 block mb-1">กำหนดส่งมอบ (ไม่บังคับ)</label>
                      <input
                        type="date"
                        value={m.dueDate || ''}
                        onChange={(e) => handleMilestoneChange(idx, 'dueDate', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-900 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-500 block mb-1">โควตาขอแก้งาน</label>
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="number"
                          min={0}
                          max={10}
                          value={m.revisionQuota}
                          onChange={(e) => handleMilestoneChange(idx, 'revisionQuota', Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-900 text-xs font-mono text-center"
                        />
                        <span className="text-zinc-500">ครั้ง</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total summary */}
            <div className="p-4 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-700">
                ยอดเงินค้ำประกันรวมทั้งหมดใน Escrow Vault:
              </span>
              <span className="font-mono text-base font-bold text-zinc-900">
                ${totalBudget.toLocaleString()} USDT
              </span>
            </div>
          </div>
        )}

        {/* STEP 4: GOVERNING RULES & ANTI-GHOSTING */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="border-b border-zinc-100 pb-3">
              <h2 className="text-base font-bold text-zinc-900 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-zinc-700" />
                <span>ขั้นตอนที่ 4: เงื่อนไขการกำกับดูแล (Governing Rules & Anti-Ghosting)</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                กำหนดกติกาการตรวจรับงานเพื่อความยุติธรรม ป้องกันฝ่ายใดฝ่ายหนึ่งดองงานหรือเงียบหาย
              </p>
            </div>

            <div className="space-y-3.5 text-xs">

              {/* Anti-Ghosting Window */}
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-zinc-900 flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-zinc-700" />
                    <span>ระยะเวลานับถอยหลังตรวจรับงาน (Anti-Ghosting Review Window)</span>
                  </div>
                  <p className="text-zinc-500 max-w-md">
                    เมื่อผู้รับจ้างส่งงาน ผู้ว่าจ้างมีเวลาตรวจรับตามจำนวนวันที่กำหนด หากไม่ตอบกลับจนครบกำหนด ผู้รับจ้างกดใช้สิทธิตรวจรับอัตโนมัติในเดโมได้
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={autoApproveDays}
                    onChange={(e) => setAutoApproveDays(Number(e.target.value))}
                    className="w-20 px-3 py-2 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs font-mono font-bold text-center"
                  />
                  <span className="font-semibold text-zinc-700">วัน</span>
                </div>
              </div>

              {/* Revision Terms */}
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                <div className="font-bold text-zinc-900">
                  เงื่อนไขการขอแก้ไขงาน (Revision Policy)
                </div>
                <p className="text-zinc-500 leading-relaxed">
                  ผู้ว่าจ้างขอแก้ไขได้ตามจำนวนครั้งที่ระบุในแต่ละงวด การขอแก้ไขจะหยุดเวลาตรวจรับชั่วคราว เมื่อผู้รับจ้างส่งงานใหม่จึงเริ่มช่วงตรวจรับอีกครั้ง
                </p>
              </div>

              {/* Dispute & Arbitration Terms */}
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                <div className="font-bold text-zinc-900 flex items-center space-x-1.5">
                  <Scale className="w-4 h-4 text-zinc-700" />
                  <span>การระงับข้อพิพาท (Dispute Resolution Protocol)</span>
                </div>
                <p className="text-zinc-500 leading-relaxed">
                  หากคู่สัญญาตกลงกันไม่ได้ สามารถกดเปิดข้อพิพาทเพื่ออายัดเงินงวดนั้นไว้ใน Escrow Vault และส่งเรื่องให้สถาบันอนุญาโตตุลาการดิจิทัล LexEscrow วินิจฉัยตัดสินขั้นเด็ดขาด
                </p>
              </div>

            </div>
          </div>
        )}

        {/* STEP 5: AGREEMENT SUMMARY */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="border-b border-zinc-100 pb-3">
              <h2 className="text-base font-bold text-zinc-900 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-zinc-800" />
                <span>ขั้นตอนที่ 5: ตรวจทานข้อตกลง</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                อ่านสรุปงาน งวดจ่าย และเงื่อนไขก่อนบันทึกร่าง
              </p>
            </div>

            <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-900 leading-relaxed" role="note">
              <strong>ร่างเท่านั้น:</strong> บันทึกในเบราว์เซอร์นี้ ไม่ deploy Smart Contract, ไม่ส่งธุรกรรม และไม่ล็อกเงินจริง
            </div>

            <AgreementSummaryCard
              title={title}
              description={description}
              clientName={activePersona.name}
              contractorName={contractorName}
              clientAddress={activePersona.address}
              contractorAddress={contractorAddress}
              milestones={milestones}
              autoApproveDays={autoApproveDays}
              jurisdiction={agreementJurisdiction}
            />

            <p className="text-xs text-zinc-500 leading-relaxed">
              หลังบันทึกจะพบร่างใน Activity และสารบรรณสัญญา ขณะนี้ยังไม่มี Contract Address หรือ Transaction Hash ให้ตรวจบน BscScan
            </p>

            {(hasInvalidMilestones || hasInvalidReviewWindow) && (
              <p className="text-xs text-red-600">
                แต่ละงวดต้องมียอดอย่างน้อย 1 USDT แก้ไขได้ 0–10 ครั้ง และระยะเวลาตรวจรับต้องเป็น 1–14 วัน
              </p>
            )}
            {hasInvalidRecipient && <p className="text-xs text-red-600">กรุณากลับไปเลือกบัญชีผู้รับจ้างในขั้นตอนที่ 2</p>}

          </div>
        )}

        {/* Wizard Footer Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>ย้อนกลับ</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-zinc-500 hover:text-zinc-800 text-xs font-medium"
            >
              ยกเลิก
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-colors"
              >
                <span>ขั้นตอนถัดไป</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={totalBudget <= 0 || hasInvalidMilestones || hasInvalidReviewWindow || hasInvalidRecipient}
                onClick={handleSaveDraft}
                className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-xs font-bold flex items-center space-x-2 shadow-md transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>บันทึกร่างสัญญา</span>
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
