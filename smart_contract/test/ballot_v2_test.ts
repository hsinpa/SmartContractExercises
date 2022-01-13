import { isBigNumberish } from "@ethersproject/bignumber/lib/bignumber";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat";
import { float } from "hardhat/internal/core/params/argumentTypes";

describe("Ballot contract", function () {
  
    let Token : ContractFactory;
    let hardhatToken : Contract;
    let owner : SignerWithAddress;
    let addr1 : SignerWithAddress;
    let addr2 : SignerWithAddress;
    let addrs : SignerWithAddress[];

    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
        Token = await ethers.getContractFactory("VoteBallotV2");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    
        // To deploy our contract, we just have to call Token.deploy() and await
        // for it to be deployed(), which happens once its transaction has been
        // mined.
        hardhatToken = await Token.deploy();
      });

    describe("Deployment", function () {
        it("Init State should be End", async function () { 
            expect(await hardhatToken.CurrentPhase()).equal(1);
        });
        // expect(await hardhatToken.CurrentPhase()).equal(0);

        it("Phase state should be Start", async function () { 
            await hardhatToken.StartNewPhase();

            expect(await hardhatToken.CurrentPhase()).equal(0);
        });

        it("I am rich should return eth", async function () { 
            await hardhatToken.StartNewPhase();
            const options = {value: ethers.utils.parseEther("2.0")}
            await hardhatToken.connect(addr1).Vote(1, options);

            await hardhatToken.connect(addr2).Vote(2, options);

            await hardhatToken.connect(owner).EndVotePhase();
            let contractBalance = ethers.utils.formatEther(await hardhatToken.provider.getBalance(hardhatToken.address));

            let isContractEqual = contractBalance === "4.0";
            console.log(isContractEqual);
            expect(isContractEqual).equal(true);

            await hardhatToken.IamRich();
            
            let fuckingRichStr = ethers.utils.formatEther(await hardhatToken.provider.getBalance(owner.address));
            contractBalance = ethers.utils.formatEther(await hardhatToken.provider.getBalance(hardhatToken.address));

            let fuckingRich = parseFloat(fuckingRichStr);
            expect(fuckingRich).gte(10000);
            expect(contractBalance).equal("0.0");
        });
    });

});