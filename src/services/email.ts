import nodemailer from 'nodemailer';
import Email from '../types/Email.js';

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    secure: false,
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASSWORD
    }
});

export default async function sendMail(email: Email): Promise<void> {
    
    const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: email.to,
        subject: email.content.subject,
        text: email.content.text
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        }
        else {
            console.log(`\nEmail sent to ${email.to} \nResponse: ${info.response}\n`);
        }
    });
}




