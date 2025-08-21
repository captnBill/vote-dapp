const fs = require("fs");
const hre = require("hardhat");

async function main() {
  const candidates = ["Alice", "Bob", "Charlie"];

  const Vote = await hre.ethers.getContractFactory("SimpleVote");
  const vote = await Vote.deploy(candidates);
  await vote.deployed();

  const [owner, ...signers] = await hre.ethers.getSigners();

  // Votes simulés : 2x Alice, 3x Bob, 1x Charlie
  await vote.connect(signers[0]).vote(1); // Bob
  await vote.connect(signers[1]).vote(1); // Bob
  await vote.connect(signers[2]).vote(0); // Alice
  await vote.connect(signers[3]).vote(2); // Charlie
  await vote.connect(signers[4]).vote(1); // Bob
  await vote.connect(signers[5]).vote(0); // Alice

  const [names, countsBN] = await vote.getResults();
  const counts = countsBN.map((c) => Number(c));
  const out = names.map((n, i) => ({ candidate: n, votes: counts[i] }));

  console.log("Résultats finaux :", out);
  fs.writeFileSync("results.json", JSON.stringify(out, null, 2));
  console.log('Résultats écrits dans "results.json"');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
