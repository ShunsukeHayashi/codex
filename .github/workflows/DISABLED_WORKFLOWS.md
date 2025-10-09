# 無効化されたワークフロー

以下のワークフローは、Phase 4のワークフロー最適化により無効化されました。

## 無効化されたファイル

### 1. `issue-opened.yml.disabled`

**理由**: `state-machine.yml`に統合

**元の機能**:
- 新規Issue作成時の自動ラベル付け
- Type, Priority, State, Phaseラベルの自動割り当て

**現在の処理**:
- `state-machine.yml`の`initial-triage` jobが同等の機能を提供
- より高度なロジック（キーワードベースの自動分類）
- Concurrency設定により並行実行を制御

---

### 2. `webhook-handler.yml.disabled`

**理由**: ログ専用で実処理なし、他ワークフローとの競合

**元の機能**:
- すべてのGitHubイベントをログ出力
- イベントルーティング（ただし実処理は他ワークフローに委譲）

**影響**:
- ログ出力がなくなるのみ
- 実際のAgent実行は`autonomous-agent.yml`と`state-machine.yml`が担当

**代替手段**:
- GitHub Actions UIで各ワークフローの実行ログを確認可能
- 必要に応じて再有効化可能

---

### 3. `webhook-event-router.yml.disabled`

**理由**: `webhook-handler.yml`と同様、ルーティング専用で実処理なし

**元の機能**:
- イベントの振り分け
- ワークフロー間の調整

**影響**:
- 各ワークフローが直接イベントをリッスンするため不要
- Concurrency設定により競合を回避

---

## 再有効化方法

必要に応じて、以下のコマンドで再有効化できます：

```bash
# 例: issue-opened.ymlを再有効化
git mv .github/workflows/issue-opened.yml.disabled .github/workflows/issue-opened.yml
git commit -m "chore: re-enable issue-opened.yml workflow"
git push
```

**注意**: 再有効化する場合、`state-machine.yml`との競合を避けるため、以下のいずれかを実施してください：
1. `state-machine.yml`の該当機能を削除
2. ワークフローのトリガー条件を調整（異なるラベルなど）
3. Concurrency設定を適切に構成

---

## ワークフロー最適化の効果

### Before (Phase 3まで)
- **22個のワークフロー**が同時実行
- Issues.opened イベントで **5-6個のワークフロー**が競合
- GitHub Actionsキューが飽和
- State machineが実行されない

### After (Phase 4)
- **19個のアクティブワークフロー**（3個無効化）
- Issues.opened イベントで **2個のワークフロー**のみ（state-machine, auto-add-to-project）
- Concurrency設定により順序を制御
- 並行実行数の削減

---

**最終更新**: 2025-10-10
**Phase**: Phase 4 - Workflow Optimization
**関連Issue**: #8 (Test Issue)
