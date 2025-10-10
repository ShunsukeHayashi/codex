/**
 * IssueAgent - Issue分析Agent
 *
 * 識学理論適用:
 * - 責任: GitHubのIssueを解析し、適切なラベルと複雑度を判定
 * - 権限: ラベル自動付与、複雑度推定、優先度判定
 * - 階層: Specialist Layer
 */

import type { IssueData, AgentInput, AgentOutput } from "../types.js";

export interface IssueInput extends AgentInput {
  issueNumber: number;
  repository: string;
  owner: string;
}

export interface IssueOutput extends AgentOutput {
  data?: IssueData;
}

/**
 * IssueAgent実装
 *
 * GitHub Issue取得 → Claude分析 → ラベル付与 → 複雑度判定
 */
export class IssueAgent {
  /**
   * メイン実行ロジック
   */
  async analyze(input: IssueInput): Promise<IssueOutput> {
    try {
      // 1. Issue取得（GitHub API - Phase 6で統合予定）
      const issue = await this.fetchIssue(input);

      // 2. Claude分析（Anthropic API - Phase 6で統合予定）
      const analysis = await this.analyzeWithClaude(issue);

      // 3. ラベル付与（GitHub API - Phase 6で統合予定）
      await this.applyLabels(input, analysis.labels);

      return {
        success: true,
        data: {
          number: issue.number,
          title: issue.title,
          body: issue.body,
          labels: analysis.labels,
          complexity: analysis.complexity,
          priority: analysis.priority,
          type: analysis.type,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * GitHub IssueをAPI経由で取得
   *
   * TODO: GitHubClient統合（MCP Server実装後）
   */
  private async fetchIssue(input: IssueInput): Promise<{
    number: number;
    title: string;
    body: string | null;
  }> {
    // Mock implementation
    // 実装時には: @octokit/rest を使用
    return {
      number: input.issueNumber,
      title: `Mock Issue #${input.issueNumber}`,
      body: "Mock issue body for testing",
    };
  }

  /**
   * Claude Sonnet 4で自然言語解析
   *
   * TODO: AnthropicClient統合（MCP Server実装後）
   */
  private async analyzeWithClaude(issue: {
    title: string;
    body: string | null;
  }): Promise<{
    labels: string[];
    complexity: "small" | "medium" | "large" | "xlarge";
    priority: "P0" | "P1" | "P2" | "P3";
    type: "bug" | "feature" | "refactor" | "docs" | "test" | "chore";
  }> {
    // Mock implementation
    // 実装時には: @anthropic-ai/sdk を使用
    const prompt = this.buildAnalysisPrompt(issue);

    // キーワードベースの簡易分析（Claude統合前のフォールバック）
    const analysis = this.keywordBasedAnalysis(issue);

    return analysis;
  }

  /**
   * Claude分析用プロンプト生成
   */
  private buildAnalysisPrompt(issue: {
    title: string;
    body: string | null;
  }): string {
    return `
以下のGitHub Issueを解析し、適切なラベル、複雑度、優先度、種類を判定してください。

## Issue情報
**Title**: ${issue.title}
**Body**: ${issue.body || "(空白)"}

## ラベル体系（116ラベル、15カテゴリ）
- 🏷️ type: bug, feature, refactor, docs, test, chore
- 🎯 priority: P0-Critical, P1-High, P2-Medium, P3-Low
- 📊 complexity: small (<4h), medium (4-8h), large (1-3d), xlarge (>3d)
- 🏗️ state: backlog, implementing, review, done
- 🤖 agent: coordinator, issue, codegen, review, pr, test, deploy
- 🔧 tech: rust, typescript, python, go
- 🌐 area: cli, tui, mcp, sdk, core
- 📦 scope: api, ui, db, infra, security
- 🎨 ux: a11y, i18n, perf, responsive
- 🔬 testing: unit, integration, e2e
- 📚 docs: readme, guide, api-docs
- 🚀 release: major, minor, patch, alpha, beta
- 🔒 security: vuln, cve, audit
- 💰 cost: low, medium, high
- 📈 impact: breaking, enhancement, fix

## 出力形式（JSON）
{
  "labels": ["🏷️ type:bug", "🎯 priority:P1-High", ...],
  "complexity": "medium",
  "priority": "P1",
  "type": "bug"
}

**重要**: 116ラベルシステムに厳密に従ってください。
    `.trim();
  }

  /**
   * キーワードベースの簡易分析
   *
   * Claude統合前のフォールバック実装
   */
  private keywordBasedAnalysis(issue: {
    title: string;
    body: string | null;
  }): {
    labels: string[];
    complexity: "small" | "medium" | "large" | "xlarge";
    priority: "P0" | "P1" | "P2" | "P3";
    type: "bug" | "feature" | "refactor" | "docs" | "test" | "chore";
  } {
    const text = `${issue.title} ${issue.body || ""}`.toLowerCase();

    // Type判定
    let type: "bug" | "feature" | "refactor" | "docs" | "test" | "chore" =
      "feature";
    if (text.includes("bug") || text.includes("error") || text.includes("fix"))
      type = "bug";
    else if (text.includes("refactor") || text.includes("cleanup"))
      type = "refactor";
    else if (text.includes("docs") || text.includes("documentation"))
      type = "docs";
    else if (text.includes("test")) type = "test";
    else if (
      text.includes("chore") ||
      text.includes("deps") ||
      text.includes("dependency")
    )
      type = "chore";

    // Priority判定
    let priority: "P0" | "P1" | "P2" | "P3" = "P2";
    if (
      text.includes("critical") ||
      text.includes("urgent") ||
      text.includes("security")
    )
      priority = "P0";
    else if (text.includes("high") || text.includes("important"))
      priority = "P1";
    else if (text.includes("low") || text.includes("nice-to-have"))
      priority = "P3";

    // Complexity判定
    let complexity: "small" | "medium" | "large" | "xlarge" = "medium";
    if (
      text.includes("simple") ||
      text.includes("quick") ||
      text.includes("typo")
    )
      complexity = "small";
    else if (
      text.includes("large") ||
      text.includes("major") ||
      text.includes("refactor")
    )
      complexity = "large";
    else if (
      text.includes("rewrite") ||
      text.includes("migration") ||
      text.includes("breaking")
    )
      complexity = "xlarge";

    // ラベル生成
    const labels = [
      `🏷️ type:${type}`,
      `🎯 priority:${priority}-${this.getPriorityLabel(priority)}`,
      `📊 complexity:${complexity}`,
    ];

    // 技術スタック推定
    if (text.includes("rust")) labels.push("🔧 tech:rust");
    if (text.includes("typescript") || text.includes("ts"))
      labels.push("🔧 tech:typescript");
    if (text.includes("python") || text.includes("py"))
      labels.push("🔧 tech:python");

    // エリア推定
    if (text.includes("cli")) labels.push("🌐 area:cli");
    if (text.includes("tui")) labels.push("🌐 area:tui");
    if (text.includes("mcp")) labels.push("🌐 area:mcp");
    if (text.includes("sdk")) labels.push("🌐 area:sdk");

    return { labels, complexity, priority, type };
  }

  /**
   * Priority label取得
   */
  private getPriorityLabel(
    priority: "P0" | "P1" | "P2" | "P3"
  ): string {
    switch (priority) {
      case "P0":
        return "Critical";
      case "P1":
        return "High";
      case "P2":
        return "Medium";
      case "P3":
        return "Low";
    }
  }

  /**
   * ラベル付与（GitHub API）
   *
   * TODO: GitHubClient統合（MCP Server実装後）
   */
  private async applyLabels(
    input: IssueInput,
    labels: string[]
  ): Promise<void> {
    // Mock implementation
    // 実装時には: octokit.issues.addLabels() を使用
    console.log(
      `[IssueAgent] Would apply labels to #${input.issueNumber}:`,
      labels
    );
  }

  /**
   * 工数推定（complexityから推定時間に変換）
   */
  estimateEffort(
    complexity: "small" | "medium" | "large" | "xlarge"
  ): string {
    switch (complexity) {
      case "small":
        return "1h";
      case "medium":
        return "4h";
      case "large":
        return "1d";
      case "xlarge":
        return "1w";
    }
  }
}
