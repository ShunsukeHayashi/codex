/**
 * E2E Test Harness
 *
 * Miyabi自律型開発環境のエンドツーエンドテストフレームワーク
 */

import type { IssueData } from "../types.js";
import { CoordinatorAgent } from "../agents/CoordinatorAgent.js";
import { IssueAgent } from "../agents/IssueAgent.js";
import { CodeGenAgent } from "../agents/CodeGenAgent.js";
import { ReviewAgent } from "../agents/ReviewAgent.js";
import { PRAgent } from "../agents/PRAgent.js";
import { TestAgent } from "../agents/TestAgent.js";

export interface E2EScenario {
  id: number;
  name: string;
  description: string;
  issueTitle: string;
  issueBody: string;
  expectedComplexity: "small" | "medium" | "large" | "xlarge";
  expectedPriority: "P0" | "P1" | "P2" | "P3";
  expectedType: "bug" | "feature" | "refactor" | "docs" | "test" | "chore";
  successCriteria: {
    minQualityScore?: number;
    minCoverage?: number;
    maxDurationMs?: number;
    requiresSecurityScan?: boolean;
    budgetThresholds?: {
      warning: number;
      reject: number;
      emergency: number;
    };
  };
}

export interface E2ETestResult {
  scenarioId: number;
  scenarioName: string;
  success: boolean;
  duration: number; // milliseconds
  qualityScore?: number;
  coverage?: number;
  prNumber?: number;
  prUrl?: string;
  errors: string[];
  warnings: string[];
  metrics: {
    tasksCreated: number;
    parallelExecutions: number;
    budgetUsed: number;
  };
}

/**
 * E2E Test Harness
 *
 * Agent間の統合フローをテストする
 */
export class E2ETestHarness {
  private coordinatorAgent: CoordinatorAgent;
  private issueAgent: IssueAgent;
  private codeGenAgent: CodeGenAgent;
  private reviewAgent: ReviewAgent;
  private prAgent: PRAgent;
  private testAgent: TestAgent;

  constructor() {
    this.coordinatorAgent = new CoordinatorAgent();
    this.issueAgent = new IssueAgent();
    this.codeGenAgent = new CodeGenAgent();
    this.reviewAgent = new ReviewAgent();
    this.prAgent = new PRAgent();
    this.testAgent = new TestAgent();
  }

  /**
   * シナリオ実行
   */
  async runScenario(scenario: E2EScenario): Promise<E2ETestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    let qualityScore: number | undefined;
    let coverage: number | undefined;
    let prNumber: number | undefined;
    let prUrl: string | undefined;
    let tasksCreated = 0;
    let parallelExecutions = 0;
    let budgetUsed = 0;

    try {
      console.log(`\n[E2E] Starting Scenario ${scenario.id}: ${scenario.name}`);

      // 1. IssueAgent: Issue分析
      console.log("[E2E] Step 1: IssueAgent analyzing issue...");
      const issueResult = await this.issueAgent.analyze({
        issueNumber: scenario.id,
        repository: "miyabi-test",
        owner: "test-user",
      });

      if (!issueResult.success || !issueResult.data) {
        errors.push("IssueAgent failed to analyze issue");
        return this.createFailedResult(scenario, startTime, errors, warnings);
      }

      // 検証: 複雑度、優先度、タイプ
      if (issueResult.data.complexity !== scenario.expectedComplexity) {
        warnings.push(
          `Complexity mismatch: expected ${scenario.expectedComplexity}, got ${issueResult.data.complexity}`
        );
      }

      // 2. CoordinatorAgent: タスク分解とDAG生成
      console.log("[E2E] Step 2: CoordinatorAgent creating DAG...");
      const coordResult = await this.coordinatorAgent.execute({
        issueNumber: scenario.id,
        repository: "miyabi-test",
        owner: "test-user",
      });

      if (!coordResult.success || !coordResult.data) {
        errors.push("CoordinatorAgent failed to create DAG");
        return this.createFailedResult(scenario, startTime, errors, warnings);
      }

      tasksCreated = coordResult.data.taskGraph.nodes.length;
      parallelExecutions = coordResult.data.parallelGroups.length;

      console.log(
        `[E2E] DAG created: ${tasksCreated} tasks, ${parallelExecutions} parallel groups`
      );

      // 3. CodeGenAgent: コード生成（シミュレーション）
      console.log("[E2E] Step 3: CodeGenAgent generating code...");
      const codeGenResult = await this.codeGenAgent.generate({
        taskId: "e2e-test",
        requirements: scenario.issueBody,
        context: {
          repository: "miyabi-test",
          owner: "test-user",
          baseBranch: "main",
          relatedFiles: [],
        },
      });

      if (!codeGenResult.success || !codeGenResult.data) {
        errors.push("CodeGenAgent failed to generate code");
        return this.createFailedResult(scenario, startTime, errors, warnings);
      }

      console.log(
        `[E2E] Code generated: ${codeGenResult.data.files.length} files`
      );

      // 4. ReviewAgent: 品質チェック
      console.log("[E2E] Step 4: ReviewAgent reviewing code...");
      const reviewResult = await this.reviewAgent.review({
        files: codeGenResult.data.files,
        standards: {
          minQualityScore: scenario.successCriteria.minQualityScore || 80,
          requireTests: true,
          securityScan: scenario.successCriteria.requiresSecurityScan || false,
        },
      });

      if (!reviewResult.success || !reviewResult.data) {
        errors.push("ReviewAgent failed to review code");
        return this.createFailedResult(scenario, startTime, errors, warnings);
      }

      qualityScore = reviewResult.data.qualityScore;
      coverage = reviewResult.data.coverage;

      console.log(
        `[E2E] Review complete: Quality ${qualityScore}/100, Coverage ${coverage}%`
      );

      // 品質基準チェック
      if (!reviewResult.data.passed) {
        errors.push(
          `Quality score ${qualityScore} below threshold ${scenario.successCriteria.minQualityScore || 80}`
        );
      }

      if (
        scenario.successCriteria.minCoverage &&
        coverage < scenario.successCriteria.minCoverage
      ) {
        errors.push(
          `Coverage ${coverage}% below threshold ${scenario.successCriteria.minCoverage}%`
        );
      }

      // 5. TestAgent: テスト実行（該当する場合）
      if (codeGenResult.data.tests.length > 0) {
        console.log("[E2E] Step 5: TestAgent running tests...");
        const testResult = await this.testAgent.run({
          repository: "miyabi-test",
          owner: "test-user",
          branch: "e2e-test",
        });

        if (!testResult.success || !testResult.data) {
          warnings.push("TestAgent failed to run tests");
        } else {
          console.log(
            `[E2E] Tests complete: ${testResult.data.passedTests}/${testResult.data.totalTests} passed`
          );
        }
      }

      // 6. PRAgent: PR作成
      console.log("[E2E] Step 6: PRAgent creating PR...");
      const prResult = await this.prAgent.create({
        issueNumber: scenario.id,
        repository: "miyabi-test",
        owner: "test-user",
        files: codeGenResult.data.files,
        qualityReport: reviewResult.data,
      });

      if (!prResult.success || !prResult.data) {
        errors.push("PRAgent failed to create PR");
        return this.createFailedResult(scenario, startTime, errors, warnings);
      }

      prNumber = prResult.data.number;
      prUrl = prResult.data.url;

      console.log(`[E2E] PR created: ${prUrl}`);

      // 成功判定
      const duration = Date.now() - startTime;
      const success = errors.length === 0;

      // 実行時間チェック
      if (
        scenario.successCriteria.maxDurationMs &&
        duration > scenario.successCriteria.maxDurationMs
      ) {
        warnings.push(
          `Duration ${duration}ms exceeds threshold ${scenario.successCriteria.maxDurationMs}ms`
        );
      }

      return {
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        success,
        duration,
        qualityScore,
        coverage,
        prNumber,
        prUrl,
        errors,
        warnings,
        metrics: {
          tasksCreated,
          parallelExecutions,
          budgetUsed,
        },
      };
    } catch (error) {
      errors.push(
        `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
      );
      return this.createFailedResult(scenario, startTime, errors, warnings);
    }
  }

  /**
   * 失敗結果を作成
   */
  private createFailedResult(
    scenario: E2EScenario,
    startTime: number,
    errors: string[],
    warnings: string[]
  ): E2ETestResult {
    return {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      success: false,
      duration: Date.now() - startTime,
      errors,
      warnings,
      metrics: {
        tasksCreated: 0,
        parallelExecutions: 0,
        budgetUsed: 0,
      },
    };
  }

  /**
   * 全シナリオ実行
   */
  async runAllScenarios(scenarios: E2EScenario[]): Promise<E2ETestResult[]> {
    const results: E2ETestResult[] = [];

    for (const scenario of scenarios) {
      const result = await this.runScenario(scenario);
      results.push(result);

      // 結果表示
      this.printResult(result);
    }

    // 総合レポート
    this.printSummary(results);

    return results;
  }

  /**
   * 結果表示
   */
  private printResult(result: E2ETestResult): void {
    const status = result.success ? "✅ PASSED" : "❌ FAILED";
    console.log(`\n[E2E] Scenario ${result.scenarioId}: ${status}`);
    console.log(`  Duration: ${(result.duration / 1000).toFixed(2)}s`);

    if (result.qualityScore !== undefined) {
      console.log(`  Quality Score: ${result.qualityScore}/100`);
    }

    if (result.coverage !== undefined) {
      console.log(`  Coverage: ${result.coverage}%`);
    }

    if (result.prUrl) {
      console.log(`  PR: ${result.prUrl}`);
    }

    if (result.errors.length > 0) {
      console.log(`  Errors:`);
      result.errors.forEach((err) => console.log(`    - ${err}`));
    }

    if (result.warnings.length > 0) {
      console.log(`  Warnings:`);
      result.warnings.forEach((warn) => console.log(`    - ${warn}`));
    }
  }

  /**
   * 総合レポート表示
   */
  private printSummary(results: E2ETestResult[]): void {
    const passedCount = results.filter((r) => r.success).length;
    const totalCount = results.length;
    const passRate = (passedCount / totalCount) * 100;

    const separator = "=".repeat(60);
    console.log(`\n${separator}`);
    console.log(`E2E Test Summary`);
    console.log(`${separator}`);
    console.log(`Total Scenarios: ${totalCount}`);
    console.log(`Passed: ${passedCount}`);
    console.log(`Failed: ${totalCount - passedCount}`);
    console.log(`Pass Rate: ${passRate.toFixed(1)}%`);
    console.log(`\nSuccess Criteria: ${passedCount}/${totalCount} ≥ 5/6`);
    console.log(
      passedCount >= 5 ? "✅ OVERALL: PASSED" : "❌ OVERALL: FAILED"
    );
    console.log(`${separator}\n`);
  }
}
