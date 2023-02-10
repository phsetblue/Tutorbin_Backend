import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, CALLBACK_URL_REGISTER } from './index.js'
import gs from 'passport-google-oauth20';
const { Strategy: GoogleStrategy } = gs;

export const passportConfigRegister = passport => {
    passport.use("register-google",new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: CALLBACK_URL_REGISTER
    },
        (accessToken, refreshToken, profile, done) => {
            // console.log("in register");
            const user = {
                name: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id
            };
            done(null, user);
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });
};
