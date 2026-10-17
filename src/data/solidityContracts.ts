export interface ContractSource {
  title: string;
  name: string;
  description: string;
  code: string;
}

export const SOLIDITY_CONTRACTS: Record<string, ContractSource> = {
  freelance: {
    title: 'SmartAgreementEscrow.sol',
    name: 'Smart Agreement & Milestone Escrow Protocol with Arbitration',
    description: 'Smart Contract สำหรับควบคุมข้อตกลงและค้ำประกันเงินจ้างงาน (Escrow Vault) ระหว่างผู้ว่าจ้าง (Party A) และผู้รับจ้าง (Party B) พร้อมระบบตรวจรับอัตโนมัติ Anti-Ghosting 5 วัน และระบบไกล่เกลี่ยข้อพิพาทโดยคนกลาง (Arbitrator - Party C)',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SmartAgreementEscrow
 * @dev Autonomous milestone escrow custody, anti-ghosting enforcement, 
 * and decentralized dispute arbitration protocol.
 */
contract SmartAgreementEscrow {
    enum MilestoneStatus { Pending, Submitted, Approved, Disputed, Resolved }

    struct Milestone {
        uint256 amount;
        MilestoneStatus status;
        uint256 submissionTime;
        bytes32 deliverableHash;
        uint8 revisionsLeft;
    }

    address public client;      // Party A (ผู้ว่าจ้าง)
    address public contractor;  // Party B (ผู้รับจ้าง)
    address public arbitrator;  // Party C (คนกลางไกล่เกลี่ยข้อพิพาท)
    
    uint256 public constant REVIEW_WINDOW = 5 days;
    Milestone[] public milestones;
    uint256 public totalEscrowLocked;

    event MilestoneSubmitted(uint256 indexed index, bytes32 deliverableHash);
    event MilestoneApproved(uint256 indexed index, uint256 amount);
    event AutoApproved(uint256 indexed index, uint256 amount);
    event DisputeRaised(uint256 indexed index, address indexed raisedBy);
    event DisputeResolved(uint256 indexed index, address indexed recipient, uint256 amount);
    event TipSent(address indexed from, address indexed to, uint256 amount);

    modifier onlyClient() {
        require(msg.sender == client, "Only Client (Party A)");
        _;
    }

    modifier onlyContractor() {
        require(msg.sender == contractor, "Only Contractor (Party B)");
        _;
    }

    modifier onlyArbitrator() {
        require(msg.sender == arbitrator, "Only Arbitrator (Party C)");
        _;
    }

    constructor(address _contractor, address _arbitrator) payable {
        require(_contractor != address(0), "Invalid contractor address");
        client = msg.sender;
        contractor = _contractor;
        arbitrator = _arbitrator;
        totalEscrowLocked = msg.value;
    }

    /// @dev ผู้รับจ้าง (Party B) ส่งมอบผลงานพร้อม Hash ยืนยันบนบล็อกเชน
    function submitMilestone(uint256 index, bytes32 deliverableHash) external onlyContractor {
        Milestone storage m = milestones[index];
        require(m.status == MilestoneStatus.Pending, "Invalid milestone state");
        
        m.status = MilestoneStatus.Submitted;
        m.submissionTime = block.timestamp;
        m.deliverableHash = deliverableHash;
        emit MilestoneSubmitted(index, deliverableHash);
    }

    /// @dev ผู้ว่าจ้าง (Party A) ตรวจรับงานและปลดล็อกเงินงวดนั้นให้ผู้รับจ้าง
    function approveMilestone(uint256 index) external onlyClient {
        Milestone storage m = milestones[index];
        require(m.status == MilestoneStatus.Submitted, "Not submitted for review");
        
        m.status = MilestoneStatus.Approved;
        totalEscrowLocked -= m.amount;
        payable(contractor).transfer(m.amount);
        emit MilestoneApproved(index, m.amount);
    }

    /// @dev กลไก Anti-Ghosting: หากผู้ว่าจ้างเงียบหายเกิน 5 วัน สัญญาจะปลดล็อกเงินอัตโนมัติ
    function executeAntiGhosting(uint256 index) external {
        Milestone storage m = milestones[index];
        require(m.status == MilestoneStatus.Submitted, "Not in review window");
        require(block.timestamp >= m.submissionTime + REVIEW_WINDOW, "Review window still active");
        
        m.status = MilestoneStatus.Approved;
        totalEscrowLocked -= m.amount;
        payable(contractor).transfer(m.amount);
        emit AutoApproved(index, m.amount);
    }

    /// @dev ส่งเรื่องเปิดข้อพิพาทเมื่อตกลงกันไม่ได้ (Party A หรือ Party B ก็ได้)
    function raiseDispute(uint256 index) external {
        require(msg.sender == client || msg.sender == contractor, "Unauthorized");
        Milestone storage m = milestones[index];
        require(m.status == MilestoneStatus.Submitted, "Cannot dispute in current state");
        
        m.status = MilestoneStatus.Disputed;
        emit DisputeRaised(index, msg.sender);
    }

    /// @dev คนกลาง (Arbitrator) ตัดสินข้อพิพาท: ปล่อยเงินให้ผู้รับจ้าง หรือคืนเงินให้ผู้ว่าจ้าง
    function resolveDispute(uint256 index, bool releaseToContractor) external onlyArbitrator {
        Milestone storage m = milestones[index];
        require(m.status == MilestoneStatus.Disputed, "Milestone not disputed");
        
        m.status = MilestoneStatus.Resolved;
        totalEscrowLocked -= m.amount;
        
        address payable recipient = releaseToContractor ? payable(contractor) : payable(client);
        recipient.transfer(m.amount);
        emit DisputeResolved(index, recipient, m.amount);
    }

    /// @dev ให้โบนัสพิเศษ (Tip) แก่ผู้รับจ้างโดยตรง
    function sendTip() external payable onlyClient {
        payable(contractor).transfer(msg.value);
        emit TipSent(msg.sender, contractor, msg.value);
    }
}`
  }
};
