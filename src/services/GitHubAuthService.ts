import * as querystring from "querystring";
import axios from "axios";

type TokenResponse = {
  access_token: string;
  token_type: string;
  scope: string;
};

class GitHubAuthService {
  async getAccessToken(code: string): Promise<string> {
    const param = {
      code,
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
    };

    const GITHUB_TOKEN_ENDPOINT = "https://github.com/login/oauth/access_token";

    const res = await axios.post<TokenResponse>(
      `${GITHUB_TOKEN_ENDPOINT}?${querystring.stringify(param)}`,
      {},
      {
        headers: {
          accept: "application/json",
        },
      }
    );

    return res.data.access_token;
  }
}

export default GitHubAuthService;
