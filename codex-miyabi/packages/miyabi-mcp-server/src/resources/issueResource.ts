/**
 * Issue Resource
 *
 * issue://{repo}/{number} - GitHub Issue データ
 */

import { GitHubClient } from "../utils/GitHubClient.js";

export interface IssueResourceData {
  number: number;
  title: string;
  body: string | null;
  labels: string[];
  assignees: string[];
  state: "open" | "closed";
  createdAt: string;
  updatedAt: string;
}

export async function getIssueResource(
  uri: string,
  github: GitHubClient
): Promise<IssueResourceData> {
  // URI: issue://{owner}/{repo}/{number}
  const match = uri.match(/issue:\/\/([^\/]+)\/([^\/]+)\/(\d+)/);

  if (!match) {
    throw new Error(`Invalid issue URI: ${uri}`);
  }

  const [, owner, repo, numberStr] = match;
  const number = parseInt(numberStr, 10);

  const issue = await github.getIssue(owner, repo, number);

  return {
    number: issue.number,
    title: issue.title,
    body: issue.body,
    labels: issue.labels,
    assignees: issue.assignees,
    state: issue.state,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
  };
}
