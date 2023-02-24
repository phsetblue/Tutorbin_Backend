import mongoose from "mongoose";

const TutorSubjectsSchema = new mongoose.Schema({
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'TutorRegister', required: true },
    subjects: [{
        type: String,
        required: true
    }],
    subjectsWithCooldown: [{
        _id: false,
        subjectName: { type: String, required: true },
        cooldownPeriod: { type: Date, required: true }
    }]
});
export default mongoose.model('TutorSubjects', TutorSubjectsSchema, 'TutorSubjects');
