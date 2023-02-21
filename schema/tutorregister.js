import mongoose from 'mongoose';

const TutorRegisterSchema = new mongoose.Schema({
    email: { type: String, required: true , unique: true},
    password: { type: String, required: false },
    googleId: { type: String, required: false },
    registerType: { type: String, enum: ['google', 'email'], required: true },
    referralCode: { type: String, optional: false },
    allDetailsFilled: { type: Boolean, required: true, default: false },
    isVerified: { type: Boolean, required: true, default: false },
    isSuspended: { type: Boolean, required: true, default: false },
    suspensionEndDate: { type: Date, required: false }
});
export default mongoose.model('TutorRegister', TutorRegisterSchema, 'TutorRegister');
