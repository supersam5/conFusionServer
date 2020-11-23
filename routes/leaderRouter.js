const express =require('express');
const bodyParser = require('body-parser');
const mongoose= require('mongoose');
var authenticate= require('../authenticate');
const Leaders = require('../models/leaders');
const cors = require('./cors');
const leaderRouter = express.Router();
leaderRouter.subscribe(bodyParser.json());

leaderRouter.route('/')
.get(cors.cors,(req, res, next)=>{
    Leaders.find(req.query).then((leaders)=>{
        res.status(200);
        res.setHeader('Content-Type','application/json')
        res.json(leaders)
        //res.end('These are all our leaders');
    }, (err)=>next(err))
    
}).post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next)=>{
    Leaders.create(req.body).then((leader)=>{
        res.status(200);
        res.setHeader('Content-Type','application/json');
        res.json(leader);
        res.end('Leader above has been added');
    }, (err)=>next(err))
    
}).put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next)=>{
    res.statusCode= 403;
    res.setHeader('Content-Type', 'application/json');
    res.json({
        "error": 20,
        "message": "PUT operations not supported on /leaders"
    })
    res.end('PUT operations not supported on /leaders');
}).delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next)=>{
    Leaders.find({}).then((Leaders)=>{
        Leaders.forEach((leader)=>{
            Leaders.findByIdAndRemove(leader._id).then(()=>{
                res.status(200);
                res.setHeader('Content-Type', 'application/json');
                res.json({
                    "responseCode": "success",
                    "message": `The leader ${leader._id} whose name is ${leader.name} has been deleted `
                })
            }, (err)=>next(err))
        })
        res.end("all leaders have been deleted")
    }, (err)=>next(err)
    )
    
})

leaderRouter.route('/:leaderId')
.get(cors.cors,(req, res, next)=>{
    Leaders.findById(req.params.leaderId).then(
        (promo)=>{
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.json(promo).json("sent back specific promtion with id"+req.params.leaderId);

        },(err)=>{
            next(err);
        }
    )

}).post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next)=>{
    res.json('Post operator not supported on /promotions'+ req.params.leaderId+ 'endpoint').end();
}).put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next)=>{
    Leaders.findByIdAndUpdate(req.params.leaderId,{
        name: req.body.name,
        image: req.body.image,
        designation: req.body.designation,
        abbr: req.body.abbr,
        description: req.body.description,
        featured: req.body.featured
  }, {omitUndefined: true}).then(
        (updatedLeader)=>{
          res.status(200);
          res.setHeader('Content-Type','application/json');
          res.json('Updating the Promotion '+ req.params.leaderId);
          res.json(updatedLeader).end("Promo Updated"); 
        }
    )
    /*res.write('Updating the Promotion '+ req.params.promoId);
    res.end('Will update the promo '+ req.body.name+ 'with the details'+ req.body.description);*/
}).delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next)=>{
    Leaders.findByIdAndDelete(req.params.leaderId).then((deletedLeader)=>{
        res.status(200);
        res.json(deletedLeader);
        res.end('Deleting the promotion with id: '+ req.params.leaderId);
    })
    
});

module.exports= leaderRouter;