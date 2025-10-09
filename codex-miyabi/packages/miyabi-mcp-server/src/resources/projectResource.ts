/**
 * Project Resource
 *
 * project://{owner}/{project-id}/status - GitHub Projects V2 ステータス
 */

export interface ProjectResourceData {
  projectId: string;
  items: Array<{
    issueNumber: number;
    status: string;
    priority: string;
    assignedAgent: string;
  }>;
  metrics: {
    totalIssues: number;
    pending: number;
    inProgress: number;
    done: number;
    averageQualityScore: number;
  };
}

export async function getProjectResource(
  uri: string
): Promise<ProjectResourceData> {
  // URI: project://{owner}/{project-id}/status
  const match = uri.match(/project:\/\/([^\/]+)\/([^\/]+)\/status/);

  if (!match) {
    throw new Error(`Invalid project URI: ${uri}`);
  }

  const [, owner, projectId] = match;

  // 簡略実装: 固定値を返す
  return {
    projectId,
    items: [
      {
        issueNumber: 1,
        status: "in_progress",
        priority: "P1",
        assignedAgent: "codegen",
      },
    ],
    metrics: {
      totalIssues: 10,
      pending: 3,
      inProgress: 5,
      done: 2,
      averageQualityScore: 87,
    },
  };
}
