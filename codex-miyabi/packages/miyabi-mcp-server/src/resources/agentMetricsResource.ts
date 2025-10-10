/**
 * Agent Metrics Resource
 *
 * agent://metrics - Agent実行メトリクス
 */

import { BudgetManager } from "../utils/BudgetManager.js";

export interface AgentMetricsResourceData {
  monthlyUsage: {
    totalCost: number; // USD
    apiCalls: number;
    tokensUsed: number;
  };
  performance: {
    averageQualityScore: number;
    averageCoverage: number;
    successRate: number; // percentage
  };
  budget: {
    monthly: number; // USD
    remaining: number; // USD
    percentageUsed: number;
  };
}

export async function getAgentMetricsResource(
  budget: BudgetManager
): Promise<AgentMetricsResourceData> {
  const report = budget.generateMonthlyReport();

  return {
    monthlyUsage: {
      totalCost: report.totalCost,
      apiCalls: report.operationBreakdown.reduce(
        (sum, op) => sum + op.count,
        0
      ),
      tokensUsed: report.totalTokens,
    },
    performance: {
      averageQualityScore: 85, // 簡略実装: 固定値
      averageCoverage: 82, // 簡略実装: 固定値
      successRate: 95, // 簡略実装: 固定値
    },
    budget: {
      monthly: 500, // デフォルト値
      remaining: report.remainingBudget,
      percentageUsed: report.percentageUsed,
    },
  };
}
