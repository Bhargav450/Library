const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/db');
const User = require('./User'); // Import User model
const Book = require('./Book'); // Import Book model

const BorrowedBook = sequelize.define('BorrowedBook', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  borrowedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  dueDate: { type: DataTypes.DATE, allowNull: false },
  returnedAt: { type: DataTypes.DATE, allowNull: true },
}, { timestamps: true });

// Relationship: BorrowedBook belongs to User
BorrowedBook.belongsTo(User, { foreignKey: 'userId' });
// Relationship: BorrowedBook belongs to Book
BorrowedBook.belongsTo(Book, { foreignKey: 'bookId' });


(async () => {
    try {
      await BorrowedBook.sync({ alter: true }); // Use { force: true } in development to drop and recreate tables
      console.log('Database synced!');
    } catch (error) {
      console.error('Error syncing database:', error);
    }
  })();

module.exports = BorrowedBook;
