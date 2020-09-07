const express =require('express');
const bodyParser = require('body-parser');
//const mongoose = require('mongoose');
const Dishes = require('../models/dishes');
const authenticate = require('../authenticate');
const cors = require('./cors');
const dishRouter = express.Router();
dishRouter.subscribe(bodyParser.json());

dishRouter.route('/')
.options(cors.corsWithOptions, (req, res)=> res.sendStatus(200))
.get(cors.cors,(req, res, next)=>{
    Dishes.find({}).populate('comments.author').then( (dishes)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(dishes);
    }, (err)=> next(err)
).catch((err)=> next(err));
    

}).post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next)=>{
    Dishes.create(req.body).then((dish)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
        console.log("Dish created:", dish)

    }, (err)=> next(err)).catch((err)=> next(err));
    
}).put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next)=>{
    res.statusCode= 403;
    res.end('PUT operations not supported on /dishes');
}).delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next)=>{
    Dishes.remove({}).then((log)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(log);
        res.end('Deleting all dishes');
    },  (err)=> next(err)).catch((err)=> next(err));
        
    
    
})

dishRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res)=> res.sendStatus(200))
.get(cors.cors,(req, res, next)=>{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then(
        (dish)=>{
            res.status(200);
            res.setHeader('Content-Type','application/json');
            res.json(dish);
            console.log('sent details of the dish:'+ req.params.dishId + 'to you');
            
        },(err)=> next(err)
    ).catch((err)=> next(err));
    

}).post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next)=>{
    res.end('Post operator not supported on '+ req.params.dishId);
}).put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next)=>{
    Dishes.findByIdAndUpdate(req.params.dishId, {description: req.body.description}).then(
        (result)=>{
            res.status(200);
            res.setHeader('Content-Type','text/plain');
            res.json(result);
            res.write('Updating the dish '+ req.params.dishId);
            res.end('Will update the dish '+ req.body.name+ 'with the details'+ req.body.description);
        },(err)=>next(err)
    ).catch((err)=>next(err))
    
}).delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next)=>{
    Dishes.findByIdAndDelete(req.params.dishId).then(
        (Dish)=>{
            res.status(200);
            res.setHeader('Content-Type','text/plain');
            res.json(Dish);
            res.end('Deleting the dish with id: '+ req.params.dishId);
        },(err)=>{next(err)}
    ).catch((err)=> next(err))
    
});

dishRouter.route('/:dishId/comments')
.options(cors.corsWithOptions, (req, res)=> res.sendStatus(200))
.get(cors.cors,(req, res, next)=>{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then(
        (dish)=>{
            res.status(200);
            res.setHeader('Content-Type','application/json');
            res.json(dish.comments);
            console.log('sent comments on the dish:'+ req.params.dishId + 'to you');
            
        },(err)=> next(err)
    ).catch((err)=> next(err));
    

}).post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next)=>{
    Dishes.findById(req.params.dishId).then(
        (dish)=>{
            if (dish != null) {
                req.body.author= req.user._id;
                dish.comments.push({
                    comment: req.body.comment,
                    author: req.body.author,
                    rating: req.body.rating
                });
            dish.save().then(
                (dish)=>{
                    Dishes.findById(dish._id)
                    .populate('comments.author').then((dish)=>{
                        res.status(200);
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish);
                        console.log("comment added");  
                    })

                    
                }, (err)=> next(err)
            );
            
        }else{
             err = new Error('Dish'+ req.body.dishId + 'can not be found ');
             err.status=404;
             return next(err);
        }

        }, (err)=> next(err)
    ).catch((err)=> next(err))
}).put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next)=>{
    res.status(403);
    res.send("PUT operations not supported on dishes/:dishId/comments")
    console.log("PUT operations not supported on dishes/:dishId/comments")
    
}).delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next)=>{
    Dishes.findByIdAndDelete(req.params.dishId).then(
        (Dish)=>{
            if(Dish!=null){
                for(i= (Dish.comments.length-1); i>=0; i--){
                    Dish.comments.id(Dish.comments[i]._id).remove();
                }
                Dish.save().then(
                    (Dish)=>{
                        res.status(200);
                        res.setHeader('Content-Type','text/plain');
                        res.json(Dish);
                    }, (err)=> next(err)
                )
                   
            }else{
                err = new Error('Dish'+ req.params.dishId + 'not found');
                return next(err);
            }
            
        },(err)=>{next(err)}
    ).catch((err)=> next(err))
    
});
dishRouter.route('/:dishId/comments/:commentId')
.options(cors.corsWithOptions, (req, res)=> res.sendStatus(200))
.get(cors.cors,(req, res, next)=>{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then(
        (dish)=>{
            if(dish!=null){
                res.status(200);
                res.setHeader('Content-Type', 'application/json');
                res.json(dish.comments.id(req.params.commentId))
            }
        }, (err)=> next(err)
    )
}).post(cors.corsWithOptions,authenticate.verifyUser,
    (req,res)=>{
        res.status(403)
        res.send("post operations not supported on "+req.params.dishId+"/comments/"+req.params.commentId)
    }
).put(cors.corsWithOptions,authenticate.verifyUser,
    (req, res, next)=>{
        Dishes.findById(req.params.dishId).populate("comments.author").then(
            (dish)=>{
                if(dish!= null){
                    userObjId= req.user._id.toString();
                    commentObjid = dish.comments.id(req.params.commentId).author._id.toString();
                    console.log({"user object id":userObjId});
                    console.log({"comment author id": commentObjid});
                    if(userObjId==commentObjid){
                        if(req.body.rating){
                            dish.comments.id(req.params.commentId).comment =req.body.comment;
                        }
                        if(req.body.rating){
                            dish.comments.id(req.params.commentId).rating =req.body.rating;
                        }
                       
                        dish.save().then(
                            (dish)=>{
                                Dishes.findById(dish._id).then(
                                    (dish)=>{
                                        res.status(200);
                                        res.setHeader('Content-Type', 'text/plain');
                                        res.send("comment updated")
                                    }
                                )
                                
                            }, (err)=> next(err)
                        )
                    }else{
                        err = new Error("You are not authorised to update this comment");
                        err.status=403;
                        return next(err);
                    }
                }else{
                    err = new Error("comment does not exist");
                    return next(err);

                }
            }, (err)=>next(err)
        ).catch((err)=>next(err));
    }
).delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next)=>{
    Dishes.findById(req.params.dishId).populate("comments.author").then(
        (dish)=>{
            if (dish != null) {
                if (req.user._id == dish.comments.id(req.params.commentId).author._id) {
                    dish.comments.id(req.params.commentId).remove();
                    dish.save().then(
                        (dish) => {
                            res.status(200);
                            res.setHeader('Content-Type', 'text/plain');
                            res.send("Commment removed");
                            console.log("comment removed", dish)
                        }, (err) => next(err)
                    )
                }else{
                    let err = new Error("You are not authorised to update this comment");
                    err.status=403;
                    next(err);
                }

            }else{
                let err = new Error(`comment ${req.params.commentId} does not exist`);
                return next(err);
            }
        }, (err)=>next(err)
    ).catch((err)=>next(err))
})

module.exports= dishRouter;