// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC2771Context} from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import {ERC2771Forwarder} from "@openzeppelin/contracts/metatx/ERC2771Forwarder.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SanyaTestUSD is ERC20 {
    constructor() ERC20("SANYA Test Dollar", "tUSD") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address account, uint256 amount) external {
        _mint(account, amount);
    }
}

contract SanyaForwarder is ERC2771Forwarder {
    constructor() ERC2771Forwarder("SANYA Testnet Relay") {}
}

contract SanyaEscrow is ERC2771Context, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant FEE = 1 ether;
    uint256 public constant MAX_MILESTONES = 20;

    enum MilestoneState {
        Pending,
        Submitted,
        RevisionRequested,
        Approved,
        Disputed,
        Refunded
    }

    struct MilestoneInput {
        string title;
        string criteria;
        uint128 amount;
        uint64 dueAt;
        uint8 revisionQuota;
    }

    struct Milestone {
        string title;
        string criteria;
        string proofUri;
        string revisionNote;
        string feasibilityExplanation;
        bytes32 proofHash;
        uint128 amount;
        uint64 dueAt;
        uint64 submittedAt;
        uint64 reviewDeadline;
        uint8 revisionQuota;
        uint8 revisionsUsed;
        MilestoneState state;
    }

    struct Agreement {
        address client;
        address contractor;
        address arbitrator;
        string title;
        string scope;
        uint64 reviewWindow;
        uint128 total;
        uint128 released;
        bool exists;
        bool disputed;
        Milestone[] milestones;
    }

    IERC20 public immutable sya;
    IERC20 public immutable testUsd;
    address public immutable treasury;
    uint256 public nextAgreementId = 1;
    mapping(uint256 => Agreement) private agreements;
    mapping(address => uint256[]) private userAgreementIds;

    event AgreementCreated(uint256 indexed agreementId, address indexed client, address indexed contractor, uint256 total);
    event MilestoneSubmitted(uint256 indexed agreementId, uint256 indexed milestoneId, bytes32 proofHash, uint64 reviewDeadline);
    event MilestoneRevisionRequested(uint256 indexed agreementId, uint256 indexed milestoneId, uint8 revisionsUsed, string note);
    event RevisionAdjusted(uint256 indexed agreementId, uint256 indexed milestoneId, string note);
    event FeasibilityExplained(uint256 indexed agreementId, uint256 indexed milestoneId, string explanation);
    event MilestoneApproved(uint256 indexed agreementId, uint256 indexed milestoneId, address indexed recipient, uint256 amount);
    event DisputeRaised(uint256 indexed agreementId, uint256 indexed milestoneId, address indexed raisedBy, string reason);
    event DisputeResolved(uint256 indexed agreementId, uint256 indexed milestoneId, bool releasedToContractor, uint256 amount);

    error InvalidAddress();
    error InvalidAgreement();
    error InvalidMilestone();
    error Unauthorized();
    error InvalidState();
    error InvalidInput();
    error ReviewWindowActive();
    error RevisionLimitReached();

    constructor(address trustedForwarder, address syaToken, address testUsdToken, address feeTreasury)
        ERC2771Context(trustedForwarder)
    {
        if (trustedForwarder == address(0) || syaToken == address(0) || testUsdToken == address(0) || feeTreasury == address(0)) {
            revert InvalidAddress();
        }
        sya = IERC20(syaToken);
        testUsd = IERC20(testUsdToken);
        treasury = feeTreasury;
    }

    function createAgreement(
        string calldata title,
        string calldata scope,
        address contractor,
        address arbitrator,
        uint64 reviewWindow,
        MilestoneInput[] calldata milestoneInputs
    ) external nonReentrant returns (uint256 agreementId) {
        address client = _msgSender();
        if (contractor == address(0) || arbitrator == address(0) || contractor == client || arbitrator == client || arbitrator == contractor) {
            revert InvalidAddress();
        }
        if (bytes(title).length == 0 || bytes(scope).length == 0 || reviewWindow == 0 || reviewWindow > 30 days) revert InvalidInput();
        if (milestoneInputs.length == 0 || milestoneInputs.length > MAX_MILESTONES) revert InvalidInput();

        uint256 total;
        for (uint256 i; i < milestoneInputs.length; ++i) {
            MilestoneInput calldata input = milestoneInputs[i];
            if (input.amount == 0 || input.revisionQuota > 10 || bytes(input.title).length == 0 || bytes(input.criteria).length == 0) {
                revert InvalidInput();
            }
            total += input.amount;
        }
        if (total > type(uint128).max) revert InvalidInput();

        _collectFee(client);
        testUsd.safeTransferFrom(client, address(this), total);

        agreementId = nextAgreementId++;
        Agreement storage agreement = agreements[agreementId];
        agreement.client = client;
        agreement.contractor = contractor;
        agreement.arbitrator = arbitrator;
        agreement.title = title;
        agreement.scope = scope;
        agreement.reviewWindow = reviewWindow;
        agreement.total = uint128(total);
        agreement.exists = true;
        userAgreementIds[client].push(agreementId);
        userAgreementIds[contractor].push(agreementId);
        userAgreementIds[arbitrator].push(agreementId);

        for (uint256 i; i < milestoneInputs.length; ++i) {
            MilestoneInput calldata input = milestoneInputs[i];
            agreement.milestones.push(Milestone({
                title: input.title,
                criteria: input.criteria,
                proofUri: "",
                revisionNote: "",
                feasibilityExplanation: "",
                proofHash: bytes32(0),
                amount: input.amount,
                dueAt: input.dueAt,
                submittedAt: 0,
                reviewDeadline: 0,
                revisionQuota: input.revisionQuota,
                revisionsUsed: 0,
                state: MilestoneState.Pending
            }));
        }
        emit AgreementCreated(agreementId, client, contractor, total);
    }

    function submitMilestone(uint256 agreementId, uint256 milestoneId, bytes32 proofHash, string calldata proofUri) external nonReentrant {
        Agreement storage agreement = _agreement(agreementId);
        if (_msgSender() != agreement.contractor) revert Unauthorized();
        Milestone storage milestone = _milestone(agreement, milestoneId);
        if (milestone.state != MilestoneState.Pending && milestone.state != MilestoneState.RevisionRequested) revert InvalidState();
        if (proofHash == bytes32(0) && bytes(proofUri).length == 0) revert InvalidInput();

        _collectFee(_msgSender());
        milestone.proofHash = proofHash;
        milestone.proofUri = proofUri;
        milestone.submittedAt = uint64(block.timestamp);
        milestone.reviewDeadline = uint64(block.timestamp + agreement.reviewWindow);
        milestone.state = MilestoneState.Submitted;
        delete milestone.revisionNote;
        delete milestone.feasibilityExplanation;
        emit MilestoneSubmitted(agreementId, milestoneId, proofHash, milestone.reviewDeadline);
    }

    function requestRevision(uint256 agreementId, uint256 milestoneId, string calldata note) external nonReentrant {
        Agreement storage agreement = _agreement(agreementId);
        if (_msgSender() != agreement.client) revert Unauthorized();
        Milestone storage milestone = _milestone(agreement, milestoneId);
        if (milestone.state != MilestoneState.Submitted) revert InvalidState();
        if (milestone.revisionsUsed >= milestone.revisionQuota) revert RevisionLimitReached();
        if (bytes(note).length == 0) revert InvalidInput();

        _collectFee(_msgSender());
        milestone.revisionsUsed += 1;
        milestone.revisionNote = note;
        milestone.state = MilestoneState.RevisionRequested;
        emit MilestoneRevisionRequested(agreementId, milestoneId, milestone.revisionsUsed, note);
    }

    function explainFeasibility(uint256 agreementId, uint256 milestoneId, string calldata explanation) external nonReentrant {
        Agreement storage agreement = _agreement(agreementId);
        if (_msgSender() != agreement.contractor) revert Unauthorized();
        Milestone storage milestone = _milestone(agreement, milestoneId);
        if (milestone.state != MilestoneState.RevisionRequested || bytes(explanation).length == 0) revert InvalidState();

        _collectFee(_msgSender());
        milestone.feasibilityExplanation = explanation;
        emit FeasibilityExplained(agreementId, milestoneId, explanation);
    }

    function adjustRevisionNote(uint256 agreementId, uint256 milestoneId, string calldata adjustedNote) external nonReentrant {
        Agreement storage agreement = _agreement(agreementId);
        if (_msgSender() != agreement.client) revert Unauthorized();
        Milestone storage milestone = _milestone(agreement, milestoneId);
        if (milestone.state != MilestoneState.RevisionRequested || bytes(adjustedNote).length == 0) revert InvalidState();

        _collectFee(_msgSender());
        milestone.revisionNote = adjustedNote;
        delete milestone.feasibilityExplanation;
        emit RevisionAdjusted(agreementId, milestoneId, adjustedNote);
    }

    function acceptRevision(uint256 agreementId, uint256 milestoneId) external nonReentrant {
        Agreement storage agreement = _agreement(agreementId);
        if (_msgSender() != agreement.contractor) revert Unauthorized();
        Milestone storage milestone = _milestone(agreement, milestoneId);
        if (milestone.state != MilestoneState.RevisionRequested) revert InvalidState();

        _collectFee(_msgSender());
        milestone.state = MilestoneState.Pending;
        delete milestone.feasibilityExplanation;
    }

    function approveMilestone(uint256 agreementId, uint256 milestoneId) external nonReentrant {
        Agreement storage agreement = _agreement(agreementId);
        if (_msgSender() != agreement.client) revert Unauthorized();
        Milestone storage milestone = _milestone(agreement, milestoneId);
        if (milestone.state != MilestoneState.Submitted) revert InvalidState();

        _collectFee(_msgSender());
        _release(agreement, agreementId, milestoneId, milestone, agreement.contractor);
    }

    function triggerAntiGhosting(uint256 agreementId, uint256 milestoneId) external nonReentrant {
        Agreement storage agreement = _agreement(agreementId);
        Milestone storage milestone = _milestone(agreement, milestoneId);
        if (milestone.state != MilestoneState.Submitted) revert InvalidState();
        if (block.timestamp < milestone.reviewDeadline) revert ReviewWindowActive();

        _collectFee(_msgSender());
        _release(agreement, agreementId, milestoneId, milestone, agreement.contractor);
    }

    function raiseDispute(uint256 agreementId, uint256 milestoneId, string calldata reason) external nonReentrant {
        Agreement storage agreement = _agreement(agreementId);
        address sender = _msgSender();
        if (sender != agreement.client && sender != agreement.contractor) revert Unauthorized();
        Milestone storage milestone = _milestone(agreement, milestoneId);
        if (milestone.state != MilestoneState.Pending && milestone.state != MilestoneState.Submitted && milestone.state != MilestoneState.RevisionRequested) {
            revert InvalidState();
        }
        if (bytes(reason).length == 0) revert InvalidInput();

        _collectFee(sender);
        milestone.state = MilestoneState.Disputed;
        agreement.disputed = true;
        emit DisputeRaised(agreementId, milestoneId, sender, reason);
    }

    function resolveDispute(uint256 agreementId, uint256 milestoneId, bool releaseToContractor) external nonReentrant {
        Agreement storage agreement = _agreement(agreementId);
        if (_msgSender() != agreement.arbitrator) revert Unauthorized();
        Milestone storage milestone = _milestone(agreement, milestoneId);
        if (milestone.state != MilestoneState.Disputed) revert InvalidState();

        _collectFee(_msgSender());
        address recipient = releaseToContractor ? agreement.contractor : agreement.client;
        uint256 amount = milestone.amount;
        milestone.state = releaseToContractor ? MilestoneState.Approved : MilestoneState.Refunded;
        if (releaseToContractor) agreement.released += uint128(amount);
        agreement.disputed = _hasOpenDispute(agreement);
        testUsd.safeTransfer(recipient, amount);
        emit DisputeResolved(agreementId, milestoneId, releaseToContractor, amount);
    }

    function getAgreement(uint256 agreementId) external view returns (
        address client,
        address contractor,
        address arbitrator,
        string memory title,
        string memory scope,
        uint64 reviewWindow,
        uint128 total,
        uint128 released,
        bool disputed,
        uint256 milestoneCount
    ) {
        Agreement storage agreement = _agreement(agreementId);
        return (
            agreement.client,
            agreement.contractor,
            agreement.arbitrator,
            agreement.title,
            agreement.scope,
            agreement.reviewWindow,
            agreement.total,
            agreement.released,
            agreement.disputed,
            agreement.milestones.length
        );
    }

    function getMilestone(uint256 agreementId, uint256 milestoneId) external view returns (Milestone memory) {
        Agreement storage agreement = _agreement(agreementId);
        return _milestone(agreement, milestoneId);
    }

    function getAgreementsFor(address account) external view returns (uint256[] memory) {
        return userAgreementIds[account];
    }

    function _collectFee(address payer) private {
        sya.safeTransferFrom(payer, treasury, FEE);
    }

    function _release(
        Agreement storage agreement,
        uint256 agreementId,
        uint256 milestoneId,
        Milestone storage milestone,
        address recipient
    ) private {
        uint256 amount = milestone.amount;
        milestone.state = MilestoneState.Approved;
        agreement.released += uint128(amount);
        testUsd.safeTransfer(recipient, amount);
        emit MilestoneApproved(agreementId, milestoneId, recipient, amount);
    }

    function _agreement(uint256 agreementId) private view returns (Agreement storage agreement) {
        agreement = agreements[agreementId];
        if (!agreement.exists) revert InvalidAgreement();
    }

    function _milestone(Agreement storage agreement, uint256 milestoneId) private view returns (Milestone storage milestone) {
        if (milestoneId >= agreement.milestones.length) revert InvalidMilestone();
        milestone = agreement.milestones[milestoneId];
    }

    function _hasOpenDispute(Agreement storage agreement) private view returns (bool) {
        for (uint256 i; i < agreement.milestones.length; ++i) {
            if (agreement.milestones[i].state == MilestoneState.Disputed) return true;
        }
        return false;
    }
}