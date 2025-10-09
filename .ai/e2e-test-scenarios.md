# エンドツーエンドテストシナリオ

**作成日**: 2025-10-10
**Phase**: 7 (E2Eテスト)
**推定工数**: 2-3時間

---

## 🎯 目的

Miyabi自律型開発環境の完全自動化フロー（Issue→PR）を実環境でテストする。

---

## 🧪 テストシナリオ一覧

### シナリオ1: 単純バグ修正（small complexity）

**目的**: 基本的なIssue→PRフローの動作確認

**手順**:
1. テストIssueを作成
   ```markdown
   Title: 🐛 Bug: Fix typo in README.md
   Body:
   READMEの3行目に "Codx" という typo があります。
   正しくは "Codex" です。

   ## Expected
   - Codex

   ## Actual
   - Codx
   ```

2. `🤖 agent:coordinator` ラベルを手動追加

3. 自動実行フローの確認:
   - IssueAgent: ラベル自動付与（`🐛 type:bug`, `📊 priority:P2-Medium`, `complexity:small`）
   - CoordinatorAgent: タスク分解（単純なため1タスク）
   - CodeGenAgent: README.md修正
   - ReviewAgent: 品質チェック（100点想定）
   - TestAgent: テスト実行（該当なし）
   - PRAgent: Draft PR作成

**期待される結果**:
- ✅ PR作成完了（5分以内）
- ✅ 品質スコア: 95-100点
- ✅ Draft PR本文に品質レポート含む
- ✅ Closes #X リンク

**検証ポイント**:
- [ ] IssueAgentのラベル精度
- [ ] CodeGenAgentの修正内容
- [ ] ReviewAgentの品質スコア
- [ ] PR作成の完全性

---

### シナリオ2: 中規模機能追加（medium complexity）

**目的**: タスク分解とコード生成の精度確認

**手順**:
1. テストIssueを作成
   ```markdown
   Title: ✨ Feature: Add dark mode toggle to settings
   Body:
   ## Description
   設定画面にダークモード切り替えボタンを追加してください。

   ## Requirements
   1. Settings.tsx にトグルボタンを追加
   2. LocalStorageにダークモード状態を保存
   3. アプリ全体にダークモードを適用
   4. テストを追加

   ## Acceptance Criteria
   - [ ] ボタンクリックでダークモード切り替え
   - [ ] リロード後も状態が保持される
   - [ ] カバレッジ ≥ 80%
   ```

2. `🤖 agent:coordinator` ラベルを追加

3. 自動実行フローの確認:
   - IssueAgent: `✨ type:feature`, `complexity:medium`, `effort:4h`
   - CoordinatorAgent: 4タスクに分解
     ```
     Task 1: Settings.tsxにトグルボタン追加
     Task 2: LocalStorage管理ロジック実装
     Task 3: アプリ全体のテーマ適用
     Task 4: テスト追加
     ```
   - CodeGenAgent: 並列実行（Task 1-4）
   - ReviewAgent: 品質チェック（85点以上）
   - TestAgent: カバレッジ確認（80%以上）
   - PRAgent: Draft PR作成

**期待される結果**:
- ✅ PR作成完了（15分以内）
- ✅ 品質スコア: 80-95点
- ✅ カバレッジ: ≥80%
- ✅ 4ファイル変更（Settings.tsx, theme.ts, App.tsx, Settings.test.tsx）

**検証ポイント**:
- [ ] DAG生成の正確性
- [ ] 並列実行の効率性
- [ ] 生成コードの品質
- [ ] テストカバレッジ

---

### シナリオ3: 大規模リファクタリング（large complexity）

**目的**: 複雑なタスク分解と品質ゲートの動作確認

**手順**:
1. テストIssueを作成
   ```markdown
   Title: ♻️ Refactor: Migrate class components to hooks
   Body:
   ## Description
   src/components/ 配下のすべてのクラスコンポーネントをReact Hooksに移行してください。

   ## Scope
   - UserProfile.tsx (200行)
   - Dashboard.tsx (350行)
   - Settings.tsx (150行)

   ## Requirements
   1. useState, useEffect, useContext を使用
   2. 既存の機能を維持
   3. テストもHooksに対応
   4. 品質スコア ≥ 85点
   ```

2. `🤖 agent:coordinator` ラベルを追加

3. 自動実行フローの確認:
   - IssueAgent: `♻️ type:refactor`, `complexity:large`, `effort:1d`
   - CoordinatorAgent: 9タスクに分解（3ファイル × 3ステップ）
     ```
     Critical Path: UserProfile → Dashboard → Settings
     Parallel: 各ファイルのリファクタ・テスト・レビューは並行可能
     ```
   - CodeGenAgent: 並列実行（最大3タスク同時）
   - ReviewAgent: **品質ゲート重要** - 80点未満で却下
   - TestAgent: カバレッジ確認
   - PRAgent: Draft PR作成

**期待される結果**:
- ✅ PR作成完了（30分以内）
- ✅ 品質スコア: 85-90点
- ✅ カバレッジ: ≥80%
- ✅ 3ファイル + 3テストファイル変更

**品質ゲートテスト**:
- 故意に品質スコア79点のコードを生成させた場合、ReviewAgentが却下すること

**検証ポイント**:
- [ ] Critical Path計算
- [ ] 並列実行数制御（最大3）
- [ ] 品質ゲート動作（80点基準）
- [ ] リファクタリングの正確性

---

### シナリオ4: セキュリティ脆弱性（P0-Critical）

**目的**: 優先度判定とセキュリティスキャンの動作確認

**手順**:
1. テストIssueを作成
   ```markdown
   Title: 🔥 Security: Fix SQL injection vulnerability
   Body:
   ## Severity: P0-Critical

   src/api/users.ts の getUserById() 関数でSQL injectionの脆弱性を発見しました。

   ## Vulnerable Code
   \`\`\`typescript
   const query = `SELECT * FROM users WHERE id = ${userId}`;
   \`\`\`

   ## Expected Fix
   - Prepared statementを使用
   - 入力バリデーション追加
   - セキュリティテスト追加
   ```

2. `🤖 agent:coordinator` ラベルを追加

3. 自動実行フローの確認:
   - IssueAgent: `🔥 priority:P0-Critical`, `🔐 category:security`
   - CoordinatorAgent: 高優先度タスクとして処理
   - CodeGenAgent: Prepared statement実装
   - ReviewAgent: **セキュリティスキャン必須**
   - TestAgent: セキュリティテスト実行
   - PRAgent: PRにセキュリティラベル付与

**期待される結果**:
- ✅ PR作成完了（10分以内、最優先処理）
- ✅ 品質スコア: 90-100点
- ✅ セキュリティスキャン: PASS
- ✅ PRに `🔐 security` ラベル

**検証ポイント**:
- [ ] 優先度判定（P0-Critical）
- [ ] セキュリティスキャン実行
- [ ] Prepared statement実装
- [ ] セキュリティテスト追加

---

### シナリオ5: 経済Circuit Breaker（予算超過）

**目的**: 予算管理と緊急停止の動作確認

**手順**:
1. テスト用に月間予算を **$10** に設定（少額でテスト）
   ```bash
   export MIYABI_MONTHLY_BUDGET=10
   export MIYABI_WARNING_THRESHOLD=0.8
   export MIYABI_EMERGENCY_THRESHOLD=1.5
   ```

2. 大量のIssueを連続作成（10個以上）

3. 自動実行フローの確認:
   - 各Issue処理で予算チェック（`checkBudget` Tool）
   - 予算使用率80%で警告ログ
   - 予算使用率150%で**緊急停止**

**期待される結果**:
- ✅ 80%到達時: 警告ログ出力
   ```
   ⚠️ WARNING: Budget usage at 85% ($8.50/$10.00)
   ```
- ✅ 100%到達時: 新規Issue処理を拒否
   ```
   ❌ ERROR: Monthly budget exceeded ($11.00/$10.00)
   New agent executions are disabled until next month.
   ```
- ✅ 150%到達時: **全Agent緊急停止**
   ```
   🚨 EMERGENCY STOP: Budget at 152% ($15.20/$10.00)
   All autonomous operations halted. Guardian intervention required.
   ```

**検証ポイント**:
- [ ] 予算トラッキング精度
- [ ] 80%警告発動
- [ ] 100%拒否発動
- [ ] 150%緊急停止発動

---

### シナリオ6: 並列実行ストレステスト

**目的**: 並列実行数制御とDAG依存関係の検証

**手順**:
1. 複雑な依存関係を持つIssueを作成
   ```markdown
   Title: 🏗️ Feature: Complete authentication system
   Body:
   以下の機能を実装してください:

   1. User model実装
   2. Login API実装（depends on 1）
   3. Register API実装（depends on 1）
   4. Password reset API実装（depends on 1, 2）
   5. Email verification実装（depends on 3）
   6. 2FA実装（depends on 2）

   依存関係:
   - 2, 3 → 1
   - 4 → 1, 2
   - 5 → 3
   - 6 → 2
   ```

2. `🤖 agent:coordinator` ラベルを追加

3. 自動実行フローの確認:
   - CoordinatorAgent: DAG生成
     ```
     Level 0: Task 1 (User model)
     Level 1: Task 2 (Login), Task 3 (Register) [並列実行]
     Level 2: Task 4 (Password reset), Task 5 (Email verification), Task 6 (2FA) [並列実行、最大3]
     ```
   - 並列実行数が常に **≤3** であること
   - 依存関係を守って実行されること

**期待される結果**:
- ✅ DAG生成成功
- ✅ 並列実行数 ≤ 3（常時）
- ✅ 依存関係違反なし
- ✅ 実行時間が順次実行の50%以下

**検証ポイント**:
- [ ] DAG生成の正確性
- [ ] 並列実行数制御
- [ ] 依存関係の順守
- [ ] 実行時間の効率化

---

## 📊 テスト実行計画

### Phase 1: 基本機能テスト（並行実行）
```bash
# シナリオ1, 2, 3を並行実行
npm run test:e2e -- --scenario 1 &
npm run test:e2e -- --scenario 2 &
npm run test:e2e -- --scenario 3 &
wait
```

### Phase 2: 高度機能テスト（順次実行）
```bash
# シナリオ4, 5, 6を順次実行（予算管理があるため）
npm run test:e2e -- --scenario 4
npm run test:e2e -- --scenario 5
npm run test:e2e -- --scenario 6
```

---

## ✅ 合格基準

| シナリオ | 成功基準 |
|----------|----------|
| 1. 単純バグ修正 | 品質スコア ≥ 95, 時間 ≤ 5分 |
| 2. 中規模機能追加 | 品質スコア ≥ 80, カバレッジ ≥ 80%, 時間 ≤ 15分 |
| 3. 大規模リファクタリング | 品質スコア ≥ 85, 品質ゲート動作, 時間 ≤ 30分 |
| 4. セキュリティ脆弱性 | セキュリティスキャンPASS, 時間 ≤ 10分 |
| 5. 経済Circuit Breaker | 80%警告, 100%拒否, 150%緊急停止 |
| 6. 並列実行ストレス | 並列数 ≤ 3, 依存関係順守 |

**総合合格基準**: 6シナリオ中 **5シナリオ以上**で成功

---

## 🔧 テスト環境構築

### 1. テストリポジトリ作成

```bash
# フォークまたは新規リポジトリ
gh repo create miyabi-test --public --clone
cd miyabi-test

# 初期ファイル配置
echo "# Codex" > README.md
mkdir -p src/components src/api
```

### 2. MCP Server起動

```bash
# Miyabi MCP Server
cd codex-miyabi/packages/miyabi-mcp-server
npm run build
npm run start &

# Codex CLI設定
cat >> ~/.codex/config.toml <<EOF
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
EOF
```

### 3. テストIssue作成スクリプト

```typescript
// create-test-issue.ts
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function createTestIssue(scenario: number) {
  const scenarios = {
    1: {
      title: "🐛 Bug: Fix typo in README.md",
      body: "READMEの3行目に \"Codx\" という typo があります...",
    },
    // ... 他のシナリオ
  };

  const issue = await octokit.issues.create({
    owner: "ShunsukeHayashi",
    repo: "miyabi-test",
    ...scenarios[scenario],
  });

  console.log(`Created issue #${issue.data.number}`);
}

createTestIssue(parseInt(process.argv[2]));
```

---

## 📈 メトリクス収集

### 測定項目

1. **実行時間**
   - Issue作成 → PR作成完了までの時間

2. **品質スコア**
   - ReviewAgentが算出した0-100のスコア

3. **カバレッジ**
   - テストカバレッジ（%）

4. **予算使用量**
   - Anthropic API コスト（USD）

5. **並列実行効率**
   - 順次実行との比較（時間短縮率）

### レポート生成

```bash
npm run test:e2e:report

# 出力:
# E2E Test Report - 2025-10-10
# ====================================
# Scenario 1: PASSED (品質: 98, 時間: 4m12s)
# Scenario 2: PASSED (品質: 87, 時間: 13m45s, カバレッジ: 82%)
# Scenario 3: PASSED (品質: 86, 時間: 28m31s)
# Scenario 4: PASSED (品質: 95, セキュリティ: PASS)
# Scenario 5: PASSED (予算管理: OK)
# Scenario 6: PASSED (並列効率: 58%短縮)
# ====================================
# Overall: 6/6 PASSED ✅
```

---

**作成**: 2025-10-10
**次のアクション**: 経済Circuit Breaker実装計画（並行タスク4）
