/**
 * Miyabi Agents - Programmatic API for Codex Agentic
 *
 * 識学理論5原則に基づくマルチエージェントシステムのTypeScript SDK
 */

import { Codex } from "../codex.js";
import type {
  IssueAnalysisResult,
  CodeGenerationResult,
  QualityReport,
  PullRequest,
  PRCreationOptions,
  TestResult,
  ParallelExecutionOptions,
  ParallelExecutionResult,
  BudgetStatus,
  MiyabiMCPConfig,
  DAG,
} from "./types.js";

// Phase 8: MCP Response Parsing
import { MCPParseError } from "./types.js";
import {
  isMCPToolResponse,
  isMCPErrorResponse,
  isAgentResponse,
  isIssueAnalysisResult,
  isCodeGenerationResult,
  isQualityReport,
  isPullRequest,
  isTestResult,
  isBudgetStatus,
  isDAG,
  isParallelExecutionResult,
} from "./type-guards.js";
import { withRetry, type RetryOptions } from "./retry.js";

/**
 * MiyabiAgents - Main class for interacting with Miyabi multi-agent system
 *
 * @example
 * ```typescript
 * import { MiyabiAgents } from "@openai/codex-sdk/miyabi";
 *
 * const miyabi = new MiyabiAgents({
 *   githubToken: process.env.GITHUB_TOKEN!,
 *   anthropicApiKey: process.env.ANTHROPIC_API_KEY
 * });
 *
 * // Analyze an issue
 * const analysis = await miyabi.analyzeIssue({
 *   issueNumber: 42,
 *   repository: "openai/codex"
 * });
 * ```
 */
export class MiyabiAgents {
  private codex: Codex;
  private config: MiyabiMCPConfig;
  private retryOptions: Partial<RetryOptions>;

  constructor(config: MiyabiMCPConfig = {}) {
    this.codex = new Codex();
    this.config = {
      serverName: "miyabi",
      ...config,
    };
    this.retryOptions = {
      maxRetries: config.retryOptions?.maxRetries ?? 3,
      baseDelay: config.retryOptions?.baseDelay ?? 1000,
      maxDelay: config.retryOptions?.maxDelay ?? 10000,
    };
  }

  // ============================================================================
  // IssueAgent - Issue分析とラベリング
  // ============================================================================

  /**
   * GitHubのIssueを分析し、適切なラベルと複雑度を判定
   *
   * @param options - Issue分析オプション
   * @returns Issue分析結果
   *
   * @example
   * ```typescript
   * const result = await miyabi.analyzeIssue({
   *   issueNumber: 42,
   *   repository: "openai/codex"
   * });
   *
   * console.log(`Priority: ${result.issue.priority}`);
   * console.log(`Labels: ${result.suggestedLabels.join(", ")}`);
   * ```
   */
  async analyzeIssue(options: {
    issueNumber: number;
    repository: string;
  }): Promise<IssueAnalysisResult> {
    return withRetry(
      async () => {
        try {
          const thread = this.codex.startThread();

          const prompt = `Using the Miyabi MCP server, analyze GitHub issue #${options.issueNumber} in repository ${options.repository}. Use the miyabi_analyze_issue tool.`;

          const result = await thread.run(prompt);

          return this.parseIssueAnalysisResponse(result);
        } catch (error) {
          if (error instanceof MCPParseError) {
            console.error("MCP Parse Error:", error.message);
            console.error("Raw response:", error.rawResponse);
          }
          throw error;
        }
      },
      this.retryOptions
    );
  }

  // ============================================================================
  // CoordinatorAgent - タスク分解とDAG生成
  // ============================================================================

  /**
   * 複雑なタスクをサブタスクに分解し、DAG構造を生成
   *
   * @param options - タスク分解オプション
   * @returns DAG構造
   *
   * @example
   * ```typescript
   * const dag = await miyabi.decomposeTask({
   *   issueNumber: 42,
   *   repository: "openai/codex"
   * });
   *
   * console.log(`Total tasks: ${dag.nodes.length}`);
   * ```
   */
  async decomposeTask(options: {
    issueNumber: number;
    repository: string;
  }): Promise<DAG> {
    return withRetry(
      async () => {
        try {
          const thread = this.codex.startThread();

          const prompt = `Using the Miyabi MCP server, decompose GitHub issue #${options.issueNumber} in repository ${options.repository} into subtasks. Use the miyabi_decompose_task tool.`;

          const result = await thread.run(prompt);

          return this.parseDAGResponse(result);
        } catch (error) {
          if (error instanceof MCPParseError) {
            console.error("MCP Parse Error:", error.message);
            console.error("Raw response:", error.rawResponse);
          }
          throw error;
        }
      },
      this.retryOptions
    );
  }

  // ============================================================================
  // CodeGenAgent - コード生成
  // ============================================================================

  /**
   * Issueに基づいてコードを生成
   *
   * @param options - コード生成オプション
   * @returns 生成されたコード
   *
   * @example
   * ```typescript
   * const code = await miyabi.generateCode({
   *   issueNumber: 42,
   *   repository: "openai/codex"
   * });
   *
   * console.log(`Generated ${code.files.length} files`);
   * ```
   */
  async generateCode(options: {
    issueNumber: number;
    repository: string;
    context?: string;
  }): Promise<CodeGenerationResult> {
    return withRetry(
      async () => {
        try {
          const thread = this.codex.startThread();

          const contextStr = options.context ? ` Context: ${options.context}` : "";
          const prompt = `Using the Miyabi MCP server, generate code for GitHub issue #${options.issueNumber} in repository ${options.repository}.${contextStr} Use the miyabi_generate_code tool.`;

          const result = await thread.run(prompt);

          return this.parseCodeGenerationResponse(result);
        } catch (error) {
          if (error instanceof MCPParseError) {
            console.error("MCP Parse Error:", error.message);
            console.error("Raw response:", error.rawResponse);
          }
          throw error;
        }
      },
      this.retryOptions
    );
  }

  // ============================================================================
  // ReviewAgent - コードレビュー
  // ============================================================================

  /**
   * コードの品質をレビュー
   *
   * @param options - レビューオプション
   * @returns レビュー結果
   *
   * @example
   * ```typescript
   * const review = await miyabi.reviewCode({
   *   prNumber: 123,
   *   repository: "openai/codex"
   * });
   *
   * console.log(`Quality Score: ${review.qualityScore}/100`);
   * console.log(`Passed: ${review.passed}`);
   * ```
   */
  async reviewCode(options: {
    prNumber: number;
    repository: string;
  }): Promise<QualityReport> {
    try {
      const thread = this.codex.startThread();

      const prompt = `Using the Miyabi MCP server, review code for PR #${options.prNumber} in repository ${options.repository}. Use the miyabi_review_code tool.`;

      const result = await thread.run(prompt);

      return this.parseQualityReportResponse(result);
    } catch (error) {
      if (error instanceof MCPParseError) {
        console.error("MCP Parse Error:", error.message);
        console.error("Raw response:", error.rawResponse);
      }
      throw error;
    }
  }

  // ============================================================================
  // PRAgent - Pull Request作成
  // ============================================================================

  /**
   * Pull Requestを作成
   *
   * @param options - PR作成オプション
   * @returns 作成されたPR
   *
   * @example
   * ```typescript
   * const pr = await miyabi.createPullRequest({
   *   repository: "openai/codex",
   *   title: "Fix: authentication bug",
   *   body: "This PR fixes the authentication bug reported in #42",
   *   draft: true
   * });
   *
   * console.log(`PR created: ${pr.url}`);
   * ```
   */
  async createPullRequest(
    options: PRCreationOptions & { repository: string }
  ): Promise<PullRequest> {
    try {
      const thread = this.codex.startThread();

      const prompt = `Using the Miyabi MCP server, create a pull request in repository ${options.repository} with title "${options.title}". ${options.issueNumber ? `Related to issue #${options.issueNumber}.` : ""} Use the miyabi_create_pr tool.`;

      const result = await thread.run(prompt);

      return this.parsePullRequestResponse(result);
    } catch (error) {
      if (error instanceof MCPParseError) {
        console.error("MCP Parse Error:", error.message);
        console.error("Raw response:", error.rawResponse);
      }
      throw error;
    }
  }

  // ============================================================================
  // TestAgent - テスト実行
  // ============================================================================

  /**
   * テストを実行
   *
   * @param options - テスト実行オプション
   * @returns テスト結果
   *
   * @example
   * ```typescript
   * const testResult = await miyabi.runTests({
   *   repository: "openai/codex",
   *   testPattern: "**\/*.test.ts"
   * });
   *
   * console.log(`Passed: ${testResult.passedTests}/${testResult.totalTests}`);
   * console.log(`Coverage: ${testResult.coverage}%`);
   * ```
   */
  async runTests(options: {
    repository: string;
    testPattern?: string;
  }): Promise<TestResult> {
    try {
      const thread = this.codex.startThread();

      const pattern = options.testPattern || "**/*.test.ts";
      const prompt = `Using the Miyabi MCP server, run tests in repository ${options.repository} with pattern "${pattern}". Use the miyabi_run_tests tool.`;

      const result = await thread.run(prompt);

      return this.parseTestResultResponse(result);
    } catch (error) {
      if (error instanceof MCPParseError) {
        console.error("MCP Parse Error:", error.message);
        console.error("Raw response:", error.rawResponse);
      }
      throw error;
    }
  }

  // ============================================================================
  // Parallel Execution - 並列エージェント実行
  // ============================================================================

  /**
   * 複数のエージェントを並列実行
   *
   * @param options - 並列実行オプション
   * @returns 並列実行結果
   *
   * @example
   * ```typescript
   * const result = await miyabi.runParallel({
   *   issueNumber: 42,
   *   repository: "openai/codex",
   *   agents: ["codegen", "review", "pr"],
   *   concurrency: 3
   * });
   *
   * console.log(`PR created: ${result.prUrl}`);
   * console.log(`Total time: ${result.totalExecutionTime}ms`);
   * ```
   */
  async runParallel(
    options: ParallelExecutionOptions & { repository: string }
  ): Promise<ParallelExecutionResult> {
    try {
      const thread = this.codex.startThread();

      const agentsStr = options.agents.join(", ");
      const concurrency = options.concurrency || 3;

      const prompt = `Using the Miyabi MCP server, run agents [${agentsStr}] in parallel for issue #${options.issueNumber} in repository ${options.repository} with concurrency ${concurrency}. Use the miyabi_run_parallel tool.`;

      const result = await thread.run(prompt);

      return this.parseParallelExecutionResponse(result);
    } catch (error) {
      if (error instanceof MCPParseError) {
        console.error("MCP Parse Error:", error.message);
        console.error("Raw response:", error.rawResponse);
      }
      throw error;
    }
  }

  // ============================================================================
  // Budget Management - 予算管理
  // ============================================================================

  /**
   * 現在の予算状況を取得
   *
   * @returns 予算状況
   *
   * @example
   * ```typescript
   * const budget = await miyabi.checkBudget();
   *
   * console.log(`Remaining: $${budget.remainingBudgetUsd}`);
   * console.log(`Usage: ${budget.usagePercentage}%`);
   *
   * if (budget.isWarning) {
   *   console.warn("Budget warning: 80% threshold exceeded");
   * }
   * ```
   */
  async checkBudget(): Promise<BudgetStatus> {
    return withRetry(
      async () => {
        try {
          const thread = this.codex.startThread();

          const prompt = `Using the Miyabi MCP server, check the current budget status. Use the miyabi_check_budget tool.`;

          const result = await thread.run(prompt);

          return this.parseBudgetStatusResponse(result);
        } catch (error) {
          if (error instanceof MCPParseError) {
            console.error("MCP Parse Error:", error.message);
            console.error("Raw response:", error.rawResponse);
          }
          throw error;
        }
      },
      this.retryOptions
    );
  }

  // ============================================================================
  // GitHub Projects V2 Integration
  // ============================================================================

  /**
   * GitHub Projects V2のステータスを取得
   *
   * @param options - プロジェクトステータスオプション
   * @returns プロジェクトステータス
   *
   * @example
   * ```typescript
   * const status = await miyabi.getProjectStatus({
   *   repository: "openai/codex",
   *   projectName: "Codex Development"
   * });
   * ```
   */
  async getProjectStatus(options: {
    repository: string;
    projectName: string;
  }): Promise<unknown> {
    const thread = this.codex.startThread();

    const prompt = `Using the Miyabi MCP server, get the status of GitHub project "${options.projectName}" in repository ${options.repository}. Use the miyabi_project_status tool.`;

    const result = await thread.run(prompt);

    return this.parseMCPResponse(result);
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * MCPレスポンスをパース (汎用版)
   * @private
   * @param result - MCPツールからの生のレスポンス
   * @returns パースされた結果
   * @throws {MCPParseError} パースに失敗した場合
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
      throw new MCPParseError("Invalid MCP response format", result);
    }

    // 3. contentからテキストを抽出
    const textContent = result.content.find((c) => c.type === "text");
    if (!textContent || !textContent.text) {
      throw new MCPParseError("No text content in MCP response", result);
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
      throw new MCPParseError("Invalid Agent response format", parsed);
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
   * Issue分析レスポンスのパース (型検証付き)
   * @private
   */
  private parseIssueAnalysisResponse(result: unknown): IssueAnalysisResult {
    const parsed = this.parseMCPResponse<IssueAnalysisResult>(result);

    // 追加の型検証
    if (!isIssueAnalysisResult(parsed)) {
      throw new MCPParseError(
        "Response does not match IssueAnalysisResult schema",
        parsed
      );
    }

    return parsed;
  }

  /**
   * コード生成レスポンスのパース (型検証付き)
   * @private
   */
  private parseCodeGenerationResponse(
    result: unknown
  ): CodeGenerationResult {
    const parsed = this.parseMCPResponse<CodeGenerationResult>(result);

    if (!isCodeGenerationResult(parsed)) {
      throw new MCPParseError(
        "Response does not match CodeGenerationResult schema",
        parsed
      );
    }

    return parsed;
  }

  /**
   * コードレビューレスポンスのパース (型検証付き)
   * @private
   */
  private parseQualityReportResponse(result: unknown): QualityReport {
    const parsed = this.parseMCPResponse<QualityReport>(result);

    if (!isQualityReport(parsed)) {
      throw new MCPParseError(
        "Response does not match QualityReport schema",
        parsed
      );
    }

    return parsed;
  }

  /**
   * PRレスポンスのパース (型検証付き)
   * @private
   */
  private parsePullRequestResponse(result: unknown): PullRequest {
    const parsed = this.parseMCPResponse<PullRequest>(result);

    if (!isPullRequest(parsed)) {
      throw new MCPParseError(
        "Response does not match PullRequest schema",
        parsed
      );
    }

    return parsed;
  }

  /**
   * テスト結果レスポンスのパース (型検証付き)
   * @private
   */
  private parseTestResultResponse(result: unknown): TestResult {
    const parsed = this.parseMCPResponse<TestResult>(result);

    if (!isTestResult(parsed)) {
      throw new MCPParseError(
        "Response does not match TestResult schema",
        parsed
      );
    }

    return parsed;
  }

  /**
   * DAGレスポンスのパース (型検証付き)
   * @private
   */
  private parseDAGResponse(result: unknown): DAG {
    const parsed = this.parseMCPResponse<DAG>(result);

    if (!isDAG(parsed)) {
      throw new MCPParseError("Response does not match DAG schema", parsed);
    }

    return parsed;
  }

  /**
   * 並列実行結果のパース (型検証付き)
   * @private
   */
  private parseParallelExecutionResponse(
    result: unknown
  ): ParallelExecutionResult {
    const parsed = this.parseMCPResponse<ParallelExecutionResult>(result);

    if (!isParallelExecutionResult(parsed)) {
      throw new MCPParseError(
        "Response does not match ParallelExecutionResult schema",
        parsed
      );
    }

    return parsed;
  }

  /**
   * 予算状況レスポンスのパース (型検証付き)
   * @private
   */
  private parseBudgetStatusResponse(result: unknown): BudgetStatus {
    const parsed = this.parseMCPResponse<BudgetStatus>(result);

    if (!isBudgetStatus(parsed)) {
      throw new MCPParseError(
        "Response does not match BudgetStatus schema",
        parsed
      );
    }

    return parsed;
  }
}
