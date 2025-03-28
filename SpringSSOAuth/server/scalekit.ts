import axios from "axios";

// Check if environment variables are set
const SCALEKIT_ENVIRONMENT_URL = process.env.SCALEKIT_ENVIRONMENT_URL;
const SCALEKIT_CLIENT_ID = process.env.SCALEKIT_CLIENT_ID;
const SCALEKIT_CLIENT_SECRET = process.env.SCALEKIT_CLIENT_SECRET;

// Verify essential environment variables are set
if (!SCALEKIT_ENVIRONMENT_URL || !SCALEKIT_CLIENT_ID || !SCALEKIT_CLIENT_SECRET) {
  console.warn("Scalekit environment variables not set. Scalekit authentication will not work.");
}

// Define the redirect URI
const REDIRECT_URI = `${process.env.APP_URL || "http://localhost:5000"}/api/auth/callback`;

// Define interfaces for user profile and token response
export interface ScalekitUserProfile {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Generates the authorization URL to redirect the user to Scalekit's login page
 * @param state A unique state value to prevent CSRF attacks
 * @returns The authorization URL
 */
export function getAuthorizationUrl(state: string): string {
  if (!SCALEKIT_ENVIRONMENT_URL || !SCALEKIT_CLIENT_ID) {
    throw new Error("Scalekit environment variables not set");
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SCALEKIT_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'openid profile email',
    state
  });

  return `${SCALEKIT_ENVIRONMENT_URL}/oauth2/authorize?${params.toString()}`;
}

/**
 * Exchanges an authorization code for access and refresh tokens
 * @param code The authorization code returned by Scalekit
 * @returns TokenResponse containing access_token, refresh_token, etc.
 */
export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  if (!SCALEKIT_ENVIRONMENT_URL || !SCALEKIT_CLIENT_ID || !SCALEKIT_CLIENT_SECRET) {
    throw new Error("Scalekit environment variables not set");
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: SCALEKIT_CLIENT_ID,
    client_secret: SCALEKIT_CLIENT_SECRET
  });

  try {
    const response = await axios.post(
      `${SCALEKIT_ENVIRONMENT_URL}/oauth2/token`,
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    throw error;
  }
}

/**
 * Gets user information using an access token
 * @param accessToken The access token from exchangeCodeForTokens
 * @returns User profile information
 */
export async function getUserInfo(accessToken: string): Promise<ScalekitUserProfile> {
  if (!SCALEKIT_ENVIRONMENT_URL) {
    throw new Error("Scalekit environment URL not set");
  }

  try {
    const response = await axios.get(`${SCALEKIT_ENVIRONMENT_URL}/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error getting user info:', error);
    throw error;
  }
}

/**
 * Refreshes an access token using a refresh token
 * @param refreshToken The refresh token
 * @returns New token response
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  if (!SCALEKIT_ENVIRONMENT_URL || !SCALEKIT_CLIENT_ID || !SCALEKIT_CLIENT_SECRET) {
    throw new Error("Scalekit environment variables not set");
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: SCALEKIT_CLIENT_ID,
    client_secret: SCALEKIT_CLIENT_SECRET
  });

  try {
    const response = await axios.post(
      `${SCALEKIT_ENVIRONMENT_URL}/oauth2/token`,
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
}