import mongoose from 'mongoose';
import toJSON from '../toJSON/toJSON';
import paginate from '../paginate/paginate';
import { ITeamDoc, ITeamModel } from './team.interfaces';
import Profile from '../profile/profile.model';
import User from '../user/user.model';

const teamSchema = new mongoose.Schema<ITeamDoc, ITeamModel>(
  {
    superAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
teamSchema.plugin(toJSON);
teamSchema.plugin(paginate);

teamSchema.post('save', async function (doc) {
  const team = doc;
  if (!team.profile) {
    const profile = await Profile.create({});
    team.profile = profile._id;
    await team.save();
  }
});

teamSchema.pre('deleteOne', { document: true, query: false }, async function () {
  const team = this;
  const users = await User.find({ team: team._id });
  await Promise.allSettled(
    users.map(async (u) => {
      await User.findByIdAndUpdate(u.id, { $unset: { team: 1 }, isLocked: false });
    })
  );
  const profile = await Profile.findById(team.profile);
  if (profile) {
    await profile.deleteOne();
  }
});

const Team = mongoose.model<ITeamDoc, ITeamModel>('Team', teamSchema);

export default Team;
