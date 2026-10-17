import React, { useState } from 'react';
import { useContracts } from '../../context/ContractContext';
import { OnChainTransferModal } from '../modals/OnChainTransferModal';
import { 
  FileCheck2, 
  CheckCircle, 
  Clock, 
  UploadCloud, 
  Coins, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle,
  Scale,
  Lock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  FileText,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Copy,
  LogIn,
  Briefcase,
  Plus
} from 'lucide-react';

interface FreelanceModuleProps {
  initialSubView?: 'my_contracts' | 'public_registry';
  initialDetailAgreementId?: string | null;
  onSelectDetailAgreementId?: (id: string | null) => void;
  onChangeSubView?: (subView: 'my_contracts' | 'public_registry') => void;
  onOpenCreate: () => void;
  onOpenSolidity: () => void;
  onOpenLogin?: () => void;
}

export const FreelanceModule: React.FC<FreelanceModuleProps> = ({ 
  initialSubView,
  initialDetailAgreementId,
  onSelectDetailAgreementId,
  onChangeSubView,
  onOpenCreate, 
  onOpenSolidity,
  onOpenLogin 
}) => {
  const { 
    agreements, 
    personas, 
    activePersona, 
    isAuthenticated,
    setActivePersonaId,
    submitMilestone, 
    approveMilestone, 
    requestRevision, 
    explainFeasibility,
    acceptFeasibilityOrReRevise,
    acceptRevision,
    triggerAntiGhosting,
    raiseDispute,
    resolveDispute,
    tipContractor,
    executeWithWallet,
    setIsMetaMaskModalOpen,
    isWalletConnected,
    walletAddress
  } = useContracts();

  const [subView, setSubView] = useState<'my_contracts' | 'public_registry'>(
    initialSubView || (isAuthenticated ? 'my_contracts' : 'public_registry')
  );

  const [selectedDetailAgreementId, setSelectedDetailAgreementId] = useState<string | null>(
    initialDetailAgreementId ?? null
  );

  React.useEffect(() => {
    if (initialSubView && initialSubView !== subView) {
      setSubView(initialSubView);
    }
  }, [initialSubView]);

  React.useEffect(() => {
    if (initialDetailAgreementId !== undefined) {
      setSelectedDetailAgreementId(initialDetailAgreementId);
      if (initialDetailAgreementId) {
        setSelectedAgreementId(initialDetailAgreementId);
      }
    }
  }, [initialDetailAgreementId]);

  const handleSubViewChange = (newSubView: 'my_contracts' | 'public_registry') => {
    setSubView(newSubView);
    if (newSubView === 'my_contracts') {
      setSelectedDetailAgreementId(null);
      onSelectDetailAgreementId?.(null);
    }
    onChangeSubView?.(newSubView);
  };

  const [selectedAgreementId, setSelectedAgreementId] = useState<string>(
    initialDetailAgreementId || agreements[0]?.id || ''
  );
  
  // Modals state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [activeMilestoneId, setActiveMilestoneId] = useState<string>('');
  const [submitUrl, setSubmitUrl] = useState('https://github.com/enterprise-core/web3-dashboard');
  const [submitHash, setSubmitHash] = useState('ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG');
  const [submitNote, setSubmitNote] = useState('ส่งมอบ Source Code และ Live Demo งวดที่ 2 เรียบร้อยแล้วครับ');
  
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [isOnChainTransferOpen, setIsOnChainTransferOpen] = useState(false);
  const [tipAmount, setTipAmount] = useState<number>(50);

  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionCategory, setRevisionCategory] = useState('ปรับแต่ง UI และความสวยงาม (Minor Polish)');
  const [revisionNote, setRevisionNote] = useState('ขอให้ปรับปรุงความเร็วในการโหลดข้อมูล และแก้ไข Responsive บนมือถือ');

  const [isFeasibilityModalOpen, setIsFeasibilityModalOpen] = useState(false);
  const [feasibilityText, setFeasibilityText] = useState('โครงสร้างระบบนี้สอดคล้องตามข้อกำหนด 1.2 ของสัญญาแล้ว หากรื้อระบบใหม่จะกระทบความปลอดภัย แต่ยินดีปรับแก้ UI และ Flow หน้าบ้านให้ตามที่แจ้งครับ');

  const [isAdjustRevisionModalOpen, setIsAdjustRevisionModalOpen] = useState(false);
  const [adjustedRevisionNote, setAdjustedRevisionNote] = useState('');

  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('ผลงานไม่ตรงตามข้อกำหนดในเอกสารส่งมอบ และไม่มีการแก้ไขตามโควตา');

  const [isArbitrationModalOpen, setIsArbitrationModalOpen] = useState(false);

  const myAgreements = agreements.filter(
    a => a.clientId === activePersona.id ||
         a.contractorId === activePersona.id ||
         a.arbitratorId === activePersona.id ||
         (activePersona.address && a.contractorAddress?.toLowerCase() === activePersona.address.toLowerCase())
  );
  const selectedAgreement =
    (subView === 'my_contracts' && myAgreements.length > 0
      ? myAgreements.find(a => a.id === selectedAgreementId) || myAgreements[0]
      : agreements.find(a => a.id === selectedAgreementId)) || agreements[0];

  const sandboxNotice = (
    <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-900 leading-relaxed" role="note">
      <strong>🧪 Sandbox / Demo:</strong> เชื่อม MetaMask กับ BNB Testnet ได้จริง ส่วนสัญญา, USDT และ Escrow ยังเป็นข้อมูลจำลอง
      <div className="mt-2"><button type="button" onClick={() => setIsOnChainTransferOpen(true)} className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-700">ทดลองส่ง tBNB จริงบน Testnet + ประเมิน Gas</button></div>
      {isOnChainTransferOpen && <OnChainTransferModal onClose={() => setIsOnChainTransferOpen(false)} />}
    </div>
  );

  // VIEW: Public Agreement Registry (สำหรับทุกคน โดยซ่อนข้อมูลมูลค่าเงินสำหรับบุคคลภายนอก)
  const renderPublicRegistry = () => (
    <div className="space-y-6 max-w-5xl mx-auto py-2 font-sans">

      {sandboxNotice}

      {/* 1. Public Registry Header */}
      <div className="bg-zinc-900 border-0 rounded-[24px] p-6 sm:p-8 shadow-2xl space-y-4 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center p-0.5 shadow-xs">
                <img src="./logo.png" alt="SANYA Logo" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                สารบรรณสัญญาอัจฉริยะในระบบ (Contract Registry)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed pt-0.5">
              รายการสัญญาเดโมใน SANYA • คู่สัญญาสามารถจัดการงวดงาน ตรวจรับ และจำลองธุรกรรม Escrow ได้ในเมนูสัญญาของฉัน
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {!isAuthenticated && onOpenLogin && (
              <button
                type="button"
                onClick={onOpenLogin}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-100 active:scale-[0.99] text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบเพื่อจัดการสัญญา</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Pill Bar */}
        <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center gap-3 text-xs text-zinc-300">
          <span className="font-semibold text-white">
            สัญญาในระบบทั้งหมด: <strong>{agreements.length} ฉบับ</strong>
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center space-x-1.5 text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>กำลังดำเนินงาน: {agreements.filter(a => a.status === 'IN_PROGRESS' || a.status === 'ACTIVE_ESCROW').length} ฉบับ</span>
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center space-x-1.5 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-zinc-500"></span>
            <span>เสร็จสมบูรณ์: {agreements.filter(a => a.status === 'COMPLETED').length} ฉบับ</span>
          </span>
          <span className="text-zinc-600">•</span>
          <span className="font-mono text-[11px] text-zinc-400 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>Smart Contract Escrow Protected</span>
          </span>
        </div>
      </div>

      {/* 2. Public Agreement Cards (บอกแค่ชื่อสัญญา ใครบ้าง มูลค่าไม่ควรบอก) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1 text-xs text-zinc-500">
          <span className="font-bold text-zinc-400 uppercase tracking-wider text-[11px]">
            รายการสัญญาที่บันทึกบนบล็อกเชน (Public Agreements)
          </span>
          <span>แสดงผลแบบสาธารณะ (ซ่อนข้อมูลมูลค่าสำหรับบุคคลภายนอก)</span>
        </div>

        {agreements.map((agreement, index) => {
          const client = personas.find(p => p.id === agreement.clientId);
          const contractor = personas.find(p => p.id === agreement.contractorId);
          const arbitrator = personas.find(p => p.id === agreement.arbitratorId);
          const isCompleted = agreement.status === 'COMPLETED';
          const isDisputed = agreement.status === 'DISPUTED';
          const isMyAgreement = isAuthenticated && (
            agreement.clientId === activePersona.id ||
            agreement.contractorId === activePersona.id ||
            agreement.arbitratorId === activePersona.id
          );

          return (
            <div
              key={agreement.id}
              style={{ animationDelay: `${index * 80}ms` }}
              className="bg-white border-0 rounded-[24px] p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_-6px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out hover:-translate-y-1.5 space-y-4 relative overflow-hidden group animate-card-in"
            >
              {/* Card Header: ID, Vault Address & Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <span className="font-mono font-bold text-xs text-zinc-900 bg-[#f5f5f7] px-2.5 py-1 rounded-lg">
                    {agreement.id}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 truncate max-w-[180px] sm:max-w-xs flex items-center space-x-1">
                    <Lock className="w-3 h-3 text-zinc-400" />
                    <span>Vault จำลอง: {agreement.contractAddress}</span>
                  </span>
                  {isMyAgreement && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-900 text-white flex items-center space-x-1">
                      <span>⭐ สัญญาของคุณ</span>
                    </span>
                  )}
                </div>

                {/* Status Badge */}
                <div>
                  {isCompleted ? (
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#f5f5f7] text-zinc-900 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ดำเนินการเสร็จสมบูรณ์</span>
                    </span>
                  ) : isDisputed ? (
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-800 flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      <span>มีข้อพิพาทระหว่างคู่สัญญา</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#f5f5f7] text-zinc-800 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-600" />
                      <span>กำลังดำเนินงานตามงวด (Active)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 leading-snug">
                  {agreement.title}
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {agreement.description}
                </p>
              </div>

              {/* Parties Involved */}
              <div className="pt-1">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  คู่สัญญาที่เกี่ยวข้อง (Contract Parties)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Party A: Client */}
                  <div className="p-3.5 rounded-2xl bg-[#f5f5f7] flex items-center space-x-2.5">
                    <img
                      src={client?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt="Client"
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] text-zinc-500 font-medium">Party A: ผู้ว่าจ้าง</div>
                      <div className="text-xs font-bold text-zinc-900 truncate">
                        {client?.name || 'สมชาย พงษ์ไพศาล'}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 truncate">
                        {client?.address ? `${client.address.slice(0, 6)}...${client.address.slice(-4)}` : ''}
                      </div>
                    </div>
                  </div>

                  {/* Party B: Contractor */}
                  <div className="p-3.5 rounded-2xl bg-[#f5f5f7] flex items-center space-x-2.5">
                    <img
                      src={contractor?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                      alt="Contractor"
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] text-zinc-500 font-medium">Party B: ผู้รับจ้าง</div>
                      <div className="text-xs font-bold text-zinc-900 truncate">
                        {contractor?.name || agreement.contractorName}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 truncate">
                        {agreement.contractorAddress ? `${agreement.contractorAddress.slice(0, 6)}...${agreement.contractorAddress.slice(-4)}` : ''}
                      </div>
                    </div>
                  </div>

                  {/* Party C: Arbitrator */}
                  <div className="p-3.5 rounded-2xl bg-[#f5f5f7] flex items-center space-x-2.5">
                    <img
                      src={arbitrator?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'}
                      alt="Arbitrator"
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] text-zinc-500 font-medium">Party C: คนกลางไกล่เกลี่ย</div>
                      <div className="text-xs font-bold text-zinc-900 truncate">
                        {arbitrator?.name || 'สถาบันอนุญาโตตุลาการดิจิทัล'}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 truncate">
                        LexEscrow DAO
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Milestones count, Protection Terms & Hidden Financial Vault */}
              <div className="pt-2 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-3 text-zinc-600">
                  <span className="flex items-center space-x-1 font-medium">
                    <FileText className="w-3.5 h-3.5 text-zinc-500" />
                    <span>งวดงาน: <strong>{agreement.milestones.length} งวด</strong></span>
                  </span>
                  <span className="text-zinc-300">•</span>
                  <span className="flex items-center space-x-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Anti-Ghosting: <strong>{agreement.autoApproveDays} วัน</strong></span>
                  </span>
                  <span className="text-zinc-300">•</span>
                  {/* มูลค่าไม่ควรบอก */}
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#f5f5f7] text-zinc-700 font-mono text-[11px]">
                    <Lock className="w-3 h-3 text-zinc-500" />
                    <span>
                      มูลค่าสัญญา:{' '}
                      {isMyAgreement ? (
                        <strong className="font-sans text-zinc-900 font-bold">${agreement.totalEscrow.toLocaleString()} USDT</strong>
                      ) : (
                        <strong className="font-sans text-zinc-500">🔒 ปิดข้อมูลทางการเงิน (เฉพาะคู่สัญญา)</strong>
                      )}
                    </span>
                  </span>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={onOpenSolidity}
                    className="px-3 py-1.5 rounded-xl bg-[#f5f5f7] hover:bg-zinc-200/70 text-zinc-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    ดูโค้ด Solidity
                  </button>

                  {isMyAgreement ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAgreementId(agreement.id);
                        setSelectedDetailAgreementId(agreement.id);
                        onSelectDetailAgreementId?.(agreement.id);
                        setSubView('my_contracts');
                        onChangeSubView?.('my_contracts');
                      }}
                      className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>เข้าจัดการสัญญาของคุณ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : !isAuthenticated && onOpenLogin ? (
                    <button
                      type="button"
                      onClick={onOpenLogin}
                      className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>เข้าสู่ระบบเพื่อจัดการ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );

  // If not authenticated, or if user explicitly chose public registry:
  if (!isAuthenticated || subView === 'public_registry') {
    return renderPublicRegistry();
  }

  if (!selectedAgreement) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border-0 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] max-w-md mx-auto mt-10 space-y-4">
        {sandboxNotice}
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto text-zinc-700">
          <FileCheck2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-zinc-900">ยังไม่มีสัญญาของคุณในระบบ</h3>
          <p className="text-xs text-zinc-500 mt-1">
            คุณสามารถกดสลับไปดูสารบรรณสัญญาในระบบ หรือเริ่มร่างสัญญาฉบับใหม่ได้ทันที
          </p>
        </div>
        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            onClick={() => handleSubViewChange('public_registry')}
            className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition-colors"
          >
            ดูสารบรรณสัญญา
          </button>
          <button
            onClick={onOpenCreate}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            + ร่างสัญญาฉบับใหม่
          </button>
        </div>
      </div>
    );
  }

  const client = personas.find(p => p.id === selectedAgreement.clientId);
  const contractor = personas.find(p => p.id === selectedAgreement.contractorId);
  const arbitrator = personas.find(p => p.id === selectedAgreement.arbitratorId);

  const isCurrentClient = activePersona.id === selectedAgreement.clientId;
  const isCurrentContractor = activePersona.id === selectedAgreement.contractorId;
  const isCurrentArbitrator = activePersona.role === 'ARBITRATOR' || activePersona.id === selectedAgreement.arbitratorId;

  const completedMilestones = selectedAgreement.milestones.filter(m => m.status === 'APPROVED');
  const totalAmount = selectedAgreement.milestones.reduce((s, m) => s + m.amount, 0);
  const completedAmount = completedMilestones.reduce((s, m) => s + m.amount, 0);
  const remainingInVault = totalAmount - completedAmount;
  const progressPercent = totalAmount > 0 ? Math.round((completedAmount / totalAmount) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">

      {sandboxNotice}
      
      {/* 1. Contracting Role Awareness Banner */}
      <div className="bg-white border-0 rounded-[22px] p-4 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <img
            src={activePersona.avatar}
            alt={activePersona.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-zinc-500">คุณกำลังลงชื่อใช้งานในฐานะ:</span>
              <span className="text-xs font-bold text-zinc-900">{activePersona.name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 font-semibold">
                {activePersona.role === 'CLIENT' ? 'Party A (ผู้ว่าจ้าง)' : activePersona.role === 'CONTRACTOR' ? 'Party B (ผู้รับจ้าง)' : 'Party C (Arbitrator คนกลาง)'}
              </span>
              
              {/* Live wallet readiness */}
              {isWalletConnected && walletAddress ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-white flex items-center space-x-1">
                  <span>🦊</span>
                  <span>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)} • BNB Testnet</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsMetaMaskModalOpen(true)}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-300 flex items-center space-x-1 transition-colors cursor-pointer"
                  title="เชื่อมกระเป๋าที่ตรงกับบัญชีนี้บน BNB Chain Testnet"
                >
                  <span>⚠️</span>
                  <span>เชื่อม MetaMask • BNB Testnet</span>
                </button>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              {isCurrentClient && '👉 บทบาทผู้ว่าจ้าง: ตรวจสอบงวดงาน, กดตรวจรับเพื่อปล่อยเงิน Escrow จำลอง, ขอแก้ไขงาน, หรือยกเรื่องสู่คนกลาง'}
              {isCurrentContractor && '👉 บทบาทผู้รับจ้าง: ส่งมอบงานตามงวดพร้อมหลักฐาน URL/Hash และเรียกใช้สิทธิ Anti-Ghosting เมื่อครบ 5 วัน'}
              {isCurrentArbitrator && '👉 บทบาทคนกลางไกล่เกลี่ย: วินิจฉัยข้อพิพาท และสั่งตัดสินปล่อยเงินให้ผู้รับจ้าง หรือคืนเงินให้ผู้ว่าจ้าง'}
            </p>
          </div>
        </div>

        {/* Quick Switch to test other party perspective */}
        <div className="flex items-center space-x-1.5 self-end sm:self-center shrink-0">
          <span className="text-[11px] text-zinc-400">สลับมุมมอง:</span>
          {personas.filter(p => p.id !== activePersona.id).map(p => (
            <button
              key={p.id}
              onClick={() => setActivePersonaId(p.id)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-800 transition-colors shadow-xs"
            >
              {p.name.split(' ')[0]} ({p.role === 'CLIENT' ? 'ผู้ว่าจ้าง' : p.role === 'CONTRACTOR' ? 'ผู้รับจ้าง' : 'คนกลาง'})
            </button>
          ))}
        </div>
      </div>

      {/* 2. Agreement Selector Bar or Empty State for My Contracts */}
      {subView === 'my_contracts' && myAgreements.length === 0 ? (
        <div className="bg-white border-0 rounded-[28px] p-8 sm:p-12 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] text-center space-y-5 max-w-xl mx-auto my-6">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
            <Briefcase className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-zinc-900">
              ยังไม่มีสัญญาในบัญชี @{activePersona.username} ({activePersona.name})
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed max-w-md mx-auto">
              บัญชีนี้ยังไม่มีสัญญาที่เกี่ยวข้องในฐานะ {activePersona.roleTitle} คุณสามารถเริ่มต้นร่างสัญญาใหม่ หรือสำรวจสัญญาในสารบรรณสาธารณะ
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenCreate}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ ร่างสัญญาป้องกันการโกงใหม่</span>
            </button>
            <button
              type="button"
              onClick={() => handleSubViewChange('public_registry')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-zinc-500" />
              <span>สำรวจสารบรรณสัญญา ({agreements.length})</span>
            </button>
          </div>
        </div>
      ) : selectedDetailAgreementId === null ? (
        /* CARDS LIST VIEW: แสดงเฉพาะการ์ดสัญญา และกดเปิดดูรายละเอียด */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-zinc-700" />
                <span>สัญญาของคุณ ({myAgreements.length} ฉบับ)</span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                คลิกเลือกการ์ดสัญญาเพื่อเปิดดูรายละเอียด ตรวจรับงาน หรือทำธุรกรรมปลดล็อก Escrow
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenCreate}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ ร่างสัญญาใหม่</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
            {myAgreements.map((a, idx) => {
              const completedCount = a.milestones.filter(m => m.status === 'APPROVED').length;
              const progress = a.milestones.length > 0 ? Math.round((completedCount / a.milestones.length) * 100) : 0;
              
              const isClient = a.clientId === activePersona.id;
              const isContractor = a.contractorId === activePersona.id || (activePersona.address && a.contractorAddress?.toLowerCase() === activePersona.address.toLowerCase());
              const isArb = a.arbitratorId === activePersona.id;
              const roleTag = isClient ? 'ผู้ว่าจ้าง (Party A)' : isContractor ? 'ผู้รับจ้าง (Party B)' : isArb ? 'คนกลาง (Arbitrator)' : 'คู่สัญญา';
              
              const counterpartyName = isClient
                ? a.contractorName
                : personas.find(p => p.id === a.clientId)?.name || 'ผู้ว่าจ้าง';

              const hasSubmitted = a.milestones.some(m => m.status === 'SUBMITTED');
              const hasRevision = a.milestones.some(m => m.status === 'REVISION_REQUESTED');

              return (
                <div
                  key={a.id}
                  onClick={() => {
                    setSelectedAgreementId(a.id);
                    setSelectedDetailAgreementId(a.id);
                    onSelectDetailAgreementId?.(a.id);
                  }}
                  style={{ animationDelay: `${idx * 100}ms` }}
                  className="h-full p-6 sm:p-7 rounded-[24px] bg-white text-zinc-900 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_-6px_rgba(0,0,0,0.12)] border-0 transition-all duration-300 ease-out hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between space-y-4 group animate-card-in"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[#f5f5f7] text-zinc-900">
                          {a.id}
                        </span>
                        {a.status === 'COMPLETED' ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#f5f5f7] text-zinc-800 flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-zinc-900" />
                            <span>เสร็จสมบูรณ์</span>
                          </span>
                        ) : a.status === 'DISPUTED' ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3 text-red-500" />
                            <span>มีข้อพิพาท</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#f5f5f7] text-zinc-700 flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 animate-pulse" />
                            <span>กำลังดำเนินงาน</span>
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-mono font-black px-2.5 py-1 rounded-lg bg-zinc-900 text-white">
                        {roleTag}
                      </span>
                    </div>

                    <h3 className="font-black text-base sm:text-lg text-zinc-900 group-hover:text-zinc-700 transition-colors line-clamp-1 leading-snug">
                      {a.title}
                    </h3>
                    <p className="text-xs text-zinc-500 line-clamp-2 mt-1 leading-relaxed">
                      {a.description}
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    {/* Status notification banner */}
                    {a.status === 'DISPUTED' ? (
                      <div className="flex items-center space-x-1.5 text-xs text-red-700 bg-red-50 px-3 py-1.5 rounded-xl font-medium">
                        <Scale className="w-3.5 h-3.5 shrink-0 text-red-600" />
                        <span className="truncate">มีข้อพิพาทรอคำตัดสินชี้ขาดจากคนกลาง</span>
                      </div>
                    ) : hasSubmitted ? (
                      <div className="flex items-center space-x-1.5 text-xs text-zinc-700 bg-[#f5f5f7] px-3 py-1.5 rounded-xl font-medium">
                        <Clock className="w-3.5 h-3.5 shrink-0 text-zinc-900" />
                        <span className="truncate">มีงวดงานส่งมอบแล้ว (Anti-Ghosting 5 วัน)</span>
                      </div>
                    ) : hasRevision ? (
                      <div className="flex items-center space-x-1.5 text-xs text-zinc-700 bg-[#f5f5f7] px-3 py-1.5 rounded-xl font-medium">
                        <FileText className="w-3.5 h-3.5 shrink-0 text-zinc-600" />
                        <span className="truncate">มีคำขอปรับแก้ขอบเขตงานรอการตอบรับ</span>
                      </div>
                    ) : null}

                    <div className="space-y-2 pt-2 border-t border-black/[0.04]">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-500">งบ Escrow: <strong className="text-zinc-900">${a.totalEscrow.toLocaleString()} USDT</strong></span>
                        <span className="font-bold text-zinc-800">{completedCount}/{a.milestones.length} งวด ({progress}% ปลดล็อก)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#f5f5f7] overflow-hidden">
                        <div
                          className="h-full bg-zinc-900 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-xs text-zinc-500">
                      <span className="truncate font-medium">
                        คู่สัญญา: <strong className="text-zinc-800 font-normal">{counterpartyName}</strong>
                      </span>
                      <span className="font-black text-zinc-900 flex items-center space-x-1 group-hover:translate-x-1.5 transition-transform duration-300">
                        <span>เปิดดูรายละเอียด & ตรวจรับ</span>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-900" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* DETAIL ROOM VIEW: เมื่อคลิกดูในการ์ดสัญญาแล้ว */
        <>
          {/* Detail View Top Bar: Back to Cards + Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200/80">
            <button
              type="button"
              onClick={() => {
                setSelectedDetailAgreementId(null);
                onSelectDetailAgreementId?.(null);
              }}
              className="inline-flex items-center space-x-2 text-xs font-bold text-zinc-700 hover:text-zinc-900 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-200 shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← กลับสู่รายการสัญญาของฉัน</span>
            </button>

            {myAgreements.length > 1 && (
              <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
                <span className="text-zinc-400 text-[11px] shrink-0 font-medium">สลับสัญญา:</span>
                {myAgreements.map(a => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      setSelectedAgreementId(a.id);
                      setSelectedDetailAgreementId(a.id);
                      onSelectDetailAgreementId?.(a.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-mono text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                      selectedAgreement.id === a.id
                        ? 'bg-zinc-900 text-white'
                        : 'bg-white text-zinc-600 hover:bg-zinc-200/80 border border-zinc-200'
                    }`}
                  >
                    {a.id}
                  </button>
                ))}
              </div>
            )}
          </div>

      {/* 3. Smart Agreement & Escrow Custody Master Card */}
      <div className="bg-white border-0 rounded-[24px] p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] space-y-6 text-zinc-900 animate-card-in">
        
        {/* Header & Meta */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-zinc-100 pb-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-[#f5f5f7] text-zinc-900">
                {selectedAgreement.id}
              </span>
              <span className="font-mono text-[11px] text-zinc-500 flex items-center space-x-1">
                <Lock className="w-3 h-3 text-zinc-400" />
                <span>Vault จำลอง: {selectedAgreement.contractAddress.slice(0, 10)}...{selectedAgreement.contractAddress.slice(-6)}</span>
              </span>
              
              {/* Status Badge */}
              {selectedAgreement.status === 'COMPLETED' && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#f5f5f7] text-zinc-900">
                  ปิดสัญญาสมบูรณ์ (COMPLETED)
                </span>
              )}
              {selectedAgreement.status === 'IN_PROGRESS' && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#f5f5f7] text-zinc-800">
                  กำลังดำเนินงาน (IN PROGRESS)
                </span>
              )}
              {selectedAgreement.status === 'ACTIVE_ESCROW' && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#f5f5f7] text-zinc-800">
                  เงินล็อกใน Escrow พร้อมเริ่มงาน
                </span>
              )}
              {selectedAgreement.status === 'DISPUTED' && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-800">
                  อยู่ระหว่างระงับข้อพิพาท (DISPUTED)
                </span>
              )}
              {selectedAgreement.status === 'SETTLED' && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#f5f5f7] text-zinc-800">
                  คนกลางตัดสินแล้ว (SETTLED)
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
              {selectedAgreement.title}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed max-w-3xl">
              {selectedAgreement.description}
            </p>
          </div>

          {/* Quick CTAs */}
          <div className="flex items-center space-x-2 shrink-0">
            {isCurrentClient && (
              <button
                onClick={() => setIsTipModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#f5f5f7] hover:bg-zinc-200/80 text-zinc-800 text-xs font-semibold transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <Coins className="w-3.5 h-3.5 text-zinc-600" />
                <span>ให้โบนัสจำลอง {selectedAgreement.tipTotal > 0 && `(+$${selectedAgreement.tipTotal})`}</span>
              </button>
            )}
            <button
              onClick={onOpenSolidity}
              className="px-3.5 py-2 rounded-xl bg-[#f5f5f7] hover:bg-zinc-200/80 text-zinc-800 text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              ดู Solidity Code
            </button>
          </div>
        </div>

        {/* The 3 Contracting Parties & Escrow Vault Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          
          {/* Party A: Client */}
          <div className="p-3.5 rounded-2xl bg-[#f5f5f7] space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              <span>Party A (ผู้ว่าจ้าง)</span>
              <span className="text-[10px] text-zinc-800 font-bold">ยืนยันในเดโม</span>
            </div>
            <div className="flex items-center space-x-2">
              <img
                src={client?.avatar}
                alt={client?.name}
                className="w-7 h-7 rounded-full object-cover"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-zinc-900 truncate">{client?.name}</div>
                <div className="text-[10px] font-mono text-zinc-500 truncate">{client?.address}</div>
              </div>
            </div>
          </div>

          {/* Party B: Contractor */}
          <div className="p-3.5 rounded-2xl bg-[#f5f5f7] space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              <span>Party B (ผู้รับจ้าง)</span>
              <span className="text-[10px] text-zinc-800 font-bold">ยืนยันในเดโม</span>
            </div>
            <div className="flex items-center space-x-2">
              <img
                src={contractor?.avatar}
                alt={contractor?.name}
                className="w-7 h-7 rounded-full object-cover"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-zinc-900 truncate">{selectedAgreement.contractorName || contractor?.name}</div>
                <div className="text-[10px] font-mono text-zinc-500 truncate">{selectedAgreement.contractorAddress}</div>
              </div>
            </div>
          </div>

          {/* Party C: Arbitrator */}
          <div className="p-3.5 rounded-2xl bg-[#f5f5f7] space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              <span>Arbitrator (คนกลาง)</span>
              <Scale className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <div className="flex items-center space-x-2">
              <img
                src={arbitrator?.avatar}
                alt={arbitrator?.name}
                className="w-7 h-7 rounded-full object-cover"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-zinc-900 truncate">{arbitrator?.name}</div>
                <div className="text-[10px] font-mono text-zinc-500 truncate">{arbitrator?.address}</div>
              </div>
            </div>
          </div>

          {/* Escrow Financial Vault */}
          <div className="p-3.5 rounded-2xl bg-[#f5f5f7] text-zinc-900 space-y-1">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
              <span>Escrow จำลอง</span>
              <Lock className="w-3 h-3 text-zinc-500" />
            </div>
            <div className="text-base font-black font-mono text-zinc-900">
              ${totalAmount.toLocaleString()} USDT
            </div>
            <div className="text-[10px] text-zinc-500 flex items-center justify-between font-mono">
              <span>จ่ายแล้ว: ${completedAmount.toLocaleString()}</span>
              <span>ในตู้: ${remainingInVault.toLocaleString()}</span>
            </div>
          </div>

        </div>

        {/* Milestone Fulfillment Progress */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-600">
              สถานะการส่งมอบและการปลดล็อกเงินตามงวด
            </span>
            <span className="font-mono font-bold text-zinc-900">
              {completedMilestones.length}/{selectedAgreement.milestones.length} งวด (${completedAmount.toLocaleString()} / ${totalAmount.toLocaleString()} USDT) • {progressPercent}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#f5f5f7] overflow-hidden">
            <div
              className="h-full bg-zinc-900 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

      </div>

      {/* 4. Milestones & Supervision Timeline */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm sm:text-base font-black text-zinc-900 tracking-tight">
              งวดงานตามสัญญา (Milestones Supervision)
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-bold">
              {selectedAgreement.milestones.length} งวด
            </span>
          </div>
          <span className="text-xs text-zinc-500 font-medium">
            ระยะเวลาตรวจรับ Auto-Approve: <strong className="text-zinc-900 font-mono">{selectedAgreement.autoApproveDays} วัน</strong>
          </span>
        </div>

        {/* Milestone Cards List */}
        <div className="space-y-4">
          {selectedAgreement.milestones.map((milestone, index) => {
            const isApproved = milestone.status === 'APPROVED';
            const isSubmitted = milestone.status === 'SUBMITTED';
            const isPending = milestone.status === 'PENDING';
            const isRevision = milestone.status === 'REVISION_REQUESTED';
            const isDisputed = milestone.status === 'DISPUTED';

            // Clean title: remove redundant "งวดที่ X:" prefix if already present in string
            const cleanTitle = milestone.title.replace(/^งวดที่\s*\d+[:\s]*/i, '').trim();

            return (
              <div 
                key={milestone.id} 
                style={{ animationDelay: `${index * 80}ms` }}
                className="bg-white text-zinc-900 rounded-[24px] p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_-6px_rgba(0,0,0,0.12)] border-0 transition-all duration-300 ease-out hover:-translate-y-1.5 space-y-5 animate-card-in"
              >
                {/* 1. Milestone Header & Financial Info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-zinc-100 pb-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-900 text-white font-mono text-xs font-black shrink-0 tracking-wide">
                        งวดที่ {index + 1}
                      </span>

                      <h3 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight">
                        {cleanTitle}
                      </h3>
                      
                      {/* Status Badges - Apple Monochrome / Muted */}
                      {isApproved && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f5f5f7] text-zinc-800 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-zinc-900" />
                          <span>ตรวจรับผ่านแล้ว (ปล่อยเงินจำลองแล้ว)</span>
                        </span>
                      )}
                      {isSubmitted && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-900 text-white flex items-center space-x-1 shadow-xs">
                          <Clock className="w-3.5 h-3.5 animate-spin text-white" />
                          <span>รอตรวจรับ (Review Window Active)</span>
                        </span>
                      )}
                      {isRevision && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800">
                          ส่งกลับให้แก้ไขงาน
                        </span>
                      )}
                      {isDisputed && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                          <span>มีข้อพิพาท (รอคนกลางตัดสิน)</span>
                        </span>
                      )}
                      {isPending && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#f5f5f7] text-zinc-500">
                          รอดำเนินการส่งมอบ
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0 bg-[#f5f5f7] sm:bg-transparent p-3 sm:p-0 rounded-2xl">
                    <span className="text-lg sm:text-xl font-black font-mono text-zinc-900 block">
                      ${milestone.amount.toLocaleString()} USDT
                    </span>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 sm:gap-0.5 mt-0.5">
                      {milestone.dueDate && (
                        <span className="text-[11px] font-mono text-zinc-500 flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          <span>กำหนดส่ง: <strong className="text-zinc-800">{milestone.dueDate}</strong></span>
                        </span>
                      )}
                      <span className="text-[11px] text-zinc-500 font-mono">
                        โควตาขอแก้: {milestone.revisionQuota - milestone.revisionsUsed}/{milestone.revisionQuota} ครั้ง
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Submission Proof details */}
                {milestone.submissionProof && (
                  <div className="p-4 rounded-2xl bg-[#f5f5f7] text-xs space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-zinc-200/50 pb-2">
                      <span className="font-bold text-zinc-900 flex items-center space-x-1.5 font-sans">
                        <FileCheck2 className="w-3.5 h-3.5 text-zinc-500" />
                        <span>หลักฐานการส่งมอบงาน (Proof of Delivery)</span>
                      </span>
                      {milestone.submissionProof.fileHash && (
                        <span className="text-zinc-500 font-mono text-[10px] truncate max-w-sm">
                          Hash: {milestone.submissionProof.fileHash}
                        </span>
                      )}
                    </div>
                    
                    {milestone.submissionProof.deliverableUrl && (
                      <div className="flex items-center space-x-2 pt-0.5">
                        <span className="text-zinc-500 font-medium text-[11px]">ลิงก์ผลงาน:</span>
                        <a
                          href={milestone.submissionProof.deliverableUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-zinc-900 font-mono font-bold underline flex items-center space-x-1 hover:text-zinc-700 truncate"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0 text-zinc-500" />
                          <span className="truncate">{milestone.submissionProof.deliverableUrl}</span>
                        </a>
                      </div>
                    )}
                    
                    {milestone.submissionProof.note && (
                      <p className="text-zinc-700 italic bg-white p-2.5 rounded-xl shadow-xs">
                        "{milestone.submissionProof.note}"
                      </p>
                    )}
                  </div>
                )}

                {/* 3. Collaborative Revision details if present */}
                {isRevision && (
                  <div className="p-4 rounded-2xl bg-[#f5f5f7] text-xs space-y-3">
                    <div className="flex items-center justify-between text-zinc-900 font-bold border-b border-zinc-200/50 pb-2">
                      <div className="flex items-center space-x-1.5">
                        <RotateCcw className="w-4 h-4 text-zinc-500" />
                        <span>คำขอแก้ไขงาน: {milestone.revisionDetails?.category || 'ข้อกำหนดทั่วไป'}</span>
                      </div>
                      <span className="text-[10px] font-mono font-normal text-zinc-500">
                        {milestone.revisionDetails?.requestedAt
                          ? new Date(milestone.revisionDetails.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'กำลังพิจารณา'}
                      </span>
                    </div>

                    <div className="text-zinc-700 leading-relaxed bg-white p-3 rounded-xl shadow-xs">
                      <div className="text-[10px] text-zinc-500 font-semibold mb-0.5">สิ่งที่ผู้ว่าจ้างแจ้งให้ปรับปรุง:</div>
                      "{milestone.revisionDetails?.notes || milestone.submissionProof?.note || 'ปรับแก้องค์ประกอบตามที่ระบุ'}"
                    </div>

                    {/* Feasibility Note from Freelancer */}
                    {milestone.revisionDetails?.feasibilityExplanation && (
                      <div className="p-3 rounded-xl bg-white shadow-xs space-y-1">
                        <div className="text-zinc-900 font-bold flex items-center space-x-1 text-[11px]">
                          <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                          <span>คำชี้แจงความเป็นไปได้และข้อจำกัดทางเทคนิค (จากผู้รับจ้าง):</span>
                        </div>
                        <p className="text-zinc-600 italic text-[11px] leading-relaxed">
                          "{milestone.revisionDetails.feasibilityExplanation}"
                        </p>
                      </div>
                    )}

                    {/* Status & Actions */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-black/[0.04]">
                      <div className="text-[11px] text-zinc-500">
                        {(!milestone.revisionDetails || milestone.revisionDetails.status === 'PENDING_FREELANCER') && (
                          <span>💡 <strong className="text-zinc-800">รอผู้รับจ้างพิจารณา:</strong> สามารถเริ่มดำเนินการแก้ไข หรือกดส่งคำชี้แจงความเป็นไปได้หากเกินขอบเขตสัญญา</span>
                        )}
                        {milestone.revisionDetails?.status === 'EXPLAINED_BY_FREELANCER' && (
                          <span>💬 <strong className="text-zinc-800">ผู้รับจ้างส่งคำชี้แจงแล้ว:</strong> ผู้ว่าจ้างสามารถปรับปรุงคำขอใหม่ให้แฟร์ หรือส่งคนกลางไกล่เกลี่ย</span>
                        )}
                        {milestone.revisionDetails?.status === 'ACCEPTED' && (
                          <span>🛠️ <strong className="text-zinc-800">ผู้รับจ้างยอมรับแล้ว:</strong> อยู่ระหว่างการแก้ไขงานตามกรอบที่ตกลง</span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {/* Freelancer actions */}
                        {(!milestone.revisionDetails || milestone.revisionDetails.status === 'PENDING_FREELANCER') && isCurrentContractor && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMilestoneId(milestone.id);
                                setIsFeasibilityModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 font-bold border border-zinc-200 text-xs transition-colors flex items-center space-x-1 shadow-2xs cursor-pointer"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                              <span>ชี้แจงความเป็นไปได้</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => acceptRevision(selectedAgreement.id, milestone.id)}
                              className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs shadow-xs transition-colors cursor-pointer"
                            >
                              เริ่มดำเนินการแก้ไข
                            </button>
                          </>
                        )}

                        {/* Client actions if feasibility explained */}
                        {milestone.revisionDetails?.status === 'EXPLAINED_BY_FREELANCER' && isCurrentClient && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMilestoneId(milestone.id);
                                setAdjustedRevisionNote(milestone.revisionDetails?.notes || '');
                                setIsAdjustRevisionModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 font-bold border border-zinc-200 text-xs transition-colors cursor-pointer"
                            >
                              ปรับปรุงคำขอแก้ไขใหม่
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMilestoneId(milestone.id);
                                setDisputeReason(`ข้อพิพาทการแก้งานงวดที่ ${index + 1}: ผู้ว่าจ้างและผู้รับจ้างไม่สามารถตกลงขอบเขตงานที่ขอแก้ไขได้`);
                                setIsDisputeModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-red-50 text-red-700 font-bold border border-red-200 text-xs shadow-2xs transition-colors flex items-center space-x-1 cursor-pointer"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>ส่งให้คนกลางไกล่เกลี่ย</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Dispute details if present */}
                {milestone.disputeInfo && (
                  <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 text-xs space-y-1 text-red-950">
                    <div className="font-bold flex items-center space-x-1.5 text-red-900">
                      <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                      <span>ข้อพิพาทเปิดโดย: {milestone.disputeInfo.raisedBy}</span>
                    </div>
                    <p className="text-red-800">เหตุผล: "{milestone.disputeInfo.reason}"</p>
                    {milestone.disputeInfo.resolution && (
                      <div className="font-semibold text-red-950 pt-1 border-t border-red-200">
                        คำตัดสินของคนกลาง: {milestone.disputeInfo.resolution}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Action & Supervision Area */}
                <div className="space-y-3 pt-1">
                  
                  {/* Anti-Ghosting notice bar when submitted */}
                  {isSubmitted && (
                    <div className="p-3.5 rounded-2xl bg-[#f5f5f7] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center space-x-2 text-zinc-700">
                        <Clock className="w-4 h-4 text-zinc-900 shrink-0" />
                        <span>
                          <strong className="text-zinc-900">Anti-Ghosting Timer:</strong> เดโมให้เวลาผู้ว่าจ้างตรวจรับ 5 วัน เมื่อครบกำหนดผู้รับจ้างสามารถกดจำลองการตรวจรับอัตโนมัติและปล่อยเงินได้
                        </span>
                      </div>
                      <button
                        onClick={() => triggerAntiGhosting(selectedAgreement.id, milestone.id)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-50 text-zinc-700 text-[11px] font-mono font-medium border border-zinc-200 shadow-2xs transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
                        title="จำลองกรณีผู้ว่าจ้างเงียบหายเกิน 5 วัน"
                      >
                        🧪 จำลอง Auto-Approve (5 วัน)
                      </button>
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    
                    <div>
                      {isApproved ? (
                        <div className="flex items-center space-x-1.5 text-xs text-zinc-500 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-zinc-900" />
                          <span>งวดนี้ตรวจรับผ่านและปล่อยเงินจำลอง ${milestone.amount.toLocaleString()} USDT แล้ว</span>
                        </div>
                      ) : isSubmitted ? (
                        <span className="text-xs text-zinc-600 font-medium">
                          {isCurrentClient ? '👉 กรุณาตรวจสอบผลงานและโค้ดก่อนกดอนุมัติการปลดล็อกเงิน Escrow' : '👉 งานส่งมอบแล้ว อยู่ในระยะเวลาตรวจรับของผู้ว่าจ้าง'}
                        </span>
                      ) : isPending ? (
                        <span className="text-xs text-zinc-500">
                          {isCurrentContractor ? 'เมื่อดำเนินการเสร็จสิ้น ให้กดส่งมอบงานพร้อมหลักฐาน URL/Hash' : 'รอผู้รับจ้างดำเนินการส่งมอบผลงานตามกำหนด'}
                        </span>
                      ) : null}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                      
                      {/* Contractor Action: Submit Deliverable */}
                      {(isPending || (isRevision && (!milestone.revisionDetails || milestone.revisionDetails.status === 'ACCEPTED'))) && isCurrentContractor && (
                        <button
                          onClick={() => {
                            setActiveMilestoneId(milestone.id);
                            setIsSubmitModalOpen(true);
                          }}
                          className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black flex items-center space-x-2 shadow-md transition-all cursor-pointer"
                        >
                          <UploadCloud className="w-4 h-4" />
                          <span>{isRevision ? `ส่งมอบงานที่ปรับปรุงแล้ว (งวดที่ ${index + 1})` : `ส่งมอบงานงวดที่ ${index + 1}`}</span>
                        </button>
                      )}

                      {/* Client Actions when Submitted for Review */}
                      {isSubmitted && isCurrentClient && (
                        <>
                          <button
                            onClick={() => {
                              setActiveMilestoneId(milestone.id);
                              setIsDisputeModalOpen(true);
                            }}
                            className="px-3.5 py-2 rounded-xl text-zinc-500 hover:text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            เปิดข้อพิพาท
                          </button>
                          
                          <button
                            onClick={() => {
                              setActiveMilestoneId(milestone.id);
                              setIsRevisionModalOpen(true);
                            }}
                            disabled={milestone.revisionsUsed >= milestone.revisionQuota}
                            className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-bold border border-zinc-200 shadow-2xs disabled:opacity-40 transition-colors cursor-pointer"
                          >
                            ขอแก้ไข ({milestone.revisionQuota - milestone.revisionsUsed} เหลือ)
                          </button>

                          <button
                            onClick={() => {
                              executeWithWallet(() => {
                                approveMilestone(selectedAgreement.id, milestone.id);
                              });
                            }}
                            className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black flex items-center space-x-2 shadow-md transition-all cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>ตรวจรับ & ปล่อยเงินจำลอง (${milestone.amount.toLocaleString()} USDT)</span>
                          </button>
                        </>
                      )}

                      {/* If submitted and user is Contractor */}
                      {isSubmitted && !isCurrentClient && (
                        <span className="text-xs font-mono font-medium px-3 py-1.5 rounded-lg bg-[#f5f5f7] text-zinc-700">
                          รอการอนุมัติจากผู้ว่าจ้าง
                        </span>
                      )}

                      {/* Arbitrator Settlement controls */}
                      {isDisputed && isCurrentArbitrator && (
                        <button
                          onClick={() => {
                            setActiveMilestoneId(milestone.id);
                            setIsArbitrationModalOpen(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
                        >
                          <Scale className="w-4 h-4" />
                          <span>วินิจฉัยตัดสินข้อพิพาท (Arbitrate)</span>
                        </button>
                      )}

                      {/* Client Tip Button if Approved */}
                      {isApproved && isCurrentClient && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMilestoneId(milestone.id);
                            setIsTipModalOpen(true);
                          }}
                          className="text-xs font-semibold text-zinc-300 hover:text-white underline cursor-pointer ml-2"
                        >
                          + ให้ทิปพิเศษ
                        </button>
                      )}

                    </div>

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Work Submission Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-zinc-900">
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                ส่งมอบผลงานตามสัญญา (Deliverable Submission)
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                แนบหลักฐาน Deliverable URL หรือ IPFS Hash เข้าสู่ Smart Contract เพื่อเริ่มนับเวลาตรวจรับ 5 วัน
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-700 font-semibold block mb-1">
                  Deliverable URL (GitHub / Demo / Cloud Storage)
                </label>
                <input
                  type="text"
                  value={submitUrl}
                  onChange={(e) => setSubmitUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-zinc-300 text-zinc-900 font-mono text-xs focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="text-zinc-700 font-semibold block mb-1">
                  IPFS / File SHA-256 Hash
                </label>
                <input
                  type="text"
                  value={submitHash}
                  onChange={(e) => setSubmitHash(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-zinc-300 text-zinc-900 font-mono text-xs focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="text-zinc-700 font-semibold block mb-1">
                  บันทึกข้อความส่งมอบถึงผู้ว่าจ้าง
                </label>
                <textarea
                  rows={2}
                  value={submitNote}
                  onChange={(e) => setSubmitNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-zinc-300 text-zinc-900 text-xs focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-100">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  submitMilestone(selectedAgreement.id, activeMilestoneId, {
                    deliverableUrl: submitUrl,
                    fileHash: submitHash,
                    note: submitNote
                  });
                  setIsSubmitModalOpen(false);
                }}
                className="px-5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm"
              >
                ยืนยันการส่งมอบงาน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Revision Request Modal */}
      {isRevisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-zinc-900">
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                ส่งคำขอแก้ไขงาน (Request Revision)
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                การขอแก้ไขจะหยุดเวลานับถอยหลังตรวจรับชั่วคราว และหักโควตาขอแก้ 1 ครั้ง
              </p>
            </div>

            <div className="text-xs space-y-1">
              <label className="text-zinc-700 font-semibold block">ประเภทการขอแก้ไข</label>
              <select
                value={revisionCategory}
                onChange={(e) => setRevisionCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-zinc-300 text-zinc-900 text-xs focus:outline-none focus:border-zinc-500"
              >
                <option value="ปรับแต่ง UI และความสวยงาม (Minor Polish)">ปรับแต่ง UI และความสวยงาม (Minor Polish)</option>
                <option value="แก้ไข Bug และจุดบกพร่อง (Bug Fix)">แก้ไข Bug และจุดบกพร่อง (Bug Fix)</option>
                <option value="ปรับปรุงตามข้อกำหนดในสัญญาเดิม (Deviation from Spec)">ปรับปรุงตามข้อกำหนดในสัญญาเดิม (Deviation from Spec)</option>
                <option value="ปรับปรุงข้อความและเอกสาร (Documentation & Copy)">ปรับปรุงข้อความและเอกสาร (Documentation & Copy)</option>
              </select>
            </div>

            <div className="text-xs space-y-1">
              <label className="text-zinc-700 font-semibold block">ระบุรายละเอียดจุดที่ต้องการให้ปรับปรุง</label>
              <textarea
                rows={3}
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                placeholder="ระบุข้อกำหนดเฉพาะเจาะจงที่อยู่ในขอบเขตสัญญา..."
                className="w-full px-3 py-2 rounded-lg bg-white border border-zinc-300 text-zinc-900 text-xs focus:outline-none focus:border-zinc-500"
              />
            </div>

            {/* Scope Creep Prevention Disclaimer */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed space-y-1">
              <div className="font-bold flex items-center space-x-1">
                <span>⚖️ กรอบความคุ้มครองคู่สัญญา:</span>
              </div>
              <p className="text-amber-800">
                การขอแก้ไขต้องอยู่ภายใต้ขอบเขตเดิมที่ตกลงกันไว้ในสัญญา หากคำขอเกินขอบเขตหรือสั่งรื้อโครงสร้างระบบ ผู้รับจ้างมีสิทธิ์ส่งคำชี้แจงความเป็นไปได้กลับมา หรือส่งให้คนกลางไกล่เกลี่ย
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-100">
              <button
                onClick={() => setIsRevisionModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  requestRevision(selectedAgreement.id, activeMilestoneId, revisionNote, revisionCategory);
                  setIsRevisionModalOpen(false);
                }}
                className="px-5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm cursor-pointer"
              >
                ส่งคำขอแก้ไขงาน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Dispute Raising Modal */}
      {isDisputeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-zinc-900">
            <div>
              <h3 className="text-base font-bold text-red-900 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>เปิดข้อพิพาทต่อคนกลาง (Raise Dispute)</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                เงินงวดนี้จะถูกอายัดไว้ใน Escrow Vault จนกว่าคนกลาง (Arbitrator) จะไกล่เกลี่ยและมีคำตัดสิน
              </p>
            </div>

            <div className="text-xs space-y-1">
              <label className="text-zinc-700 font-semibold block">สาเหตุของข้อพิพาท</label>
              <textarea
                rows={3}
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-zinc-300 text-zinc-900 text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-100">
              <button
                onClick={() => setIsDisputeModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  raiseDispute(selectedAgreement.id, activeMilestoneId, disputeReason);
                  setIsDisputeModalOpen(false);
                }}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm"
              >
                ยืนยันเปิดข้อพิพาท
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Arbitrator Settlement Modal */}
      {isArbitrationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-zinc-900">
            <div>
              <h3 className="text-base font-bold text-zinc-900 flex items-center space-x-2">
                <Scale className="w-5 h-5 text-zinc-800" />
                <span>คำตัดสินข้อพิพาทโดยคนกลาง (Arbitration Ruling)</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                ในฐานะผู้ไกล่เกลี่ยคนกลาง โปรดเลือกแนวทางตัดสินสำหรับงวดงานที่มีข้อพิพาท
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                onClick={() => {
                  resolveDispute(selectedAgreement.id, activeMilestoneId, 'RELEASE_TO_CONTRACTOR');
                  setIsArbitrationModalOpen(false);
                }}
                className="w-full p-3.5 rounded-xl border border-zinc-200 hover:border-zinc-400 bg-zinc-50 hover:bg-zinc-100 text-left transition-colors space-y-1"
              >
                <div className="font-bold text-xs text-zinc-900">
                  1. ตัดสินให้ "ผู้รับจ้าง" (Release to Contractor)
                </div>
                <p className="text-[11px] text-zinc-500">
                  ผลงานตรงตามขอบเขต ปล่อยยอด Escrow จำลองให้ผู้รับจ้าง
                </p>
              </button>

              <button
                onClick={() => {
                  resolveDispute(selectedAgreement.id, activeMilestoneId, 'REFUND_TO_CLIENT');
                  setIsArbitrationModalOpen(false);
                }}
                className="w-full p-3.5 rounded-xl border border-zinc-200 hover:border-zinc-400 bg-zinc-50 hover:bg-zinc-100 text-left transition-colors space-y-1"
              >
                <div className="font-bold text-xs text-zinc-900">
                  2. ตัดสินให้ "ผู้ว่าจ้าง" (Refund to Client)
                </div>
                <p className="text-[11px] text-zinc-500">
                  ผลงานไม่เป็นไปตามข้อตกลง คืนยอด Escrow จำลองให้ผู้ว่าจ้าง
                </p>
              </button>
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-100">
              <button
                onClick={() => setIsArbitrationModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-medium"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Demo tip modal */}
      {isTipModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-xs w-full p-5 space-y-4 shadow-2xl text-zinc-900">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-zinc-800" />
                <span>ให้โบนัสจำลอง (Demo Tip)</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                เพิ่มยอด USDT จำลองให้ผู้รับจ้าง ไม่มีการโอนเหรียญขึ้นเชน
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[20, 50, 100].map(amt => (
                <button
                  key={amt}
                  onClick={() => setTipAmount(amt)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                    tipAmount === amt 
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm' 
                      : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  +${amt}
                </button>
              ))}
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-100">
              <button
                onClick={() => setIsTipModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs"
              >
                ปิด
              </button>
              <button
                onClick={() => {
                  executeWithWallet(() => {
                    tipContractor(selectedAgreement.id, tipAmount);
                    setIsTipModalOpen(false);
                  });
                }}
                className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm cursor-pointer"
              >
                ให้โบนัสจำลอง ${tipAmount}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Feasibility Explanation Modal (Freelancer -> Client) */}
      {isFeasibilityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-zinc-900">
            <div>
              <h3 className="text-base font-bold text-blue-900 flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <span>ชี้แจงความเป็นไปได้และข้อจำกัดทางเทคนิค</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                หากคำขอแก้ไขของคู่สัญญามีความซับซ้อนเกินกรอบเดิม หรือมีข้อจำกัดทางเทคนิค สามารถชี้แจงเหตุผลและเสนอแนวทางแก้ไขที่ทำได้จริงให้ผู้ว่าจ้างพิจารณา
              </p>
            </div>

            <div className="text-xs space-y-1">
              <label className="text-zinc-700 font-semibold block">คำชี้แจงและเหตุผลสำหรับผู้ว่าจ้าง</label>
              <textarea
                rows={4}
                value={feasibilityText}
                onChange={(e) => setFeasibilityText(e.target.value)}
                placeholder="ระบุข้อจำกัด เหตุผลทางสถาปัตยกรรมระบบ หรือเสนอทางเลือกที่สามารถทำได้..."
                className="w-full px-3 py-2 rounded-lg bg-white border border-zinc-300 text-zinc-900 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-[11px] text-blue-900 leading-relaxed">
              💡 <strong>ข้อแนะนำ:</strong> การอธิบายเหตุผลอย่างมืออาชีพช่วยรักษาความเข้าใจอันดี โดยผู้ว่าจ้างสามารถปรับลดคำขอลง หรือส่งให้คนกลางช่วยไกล่เกลี่ยได้
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-100">
              <button
                onClick={() => setIsFeasibilityModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  explainFeasibility(selectedAgreement.id, activeMilestoneId, feasibilityText);
                  setIsFeasibilityModalOpen(false);
                }}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm cursor-pointer"
              >
                ส่งคำชี้แจงให้ผู้ว่าจ้าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. Adjust Revision Scope Modal (Client Reconsideration) */}
      {isAdjustRevisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-zinc-900">
            <div>
              <h3 className="text-base font-bold text-zinc-900 flex items-center space-x-2">
                <RotateCcw className="w-5 h-5 text-zinc-700" />
                <span>ปรับปรุงคำขอแก้ไขงาน (Adjust Revision Scope)</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                ปรับลดความต้องการลงมาให้สอดคล้องกับข้อตกลงและคำชี้แจงของผู้รับจ้าง เพื่อให้งานดำเนินต่อไปได้
              </p>
            </div>

            <div className="text-xs space-y-1">
              <label className="text-zinc-700 font-semibold block">ข้อกำหนดใหม่ที่ปรับลดลงแล้ว</label>
              <textarea
                rows={3}
                value={adjustedRevisionNote}
                onChange={(e) => setAdjustedRevisionNote(e.target.value)}
                placeholder="เช่น โอเค เข้าใจข้อจำกัดแล้ว งั้นขอปรับแค่สีและข้อความในหน้า UI ก็พอ..."
                className="w-full px-3 py-2 rounded-lg bg-white border border-zinc-300 text-zinc-900 text-xs focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-100">
              <button
                onClick={() => setIsAdjustRevisionModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  acceptFeasibilityOrReRevise(selectedAgreement.id, activeMilestoneId, adjustedRevisionNote);
                  setIsAdjustRevisionModalOpen(false);
                }}
                className="px-5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm cursor-pointer"
              >
                บันทึกและส่งให้ผู้รับจ้าง
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}

    </div>
  );
};
