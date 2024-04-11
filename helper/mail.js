import nodemailer from "nodemailer";
import config from "../config/db.config.js";

const sendMail = async (emailObj) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.email,
                pass: config.email_password
            }
        });
        const mailOptions = {
            from: config.email,
            to: emailObj.to,
            subject: emailObj.subject,
            html: emailObj.html,
            text: emailObj.text,
        };
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export {
    sendMail,
};
