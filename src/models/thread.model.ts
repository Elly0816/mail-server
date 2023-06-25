import { Schema } from 'mongoose';
import mongoose from '../db/db';
import { messageFromDb } from './message.model';

const thread = {
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
  messages: { type: [String] },
  lastMessage: String,
  lastTitle: String,
};

export interface threadFromDb {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  lastModified: Date;
  messages: [mongoose.Types.ObjectId];
  lastMessage: string;
  lastTitle: string;
}

export interface thread {
  messages: [messageFromDb['_id'] | undefined];
  lastMessage: string;
  lastTitle: string;
}

const threadSchema = new Schema(thread);

const Thread = mongoose.model('Thread', threadSchema);

export { Thread };
