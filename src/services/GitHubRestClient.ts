import axios, { AxiosInstance } from "axios";

const GITHUB_REST_ENDPOINT = "https://api.github.com";

const createApiClient = (token) => {
  return axios.create({
    baseURL: GITHUB_REST_ENDPOINT,
    headers: {
      authorization: `bearer ${token}`,
      accept: "application/vnd.github.v3+json",
    },
    timeout: 3600_000,
  });
};

type CreateCommitStatus = {
  owner: string;
  repo: string;
  sha: string;
  state: "error" | "failure" | "pending" | "success";
  target_url: string;
  description: string;
  context: string;
};

type CreateCommitComment = {
  owner: string;
  repo: string;
  sha: string;
  body: string;
  path?: string;
  position?: number;
  line?: number;
};

type ListCommitCommentParam = { owner: string; repo: string; sha: string };

type DeleteCommitCommentParam = {
  owner: string;
  repo: string;
  commentId: number;
};

type User = {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: false;
};

type CommitComment = {
  html_url: string;
  url: string;
  id: number;
  node_id: string;
  body: string;
  path: string;
  position: number;
  line: number;
  commit_id: string;
  user: User;
  created_at: string;
  updated_at: string;
  author_association: string;
};

type CreateIssueCommentParam = {
  owner: string;
  repo: string;
  issueNumber: number;
  body: string;
};

type ListIssueCommentParam = {
  owner: string;
  repo: string;
  issueNumber: number;
  since?: string;
  perPage?: number;
  page?: number;
};

type IssueComment = {
  url: string;
  html_url: string;
  issue_url: string;
  id: number;
  node_id: string;
  user: User;
  created_at: string;
  updated_at: string;
  author_association: string;
  body: string;
  performed_via_github_app: any;
};

type DeleteIssueCommentParam = {
  owner: string;
  repo: string;
  commentId: number;
};

export class GitHubRestClient {
  private client: AxiosInstance;
  constructor(token: string) {
    this.client = createApiClient(token);
  }

  async createCommitStatus(param: CreateCommitStatus) {
    const { owner, repo, sha, state, target_url, description, context } = param;
    const result = await this.client.post(
      `/repos/${owner}/${repo}/commits/${sha}/statuses`,
      {
        state,
        target_url,
        description,
        context,
      }
    );
    return result;
  }

  async createCommitComment(param: CreateCommitComment) {
    const { owner, repo, sha, body, path, position, line } = param;
    const result = await this.client.post(
      `/repos/${owner}/${repo}/commits/${sha}/comments`,
      {
        body,
        path,
        position,
        line,
      }
    );
    return result;
  }

  async listCommitComment(
    param: ListCommitCommentParam
  ): Promise<CommitComment[]> {
    const { owner, repo, sha } = param;

    const result = await this.client.get(
      `/repos/${owner}/${repo}/commits/${sha}/comments`
    );

    // TODO: pagination

    return result.data;
  }

  async deleteCommitComment(param: DeleteCommitCommentParam) {
    const { owner, repo, commentId } = param;

    await this.client.delete(`/repos/${owner}/${repo}/comments/${commentId}`);

    return;
  }

  async createIssueComment(param: CreateIssueCommentParam) {
    const { owner, repo, issueNumber, body } = param;
    await this.client.post(
      `/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
      {
        body,
      }
    );

    return;
  }

  async listIssueComment(
    param: ListIssueCommentParam
  ): Promise<IssueComment[]> {
    const { owner, repo, issueNumber } = param;

    const result = await this.client.get(
      `/repos/${owner}/${repo}/issues/${issueNumber}/comments`
    );

    // TODO: pagination

    return result.data;
  }

  async deleteIssueComment(param: DeleteIssueCommentParam) {
    const { owner, repo, commentId } = param;

    await this.client.delete(
      `/repos/${owner}/${repo}/issues/comments/${commentId}`
    );
    return;
  }
}
