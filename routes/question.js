import express from "express";
import multer from 'multer';
import { TokenStudent, MainQuestions } from "../model/index.js";
import { MainQuestionsSchema, StudentQuestionsSchema, ImageSchema } from "../schema/index.js";
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
        const uploadDirectory = path.join(__dirname, '..', 'upload');
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

        // Save the uploaded images to the Image schema
        const imagePromises = req.files.map(file => {
            const img = new ImageSchema();
            img.name = file.filename;
            img.data = fs.readFileSync(file.path);
            img.contentType = file.mimetype;
            return img.save();
        });

        const images = await Promise.all(imagePromises);
        const imageIds = images.map(image => image._id);

        const { question, questionType, questionSubject, questionPrice, tutorPrice, adminPrice } = req.body;
        // console.log(req.file.filename);


        const mainque = await MainQuestions.create({
            question,
            // questionPhoto: req.files.map(file => file.filename),
            questionPhoto: imageIds,
            questionType,
            questionSubject,
            status: "PENDING",
            studentId: st_id,
            questionPrice,
            tutorPrice,
            adminPrice,
            createdAt: Date.now()
        })


        console.log(mainque);

        const questionId = mainque._id;

        StudentQuestionsSchema.updateOne({ studentId: st_id }, {
            $push: {
                allQuestions: [{
                    questionId,
                    question,
                    // questionPhoto: req.files.map(file => file.filename),
                    questionPhoto: imageIds,
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

router.get("/:id", async (req, res) => {
    try {

        /*

      const question = await MainQuestions.findById({_id: req.params.id});
    //   console.log(question);
      if (!question) {
        res.status(404).json({ error: "Question not found" });
        return;
      }
  
      // Fetch the images from the Image collection
      const images = await ImageSchema.find({ _id: { $in: question.questionPhoto } });
  
      // Map the image documents to URLs
      const imageUrls = images.map((image) => {
        return `${req.protocol}://${req.get("host")}/images/${image.name}`;
      });
  
      res.status(200).json({
        question: {
          id: question._id,
          question: question.question,
          questionPhoto: imageUrls,
          questionType: question.questionType,
          questionSubject: question.questionSubject,
          status: question.status,
          studentId: question.studentId,
          questionPrice: question.questionPrice,
          tutorPrice: question.tutorPrice,
          adminPrice: question.adminPrice,
          createdAt: question.createdAt,
        },
      });


      */

        const question = await MainQuestionsSchema.findById(req.params.id).populate('questionPhoto').exec();
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        console.log(question);

        // Fetch the images from the Image collection
        const images = await ImageSchema.find({ _id: { $in: question.questionPhoto } });
        // console.log(images);

        // Map the image data to base64 URLs
        // const imageUrls = question.questionPhoto.map(image => {
        const imageUrls = images.map((image) => {
            // console.log(image);
            return `data:${image.contentType};base64,${image.data.toString('base64')}`;
        });

        // res.render('questiondisplay', { question, imageUrls });
        res.status(200).json({
            question: {
              id: question._id,
              question: question.question,
              questionPhoto: imageUrls,
              questionType: question.questionType,
              questionSubject: question.questionSubject,
              status: question.status,
              studentId: question.studentId,
              questionPrice: question.questionPrice,
              tutorPrice: question.tutorPrice,
              adminPrice: question.adminPrice,
              createdAt: question.createdAt,
            },
          });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
});



export default router;


