/**
 * Miyabi Agent SDK - Type Definitions for Codex TypeScript SDK
 *
 * 識学理論5原則に基づく型定義
 * Based on @codex-miyabi/agent-sdk
 */

// ============================================================================
// DAG (Directed Acyclic Graph) Structure
// ============================================================================

export interface TaskNode {
  id: string;
  description: string;
  agent: string;
  estimatedTime: number; // minutes
  dependencies: string[]; // 依存タスクID
}

export interface TaskEdge {
  from: string;
  to: string;
}

export interface DAG {
  nodes: TaskNode[];
  edges: TaskEdge[];
}

// ============================================================================
// Agent Common Interfaces
// ============================================================================

export interface AgentInput {
  [key: string]: unknown;
}

export interface AgentOutput {
  success: boolean;
  data?: unknown;
  error?: string;
}

// ============================================================================
// Issue Related
// ============================================================================

export interface IssueData {
  number: number;
  title: string;
  body: string | null;
  labels: string[];
  complexity: "small" | "medium" | "large" | "xlarge";
  priority: "P0" | "P1" | "P2" | "P3";
  type: "bug" | "feature" | "refactor" | "docs" | "test" | "chore";
}

export interface IssueAnalysisResult {
  issue: IssueData;
  suggestedLabels: string[];
  estimatedComplexity: IssueData["complexity"];
  estimatedTime: number; // minutes
  agentRecommendations: string[];
}

// ============================================================================
// Code Generation Related
// ============================================================================

export interface GeneratedFile {
  path: string;
  content: string;
  action: "create" | "modify" | "delete";
}

export interface CodeGenerationResult {
  files: GeneratedFile[];
  summary: string;
  warnings: string[];
}

// ============================================================================
// Code Review Related
// ============================================================================

export interface QualityIssue {
  severity: "error" | "warning" | "info";
  file: string;
  line?: number;
  message: string;
}

export interface QualityReport {
  qualityScore: number; // 0-100
  passed: boolean;
  issues: QualityIssue[];
  coverage: number;
  suggestions: string[];
}

// ============================================================================
// Pull Request Related
// ============================================================================

export interface PullRequest {
  number: number;
  url: string;
  branch: string;
  status: "draft" | "open" | "merged";
  title: string;
  body: string;
}

export interface PRCreationOptions {
  issueNumber?: number;
  title: string;
  body: string;
  draft?: boolean;
  baseBranch?: string;
}

// ============================================================================
// Test Related
// ============================================================================

export interface TestFailure {
  testName: string;
  file: string;
  errorMessage: string;
}

export interface TestResult {
  passed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  failures: TestFailure[];
  coverage: number;
}

// ============================================================================
// Agent Metrics (識学理論: 結果の評価)
// ============================================================================

export interface AgentMetrics {
  executionTime: number; // milliseconds
  qualityScore: number; // 0-100
  successRate: number; // percentage
  costUsd: number;
}

// ============================================================================
// Parallel Execution Options
// ============================================================================

export interface ParallelExecutionOptions {
  issueNumber: number;
  agents: Array<"issue" | "codegen" | "review" | "pr" | "test">;
  concurrency?: number; // default: 3
  repositoryOwner?: string;
  repositoryName?: string;
}

export interface ParallelExecutionResult {
  success: boolean;
  results: {
    [agentName: string]: AgentOutput;
  };
  totalExecutionTime: number; // milliseconds
  prUrl?: string;
}

// ============================================================================
// MCP Configuration
// ============================================================================

export interface MiyabiMCPConfig {
  serverName?: string; // default: "miyabi"
  githubToken?: string;
  anthropicApiKey?: string;
  retryOptions?: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
  };
}

// ============================================================================
// Budget & Cost Management
// ============================================================================

export interface BudgetStatus {
  monthlyBudgetUsd: number;
  usedBudgetUsd: number;
  currentSpendUsd: number;
  remainingBudgetUsd: number;
  usagePercentage: number;
  isWarning: boolean; // true if > 80%
  isEmergency: boolean; // true if > 150%
}

// ============================================================================
// MCP Protocol Response Types (Phase 8)
// ============================================================================

/**
 * MCP Tool Response
 * Standard response format from MCP Protocol v1.0
 */
export interface MCPToolResponse {
  content: Array<{
    type: "text" | "image" | "resource";
    text?: string;
    data?: string;
    uri?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

/**
 * MCP Error Response
 */
export interface MCPErrorResponse {
  error: {
    code: number;
    message: string;
    data?: unknown;
  };
}

/**
 * Miyabi Agent Response Wrapper
 * All Miyabi agents return this standardized format
 */
export interface AgentResponse<T = unknown> {
  success: boolean;
  agent: string;
  result?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * MCP Response Parsing Error
 * Thrown when parsing MCP responses fails
 */
export class MCPParseError extends Error {
  constructor(
    message: string,
    public readonly rawResponse: unknown,
    public readonly parseError?: Error
  ) {
    super(message);
    this.name = "MCPParseError";
  }
}
