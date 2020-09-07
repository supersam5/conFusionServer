var express = require('express');
var bodyParser = require('body-parser');
var User = require('../models/users');
var router = express.Router();
var passport = require('passport');
var authenticate= require('../authenticate');
const cors = require('./cors');

/* GET users listing. */
router.use(bodyParser.json());

router.get('/',cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, function (req, res, next) {
  User.find({}).then((users)=>{
    res.status(200);
    res.setHeader('Content-Type','application/json');
    res.json({"status": "success","users": users})
  },(err)=>next(err))
  
});
router.post('/signup', cors.corsWithOptions, (req, res, next) => {

  if (req.body.username && req.body.password) {
    uname = req.body.username;
    pword = req.body.password;
    User.register(new User({ username: uname }), req.body.password, (err, user)=>{

      if (err){
        res.status(500);
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err })
      } else {
        if(req.body.firstname){
          user.firstname= req.body.firstname;
        }
        if(req.body.lastname){
          user.lastname= req.body.lastname;
        }
        user.save((err,user)=>{
          if(err){
            res.statusCode=500;
            res.setHeader('Content-Type','application/json');
            res.json({err: err});
            return;
          }
          passport.authenticate('local')(req, res, () => {
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.send({
              success: true, 
              "status": "registration successful"
              });
          });
        })

        
      }
    });
  }
})
router.post('/login',cors.corsWithOptions, passport.authenticate('local'),(req, res)=>{
  var token = authenticate.getToken({_id: req.user._id});        
  res.status(200);
  res.setHeader('Content-Type', 'application/json');
          res.json({
            success: true,
            token: token, 
            "status": "You have been successfullty logged in"
            });
});
router.get('/logout', cors.corsWithOptions, (req, res,next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    var err = new Error('You are not logged in');
    next(err);
  }
})
router.get('/login/facebook', cors.corsWithOptions, passport.authenticate('facebook-token'), (req, res)=>{
  var token = authenticate.getToken({_id : req.user._id});
  res.status(200);
  res.setHeader('Content-Type', 'application/json');
          res.json({
            success: true,
            token: token, 
            "status": "You have been successfullty logged in with Facebook"
            });
});

module.exports = router;
