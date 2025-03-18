import { users } from "../dummyData/data.js";

const userResolver = {
  Query: {
    users: (__, __, { req, res }) => {
      return users;
    },
    user: (__, { userId }, { req, res }) => {
      return users.find((user) => user._id === userId);
    },
  },

  Mutation: {},
};

export default userResolver;
