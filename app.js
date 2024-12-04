const express = require('express');
const dotenv = require('dotenv');
const {sequelize}=require('./config/db');
// const {user}=require('./models/User');
// const {book}=require('./models/Book');
// const {borrowedbook}=require('./models/BorrowedBook');

const userRoutes=require('./routes/authRoutes');
//CRUD users
const adminRoutes=require('./routes/userRoutes');
//CRUD books
const bookRoutes=require('./routes/bookRoutes');
//borrow books
const borrowBookRoutes=require('./routes/borrowedBookRoutes');



// Initialize dotenv to load environment variables
dotenv.config();

// Initialize the Express application
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use appointment routes
app.use('/api', userRoutes);
app.use('/api/user',adminRoutes);
app.use('/api/',bookRoutes);
app.use('/api/',borrowBookRoutes);

PORT=3000
// Function to connect to the database and start the server
const connectDatabases = async () => {
  try {
    // Authenticate the connection to the PostgreSQL database
    await sequelize.authenticate();
    console.log('PostgreSQL connected');

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error connecting to databases:', err);
  }
};

// Connect to the database and start the server
connectDatabases();


// // Graceful shutdown
// const gracefulShutdown = async () => {
//   console.log('Shutting down gracefully...');
//   try {
//       await sequelize.close(); // Close the Sequelize connection
//       console.log('Database connection closed.');
//   } catch (error) {
//       console.error('Error closing the database connection:', error);
//   }
//   process.exit(0); // Exit the process
// };

// // Handle termination signals
// process.on('SIGINT', gracefulShutdown);
// process.on('SIGTERM', gracefulShutdown);


