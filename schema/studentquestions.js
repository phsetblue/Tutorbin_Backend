import mongoose from "mongoose";

const StudentQuestionsSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentRegister', required: true },
    allQuestions: [{
        question: { type: String, required: true },
        questionPhoto: [{
            type: String,
            required: true
        }],
        questionType: { type: String, required: true },
        questionSubject: { type: String, required: true },
        dateOfPosted: { type: Date, required: true },
        status: { type: String, required: true }
    }]
});
export default mongoose.model('StudentQuestions', StudentQuestionsSchema, 'StudentQuestions');
