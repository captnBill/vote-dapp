// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleVote {
    address public owner;
    string[] public candidates;
    mapping(uint => uint) public voteCount;     // candidateId -> votes
    mapping(address => bool) public hasVoted;   // adresse -> a déjà voté ?
    bool public votingOpen;

    event Voted(address indexed voter, uint indexed candidateId);
    event CandidateAdded(string name);
    event VotingClosed();

    modifier onlyOwner() { 
        require(msg.sender == owner, "Not owner"); 
        _; 
    }

    modifier voteIsOpen() {
        require(votingOpen, "Voting closed");
        _;
    }

    constructor(string[] memory _candidates) {
        owner = msg.sender;
        if (_candidates.length > 0) {
            for (uint i = 0; i < _candidates.length; i++) {
                candidates.push(_candidates[i]);
            }
        }
        votingOpen = true;
    }

    function candidatesCount() external view returns (uint) {
        return candidates.length;
    }

    function addCandidate(string memory name) external onlyOwner {
        require(bytes(name).length > 0, "Name cannot be empty");
        candidates.push(name);
        emit CandidateAdded(name);
    }

    function vote(uint candidateId) external voteIsOpen {
        require(!hasVoted[msg.sender], "Already voted");
        require(candidateId < candidates.length, "Invalid candidate");
        hasVoted[msg.sender] = true;
        voteCount[candidateId] += 1;
        emit Voted(msg.sender, candidateId);
    }

    function closeVoting() external onlyOwner voteIsOpen {
        votingOpen = false;
        emit VotingClosed();
    }

    function getResults() external view returns (string[] memory names, uint[] memory counts) {
        uint len = candidates.length;
        uint[] memory countsArr = new uint[](len);
        for (uint i = 0; i < len; i++) {
            countsArr[i] = voteCount[i];
        }
        return (candidates, countsArr);
    }
}
