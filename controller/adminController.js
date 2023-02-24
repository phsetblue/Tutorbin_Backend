import { Admin } from "../model/index.js";
import { AdminSchema } from "../schema/index.js";
import { AdminRegisterValidatorSchema, AdminLoginValidatorSchema, refreshTokenValidatorSchema } from "../validators/index.js";
import CustomErrorHandler from "../service/CustomErrorHandler.js";
import bcrypt from "bcrypt";
import JwtService from "../service/JwtService.js";
import { TokenAdminSchema } from "../schema/index.js";
import { APP_URL, SALT_FACTOR } from "../config/index.js";
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)





// multer for image save 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDirectory = path.join(__dirname, '..', 'uploads');
        console.log(uploadDirectory);

        // Create the upload directory if it doesn't exist
        fs.mkdir(uploadDirectory, { recursive: true }, function (err) {
            if (err) return cb(err);
            cb(null, uploadDirectory);
        });
    },
    filename: function (req, file, cb) {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1000000 // 1000000 Bytes = 1 MB
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg)$/)) {
            // upload only png and jpg format
            return cb(new Error('Please upload a Image'))
        }
        cb(undefined, true)
    }
});


// multer ends here


const adminController = {
    async register(req, res, next) {
        try {
            const { error } = AdminRegisterValidatorSchema.validate(req.body);
            if (error) {
                res.json({ "error": error.message });
            }
            const { username, email, password } = req.body;
            const salt = await bcrypt.genSalt(parseInt(SALT_FACTOR));
            const hashedPassword = await bcrypt.hash(password, salt);
            req.body.password = hashedPassword;

            var user;

            user = new AdminSchema({
                username,
                email,
                password: req.body.password,
            });
        
            var aa = await Admin.create(user);
            // console.log(aa);

            if (!aa.error) {
                // console.log(aa);
                let refresh_token;
                // access_token = await JwtService.sign({_id:document._id});
                refresh_token = await JwtService.sign({ _id: aa._id });
                var tt = await TokenAdminSchema.create({ _id: aa._id, token: refresh_token, expiresAt: new Date() });
                let token = refresh_token;
                var info = aa;
                var message = "Admin Registered Successfully.";
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
    async login(req, res, next) {
        try {
            const { error } = AdminLoginValidatorSchema.validate(req.body);
            if (error) {
                res.json({ "error": error.message });
            }
            let { email, password } = req.body;
            const user = await Admin.fetchById({ email: email });
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
                var r_t = await TokenAdmin.fetchById({ _id: user._id });
                // console.log(`r_t = ${r_t}`);
                if (r_t === "al") {
                    refresh_token = await JwtService.sign({ _id: user._id });
                    // user.token = refresh_token;
                    console.log("New Generated");

                    await TokenAdminSchema.create({ _id: user._id, token: refresh_token, expiresAt: new Date() });

                } else {
                    refresh_token = r_t.token;
                    // console.log("already exist");
                }
            } catch (error) {
                
                console.log("error generated");
            }
            var message = "Tutor Login Successfully.";
            var info = user;
            console.log(refresh_token);
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
            let rec_token = await TokenAdmin.fetchByToken({ token: req.body.token });
            if (rec_token === null || !rec_token.token) {
                res.status(400).json({ "error": "Invalid refresh token!" });
            }

            const del = await TokenAdmin.delete({ token: rec_token.token });
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
export default adminController;