const Joi = require('joi');
const { sequelize, QueryTypes } = require('../config/db');

// Joi schema for book creation and update
const bookSchema = Joi.object({
    title: Joi.string().min(3).required().messages({
        'string.base': 'Title must be a string.',
        'string.empty': 'Title is required.',
        'string.min': 'Title must be at least 3 characters long.',
    }),
    author: Joi.string().min(3).required().messages({
        'string.base': 'Author must be a string.',
        'string.empty': 'Author is required.',
        'string.min': 'Author must be at least 3 characters long.',
    }),
    isbn: Joi.string().length(13).required().messages({
        'string.base': 'ISBN must be a string.',
        'string.empty': 'ISBN is required.',
        'string.length': 'ISBN must be exactly 13 characters long.',
    }),
    availablecopies: Joi.number().integer().min(0).required().messages({
        'number.base': 'Available copies must be a number.',
        'number.integer': 'Available copies must be an integer.',
        'number.min': 'Available copies cannot be negative.',
    }),
});

// Create book function
const createbook = async (req, res) => {
    const { error } = bookSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const userId = req.user.id;
    try {
        const { title, author, isbn, availablecopies } = req.body;

        const [book] = await sequelize.query(
            'INSERT INTO "books"(title, author, isbn, availablecopies, userid) VALUES(?,?,?,?,?)',
            {
                replacements: [title, author, isbn, availablecopies, userId],
            }
        );

        if (book) res.status(201).json({ message: 'Book added successfully!!' });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError' || error.code === '23505') {
            const field = error.fields ? Object.keys(error.fields)[0] : 'unknown field';
            res.status(400).json({
                message: `The ${field} already exists. Please use a different value.`,
            });
        } else {
            console.error('error:', error);
            res.status(500).json({ message: 'An error occurred', error: error.message });
        }
    }
};

// Update book function
const updateBook = async (req, res) => {
    const { error } = bookSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        const { id } = req.params;
        const { title, author, isbn, availablecopies } = req.body;

        const [book] = await sequelize.query('SELECT * FROM books WHERE id = ?', {
            replacements: [id],
            type: sequelize.QueryTypes.SELECT,
        });

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        await sequelize.query(
            'UPDATE books SET title=?, author=?, isbn=?, availablecopies=? WHERE id = ?',
            {
                replacements: [title, author, isbn, availablecopies, id],
                type: sequelize.QueryTypes.UPDATE,
            }
        );

        res.status(200).json({ message: 'Book updated successfully' });
    } catch (error) {
        console.error('error:', error);
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
};

// Delete book function
const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const [book] = await sequelize.query('SELECT * FROM books WHERE id = ?', {
            replacements: [id],
            type: sequelize.QueryTypes.SELECT,
        });

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        await sequelize.query('DELETE FROM books WHERE id = ?', {
            replacements: [id],
            type: QueryTypes.DELETE,
        });

        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('error:', error);
        res.status(500).json({ message: 'Error deleting book', error: error.message });
    }
};

// Get all books function
const getBooks = async (req, res) => {
    try {
        const books = await sequelize.query('SELECT * FROM books', {
            type: sequelize.QueryTypes.SELECT,
        });

        if (!books.length) {
            return res.status(404).json({ message: 'No records found' });
        }

        res.status(200).json(books);
    } catch (error) {
        console.error('error:', error);
        res.status(500).json({ message: 'Error getting books', error: error.message });
    }
};

module.exports = { createbook, updateBook, deleteBook, getBooks };
