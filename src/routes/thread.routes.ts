import { Request, Response, Router, response } from 'express';
import { protectedEndpoints } from '../constants/constants';
import { Thread, thread, threadFromDb } from '../models/thread.model';
import {
  addThreadToUser,
  deleteThreadFromUser,
  getThread,
  getUserFromThread,
} from '../controllers/thread.controller';
import { message } from '../models/message.model';
import {
  createMessage,
  userUnreadCount,
} from '../controllers/message.controller';
import mongoose, { isValidObjectId } from 'mongoose';
import { userFromDb } from '../models/user.model';
import { getUser } from '../controllers/user.controller';
import _ from 'lodash';

const threadRoute = Router();

const path = `${protectedEndpoints.thread}`;

threadRoute.get(`/${path}/:id`, async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(id);
  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid Object Id' });
  } else {
    if (!id) {
      res.status(400).json({ message: 'Bad Request' });
    } else {
      const user = await getUser('_id', id);
      if (user) {
        let threads = (await Promise.all(
          user.threads.map(async (thread) => {
            return await getThread('_id', thread.toString());
          })
        )) as threadFromDb[];
        threads = threads.sort((a, b) => {
          return b.createdAt.getTime() - a.createdAt.getTime();
        });
        const unread = await Promise.all(
          threads.map(async (thread) => {
            return await userUnreadCount(
              thread.messages,
              req.user?.email as string
            );
          })
        );
        //      await userUnreadCount(
        //   thread.messages,
        //   req.user?.email as string
        // );
        const otherUser = await Promise.all(
          threads.map(async (thread) => {
            return await getUserFromThread(thread._id, req?.user as userFromDb);
          })
        );
        const newUser = _.omit(req.user, ['password']) as Omit<
          userFromDb,
          'password'
        >;

        res.status(200).json({
          message: threads,
          user: newUser,
          unread: unread,
          otherUser: otherUser,
        });
      } else {
        res.status(404).json({ message: 'User not found!' });
      }
      // const thread = (await getThread('_id', id)) as threadFromDb;
      // if (thread) {
      //   const unread = await userUnreadCount(
      //     thread.messages,
      //     req.user?.email as string
      //   );
      //   const otherUser = await getUserFromThread(
      //     thread._id,
      //     req?.user as userFromDb
      //   );
      //   res.status(200).json({
      //     message: thread,
      //     user: req.user,
      //     unread: unread,
      //     otherUser: otherUser,
      //   });
      // } else {
      //   res.status(404).json({ message: 'Thread not found' });
      // }
    }
  }
});

threadRoute.post(`/${path}`, async (req: Request, res: Response) => {
  const { message }: { message: message } = req.body;
  if (!message) {
    res.status(400).json({
      message: 'Bad Request, There was no message in the body of the request',
    });
  }
  const newMessage = await createMessage(message);
  let thread = new Thread({ messages: newMessage?._id });
  let userId = req.user;
  const threadAddedToUser = await addThreadToUser(
    thread._id,
    userId?._id as userFromDb['_id']
  );
  if (threadAddedToUser) {
    const newUser = _.omit(req.user, ['password']) as Omit<
      userFromDb,
      'password'
    >;

    res.status(201).json({ message: 'Thread added to User', user: newUser });
  }
  res.status(500).json({ message: 'There was an error' });
});

threadRoute.patch(`/${path}/:id`, async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ message: 'Proviede a thread Id' });
  }
  const { message }: { message: message } = req.body;
  if (!message) {
    res.status(400).json({
      message: 'Bad Request, There was no message in the body of the request',
    });
  }
});

threadRoute.delete(`/${path}/:id`, async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ message: 'Proviede a thread Id' });
  }
  const threadId = new mongoose.Types.ObjectId(id);
  const threadDeleted = await deleteThreadFromUser(
    threadId,
    req.user?._id as userFromDb['_id']
  );
  if (threadDeleted) {
    res.status(200).json({ message: 'Thread has been deleted' });
  } else {
    res
      .status(500)
      .json({ message: 'There was an error deleteing the thread' });
  }
});

export default threadRoute;
