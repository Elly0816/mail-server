import mongoose from '../db/db';
import { Schema } from 'mongoose';

export interface message {
  title: string;
  body: string;
  from: string;
  to: string;
  threadId: string;
}

const message = {
  title: String,
  body: String,
  from: String,
  to: String,
  read: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  threadId: String,
};

export interface messageFromDb extends message {
  _id: mongoose.Types.ObjectId;
  read: boolean;
  date: Date;
}

const messageSchema = new Schema(message);

const Message = mongoose.model('Message', messageSchema);

export { Message };
