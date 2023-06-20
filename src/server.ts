import express, { urlencoded, json } from 'express';
import homeRoute from './routes/home.routes';
import { config } from 'dotenv';
import { userFromDb } from './models/user.model';
import registerRoute from './routes/register.routes';
import { serializeUser } from './middlewares/auth.middleware';
import loginRoute from './routes/login.routes';
import logoutRoute from './routes/logout.routes';
import threadRoute from './routes/thread.routes';
import messageRoute from './routes/message.routes';
import cors from 'cors';
import { tryConnect } from './db/db';
import { CLIENT, PORT } from './constants/constants';

config();

declare global {
  namespace Express {
    interface Request {
      user: undefined | userFromDb;
    }
  }
}

const app = express();

app.use(cors({ origin: CLIENT as string }));
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(serializeUser);
app.use(homeRoute);
app.use(registerRoute);
app.use(threadRoute);
app.use(loginRoute);
app.use(logoutRoute);
app.use(messageRoute);

tryConnect(() => {
  app.listen(PORT, () => {
    console.log(`Server Running on PORT: ${PORT}`);
  });
});
