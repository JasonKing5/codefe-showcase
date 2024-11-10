import { users } from "./db";
import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();
const USER_UPDATED = "USER_UPDATED";
const USER_CREATED = "USER_CREATED";
const USER_DELETED = "USER_DELETED";

const resolvers = {
  Query: {
    user: (_, { id }) => {
      return users.find((user) => user.id == id);
    },
    users: () => users,
  },
  Mutation: {
    createUser: (_, { name, email, age }) => {
      const user = {
        id: users.length + 1,
        name,
        email,
        age,
      };
      users.push(user);
      pubsub.publish(USER_CREATED, { userCreated: user });
      return user;
    },
    updateUser: (_, { id, name, email, age }) => {
      const user = users.find((user) => user.id == id);
      if (!user) throw new Error("User not found");

      if (name) user.name = name;
      if (email) user.email = email;
      if (age) user.age = age;

      pubsub.publish(USER_UPDATED, { userUpdated: user });
      return user;
    },
    deleteUser: (_, { id }) => {
      const userIndex = users.findIndex((user) => user.id == id);
      if (userIndex === -1) throw new Error("User not found.");
      const user = users[userIndex];
      users.splice(userIndex, 1);
      pubsub.publish(USER_DELETED, { userDeleted: user });
      return user;
    },
  },
  Subscription: {
    userCreated: {
      subscribe: () => pubsub.asyncIterator([USER_CREATED]),
      resolve: (payload) => payload.userCreated,
    },
    userUpdated: {
      subscribe: () => pubsub.asyncIterator([USER_UPDATED]),
      resolve: (payload) => payload.userUpdated,
    },
    userDeleted: {
      subscribe: () => pubsub.asyncIterator([USER_DELETED]),
      resolve: (payload) => payload.userDeleted,
    },
  },
};

export default resolvers;
