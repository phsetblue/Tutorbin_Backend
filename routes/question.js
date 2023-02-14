import express from "express";
import multer from 'multer';
import { TokenStudent } from "../model/index.js";
import { StudentQuestionsSchema } from "../schema/index.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

const router = express.Router();

router.use(express.urlencoded({ extended: false }));
router.use(express.json());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // console.log(file);
        // console.log(path.join(__dirname, '../uploads/'));
        const uploadDirectory = path.join(__dirname, '..', 'upload');
        console.log(uploadDirectory);
        // const uploadDirectory = path.join(__dirname, '../uploads');

        // Create the upload directory if it doesn't exist
        fs.mkdir(uploadDirectory, { recursive: true }, function (err) {
            if (err) return cb(err);
            cb(null, uploadDirectory);
        });
        // if (!fs.existsSync(uploadDirectory)) {
        //     console.log("no");
        //     fs.mkdirSync(uploadDirectory);
        // } else {
        //     console.log("yes");
        // }
        // cb(null, uploadDirectory);
    },
    filename: function (req, file, cb) {
        // let aa = new Date().toISOString() + '-' + file.originalname;
        // console.log(aa);
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

router.post("/ask", upload.array('questionPhoto', 5), async (req, res) => {
    try {
        // const { error } = refreshTokenValidatorSchema.validate(req.body);
        // if (error) {
        //     res.status(400).json({ "error": error.message });
        // }
        // console.log({ token: req.body.token });
        let rec_token = await TokenStudent.fetchByToken({ token: req.body.token });
        if (rec_token === null || !rec_token.token) {
            res.status(400).json({ "error": "Invalid refresh token!" });
        }

        var st_id = rec_token._id;

        const { question, questionType, questionSubject } = req.body;
        // console.log(req.file.filename);

        StudentQuestionsSchema.updateOne({ studentId: st_id }, {
            $push: {
                allQuestions: [{
                    question,
                    questionPhoto: req.files.map(file => file.filename),
                    questionType,
                    questionSubject,
                    dateOfPosted: new Date(),
                    status: 'PENDING'
                }]
            }
        }, (error, result) => {
            if (error) {
                console.log("dsds");
                console.error(error);
                return;
            }
            console.log('Array of questions pushed:', result);
        });

        res.status(200).json({ message: 'Question posted successfully' });
    } catch (error) {
        console.log("dfsd");
        console.log(error);
        return;
        // return next(error);
    }
});
export default router;