import { Model, Document, ObjectId } from 'mongoose';
import { QueryResult } from '../paginate/paginate';
import { IProfile } from '../profile/profile.interfaces';
import { IPlatform } from '../platform/platform.interfaces';

export interface ILink {
  position: number;
  profile: ObjectId | IProfile;
  platform: ObjectId | IPlatform;
  title?: string;
  headline?: string;
  image?: string;
  file?: string;
  value: string;
  data?: string;
  status: boolean;
  isContact: boolean;
  taps: number;
}

export interface ILinkDoc extends ILink, Document {}

export interface ILinkModel extends Model<ILinkDoc> {
  paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}

export type UpdateLinkBody = Partial<ILink>;

export type NewCreatedLink = Omit<ILink, 'position' | 'taps' | 'isContact' | 'status'>;
