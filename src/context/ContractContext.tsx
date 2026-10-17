import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useMetaMaskWallet } from '../hooks/useMetaMaskWallet';
import { BNB_TESTNET } from '../lib/metamask';
import {
  UserPersona,
  SmartAgreement,
  TransactionLog
} from '../types';
import {
  INITIAL_PERSONAS,
  INITIAL_AGREEMENTS,
  INITIAL_TRANSACTIONS
} from '../data/initialData';

interface ContractContextType {
  personas: UserPersona[];
  activePersona: UserPersona;
  currentUser: UserPersona;
  isAuthenticated: boolean;
  setActivePersonaId: (id: string) => void;
  login: (identifier: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  registerUser: (data: {
    username: string;
    name: string;
    email: string;
    password: string;
    role: 'CLIENT' | 'CONTRACTOR' | 'ARBITRATOR';
  }) => { success: boolean; message?: string };
  faucet: (amountUSDT?: number) => void;

  // Live MetaMask session; persisted persona addresses alone never prove connection.
  connectMetaMask: () => Promise<{ success: boolean; address?: string; error?: string }>;
  unbindWallet: () => void;
  walletAddress: string | null;
  walletChainId: string | null;
  walletBalanceBNB: string | null;
  walletBalanceError: string | null;
  walletError: string | null;
  isMetaMaskAvailable: boolean;
  isWalletConnected: boolean;
  isWalletConnecting: boolean;
  isWalletRefreshing: boolean;
  refreshWallet: () => Promise<void>;
  isMetaMaskModalOpen: boolean;
  setIsMetaMaskModalOpen: (open: boolean) => void;
  executeWithWallet: (action: () => void) => Promise<void>;

  agreements: SmartAgreement[];
  freelanceContracts: SmartAgreement[]; // alias
  createAgreement: (data: Partial<SmartAgreement>) => string;
  createFreelanceContract: (data: Partial<SmartAgreement>) => string; // alias
  submitMilestone: (agreementId: string, milestoneId: string, proof: { deliverableUrl?: string; fileHash?: string; note?: string }) => void;
  approveMilestone: (agreementId: string, milestoneId: string) => void;
  requestRevision: (agreementId: string, milestoneId: string, note?: string, category?: string) => void;
  explainFeasibility: (agreementId: string, milestoneId: string, explanation: string) => void;
  acceptFeasibilityOrReRevise: (agreementId: string, milestoneId: string, adjustedNote: string) => void;
  acceptRevision: (agreementId: string, milestoneId: string) => void;
  triggerAntiGhosting: (agreementId: string, milestoneId: string) => void;
  raiseDispute: (agreementId: string, milestoneId: string, reason: string) => void;
  resolveDispute: (agreementId: string, milestoneId: string, decision: 'RELEASE_TO_CONTRACTOR' | 'REFUND_TO_CLIENT') => void;
  tipContractor: (agreementId: string, amount: number) => void;
  tipFreelancer: (agreementId: string, amount: number) => void; // alias

  transactions: TransactionLog[];
  timeOffsetHours: number;
  advanceTime: (hours: number) => void;
  resetAllData: () => void;
  notification: string | null;
  setNotification: (msg: string | null) => void;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [personas, setPersonas] = useState<UserPersona[]>(() => {
    const saved = localStorage.getItem('smart_agreements_personas_v2');
    const stored: UserPersona[] = saved ? JSON.parse(saved) : INITIAL_PERSONAS;
    // Previous releases allowed manually entered or simulated addresses to appear bound.
    return stored.map(persona => ({
      ...persona,
      isWalletBound: persona.walletBindingSource === 'metamask' && persona.isWalletBound
    }));
  });

  const [activePersonaId, setActivePersonaId] = useState<string>(() => {
    return localStorage.getItem('smart_agreements_active_user_v2') || 'user_somchai';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const authSaved = localStorage.getItem('smart_agreements_auth_status');
    return authSaved ? JSON.parse(authSaved) : true;
  });

  const wallet = useMetaMaskWallet();
  const [isMetaMaskModalOpen, setMetaMaskModalOpen] = useState<boolean>(false);
  const [walletActionRequested, setWalletActionRequested] = useState(false);
  const connectionRequest = useRef(0);
  const walletActionInFlight = useRef(false);

  const [agreements, setAgreements] = useState<SmartAgreement[]>(() => {
    const saved = localStorage.getItem('smart_agreements_list_v2');
    return saved ? JSON.parse(saved) : INITIAL_AGREEMENTS;
  });

  const [transactions, setTransactions] = useState<TransactionLog[]>(() => {
    const saved = localStorage.getItem('smart_agreements_txs_v2');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [timeOffsetHours, setTimeOffsetHours] = useState<number>(0);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('smart_agreements_personas_v2', JSON.stringify(personas));
  }, [personas]);

  useEffect(() => {
    localStorage.setItem('smart_agreements_active_user_v2', activePersonaId);
  }, [activePersonaId]);

  useEffect(() => {
    localStorage.setItem('smart_agreements_list_v2', JSON.stringify(agreements));
  }, [agreements]);

  useEffect(() => {
    localStorage.setItem('smart_agreements_txs_v2', JSON.stringify(transactions));
  }, [transactions]);

  const activePersona = personas.find(p => p.id === activePersonaId) || personas[0];
  const currentUser = activePersona;
  const sessionOwner = useRef({ persona: activePersona, isAuthenticated });
  sessionOwner.current = { persona: activePersona, isAuthenticated };
  const isWalletConnected = isAuthenticated && activePersona.isWalletBound &&
    activePersona.walletBindingSource === 'metamask' && wallet.isConnected &&
    wallet.address?.toLowerCase() === activePersona.address.toLowerCase();

  const setIsMetaMaskModalOpen = (open: boolean) => {
    if (!open) {
      connectionRequest.current += 1;
      setWalletActionRequested(false);
    }
    setMetaMaskModalOpen(open);
  };

  useEffect(() => {
    connectionRequest.current += 1;
    setWalletActionRequested(false);
    setMetaMaskModalOpen(false);
  }, [activePersonaId, isAuthenticated]);

  const login = (identifier: string, password: string): { success: boolean; message?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const target = personas.find(
      p => p.username.toLowerCase() === cleanId || p.email.toLowerCase() === cleanId
    );

    if (!target) {
      return { success: false, message: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบชื่อผู้ใช้หรืออีเมล' };
    }

    if (target.password && target.password !== password) {
      return { success: false, message: 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านอีกครั้ง' };
    }

    setActivePersonaId(target.id);
    setIsAuthenticated(true);
    localStorage.setItem('smart_agreements_auth_status', 'true');
    showToast(`เข้าสู่ระบบสำเร็จ ยินดีต้อนรับคุณ ${target.name}`);
    return { success: true };
  };

  const logout = () => {
    connectionRequest.current += 1;
    wallet.disconnect();
    setIsMetaMaskModalOpen(false);
    setIsAuthenticated(false);
    localStorage.setItem('smart_agreements_auth_status', 'false');
    showToast('ออกจากระบบเรียบร้อย');
  };

  const registerUser = (data: {
    username: string;
    name: string;
    email: string;
    password: string;
    role: 'CLIENT' | 'CONTRACTOR' | 'ARBITRATOR';
  }): { success: boolean; message?: string } => {
    const cleanUser = data.username.trim().toLowerCase();
    const cleanEmail = data.email.trim().toLowerCase();

    if (personas.some(p => p.username.toLowerCase() === cleanUser)) {
      return { success: false, message: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาเลือกชื่ออื่น' };
    }
    if (personas.some(p => p.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'อีเมลนี้ถูกลงทะเบียนไว้แล้ว' };
    }

    const newPersona: UserPersona = {
      id: `user_${Date.now()}`,
      username: cleanUser,
      name: data.name.trim(),
      email: cleanEmail,
      password: data.password,
      roleTitle:
        data.role === 'CLIENT'
          ? 'ผู้ว่าจ้าง (Party A - Client)'
          : data.role === 'CONTRACTOR'
            ? 'ผู้รับจ้าง (Party B - Contractor)'
            : 'คนกลางระงับข้อพิพาท (Party C - Arbitrator)',
      role: data.role,
      avatar:
        data.role === 'CLIENT'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          : data.role === 'CONTRACTOR'
            ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      address: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      isWalletBound: false,
      balanceUSDT: 2500
    };

    setPersonas(prev => [...prev, newPersona]);
    setActivePersonaId(newPersona.id);
    setIsAuthenticated(true);
    localStorage.setItem('smart_agreements_auth_status', 'true');
    showToast(`ลงทะเบียนและเข้าสู่ระบบสำเร็จ ยินดีต้อนรับ ${newPersona.name}`);
    return { success: true };
  };

  const connectMetaMask = async (): Promise<{ success: boolean; address?: string; error?: string }> => {
    if (!isAuthenticated) return { success: false, error: 'LOGIN_REQUIRED' };
    const owner = activePersona;
    const requestId = ++connectionRequest.current;
    const result = await wallet.connect();
    if (requestId !== connectionRequest.current || !sessionOwner.current.isAuthenticated ||
      sessionOwner.current.persona.id !== owner.id) {
      return { success: false, error: 'CONNECTION_CANCELLED' };
    }
    if (!result.success || !result.address) return result;

    const walletAddress = result.address;
    setPersonas(prev => prev.map(persona => persona.id === owner.id
      ? { ...persona, address: walletAddress, isWalletBound: true, walletBindingSource: 'metamask' }
      : persona));
    showToast(`เชื่อม MetaMask กับ BNB Testnet และบันทึก Address ให้ @${owner.username} แล้ว${walletActionRequested ? ' กรุณากดรายการที่ต้องการอีกครั้ง' : ''}`);
    setWalletActionRequested(false);
    setMetaMaskModalOpen(false);
    return result;
  };

  const unbindWallet = () => {
    connectionRequest.current += 1;
    wallet.disconnect();
    setWalletActionRequested(false);
    setPersonas(prev =>
      prev.map(p => {
        if (p.id === activePersona.id) {
          return { ...p, isWalletBound: false, walletBindingSource: undefined };
        }
        return p;
      })
    );
    showToast(`ยกเลิกการผูกกระเป๋าสำหรับบัญชี ${activePersona.name} แล้ว`);
  };

  const refreshWallet = async () => {
    await wallet.refresh();
  };

  const executeWithWallet = async (action: () => void) => {
    if (!isAuthenticated) {
      showToast('กรุณาเข้าสู่ระบบก่อนเชื่อมกระเป๋า');
      return;
    }
    if (!isWalletConnected) {
      setWalletActionRequested(true);
      setMetaMaskModalOpen(true);
      return;
    }

    const owner = activePersona;
    const requestId = connectionRequest.current;
    if (walletActionInFlight.current) return;
    walletActionInFlight.current = true;
    try {
      // Recheck without prompting: an event or cached binding must not authorize a stale account.
      const live = await wallet.readSession();
      const current = sessionOwner.current;
      if (!current.isAuthenticated || current.persona.id !== owner.id ||
        requestId !== connectionRequest.current) return;
      if (live.chainId !== BNB_TESTNET.chainId || !live.address ||
        live.address.toLowerCase() !== current.persona.address.toLowerCase() ||
        !current.persona.isWalletBound) {
        setWalletActionRequested(true);
        setMetaMaskModalOpen(true);
        showToast('บัญชีหรือเครือข่าย MetaMask เปลี่ยน กรุณาเชื่อม BNB Testnet อีกครั้ง');
        return;
      }
      action();
    } catch {
      const current = sessionOwner.current;
      if (!current.isAuthenticated || current.persona.id !== owner.id ||
        requestId !== connectionRequest.current) return;
      setWalletActionRequested(true);
      setMetaMaskModalOpen(true);
      showToast('ตรวจสอบสถานะ MetaMask ไม่สำเร็จ กรุณาเชื่อมต่ออีกครั้ง');
    } finally {
      walletActionInFlight.current = false;
    }
  };

  const logTx = (
    action: string,
    toContract: string,
    amount?: string,
    fromOverride?: UserPersona
  ) => {
    const sender = fromOverride || activePersona;
    const newTx: TransactionLog = {
      txHash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      blockNumber: 19842100 + transactions.length + 1,
      timestamp: 'เมื่อสักครู่',
      from: sender.address,
      fromName: sender.name,
      to: toContract,
      action,
      amount,
      status: 'SUCCESS',
      gasUsed: `${Math.floor(25000 + Math.random() * 20000).toLocaleString()} Gwei`
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(prev => (prev === msg ? null : prev));
    }, 4500);
  };

  const fireConfetti = () => {
    try {
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  const faucet = (amount = 1000) => {
    setPersonas(prev => prev.map(p => {
      if (p.id === activePersona.id) {
        return { ...p, balanceUSDT: p.balanceUSDT + amount };
      }
      return p;
    }));
    logTx(`Faucet Claim (+${amount} USDT)`, '0xFaucet');
    showToast(`เพิ่มยอด Sandbox +${amount} USDT แล้ว (ยอดจำลองในแอป)`);
  };

  const advanceTime = (hours: number) => {
    setTimeOffsetHours(prev => prev + hours);
    showToast(`เร่งเวลาจำลอง +${hours} ชั่วโมง เพื่อทดสอบ Review Window`);
  };

  const createAgreement = (data: Partial<SmartAgreement>) => {
    const isDraft = data.status === 'DRAFT';
    const total = data.milestones?.reduce((acc, m) => acc + m.amount, 0) || 1000;
    const contractAddr = isDraft
      ? ''
      : '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newAgreement: SmartAgreement = {
      id: `AGR-2026-${String(Math.floor(Math.random() * 900 + 100))}`,
      contractAddress: contractAddr,
      title: data.title || 'สัญญาจ้างพัฒนาซอฟต์แวร์และระบบงาน',
      description: data.description || 'ข้อกำหนดการจ้างเหมาและเงื่อนไขการส่งมอบงานตามสัญญา',
      clientId: activePersona.id,
      contractorId: data.contractorId || 'user_kitti',
      contractorAddress: data.contractorAddress || '0x3F267A890885e3b5e40632b7194883A92A4588e1',
      contractorName: data.contractorName || 'กิตติ กิจเจริญการช่าง',
      arbitratorId: data.arbitratorId || 'user_charlie',
      totalEscrow: total,
      releasedEscrow: 0,
      currency: 'USDT',
      status: isDraft ? 'DRAFT' : 'ACTIVE_ESCROW',
      tipTotal: 0,
      createdAt: new Date().toISOString(),
      autoApproveDays: data.autoApproveDays || 5,
      milestones: data.milestones || []
    };

    setAgreements(prev => [newAgreement, ...prev]);
    if (isDraft) {
      showToast('บันทึกร่างสัญญาในเบราว์เซอร์แล้ว ยังไม่มีการ deploy หรือโอนเงินขึ้นเชน');
    } else {
      setPersonas(prev => prev.map(p => {
        if (p.id === activePersona.id) {
          return { ...p, balanceUSDT: Math.max(0, p.balanceUSDT - total) };
        }
        return p;
      }));
      logTx(`depositEscrowVault(${total} USDT)`, contractAddr, `${total} USDT`);
      showToast(`สร้างสัญญาจำลองและล็อกยอด Sandbox ${total.toLocaleString()} USDT เรียบร้อย`);
    }
    return newAgreement.id;
  };

  const submitMilestone = (
    agreementId: string,
    milestoneId: string,
    proof: { deliverableUrl?: string; fileHash?: string; note?: string }
  ) => {
    let targetContractAddr = '';
    setAgreements(prev => prev.map(agreement => {
      if (agreement.id !== agreementId) return agreement;
      targetContractAddr = agreement.contractAddress;
      const reviewDate = new Date(Date.now() + 3600000 * 24 * agreement.autoApproveDays).toISOString();
      const updatedMilestones = agreement.milestones.map(m => {
        if (m.id !== milestoneId) return m;
        return {
          ...m,
          status: 'SUBMITTED' as const,
          submissionProof: {
            deliverableUrl: proof.deliverableUrl || 'https://github.com/project/delivery-v1',
            fileHash: proof.fileHash || 'ipfs://Qm' + Math.random().toString(36).substring(2, 15),
            submittedAt: new Date().toISOString(),
            note: proof.note || 'ส่งมอบผลงานงวดนี้เรียบร้อยครับ พร้อมให้ตรวจสอบ'
          },
          reviewDeadline: reviewDate
        };
      });
      return { ...agreement, status: 'IN_PROGRESS' as const, milestones: updatedMilestones };
    }));

    logTx(`submitMilestoneDeliverable(id: ${milestoneId})`, targetContractAddr);
    showToast(`ส่งมอบงานแล้ว! ระบบเปิดหน้าต่างนับถอยหลังตรวจรับ Anti-Ghosting 5 วัน`);
  };

  const approveMilestone = (agreementId: string, milestoneId: string) => {
    let releasedAmount = 0;
    let contractorId = '';
    let targetContractAddr = '';

    setAgreements(prev => prev.map(agreement => {
      if (agreement.id !== agreementId) return agreement;
      targetContractAddr = agreement.contractAddress;
      contractorId = agreement.contractorId;
      const updatedMilestones = agreement.milestones.map(m => {
        if (m.id !== milestoneId) return m;
        releasedAmount = m.amount;
        return { ...m, status: 'APPROVED' as const };
      });

      const allApproved = updatedMilestones.every(m => m.status === 'APPROVED');
      return {
        ...agreement,
        releasedEscrow: agreement.releasedEscrow + releasedAmount,
        milestones: updatedMilestones,
        status: allApproved ? ('COMPLETED' as const) : ('IN_PROGRESS' as const)
      };
    }));

    if (contractorId && releasedAmount > 0) {
      setPersonas(prev => prev.map(p => {
        if (p.id === contractorId) {
          return { ...p, balanceUSDT: p.balanceUSDT + releasedAmount };
        }
        return p;
      }));
    }

    logTx(`approveAndReleaseMilestone(id: ${milestoneId})`, targetContractAddr, `${releasedAmount} USDT`);
    fireConfetti();
    showToast(`ตรวจรับผ่าน! ปลดล็อกยอดจำลอง ${releasedAmount.toLocaleString()} USDT ให้ผู้รับจ้างแล้ว`);
  };

  const requestRevision = (agreementId: string, milestoneId: string, note?: string, category?: string) => {
    let targetContractAddr = '';
    const cleanCategory = category || 'ปรับแก้องค์ประกอบทั่วไป';
    const cleanNote = note || 'ปรับแก้องค์ประกอบตามที่ระบุในสัญญา';

    setAgreements(prev => prev.map(agreement => {
      if (agreement.id !== agreementId) return agreement;
      targetContractAddr = agreement.contractAddress;
      const updatedMilestones = agreement.milestones.map(m => {
        if (m.id !== milestoneId) return m;
        return {
          ...m,
          status: 'REVISION_REQUESTED' as const,
          revisionsUsed: m.revisionsUsed + 1,
          revisionDetails: {
            category: cleanCategory,
            notes: cleanNote,
            requestedAt: new Date().toISOString(),
            status: 'PENDING_FREELANCER' as const
          },
          submissionProof: m.submissionProof ? {
            ...m.submissionProof,
            note: `[คำขอแก้ไข - ${cleanCategory}]: ${cleanNote}`
          } : undefined
        };
      });
      return { ...agreement, milestones: updatedMilestones };
    }));

    logTx(`requestRevision(id: ${milestoneId})`, targetContractAddr);
    showToast(`ส่งคำขอแก้ไขงานเรียบร้อย (ส่งแจ้งเตือนให้ผู้รับจ้างพิจารณา)`);
  };

  const explainFeasibility = (agreementId: string, milestoneId: string, explanation: string) => {
    let targetContractAddr = '';
    setAgreements(prev => prev.map(agreement => {
      if (agreement.id !== agreementId) return agreement;
      targetContractAddr = agreement.contractAddress;
      const updatedMilestones = agreement.milestones.map(m => {
        if (m.id !== milestoneId) return m;
        if (!m.revisionDetails) return m;
        return {
          ...m,
          revisionDetails: {
            ...m.revisionDetails,
            feasibilityExplanation: explanation,
            explainedAt: new Date().toISOString(),
            status: 'EXPLAINED_BY_FREELANCER' as const
          }
        };
      });
      return { ...agreement, milestones: updatedMilestones };
    }));

    logTx(`explainFeasibility(id: ${milestoneId})`, targetContractAddr);
    showToast(`ส่งคำชี้แจงความเป็นไปได้ให้ผู้ว่าจ้างเรียบร้อย`);
  };

  const acceptFeasibilityOrReRevise = (agreementId: string, milestoneId: string, adjustedNote: string) => {
    let targetContractAddr = '';
    setAgreements(prev => prev.map(agreement => {
      if (agreement.id !== agreementId) return agreement;
      targetContractAddr = agreement.contractAddress;
      const updatedMilestones = agreement.milestones.map(m => {
        if (m.id !== milestoneId) return m;
        if (!m.revisionDetails) return m;
        return {
          ...m,
          revisionDetails: {
            ...m.revisionDetails,
            notes: adjustedNote,
            feasibilityExplanation: undefined,
            status: 'PENDING_FREELANCER' as const
          },
          submissionProof: m.submissionProof ? {
            ...m.submissionProof,
            note: `[ปรับปรุงคำขอแก้ไข]: ${adjustedNote}`
          } : undefined
        };
      });
      return { ...agreement, milestones: updatedMilestones };
    }));

    logTx(`adjustRevisionNote(id: ${milestoneId})`, targetContractAddr);
    showToast(`ปรับปรุงคำขอแก้ไขใหม่เรียบร้อย ส่งให้ผู้รับจ้างดำเนินการ`);
  };

  const acceptRevision = (agreementId: string, milestoneId: string) => {
    let targetContractAddr = '';
    setAgreements(prev => prev.map(agreement => {
      if (agreement.id !== agreementId) return agreement;
      targetContractAddr = agreement.contractAddress;
      const updatedMilestones = agreement.milestones.map(m => {
        if (m.id !== milestoneId) return m;
        return {
          ...m,
          status: 'PENDING' as const,
          revisionDetails: m.revisionDetails ? {
            ...m.revisionDetails,
            status: 'ACCEPTED' as const
          } : undefined
        };
      });
      return { ...agreement, milestones: updatedMilestones };
    }));

    logTx(`acceptRevision(id: ${milestoneId})`, targetContractAddr);
    showToast(`ผู้รับจ้างยอมรับเงื่อนไข เริ่มดำเนินการปรับปรุงผลงาน`);
  };

  const triggerAntiGhosting = (agreementId: string, milestoneId: string) => {
    approveMilestone(agreementId, milestoneId);
    showToast(`กลไก Anti-Ghosting ทำงาน! ผู้ว่าจ้างไม่ตอบกลับใน 5 วัน สัญญาจึงปลดล็อกเงินให้อัตโนมัติ`);
  };

  const raiseDispute = (agreementId: string, milestoneId: string, reason: string) => {
    let targetContractAddr = '';
    setAgreements(prev => prev.map(agreement => {
      if (agreement.id !== agreementId) return agreement;
      targetContractAddr = agreement.contractAddress;
      const updatedMilestones = agreement.milestones.map(m => {
        if (m.id !== milestoneId) return m;
        return {
          ...m,
          status: 'DISPUTED' as const,
          disputeInfo: {
            raisedBy: activePersona.name,
            reason,
            raisedAt: new Date().toISOString()
          }
        };
      });
      return {
        ...agreement,
        status: 'DISPUTED' as const,
        disputeReason: reason,
        milestones: updatedMilestones
      };
    }));

    logTx(`raiseDispute(id: ${milestoneId})`, targetContractAddr);
    showToast(`เปิดข้อพิพาทสำเร็จ! สัญญาเข้าสู่กระบวนการไกล่เกลี่ยโดยคนกลาง (Arbitrator)`);
  };

  const resolveDispute = (
    agreementId: string,
    milestoneId: string,
    decision: 'RELEASE_TO_CONTRACTOR' | 'REFUND_TO_CLIENT'
  ) => {
    let amount = 0;
    let clientId = '';
    let contractorId = '';
    let targetContractAddr = '';

    setAgreements(prev => prev.map(agreement => {
      if (agreement.id !== agreementId) return agreement;
      targetContractAddr = agreement.contractAddress;
      clientId = agreement.clientId;
      contractorId = agreement.contractorId;

      const updatedMilestones = agreement.milestones.map(m => {
        if (m.id !== milestoneId) return m;
        amount = m.amount;
        return {
          ...m,
          status: 'APPROVED' as const,
          disputeInfo: m.disputeInfo ? {
            ...m.disputeInfo,
            resolution: decision === 'RELEASE_TO_CONTRACTOR' ? 'ตัดสินปลดล็อกเงินให้ผู้รับจ้าง' : 'ตัดสินคืนเงินให้ผู้ว่าจ้าง',
            resolvedAt: new Date().toISOString()
          } : undefined
        };
      });

      return {
        ...agreement,
        status: 'SETTLED' as const,
        releasedEscrow: decision === 'RELEASE_TO_CONTRACTOR' ? agreement.releasedEscrow + amount : agreement.releasedEscrow,
        milestones: updatedMilestones
      };
    }));

    // Transfer funds accordingly
    const targetUserId = decision === 'RELEASE_TO_CONTRACTOR' ? contractorId : clientId;
    setPersonas(prev => prev.map(p => {
      if (p.id === targetUserId) {
        return { ...p, balanceUSDT: p.balanceUSDT + amount };
      }
      return p;
    }));

    logTx(`resolveDispute(${decision})`, targetContractAddr, `${amount} USDT`);
    showToast(`คนกลางตัดสินข้อพิพาทแล้ว: ${decision === 'RELEASE_TO_CONTRACTOR' ? 'โอนเงินให้ผู้รับจ้าง' : 'คืนเงินให้ผู้ว่าจ้าง'}`);
  };

  const tipContractor = (agreementId: string, amount: number) => {
    let targetContractorId = '';
    let targetContractAddr = '';
    setAgreements(prev => prev.map(agreement => {
      if (agreement.id !== agreementId) return agreement;
      targetContractorId = agreement.contractorId;
      targetContractAddr = agreement.contractAddress;
      return { ...agreement, tipTotal: agreement.tipTotal + amount };
    }));

    setPersonas(prev => prev.map(p => {
      if (p.id === activePersona.id) return { ...p, balanceUSDT: Math.max(0, p.balanceUSDT - amount) };
      if (p.id === targetContractorId) return { ...p, balanceUSDT: p.balanceUSDT + amount };
      return p;
    }));

    logTx(`sendOnChainTip(${amount} USDT)`, targetContractAddr, `${amount} USDT`);
    fireConfetti();
    showToast(`เพิ่มโบนัส Sandbox +${amount} USDT ให้ผู้รับจ้างเรียบร้อย (ยอดจำลอง)`);
  };

  const resetAllData = () => {
    connectionRequest.current += 1;
    wallet.disconnect();
    setIsMetaMaskModalOpen(false);
    localStorage.clear();
    setPersonas(INITIAL_PERSONAS);
    setActivePersonaId('user_somchai');
    setAgreements(INITIAL_AGREEMENTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setTimeOffsetHours(0);
    showToast('รีเซ็ตข้อมูลสู่สัญญาตัวอย่างตั้งต้นเรียบร้อย');
  };

  return (
    <ContractContext.Provider
      value={{
        personas,
        activePersona,
        currentUser,
        isAuthenticated,
        setActivePersonaId,
        login,
        logout,
        registerUser,
        faucet,
        connectMetaMask,
        unbindWallet,
        walletAddress: wallet.address,
        walletChainId: wallet.chainId,
        walletBalanceBNB: wallet.balanceBNB,
        walletBalanceError: wallet.balanceError,
        walletError: wallet.errorMessage,
        isMetaMaskAvailable: wallet.isAvailable,
        isWalletConnected,
        isWalletConnecting: wallet.isConnecting,
        isWalletRefreshing: wallet.isRefreshing,
        refreshWallet,
        isMetaMaskModalOpen,
        setIsMetaMaskModalOpen,
        executeWithWallet,
        agreements,
        freelanceContracts: agreements, // alias
        createAgreement,
        createFreelanceContract: createAgreement, // alias
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
        tipFreelancer: tipContractor, // alias
        transactions,
        timeOffsetHours,
        advanceTime,
        resetAllData,
        notification,
        setNotification
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};

export const useContracts = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContracts must be used within a ContractProvider');
  }
  return context;
};
