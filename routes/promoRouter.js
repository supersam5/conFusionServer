const express =require('express');
const bodyParser = require('body-parser');
const mongoose= require('mongoose')
const Promotions = require('../models/promotions');
const authenticate = require('../authenticate');
const cors = require('./cors');
const promoRouter = express.Router();
promoRouter.subscribe(bodyParser.json());

promoRouter.route('/')
.get(cors.cors,(req, res, next)=>{
    Promotions.find({}).then((promos)=>{
        res.status(200);
        res.setHeader('Content-Type','application/json')
        res.json(promos)
        res.end('These are all our promotions');
    }, (err)=>next(err))
    
}).post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next)=>{
    Promotions.create(req.body).then((promo)=>{
        res.status(200);
        res.setHeader('Content-Type','application/json')
        res.json(promo).end('These are all our promotions');
    }, (err)=>next(err)).catch((err)=>next(err));
    console.log('Will add a promotion: '+ req.body.name+ ' with details '+ req.body.description);
}).put(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next)=>{
    res.statusCode= 403;
    res.setHeader('Content-Type', 'application/json');
    res.json({
        "error": 20,
        "code": "PUT operations not supported on /promotions"
    })
    res.end('PUT operations not supported on /promotions');
}).delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next)=>{
    Promotions.find({}).then((Promos)=>{
        Promos.forEach((promo)=>{
            Promotions.findByIdAndRemove(promo._id).then(()=>{
                res.status(200);
                res.setHeader('Content-Type', 'application/json');
                res.json({
                    "responseCode": "success",
                    "message": `The promo ${promo._id} with name ${promo.name} has been deleted `
                })
            }, (err)=>next(err))
        })
        res.end("all promos have been deleted")
    }, (err)=>next(err)
    )
    
})

promoRouter.route('/:promoId')
.get(cors.cors,(req, res, next)=>{
    Promotions.findById(req.params.promoId).then(
        (promo)=>{
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.json(promo).json("sent back specific promtion with id"+req.params.promoId);

        },(err)=>{
            next(err);
        }
    )

}).post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next)=>{
    res.json('Post operator not supported on /promotions'+ req.params.promoId+ 'endpoint').end();
}).put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next)=>{
    Promotions.findByIdAndUpdate(req.params.promoId,{
        name: req.body.name,
        image: req.body.image,
        label: req.body.label,
        price: req.body.price,
        description: req.body.description,
        featured: req.body.featured
    }, {omitUndefined: true}).then(
        (updatedPromo)=>{
          res.status(200);
          res.setHeader('Content-Type','application/json');
          res.json('Updating the Promotion '+ req.params.promoId);
          res.json(updatedPromo).end("Promo Updated"); 
        }
    )
    /*res.write('Updating the Promotion '+ req.params.promoId);
    res.end('Will update the promo '+ req.body.name+ 'with the details'+ req.body.description);*/
}).delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next)=>{
    Promotions.findByIdAndDelete(req.params.promoId).then((deletedPromo)=>{
        res.status(200);
        res.json(deletedPromo);
        res.end('Deleting the promotion with id: '+ req.params.promoId);
    })
    
});

module.exports= promoRouter;