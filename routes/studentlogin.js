import express from "express";
import { studentController } from "../controller/index.js";
import { passportConfigLogin } from '../config/passportstudentlogin.js';
import passport from 'passport';
import session from 'express-session';
import MongoStore from 'connect-mongo';
// import studentController from "../controller/studentController.js";
const router = express.Router();

router.use(express.urlencoded({ extended: false }));
router.use(express.json());

// console.log("in login");

router.get("/login/", (req, res) => {
    res.render('studentlogin');
});


router.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL })
    //   store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
router.use(passport.initialize());
router.use(passport.session());

// Passport Configuration
// console.log("here");
passportConfigLogin(passport);

router.get("/login/auth/google", passport.authenticate("login-google", { scope: ['profile', 'email'] }));

router.get("/login/auth/google/callback",
    passport.authenticate("login-google", { failureRedirect: '/student/login' }),
    studentController.googlelogin
);
router.post("/login/email", studentController.emaillogin);
export default router;