export const getArrayWhiteList = () => {
  return `${process.env.WHITE_LIST_DOMAINS}`.split(',');
};
