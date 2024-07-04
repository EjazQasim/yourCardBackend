import mongoose from 'mongoose';
import toJSON from '../toJSON/toJSON';
import paginate from '../paginate/paginate';
import { IProfileDoc, IProfileModel } from './profile.interfaces';
import Product from '../product/product.model';
import Lead from '../lead/lead.model';
import Link from '../link/link.model';

const profileSchema = new mongoose.Schema<IProfileDoc, IProfileModel>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
      default: 'Personal',
    },
    name: String,
    bio: String,
    themeColor: String,
    location: String,
    jobTitle: String,
    company: String,
    image: String,
    cover: String,
    logo: String,
    category: String,
    views: {
      type: Number,
      default: 0,
    },
    taps: {
      type: Number,
      default: 0,
    },
    leadCapture: {
      type: Boolean,
      default: false,
    },
    directOn: {
      type: Boolean,
      default: false,
    },
    direct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Link',
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
profileSchema.plugin(toJSON);
profileSchema.plugin(paginate);

profileSchema.pre('deleteOne', { document: true, query: false }, async function () {
  const profile = this;
  const links = await Link.find({ profile: profile._id });
  await Promise.all(links.map((l) => l.deleteOne()));

  const products = await Product.find({ profile: profile._id });
  await Promise.all(products.map((p) => p.deleteOne()));

  const leads = await Lead.find({ profile: profile._id });
  await Promise.all(leads.map((l) => l.deleteOne()));
});

const Profile = mongoose.model<IProfileDoc, IProfileModel>('Profile', profileSchema);

export default Profile;
