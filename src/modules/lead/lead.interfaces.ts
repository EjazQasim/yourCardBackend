import { Model, Document, ObjectId } from 'mongoose';
import { QueryResult } from '../paginate/paginate';
import { IProfile } from '../profile/profile.interfaces';
import { IUser } from '../user/user.interfaces';

export interface ILead {
  user: ObjectId | IUser;
  profile?: ObjectId | IProfile;
  name?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  company?: string;
  notes?: string;
  location?: string;
  website?: string;
  image?: string;
  cover?: string;
  logo?: string;
  latitude?: number;
  longitude?: number;
}

export interface ILeadDoc extends ILead, Document {}

export interface ILeadModel extends Model<ILeadDoc> {
  paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}

export type UpdateLeadBody = Partial<ILead>;

export type NewCreatedLead = ILead;
