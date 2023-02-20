import mongoose from "mongoose";

const MainQuestionsSchema = new mongoose.Schema({
    question: { type: String, required: true },
    questionPhoto: [{
        type: String,
        required: true
      }],  
    questionType: { type: String, required: true },
    questionSubject: { type: String, required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentRegister', required: true },
    questionPrice: { type: Number, required: true },
    tutorPrice: { type: Number, required: true },
    adminPrice: { type: Number, required: true },
    status: { type: String, required: true },
    answer: { type: String, required: false },
    answerPhoto: [{
      type: String,
      required: true
    }],
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'TutorRegister', required: false },
    verificationStatus: { type: Boolean, required: false },
    studentresponded: { type: Boolean, required: false },
    studentResponce: { type: String, required: false },
    studentremarks: { type: String, required: false },
    reAnswer: { type: String, required: false },
    reAnswerBy: { type: mongoose.Schema.Types.ObjectId, ref: 'TutorRegister', required: false },
    createdAt: { type: Date, required: true },
    answeredAt: { type: Date, required: false },
    answerOpenedAt: { type: Date, required: false },
    answerClosingAt: { type: Date, required: false },
    answerClosed: { type: Boolean, required: false },
    paymentGoesTo: { type: mongoose.Schema.Types.ObjectId, ref: 'TutorRegister', required: false }
});
export default mongoose.model('MainQuestions', MainQuestionsSchema, 'MainQuestions');