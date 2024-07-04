import mongoose from 'mongoose';
import validator from 'validator';
import toJSON from '../toJSON/toJSON';
import paginate from '../paginate/paginate';
import { ILeadDoc, ILeadModel } from './lead.interfaces';

const leadSchema = new mongoose.Schema<ILeadDoc, ILeadModel>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
    },
    name: String,
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    phone: String,
    jobTitle: String,
    company: String,
    notes: String,
    location: String,
    website: String,
    image: String,
    cover: String,
    logo: String,
    latitude: Number,
    longitude: Number,
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
leadSchema.plugin(toJSON);
leadSchema.plugin(paginate);

const Lead = mongoose.model<ILeadDoc, ILeadModel>('Lead', leadSchema);

export default Lead;
