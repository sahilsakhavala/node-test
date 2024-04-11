import { } from 'dotenv/config'

const config = {
    MONGODB_URI: process.env.MONGODB_URI,
    email: process.env.EMAIL,
    email_password: process.env.EMAIL_PASSWORD,
    port: process.env.PORT || 3000,
    secretKey: process.env.SECRET_KEY || "S6MGXX3UF78KR4UMO5H7",
    url: process.env.BASE_URL

};

export default config;