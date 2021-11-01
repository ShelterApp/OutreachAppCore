export default () => ({
    administratorId: 1,
    saltOrRounds: process.env.SALT_OR_ROUND,
    jwt: {
        secret: process.env.JWT_SECRET,
        signOptions: {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    },
    mailer: {
        transport: '',
        from: ''
    }
});