const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/db');
const BorrowedBook = require('./BorrowedBook'); // Import BorrowedBook model

const Book = sequelize.define('Book', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  author: { type: DataTypes.STRING },
  isbn: { type: DataTypes.STRING, unique: true },
  availableCopies: { type: DataTypes.INTEGER, defaultValue: 1 },
}, { timestamps: true });



(async () => {
    try {
      await Book.sync({ alter: true }); // Use { force: true } in development to drop and recreate tables
      console.log('Database synced!');
    } catch (error) {
      console.error('Error syncing Book:', error);
    }
  })();

module.exports = Book;
