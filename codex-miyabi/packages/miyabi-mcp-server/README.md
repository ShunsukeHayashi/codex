# Miyabi MCP Server

Model Context Protocol Server for Miyabi Autonomous Development Framework

## 概要

Miyabi MCP Serverは、Codex CLI（Rust製ローカルコーディングエージェント）とMiyabi自律型開発フレームワーク（TypeScript）を接続するMCP（Model Context Protocol）サーバーです。

### 主な機能

- **9つのTools**: Issue分析、タスク分解、コード生成、レビュー、PR作成、予算管理など
- **3つのResources**: Issue data、Project status、Agent metrics
- **経済Circuit Breaker**: 月間予算管理と自動停止機能
- **識学理論5原則**: 責任・権限・階層・結果・曖昧性排除に基づく設計

## インストール

```bash
# 依存関係をインストール
pnpm install

# ビルド
pnpm run build
```

## 環境設定

```bash
# .envファイルを作成
cp .env.example .env

# 必要な環境変数を設定
GITHUB_TOKEN=ghp_xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx
MIYABI_MONTHLY_BUDGET=500
```

## Codex CLI統合

`~/.codex/config.toml` に以下を追加:

```toml
[[mcp_servers]]
name = "miyabi"
command = "node"
args = ["/path/to/codex-miyabi/packages/miyabi-mcp-server/dist/index.js"]
env = {
  GITHUB_TOKEN = "ghp_xxxxx",
  ANTHROPIC_API_KEY = "sk-ant-xxxxx",
  MIYABI_MONTHLY_BUDGET = "500",
  MIYABI_WARNING_THRESHOLD = "0.8",
  MIYABI_EMERGENCY_THRESHOLD = "1.5"
}
```

## 使用方法

### Codex CLIから実行

```bash
codex "GitHub Issue #42を自動処理してPRを作成して"
```

内部的に以下の順で実行:
1. `analyzeIssue(42)` → labels, complexity
2. `checkBudget("analyzeIssue", estimatedCost)`
3. `decomposeTask(42)` → taskGraph
4. `generateCode(tasks)` → files
5. `reviewCode(files)` → qualityScore (80以上で次へ)
6. `runTests()` → coverage
7. `createPullRequest()` → PR draft

## Tools一覧

### 1. analyzeIssue
GitHubのIssueを解析し、適切なラベルと複雑度を判定

### 2. decomposeTask
IssueをDAG構造のサブタスクに分解

### 3. generateCode
サブタスクに対してコードを生成

### 4. reviewCode
生成されたコードを品質チェック（80点以上で合格）

### 5. createPullRequest
Draft PRを作成

### 6. checkBudget
経済Circuit Breakerによる予算チェック

### 7. runTests
テスト実行とカバレッジ取得

### 8. deployAgent
デプロイ実行（マージ後）

### 9. updateProjectStatus
GitHub Projects V2 のステータス更新

## Resources一覧

### 1. issue://{owner}/{repo}/{number}
GitHub Issueのデータ

### 2. project://{owner}/{project-id}/status
GitHub Projects V2のステータス

### 3. agent://metrics
Agent実行メトリクス

## 経済Circuit Breaker

### 予算管理の原則

```
月間予算: $500 (デフォルト)
├─ 80%到達 ($400): ⚠️ 警告ログ出力、継続可能
├─ 100%到達 ($500): ❌ 新規Agent実行拒否
└─ 150%到達 ($750): 🚨 全Agent緊急停止、Guardian介入必須
```

### コスト推定

| Operation | 推定コスト (USD) |
|-----------|------------------|
| analyzeIssue | $0.023 |
| decomposeTask | $0.060 |
| generateCode | $0.300 |
| reviewCode | $0.120 |
| createPullRequest | $0.030 |
| **1 Issue→PR** | **$0.533** |

**月間予算$500の場合**: 約 **938 Issue処理**が可能

## 開発

```bash
# 開発モード（watch）
pnpm run dev

# テスト
pnpm run test

# Lint
pnpm run lint

# フォーマット
pnpm run format
```

## アーキテクチャ

```
┌─────────────────────────────────┐
│   Codex CLI (Rust)              │
│                                 │
│  User: "Issue #42を自動処理"    │
└────────────┬────────────────────┘
             │ MCP Protocol
             ↓
┌─────────────────────────────────┐
│   Miyabi MCP Server (TypeScript)│
│                                 │
│  ┌─────────────────────────┐  │
│  │  9 Tools                 │  │
│  │  - analyzeIssue          │  │
│  │  - decomposeTask         │  │
│  │  - generateCode          │  │
│  │  - reviewCode            │  │
│  │  - createPullRequest     │  │
│  │  - checkBudget           │  │
│  │  - runTests              │  │
│  │  - deployAgent           │  │
│  │  - updateProjectStatus   │  │
│  └─────────────────────────┘  │
│                                 │
│  ┌─────────────────────────┐  │
│  │  3 Resources             │  │
│  │  - issue://              │  │
│  │  - project://            │  │
│  │  - agent://metrics       │  │
│  └─────────────────────────┘  │
└────────────┬────────────────────┘
             │
             ↓
┌───────────────────────────────────┐
│  External Services                │
│  - GitHub API                     │
│  - Anthropic Claude (Sonnet 4)    │
│  - SQLite (usage tracking)        │
└───────────────────────────────────┘
```

## ライセンス

Apache License 2.0

## 作成者

Shunsuke Hayashi

---

🤖 Miyabi Autonomous Development Framework
