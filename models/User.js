const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/db');


const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('Admin', 'Librarian', 'Member'), allowNull: false },
    isApproved: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });



(async () => {
    try {
      await User.sync({ alter: true }); // Use { force: true } in development to drop and recreate tables
      console.log('Database synced!');
    } catch (error) {
      console.error('Error syncing database:', error);
    }
  })();

module.exports = User;
