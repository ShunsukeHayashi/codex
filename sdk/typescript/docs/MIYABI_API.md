# Miyabi API Reference

Complete API documentation for the Miyabi Multi-Agent Framework integration in Codex SDK.

## Table of Contents

- [MiyabiAgents Class](#miyabiagents-class)
- [Configuration](#configuration)
- [Agent Methods](#agent-methods)
- [Type Definitions](#type-definitions)
- [Error Handling](#error-handling)

---

## MiyabiAgents Class

Main class for interacting with the Miyabi multi-agent system.

### Constructor

```typescript
new MiyabiAgents(config?: MiyabiMCPConfig)
```

#### Parameters

- `config` (optional): Configuration object
  - `serverName` (string, default: `"miyabi"`): MCP server name
  - `githubToken` (string, optional): GitHub Personal Access Token
  - `anthropicApiKey` (string, optional): Anthropic API key for Claude

#### Example

```typescript
const miyabi = new MiyabiAgents({
  githubToken: process.env.GITHUB_TOKEN!,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
});
```

---

## Agent Methods

### IssueAgent: analyzeIssue()

Analyzes a GitHub issue and suggests appropriate labels, priority, and complexity.

```typescript
analyzeIssue(options: {
  issueNumber: number;
  repository: string;
}): Promise<IssueAnalysisResult>
```

#### Parameters

- `issueNumber`: GitHub issue number
- `repository`: Repository in format `"owner/repo"`

#### Returns

`IssueAnalysisResult`:

```typescript
{
  issue: IssueData;
  suggestedLabels: string[];
  estimatedComplexity: "small" | "medium" | "large" | "xlarge";
  estimatedTime: number; // minutes
  agentRecommendations: string[];
}
```

#### Example

```typescript
const analysis = await miyabi.analyzeIssue({
  issueNumber: 42,
  repository: "openai/codex",
});

console.log(`Priority: ${analysis.issue.priority}`);
console.log(`Complexity: ${analysis.estimatedComplexity}`);
console.log(`Estimated Time: ${analysis.estimatedTime} minutes`);
```

---

### CoordinatorAgent: decomposeTask()

Decomposes a complex task into subtasks with a DAG structure.

```typescript
decomposeTask(options: {
  issueNumber: number;
  repository: string;
}): Promise<DAG>
```

#### Parameters

- `issueNumber`: GitHub issue number
- `repository`: Repository in format `"owner/repo"`

#### Returns

`DAG` (Directed Acyclic Graph):

```typescript
{
  nodes: TaskNode[];
  edges: TaskEdge[];
}
```

where:

```typescript
TaskNode {
  id: string;
  description: string;
  agent: string;
  estimatedTime: number; // minutes
  dependencies: string[]; // task IDs
}

TaskEdge {
  from: string; // task ID
  to: string;   // task ID
}
```

#### Example

```typescript
const dag = await miyabi.decomposeTask({
  issueNumber: 42,
  repository: "openai/codex",
});

console.log(`Total subtasks: ${dag.nodes.length}`);

for (const node of dag.nodes) {
  console.log(`- ${node.description} (${node.estimatedTime}min)`);
}
```

---

### CodeGenAgent: generateCode()

Generates code based on a GitHub issue.

```typescript
generateCode(options: {
  issueNumber: number;
  repository: string;
  context?: string;
}): Promise<CodeGenerationResult>
```

#### Parameters

- `issueNumber`: GitHub issue number
- `repository`: Repository in format `"owner/repo"`
- `context` (optional): Additional context for code generation

#### Returns

`CodeGenerationResult`:

```typescript
{
  files: GeneratedFile[];
  summary: string;
  warnings: string[];
}
```

where:

```typescript
GeneratedFile {
  path: string;
  content: string;
  action: "create" | "modify" | "delete";
}
```

#### Example

```typescript
const result = await miyabi.generateCode({
  issueNumber: 42,
  repository: "openai/codex",
  context: "Use TypeScript with strict mode",
});

console.log(`Generated ${result.files.length} files`);
for (const file of result.files) {
  console.log(`  ${file.action}: ${file.path}`);
}
```

---

### ReviewAgent: reviewCode()

Reviews code quality for a pull request.

```typescript
reviewCode(options: {
  prNumber: number;
  repository: string;
}): Promise<QualityReport>
```

#### Parameters

- `prNumber`: Pull request number
- `repository`: Repository in format `"owner/repo"`

#### Returns

`QualityReport`:

```typescript
{
  qualityScore: number; // 0-100
  passed: boolean;
  issues: QualityIssue[];
  coverage: number; // percentage
  suggestions: string[];
}
```

where:

```typescript
QualityIssue {
  severity: "error" | "warning" | "info";
  file: string;
  line?: number;
  message: string;
}
```

#### Example

```typescript
const review = await miyabi.reviewCode({
  prNumber: 123,
  repository: "openai/codex",
});

console.log(`Quality Score: ${review.qualityScore}/100`);
console.log(`Passed: ${review.passed ? "✅" : "❌"}`);

if (!review.passed) {
  console.log("Issues:");
  for (const issue of review.issues) {
    console.log(`  [${issue.severity}] ${issue.file}: ${issue.message}`);
  }
}
```

---

### PRAgent: createPullRequest()

Creates a pull request on GitHub.

```typescript
createPullRequest(options: PRCreationOptions & {
  repository: string;
}): Promise<PullRequest>
```

#### Parameters

- `repository`: Repository in format `"owner/repo"`
- `title`: PR title
- `body`: PR description
- `issueNumber` (optional): Related issue number
- `draft` (optional, default: `false`): Create as draft PR
- `baseBranch` (optional, default: `"main"`): Target branch

#### Returns

`PullRequest`:

```typescript
{
  number: number;
  url: string;
  branch: string;
  status: "draft" | "open" | "merged";
  title: string;
  body: string;
}
```

#### Example

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

---

### TestAgent: runTests()

Executes tests for a repository.

```typescript
runTests(options: {
  repository: string;
  testPattern?: string;
}): Promise<TestResult>
```

#### Parameters

- `repository`: Repository in format `"owner/repo"`
- `testPattern` (optional, default: `"**/*.test.ts"`): Test file pattern

#### Returns

`TestResult`:

```typescript
{
  passed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  failures: TestFailure[];
  coverage: number; // percentage
}
```

where:

```typescript
TestFailure {
  testName: string;
  file: string;
  errorMessage: string;
}
```

#### Example

```typescript
const testResult = await miyabi.runTests({
  repository: "openai/codex",
  testPattern: "**/*.test.ts",
});

console.log(`Passed: ${testResult.passedTests}/${testResult.totalTests}`);
console.log(`Coverage: ${testResult.coverage}%`);

if (testResult.failures.length > 0) {
  console.log("Failures:");
  for (const failure of testResult.failures) {
    console.log(`  - ${failure.testName}: ${failure.errorMessage}`);
  }
}
```

---

### Parallel Execution: runParallel()

Runs multiple agents in parallel for a complete workflow.

```typescript
runParallel(options: ParallelExecutionOptions & {
  repository: string;
}): Promise<ParallelExecutionResult>
```

#### Parameters

- `issueNumber`: GitHub issue number
- `repository`: Repository in format `"owner/repo"`
- `agents`: Array of agent names to execute
  - Available: `"issue"`, `"codegen"`, `"review"`, `"pr"`, `"test"`
- `concurrency` (optional, default: `3`): Maximum parallel agents

#### Returns

`ParallelExecutionResult`:

```typescript
{
  success: boolean;
  results: {
    [agentName: string]: AgentOutput;
  };
  totalExecutionTime: number; // milliseconds
  prUrl?: string;
}
```

#### Example

```typescript
const result = await miyabi.runParallel({
  issueNumber: 42,
  repository: "openai/codex",
  agents: ["issue", "codegen", "review", "pr"],
  concurrency: 3,
});

if (result.success && result.prUrl) {
  console.log(`✅ PR created: ${result.prUrl}`);
  console.log(`Total time: ${result.totalExecutionTime}ms`);
}
```

---

### Budget Management: checkBudget()

Retrieves the current budget status and cost tracking information.

```typescript
checkBudget(): Promise<BudgetStatus>
```

#### Returns

`BudgetStatus`:

```typescript
{
  monthlyBudgetUsd: number;
  currentSpendUsd: number;
  remainingBudgetUsd: number;
  usagePercentage: number;
  isWarning: boolean;    // true if > 80%
  isEmergency: boolean;  // true if > 150%
}
```

#### Example

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

---

### GitHub Projects: getProjectStatus()

Retrieves status information for a GitHub Projects V2 project.

```typescript
getProjectStatus(options: {
  repository: string;
  projectName: string;
}): Promise<any>
```

#### Parameters

- `repository`: Repository in format `"owner/repo"`
- `projectName`: Name of the GitHub project

#### Example

```typescript
const status = await miyabi.getProjectStatus({
  repository: "openai/codex",
  projectName: "Codex Development",
});

console.log("Project Status:", status);
```

---

## Type Definitions

All types are exported from `@openai/codex-sdk/miyabi`:

```typescript
import type {
  // DAG Types
  TaskNode,
  TaskEdge,
  DAG,
  // Agent Types
  AgentInput,
  AgentOutput,
  // Issue Types
  IssueData,
  IssueAnalysisResult,
  // Code Types
  GeneratedFile,
  CodeGenerationResult,
  // Review Types
  QualityIssue,
  QualityReport,
  // PR Types
  PullRequest,
  PRCreationOptions,
  // Test Types
  TestFailure,
  TestResult,
  // Metrics Types
  AgentMetrics,
  // Execution Types
  ParallelExecutionOptions,
  ParallelExecutionResult,
  // Config Types
  MiyabiMCPConfig,
  // Budget Types
  BudgetStatus,
} from "@openai/codex-sdk/miyabi";
```

---

## Error Handling

All methods return Promises and can throw errors. Always use try-catch for error handling:

```typescript
try {
  const analysis = await miyabi.analyzeIssue({
    issueNumber: 42,
    repository: "openai/codex",
  });
  console.log(analysis);
} catch (error) {
  console.error("Error analyzing issue:", error);
}
```

### Common Error Scenarios

1. **Budget Exceeded**: When budget limit is reached
   ```typescript
   if (budget.isEmergency) {
     throw new Error("Budget emergency: execution stopped");
   }
   ```

2. **MCP Server Connection**: When Miyabi MCP server is not available
   ```typescript
   // Ensure MCP server is configured in ~/.codex/config.toml
   ```

3. **GitHub API Errors**: Rate limits, authentication, etc.
   ```typescript
   // Ensure GITHUB_TOKEN is valid and has necessary permissions
   ```

---

## Configuration

### MCP Server Setup

Configure in `~/.codex/config.toml`:

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

### Environment Variables

- `GITHUB_TOKEN`: GitHub Personal Access Token with repo access
- `ANTHROPIC_API_KEY`: Anthropic API key for Claude (Sonnet 4)

---

## Best Practices

1. **Always check budget before large operations**:
   ```typescript
   const budget = await miyabi.checkBudget();
   if (budget.isWarning) {
     // Consider reducing operations
   }
   ```

2. **Use parallel execution for efficiency**:
   ```typescript
   // Faster: parallel execution
   await miyabi.runParallel({ agents: ["codegen", "review"], concurrency: 2 });

   // Slower: sequential execution
   await miyabi.generateCode(...);
   await miyabi.reviewCode(...);
   ```

3. **Handle task decomposition for complex issues**:
   ```typescript
   const analysis = await miyabi.analyzeIssue(...);
   if (analysis.estimatedComplexity === "large") {
     const dag = await miyabi.decomposeTask(...);
     // Execute subtasks in optimal order
   }
   ```

4. **Review code quality before merging**:
   ```typescript
   const review = await miyabi.reviewCode(...);
   if (!review.passed) {
     console.log("Quality check failed, please address issues");
   }
   ```

---

## Examples

See [`samples/miyabi-example.ts`](../samples/miyabi-example.ts) for a complete working example.

---

## License

Apache-2.0 - See [LICENSE](../../../LICENSE) for details.
