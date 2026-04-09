const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Ensure environment variables are loaded
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error("CRITICAL ERROR: Google OAuth credentials are missing in .env");
}

console.log("Passport Google Config Loaded:");
console.log("  ClientID:", process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 10) + "..." : "MISSING");
console.log("  Callback:", process.env.GOOGLE_CALLBACK_URL);

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          console.log("Google Strategy: Profile received", profile.emails[0].value);

          const user = {
            name: profile.displayName,
            email: profile.emails[0]?.value,
            googleId: profile.id,
            avatar: profile.photos[0]?.value,
            provider: "google",
          };

          return done(null, user);
        } catch (error) {
          console.error("Google Strategy Callback Error:", error);
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn("WARNING: Google OAuth strategy NOT initialized due to missing credentials.");
}

module.exports = passport;
