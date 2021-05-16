import { createAppAuth } from '@octokit/auth-app';

// This function creates a JWT that you can use with
// Axios or any other HTTP client to make requests to
// GitHub as your app.

export async function createJWT(installationId) {
  const option = {
    appId: '115554',
    privateKey: process.env.GITHUB_APPS_PRIVATE_KEY,
    installationId,
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  };
  const auth = createAppAuth(option);
  const authentication = await auth({ type: 'installation' });
  return (authentication as any).token;
}
