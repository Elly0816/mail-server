import bcrypt from 'bcrypt';

const salt = 10;

const hash = (
  value: string,
  cb: (err: Error | null, password: string | null) => void
): void => {
  bcrypt.hash(value, salt, (err, password) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, password);
    }
  });
};

const compare = async (password: string, hash: string): Promise<boolean> => {
  const value = await bcrypt.compare(password, hash);
  return value;
};

export { hash, compare };
