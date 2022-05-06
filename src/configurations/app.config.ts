export default () => ({
    administratorId: 1,
    saltOrRounds: process.env.SALT_OR_ROUND,
    jwt: {
        secret: process.env.JWT_SECRET,
        signOptions: {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    },
    email_confirmation_url: process.env.EMAIL_CONFIRMATION_URL,
    email_forgotpassword_url: process.env.EMAIL_FORGOTPASSWORD_URL,
    mailer: {
        from: process.env.MAIL_FROM,
        host: process.env.MAIL_HOST,
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    },
    mongodb: {
        uri: process.env.MONGO_URI
    }
});