import jwt from 'jsonwebtoken'
import config from '../config/db.config.js';

const createToken = async (payload, expiresIn = null) => {
    try {
        if (expiresIn) {
            return jwt.sign(payload, config.secretKey, { expiresIn });
        } else {
            return jwt.sign(payload, config.secretKey);
        }
    } catch (error) {
        console.log(error);
        return { success: false, message: "Token verification failed" };
    }
}

const verifyToken = async (token) => {
    try {
        const verifyToken = await jwt.verify(token, config.secretKey);
        return { success: true, user: verifyToken, message: "Token verified successfully" };
    } catch (error) {
        return { success: false, message: "Token verification failed" };
    }
}

export {
    createToken,
    verifyToken
}