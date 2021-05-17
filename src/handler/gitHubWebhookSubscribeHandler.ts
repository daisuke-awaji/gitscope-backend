import { Handler } from "aws-lambda";
import { createJWT } from "../services/createGitHubAppJWT";
import { GitHubRestClient } from "../services/GitHubRestClient";
import { formatJSONResponse } from "../utils/apigateway";
import { middify } from "../utils/middify";
import faker from "faker";
import GitHubCodeArranger from "../services/ComplexityCalculator/GitHubCodeArranger";
import ComplexityCalculator from "../services/ComplexityCalculator/ComplexityCalculator";
import tablemark from "tablemark";

const sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));

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

  const jwt = await createJWT(installationId);
  const client = new GitHubRestClient(jwt);

  const jobsPage = "https://gitscope.vercel.app/jobs";

  // TODO: calucutlate xxx for push event.
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
  ]);

  // AWS Lambda only support /tmp directory.
  const workingDir = "/tmp/" + new Date().getTime() + "/" + owner + "/" + repo;
  const arranger = new GitHubCodeArranger();
  await arranger.cloneWithCheckout({
    login: owner,
    token: jwt,
    repositoryUrl: `github.com/${owner}/${repo}`,
    workingDir,
    branch: event.body.ref.replace("refs/heads/", ""),
    sha,
  });

  const config = {
    target: workingDir + "/**/*.{js,ts}", // TODO: read from config file
    threshold: 4,
  };
  const calculator = new ComplexityCalculator();
  const result = await calculator.getCollectedComplexityGlobFiles(config);

  const fileComplexities = result.map((file) => {
    const prefix = file.complexity > config.threshold ? "🚨" : "✅";
    return {
      File: file.file.replace(workingDir, ""),
      Complexity: prefix + " " + file.complexity,
    };
  });
  console.log(fileComplexities);

  const markdownStr = tablemark(fileComplexities);

  await Promise.all([
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
      description: `${faker.datatype.number(100)} / 100`,
      context: "Risk Points",
    }),
    client.createCommitStatus({
      owner,
      repo,
      sha,
      state: "success",
      target_url: jobsPage,
      description: `Open: ${faker.datatype.number(
        3
      )}d, Work: ${faker.datatype.number(3)}d, Review, ${faker.datatype.number(
        3
      )}d`,
      context: "Lead Time",
    }),
  ]);

  return formatJSONResponse(200, { message: "ok" });
};

export const main = middify({ handler });
