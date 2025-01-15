import bcypt from "bcrypt";

const saltRounds = 10;

export const encrypt = (password) => {
  return bcypt.hashSync(password, saltRounds);
};

export const compare = (password, hash) => {
  return bcypt.compareSync(password, hash);
};
