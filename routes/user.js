var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var handleCallbackError = require('./handleCallbackError')();

var env1 = {
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback'
};

/* GET user profile. */
router.get('/', ensureLoggedIn, function(req, res, next) {
    console.log('returning user',req.user._json);
    res.render('user', { user: req.user._json, primaryIdToken: req.session.id_token, env1: env1});
});

router.get('/refresh', ensureLoggedIn, function(req, res) {
    console.log('returning identities user',req.user._json);
    req.user.identities = localStorage.getItem('profile.identities');
    res.render('user', {
        user: req.user._json, //returning req.user._json, since it contains the user_metadata and app_metadata properties the root user doesn't have.
    });
});

router.get('/callback',
    handleCallbackError,
    passport.authenticate('auth0', { failureRedirect: '/url-if-something-fails' }),
    function(req, res) {
      res.redirect(req.session.returnTo || '//link-accounts/:targetUserId');
    });


module.exports = router;

