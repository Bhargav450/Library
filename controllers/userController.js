const { sequelize, argon2, QueryTypes } = require('../config/db');


// Create a new user
const createUser = async (req, res) => {
  try {
    const { name, email, password, role , isApproved} = req.body;
    const hashedPassword = await argon2.hash(password, 10);
    const [user] = await sequelize.query(
        'INSERT INTO "users"(name, email, password, role, isApproved) VALUES(?,?,?,?,?)',
        {
            replacements: [name, email, hashedPassword, role, isApproved]
        }
    );
    if(user)
    res.status(201).json({ message: "User added successfully!!" });
    
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError' || error.code === '23505') {
        // Unique constraint violation detected
        const field = error.fields ? Object.keys(error.fields)[0] : 'unknown field';
        res.status(400).json({
          message: `The ${field} already exists. Please use a different value.`,
        });
      } else {
        // General error handling
        console.log("error:",error)
        res.status(500).json({ message: 'An error occurred', error: error.message });
      }
  }
};

// Update user details
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, isApproved } = req.body;
    const hashedPassword = await argon2.hash(password, 10);
    const [user] =  await sequelize.query(
      "SELECT * FROM users WHERE id = ?",
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

   // Update the user
    await sequelize.query(
    "UPDATE users SET name = ?, email = ?, password = ?, role=?, isApproved=?  WHERE id = ?",
    {
      replacements: [name, email, hashedPassword, role, isApproved, id],
      type: sequelize.QueryTypes.UPDATE,
    }
  );

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError' || error.code === '23505') {
      // Unique constraint violation detected
      const field = error.fields ? Object.keys(error.fields)[0] : 'unknown field';
      res.status(400).json({
        message: `The ${field} already exists. Please use a different value.`,
      });
    } else {
      // General error handling
      console.log("error:",error)
      res.status(500).json({ message: 'An error occurred', error: error.message });
    }
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [user] =  await sequelize.query(
      "SELECT * FROM users WHERE id = ?",
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


  
      // Use a raw SQL query to delete the user
    await sequelize.query("DELETE FROM users WHERE id = ?", {
      replacements: [id],
      type: QueryTypes.DELETE,
    });


    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};



module.exports = {
  createUser,
  updateUser,
  deleteUser,
};
