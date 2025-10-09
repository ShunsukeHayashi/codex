# Phase 0 Implementation Plan: Environment Setup

## Executive Summary

**Objective**: Set up complete development environment for hybrid Rust+TypeScript Codex Agentic project

**Estimated Duration**: 2 days (16 hours)
**Agent Assignment**: SetupAgent
**Priority**: P0-Immediate
**Severity**: Sev.2-High
**Milestone**: M0 - Development Environment Ready

---

## 1. Task Decomposition (DAG)

```yaml
nodes:
  - id: task-0-1
    title: Verify system prerequisites
    type: setup
    estimatedMinutes: 30
    dependencies: []

  - id: task-0-2
    title: Create codex-miyabi directory structure
    type: setup
    estimatedMinutes: 15
    dependencies: [task-0-1]

  - id: task-0-3
    title: Install Node.js and pnpm
    type: setup
    estimatedMinutes: 30
    dependencies: [task-0-1]

  - id: task-0-4
    title: Install Rust toolchain
    type: setup
    estimatedMinutes: 45
    dependencies: [task-0-1]

  - id: task-0-5
    title: Configure pnpm workspace
    type: feature
    estimatedMinutes: 60
    dependencies: [task-0-2, task-0-3]

  - id: task-0-6
    title: Create package.json for all 7 Miyabi packages
    type: feature
    estimatedMinutes: 120
    dependencies: [task-0-5]

  - id: task-0-7
    title: Install dependencies
    type: setup
    estimatedMinutes: 60
    dependencies: [task-0-6]

  - id: task-0-8
    title: Verify Rust build
    type: test
    estimatedMinutes: 30
    dependencies: [task-0-4]

  - id: task-0-9
    title: Verify TypeScript build
    type: test
    estimatedMinutes: 30
    dependencies: [task-0-7]

  - id: task-0-10
    title: Run baseline tests
    type: test
    estimatedMinutes: 60
    dependencies: [task-0-8, task-0-9]

edges:
  - from: task-0-1, to: [task-0-2, task-0-3, task-0-4]
  - from: task-0-2, to: task-0-5
  - from: task-0-3, to: task-0-5
  - from: task-0-5, to: task-0-6
  - from: task-0-6, to: task-0-7
  - from: task-0-4, to: task-0-8
  - from: task-0-7, to: task-0-9
  - from: task-0-8, to: task-0-10
  - from: task-0-9, to: task-0-10

levels:
  - level: 0
    tasks: [task-0-1]
    parallelism: 1
    description: "Prerequisites verification"

  - level: 1
    tasks: [task-0-2, task-0-3, task-0-4]
    parallelism: 3
    description: "Parallel installation (directory, Node, Rust)"

  - level: 2
    tasks: [task-0-5]
    parallelism: 1

  - level: 3
    tasks: [task-0-6]
    parallelism: 1

  - level: 4
    tasks: [task-0-7, task-0-8]
    parallelism: 2
    description: "Parallel: Install deps + Verify Rust"

  - level: 5
    tasks: [task-0-9]
    parallelism: 1

  - level: 6
    tasks: [task-0-10]
    parallelism: 1
```

---

## 2. Directory Structure

### Target Structure

```
codex/
├── codex-rs/                    # Existing Rust codebase
│   ├── cli/
│   ├── core/
│   ├── tui/
│   └── ... (35+ crates)
│
├── codex-miyabi/                # NEW: Miyabi integration
│   ├── package.json
│   ├── packages/
│   │   ├── miyabi-mcp-server/  # MCP server (Phase 1)
│   │   │   ├── package.json
│   │   │   ├── src/
│   │   │   └── tsconfig.json
│   │   │
│   │   ├── miyabi-agent-sdk/   # Agent SDK (Phase 2)
│   │   │   ├── package.json
│   │   │   ├── src/
│   │   │   └── tsconfig.json
│   │   │
│   │   ├── github-integration/ # GitHub API (Phase 3)
│   │   │   ├── package.json
│   │   │   ├── src/
│   │   │   └── tsconfig.json
│   │   │
│   │   ├── coordinator-agent/  # Agents (Phase 2)
│   │   ├── issue-agent/
│   │   ├── codegen-agent/
│   │   └── review-agent/
│   │
│   ├── agents/                  # Agent configurations
│   ├── scripts/                 # Operation scripts
│   └── docs/                    # Miyabi-specific docs
│
├── sdk/typescript/              # Existing SDK
│   ├── src/
│   │   └── miyabi/              # NEW: Miyabi API wrapper (Phase 4)
│   └── package.json
│
├── pnpm-workspace.yaml          # MODIFIED: Add Miyabi packages
└── .ai/                         # NEW: AI operation files
```

---

## 3. Implementation Steps

### Task 0-1: Verify System Prerequisites (30 min)

**Check existing tools**:
```bash
# Verify Git
git --version  # Should be ≥2.30

# Verify system
uname -a  # macOS (Darwin) confirmed

# Check disk space
df -h .  # Need ≥5GB free
```

### Task 0-2: Create Directory Structure (15 min)

```bash
# Create codex-miyabi structure
mkdir -p codex-miyabi/{packages,agents,scripts,docs}

# Create 7 package directories
cd codex-miyabi/packages
mkdir -p miyabi-mcp-server/src
mkdir -p miyabi-agent-sdk/src
mkdir -p github-integration/src
mkdir -p coordinator-agent/src
mkdir -p issue-agent/src
mkdir -p codegen-agent/src
mkdir -p review-agent/src

# Create .ai directory
cd ../..
mkdir -p .ai/{logs,issues,execution-plans,prompts}
```

### Task 0-3: Install Node.js and pnpm (30 min)

```bash
# Check if Node.js installed
node --version  # Target: v20.x LTS

# If not installed:
# macOS: brew install node@20
# Linux: nvm install 20

# Install pnpm globally
npm install -g pnpm@latest

# Verify pnpm
pnpm --version  # Should be ≥8.0
```

### Task 0-4: Install Rust Toolchain (45 min)

```bash
# Verify Rust installation
rustc --version  # Should be ≥1.75

# Install/update Rust (if needed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install required components
rustup component add rustfmt clippy

# Verify cargo
cargo --version
```

### Task 0-5: Configure pnpm Workspace (60 min)

**Update `pnpm-workspace.yaml`**:
```yaml
packages:
  - "sdk/typescript"
  - "codex-miyabi/packages/*"
```

**Create `codex-miyabi/package.json`**:
```json
{
  "name": "@codex/miyabi-root",
  "version": "0.1.0",
  "private": true,
  "description": "Miyabi integration for Codex Agentic",
  "scripts": {
    "build": "pnpm -r --stream build",
    "test": "pnpm -r --stream test",
    "lint": "pnpm -r --stream lint",
    "typecheck": "pnpm -r --stream typecheck"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0"
  }
}
```

### Task 0-6: Create package.json for All Packages (120 min)

**Example: `packages/miyabi-mcp-server/package.json`**:
```json
{
  "name": "@codex/miyabi-mcp-server",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest",
    "lint": "eslint src",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  }
}
```

**Create for all 7 packages**:
1. miyabi-mcp-server
2. miyabi-agent-sdk
3. github-integration
4. coordinator-agent
5. issue-agent
6. codegen-agent
7. review-agent

### Task 0-7: Install Dependencies (60 min)

```bash
# Install all dependencies
cd codex-miyabi
pnpm install

# This will install dependencies for all packages in the workspace
```

### Task 0-8: Verify Rust Build (30 min)

```bash
# Build Rust codebase
cd codex-rs
cargo build --all-features

# Expected: Success (exit code 0)
# Expected time: ~3-5 minutes (first build)
```

### Task 0-9: Verify TypeScript Build (30 min)

```bash
# Build TypeScript (will fail initially, but checks setup)
cd codex-miyabi
pnpm run build

# Expected: Error (no source files yet), but build system working
```

### Task 0-10: Run Baseline Tests (60 min)

```bash
# Run Rust tests
cd codex-rs
cargo test --all-features

# Expected: All existing tests pass

# Run TypeScript tests (none yet, but verify framework)
cd ../codex-miyabi
pnpm run test

# Expected: 0 tests (packages empty)
```

---

## 4. Success Criteria

### Required Conditions
- [ ] Node.js v20.x installed
- [ ] pnpm ≥8.0 installed
- [ ] Rust ≥1.75 installed
- [ ] pnpm workspace configured
- [ ] All 7 package directories created
- [ ] All package.json files created
- [ ] Dependencies installed successfully
- [ ] Rust build succeeds (`cargo build --all-features`)
- [ ] TypeScript build framework operational
- [ ] Baseline Rust tests pass

### Quality Metrics
- Rust build time: <5 minutes (initial)
- No dependency conflicts
- No version mismatches

---

## 5. Rollout Commands

```bash
# Execute Phase 0 (from project root)
/phase 0

# Or manually:
# 1. Verify prerequisites
node --version && pnpm --version && rustc --version

# 2. Create structure
mkdir -p codex-miyabi/packages/{miyabi-mcp-server,miyabi-agent-sdk,github-integration,coordinator-agent,issue-agent,codegen-agent,review-agent}/src

# 3. Configure workspace
# (Edit pnpm-workspace.yaml)

# 4. Install dependencies
cd codex-miyabi && pnpm install

# 5. Verify builds
cd ../codex-rs && cargo build --all-features
cd ../codex-miyabi && pnpm run build

# 6. Run tests
cd ../codex-rs && cargo test --all-features
```

---

## 6. Troubleshooting

### Issue: Node.js version mismatch
```bash
# Solution: Use nvm
nvm install 20
nvm use 20
```

### Issue: pnpm install fails
```bash
# Solution: Clear cache
pnpm store prune
pnpm install
```

### Issue: Rust build fails
```bash
# Solution: Update Rust
rustup update stable
cargo clean
cargo build
```

---

## 7. Next Steps

After Phase 0 completion:
1. **Verify M0 Milestone**: All success criteria met
2. **Create GitHub Issue #1**: "Phase 0: Environment Setup - Complete"
3. **Start Phase 1**: MCP Server Implementation (MCPAgent)

---

## 8. Time Tracking

| Level | Tasks | Estimated | Actual | Notes |
|-------|-------|-----------|--------|-------|
| 0 | Prerequisites | 30 min | - | |
| 1 | Dir + Node + Rust | 90 min | - | Parallel |
| 2 | pnpm workspace | 60 min | - | |
| 3 | Package.json creation | 120 min | - | |
| 4 | Deps + Rust verify | 90 min | - | Parallel |
| 5 | TS verify | 30 min | - | |
| 6 | Baseline tests | 60 min | - | |
| **Total** | | **480 min (8h)** | - | **Day 1-2** |

---

**Generated**: 2025-10-10
**Agent**: SetupAgent
**Phase**: Phase 0
**Milestone**: M0
