# Next Sprint計画書 - Phase 8-10

**作成日**: 2025-10-10
**前Sprint完了**: Phase 0-7（Miyabi統合基盤完成）
**Sprint期間**: 2-3週間
**目標**: Production Ready - 実API統合と実環境デプロイ

---

## 📊 前Sprint完了状況

### ✅ Phase 0-7完了サマリー

**実装済み**:
- Phase 0-4: 環境構築・統合基盤（7,723行）
- Phase 5: MCP Server実装（2,643行）
- Phase 6: Agent SDK (P0+P1+P2)（2,060行、6 Agents）
- Phase 7: E2Eテストフレームワーク（600行、6シナリオ）

**総実装**: 約5,300行（TypeScript）、9 commits

**未実装**:
- Phase 6 P3: DeploymentAgent（将来拡張として延期）
- 実API統合（Claude Sonnet 4, GitHub API）
- 実環境E2Eテスト
- Production Deployment

---

## 🎯 Next Sprint目標

### Phase 8: 実API統合（最優先）

**目標**: Mock実装から実API統合へ移行

#### 8-1: Claude Sonnet 4 API統合（3-4時間）

**現状**: 全Agentが分析・生成・レビュー処理でMock実装

**タスク**:

1. **AnthropicClient実装完全化**
   ```typescript
   // codex-miyabi/packages/miyabi-mcp-server/src/utils/AnthropicClient.ts
   import Anthropic from "@anthropic-ai/sdk";

   export class AnthropicClient {
     private client: Anthropic;

     constructor(apiKey: string) {
       this.client = new Anthropic({ apiKey });
     }

     // Issue分析（IssueAgent用）
     async analyzeIssue(issueData: {
       title: string;
       body: string;
       labels: string[];
     }): Promise<IssueAnalysisResult> {
       const response = await this.client.messages.create({
         model: "claude-sonnet-4-20250514",
         max_tokens: 1024,
         messages: [{
           role: "user",
           content: this.buildIssueAnalysisPrompt(issueData)
         }]
       });

       return this.parseIssueAnalysis(response.content[0].text);
     }

     // コード生成（CodeGenAgent用）
     async generateCode(task: {
       description: string;
       language: string;
       context: string[];
     }): Promise<GeneratedCode> {
       const response = await this.client.messages.create({
         model: "claude-sonnet-4-20250514",
         max_tokens: 8192,
         messages: [{
           role: "user",
           content: this.buildCodeGenPrompt(task)
         }]
       });

       return this.parseGeneratedCode(response.content[0].text);
     }

     // コードレビュー（ReviewAgent用）
     async reviewCode(files: FileChange[]): Promise<ReviewResult> {
       const response = await this.client.messages.create({
         model: "claude-sonnet-4-20250514",
         max_tokens: 2048,
         messages: [{
           role: "user",
           content: this.buildReviewPrompt(files)
         }]
       });

       return this.parseReview(response.content[0].text);
     }
   }
   ```

2. **Agent更新（Mock → Real API）**
   - IssueAgent.ts: Mock分析 → Claude API分析
   - CodeGenAgent.ts: Mock生成 → Claude API生成
   - ReviewAgent.ts: Mock評価 → Claude API評価

3. **プロンプトエンジニアリング**
   ```typescript
   // codex-miyabi/packages/miyabi-agent-sdk/src/prompts/
   export const ISSUE_ANALYSIS_PROMPT = `
   あなたはGitHub Issue分析の専門家です。以下のIssueを分析してください。

   # Issue
   タイトル: {title}
   本文: {body}

   # 分析項目
   1. Type: bug/feature/refactor/docs/test/chore
   2. Priority: P0-Critical/P1-High/P2-Medium/P3-Low
   3. Complexity: small/medium/large/xlarge
   4. Related Files: コード変更が必要なファイル

   # 出力形式
   JSON形式で回答してください。
   {
     "type": "...",
     "priority": "...",
     "complexity": "...",
     "relatedFiles": ["..."],
     "reasoning": "判断理由"
   }
   `;
   ```

4. **コスト追跡強化**
   ```typescript
   // BudgetManager更新
   async trackAPIUsage(request: {
     agent: string;
     model: string;
     inputTokens: number;
     outputTokens: number;
   }) {
     const cost = this.calculateCost(request);
     await this.db.run(
       `INSERT INTO api_usage
        (timestamp, agent, model, input_tokens, output_tokens, cost_usd)
        VALUES (?, ?, ?, ?, ?, ?)`,
       [Date.now(), request.agent, request.model,
        request.inputTokens, request.outputTokens, cost]
     );
   }
   ```

**成果物**:
- [ ] AnthropicClient完全実装
- [ ] 3 Agents（Issue/CodeGen/Review）API統合
- [ ] プロンプトテンプレート（3種類）
- [ ] コスト追跡機能強化

**検証**:
```bash
# IssueAgent実API実行
ANTHROPIC_API_KEY=sk-ant-xxx npm run test:agent:issue

# 期待結果: 実際のClaude API呼び出し、正確な分析結果
```

**推定コスト**: 1 Issue分析 = $0.02 - $0.05

---

#### 8-2: GitHub API統合（2-3時間）

**現状**: GitHubClient実装済みだがMock実装

**タスク**:

1. **GitHub API実装完全化**
   ```typescript
   // codex-miyabi/packages/miyabi-mcp-server/src/utils/GitHubClient.ts
   import { Octokit } from "@octokit/rest";

   export class GitHubClient {
     private octokit: Octokit;

     constructor(token: string) {
       this.octokit = new Octokit({ auth: token });
     }

     // Issue取得（実装済み → 実API化）
     async getIssue(owner: string, repo: string, issueNumber: number) {
       const { data } = await this.octokit.issues.get({
         owner,
         repo,
         issue_number: issueNumber
       });
       return data;
     }

     // ラベル自動付与
     async addLabels(owner: string, repo: string, issueNumber: number, labels: string[]) {
       await this.octokit.issues.addLabels({
         owner,
         repo,
         issue_number: issueNumber,
         labels
       });
     }

     // Branch作成
     async createBranch(owner: string, repo: string, branchName: string, baseSha: string) {
       await this.octokit.git.createRef({
         owner,
         repo,
         ref: `refs/heads/${branchName}`,
         sha: baseSha
       });
     }

     // File commit（Git Tree API）
     async commitFiles(params: {
       owner: string;
       repo: string;
       branch: string;
       files: Array<{ path: string; content: string }>;
       message: string;
     }) {
       // 1. Get current commit SHA
       const { data: ref } = await this.octokit.git.getRef({
         owner: params.owner,
         repo: params.repo,
         ref: `heads/${params.branch}`
       });

       // 2. Create blobs for each file
       const blobs = await Promise.all(
         params.files.map(file =>
           this.octokit.git.createBlob({
             owner: params.owner,
             repo: params.repo,
             content: Buffer.from(file.content).toString('base64'),
             encoding: 'base64'
           })
         )
       );

       // 3. Create tree
       const { data: tree } = await this.octokit.git.createTree({
         owner: params.owner,
         repo: params.repo,
         tree: params.files.map((file, i) => ({
           path: file.path,
           mode: '100644',
           type: 'blob',
           sha: blobs[i].data.sha
         })),
         base_tree: ref.object.sha
       });

       // 4. Create commit
       const { data: commit } = await this.octokit.git.createCommit({
         owner: params.owner,
         repo: params.repo,
         message: params.message,
         tree: tree.sha,
         parents: [ref.object.sha]
       });

       // 5. Update ref
       await this.octokit.git.updateRef({
         owner: params.owner,
         repo: params.repo,
         ref: `heads/${params.branch}`,
         sha: commit.sha
       });
     }

     // Draft PR作成
     async createPullRequest(params: {
       owner: string;
       repo: string;
       title: string;
       body: string;
       head: string;
       base: string;
     }) {
       const { data } = await this.octokit.pulls.create({
         ...params,
         draft: true
       });
       return data;
     }
   }
   ```

2. **Agent更新（Mock → Real GitHub API）**
   - IssueAgent: 実Issue取得、実ラベル付与
   - CodeGenAgent: 関連ファイル実取得
   - PRAgent: 実Branch作成、実Commit、実PR作成

3. **Rate Limit対策**
   ```typescript
   export class GitHubRateLimiter {
     async checkRateLimit(): Promise<{
       remaining: number;
       reset: Date;
     }> {
       const { data } = await this.octokit.rateLimit.get();
       return {
         remaining: data.rate.remaining,
         reset: new Date(data.rate.reset * 1000)
       };
     }

     async waitIfNeeded() {
       const { remaining, reset } = await this.checkRateLimit();
       if (remaining < 100) {
         const waitMs = reset.getTime() - Date.now();
         console.warn(`Rate limit low (${remaining}). Waiting ${waitMs}ms...`);
         await new Promise(resolve => setTimeout(resolve, waitMs));
       }
     }
   }
   ```

**成果物**:
- [ ] GitHubClient完全実装
- [ ] 4 Agents（Issue/CodeGen/Review/PR）GitHub API統合
- [ ] Rate Limit対策実装
- [ ] エラーハンドリング強化

**検証**:
```bash
# PRAgent実API実行
GITHUB_TOKEN=ghp_xxx npm run test:agent:pr

# 期待結果: 実Branch作成、実Commit、実Draft PR作成
```

---

#### 8-3: 統合テスト（実API）（2-3時間）

**タスク**:

1. **E2E Tests更新（Mock → Real API）**
   ```typescript
   // codex-miyabi/packages/miyabi-agent-sdk/src/e2e/E2ETestHarness.ts
   export class E2ETestHarness {
     constructor(
       private config: {
         useRealAPI: boolean;
         githubToken?: string;
         anthropicKey?: string;
         testRepo?: string;  // テスト用リポジトリ
       }
     ) {}

     async runScenario(scenario: E2EScenario): Promise<E2ETestResult> {
       if (this.config.useRealAPI) {
         // 実API使用
         this.issueAgent = new IssueAgent({
           githubToken: this.config.githubToken!,
           anthropicKey: this.config.anthropicKey!
         });
       } else {
         // Mock使用（既存実装）
       }

       // ... 既存のシナリオ実行ロジック
     }
   }
   ```

2. **テスト環境準備**
   ```bash
   # テスト用リポジトリ作成
   gh repo create miyabi-e2e-test --private --description "E2E test repository"

   # テスト用Issue作成
   gh issue create --repo miyabi-e2e-test \
     --title "🐛 Bug: Test typo in README" \
     --body "README line 3 has typo: 'Codx' should be 'Codex'"
   ```

3. **実API E2E実行**
   ```bash
   # 実API使用でE2Eテスト実行
   ANTHROPIC_API_KEY=sk-ant-xxx \
   GITHUB_TOKEN=ghp_xxx \
   TEST_REPO=shunsuke/miyabi-e2e-test \
   npm run test:e2e:real -- --scenario 1

   # 期待結果:
   # 1. IssueAgent: 実Issue取得、Claude分析、実ラベル付与
   # 2. CoordinatorAgent: DAG生成
   # 3. CodeGenAgent: Claude生成、実ファイル取得
   # 4. ReviewAgent: Claude評価（品質スコア≥95）
   # 5. PRAgent: 実Branch/Commit/PR作成
   # 6. 品質基準達成、PR URL返却
   ```

**成果物**:
- [ ] E2E Tests（実API対応）
- [ ] テスト環境構築スクリプト
- [ ] 実API E2E実行成功（シナリオ1）
- [ ] 実API E2E実行成功（全6シナリオ、5/6以上）

**検証**:
```bash
# 全シナリオ実行
npm run test:e2e:real

# 期待結果: ✅ 5/6シナリオ成功、品質スコア≥80
```

**推定コスト**: 全6シナリオ実行 = $2-5

---

### Phase 9: DeploymentAgent実装（P3）（4-5時間）

**目標**: 7つ目のAgent完成、CI/CD自動化

#### 9-1: DeploymentAgent実装（3-4時間）

**機能**:

```typescript
// codex-miyabi/packages/miyabi-agent-sdk/src/agents/DeploymentAgent.ts
export class DeploymentAgent {
  async deploy(input: DeploymentInput): Promise<DeploymentOutput> {
    // 1. デプロイ前チェック
    const preChecks = await this.runPreDeploymentChecks({
      repository: input.repository,
      branch: input.branch,
      environment: input.environment  // staging/production
    });

    if (!preChecks.passed) {
      return {
        success: false,
        errors: preChecks.errors
      };
    }

    // 2. CI/CDトリガー（GitHub Actions）
    const workflow = await this.triggerWorkflow({
      repository: input.repository,
      workflow: "deploy.yml",
      inputs: {
        environment: input.environment,
        version: input.version
      }
    });

    // 3. デプロイ監視
    const deployResult = await this.monitorDeployment({
      workflowRunId: workflow.id,
      timeout: 600000  // 10分
    });

    // 4. ヘルスチェック
    if (deployResult.success) {
      const health = await this.runHealthCheck({
        environment: input.environment,
        checks: ["http", "database", "dependencies"]
      });

      if (!health.passed) {
        // 5. 自動Rollback
        await this.rollback({
          environment: input.environment,
          previousVersion: input.previousVersion
        });

        return {
          success: false,
          errors: [`Health check failed: ${health.errors.join(", ")}`],
          rolledBack: true
        };
      }
    }

    // 6. デプロイ完了通知
    await this.notifyDeployment({
      environment: input.environment,
      version: input.version,
      status: deployResult.success ? "success" : "failed",
      duration: deployResult.duration
    });

    return {
      success: deployResult.success,
      deploymentUrl: deployResult.url,
      healthCheckResults: health,
      duration: deployResult.duration
    };
  }

  private async runPreDeploymentChecks(params: {
    repository: string;
    branch: string;
    environment: string;
  }): Promise<CheckResult> {
    // 1. Tests passed
    const testStatus = await this.checkTestStatus(params);
    if (!testStatus.passed) {
      return { passed: false, errors: ["Tests not passing"] };
    }

    // 2. No blocking PRs
    const blockingPRs = await this.checkBlockingPRs(params);
    if (blockingPRs.length > 0) {
      return {
        passed: false,
        errors: [`Blocking PRs: ${blockingPRs.join(", ")}`]
      };
    }

    // 3. Security scan passed
    const securityScan = await this.checkSecurityScan(params);
    if (!securityScan.passed) {
      return {
        passed: false,
        errors: [`Security issues: ${securityScan.issues.join(", ")}`]
      };
    }

    return { passed: true, errors: [] };
  }

  private async runHealthCheck(params: {
    environment: string;
    checks: string[];
  }): Promise<HealthCheckResult> {
    const results = await Promise.all(
      params.checks.map(check => this.runCheck(params.environment, check))
    );

    const failed = results.filter(r => !r.passed);

    return {
      passed: failed.length === 0,
      errors: failed.map(r => r.error)
    };
  }
}
```

**成果物**:
- [ ] DeploymentAgent実装（350行）
- [ ] Pre-deployment checks（Tests/PRs/Security）
- [ ] CI/CDトリガー（GitHub Actions統合）
- [ ] ヘルスチェック（HTTP/Database/Dependencies）
- [ ] 自動Rollback機能

**検証**:
```bash
# DeploymentAgent単体テスト
npm run test:agent:deployment

# E2E実行（DeploymentAgent含む）
npm run test:e2e -- --scenario 6
```

---

#### 9-2: CI/CD Workflow統合（1-2時間）

**タスク**:

1. **GitHub Actions Workflow作成**
   ```yaml
   # .github/workflows/miyabi-deploy.yml
   name: Miyabi Deploy

   on:
     workflow_dispatch:
       inputs:
         environment:
           description: 'Deployment environment'
           required: true
           type: choice
           options:
             - staging
             - production
         version:
           description: 'Version to deploy'
           required: true
           type: string

   jobs:
     deploy:
       runs-on: ubuntu-latest
       environment: ${{ inputs.environment }}

       steps:
         - uses: actions/checkout@v4

         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: 22
             cache: 'pnpm'

         - name: Install dependencies
           run: pnpm install

         - name: Build
           run: pnpm run build

         - name: Run Tests
           run: pnpm run test

         - name: Security Scan
           run: pnpm run security:scan

         - name: Deploy to ${{ inputs.environment }}
           run: |
             pnpm --filter @codex-miyabi/mcp-server deploy:${{ inputs.environment }}

         - name: Health Check
           run: |
             pnpm --filter @codex-miyabi/mcp-server healthcheck:${{ inputs.environment }}
   ```

2. **Deployment Scripts**
   ```json
   // codex-miyabi/packages/miyabi-mcp-server/package.json
   "scripts": {
     "deploy:staging": "node scripts/deploy.js staging",
     "deploy:production": "node scripts/deploy.js production",
     "healthcheck:staging": "node scripts/healthcheck.js staging",
     "healthcheck:production": "node scripts/healthcheck.js production"
   }
   ```

**成果物**:
- [ ] GitHub Actions Workflow（miyabi-deploy.yml）
- [ ] Deployment scripts（staging/production）
- [ ] Health check scripts
- [ ] Rollback scripts

---

### Phase 10: Production Deployment（3-4時間）

**目標**: 実環境デプロイ、監視設定

#### 10-1: Production環境構築（2-3時間）

**タスク**:

1. **環境変数設定（GitHub Secrets）**
   ```bash
   # Production secrets設定
   gh secret set ANTHROPIC_API_KEY_PROD --body "sk-ant-xxx"
   gh secret set GITHUB_TOKEN_PROD --body "ghp_xxx"
   gh secret set MIYABI_BUDGET_MONTHLY --body "500"
   ```

2. **MCP Server Production設定**
   ```toml
   # ~/.codex/config.toml (Production)
   [[mcp_servers]]
   name = "miyabi-prod"
   command = "node"
   args = ["/opt/codex-miyabi/packages/miyabi-mcp-server/dist/index.js"]
   env = {
     GITHUB_TOKEN = "${GITHUB_TOKEN_PROD}",
     ANTHROPIC_API_KEY = "${ANTHROPIC_API_KEY_PROD}",
     MIYABI_MONTHLY_BUDGET = "500",
     MIYABI_ENVIRONMENT = "production"
   }
   ```

3. **監視設定**
   ```typescript
   // codex-miyabi/packages/miyabi-mcp-server/src/monitoring.ts
   export class MonitoringClient {
     async logMetrics(metrics: {
       agent: string;
       duration: number;
       success: boolean;
       cost: number;
     }) {
       // CloudWatch/Datadog/Prometheusに送信
     }

     async sendAlert(alert: {
       severity: "warning" | "error" | "critical";
       message: string;
       context: Record<string, any>;
     }) {
       // PagerDuty/Slack通知
     }
   }
   ```

**成果物**:
- [ ] Production環境設定
- [ ] GitHub Secrets設定
- [ ] 監視設定（Metrics/Logs/Alerts）
- [ ] Production deployment成功

---

#### 10-2: 本番稼働開始（1-2時間）

**タスク**:

1. **Production E2E実行**
   ```bash
   # Production環境でE2E実行
   MIYABI_ENVIRONMENT=production npm run test:e2e:real

   # 期待結果: ✅ 5/6シナリオ成功
   ```

2. **実Issue自動処理テスト**
   ```bash
   # 実リポジトリのIssueを処理
   codex "Analyze GitHub issue ShunsukeHayashi/codex#1 and create a PR"

   # 期待動作:
   # 1. MiyabiがIssue #1を分析
   # 2. タスク分解（DAG生成）
   # 3. コード生成（Claude Sonnet 4）
   # 4. レビュー（品質スコア≥80）
   # 5. Draft PR作成
   # 6. 予算追跡（$0.50消費）
   ```

3. **監視ダッシュボード確認**
   - Agent成功率: >95%
   - 平均実行時間: <3分（small complexity）
   - 予算使用率: <80%
   - エラー率: <5%

**成果物**:
- [ ] Production稼働開始
- [ ] 実Issue処理成功（1件以上）
- [ ] 監視ダッシュボード稼働
- [ ] 運用ドキュメント作成

---

## 📊 Next Sprint推定工数

| Phase | タスク | 推定時間 | 優先度 |
|-------|--------|----------|--------|
| Phase 8-1 | Claude Sonnet 4 API統合 | 3-4h | **P0-Critical** |
| Phase 8-2 | GitHub API統合 | 2-3h | **P0-Critical** |
| Phase 8-3 | 統合テスト（実API） | 2-3h | **P0-Critical** |
| Phase 9-1 | DeploymentAgent実装 | 3-4h | P1-High |
| Phase 9-2 | CI/CD Workflow統合 | 1-2h | P1-High |
| Phase 10-1 | Production環境構築 | 2-3h | P1-High |
| Phase 10-2 | 本番稼働開始 | 1-2h | P1-High |

**合計**: 14-21時間（2-3週間 @ 1人）

**最小構成（MVP）**: Phase 8のみ = 7-10時間（実API統合）

---

## 🎯 成功基準

### Phase 8完了時
- [ ] Claude Sonnet 4 API統合完了（IssueAgent, CodeGenAgent, ReviewAgent）
- [ ] GitHub API統合完了（全Agent）
- [ ] 実API E2Eテスト成功（5/6シナリオ）
- [ ] 品質スコア≥80（実Claude評価）
- [ ] 予算追跡機能正常動作

### Phase 9完了時
- [ ] DeploymentAgent実装完了（7 Agents揃う）
- [ ] CI/CD Workflow動作確認
- [ ] 自動Rollback機能検証

### Phase 10完了時
- [ ] Production環境稼働
- [ ] 実Issue→PR自動化成功（1件以上）
- [ ] 監視ダッシュボード稼働
- [ ] Agent成功率>95%
- [ ] 予算使用率<80%

---

## 💰 推定コスト

### 開発コスト
- Claude API使用（開発・テスト）: $10-20
- E2E Tests実行（10回）: $20-50
- Production初期稼働（10 Issues処理）: $5-10

**合計**: $35-80

### 月間運用コスト（100 Issues処理想定）
- Claude API: $53 (100 Issues × $0.533)
- GitHub Actions: $0（Free tier内）
- 監視: $0（CloudWatch Free tier）

**合計**: ~$53/月（予算$500以内）

---

## ⚠️ リスクと対策

| リスク | 影響 | 確率 | 対策 |
|--------|------|------|------|
| Claude API品質低下 | 高 | 低 | プロンプトエンジニアリング最適化 |
| GitHub API Rate Limit | 中 | 中 | Rate limiter実装、複数トークン使用 |
| 予算超過 | 中 | 低 | Circuit Breaker実装済み |
| Production障害 | 高 | 低 | 自動Rollback、ヘルスチェック |

---

## 📝 ドキュメント更新

### 更新対象
1. **README.md**
   - Production deployment手順
   - 環境変数設定
   - トラブルシューティング

2. **MIYABI_INTEGRATION_SUMMARY.md**
   - Phase 8-10完了追記
   - Production稼働実績

3. **.ai/operation-log.md**
   - Next Sprint作業ログ記録

4. **新規作成**
   - `PRODUCTION_DEPLOYMENT_GUIDE.md` - 本番環境デプロイガイド
   - `MONITORING_GUIDE.md` - 監視・運用ガイド
   - `TROUBLESHOOTING.md` - トラブルシューティング

---

## 🚀 スタート準備

### 即座開始可能タスク

1. **Phase 8-1開始**
   ```bash
   cd codex-miyabi/packages/miyabi-mcp-server

   # AnthropicClient実装開始
   code src/utils/AnthropicClient.ts
   ```

2. **テスト環境準備**
   ```bash
   # テスト用リポジトリ作成
   gh repo create miyabi-e2e-test --private

   # テスト用Issue作成
   gh issue create --repo miyabi-e2e-test \
     --title "Test Issue for E2E" \
     --body "This is a test issue"
   ```

3. **API Keys確認**
   ```bash
   # 環境変数設定確認
   echo $ANTHROPIC_API_KEY
   echo $GITHUB_TOKEN
   ```

---

## ✅ Next Sprint開始チェックリスト

- [ ] Phase 0-7完了確認
- [ ] PR #12マージ（feature/miyabi-autonomous-integration）
- [ ] API Keys準備（ANTHROPIC_API_KEY, GITHUB_TOKEN）
- [ ] テスト環境リポジトリ作成
- [ ] Next Sprint Issue作成（GitHub）
- [ ] 作業ブランチ作成（`feature/miyabi-production-ready`）

---

**作成日**: 2025-10-10
**対象Sprint**: Phase 8-10
**期間**: 2-3週間
**目標**: Production Ready - 実API統合と実環境デプロイ

🚀 **Ready to start Next Sprint!**
