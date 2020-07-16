var express = require('express');
var bodyParser = require('body-parser');
var User = require('../models/users');
var router = express.Router();
var passport = require('passport');


/* GET users listing. */
router.use(bodyParser.json());

router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});
router.post('/signup', (req, res, next) => {

  if (req.body.username && req.body.password) {
    uname = req.body.username;
    pword = req.body.password;
    User.register(new User({ username: uname }), req.body.password, (err, user)=>{

      if (err){
        res.status(500);
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err })
      } else {
        passport.authenticate('local')(req, res, () => {
          res.status(200);
          res.setHeader('Content-Type', 'application/json');
          res.send({
            success: true, 
            "status": "registration successful"
            });
        });
      }
    });
  }
})
router.post('/login', passport.authenticate('local'),(req, res)=>{
  res.status(200);
          res.setHeader('Content-Type', 'application/json');
          res.send({
            success: true, 
            "status": "You have been successfullty logged in"
            });
});
router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    var err = new Error('You are not logged in');
    next(err);
  }
})
module.exports = router;
