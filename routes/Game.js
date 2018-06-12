/**
 * @Author: Bashudev Poudel <prazeev>
 * @Date:   2018-05-19T15:07:14+05:45
 * @Email:  prazeev@gmail.com
 * @Filename: Login.js
 * @Last modified by:   prazeev
 * @Last modified time: 2018-06-08T15:25:13+05:45
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
  router.get("/", function(req, res) {
    dbo.collection("game").find({}).toArray(function(err, result) {
      if (err) throw err;
      res.render("game/index.ejs", {
        data: result
      })
    });
  });
  router.get("/create", function(req, res) {
    res.render("game/create.ejs")
  })
  router.post("/create", function(req, res) {
    var response = {}
    var game = req.body
    // Form validation
    if(game.name == '') {
      response.status = false
      response.message = "Sorry, invalid field!"
      // Response
      res.json(response)
    } else {
      var newCategory = {
          name: game.name,
          date: new Date()
        }
      dbo.collection("game").insertOne(newCategory, function(err, ress) {
          if (err) throw err;
          response.status = true
          response.message = "Sucessfully inserted Game."
          response.redirect = "/game"
          // Response
          res.json(response)
        });
    }
  })
  router.get("/delete/:id", function(req, res) {
    var id = req.params.id
    var response = {}
    var delObject = {
      _id: new mongodb.ObjectID(id)
    }
    dbo.collection("game").deleteOne(delObject, function(err, obj) {
      if (err) throw err;
      response.status = true
      response.message = "Item Deleted Successfully"
      response.redirect = "/game"
      res.json(response)
    })
  })
})
module.exports = router
