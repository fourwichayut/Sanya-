import React, { useState } from 'react';
import { useContracts } from '../../context/ContractContext';
import { 
  X, 
  FileCheck, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  Scale,
  UserCheck,
  Building2,
  Lock
} from 'lucide-react';

interface CreateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MilestoneInput {
  title: string;
  description: string;
  amount: number;
  revisionQuota: number;
}

export const CreateContractModal: React.FC<CreateContractModalProps> = ({ isOpen, onClose }) => {
  const { 
    personas, 
    activePersona, 
    createAgreement,
    executeWithWallet,
    isWalletConnected,
    isWalletConnecting
  } = useContracts();

  const [title, setTitle] = useState('สัญญาจ้างเหมาพัฒนา Web Application & API Integration');
  const [description, setDescription] = useState('สัญญาจ้างเหมาบริการทางเทคโนโลยีและส่งมอบซอร์สโค้ด โดยค้ำประกันเงินค่าจ้างใน Escrow Vault');
  
  // Contracting Parties
  const [contractorName, setContractorName] = useState('กิตติ กิจเจริญการช่าง');
  const [contractorAddress, setContractorAddress] = useState('0x3F267A890885e3b5e40632b7194883A92A4588e1');
  const [contractorId, setContractorId] = useState('user_kitti');
  
  const [autoApproveDays, setAutoApproveDays] = useState(5);
  
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    {
      title: 'งวดที่ 1: การออกแบบโครงสร้างระบบ และ REST API Backend',
      description: 'ส่งมอบ Swagger API Specification, โครงสร้าง Database Schema และ Integration Test',
      amount: 1000,
      revisionQuota: 2
    },
    {
      title: 'งวดที่ 2: หน้าจอ Web Application และเชื่อมต่อระบบฐานข้อมูลจริง',
      description: 'ส่งมอบ Source Code เว็บไซต์พร้อม Deploy สู่ Staging Server และคู่มือการติดตั้ง',
      amount: 1500,
      revisionQuota: 2
    }
  ]);

  if (!isOpen) return null;

  const totalBudget = milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
  const hasInsufficientBalance = activePersona.balanceUSDT < totalBudget;

  const handleAddMilestone = () => {
    setMilestones(prev => [
      ...prev,
      {
        title: `งวดที่ ${prev.length + 1}: ส่งมอบงานส่วนต่อขยายและคู่มือ`,
        description: 'รายละเอียดการทดสอบและเอกสารส่งมอบงาน',
        amount: 500,
        revisionQuota: 2
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (milestones.length === 0 || totalBudget <= 0 || hasInsufficientBalance) return;

    void executeWithWallet(() => {
      createAgreement({
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
          amount: Number(m.amount) || 0,
          status: 'PENDING',
          revisionQuota: Number(m.revisionQuota) || 2,
          revisionsUsed: 0
        }))
      });

      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-zinc-900">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900">
                ร่างสัญญาเดโมและ Escrow จำลอง (Smart Agreement Draft)
              </h2>
              <p className="text-xs text-zinc-500">
                จำลองข้อตกลงระหว่างคู่สัญญาและเงื่อนไขการจ่ายค่าจ้างตามงวด
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-200 text-zinc-400 hover:text-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">

          <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 leading-relaxed" role="note">
            <strong>🧪 Sandbox / Demo:</strong> MetaMask เชื่อม BNB Testnet ได้จริง ส่วน USDT, สัญญา และ Escrow เป็นข้อมูลจำลอง ยังไม่มีการลงนามหรือส่งธุรกรรมขึ้นเชน
          </div>
          
          {/* Section 1: Agreement Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center space-x-1.5">
              <span>1. วัตถุประสงค์และขอบเขตข้อตกลง (Agreement Scope)</span>
            </h3>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">
                ชื่องาน / หัวข้อสัญญา
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น สัญญาจ้างเหมาบริการทางเทคโนโลยี..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-zinc-300 text-zinc-900 focus:outline-none focus:border-zinc-500 text-xs shadow-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">
                สรุปสาระสำคัญของข้อตกลง
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ระบุข้อตกลง มาตรฐานการส่งมอบ และหน้าที่ของคู่สัญญา..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-zinc-300 text-zinc-900 focus:outline-none focus:border-zinc-500 text-xs shadow-xs"
              />
            </div>
          </div>

          {/* Section 2: Contracting Parties */}
          <div className="space-y-3 pt-2 border-t border-zinc-200">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center space-x-1.5">
              <span>2. ข้อมูลคู่สัญญา (Contracting Parties)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Party A (Client / Employer) */}
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-800 text-[11px] uppercase">
                    ผู้ว่าจ้าง (Party A - Client)
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">บัญชีของคุณ</span>
                </div>
                <div className="text-xs font-semibold text-zinc-900">{activePersona.name}</div>
                <div className="text-[10px] font-mono text-zinc-500 truncate">{activePersona.address}</div>
                <div className="text-[10px] text-zinc-600 font-mono">
                  ยอดจำลองพร้อมวางค้ำประกัน: ${activePersona.balanceUSDT.toLocaleString()} USDT
                </div>
              </div>

              {/* Party B (Contractor / Service Provider) */}
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-800 text-[11px] uppercase">
                    ผู้รับจ้าง (Party B - Contractor)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUsePresetContractor('user_kitti')}
                    className="text-[10px] text-zinc-600 hover:text-zinc-900 underline"
                  >
                    ใช้กระเป๋าทดสอบ
                  </button>
                </div>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="ชื่อผู้รับจ้าง / บริษัทผู้รับเหมา"
                    value={contractorName}
                    onChange={(e) => setContractorName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md bg-white border border-zinc-300 text-xs text-zinc-900 mb-1.5"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Wallet Address ผู้รับจ้าง (0x...)"
                    value={contractorAddress}
                    onChange={(e) => setContractorAddress(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md bg-white border border-zinc-300 text-xs font-mono text-zinc-900"
                  />
                </div>
              </div>

            </div>

            {/* Arbitrator info */}
            <div className="p-2.5 rounded-lg bg-zinc-100/70 border border-zinc-200 text-zinc-600 text-[11px] flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Scale className="w-3.5 h-3.5 text-zinc-700 shrink-0" />
                <span><strong>คนกลางระงับข้อพิพาท (Arbitrator):</strong> สถาบันอนุญาโตตุลาการดิจิทัล (0xEE41...51Fa)</span>
              </span>
              <span className="text-zinc-400">แต่งตั้งตามสัญญา</span>
            </div>
          </div>

          {/* Section 3: Milestones & Escrow Distribution */}
          <div className="space-y-3 pt-2 border-t border-zinc-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  3. งวดการส่งมอบและยอดเงินค้ำประกัน (Milestones & Escrow)
                </h3>
                <p className="text-[11px] text-zinc-500">
                  ระบบจำลองการล็อกเงินค่าจ้างใน Escrow และการจ่ายให้ผู้รับจ้างตามงวดที่ตรวจรับผ่าน
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-800 text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มงวดงาน</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2.5 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-zinc-700">
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
                      <input
                        type="text"
                        placeholder="ชื่องวดงาน เช่น งานระบบ Backend และ Database..."
                        value={m.title}
                        onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-md bg-white border border-zinc-200 text-zinc-900 text-xs"
                        required
                      />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <input
                          type="number"
                          min={1}
                          placeholder="จำนวน USDT"
                          value={m.amount}
                          onChange={(e) => handleMilestoneChange(idx, 'amount', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-md bg-white border border-zinc-200 text-zinc-900 text-xs font-mono"
                          required
                        />
                        <span className="ml-1.5 text-zinc-500 font-mono">USDT</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="ข้อกำหนดการส่งมอบ (Deliverable Criteria)..."
                        value={m.description}
                        onChange={(e) => handleMilestoneChange(idx, 'description', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-md bg-white border border-zinc-200 text-zinc-600 text-xs"
                      />
                    </div>
                    <div className="flex items-center space-x-1.5 text-zinc-500">
                      <span className="text-[11px] whitespace-nowrap">โควตาขอแก้:</span>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={m.revisionQuota}
                        onChange={(e) => handleMilestoneChange(idx, 'revisionQuota', Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded-md bg-white border border-zinc-200 text-zinc-900 text-xs font-mono"
                      />
                      <span className="text-[11px]">ครั้ง</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Governing Rules & Anti-Ghosting */}
          <div className="space-y-2 pt-2 border-t border-zinc-200">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              4. เงื่อนไขกำกับดูแล (Governing Rules & Anti-Ghosting)
            </h3>
            
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-zinc-800 text-xs flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-600" />
                  <span>ระยะเวลาตรวจรับงานอัตโนมัติ (Anti-Ghosting Review Window)</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  เมื่อผู้รับจ้างส่งงาน หากผู้ว่าจ้างเงียบหายเกินกำหนด สัญญาจะ Auto-Approve ปลดล็อกเงินให้อัตโนมัติ
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={autoApproveDays}
                  onChange={(e) => setAutoApproveDays(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 rounded-lg bg-white border border-zinc-300 text-zinc-900 text-xs font-mono text-center font-bold"
                />
                <span className="text-zinc-600 font-medium">วัน</span>
              </div>
            </div>
          </div>

          {/* Section 5: Financial Vault Summary */}
          <div className="p-4 rounded-xl bg-zinc-100 border border-zinc-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-700 font-medium flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-zinc-600" />
                <span>ยอดเงินใน Escrow จำลอง (Demo Escrow):</span>
              </span>
              <span className="font-mono text-base font-bold text-zinc-900">
                ${totalBudget.toLocaleString()} USDT
              </span>
            </div>
            
            <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-200">
              <span>ยอด USDT จำลองของคุณ ({activePersona.name}):</span>
              <span className="font-mono font-semibold text-zinc-800">
                ${activePersona.balanceUSDT.toLocaleString()} USDT
              </span>
            </div>

            {hasInsufficientBalance && (
              <div className="flex items-center space-x-1.5 text-red-600 text-[11px] pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>ยอดจำลองไม่พอค้ำประกัน กรุณากดเติมยอดจำลองในเมนูบัญชี</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {!isWalletConnected && (
            <p className="text-zinc-600 text-[11px]">
              ต้องเชื่อม MetaMask บน BNB Testnet ก่อนยืนยัน เมื่อเชื่อมเสร็จให้กดยืนยันอีกครั้ง
            </p>
          )}
          <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={hasInsufficientBalance || totalBudget <= 0 || isWalletConnecting}
              className="px-5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white font-medium transition-colors shadow-sm flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isWalletConnecting ? 'กำลังเชื่อมต่อ...' : 'ยืนยันสัญญาและ Escrow จำลอง'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
