import mongoose from "mongoose";

const TutorWalletSchema = new mongoose.Schema({
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'TutorRegister', required: true },
    balance: { type: Number, required: true },
    balanceHistory: [{
        date: { type: Date, required: true },
        amount: { type: Number, required: true }
    }]
});
export default mongoose.model('TutorWallet', TutorWalletSchema, 'TutorWallet');
