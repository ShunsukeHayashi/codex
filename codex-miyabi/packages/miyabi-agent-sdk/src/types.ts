/**
 * Miyabi Agent SDK - Type Definitions
 *
 * 識学理論5原則に基づく型定義
 */

// DAG (Directed Acyclic Graph) 構造
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

// Agent共通インターフェース
export interface AgentInput {
  [key: string]: any;
}

export interface AgentOutput {
  success: boolean;
  data?: any;
  error?: string;
}

// Issue関連
export interface IssueData {
  number: number;
  title: string;
  body: string | null;
  labels: string[];
  complexity: "small" | "medium" | "large" | "xlarge";
  priority: "P0" | "P1" | "P2" | "P3";
  type: "bug" | "feature" | "refactor" | "docs" | "test" | "chore";
}

// Code関連
export interface GeneratedFile {
  path: string;
  content: string;
  action: "create" | "modify" | "delete";
}

export interface QualityReport {
  qualityScore: number; // 0-100
  passed: boolean;
  issues: Array<{
    severity: "error" | "warning" | "info";
    file: string;
    line?: number;
    message: string;
  }>;
  coverage: number;
  suggestions: string[];
}

// PR関連
export interface PullRequest {
  number: number;
  url: string;
  branch: string;
  status: "draft" | "open" | "merged";
}

// 識学理論: 結果の評価
export interface AgentMetrics {
  executionTime: number; // milliseconds
  qualityScore: number; // 0-100
  successRate: number; // percentage
  costUsd: number;
}
