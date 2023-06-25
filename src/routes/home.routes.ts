import { Request, Router, Response } from 'express';
import _ from 'lodash';
import { userFromDb } from '../models/user.model';

const homeRoute = Router();

const path: string = '/';

homeRoute.get(path, (req: Request, res: Response) => {
  const newUser = _.omit(req.user, ['password']) as Omit<
    userFromDb,
    'password'
  >;
  res.status(200).json({ message: 'Welcome to the home route', user: newUser });
});

export default homeRoute;
