/**
 * decomposeTask Tool
 *
 * IssueをDAG構造のサブタスクに分解
 */

import { GitHubClient } from "../utils/GitHubClient.js";
import { AnthropicClient } from "../utils/AnthropicClient.js";
import { BudgetManager } from "../utils/BudgetManager.js";

export interface DecomposeTaskInput {
  issueNumber: number;
  repository: string;
}

export interface TaskNode {
  id: string;
  description: string;
  agent: string;
  estimatedTime: number; // minutes
}

export interface TaskEdge {
  from: string;
  to: string;
}

export interface DecomposeTaskOutput {
  taskGraph: {
    nodes: TaskNode[];
    edges: TaskEdge[];
  };
  criticalPath: string[];
  parallelizable: string[][];
  costUsd: number;
  tokensUsed: number;
}

export async function decomposeTask(
  input: DecomposeTaskInput,
  github: GitHubClient,
  anthropic: AnthropicClient,
  budget: BudgetManager
): Promise<DecomposeTaskOutput> {
  const [owner, repo] = input.repository.split("/");

  // 予算チェック
  const estimatedCost = 0.06;
  const budgetCheck = await budget.checkBudget("decomposeTask", estimatedCost);

  if (!budgetCheck.allowed) {
    throw new Error(budgetCheck.message);
  }

  // Issueを取得
  const issue = await github.getIssue(owner, repo, input.issueNumber);

  // Claude Sonnet 4でタスク分解（簡略実装）
  const prompt = `以下のGitHub Issueをサブタスクに分解し、DAG構造で出力してください。

Title: ${issue.title}
Body: ${issue.body || "(本文なし)"}

出力形式（JSON）:
{
  "nodes": [
    { "id": "task1", "description": "タスク説明", "agent": "codegen", "estimatedTime": 30 }
  ],
  "edges": [
    { "from": "task1", "to": "task2" }
  ],
  "criticalPath": ["task1", "task2"],
  "parallelizable": [["task3", "task4"]]
}`;

  // 簡略実装: 固定のタスク構造を返す
  const nodes: TaskNode[] = [
    {
      id: "task1",
      description: `Implement solution for: ${issue.title}`,
      agent: "codegen",
      estimatedTime: 60,
    },
    {
      id: "task2",
      description: "Write tests",
      agent: "test",
      estimatedTime: 30,
    },
    {
      id: "task3",
      description: "Code review",
      agent: "review",
      estimatedTime: 15,
    },
  ];

  const edges: TaskEdge[] = [
    { from: "task1", to: "task2" },
    { from: "task2", to: "task3" },
  ];

  const criticalPath = ["task1", "task2", "task3"];
  const parallelizable: string[][] = [];

  // コスト記録
  const actualCost = 0.06; // 簡略実装のため固定値
  budget.trackUsage({
    operation: "decomposeTask",
    costUsd: actualCost,
    tokensUsed: 10000,
    model: "claude-sonnet-4-20250514",
  });

  return {
    taskGraph: { nodes, edges },
    criticalPath,
    parallelizable,
    costUsd: actualCost,
    tokensUsed: 10000,
  };
}
