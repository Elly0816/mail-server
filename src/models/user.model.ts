import { ObjectId } from 'mongodb';
import mongoose from '../db/db';
import { Schema } from 'mongoose';

export interface user {
  email: string;
  password: string;
  //   messages: string [];
}

const user = {
  email: {
    type: String,
    unique: true,
  },
  password: String,
  threads: {
    type: [String],
  },
};

export interface userFromDb extends user {
  _id: mongoose.Types.ObjectId;
  threads: Array<mongoose.Types.ObjectId>;
}

const userSchema = new Schema(user);

const User = mongoose.model('User', userSchema);

export { User };
