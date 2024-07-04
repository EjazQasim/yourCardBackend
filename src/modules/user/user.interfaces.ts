import mongoose, { Model, Document, ObjectId } from 'mongoose';
import { QueryResult } from '../paginate/paginate';
import { AccessAndRefreshTokens } from '../token/token.interfaces';
import { IProfile, IProfileDoc } from '../profile/profile.interfaces';
import { ITeam, ITeamDoc } from '../team/team.interfaces';

export interface IUser {
  username: string;
  email: string;
  password: string;
  role: string;
  isEmailVerified: boolean;
  live: ObjectId | IProfile | IProfileDoc;
  fcmToken?: string;
  stripeId?: string;
  isLocked?: boolean;
  leads?: ObjectId[];
  team?: ObjectId | ITeam | ITeamDoc;
}

export interface IUserDoc extends IUser, Document {
  isPasswordMatch(password: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUserDoc> {
  isEmailTaken(email: string, excludeUserId?: mongoose.Types.ObjectId): Promise<boolean>;
  isUsernameTaken(username: string, excludeUserId?: mongoose.Types.ObjectId): Promise<boolean>;
  paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}

export type UpdateUserBody = Partial<IUser>;

export type NewRegisteredUser = Omit<
  IUser,
  'role' | 'isEmailVerified' | 'fcmToken' | 'isLocked' | 'live' | 'leads' | 'team' | 'stripeId'
>;

export type NewCreatedUser = Omit<
  IUser,
  'isEmailVerified' | 'fcmToken' | 'isLocked' | 'live' | 'leads' | 'team' | 'stripeId'
>;

export interface IUserWithTokens {
  user: IUserDoc;
  tokens: AccessAndRefreshTokens;
}
