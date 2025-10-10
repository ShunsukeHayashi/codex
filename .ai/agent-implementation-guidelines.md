# Agent実装ガイドライン

**作成日**: 2025-10-10
**対象**: 7つの自律Agent実装
**識学理論**: 5原則適用

---

## 🎯 概要

Miyabi自律型開発環境における7つのAgentの実装仕様。
識学理論5原則（責任・権限・階層・結果・曖昧性排除）に基づいた設計。

---

## 🏗️ Agent階層構造

```
🔴 Coordinator Layer (意思決定権限)
  └─ CoordinatorAgent
     ├─ タスク分解（DAG生成）
     ├─ Agent選択・割り当て
     └─ 実行監視・調整

🔵 Specialist Layer (実行権限)
  ├─ IssueAgent (Issue分析)
  ├─ CodeGenAgent (コード生成)
  ├─ ReviewAgent (コード品質判定)
  ├─ PRAgent (PR作成)
  ├─ DeploymentAgent (デプロイ管理)
  └─ TestAgent (テスト実行)

🟢 Support Layer (支援)
  └─ DocAgent (ドキュメント生成)
```

---

## 📋 各Agentの実装仕様

### 1. CoordinatorAgent（最上位意思決定）

**責任**: タスク全体の統括と並列実行制御

**権限**:
- 他のAgentへのタスク委譲
- 並列実行数の決定（デフォルト: 3）
- Critical Path判定

**Input**:
```typescript
{
  issueNumber: number;
  repository: string;
}
```

**Process**:
1. IssueAgentにIssue解析を委譲
2. DAG生成（依存関係グラフ）
3. Critical Path特定
4. 並列実行可能なタスクグループ化
5. 各Specialist Agentに委譲

**Output**:
```typescript
{
  taskGraph: DAG;
  criticalPath: string[];
  parallelGroups: string[][];
  estimatedDuration: number; // minutes
}
```

**品質基準**:
- DAGに循環依存がないこと
- Critical Pathが最短であること
- 並列実行数が3以下であること

**実装例**:
```typescript
// codex-miyabi/packages/miyabi-agent-sdk/src/agents/CoordinatorAgent.ts
export class CoordinatorAgent {
  async execute(input: CoordinatorInput): Promise<CoordinatorOutput> {
    // 1. Issue解析
    const issueData = await this.issueAgent.analyze(input);

    // 2. DAG生成
    const taskGraph = this.generateDAG(issueData);

    // 3. Critical Path特定
    const criticalPath = this.findCriticalPath(taskGraph);

    // 4. 並列実行グループ化
    const parallelGroups = this.groupParallelizable(taskGraph);

    // 5. 並列実行
    const results = await this.executeParallel(parallelGroups, {
      maxConcurrency: 3,
    });

    return {
      taskGraph,
      criticalPath,
      parallelGroups,
      estimatedDuration: this.calculateDuration(criticalPath),
    };
  }

  private generateDAG(issueData: IssueData): DAG {
    // タスク分解ロジック
    // 例: "バグ修正" → [調査, 修正, テスト, PR]
  }

  private findCriticalPath(graph: DAG): string[] {
    // 最長経路探索（トポロジカルソート + 動的計画法）
  }
}
```

---

### 2. IssueAgent（Issue分析）

**責任**: GitHubのIssueを解析し、適切なラベルと複雑度を判定

**権限**:
- ラベル自動付与
- 複雑度推定（small/medium/large/xlarge）
- 優先度判定（P0-P3）

**Input**:
```typescript
{
  issueNumber: number;
  repository: string;
}
```

**Process**:
1. Issue本文を取得（GitHub API）
2. 自然言語解析（Claude Sonnet 4）
3. キーワードマッチング
4. ラベル判定
5. 複雑度・工数推定

**Output**:
```typescript
{
  labels: string[];
  complexity: "small" | "medium" | "large" | "xlarge";
  estimatedEffort: "1h" | "4h" | "1d" | "3d" | "1w" | "2w";
  priority: "P0" | "P1" | "P2" | "P3";
  type: "bug" | "feature" | "refactor" | "docs" | "test" | "chore";
}
```

**品質基準**:
- ラベル精度 ≥ 90%（人間のレビューと比較）
- 複雑度推定誤差 ≤ 1段階

**実装例**:
```typescript
export class IssueAgent {
  async analyze(input: IssueInput): Promise<IssueOutput> {
    // 1. Issue取得
    const issue = await this.github.getIssue(input);

    // 2. Claude分析
    const analysis = await this.claude.analyze({
      prompt: `
        以下のGitHub Issueを解析して、適切なラベルと複雑度を判定してください。

        Title: ${issue.title}
        Body: ${issue.body}

        ラベル体系: ${this.labelSystem}
      `,
      outputSchema: IssueOutputSchema,
    });

    // 3. ラベル付与
    await this.github.addLabels(input.issueNumber, analysis.labels);

    return analysis;
  }
}
```

---

### 3. CodeGenAgent（コード生成）

**責任**: タスクに対してコードを生成

**権限**:
- ファイル作成・変更・削除
- テストコード生成
- 品質スコア自己評価

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

**Process**:
1. 既存コード読み込み（context）
2. Claude Sonnet 4でコード生成
3. テストコード生成
4. 品質スコア自己評価

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
  qualityScore: number; // 0-100（自己評価）
}
```

**品質基準**:
- TypeScript strict mode準拠
- ESLint警告0件
- 自己評価スコア ≥ 80

**実装例**:
```typescript
export class CodeGenAgent {
  async generate(input: CodeGenInput): Promise<CodeGenOutput> {
    // 1. 既存コード読み込み
    const context = await this.loadContext(input.context);

    // 2. コード生成
    const generatedCode = await this.claude.generateCode({
      requirements: input.requirements,
      context,
      language: "typescript",
      strictMode: true,
    });

    // 3. テスト生成
    const tests = await this.claude.generateTests({
      code: generatedCode,
      coverage: 80, // 80%以上
    });

    // 4. 品質スコア評価
    const qualityScore = await this.evaluateQuality(generatedCode);

    return {
      files: generatedCode,
      tests,
      qualityScore,
    };
  }

  private async evaluateQuality(code: File[]): Promise<number> {
    // ESLint実行
    const lintResults = await this.runESLint(code);

    // TypeScript型チェック
    const typeErrors = await this.runTSC(code);

    // スコアリング
    return this.calculateScore({
      lintWarnings: lintResults.warningCount,
      lintErrors: lintResults.errorCount,
      typeErrors: typeErrors.length,
    });
  }
}
```

---

### 4. ReviewAgent（コード品質判定）

**責任**: 生成されたコードを品質チェック

**権限**:
- 品質合否判定（80点以上で合格）
- 改善提案
- セキュリティスキャン

**Input**:
```typescript
{
  files: File[];
  standards: {
    minQualityScore: number; // default: 80
    requireTests: boolean;
    securityScan: boolean;
  };
}
```

**Process**:
1. 静的解析（ESLint/Clippy）
2. セキュリティスキャン（Gitleaks）
3. テストカバレッジ確認
4. 品質スコアリング
5. 改善提案生成

**Output**:
```typescript
{
  qualityScore: number; // 0-100
  passed: boolean;
  issues: Issue[];
  coverage: number;
  suggestions: string[];
}
```

**品質基準**:
- スコアリングの再現性（同じコードで同じスコア）
- False positive ≤ 5%

**実装例**:
```typescript
export class ReviewAgent {
  async review(input: ReviewInput): Promise<ReviewOutput> {
    const results = await Promise.all([
      this.runStaticAnalysis(input.files),
      this.runSecurityScan(input.files),
      this.checkCoverage(input.files),
    ]);

    const [staticAnalysis, securityScan, coverage] = results;

    const qualityScore = this.calculateQualityScore({
      staticAnalysis,
      securityScan,
      coverage,
    });

    const passed = qualityScore >= input.standards.minQualityScore;

    return {
      qualityScore,
      passed,
      issues: [...staticAnalysis.issues, ...securityScan.issues],
      coverage: coverage.percentage,
      suggestions: this.generateSuggestions(results),
    };
  }

  private calculateQualityScore(metrics: Metrics): number {
    // スコアリングロジック
    // 静的解析: 40点
    // セキュリティ: 30点
    // カバレッジ: 30点
    const staticScore = (1 - metrics.staticAnalysis.errorCount / 100) * 40;
    const securityScore = metrics.securityScan.passed ? 30 : 0;
    const coverageScore = (metrics.coverage.percentage / 100) * 30;

    return Math.round(staticScore + securityScore + coverageScore);
  }
}
```

---

### 5. PRAgent（PR作成）

**責任**: Draft Pull Requestを作成

**権限**:
- ブランチ作成
- PR作成（Draft）
- ラベル付与

**Input**:
```typescript
{
  issueNumber: number;
  repository: string;
  files: File[];
  qualityReport: ReviewOutput;
}
```

**Process**:
1. Feature branchを作成
2. ファイルcommit
3. Draft PR作成
4. PR本文生成（品質レポート含む）

**Output**:
```typescript
{
  prNumber: number;
  prUrl: string;
  branch: string;
  status: "draft";
}
```

**品質基準**:
- PR本文の情報完全性（Issue番号、品質スコア、チェックリスト）
- Conventional Commits準拠

**実装例**:
```typescript
export class PRAgent {
  async create(input: PRInput): Promise<PROutput> {
    // 1. Branch作成
    const branchName = `agent/issue-${input.issueNumber}-${Date.now()}`;
    await this.github.createBranch(branchName);

    // 2. Files commit
    await this.github.commitFiles({
      branch: branchName,
      files: input.files,
      message: this.generateCommitMessage(input),
    });

    // 3. PR作成
    const pr = await this.github.createPullRequest({
      base: "main",
      head: branchName,
      title: `feat: autonomous implementation for issue #${input.issueNumber}`,
      body: this.generatePRBody(input),
      draft: true,
    });

    return {
      prNumber: pr.number,
      prUrl: pr.html_url,
      branch: branchName,
      status: "draft",
    };
  }

  private generatePRBody(input: PRInput): string {
    return `
## 🤖 Autonomous Agent Implementation

**Issue**: #${input.issueNumber}
**Quality Score**: ${input.qualityReport.qualityScore}/100
**Coverage**: ${input.qualityReport.coverage}%

### Quality Report
${input.qualityReport.passed ? "✅" : "❌"} Quality check ${input.qualityReport.passed ? "passed" : "failed"}

### Checklist
- [x] Code generated
- [x] Tests generated
- [x] Quality check (≥80): ${input.qualityReport.qualityScore}/100
- [ ] Manual review required
- [ ] Ready to merge

Closes #${input.issueNumber}

---
🤖 Generated by Miyabi Autonomous Agent
    `.trim();
  }
}
```

---

### 6. TestAgent（テスト実行）

**責任**: テスト実行とカバレッジレポート

**権限**:
- テストコマンド実行
- カバレッジ計測
- 失敗時のエラーレポート

**Input**:
```typescript
{
  repository: string;
  branch: string;
  testCommand: string;
}
```

**Output**:
```typescript
{
  success: boolean;
  coverage: number;
  duration: number;
  failures: TestFailure[];
}
```

**品質基準**:
- カバレッジ ≥ 80%
- 実行時間 ≤ 5分

---

### 7. DeploymentAgent（デプロイ管理）

**責任**: CI/CDデプロイ自動化

**権限**:
- デプロイ実行
- ヘルスチェック
- 自動Rollback

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
}
```

---

## 🔗 Agent間通信

### 識学理論5原則の適用

#### 1. 責任の明確化
```typescript
// 各Agentは明確な責任範囲を持つ
interface AgentResponsibility {
  agent: string;
  responsibility: string;
  scope: string[];
}

const responsibilities: AgentResponsibility[] = [
  {
    agent: "IssueAgent",
    responsibility: "Issue分析とラベル付与",
    scope: ["issue:analyze", "label:assign"],
  },
  // ...
];
```

#### 2. 権限の委譲
```typescript
// CoordinatorAgentは他のAgentに権限を委譲
class CoordinatorAgent {
  async delegate(task: Task): Promise<void> {
    const agent = this.selectAgent(task.type);
    await agent.execute(task); // 権限委譲
  }
}
```

#### 3. 階層の設計
```typescript
// 3層階層: Coordinator → Specialist → Support
enum AgentLayer {
  COORDINATOR = 1,
  SPECIALIST = 2,
  SUPPORT = 3,
}
```

#### 4. 結果の評価
```typescript
// 品質スコア、カバレッジ、実行時間で評価
interface AgentEvaluation {
  qualityScore: number;
  coverage: number;
  duration: number;
  successRate: number;
}
```

#### 5. 曖昧性の排除
```typescript
// DAGで依存関係を明示
interface TaskGraph {
  nodes: TaskNode[];
  edges: TaskEdge[];
  // 曖昧性なし: 各タスクの依存関係が明確
}
```

---

## 📊 実装優先度

| Agent | 優先度 | 理由 |
|-------|--------|------|
| CoordinatorAgent | P0 | 全体統括、最優先 |
| IssueAgent | P0 | 最初の入り口 |
| CodeGenAgent | P1 | コア機能 |
| ReviewAgent | P1 | 品質保証 |
| PRAgent | P1 | 最終出力 |
| TestAgent | P2 | 品質向上 |
| DeploymentAgent | P3 | 将来拡張 |

---

## ✅ 実装チェックリスト

- [ ] CoordinatorAgent実装（DAG生成、並列実行）
- [ ] IssueAgent実装（Claude分析、ラベル付与）
- [ ] CodeGenAgent実装（コード生成、テスト生成）
- [ ] ReviewAgent実装（品質スコアリング、80点基準）
- [ ] PRAgent実装（Draft PR作成）
- [ ] TestAgent実装（カバレッジ80%確認）
- [ ] DeploymentAgent実装（自動デプロイ）

---

**作成**: 2025-10-10
**次のアクション**: E2Eテストシナリオ設計（並行タスク3）
