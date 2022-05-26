export default () => ({
  administratorId: 1,
  saltOrRounds: process.env.SALT_OR_ROUND,
  jwt: {
    secret: process.env.JWT_SECRET,
    signOptions: {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  },
  email_confirmation_url: process.env.EMAIL_CONFIRMATION_URL,
  email_forgotpassword_url: process.env.EMAIL_FORGOTPASSWORD_URL,
  mailer: {
    sendgrid_api_key: process.env.API_KEY_SENDGRID_OUTREACH_NOREPLY,
  },
  mongodb: {
    uri: process.env.MONGO_URI,
  },
  gmail: {
    address: process.env.GMAIL_ADDRESS,
    oauth_client_id: process.env.GMAIL_OAUTH_CLIENT_ID,
    oauth_project_id: process.env.GMAIL_OAUTH_PROJECT_ID,
    oauth_client_secret: process.env.GMAIL_OAUTH_CLIENT_SECRET,
    oauth_redirect_url: process.env.GMAIL_OAUTH_REDIRECT_URL,
    oauth_refresh_token: process.env.GMAIL_OAUTH_REFRESH_TOKEN,
  },
});
