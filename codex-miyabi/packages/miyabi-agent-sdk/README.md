# Miyabi Autonomous Agent SDK

**Autonomous Development Framework based on 識学理論 (Shikigaku Theory)**

A production-ready TypeScript SDK implementing 6 specialized AI agents that autonomously analyze GitHub issues, generate code, review quality, and create pull requests using Claude Sonnet 4 and GitHub APIs.

---

## Features

- **6 Specialized Agents**: Issue analysis, code generation, review, PR creation, testing, and coordination
- **Real API Integration**: Claude Sonnet 4 (Anthropic) and GitHub API (Octokit)
- **識学理論 Principles**: Clear responsibility, authority delegation, hierarchical design
- **Quality Gates**: 80+ quality score threshold, 80%+ test coverage requirement
- **Economic Management**: Budget tracking with circuit breaker pattern
- **E2E Testing**: Comprehensive test framework with both mock and real API modes
- **Type-Safe**: Strict TypeScript with complete type definitions

---

## Quick Start

### Installation

```bash
cd packages/miyabi-agent-sdk
pnpm install
pnpm run build
```

### Basic Usage

```typescript
import { IssueAgent, CodeGenAgent, ReviewAgent, PRAgent } from "@codex-miyabi/agent-sdk";

// Initialize agents with API keys
const issueAgent = new IssueAgent({
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  githubToken: process.env.GITHUB_TOKEN,
});

const codeGenAgent = new CodeGenAgent({
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  githubToken: process.env.GITHUB_TOKEN,
});

const reviewAgent = new ReviewAgent({
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
});

const prAgent = new PRAgent({
  githubToken: process.env.GITHUB_TOKEN,
});

// 1. Analyze GitHub issue
const issueResult = await issueAgent.analyze({
  issueNumber: 42,
  repository: "my-repo",
  owner: "my-org",
  useRealAPI: true,
});

console.log(`Type: ${issueResult.data.type}`);
console.log(`Complexity: ${issueResult.data.complexity}`);
console.log(`Priority: ${issueResult.data.priority}`);

// 2. Generate code
const codeResult = await codeGenAgent.generate({
  taskId: "task-1",
  requirements: issueResult.data.body,
  context: {
    repository: "my-repo",
    owner: "my-org",
    baseBranch: "main",
    relatedFiles: ["src/index.ts"],
  },
  language: "typescript",
  useRealAPI: true,
});

console.log(`Generated ${codeResult.data.files.length} files`);
console.log(`Cost: $${codeResult.data.cost?.toFixed(4)}`);

// 3. Review code quality
const reviewResult = await reviewAgent.review({
  files: codeResult.data.files,
  standards: {
    minQualityScore: 80,
    requireTests: true,
    securityScan: true,
  },
  useRealAPI: true,
});

console.log(`Quality Score: ${reviewResult.data.qualityScore}/100`);
console.log(`Passed: ${reviewResult.data.passed ? '✅' : '❌'}`);

// 4. Create Pull Request
if (reviewResult.data.passed) {
  const prResult = await prAgent.create({
    issueNumber: 42,
    repository: "my-repo",
    owner: "my-org",
    files: codeResult.data.files,
    qualityReport: reviewResult.data,
    useRealAPI: true,
  });

  console.log(`PR created: ${prResult.data.url}`);
}
```

---

## Architecture

### 識学理論 (Shikigaku Theory) Principles

1. **責任の明確化** (Responsibility Clarification)
   - Each agent has a single, well-defined responsibility
   - IssueAgent: Issue analysis only
   - CodeGenAgent: Code generation only
   - ReviewAgent: Quality assessment only
   - PRAgent: PR creation only

2. **権限の委譲** (Authority Delegation)
   - CoordinatorAgent delegates tasks to specialist agents
   - Specialists have full authority within their domain
   - No overlapping responsibilities

3. **階層の設計** (Hierarchical Design)
   - **Coordinator Layer** (P0): CoordinatorAgent
   - **Specialist Layer** (P1): IssueAgent, CodeGenAgent, ReviewAgent, PRAgent
   - **Extended Layer** (P2): TestAgent

4. **結果の評価** (Result Evaluation)
   - Quality scoring (0-100 scale)
   - Test coverage measurement
   - PR review pass/fail determination
   - Budget tracking and cost analysis

5. **曖昧性の排除** (Ambiguity Elimination)
   - Strict TypeScript types
   - Clear interfaces (`AgentInput`, `AgentOutput`)
   - Explicit success/failure states

### Agent Overview

| Agent | Responsibility | Authority | Input | Output |
|-------|---------------|-----------|-------|--------|
| **CoordinatorAgent** | Task decomposition & orchestration | DAG generation, parallel execution control | Issue data | Task graph, parallel groups |
| **IssueAgent** | Issue analysis & classification | Label application, complexity estimation | Issue number | Issue type, priority, complexity, labels |
| **CodeGenAgent** | Code generation | File creation/modification, test scaffolding | Requirements, context | Generated files, tests, quality self-assessment |
| **ReviewAgent** | Quality assessment | Pass/fail determination, security scanning | Generated files | Quality score, coverage, issues, suggestions |
| **PRAgent** | Pull request creation | Branch creation, file commits, PR creation | Files, quality report | PR number, URL, branch |
| **TestAgent** | Test execution | Test running, coverage measurement | Repository, branch | Test results, coverage percentage |

---

## API Reference

### IssueAgent

Analyzes GitHub issues using Claude Sonnet 4 to determine type, priority, complexity, and related files.

```typescript
interface IssueInput {
  issueNumber: number;
  repository: string;
  owner: string;
  useRealAPI?: boolean;  // Default: false (mock mode)
  anthropicClient?: AnthropicClient;
  githubClient?: GitHubClient;
}

interface IssueOutput {
  success: boolean;
  data?: IssueData & {
    tokensUsed?: { input: number; output: number };
    cost?: number;  // USD
  };
  error?: string;
}
```

### CodeGenAgent

Generates code using Claude Sonnet 4 based on requirements and existing codebase context.

```typescript
interface CodeGenInput {
  taskId: string;
  requirements: string;
  context: {
    repository: string;
    owner: string;
    baseBranch: string;
    relatedFiles: string[];
  };
  language?: "typescript" | "rust" | "python" | "go";
  useRealAPI?: boolean;
  anthropicClient?: AnthropicClient;
  githubClient?: GitHubClient;
}

interface CodeGenOutput {
  success: boolean;
  data?: {
    files: GeneratedFile[];        // Generated source files
    tests: GeneratedFile[];        // Generated test files
    qualityScore: number;          // Self-assessment (0-100)
    tokensUsed?: { input: number; output: number };
    cost?: number;  // USD
  };
  error?: string;
}
```

### ReviewAgent

Reviews generated code using Claude Sonnet 4 to assess quality, security, and test coverage.

```typescript
interface ReviewInput {
  files: GeneratedFile[];
  standards: {
    minQualityScore: number;      // Default: 80
    requireTests: boolean;
    securityScan: boolean;
  };
  useRealAPI?: boolean;
  anthropicClient?: AnthropicClient;
}

interface ReviewOutput {
  success: boolean;
  data?: QualityReport & {
    tokensUsed?: { input: number; output: number };
    cost?: number;  // USD
  };
  error?: string;
}
```

### PRAgent

Creates GitHub pull requests with generated code using Git Tree API for atomic commits.

```typescript
interface PRInput {
  issueNumber: number;
  repository: string;
  owner: string;
  files: GeneratedFile[];
  qualityReport: QualityReport;
  baseBranch?: string;  // Default: "main"
  useRealAPI?: boolean;
  githubClient?: GitHubClient;
}

interface PROutput {
  success: boolean;
  data?: PullRequest;
  error?: string;
}
```

---

## Testing

### Mock Tests (Free, No API Calls)

```bash
# Run mock E2E tests
pnpm test:e2e
```

### Real API Tests (Requires API Keys)

```bash
# Set environment variables
export ANTHROPIC_API_KEY="sk-ant-your-key"
export GITHUB_TOKEN="ghp_your-token"
export TEST_REPO="miyabi-e2e-test"
export TEST_OWNER="YourGitHubUsername"

# Run all E2E scenarios with real APIs
pnpm test:e2e:real

# Run specific scenario
pnpm test:e2e:real -- --scenario 1
```

See [E2E_REAL_API_TESTING.md](./E2E_REAL_API_TESTING.md) for detailed testing guide.

---

## Configuration

### Environment Variables

```bash
# Required for real API mode
ANTHROPIC_API_KEY=sk-ant-...    # Claude Sonnet 4 API key
GITHUB_TOKEN=ghp_...            # GitHub personal access token

# Optional configuration
MIYABI_BUDGET_MONTHLY=50        # Monthly budget in USD (default: 50)
MIYABI_MAX_PARALLEL=3           # Max parallel task execution (default: 3)
MIYABI_QUALITY_THRESHOLD=80     # Minimum quality score (default: 80)
MIYABI_COVERAGE_THRESHOLD=80    # Minimum test coverage % (default: 80)
```

### API Pricing

**Claude Sonnet 4** (as of 2025-01):
- Input: $3 / 1M tokens
- Output: $15 / 1M tokens

**Estimated Costs**:
- Issue analysis: $0.02-0.05
- Code generation: $0.10-0.30
- Code review: $0.05-0.15
- **Total per issue**: $0.17-0.50

**GitHub API**:
- Free for authenticated users (5000 requests/hour)
- Rate limiting handled automatically

---

## Phase 8: Real API Integration ✅ Complete

### What's New in Phase 8

**Phase 8-1: Claude Sonnet 4 Integration**
- ✅ AnthropicClient implementation
- ✅ IssueAgent real API integration
- ✅ Token usage and cost tracking

**Phase 8-2: GitHub API Integration**
- ✅ GitHubClient implementation with Octokit
- ✅ CodeGenAgent, ReviewAgent, PRAgent real API integration
- ✅ Git Tree API for atomic commits
- ✅ Rate limit protection

**Phase 8-3: E2E Testing with Real APIs**
- ✅ E2ETestHarness hybrid mode (mock + real API)
- ✅ Real API test runner with validation
- ✅ Comprehensive testing documentation

---

## Development

### Build

```bash
pnpm run build
```

### Watch Mode

```bash
pnpm run dev
```

### Lint

```bash
pnpm run lint
```

---

## Project Status

- ✅ **Phase 0-7**: Foundation complete (MCP Server, 6 Agents, E2E Tests)
- ✅ **Phase 8**: Real API integration complete
- ⏭️ **Phase 9**: DeploymentAgent (7th agent) - Planned
- ⏭️ **Phase 10**: Production deployment - Planned

**Current Version**: 0.1.0
**Status**: Production Ready (Phase 8 Complete)

---

## License

Apache License 2.0 - See [LICENSE](../../LICENSE) for details.

**Important**: This project is a fork of OpenAI's Codex CLI. See [LICENSE_COMPLIANCE_GUIDE.md](../../LICENSE_COMPLIANCE_GUIDE.md) for compliance requirements.

---

## Links

- **Main Documentation**: [MIYABI_INTEGRATION_SUMMARY.md](../../MIYABI_INTEGRATION_SUMMARY.md)
- **E2E Testing Guide**: [E2E_REAL_API_TESTING.md](./E2E_REAL_API_TESTING.md)
- **Integration Plan**: [INTEGRATION_PLAN_MIYABI.md](../../INTEGRATION_PLAN_MIYABI.md)
- **License Compliance**: [LICENSE_COMPLIANCE_GUIDE.md](../../LICENSE_COMPLIANCE_GUIDE.md)

---

**Generated**: 2025-10-10
**Phase**: 8 Complete
**Author**: Claude Code + Shikigaku AI
