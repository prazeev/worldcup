/**
 * @Author: Bashudev Poudel <prazeev>
 * @Date:   2018-06-08T16:28:47+05:45
 * @Email:  prazeev@gmail.com
 * @Filename: Api.js
 * @Last modified by:   prazeev
 * @Last modified time: 2018-06-12T15:03:58+05:45
 * @Copyright: Copyright 2018, Bashudev Poudel
 */
 var express = require('express')
 var router = express.Router();
 var mongodb = require('mongodb');
 var MongoClient = mongodb.MongoClient;
 router.use(express.static('public'))
 // Mongo DB
 MongoClient.connect('mongodb://localhost:27017/', function(err, db) {
   var dbo = db.db("BizPatiGame");
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
         status: true
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
