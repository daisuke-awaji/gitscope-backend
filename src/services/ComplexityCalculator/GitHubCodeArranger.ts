import git from "simple-git/promise";
import { promises as fs } from "fs";

type CheckoutCommitParam = {
  login: string;
  token: string;
  repositoryUrl: string;
  workingDir: string;
  branch: string;
  sha: string;
};
class GitHubCodeArranger {
  async cloneWithCheckout(param: CheckoutCommitParam) {
    const { login, token, repositoryUrl, workingDir, branch, sha } = param;

    const remote = `https://${login}:${token}@${repositoryUrl}`;

    const directoryCreated = await fs
      .access(workingDir)
      .then(() => true)
      .catch(() => false);

    if (!directoryCreated) {
      const cloneOptions = ["--branch", branch];
      console.log({ message: "clone", remote, workingDir, cloneOptions });
      await git().clone(remote, workingDir, cloneOptions);
    }

    const localGit = git(workingDir);
    console.log({ message: "checkout", remote, workingDir });
    await localGit.checkout(sha);
  }
}

export default GitHubCodeArranger;
