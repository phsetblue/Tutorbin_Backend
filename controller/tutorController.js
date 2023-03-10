import { Tutor, TutorPersonal, TutorProfessional, TokenTutor, TutorWallet, TutorQuestions, TutorBankDetails } from "../model/index.js";
import { TutorPersonalSchema, TutorProfessionalSchema, TutorRegisterSchema, TutorWalletSchema, TutorQuestionsSchema, TutorDocumentSchema, TutorSubjectsSchema, TutorBankDetailsSchema, TutorTimingSchema } from "../schema/index.js";
import { TutorRegisterValidatorSchema, refreshTokenValidatorSchema, TutorLoginValidatorSchema, TutorPersonalValidatorSchema, TutorProfessionalValidatorSchema, TutorChangePasswordValidatorSchema, TutorGoogleRegister2ValidatorSchema, TutorAddSubjectValidatorSchema, TutorBankDetailsValidatorSchema, TutorAddScreenTimeValidatorSchema } from "../validators/index.js";
import CustomErrorHandler from "../service/CustomErrorHandler.js";
import bcrypt from "bcrypt";
import JwtService from "../service/JwtService.js";
import { TokenTutorSchema } from "../schema/index.js";
import { APP_URL, SALT_FACTOR } from "../config/index.js";
import crypto from 'crypto';
import mainquestions from "../schema/mainquestions.js";
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
}).single('degree_image');




// multer ends here



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
                    referralCode: req.body.referralCode
                }, { new: true });
            } else {
                user = await TutorRegisterSchema.findByIdAndUpdate(st_id, {
                    password: req.body.password
                }, { new: true });
            }

            var wal = await TutorWallet.create({ tutorId: user._id });
            var st_qu = await TutorQuestions.create({ tutorId: user._id });

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
                    referralCode: req.body.referralCode
                });
            } else {
                user = new TutorRegisterSchema({
                    email: req.body.email,
                    password: req.body.password,
                    registerType: "email",
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
                var wal = await TutorWallet.create({ tutorId: aa._id });
                if(!wal) {
                    return res.status(400).json({ "error": "No created Tutor Wallet" });
                }
                var st_qu = await TutorQuestions.create({ tutorId: aa._id });
                if(!st_qu) {
                    return res.status(400).json({ "error": "No created Tutor Questions" });
                }
                var info = aa;
                var message = "Tutor Registered Successfully.";
                return res.status(200).json({ info, token, message });
                // res.json(aa);
                // res.redirect("/student/home");
            } else {
                return res.status(400).json({ "error": aa.error });
                // res.redirect("/student/register");
            }

        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    },
    async personal(req, res, next) {
        try {
            const { error } = TutorPersonalValidatorSchema.validate(req.body);
            if (error) {
                return res.json({ "error": error.message });
            }
            let rec_token = await TokenTutor.fetchByToken({ token: req.body.token });
            if (rec_token === null || !rec_token.token) {
                return res.status(400).json({ "error": "Invalid refresh token!" });
            }

            var tut_id = rec_token._id;

            var user;

            const { name, mobileNo, country, gender, dob, experience } = req.body;
            let tut_info = await TutorPersonal.fetchById({ tutorId: tut_id });
            if (!tut_info) {
                console.log("new created");
                user = new TutorPersonalSchema({
                    tutorId: tut_id,
                    name,
                    mobileNo,
                    country,
                    gender,
                    dob,
                    experience
                });


                var aa = await TutorPersonal.create(user);
                // console.log(aa);

                if (!aa.error) {
                    var up_tut = await TutorRegisterSchema.findByIdAndUpdate(tut_id, {
                        personalDetailsFilled: true
                    }, { new: true });
                    var info = aa;
                    var message = "Tutor Personal Registration Successfully.";
                    res.status(200).json({ info, message });
                    // res.json(aa);
                    // res.redirect("/student/home");
                } else {
                    res.status(400).json({ "error": aa.error });
                    // res.redirect("/student/register");
                }
            } else {
                console.log("old");
                console.log(tut_info.tutorId);
                user = await TutorPersonalSchema.findByIdAndUpdate(tut_info._id, {
                    name,
                    mobileNo,
                    country,
                    gender,
                    dob,
                    experience
                }, { new: true });


                // var aa = await TutorPersonal.create(user);
                console.log(user);

                if (user) {
                    var up_tut = await TutorRegisterSchema.findByIdAndUpdate(tut_id, {
                        personalDetailsFilled: true
                    }, { new: true });
                    var info = user;
                    var message = "Tutor Personal Registration Successfully.";
                    res.status(200).json({ info, message });
                    // res.json(aa);
                    // res.redirect("/student/home");
                } else {
                    console.log(user);
                    res.status(400).json({ "error": "something went wrong" });
                    // res.redirect("/student/register");
                }

            }




        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    },
    async professional(req, res, next) {
        try {
            upload(req, res, async (err) => {
                if (err) {
                    return res.status(500).json({ "error": error });
                }
                const { error } = TutorProfessionalValidatorSchema.validate(req.body);
                if (error) {
                    return res.status(500).json({ "error": error.message });
                }
                let rec_token = await TokenTutor.fetchByToken({ token: req.body.token });
                if (rec_token === null || !rec_token.token) {
                    return res.status(400).json({ "error": "Invalid refresh token!" });
                }

                var tut_id = rec_token._id;

                var user;

                // Save the uploaded image to the Image schema
                const img = new TutorDocumentSchema();
                img.name = req.file.filename;
                img.data = fs.readFileSync(req.file.path);
                img.contentType = req.file.mimetype;
                const image = await img.save();
                // console.log(image);
                // const impr = await Promise.all(image);
                const imageId = image._id;

                const { degree_choice, degree, degree_specialisation, clg_name, clg_city, gpa } = req.body;

                let tut_info = await TutorProfessional.fetchById({ tutorId: tut_id });
                if (tut_info) {
                    user = await TutorProfessionalSchema.findByIdAndUpdate(tut_info._id, {
                        degree_choice,
                        degree_image: imageId,
                        degree,
                        degree_specialisation,
                        clg_name,
                        clg_city,
                        gpa
                    }, { new: true });


                    // var aa = await TutorProfessional.create(user);
                    // console.log(aa);

                    if (user) {
                        var up_tut = await TutorRegisterSchema.findByIdAndUpdate(tut_id, {
                            professionalDetailsFilled: true
                        });
                        var info = user;
                        var message = "Tutor Professional Registration Successfully.";
                        res.status(200).json({ info, message });
                        // res.json(aa);
                        // res.redirect("/student/home");
                    } else {
                        console.log(user);
                        res.status(400).json({ "error": "Something get wrong!" });
                        // res.redirect("/student/register");
                    }

                } else {
                    user = new TutorProfessionalSchema({
                        tutorId: tut_id,
                        degree_choice,
                        degree_image: imageId,
                        degree,
                        degree_specialisation,
                        clg_name,
                        clg_city,
                        gpa
                    });


                    var aa = await TutorProfessional.create(user);
                    // console.log(aa);

                    if (!aa.error) {
                        var up_tut = await TutorRegisterSchema.findByIdAndUpdate(tut_id, {
                            professionalDetailsFilled: true
                        });
                        var info = aa;
                        var message = "Tutor Professional Registration Successfully.";
                        res.status(200).json({ info, message });
                        // res.json(aa);
                        // res.redirect("/student/home");
                    } else {
                        res.status(400).json({ "error": aa.error });
                        // res.redirect("/student/register");
                    }
                }


            })

        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    },
    async addSubjects(req, res, next) {
        try {
            const { error } = TutorAddSubjectValidatorSchema.validate(req.body);
            if (error) {
                return res.status(500).json({ "error": error.message });
            }
            let rec_token = await TokenTutor.fetchByToken({ token: req.body.token });
            if (rec_token === null || !rec_token.token) {
                return res.status(400).json({ "error": "Invalid refresh token!" });
            }

            var tutorId = rec_token._id;
            const { subjects, subjectsWithCooldown } = req.body;

            // Add subjects without cooldown period
            if (Array.isArray(subjects) && subjects.length) {
                const tutorSubjects = await TutorSubjectsSchema.findOneAndUpdate(
                    { tutorId },
                    { $addToSet: { subjects: { $each: subjects } } },
                    { upsert: true, new: true }
                );
            }

            // Add subjects with cooldown period
            if (Array.isArray(subjectsWithCooldown) && subjectsWithCooldown.length) {
                const subjectsToAdd = subjectsWithCooldown.map((subject) => ({
                    subjectName: subject.subjectName,
                    cooldownPeriod: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
                }));
                console.log(subjectsToAdd);
                const tutorSubjects = await TutorSubjectsSchema.findOneAndUpdate(
                    { tutorId },
                    { $addToSet: { subjectsWithCooldown: { $each: subjectsToAdd } } },
                    { upsert: true, new: true }
                );
            }

            return res.status(200).json({ message: 'Subjects added successfully' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: error.message });
        }
    },
    async bankdetails(req, res, next) {
        try {
            const { error } = TutorBankDetailsValidatorSchema.validate(req.body);
            if (error) {
                return res.status(500).json({ "error": error.message });
            }
            let rec_token = await TokenTutor.fetchByToken({ token: req.body.token });
            if (rec_token === null || !rec_token.token) {
                return res.status(400).json({ "error": "Invalid refresh token!" });
            }

            var tut_id = rec_token._id;
            console.log('tutor id = ', tut_id);
            const { name, country, bankName, accountNumber, IFSCCode, accountType, panCard } = req.body;

            var tut_bank = await TutorBankDetailsSchema.findOne({ tutorId: tut_id });
            console.log(tut_bank);
            console.log('tutor id from bank = ', tut_bank._id);
            if (tut_bank) {
                var tut_bank1 = await TutorBankDetailsSchema.findByIdAndUpdate(tut_bank._id, {
                    country,
                    name,
                    bankName,
                    accountNumber,
                    IFSCCode,
                    accountType,
                    panCard
                }, { new: true });
                console.log(tut_bank1);
                if (tut_bank1) {
                    var info = tut_bank1;
                    var message = "Bank Details Saved Successfully.";

                    return res.status(200).json({ info, message });
                } else {
                    return res.status(500).json({ error: "Something went Wrong!" });
                }
            } else {
                var tut_bank = new TutorBankDetailsSchema({
                    tutorId: tut_id,
                    country,
                    name,
                    bankName,
                    accountNumber,
                    IFSCCode,
                    accountType,
                    panCard
                });

                var tutor_bank = await TutorBankDetails.create(tut_bank);

                if (tutor_bank) {
                    var info = tutor_bank;
                    var message = "Bank Details Saved Successfully.";

                    return res.status(200).json({ info, message });

                } else {
                    return res.status(500).json({ error: "Something went Wrong!" });
                }
            }


        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    },
    async addscreentime(req, res, next) {
        try {
            const { error } = TutorAddScreenTimeValidatorSchema.validate(req.body);
            if (error) {
                return res.status(500).json({ "error": error.message });
            }
            let rec_token = await TokenTutor.fetchByToken({ token: req.body.token });
            if (rec_token === null || !rec_token.token) {
                return res.status(400).json({ "error": "Invalid refresh token!" });
            }

            var tutorId = rec_token._id;
            console.log('tutor id = ', tutorId);
            const { screenTime } = req.body;

            const currentDate = new Date();
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
            // const endOfMonth = "2023-03-28T18:29:59.999Z";
            // Check if a document with this tutorId exists in the collection
            let tutorTiming = await TutorTimingSchema.findOne({ tutorId }).exec();

            // If not, create a new document with default values
            if (!tutorTiming) {
                tutorTiming = new TutorTimingSchema({
                    tutorId,
                    screenTime: 0,
                    updatedAt: currentDate,
                });
            }

            // Check if the updatedAt field is in the same month as the current date
            console.log("tutor- updatedat == ", tutorTiming.updatedAt);
            console.log("current end of month == ", endOfMonth);

            if (tutorTiming.updatedAt < endOfMonth) {
                tutorTiming.screenTime += screenTime;
                tutorTiming.updatedAt = currentDate;
            } else {
                tutorTiming.screenTime = screenTime;
                tutorTiming.updatedAt = currentDate;
            }

            // Save the updated document
            await tutorTiming.save();

            res.status(200).json({
                info: tutorTiming,
                message: "Tutor Timing Updated."
            });
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
            var message = "Tutor Login Successfully.";
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
            var message = "Tutor Login Successfully.";
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