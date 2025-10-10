# Miyabi SDK Demo - Playwright E2E Recording

This directory contains Playwright E2E tests that demonstrate the Miyabi SDK workflow and record demo videos.

## 🎬 What's Recorded

The demo shows the complete autonomous coding workflow:

1. **Issue Analysis** (Analyst Agent)
   - Fetches GitHub issue details
   - Understands requirements
   - Creates implementation plan

2. **Code Generation** (Generator Agent)
   - Creates file structure
   - Writes implementation code
   - Adds tests

3. **Code Review** (Reviewer Agent)
   - Checks quality metrics
   - Finds potential bugs
   - Analyzes complexity

4. **Pull Request Creation** (Integrator Agent)
   - Generates PR description
   - Links to issue
   - Submits PR to GitHub

## 🚀 Running the Demo

### Prerequisites

```bash
# Install dependencies (from parent directory)
cd ..
pnpm install
pnpm build

# Return to demo directory
cd demo
```

### Environment Setup

Create a `.env` file in the demo directory:

```bash
ANTHROPIC_API_KEY=your_api_key_here
GITHUB_TOKEN=your_github_token_here
TEST_OWNER=your_github_username
TEST_REPO=your_test_repository
```

### Run Demo Recording

```bash
# Run the demo (records video automatically)
pnpm exec playwright test miyabi-workflow-demo.spec.ts

# Or use npm script from parent directory
cd ..
pnpm run demo:record
```

### View Results

After running, you'll find:

- **Video**: `demo/test-results/*/video.webm` - Full workflow recording
- **Screenshots**: `demo/test-results/*/screenshots/` - Step-by-step captures
- **HTML Report**: `demo/playwright-report/index.html` - Interactive test report

```bash
# Open HTML report
pnpm exec playwright show-report
```

## 📊 Demo Features

- **Visual Overlays**: Each step displays a styled overlay showing the agent's actions
- **Real-time Updates**: Actual SDK API calls with live results
- **Quality Indicators**: Color-coded status (green = success, yellow = warning, red = error)
- **Final Summary**: Complete workflow summary with cost information

## 🎥 Video Output

The demo is recorded at:
- **Resolution**: 1920x1080 (Full HD)
- **Format**: WebM
- **Duration**: ~30-40 seconds
- **Slow Motion**: 500ms delay between actions for clarity

## 🔧 Customization

Edit `miyabi-workflow-demo.spec.ts` to customize:

- `slowMo`: Adjust timing in `playwright.config.ts`
- Overlay styles: Modify CSS in test file
- Demo duration: Adjust `waitForTimeout` values
- Demo content: Change issue number, repo, etc.

## 📝 Notes

- The demo uses a real GitHub repository for authenticity
- API keys must be valid for full demonstration
- Video recording is automatic (Playwright feature)
- Demo is safe to run multiple times (creates new branches each time)

## 🐛 Troubleshooting

**Video not recorded?**
- Check Playwright version: `pnpm exec playwright --version`
- Ensure `video: 'on'` in `playwright.config.ts`
- Check `test-results/` directory for output

**Test fails?**
- Verify environment variables in `.env`
- Check API key validity
- Ensure repository exists and is accessible
- Review `playwright-report/` for error details

## 📚 Learn More

- [Playwright Documentation](https://playwright.dev)
- [Miyabi SDK Documentation](../README.md)
- [Miyabi SDK npm Package](https://www.npmjs.com/package/miyabi-agent-sdk)
