/**
 * AnthropicClient - Claude API wrapper
 *
 * Claude Sonnet 4を使用したIssue分析、コード生成を提供
 *
 * @module AnthropicClient
 */

import Anthropic from "@anthropic-ai/sdk";

export interface AnalysisResult {
  labels: string[];
  complexity: "small" | "medium" | "large" | "xlarge";
  estimatedEffort: "1h" | "4h" | "1d" | "3d" | "1w" | "2w";
  priority: "P0" | "P1" | "P2" | "P3";
  type: "bug" | "feature" | "refactor" | "docs" | "test" | "chore";
  reasoning: string;
}

export interface CodeGenerationResult {
  files: Array<{
    path: string;
    content: string;
    action: "create" | "modify" | "delete";
  }>;
  tests: Array<{
    path: string;
    content: string;
  }>;
  qualityScore: number; // 0-100
  tokensUsed: {
    input: number;
    output: number;
  };
}

export class AnthropicClient {
  private client: Anthropic;
  private model: string = "claude-sonnet-4-20250514";

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Issueを分析
   */
  async analyzeIssue(
    title: string,
    body: string | null,
    labelSystem: string
  ): Promise<AnalysisResult & { tokensUsed: { input: number; output: number } }> {
    const prompt = `以下のGitHub Issueを解析し、適切なラベル、複雑度、優先度、種類を判定してください。

# Issue情報
Title: ${title}
Body: ${body || "(本文なし)"}

# ラベル体系
${labelSystem}

# 出力形式（JSON）
{
  "labels": ["type:xxx", "priority:xxx", "complexity:xxx", "effort:xxx"],
  "complexity": "small|medium|large|xlarge",
  "estimatedEffort": "1h|4h|1d|3d|1w|2w",
  "priority": "P0|P1|P2|P3",
  "type": "bug|feature|refactor|docs|test|chore",
  "reasoning": "判定理由を簡潔に説明"
}

判定してください。`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    // JSONを抽出（```json ... ```の中から）
    const jsonMatch = content.text.match(/```json\n([\s\S]*?)\n```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content.text;
    const result = JSON.parse(jsonStr.trim()) as AnalysisResult;

    console.log(
      `[AnthropicClient] Issue analyzed: ${result.type}, ${result.complexity}, ${result.priority}`
    );

    return {
      ...result,
      tokensUsed: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      },
    };
  }

  /**
   * コードを生成
   */
  async generateCode(
    requirements: string,
    context: string,
    language: string = "typescript"
  ): Promise<CodeGenerationResult> {
    const prompt = `以下の要件に基づいて、${language}のコードを生成してください。

# 要件
${requirements}

# コンテキスト（既存コード）
${context}

# 出力形式（JSON）
{
  "files": [
    {
      "path": "src/example.ts",
      "content": "// コード内容",
      "action": "create|modify|delete"
    }
  ],
  "tests": [
    {
      "path": "src/example.test.ts",
      "content": "// テストコード"
    }
  ],
  "qualityScore": 85
}

品質スコア基準:
- 90-100: 優秀（型安全、テストカバレッジ90%以上、ドキュメント完備）
- 80-89: 良好（型安全、テストカバレッジ80%以上）
- 70-79: 可（一部型エラー、テストカバレッジ70%以上）
- 70未満: 不可

コードを生成してください。`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const jsonMatch = content.text.match(/```json\n([\s\S]*?)\n```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content.text;
    const result = JSON.parse(jsonStr.trim());

    console.log(
      `[AnthropicClient] Code generated: ${result.files.length} files, quality: ${result.qualityScore}`
    );

    return {
      ...result,
      tokensUsed: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      },
    };
  }

  /**
   * コードレビュー
   */
  async reviewCode(
    files: Array<{ path: string; content: string }>,
    standards: {
      minQualityScore: number;
      requireTests: boolean;
      securityScan: boolean;
    }
  ): Promise<{
    qualityScore: number;
    passed: boolean;
    issues: Array<{
      severity: "error" | "warning" | "info";
      file: string;
      line?: number;
      message: string;
    }>;
    suggestions: string[];
    tokensUsed: { input: number; output: number };
  }> {
    const filesContent = files
      .map((f) => `## ${f.path}\n\`\`\`\n${f.content}\n\`\`\``)
      .join("\n\n");

    const prompt = `以下のコードをレビューしてください。

# コード
${filesContent}

# 品質基準
- 最低品質スコア: ${standards.minQualityScore}
- テスト必須: ${standards.requireTests ? "はい" : "いいえ"}
- セキュリティスキャン: ${standards.securityScan ? "はい" : "いいえ"}

# 出力形式（JSON）
{
  "qualityScore": 85,
  "passed": true,
  "issues": [
    {
      "severity": "warning",
      "file": "src/example.ts",
      "line": 42,
      "message": "型アノテーションが不足しています"
    }
  ],
  "suggestions": [
    "エラーハンドリングを追加することを推奨します"
  ]
}

レビュー結果を出力してください。`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const jsonMatch = content.text.match(/```json\n([\s\S]*?)\n```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content.text;
    const result = JSON.parse(jsonStr.trim());

    console.log(
      `[AnthropicClient] Code reviewed: quality ${result.qualityScore}, ${
        result.passed ? "PASSED" : "FAILED"
      }`
    );

    return {
      ...result,
      tokensUsed: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      },
    };
  }
}
