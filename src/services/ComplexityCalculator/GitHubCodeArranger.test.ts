import GitHubCodeArranger from "./GitHubCodeArranger";
import path from "path";

describe("", () => {
  beforeAll(() => {
    jest.setTimeout(1000000);
  });
  it.skip("get complexity from glob files", async (done) => {
    const checkoutCode = new GitHubCodeArranger();
    const workingDir = path.resolve() + "/work";
    await checkoutCode.cloneWithCheckout({
      login: "xxxxxx",
      token: "xxxxxxxx",
      repositoryUrl: "github.com/owner/repo",
      branch: "branch",
      workingDir,
      sha: "7d0e4e9f5d5a9251383e94c47caeb305cfd9306d",
    });
    done();
  });
});
