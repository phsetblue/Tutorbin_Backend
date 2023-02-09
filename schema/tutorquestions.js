import mongoose from "mongoose";

const TutorQuestionsSchema = new mongoose.Schema({
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'TutorRegister', required: true },
    allQuestions: [{
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'MainQuestions', required: true },
        question: { type: String, required: true },
        questionType: { type: String, required: true },
        timeRemaining: { type: Number, required: true }
    }],
    stats: {
        answeredQuestions: { type: Number, required: true },
        skippedQuestions: { type: Number, required: true }
        // Add more fields as needed
    }
});
export default mongoose.model('TutorQuestions', TutorQuestionsSchema, 'TutorQuestions');

