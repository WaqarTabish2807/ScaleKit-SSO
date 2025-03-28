import { Express, Request, Response, NextFunction } from "express";
import { randomBytes } from "crypto";
import { storage } from "./storage";
import { generateToken } from "./auth";
import { ScalekitUserProfile, TokenResponse, getAuthorizationUrl, exchangeCodeForTokens, getUserInfo } from "./scalekit";
import { Session } from "express-session";

// Extend the session type to include our custom properties
declare module "express-session" {
  interface Session {
    scalekitState?: string;
  }
}

/**
 * Set up Scalekit authentication routes
 * @param app Express application
 */
export function setupScalekitAuth(app: Express) {
  // Generate a login URL for Scalekit
  app.get("/api/auth/scalekit", (req, res) => {
    // Generate a random state value to prevent CSRF attacks
    const state = randomBytes(16).toString("hex");
    // Store the state in the session for validation later
    req.session.scalekitState = state;
    
    // Generate and redirect to Scalekit authorization URL
    const authUrl = getAuthorizationUrl(state);
    res.json({ url: authUrl });
  });

  // Handle the callback from Scalekit after user authentication
  app.get("/api/auth/callback", async (req, res, next) => {
    try {
      const { code, state } = req.query;
      
      // Validate state parameter to prevent CSRF attacks
      if (!state || state !== req.session.scalekitState) {
        return res.status(400).json({ message: "Invalid state parameter" });
      }
      
      // Clear the state from session
      delete req.session.scalekitState;
      
      if (!code) {
        return res.status(400).json({ message: "Authorization code missing" });
      }
      
      // Exchange authorization code for access and refresh tokens
      const tokenResponse: TokenResponse = await exchangeCodeForTokens(code as string);
      
      // Get user profile information using the access token
      const userProfile: ScalekitUserProfile = await getUserInfo(tokenResponse.access_token);
      
      // Check if we already have this user in our database
      let user = await storage.getUserByScalekitId(userProfile.id);
      
      if (!user) {
        // If we don't have this user yet, check if the email is already registered
        if (userProfile.email) {
          const existingUserByEmail = await storage.getUserByEmail(userProfile.email);
          if (existingUserByEmail) {
            // Update the existing user with Scalekit ID and tokens
            user = await storage.updateUserTokens(
              existingUserByEmail.id,
              tokenResponse.access_token,
              tokenResponse.refresh_token,
              tokenResponse.id_token,
              Math.floor(Date.now() / 1000) + tokenResponse.expires_in
            );
          }
        }
        
        // If we still don't have a user, create a new one
        if (!user) {
          user = await storage.createScalekitUser({
            username: userProfile.username || userProfile.email || `user_${userProfile.id}`,
            email: userProfile.email || null,
            scalekit_id: userProfile.id,
            first_name: userProfile.firstName || null,
            last_name: userProfile.lastName || null,
            access_token: tokenResponse.access_token,
            refresh_token: tokenResponse.refresh_token,
            id_token: tokenResponse.id_token,
            token_expires_at: Math.floor(Date.now() / 1000) + tokenResponse.expires_in
          });
        }
      } else {
        // Update the tokens for an existing Scalekit user
        user = await storage.updateUserTokens(
          user.id,
          tokenResponse.access_token,
          tokenResponse.refresh_token,
          tokenResponse.id_token,
          Math.floor(Date.now() / 1000) + tokenResponse.expires_in
        );
      }
      
      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Generate a JWT token for the user
        const token = generateToken(user);
        
        // Redirect to the frontend with tokens as query parameters
        res.redirect(`/?token=${token}`);
      });
    } catch (error) {
      console.error("Scalekit authentication error:", error);
      next(error);
    }
  });
}