import * as argon2 from 'argon2';

export const getArrayWhiteList = () => {
  return `${process.env.WHITE_LIST_DOMAINS}`.split(',');
};

export const encryptString = (password: string): Promise<string> => {
  return argon2.hash(password);
};
