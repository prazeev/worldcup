/**
 * @Author: Bashudev Poudel <prazeev>
 * @Date:   2018-06-12T11:17:34+05:45
 * @Email:  prazeev@gmail.com
 * @Filename: Passport.js
 * @Last modified by:   prazeev
 * @Last modified time: 2018-06-12T13:11:18+05:45
 * @Copyright: Copyright 2018, Bashudev Poudel
 */
 var passport = require('passport')
   , FacebookStrategy = require('passport-facebook').Strategy;
 passport.use(new FacebookStrategy({
     clientID: 486467045105326,
     clientSecret: "bfb0b2a5434b0d17e8a5d2439fedbdb4",
     callbackURL: "http://localhost:8261/"
   },
   function(accessToken, refreshToken, profile, done) {
     done(null, profile)
   }
 ));
