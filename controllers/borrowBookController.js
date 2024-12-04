const Joi = require('joi');
const { sequelize, QueryTypes } = require('../config/db');

// Joi schema for adding a borrowed book
const borrowBookSchema = Joi.object({
    bookid: Joi.number().integer().required().messages({
        'number.base': 'Book ID must be an integer.',
        'number.empty': 'Book ID is required.',
    }),
    userid: Joi.number().integer().required().messages({
        'number.base': 'User ID must be an integer.',
        'number.empty': 'User ID is required.',
    }),
});

// Joi schema for returning a book
const returnBookSchema = Joi.object({
    id: Joi.number().integer().required().messages({
        'number.base': 'Borrow record ID must be an integer.',
        'number.empty': 'Borrow record ID is required.',
    }),
});

// Add borrowed book function
const addBorrowBook = async (req, res) => {
    const { error } = borrowBookSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        const { bookid, userid } = req.body;
        const borrowedat = new Date();
        const dueat = new Date();
        dueat.setDate(borrowedat.getDate() + 10); // Add 10 days to the borrowed date

        const [book] = await sequelize.query('SELECT availablecopies from books where id=?', {
            replacements: [bookid],
            type: sequelize.QueryTypes.SELECT,
        });
        if (!book || book.availableCopies <= 0) {
            return res.status(400).json({ message: 'Book not available for borrowing.' });
        }

        await sequelize.query(
            'UPDATE books SET availableCopies = availableCopies - 1 WHERE id = ?',
            { replacements: [bookid] }
        );

        await sequelize.query(
            'INSERT INTO borrowedBooks (borrowedat, duedate, userid, bookid) VALUES (?,?,?,?)',
            { replacements: [borrowedat, dueat, userid, bookid] }
        );

        res.status(200).json({ message: 'Book borrowed successfully.' });
    } catch (error) {
        console.error('error:', error);
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
};

// Return book function
const returnBook = async (req, res) => {
    const { error } = returnBookSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        const { id } = req.body;
        const returnedat = new Date();
        
        const [borrowedBook] = await sequelize.query('SELECT * FROM borrowedBooks WHERE id = ?', {
            replacements: [id],
            type: sequelize.QueryTypes.SELECT,
        });

        if (!borrowedBook) {
            return res.status(400).json({ message: 'No borrowed record found or book already returned.' });
        }

        await sequelize.query(
            'UPDATE borrowedBooks SET returnedat=? WHERE id = ?',
            { replacements: [returnedat, id], type: sequelize.QueryTypes.UPDATE }
        );

        res.status(200).json({ message: 'Book returned successfully.' });
    } catch (error) {
        console.error('error:', error);
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
};

module.exports = { addBorrowBook, returnBook };
