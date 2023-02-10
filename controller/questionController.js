import { Student, StudentInformation, TokenStudent, StudentWallet } from "../model/index.js";
import { StudentInformationSchema, StudentRegisterSchema, StudentWalletSchema } from "../schema/index.js";
import { StudentRegisterValidatorSchema, refreshTokenValidatorSchema, StudentLoginValidatorSchema, StudentSetInfoValidatorSchema, StudentChangePasswordValidatorSchema, StudentGoogleRegister2ValidatorSchema } from "../validators/index.js";
import CustomErrorHandler from "../service/CustomErrorHandler.js";
import bcrypt from "bcrypt";
import JwtService from "../service/JwtService.js";
import { TokenStudentSchema } from "../schema/index.js";
import { APP_URL, SALT_FACTOR } from "../config/index.js";
import studentregister from "../schema/studentregister.js";
import crypto from 'crypto';



const questionController = {
    async ask(req, res, next) {
        try {
            
        } catch (error) {
            return next(error);
        }
    }
};

export default questionController;