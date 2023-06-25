import { Request, Response, Router } from 'express';
import { protectedEndpoints } from '../constants/constants';
import {
  addMessageToThread,
  createMessage,
  getMessage,
  markMessageRead,
} from '../controllers/message.controller';
import { Message, message, messageFromDb } from '../models/message.model';
import {
  addThreadToUser,
  createThread,
  getThread,
} from '../controllers/thread.controller';
import { Thread, threadFromDb } from '../models/thread.model';
import mongoose, { ObjectId, isValidObjectId } from 'mongoose';
import { getUser } from '../controllers/user.controller';
import { userFromDb } from '../models/user.model';
import _ from 'lodash';

const messageRoute = Router();

const path = `/${protectedEndpoints.message}`;

//Get Message
messageRoute.get(`${path}/:id`, async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).send({ message: 'Invalid Object Id' });
  } else {
    if (!id) {
      res.status(404).json({ message: 'Message not found' });
    }
    // const message = (await getMessage('_id', id)) as messageFromDb;
    const thread = (await getThread('_id', id)) as threadFromDb;
    const messageIds = thread.messages;
    const messagesAreRead = await Promise.all(
      messageIds.map(
        async (id) =>
          await markMessageRead(id, req?.user?.email as userFromDb['email'])
      )
    );
    const messagesP = messageIds.map(
      async (id) => (await Message.findById(id).lean()) as messageFromDb
    );

    const messages = await Promise.all(messagesP);
    const otherUser =
      messages[0].from == req.user?.email ? messages[0].to : messages[0].from;
    // const unreadCount = messages.filter(message => message.read !== true);
    // const newMessages = await Promise.all(messages);
    if (messages && messagesAreRead) {
      const newUser = _.omit(req.user, ['password']) as Omit<
        userFromDb,
        'password'
      >;

      res
        .status(200)
        .json({ message: messages, user: newUser, otherUser: otherUser });
    } else {
      res
        .status(404)
        .json({ message: 'There was an error finding the message' });
    }
  }
});

//Create Message
messageRoute.post(path, async (req: Request, res: Response) => {
  const from = req.user?.email;
  const message = { ...req?.body, from: from } as message;
  // const message = req.body.message as message;
  const { threadId, title, body, to } = message;
  const otherUser = await getUser('email', to);
  if (!(title && body && from && to)) {
    // console.log(req.body);
    console.log('Make sure you entered the correct fields');
    res
      .status(400)
      .json({ message: 'Make sure you entered the correct fields' });
  } else {
    const thread = (await getThread('_id', threadId)) as threadFromDb;
    const newMessage = (await createMessage(message)) as messageFromDb;
    if (thread) {
      if (newMessage) {
        const messageAddedToThread = await addMessageToThread(
          newMessage._id,
          thread._id,
          newMessage.body
        );
        if (messageAddedToThread) {
          console.log('message added to thread');
          const newUser = _.omit(req.user, ['password']) as Omit<
            userFromDb,
            'password'
          >;

          res
            .status(201)
            .json({ message: newMessage, thread: thread, user: newUser });
        } else {
          console.log('message could not be added to thread');
          res
            .status(500)
            .json({ message: 'Message could not be added to thread' });
        }
      } else {
        console.log('message could not be created');
        res.status(500).json({ message: 'Message could not be created' });
      }
    } else {
      const thread = await createThread(newMessage);
      // const added = await addMessageToThread(
      //   newMessage._id,
      //   new mongoose.Types.ObjectId(thread?._id),
      //   req?.body.message
      // );
      // console.log('Thread, added');
      // console.log(thread, added);
      // console.log(newMessage._id, thread?._id);
      if (thread) {
        const toUser = await addThreadToUser(
          new mongoose.Types.ObjectId(thread?._id),
          new mongoose.Types.ObjectId(req.user?._id)
        );
        if (otherUser) {
          const toOtherUser = await addThreadToUser(
            new mongoose.Types.ObjectId(thread?._id),
            new mongoose.Types.ObjectId(otherUser?._id)
          );
          if (toUser && toOtherUser) {
            const user = await getUser(
              '_id',
              req.user?._id as unknown as ObjectId
            );
            console.log('To user && to other user');
            const newUser = _.omit(user, ['password']) as Omit<
              userFromDb,
              'password'
            >;

            res
              .status(200)
              .json({ thread: thread, message: newMessage, user: newUser });
          } else {
            console.log('Error adding to thread');
            res.status(500).json({ message: 'Error adding thread' });
          }
        } else {
          console.log('Could not find the other user');
          res.status(500).json({ message: 'Could not find the other user' });
        }
      } else {
        console.log('add msg to thread');
        res.status(404).json({ message: 'add msg to thread' });
      }
    }
  }
});

//Delete Message

//Read Message
messageRoute.patch(`${path}/:id`, async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).send({ message: 'Invalid Object Id' });
  } else {
    if (!id) {
      res.status(404).json({ message: 'Message not found' });
    } else {
      /**
       * Get the thread of id
       * create a new message with the message information
       * add the threadId to the threadId prop of the message
       * Add the message id to the thread's message array as a string
       */
    }
    const newMessageId = new mongoose.Types.ObjectId(id);
    const message = await markMessageRead(
      newMessageId,
      req?.user?.email as userFromDb['email']
    );
    if (message) {
      const message = await getMessage('_id', id, req?.user as userFromDb);
      res.status(200).json({ message: message });
    } else {
      res.status(404).json({ message: 'Could nont find the message' });
    }
  }
});

export default messageRoute;
