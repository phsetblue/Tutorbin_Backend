import mongoose from "mongoose";

const TutorInformationSchema = new mongoose.Schema({
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'TutorRegister', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    username: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    timezone: { type: String, required: true },
    // Add professional details fields as needed
});
export default mongoose.model('TutorInformation', TutorInformationSchema, 'TutorInformation');
