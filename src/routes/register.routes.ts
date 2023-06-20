import { Request, Response, Router } from 'express';
import { Endpoints, Headers } from '../constants/constants';
import { User, user, userFromDb } from '../models/user.model';
import { getUser } from '../controllers/user.controller';
import { hash } from '../utils/encodeDecode';
import { signAccess, signRefresh } from '../controllers/auth.controller';

const registerRoute = Router();

const path: string = `${Endpoints.signup}`;

registerRoute.post(`/${path}`, async (req: Request, res: Response) => {
  /*
    
        Register the user and give them tokens
        Both an access token and a refresh token
        Do the same for the login route
    
    */
  const { email, password } = req.body as unknown as user;

  if (!email || !password) {
    res.status(400).json({ message: 'Enter both email and password!' });
  }
  const user = await getUser('email', email);
  if (user) {
    res.status(403).json({ message: 'Login Instead!' });
  } else {
    /*
            Hash the password and send it to the db
            Sign both access and refresh tokens
            and set them as headers
        
        */
    hash(password, async (err, hashedPassword) => {
      if (err) {
        res
          .status(500)
          .json({ message: 'There was an error with signing the tokens' });
      } else {
        const user = (
          await User.create({
            email: email,
            password: hashedPassword,
          })
        ).toJSON() as unknown as userFromDb;
        const access = signAccess(user);
        const refresh = signRefresh(user);
        if (access && refresh) {
          res.setHeader(
            'Authorization',
            JSON.stringify({ access: access, refresh: refresh })
          );
          req.user = user;
          res.status(201).json({
            message: 'You have been logged in successfully',
            user: user,
          });
        } else {
          res
            .status(500)
            .json({ message: 'There was an error with signing the tokens' });
        }
      }
    });
  }
});

export default registerRoute;
