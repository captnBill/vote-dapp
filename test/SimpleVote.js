const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleVote", function () {
  let vote;
  let candidates;
  let owner, a1, a2, a3;

  beforeEach(async function () {
    // Liste des candidats
    candidates = ["Alice", "Bob", "Charlie"];

    // Signers
    [owner, a1, a2, a3] = await ethers.getSigners();

    // Déploiement du contrat
    const Vote = await ethers.getContractFactory("SimpleVote");
    vote = await Vote.deploy(candidates);
    await vote.deployed(); // Hardhat 2.x utilise .deployed() pour attendre le déploiement
  });

  it("interdit le double vote et compte correctement les votes", async function () {
    // Premier vote valide
    await expect(vote.connect(a1).vote(1))
      .to.emit(vote, "Voted")
      .withArgs(a1.address, 1);

    // Double vote interdit
    await expect(vote.connect(a1).vote(2))
      .to.be.revertedWith("Already voted");

    // Vote pour un candidat invalide
    await expect(vote.connect(a2).vote(5))
      .to.be.revertedWith("Invalid candidate");

    // Autres votes valides
    await vote.connect(a2).vote(1);
    await vote.connect(a3).vote(0);

    // Vérification des résultats
    const [names, countsBN] = await vote.getResults();
    const counts = countsBN.map((c) => Number(c));

    expect(names).to.deep.equal(candidates);
    expect(counts[0]).to.equal(1); // Alice
    expect(counts[1]).to.equal(2); // Bob
    expect(counts[2]).to.equal(0); // Charlie
  });
});
