export enum Endpoints {
  login = 'login',
  signup = 'signup',
}

export enum protectedEndpoints {
  logout = 'logout',
  message = 'message',
  user = 'user',
  thread = 'thread',
}

export enum Headers {
  access = 'access',
  refresh = 'refresh',
  cors = 'Access-Control-Allow-Origin',
  headers = 'Access-Control-Expose-Headers',
}

// const PORT = 5000;
const PORT = 3000;
const MONGOCONNECT =
  'mongodb+srv://elzoremmanuel:Odm1OjxLMxhWhlAo@cluster0.o2ixh5p.mongodb.net/?retryWrites=true&w=majority';
const ACCESS = 'This is my access token secret';
const REFRESH = 'This is my refresh token secret';
const CLIENT = 'http://localhost:5173';

export { PORT, MONGOCONNECT, ACCESS, REFRESH, CLIENT };
