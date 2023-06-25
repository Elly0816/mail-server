import { Request, Response, Router } from 'express';
import { Endpoints, Headers } from '../constants/constants';
import { user, userFromDb } from '../models/user.model';
import { getUser } from '../controllers/user.controller';
import { compare } from '../utils/encodeDecode';
import { signAccess, signRefresh } from '../controllers/auth.controller';
import _, { Omit } from 'lodash';

const loginRoute = Router();

const path: string = `${Endpoints.login}`;

loginRoute.post(`/${path}`, async (req: Request, res: Response) => {
  /*
    
        login the user and give them tokens
        Both an access token and a refresh token
        Do the same for the register route
    
    */
  const { email, password } = req.body as user;
  if (!email || !password) {
    res.status(400).json({ message: 'Enter both email and password' });
  } else {
    const user = (await getUser('email', email)) as userFromDb;
    if (user) {
      const isSame = await compare(password, user.password);
      if (isSame) {
        req.user = user;
        const access = signAccess(user);
        const refresh = signRefresh(user);
        res.setHeader(
          'Authorization',
          JSON.stringify({ access: access, refresh: refresh })
        );
        console.log('\n');
        console.log('\n');
        console.log('user');
        console.log('\n');
        console.log(req.user);
        console.log('\n');
        console.log('\n');
        const newUser = _.omit(req.user, ['password']) as Omit<
          userFromDb,
          'password'
        >;

        res
          .status(200)
          .json({ message: 'Logged In successfully', user: newUser });
      } else {
        res.status(400).json({ message: 'Incorrect username or password' });
      }
    } else {
      res.status(400).json({ message: 'User not Found!' });
    }
  }
});

export default loginRoute;
