# E2E Real API Testing Guide

**Phase 8-3: Integration Testing with Real Claude Sonnet 4 and GitHub APIs**

This guide explains how to run E2E tests with real APIs to validate the complete Miyabi Autonomous Agent system.

---

## Prerequisites

### 1. API Keys

You need valid API keys for both Anthropic and GitHub:

**Anthropic API Key** (Claude Sonnet 4):
- Sign up at https://console.anthropic.com/
- Create an API key
- Pricing: ~$3/1M input tokens, $15/1M output tokens
- Estimated cost per E2E run: $2-5

**GitHub Token**:
- Go to https://github.com/settings/tokens
- Generate a new token (classic) with these scopes:
  - `repo` (full control of private repositories)
  - `workflow` (update GitHub Action workflows)
- Or use fine-grained token with:
  - Repository access: Read and write
  - Contents: Read and write
  - Issues: Read and write
  - Pull requests: Read and write

### 2. Test Repository

Create a dedicated test repository for E2E testing:

```bash
# Option 1: Using GitHub CLI
gh repo create miyabi-e2e-test --private --description "Miyabi E2E test repository"

# Option 2: Via GitHub web interface
# Go to https://github.com/new
# Repository name: miyabi-e2e-test
# Visibility: Private (recommended for testing)
# Initialize with README: Yes
```

**Important**: Use a separate test repository, NOT your production repository, to avoid cluttering it with test issues and PRs.

### 3. Create Test Issue

Create a simple test issue in your test repository:

```bash
# Using GitHub CLI
gh issue create \
  --repo ShunsukeHayashi/miyabi-e2e-test \
  --title "🐛 Bug: Fix typo in README" \
  --body "README line 3 has typo: 'Codx' should be 'Codex'"

# Note the issue number (e.g., #1)
```

Or create via GitHub web interface:
- Go to `https://github.com/YOUR_USERNAME/miyabi-e2e-test/issues/new`
- Title: `🐛 Bug: Fix typo in README`
- Body: `README line 3 has typo: 'Codx' should be 'Codex'`

---

## Setup

### 1. Install Dependencies

```bash
cd packages/miyabi-agent-sdk
pnpm install
pnpm run build
```

### 2. Set Environment Variables

```bash
# Required: Anthropic API Key
export ANTHROPIC_API_KEY="sk-ant-your-key-here"

# Required: GitHub Token
export GITHUB_TOKEN="ghp_your-token-here"

# Required: Test Repository Name (name only, not full URL)
export TEST_REPO="miyabi-e2e-test"

# Required: GitHub Username or Organization
export TEST_OWNER="ShunsukeHayashi"
```

**Tip**: Add these to your `~/.zshrc` or `~/.bashrc` for persistence:

```bash
# Add to ~/.zshrc
export ANTHROPIC_API_KEY="sk-ant-..."
export GITHUB_TOKEN="ghp_..."
export TEST_REPO="miyabi-e2e-test"
export TEST_OWNER="ShunsukeHayashi"
```

### 3. Verify Configuration

```bash
# Check environment variables are set
echo "Anthropic API Key: ${ANTHROPIC_API_KEY:0:20}..."
echo "GitHub Token: ${GITHUB_TOKEN:0:20}..."
echo "Test Repo: $TEST_OWNER/$TEST_REPO"

# Verify GitHub token works
gh auth status
```

---

## Running E2E Tests

### Run Specific Scenario

```bash
# Scenario 1: Simple Bug Fix (Recommended for first test)
pnpm test:e2e:real -- --scenario 1

# Scenario 2: Medium Feature Addition
pnpm test:e2e:real -- --scenario 2

# Scenario 3: Large Refactoring
pnpm test:e2e:real -- --scenario 3

# Scenario 4: Security Vulnerability (P0-Critical)
pnpm test:e2e:real -- --scenario 4

# Scenario 5: Economic Circuit Breaker
pnpm test:e2e:real -- --scenario 5

# Scenario 6: Parallel Execution Stress Test
pnpm test:e2e:real -- --scenario 6
```

### Run All Scenarios

```bash
# Run all 6 scenarios (estimated cost: $2-5)
pnpm test:e2e:real
```

**Warning**: Running all scenarios will make multiple API calls to both Claude and GitHub. Ensure you understand the costs before proceeding.

---

## Expected Behavior

### Successful Test Run

When a test succeeds, you should see:

```
======================================================================
🚀 Miyabi E2E Tests - REAL API Mode
======================================================================
Repository: ShunsukeHayashi/miyabi-e2e-test
Anthropic API: sk-ant-api3-gBK...
GitHub Token: ghp_dSxHZq4lOi0...
======================================================================

[E2E] Initialized with REAL API mode (Repo: ShunsukeHayashi/miyabi-e2e-test)
Running single scenario: 1 - 単純バグ修正

[E2E] Starting Scenario 1: 単純バグ修正
[E2E] Step 1: IssueAgent analyzing issue...
[AnthropicClient] Issue analyzed: bug, small, P2
[GitHubClient] Added labels to #1: [...]
[E2E] Step 2: CoordinatorAgent creating DAG...
[E2E] DAG created: 3 tasks, 2 parallel groups
[E2E] Step 3: CodeGenAgent generating code...
[AnthropicClient] Code generated: 1 files, quality: 95
[E2E] Code generated: 1 files
[E2E] Step 4: ReviewAgent reviewing code...
[AnthropicClient] Code reviewed: quality 95, PASSED
[E2E] Review complete: Quality 95/100, Coverage 0%
[E2E] Step 6: PRAgent creating PR...
[GitHubClient] Created branch: agent/issue-1-1728561234567 from main
[GitHubClient] Committed 1 files to agent/issue-1-1728561234567
[GitHubClient] Created Draft PR #1: https://github.com/ShunsukeHayashi/miyabi-e2e-test/pull/1
[E2E] PR created: https://github.com/ShunsukeHayashi/miyabi-e2e-test/pull/1

[E2E] Scenario 1: ✅ PASSED
  Duration: 12.34s
  Quality Score: 95/100
  PR: https://github.com/ShunsukeHayashi/miyabi-e2e-test/pull/1
```

### What Happens During Test

1. **IssueAgent**:
   - Fetches real issue from GitHub API
   - Analyzes with Claude Sonnet 4
   - Applies labels to issue via GitHub API

2. **CoordinatorAgent**:
   - Generates task DAG based on issue analysis

3. **CodeGenAgent**:
   - Generates code using Claude Sonnet 4
   - May fetch context files from GitHub (if relatedFiles specified)

4. **ReviewAgent**:
   - Reviews generated code with Claude Sonnet 4
   - Calculates quality score

5. **PRAgent**:
   - Creates real branch via GitHub API
   - Commits files via Git Tree API
   - Creates real Draft PR via GitHub API

### Viewing Results

After successful test:

1. **Check Issue**: Labels should be applied
   ```bash
   gh issue view 1 --repo ShunsukeHayashi/miyabi-e2e-test
   ```

2. **Check PR**: Draft PR should be created
   ```bash
   gh pr list --repo ShunsukeHayashi/miyabi-e2e-test
   gh pr view 1 --repo ShunsukeHayashi/miyabi-e2e-test
   ```

3. **Check Branch**: Feature branch should exist
   ```bash
   gh api repos/ShunsukeHayashi/miyabi-e2e-test/branches
   ```

---

## Troubleshooting

### Error: "ANTHROPIC_API_KEY is required"

**Cause**: Environment variable not set

**Solution**:
```bash
export ANTHROPIC_API_KEY="sk-ant-your-key"
echo $ANTHROPIC_API_KEY  # Verify it's set
```

### Error: "GITHUB_TOKEN is required"

**Cause**: Environment variable not set

**Solution**:
```bash
export GITHUB_TOKEN="ghp_your-token"
gh auth status  # Verify token works
```

### Error: "Failed to fetch issue"

**Cause**: Issue doesn't exist or token lacks permissions

**Solution**:
1. Verify issue exists:
   ```bash
   gh issue view 1 --repo ShunsukeHayashi/miyabi-e2e-test
   ```

2. Verify token has `repo` scope:
   ```bash
   gh auth status
   ```

3. Recreate token with correct scopes if needed

### Error: "Rate limit exceeded"

**Cause**: GitHub API rate limit reached (5000 requests/hour for authenticated)

**Solution**:
- Wait for rate limit reset (check with `gh api rate_limit`)
- Use authenticated requests (ensure GITHUB_TOKEN is set)

### Error: "Insufficient quota" (Anthropic)

**Cause**: Anthropic API quota exceeded

**Solution**:
- Check quota at https://console.anthropic.com/
- Add credits to your account
- Wait for quota reset (if on free tier)

### High Quality Score but Test Fails

**Cause**: Test criteria may be too strict

**Solution**:
- Check `successCriteria` in scenario definition
- Ensure quality score meets `minQualityScore` threshold
- Check coverage if `minCoverage` is specified

---

## Cost Tracking

### Per-Scenario Estimated Costs

| Scenario | Complexity | Est. Tokens | Est. Cost |
|----------|-----------|-------------|-----------|
| 1. Simple Bug Fix | small | 5K | $0.02-0.05 |
| 2. Medium Feature | medium | 15K | $0.10-0.20 |
| 3. Large Refactor | large | 30K | $0.30-0.50 |
| 4. Security Fix | small | 8K | $0.05-0.10 |
| 5. Budget Test | small | 5K | $0.02-0.05 |
| 6. Stress Test | xlarge | 50K | $0.50-1.00 |

**Total (all scenarios)**: $1.00-2.00

**Note**: Actual costs may vary based on:
- Issue complexity
- Context size (related files)
- Claude's response length
- Number of retries

### Monitoring Costs

Check Anthropic usage:
- Console: https://console.anthropic.com/settings/usage
- API: `curl https://api.anthropic.com/v1/usage -H "x-api-key: $ANTHROPIC_API_KEY"`

Check GitHub API usage:
```bash
gh api rate_limit
```

---

## Best Practices

### 1. Start with Scenario 1

Always test with the simplest scenario first:
```bash
pnpm test:e2e:real -- --scenario 1
```

### 2. Use Dedicated Test Repository

Never run E2E tests against production repositories:
- ❌ `TEST_REPO=codex` (production)
- ✅ `TEST_REPO=miyabi-e2e-test` (dedicated test repo)

### 3. Clean Up Test Data

Periodically clean up test repository:
```bash
# Close all test PRs
gh pr list --repo ShunsukeHayashi/miyabi-e2e-test --state open | \
  while read -r pr; do
    pr_number=$(echo $pr | awk '{print $1}')
    gh pr close $pr_number --repo ShunsukeHayashi/miyabi-e2e-test
  done

# Delete feature branches
gh api repos/ShunsukeHayashi/miyabi-e2e-test/branches | \
  jq -r '.[].name | select(startswith("agent/"))' | \
  while read -r branch; do
    gh api -X DELETE repos/ShunsukeHayashi/miyabi-e2e-test/git/refs/heads/$branch
  done
```

### 4. Monitor Budget

Set budget alerts in your Anthropic console to avoid unexpected costs.

### 5. Run Tests Before Deployment

Always run E2E tests before deploying to production:
```bash
# Before production deployment
pnpm test:e2e:real

# If all pass (exit code 0), proceed with deployment
echo $?  # Should be 0
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests (Real API)

on:
  workflow_dispatch:  # Manual trigger only
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

jobs:
  e2e-real:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm run build

      - name: Run E2E Tests (Real API)
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          TEST_REPO: miyabi-e2e-test
          TEST_OWNER: ShunsukeHayashi
        run: |
          cd packages/miyabi-agent-sdk
          pnpm test:e2e:real -- --scenario 1
```

**Important**: Only run on manual trigger or scheduled basis to control costs.

---

## Next Steps

After validating E2E tests work with real APIs:

1. **Phase 9**: Implement DeploymentAgent (7th agent)
2. **Phase 10**: Production deployment and monitoring
3. **Process Real Issues**: Use Miyabi to autonomously process actual GitHub issues

---

## Support

**Issues**: https://github.com/ShunsukeHayashi/codex/issues
**Anthropic Docs**: https://docs.anthropic.com/
**GitHub API Docs**: https://docs.github.com/rest

---

**Generated**: 2025-10-10
**Phase**: 8-3 Complete
**Status**: ✅ Ready for Integration Testing
