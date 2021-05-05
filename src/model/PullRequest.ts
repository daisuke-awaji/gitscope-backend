import { parseISO } from 'date-fns';

type Secounds = number;
export class PullRequest {
  public firstCommitToPRCreated: Secounds;
  public prCreatedAtToLastCommit: Secounds;
  public lastCommitToMerge: Secounds;

  constructor(
    public number: number,
    public title: string,
    public author: string,
    public url: string,
    public createdAt: string,
    public mergedAt: string,
    public additions: number,
    public deletions: number,
    public authoredDate: string,
    public lastCommitDate: string,
  ) {
    const getTime = (dateStr) => parseISO(dateStr).getTime();
    this.firstCommitToPRCreated =
      (getTime(createdAt) - getTime(authoredDate)) / 1000;
    this.prCreatedAtToLastCommit =
      (getTime(lastCommitDate) - getTime(authoredDate)) / 1000;
    this.lastCommitToMerge =
      (getTime(mergedAt) - getTime(lastCommitDate)) / 1000;
  }
}

export interface PullRequestNode {
  number: number;
  title: string;
  author: {
    login: string;
  };
  url: string;
  createdAt: string;
  mergedAt: string;
  additions: number;
  deletions: number;
  commits: {
    nodes: {
      commit: {
        authoredDate: string;
      };
    }[];
  };
}
