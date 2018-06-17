/**
 * @Author: Bashudev Poudel <prazeev>
 * @Date:   2018-06-08T16:28:47+05:45
 * @Email:  prazeev@gmail.com
 * @Filename: Api.js
 * @Last modified by:   prazeev
 * @Last modified time: 2018-06-17T10:18:21+05:45
 * @Copyright: Copyright 2018, Bashudev Poudel
 */
 var express = require('express')
 var router = express.Router();
 var mongodb = require('mongodb');
 var cookie = require('cookie-session');
 var MongoClient = mongodb.MongoClient;

 // Mongo DB
 MongoClient.connect('mongodb://localhost:27017/', function(err, db) {
   var dbo = db.db("BizPatiGame");
   function checkAuth(req, res, next) {
     if(req.user == undefined) {
       res.json({
         error: true,
         message: "Not Logged in!!"
       })
     } else {
       next()
     }
   }
   router.get("/leaderboard/:limit", function(req, res) {
     var limit = Number(req.params.limit)
     dbo.collection("users").find({}).sort({
       points : -1
     }).limit(limit).toArray(function(err, result) {
       res.json(result)
     })
   })
   router.get("/predict/:id/:one/:two", checkAuth, function(req, res) {
     var id = req.params.id
     var one = Number(req.params.one)
     var two = Number(req.params.two)
     dbo.collection("prediction").find({
       fb_id: req.user.id,
       score: mongodb.ObjectID(id)
     }).toArray(function(err, result) {
       if(result.length > 0) {
         res.json({
           error: true,
           message: "Already predicted for this match!!"
         })
       } else {
         var newPrediction = {
           fb_id: req.user.id,
           name: req.user.displayName,
           score: mongodb.ObjectID(id),
           scoreone: one,
           scoretwo: two,
           date: new Date()
         }
         var now = new Date();
         var tomorrow = new Date();
         tomorrow.setDate(tomorrow.getDate() + 1);
         dbo.collection("score").aggregate([{
           $match: {
             time: {
               $gt: now,
               $lt: tomorrow
             },
             status: true,
             completed: false,
             _id: new mongodb.ObjectID(id)
           }
         }]).toArray(function(e,r) {
           if(r.length > 0) {
             dbo.collection("prediction").insertOne(newPrediction, function(error, re) {
               dbo.collection("users").find({
                 fb_id: req.user.id
               }).toArray(function(errorfinduser, userresult) {
                 dbo.collection("users").updateOne({
                   fb_id: req.user.id
                 }, {
                   $set: {
                     'game_played' : userresult[0].game_played + Number(1)
                   }
                 }, function(usererror, userr) {
                   res.json({
                     error: false,
                     message: "Thanks for the prediction. See you in next match!"
                   })
                 })
               })
             })
           } else {
             res.json({
               error: true,
               message: "Prediction time has expired!!"
             })
           }
         })
       }
     })
   })
   router.get("/tiesheet", function(req, res) {

   })
   router.get("/game", function(req, res) {
     var now = new Date();
     var tomorrow = new Date();
     tomorrow.setDate(tomorrow.getDate() + 1);
     dbo.collection("score").aggregate([{
       $match: {
         time: {
           $gt: now,
           $lt: tomorrow
         },
         status: true,
         completed: false
       }
     },
     {
       $lookup: {
         from: "teams",
         localField: "teamone",
         foreignField: "_id",
         as: "teamonedetails"
       }
     },
     {
       $lookup: {
         from: "teams",
         localField: "teamtwo",
         foreignField: "_id",
         as: "teamtwodetails"
       }
     }]).sort({"time":1}).toArray(function(err, result) {
       res.json(result)
     })
   })
 })
 module.exports = router
