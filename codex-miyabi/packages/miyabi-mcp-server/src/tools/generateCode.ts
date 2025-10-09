/**
 * generateCode Tool
 *
 * サブタスクに対してコードを生成
 */

import { AnthropicClient } from "../utils/AnthropicClient.js";
import { BudgetManager } from "../utils/BudgetManager.js";

export interface GenerateCodeInput {
  taskId: string;
  requirements: string;
  context: {
    repository: string;
    baseBranch: string;
    relatedFiles: string[];
  };
}

export interface GenerateCodeOutput {
  files: Array<{
    path: string;
    content: string;
    action: "create" | "modify" | "delete";
  }>;
  tests: Array<{
    path: string;
    content: string;
  }>;
  qualityScore: number;
  costUsd: number;
  tokensUsed: number;
}

export async function generateCode(
  input: GenerateCodeInput,
  anthropic: AnthropicClient,
  budget: BudgetManager
): Promise<GenerateCodeOutput> {
  // 予算チェック
  const estimatedCost = 0.3;
  const budgetCheck = await budget.checkBudget("generateCode", estimatedCost);

  if (!budgetCheck.allowed) {
    throw new Error(budgetCheck.message);
  }

  // コンテキスト構築
  const context = `
Repository: ${input.context.repository}
Base Branch: ${input.context.baseBranch}
Related Files: ${input.context.relatedFiles.join(", ")}
`;

  // Claude Sonnet 4でコード生成
  const result = await anthropic.generateCode(
    input.requirements,
    context,
    "typescript"
  );

  // コスト計算と記録
  const actualCost = budget.calculateCost(
    "claude-sonnet-4-20250514",
    result.tokensUsed.input,
    result.tokensUsed.output
  );

  budget.trackUsage({
    operation: "generateCode",
    costUsd: actualCost,
    tokensUsed: result.tokensUsed.input + result.tokensUsed.output,
    model: "claude-sonnet-4-20250514",
  });

  return {
    files: result.files,
    tests: result.tests,
    qualityScore: result.qualityScore,
    costUsd: actualCost,
    tokensUsed: result.tokensUsed.input + result.tokensUsed.output,
  };
}
