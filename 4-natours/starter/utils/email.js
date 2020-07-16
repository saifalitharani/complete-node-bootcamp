const nodemailer = require('nodemailer');
const nodemailerSendgrid = require('nodemailer-sendgrid');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Saif Ali <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            return nodemailer.createTransport(
                nodemailerSendgrid({
                    auth: {
                        api_user: 'apikey',
                        api_key: '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',
                    },
                })
            );
        }

        return nodemailer.createTransport({
            host: 'smtp.mailtrap.io',
            port: '2525',
            auth: {
                user: '4a432888b74f14',
                pass: 'aedbb70b6bed65',
            },
        });
    }

    async send(template, subject) {
        // 1) Render html based on pug template
        const html = pug.renderFile(
            `${__dirname}/../views/emails/${template}.pug`, {
                firstName: this.firstName,
                url: this.url,
                subject,
            }
        );

        // 2) Define the email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html),
        };

        // 3) Create a transport and send email
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to Natours Family!');
    }

    async sendResetPassword() {
        await this.send(
            'passwordReset',
            'Your Password Reset Token (Validity: 10 mins)'
        );
    }
};