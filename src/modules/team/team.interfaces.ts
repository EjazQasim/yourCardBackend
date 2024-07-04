import { Model, Document, ObjectId } from 'mongoose';
import { QueryResult } from '../paginate/paginate';

export interface ITeam {
  superAdmin: ObjectId;
  admins: ObjectId[];
  profile?: string;
}

export interface ITeamDoc extends ITeam, Document {}

export interface ITeamModel extends Model<ITeamDoc> {
  paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}

export type UpdateTeamBody = Partial<ITeam>;
