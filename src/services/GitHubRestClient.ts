import axios, { AxiosInstance } from 'axios';

const GITHUB_REST_ENDPOINT = 'https://api.github.com';

const createApiClient = (token) => {
  return axios.create({
    baseURL: GITHUB_REST_ENDPOINT,
    headers: {
      authorization: `bearer ${token}`,
      accept: 'application/vnd.github.machine-man-preview+json',
    },
    timeout: 3600_000,
  });
};

type CreateCommitStatus = {
  owner: string;
  repo: string;
  sha: string;
  state: 'error' | 'failure' | 'pending' | 'success';
  target_url: string;
  description: string;
  context: string;
};

// type CommitStatus =

export class GitHubRestClient {
  private client: AxiosInstance;
  constructor(token: string) {
    this.client = createApiClient(token);
  }

  createCommitStatus(param: CreateCommitStatus) {
    const { owner, repo, sha, state, target_url, description, context } = param;
    const result = this.client.post(
      `/repos/${owner}/${repo}/commits/${sha}/statuses`,
      {
        state,
        target_url,
        description,
        context,
      },
    );
    return result;
  }
}
