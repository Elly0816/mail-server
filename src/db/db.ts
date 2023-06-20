import mongoose from 'mongoose';
import { config } from 'dotenv';
import { MONGOCONNECT } from '../constants/constants';

config();

const tryConnect = async (cb: () => void) => {
  try {
    const connect = async (): Promise<void> => {
      // await mongoose.connect(process.env.MONGOCONNECT as string);
      await mongoose.connect(MONGOCONNECT as string);
    };
    connect().then(() => cb());
  } catch (e) {
    console.error(e);
  }
};

export { tryConnect };
export default mongoose;
