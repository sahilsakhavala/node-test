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
    }
}

const verifyToken = async (token) => {
    try {
        const decoded = jwt.verify(token, config.secretKey);
        return { success: true, decoded };
    } catch (error) {
        console.error("Error verifying token:", error);
        return { success: false, message: "Token verification failed" };
    }
}

export {
    createToken,
    verifyToken
}