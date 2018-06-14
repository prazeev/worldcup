/**
 * @Author: Bashudev Poudel <prazeev>
 * @Date:   2018-05-19T15:07:14+05:45
 * @Email:  prazeev@gmail.com
 * @Filename: Login.js
 * @Last modified by:   prazeev
 * @Last modified time: 2018-06-14T16:21:29+05:45
 * @Copyright: Copyright 2018, Bashudev Poudel
 */
var express = require('express')
var router = express.Router();
router.use(express.static('public'))

router.get("/", function(req, res) {
  res.render("login/login")
})
router.post("/", function(req, res) {
  var response = {}
  var admin = req.body
  if(admin.email == "prazeev@gmail.com" && admin.password == "a") {
    response.status = true
    response.message = "Login successful, redirecting you to dashboard."
    req.session.email = admin.email
    req.session.status = true
    response.redirect = "/dashboard"
  } else {
    response.status = false
    response.message = "Sorry, username and password mistake. Please consult to administrator!"
  }
  // Response
  res.json(response)
})
module.exports = router
