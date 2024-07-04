import mongoose from 'mongoose';
import toJSON from '../toJSON/toJSON';
import paginate from '../paginate/paginate';
import { IProductDoc, IProductModel } from './product.interfaces';

const productSchema = new mongoose.Schema<IProductDoc, IProductModel>(
  {
    position: { type: Number, default: 0 },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Profile',
    },
    title: String,
    image: String,
    description: String,
    url: String,
    price: String,
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
productSchema.plugin(toJSON);
productSchema.plugin(paginate);

const Product = mongoose.model<IProductDoc, IProductModel>('Product', productSchema);

export default Product;
