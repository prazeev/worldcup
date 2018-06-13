/**
 * @Author: Bashudev Poudel <prazeev>
 * @Date:   2018-05-19T15:07:14+05:45
 * @Email:  prazeev@gmail.com
 * @Filename: Login.js
 * @Last modified by:   prazeev
 * @Last modified time: 2018-06-13T11:24:32+05:45
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
    dbo.collection("teams").aggregate([
        { $lookup:
                {
                    from: 'groups',
                    localField: 'group',
                    foreignField: '_id',
                    as: 'group'
                }
        },
        { $lookup:
                {
                    from: 'game',
                    localField: 'game',
                    foreignField: '_id',
                    as: 'game'
                }
        }
    ]).toArray(function(err, result) {
      if (err) throw err;
      res.render("teams/index.ejs", {
        data: result
      })
    });
  });
  router.get("/create", function(req, res) {
    var id = req.params.id
    dbo.collection("game").find({}).toArray(function(err, result) {
      if(err) throw err;
      res.render("teams/create.ejs", {
        data: result
      })
    })
  })
  router.post("/create", function(req, res) {
    var team = req.body
    var response = {}
    var newTeam = {
      name: team.name,
      code: team.code,
      gp: 0,
      w: 0,
      l: 0,
      d: 0,
      p: 0,
      game: new mongodb.ObjectID(team.game),
      group: new mongodb.ObjectID(team.group),
      date: new Date()
    }
    dbo.collection("teams").insertOne(newTeam, function(err, result) {
      if(err) throw err;
      response.status = true
      response.message = "Sucessfully inserted Team."
      response.redirect = "/teams"
      // Response
      res.json(response)
    })
  })
  router.get("/delete/:id", function(req, res) {
    var id = req.params.id
    var response = {}
    var delObject = {
      _id: new mongodb.ObjectID(id)
    }
    dbo.collection("teams").deleteOne(delObject, function(err, obj) {
      if (err) throw err;
      response.status = true
      response.message = "Item Deleted Successfully"
      response.redirect = "/teams"
      res.json(response)
    })
  })
})
module.exports = router
