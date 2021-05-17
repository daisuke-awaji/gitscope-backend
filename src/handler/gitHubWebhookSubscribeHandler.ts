import { Handler } from "aws-lambda";
import { createJWT } from "../services/createGitHubAppJWT";
import { GitHubRestClient } from "../services/GitHubRestClient";
import { formatJSONResponse } from "../utils/apigateway";
import { middify } from "../utils/middify";
import faker from "faker";
import GitHubCodeArranger from "../services/ComplexityCalculator/GitHubCodeArranger";
import ComplexityCalculator from "../services/ComplexityCalculator/ComplexityCalculator";
import tablemark from "tablemark";
import fs from "fs/promises";
import { CommitAnalysisDao } from "../dao/CommitAnalysisDao";

export const handler: Handler = async (event: any): Promise<any> => {
  const xGithubEvent =
    event.headers["X-GitHub-Event"] || event.headers["X-Github-Event"];
  if (xGithubEvent !== "push") {
    return formatJSONResponse(200, {
      message: "X-GitHub-Event is not push. So do nothing to this event.",
    });
  }
  const sha = event.body.after;
  const installationId = event.body.installation.id;
  const repo = event.body.repository.name;
  const owner = event.body.repository.owner.login;
  const branch = event.body.ref.replace("refs/heads/", "");

  const jwt = await createJWT(installationId);
  const client = new GitHubRestClient(jwt);

  const jobsPage = "https://gitscope.vercel.app/jobs";

  const dao = new CommitAnalysisDao();

  await Promise.all([
    client.createCommitStatus({
      owner,
      repo,
      sha,
      state: "pending",
      target_url: jobsPage,
      description: "Waiting for calculate risk points.",
      context: "Risk Points",
    }),
    client.createCommitStatus({
      owner,
      repo,
      sha,
      state: "pending",
      target_url: jobsPage,
      description: "Waiting for calculate lead time",
      context: "Lead Time",
    }),
    dao.save({
      repositoryNameWithOwner: `${owner}/${repo}`,
      sha,
      state: "pending",
    }),
  ]);

  const { fileComplexities, riskPoint, leadTime, markdownStr } = await analyze(
    owner,
    repo,
    jwt,
    branch,
    sha
  );

  await Promise.all([
    dao.save({
      repositoryNameWithOwner: `${owner}/${repo}`,
      sha,
      state: "success",
      fileCompexities: fileComplexities,
      riskPoint,
      leadTime,
    }),
    client.createCommitComment({
      owner,
      repo,
      sha,
      body: markdownStr,
    }),
    client.createCommitStatus({
      owner,
      repo,
      sha,
      state: "success",
      target_url: jobsPage,
      description: `${riskPoint} / 100`,
      context: "Risk Points",
    }),
    client.createCommitStatus({
      owner,
      repo,
      sha,
      state: "success",
      target_url: jobsPage,
      description: `Open: ${leadTime.open}d, Work: ${leadTime.work}d, Review, ${leadTime.review}d`,
      context: "Lead Time",
    }),
  ]);

  return formatJSONResponse(200, { message: "ok" });
};

export const main = middify({ handler });
async function analyze(owner: any, repo: any, jwt: any, branch: any, sha: any) {
  // AWS Lambda only support /tmp directory.
  const workingDir = "/tmp/" + new Date().getTime() + "/" + owner + "/" + repo;
  const arranger = new GitHubCodeArranger();
  await arranger.cloneWithCheckout({
    login: owner,
    token: jwt,
    repositoryUrl: `github.com/${owner}/${repo}`,
    workingDir,
    branch,
    sha,
  });

  // TODO: validation
  const config = await fs
    .readFile(workingDir + "/.gitscope.config.json", "utf-8")
    .then((data) => JSON.parse(data))
    .catch((e) => {
      throw formatJSONResponse(400, {
        message:
          "The configuration file is invalid. To be sure the .gitscope.config.json at project root directory.",
        error: e,
      });
    });

  const calculator = new ComplexityCalculator();
  const fileComplexities = await calculator.getCollectedComplexityGlobFiles({
    target: workingDir + config.target,
    threshold: config.threshold,
  });

  const formattedFileComplexities = fileComplexities
    .sort((a, b) => {
      return b.complexity - a.complexity;
    })
    .map((file) => {
      const prefix = file.complexity > config.threshold ? "🚨" : "✅";
      return {
        File: file.file.replace(workingDir, ""),
        Complexity: prefix + " " + file.complexity,
      };
    });
  console.log(formattedFileComplexities);

  const markdownStr = tablemark(formattedFileComplexities.splice(0, 20)); // TOP 20

  // TODO: calculate
  const riskPoint = faker.datatype.number(100);
  const leadTime = {
    open: faker.datatype.number(5),
    work: faker.datatype.number(5),
    review: faker.datatype.number(5),
  };
  return { fileComplexities, riskPoint, leadTime, markdownStr };
}
