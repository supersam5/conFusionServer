var passport = require('passport');
var LocalStrategy =require('passport-local').Strategy;
var User = require('./models/users');
var JwtStrategy = require('passport-jwt').Strategy; 
var FacebookStrategy = require('passport-facebook-token');
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var config = require('./config');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user){
    return jwt.sign(user, config.secretKey,
        {expiresIn: 3600});
}
 
var opts = {};
//extraction method
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
 (jwt_payload, done)=>{
    console.log(jwt_payload);
    User.findOne({_id: jwt_payload._id},(err, user)=>{
        if(err){ 
            return done(err, false);
        }
        else if(user){
            return done(null, user);
        }else {
            return done(null, false);
        }
    })

}));
exports.verifyUser = passport.authenticate('jwt',{session: false});
exports.verifyAdmin = function(req, res, next){
    if(req.user.admin==true){
        next();
    }else{
        err = new Error("You are not authorised to perform this operation");
        err.status = 403;
        next(err);
    }
};
exports.Facebook = passport.use(new FacebookStrategy({
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret,
    fbGraphVersion: 'v3.0'
},(accessToken, refreshToken, profile, done)=>{
    User.findOne({facebookId : profile.id}, (err, user)=>{
        if(err){
            return done(err, null)
        }else{
            return done(null, user)
        }
    })
}))
