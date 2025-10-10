#!/usr/bin/env node

/**
 * Miyabi MCP Server
 *
 * Model Context Protocol Server for Miyabi Autonomous Development Framework
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { GitHubClient } from "./utils/GitHubClient.js";
import { AnthropicClient } from "./utils/AnthropicClient.js";
import { BudgetManager } from "./utils/BudgetManager.js";

import { analyzeIssue } from "./tools/analyzeIssue.js";
import { decomposeTask } from "./tools/decomposeTask.js";
import { generateCode } from "./tools/generateCode.js";
import { reviewCode } from "./tools/reviewCode.js";
import { createPullRequest } from "./tools/createPullRequest.js";
import { checkBudget } from "./tools/checkBudget.js";
import {
  runTests,
  deployAgent,
  updateProjectStatus,
} from "./tools/advancedTools.js";

import { getIssueResource } from "./resources/issueResource.js";
import { getProjectResource } from "./resources/projectResource.js";
import { getAgentMetricsResource } from "./resources/agentMetricsResource.js";

// Initialize clients
const github = new GitHubClient();
const anthropic = new AnthropicClient();
const budget = new BudgetManager();

const server = new Server(
  {
    name: "miyabi-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "analyzeIssue",
        description: "GitHubのIssueを解析し、適切なラベルと複雑度を判定",
        inputSchema: {
          type: "object",
          properties: {
            issueNumber: { type: "number" },
            repository: { type: "string", description: "owner/repo" },
          },
          required: ["issueNumber", "repository"],
        },
      },
      {
        name: "decomposeTask",
        description: "IssueをDAG構造のサブタスクに分解",
        inputSchema: {
          type: "object",
          properties: {
            issueNumber: { type: "number" },
            repository: { type: "string" },
          },
          required: ["issueNumber", "repository"],
        },
      },
      {
        name: "generateCode",
        description: "サブタスクに対してコードを生成",
        inputSchema: {
          type: "object",
          properties: {
            taskId: { type: "string" },
            requirements: { type: "string" },
            context: {
              type: "object",
              properties: {
                repository: { type: "string" },
                baseBranch: { type: "string" },
                relatedFiles: { type: "array", items: { type: "string" } },
              },
            },
          },
          required: ["taskId", "requirements", "context"],
        },
      },
      {
        name: "reviewCode",
        description: "生成されたコードを品質チェック",
        inputSchema: {
          type: "object",
          properties: {
            files: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  path: { type: "string" },
                  content: { type: "string" },
                },
              },
            },
            standards: {
              type: "object",
              properties: {
                minQualityScore: { type: "number" },
                requireTests: { type: "boolean" },
                securityScan: { type: "boolean" },
              },
            },
          },
          required: ["files", "standards"],
        },
      },
      {
        name: "createPullRequest",
        description: "Draft PRを作成",
        inputSchema: {
          type: "object",
          properties: {
            issueNumber: { type: "number" },
            repository: { type: "string" },
            branch: { type: "string" },
            title: { type: "string" },
            body: { type: "string" },
            files: { type: "array" },
            qualityReport: { type: "object" },
          },
          required: [
            "issueNumber",
            "repository",
            "title",
            "body",
            "files",
            "qualityReport",
          ],
        },
      },
      {
        name: "checkBudget",
        description: "経済Circuit Breakerによる予算チェック",
        inputSchema: {
          type: "object",
          properties: {
            operation: { type: "string" },
            estimatedCost: { type: "number" },
          },
          required: ["operation", "estimatedCost"],
        },
      },
      {
        name: "runTests",
        description: "テスト実行とカバレッジ取得",
        inputSchema: {
          type: "object",
          properties: {
            repository: { type: "string" },
            branch: { type: "string" },
            testCommand: { type: "string" },
          },
          required: ["repository", "branch", "testCommand"],
        },
      },
      {
        name: "deployAgent",
        description: "デプロイ実行",
        inputSchema: {
          type: "object",
          properties: {
            repository: { type: "string" },
            environment: { type: "string", enum: ["staging", "production"] },
            prNumber: { type: "number" },
          },
          required: ["repository", "environment", "prNumber"],
        },
      },
      {
        name: "updateProjectStatus",
        description: "GitHub Projects V2 のステータス更新",
        inputSchema: {
          type: "object",
          properties: {
            issueNumber: { type: "number" },
            repository: { type: "string" },
            status: {
              type: "string",
              enum: [
                "pending",
                "analyzing",
                "implementing",
                "reviewing",
                "done",
              ],
            },
            qualityMetrics: { type: "object" },
          },
          required: ["issueNumber", "repository", "status", "qualityMetrics"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "analyzeIssue":
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                await analyzeIssue(args as any, github, anthropic, budget),
                null,
                2
              ),
            },
          ],
        };
      case "decomposeTask":
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                await decomposeTask(args as any, github, anthropic, budget),
                null,
                2
              ),
            },
          ],
        };
      case "generateCode":
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                await generateCode(args as any, anthropic, budget),
                null,
                2
              ),
            },
          ],
        };
      case "reviewCode":
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                await reviewCode(args as any, anthropic, budget),
                null,
                2
              ),
            },
          ],
        };
      case "createPullRequest":
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                await createPullRequest(args as any, github),
                null,
                2
              ),
            },
          ],
        };
      case "checkBudget":
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                await checkBudget(args as any, budget),
                null,
                2
              ),
            },
          ],
        };
      case "runTests":
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(await runTests(args as any), null, 2),
            },
          ],
        };
      case "deployAgent":
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(await deployAgent(args as any), null, 2),
            },
          ],
        };
      case "updateProjectStatus":
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                await updateProjectStatus(args as any),
                null,
                2
              ),
            },
          ],
        };
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ error: String(error) }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Resource handlers
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "issue://{owner}/{repo}/{number}",
        name: "GitHub Issue Data",
        mimeType: "application/json",
        description: "GitHubのIssueデータを取得",
      },
      {
        uri: "project://{owner}/{project-id}/status",
        name: "GitHub Projects V2 Status",
        mimeType: "application/json",
        description: "GitHub Projects V2のステータスを取得",
      },
      {
        uri: "agent://metrics",
        name: "Agent Metrics",
        mimeType: "application/json",
        description: "Agent実行メトリクスを取得",
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  try {
    let data: any;

    if (uri.startsWith("issue://")) {
      data = await getIssueResource(uri, github);
    } else if (uri.startsWith("project://")) {
      data = await getProjectResource(uri);
    } else if (uri === "agent://metrics") {
      data = await getAgentMetricsResource(budget);
    } else {
      throw new Error(`Unknown resource URI: ${uri}`);
    }

    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify({ error: String(error) }, null, 2),
        },
      ],
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Miyabi MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
