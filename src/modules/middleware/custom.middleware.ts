import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { ApiError } from '../errors';
import { Profile } from '../profile';
import { Link } from '../link';
import { IProfile } from '../profile/profile.interfaces';
import { Product } from '../product';
import { Lead } from '../lead';
import Tag from '../tag/tag.model';
import Team from '../team/team.model';

export const isOwner = (req: Request, _res: Response, next: NextFunction) => {
  if (req.user.role === 'admin' || req.user.id === req.params['userId']) {
    return next();
  }

  return next(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
};

export const isProfileOwner = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const profile = await Profile.findById(`${req.params['profileId']}`);

    if (!profile) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Profile not found');
    }

    if (req.user.role === 'admin' || String(profile.user) === req.user.id) {
      return next();
    }

    if (req.user.team) {
      const team = await Team.findById(`${req.user.team}`);
      if (team && (String(req.user.id) === String(team.superAdmin) || team.admins.includes(req.user.id))) {
        return next();
      }
    }

    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  } catch (error) {
    return next(error);
  }
};

export const isLeadOwner = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const lead = await Lead.findById(`${req.params['leadId']}`);

    if (!lead) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
    }

    if (req.user.role === 'admin' || String(lead.user) === req.user.id) {
      return next();
    }

    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  } catch (error) {
    return next(error);
  }
};

export const isTagOwner = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const tag = await Tag.findById(`${req.params['tagId']}`);

    if (!tag) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Tag not found');
    }

    if (req.user.role === 'admin' || String(tag.user) === req.user.id) {
      return next();
    }

    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  } catch (error) {
    return next(error);
  }
};

export const isLinkOwner = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const link = await Link.findById(`${req.params['linkId']}`).populate<{ profile: IProfile }>('profile');

    if (!link) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Link not found');
    }

    if (req.user.role === 'admin' || `${link.profile.user}` === req.user.id) {
      return next();
    }

    if (req.user.team) {
      const team = await Team.findById(`${req.user.team}`);
      if (team && (String(req.user.id) === String(team.superAdmin) || team.admins.includes(req.user.id))) {
        return next();
      }
    }

    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  } catch (error) {
    return next(error);
  }
};

export const isProductOwner = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(`${req.params['productId']}`).populate<{ profile: IProfile }>('profile');

    if (!product) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }

    if (req.user.role === 'admin' || `${product.profile.user}` === req.user.id) {
      return next();
    }

    if (req.user.team) {
      const team = await Team.findById(`${req.user.team}`);
      if (team && (String(req.user.id) === String(team.superAdmin) || team.admins.includes(req.user.id))) {
        return next();
      }
    }

    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  } catch (error) {
    return next(error);
  }
};

export const isTeamAdmin = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const team = await Team.findById(`${req.params['teamId']}`);

    if (!team) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
    }

    if (
      req.user.role === 'admin' ||
      (req.user.team &&
        String(req.user.team) === String(team.id) &&
        (String(req.user.id) === String(team.superAdmin) || team.admins.includes(req.user.id)))
    ) {
      return next();
    }

    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  } catch (error) {
    return next(error);
  }
};

export const isTeamOwner = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const team = await Team.findById(`${req.params['teamId']}`);
    if (!team) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
    }

    if (req.user.role === 'admin' || String(req.user.id) === String(team.superAdmin)) {
      return next();
    }

    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  } catch (error) {
    return next(error);
  }
};

export const isTeamMember = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const team = await Team.findById(`${req.params['teamId']}`);
    if (!team) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
    }
    if (req.user.role === 'admin' || String(req.user.team) === String(team.id)) {
      return next();
    }

    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  } catch (error) {
    return next(error);
  }
};
