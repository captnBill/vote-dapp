#!/usr/bin/env node
const hre = require("hardhat");
const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");

async function main() {
  // Compilation pour s'assurer que le contrat est à jour
  await hre.run("compile");

  const [owner, ...signers] = await hre.ethers.getSigners();

  // Récupération de l'adresse du contrat
  const contractPath = path.join(__dirname, "scripts", "contractAddress.txt");
  if (!fs.existsSync(contractPath)) {
    console.error("❌ contractAddress.txt introuvable !");
    process.exit(1);
  }
  const CONTRACT_ADDRESS = fs.readFileSync(contractPath, "utf8").trim();

  // Attachement au contrat déployé
  const VoteFactory = await hre.ethers.getContractFactory("SimpleVote");
  const vote = VoteFactory.attach(CONTRACT_ADDRESS);

  console.log("=== Interface CLI SimpleVote ===\n");
  console.log("Adresse du contrat :", vote.address);

  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "Que voulez-vous faire ?",
        choices: [
          "Ajouter un candidat (Owner)",
          "Voir les candidats",
          "Voter",
          "Voir les résultats",
          "Fermer le vote (Owner)",
          "Quitter"
        ],
      },
    ]);

    if (action === "Quitter") break;

    // Ajouter un candidat
    if (action === "Ajouter un candidat (Owner)") {
      const { name } = await inquirer.prompt([
        { type: "input", name: "name", message: "Nom du candidat :" },
      ]);

      try {
        const tx = await vote.connect(owner).addCandidate(name);
        await tx.wait();
        console.log(`✅ Candidat "${name}" ajouté !`);
      } catch (e) {
        console.log("❌ Erreur :", e.reason || e.message);
      }
      continue;
    }

    // Récupérer le nombre de candidats
    let count = 0;
    try {
      count = (await vote.candidatesCount()).toNumber();
    } catch (e) {
      console.log("⚠️ Impossible de récupérer les candidats :", e.reason || e.message);
      continue;
    }

    // Voir les candidats
    if (action === "Voir les candidats") {
      if (count === 0) {
        console.log("⚠️ Aucun candidat disponible.");
        continue;
      }

      console.log("\nCandidats :");
      for (let i = 0; i < count; i++) {
        const name = await vote.candidates(i);
        console.log(`${i}: ${name}`);
      }
      console.log("");
      continue;
    }

    // Voter
    if (action === "Voter") {
      if (count === 0) {
        console.log("⚠️ Aucun candidat disponible. Impossible de voter.");
        continue;
      }

      const choices = [];
      for (let i = 0; i < count; i++) {
        const name = await vote.candidates(i);
        choices.push({ name, value: i });
      }

      const { candidateId, signerIndex } = await inquirer.prompt([
        { type: "list", name: "candidateId", message: "Pour qui votez-vous ?", choices },
        {
          type: "list",
          name: "signerIndex",
          message: "Sélectionnez un votant",
          choices: signers.map((s, i) => ({ name: s.address, value: i })),
        },
      ]);

      try {
        const tx = await vote.connect(signers[signerIndex]).vote(candidateId);
        await tx.wait();
        console.log("✅ Vote enregistré !");
      } catch (e) {
        console.log("❌ Erreur :", e.reason || e.message);
      }
      continue;
    }

    // Voir les résultats
    if (action === "Voir les résultats") {
      try {
        const [names, countsBN] = await vote.getResults();
        console.log("\nRésultats actuels :");
        names.forEach((n, i) => console.log(`${n}: ${countsBN[i].toNumber()} votes`));
        console.log("");
      } catch (e) {
        console.log("⚠️ Impossible de récupérer les résultats :", e.reason || e.message);
      }
      continue;
    }

    // Fermer le vote
    if (action === "Fermer le vote (Owner)") {
      try {
        const tx = await vote.connect(owner).closeVoting();
        await tx.wait();
        console.log("✅ Vote fermé !");
      } catch (e) {
        console.log("❌ Erreur :", e.reason || e.message);
      }
      continue;
    }
  }

  console.log("\n👋 Merci d'avoir utilisé SimpleVote CLI !");
}

main().catch(e => {
  console.error("❌ Fatal error:", e);
  process.exit(1);
});
