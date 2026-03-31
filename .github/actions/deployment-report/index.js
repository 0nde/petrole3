// ═══════════════════════════════════════════════════════════════════════════════
// JAVASCRIPT ACTION — Deployment Report Generator
// ═══════════════════════════════════════════════════════════════════════════════
//
// 📚 PEDAGOGICAL OVERVIEW / VUE D'ENSEMBLE PÉDAGOGIQUE:
// This is the main entry point for the JavaScript action.
// It uses the @actions/core toolkit to interact with GitHub Actions.
//
// C'est le point d'entrée principal de l'action JavaScript.
// Il utilise le toolkit @actions/core pour interagir avec GitHub Actions.
//
// 🎯 KEY TOOLKIT MODULES / MODULES CLÉS DU TOOLKIT:
// ┌──────────────────┬──────────────────────────────────────────────────────┐
// │ Module           │ Purpose / Utilité                                    │
// ├──────────────────┼──────────────────────────────────────────────────────┤
// │ @actions/core    │ Inputs, outputs, logging, summaries, annotations    │
// │ @actions/github  │ Octokit client for GitHub API (PRs, issues, etc.)   │
// │ @actions/exec    │ Run shell commands with streaming output            │
// │ @actions/io      │ File system utilities (cp, mv, rmRF, which)         │
// │ @actions/cache   │ Cache dependencies between workflow runs            │
// └──────────────────┴──────────────────────────────────────────────────────┘
//
// 💡 JOB SUMMARIES (GITHUB_STEP_SUMMARY):
// Job summaries appear in the Actions UI as rich Markdown content.
// They're perfect for deployment reports, test results, metrics, etc.
// Les résumés de job apparaissent dans l'UI Actions comme du Markdown riche.
//
// ⚠️ NOTE ON DEPENDENCIES:
// @actions/core and @actions/github are pre-installed on GitHub runners.
// For local development, run: npm install @actions/core @actions/github
// Ces modules sont pré-installés sur les runners GitHub.
//
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTS
// ─────────────────────────────────────────────────────────────────────────────
// 📖 EXPLANATION:
// We use require() instead of import because GitHub Actions currently
// expects CommonJS modules. The @actions/core module provides all the
// methods we need to interact with the workflow runner.
//
// On utilise require() au lieu de import car GitHub Actions attend
// actuellement des modules CommonJS.
// ─────────────────────────────────────────────────────────────────────────────
const core = require("@actions/core");
const github = require("@actions/github");

// ─────────────────────────────────────────────────────────────────────────────
// MAIN FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
async function run() {
  try {
    // ─────────────────────────────────────────────────────────────────────────
    // STEP 1: Read inputs from action.yml
    // ─────────────────────────────────────────────────────────────────────────
    // 📖 core.getInput() reads values from the 'with:' section in workflows.
    //    It automatically handles required/optional and default values.
    //
    // core.getInput() lit les valeurs de la section 'with:' des workflows.
    // Il gère automatiquement les champs requis/optionnels et valeurs par défaut.
    // ─────────────────────────────────────────────────────────────────────────
    const environment = core.getInput("environment", { required: true });
    const status = core.getInput("status") || "success";
    const frontendUrl = core.getInput("frontend-url");
    const backendUrl = core.getInput("backend-url");
    const deployDuration = core.getInput("deploy-duration") || "0";

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 2: Gather context from the GitHub event
    // ─────────────────────────────────────────────────────────────────────────
    // 📖 github.context provides metadata about the workflow run:
    //    - repo: { owner, repo } — repository info
    //    - sha: Full commit SHA that triggered the run
    //    - actor: GitHub username who triggered the workflow
    //    - runId: Unique ID of this workflow run
    //    - workflow: Name of the workflow file
    //
    // github.context fournit les métadonnées sur l'exécution du workflow.
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
    // STEP 3: Determine status indicators
    // ─────────────────────────────────────────────────────────────────────────
    const isSuccess = status === "success";
    const statusEmoji = isSuccess ? "✅" : "❌";
    const statusText = isSuccess ? "SUCCESS / SUCCÈS" : "FAILURE / ÉCHEC";
    const envEmoji = environment === "production" ? "🔴" : "🟡";
    const envLabel =
      environment === "production"
        ? "Production"
        : "Development / Développement";

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 4: Format deployment duration
    // ─────────────────────────────────────────────────────────────────────────
    const durationSec = parseInt(deployDuration, 10);
    const minutes = Math.floor(durationSec / 60);
    const seconds = durationSec % 60;
    const durationStr =
      durationSec > 0 ? `${minutes}m ${seconds}s` : "N/A";

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 5: Build the Markdown report
    // ─────────────────────────────────────────────────────────────────────────
    // 📖 Job Summaries use standard GitHub Flavored Markdown (GFM).
    //    Tables, links, images, code blocks — all supported.
    //
    // Les résumés de job utilisent le Markdown GitHub (GFM) standard.
    // Tables, liens, images, blocs de code — tout est supporté.
    // ─────────────────────────────────────────────────────────────────────────
    let report = "";

    // Header
    report += `## ${statusEmoji} Deployment Report / Rapport de Déploiement\n\n`;

    // Status table
    report += `| Property / Propriété | Value / Valeur |\n`;
    report += `|:---------------------|:---------------|\n`;
    report += `| **Status** | ${statusEmoji} ${statusText} |\n`;
    report += `| **Environment / Environnement** | ${envEmoji} ${envLabel} |\n`;
    report += `| **Commit** | [\`${shortSha}\`](${commitUrl}) |\n`;
    report += `| **Triggered by / Déclenché par** | @${actor} |\n`;
    report += `| **Duration / Durée** | ${durationStr} |\n`;
    report += `| **Timestamp / Horodatage** | ${timestamp} |\n`;
    report += `| **Workflow Run** | [#${runId}](${runUrl}) |\n`;
    report += `\n`;

    // URLs section (only if provided)
    if (frontendUrl || backendUrl) {
      report += `### 🌐 Deployed URLs / URLs Déployées\n\n`;
      if (frontendUrl) {
        report += `- **Frontend**: [${frontendUrl}](https://${frontendUrl})\n`;
      }
      if (backendUrl) {
        report += `- **Backend API**: [${backendUrl}](https://${backendUrl})\n`;
      }
      report += `\n`;
    }

    // Tips section
    if (isSuccess) {
      report += `### 💡 Next Steps / Prochaines Étapes\n\n`;
      if (environment === "development") {
        report += `- Test your changes on the dev environment\n`;
        report += `  Testez vos changements sur l'environnement dev\n`;
        report += `- When ready, merge to \`main\` to deploy to production\n`;
        report += `  Quand c'est prêt, mergez sur \`main\` pour déployer en prod\n`;
      } else {
        report += `- Monitor application logs for any issues\n`;
        report += `  Surveillez les logs applicatifs pour détecter des problèmes\n`;
        report += `- Verify key user flows are working\n`;
        report += `  Vérifiez que les parcours utilisateurs clés fonctionnent\n`;
      }
    } else {
      report += `### 🔧 Troubleshooting / Dépannage\n\n`;
      report += `- Check the [workflow logs](${runUrl}) for error details\n`;
      report += `  Consultez les [logs du workflow](${runUrl}) pour les détails\n`;
      report += `- Common causes: build errors, AWS credential issues, timeouts\n`;
      report += `  Causes fréquentes : erreurs de build, credentials AWS, timeouts\n`;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 6: Write to Job Summary
    // ─────────────────────────────────────────────────────────────────────────
    // 📖 core.summary writes to $GITHUB_STEP_SUMMARY, which renders as
    //    rich Markdown in the Actions UI. This is the recommended way to
    //    display structured information in workflow runs.
    //
    // core.summary écrit dans $GITHUB_STEP_SUMMARY, qui s'affiche comme
    // du Markdown riche dans l'UI Actions.
    //
    // 💡 METHODS AVAILABLE ON core.summary:
    //    .addRaw(text)       — Add raw Markdown
    //    .addHeading(text,n) — Add heading (h1-h6)
    //    .addTable(rows)     — Add HTML table
    //    .addList(items)     — Add bullet list
    //    .addCodeBlock(code) — Add code block
    //    .write()            — Flush to file
    // ─────────────────────────────────────────────────────────────────────────
    await core.summary.addRaw(report).write();

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 7: Set outputs and log
    // ─────────────────────────────────────────────────────────────────────────
    // 📖 core.setOutput() makes values available to subsequent steps via
    //    ${{ steps.<id>.outputs.<name> }}
    //
    // core.setOutput() rend les valeurs disponibles aux étapes suivantes.
    //
    // 💡 LOGGING LEVELS:
    //    core.info()    — Standard info (always visible)
    //    core.warning() — Yellow warning annotation
    //    core.error()   — Red error annotation
    //    core.notice()  — Blue notice annotation
    //    core.debug()   — Only visible with ACTIONS_STEP_DEBUG=true
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
    // ERROR HANDLING
    // ─────────────────────────────────────────────────────────────────────────
    // 📖 core.setFailed() marks the action as failed and sets the error message.
    //    This is the standard way to report errors in JS actions.
    //
    // core.setFailed() marque l'action comme échouée et définit le message d'erreur.
    // ─────────────────────────────────────────────────────────────────────────
    core.setFailed(`Action failed: ${error.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTRY POINT — Execute the main function
// ─────────────────────────────────────────────────────────────────────────────
run();
