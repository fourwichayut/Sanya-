import {
  UserPersona,
  SmartAgreement,
  TransactionLog
} from '../types';

export const INITIAL_PERSONAS: UserPersona[] = [
  {
    id: 'user_somchai',
    username: 'somchai',
    email: 'somchai.p@enterprise-holdings.co',
    password: 'password123',
    name: 'สมชาย พงษ์ไพศาล',
    roleTitle: 'ผู้ว่าจ้าง (Party A - Client)',
    role: 'CLIENT',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    address: '0x71C80927e3d12260714bFDaF5B0c3459e79349B2',
    isWalletBound: false,
    balanceUSDT: 12500
  },
  {
    id: 'user_kitti',
    username: 'kitti',
    email: 'kitti.dev@techlabs.io',
    password: 'password123',
    name: 'กิตติ กิจเจริญการช่าง',
    roleTitle: 'ผู้รับจ้าง (Party B - Contractor)',
    role: 'CONTRACTOR',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    address: '0x3F267A890885e3b5e40632b7194883A92A4588e1',
    isWalletBound: false,
    balanceUSDT: 2400
  },
  {
    id: 'user_charlie',
    username: 'charlie',
    email: 'charlie@lexescrow.dao',
    password: 'password123',
    name: 'สถาบันอนุญาโตตุลาการดิจิทัล (LexEscrow)',
    roleTitle: 'คนกลางระงับข้อพิพาท (Party C - Arbitrator)',
    role: 'ARBITRATOR',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    address: '0xEE41C34A972418eF3c7Ea73bFf3910A4956751Fa',
    isWalletBound: false,
    balanceUSDT: 15000
  }
];

export const INITIAL_AGREEMENTS: SmartAgreement[] = [
  {
    id: 'AGR-2026-001',
    contractAddress: '0x78aF4129cD50e183701FaB31d68351Bcf4091A42',
    title: 'สัญญาจ้างเหมาพัฒนาแพลตฟอร์ม Core Banking API & Web3 Dashboard',
    description: 'สัญญาจ้างพัฒนาซอฟต์แวร์แบบส่งมอบตามงวดงาน ค้ำประกันเงินค่าจ้างใน Escrow Vault กลาง และกำกับดูแลด้วยระบบ Anti-Ghosting 5 วัน',
    clientId: 'user_somchai',
    contractorId: 'user_kitti',
    contractorAddress: '0x3F267A890885e3b5e40632b7194883A92A4588e1',
    contractorName: 'กิตติ กิจเจริญการช่าง',
    arbitratorId: 'user_charlie',
    totalEscrow: 3500,
    releasedEscrow: 1000,
    currency: 'USDT',
    status: 'IN_PROGRESS',
    tipTotal: 150,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    autoApproveDays: 5,
    milestones: [
      {
        id: 'm1',
        title: 'งวดที่ 1: สถาปัตยกรรมระบบ ดาต้าเบส และ API Documentation',
        description: 'ส่งมอบ Swagger API Spec, Data Schema, และผลการทดสอบ Integration Endpoint ครบถ้วน',
        amount: 1000,
        status: 'APPROVED',
        dueDate: '2026-09-15',
        submissionProof: {
          deliverableUrl: 'https://github.com/enterprise-core/banking-api-docs',
          fileHash: 'ipfs://QmZtmD2qtQgXNxpT7286VDh24QH1qW7uVfXJ7r990b',
          submittedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
          note: 'ส่งมอบเอกสารและรัน Endpoint ผ่านเรียบร้อยครับ'
        },
        revisionQuota: 2,
        revisionsUsed: 1
      },
      {
        id: 'm2',
        title: 'งวดที่ 2: หน้าจอ Dashboard ตอบสนองการใช้งานจริงและเชื่อมต่อ Web3',
        description: 'ส่งมอบ Source Code เว็บแอปพลิเคชัน พร้อมระบบเชื่อมต่อ Smart Contract และระบบยืนยันตัวตน',
        amount: 1500,
        status: 'SUBMITTED',
        dueDate: '2026-10-05',
        submissionProof: {
          deliverableUrl: 'https://github.com/enterprise-core/web3-dashboard',
          fileHash: 'ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
          submittedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
          note: 'ส่งมอบงานงวดที่ 2 ครบถ้วนตาม Requirement พร้อม Live Demo ให้ทดสอบ'
        },
        reviewDeadline: new Date(Date.now() + 3600000 * 72).toISOString(),
        revisionQuota: 2,
        revisionsUsed: 0
      },
      {
        id: 'm3',
        title: 'งวดที่ 3: ตรวจสอบความปลอดภัย (Security Audit) และ Deploy Production',
        description: 'ผ่านการทดสอบช่องโหว่ความปลอดภัย ขึ้นระบบจริงบน Cloud Infrastructure พร้อมส่งมอบคู่มือการดูแล',
        amount: 1000,
        status: 'PENDING',
        dueDate: '2026-10-25',
        revisionQuota: 2,
        revisionsUsed: 0
      }
    ]
  },
  {
    id: 'AGR-2026-002',
    contractAddress: '0x91Ce8B237912Ac987E12003841FaC22091bA8741',
    title: 'สัญญาจ้างที่ปรึกษาและจัดทำ Corporate Design System',
    description: 'สัญญาบริการวิชาชีพจัดทำ Design System และ UI Component Library สำหรับผลิตภัณฑ์ดิจิทัลขององค์กร',
    clientId: 'user_somchai',
    contractorId: 'user_kitti',
    contractorAddress: '0x3F267A890885e3b5e40632b7194883A92A4588e1',
    contractorName: 'กิตติ กิจเจริญการช่าง',
    arbitratorId: 'user_charlie',
    totalEscrow: 2000,
    releasedEscrow: 0,
    currency: 'USDT',
    status: 'ACTIVE_ESCROW',
    tipTotal: 0,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    autoApproveDays: 5,
    milestones: [
      {
        id: 'm1',
        title: 'งวดที่ 1: Brand Guidelines & Typography Tokens',
        description: 'ส่งมอบ Color Palette, Typography Hierarchy, และ Icon System ในรูปแบบ Figma Library',
        amount: 800,
        status: 'PENDING',
        dueDate: '2026-10-10',
        revisionQuota: 2,
        revisionsUsed: 0
      },
      {
        id: 'm2',
        title: 'งวดที่ 2: Interactive Web Component Library (React & Tailwind)',
        description: 'ส่งมอบโค้ด UI Component พร้อม Documentation Storybook สำหรับนำไปประกอบหน้าเว็บจริง',
        amount: 1200,
        status: 'PENDING',
        dueDate: '2026-10-31',
        revisionQuota: 2,
        revisionsUsed: 0
      }
    ]
  }
];

export const INITIAL_TRANSACTIONS: TransactionLog[] = [
  {
    txHash: '0x7a8e91c2b3d4f5e6a7b8c9d0e1f2a3b4c5d6e7f8',
    blockNumber: 19842104,
    timestamp: 'เมื่อสักครู่',
    from: '0x71C80927e3d12260714bFDaF5B0c3459e79349B2',
    fromName: 'สมชาย (Party A)',
    to: '0x78aF4129cD50e183701FaB31d68351Bcf4091A42',
    action: 'depositEscrowVault(3,500 USDT)',
    amount: '3,500 USDT',
    status: 'SUCCESS',
    gasUsed: '42,150 Gwei'
  },
  {
    txHash: '0x3c2a1b9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3',
    blockNumber: 19842080,
    timestamp: '18 ชม. ที่แล้ว',
    from: '0x3F267A890885e3b5e40632b7194883A92A4588e1',
    fromName: 'กิตติ (Party B)',
    to: '0x78aF4129cD50e183701FaB31d68351Bcf4091A42',
    action: 'submitMilestoneDeliverable(งวดที่ 2)',
    status: 'SUCCESS',
    gasUsed: '31,000 Gwei'
  },
  {
    txHash: '0x9fa481e32dc0947ba9c21ef8841a01b2390110a9',
    blockNumber: 19842010,
    timestamp: '30 ชม. ที่แล้ว',
    from: '0x71C80927e3d12260714bFDaF5B0c3459e79349B2',
    fromName: 'สมชาย (Party A)',
    to: '0x78aF4129cD50e183701FaB31d68351Bcf4091A42',
    action: 'approveAndReleaseMilestone(งวดที่ 1: 1,000 USDT)',
    amount: '1,000 USDT',
    status: 'SUCCESS',
    gasUsed: '38,200 Gwei'
  }
];

// Backwards compatibility alias
export const INITIAL_FREELANCE_CONTRACTS = INITIAL_AGREEMENTS;
