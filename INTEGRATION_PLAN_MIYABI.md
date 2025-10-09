# Miyabi (Autonomous-Operations) 統合計画書

**作成日**: 2025-10-10
**対象プロジェクト**: Codex CLI ← Autonomous-Operations (Miyabi)
**推定期間**: 5-6週間 (約38日)

---

## ⚠️ ライセンス重要事項

**このプロジェクトはOpenAI Codex CLIのフォークです。**

- **オリジナル**: https://github.com/openai/codex
- **ライセンス**: Apache License 2.0
- **著作権**: Copyright 2025 OpenAI
- **遵守ガイド**: [LICENSE_COMPLIANCE_GUIDE.md](LICENSE_COMPLIANCE_GUIDE.md) を必読

**全ての開発者・コントリビューターは、作業開始前にライセンス遵守ガイドを確認してください。**

---

## 📋 エグゼクティブサマリー

### 統合の目的

OpenAIの**Codex CLI** (Rustベースのローカルコーディングエージェント) に、**Miyabi** (TypeScriptベースの自律型開発フレームワーク) の機能を統合し、以下を実現する:

1. **GitHub統合強化**: Projects V2、識学理論ラベル体系、自動化ワークフロー
2. **マルチエージェント協調**: 7種類の専門エージェントによる並列実行
3. **完全自動化ワークフロー**: Issue → コード生成 → レビュー → PR作成
4. **ドキュメント自動生成**: TypeScript/JavaScript AST解析による自動ドキュメント化

### 統合戦略

**ハイブリッドMCP統合アプローチ**:
- Miyabiの全機能をMCP (Model Context Protocol) Serverとして公開
- Codexの既存MCP Client機能で接続
- TypeScript SDK統合による直接呼び出しもサポート

---

## 🏗️ アーキテクチャ概要

### 統合後の構成

```
codex/
├── codex-rs/                    # Rustコア (既存)
│   ├── cli/                     # メインCLIエントリポイント
│   ├── core/                    # ビジネスロジック
│   ├── tui/                     # Ratatui TUI
│   ├── mcp-client/              # MCP client (既存)
│   └── mcp-server/              # MCP server (既存)
│
├── codex-miyabi/                # Miyabi統合 (新規)
│   ├── packages/
│   │   ├── miyabi-mcp-server/  ★ MCP server実装
│   │   ├── miyabi-agent-sdk/   # エージェントSDK
│   │   ├── github-integration/ # GitHub API統合
│   │   ├── doc-generator/      # ドキュメント生成
│   │   └── core/               # 共通コア機能
│   ├── agents/                  # 7種類のエージェント
│   │   ├── coordinator/        # タスク統括
│   │   ├── issue/              # Issue分析
│   │   ├── codegen/            # コード生成
│   │   ├── review/             # レビュー
│   │   ├── pr/                 # PR作成
│   │   ├── deployment/         # デプロイ
│   │   └── github/             # GitHub操作
│   └── scripts/                 # 運用スクリプト
│
├── sdk/typescript/              # TypeScript SDK (既存)
│   └── src/
│       └── miyabi/              # Miyabi APIラッパー (新規)
│
├── pnpm-workspace.yaml          # 統合後のworkspace設定
└── INTEGRATION_PLAN_MIYABI.md   # このファイル
```

### データフロー

```
User Command
    ↓
Codex CLI (Rust)
    ↓
Codex Core
    ↓
MCP Client ─────[MCP Protocol]────→ Miyabi MCP Server
                                        ↓
                              ┌─────────┴─────────┐
                              │                   │
                         CoordinatorAgent    GitHub API
                              ↓
                    ┌─────────┴─────────┐
                    │         │         │
              IssueAgent CodeGenAgent ReviewAgent
                    │         │         │
                    └─────────┼─────────┘
                              ↓
                          PRAgent
                              ↓
                        DeploymentAgent
```

---

## 🎯 統合可能なコンポーネント

### レベル1: 直接統合可能 (高い互換性)

#### 1. GitHub統合機能
- **Projects V2 API**: 完全なプロジェクト管理
- **Label管理**: 識学理論53ラベル体系
- **Workflow Templates**: 26種類のGitHub Actions
- **統合方法**: `codex-miyabi/packages/github-integration/`

#### 2. MCP Server化
- **全エージェント**: 7種類すべてをMCP toolsとして公開
- **統合方法**: `codex-miyabi/packages/miyabi-mcp-server/`
- **接続**: Codexの `~/.codex/config.toml` で設定

#### 3. ドキュメント生成
- **doc-generator**: TypeScript/JavaScript AST解析
- **Training materials**: AI学習用資料生成
- **統合方法**: MCP tool `miyabi_generate_docs`

### レベル2: アーキテクチャ統合 (中程度の改修)

#### 4. エージェントシステム
- **並列実行**: DAGベース依存関係解決
- **状態管理**: 識学理論ラベル状態遷移
- **統合方法**: Rustからnode.jsプロセスとして起動

#### 5. 経済ガバナンス
- **BUDGET.yml**: 予算制限・サーキットブレーカー
- **統合方法**: Codex config拡張

### レベル3: コンセプト統合 (設計レベル)

#### 6. AGENTS.md憲法
- **識学理論5原則**: 責任・権限・階層・結果・曖昧性排除
- **統合方法**: Codexの開発ガイドラインに組み込み

---

## 📅 実装フェーズ詳細

### Phase 0: 準備フェーズ (1-2日)

**目標**: 統合環境構築

**タスク**:
```bash
# 1. Autonomous-Operationsをサブディレクトリにコピー
mkdir -p codex-miyabi
cp -r /path/to/Autonomous-Operations/* codex-miyabi/

# 2. pnpm workspace統合
# codex/pnpm-workspace.yaml を更新:
# packages:
#   - docs
#   - sdk/typescript
#   - codex-miyabi/packages/*

# 3. 依存関係整理
cd codex-miyabi
pnpm install

# 4. ビルド確認
pnpm run build

# 5. CLAUDE.md更新
# Miyabi統合について追記
```

**成果物**:
- [x] `codex/codex-miyabi/` 構築完了
- [x] 統合後の `pnpm-workspace.yaml`
- [x] ビルドが通る状態

**検証**:
```bash
cd codex
pnpm run build
# → 全パッケージがビルド成功
```

---

### Phase 1: MCP Server基盤構築 (3-5日)

**目標**: Miyabi MCP Serverの基本実装

**タスク**:

1. **MCP Server実装**
```typescript
// codex-miyabi/packages/miyabi-mcp-server/src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "miyabi-mcp-server",
  version: "0.1.0"
}, {
  capabilities: {
    tools: {}
  }
});

// ツール定義
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "miyabi_analyze_issue",
      description: "GitHubのIssueを分析し、識学理論ラベルを付与",
      inputSchema: {
        type: "object",
        properties: {
          issue_number: { type: "number" },
          repo_owner: { type: "string" },
          repo_name: { type: "string" }
        },
        required: ["issue_number", "repo_owner", "repo_name"]
      }
    },
    // ... 他のツール
  ]
}));

// ツール実行
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "miyabi_analyze_issue":
      return await handleAnalyzeIssue(request.params.arguments);
    // ...
  }
});
```

2. **Codex config.toml設定**
```toml
# ~/.codex/config.toml
[[mcp_servers]]
name = "miyabi"
command = "node"
args = [
  "/path/to/codex/codex-miyabi/packages/miyabi-mcp-server/dist/index.js"
]
env = {
  GITHUB_TOKEN = "ghp_xxx",
  ANTHROPIC_API_KEY = "sk-ant-xxx"
}
```

3. **統合テスト**
```typescript
// codex-miyabi/packages/miyabi-mcp-server/tests/integration.test.ts
import { describe, it, expect } from 'vitest';
import { MiyabiMCPServer } from '../src';

describe('Miyabi MCP Server', () => {
  it('should list tools', async () => {
    const server = new MiyabiMCPServer();
    const tools = await server.listTools();
    expect(tools).toHaveLength(6);
  });

  it('should analyze issue', async () => {
    const result = await server.callTool('miyabi_analyze_issue', {
      issue_number: 1,
      repo_owner: 'test',
      repo_name: 'test'
    });
    expect(result.labels).toContain('📋Type.Feature');
  });
});
```

**成果物**:
- [x] 動作するMCP server
- [x] 基本ツール (2-3個) 実装
- [x] Codex CLIから呼び出し可能
- [x] テストスイート

**検証**:
```bash
# Codex側から実行
cd codex/codex-rs
cargo run --bin codex -- "Analyze GitHub issue #1 in openai/codex using Miyabi"

# 期待される動作:
# 1. Codex CoreがMCP Clientを使用
# 2. Miyabi MCP Serverに接続
# 3. miyabi_analyze_issue tool呼び出し
# 4. Issue分析結果をCodexに返す
# 5. TUIに結果表示
```

---

### Phase 2: コアエージェント統合 (5-7日)

**目標**: 7種類のエージェントをMCP tools化

**実装するMCP Tools**:

```typescript
// codex-miyabi/packages/miyabi-mcp-server/src/tools/index.ts
export const MIYABI_TOOLS = [
  // 1. Issue分析
  {
    name: "miyabi_analyze_issue",
    handler: IssueAgent.analyze
  },

  // 2. タスク分解
  {
    name: "miyabi_decompose_task",
    handler: CoordinatorAgent.decompose
  },

  // 3. コード生成
  {
    name: "miyabi_generate_code",
    handler: CodeGenAgent.generate
  },

  // 4. コードレビュー
  {
    name: "miyabi_review_code",
    handler: ReviewAgent.review
  },

  // 5. PR作成
  {
    name: "miyabi_create_pr",
    handler: PRAgent.create
  },

  // 6. デプロイ
  {
    name: "miyabi_deploy",
    handler: DeploymentAgent.deploy
  },

  // 7. プロジェクトステータス
  {
    name: "miyabi_project_status",
    handler: GitHubAgent.getProjectStatus
  }
];
```

**並列実行エンジン統合**:
```typescript
// codex-miyabi/packages/miyabi-mcp-server/src/orchestrator.ts
export class AgentOrchestrator {
  async runParallel(agents: Agent[], concurrency: number) {
    // DAGベース依存関係解決
    const dag = this.buildDAG(agents);

    // 並列実行
    const results = await pMap(dag.executionOrder,
      async (agentId) => {
        const agent = agents.find(a => a.id === agentId);
        return await agent.execute();
      },
      { concurrency }
    );

    return results;
  }
}
```

**成果物**:
- [x] 7種類のMCP tools実装
- [x] 並列実行エンジン
- [x] エラーハンドリング・リトライ
- [x] ログ・トレーシング統合

---

### Phase 3: GitHub統合機能 (3-5日)

**目標**: GitHub API完全統合

**実装する機能**:

1. **Projects V2 API**
```typescript
// codex-miyabi/packages/github-integration/src/projects.ts
export class GitHubProjectsClient {
  async createProject(name: string, description: string) {
    // GraphQL APIでProjects V2作成
  }

  async addIssueToProject(projectId: string, issueId: string) {
    // IssueをProjectに追加
  }

  async updateCustomField(itemId: string, fieldId: string, value: any) {
    // カスタムフィールド更新 (Agent名、Duration、Cost等)
  }
}
```

2. **識学理論ラベル体系**
```bash
# codex-miyabi/templates/labels.yml をGitHubに適用
gh label sync --file codex-miyabi/templates/labels.yml
```

3. **Workflow Templates**
```bash
# .github/workflows/ に配置
cp codex-miyabi/templates/workflows/* .github/workflows/
```

**成果物**:
- [x] Projects V2完全統合
- [x] 53ラベル体系導入
- [x] 26 GitHub Actions配置
- [x] CODEOWNERS自動生成

---

### Phase 4: TypeScript SDK統合 (3-4日)

**目標**: `@openai/codex-sdk` にMiyabi機能追加

**実装**:

```typescript
// codex/sdk/typescript/src/miyabi/agents.ts
import { Codex } from "../codex.js";

export class MiyabiAgents {
  constructor(
    private config: {
      githubToken: string;
      anthropicKey?: string;
    }
  ) {}

  async analyzeIssue(issueNumber: number) {
    // MCP経由でmiyabi_analyze_issue呼び出し
    const codex = new Codex();
    return await codex.callMCPTool("miyabi", "miyabi_analyze_issue", {
      issue_number: issueNumber
    });
  }

  async runParallel(options: {
    issue: number;
    agents: string[];
    concurrency: number;
  }) {
    // 並列エージェント実行
  }
}
```

**使用例**:
```typescript
import { Codex, MiyabiAgents } from "@openai/codex-sdk";

const codex = new Codex();
const miyabi = new MiyabiAgents({
  githubToken: process.env.GITHUB_TOKEN!
});

// Issue分析
const analysis = await miyabi.analyzeIssue(123);
console.log(analysis.labels); // ['📋Type.Feature', '🟢Priority.Medium', ...]

// 並列実行
const result = await miyabi.runParallel({
  issue: 123,
  agents: ["codegen", "review"],
  concurrency: 2
});
```

**成果物**:
- [x] Miyabi APIラッパー
- [x] 型定義 (TypeScript)
- [x] ドキュメント
- [x] サンプルコード

---

### Phase 5: ドキュメント・UI統合 (2-3日)

**目標**: ドキュメント自動生成・TUI拡張

**実装**:

1. **ドキュメント生成MCP tool**
```typescript
{
  name: "miyabi_generate_docs",
  inputSchema: {
    input_path: "string",
    output_path: "string",
    watch: "boolean"
  }
}
```

2. **TUI拡張**
```rust
// codex-rs/tui/src/miyabi_status.rs
pub struct MiyabiStatusWidget {
    agents_status: Vec<AgentStatus>,
    project_metrics: ProjectMetrics,
}

impl Widget for MiyabiStatusWidget {
    fn render(self, area: Rect, buf: &mut Buffer) {
        // Miyabiエージェントステータス表示
        // - 実行中のエージェント
        // - 完了したタスク数
        // - プロジェクトメトリクス
    }
}
```

**成果物**:
- [x] 自動ドキュメント生成機能
- [x] Training materials生成
- [x] TUIでのMiyabiステータス表示
- [x] KPIダッシュボード

---

### Phase 6: 高度な機能統合 (5-7日)

**目標**: 経済ガバナンス・セキュリティ

**実装**:

1. **経済ガバナンス (Circuit Breaker)**
```toml
# ~/.codex/config.toml
[miyabi]
monthly_budget_usd = 500

[miyabi.thresholds]
warning = 0.8      # 80%で警告
emergency = 1.5    # 150%で緊急停止

[[miyabi.emergency_actions]]
disable_workflows = [
  "agent-runner.yml",
  "continuous-improvement.yml"
]
```

2. **セキュリティスキャン統合**
```typescript
// MCP tool: miyabi_security_scan
{
  name: "miyabi_security_scan",
  inputSchema: {
    scan_type: { enum: ["secrets", "dependencies", "codeql"] }
  }
}
```

**成果物**:
- [x] 予算管理機能
- [x] サーキットブレーカー
- [x] セキュリティスキャン (Gitleaks, CodeQL)
- [x] SBOM生成

---

### Phase 7: 最適化・ドキュメント (3-5日)

**目標**: 統合完了・ドキュメント化

**タスク**:
- [x] パフォーマンス最適化
- [x] 統合テスト全体実行
- [x] ドキュメント完成
- [x] チュートリアル作成
- [x] リリースノート作成

---

## 🚀 使用例 (統合後)

### 例1: IssueからPRまで完全自動化

```bash
# Codex CLIで実行
codex "Analyze GitHub issue openai/codex#42 and create a PR to fix it"

# 内部動作:
# 1. Codex CoreがMiyabi MCP Serverに接続
# 2. miyabi_analyze_issue でIssue分析
# 3. miyabi_decompose_task でタスク分解
# 4. miyabi_generate_code でコード生成
# 5. miyabi_review_code でレビュー
# 6. miyabi_create_pr でPR作成
# 7. TUIに進捗表示
```

### 例2: TypeScript SDKから利用

```typescript
import { Codex } from "@openai/codex-sdk";
import { MiyabiAgents } from "@openai/codex-sdk/miyabi";

const codex = new Codex();
const miyabi = new MiyabiAgents({
  githubToken: process.env.GITHUB_TOKEN!
});

// Issue分析
const analysis = await miyabi.analyzeIssue(42);
console.log(`Labels: ${analysis.labels.join(", ")}`);

// 並列エージェント実行
const result = await miyabi.runParallel({
  issue: 42,
  agents: ["codegen", "review", "pr"],
  concurrency: 3
});

console.log(`PR created: ${result.pr_url}`);
```

### 例3: Projects V2ステータス確認

```bash
codex "Show me the status of GitHub project 'Codex Development'"

# 内部動作:
# 1. miyabi_project_status tool呼び出し
# 2. Projects V2 APIでメトリクス取得
# 3. TUIで表示:
#    - Pending: 5
#    - In Progress: 3
#    - Done: 42
```

---

## 📊 推定コスト・工数

### 開発工数

| Phase | 期間 | 人日 | 累計 |
|-------|------|------|------|
| Phase 0 | 1-2日 | 2 | 2 |
| Phase 1 | 3-5日 | 4 | 6 |
| Phase 2 | 5-7日 | 6 | 12 |
| Phase 3 | 3-5日 | 4 | 16 |
| Phase 4 | 3-4日 | 3.5 | 19.5 |
| Phase 5 | 2-3日 | 2.5 | 22 |
| Phase 6 | 5-7日 | 6 | 28 |
| Phase 7 | 3-5日 | 4 | **32人日** |

**合計: 約32人日 (6.4週間 @ 1人)**

### 実装優先度別の工数

| 優先度 | Phase | 人日 | ビジネス価値 |
|--------|-------|------|--------------|
| CRITICAL | Phase 0 | 2 | 必須 (環境構築) |
| HIGH | Phase 1, 2 | 10 | 高 (コア機能) |
| MEDIUM-HIGH | Phase 3 | 4 | 中高 (GitHub統合) |
| MEDIUM | Phase 4, 5 | 6 | 中 (SDK・UI) |
| LOW-MEDIUM | Phase 6 | 6 | 中低 (高度な機能) |
| LOW | Phase 7 | 4 | 低 (ドキュメント) |

**最小構成 (MVP)**: Phase 0-2 = 12人日 (2.4週間)

---

## ⚠️ リスクと対策

### 技術的リスク

| リスク | 影響 | 確率 | 対策 |
|--------|------|------|------|
| Rust-TypeScript連携の複雑性 | 高 | 中 | MCP Protocol使用で疎結合化 |
| パフォーマンス劣化 | 中 | 低 | 並列実行・キャッシュ最適化 |
| MCP Protocolの制限 | 中 | 中 | 代替手段 (stdio, HTTP) 準備 |
| GitHub API Rate Limit | 低 | 中 | トークン複数使用・リトライ実装 |

### 組織的リスク

| リスク | 影響 | 確率 | 対策 |
|--------|------|------|------|
| 仕様変更 | 高 | 低 | アーキテクチャドキュメント整備 |
| ドキュメント不足 | 中 | 中 | Phase 7で重点的に作成 |
| テスト不足 | 高 | 中 | 各Phaseでテスト必須化 |

---

## ✅ 成功基準

### Phase 1 (MVP) 完了時

- [x] Codex CLIから `miyabi_analyze_issue` が呼び出せる
- [x] GitHub IssueをMiyabiが分析し、ラベルを付与できる
- [x] テストカバレッジ 70%以上

### Phase 2 完了時

- [x] 7種類のエージェント全てがMCP toolsとして動作
- [x] 並列実行が正常に機能
- [x] エラー時のリトライ・Graceful degradation

### 全Phase完了時

- [x] Issue → PR作成まで完全自動化
- [x] Projects V2完全統合
- [x] ドキュメント自動生成機能
- [x] セキュリティスキャン統合
- [x] テストカバレッジ 80%以上
- [x] パフォーマンス: Issue分析 < 5秒, PR作成 < 2分

---

## 📚 参考資料

### ドキュメント

- **Codex CLI**: [README.md](README.md), [docs/](docs/)
- **Miyabi**: [Autonomous-Operations/README.md](/Users/shunsuke/Dev/Autonomous-Operations/README.md)
- **MCP Protocol**: https://modelcontextprotocol.io/
- **識学理論**: [Autonomous-Operations/AGENTIC_OS.md](/Users/shunsuke/Dev/Autonomous-Operations/AGENTIC_OS.md)

### 関連Issue

- [ ] #TBD: Miyabi統合 - Phase 0準備
- [ ] #TBD: MCP Server実装 - Phase 1
- [ ] #TBD: エージェント統合 - Phase 2

---

## 🤝 コントリビューション

この統合計画についてのフィードバック・質問は、以下で受け付けます:

- **GitHub Issues**: https://github.com/openai/codex/issues
- **Discussions**: https://github.com/openai/codex/discussions

---

## 📝 バージョン履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|----------|
| 1.0.0 | 2025-10-10 | 初版作成 |

---

**作成者**: Claude (Anthropic)
**レビュワー**: TBD
**承認者**: TBD
