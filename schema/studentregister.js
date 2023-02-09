import mongoose from 'mongoose';

const StudentRegisterSchema = new mongoose.Schema({
    email: { type: String, required: true , unique: true},
    password: { type: String, required: false },
    googleId: { type: String, required: false },
    class: { type: String, required: false },
    registerType: { type: String, enum: ['google', 'email'], required: true },
    referralCode: { type: String, optional: false }
});
export default mongoose.model('StudentRegister', StudentRegisterSchema, 'StudentRegister');
