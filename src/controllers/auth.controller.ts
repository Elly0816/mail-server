import jwt from 'jsonwebtoken';
import { userFromDb } from '../models/user.model';
import { config } from 'dotenv';
import { ACCESS, REFRESH } from '../constants/constants';

config();

const signAccess = (user: userFromDb): string => {
  //   console.log(user);
  const token: string = jwt.sign(user, ACCESS as string, {
    expiresIn: '1h',
  });
  return token;
};

const signRefresh = (user: userFromDb): string => {
  //   console.log(user);
  const token: string = jwt.sign(user as object, REFRESH as string, {
    expiresIn: '1y',
  });
  return token;
};

const verifyAccess = (accessToken: string): userFromDb | undefined => {
  try {
    let decoded = jwt.verify(accessToken, ACCESS as string) as userFromDb;
    return decoded;
  } catch (e) {
    return undefined;
  }
};

const verifyRefresh = (refreshToken: string): userFromDb | undefined => {
  try {
    let decoded = jwt.verify(refreshToken, REFRESH as string) as userFromDb;
    return decoded;
  } catch (e) {
    return undefined;
  }
};
export { signAccess, signRefresh, verifyAccess, verifyRefresh };
