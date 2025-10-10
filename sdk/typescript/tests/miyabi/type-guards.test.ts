/**
 * Type Guards Unit Tests
 * Phase 8: Real API Integration
 */

import {
  isMCPToolResponse,
  isMCPErrorResponse,
  isAgentResponse,
  isIssueAnalysisResult,
  isCodeGenerationResult,
  isQualityReport,
  isPullRequest,
  isTestResult,
  isBudgetStatus,
  isDAG,
  isParallelExecutionResult,
  isStringArray,
  isObject,
} from "../../src/miyabi/type-guards.js";

describe("Type Guards", () => {
  describe("isMCPToolResponse", () => {
    it("should return true for valid MCP tool response", () => {
      const valid = {
        content: [
          {
            type: "text",
            text: '{"success": true}',
          },
        ],
      };
      expect(isMCPToolResponse(valid)).toBe(true);
    });

    it("should return false for invalid MCP tool response", () => {
      expect(isMCPToolResponse(null)).toBe(false);
      expect(isMCPToolResponse({})).toBe(false);
      expect(isMCPToolResponse({ content: "invalid" })).toBe(false);
    });
  });

  describe("isMCPErrorResponse", () => {
    it("should return true for valid MCP error response", () => {
      const valid = {
        error: {
          code: 500,
          message: "Internal server error",
        },
      };
      expect(isMCPErrorResponse(valid)).toBe(true);
    });

    it("should return false for invalid MCP error response", () => {
      expect(isMCPErrorResponse(null)).toBe(false);
      expect(isMCPErrorResponse({})).toBe(false);
      expect(isMCPErrorResponse({ error: "string" })).toBe(false);
    });
  });

  describe("isAgentResponse", () => {
    it("should return true for valid agent response", () => {
      const valid = {
        success: true,
        agent: "IssueAgent",
        result: {},
      };
      expect(isAgentResponse(valid)).toBe(true);
    });

    it("should return false for invalid agent response", () => {
      expect(isAgentResponse(null)).toBe(false);
      expect(isAgentResponse({})).toBe(false);
      expect(isAgentResponse({ success: true })).toBe(false);
    });
  });

  describe("isIssueAnalysisResult", () => {
    it("should return true for valid issue analysis result", () => {
      const valid = {
        issue: {
          number: 42,
          title: "Test issue",
          body: "Test body",
          labels: [],
          complexity: "medium" as const,
          priority: "P2" as const,
          type: "feature" as const,
        },
        suggestedLabels: ["bug", "feature"],
        estimatedComplexity: "medium" as const,
        estimatedTime: 120,
        agentRecommendations: ["CodeGenAgent"],
      };
      expect(isIssueAnalysisResult(valid)).toBe(true);
    });

    it("should return false for invalid issue analysis result", () => {
      expect(isIssueAnalysisResult(null)).toBe(false);
      expect(isIssueAnalysisResult({})).toBe(false);
      expect(isIssueAnalysisResult({ issue: {} })).toBe(false);
    });
  });

  describe("isCodeGenerationResult", () => {
    it("should return true for valid code generation result", () => {
      const valid = {
        files: [
          {
            path: "src/test.ts",
            content: "export const test = 1;",
            action: "create" as const,
          },
        ],
        summary: "Generated 1 file",
        warnings: [],
      };
      expect(isCodeGenerationResult(valid)).toBe(true);
    });

    it("should return false for invalid code generation result", () => {
      expect(isCodeGenerationResult(null)).toBe(false);
      expect(isCodeGenerationResult({})).toBe(false);
      expect(isCodeGenerationResult({ files: "invalid" })).toBe(false);
    });
  });

  describe("isQualityReport", () => {
    it("should return true for valid quality report", () => {
      const valid = {
        qualityScore: 85,
        passed: true,
        issues: [],
        coverage: 90,
        suggestions: ["Add more tests"],
      };
      expect(isQualityReport(valid)).toBe(true);
    });

    it("should return false for invalid quality report", () => {
      expect(isQualityReport(null)).toBe(false);
      expect(isQualityReport({})).toBe(false);
      expect(isQualityReport({ qualityScore: "invalid" })).toBe(false);
    });
  });

  describe("isPullRequest", () => {
    it("should return true for valid pull request", () => {
      const valid = {
        number: 123,
        url: "https://github.com/test/repo/pull/123",
        branch: "feature/test",
        status: "open" as const,
        title: "Test PR",
        body: "Test description",
      };
      expect(isPullRequest(valid)).toBe(true);
    });

    it("should return false for invalid pull request", () => {
      expect(isPullRequest(null)).toBe(false);
      expect(isPullRequest({})).toBe(false);
      expect(isPullRequest({ number: 123 })).toBe(false);
    });
  });

  describe("isTestResult", () => {
    it("should return true for valid test result", () => {
      const valid = {
        passed: true,
        totalTests: 100,
        passedTests: 95,
        failedTests: 5,
        failures: [],
        coverage: 85,
      };
      expect(isTestResult(valid)).toBe(true);
    });

    it("should return false for invalid test result", () => {
      expect(isTestResult(null)).toBe(false);
      expect(isTestResult({})).toBe(false);
      expect(isTestResult({ passed: true })).toBe(false);
    });
  });

  describe("isBudgetStatus", () => {
    it("should return true for valid budget status", () => {
      const valid = {
        monthlyBudgetUsd: 500,
        usedBudgetUsd: 250,
        currentSpendUsd: 250,
        remainingBudgetUsd: 250,
        usagePercentage: 50,
        isWarning: false,
        isEmergency: false,
      };
      expect(isBudgetStatus(valid)).toBe(true);
    });

    it("should return false for invalid budget status", () => {
      expect(isBudgetStatus(null)).toBe(false);
      expect(isBudgetStatus({})).toBe(false);
      expect(isBudgetStatus({ monthlyBudgetUsd: "invalid" })).toBe(false);
    });
  });

  describe("isDAG", () => {
    it("should return true for valid DAG", () => {
      const valid = {
        nodes: [
          {
            id: "1",
            description: "Task 1",
            agent: "CodeGenAgent",
            estimatedTime: 30,
            dependencies: [],
          },
        ],
        edges: [
          {
            from: "1",
            to: "2",
          },
        ],
      };
      expect(isDAG(valid)).toBe(true);
    });

    it("should return false for invalid DAG", () => {
      expect(isDAG(null)).toBe(false);
      expect(isDAG({})).toBe(false);
      expect(isDAG({ nodes: "invalid" })).toBe(false);
    });
  });

  describe("isParallelExecutionResult", () => {
    it("should return true for valid parallel execution result", () => {
      const valid = {
        success: true,
        results: {
          issue: { success: true, data: {} },
          codegen: { success: true, data: {} },
        },
        totalExecutionTime: 5000,
        prUrl: "https://github.com/test/repo/pull/123",
      };
      expect(isParallelExecutionResult(valid)).toBe(true);
    });

    it("should return false for invalid parallel execution result", () => {
      expect(isParallelExecutionResult(null)).toBe(false);
      expect(isParallelExecutionResult({})).toBe(false);
      expect(isParallelExecutionResult({ success: true })).toBe(false);
    });
  });

  describe("isStringArray", () => {
    it("should return true for valid string array", () => {
      expect(isStringArray(["a", "b", "c"])).toBe(true);
      expect(isStringArray([])).toBe(true);
    });

    it("should return false for invalid string array", () => {
      expect(isStringArray(null)).toBe(false);
      expect(isStringArray("string")).toBe(false);
      expect(isStringArray([1, 2, 3])).toBe(false);
      expect(isStringArray(["a", 1, "b"])).toBe(false);
    });
  });

  describe("isObject", () => {
    it("should return true for valid object", () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ key: "value" })).toBe(true);
    });

    it("should return false for invalid object", () => {
      expect(isObject(null)).toBe(false);
      expect(isObject(undefined)).toBe(false);
      expect(isObject("string")).toBe(false);
      expect(isObject(123)).toBe(false);
      expect(isObject([])).toBe(false);
    });
  });
});
