 // SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract VoteBallotV2 {

    struct UserCommitment {
        uint8 id;
        uint8 weight;
        uint balance;
        uint8 session;
    }

    mapping(address => UserCommitment) Users;

    enum Phase {Vote, End}
    Phase public CurrentPhase; 

    uint8 public ballot_session;
    address payable private _host;

    event Received(address, uint);

    modifier ValidPhase(Phase p_phase) {
        require(CurrentPhase == p_phase);
        _;
    }

    modifier ValidUserStatus(UserCommitment storage user) {
        require(user.id == 0 && user.session < ballot_session, "Only user without vote");
        _;
    }

    modifier IsHost() {
        require(msg.sender == _host);
        _;
    }

    constructor() payable {
        _host = payable(msg.sender);
        ballot_session = 0;
        CurrentPhase = Phase.End;
    }

    function GetContractBalance() public view returns(uint){
        return address(this).balance;
    }

    function StartNewPhase() public IsHost ValidPhase(Phase.End){
        ballot_session += 1;
        CurrentPhase = Phase.Vote;
    }

    function EndVotePhase() public IsHost{
        CurrentPhase = Phase.End;
    }

    function Vote(uint8 project_id) public payable ValidPhase(Phase.Vote) ValidUserStatus(Users[msg.sender]) {
        if (project_id <= 0) revert("No projet index lower than 0");
        Users[msg.sender].id = project_id;
        Users[msg.sender].balance = msg.value;
        Users[msg.sender].weight = 1;
        Users[msg.sender].session = ballot_session;

        (bool sent, bytes memory data) = address(this).call{value: msg.value}("");
        require(sent, "Failed to send Ether");
    }

    function IamRich() public payable ValidPhase(Phase.End) IsHost {
        (bool sent, bytes memory data) = _host.call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    fallback() external payable { 
    
    }
}
