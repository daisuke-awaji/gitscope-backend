export class Issue {
  constructor(
    public number: number,
    public title: string,
    public author: string,
    public url: string,
    public createdAt: string,
    public totalComments: number,
  ) {}
}

export interface IssueNode {
  number: number;
  title: string;
  author: {
    login: string;
  };
  url: string;
  createdAt: string;
  comments: {
    totalCount: number;
  };
}
