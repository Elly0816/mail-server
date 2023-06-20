import { protectedEndpoints } from '../constants/constants';
import { deSerializeUser } from '../middlewares/auth.middleware';
import { Request, Response, Router } from 'express';

const logoutRoute = Router();

const path: string = protectedEndpoints.logout;

logoutRoute.post(`/${path}`, deSerializeUser, (req: Request, res: Response) => {
  res.status(200).json({ message: 'Logged Out Successfully' });
});

export default logoutRoute;
