/**
 * @Author: Bashudev Poudel <prazeev>
 * @Date:   2018-06-09T14:55:46+05:45
 * @Email:  prazeev@gmail.com
 * @Filename: Frontend.js
 * @Last modified by:   prazeev
 * @Last modified time: 2018-06-14T12:57:10+05:45
 * @Copyright: Copyright 2018, Bashudev Poudel
 */
 var express = require('express')
 var router = express.Router();
 var mongodb = require('mongodb');
 var passport = require('passport');
 var MongoClient = mongodb.MongoClient;
 var moment = require('moment-timezone');
 router.use(express.static('public'))
 var passport = require('passport')
   , FacebookStrategy = require('passport-facebook').Strategy;
 passport.use(new FacebookStrategy({
     clientID: 1626068404365914,
     clientSecret: "c9716b4e59fb4f5a503a9469329648a2",
     callbackURL: "http://worldcup.bizpati.com/"
   },
   function(accessToken, refreshToken, profile, done) {
     done(null, profile)
   }
 ));
 passport.serializeUser(function(user, cb) {
   cb(null, user);
 });
 passport.deserializeUser(function(obj, cb) {
   cb(null, obj);
 });
 // Mongo DB
 MongoClient.connect('mongodb://localhost:27017/', function(err, db) {
   var dbo = db.db("BizPatiGame");
   function checkAuth(req, res, next) {
     if(req.user == undefined) {
       res.redirect("/")
     } else {
       next()
     }
   }
   router.get("/", passport.authenticate('facebook'), function(req, res) {
     res.redirect("/play")
   })
   router.get("/play", checkAuth, function(req, res) {
     dbo.collection("users").find({fb_id: req.user.id}).toArray(function(err, result) {
       if(result.length == 1) {
         dbo.collection("groups").aggregate([
             { $lookup:
                     {
                         from: 'teams',
                         localField: '_id',
                         foreignField: 'group',
                         as: 'data'
                     }
             }
         ]).toArray(function(erer, resultGroups) {
           if (err) throw err;
           res.render("frontend/dashboard.ejs", {
             data: result[0],
             user: req.user,
             groups: resultGroups
           })
         });
       } else {
         var newUser = {
           fb_id: req.user.id,
           name: req.user.displayName,
           points: 0,
           game_played:0,
           today_points: 0,
           date: new Date()
         }
         dbo.collection("users").insertOne(newUser, function(e, r) {
           dbo.collection("users").find({}, {
             fb_id: req.user.id
           }).toArray(function(er, re) {
             dbo.collection("groups").aggregate([
                 { $lookup:
                         {
                             from: 'teams',
                             localField: '_id',
                             foreignField: 'group',
                             as: 'data'
                         }
                 }
             ]).toArray(function(erer, resultGroups) {
               if (err) throw err;
               res.render("frontend/dashboard.ejs", {
                 data: re[0],
                 user: req.user,
                 groups: resultGroups
               })
             });
           })
         })
       }
     })

   })
   router.get("/result", function(req, res) {
     dbo.collection("score").aggregate([
        {
         $match: {
           completed: true,
           status: true
          }
         },
         { $lookup:
                 {
                     from: 'groups',
                     localField: 'group',
                     foreignField: '_id',
                     as: 'groupdetails'
                 }
         },
         { $lookup:
                 {
                     from: 'game',
                     localField: 'game',
                     foreignField: '_id',
                     as: 'gamedetails'
                 }
         },
         { $lookup:
                 {
                     from: 'teams',
                     localField: 'teamone',
                     foreignField: '_id',
                     as: 'teamonedetails'
                 }
         },
         { $lookup:
                 {
                     from: 'teams',
                     localField: 'teamtwo',
                     foreignField: '_id',
                     as: 'teamtwodetails'
                 }
         }
     ]).toArray(function(err, result) {
       if (err) throw err;
       res.render("frontend/result.ejs", {
         data: result,
         currentTime: new Date()
       })
     });
   });
   router.get("/match", function(req, res) {
     dbo.collection("score").aggregate([
        {
         $match: {
           status: true
          }
         },
         { $lookup:
                 {
                     from: 'groups',
                     localField: 'group',
                     foreignField: '_id',
                     as: 'groupdetails'
                 }
         },
         { $lookup:
                 {
                     from: 'game',
                     localField: 'game',
                     foreignField: '_id',
                     as: 'gamedetails'
                 }
         },
         { $lookup:
                 {
                     from: 'teams',
                     localField: 'teamone',
                     foreignField: '_id',
                     as: 'teamonedetails'
                 }
         },
         { $lookup:
                 {
                     from: 'teams',
                     localField: 'teamtwo',
                     foreignField: '_id',
                     as: 'teamtwodetails'
                 }
         }
     ]).toArray(function(err, result) {
       if (err) throw err;
       res.render("frontend/matches.ejs", {
         data: result,
         currentTime: new Date()
       })
     });
   });
   router.get("/today_points", checkAuth, function(req, res) {
     dbo.collection("users").find({
       $query: {},
       $orderby: {
         today_points : -1
       }
     }).toArray(function(err, result) {
       if (err) throw err;
       res.render("frontend/today_points.ejs", {
         data: result,
         user: req.user
       })
     });
   });
   router.get("/tiesheet", function(req, res) {
     dbo.collection("groups").aggregate([
         { $lookup:
                 {
                     from: 'teams',
                     localField: '_id',
                     foreignField: 'group',
                     as: 'data'
                 }
         }
     ]).toArray(function(err, result) {
       if (err) throw err;
       res.render("frontend/tiesheet.ejs", {
         data: result
       })
     });
   })
   // Facebook
   router.get("/user/logout", function(req, res) {
     req.logout()
   })
   router.get("/toc", checkAuth, function(req, res) {
     res.render("frontend/toc.ejs", {
       user: req.user
     })
   })
   router.get("/scoring", checkAuth, function(req, res) {
     res.render("frontend/scoring.ejs", {
       user: req.user
     })
   })
 })
module.exports = router
