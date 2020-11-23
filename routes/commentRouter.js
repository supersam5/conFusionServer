const express =require('express');
const bodyParser = require('body-parser');
//const mongoose = require('mongoose');
const Comments = require('../models/comments');
const authenticate = require('../authenticate');
const cors = require('./cors');
const commentRouter = express.Router();
commentRouter.subscribe(bodyParser.json());

commentRouter.route('/')
.options(cors.corsWithOptions, (req, res)=> res.sendStatus(200))
.get(cors.cors,(req, res, next)=>{
    Comments.find(req.query)
    .populate('author')
    .then(
        (comments)=>{
            res.status(200);
            res.setHeader('Content-Type','application/json');
            res.json(comments);
            console.log('sent comments on the dish:'+ req.query + 'to you');
            
        },(err)=> next(err)
    ).catch((err)=> next(err));
    

})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next)=>{
    if(req.body!=null){
        req.body.author = req.user._id;
        Comments.create(req.body).then(
            (comment)=>{
                Comments.findById(comment._id)
                .populate('author')
                .then((comment) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json')
                    res.json(comment)
                })
            }, (err)=> next(err)
        ).catch((err)=> next(err))
    }else{
        err = new Error('Comment not found in request body');
        err.status = 404;
        return next(err); 
    }
    
}).put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next)=>{
    res.status(403);
    res.end("PUT operations not supported on /comments")
    console.log("PUT operations not supported on /comments")
    
}).delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next)=>{
    Comments.remove({}).then(
        (resp)=>{
            res.statusCode=200;
            res.setHeader('Content-Type', 'application/json')
            res.json(resp )
            
        },(err)=>{next(err)}
    ).catch((err)=> next(err))
    
});
commentRouter.route('/:commentId')
.options(cors.corsWithOptions, (req, res)=> res.sendStatus(200))
.get(cors.cors,(req, res, next)=>{
    Comments.findById(req.params.commentId)
    .populate('author')
    .then(
        (comment)=>{

            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.json(comment)
            
        }, (err)=> next(err)
    )
}).post(cors.corsWithOptions,authenticate.verifyUser,
    (req,res)=>{
        res.statusCode=403;
        res.end("post operations not supported on /comments"+req.params.commentId)
    }
).put(cors.corsWithOptions,authenticate.verifyUser,
    (req, res, next)=>{
        Comments.find(req.params.commentId).then(
            (comment)=>{
                if(!comment.author.equals(req.user._id)){
                    var err = new Error('You are not authorised to edit this comment')
                    err.status = 403;
                    return next(err);
                }
                req.body.author. req.user._id;
                Comments.findByIdAndUpdate(req.params.commentId, { $set: req.body }, { new: true }).populate('author').then(
                   
                    (comment)=>{
                        if(comment!=null){
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.send(comment)
                        }else {
                            err = new Error('Comment' + req.params.commentId + "notfound");
                            err.status = 404;
                            return next(err);
                        }
                    }
                    , (err) => next(err)
                ).catch((err)=>next(err));
            },
            (err)=>next(err)
        )
        
    }
).delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next)=>{
    Comments.findById(req.params.commentId).then(
        (comment)=>{
            if(comment=null){
                var err = new Error("comment"+ req.params.commentId+ " not found")
                err.status = 404;
                return next(err)
            }
            if(!comment.author.equals(req.user._id)){
                var err = new Error("You are not authorized to delete this comment")
                err.status = 403;
                return next(err)
            }
            Comments.findOneAndRemove(req.params.commentId).then(
                (resp)=>{
                    res.status(200)
                    res.setHeader('Content-Type', 'application/json')
                    res.json(resp)
                },(err)=>next(err)
            )
        },(err)=> next(err)
    ).catch((err)=>next(err))
    }  
)

module.exports = commentRouter;



