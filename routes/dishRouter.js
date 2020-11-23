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
    Dishes.find(req.query).then( (dishes)=>{
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
        console.log('Deleting all dishes');
    },  (err)=> next(err)).catch((err)=> next(err));
        
    
    
})

dishRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res)=> res.sendStatus(200))
.get(cors.cors,(req, res, next)=>{
    Dishes.findById(req.params.dishId)
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
            console.log('Updating the dish '+ req.params.dishId);
            console.log('Will update the dish '+ req.body.name+ 'with the details'+ req.body.description);
        },(err)=>next(err)
    ).catch((err)=>next(err))
    
}).delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next)=>{
    Dishes.findByIdAndDelete(req.params.dishId).then(
        (Dish)=>{
            res.status(200);
            res.setHeader('Content-Type','text/plain');
            res.json(Dish);
            console.log('Deleting the dish with id: '+ req.params.dishId);
        },(err)=>{next(err)}
    ).catch((err)=> next(err))
    
});



module.exports= dishRouter;