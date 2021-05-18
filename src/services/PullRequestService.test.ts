import { format } from "date-fns";
import PullRequestService from "./PullRequestService";

test("date-fns lesson", () => {
  const day = new Date("2020-06-28T08:08:32Z");
  console.log(day);
  const formatDate = format(day, "yyyy/MM/dd");
  console.log(formatDate);

  const data = [
    {
      title: "add home png",
      author: "daisuke-awaji",
      url: "https://github.com/cloudformation-perfect-guide/docs/pull/3",
      createdAt: "2020-06-26T11:13:47Z",
      mergedAt: "2020-06-26T14:10:33Z",
      additions: 36,
      deletions: 29,
      authoredDate: "2020-06-28T11:13:04Z",
      leadTimeSeconds: 10649,
      timeToMergeSeconds: 10606,
    },
    {
      title: "what is infrastructure as code",
      author: "daisuke-awaji",
      url: "https://github.com/cloudformation-perfect-guide/docs/pull/2",
      createdAt: "2020-06-28T08:36:42Z",
      mergedAt: "2020-06-28T08:41:13Z",
      additions: 17,
      deletions: 0,
      authoredDate: "2020-06-28T08:36:00Z",
      leadTimeSeconds: 313,
      timeToMergeSeconds: 271,
    },
    {
      title: "deploy to netlify",
      author: "daisuke-awaji",
      url: "https://github.com/cloudformation-perfect-guide/docs/pull/1",
      createdAt: "2020-06-28T08:07:32Z",
      mergedAt: "2020-06-28T08:08:32Z",
      additions: 2,
      deletions: 2,
      authoredDate: "2020-06-28T08:07:06Z",
      leadTimeSeconds: 86,
      timeToMergeSeconds: 60,
    },
  ];

  const a = data.map((item) => format(new Date(item.mergedAt), "yyyy/MM/dd"));
  console.log(a);
});

test("reduce", () => {
  const arr = ["2020/06/26", "2020/06/28", "2020/06/28"];

  const count: { [key: string]: number } = arr.reduce((prev, current) => {
    prev[current] = (prev[current] || 0) + 1;
    return prev;
  }, {});

  console.log(count);

  let result = [];
  Object.keys(count).map((key) => {
    result.push({
      mergedAt: key,
      count: count[key],
    });
  });
  console.log(result);
});

test("handler", async (done) => {
  const token = process.env.TEST_TOKEN;
  const service = new PullRequestService(token);
  const result = await service.getMergedPullRequestPerDay({
    repositoryNameWithOwner: "cloudformation-perfect-guide/docs",
    startDateString: "2010-11-11",
    endDateString: "2021-11-11",
  });
  console.log(result);
  done();
});

test("public repository", async (done) => {
  const token = process.env.TEST_TOKEN;
  const service = new PullRequestService(token);
  const result = await service.getMergedPullRequestPerDay({
    repositoryNameWithOwner: "facebook/react",
    startDateString: "2021-01-11",
    endDateString: "2021-04-11",
  });
  console.log(result);
  done();
});

test("get pr", async (done) => {
  const token = process.env.TEST_TOKEN;
  const service = new PullRequestService(token);
  const pr = await service.getPullRequest({
    repositoryNameWithOwner: "daisuke-awaji/gitscope-backend",
    pullRequestId: 4,
  });
  console.log(pr);
  done();
});

test.only("get pr by sha", async (done) => {
  const token = process.env.TEST_TOKEN;
  const service = new PullRequestService(token);
  const prs = await service.getPullRequestsBySha({
    repositoryNameWithOwner: "daisuke-awaji/gitscope-backend",
    sha: "22558cdc6d6b7050e609ec3347ac43b2a8680f9d",
  });
  console.log(prs);

  const leadTime = {
    open: prs[0].firstCommitToPRCreated / (60 * 60 * 24),
    work: prs[0].prCreatedAtToLastCommit / (60 * 60 * 24),
    review: 0,
  };

  console.log(leadTime);
  done();
});
