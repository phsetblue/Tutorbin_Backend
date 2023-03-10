import mongoose from "mongoose";

const TutorQuestionsSchema = new mongoose.Schema({
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'TutorRegister', required: true },
    allQuestions: [{
        _id: false,
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'MainQuestions', required: true },
        question: { type: String, required: true },
        questionType: { type: String, required: true },
        questionSubject: { type: String, required: true },
        questionPhoto: [{
            type: String,
            required: true
        }],
        tutorPrice: { type: Number, required: true },
        answer: { type: String, required: false },
        answerPhoto: [{
            type: String,
            required: true
        }]
        // timeRemaining: { type: Number, required: true }
    }],
    stats: {
        answeredQuestions: { type: Number, required: true, default: 0 },
        skippedQuestions: { type: Number, required: true, default: 0 }
        // Add more fields as needed
    }
});
export default mongoose.model('TutorQuestions', TutorQuestionsSchema, 'TutorQuestions');

