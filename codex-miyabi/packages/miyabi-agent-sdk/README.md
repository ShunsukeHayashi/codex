# Miyabi Autonomous Agent SDK

**Autonomous Development Framework based on 識学理論 (Shikigaku Theory)**

A production-ready TypeScript SDK implementing 6 specialized AI agents that autonomously analyze GitHub issues, generate code, review quality, and create pull requests using Claude Sonnet 4 and GitHub APIs.

---

## Features

- **6 Specialized Agents**: Issue analysis, code generation, review, PR creation, testing, and coordination
- **Hybrid API Integration**: Claude Sonnet 4 (Anthropic), Local Claude Code CLI, and GitHub API (Octokit)
- **🆕 Phase 9**: Local Claude Code CLI integration - **100% cost reduction** for agent operations
- **識学理論 Principles**: Clear responsibility, authority delegation, hierarchical design
- **Quality Gates**: 80+ quality score threshold, 80%+ test coverage requirement
- **Economic Management**: Budget tracking with circuit breaker pattern
- **E2E Testing**: Comprehensive test framework with both mock and real API modes
- **CLI Tool**: User-friendly `miyabi` command-line interface
- **Type-Safe**: Strict TypeScript with complete type definitions

---

## Quick Start

### Installation

#### Option 1: Global CLI Installation (Recommended)

```bash
# Install Miyabi CLI globally
pnpm install -g @codex-miyabi/agent-sdk

# Or use npm
npm install -g @codex-miyabi/agent-sdk

# Verify installation
miyabi help
```

#### Option 2: Local Development Setup

```bash
cd packages/miyabi-agent-sdk
pnpm install
pnpm run build

# Use local CLI
pnpm exec miyabi help
```

#### Option 3: Use without Installation (npx)

```bash
# Run directly with npx (no installation needed)
npx @codex-miyabi/agent-sdk analyze 42 --repo owner/repo
```

### Using Miyabi CLI (Recommended for Quick Start)

```bash
# Set environment variables
export GITHUB_TOKEN="ghp_xxx"
export ANTHROPIC_API_KEY="sk-ant-xxx"  # Optional: only for --use-anthropic-api

# Analyze GitHub Issue using local Claude Code CLI (FREE!)
miyabi analyze 42 --repo owner/repo

# Analyze using Anthropic API (paid)
miyabi analyze 42 --repo owner/repo --use-anthropic-api

# Generate code for an issue
miyabi generate 42 --repo owner/repo

# Review code files
miyabi review src/index.ts src/utils.ts

# Run full workflow (analyze → generate → review → PR)
miyabi workflow 42 --repo owner/repo

# Show help
miyabi help
```

**CLI Features:**
- 🆓 **Free by default**: Uses local Claude Code CLI (no API costs)
- 💰 **Optional paid mode**: Switch to Anthropic API with `--use-anthropic-api`
- ⚡ **Fast**: Direct command-line execution
- 📊 **Detailed output**: Token usage, cost tracking, and quality metrics

### Programmatic Usage (SDK)

```typescript
import { IssueAgent, CodeGenAgent, ReviewAgent, PRAgent } from "@codex-miyabi/agent-sdk";

// Option 1: Use local Claude Code CLI (FREE, default)
const issueAgent = new IssueAgent({
  useClaudeCode: true,  // Use local Claude Code CLI (no API cost)
  githubToken: process.env.GITHUB_TOKEN,
});

// Option 2: Use Anthropic API (paid)
const issueAgent = new IssueAgent({
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  githubToken: process.env.GITHUB_TOKEN,
});

// Option 1: Use local Claude Code CLI (FREE, recommended)
const codeGenAgent = new CodeGenAgent({
  useClaudeCode: true,
  githubToken: process.env.GITHUB_TOKEN,
});

const reviewAgent = new ReviewAgent({
  useClaudeCode: true,
});

// Option 2: Use Anthropic API (paid)
// const codeGenAgent = new CodeGenAgent({
//   anthropicApiKey: process.env.ANTHROPIC_API_KEY,
//   githubToken: process.env.GITHUB_TOKEN,
// });
//
// const reviewAgent = new ReviewAgent({
//   anthropicApiKey: process.env.ANTHROPIC_API_KEY,
// });

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
  claudeCodeClient?: ClaudeCodeClient;  // Phase 9: Local Claude Code CLI
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
  claudeCodeClient?: ClaudeCodeClient;  // Phase 9: Local Claude Code CLI
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
  claudeCodeClient?: ClaudeCodeClient;  // Phase 9: Local Claude Code CLI
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

## Phase 9: Claude Code CLI Integration ✅ Complete

### 🆕 What's New in Phase 9

**Phase 9-1: Local Claude Code CLI Integration**
- ✅ ClaudeCodeClient implementation (279 lines)
- ✅ Local `codex exec` command wrapper
- ✅ **100% cost reduction** - No external API fees
- ✅ Issue analysis, code generation, and review support

**Phase 9-2: Agent Hybrid Architecture**
- ✅ IssueAgent: Claude Code + Anthropic API support
- ✅ CodeGenAgent: Claude Code + Anthropic API support
- ✅ ReviewAgent: Claude Code + Anthropic API support
- ✅ Seamless switching between free/paid modes

**Phase 9-3: Miyabi CLI Tool**
- ✅ User-friendly `miyabi` command-line interface (412 lines)
- ✅ Commands: `analyze`, `generate`, `review`, `workflow`
- ✅ Free by default (uses Claude Code CLI)
- ✅ Optional `--use-anthropic-api` flag for paid mode

**Phase 9-4: Enhanced JSON Parsing**
- ✅ AnthropicClient: 4 fallback patterns for robust parsing
- ✅ Handles markdown code blocks (` ```json ... ``` `)
- ✅ E2E tested with real API responses

### Cost Comparison (Phase 9 vs Phase 8)

| Operation | Phase 8 (Anthropic API) | Phase 9 (Claude Code CLI) | Savings |
|-----------|------------------------|---------------------------|---------|
| Issue Analysis | $0.0045/request | **$0.00** | 100% |
| Code Generation | ~$0.50/request | **$0.00** | 100% |
| Code Review | ~$0.10/request | **$0.00** | 100% |
| **Monthly (100 requests)** | **~$60** | **$0** | **$60/month** |

### Architecture: Hybrid API Design

```
User Request
    ↓
Miyabi CLI / SDK
    ↓
Agent (IssueAgent, CodeGenAgent, ReviewAgent)
    ↓
┌─────────────────────────────────────┐
│   Priority Selection Logic          │
│                                     │
│  1. ClaudeCodeClient (if configured) │  ← FREE, Local
│  2. AnthropicClient (if configured)  │  ← Paid, API
│  3. Mock Implementation              │  ← Testing
└─────────────────────────────────────┘
    ↓
Response
```

### Example: Free vs Paid Mode

```typescript
// FREE Mode (Phase 9): Use local Claude Code CLI
const agent = new IssueAgent({
  useClaudeCode: true,  // Default behavior
  githubToken: process.env.GITHUB_TOKEN,
});

// PAID Mode (Phase 8): Use Anthropic API
const agent = new IssueAgent({
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  githubToken: process.env.GITHUB_TOKEN,
});
```

### CLI Example Output

```bash
$ miyabi analyze 1 --repo ShunsukeHayashi/miyabi-e2e-test

🔍 Analyzing Issue #1...

✅ Analysis complete!

Title: 🐛 Bug: Fix typo in README.md
Type: docs
Priority: P3
Complexity: small

Labels:
  - 🏷️ type:docs
  - 🎯 priority:P3-Low
  - 📊 complexity:small
  - 📚 docs:readme
  - 📈 impact:fix

Tokens: 610 in, 176 out
Cost: $0.0000  # FREE when using Claude Code CLI!
```

---

## Troubleshooting

### Common Issues

#### `codex: command not found` error

The SDK requires Claude Code CLI to be installed for free mode. Install it using:

```bash
# Install Claude Code CLI
npm install -g @anthropic/claude-code

# Verify installation
codex --version
```

Alternatively, use the paid Anthropic API mode:

```bash
miyabi analyze 42 --repo owner/repo --use-anthropic-api --anthropic-key sk-ant-xxx
```

#### JSON parse errors

If you encounter JSON parsing errors when using Anthropic API:

1. **Update to latest version** - Phase 9-4 includes enhanced JSON parsing with 4 fallback patterns
2. **Check API response** - Enable debug logging to see raw responses
3. **Use Claude Code CLI** - Switch to free mode which has better parsing

```typescript
// Enable debug logging
process.env.DEBUG = "miyabi:*";
```

#### GitHub API rate limits

The SDK automatically handles GitHub API rate limits with exponential backoff. For high-volume usage:

1. **Use a GitHub token** - Increases limit from 60 to 5000 requests/hour
2. **Check rate limit status**:

```bash
gh api rate_limit
```

3. **Implement request batching** - Combine multiple operations where possible

#### Memory issues with large codebases

When analyzing large repositories:

1. **Limit related files** - Only include files directly relevant to the issue
2. **Use file filtering** - Specify exact file paths instead of glob patterns
3. **Increase Node.js memory**:

```bash
NODE_OPTIONS="--max-old-space-size=4096" miyabi generate 42 --repo owner/repo
```

### FAQ

**Q: What's the difference between Claude Code CLI and Anthropic API?**
A: Claude Code CLI runs locally (free, no API costs), while Anthropic API uses cloud-based Claude Sonnet 4 (paid, ~$0.50/request). Both provide similar quality results.

**Q: Can I use both modes in the same project?**
A: Yes! Use free mode for development/testing and paid mode for production where cost is less critical.

**Q: How do I contribute to the SDK?**
A: See our [Contributing Guide](../../CONTRIBUTING.md) and [Phase 10 roadmap](https://github.com/ShunsukeHayashi/codex/issues/15).

**Q: What's the minimum Node.js version required?**
A: Node.js >= 22.0.0 (specified in package.json engines)

**Q: How do I report bugs or request features?**
A: Open an issue at https://github.com/ShunsukeHayashi/codex/issues

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
- ✅ **Phase 8**: Real API integration complete (Anthropic API + GitHub API)
- ✅ **Phase 9**: Claude Code CLI integration complete (100% cost reduction!)
- ⏭️ **Phase 10**: Production deployment - Planned

**Current Version**: 0.2.0
**Status**: Production Ready (Phase 9 Complete)

**Phase 9 Highlights:**
- 🆓 **Free local execution** via Claude Code CLI
- 💰 **$60/month savings** for typical usage (100 requests/month)
- 🔄 **Hybrid architecture** supporting both free and paid modes
- 🛠️ **Miyabi CLI tool** for easy command-line usage

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

## Contact & Support

### 📧 Get in Touch

Have questions, feedback, or need assistance?

**📅 Book a Meeting**: [Schedule a call with our team](https://customer-cloud.jp.larksuite.com/scheduler/0f3b79b2b065aaa8)

**🐛 Report Issues**: [GitHub Issues](https://github.com/ShunsukeHayashi/codex/issues)

**💬 Discussions**: [GitHub Discussions](https://github.com/ShunsukeHayashi/codex/discussions)

We're here to help you get the most out of Miyabi Autonomous Agent SDK!

---

**Generated**: 2025-10-10
**Phase**: 9 Complete
**Author**: Claude Code + Shikigaku AI
