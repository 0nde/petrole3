// ═══════════════════════════════════════════════════════════════════════════════
// ACTION JAVASCRIPT — Générateur de rapport de déploiement
// ═══════════════════════════════════════════════════════════════════════════════
//
// 📚 VUE D'ENSEMBLE PÉDAGOGIQUE :
// C'est le point d'entrée principal de l'action JavaScript.
// Il utilise le toolkit @actions/core pour interagir avec GitHub Actions.
//
// 🎯 MODULES CLÉS DU TOOLKIT :
// ┌──────────────────┬──────────────────────────────────────────────────────┐
// │ Module           │ Utilité                                              │
// ├──────────────────┼──────────────────────────────────────────────────────┤
// │ @actions/core    │ Entrées, sorties, logs, résumés, annotations        │
// │ @actions/github  │ Client Octokit pour l'API GitHub (PRs, issues...)   │
// │ @actions/exec    │ Exécuter des commandes shell avec sortie streaming  │
// │ @actions/io      │ Utilitaires fichiers (cp, mv, rmRF, which)          │
// │ @actions/cache   │ Cache de dépendances entre les exécutions           │
// └──────────────────┴──────────────────────────────────────────────────────┘
//
// 💡 RÉSUMÉS DE JOB (GITHUB_STEP_SUMMARY) :
// Les résumés de job apparaissent dans l'UI Actions comme du Markdown riche.
// Parfaits pour les rapports de déploiement, résultats de tests, métriques, etc.
//
// ⚠️ NOTE SUR LES DÉPENDANCES :
// @actions/core et @actions/github sont pré-installés sur les runners GitHub.
// Pour le développement local : npm install @actions/core @actions/github
//
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTS
// ─────────────────────────────────────────────────────────────────────────────
// 📖 EXPLICATION :
// On utilise require() au lieu de import car GitHub Actions attend
// actuellement des modules CommonJS.
// ─────────────────────────────────────────────────────────────────────────────
const core = require("@actions/core");
const github = require("@actions/github");

// ─────────────────────────────────────────────────────────────────────────────
// FONCTION PRINCIPALE
// ─────────────────────────────────────────────────────────────────────────────
async function run() {
  try {
    // ─────────────────────────────────────────────────────────────────────────
    // ÉTAPE 1 : Lire les entrées depuis action.yml
    // ─────────────────────────────────────────────────────────────────────────
    // 📖 core.getInput() lit les valeurs de la section 'with:' des workflows.
    // Il gère automatiquement les champs requis/optionnels et valeurs par défaut.
    // ─────────────────────────────────────────────────────────────────────────
    const environment = core.getInput("environment", { required: true });
    const status = core.getInput("status") || "success";
    const frontendUrl = core.getInput("frontend-url");
    const backendUrl = core.getInput("backend-url");
    const deployDuration = core.getInput("deploy-duration") || "0";

    // ─────────────────────────────────────────────────────────────────────────
    // ÉTAPE 2 : Récupérer le contexte de l'événement GitHub
    // ─────────────────────────────────────────────────────────────────────────
    // 📖 github.context fournit les métadonnées sur l'exécution du workflow :
    //    - repo: { owner, repo } — infos du dépôt
    //    - sha: SHA complet du commit déclencheur
    //    - actor: Utilisateur GitHub ayant déclenché le workflow
    //    - runId: ID unique de cette exécution
    //    - workflow: Nom du fichier workflow
    // ─────────────────────────────────────────────────────────────────────────
    const { context } = github;
    const { owner, repo } = context.repo;
    const sha = context.sha;
    const shortSha = sha.substring(0, 7);
    const actor = context.actor;
    const runId = context.runId;
    const runUrl = `https://github.com/${owner}/${repo}/actions/runs/${runId}`;
    const commitUrl = `https://github.com/${owner}/${repo}/commit/${sha}`;
    const timestamp = new Date().toISOString();

    // ─────────────────────────────────────────────────────────────────────────
    // ÉTAPE 3 : Déterminer les indicateurs de statut
    // ─────────────────────────────────────────────────────────────────────────
    const isSuccess = status === "success";
    const statusEmoji = isSuccess ? "✅" : "❌";
    const statusText = isSuccess ? "SUCCÈS" : "ÉCHEC";
    const envEmoji = environment === "production" ? "🔴" : "🟡";
    const envLabel =
      environment === "production"
        ? "Production"
        : "Développement";

    // ─────────────────────────────────────────────────────────────────────────
    // ÉTAPE 4 : Formater la durée du déploiement
    // ─────────────────────────────────────────────────────────────────────────
    const durationSec = parseInt(deployDuration, 10);
    const minutes = Math.floor(durationSec / 60);
    const seconds = durationSec % 60;
    const durationStr =
      durationSec > 0 ? `${minutes}m ${seconds}s` : "N/A";

    // ─────────────────────────────────────────────────────────────────────────
    // ÉTAPE 5 : Construire le rapport Markdown
    // ─────────────────────────────────────────────────────────────────────────
    // 📖 Les résumés de job utilisent le Markdown GitHub (GFM) standard.
    // Tables, liens, images, blocs de code — tout est supporté.
    // ─────────────────────────────────────────────────────────────────────────
    let report = "";

    // En-tête
    report += `## ${statusEmoji} Rapport de Déploiement\n\n`;

    // Tableau de statut
    report += `| Propriété | Valeur |\n`;
    report += `|:----------|:-------|\n`;
    report += `| **Statut** | ${statusEmoji} ${statusText} |\n`;
    report += `| **Environnement** | ${envEmoji} ${envLabel} |\n`;
    report += `| **Commit** | [\`${shortSha}\`](${commitUrl}) |\n`;
    report += `| **Déclenché par** | @${actor} |\n`;
    report += `| **Durée** | ${durationStr} |\n`;
    report += `| **Horodatage** | ${timestamp} |\n`;
    report += `| **Exécution Workflow** | [#${runId}](${runUrl}) |\n`;
    report += `\n`;

    // Section URLs (seulement si fournies)
    if (frontendUrl || backendUrl) {
      report += `### 🌐 URLs Déployées\n\n`;
      if (frontendUrl) {
        report += `- **Frontend**: [${frontendUrl}](https://${frontendUrl})\n`;
      }
      if (backendUrl) {
        report += `- **Backend API**: [${backendUrl}](https://${backendUrl})\n`;
      }
      report += `\n`;
    }

    // Section conseils
    if (isSuccess) {
      report += `### 💡 Prochaines Étapes\n\n`;
      if (environment === "development") {
        report += `- Testez vos changements sur l'environnement dev\n`;
        report += `- Quand c'est prêt, mergez sur \`main\` pour déployer en prod\n`;
      } else {
        report += `- Surveillez les logs applicatifs pour détecter des problèmes\n`;
        report += `- Vérifiez que les parcours utilisateurs clés fonctionnent\n`;
      }
    } else {
      report += `### 🔧 Dépannage\n\n`;
      report += `- Consultez les [logs du workflow](${runUrl}) pour les détails\n`;
      report += `- Causes fréquentes : erreurs de build, credentials AWS, timeouts\n`;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ÉTAPE 6 : Écrire dans le résumé de job
    // ─────────────────────────────────────────────────────────────────────────
    // 📖 core.summary écrit dans $GITHUB_STEP_SUMMARY, qui s'affiche comme
    // du Markdown riche dans l'UI Actions.
    //
    // 💡 MÉTHODES DISPONIBLES sur core.summary :
    //    .addRaw(text)       — Ajouter du Markdown brut
    //    .addHeading(text,n) — Ajouter un titre (h1-h6)
    //    .addTable(rows)     — Ajouter un tableau HTML
    //    .addList(items)     — Ajouter une liste à puces
    //    .addCodeBlock(code) — Ajouter un bloc de code
    //    .write()            — Écrire dans le fichier
    // ─────────────────────────────────────────────────────────────────────────
    await core.summary.addRaw(report).write();

    // ─────────────────────────────────────────────────────────────────────────
    // ÉTAPE 7 : Définir les sorties et logger
    // ─────────────────────────────────────────────────────────────────────────
    // 📖 core.setOutput() rend les valeurs disponibles aux étapes suivantes
    // via ${{ steps.<id>.outputs.<name> }}
    //
    // 💡 NIVEAUX DE LOG :
    //    core.info()    — Info standard (toujours visible)
    //    core.warning() — Annotation jaune d'avertissement
    //    core.error()   — Annotation rouge d'erreur
    //    core.notice()  — Annotation bleue d'information
    //    core.debug()   — Visible uniquement avec ACTIONS_STEP_DEBUG=true
    // ─────────────────────────────────────────────────────────────────────────
    core.setOutput("report-md", report);

    core.info(`📋 Deployment report generated for ${environment}`);
    core.info(`   Status: ${statusText}`);
    core.info(`   Commit: ${shortSha}`);
    core.info(`   Actor:  ${actor}`);

    if (!isSuccess) {
      core.warning(
        `Deployment to ${environment} failed — check logs for details`
      );
    }
  } catch (error) {
    // ─────────────────────────────────────────────────────────────────────────
    // GESTION D'ERREUR
    // ─────────────────────────────────────────────────────────────────────────
    // 📖 core.setFailed() marque l'action comme échouée et définit le message.
    // C'est la manière standard de signaler les erreurs dans les actions JS.
    // ─────────────────────────────────────────────────────────────────────────
    core.setFailed(`Action failed: ${error.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POINT D'ENTRÉE — Exécuter la fonction principale
// ─────────────────────────────────────────────────────────────────────────────
run();
