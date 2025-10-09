# Phase 5: Miyabi MCP Server - 基本設計

**作成日**: 2025-10-10
**Phase**: 5 (MCP Server実装)
**推定工数**: 6-8時間

---

## 🎯 目標

Codex CLI（Rust）からMiyabi Agent（TypeScript）を呼び出すためのMCP Serverを実装する。

---

## 🏗️ Architecture

### 全体構成

```
┌─────────────────────┐
│   Codex CLI (Rust)  │
│                     │
│  User: "Issue #42   │
│   を自動処理して"    │
└──────────┬──────────┘
           │
           │ MCP Protocol
           ↓
┌─────────────────────────────────────┐
│   Miyabi MCP Server (TypeScript)    │
│                                     │
│  ┌─────────────────────────────┐  │
│  │  Tool: analyzeIssue          │  │
│  │  Tool: generateCode          │  │
│  │  Tool: reviewCode            │  │
│  │  Tool: createPullRequest     │  │
│  │  Tool: checkBudget           │  │
│  └─────────────────────────────┘  │
│                                     │
│  ┌─────────────────────────────┐  │
│  │  Resource: issueData         │  │
│  │  Resource: projectStatus     │  │
│  │  Resource: agentMetrics      │  │
│  └─────────────────────────────┘  │
└───────────────┬─────────────────────┘
                │
                │ GitHub API / Anthropic API
                ↓
┌───────────────────────────────────────┐
│         External Services              │
│  - GitHub (Issues, PRs, Projects)      │
│  - Anthropic Claude (Code Generation)  │
│  - Static Analysis Tools               │
└────────────────────────────────────────┘
```

---

## 📦 MCP Protocol定義

### Tools (9個)

#### 1. `analyzeIssue`
**説明**: GitHubのIssueを解析し、適切なラベルと複雑度を判定

**Input**:
```typescript
{
  issueNumber: number;
  repository: string; // "owner/repo"
}
```

**Output**:
```typescript
{
  labels: string[];
  complexity: "small" | "medium" | "large" | "xlarge";
  estimatedEffort: string; // "1h", "4h", "1d", etc.
  priority: "P0" | "P1" | "P2" | "P3";
  assignedAgent: string; // "codegen", "review", etc.
}
```

---

#### 2. `decomposeTask`
**説明**: IssueをDAG構造のサブタスクに分解

**Input**:
```typescript
{
  issueNumber: number;
  repository: string;
}
```

**Output**:
```typescript
{
  taskGraph: {
    nodes: Array<{
      id: string;
      description: string;
      agent: string;
      estimatedTime: number; // minutes
    }>;
    edges: Array<{
      from: string;
      to: string;
    }>;
  };
  criticalPath: string[];
  parallelizable: string[][];
}
```

---

#### 3. `generateCode`
**説明**: サブタスクに対してコードを生成

**Input**:
```typescript
{
  taskId: string;
  requirements: string;
  context: {
    repository: string;
    baseBranch: string;
    relatedFiles: string[];
  };
}
```

**Output**:
```typescript
{
  files: Array<{
    path: string;
    content: string;
    action: "create" | "modify" | "delete";
  }>;
  tests: Array<{
    path: string;
    content: string;
  }>;
  qualityScore: number; // 0-100
}
```

---

#### 4. `reviewCode`
**説明**: 生成されたコードを品質チェック

**Input**:
```typescript
{
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
```

**Output**:
```typescript
{
  qualityScore: number; // 0-100
  passed: boolean;
  issues: Array<{
    severity: "error" | "warning" | "info";
    file: string;
    line: number;
    message: string;
  }>;
  coverage: number; // percentage
  suggestions: string[];
}
```

---

#### 5. `createPullRequest`
**説明**: Draft PRを作成

**Input**:
```typescript
{
  issueNumber: number;
  repository: string;
  branch: string;
  title: string;
  body: string;
  files: Array<{
    path: string;
    content: string;
  }>;
}
```

**Output**:
```typescript
{
  prNumber: number;
  prUrl: string;
  status: "draft" | "ready";
  checksStatus: {
    qualityScore: number;
    testsPass: boolean;
    securityPass: boolean;
  };
}
```

---

#### 6. `checkBudget`
**説明**: 経済Circuit Breakerによる予算チェック

**Input**:
```typescript
{
  operation: string; // "analyzeIssue", "generateCode", etc.
  estimatedCost: number; // USD
}
```

**Output**:
```typescript
{
  allowed: boolean;
  currentUsage: number; // USD
  monthlyBudget: number; // USD
  percentageUsed: number; // 0-100
  warning: boolean; // true if > 80%
  emergencyStop: boolean; // true if > 150%
}
```

---

#### 7. `runTests`
**説明**: テスト実行とカバレッジ取得

**Input**:
```typescript
{
  repository: string;
  branch: string;
  testCommand: string; // "npm test", "cargo test", etc.
}
```

**Output**:
```typescript
{
  success: boolean;
  coverage: number;
  duration: number; // seconds
  failures: Array<{
    test: string;
    error: string;
  }>;
}
```

---

#### 8. `deployAgent`
**説明**: デプロイ実行（マージ後）

**Input**:
```typescript
{
  repository: string;
  environment: "staging" | "production";
  prNumber: number;
}
```

**Output**:
```typescript
{
  deploymentUrl: string;
  status: "success" | "failed" | "rollback";
  healthCheck: boolean;
  rollbackAvailable: boolean;
}
```

---

#### 9. `updateProjectStatus`
**説明**: GitHub Projects V2 のステータス更新

**Input**:
```typescript
{
  issueNumber: number;
  repository: string;
  status: "pending" | "analyzing" | "implementing" | "reviewing" | "done";
  qualityMetrics: {
    qualityScore: number;
    coverage: number;
  };
}
```

**Output**:
```typescript
{
  updated: boolean;
  projectUrl: string;
  currentStatus: string;
}
```

---

### Resources (3個)

#### 1. `issue://repo/number`
**説明**: GitHub Issueのデータ

**Schema**:
```typescript
{
  number: number;
  title: string;
  body: string;
  labels: string[];
  assignees: string[];
  state: "open" | "closed";
  createdAt: string;
  updatedAt: string;
}
```

---

#### 2. `project://owner/project-id/status`
**説明**: GitHub Projects V2 のステータス

**Schema**:
```typescript
{
  projectId: string;
  items: Array<{
    issueNumber: number;
    status: string;
    priority: string;
    assignedAgent: string;
  }>;
  metrics: {
    totalIssues: number;
    pending: number;
    inProgress: number;
    done: number;
    averageQualityScore: number;
  };
}
```

---

#### 3. `agent://metrics`
**説明**: Agent実行メトリクス

**Schema**:
```typescript
{
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
```

---

## 🔧 実装技術スタック

### Server実装

```typescript
// codex-miyabi/packages/miyabi-mcp-server/src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { GitHubClient } from "../github-client/index.js";
import { AnthropicClient } from "../anthropic-client/index.js";
import { BudgetManager } from "../budget-manager/index.js";

const server = new Server(
  {
    name: "miyabi-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "analyzeIssue",
        description: "GitHubのIssueを解析し、適切なラベルと複雑度を判定",
        inputSchema: {
          type: "object",
          properties: {
            issueNumber: { type: "number" },
            repository: { type: "string" },
          },
          required: ["issueNumber", "repository"],
        },
      },
      // ... 他のツール
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "analyzeIssue":
      return await analyzeIssue(args);
    case "generateCode":
      return await generateCode(args);
    // ... 他のツール
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Resource handlers
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "issue://{repo}/{number}",
        name: "GitHub Issue Data",
        mimeType: "application/json",
      },
      // ... 他のリソース
    ],
  };
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Miyabi MCP Server running on stdio");
}

main().catch(console.error);
```

---

## 📁 プロジェクト構造

```
codex-miyabi/
└── packages/
    ├── miyabi-mcp-server/
    │   ├── src/
    │   │   ├── index.ts                  # Server entry point
    │   │   ├── tools/
    │   │   │   ├── analyzeIssue.ts
    │   │   │   ├── decomposeTask.ts
    │   │   │   ├── generateCode.ts
    │   │   │   ├── reviewCode.ts
    │   │   │   ├── createPullRequest.ts
    │   │   │   ├── checkBudget.ts
    │   │   │   ├── runTests.ts
    │   │   │   ├── deployAgent.ts
    │   │   │   └── updateProjectStatus.ts
    │   │   ├── resources/
    │   │   │   ├── issueResource.ts
    │   │   │   ├── projectResource.ts
    │   │   │   └── metricsResource.ts
    │   │   └── utils/
    │   │       ├── github-client.ts
    │   │       ├── anthropic-client.ts
    │   │       └── budget-manager.ts
    │   ├── tests/
    │   │   └── integration/
    │   │       ├── analyzeIssue.test.ts
    │   │       └── e2e.test.ts
    │   ├── package.json
    │   └── tsconfig.json
    │
    ├── github-integration/               # GitHub API wrapper
    │   └── src/
    │       ├── issues.ts
    │       ├── projects.ts
    │       └── pullRequests.ts
    │
    └── budget-manager/                   # 経済Circuit Breaker
        └── src/
            ├── index.ts
            ├── tracker.ts
            └── limits.ts
```

---

## 🔌 Codex CLI統合

### MCP Server設定

```toml
# ~/.codex/config.toml

[[mcp_servers]]
name = "miyabi"
command = "node"
args = [
  "/path/to/codex/codex-miyabi/packages/miyabi-mcp-server/dist/index.js"
]
env = {
  GITHUB_TOKEN = "ghp_xxxxx",
  ANTHROPIC_API_KEY = "sk-ant-xxxxx",
  MIYABI_MONTHLY_BUDGET = "500",
  MIYABI_WARNING_THRESHOLD = "0.8",
  MIYABI_EMERGENCY_THRESHOLD = "1.5"
}
```

### 使用例

```bash
# Codex CLIから実行
codex "GitHub Issue #42を自動処理してPRを作成して"

# 内部的に以下の順で実行:
# 1. analyzeIssue(42) → labels, complexity
# 2. checkBudget("analyzeIssue", estimatedCost)
# 3. decomposeTask(42) → taskGraph
# 4. generateCode(tasks) → files
# 5. reviewCode(files) → qualityScore (80以上で次へ)
# 6. runTests() → coverage
# 7. createPullRequest() → PR draft
```

---

## ✅ 成功基準

1. **9つのToolsすべて実装**
   - analyzeIssue, decomposeTask, generateCode, reviewCode, createPullRequest, checkBudget, runTests, deployAgent, updateProjectStatus

2. **3つのResourcesすべて実装**
   - issue://, project://, agent://

3. **Codex CLIからの呼び出し成功**
   - MCP Protocol経由での通信確認
   - Tool実行結果がCLIに正しく返る

4. **エンドツーエンドテスト成功**
   - Issue #42 → PR自動作成までの完全自動化
   - 品質ゲート（80点以上）クリア
   - 経済Circuit Breaker動作確認

---

## 📊 推定工数

| タスク | 推定時間 |
|--------|----------|
| Protocol定義 | 1h |
| Server基本実装 | 2h |
| 9 Tools実装 | 3h |
| 3 Resources実装 | 1h |
| Integration Test | 1.5h |
| **合計** | **8.5h** |

並行実行により **6時間** に短縮可能。

---

**作成**: 2025-10-10
**次のアクション**: Agent実装ガイドライン作成（並行タスク2）
