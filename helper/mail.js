import nodemailer from "nodemailer";

const sendMail = async (emailObj) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        const mailOptions = {
            from: process.env.EMAIL,
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
