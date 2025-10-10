# Codex SDK

Embed the Codex agent in your workflows and apps.

The TypeScript SDK wraps the bundled `codex` binary. It spawns the CLI and exchanges JSONL events over stdin/stdout.

## Installation

```bash
npm install @openai/codex-sdk
```

Requires Node.js 18+.

## Quickstart

```typescript
import { Codex } from "@openai/codex-sdk";

const codex = new Codex();
const thread = codex.startThread();
const turn = await thread.run("Diagnose the test failure and propose a fix");

console.log(turn.finalResponse);
console.log(turn.items);
```

Call `run()` repeatedly on the same `Thread` instance to continue that conversation.

```typescript
const nextTurn = await thread.run("Implement the fix");
```

### Streaming responses

`run()` buffers events until the turn finishes. To react to intermediate progress—tool calls, streaming responses, and file diffs—use `runStreamed()` instead, which returns an async generator of structured events.

```typescript
const { events } = await thread.runStreamed("Diagnose the test failure and propose a fix");

for await (const event of events) {
  switch (event.type) {
    case "item.completed":
      console.log("item", event.item);
      break;
    case "turn.completed":
      console.log("usage", event.usage);
      break;
  }
}
```

### Structured output

The Codex agent can produce a JSON response that conforms to a specified schema. The schema can be provided for each turn as a plain JSON object.

```typescript
const schema = {
  type: "object",
  properties: {
    summary: { type: "string" },
    status: { type: "string", enum: ["ok", "action_required"] },
  },
  required: ["summary", "status"],
  additionalProperties: false,
} as const;

const turn = await thread.run("Summarize repository status", { outputSchema: schema });
console.log(turn.finalResponse);
```

You can also create a JSON schema from a [Zod schema](https://github.com/colinhacks/zod) using the [`zod-to-json-schema`](https://www.npmjs.com/package/zod-to-json-schema) package and setting the `target` to `"openAi"`.

```typescript
const schema = z.object({
  summary: z.string(),
  status: z.enum(["ok", "action_required"]),
});

const turn = await thread.run("Summarize repository status", {
  outputSchema: zodToJsonSchema(schema, { target: "openAi" }),
});
console.log(turn.finalResponse);
```

### Resuming an existing thread

Threads are persisted in `~/.codex/sessions`. If you lose the in-memory `Thread` object, reconstruct it with `resumeThread()` and keep going.

```typescript
const savedThreadId = process.env.CODEX_THREAD_ID!;
const thread = codex.resumeThread(savedThreadId);
await thread.run("Implement the fix");
```

### Working directory controls

Codex runs in the current working directory by default. To avoid unrecoverable errors, Codex requires the working directory to be a Git repository. You can skip the Git repository check by passing the `skipGitRepoCheck` option when creating a thread.

```typescript
const thread = codex.startThread({
  workingDirectory: "/path/to/project",
  skipGitRepoCheck: true,
});
```

## Miyabi Integration - Multi-Agent Autonomous Development

The Codex SDK includes **Miyabi**, a multi-agent framework based on the Shikigaku (識学) Theory, enabling autonomous development workflows with GitHub integration.

### Features

- **7 Specialized Agents**: Issue analysis, task decomposition, code generation, review, PR creation, testing, and deployment
- **Parallel Execution**: DAG-based dependency resolution with concurrent agent execution
- **GitHub Integration**: Projects V2, 53-label system, automated workflows
- **Budget Management**: Cost tracking and circuit breaker functionality

### Quick Start with Miyabi

```typescript
import { MiyabiAgents } from "@openai/codex-sdk/miyabi";

const miyabi = new MiyabiAgents({
  githubToken: process.env.GITHUB_TOKEN!,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
});

// Analyze a GitHub issue
const analysis = await miyabi.analyzeIssue({
  issueNumber: 42,
  repository: "openai/codex",
});

console.log(`Priority: ${analysis.issue.priority}`);
console.log(`Suggested Labels: ${analysis.suggestedLabels.join(", ")}`);
```

### Complete Issue-to-PR Workflow

```typescript
import { MiyabiAgents } from "@openai/codex-sdk/miyabi";

const miyabi = new MiyabiAgents({
  githubToken: process.env.GITHUB_TOKEN!,
});

// Run multiple agents in parallel
const result = await miyabi.runParallel({
  issueNumber: 42,
  repository: "openai/codex",
  agents: ["issue", "codegen", "review", "pr"],
  concurrency: 3,
});

if (result.success && result.prUrl) {
  console.log(`✅ PR created: ${result.prUrl}`);
  console.log(`⏱️  Total time: ${result.totalExecutionTime}ms`);
}
```

### Individual Agent Operations

#### Issue Analysis

```typescript
const analysis = await miyabi.analyzeIssue({
  issueNumber: 42,
  repository: "openai/codex",
});
```

#### Code Generation

```typescript
const code = await miyabi.generateCode({
  issueNumber: 42,
  repository: "openai/codex",
  context: "Use TypeScript with strict mode",
});

console.log(`Generated ${code.files.length} files`);
```

#### Code Review

```typescript
const review = await miyabi.reviewCode({
  prNumber: 123,
  repository: "openai/codex",
});

console.log(`Quality Score: ${review.qualityScore}/100`);
console.log(`Issues Found: ${review.issues.length}`);
```

#### Pull Request Creation

```typescript
const pr = await miyabi.createPullRequest({
  repository: "openai/codex",
  title: "Fix: authentication bug",
  body: "This PR fixes the authentication bug reported in #42",
  issueNumber: 42,
  draft: true,
});

console.log(`PR created: ${pr.url}`);
```

#### Test Execution

```typescript
const testResult = await miyabi.runTests({
  repository: "openai/codex",
  testPattern: "**/*.test.ts",
});

console.log(`Passed: ${testResult.passedTests}/${testResult.totalTests}`);
console.log(`Coverage: ${testResult.coverage}%`);
```

### Budget Management

```typescript
const budget = await miyabi.checkBudget();

console.log(`Monthly Budget: $${budget.monthlyBudgetUsd}`);
console.log(`Current Spend: $${budget.currentSpendUsd}`);
console.log(`Remaining: $${budget.remainingBudgetUsd}`);
console.log(`Usage: ${budget.usagePercentage}%`);

if (budget.isWarning) {
  console.warn("⚠️  Budget warning: 80% threshold exceeded");
}

if (budget.isEmergency) {
  console.error("🚨 Budget emergency: 150% threshold exceeded");
}
```

### Task Decomposition

For complex features, use the CoordinatorAgent to decompose tasks into a DAG:

```typescript
const dag = await miyabi.decomposeTask({
  issueNumber: 42,
  repository: "openai/codex",
});

console.log(`Total subtasks: ${dag.nodes.length}`);
console.log(`Dependencies: ${dag.edges.length}`);

// Execute tasks in optimal order
for (const node of dag.nodes) {
  console.log(`- ${node.description} (${node.estimatedTime}min)`);
}
```

### GitHub Projects V2 Integration

```typescript
const status = await miyabi.getProjectStatus({
  repository: "openai/codex",
  projectName: "Codex Development",
});

console.log("Project Status:", status);
```

### Configuration

Configure the Miyabi MCP server in `~/.codex/config.toml`:

```toml
[[mcp_servers]]
name = "miyabi"
command = "node"
args = [
  "/path/to/codex/codex-miyabi/packages/miyabi-mcp-server/dist/index.js"
]
env = {
  GITHUB_TOKEN = "ghp_xxx",
  ANTHROPIC_API_KEY = "sk-ant-xxx"
}

[miyabi]
monthly_budget_usd = 500

[miyabi.thresholds]
warning = 0.8      # 80% warning
emergency = 1.5    # 150% emergency stop
```

### Type Definitions

All Miyabi types are fully typed with TypeScript:

```typescript
import type {
  IssueAnalysisResult,
  CodeGenerationResult,
  QualityReport,
  PullRequest,
  TestResult,
  BudgetStatus,
  DAG,
  ParallelExecutionOptions,
} from "@openai/codex-sdk/miyabi";
```

For more details, see the [Integration Plan](../../INTEGRATION_PLAN_MIYABI.md).
