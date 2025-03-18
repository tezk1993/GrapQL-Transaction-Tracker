import { __EnumValue } from "graphql";
import { users } from "../dummyData/data.js";
import User from "../models/user.model.js";

const userResolver = {
  Query: {
    authUser: async (_, _, context) => {
      try {
        const user = await context.getUser();
        return user;
      } catch (error) {
        console.error("Error in authorization: ", error);
        throw new Error("Internal server error");
      }
    },
    user: async (__, { userId }) => {
      try {
        const user = await User.findById(userId);
        return user;
      } catch (error) {
        console.error("Error in getting user: ", error);
        throw new Error(error.message || "Error getting user");
      }
    },
  },

  Mutation: {
    signUp: async (_, { input }, context) => {
      try {
        const { username, name, password, gender } = input;

        if (!username || !name || !password || !gender) {
          throw new Error("All fields are required");
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
          throw new Error("User already exists");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let randomProfilePicture = "";
        if (gender === "Male") {
          randomProfilePicture = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        } else if (gender === "Female") {
          randomProfilePicture = `https://avatar.iran.liara.run/public/girl?username=${username}`;
        }

        const newUser = new User({
          username,
          password: hashedPassword,
          gender,
          profilePicture: randomProfilePicture,
        });

        await newUser.save();
        await context.login(newUser);
      } catch (error) {
        console.error("Error in sign up: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },

    login: async (_, { input }, context) => {
      try {
        const { username, password } = input;

        const { user } = await context.authenticate(
          "graphql-local",
          (username, password)
        );
        await context.login(user);

        return user;
      } catch (error) {
        console.error("Error in sign in: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    logout: async (_, _, context) => {
      try {
        await context.logout();

        req.session.destroy((err) => {
          if (err) throw err;
        });
        res.clearCookie("connect.sid");
        return { message: "Signed out successfully" };
      } catch (error) {
        console.error("Error in signing out: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
  },
};

export default userResolver;
