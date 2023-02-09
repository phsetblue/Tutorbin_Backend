import mongoose from "mongoose";

const MainQuestionsSchema = new mongoose.Schema({
    question: { type: String, required: true },
    questionphoto: [{
        type: String,
        required: true
      }],  
    questionType: { type: String, required: true },
    status: { type: String, required: true },
    answer: { type: String, required: true },
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'TutorRegister', required: true },
    verificationStatus: { type: Boolean, required: true }
});
export default mongoose.model('MainQuestions', MainQuestionsSchema, 'MainQuestions');
