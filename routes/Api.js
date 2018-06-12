/**
 * @Author: Bashudev Poudel <prazeev>
 * @Date:   2018-06-08T16:28:47+05:45
 * @Email:  prazeev@gmail.com
 * @Filename: Api.js
 * @Last modified by:   prazeev
 * @Last modified time: 2018-06-08T17:56:31+05:45
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
   router.get("/group/:id", function(req, res) {
     var id = req.params.id
     dbo.collection("groups").find({
       game: new mongodb.ObjectID(id)
     }).toArray(function(err, result) {
       res.json(result)
     })
   })
   router.get("/teams/:game", function(req, res) {
     var game = req.params.game
     dbo.collection("teams").find({
       game: new mongodb.ObjectID(game)
     }).toArray(function(err, result) {
       res.json(result)
     })
   })
 })
 module.exports = router
