import express, { Router, Request, Response } from 'express';
import httpStatus from 'http-status';
import { ApiError } from '../../modules/errors';
import { catchAsync, getFileFromS3 } from '../../modules/utils';

const router: Router = express.Router();

const getImage = catchAsync(async (req: Request, res: Response) => {
  const key = req.originalUrl.replace('/v1/', '');
  const { Body, ContentType } = await getFileFromS3(key);
  if (!Body) {
    throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  }

  res.writeHead(200, { ContentType });
  res.write(Body, 'binary');
  res.end(null, 'binary');
});

router.route(['/:env/:type/:key', '/:type/:key']).get(getImage);

export default router;
