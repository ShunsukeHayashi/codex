/**
 * reviewCode Tool
 *
 * 生成されたコードを品質チェック
 */

import { AnthropicClient } from "../utils/AnthropicClient.js";
import { BudgetManager } from "../utils/BudgetManager.js";

export interface ReviewCodeInput {
  files: Array<{
    path: string;
    content: string;
  }>;
  standards: {
    minQualityScore: number; // default: 80
    requireTests: boolean;
    securityScan: boolean;
  };
}

export interface ReviewCodeOutput {
  qualityScore: number;
  passed: boolean;
  issues: Array<{
    severity: "error" | "warning" | "info";
    file: string;
    line?: number;
    message: string;
  }>;
  coverage: number;
  suggestions: string[];
  costUsd: number;
  tokensUsed: number;
}

export async function reviewCode(
  input: ReviewCodeInput,
  anthropic: AnthropicClient,
  budget: BudgetManager
): Promise<ReviewCodeOutput> {
  // 予算チェック
  const estimatedCost = 0.12;
  const budgetCheck = await budget.checkBudget("reviewCode", estimatedCost);

  if (!budgetCheck.allowed) {
    throw new Error(budgetCheck.message);
  }

  // Claude Sonnet 4でコードレビュー
  const result = await anthropic.reviewCode(input.files, input.standards);

  // コスト計算と記録
  const actualCost = budget.calculateCost(
    "claude-sonnet-4-20250514",
    result.tokensUsed.input,
    result.tokensUsed.output
  );

  budget.trackUsage({
    operation: "reviewCode",
    costUsd: actualCost,
    tokensUsed: result.tokensUsed.input + result.tokensUsed.output,
    model: "claude-sonnet-4-20250514",
  });

  return {
    qualityScore: result.qualityScore,
    passed: result.qualityScore >= input.standards.minQualityScore,
    issues: result.issues,
    coverage: 85, // 簡略実装: 固定値
    suggestions: result.suggestions,
    costUsd: actualCost,
    tokensUsed: result.tokensUsed.input + result.tokensUsed.output,
  };
}
