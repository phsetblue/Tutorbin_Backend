import Joi from 'joi';

const googleRegister2Validator = {
    token: Joi.string().required().label("Token").error(new Error('Please enter correct Token!')),
    password: Joi.string().trim().required().min(3).label("Password").error(new Error('Please enter Valid Password!')),
    class: Joi.string().trim().required().error(new Error('Please enter class!')),
    referralCode: Joi.string().trim(),
}

const StudentGoogleRegister2ValidatorSchema = Joi.object(googleRegister2Validator);

export default StudentGoogleRegister2ValidatorSchema;