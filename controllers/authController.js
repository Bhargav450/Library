const Joi = require('joi');
const { sequelize, argon2, QueryTypes } = require('../config/db');
const jwt = require('jsonwebtoken');

// Login validation schema
const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.base': 'Email must be a string.',
        'string.empty': 'Email is required.',
        'string.email': 'Email must be a valid email.',
    }),
    password: Joi.string().min(6).required().messages({
        'string.base': 'Password must be a string.',
        'string.empty': 'Password is required.',
        'string.min': 'Password must be at least 6 characters long.',
    }),
});

// Registration validation schema
const registrationSchema = Joi.object({
    name: Joi.string().min(3).required().messages({
        'string.base': 'Name must be a string.',
        'string.empty': 'Name is required.',
        'string.min': 'Name must be at least 3 characters long.',
    }),
    email: Joi.string().email().required().messages({
        'string.base': 'Email must be a string.',
        'string.empty': 'Email is required.',
        'string.email': 'Email must be a valid email.',
    }),
    password: Joi.string().min(6).required().messages({
        'string.base': 'Password must be a string.',
        'string.empty': 'Password is required.',
        'string.min': 'Password must be at least 6 characters long.',
    }),
    role: Joi.string().valid('admin', 'user').required().messages({
        'string.base': 'Role must be a string.',
        'string.empty': 'Role is required.',
        'any.only': 'Role must be either "admin" or "user".',
    }),
    isApproved: Joi.boolean().optional().messages({
        'boolean.base': 'Approval status must be a boolean.',
    }),
});

// Login function
const login = async (req, res) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;
    try {
        const [user] = await sequelize.query(
            'SELECT * FROM USERS WHERE EMAIL = :email',
            {
                replacements: { email },
                type: QueryTypes.SELECT,
            }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }

        const isMatch = await argon2.verify(user.password, password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password!' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Registration function
const registration = async (req, res) => {
    const { error } = registrationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { name, email, password, role, isApproved } = req.body;
    try {
        const hashedPassword = await argon2.hash(password, 10);
        await sequelize.query(
            'INSERT INTO "users"(name, email, password, role, isApproved) VALUES(?,?,?,?,?)',
            {
                replacements: [name, email, hashedPassword, role, isApproved],
            }
        );
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError' || error.code === '23505') {
            const field = error.fields ? Object.keys(error.fields)[0] : 'unknown field';
            res.status(400).json({
                message: `The ${field} already exists. Please use a different value.`,
            });
        } else {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'An error occurred', error: error.message });
        }
    }
};

module.exports = { login, registration };
