/**
 * @Author: Bashudev Poudel <prazeev>
 * @Date:   2018-05-19T10:10:45+05:45
 * @Email:  prazeev@gmail.com
 * @Filename: index.js
 * @Last modified by:   prazeev
 * @Last modified time: 2018-06-14T18:29:31+05:45
 * @Copyright: Copyright 2018, Bashudev Poudel
 */
var express = require('express')
var app = express()
var bodyParser = require('body-parser');
// Parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routers
var login = require('./routes/Login.js')
var game = require('./routes/Game.js')
var groups = require('./routes/Groups.js')
var users = require('./routes/Users.js')
var passport = require('passport')
var teams = require('./routes/Teams.js')
var score = require('./routes/Score.js')
var api = require('./routes/Api.js')
var frontendApi = require('./routes/FrontendApi.js')
var frontend = require('./routes/Frontend.js')
var cookie = require('cookie-session');

app.use(express.static('public'))
app.use(cookie({
  maxAge: 24*60*60*100,
  keys: ["hgjkldjshfjkssjhfjskdjhfkjsdhfjksjhfjshf"]
}))

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('public'))
app.set('views','./views')
app.set('view engine', 'ejs')
function checkLogin(req, res, next) {
  if(req.session.status != true) {
    res.redirect("/login")
  } else {
    next()
  }
}
// For login
app.use("/login", login)
// For Game
app.use("/game",checkLogin, game)
// For Groups
app.use("/groups",checkLogin, groups)
// For Teams
app.use("/teams", checkLogin,teams)
app.use("/score",checkLogin, score)
app.use("/users",checkLogin, users)
app.use("/", frontend)


// For API
app.use("/api",checkLogin, api)
app.use("/frontend", frontendApi)
app.get("/dashboard",checkLogin, function(req, res) {
  res.render("dashboard");
})


app.listen(80)
console.log("Server Started on port 80")
