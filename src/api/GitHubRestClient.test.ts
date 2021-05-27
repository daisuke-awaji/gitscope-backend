import { createJWT } from "../api/createGitHubAppJWT";
import { GitHubRestClient } from "./GitHubRestClient";
const sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));

describe("", () => {
  beforeAll(() => {
    jest.setTimeout(300000);
  });
  test("list commit statuses", async (done) => {
    const token = process.env.TEST_TOKEN;
    const client = new GitHubRestClient(token);
    await client.createCommitStatus({
      owner: "daisuke-awaji",
      repo: "gitscope-webhook-test",
      sha: "6d9ed6cdc08b46afc402ba7f11a2508e7d478f7b",
      state: "pending",
      target_url: "https://gitscope.vercel.app/jobs",
      description: "Waiting for calculate risk points.",
      context: "Risk Points",
    });
    await client.createCommitStatus({
      owner: "daisuke-awaji",
      repo: "gitscope-webhook-test",
      sha: "6d9ed6cdc08b46afc402ba7f11a2508e7d478f7b",
      state: "pending",
      target_url: "https://gitscope.vercel.app/jobs",
      description: "Waiting for calculate lead time",
      context: "Lead Time",
    });
    await sleep(2000);

    await client.createCommitStatus({
      owner: "daisuke-awaji",
      repo: "gitscope-webhook-test",
      sha: "6d9ed6cdc08b46afc402ba7f11a2508e7d478f7b",
      state: "success",
      target_url: "https://gitscope.vercel.app/jobs",
      description: "88.2 / 100",
      context: "Risk Points",
    });
    await client.createCommitStatus({
      owner: "daisuke-awaji",
      repo: "gitscope-webhook-test",
      sha: "6d9ed6cdc08b46afc402ba7f11a2508e7d478f7b",
      state: "success",
      target_url: "https://gitscope.vercel.app/jobs",
      description: "Open: 2.3d, Work: 1.2d, Review, 0.5d",
      context: "Lead Time",
    });

    done();
  });

  test("create jwt", async (done) => {
    const jwt = await createJWT("16959777");
    console.log(jwt);

    const client = new GitHubRestClient(jwt);
    await client.createCommitStatus({
      owner: "daisuke-awaji",
      repo: "gitscope-webhook-test",
      sha: "6d9ed6cdc08b46afc402ba7f11a2508e7d478f7b",
      state: "pending",
      target_url: "https://gitscope.vercel.app/jobs",
      description: "Waiting for calculate risk points.",
      context: "Risk Points",
    });
    done();
  });

  test("create commmit comment", async (done) => {
    const jwt = await createJWT("16959777");
    const client = new GitHubRestClient(jwt);
    await client.createCommitComment({
      owner: "daisuke-awaji",
      repo: "gitscope-webhook-test",
      sha: "12b6d2134b5a6586892a48c09d6becbcea9573c1",
      body: `|File ✏️|Complexity
|--|--|
|/src/index.js|✅ 4|
|/src/app.js|✅ 2|
|/src/node.js|✅ 1|
|/src/config.js|🚨 17|
|/src/service/github.js|✅ 4|
      `,
    });
    done();
  });

  test("create pull-request issue comment", async (done) => {
    const jwt = await createJWT("16959777");
    const client = new GitHubRestClient(jwt);

    const issueComments = await client.listIssueComment({
      owner: "daisuke-awaji",
      repo: "gitscope-backend",
      issueNumber: 2,
    });
    console.log(issueComments);
    for (const issueComment of issueComments) {
      await client.deleteIssueComment({
        owner: "daisuke-awaji",
        repo: "gitscope-backend",
        commentId: issueComment.id,
      });
    }

    await client.createIssueComment({
      owner: "daisuke-awaji",
      repo: "gitscope-backend",
      issueNumber: 2,
      body: `|File|Complexity
|--|--|
|/src/index.js|✅ 4|
|/src/app.js|✅ 2|
|/src/node.js|✅ 1|
|/src/config.js|🚨 17|
|/src/service/github.js|✅ 4|
      `,
    });
    done();
  });

  test.only("create new branch and new file", async (done) => {
    const token = process.env.TEST_TOKEN;
    const client = new GitHubRestClient(token);

    const commit = await client.GetBranchHead({
      owner: "daisuke-awaji",
      repo: "gitscope-backend",
      branch: "master",
    });
    console.log(commit.object.sha);

    await client
      .CreateBranch({
        owner: "daisuke-awaji",
        repo: "gitscope-backend",
        branch: "newb",
        sha: commit.object.sha,
      })
      .catch((e) => console.log(e));

    await client
      .CreateFileContents({
        owner: "daisuke-awaji",
        repo: "gitscope-backend",
        path: "a.txt",
        message: "hey",
        content: "yeeeeeeeeeeah",
        branch: "nb",
      })
      .catch((e) => console.log(e));
    done();
  });
});
