import { Model, Document, ObjectId } from 'mongoose';
import { QueryResult } from '../paginate/paginate';
import { IProfile } from '../profile/profile.interfaces';

export interface IProduct {
  position: number;
  profile: ObjectId | IProfile;
  title?: string;
  image?: string;
  description?: string;
  url?: string;
  price?: string;
  taps: number;
}

export interface IProductDoc extends IProduct, Document {}

export interface IProductModel extends Model<IProductDoc> {
  paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}

export type UpdateProductBody = Partial<IProduct>;

export type NewCreatedProduct = Omit<IProduct, 'position' | 'taps'>;
