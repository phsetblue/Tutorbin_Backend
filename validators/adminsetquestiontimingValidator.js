import Joi from 'joi';

const AdminSetQuestionTimingValidator = {
    token: Joi.string().required().label("Token").error(new Error('Please enter correct Token!')),
    Type: Joi.string().trim().required().label("Type").error(new Error('Please enter proper Type!')),
    first_time: Joi.number().required().label("first_time").error(new Error('Please enter correct first_time!')),
    second_time: Joi.number().required().label("second_time").error(new Error('Please enter Valid second_time!')),
    skip_time: Joi.number().required().label("skip_time").error(new Error('Please enter Valid skip_time!')),
    remaining_time: Joi.number().required().label("remaining_time").error(new Error('Please enter Valid remaining_time!')),
}

const AdminSetQuestionTimingValidatorSchema = Joi.object(AdminSetQuestionTimingValidator);

export default AdminSetQuestionTimingValidatorSchema;
