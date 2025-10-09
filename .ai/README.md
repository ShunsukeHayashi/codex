# .ai/ - AI-Driven Development Operations

This directory contains execution plans, milestones, task DAGs, and operational documentation for the **Codex Agentic** integration project.

## 📁 Directory Structure

```
.ai/
├── README.md                                # This file
├── milestones-integration-miyabi.yml        # Master milestone definition
│
├── execution-plans/                         # Detailed phase implementation plans
│   ├── phase-0-environment-setup.md
│   ├── phase-1-mcp-server.md
│   ├── phase-2-agent-integration.md         # (To be created)
│   ├── phase-3-github-integration.md        # (To be created)
│   ├── phase-4-typescript-sdk.md            # (To be created)
│   ├── phase-5-documentation-ui.md          # (To be created)
│   └── phase-6-security-features.md         # (To be created)
│
├── issues/                                  # GitHub issue templates and plans
│   └── (Created dynamically by agents)
│
├── logs/                                    # Execution logs
│   └── command-history.jsonl                # Claude Code command logs
│
└── prompts/                                 # Agent prompts and templates
    └── (Agent-specific prompts)
```

---

## 🎯 Project Overview

**Project Name**: Codex Agentic
**Integration**: OpenAI Codex CLI + Miyabi Autonomous Framework
**Total Phases**: 7 (Phase 0-6)
**Estimated Duration**: 32 days (22 days with parallelization)
**Efficiency Gain**: 31%

### Integration Goals

1. **Hybrid Architecture**: Rust (Codex CLI) + TypeScript (Miyabi agents)
2. **MCP Integration**: Model Context Protocol for agent communication
3. **Multi-Agent System**: 7 specialist agents with parallel execution
4. **GitHub Automation**: Complete Issue → PR workflow automation
5. **Security Hardening**: Comprehensive scanning and compliance

---

## 📊 Milestones

| ID | Name | Trigger | Days | Approval | Status |
|----|------|---------|------|----------|--------|
| M0 | Development Environment Ready | Phase 0 | 2 | No | ⏳ Pending |
| M1 | MCP Server Operational | Phase 1 | 7 | ✓ Yes | ⏳ Pending |
| M2 | Multi-Agent System Active | Phase 2 | 14 | ✓ Yes | ⏳ Pending |
| M3 | GitHub Integration Complete | Phase 3 | 19 | No | ⏳ Pending |
| M4 | TypeScript SDK Published | Phase 4 | 23 | No | ⏳ Pending |
| M5 | Documentation & UI Complete | Phase 5 | 26 | No | ⏳ Pending |
| M6 | Security Hardened | Phase 6 | 32 | ✓ Yes | ⏳ Pending |

**Legend**: ✓ = Guardian approval required

---

## 🏗️ Phase Dependencies (DAG)

```
Phase 0: Environment Setup
    ↓
Phase 1: MCP Server
    ↓
Phase 2: Agent Integration
    ↓
    ├─→ Phase 3: GitHub Integration (parallel)
    └─→ Phase 4: TypeScript SDK (parallel)
         ↓
Phase 5: Documentation & UI
    ↓
Phase 6: Security Features
```

**Critical Path**: Phase 0 → 1 → 2 → 3 → 5 → 6 (29 days)

---

## 🤖 Agent Assignments

| Agent | Phases | Estimated Days |
|-------|--------|----------------|
| SetupAgent | Phase 0 | 2 |
| MCPAgent | Phase 1 | 5 |
| IntegrationAgent | Phase 2 | 7 |
| GitHubAgent | Phase 3 | 5 |
| SDKAgent | Phase 4 | 4 |
| DocAgent | Phase 5 | 3 |
| SecurityAgent | Phase 6 | 7 |
| **Support Agents** | | |
| ReviewAgent | All phases (PR review) | Continuous |
| TestAgent | All phases (testing) | Continuous |

---

## 📋 Execution Plans

Detailed implementation plans are available in `execution-plans/`:

### Phase 0: Environment Setup (2 days)
- **File**: `execution-plans/phase-0-environment-setup.md`
- **Tasks**: 10 tasks (480 minutes)
- **Agent**: SetupAgent
- **Deliverables**: Rust + TypeScript build environment ready

### Phase 1: MCP Server (5 days)
- **File**: `execution-plans/phase-1-mcp-server.md`
- **Tasks**: 12 tasks
- **Agent**: MCPAgent
- **Deliverables**: MCP server with 5 tools operational

### Phase 2: Agent Integration (7 days)
- **File**: `execution-plans/phase-2-agent-integration.md` (To be created)
- **Agent**: IntegrationAgent
- **Deliverables**: 7 agents + coordination logic

### Phase 3: GitHub Integration (5 days)
- **File**: `execution-plans/phase-3-github-integration.md` (To be created)
- **Agent**: GitHubAgent
- **Deliverables**: Projects V2, label system, Issue/PR automation

### Phase 4: TypeScript SDK (4 days)
- **File**: `execution-plans/phase-4-typescript-sdk.md` (To be created)
- **Agent**: SDKAgent
- **Deliverables**: Programmatic API for Codex Agentic

### Phase 5: Documentation & UI (3 days)
- **File**: `execution-plans/phase-5-documentation-ui.md` (To be created)
- **Agent**: DocAgent
- **Deliverables**: Complete documentation, enhanced TUI

### Phase 6: Security Features (7 days)
- **File**: `execution-plans/phase-6-security-features.md` (To be created)
- **Agent**: SecurityAgent
- **Deliverables**: Security scans, SBOM, compliance

---

## 🔍 Guardian Checkpoints

### M1: MCP Server Operational (Day 7)
**Approver**: @ShunsukeHayashi
**Checklist**:
- [ ] MCP server starts successfully
- [ ] All tools respond to requests
- [ ] Performance acceptable (<100ms)
- [ ] Integration tests passing

### M2: Multi-Agent System Active (Day 14)
**Approver**: @ShunsukeHayashi
**Checklist**:
- [ ] All 7 agents functional
- [ ] Coordination working
- [ ] Parallel execution efficient (≥70%)
- [ ] Test coverage ≥80%

### M6: Security Hardened (Day 32)
**Approver**: @ShunsukeHayashi (Security Lead)
**Severity**: Sev.1-Critical
**Checklist**:
- [ ] All security scans operational
- [ ] Zero critical/high vulnerabilities
- [ ] SBOM generated successfully
- [ ] License compliance verified
- [ ] Ready for initial release

---

## ⚙️ Usage

### View Master Milestones
```bash
cat .ai/milestones-integration-miyabi.yml
```

### View Phase Details
```bash
cat .ai/execution-plans/phase-0-environment-setup.md
cat .ai/execution-plans/phase-1-mcp-server.md
```

### Execute Phase
```bash
# From project root
/phase 0  # Start Phase 0
/phase 1  # Start Phase 1 (after M0)
```

### Check Logs
```bash
tail -f .ai/logs/command-history.jsonl
```

---

## 📈 Progress Tracking

Track progress via:
- **GitHub Milestones**: M0-M6
- **GitHub Issues**: One issue per phase
- **GitHub Projects V2**: Real-time Kanban board
- **This directory**: Detailed execution status

---

## 🔗 Related Documentation

- **Project README**: `/README.md`
- **Integration Plan**: `/INTEGRATION_PLAN_MIYABI.md`
- **Agent Operations**: `/AGENTS_OPERATION_PLAN.md`
- **License Compliance**: `/LICENSE_COMPLIANCE_GUIDE.md`
- **Claude Code Config**: `/.claude/README.md`

---

## 📊 Statistics

- **Total Phases**: 7
- **Total Days (Sequential)**: 32
- **Total Days (Optimized)**: 22
- **Efficiency Gain**: 31%
- **Critical Path**: 29 days
- **Guardian Checkpoints**: 3
- **Total Agents**: 9 (7 specialist + 2 support)

---

**Last Updated**: 2025-10-10
**Generated by**: Claude (Sonnet 4.5)
**Project**: Codex Agentic

**Status**: Planning Phase Complete ✅
**Next Action**: Create GitHub Milestones & Issues → Start Phase 0
