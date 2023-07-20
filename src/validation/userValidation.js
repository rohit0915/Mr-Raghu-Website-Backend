const Joi = require("joi");

module.exports.signup = {
    body: Joi.object().keys({
        email: Joi.string().required(),
        mobileNumber: Joi.string().required(),
        confirmPassword: Joi.string().required(),
        mobile_number: Joi.string().pattern(/^[1-9]\d{9}$/).required(),
    }),
};