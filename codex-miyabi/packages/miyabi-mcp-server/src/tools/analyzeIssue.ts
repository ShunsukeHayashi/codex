/**
 * analyzeIssue Tool
 *
 * GitHubのIssueを解析し、適切なラベルと複雑度を判定
 */

import { GitHubClient } from "../utils/GitHubClient.js";
import { AnthropicClient } from "../utils/AnthropicClient.js";
import { BudgetManager } from "../utils/BudgetManager.js";

// ラベル体系（116ラベル、15カテゴリー）
const LABEL_SYSTEM = `
## Type (6)
- 🐛 type:bug, ✨ type:feature, ♻️ type:refactor, 📝 type:docs, 🧪 type:test, 🔧 type:chore

## Priority (4)
- 🔥 priority:P0-Critical, 🚨 priority:P1-High, 📊 priority:P2-Medium, 📌 priority:P3-Low

## Complexity (4)
- complexity:small, complexity:medium, complexity:large, complexity:xlarge

## Effort (6)
- effort:1h, effort:4h, effort:1d, effort:3d, effort:1w, effort:2w

## Category (5)
- category:frontend, category:backend, category:infra, category:dx, category:security
`;

export interface AnalyzeIssueInput {
  issueNumber: number;
  repository: string; // "owner/repo"
}

export interface AnalyzeIssueOutput {
  labels: string[];
  complexity: "small" | "medium" | "large" | "xlarge";
  estimatedEffort: string;
  priority: "P0" | "P1" | "P2" | "P3";
  type: "bug" | "feature" | "refactor" | "docs" | "test" | "chore";
  assignedAgent: string;
  costUsd: number;
  tokensUsed: number;
}

export async function analyzeIssue(
  input: AnalyzeIssueInput,
  github: GitHubClient,
  anthropic: AnthropicClient,
  budget: BudgetManager
): Promise<AnalyzeIssueOutput> {
  const [owner, repo] = input.repository.split("/");

  // 1. 予算チェック（推定コスト: $0.02）
  const estimatedCost = 0.023;
  const budgetCheck = await budget.checkBudget("analyzeIssue", estimatedCost);

  if (!budgetCheck.allowed) {
    throw new Error(budgetCheck.message);
  }

  if (budgetCheck.warning) {
    console.warn(budgetCheck.message);
  }

  // 2. Issueを取得
  const issue = await github.getIssue(owner, repo, input.issueNumber);

  // 3. Claude Sonnet 4で分析
  const analysis = await anthropic.analyzeIssue(
    issue.title,
    issue.body,
    LABEL_SYSTEM
  );

  // 4. ラベルを追加
  await github.addLabels(owner, repo, input.issueNumber, analysis.labels);

  // 5. コスト計算と記録
  const actualCost = budget.calculateCost(
    "claude-sonnet-4-20250514",
    analysis.tokensUsed.input,
    analysis.tokensUsed.output
  );

  budget.trackUsage({
    operation: "analyzeIssue",
    costUsd: actualCost,
    tokensUsed: analysis.tokensUsed.input + analysis.tokensUsed.output,
    model: "claude-sonnet-4-20250514",
  });

  // 6. Agent割り当て
  let assignedAgent = "coordinator";
  if (analysis.type === "bug") {
    assignedAgent = "codegen";
  } else if (analysis.type === "feature") {
    assignedAgent = "coordinator"; // タスク分解が必要
  } else if (analysis.type === "docs") {
    assignedAgent = "doc";
  }

  return {
    labels: analysis.labels,
    complexity: analysis.complexity,
    estimatedEffort: analysis.estimatedEffort,
    priority: analysis.priority,
    type: analysis.type,
    assignedAgent,
    costUsd: actualCost,
    tokensUsed: analysis.tokensUsed.input + analysis.tokensUsed.output,
  };
}
