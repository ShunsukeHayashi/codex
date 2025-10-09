# 経済Circuit Breaker - 実装計画

**作成日**: 2025-10-10
**優先度**: P1-High（予算超過リスク防止）
**推定工数**: 3-4時間

---

## 🎯 目的

AI Agent実行における月間予算を管理し、超過時には自動的に実行を停止する仕組みを実装する。

**重要性**: Anthropic API（Claude）の従量課金により、制御なしでAgent実行を続けると予算が爆発的に増加する可能性がある。

---

## 💰 予算管理の原則

### 識学理論「結果の評価」適用

```
月間予算: $500 (デフォルト)
├─ 80%到達 ($400): ⚠️ 警告ログ出力、継続可能
├─ 100%到達 ($500): ❌ 新規Agent実行拒否
└─ 150%到達 ($750): 🚨 全Agent緊急停止、Guardian介入必須
```

---

## 🏗️ Architecture

### 全体構成

```
┌─────────────────────────────────┐
│   Codex CLI (User Request)      │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│   Miyabi MCP Server              │
│                                  │
│   ┌─────────────────────────┐  │
│   │  BudgetManager           │  │
│   │  - trackUsage()          │  │
│   │  - checkLimit()          │  │
│   │  - enforcePolicy()       │  │
│   └───────────┬─────────────┘  │
│               │                  │
│               ↓                  │
│   ┌─────────────────────────┐  │
│   │  UsageTracker            │  │
│   │  - DB: usage.sqlite      │  │
│   │  - Table: monthly_usage  │  │
│   └─────────────────────────┘  │
└─────────────────────────────────┘
```

---

## 📊 データモデル

### monthly_usage テーブル

```sql
CREATE TABLE monthly_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  month TEXT NOT NULL, -- "2025-10"
  operation TEXT NOT NULL, -- "analyzeIssue", "generateCode", etc.
  cost_usd REAL NOT NULL,
  tokens_used INTEGER NOT NULL,
  model TEXT NOT NULL, -- "claude-sonnet-4-20250514"
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_month ON monthly_usage(month);
CREATE INDEX idx_operation ON monthly_usage(operation);
```

### budget_config テーブル

```sql
CREATE TABLE budget_config (
  id INTEGER PRIMARY KEY,
  monthly_budget_usd REAL NOT NULL DEFAULT 500,
  warning_threshold REAL NOT NULL DEFAULT 0.8,
  emergency_threshold REAL NOT NULL DEFAULT 1.5,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 初期データ
INSERT INTO budget_config (id, monthly_budget_usd, warning_threshold, emergency_threshold)
VALUES (1, 500, 0.8, 1.5);
```

---

## 🔧 実装詳細

### 1. BudgetManager クラス

```typescript
// codex-miyabi/packages/budget-manager/src/BudgetManager.ts
import Database from "better-sqlite3";
import { AnthropicClient } from "../anthropic-client";

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

      CREATE TABLE IF NOT EXISTS budget_config (
        id INTEGER PRIMARY KEY,
        monthly_budget_usd REAL NOT NULL DEFAULT 500,
        warning_threshold REAL NOT NULL DEFAULT 0.8,
        emergency_threshold REAL NOT NULL DEFAULT 1.5,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      INSERT OR IGNORE INTO budget_config (id, monthly_budget_usd)
      VALUES (1, 500);
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

    console.log(`[BudgetManager] Tracked: $${record.costUsd.toFixed(4)} (${record.operation})`);
  }

  /**
   * 実行前の予算チェック
   */
  async checkBudget(operation: string, estimatedCost: number): Promise<{
    allowed: boolean;
    currentUsage: number;
    percentageUsed: number;
    warning: boolean;
    emergencyStop: boolean;
    message: string;
  }> {
    const currentUsage = this.getCurrentUsage();
    const futureUsage = currentUsage + estimatedCost;
    const percentageUsed = (futureUsage / this.config.monthlyBudget) * 100;

    const warning = percentageUsed >= this.config.warningThreshold * 100;
    const emergencyStop = percentageUsed >= this.config.emergencyThreshold * 100;
    const allowed = percentageUsed < 100; // 100%未満は許可

    let message = "";

    if (emergencyStop) {
      message = `🚨 EMERGENCY STOP: Budget at ${percentageUsed.toFixed(1)}% ($${futureUsage.toFixed(2)}/$${this.config.monthlyBudget}). All operations halted.`;
    } else if (!allowed) {
      message = `❌ Budget exceeded: ${percentageUsed.toFixed(1)}% ($${futureUsage.toFixed(2)}/$${this.config.monthlyBudget}). Operation "${operation}" rejected.`;
    } else if (warning) {
      message = `⚠️ WARNING: Budget at ${percentageUsed.toFixed(1)}% ($${futureUsage.toFixed(2)}/$${this.config.monthlyBudget})`;
    } else {
      message = `✅ Budget OK: ${percentageUsed.toFixed(1)}% ($${futureUsage.toFixed(2)}/$${this.config.monthlyBudget})`;
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
  calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    // Claude Sonnet 4 pricing (2025-10時点)
    // Input: $3.00 / 1M tokens
    // Output: $15.00 / 1M tokens
    const pricing = {
      "claude-sonnet-4-20250514": {
        input: 3.0 / 1_000_000,
        output: 15.0 / 1_000_000,
      },
    };

    const rate = pricing[model] || pricing["claude-sonnet-4-20250514"];
    const cost = inputTokens * rate.input + outputTokens * rate.output;

    return cost;
  }

  private getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  /**
   * 月次レポート生成
   */
  generateMonthlyReport(): {
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
  } {
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
      operationBreakdown: breakdown,
      percentageUsed: (totalCost / this.config.monthlyBudget) * 100,
      remainingBudget: this.config.monthlyBudget - totalCost,
    };
  }
}
```

---

### 2. MCP Server統合

```typescript
// codex-miyabi/packages/miyabi-mcp-server/src/index.ts
import { BudgetManager } from "../budget-manager";

const budgetManager = new BudgetManager();

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // 推定コスト計算
  const estimatedCost = estimateCost(name, args);

  // 予算チェック
  const budgetCheck = await budgetManager.checkBudget(name, estimatedCost);

  if (!budgetCheck.allowed) {
    throw new Error(budgetCheck.message);
  }

  if (budgetCheck.warning) {
    console.warn(budgetCheck.message);
  }

  // Tool実行
  const result = await executeTool(name, args);

  // 実際のコストを記録
  const actualCost = calculateActualCost(result);
  budgetManager.trackUsage({
    operation: name,
    costUsd: actualCost,
    tokensUsed: result.tokensUsed,
    model: result.model,
  });

  return result;
});

function estimateCost(toolName: string, args: any): number {
  // ツールごとの推定コスト
  const estimates = {
    analyzeIssue: 0.05, // $0.05
    generateCode: 0.5, // $0.50
    reviewCode: 0.1, // $0.10
    // ...
  };

  return estimates[toolName] || 0.1;
}
```

---

### 3. Guardian通知機能

緊急停止時にGitHub Issueを自動作成：

```typescript
// 緊急停止時の処理
async function handleEmergencyStop(budgetCheck: any): Promise<void> {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  await octokit.issues.create({
    owner: "ShunsukeHayashi",
    repo: "codex",
    title: "🚨 EMERGENCY: AI Budget Exceeded 150%",
    labels: ["🔥 priority:P0-Critical", "🤖 AI-システム"],
    assignees: [process.env.GUARDIAN_USERNAME || "ShunsukeHayashi"],
    body: `
## 🚨 緊急停止 - 予算超過

**月間予算**: $${budgetCheck.monthlyBudget}
**現在使用量**: $${budgetCheck.currentUsage.toFixed(2)} (${budgetCheck.percentageUsed.toFixed(1)}%)
**緊急閾値**: 150%

### 自動停止措置

- ❌ すべての自律Agent実行を停止しました
- ❌ 新規Issue処理を無効化しました
- ⏸️ 既存の実行中タスクは完了させます

### Guardian対応が必要です

1. 予算使用状況を確認
2. 必要に応じて月間予算を増額
3. BudgetManagerをリセット
4. Agent実行を再開

### 詳細レポート

月次レポート: [生成予定]

---

**自動作成**: BudgetManager Emergency Stop
**タイムスタンプ**: ${new Date().toISOString()}
    `.trim(),
  });

  console.error("[EMERGENCY STOP] Guardian Issue created.");
}
```

---

## 📊 コスト推定テーブル

| Operation | 推定Input Tokens | 推定Output Tokens | 推定コスト (USD) |
|-----------|------------------|-------------------|------------------|
| analyzeIssue | 5,000 | 500 | $0.023 |
| decomposeTask | 10,000 | 2,000 | $0.060 |
| generateCode | 50,000 | 10,000 | $0.300 |
| reviewCode | 30,000 | 2,000 | $0.120 |
| createPullRequest | 5,000 | 1,000 | $0.030 |
| **1 Issue→PR** | **100,000** | **15,500** | **$0.533** |

**月間予算$500の場合**: 約 **938 Issue処理**が可能

---

## ✅ 実装チェックリスト

- [ ] BudgetManager クラス実装
- [ ] SQLite データベース設定
- [ ] 予算チェックロジック（80%, 100%, 150%）
- [ ] MCP Server統合
- [ ] Guardian通知機能（GitHub Issue作成）
- [ ] 月次レポート生成機能
- [ ] 環境変数設定（MIYABI_MONTHLY_BUDGET等）
- [ ] E2Eテスト（シナリオ5）

---

## 🔧 設定方法

### 環境変数

```bash
# ~/.codex/config.toml
[miyabi.budget]
monthly_budget_usd = 500
warning_threshold = 0.8
emergency_threshold = 1.5
guardian_username = "ShunsukeHayashi"
```

### CLIコマンド

```bash
# 現在の使用状況確認
npx miyabi budget status

# 月次レポート生成
npx miyabi budget report

# 予算リセット（月初に自動実行）
npx miyabi budget reset
```

---

**作成**: 2025-10-10
**次のアクション**: 並行タスク完了確認
