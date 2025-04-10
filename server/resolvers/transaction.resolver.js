import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";

const transactionResolver = {
  Query: {
    transactions: async (_, __, context) => {
      try {
        if (!context.getUser()) throw new Error("Unauthorizeed");
        const userId = await context.getUser()._id;
        const transactions = await Transaction.find({ userId });

        return transactions;
      } catch (error) {
        console.error("Error in getting transactions: ", error);
        throw new Error(error.message || "Error getting transactions");
      }
    },
    transaction: async (_, { transactionId }) => {
      try {
        const transaction = await Transaction.findById(transactionId);
        return transaction;
      } catch (error) {
        console.error("Error in getting transaction: ", error);
        throw new Error(error.message || "Error getting transaction");
      }
    },

    categoryStatistics: async (_, __, context) => {
      if (!context.getUser()) throw new error("Unauthorized");
      const userId = context.getUser()._id;

      const transactions = await Transaction.find({ userId });

      const categoryMap = {};

      transactions.forEach((transaction) => {
        if (!categoryMap[transaction.category]) {
          categoryMap[transaction.category] = 0;
        }

        categoryMap[transaction.category] += transaction.amount;
      });

      return Object.entries(categoryMap).map(([category, totalAmount]) => ({
        category,
        totalAmount,
      }));
    },
  },

  Mutation: {
    createTransaction: async (_, { input }, context) => {
      try {
        const newTransaction = new Transaction({
          ...input,
          userId: context.getUser()._id,
        });
        await newTransaction.save();
        return newTransaction;
      } catch (error) {
        console.error("Error in creating new transaction: ", error);
        throw new Error(error.message || "Error creating new transaction");
      }
    },
    updateTransaction: async (_, { input }) => {
      try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(
          input.transactionId,
          input,
          { new: true }
        );
        return updatedTransaction;
      } catch (error) {
        console.error("Error in updating transaction: ", error);
        throw new Error(error.message || "Error updating transaction");
      }
    },
    deleteTransaction: async (_, { transactionId }, __) => {
      try {
        const deletedTransaction = await Transaction.findByIdAndDelete(
          transactionId
        );
        return deletedTransaction;
      } catch (error) {
        console.error("Error in deleting transaction: ", error);
        throw new Error(error.message || "Error deleting transaction");
      }
    },
  },

  Transaction: {
    user: async (parent) => {
      const userId = parent.userId;
      try {
        const user = await User.findById(userId);
        return user;
      } catch (error) {
        console.log("Error in user.transactions resolver: ", error);
        throw new Error(error.message);
      }
    },
  },
};

export default transactionResolver;
