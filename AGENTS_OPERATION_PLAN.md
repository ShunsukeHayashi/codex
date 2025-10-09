# エージェント協調型オペレーション実行計画

**プロジェクト**: Codex CLI × Miyabi 統合
**運用スタイル**: Autonomous-Operations方式
**体制**: 人間 (Guardian) + 複数AIエージェント協調
**作成日**: 2025-10-10

---

## ⚠️ ライセンス遵守義務

**CRITICAL: 全てのエージェントと人間は、ライセンス遵守義務を負います。**

- **ベースプロジェクト**: OpenAI Codex CLI (Apache License 2.0)
- **著作権**: Copyright 2025 OpenAI
- **遵守ガイド**: [LICENSE_COMPLIANCE_GUIDE.md](LICENSE_COMPLIANCE_GUIDE.md)

### 全エージェント共通ルール

1. **コード変更時**: ファイル先頭に変更者・変更日を記載
2. **コミット時**: "Modified by [Agent Name], [Date]" を含める
3. **著作権表示**: OpenAIの著作権表示を削除しない
4. **配布時**: LICENSE, NOTICEファイルを必ず含める

**違反した場合、OpenAIから法的措置を受ける可能性があります。**

---

## 🎯 オペレーション概要

### 目的

Autonomous-Operationsの**識学理論ベースの自律型開発フレームワーク**を活用し、複数のAIエージェントが協調してCodex CLIへのMiyabi統合を完遂する。

### 運用原則 (識学理論5原則)

1. **責任の明確化**: 各エージェントが担当フェーズに対する責任を負う
2. **権限の委譲**: エージェントは自律的に判断・実行可能
3. **階層の設計**: CoordinatorAgent → 各専門Agent
4. **結果の評価**: 品質スコア、テストカバレッジ、実行時間で評価
5. **曖昧性の排除**: GitHub Issueによる状態管理、ラベルで進捗可視化

---

## 🤖 エージェント編成

### 階層構造

```
🔴 Coordinator Layer (決裁権限)
  └─ CoordinatorAgent (@shunsuke - Human Guardian)
     ├─ タスク全体統括
     ├─ Phase承認・判断
     ├─ 実行監視
     └─ エスカレーション対応

🔵 Specialist Layer (実行権限)
  ├─ SetupAgent         (Phase 0: 環境構築)
  ├─ MCPAgent           (Phase 1: MCP Server実装)
  ├─ IntegrationAgent   (Phase 2: エージェント統合)
  ├─ GitHubAgent        (Phase 3: GitHub統合)
  ├─ SDKAgent           (Phase 4: SDK統合)
  ├─ DocAgent           (Phase 5: ドキュメント生成)
  └─ SecurityAgent      (Phase 6: セキュリティ統合)

🟢 Support Layer (支援)
  ├─ ReviewAgent        (全Phase: コードレビュー)
  └─ TestAgent          (全Phase: テスト作成)
```

### エージェント役割定義

#### CoordinatorAgent (Human Guardian: @shunsuke)
- **責任**: プロジェクト全体の進行管理
- **権限**: Phase承認、優先度変更、リソース配分
- **判断基準**: 品質スコア ≥ 80点、テストカバレッジ ≥ 70%

#### SetupAgent
- **責任**: Phase 0の完遂
- **タスク**:
  1. `codex/codex-miyabi/` ディレクトリ構築
  2. pnpm workspace統合
  3. ビルド環境確認
- **完了条件**: `pnpm run build` がエラーなく完了

#### MCPAgent
- **責任**: Phase 1の完遂
- **タスク**:
  1. `packages/miyabi-mcp-server/` 実装
  2. 基本MCP tools (2-3個) 実装
  3. Codex config.toml設定
  4. 統合テスト作成
- **完了条件**: Codex CLIから `miyabi_analyze_issue` 呼び出し成功

#### IntegrationAgent
- **責任**: Phase 2の完遂
- **タスク**:
  1. 7種類のエージェントMCP tools化
  2. 並列実行エンジン統合
  3. エラーハンドリング実装
- **完了条件**: 全エージェントがMCP経由で動作

#### GitHubAgent
- **責任**: Phase 3の完遂
- **タスク**:
  1. Projects V2 API統合
  2. 53ラベル体系導入
  3. Workflow templates配置
- **完了条件**: GitHub Projects連携動作確認

#### SDKAgent
- **責任**: Phase 4の完遂
- **タスク**:
  1. TypeScript SDK拡張 (`src/miyabi/`)
  2. APIラッパー実装
  3. 型定義・ドキュメント
- **完了条件**: SDK経由でMiyabi呼び出し可能

#### DocAgent
- **責任**: Phase 5の完遂
- **タスク**:
  1. ドキュメント生成機能統合
  2. TUI拡張
  3. KPIダッシュボード
- **完了条件**: `miyabi_generate_docs` tool動作

#### SecurityAgent
- **責任**: Phase 6の完遂
- **タスク**:
  1. 経済ガバナンス実装
  2. セキュリティスキャン統合
  3. SBOM生成
- **完了条件**: セキュリティスキャン全項目パス

#### ReviewAgent (支援)
- **責任**: 全Phaseのコードレビュー
- **基準**:
  - Rust: Clippy警告 0件
  - TypeScript: ESLint警告 0件
  - 品質スコア ≥ 80点

#### TestAgent (支援)
- **責任**: 全Phaseのテスト作成
- **基準**:
  - カバレッジ ≥ 70% (Phase 0-2)
  - カバレッジ ≥ 80% (Phase 3-7)
  - 全テスト成功

---

## 📋 GitHub Issue運用

### Issue作成ルール

各Phaseごとに1つのメインIssueを作成:

```markdown
# Phase 0: 準備フェーズ - 環境構築

**担当**: SetupAgent
**期限**: 2日
**依存**: なし

## タスク
- [ ] codex/codex-miyabi/ ディレクトリ作成
- [ ] Autonomous-Operationsコードコピー
- [ ] pnpm workspace統合
- [ ] ビルド確認

## 完了条件
- [x] `pnpm run build` 成功
- [x] テストカバレッジ 0% (準備フェーズのため)
- [x] 品質スコア N/A

## Labels
- 📋Type.Task
- 🔴Priority.Critical
- 🏷️Phase.0-Setup
- 🤖Agent.Setup
```

### ラベル体系 (識学理論53ラベル + 拡張)

#### Type (種別)
- `📋Type.Feature` - 新機能
- `📋Type.Task` - タスク
- `🐛Type.Bug` - バグ修正

#### Priority (優先度)
- `🔴Priority.Critical` - 最優先
- `🟠Priority.High` - 高
- `🟡Priority.Medium` - 中
- `🟢Priority.Low` - 低

#### Phase (フェーズ)
- `🏷️Phase.0-Setup`
- `🏷️Phase.1-MCP`
- `🏷️Phase.2-Integration`
- `🏷️Phase.3-GitHub`
- `🏷️Phase.4-SDK`
- `🏷️Phase.5-Doc`
- `🏷️Phase.6-Security`
- `🏷️Phase.7-Polish`

#### Agent (担当)
- `🤖Agent.Setup`
- `🤖Agent.MCP`
- `🤖Agent.Integration`
- `🤖Agent.GitHub`
- `🤖Agent.SDK`
- `🤖Agent.Doc`
- `🤖Agent.Security`
- `👤Agent.Human` - Human Guardian介入

#### State (状態)
- `⏳State.Pending` - 待機中
- `⚡State.InProgress` - 作業中
- `🔍State.Review` - レビュー中
- `✅State.Done` - 完了
- `🆘State.Blocked` - ブロック中

---

## 🔄 ワークフロー

### 1. Issue作成 → Agent割り当て

```bash
# CoordinatorAgent (Human) がPhase 0 Issueを作成
gh issue create \
  --title "Phase 0: 準備フェーズ - 環境構築" \
  --label "📋Type.Task,🔴Priority.Critical,🏷️Phase.0-Setup,🤖Agent.Setup,⏳State.Pending" \
  --body "$(cat .github/ISSUE_TEMPLATE/phase_template.md)"

# SetupAgent に自動通知
```

### 2. Agent実行

```bash
# Agent (Claude Code) が作業開始
# 1. Issue をチェックアウト
# 2. ブランチ作成: feature/phase-0-setup
# 3. タスク実行
# 4. コミット (Conventional Commits)
# 5. PR作成 (Draft)

# SetupAgent 実行例
cd /Users/shunsuke/Dev/codex
git checkout -b feature/phase-0-setup

# タスク実行...
mkdir -p codex-miyabi
cp -r /Users/shunsuke/Dev/Autonomous-Operations/* codex-miyabi/

# コミット
git add .
git commit -m "feat(setup): initialize codex-miyabi directory structure

- Copy Autonomous-Operations project to codex-miyabi/
- Integrate pnpm workspace configuration
- Verify build passes

Co-Authored-By: Claude <noreply@anthropic.com>"

# PR作成
gh pr create \
  --title "[Phase 0] 準備フェーズ - 環境構築" \
  --draft \
  --label "📋Type.Task,🏷️Phase.0-Setup,⏳State.Review" \
  --body "Closes #TBD

## 実装内容
- codex-miyabi/ ディレクトリ構築完了
- pnpm workspace統合
- ビルド確認

## チェックリスト
- [x] タスク完了
- [x] ビルド成功
- [ ] コードレビュー待ち
- [ ] テスト実行待ち
"
```

### 3. ReviewAgent レビュー

```bash
# ReviewAgent (別のClaude Code インスタンス) がレビュー
codex "Review PR #TBD for Phase 0 setup"

# 品質チェック:
# - ディレクトリ構造確認
# - pnpm workspace設定確認
# - ビルドログ確認

# レビューコメント投稿
gh pr review TBD --comment --body "✅ LGTM

## 品質スコア: 85点

### 評価項目
- [x] ディレクトリ構造: 正常
- [x] pnpm workspace: 正常
- [x] ビルド: 成功
- [x] ドキュメント: 良好

Phase 1に進行可能。
"
```

### 4. TestAgent テスト作成

```bash
# TestAgent がテスト追加 (Phase 1以降)
# Phase 0は準備フェーズのためスキップ
```

### 5. Human Guardian 承認

```bash
# @shunsuke (Human) が最終承認
gh pr review TBD --approve --body "Phase 0承認。Phase 1に進行してください。"

# マージ
gh pr merge TBD --squash --delete-branch

# Issue クローズ
gh issue close TBD --comment "✅ Phase 0完了。Phase 1開始。"
```

### 6. 次Phaseへ

```bash
# CoordinatorAgent が Phase 1 Issue作成
gh issue create \
  --title "Phase 1: MCP Server基盤構築" \
  --label "📋Type.Task,🟠Priority.High,🏷️Phase.1-MCP,🤖Agent.MCP,⏳State.Pending"
```

---

## 🚀 実行手順 (Getting Started)

### ステップ1: リポジトリ準備

```bash
cd /Users/shunsuke/Dev/codex

# Issue/PR作成用のテンプレート配置
mkdir -p .github/ISSUE_TEMPLATE
cp /Users/shunsuke/Dev/Autonomous-Operations/.github/ISSUE_TEMPLATE/* .github/ISSUE_TEMPLATE/

# ラベル導入
gh label sync --file /Users/shunsuke/Dev/Autonomous-Operations/templates/labels.yml
```

### ステップ2: Phase 0 Issue作成

```bash
# Human Guardian がPhase 0 Issueを作成
gh issue create \
  --title "Phase 0: 準備フェーズ - 環境構築" \
  --label "📋Type.Task,🔴Priority.Critical,🏷️Phase.0-Setup,🤖Agent.Setup,⏳State.Pending" \
  --assignee ShunsukeHayashi \
  --body "$(cat <<'EOF'
# Phase 0: 準備フェーズ - 環境構築

**担当**: SetupAgent
**期限**: 2日
**参照**: INTEGRATION_PLAN_MIYABI.md

## タスク
- [ ] codex/codex-miyabi/ ディレクトリ作成
- [ ] Autonomous-Operationsコードコピー
- [ ] pnpm workspace統合
- [ ] ビルド確認

## 完了条件
- pnpm run build 成功

## 参照資料
- [統合計画書](INTEGRATION_PLAN_MIYABI.md)
- [Autonomous-Operations](/Users/shunsuke/Dev/Autonomous-Operations)
EOF
)"
```

### ステップ3: SetupAgent 起動

```bash
# Claude Code (SetupAgent) を起動
cd /Users/shunsuke/Dev/codex

# Issueを読み込んで作業開始
codex "Work on GitHub issue #TBD (Phase 0: 準備フェーズ)"

# または、直接指示
codex "Execute Phase 0 of INTEGRATION_PLAN_MIYABI.md:
1. Create codex-miyabi/ directory
2. Copy Autonomous-Operations code
3. Integrate pnpm workspace
4. Verify build"
```

### ステップ4: 並列実行 (Phase 2以降)

```bash
# 複数エージェント並列実行 (例: Phase 2)
# Terminal 1: IntegrationAgent
codex "Work on Phase 2 - Agent Integration"

# Terminal 2: ReviewAgent (別プロセス)
codex "Review all PRs for Phase 2"

# Terminal 3: TestAgent (別プロセス)
codex "Create tests for Phase 2 implementation"

# Human Guardian: 進捗監視
gh issue list --label "🏷️Phase.2-Integration,⚡State.InProgress"
```

---

## 📊 進捗管理

### GitHub Projects V2設定

```bash
# プロジェクト作成
gh project create --owner openai --title "Codex x Miyabi Integration"

# カスタムフィールド追加
# - Phase (Phase 0-7)
# - Agent (SetupAgent, MCPAgent, etc.)
# - Quality Score (0-100)
# - Test Coverage (0-100%)
# - Estimated Days (1-7)
```

### KPIダッシュボード

```bash
# Autonomous-Operationsのダッシュボード生成を利用
cd /Users/shunsuke/Dev/Autonomous-Operations
npm run dashboard:generate -- --project="Codex x Miyabi Integration"

# GitHub Pages でホスト
# https://openai.github.io/codex/integration-dashboard/
```

### 週次レポート自動生成

```bash
# 毎週金曜日に自動実行
npm run report:weekly:issue -- --project="Codex x Miyabi Integration"

# 生成されるレポート:
# - 今週完了したPhase
# - 品質スコア平均
# - テストカバレッジ推移
# - 次週の計画
```

---

## ⚠️ エスカレーションルール

### Graceful Degradation (段階的縮退)

#### Level 1: Agent自己解決
```
エラー発生 → Agent がリトライ (3回まで)
```

#### Level 2: ReviewAgent支援
```
3回失敗 → ReviewAgent がコードレビュー・助言
```

#### Level 3: Human Guardian介入
```
ReviewAgent でも解決不可 → Human Guardian にエスカレーション
```

### Handshake Protocol

```yaml
# Agent が自律解決不可と判断した場合
gh issue create \
  --title "🆘 HANDSHAKE PROTOCOL: Phase X ブロック" \
  --label "👤Agent.Human,🔴Priority.Critical,🆘State.Blocked" \
  --assignee ShunsukeHayashi \
  --body "Agent の自律性が限界に達しました。Guardian の介入を要請します。

## ブロック内容
[詳細]

## 試行した解決策
1. [解決策1] → 失敗
2. [解決策2] → 失敗
3. [解決策3] → 失敗

## 推奨アクション
[Agentからの提案]
"
```

---

## 🎓 ベストプラクティス

### 1. Conventional Commits厳守

```bash
# 良い例
git commit -m "feat(mcp-server): implement miyabi_analyze_issue tool

- Add IssueAgent integration
- Implement label classification logic
- Add unit tests

Co-Authored-By: Claude <noreply@anthropic.com>"

# 悪い例
git commit -m "update code"
```

### 2. PR Description テンプレート

```markdown
## 概要
[何を実装したか]

## 変更内容
- [変更1]
- [変更2]

## テスト
- [ ] ユニットテスト作成
- [ ] 統合テスト実施
- [ ] カバレッジ ≥ 70%

## 品質スコア
- ESLint/Clippy: ✅ 警告なし
- テストカバレッジ: 78%
- 品質スコア: 82点

## レビュー依頼
@ReviewAgent による自動レビュー完了。
Human Guardian の最終承認をお願いします。
```

### 3. ドキュメント First

```bash
# 実装前にドキュメント作成
echo "# MCP Server Implementation" > codex-miyabi/packages/miyabi-mcp-server/README.md

# 実装完了後に更新
codex "Update README.md for miyabi-mcp-server with usage examples"
```

---

## 🔐 セキュリティ

### トークン管理

```bash
# 環境変数のみ使用
export GITHUB_TOKEN=$(gh auth token)
export ANTHROPIC_API_KEY=sk-ant-xxx

# .env ファイルは .gitignore に追加済み
echo ".env" >> .gitignore
```

### 機密情報スキャン

```bash
# SecurityAgent が自動実行
npm run security:scan

# エラー発生時は即座にHuman Guardianに通知
```

---

## 📅 スケジュール (例)

| 週 | Phase | 担当Agent | マイルストーン |
|----|-------|-----------|----------------|
| Week 1 | Phase 0-1 | Setup, MCP | MCP Server基盤完成 |
| Week 2 | Phase 2 | Integration | 全エージェントMCP化 |
| Week 3 | Phase 3 | GitHub | GitHub統合完了 |
| Week 4 | Phase 4 | SDK | TypeScript SDK完成 |
| Week 5 | Phase 5-6 | Doc, Security | ドキュメント・セキュリティ |
| Week 6 | Phase 7 | 全員 | 最終調整・リリース |

---

## ✅ 成功の定義

### Phase完了時
- [ ] 全タスクチェックボックス完了
- [ ] テストカバレッジ ≥ 70%
- [ ] 品質スコア ≥ 80点
- [ ] Human Guardian承認

### プロジェクト完了時
- [ ] 全7 Phase完了
- [ ] 統合テスト全パス
- [ ] ドキュメント完備
- [ ] Codex CLIでMiyabi全機能利用可能
- [ ] セキュリティスキャン全クリア

---

## 🤝 参加者

| 役割 | 名前 | 責任範囲 |
|------|------|----------|
| Human Guardian | @ShunsukeHayashi | 最終承認・エスカレーション対応 |
| CoordinatorAgent | Claude (Main) | 全体統括 |
| SetupAgent | Claude Instance 1 | Phase 0 |
| MCPAgent | Claude Instance 2 | Phase 1 |
| IntegrationAgent | Claude Instance 3 | Phase 2 |
| GitHubAgent | Claude Instance 4 | Phase 3 |
| SDKAgent | Claude Instance 5 | Phase 4 |
| DocAgent | Claude Instance 6 | Phase 5 |
| SecurityAgent | Claude Instance 7 | Phase 6 |
| ReviewAgent | Claude (Support) | コードレビュー |
| TestAgent | Claude (Support) | テスト作成 |

---

**開始日**: 2025-10-10
**目標完了日**: 2025-11-21 (6週間後)
**運用方式**: Autonomous-Operations準拠

---

**このドキュメントはClaude Codeが参照します。常に最新に保ってください。**
