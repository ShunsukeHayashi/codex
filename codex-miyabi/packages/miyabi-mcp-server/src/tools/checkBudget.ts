/**
 * checkBudget Tool
 *
 * 経済Circuit Breakerによる予算チェック
 */

import { BudgetManager } from "../utils/BudgetManager.js";

export interface CheckBudgetInput {
  operation: string;
  estimatedCost: number; // USD
}

export interface CheckBudgetOutput {
  allowed: boolean;
  currentUsage: number; // USD
  monthlyBudget: number; // USD
  percentageUsed: number; // 0-100
  warning: boolean; // true if > 80%
  emergencyStop: boolean; // true if > 150%
  message: string;
}

export async function checkBudget(
  input: CheckBudgetInput,
  budget: BudgetManager
): Promise<CheckBudgetOutput> {
  const result = await budget.checkBudget(input.operation, input.estimatedCost);

  return {
    allowed: result.allowed,
    currentUsage: result.currentUsage,
    monthlyBudget: 500, // デフォルト値（config from BudgetManager）
    percentageUsed: result.percentageUsed,
    warning: result.warning,
    emergencyStop: result.emergencyStop,
    message: result.message,
  };
}
