// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProvenanceRegistry {
    // Defines the two ways an image can be registered
    enum StampKind { ATTESTED, CLAIMED }

    struct Stamp {
        string contentHash;
        string model;
        address agent;
        address creator;
        StampKind kind;
        uint256 timestamp;
        bool revoked;
    }

    // Maps a 40-bit Stamp ID (passed as a string) to its data
    mapping(string => Stamp) public stamps;
    
    // Only authorized gateways (like your Python server) can write "ATTESTED" stamps
    mapping(address => bool) public authorizedGateways;
    address public owner;

    // This is the crucial event Envio will listen to. 
    // We emit the pHash bands here so Envio can index them without paying gas to store them on-chain.
    event Stamped(
        string indexed id,
        string contentHash,
        string band0,
        string band1,
        string band2,
        string band3,
        string band4,
        string band5,
        string band6,
        string band7,
        string model,
        address indexed agent,
        address indexed creator,
        StampKind kind
    );

    constructor() {
        owner = msg.sender;
        authorizedGateways[msg.sender] = true; // Gateway runs from deployer wallet initially
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function addGateway(address _gateway) external onlyOwner {
        authorizedGateways[_gateway] = true;
    }

    function attest(
        string calldata id,
        string calldata contentHash,
        string calldata band0,
        string calldata band1,
        string calldata band2,
        string calldata band3,
        string calldata band4,
        string calldata band5,
        string calldata band6,
        string calldata band7,
        string calldata model,
        address agent,
        address creator
    ) external {
        require(authorizedGateways[msg.sender], "Only gateway can attest");
        require(stamps[id].timestamp == 0, "Stamp ID already exists");

        stamps[id] = Stamp({
            contentHash: contentHash,
            model: model,
            agent: agent,
            creator: creator,
            kind: StampKind.ATTESTED,
            timestamp: block.timestamp,
            revoked: false
        });

        emit Stamped(id, contentHash, band0, band1, band2, band3, band4, band5, band6, band7, model, agent, creator, StampKind.ATTESTED);
    }
}