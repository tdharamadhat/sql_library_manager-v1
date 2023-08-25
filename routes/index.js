'use strict';

var express = require('express');
var router = express.Router();
const { Book } = require('../models');
const { asyncHandler } = require('../middleware/async-handler');


// Home route should redirect to the /books route
router.get('/', asyncHandler( async (reg,res) => {
  const books = await Book.findAll();
  if(books) {
      res.render("index", { books: books});
  } 
}));

// GET generated error route - create and throw 500 server error 
router.get('/error', (req, res, next) => {

  // Log out custom error handler indication
  console.log('Custom error route called');
  const err = new Error();
  err.message = `It looks like something went wrong on the server!`
  err.status = 500;
  throw err;
});

// Shows the create new book form route
router.get('/new', (req, res, next) => {
  console.log('Route to new book page');  //debug
  res.render("new-book");
});

// Route that create a new book to the database
router.post('/new', asyncHandler(async (req, res) => {
  try {
    await Book.create(req.body);
    res.status(201).redirect('/books');

  } catch (error) {
    //console.log('ERROR: ', error.name);
    //res.render("new-book",{message: error.name});

    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      console.log(errors);
      //res.status(400).json({ errors }); 
      res.status(400).render("new-book",{errors:errors});
    } else {
      throw error;
    }
  }
}));

// Route that shows book detail form
router.get('/:id', asyncHandler( async (req,res) => {
  const bookID = req.params.id;
  const book = await Book.findAll({
    where: {
      id: bookID
    }
  });
  if(book){
    res.render("update-book", {isUpdated: false, books: book});
  }
}));

// Route that update book detail form
  router.post('/:id', asyncHandler( async (req, res) => {
    const bookID = req.params.id;
    try {
        await Book.update(req.body, {
        where: {
          id: bookID
        }
      });
      const book = await Book.findAll({
            where: {
              id: bookID
            }
          });
      // Display successful message in the form.
      res.render("update-book", { isUpdated: true, books: book});
    } catch (error) {
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        const errors = error.errors.map(err => err.message);
        res.status(400).json({ errors });
      } else {
        throw error;
      }
    }
  }));

  // Route that will delete a book
  router.post('/:id/delete', asyncHandler( async (req, res) => {
    const bookID = req.params.id;
    try {
      await Book.destroy({
        where: {
          id: bookID
        }
      });        
      res.status(204).redirect('/');
      
    } catch (error) {
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        const errors = error.errors.map(err => err.message);
        res.status(400).json({ errors });
      } else {
        throw error;
      }
    }
  }));

module.exports = router;
