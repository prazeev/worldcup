/**
 * @Author: Bashudev Poudel <prazeev>
 * @Date:   2018-05-19T15:07:14+05:45
 * @Email:  prazeev@gmail.com
 * @Filename: Login.js
 * @Last modified by:   prazeev
 * @Last modified time: 2018-06-29T14:08:49+05:45
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
        data: result,
        score_id: id
      });
    })
  })
  router.get("/award/:id", function(req, res) {
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
      },
      {
        $lookup: {
          from: "users",
          localField: "fb_id",
          foreignField: "fb_id",
          as: "userdetails"
        }
      }
    ]).toArray(function(err, result) {
      // Awarding the points
      // For each users
      for(var i = 0; i < result.length; i++) {
        var user_points = result[i].userdetails[0].points
        var today_points = result[i].userdetails[0].today_points
        var points = 0
        if(result[i].gamedetails[0].completed == true) {
          // Match Completed
          if((result[i].scoreone == result[i].gamedetails[0].scoreone) && (result[i].scoretwo == result[i].gamedetails[0].scoretwo)) {
            // Won
            // if game is 0 vs 0
            if(result[i].scoreone == 0 && result[i].scoretwo == 0) {
              points = Number(points) + Number(100)
            } else {
              points = Number(50) + Number(points) + (Number(result[i].scoreone) * 10) + (Number(result[i].scoretwo) * 10)
            }
          } else if(result[i].scoreone == result[i].gamedetails[0].scoreone) {
            if(result[i].scoreone == 0) {
              points =  Number(points) + Number(30)
            } else {
              points = Number(points) + (Number(result[i].scoreone) * 10)
            }
          } else if(result[i].scoretwo == result[i].gamedetails[0].scoretwo) {
            if(result[i].scoretwo == 0) {
              points =  Number(points) + Number(30)
            } else {
              points = Number(points) + (Number(result[i].scoretwo) * 10)
            }
          } else {
            // Lost
          }
        } else {
          // Match Not completed
        }
        dbo.collection("users").updateOne({
          fb_id: result[i].userdetails[0].fb_id
        }, {
          $set: {
            points: Number(user_points) + Number(points),
            today_points: Number(today_points) + Number(points)
          }
        }, function(err, reEP) {

        })
      }
      var response = {}
      response.status = true
      response.message = "Award given successfully"
      response.redirect = "/score"
      res.json(response)
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
  router.get("/reset", function(req, res) {
    dbo.collection("users").updateMany({}, {
      $set: {
        today_points: 0
      }
    }, function(error, result) {
      response = {}
      response.status = true
      response.message = "Successfully reseted the system for today points!"
      response.redirect = "/dashboard"
      res.json(response)
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
            gp: Number(scoreDe.teamonedetails[0].gp) + Number(0),
            w: Number(scoreDe.teamonedetails[0].w) + Number(0),
            p: Number(scoreDe.teamonedetails[0].p) + Number(0)
          }
          var updatetwo = {
            gp: Number(scoreDe.teamtwodetails[0].gp) + Number(0),
            l: Number(scoreDe.teamtwodetails[0].l) + Number(0)
          }
        } else if(parseInt(match.scoreone) < parseInt(match.scoretwo)) {
          var updatetwo = {
            gp: Number(scoreDe.teamtwodetails[0].gp) + Number(0),
            w: Number(scoreDe.teamtwodetails[0].w) + Number(0),
            p: Number(scoreDe.teamtwodetails[0].p) + Number(0)
          }
          var updateone = {
            gp: Number(scoreDe.teamonedetails[0].gp) + Number(0),
            l: Number(scoreDe.teamonedetails[0].l) + Number(0)
          }
        } else {
          var updateone = {
            gp: Number(scoreDe.teamonedetails[0].gp) + Number(0),
            d: Number(scoreDe.teamonedetails[0].w) + Number(0),
            p: Number(scoreDe.teamonedetails[0].p) + Number(0)
          }
          var updatetwo = {
            gp: Number(scoreDe.teamtwodetails[0].gp) + Number(0),
            d: Number(scoreDe.teamtwodetails[0].w) + Number(0),
            p: Number(scoreDe.teamtwodetails[0].p) + Number(0)
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
