/**
 * @Author: Bashudev Poudel <prazeev>
 * @Date:   2018-05-19T15:07:14+05:45
 * @Email:  prazeev@gmail.com
 * @Filename: Login.js
 * @Last modified by:   prazeev
 * @Last modified time: 2018-06-13T20:21:27+05:45
 * @Copyright: Copyright 2018, Bashudev Poudel
 */
var express = require('express')
var router = express.Router();
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var moment = require('moment-timezone');
router.use(express.static('public'))
// Mongo DB
MongoClient.connect('mongodb://localhost:27017/', function(err, db) {
  var dbo = db.db("BizPatiGame");
  router.get("/", function(req, res) {
    dbo.collection("score").aggregate([
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
      res.render("score/index.ejs", {
        data: result,
        currentTime: new Date()
      })
    });
  });
  router.get("/predict/:id", function(req, res) {
    var id = req.params.id
    dbo.collection("prediction").aggregate([
      {
        $match: {
          score: new mongodb.ObjectID(id)
        }
      },
      {
        $lookup: {
          from: "score",
          localField: "score",
          foreignField: "_id",
          as: "gamedetails"
        }
      }
    ]).toArray(function(err, result) {
      res.render("score/view-score", {
        data: result
      });
    })
  })
  router.get("/create", function(req, res) {
    var id = req.params.id
    dbo.collection("game").find({}).toArray(function(err, result) {
      if(err) throw err;
      res.render("score/create.ejs", {
        data: result
      })
    })
  })
  router.post("/create", function(req, res) {
    var match = req.body
    var response = {}
    var newMatch = {
      time: new Date(match.time),
      game: new mongodb.ObjectID(match.game),
      group: new mongodb.ObjectID(match.group),
      teamone: new mongodb.ObjectID(match.teamone),
      teamtwo: new mongodb.ObjectID(match.teamtwo),
      match: match.match,
      location: match.location,
      scoreone: 0,
      scoretwo: 0,
      status: true,
      completed: false,
      date: new Date(),
      updateddate: new Date()
    }
    dbo.collection("score").insertOne(newMatch, function(err, result) {
      if(err) throw err;
      response.status = true
      response.message = "Sucessfully inserted Match."
      response.redirect = "/score"
      // Response
      res.json(response)
    })
  })
  router.get("/update/:id", function(req, res) {
    var id = req.params.id
    var response = {}
    dbo.collection("score").aggregate([{
      $match: {
        _id: new mongodb.ObjectID(id)
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
    }]).toArray(function(err, result) {
      if (err) throw err;
      res.render("score/update.ejs", {
        data: result[0]
      })
    })
  })
  router.post("/update/:id", function(req, res) {
    var match = req.body
    var id = req.params.id
    var response = {}
    var updateMatch = {
      scoreone: parseInt(match.scoreone),
      scoretwo: parseInt(match.scoretwo),
      status: parseInt(match.status) ? true : false,
      completed: parseInt(match.completed) ? true : false,
      details: match.details,
      updateddate: new Date()
    }
    dbo.collection("score").update({
      _id: new mongodb.ObjectID(id)
    },{
      $set: updateMatch
    },function(err, result) {
      if(err) throw err;
      response.status = true
      response.message = "Sucessfully updated match."
      response.redirect = "/score"
      // main logic
      dbo.collection("score").aggregate([{
        $match: {
            _id: new mongodb.ObjectID(id)
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
      }]).toArray(function(errScore, resultScore) {
        var scoreDe = resultScore[0]
        if(parseInt(match.scoreone) > parseInt(match.scoretwo)) {
          var updateone = {
            gp: scoreDe.teamonedetails[0].gp + Number(1),
            w: scoreDe.teamonedetails[0].w + Number(1),
            p: scoreDe.teamonedetails[0].p + Number(3)
          }
          var updatetwo = {
            gp: scoreDe.teamtwodetails[0].gp + Number(1),
            l: scoreDe.teamtwodetails[0].l + Number(1)
          }
        } else if(parseInt(match.scoreone) < parseInt(match.scoretwo)) {
          var updatetwo = {
            gp: scoreDe.teamtwodetails[0].gp + Number(1),
            w: scoreDe.teamtwodetails[0].w + Number(1),
            p: scoreDe.teamtwodetails[0].p + Number(3)
          }
          var updateone = {
            gp: scoreDe.teamonedetails[0].gp + Number(1),
            l: scoreDe.teamonedetails[0].l + Number(1)
          }
        } else {
          var updateone = {
            gp: scoreDe.teamonedetails[0].gp + Number(1),
            d: scoreDe.teamonedetails[0].w + Number(1),
            p: scoreDe.teamonedetails[0].p + Number(1)
          }
          var updatetwo = {
            gp: scoreDe.teamtwodetails[0].gp + Number(1),
            d: scoreDe.teamtwodetails[0].w + Number(1),
            p: scoreDe.teamtwodetails[0].p + Number(1)
          }
        }
        // Update DB
        dbo.collection("teams").updateOne({
          _id: new mongodb.ObjectID(scoreDe.teamonedetails[0]._id)
        }, {
          $set: updateone
        }, function(a,b) {
          dbo.collection("teams").updateOne({
            _id: new mongodb.ObjectID(scoreDe.teamtwodetails[0]._id)
          }, {
            $set: updatetwo
          }, function(c,d) {
            res.json(response)
          })
        })
      })
    })
  })
  router.get("/delete/:id", function(req, res) {
    var id = req.params.id
    var response = {}
    var delObject = {
      _id: new mongodb.ObjectID(id)
    }
    dbo.collection("score").deleteOne(delObject, function(err, obj) {
      if (err) throw err;
      response.status = true
      response.message = "Item Deleted Successfully"
      response.redirect = "/score"
      res.json(response)
    })
  })
  router.get("/delete/prediction/:id", function(req, res) {
    var id = req.params.id
    var response = {}
    var delObject = {
      _id: new mongodb.ObjectID(id)
    }
    dbo.collection("prediction").deleteOne(delObject, function(err, obj) {
      if (err) throw err;
      response.status = true
      response.message = "Item Deleted Successfully"
      response.redirect = "/score"
      res.json(response)
    })
  })
})
module.exports = router
