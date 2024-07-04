import mongoose, { Document, Model } from 'mongoose';

export interface IConfig {
  key: string;
  value: string;
  private: boolean;
}

interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

interface EmailConfig {
  smtp: SmtpConfig;
  from: string;
}

interface S3Config {
  bucketName: string;
  bucketRegion: string;
  accessKey: string;
  secretKey: string;
}

interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  product1: string;
  product2: string;
}

export interface IConfigDoc extends IConfig, Document {}

export interface IConfigModel extends Model<IConfigDoc> {
  isKeyTaken(key: string, excludeConfigId?: mongoose.Types.ObjectId): Promise<boolean>;
}

export type ConfigBody = {
  appName?: string;
  androidMinimumVersion?: string;
  iOSMinimumVersion?: string;
  maintenance?: boolean;
  dashUrl?: string;
  iOSAppUrl?: string;
  androidAppUrl?: string;
  privacyUrl?: string;
  termsUrl?: string;
  email?: EmailConfig;
  s3?: S3Config;
  stripe?: StripeConfig;
};
