import mongoose, { ObjectId } from 'mongoose';
import { User, userFromDb } from '../models/user.model';

const getUser = async (
  field: keyof userFromDb,
  value: string | ObjectId
): Promise<userFromDb | undefined> => {
  let user;
  switch (field) {
    case '_id':
      if (typeof value !== 'string') {
        user = (await User.findById(value).lean()) as userFromDb;
        return user;
      } else {
        const idToUse = new mongoose.Types.ObjectId(value);
        user = (await User.findById(idToUse).lean()) as userFromDb;
        return user;
      }
    case 'email':
      user = (await User.findOne({ email: value }).lean()) as userFromDb;
      return user;
    case 'threads':
    case 'password':
      return undefined;
  }
};

export { getUser };
