import mongoose from 'mongoose';

const StudentWalletSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Studentregister', required: true },
    totalAmount: { type: Number, required: true },
    availableAmount: { type: Number, required: true },
    redeemableAmount: { type: Number, required: true },
    walletHistory: [{
        amount: { type: Number, required: true },
        method: { type: String, required: true },
        date: { type: Date, required: true }
    }]
});
export default mongoose.model('StudentWallet', StudentWalletSchema, 'StudentWallet');
