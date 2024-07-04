import { Model, Document, ObjectId } from 'mongoose';
import { QueryResult } from '../paginate/paginate';

// Interface defining the structure of a profile
export interface IProfile {
  user?: ObjectId;
  title?: string;
  name?: string;
  bio?: string;
  themeColor?: string;
  location?: string;
  jobTitle?: string;
  company?: string;
  image?: string;
  cover?: string;
  logo?: string;
  category?: string;
  views: number;
  taps: number;
  leadCapture?: boolean;
  directOn?: boolean;
  direct?: string;
}

// Interface for the Profile document that extends IProfile and Document
export interface IProfileDoc extends IProfile, Document {}

// Interface for the Profile model that extends Model<IProfileDoc>
export interface IProfileModel extends Model<IProfileDoc> {
  paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}

// Type for updating a profile with partial data
export type UpdateProfileBody = Partial<IProfile>;

// Type for a newly created profile excluding certain fields
export type NewCreatedProfile = Omit<
  IProfile,
  'user' | 'category' | 'views' | 'taps' | 'directOn' | 'leadCapture' | 'direct'
>;
