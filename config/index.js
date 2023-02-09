import dotenv from 'dotenv';
dotenv.config()

export const {
    APP_PORT,
    APP_URL,
    DEBUG_MODE,
    MONGO_URL,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    SALT_FACTOR,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    CALLBACK_URL_LOGIN,
    CALLBACK_URL_REGISTER
} = process.env;