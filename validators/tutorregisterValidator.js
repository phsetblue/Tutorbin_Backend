import Joi from 'joi';

const registerValidator = {
    email: Joi.string().trim().required().email().label("Email").error(new Error('Please enter correct email!')),
    password: Joi.string().trim().required().min(3).label("Password").error(new Error('Please enter Valid Password!')),
    referralCode: Joi.string().trim(),
}

const TutorRegisterValidatorSchema = Joi.object(registerValidator);

export {
    TutorRegisterValidatorSchema
}