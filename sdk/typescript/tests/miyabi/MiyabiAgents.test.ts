/**
 * MiyabiAgents Test Suite
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import { MiyabiAgents } from "../../src/miyabi/MiyabiAgents";

describe("MiyabiAgents", () => {
  let miyabi: MiyabiAgents;

  beforeEach(() => {
    miyabi = new MiyabiAgents({
      githubToken: "test-token",
      anthropicApiKey: "test-api-key",
    });
  });

  describe("Constructor", () => {
    it("should create instance with default config", () => {
      const instance = new MiyabiAgents();
      expect(instance).toBeInstanceOf(MiyabiAgents);
    });

    it("should create instance with custom config", () => {
      const instance = new MiyabiAgents({
        serverName: "custom-miyabi",
        githubToken: "token",
      });
      expect(instance).toBeInstanceOf(MiyabiAgents);
    });
  });

  describe("analyzeIssue", () => {
    it("should have analyzeIssue method", () => {
      expect(typeof miyabi.analyzeIssue).toBe("function");
    });

    it("should accept valid parameters", async () => {
      const params = {
        issueNumber: 42,
        repository: "openai/codex",
      };

      // Method should exist and be callable
      expect(() => {
        miyabi.analyzeIssue(params);
      }).not.toThrow();
    });
  });

  describe("decomposeTask", () => {
    it("should have decomposeTask method", () => {
      expect(typeof miyabi.decomposeTask).toBe("function");
    });

    it("should accept valid parameters", async () => {
      const params = {
        issueNumber: 42,
        repository: "openai/codex",
      };

      expect(() => {
        miyabi.decomposeTask(params);
      }).not.toThrow();
    });
  });

  describe("generateCode", () => {
    it("should have generateCode method", () => {
      expect(typeof miyabi.generateCode).toBe("function");
    });

    it("should accept parameters with optional context", async () => {
      const params = {
        issueNumber: 42,
        repository: "openai/codex",
        context: "Use TypeScript with strict mode",
      };

      expect(() => {
        miyabi.generateCode(params);
      }).not.toThrow();
    });
  });

  describe("reviewCode", () => {
    it("should have reviewCode method", () => {
      expect(typeof miyabi.reviewCode).toBe("function");
    });

    it("should accept valid parameters", async () => {
      const params = {
        prNumber: 123,
        repository: "openai/codex",
      };

      expect(() => {
        miyabi.reviewCode(params);
      }).not.toThrow();
    });
  });

  describe("createPullRequest", () => {
    it("should have createPullRequest method", () => {
      expect(typeof miyabi.createPullRequest).toBe("function");
    });

    it("should accept valid parameters", async () => {
      const params = {
        repository: "openai/codex",
        title: "Fix: authentication bug",
        body: "This PR fixes the auth bug",
        draft: true,
      };

      expect(() => {
        miyabi.createPullRequest(params);
      }).not.toThrow();
    });
  });

  describe("runTests", () => {
    it("should have runTests method", () => {
      expect(typeof miyabi.runTests).toBe("function");
    });

    it("should accept parameters with optional test pattern", async () => {
      const params = {
        repository: "openai/codex",
        testPattern: "**/*.test.ts",
      };

      expect(() => {
        miyabi.runTests(params);
      }).not.toThrow();
    });
  });

  describe("runParallel", () => {
    it("should have runParallel method", () => {
      expect(typeof miyabi.runParallel).toBe("function");
    });

    it("should accept valid parallel execution options", async () => {
      const params = {
        issueNumber: 42,
        repository: "openai/codex",
        agents: ["codegen", "review", "pr"] as Array<
          "issue" | "codegen" | "review" | "pr" | "test"
        >,
        concurrency: 3,
      };

      expect(() => {
        miyabi.runParallel(params);
      }).not.toThrow();
    });
  });

  describe("checkBudget", () => {
    it("should have checkBudget method", () => {
      expect(typeof miyabi.checkBudget).toBe("function");
    });

    it("should be callable without parameters", async () => {
      expect(() => {
        miyabi.checkBudget();
      }).not.toThrow();
    });
  });

  describe("getProjectStatus", () => {
    it("should have getProjectStatus method", () => {
      expect(typeof miyabi.getProjectStatus).toBe("function");
    });

    it("should accept valid parameters", async () => {
      const params = {
        repository: "openai/codex",
        projectName: "Codex Development",
      };

      expect(() => {
        miyabi.getProjectStatus(params);
      }).not.toThrow();
    });
  });

  describe("Type Compatibility", () => {
    it("should have correct return type for analyzeIssue", () => {
      const result = miyabi.analyzeIssue({
        issueNumber: 1,
        repository: "test/repo",
      });

      expect(result).toBeInstanceOf(Promise);
    });

    it("should have correct return type for generateCode", () => {
      const result = miyabi.generateCode({
        issueNumber: 1,
        repository: "test/repo",
      });

      expect(result).toBeInstanceOf(Promise);
    });

    it("should have correct return type for reviewCode", () => {
      const result = miyabi.reviewCode({
        prNumber: 1,
        repository: "test/repo",
      });

      expect(result).toBeInstanceOf(Promise);
    });

    it("should have correct return type for createPullRequest", () => {
      const result = miyabi.createPullRequest({
        repository: "test/repo",
        title: "Test PR",
        body: "Test body",
      });

      expect(result).toBeInstanceOf(Promise);
    });

    it("should have correct return type for runTests", () => {
      const result = miyabi.runTests({
        repository: "test/repo",
      });

      expect(result).toBeInstanceOf(Promise);
    });

    it("should have correct return type for runParallel", () => {
      const result = miyabi.runParallel({
        issueNumber: 1,
        repository: "test/repo",
        agents: ["codegen"],
      });

      expect(result).toBeInstanceOf(Promise);
    });

    it("should have correct return type for checkBudget", () => {
      const result = miyabi.checkBudget();

      expect(result).toBeInstanceOf(Promise);
    });
  });
});
