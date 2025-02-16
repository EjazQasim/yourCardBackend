import mongoose from 'mongoose';
import toJSON from '../toJSON/toJSON';
import paginate from '../paginate/paginate';
import { ILinkDoc, ILinkModel } from './link.interfaces';

const linkSchema = new mongoose.Schema<ILinkDoc, ILinkModel>(
  {
    position: { type: Number, default: 0 },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Profile',
    },
    platform: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Platform',
    },
    title: String,
    headline: String,
    image: String,
    file: String,
    value: { type: String, required: true },
    data: String,
    status: { type: Boolean, default: true },
    isContact: { type: Boolean, default: false },
    taps: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
linkSchema.plugin(toJSON);
linkSchema.plugin(paginate);

const Link = mongoose.model<ILinkDoc, ILinkModel>('Link', linkSchema);

export default Link;
