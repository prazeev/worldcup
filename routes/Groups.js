/**
 * @Author: Bashudev Poudel <prazeev>
 * @Date:   2018-05-19T15:07:14+05:45
 * @Email:  prazeev@gmail.com
 * @Filename: Login.js
 * @Last modified by:   prazeev
 * @Last modified time: 2018-06-12T14:09:33+05:45
 * @Copyright: Copyright 2018, Bashudev Poudel
 */
var express = require('express')
var router = express.Router();
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
router.use(express.static('public'))
// Variable DB
var gdb;
// Mongo DB
MongoClient.connect("mongodb://localhost:27017/", function(err, db) {
  dbo = db.db("BizPatiGame")
  router.get("/", function(req, res) {
    dbo.collection("groups").aggregate([
      { $lookup:
       {
         from: 'game',
         localField: 'game',
         foreignField: '_id',
         as: 'details'
       }
     }
    ]).toArray(function(err, result) {
      if (err) throw err;
      res.render("groups/index.ejs", {
        data: result
      })
    });
  });


  router.get("/create", function(req, res) {
    dbo.collection("game").find({}).toArray(function(err, result) {
      if (err) throw err;
      res.render("groups/create.ejs", {
        data: result
      })
    });
  });


  router.post("/create", function(req, res) {
    var response = {}
    var group = req.body
    // Form validation
    if(group.name == '' || group.game == '') {
      response.status = false
      response.message = "Sorry, invalid field!"
      // Response
      res.json(response)
    }
    else {
      var newGroup = {
        name: group.name,
        game: new mongodb.ObjectID(group.game),
        date: new Date()
      }
      dbo.collection("groups").insertOne(newGroup, function(err, ress) {
        if (err) throw err;
        response.status = true
        response.message = "Sucessfully inserted Group."
        response.redirect = "/groups"
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
    dbo.collection("groups").deleteOne(delObject, function(err, obj) {
      if (err) throw err;
      response.status = true
      response.message = "Group Deleted Successfully"
      response.redirect = "/doctors"
      res.json(response)
    })
  })
})
module.exports = router
