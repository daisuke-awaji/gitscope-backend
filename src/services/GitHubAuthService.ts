import * as querystring from "querystring";
import axios from "axios";

type TokenResponse = {
  access_token: string;
  expires_in: number; // e.g. 28800
  refresh_token: string;
  refresh_token_expires_in: number; // e.g. 15897600,
  token_type: string; // e.g. bearer
  scope: string;
};

class GitHubAuthService {
  async getAccessToken(code: string): Promise<TokenResponse> {
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

    return res.data;
  }

  async getAccessTokenUsingRefreshToken(
    refreshToken: string
  ): Promise<TokenResponse> {
    const param = {
      refresh_token: refreshToken,
      grant_type: "refresh_token",
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

    return res.data;
  }
}

export default GitHubAuthService;
