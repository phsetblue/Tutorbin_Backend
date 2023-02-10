import mongoose from 'mongoose';

const StudentInformationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentRegister', required: true },
    name: { type: String, required: true },
    // username: { type: String, required: true },
    // mobileNo: { type: String, required: true },
    // timezone: { type: String, required: true },
    email: { type: String, required: true},
    board: { type: String, required: true },
    city: { type: String, required: true },
    school: { type: String, required: true },
    ownReferral: { type: String, required: true },
    referralHistory: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentRegister', required: true },
        name: { type: String, required: true },
        referdate: { type: Date, required: true },
        amount: { type: String, required: true },
        redeemed: { type: Boolean, default: false }
    }],
    postingStreak: { type: Map, of: Number }
});


export default mongoose.model('StudentInformation', StudentInformationSchema, 'StudentInformation');



/*

async function generateReferralCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let referralCode;
    let referralCodeExists;
  
    do {
      referralCode = '';
      for (let i = 0; i < 6; i++) {
        referralCode += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      referralCodeExists = await StudentRegister.exists({ referralCode });
    } while (referralCodeExists);
  
    return referralCode;
  }

*/