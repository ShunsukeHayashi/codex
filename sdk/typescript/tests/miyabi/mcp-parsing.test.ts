/**
 * MCP Response Parsing Unit Tests
 * Phase 8: Real API Integration
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { MiyabiAgents } from "../../src/miyabi/MiyabiAgents.js";
import { MCPParseError } from "../../src/miyabi/types.js";

describe("MCP Response Parsing", () => {
  let miyabi: MiyabiAgents;

  beforeEach(() => {
    miyabi = new MiyabiAgents({
      githubToken: "test-token",
    });
  });

  describe("parseMCPResponse", () => {
    it("should parse valid MCP tool response with Agent response", () => {
      const validMCPResponse = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              agent: "IssueAgent",
              result: {
                issue: {
                  number: 42,
                  title: "Test issue",
                  body: "Test body",
                  labels: [],
                  complexity: "medium",
                  priority: "P2",
                  type: "feature",
                },
                suggestedLabels: ["feature", "P2"],
                estimatedComplexity: "medium",
                estimatedTime: 120,
                agentRecommendations: ["CodeGenAgent"],
              },
            }),
          },
        ],
      };

      // Access private method via casting
      const result = (miyabi as any).parseMCPResponse(validMCPResponse);
      expect(result).toBeDefined();
      expect((result as any).issue).toBeDefined();
      expect((result as any).issue.number).toBe(42);
    });

    it("should throw error for MCP error response", () => {
      const errorResponse = {
        error: {
          code: 500,
          message: "Internal server error",
        },
      };

      expect(() => {
        (miyabi as any).parseMCPResponse(errorResponse);
      }).toThrow("MCP Error [500]: Internal server error");
    });

    it("should throw MCPParseError for invalid MCP response format", () => {
      const invalidResponse = {
        invalid: "format",
      };

      expect(() => {
        (miyabi as any).parseMCPResponse(invalidResponse);
      }).toThrow(MCPParseError);
    });

    it("should throw MCPParseError when no text content in MCP response", () => {
      const noTextResponse = {
        content: [
          {
            type: "image",
            data: "base64data",
          },
        ],
      };

      expect(() => {
        (miyabi as any).parseMCPResponse(noTextResponse);
      }).toThrow(MCPParseError);
    });

    it("should throw MCPParseError for invalid JSON in text content", () => {
      const invalidJSONResponse = {
        content: [
          {
            type: "text",
            text: "not valid JSON",
          },
        ],
      };

      expect(() => {
        (miyabi as any).parseMCPResponse(invalidJSONResponse);
      }).toThrow(MCPParseError);
    });

    it("should throw MCPParseError for non-Agent response format", () => {
      const nonAgentResponse = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              invalid: "agent response",
            }),
          },
        ],
      };

      expect(() => {
        (miyabi as any).parseMCPResponse(nonAgentResponse);
      }).toThrow(MCPParseError);
    });

    it("should throw error for Agent error response", () => {
      const agentErrorResponse = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: false,
              agent: "IssueAgent",
              error: {
                code: "ISSUE_NOT_FOUND",
                message: "Issue #999 not found",
              },
            }),
          },
        ],
      };

      expect(() => {
        (miyabi as any).parseMCPResponse(agentErrorResponse);
      }).toThrow("Agent error [ISSUE_NOT_FOUND]: Issue #999 not found");
    });
  });

  describe("parseIssueAnalysisResponse", () => {
    it("should parse and validate issue analysis response", () => {
      const validResponse = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              agent: "IssueAgent",
              result: {
                issue: {
                  number: 42,
                  title: "Test issue",
                  body: "Test body",
                  labels: [],
                  complexity: "medium",
                  priority: "P2",
                  type: "feature",
                },
                suggestedLabels: ["feature", "P2"],
                estimatedComplexity: "medium",
                estimatedTime: 120,
                agentRecommendations: ["CodeGenAgent"],
              },
            }),
          },
        ],
      };

      const result = (miyabi as any).parseIssueAnalysisResponse(validResponse);
      expect((result as any).issue.number).toBe(42);
      expect((result as any).suggestedLabels).toContain("feature");
    });

    it("should throw MCPParseError for invalid schema", () => {
      const invalidSchemaResponse = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              agent: "IssueAgent",
              result: {
                invalid: "schema",
              },
            }),
          },
        ],
      };

      expect(() => {
        (miyabi as any).parseIssueAnalysisResponse(invalidSchemaResponse);
      }).toThrow(MCPParseError);
    });
  });

  describe("parseCodeGenerationResponse", () => {
    it("should parse and validate code generation response", () => {
      const validResponse = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              agent: "CodeGenAgent",
              result: {
                files: [
                  {
                    path: "src/test.ts",
                    content: "export const test = 1;",
                    action: "create",
                  },
                ],
                summary: "Generated 1 file",
                warnings: [],
              },
            }),
          },
        ],
      };

      const result = (miyabi as any).parseCodeGenerationResponse(validResponse);
      expect((result as any).files).toHaveLength(1);
      expect((result as any).files[0].path).toBe("src/test.ts");
    });
  });

  describe("parseQualityReportResponse", () => {
    it("should parse and validate quality report response", () => {
      const validResponse = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              agent: "ReviewAgent",
              result: {
                qualityScore: 85,
                passed: true,
                issues: [],
                coverage: 90,
                suggestions: ["Add more tests"],
              },
            }),
          },
        ],
      };

      const result = (miyabi as any).parseQualityReportResponse(validResponse);
      expect((result as any).qualityScore).toBe(85);
      expect((result as any).passed).toBe(true);
    });
  });

  describe("parsePullRequestResponse", () => {
    it("should parse and validate pull request response", () => {
      const validResponse = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              agent: "PRAgent",
              result: {
                number: 123,
                url: "https://github.com/test/repo/pull/123",
                branch: "feature/test",
                status: "open",
                title: "Test PR",
                body: "Test description",
              },
            }),
          },
        ],
      };

      const result = (miyabi as any).parsePullRequestResponse(validResponse);
      expect((result as any).number).toBe(123);
      expect((result as any).status).toBe("open");
    });
  });

  describe("parseTestResultResponse", () => {
    it("should parse and validate test result response", () => {
      const validResponse = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              agent: "TestAgent",
              result: {
                passed: true,
                totalTests: 100,
                passedTests: 95,
                failedTests: 5,
                failures: [],
                coverage: 85,
              },
            }),
          },
        ],
      };

      const result = (miyabi as any).parseTestResultResponse(validResponse);
      expect((result as any).passed).toBe(true);
      expect((result as any).totalTests).toBe(100);
    });
  });

  describe("parseDAGResponse", () => {
    it("should parse and validate DAG response", () => {
      const validResponse = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              agent: "CoordinatorAgent",
              result: {
                nodes: [
                  {
                    id: "1",
                    description: "Task 1",
                    agent: "CodeGenAgent",
                    estimatedTime: 30,
                    dependencies: [],
                  },
                ],
                edges: [],
              },
            }),
          },
        ],
      };

      const result = (miyabi as any).parseDAGResponse(validResponse);
      expect((result as any).nodes).toHaveLength(1);
      expect((result as any).nodes[0].id).toBe("1");
    });
  });

  describe("parseParallelExecutionResponse", () => {
    it("should parse and validate parallel execution response", () => {
      const validResponse = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              agent: "Orchestrator",
              result: {
                success: true,
                results: {
                  issue: { success: true, data: {} },
                  codegen: { success: true, data: {} },
                },
                totalExecutionTime: 5000,
                prUrl: "https://github.com/test/repo/pull/123",
              },
            }),
          },
        ],
      };

      const result = (miyabi as any).parseParallelExecutionResponse(validResponse);
      expect((result as any).success).toBe(true);
      expect((result as any).totalExecutionTime).toBe(5000);
    });
  });

  describe("parseBudgetStatusResponse", () => {
    it("should parse and validate budget status response", () => {
      const validResponse = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              agent: "BudgetManager",
              result: {
                monthlyBudgetUsd: 500,
                usedBudgetUsd: 250,
                currentSpendUsd: 250,
                remainingBudgetUsd: 250,
                usagePercentage: 50,
                isWarning: false,
                isEmergency: false,
              },
            }),
          },
        ],
      };

      const result = (miyabi as any).parseBudgetStatusResponse(validResponse);
      expect((result as any).monthlyBudgetUsd).toBe(500);
      expect((result as any).usagePercentage).toBe(50);
    });
  });

  describe("MCPParseError", () => {
    it("should contain raw response and parse error", () => {
      const rawResponse = { invalid: "data" };
      const parseError = new Error("Parse failed");
      const error = new MCPParseError("Test error", rawResponse, parseError);

      expect(error.name).toBe("MCPParseError");
      expect(error.message).toBe("Test error");
      expect(error.rawResponse).toEqual(rawResponse);
      expect(error.parseError).toBe(parseError);
    });
  });
});
