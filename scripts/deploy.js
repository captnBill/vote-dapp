const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Déploiement avec le compte :", deployer.address);

  const candidates = ["Alice", "Bob", "Charlie"];
  const Vote = await hre.ethers.getContractFactory("SimpleVote");

  console.log("Déploiement du contrat...");
  const vote = await Vote.deploy(candidates);
  await vote.deployed(); // attend que le contrat soit réellement déployé
  console.log("✅ SimpleVote déployé à :", vote.address);
  console.log("Owner :", deployer.address);

  // Écrire l'adresse du contrat dans contractAddress.txt pour la CLI
  const filePath = path.join(__dirname, "contractAddress.txt");
  try {
    fs.writeFileSync(filePath, vote.address, "utf8");
    console.log(`Adresse du contrat écrite dans : ${filePath}`);
  } catch (err) {
    console.error("❌ Erreur lors de l'écriture du fichier :", err);
  }
}

main().catch((error) => {
  console.error("❌ Erreur lors du déploiement :", error);
  process.exit(1);
});
