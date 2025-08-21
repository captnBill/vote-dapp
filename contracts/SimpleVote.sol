// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleVote {
    address public owner;
    string[] public candidates;
    mapping(uint => uint) public voteCount;     // candidateId -> votes
    mapping(address => bool) public hasVoted;   // adresse -> a déjà voté ?
    bool public votingOpen;

    event Voted(address indexed voter, uint indexed candidateId);

    constructor(string[] memory _candidates) {
        require(_candidates.length > 0, "No candidates");
        owner = msg.sender;
        candidates = _candidates;
        votingOpen = true;
    }

    modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }

    function candidatesCount() external view returns (uint) {
        return candidates.length;
    }

    function vote(uint candidateId) external {
        require(votingOpen, "Voting closed");
        require(!hasVoted[msg.sender], "Already voted");
        require(candidateId < candidates.length, "Invalid candidate");
        hasVoted[msg.sender] = true;
        voteCount[candidateId] += 1;
        emit Voted(msg.sender, candidateId);
    }

    function closeVoting() external onlyOwner {
        votingOpen = false;
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
