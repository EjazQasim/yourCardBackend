import mongoose from 'mongoose';
import toJSON from '../toJSON/toJSON';
import { IConfigDoc, IConfigModel } from './config.interfaces';

const configSchema = new mongoose.Schema<IConfigDoc, IConfigModel>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      trim: true,
    },
    private: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
configSchema.plugin(toJSON);

/**
 * Check if Key is taken
 * @param {string} key - The config's key
 * @param {ObjectId} [excludeConfigId] - The id of the config to be excluded
 * @returns {Promise<boolean>}
 */
configSchema.static('isKeyTaken', async function (key: string, excludeConfigId: mongoose.ObjectId): Promise<boolean> {
  const config = await this.findOne({ key, _id: { $ne: excludeConfigId } });
  return !!config;
});

const Config = mongoose.model<IConfigDoc, IConfigModel>('Config', configSchema);

export default Config;
