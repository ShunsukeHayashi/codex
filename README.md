# Codex Agentic

**AI Agent Orchestration Platform - Where Local Intelligence Meets Autonomous Collaboration**

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Rust](https://img.shields.io/badge/rust-%23000000.svg?style=flat&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## 🎯 What is Codex Agentic?

**Codex Agentic** integrates **Codex CLI** (OpenAI's local coding agent) with **Miyabi** (autonomous development framework) to create a next-generation AI agent orchestration platform.

### Integration Value

```
Codex CLI (Rust)          +          Miyabi (TypeScript)
Local Coding Agent                Multi-Agent Framework
                                  GitHub Integration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                          ↓
            Codex Agentic Platform
      Local + Cloud Collaborative AI Agents
         Issue → PR Complete Automation
     Hierarchical Agent Organization
```

### Core Features

#### 🤖 Multi-Agent Collaboration
- **7 Specialized Agents**: Coordinator, Issue Analysis, Code Generation, Review, PR Creation, Deployment, Testing
- **Parallel Execution Engine**: DAG-based dependency resolution
- **5 Organizational Principles**: Clear responsibility, authority, hierarchy, results, and unambiguity

#### 🔗 Complete GitHub Integration
- **Projects V2**: Real-time progress management
- **53 Label System**: State-based workflow management
- **26 GitHub Actions**: Complete automation workflows

#### 🛠️ Developer Experience
- **Rust + TypeScript**: Hybrid architecture
- **MCP Protocol**: Model Context Protocol integration
- **Ratatui TUI**: Beautiful terminal interface

#### 📊 Automation
- Issue → Code Generation → Review → PR Creation → Deployment
- Auto-documentation generation (TypeScript/JavaScript AST analysis)
- KPI dashboard & weekly report generation

---

## 🚀 Quick Start

### Installation

```bash
# via npm (recommended)
npm install -g @openai/codex

# or Homebrew
brew install codex

# Run
codex
```

### Using Miyabi Features

```bash
# GitHub Issue Analysis
codex "Analyze GitHub issue #42 and suggest labels"

# Issue → PR Automation
codex "Create PR for issue #42 with automated code generation"

# Project Status Check
codex "Show GitHub project status with KPI metrics"
```

### TypeScript SDK Usage

```typescript
import { Codex } from "@openai/codex-sdk";
import { MiyabiAgents } from "@openai/codex-sdk/miyabi";

const codex = new Codex();
const miyabi = new MiyabiAgents({
  githubToken: process.env.GITHUB_TOKEN!,
});

// Issue analysis
const analysis = await miyabi.analyzeIssue(42);
console.log(`Labels: ${analysis.labels.join(", ")}`);

// Parallel agent execution
const result = await miyabi.runParallel({
  issue: 42,
  agents: ["codegen", "review", "pr"],
  concurrency: 3,
});

console.log(`PR created: ${result.pr_url}`);
```

---

## 📚 Documentation

### Integration Documentation (New)
- [**Integration Plan**](INTEGRATION_PLAN_MIYABI.md) - Technical specifications and implementation guide
- [**Agent Operations Plan**](AGENTS_OPERATION_PLAN.md) - Multi-agent collaborative operations
- [**Project Guide (CLAUDE.md)**](CLAUDE.md) - Claude Code configuration

### Codex CLI (Existing)
- [**Getting started**](./docs/getting-started.md) - CLI usage
- [**Sandbox & approvals**](./docs/sandbox.md) - Security sandbox
- [**Authentication**](./docs/authentication.md) - Authentication methods
- [**Configuration**](./docs/config.md) - Configuration options
- [**TypeScript SDK**](./sdk/typescript/README.md) - Programmatic usage
- [**Advanced**](./docs/advanced.md) - MCP, tracing, etc.

### For Developers
- [**Contributing**](./docs/contributing.md) - Contribution guide
- [**Install & build**](./docs/install.md) - Build from source
- [**FAQ**](./docs/faq.md) - Frequently asked questions

---

## 🏗️ Architecture

### Hybrid Structure

```
codex/
├── codex-rs/                    # Rust core (existing)
│   ├── cli/                     # Main CLI
│   ├── core/                    # Business logic
│   ├── tui/                     # Ratatui TUI
│   ├── exec/                    # Headless execution
│   ├── mcp-client/              # MCP client
│   └── mcp-server/              # MCP server
│
├── codex-miyabi/                # Miyabi integration (new)
│   ├── packages/
│   │   ├── miyabi-mcp-server/  # MCP server implementation
│   │   ├── miyabi-agent-sdk/   # Agent SDK
│   │   ├── github-integration/ # GitHub API integration
│   │   └── doc-generator/      # Documentation generator
│   ├── agents/                  # 7 specialized agents
│   └── scripts/                 # Operation scripts
│
└── sdk/typescript/              # TypeScript SDK (existing)
    └── src/miyabi/              # Miyabi API wrapper (new)
```

### MCP Integration

```
Codex CLI (Rust)
    ↓
Codex Core
    ↓
MCP Client ─────[MCP Protocol]────→ Miyabi MCP Server
                                        ↓
                              ┌─────────┴─────────┐
                        CoordinatorAgent    GitHub API
                              ↓
                    ┌─────────┴─────────┐
              IssueAgent  CodeGenAgent  ReviewAgent
                              ↓
                          PRAgent
```

---

## 🤖 Agent System

### Hierarchical Agent Architecture

```
🔴 Coordinator Layer (Decision Authority)
  └─ CoordinatorAgent
     ├─ Task decomposition
     ├─ Agent selection
     └─ Execution monitoring

🔵 Specialist Layer (Execution Authority)
  ├─ IssueAgent        # Issue analysis & labeling
  ├─ CodeGenAgent      # Code generation
  ├─ ReviewAgent       # Code review
  ├─ PRAgent           # PR creation
  ├─ DeploymentAgent   # Deployment management
  ├─ TestAgent         # Test execution
  └─ GitHubAgent       # GitHub operations

🟢 Support Layer (Assistance)
  └─ DocAgent          # Documentation generation
```

### Agent Execution Examples

```bash
# Issue Analysis (IssueAgent)
codex "Analyze issue #42"
# → Auto-label with 53 label system
# → Determine priority, type, and phase

# Code Generation (CodeGenAgent)
codex "Generate code for issue #42"
# → Task decomposition
# → Dependency analysis
# → Code generation

# Quality Review (ReviewAgent)
codex "Review PR #123"
# → Static analysis (ESLint/Clippy)
# → Security scanning
# → Quality scoring (0-100)

# Parallel Execution (CoordinatorAgent)
codex "Process issue #42 with all agents in parallel"
# → DAG-based dependency resolution
# → Parallel execution (max 3 concurrent)
# → Result aggregation
```

---

## 🎓 Usage Examples

### Example 1: Complete Issue → PR Automation

```bash
# Single command
codex "Process GitHub issue openai/codex#42 from analysis to PR"

# Internal flow:
# 1. IssueAgent: Analyze & label
# 2. CoordinatorAgent: Task decomposition
# 3. CodeGenAgent: Code generation (parallel)
# 4. ReviewAgent: Code review (parallel)
# 5. PRAgent: Create draft PR
# 6. TUI: Real-time progress display
```

### Example 2: Auto-Documentation Generation

```bash
# Generate documentation from TypeScript/JavaScript code
codex "Generate API documentation for ./src directory"

# Output:
# - API.md (Markdown)
# - Training materials (for AI)
# - GitHub Discussions post
```

### Example 3: Project Management

```bash
# GitHub Projects V2 status check
codex "Show project status for 'Codex Development'"

# TUI display:
# ┌─────────────────────────────┐
# │ Codex Development Status    │
# ├─────────────────────────────┤
# │ ⏳ Pending:       5 issues  │
# │ ⚡ In Progress:   3 issues  │
# │ 🔍 Review:        2 issues  │
# │ ✅ Done:         42 issues  │
# │                             │
# │ 📊 Quality Score: 85/100    │
# │ 🧪 Coverage:      83%       │
# └─────────────────────────────┘
```

---

## ⚙️ Configuration

### MCP Server Configuration

```toml
# ~/.codex/config.toml

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
```

### Miyabi Configuration

```toml
[miyabi]
enabled = true
monthly_budget_usd = 500

[miyabi.thresholds]
warning = 0.8      # 80% warning
emergency = 1.5    # 150% emergency stop

[miyabi.agents]
parallel_concurrency = 3
default_agents = ["issue", "codegen", "review", "pr"]
```

---

## 🔐 Security

### Sandbox Execution

Codex CLI executes all commands in a sandboxed environment:
- **macOS**: Seatbelt (Apple Sandbox)
- **Linux**: Landlock LSM

Details: [Sandbox & approvals](./docs/sandbox.md)

### Security Scanning

Miyabi integration enables automatic:
- **Gitleaks**: Secret scanning
- **CodeQL**: Vulnerability detection
- **npm audit**: Dependency checking
- **SBOM Generation**: CycloneDX format

---

## 🛠️ Development

### Build

```bash
# Rust part
cd codex-rs
cargo build --release

# TypeScript part
cd codex-miyabi
pnpm install
pnpm run build

# All
pnpm run build
```

### Testing

```bash
# Rust
cd codex-rs
cargo test --all-features

# TypeScript
cd codex-miyabi
pnpm run test

# Coverage
pnpm run test:coverage
```

### Coding Standards

- **Rust**: `cargo fmt -- --config imports_granularity=Item`
- **TypeScript**: ESM format, Conventional Commits
- Details: [CLAUDE.md](CLAUDE.md)

---

## 📊 Project Statistics

### Integration Scale

| Component | Language | Crates/Packages |
|-----------|----------|-----------------|
| Codex Core | Rust | 35+ crates |
| Miyabi Integration | TypeScript | 7 packages |
| Agents | TypeScript | 7 agents |

### Feature Coverage

| Feature | Codex CLI | + Miyabi |
|---------|-----------|----------|
| Local Coding | ✅ | ✅ |
| TUI | ✅ | ✅ (enhanced) |
| MCP Client | ✅ | ✅ |
| MCP Server | ✅ | ✅ (Miyabi) |
| GitHub Integration | ⚠️ Basic | ✅ Complete |
| Multi-Agent | ❌ | ✅ |
| Auto-Documentation | ❌ | ✅ |
| Projects V2 | ❌ | ✅ |

---

## 🤝 Contributing

### Contribution Policy

**External contributions** are primarily accepted for **bug fixes** and **security fixes**.

For new features or behavior changes, please **create an issue first** and get approval from OpenAI team members. Unapproved contributions may be closed if they don't align with the roadmap.

Details: [CONTRIBUTING.md](./docs/contributing.md)

### Development Workflow

1. Create an Issue (or comment on existing)
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes (Conventional Commits)
4. Run tests & linting
5. Create Pull Request

### CLA (Contributor License Agreement)

All contributors must accept the **CLA**:

```
I have read the CLA Document and I hereby sign the CLA
```

---

## 📜 License

### Codex CLI (Original Work)

```
Copyright 2025 OpenAI

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

### Miyabi Integration (Derivative Work)

```
Copyright 2025 Shunsuke Hayashi

Licensed under the Apache License, Version 2.0 (the "License").

This work includes Derivative Works based on:
- Codex CLI by OpenAI (Apache-2.0)
- Autonomous-Operations (Miyabi) by Shunsuke Hayashi (MIT)
```

**Modification Notice**:
This repository is a derivative work that integrates **Miyabi** (autonomous development framework) into OpenAI's **Codex CLI**.

Modified files:
- `README.md` - Updated for integration project
- `pnpm-workspace.yaml` - Added Miyabi packages
- `CLAUDE.md` - Added Miyabi integration notes
- New additions: `codex-miyabi/`, `INTEGRATION_PLAN_MIYABI.md`, `AGENTS_OPERATION_PLAN.md`

Original work's attribution and license are preserved in the [LICENSE](LICENSE) file.

---

## 🌟 Acknowledgments

This project builds upon:

- **OpenAI** - Codex CLI development
- **Anthropic** - Claude AI
- **Organizational Design Principles** - Agent architecture foundation
- **Rust Community** - Ratatui, Tokio, and other dependencies
- **TypeScript Community** - All dependencies
- **Open Source Community** - All contributors

---

## 🔗 Links

- **Codex CLI**: https://github.com/openai/codex
- **Miyabi (Autonomous-Operations)**: https://github.com/ShunsukeHayashi/Miyabi
- **OpenAI Developers**: https://developers.openai.com/codex
- **npm Package**: https://www.npmjs.com/package/@openai/codex
- **Documentation**: https://docs.anthropic.com/ (Claude Code)

---

<div align="center">

**🌸 Codex Agentic - Where AI Agents Collaborate**

*"Where Local Intelligence Meets Cloud Collaboration"*

[![GitHub Stars](https://img.shields.io/github/stars/openai/codex?style=social)](https://github.com/openai/codex)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

[Install](#-quick-start) • [Documentation](#-documentation) • [Contribute](#-contributing)

</div>

---

**Generated**: 2025-10-10
**Version**: 0.1.0 (Miyabi Integration)
**Based on**: Codex CLI + Autonomous-Operations (Miyabi)
