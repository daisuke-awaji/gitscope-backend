import JobsService from "./JobsService";
import { CommitAnalysisDao } from "../dao/CommitAnalysisDao";

test("not found in commit analysis table", async (done) => {
  jest
    .spyOn(CommitAnalysisDao.prototype, "findAllInRepository")
    .mockImplementation(async () => {
      return [];
    });
  const token = process.env.TEST_TOKEN;
  const service = new JobsService(token);
  const result = await service.getCommitAnalysis({
    repositoryNameWithOwner: "cloudformation-perfect-guide/docs",
  });
  expect(result).toMatchObject([]);
  done();
});

test("found in commit analysis table", async (done) => {
  jest
    .spyOn(CommitAnalysisDao.prototype, "findAllInRepository")
    .mockImplementation(async () => {
      return [
        {
          repositoryNameWithOwner: "cloudformation-perfect-guide/docs",
          sha: "xxxxxx",
          state: "pending",
        },
        {
          repositoryNameWithOwner: "cloudformation-perfect-guide/docs",
          sha: "yyyyyyy",
          state: "pending",
        },
        {
          repositoryNameWithOwner: "cloudformation-perfect-guide/docs",
          sha: "zzzzzzz",
          state: "pending",
        },
      ];
    });
  const token = process.env.TEST_TOKEN;
  const service = new JobsService(token);
  const result = await service.getCommitAnalysis({
    repositoryNameWithOwner: "cloudformation-perfect-guide/docs",
  });
  expect(result).toMatchObject([
    {
      repositoryNameWithOwner: "cloudformation-perfect-guide/docs",
      sha: "xxxxxx",
      state: "pending",
    },
    {
      repositoryNameWithOwner: "cloudformation-perfect-guide/docs",
      sha: "yyyyyyy",
      state: "pending",
    },
    {
      repositoryNameWithOwner: "cloudformation-perfect-guide/docs",
      sha: "zzzzzzz",
      state: "pending",
    },
  ]);
  done();
});
