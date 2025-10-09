# Phase 1 Implementation Plan: MCP Server Implementation

## Executive Summary

**Objective**: Implement Miyabi MCP server to enable Codex CLI communication with Miyabi agents

**Estimated Duration**: 5 days (40 hours)
**Agent Assignment**: MCPAgent
**Priority**: P0-Immediate
**Severity**: Sev.1-Critical
**Milestone**: M1 - MCP Server Operational

---

## 1. Task Decomposition (DAG)

```yaml
nodes:
  - id: task-1-1
    title: Study MCP protocol specification
    type: research
    estimatedMinutes: 120
    dependencies: []

  - id: task-1-2
    title: Design MCP tool definitions
    type: design
    estimatedMinutes: 180
    dependencies: [task-1-1]

  - id: task-1-3
    title: Implement MCP server foundation
    type: feature
    estimatedMinutes: 240
    dependencies: [task-1-2]

  - id: task-1-4
    title: Implement agent.execute tool
    type: feature
    estimatedMinutes: 180
    dependencies: [task-1-3]

  - id: task-1-5
    title: Implement github.* tools
    type: feature
    estimatedMinutes: 240
    dependencies: [task-1-3]

  - id: task-1-6
    title: Implement project.* tools
    type: feature
    estimatedMinutes: 180
    dependencies: [task-1-3]

  - id: task-1-7
    title: Add error handling and validation
    type: feature
    estimatedMinutes: 120
    dependencies: [task-1-4, task-1-5, task-1-6]

  - id: task-1-8
    title: Configure Codex CLI MCP client
    type: integration
    estimatedMinutes: 120
    dependencies: [task-1-7]

  - id: task-1-9
    title: Write unit tests
    type: test
    estimatedMinutes: 240
    dependencies: [task-1-7]

  - id: task-1-10
    title: Write integration tests
    type: test
    estimatedMinutes: 180
    dependencies: [task-1-8]

  - id: task-1-11
    title: Performance optimization
    type: optimization
    estimatedMinutes: 120
    dependencies: [task-1-9, task-1-10]

  - id: task-1-12
    title: Documentation
    type: docs
    estimatedMinutes: 120
    dependencies: [task-1-11]

levels:
  - level: 0
    tasks: [task-1-1]
    parallelism: 1

  - level: 1
    tasks: [task-1-2]
    parallelism: 1

  - level: 2
    tasks: [task-1-3]
    parallelism: 1

  - level: 3
    tasks: [task-1-4, task-1-5, task-1-6]
    parallelism: 3
    description: "Parallel implementation of MCP tools"

  - level: 4
    tasks: [task-1-7]
    parallelism: 1

  - level: 5
    tasks: [task-1-8, task-1-9]
    parallelism: 2
    description: "Parallel: CLI config + Unit tests"

  - level: 6
    tasks: [task-1-10]
    parallelism: 1

  - level: 7
    tasks: [task-1-11]
    parallelism: 1

  - level: 8
    tasks: [task-1-12]
    parallelism: 1
```

---

## 2. MCP Tool Definitions

### 2.1 Agent Execution Tools

#### agent.execute
**Purpose**: Execute a Miyabi agent with context

**Input Schema**:
```typescript
interface AgentExecuteInput {
  agentName: string;  // "issue" | "codegen" | "review" | "pr" | ...
  context: {
    issueNumber?: number;
    prNumber?: number;
    repository?: string;
    customData?: Record<string, any>;
  };
  options?: {
    timeout?: number;
    priority?: "low" | "medium" | "high";
  };
}
```

**Output Schema**:
```typescript
interface AgentExecuteOutput {
  success: boolean;
  agentName: string;
  executionId: string;
  result: {
    data: any;
    metadata: {
      duration: number;
      timestamp: string;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}
```

#### agent.status
**Purpose**: Check agent execution status

**Input Schema**:
```typescript
interface AgentStatusInput {
  executionId: string;
}
```

**Output Schema**:
```typescript
interface AgentStatusOutput {
  executionId: string;
  status: "pending" | "running" | "completed" | "failed";
  progress?: number;  // 0-100
  result?: any;
  error?: {
    code: string;
    message: string;
  };
}
```

### 2.2 GitHub Integration Tools

#### github.analyze_issue
**Purpose**: Analyze GitHub issue and suggest labels

**Input Schema**:
```typescript
interface GitHubAnalyzeIssueInput {
  owner: string;
  repo: string;
  issueNumber: number;
}
```

**Output Schema**:
```typescript
interface GitHubAnalyzeIssueOutput {
  issueNumber: number;
  title: string;
  body: string;
  analysis: {
    suggestedLabels: string[];
    priority: string;
    type: string;
    estimatedComplexity: "low" | "medium" | "high";
  };
}
```

#### github.create_pr
**Purpose**: Create pull request from branch

**Input Schema**:
```typescript
interface GitHubCreatePRInput {
  owner: string;
  repo: string;
  title: string;
  body: string;
  headBranch: string;
  baseBranch: string;
  draft?: boolean;
}
```

**Output Schema**:
```typescript
interface GitHubCreatePROutput {
  prNumber: number;
  url: string;
  htmlUrl: string;
  success: boolean;
}
```

### 2.3 Project Management Tools

#### project.get_status
**Purpose**: Get GitHub Projects V2 status

**Input Schema**:
```typescript
interface ProjectGetStatusInput {
  owner: string;
  projectNumber: number;
}
```

**Output Schema**:
```typescript
interface ProjectGetStatusOutput {
  projectNumber: number;
  title: string;
  stats: {
    totalIssues: number;
    pending: number;
    inProgress: number;
    review: number;
    done: number;
  };
  kpis: {
    velocity: number;
    qualityScore: number;
    coverage: number;
  };
}
```

---

## 3. Implementation

### 3.1 MCP Server Foundation

**File**: `codex-miyabi/packages/miyabi-mcp-server/src/index.ts`

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Tool implementations
import { agentExecuteTool, agentStatusTool } from "./tools/agent.js";
import { githubAnalyzeIssueTool, githubCreatePRTool } from "./tools/github.js";
import { projectGetStatusTool } from "./tools/project.js";

const server = new Server(
  {
    name: "miyabi-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "agent_execute",
        description: "Execute a Miyabi agent with context",
        inputSchema: agentExecuteTool.schema,
      },
      {
        name: "agent_status",
        description: "Check agent execution status",
        inputSchema: agentStatusTool.schema,
      },
      {
        name: "github_analyze_issue",
        description: "Analyze GitHub issue and suggest labels",
        inputSchema: githubAnalyzeIssueTool.schema,
      },
      {
        name: "github_create_pr",
        description: "Create pull request from branch",
        inputSchema: githubCreatePRTool.schema,
      },
      {
        name: "project_get_status",
        description: "Get GitHub Projects V2 status",
        inputSchema: projectGetStatusTool.schema,
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "agent_execute":
        return await agentExecuteTool.execute(args);
      case "agent_status":
        return await agentStatusTool.execute(args);
      case "github_analyze_issue":
        return await githubAnalyzeIssueTool.execute(args);
      case "github_create_pr":
        return await githubCreatePRTool.execute(args);
      case "project_get_status":
        return await projectGetStatusTool.execute(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Miyabi MCP server running on stdio");
}

main().catch(console.error);
```

### 3.2 Agent Execute Tool Implementation

**File**: `codex-miyabi/packages/miyabi-mcp-server/src/tools/agent.ts`

```typescript
import { z } from "zod";

const AgentExecuteSchema = z.object({
  agentName: z.enum(["issue", "codegen", "review", "pr", "deployment", "test"]),
  context: z.object({
    issueNumber: z.number().optional(),
    prNumber: z.number().optional(),
    repository: z.string().optional(),
    customData: z.record(z.any()).optional(),
  }),
  options: z
    .object({
      timeout: z.number().default(300000),
      priority: z.enum(["low", "medium", "high"]).default("medium"),
    })
    .optional(),
});

export const agentExecuteTool = {
  schema: {
    type: "object",
    properties: {
      agentName: {
        type: "string",
        enum: ["issue", "codegen", "review", "pr", "deployment", "test"],
        description: "Name of the agent to execute",
      },
      context: {
        type: "object",
        properties: {
          issueNumber: { type: "number" },
          prNumber: { type: "number" },
          repository: { type: "string" },
          customData: { type: "object" },
        },
      },
      options: {
        type: "object",
        properties: {
          timeout: { type: "number", default: 300000 },
          priority: { type: "string", enum: ["low", "medium", "high"] },
        },
      },
    },
    required: ["agentName", "context"],
  },

  async execute(args: z.infer<typeof AgentExecuteSchema>) {
    const { agentName, context, options } = AgentExecuteSchema.parse(args);

    // TODO: Implement agent execution logic (Phase 2)
    // For now, return stub
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: true,
            agentName,
            executionId,
            result: {
              data: { message: "Agent execution started (stub)" },
              metadata: {
                duration: 0,
                timestamp: new Date().toISOString(),
              },
            },
          }),
        },
      ],
    };
  },
};

export const agentStatusTool = {
  schema: {
    type: "object",
    properties: {
      executionId: {
        type: "string",
        description: "Execution ID from agent.execute",
      },
    },
    required: ["executionId"],
  },

  async execute(args: { executionId: string }) {
    // TODO: Implement status tracking (Phase 2)
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            executionId: args.executionId,
            status: "completed",
            progress: 100,
            result: { message: "Status check (stub)" },
          }),
        },
      ],
    };
  },
};
```

---

## 4. Codex CLI Configuration

**File**: `~/.codex/config.toml`

```toml
[[mcp_servers]]
name = "miyabi"
command = "node"
args = [
  "/Users/shunsuke/Dev/codex/codex-miyabi/packages/miyabi-mcp-server/dist/index.js"
]
env = {
  GITHUB_TOKEN = "ghp_xxx",
  ANTHROPIC_API_KEY = "sk-ant-xxx",
  NODE_ENV = "production"
}
```

---

## 5. Testing Strategy

### 5.1 Unit Tests

**File**: `codex-miyabi/packages/miyabi-mcp-server/src/__tests__/tools/agent.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { agentExecuteTool } from "../../tools/agent.js";

describe("agent.execute tool", () => {
  it("should execute agent with valid input", async () => {
    const result = await agentExecuteTool.execute({
      agentName: "issue",
      context: {
        issueNumber: 42,
        repository: "openai/codex",
      },
    });

    expect(result.content[0].type).toBe("text");
    const data = JSON.parse(result.content[0].text);
    expect(data.success).toBe(true);
    expect(data.agentName).toBe("issue");
    expect(data.executionId).toBeDefined();
  });

  it("should reject invalid agent name", async () => {
    await expect(
      agentExecuteTool.execute({
        agentName: "invalid" as any,
        context: {},
      })
    ).rejects.toThrow();
  });
});
```

### 5.2 Integration Tests

**File**: `codex-miyabi/packages/miyabi-mcp-server/src/__tests__/integration/mcp-server.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawn } from "child_process";

describe("MCP Server Integration", () => {
  let serverProcess;

  beforeAll(async () => {
    // Start MCP server
    serverProcess = spawn("node", ["dist/index.js"]);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  afterAll(() => {
    serverProcess.kill();
  });

  it("should respond to list_tools request", async () => {
    // Send MCP request via stdio
    // Verify tools list returned
  });

  it("should execute agent.execute tool", async () => {
    // Send MCP call_tool request
    // Verify response
  });
});
```

---

## 6. Success Criteria

### Required Conditions
- [ ] MCP server starts successfully
- [ ] All 5 tools defined and listed
- [ ] agent.execute tool responds
- [ ] github.* tools respond (stub OK for Phase 1)
- [ ] project.* tools respond (stub OK for Phase 1)
- [ ] Codex CLI can connect to MCP server
- [ ] Integration tests passing
- [ ] Response time <100ms per tool call
- [ ] Unit test coverage ≥80%

### Quality Metrics
- Tool response time: <100ms
- Server startup time: <2s
- Memory usage: <50MB
- Zero TypeScript errors

---

## 7. Milestone M1 Checklist

- [ ] MCP server starts and runs stably
- [ ] All tools respond to requests
- [ ] Codex CLI configured and connected
- [ ] Integration tests passing
- [ ] Documentation complete
- [ ] Guardian approval (@ShunsukeHayashi)

---

## 8. Next Steps

After Phase 1 completion:
1. **Guardian Review**: @ShunsukeHayashi approves M1
2. **Create GitHub Issue #2**: "Phase 1: MCP Server - Complete"
3. **Start Phase 2**: Agent Integration (IntegrationAgent)

---

**Generated**: 2025-10-10
**Agent**: MCPAgent
**Phase**: Phase 1
**Milestone**: M1
