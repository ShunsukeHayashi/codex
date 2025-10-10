/**
 * Type Guards for Miyabi Agent SDK
 *
 * TypeScript type predicatesによる型安全なレスポンス検証
 * Phase 8: Real API Integration
 */

import type {
  MCPToolResponse,
  MCPErrorResponse,
  AgentResponse,
  IssueAnalysisResult,
  CodeGenerationResult,
  QualityReport,
  PullRequest,
  TestResult,
  BudgetStatus,
  DAG,
  ParallelExecutionResult,
} from "./types.js";

// ============================================================================
// MCP Protocol Type Guards
// ============================================================================

/**
 * MCPToolResponseの型ガード
 */
export function isMCPToolResponse(value: unknown): value is MCPToolResponse {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;

  if (!Array.isArray(obj.content)) return false;

  // contentの各要素が正しい形式か確認
  return obj.content.every((item: unknown) => {
    if (typeof item !== "object" || item === null) return false;
    const content = item as Record<string, unknown>;
    return (
      typeof content.type === "string" &&
      ["text", "image", "resource"].includes(content.type)
    );
  });
}

/**
 * MCPErrorResponseの型ガード
 */
export function isMCPErrorResponse(
  value: unknown
): value is MCPErrorResponse {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;

  return (
    typeof obj.error === "object" &&
    obj.error !== null &&
    typeof (obj.error as Record<string, unknown>).code === "number" &&
    typeof (obj.error as Record<string, unknown>).message === "string"
  );
}

// ============================================================================
// Agent Response Type Guards
// ============================================================================

/**
 * AgentResponseの型ガード
 */
export function isAgentResponse<T>(value: unknown): value is AgentResponse<T> {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;

  return (
    typeof obj.success === "boolean" && typeof obj.agent === "string"
  );
}

/**
 * IssueAnalysisResultの型ガード
 */
export function isIssueAnalysisResult(
  value: unknown
): value is IssueAnalysisResult {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;

  return (
    typeof obj.issue === "object" &&
    obj.issue !== null &&
    Array.isArray(obj.suggestedLabels) &&
    typeof obj.estimatedTime === "number" &&
    Array.isArray(obj.agentRecommendations)
  );
}

/**
 * CodeGenerationResultの型ガード
 */
export function isCodeGenerationResult(
  value: unknown
): value is CodeGenerationResult {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;

  return (
    Array.isArray(obj.files) &&
    typeof obj.summary === "string" &&
    Array.isArray(obj.warnings)
  );
}

/**
 * QualityReportの型ガード
 */
export function isQualityReport(value: unknown): value is QualityReport {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;

  return (
    typeof obj.qualityScore === "number" &&
    typeof obj.passed === "boolean" &&
    Array.isArray(obj.issues) &&
    typeof obj.coverage === "number" &&
    Array.isArray(obj.suggestions)
  );
}

/**
 * PullRequestの型ガード
 */
export function isPullRequest(value: unknown): value is PullRequest {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;

  return (
    typeof obj.number === "number" &&
    typeof obj.url === "string" &&
    typeof obj.branch === "string" &&
    typeof obj.status === "string" &&
    typeof obj.title === "string" &&
    typeof obj.body === "string"
  );
}

/**
 * TestResultの型ガード
 */
export function isTestResult(value: unknown): value is TestResult {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;

  return (
    typeof obj.passed === "boolean" &&
    typeof obj.totalTests === "number" &&
    typeof obj.passedTests === "number" &&
    typeof obj.failedTests === "number" &&
    Array.isArray(obj.failures) &&
    typeof obj.coverage === "number"
  );
}

/**
 * BudgetStatusの型ガード
 */
export function isBudgetStatus(value: unknown): value is BudgetStatus {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;

  return (
    typeof obj.monthlyBudgetUsd === "number" &&
    typeof obj.remainingBudgetUsd === "number" &&
    typeof obj.usagePercentage === "number" &&
    typeof obj.isWarning === "boolean" &&
    typeof obj.isEmergency === "boolean"
  );
}

/**
 * DAGの型ガード
 */
export function isDAG(value: unknown): value is DAG {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;

  return Array.isArray(obj.nodes) && Array.isArray(obj.edges);
}

/**
 * ParallelExecutionResultの型ガード
 */
export function isParallelExecutionResult(
  value: unknown
): value is ParallelExecutionResult {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;

  return (
    typeof obj.success === "boolean" &&
    typeof obj.results === "object" &&
    typeof obj.totalExecutionTime === "number"
  );
}

// ============================================================================
// Utility Type Guards
// ============================================================================

/**
 * 文字列配列の型ガード
 */
export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

/**
 * オブジェクトの型ガード
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
