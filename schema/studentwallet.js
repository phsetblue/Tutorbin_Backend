import mongoose from 'mongoose';

const StudentWalletSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Studentregister', required: true },
    totalAmount: { type: Number, required: false, default: 0 },
    availableAmount: { type: Number, required: false, default: 0 },
    redeemableAmount: { type: Number, required: false, default: 0 },
    walletHistory: [{
        amount: { type: Number, required: true },
        method: { type: String, required: true },
        date: { type: Date, required: true }
    }],
    isSubscribed: { type: Boolean, default: false },
    planType: { type: String, required: false },
    planStartingDate: { type: Date, required: false },
    planEndingDate: { type: Date, required: false },
    questionsAvailable: { type: Boolean, default: false },
    questionsRemaining: { type: Number, required: false, default: 0 }
});
export default mongoose.model('StudentWallet', StudentWalletSchema, 'StudentWallet');
