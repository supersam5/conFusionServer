var express = require('express');
var bodyParser = require('body-parser');
var User = require('../models/users');
var router = express.Router();


/* GET users listing. */
router.use(bodyParser.json());

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post('/signup',(req, res, next)=>{
  let username, password;
  if(req.body.username && req.body.password){
    uname= req.body.username;
    pword= req.body.password;
    User.findOne({username: uname }).then(
      (user)=>{
        if(user != null){
            var err = new Error('Ysername'+ uname + 'already exists');
            err.status(403);
            next(err);
        }else{
          User.create({
            username : uname,
            password : pword
          }).then(
            (user)=>{
              res.status(200);
              res.setHeader('Content-Type', 'application/json');
              res.send({"status": "registration successful", 
                          "user": user
                        });
            }, (err)=>next(err)
          ).catch((err=>next(err)));
        }
      }
    ).catch((err)=>next(err))
    
  }else{
    let err = new Error("Username or password missing");
    err.status(403);
    next(err);
  }
})
router.post('/login', (req, res, next)=> {
  if (!req.session.user){
    var authHeader = req.headers.authorization;
    if(!authHeader){
      var err = new Error('You are not authenticated');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    
    }
      var auth = new Buffer.from(authHeader.split(' ')[1],'base64').toString().split(':');
      var username = auth[0];
      var password = auth[1];
      console.log(" username, password ", username, password);
      User.findOne({username: username}).
      then((user)=>{
        if (user===null){
          var err = new Error('User'+ username +' does not exist');
          err.status = 403;
          return next(err);
        }else if(user.password !== password){
          var err = new Error('Your password is incorrect');
          err.status = 403;
          return next(err);
        }else 
        if(user.username === username && user.password === password ){
          //res.cookie('user','admin',{signed : true});
          req.session.user = 'authenticated';
          res.statusCode= 200;
          res.setHeader('Content-Type', 'text/plain');
          res.end('You are authenticated!');
          
        }
        
      }).catch((err)=>next(err))
      
    }else {
      res.statusCode= 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('You are already aunthenticated');

    }
});
router.get('/logout', (req, res)=> {
  if(req.session){
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }else {
    var err = new Error('You are not logged in');
    next(err);
  }
})
module.exports = router;
