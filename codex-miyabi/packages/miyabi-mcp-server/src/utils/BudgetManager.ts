/**
 * BudgetManager - 経済Circuit Breaker
 *
 * Anthropic API使用量を監視し、月間予算を管理する。
 * 識学理論「結果の評価」原則を適用。
 *
 * @module BudgetManager
 */

import Database from "better-sqlite3";

export interface BudgetConfig {
  monthlyBudget: number; // USD
  warningThreshold: number; // 0.8 = 80%
  emergencyThreshold: number; // 1.5 = 150%
}

export interface UsageRecord {
  operation: string;
  costUsd: number;
  tokensUsed: number;
  model: string;
}

export interface BudgetCheckResult {
  allowed: boolean;
  currentUsage: number;
  percentageUsed: number;
  warning: boolean;
  emergencyStop: boolean;
  message: string;
}

export interface MonthlyReport {
  month: string;
  totalCost: number;
  totalTokens: number;
  operationBreakdown: Array<{
    operation: string;
    cost: number;
    count: number;
  }>;
  percentageUsed: number;
  remainingBudget: number;
}

export class BudgetManager {
  private db: Database.Database;
  private config: BudgetConfig;

  constructor(dbPath: string = "./usage.sqlite") {
    this.db = new Database(dbPath);
    this.initDatabase();
    this.config = this.loadConfig();
  }

  private initDatabase(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS monthly_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        month TEXT NOT NULL,
        operation TEXT NOT NULL,
        cost_usd REAL NOT NULL,
        tokens_used INTEGER NOT NULL,
        model TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_month ON monthly_usage(month);
      CREATE INDEX IF NOT EXISTS idx_operation ON monthly_usage(operation);

      CREATE TABLE IF NOT EXISTS budget_config (
        id INTEGER PRIMARY KEY,
        monthly_budget_usd REAL NOT NULL DEFAULT 500,
        warning_threshold REAL NOT NULL DEFAULT 0.8,
        emergency_threshold REAL NOT NULL DEFAULT 1.5,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      INSERT OR IGNORE INTO budget_config (id, monthly_budget_usd, warning_threshold, emergency_threshold)
      VALUES (1, 500, 0.8, 1.5);
    `);
  }

  private loadConfig(): BudgetConfig {
    const row = this.db
      .prepare("SELECT * FROM budget_config WHERE id = 1")
      .get() as any;

    return {
      monthlyBudget: row.monthly_budget_usd,
      warningThreshold: row.warning_threshold,
      emergencyThreshold: row.emergency_threshold,
    };
  }

  /**
   * 現在の月間使用量を取得
   */
  getCurrentUsage(): number {
    const month = this.getCurrentMonth();
    const result = this.db
      .prepare(
        `
      SELECT SUM(cost_usd) as total
      FROM monthly_usage
      WHERE month = ?
    `
      )
      .get(month) as any;

    return result?.total || 0;
  }

  /**
   * 使用量を記録
   */
  trackUsage(record: UsageRecord): void {
    const month = this.getCurrentMonth();

    this.db
      .prepare(
        `
      INSERT INTO monthly_usage (month, operation, cost_usd, tokens_used, model)
      VALUES (?, ?, ?, ?, ?)
    `
      )
      .run(
        month,
        record.operation,
        record.costUsd,
        record.tokensUsed,
        record.model
      );

    console.log(
      `[BudgetManager] Tracked: $${record.costUsd.toFixed(4)} (${
        record.operation
      })`
    );
  }

  /**
   * 実行前の予算チェック
   */
  async checkBudget(
    operation: string,
    estimatedCost: number
  ): Promise<BudgetCheckResult> {
    const currentUsage = this.getCurrentUsage();
    const futureUsage = currentUsage + estimatedCost;
    const percentageUsed = (futureUsage / this.config.monthlyBudget) * 100;

    const warning = percentageUsed >= this.config.warningThreshold * 100;
    const emergencyStop =
      percentageUsed >= this.config.emergencyThreshold * 100;
    const allowed = percentageUsed < 100; // 100%未満は許可

    let message = "";

    if (emergencyStop) {
      message = `🚨 EMERGENCY STOP: Budget at ${percentageUsed.toFixed(
        1
      )}% ($${futureUsage.toFixed(2)}/$${
        this.config.monthlyBudget
      }). All operations halted.`;
    } else if (!allowed) {
      message = `❌ Budget exceeded: ${percentageUsed.toFixed(
        1
      )}% ($${futureUsage.toFixed(2)}/$${
        this.config.monthlyBudget
      }). Operation "${operation}" rejected.`;
    } else if (warning) {
      message = `⚠️ WARNING: Budget at ${percentageUsed.toFixed(
        1
      )}% ($${futureUsage.toFixed(2)}/$${this.config.monthlyBudget})`;
    } else {
      message = `✅ Budget OK: ${percentageUsed.toFixed(
        1
      )}% ($${futureUsage.toFixed(2)}/$${this.config.monthlyBudget})`;
    }

    console.log(`[BudgetManager] ${message}`);

    return {
      allowed: allowed && !emergencyStop,
      currentUsage: futureUsage,
      percentageUsed,
      warning,
      emergencyStop,
      message,
    };
  }

  /**
   * Anthropic APIコスト計算
   */
  calculateCost(
    model: string,
    inputTokens: number,
    outputTokens: number
  ): number {
    // Claude Sonnet 4 pricing (2025-10時点)
    // Input: $3.00 / 1M tokens
    // Output: $15.00 / 1M tokens
    const pricing: Record<
      string,
      { input: number; output: number }
    > = {
      "claude-sonnet-4-20250514": {
        input: 3.0 / 1_000_000,
        output: 15.0 / 1_000_000,
      },
    };

    const rate =
      pricing[model] || pricing["claude-sonnet-4-20250514"];
    const cost =
      inputTokens * rate.input + outputTokens * rate.output;

    return cost;
  }

  private getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  }

  /**
   * 月次レポート生成
   */
  generateMonthlyReport(): MonthlyReport {
    const month = this.getCurrentMonth();
    const totalCost = this.getCurrentUsage();

    const breakdown = this.db
      .prepare(
        `
      SELECT
        operation,
        SUM(cost_usd) as cost,
        COUNT(*) as count
      FROM monthly_usage
      WHERE month = ?
      GROUP BY operation
      ORDER BY cost DESC
    `
      )
      .all(month) as any[];

    const totalTokens = this.db
      .prepare(
        `
      SELECT SUM(tokens_used) as total
      FROM monthly_usage
      WHERE month = ?
    `
      )
      .get(month) as any;

    return {
      month,
      totalCost,
      totalTokens: totalTokens?.total || 0,
      operationBreakdown: breakdown.map((row) => ({
        operation: row.operation,
        cost: row.cost,
        count: row.count,
      })),
      percentageUsed: (totalCost / this.config.monthlyBudget) * 100,
      remainingBudget: this.config.monthlyBudget - totalCost,
    };
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }
}
