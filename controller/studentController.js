import { Student, StudentInformation, TokenStudent } from "../model/index.js";
import { StudentInformationSchema, StudentRegisterSchema } from "../schema/index.js";
import { StudentRegisterValidatorSchema, refreshTokenValidatorSchema, StudentLoginValidatorSchema, StudentSetInfoValidatorSchema, StudentChangePasswordValidatorSchema } from "../validators/index.js";
import CustomErrorHandler from "../service/CustomErrorHandler.js";
import bcrypt from "bcrypt";
import JwtService from "../service/JwtService.js";
import { TokenStudentSchema } from "../schema/index.js";
import { APP_URL, SALT_FACTOR } from "../config/index.js";
import studentregister from "../schema/studentregister.js";
import crypto from 'crypto';


function generateReferralCode(userId) {
    const hash = crypto.createHash('sha256');
    hash.update(userId + Date.now().toString());
    return hash.digest('hex').substring(0, 12);
}

const studentController = {
    async googleregister(req, res, next) {
        try {
            const user = new StudentRegisterSchema({
                email: req.user.email,
                googleId: req.user.googleId,
                registerType: "google"
            });
            var aa = await Student.create(user);

            if (!aa.error) {
                // console.log(aa);
                let refresh_token;
                // access_token = await JwtService.sign({_id:document._id});
                refresh_token = await JwtService.sign({ _id: aa._id });
                var tt = await TokenStudentSchema.create({ _id: aa._id, token: refresh_token, expiresAt: new Date() });
                let token = refresh_token;
                var info = aa;
                var message = "User Registered Successfully.";
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
            res.redirect("/student/register");
        }
    },
    async emailregister(req, res, next) {
        try {
            const { error } = StudentRegisterValidatorSchema.validate(req.body);
            if (error) {
                res.json({ "error": error.message });
            }
            const { password } = req.body;
            const salt = await bcrypt.genSalt(parseInt(SALT_FACTOR));
            const hashedPassword = await bcrypt.hash(password, salt);
            req.body.password = hashedPassword;

            var user;

            if (req.body.referralCode) {
                user = new StudentRegisterSchema({
                    email: req.body.email,
                    password: req.body.password,
                    registerType: "email",
                    class: req.body.class,
                    referralCode: req.body.referralCode
                });
            } else {
                user = new StudentRegisterSchema({
                    email: req.body.email,
                    password: req.body.password,
                    registerType: "email",
                    class: req.body.class
                });
            }


            var aa = await Student.create(user);

            if (!aa.error) {
                // console.log(aa);
                let refresh_token;
                // access_token = await JwtService.sign({_id:document._id});
                refresh_token = await JwtService.sign({ _id: aa._id });
                var tt = await TokenStudentSchema.create({ _id: aa._id, token: refresh_token, expiresAt: new Date() });
                let token = refresh_token;
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

        }
    },
    async googlelogin(req, res, next) {
        try {
            // const user = new StudentRegisterSchema({
            //     email: req.user.email,
            //     googleId: req.user.googleId,
            //     registerType: "google"
            // });
            // var aa = await Student.create(user);
            let email = req.user.email;
            let googleId = req.user.googleId;

            const user = await Student.fetchById({ email: email });
            // if(!user) return next(CustomErrorHandler.wrongCredential());
            if (!user) {
                return res.status(400).json({ "error": "Email is not Registered!" });
            }

            if (user.googleId !== googleId) {
                return res.status(400).json({ "error": "This Email is not Registered with Google!" });
            }

            var refresh_token;
            try {
                var r_t = await TokenStudent.fetchById({ _id: user._id });
                // console.log(`r_t = ${r_t}`);
                if (r_t === "al") {
                    refresh_token = await JwtService.sign({ _id: user._id });
                    // user.token = refresh_token;
                    console.log("New Generated");

                    await TokenStudentSchema.create({ _id: user._id, token: refresh_token, expiresAt: new Date() });

                } else {
                    refresh_token = r_t.token;
                    // console.log("already exist");
                }
            } catch (error) {
                console.log("error generated");
            }
            var message = "User Login Successfully.";
            var info = user;
            res.status(200).json({ info, token : refresh_token, message });
        } catch (err) {
            return next(err);
        }
    },
    async emaillogin(req, res, next) {
        try {
            const { error } = StudentLoginValidatorSchema.validate(req.body);
            if (error) {
                res.json({ "error": error.message });
            }
            let { email, password } = req.body;
            const user = await Student.fetchById({ email: email });
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
                var r_t = await TokenStudent.fetchById({ _id: user._id });
                // console.log(`r_t = ${r_t}`);
                if (r_t === "al") {
                    refresh_token = await JwtService.sign({ _id: user._id });
                    // user.token = refresh_token;
                    console.log("New Generated");

                    await TokenStudentSchema.create({ _id: user._id, token: refresh_token, expiresAt: new Date() });

                } else {
                    refresh_token = r_t.token;
                    // console.log("already exist");
                }
            } catch (error) {
                console.log("error generated");
            }
            var message = "User Login Successfully.";
            var info = user;
            res.status(200).json({ info, token : refresh_token, message });
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
            let rec_token = await TokenStudent.fetchByToken({ token: req.body.token });
            if (rec_token === null || !rec_token.token) {
                res.status(400).json({ "error": "Invalid refresh token!" });
            }

            const del = await TokenStudent.delete({ token: rec_token.token });
            // console.log(del);
            if (del.acknowledged === true) {
                res.status(200).json({ message: "Logged out successful" });
            } else {
                res.status(400).json({ error: "Error in Logging out Student!" });
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
            console.log({ token: req.body.token });
            let rec_token = await TokenStudent.fetchByToken({ token: req.body.token });
            if (rec_token === null || !rec_token.token) {
                res.status(400).json({ "error": "Invalid refresh token!" });
            }

            var st_id = rec_token._id;

            var info = await StudentInformation.fetchById({ userId: st_id });
            var message = "User details Fetched Successfully.";
            res.status(200).json({info, message});



        } catch (err) {
            console.log(err);
            return next(CustomErrorHandler.somethingwrong());
        }
    },
    async setinfo(req, res, next) {
        try {
            const { error } = StudentSetInfoValidatorSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ "error": error.message });
            }
            console.log({ token: req.body.token });
            let rec_token = await TokenStudent.fetchByToken({ token: req.body.token });
            if (rec_token === null || !rec_token.token) {
                return res.status(400).json({ "error": "Invalid refresh token!" });
            }

            var st_id = rec_token._id;
            const { name, email, board, city, school } = req.body;
            let st_info = await StudentInformation.fetchById({ userId: st_id });
            if (st_info) {
                var updated_st = await StudentInformationSchema.findByIdAndUpdate(st_info._id, {
                    name,
                    email,
                    board,
                    city,
                    school
                }, { new: true });
                const message = "Student Information Created Successfully.";
                res.status(200).json({ updated_st, message });
            } else {
                const ownReferral = generateReferralCode(st_id);
                var new_st = new StudentInformationSchema({
                    userId: st_id,
                    name,
                    email,
                    board,
                    city,
                    school,
                    ownReferral
                });

                var info = await StudentInformation.create(new_st);
                const message = "Student Information Created Successfully.";
                res.status(200).json({ info, message });
            }
        } catch (err) {
            console.log(err);
            return next(CustomErrorHandler.somethingwrong());
        }
    },
    async changepassword(req, res, next) {
        try {
            const { error } = StudentChangePasswordValidatorSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ "error": error.message });
            }
            // console.log({ token: req.body.token });
            let rec_token = await TokenStudent.fetchByToken({ token: req.body.token });
            if (rec_token === null || !rec_token.token) {
                return res.status(400).json({ "error": "Invalid refresh token!" });
            }
            const { password, new_password } = req.body;

            const salt = await bcrypt.genSalt(parseInt(SALT_FACTOR));
            const hashedPassword = await bcrypt.hash(new_password, salt);
            // new_password = hashedPassword;
            var st_id = rec_token._id;

            var data = await Student.fetchById({ _id: st_id });

            const match = await bcrypt.compare(password, data.password);
            // if(!match) return next(CustomErrorHandler.wrongCredential());
            if (!match) {
                return res.status(400).json({ "error": "Please Enter correct current password!" });
            }

            var new_data = await StudentRegisterSchema.findByIdAndUpdate(st_id, { password: hashedPassword }, { new: true })

            const message = "Student Password Changed Successfully.";
            res.status(200).json({ message });



        } catch (err) {
            console.log(err);
            return next(CustomErrorHandler.somethingwrong());
        }
    },
};
export default studentController;