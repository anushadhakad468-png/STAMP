// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAgentRegistry {
    function agents(address agentAddress) external view returns (
        string memory modelName,
        string memory modelWeightsHash,
        uint256 stake,
        uint256 reputation,
        bool isActive
    );
}

interface IProvenanceRegistry {
    function stamps(string calldata id) external view returns (
        string memory contentHash,
        string memory model,
        address agent,
        address creator,
        uint8 kind,
        uint256 timestamp,
        bool revoked
    );
}

contract JobEscrow {
    enum JobStatus { OPEN, ACTIVE, COMPLETED, DISPUTED, REFUNDED }

    struct Job {
        address creator;
        address agent;
        uint256 payment;
        JobStatus status;
        string prompt;
    }

    IAgentRegistry public agentRegistry;
    IProvenanceRegistry public provenanceRegistry;
    address public owner;
    uint256 public jobCounter;

    mapping(uint256 => Job) public jobs;

    event JobCreated(uint256 indexed jobId, address indexed creator, address indexed agent, uint256 payment);
    event JobSettled(uint256 indexed jobId, string stampId);

    constructor(address _agentRegistry, address _provenanceRegistry) {
        owner = msg.sender;
        agentRegistry = IAgentRegistry(_agentRegistry);
        provenanceRegistry = IProvenanceRegistry(_provenanceRegistry);
    }

    function createJob(address _agent, string calldata _prompt) external payable returns (uint256) {
        require(msg.value > 0, "Job must be funded");
        
        // Fetch the active flag correctly from the Agent Registry profile
        (, , , , bool isActive) = agentRegistry.agents(_agent);
        require(isActive, "Target AI Agent is not active or verified");

        uint256 jobId = jobCounter++;
        jobs[jobId] = Job({
            creator: msg.sender,
            agent: _agent,
            payment: msg.value,
            status: JobStatus.ACTIVE,
            prompt: _prompt
        });

        emit JobCreated(jobId, msg.sender, _agent, msg.value);
        return jobId;
    }

    // Called by the gateway server once proof of provenance emission is anchored
    function settleJob(uint256 _jobId, string calldata _stampId) external {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.ACTIVE, "Job not active");
        
        // Read the exact parameters from the custom structural layout
        (, , address registeredAgent, address registeredCreator, , , ) = provenanceRegistry.stamps(_stampId);
        require(registeredAgent == job.agent && registeredCreator == job.creator, "Provenance verification mismatch");

        job.status = JobStatus.COMPLETED;
        payable(job.agent).transfer(job.payment); // Safely distribute funds to the working AI provider node

        emit JobSettled(_jobId, _stampId);
    }
}
