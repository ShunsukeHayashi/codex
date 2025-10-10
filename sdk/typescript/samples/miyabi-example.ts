/**
 * Miyabi Multi-Agent System - Complete Example
 *
 * This example demonstrates the full capabilities of the Miyabi integration
 * for autonomous development workflows.
 */

import { MiyabiAgents } from "@openai/codex-sdk/miyabi";

async function main() {
  // Initialize Miyabi with configuration
  const miyabi = new MiyabiAgents({
    githubToken: process.env.GITHUB_TOKEN!,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  });

  const repository = "openai/codex";
  const issueNumber = 42;

  console.log("🤖 Miyabi Multi-Agent System - Demo\n");

  // ============================================================================
  // 1. Check Budget Status
  // ============================================================================
  console.log("📊 Checking budget status...");
  const budget = await miyabi.checkBudget();

  console.log(`  Monthly Budget: $${budget.monthlyBudgetUsd}`);
  console.log(`  Current Spend: $${budget.currentSpendUsd}`);
  console.log(`  Remaining: $${budget.remainingBudgetUsd}`);
  console.log(`  Usage: ${budget.usagePercentage}%\n`);

  if (budget.isEmergency) {
    console.error("🚨 Budget emergency! Stopping execution.");
    process.exit(1);
  }

  if (budget.isWarning) {
    console.warn("⚠️  Budget warning: 80% threshold exceeded\n");
  }

  // ============================================================================
  // 2. Analyze GitHub Issue
  // ============================================================================
  console.log(`🔍 Analyzing issue #${issueNumber}...`);
  const analysis = await miyabi.analyzeIssue({
    issueNumber,
    repository,
  });

  console.log(`  Title: ${analysis.issue.title}`);
  console.log(`  Priority: ${analysis.issue.priority}`);
  console.log(`  Complexity: ${analysis.issue.complexity}`);
  console.log(`  Type: ${analysis.issue.type}`);
  console.log(`  Suggested Labels: ${analysis.suggestedLabels.join(", ")}`);
  console.log(`  Estimated Time: ${analysis.estimatedTime} minutes\n`);

  // ============================================================================
  // 3. Decompose Complex Task into Subtasks
  // ============================================================================
  if (analysis.issue.complexity === "large" || analysis.issue.complexity === "xlarge") {
    console.log("📋 Task is complex, decomposing into subtasks...");
    const dag = await miyabi.decomposeTask({
      issueNumber,
      repository,
    });

    console.log(`  Total Subtasks: ${dag.nodes.length}`);
    console.log(`  Dependencies: ${dag.edges.length}\n`);

    console.log("  Subtasks:");
    for (const node of dag.nodes) {
      console.log(`    - ${node.description} (${node.estimatedTime}min)`);
    }
    console.log();
  }

  // ============================================================================
  // 4. Complete Workflow: Issue → Code → Review → PR (Parallel Execution)
  // ============================================================================
  console.log("⚡ Running parallel agent workflow...");
  console.log("  Agents: Issue Analysis → Code Generation → Review → PR Creation");
  console.log("  Concurrency: 3 agents running in parallel\n");

  const startTime = Date.now();

  const result = await miyabi.runParallel({
    issueNumber,
    repository,
    agents: ["issue", "codegen", "review", "pr"],
    concurrency: 3,
  });

  const duration = Date.now() - startTime;

  if (result.success) {
    console.log("✅ Workflow completed successfully!\n");

    console.log("  Agent Results:");
    for (const [agentName, agentResult] of Object.entries(result.results)) {
      console.log(`    - ${agentName}: ${agentResult.success ? "✅ Success" : "❌ Failed"}`);
    }

    console.log(`\n  ⏱️  Total Execution Time: ${duration}ms`);

    if (result.prUrl) {
      console.log(`  🔗 Pull Request: ${result.prUrl}\n`);
    }
  } else {
    console.error("❌ Workflow failed\n");
  }

  // ============================================================================
  // 5. Individual Agent Operations (Alternative Approach)
  // ============================================================================
  console.log("🔧 Alternative: Running agents individually...\n");

  // Generate code
  console.log("  1. Generating code...");
  const codeResult = await miyabi.generateCode({
    issueNumber,
    repository,
    context: "Use TypeScript with strict mode and comprehensive error handling",
  });

  console.log(`     Generated ${codeResult.files.length} files`);
  for (const file of codeResult.files) {
    console.log(`       - ${file.action.toUpperCase()}: ${file.path}`);
  }

  // Run tests
  console.log("\n  2. Running tests...");
  const testResult = await miyabi.runTests({
    repository,
    testPattern: "**/*.test.ts",
  });

  console.log(`     Passed: ${testResult.passedTests}/${testResult.totalTests}`);
  console.log(`     Coverage: ${testResult.coverage}%`);

  if (testResult.failures.length > 0) {
    console.log("     Failures:");
    for (const failure of testResult.failures) {
      console.log(`       - ${failure.testName}: ${failure.errorMessage}`);
    }
  }

  // Review code quality
  console.log("\n  3. Reviewing code quality...");
  const review = await miyabi.reviewCode({
    prNumber: 123, // Assuming PR #123 was created
    repository,
  });

  console.log(`     Quality Score: ${review.qualityScore}/100`);
  console.log(`     Passed: ${review.passed ? "✅" : "❌"}`);
  console.log(`     Issues Found: ${review.issues.length}`);
  console.log(`     Suggestions: ${review.suggestions.length}\n`);

  if (!review.passed) {
    console.log("     Quality Issues:");
    for (const issue of review.issues.slice(0, 5)) {
      // Show first 5
      console.log(`       [${issue.severity.toUpperCase()}] ${issue.file}:${issue.line || "?"}`);
      console.log(`       ${issue.message}`);
    }
  }

  // ============================================================================
  // 6. GitHub Projects V2 Integration
  // ============================================================================
  console.log("\n📊 Checking GitHub project status...");
  const projectStatus = await miyabi.getProjectStatus({
    repository,
    projectName: "Codex Development",
  });

  console.log("  Project Status:", JSON.stringify(projectStatus, null, 2));

  // ============================================================================
  // 7. Final Budget Check
  // ============================================================================
  console.log("\n💰 Final budget check...");
  const finalBudget = await miyabi.checkBudget();

  console.log(`  Total Spend: $${finalBudget.currentSpendUsd}`);
  console.log(`  Remaining: $${finalBudget.remainingBudgetUsd}`);
  console.log(`  Usage: ${finalBudget.usagePercentage}%\n`);

  console.log("🎉 Demo completed successfully!");
}

// Run the example
main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
