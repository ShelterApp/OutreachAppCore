export default () => ({
    administratorId: 1,
    saltOrRounds: process.env.SALT_OR_ROUND,
    jwt: {
        secret: process.env.JWT_SECRET,
        signOptions: {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    },
    email_confirmation_url: 'https://google.com',
    mailer: {
        transport: 'smtps://OutreachWebApp@gmail.com:OutreachApp@2022@smtp.gmail.com',
        from: '"OutreachApp" <noreply@outreachapp.org>'
    },
    mongodb: {
        uri: process.env.MONGO_URI
    }
});