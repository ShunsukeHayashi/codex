/**
 * GitHubClient - GitHub API wrapper
 *
 * Issues, PRs, Projects V2との統合を提供
 *
 * @module GitHubClient
 */

import { Octokit } from "@octokit/rest";

export interface IssueData {
  number: number;
  title: string;
  body: string | null;
  labels: string[];
  assignees: string[];
  state: "open" | "closed";
  createdAt: string;
  updatedAt: string;
}

export interface CreatePRParams {
  owner: string;
  repo: string;
  title: string;
  body: string;
  head: string;
  base: string;
  draft?: boolean;
}

export interface PRResult {
  number: number;
  url: string;
  state: "draft" | "open";
}

export class GitHubClient {
  private octokit: Octokit;

  constructor(token?: string) {
    this.octokit = new Octokit({
      auth: token || process.env.GITHUB_TOKEN,
    });
  }

  /**
   * Issueを取得
   */
  async getIssue(
    owner: string,
    repo: string,
    issueNumber: number
  ): Promise<IssueData> {
    const { data } = await this.octokit.issues.get({
      owner,
      repo,
      issue_number: issueNumber,
    });

    return {
      number: data.number,
      title: data.title,
      body: data.body,
      labels: data.labels.map((label) =>
        typeof label === "string" ? label : label.name || ""
      ),
      assignees: data.assignees?.map((a) => a.login) || [],
      state: data.state as "open" | "closed",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Issueにラベルを追加
   */
  async addLabels(
    owner: string,
    repo: string,
    issueNumber: number,
    labels: string[]
  ): Promise<void> {
    await this.octokit.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels,
    });

    console.log(
      `[GitHubClient] Added labels to #${issueNumber}: ${labels.join(
        ", "
      )}`
    );
  }

  /**
   * Issueにコメントを追加
   */
  async createComment(
    owner: string,
    repo: string,
    issueNumber: number,
    body: string
  ): Promise<void> {
    await this.octokit.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body,
    });

    console.log(`[GitHubClient] Comment added to #${issueNumber}`);
  }

  /**
   * Pull Requestを作成
   */
  async createPullRequest(
    params: CreatePRParams
  ): Promise<PRResult> {
    const { data } = await this.octokit.pulls.create({
      owner: params.owner,
      repo: params.repo,
      title: params.title,
      body: params.body,
      head: params.head,
      base: params.base,
      draft: params.draft ?? true, // デフォルトはDraft
    });

    console.log(
      `[GitHubClient] PR created: #${data.number} (${data.html_url})`
    );

    return {
      number: data.number,
      url: data.html_url,
      state: data.draft ? "draft" : "open",
    };
  }

  /**
   * ブランチを作成
   */
  async createBranch(
    owner: string,
    repo: string,
    branchName: string,
    baseBranch: string = "main"
  ): Promise<void> {
    // 基準ブランチのSHAを取得
    const { data: baseRef } = await this.octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${baseBranch}`,
    });

    // 新しいブランチを作成
    await this.octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: baseRef.object.sha,
    });

    console.log(
      `[GitHubClient] Branch created: ${branchName} (from ${baseBranch})`
    );
  }

  /**
   * ファイルをコミット
   */
  async commitFiles(
    owner: string,
    repo: string,
    branch: string,
    files: Array<{ path: string; content: string }>,
    message: string
  ): Promise<void> {
    // ブランチの最新コミットSHAを取得
    const { data: refData } = await this.octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    });

    const latestCommitSha = refData.object.sha;

    // 最新コミットのツリーを取得
    const { data: commitData } = await this.octokit.git.getCommit({
      owner,
      repo,
      commit_sha: latestCommitSha,
    });

    // 新しいツリーを作成
    const tree = await Promise.all(
      files.map(async (file) => {
        const { data: blobData } = await this.octokit.git.createBlob(
          {
            owner,
            repo,
            content: Buffer.from(file.content).toString("base64"),
            encoding: "base64",
          }
        );

        return {
          path: file.path,
          mode: "100644" as const,
          type: "blob" as const,
          sha: blobData.sha,
        };
      })
    );

    const { data: newTree } = await this.octokit.git.createTree({
      owner,
      repo,
      base_tree: commitData.tree.sha,
      tree,
    });

    // 新しいコミットを作成
    const { data: newCommit } = await this.octokit.git.createCommit({
      owner,
      repo,
      message,
      tree: newTree.sha,
      parents: [latestCommitSha],
    });

    // ブランチの参照を更新
    await this.octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommit.sha,
    });

    console.log(
      `[GitHubClient] Files committed to ${branch}: ${files.length} files`
    );
  }

  /**
   * GitHub Issueを作成（Guardian通知用）
   */
  async createGuardianIssue(
    owner: string,
    repo: string,
    title: string,
    body: string,
    labels: string[] = ["human-intervention-required"],
    assignee?: string
  ): Promise<number> {
    const { data } = await this.octokit.issues.create({
      owner,
      repo,
      title,
      body,
      labels,
      assignees: assignee ? [assignee] : undefined,
    });

    console.log(
      `[GitHubClient] Guardian Issue created: #${data.number}`
    );

    return data.number;
  }
}
