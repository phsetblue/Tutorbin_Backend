import { Tutor, TutorInformation, TokenTutor, TutorWallet, TutorQuestions } from "../model/index.js";
import { TutorInformationSchema, TutorRegisterSchema, TutorWalletSchema, TutorQuestionsSchema } from "../schema/index.js";
import { TutorRegisterValidatorSchema, refreshTokenValidatorSchema, TutorLoginValidatorSchema, TutorSetInfoValidatorSchema, TutorChangePasswordValidatorSchema, TutorGoogleRegister2ValidatorSchema } from "../validators/index.js";
import CustomErrorHandler from "../service/CustomErrorHandler.js";
import bcrypt from "bcrypt";
import JwtService from "../service/JwtService.js";
import { TokenTutorSchema } from "../schema/index.js";
import { APP_URL, SALT_FACTOR } from "../config/index.js";
import crypto from 'crypto';


function generateReferralCode(userId) {
    const hash = crypto.createHash('sha256');
    hash.update(userId + Date.now().toString());
    return hash.digest('hex').substring(0, 12);
}

const tutorController = {
    async googleregister(req, res, next) {
        try {
            const user = new TutorRegisterSchema({
                email: req.user.email,
                googleId: req.user.googleId,
                registerType: "google"
            });
            var aa = await Tutor.create(user);

            if (!aa.error) {
                // console.log(aa);
                let refresh_token;
                // access_token = await JwtService.sign({_id:document._id});
                refresh_token = await JwtService.sign({ _id: aa._id });
                var tt = await TokenTutorSchema.create({ _id: aa._id, token: refresh_token, expiresAt: new Date() });
                let token = refresh_token;
                var info = aa;
                var message = "Tutor Registered Successfully. now redirect to password, reffral page.";
                res.status(200).json({ info, token, message });
                // res.redirect("/student/home");
            } else {
                res.status(400).json({ "error": aa.error });
                // res.redirect("/student/register");
            }
        } catch (error) {
            // originally
            // res.json({"message": "Error in registration"});
            console.log(error);
            res.redirect("/tutor/register");
        }
    },
    async googleregister2(req, res, next) {
        try {
            const { error } = TutorGoogleRegister2ValidatorSchema.validate(req.body);
            if (error) {
                return res.json({ "error": error.message });
            }

            let rec_token = await TokenTutor.fetchByToken({ token: req.body.token });
            if (rec_token === null || !rec_token.token) {
                return res.status(400).json({ "error": "Invalid refresh token!" });
            }

            var st_id = rec_token._id;

            let { password } = req.body;
            const salt = await bcrypt.genSalt(parseInt(SALT_FACTOR));
            const hashedPassword = await bcrypt.hash(password, salt);
            req.body.password = hashedPassword;
            var user;
            if (req.body.referralCode) {
                user = await TutorRegisterSchema.findByIdAndUpdate(st_id, {
                    password: req.body.password,
                    class: req.body.class,
                    referralCode: req.body.referralCode
                }, { new: true });
            } else {
                user = await TutorRegisterSchema.findByIdAndUpdate(st_id, {
                    password: req.body.password,
                    class: req.body.class
                }, { new: true });
            }

            var wal = await TutorWallet.create({studentId: user._id});
            var st_qu = await TutorQuestions.create({studentId: user._id});

            var info = user;
            var message = "User Registered Successfully.";
            res.status(200).json({ info, token: req.body.token, message });

        } catch (err) {
            return next(err);
        }
    },
    async emailregister(req, res, next) {
        try {
            const { error } = TutorRegisterValidatorSchema.validate(req.body);
            if (error) {
                res.json({ "error": error.message });
            }
            const { password } = req.body;
            const salt = await bcrypt.genSalt(parseInt(SALT_FACTOR));
            const hashedPassword = await bcrypt.hash(password, salt);
            req.body.password = hashedPassword;

            var user;

            if (req.body.referralCode) {
                user = new TutorRegisterSchema({
                    email: req.body.email,
                    password: req.body.password,
                    registerType: "email",
                    class: req.body.class,
                    referralCode: req.body.referralCode
                });
            } else {
                user = new TutorRegisterSchema({
                    email: req.body.email,
                    password: req.body.password,
                    registerType: "email",
                    class: req.body.class
                });
            }


            var aa = await Tutor.create(user);
            // console.log(aa);

            if (!aa.error) {
                // console.log(aa);
                let refresh_token;
                // access_token = await JwtService.sign({_id:document._id});
                refresh_token = await JwtService.sign({ _id: aa._id });
                var tt = await TokenTutorSchema.create({ _id: aa._id, token: refresh_token, expiresAt: new Date() });
                let token = refresh_token;
                var wal = await TutorWallet.create({studentId: aa._id});
                var st_qu = await TutorQuestions.create({studentId: aa._id});
                var info = aa;
                var message = "User Registered Successfully.";
                res.status(200).json({ info, token, message });
                // res.json(aa);
                // res.redirect("/student/home");
            } else {
                res.status(400).json({ "error": aa.error });
                // res.redirect("/student/register");
            }

        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    },
    async googlelogin(req, res, next) {
        try {
            // const user = new TutorRegisterSchema({
            //     email: req.user.email,
            //     googleId: req.user.googleId,
            //     registerType: "google"
            // });
            // var aa = await Tutor.create(user);
            let email = req.user.email;
            let googleId = req.user.googleId;

            const user = await Tutor.fetchById({ email: email });
            // if(!user) return next(CustomErrorHandler.wrongCredential());
            if (!user) {
                return res.status(400).json({ "error": "Email is not Registered!" });
            }

            if (user.googleId !== googleId) {
                return res.status(400).json({ "error": "This Email is not Registered with Google!" });
            }

            var refresh_token;
            try {
                var r_t = await TokenTutor.fetchById({ _id: user._id });
                // console.log(`r_t = ${r_t}`);
                if (r_t === "al") {
                    refresh_token = await JwtService.sign({ _id: user._id });
                    // user.token = refresh_token;
                    console.log("New Generated");

                    await TokenTutorSchema.create({ _id: user._id, token: refresh_token, expiresAt: new Date() });

                } else {
                    refresh_token = r_t.token;
                    // console.log("already exist");
                }
            } catch (error) {
                console.log("error generated");
            }
            var message = "User Login Successfully.";
            var info = user;
            res.status(200).json({ info, token: refresh_token, message });
        } catch (err) {
            return next(err);
        }
    },
    async emaillogin(req, res, next) {
        try {
            const { error } = TutorLoginValidatorSchema.validate(req.body);
            if (error) {
                res.json({ "error": error.message });
            }
            let { email, password } = req.body;
            const user = await Tutor.fetchById({ email: email });
            // if(!user) return next(CustomErrorHandler.wrongCredential());
            if (!user) {
                return res.status(400).json({ "error": "Email is not Registered!" });
            }

            const match = await bcrypt.compare(password, user.password);
            // if(!match) return next(CustomErrorHandler.wrongCredential());
            if (!match) {
                return res.status(400).json({ "error": "Please Write correct password!" });
            }

            var refresh_token;
            try {
                var r_t = await TokenTutor.fetchById({ _id: user._id });
                // console.log(`r_t = ${r_t}`);
                if (r_t === "al") {
                    refresh_token = await JwtService.sign({ _id: user._id });
                    // user.token = refresh_token;
                    console.log("New Generated");

                    await TokenTutorSchema.create({ _id: user._id, token: refresh_token, expiresAt: new Date() });
                    
                } else {
                    refresh_token = r_t.token;
                    // console.log("already exist");
                }
            } catch (error) {
                console.log("error generated");
            }
            var message = "User Login Successfully.";
            var info = user;
            res.status(200).json({ info, token: refresh_token, message });
        } catch (err) {
            return next(err);
        }
    },
    async logout(req, res, next) {
        try {
            const { error } = refreshTokenValidatorSchema.validate(req.body);
            if (error) {
                res.status(400).json({ "error": error.message });
            }
            console.log({ token: req.body.token });
            let rec_token = await TokenTutor.fetchByToken({ token: req.body.token });
            if (rec_token === null || !rec_token.token) {
                res.status(400).json({ "error": "Invalid refresh token!" });
            }

            const del = await TokenTutor.delete({ token: rec_token.token });
            // console.log(del);
            if (del.acknowledged === true) {
                res.status(200).json({ message: "Logged out successful" });
            } else {
                res.status(400).json({ error: "Error in Logging out Tutor!" });
            }
        } catch (err) {
            console.log(err);
            return next(CustomErrorHandler.somethingwrong());
        }
    },
    async getinfo(req, res, next) {
        try {
            const { error } = refreshTokenValidatorSchema.validate(req.body);
            if (error) {
                res.status(400).json({ "error": error.message });
            }
            // console.log({ token: req.body.token });
            let rec_token = await TokenTutor.fetchByToken({ token: req.body.token });
            if (rec_token === null || !rec_token.token) {
                res.status(400).json({ "error": "Invalid refresh token!" });
            }

            var st_id = rec_token._id;

            var info = await TutorInformation.fetchById({ userId: st_id });
            var message = "User details Fetched Successfully.";
            res.status(200).json({ info, message });



        } catch (err) {
            console.log(err);
            return next(CustomErrorHandler.somethingwrong());
        }
    },
    async setinfo(req, res, next) {
        try {
            const { error } = TutorSetInfoValidatorSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ "error": error.message });
            }
            console.log({ token: req.body.token });
            let rec_token = await TokenTutor.fetchByToken({ token: req.body.token });
            if (rec_token === null || !rec_token.token) {
                return res.status(400).json({ "error": "Invalid refresh token!" });
            }

            var st_id = rec_token._id;
            const { name, email, board, city, school } = req.body;
            let st_info = await TutorInformation.fetchById({ userId: st_id });
            if (st_info) {
                var updated_st = await TutorInformationSchema.findByIdAndUpdate(st_info._id, {
                    name,
                    email,
                    board,
                    city,
                    school
                }, { new: true });
                const message = "Tutor Information Created Successfully.";
                res.status(200).json({ updated_st, message });
            } else {
                const ownReferral = generateReferralCode(st_id);
                var new_st = new TutorInformationSchema({
                    userId: st_id,
                    name,
                    email,
                    board,
                    city,
                    school,
                    ownReferral
                });

                var info = await TutorInformation.create(new_st);
                const message = "Tutor Information Created Successfully.";
                res.status(200).json({ info, message });
            }
        } catch (err) {
            console.log(err);
            return next(CustomErrorHandler.somethingwrong());
        }
    },
    async changepassword(req, res, next) {
        try {
            const { error } = TutorChangePasswordValidatorSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ "error": error.message });
            }
            // console.log({ token: req.body.token });
            let rec_token = await TokenTutor.fetchByToken({ token: req.body.token });
            if (rec_token === null || !rec_token.token) {
                return res.status(400).json({ "error": "Invalid refresh token!" });
            }
            const { password, new_password } = req.body;

            const salt = await bcrypt.genSalt(parseInt(SALT_FACTOR));
            const hashedPassword = await bcrypt.hash(new_password, salt);
            // new_password = hashedPassword;
            var st_id = rec_token._id;

            var data = await Tutor.fetchById({ _id: st_id });

            const match = await bcrypt.compare(password, data.password);
            // if(!match) return next(CustomErrorHandler.wrongCredential());
            if (!match) {
                return res.status(400).json({ "error": "Please Enter correct current password!" });
            }

            var new_data = await TutorRegisterSchema.findByIdAndUpdate(st_id, { password: hashedPassword }, { new: true })

            const message = "Tutor Password Changed Successfully.";
            res.status(200).json({ message });



        } catch (err) {
            console.log(err);
            return next(CustomErrorHandler.somethingwrong());
        }
    },
};
export default tutorController;