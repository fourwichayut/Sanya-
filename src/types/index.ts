export type AgreementStatus = 
  | 'DRAFT'
  | 'ACTIVE_ESCROW'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'SETTLED';

export type MilestoneStatus = 
  | 'PENDING'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REVISION_REQUESTED'
  | 'DISPUTED';

export interface PartyInfo {
  id: string;
  name: string;
  address: string;
  role: 'CLIENT' | 'CONTRACTOR' | 'ARBITRATOR';
  signedAt?: string;
  avatar?: string;
}

export interface UserPersona {
  id: string;
  username: string;
  name: string;
  email: string;
  password?: string;
  roleTitle: string;
  role: 'CLIENT' | 'CONTRACTOR' | 'ARBITRATOR';
  avatar: string;
  address: string;
  isWalletBound: boolean;
  walletBindingSource?: 'metamask';
  balanceUSDT: number;
}

export interface TransactionLog {
  txHash: string;
  blockNumber: number;
  timestamp: string;
  from: string;
  fromName: string;
  to: string;
  action: string;
  amount?: string;
  status: 'SUCCESS' | 'REVERTED';
  gasUsed: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number; // in USDT
  status: MilestoneStatus;
  dueDate?: string; // Optional delivery deadline (e.g. '2026-10-15')
  submissionProof?: {
    deliverableUrl?: string;
    fileHash?: string;
    submittedAt: string;
    note?: string;
  };
  reviewDeadline?: string;
  revisionQuota: number;
  revisionsUsed: number;
  revisionDetails?: {
    category: string;
    notes: string;
    requestedAt: string;
    feasibilityExplanation?: string;
    explainedAt?: string;
    status: 'PENDING_FREELANCER' | 'EXPLAINED_BY_FREELANCER' | 'ACCEPTED';
  };
  disputeInfo?: {
    raisedBy: string;
    reason: string;
    raisedAt: string;
    resolution?: string;
    resolvedAt?: string;
  };
}

export interface SmartAgreement {
  id: string;
  contractAddress: string;
  title: string;
  description: string;
  clientId: string; // Party A
  contractorId: string; // Party B
  contractorAddress: string;
  contractorName: string;
  arbitratorId: string; // Party C
  totalEscrow: number;
  releasedEscrow: number;
  currency: 'USDT';
  milestones: Milestone[];
  status: AgreementStatus;
  tipTotal: number;
  createdAt: string;
  autoApproveDays: number;
  disputeReason?: string;
}

// Backwards compatibility alias if needed
export type FreelanceContract = SmartAgreement;
