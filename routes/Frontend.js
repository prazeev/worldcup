/**
 * @Author: Bashudev Poudel <prazeev>
 * @Date:   2018-06-09T14:55:46+05:45
 * @Email:  prazeev@gmail.com
 * @Filename: Frontend.js
 * @Last modified by:   prazeev
 * @Last modified time: 2018-06-12T15:16:40+05:45
 * @Copyright: Copyright 2018, Bashudev Poudel
 */
 var express = require('express')
 var router = express.Router();
 var mongodb = require('mongodb');
 var passport = require('passport');
 var MongoClient = mongodb.MongoClient;
 var moment = require('moment-timezone');
 router.use(express.static('public'))
 // Mongo DB
 MongoClient.connect('mongodb://localhost:27017/', function(err, db) {
   var dbo = db.db("BizPatiGame");
   router.get("/", function(req, res) {
     res.render("frontend/dashboard.ejs")
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
   router.get("/user/login", passport.authenticate('facebook', function(err, user, info) {
     console.log(user);
   }))
   router.get("/user/logout", function(req, res) {
     req.logout()
   })
 })
module.exports = router
