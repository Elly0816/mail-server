import mongoose, { ObjectId } from 'mongoose';
import { messageFromDb, Message, message } from '../models/message.model';
import { Thread, threadFromDb } from '../models/thread.model';
import { userFromDb } from '../models/user.model';

const getMessage = async (
  field: keyof messageFromDb | null | undefined,
  value: string | ObjectId,
  user: userFromDb
): Promise<messageFromDb | messageFromDb[] | undefined> => {
  if (field) {
    switch (field) {
      case '_id':
        if (typeof value === 'string') {
          const id = new mongoose.Types.ObjectId(value);
          const message = (await Message.findById(id).lean()) as messageFromDb;
          await markMessageRead(message._id, user.email);
          return message;
        } else {
          const message = (await Message.findById(
            value
          ).lean()) as messageFromDb;
          await markMessageRead(message._id, user.email);
          return message;
        }
      case 'from':
        if (typeof value === 'string') {
          const id = new mongoose.Types.ObjectId(value);
          const message = (await Message.findOne({
            from: id,
          }).lean()) as messageFromDb;
          await markMessageRead(message._id, user.email);
          return message;
        } else {
          const message = (await Message.findOne({
            from: value,
          }).lean()) as messageFromDb;
          await markMessageRead(message._id, user.email);
          return message;
        }
      case 'to':
        if (typeof value === 'string') {
          const id = new mongoose.Types.ObjectId(value);
          const message = (await Message.findOne({
            to: id,
          }).lean()) as messageFromDb;
          await markMessageRead(message._id, user.email);
          return message;
        } else {
          const message = (await Message.findOne({
            to: value,
          }).lean()) as messageFromDb;
          await markMessageRead(message._id, user.email);
          return message;
        }
      case 'read':
      case 'date':
      case 'title':
      case 'body':
        return undefined;
    }
  } else {
    const message = (await Message.find().lean()) as messageFromDb;
    await markMessageRead(message._id, user.email);
    return message;
  }
};

//Create Message;
const createMessage = async (
  message: message
): Promise<messageFromDb | undefined> => {
  const newMessage = (await Message.create(message)) as messageFromDb;
  return newMessage ? newMessage : undefined;
};

//Is message in thread;
const messageInThread = async (
  messageId: messageFromDb['_id'],
  threadId: threadFromDb['_id']
): Promise<boolean> => {
  const thread = (await Thread.findById(threadId).lean()) as threadFromDb;
  const messages = thread.messages.map((message) => message.toString());
  const messageIdString = messageId.toString();
  return messages.includes(messageIdString) ? true : false;
};

//Add message to thread
const addMessageToThread = async (
  messageId: messageFromDb['_id'],
  threadId: threadFromDb['_id'],
  lastMessageBody: string
): Promise<boolean> => {
  let thread = await Thread.findByIdAndUpdate(threadId, {
    $set: { lastModified: Date.now(), lastMessage: lastMessageBody },
    $push: { messages: messageId.toString() },
  });
  // let thread = await Thread.bulkWrite([
  //   {
  //     updateMany: {
  //       filter: { _id: threadId },
  //       update: { $push: { messages: messageId.toString() } },
  //     },
  //   },

  //   {
  //     updateOne: {
  //       filter: { _id: threadId },
  //       update: { $set: { lastModified: new Date() } },
  //     },
  //   },

  //   {
  //     updateOne: {
  //       filter: { _id: threadId },
  //       update: { $set: { lastMessage: lastMessageBody } },
  //     },
  //   },
  // ]);
  // console.log('Thread in add message function');
  // console.log(thread);
  // console.log(thread.isOk());
  let newThread;
  if (thread) {
    newThread = (await Thread.findOne(threadId).lean()) as threadFromDb;
  }
  console.log(JSON.stringify(newThread));
  console.log(messageId);
  console.log(newThread?.messages.includes(messageId) ? true : false);
  return newThread?.messages.includes(messageId.toString() as any)
    ? true
    : false;
  // const thread = (await Thread.findByIdAndUpdate(
  //   threadId,
  //   { $push: { messages: messageId.toString(),} $set: {lastModified: Date.now } },
  //   { new: true }
  // ).lean()) as threadFromDb;
  // return thread ? true : false;
};

const deleteMessageFromThread = async (
  threadId: threadFromDb['_id'],
  messageId: messageFromDb['_id']
): Promise<boolean> => {
  const thread = await Thread.findByIdAndUpdate(
    threadId,
    { $pull: { messages: messageId.toString() } },
    { new: true }
  ).lean();
  const message = await Message.findByIdAndDelete(messageId).lean();
  if (thread && message) {
    return true;
  }
  return false;
};

const markMessageRead = async (
  messageId: messageFromDb['_id'],
  userEmail: userFromDb['email']
): Promise<boolean> => {
  /*If the sender has the same id as the user, don't mark it else, do */
  const oldMessage = (await Message.findById(
    messageId
  ).lean()) as messageFromDb;
  if (oldMessage.from != userEmail) {
    const message = (await Message.findByIdAndUpdate(
      messageId,
      { $set: { read: true } },
      { new: true }
    ).lean()) as messageFromDb;
    if (message) {
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
};

const userUnreadCount = async (
  messagesInThread: threadFromDb['messages'],
  userEmail: userFromDb['email']
): Promise<number> => {
  /*
   * get the messages
   * see if they're read and if the sender is the same as the email
   * if so
   *
   *
   *
   *
   */
  const messages = await Promise.all(
    messagesInThread.map(
      async (message) =>
        (await Message.findById(message).lean()) as messageFromDb
    )
  );
  const unreadCount = messages
    .filter((message) => message.to === userEmail)
    .filter((message) => message.read === false).length;
  return unreadCount;
};

export {
  userUnreadCount,
  deleteMessageFromThread,
  getMessage,
  messageInThread,
  addMessageToThread,
  createMessage,
  markMessageRead,
};
