// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AgentRegistry {
    struct Agent {
        string modelName;
        string modelWeightsHash; // Cryptographic commitment to model parameters
        uint256 stake;
        uint256 reputation; // Scale 0-100
        bool isActive;
    }

    mapping(address => Agent) public agents;
    address public owner;
    uint256 public constant MINIMUM_STAKE = 10 ether; // Requiring skin-in-the-game

    event AgentRegistered(address indexed agentAddress, string modelName, uint256 stake);
    event AgentSlashed(address indexed agentAddress, uint256 amount, string reason);
    event ReputationUpdated(address indexed agentAddress, uint256 newReputation);

    modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }
    modifier onlyActiveAgent(address _agent) { require(agents[_agent].isActive, "Agent not active"); _; }

    constructor() { owner = msg.sender; }

    function registerAgent(string calldata _modelName, string calldata _weightsHash) external payable {
        require(msg.value >= MINIMUM_STAKE, "Insufficient registration stake");
        require(!agents[msg.sender].isActive, "Agent already registered");

        agents[msg.sender] = Agent({
            modelName: _modelName,
            modelWeightsHash: _weightsHash,
            stake: msg.value,
            reputation: 100, // Starts at perfect score
            isActive: true
        });

        emit AgentRegistered(msg.sender, _modelName, msg.value);
    }

    function updateReputation(address _agent, uint256 _score) external onlyOwner {
        require(_score <= 100, "Invalid score");
        agents[_agent].reputation = _score;
        emit ReputationUpdated(_agent, _score);
    }

    function slashAgent(address _agent, uint256 _amount, string calldata _reason) external onlyOwner {
        Agent storage agent = agents[_agent];
        require(agent.stake >= _amount, "Slash amount exceeds stake");
        
        agent.stake -= _amount;
        payable(owner).transfer(_amount); // Pull funds to treasury or refund pool

        if(agent.stake < MINIMUM_STAKE) {
            agent.isActive = false;
        }

        emit AgentSlashed(_agent, _amount, _reason);
    }
}
