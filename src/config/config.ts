import Joi from 'joi';
import 'dotenv/config';

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    JWT_TEAM_INVITE_EXPIRATION_HOURS: Joi.number().default(48).description('hours after which team invite token expires'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    CLIENT_URL: Joi.string().required().description('Client url'),
    DASH_URL: Joi.string().required().description('Dash url'),
    AWS_BUCKET_NAME: Joi.string().required().description('AWS bucket name'),
    AWS_BUCKET_REGION: Joi.string().required().description('AWS bucket region'),
    AWS_ACCESS_KEY: Joi.string().required().description('AWS access key'),
    AWS_SECRET_KEY: Joi.string().required().description('AWS secret key'),
    STRIPE_SECRET_KEY: Joi.string().required().description('Stripe secret key'),
    STRIPE_PRODUCT1: Joi.string().required().description('Stripe product1 key'),
    STRIPE_PRODUCT2: Joi.string().required().description('Stripe product2 key'),
    REVENUE_CAT_API_KEY: Joi.string(),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
    teamInviteExpirationHours: envVars.JWT_TEAM_INVITE_EXPIRATION_HOURS,
    cookieOptions: {
      httpOnly: true,
      secure: envVars.NODE_ENV === 'production',
      signed: true,
    },
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  clientUrl: envVars.CLIENT_URL,
  dashUrl: envVars.DASH_URL,
  aws: {
    bucketName: envVars.AWS_BUCKET_NAME,
    bucketRegion: envVars.AWS_BUCKET_REGION,
    accessKey: envVars.AWS_ACCESS_KEY,
    secretKey: envVars.AWS_SECRET_KEY,
  },
  stripe: {
    secretKey: envVars.STRIPE_SECRET_KEY,
    product1: envVars.STRIPE_PRODUCT1,
    product2: envVars.STRIPE_PRODUCT2,
  },
  revenueCatApiKey: envVars.REVENUE_CAT_API_KEY,
};

export default config;
