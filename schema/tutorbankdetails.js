import mongoose from "mongoose";

const TutorBankDetailsSchema = new mongoose.Schema({
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'TutorRegister', required: true },
    country: { type: String, required: true },
    name: { type: String, required: true },
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    IFSCCode: { type: String, required: true },
    accountType: { type: String, required: true },
    panCard: { type: String, required: true }
});
export default mongoose.model('TutorBankDetails', TutorBankDetailsSchema, 'TutorBankDetails');
