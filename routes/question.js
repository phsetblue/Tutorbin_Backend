import express from "express";
import multer from 'multer';
import  { findTutorAndAssignQuestion } from "../controller/findTutorAndAssignQuestion.js";
import { TokenStudent, MainQuestions } from "../model/index.js";
import { MainQuestionsSchema, StudentQuestionsSchema, ImageSchema, TutorSubjectsSchema, TutorTimingSchema, TutorRegisterSchema, TutorQuestionsSchema, QuestionTimingSchema } from "../schema/index.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import questiontiming from "../schema/questiontiming.js";

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

        // console.log(req);

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
        console.log(imageIds);

        const { question, questionType, questionSubject, questionPrice, tutorPrice, adminPrice } = req.body;
        // console.log(req.file.filename);

        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        const twoDays = 2 * oneDay;
        const threeDays = 3 * oneDay;

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
            createdAt: now,
            onedayafter_tutor_end: new Date(now.getTime() + oneDay),
            twodayafter_admin_end: new Date(now.getTime() + twoDays),
            threedayafter_unsolved_end: new Date(now.getTime() + threeDays),
            whomto_ask: "tutor"
        })


        console.log(mainque);

        const questionId = mainque._id;

        StudentQuestionsSchema.findOneAndUpdate({ studentId: st_id }, {
            $push: {
                allQuestions: [{
                    questionId: questionId,
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
            } else {
                console.log('Array of questions pushed:', result);
            }
        });

        // sent to tutor

        var new_status = await findTutorAndAssignQuestion(mainque);

        if(new_status) {
            res.status(200).json({ message: 'Question posted successfully' });
        } else {
            res.status(400).json({ message: 'Question posting was unsuccessful!' });
        }


        // end of sent to tutor
        
    } catch (error) {
        console.log("dfsd");
        console.log(error);
        return;
        // return next(error);
    }
});

router.get("/:id", async (req, res) => {
    try {
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

// async function findTutorAndAssignQuestion(question) {
//     try {
//         console.log(question);
//         const tutors = await TutorRegisterSchema.aggregate([
//             {
//                 $match: {
//                     isSuspended: false,
//                     questionassigned: false
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'TutorSubjects',
//                     localField: '_id',
//                     foreignField: 'tutorId',
//                     as: 'subjects'
//                 }
//             },
//             {
//                 $unwind: '$subjects'
//             },
//             {
//                 $unwind: '$subjects.subjects'
//             },
//             {
//                 $match: {
//                     'subjects.subjects': question.questionSubject
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'TutorTiming',
//                     localField: '_id',
//                     foreignField: 'tutorId',
//                     as: 'timing'
//                 }
//             },
//             {
//                 $unwind: '$timing'
//             },
//             {
//                 $project: {
//                     _id: 1,
//                     screenTime: '$timing.screenTime'
//                 }
//             },
//             {
//                 $sort: {
//                     screenTime: -1
//                 }
//             }
//         ]);

//         console.log('Matching tutors: ', tutors);

//         let assignedTutorId;

//         if (tutors.length > 0) {
//             assignedTutorId = tutors[0]._id;
//         } else {
//             // If no available tutors are found, get all tutors who are not suspended and sort them by their answer/skipped question ratio
//             const allTutors = await TutorRegisterSchema.aggregate([
//                 {
//                     $match: {
//                         isSuspended: false
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: 'TutorSubjects',
//                         localField: '_id',
//                         foreignField: 'tutorId',
//                         as: 'subjects'
//                     }
//                 },
//                 {
//                     $unwind: '$subjects'
//                 },
//                 {
//                     $unwind: '$subjects.subjects'
//                 },
//                 {
//                     $match: {
//                         'subjects.subjects': question.questionSubject
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: 'TutorQuestions',
//                         localField: '_id',
//                         foreignField: 'tutorId',
//                         as: 'questions'
//                     }
//                 },
//                 {
//                     $project: {
//                         _id: 1,
//                         answeredQuestions: '$questions.stats.answeredQuestions',
//                         skippedQuestions: '$questions.stats.skippedQuestions'
//                     }
//                 },
//                 {
//                     $project: {
//                         _id: 1,
//                         answerSkippedRatio: {
//                             $cond: [
//                                 { $eq: ['$answeredQuestions', 0] },
//                                 0,
//                                 {
//                                     $cond: [
//                                         { $eq: [{ $add: [{ $sum: '$answeredQuestions' }, { $sum: '$skippedQuestions' }] }, 0] },
//                                         0,
//                                         {
//                                             $divide: [
//                                                 { $sum: '$answeredQuestions' },
//                                                 { $add: [{ $sum: '$answeredQuestions' }, { $sum: '$skippedQuestions' }] }
//                                             ]
//                                         }
//                                     ]
//                                 }
//                             ]
//                         }

//                     }
//                 },
//                 {
//                     $sort: {
//                         answerSkippedRatio: 1
//                     }
//                 }
//             ]);


//             console.log('allTutors - ', allTutors);

//             // Use a round-robin approach to assign the question to one of the available tutors
//             const numTutors = allTutors.length;
//             if (numTutors === 0) {
//                 throw new Error('No tutors available to assign question');
//             }

//             // Assign the question to the tutor with the highest ratio
//             const assignedTutor = allTutors[0];
//             assignedTutorId = assignedTutor._id;
//         }

//         if (assignedTutorId) {
//             // Update tutor's questions and screen time
//             var timing = await QuestionTimingSchema.findOne({Type: question.questionType});
//             var settime = timing.first_time;
//             var currentTimePlusExtra = new Date();
//             currentTimePlusExtra.setMinutes(currentTimePlusExtra.getMinutes() + parseInt(settime));

//             console.log("assignedTutorId - ", assignedTutorId);
//             console.log("question - ", question);
//             var tutque;
//             try {

//                 tutque =  await TutorQuestionsSchema.findOneAndUpdate({ tutorId: assignedTutorId }, {
//                     $push: {
//                         allQuestions: {
//                             // questionId: question.questionId,
//                             question: question.question,
//                             questionType: question.questionType,
//                             questionSubject: question.questionSubject,
//                             questionPhoto: question.questionPhoto,
//                             tutorPrice: question.tutorPrice,
                            
//                         }
//                     }
//                     // $inc: { 'stats.answeredQuestions': 0, 'stats.skippedQuestions': 0 }
//                 }, (error, result) => {
//                     if (error) {
//                         console.log("dsds");
//                         console.error(error);
//                         return;
//                     }
//                     console.log('Array of questions pushed in new:', result);
//                 });
//                 console.log("tutque - ", tutque);
                
//             } catch (error) {
//                 console.log("error in tutques - ", error);
//             }
            

//             // if(!tutque) {
//             //     return false;
//             // }

//             // Update tutor's question assigned status

//             var tutreg;
//             try {
//                 tutreg = await TutorRegisterSchema.findOneAndUpdate({ _id: assignedTutorId }, {
//                     $set: { questionassigned: true }
//                 });
    
//                 console.log("tutreg - ", tutreg);
                
//             } catch (error) {
//                 console.log("error in tutreg - ", error);
//             }
            


//             // if(!tutreg) {
//             //     return false;
//             // }

//             var new_mainque;

//             try {
//                 var new_mainque = await MainQuestionsSchema.findOneAndUpdate({ _id: question.questionId }, {
//                     internalStatus: "AssignedWithFindResponse",
//                     que_timer_end: currentTimePlusExtra
//                 }, {new: true});
    
//                 console.log("new_mainque - ", new_mainque);
                
//             } catch (error) {
//                 console.log("error in new_mainque - ", error);
//             }
            

//             // if(!new_mainque) {
//             //     return false;
//             // }

            

//             return true;

//         } else {
//             return false;
//         }

//     }
//     catch (error) {
//         console.log("error = ", error);
//         return false;
//     }
// }



export default router;


