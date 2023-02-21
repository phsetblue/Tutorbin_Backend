import Joi from 'joi';

const googleRegister2Validator = {
    token: Joi.string().required().label("Token").error(new Error('Please enter correct Token!')),
    password: Joi.string().trim().required().min(3).label("Password").error(new Error('Please enter Valid Password!')),
    referralCode: Joi.string().trim(),
}

const TutorGoogleRegister2ValidatorSchema = Joi.object(googleRegister2Validator);

export default TutorGoogleRegister2ValidatorSchema;