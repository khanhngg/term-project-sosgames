const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const {
  User
} = require('../database');

router.get('/', function (request, response, next) {
  response.render('login', {
    title: 'UNO'
  });
});

// DEBUG Still Gotta fix this
router.post('/', (request, response, next) => {
  let formErrors = formValidation(request);

  if (formErrors) {
    renderErrors(response, formErrors);
    
  } else {
    const { username, password } = request.body;

    User.login(username, password)
      .then(result => {

        if (result.id == undefined) {
          renderErrors(response, result);

        } else {
          const isSecure = request.app.get('env') != 'development';
          response.cookie(
            'user_id', result.id, {
              httpOnly: true,
              signed: true,
              secure: isSecure
            });
          response.redirect('/lobby');
        }
      });
  }
});

// Validate User
let formValidation = ((request) => {
  request.checkBody('username', 'Username field cannot be empty.').notEmpty();
  request.checkBody('username', 'Username must be between 4-20 characters long.').len(4, 20);
  request.checkBody('password', 'Password field cannot be empty.').notEmpty();
  request.checkBody('password', 'Password must be 8-100 characters long.').len(8, 100);
  return request.validationErrors();
});

let renderErrors = ((response, errors) => {
  response.render('login', {
    title: 'UNO',
    errors: errors
  });
});

// This doesn't work as intended. Clears cookie but I feel like it needs work
// router.get('/logout', (request, response, next ) => {
//   if( request.cookies ) {
//     response.clearCookie('user_id');
//     response.redirect('/');
//   }
// });

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((username, done) => {
  User.getUserId(username).then((user) => {
    done(null, user.id);
  });
});

module.exports = router;