# Phase 8: Real API Integration 実装計画書

**作成日**: 2025-10-10
**対象**: Codex Agentic - Miyabi Framework Integration
**優先度**: P0-Critical
**推定工数**: 5人日

---

## 📋 エグゼクティブサマリー

### 目的

Phase 4-6で実装したTypeScript SDKとセキュリティ基盤の上に、実際のAPI統合を実装する:

1. **MCP Response Parsing実装**: プレースホルダーから実際のレスポンス処理へ
2. **統合テスト実装**: E2Eテストによる実API接続確認
3. **エラーハンドリング強化**: 実環境での堅牢性確保
4. **ドキュメント更新**: 実装に合わせたドキュメント修正

### 前提条件

✅ **Phase 4完了**: TypeScript SDK実装 (9メソッド、817行)
✅ **Phase 5完了**: 包括的ドキュメント (1,069行)
✅ **Phase 6完了**: セキュリティパイプライン構築

### 既知の制約事項 (Phase 4-6レビューより)

⚠️ **MCP Response Parsing**: プレースホルダー実装
```typescript
// 現状: sdk/typescript/src/miyabi/MiyabiAgents.ts:368-372
private parseMCPResponse(result: unknown): unknown {
  // TODO: Implement proper MCP response parsing
  return result;
}
```

⚠️ **統合テスト**: ユニットテストのみ (E2Eテスト未実装)

---

## 🎯 Phase 8の目標

### 主要目標

1. ✅ **MCP Response Parsing完全実装**
   - JSON parseとバリデーション
   - 型ガード実装 (TypeScript type predicates)
   - エラーハンドリング (MCP protocol errors)
   - レスポンスキャッシュ (オプション)

2. ✅ **統合テスト実装**
   - MCP server起動テスト
   - 実際のAgent呼び出しE2Eテスト
   - エラーシナリオテスト (network error, timeout等)
   - パフォーマンステスト (並列実行)

3. ✅ **実API接続確認**
   - Claude Sonnet 4 API統合確認
   - GitHub API統合確認
   - MCP Protocol動作確認

4. ✅ **ドキュメント更新**
   - API仕様の明確化
   - エラーハンドリングガイド
   - トラブルシューティング

### 成功基準

- [ ] MCP Response Parsingが全9メソッドで正常動作
- [ ] 統合テストカバレッジ ≥80%
- [ ] 実環境でのIssue→PR自動化が動作
- [ ] エラーケースの適切なハンドリング
- [ ] パフォーマンス: Issue分析 < 5秒, PR作成 < 2分

---

## 🏗️ 実装アーキテクチャ

### MCP Response構造

MCP Protocol v1.0の標準レスポンス形式:

```typescript
// MCP Toolレスポンス
interface MCPToolResponse {
  content: Array<{
    type: "text" | "image" | "resource";
    text?: string;
    data?: string;
    uri?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

// MCP Error Response
interface MCPErrorResponse {
  error: {
    code: number;
    message: string;
    data?: unknown;
  };
}
```

### Miyabi特有のレスポンス形式

各Agentは統一されたJSON形式で結果を返す:

```typescript
// Issue Agent Response
interface IssueAgentResponse {
  success: true;
  agent: "IssueAgent";
  result: {
    issue: IssueData;
    suggestedLabels: string[];
    estimatedDuration: number;
    assignedAgent: string;
  };
}

// Error Response
interface AgentErrorResponse {
  success: false;
  agent: string;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

---

## 📝 実装タスク詳細

### タスク1: MCP Response Parsing実装 (優先度: P0-Critical)

#### 1.1 型定義の追加

```typescript
// sdk/typescript/src/miyabi/types.ts に追加

/**
 * MCP Protocol レスポンス型定義
 */
export interface MCPToolResponse {
  content: Array<{
    type: "text" | "image" | "resource";
    text?: string;
    data?: string;
    uri?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

export interface MCPErrorResponse {
  error: {
    code: number;
    message: string;
    data?: unknown;
  };
}

/**
 * Miyabi Agent 共通レスポンス型
 */
export interface AgentResponse<T = unknown> {
  success: boolean;
  agent: string;
  result?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * MCP Response Parsing エラー
 */
export class MCPParseError extends Error {
  constructor(
    message: string,
    public readonly rawResponse: unknown,
    public readonly parseError?: Error
  ) {
    super(message);
    this.name = "MCPParseError";
  }
}
```

#### 1.2 型ガード関数の実装

```typescript
// sdk/typescript/src/miyabi/type-guards.ts (新規作成)

import type {
  MCPToolResponse,
  MCPErrorResponse,
  AgentResponse,
  IssueAnalysisResult,
  CodeGenerationResult,
  QualityReport,
  PullRequest,
  TestResult,
  BudgetStatus,
  DAG,
} from "./types.js";

/**
 * MCPToolResponseの型ガード
 */
export function isMCPToolResponse(value: unknown): value is MCPToolResponse {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return Array.isArray(obj.content);
}

/**
 * MCPErrorResponseの型ガード
 */
export function isMCPErrorResponse(value: unknown): value is MCPErrorResponse {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.error === "object" &&
    obj.error !== null &&
    typeof (obj.error as Record<string, unknown>).code === "number"
  );
}

/**
 * AgentResponseの型ガード
 */
export function isAgentResponse<T>(
  value: unknown
): value is AgentResponse<T> {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.success === "boolean" &&
    typeof obj.agent === "string"
  );
}

/**
 * IssueAnalysisResultの型ガード
 */
export function isIssueAnalysisResult(
  value: unknown
): value is IssueAnalysisResult {
  if (!isAgentResponse(value)) return false;
  const result = (value as AgentResponse).result as Record<string, unknown>;
  return (
    result &&
    typeof result.issue === "object" &&
    Array.isArray(result.suggestedLabels)
  );
}

// 同様に他の型のガードも実装...
```

#### 1.3 parseMCPResponse実装

```typescript
// sdk/typescript/src/miyabi/MiyabiAgents.ts の修正

import {
  isMCPToolResponse,
  isMCPErrorResponse,
  isAgentResponse,
} from "./type-guards.js";
import { MCPParseError } from "./types.js";

/**
 * MCPレスポンスをパース
 * @private
 */
private parseMCPResponse<T>(result: unknown): T {
  // 1. MCP Errorチェック
  if (isMCPErrorResponse(result)) {
    throw new Error(
      `MCP Error [${result.error.code}]: ${result.error.message}`
    );
  }

  // 2. MCP Tool Responseチェック
  if (!isMCPToolResponse(result)) {
    throw new MCPParseError(
      "Invalid MCP response format",
      result
    );
  }

  // 3. contentからテキストを抽出
  const textContent = result.content.find((c) => c.type === "text");
  if (!textContent || !textContent.text) {
    throw new MCPParseError(
      "No text content in MCP response",
      result
    );
  }

  // 4. JSONパース
  let parsed: unknown;
  try {
    parsed = JSON.parse(textContent.text);
  } catch (error) {
    throw new MCPParseError(
      "Failed to parse JSON from MCP response",
      result,
      error as Error
    );
  }

  // 5. Agent Responseチェック
  if (!isAgentResponse(parsed)) {
    throw new MCPParseError(
      "Invalid Agent response format",
      parsed
    );
  }

  // 6. エラーレスポンス処理
  if (!parsed.success) {
    const errorMsg = parsed.error?.message || "Unknown agent error";
    throw new Error(
      `Agent error [${parsed.error?.code || "UNKNOWN"}]: ${errorMsg}`
    );
  }

  // 7. 結果を返す
  return parsed.result as T;
}

/**
 * 特定の型でのパース (型ガード付き)
 * @private
 */
private parseIssueAnalysisResponse(result: unknown): IssueAnalysisResult {
  const parsed = this.parseMCPResponse<IssueAnalysisResult>(result);

  // 追加の型検証
  if (!isIssueAnalysisResult({ success: true, agent: "IssueAgent", result: parsed })) {
    throw new MCPParseError(
      "Response does not match IssueAnalysisResult schema",
      parsed
    );
  }

  return parsed;
}
```

#### 1.4 各メソッドの更新

```typescript
// analyzeIssue メソッドを更新
async analyzeIssue(options: {
  issueNumber: number;
  repository: string;
}): Promise<IssueAnalysisResult> {
  const thread = this.codex.startThread();

  const prompt = `Using the Miyabi MCP server, analyze GitHub issue #${options.issueNumber} in repository ${options.repository}. Use the miyabi_analyze_issue tool.`;

  try {
    const result = await thread.run(prompt);
    return this.parseIssueAnalysisResponse(result);
  } catch (error) {
    if (error instanceof MCPParseError) {
      // ログ出力
      console.error("MCP Parse Error:", error.message);
      console.error("Raw response:", error.rawResponse);
    }
    throw error;
  }
}
```

---

### タスク2: 統合テスト実装 (優先度: P0-Critical)

#### 2.1 テスト環境構築

```bash
# sdk/typescript/tests/integration/setup.ts
import { spawn, ChildProcess } from "child_process";
import { promisify } from "util";
import { readFile } from "fs/promises";

const sleep = promisify(setTimeout);

export class MCPServerTestFixture {
  private serverProcess?: ChildProcess;

  async setup() {
    // Miyabi MCP Serverを起動
    this.serverProcess = spawn("node", [
      "./path/to/miyabi-mcp-server/dist/index.js",
    ], {
      env: {
        ...process.env,
        GITHUB_TOKEN: process.env.GITHUB_TEST_TOKEN,
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_TEST_KEY,
      },
    });

    // サーバー起動待機
    await sleep(2000);

    if (!this.serverProcess.pid) {
      throw new Error("Failed to start MCP server");
    }
  }

  async teardown() {
    if (this.serverProcess) {
      this.serverProcess.kill();
      await sleep(1000);
    }
  }
}
```

#### 2.2 E2Eテストの実装

```typescript
// sdk/typescript/tests/integration/miyabi-integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MiyabiAgents } from "../../src/miyabi/MiyabiAgents.js";
import { MCPServerTestFixture } from "./setup.js";

describe("Miyabi Integration Tests", () => {
  let fixture: MCPServerTestFixture;
  let miyabi: MiyabiAgents;

  beforeAll(async () => {
    fixture = new MCPServerTestFixture();
    await fixture.setup();

    miyabi = new MiyabiAgents({
      githubToken: process.env.GITHUB_TEST_TOKEN!,
      anthropicApiKey: process.env.ANTHROPIC_TEST_KEY,
    });
  });

  afterAll(async () => {
    await fixture.teardown();
  });

  describe("Issue Analysis", () => {
    it("should analyze a real GitHub issue", async () => {
      const result = await miyabi.analyzeIssue({
        issueNumber: 1,
        repository: "test-org/test-repo",
      });

      expect(result.issue).toBeDefined();
      expect(result.issue.title).toBeTruthy();
      expect(result.suggestedLabels).toBeInstanceOf(Array);
      expect(result.estimatedDuration).toBeGreaterThan(0);
    }, 10000); // 10秒タイムアウト

    it("should handle non-existent issue", async () => {
      await expect(
        miyabi.analyzeIssue({
          issueNumber: 999999,
          repository: "test-org/test-repo",
        })
      ).rejects.toThrow();
    });
  });

  describe("Task Decomposition", () => {
    it("should decompose a complex task into DAG", async () => {
      const dag = await miyabi.decomposeTask({
        issueNumber: 1,
        repository: "test-org/test-repo",
      });

      expect(dag.nodes).toBeInstanceOf(Array);
      expect(dag.nodes.length).toBeGreaterThan(0);
      expect(dag.edges).toBeInstanceOf(Array);
    }, 15000);
  });

  describe("Parallel Execution", () => {
    it("should run multiple agents in parallel", async () => {
      const startTime = Date.now();

      const result = await miyabi.runParallel({
        issueNumber: 1,
        repository: "test-org/test-repo",
        agents: ["issue", "codegen"],
        concurrency: 2,
      });

      const duration = Date.now() - startTime;

      expect(result.results).toHaveLength(2);
      expect(result.totalExecutionTime).toBeGreaterThan(0);
      // 並列実行により、逐次実行よりも速いことを確認
      expect(duration).toBeLessThan(30000); // 30秒以内
    }, 35000);
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      // サーバーを停止
      await fixture.teardown();

      await expect(
        miyabi.analyzeIssue({
          issueNumber: 1,
          repository: "test-org/test-repo",
        })
      ).rejects.toThrow();

      // サーバーを再起動
      await fixture.setup();
    });

    it("should handle invalid repository", async () => {
      await expect(
        miyabi.analyzeIssue({
          issueNumber: 1,
          repository: "invalid/invalid",
        })
      ).rejects.toThrow();
    });
  });

  describe("Budget Management", () => {
    it("should check budget status", async () => {
      const budget = await miyabi.checkBudget();

      expect(budget.monthlyBudgetUsd).toBeGreaterThan(0);
      expect(budget.usedBudgetUsd).toBeGreaterThanOrEqual(0);
      expect(budget.remainingBudgetUsd).toBeGreaterThanOrEqual(0);
      expect(budget.usagePercentage).toBeGreaterThanOrEqual(0);
      expect(budget.usagePercentage).toBeLessThanOrEqual(100);
    });
  });
});
```

#### 2.3 パフォーマンステスト

```typescript
// sdk/typescript/tests/integration/performance.test.ts
import { describe, it, expect } from "vitest";
import { MiyabiAgents } from "../../src/miyabi/MiyabiAgents.js";

describe("Performance Tests", () => {
  const miyabi = new MiyabiAgents({
    githubToken: process.env.GITHUB_TEST_TOKEN!,
  });

  it("should analyze issue in < 5 seconds", async () => {
    const startTime = Date.now();

    await miyabi.analyzeIssue({
      issueNumber: 1,
      repository: "test-org/test-repo",
    });

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000); // 5秒未満
  }, 6000);

  it("should create PR in < 2 minutes", async () => {
    const startTime = Date.now();

    await miyabi.createPullRequest({
      repository: "test-org/test-repo",
      title: "Test PR",
      body: "Test PR body",
      draft: true,
    });

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(120000); // 2分未満
  }, 130000);

  it("should handle concurrent requests efficiently", async () => {
    const requests = Array.from({ length: 5 }, (_, i) =>
      miyabi.analyzeIssue({
        issueNumber: i + 1,
        repository: "test-org/test-repo",
      })
    );

    const startTime = Date.now();
    await Promise.all(requests);
    const duration = Date.now() - startTime;

    // 5リクエストが15秒以内に完了すること
    expect(duration).toBeLessThan(15000);
  }, 20000);
});
```

---

### タスク3: エラーハンドリング強化 (優先度: P1-High)

#### 3.1 リトライロジック実装

```typescript
// sdk/typescript/src/miyabi/retry.ts (新規作成)

export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryableErrors: string[];
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000, // 1秒
  maxDelay: 10000, // 10秒
  retryableErrors: ["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND"],
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // リトライ可能なエラーか確認
      const isRetryable = opts.retryableErrors.some((code) =>
        lastError.message.includes(code)
      );

      if (!isRetryable || attempt === opts.maxRetries) {
        throw lastError;
      }

      // Exponential backoff
      const delay = Math.min(
        opts.baseDelay * Math.pow(2, attempt),
        opts.maxDelay
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
```

#### 3.2 MiyabiAgentsへのリトライ統合

```typescript
// sdk/typescript/src/miyabi/MiyabiAgents.ts に追加

import { withRetry } from "./retry.js";

async analyzeIssue(options: {
  issueNumber: number;
  repository: string;
}): Promise<IssueAnalysisResult> {
  return withRetry(
    async () => {
      const thread = this.codex.startThread();

      const prompt = `Using the Miyabi MCP server, analyze GitHub issue #${options.issueNumber} in repository ${options.repository}. Use the miyabi_analyze_issue tool.`;

      const result = await thread.run(prompt);
      return this.parseIssueAnalysisResponse(result);
    },
    {
      maxRetries: 3,
      baseDelay: 1000,
    }
  );
}
```

---

### タスク4: ドキュメント更新 (優先度: P2-Medium)

#### 4.1 MIYABI_API.mdの更新

```markdown
## Error Handling

### Error Types

Miyabi SDKは以下のエラータイプをスローします:

#### 1. MCPParseError

MCPレスポンスのパースに失敗した場合:

\`\`\`typescript
import { MCPParseError } from "@openai/codex-sdk/miyabi";

try {
  const result = await miyabi.analyzeIssue({
    issueNumber: 42,
    repository: "openai/codex"
  });
} catch (error) {
  if (error instanceof MCPParseError) {
    console.error("Parse error:", error.message);
    console.error("Raw response:", error.rawResponse);
  }
}
\`\`\`

#### 2. Agent Errors

Agent実行時のエラー:

\`\`\`typescript
try {
  const result = await miyabi.analyzeIssue({
    issueNumber: 999999,
    repository: "openai/codex"
  });
} catch (error) {
  // エラーメッセージから判断
  if (error.message.includes("not found")) {
    console.error("Issue not found");
  }
}
\`\`\`

### Retry Logic

SDK内部で自動リトライを実装:

- **Max Retries**: 3回
- **Base Delay**: 1秒
- **Max Delay**: 10秒
- **Strategy**: Exponential backoff

リトライ可能なエラー:
- Network errors (ECONNREFUSED, ETIMEDOUT)
- Temporary server errors (503 Service Unavailable)

### Best Practices

1. **適切なエラーハンドリング**:
   \`\`\`typescript
   try {
     const result = await miyabi.analyzeIssue(options);
     // 成功時の処理
   } catch (error) {
     if (error instanceof MCPParseError) {
       // パースエラー処理
     } else {
       // その他のエラー処理
     }
   }
   \`\`\`

2. **タイムアウト設定**:
   \`\`\`typescript
   const timeoutPromise = new Promise((_, reject) =>
     setTimeout(() => reject(new Error("Timeout")), 30000)
   );

   const result = await Promise.race([
     miyabi.analyzeIssue(options),
     timeoutPromise,
   ]);
   \`\`\`

3. **並列実行時のエラーハンドリング**:
   \`\`\`typescript
   const results = await Promise.allSettled([
     miyabi.analyzeIssue(options1),
     miyabi.analyzeIssue(options2),
   ]);

   results.forEach((result, index) => {
     if (result.status === "fulfilled") {
       console.log(\`Result \${index}:\`, result.value);
     } else {
       console.error(\`Error \${index}:\`, result.reason);
     }
   });
   \`\`\`
```

---

## 📊 実装スケジュール

### Week 1 (Day 1-3): MCP Response Parsing

| Day | タスク | 成果物 |
|-----|--------|--------|
| 1 | 型定義追加、型ガード実装 | `types.ts`, `type-guards.ts` |
| 2 | `parseMCPResponse`実装 | 完全なパース関数 |
| 3 | 全9メソッドへの統合、ユニットテスト | 動作するSDK |

### Week 2 (Day 4-5): 統合テスト・ドキュメント

| Day | タスク | 成果物 |
|-----|--------|--------|
| 4 | E2Eテスト実装、パフォーマンステスト | テストスイート |
| 5 | エラーハンドリング強化、ドキュメント更新 | 完全なドキュメント |

---

## ✅ 検証基準

### Phase 8完了基準

- [ ] **MCP Response Parsing**:
  - [ ] 全9メソッドで正常動作
  - [ ] 型ガードによる型安全性確保
  - [ ] エラーレスポンス適切処理

- [ ] **統合テスト**:
  - [ ] E2Eテスト15ケース以上実装
  - [ ] テストカバレッジ ≥80%
  - [ ] パフォーマンステスト合格

- [ ] **実API接続**:
  - [ ] Miyabi MCP Serverとの接続確認
  - [ ] Issue→PR自動化フロー動作確認
  - [ ] エラーハンドリング動作確認

- [ ] **ドキュメント**:
  - [ ] エラーハンドリングガイド完成
  - [ ] トラブルシューティング追加
  - [ ] サンプルコード実行確認

---

## 🚨 リスクと対策

| リスク | 影響 | 確率 | 対策 |
|--------|------|------|------|
| MCP Server未実装 | High | Medium | モックサーバー使用 |
| API Rate Limit | Medium | Low | リトライ・待機実装 |
| レスポンス形式不一致 | High | Low | 柔軟なパース実装 |
| テスト環境構築遅延 | Medium | Medium | Docker環境準備 |

---

## 📚 参考資料

### 既存ドキュメント

- `PHASE4_6_COMPLETION_REPORT.md`: Phase 4-6完了レポート
- `PHASE4_5_REVIEW.md`: Phase 4-5レビュー
- `sdk/typescript/docs/MIYABI_API.md`: APIリファレンス
- `INTEGRATION_PLAN_MIYABI.md`: 統合計画書

### 外部資料

- **MCP Protocol Specification**: https://modelcontextprotocol.io/
- **TypeScript Type Guards**: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
- **Vitest Documentation**: https://vitest.dev/

---

## 🎯 次のステップ

### Phase 8完了後

1. **Phase 9: DeploymentAgent実装** (P3-Low)
   - DeploymentAgent機能追加
   - CI/CD統合

2. **Phase 10: Production Deployment** (P1-High)
   - 本番環境デプロイ
   - モニタリング設定

---

**作成者**: Claude (Sonnet 4.5)
**承認者**: @ShunsukeHayashi (承認待ち)
**開始予定日**: 2025-10-10
**完了予定日**: 2025-10-15 (5営業日)
