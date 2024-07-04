import express, { Router } from 'express';

import configRoute from './config.route';
import authRoute from './auth.route';
import docsRoute from './swagger.route';
import userRoute from './user.route';
import profileRoute from './profile.route';
import categoryRoute from './category.route';
import platformRoute from './platform.route';

import linkRoute from './link.route';
import productRoute from './product.route';

import leadRoute from './lead.route';

import batchRoute from './batch.route';
import tagRoute from './tag.route';

import teamRoute from './team.route';

import uploadRoute from './upload.route';

import stripeRoute from './stripe.route';

import config from '../../config/config';

const router = express.Router();

interface IRoute {
  path: string;
  route: Router;
}

const defaultIRoute: IRoute[] = [
  {
    path: '/configs',
    route: configRoute,
  },
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/profiles',
    route: profileRoute,
  },
  {
    path: '/categories',
    route: categoryRoute,
  },
  {
    path: '/platforms',
    route: platformRoute,
  },
  {
    path: '/links',
    route: linkRoute,
  },
  {
    path: '/products',
    route: productRoute,
  },
  {
    path: '/leads',
    route: leadRoute,
  },
  {
    path: '/batches',
    route: batchRoute,
  },
  {
    path: '/tags',
    route: tagRoute,
  },
  {
    path: '/teams',
    route: teamRoute,
  },
  {
    path: '/uploads',
    route: uploadRoute,
  },
  {
    path: '/stripe',
    route: stripeRoute,
  },
];

const devIRoute: IRoute[] = [
  // IRoute available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultIRoute.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devIRoute.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
