import mongoose from "mongoose";

const TutorSubjectsSchema = new mongoose.Schema({
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'TutorRegister', required: true },
    subjects: [{
        type: String,
        required: true
    }]
});
export default mongoose.model('TutorSubjects', TutorSubjectsSchema, 'TutorSubjects');
