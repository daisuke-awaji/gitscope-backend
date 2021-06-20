import { Handler } from "aws-lambda";
import { createJWT } from "../api/createGitHubAppJWT";
import { GitHubRestClient } from "../api/GitHubRestClient";
import { formatJSONResponse } from "../utils/apigateway";
import { middify } from "../utils/middify";
import GitHubCodeArranger from "../services/ComplexityCalculator/GitHubCodeArranger";
import ComplexityCalculator from "../services/ComplexityCalculator/ComplexityCalculator";
import tablemark from "tablemark";
import fs from "fs/promises";
import { CommitAnalysisDao } from "../dao/CommitAnalysisDao";
import PullRequestService from "../services/PullRequestService";

/**
 * 任意の桁で切り上げする関数
 * @param {number} value 四捨五入する数値
 * @param {number} base どの桁で四捨五入するか（10→10の位、0.1→小数第１位）
 * @return {number} 四捨五入した値
 */
function orgCeil(value: number, base: number) {
  return Math.ceil(value * base) / base;
}
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

  // AWS Lambda only support /tmp directory.
  // const workingDir = "/tmp/" + new Date().getTime() + "/" + owner + "/" + repo;
  const workingDir = `/tmp/${new Date().getTime()}/${owner}/${repo}`;
  const arranger = new GitHubCodeArranger();
  await arranger.cloneWithCheckout({
    login: owner,
    token: jwt,
    repositoryNameWithOwner: `${owner}/${repo}`,
    workingDir,
    branch,
    sha,
  });
  const createCommitStatus = ({ state, description, context }) => {
    return client.createCommitStatus({
      owner,
      repo,
      sha,
      state,
      target_url: jobsPage,
      description,
      context,
    });
  };

  const config = await fs
    .readFile(workingDir + "/.gitscope.config.json", "utf-8")
    .then((data) => JSON.parse(data))
    .catch((e) => {
      createCommitStatus({
        state: "error",
        description:
          "The configuration file is invalid. To be sure the .gitscope.config.json at project root directory.",
        context: "Config File Error",
      });
      dao.save({
        repositoryNameWithOwner,
        sha,
        state: "error",
      });
      throw formatJSONResponse(400, {
        message:
          "The configuration file is invalid. To be sure the .gitscope.config.json at project root directory.",
        error: e,
      });
    });

  const repositoryNameWithOwner = `${owner}/${repo}`;

  await Promise.all([
    createCommitStatus({
      state: "pending",
      description: "Waiting for calculate risk points.",
      context: "Risk Points",
    }),
    createCommitStatus({
      state: "pending",
      description: "Waiting for calculate lead time",
      context: "Lead Time",
    }),

    dao.save({
      repositoryNameWithOwner,
      sha,
      state: "pending",
    }),
  ]);

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

  const markdownStr = tablemark(formattedFileComplexities.splice(0, 20)); // TOP 20

  const service = new PullRequestService(jwt);
  const prs = await service.getPullRequestsBySha({
    repositoryNameWithOwner,
    sha,
  });

  // TODO: calculate
  const riskPoint = fileComplexities.reduce((prev, fileComplexity) => {
    return prev + fileComplexity.complexity;
  }, 0);

  const headCommitTimestamp =
    (new Date().getTime() -
      new Date(event.body.head_commit.timestamp).getTime()) /
    (60 * 60 * 24);
  const leadTime = {
    open: prs.length
      ? orgCeil(prs[0].firstCommitToPRCreated / (60 * 60 * 24), 100)
      : orgCeil(headCommitTimestamp, 100),
    work: prs.length
      ? orgCeil(prs[0].prCreatedAtToLastCommit / (60 * 60 * 24), 100)
      : 0,
    review: 0,
  };

  await Promise.all([
    dao.save({
      repositoryNameWithOwner,
      sha,
      state: "success",
      fileComplexities: fileComplexities.map((i) => ({
        file: i.file.replace(workingDir, ""),
        complexity: i.complexity,
      })),
      riskPoint,
      leadTime,
    }),

    client.createCommitComment({
      owner,
      repo,
      sha,
      body: `## Complexity Report 📊\n${markdownStr}`,
    }),
    createCommitStatus({
      state: "success",
      description: `${riskPoint}`,
      context: "Risk Points",
    }),
    createCommitStatus({
      state: "success",
      description: `Open: ${leadTime.open}d, Work: ${leadTime.work}d, Review, ${leadTime.review}d`,
      context: "Lead Time",
    }),
  ]);

  return formatJSONResponse(200, { message: "ok" });
};

export const main = middify({ handler });
