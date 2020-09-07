const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const Favourites = require('../models/favourites');
const authenticate = require('../authenticate')
const cors = require('./cors');
const ObjectId = mongoose.Types.ObjectId;



let favRouter = express.Router()

favRouter.use(bodyParser.json())

favRouter.route('/').options(cors.corsWithOptions, (req, res)=> res.sendStatus())
.get(cors.cors, authenticate.verifyUser,(req, res, next)=>{
    Favourites.find({user : req.user._id}).populate(['user','dishes']).then(
        (favourites)=>{
            res.status(200);
            res.setHeader('Content-Type', 'applicatin/json')
            res.json({"favourites from loggedin user" :  favourites})

        }, (err)=>{
            next(err);
        }
    )
    
})
.delete(cors.cors, authenticate.verifyUser, (req, res, next)=>{
    Favourites.findOneAndDelete({user : ObjectId(req.user._id)}).then(
        (favourites)=>{
            
            message= "all user :"+req.user._id+ "/'s favourites deleted from favourites";
            res.status(200);
            res.setHeader('Content-Type', 'application/json')
            res.send({"message" : message});
            res.send(favourites);

        },
        (err)=>next(err)
    )
})
.post(cors.cors, authenticate.verifyUser, (req, res, next)=> {
    console.log(req.body[0])
    if(Array.isArray(req.body)){
        Favourites.findOne({user : ObjectId(req.user._id)}).then(
            (favourites)=>{
                if(favourites!=null){
                    console.log(favourites)
                    console.log("favs doc not equals null : true")
                    
                        req.body.forEach( dish => {
                            if(dish.hasOwnProperty("_id"))  favourites.dishes.push(dish._id);
                        });
                       
                                   
                    favourites.save().then(
                        (favourites)=>{
                            res.status(200);
                            res.setHeader('Content-Type', 'application/json')
                            res.send({"updated favourites": favourites})
                        }
                    )
                }else{
                    dishesref = req.body.map((dish)=>{
                        if(!dish.hasOwnProperty("_id")){
                         let err = new Error(" \"_id\" field missing from dish: "+ dish);
                         (err) => next(err)
                        }
                        return dish._id;
                    })
                    Favourites.create({
                        user: req.user._id,
                        dishes: dishesref
                    }).then(
                        (favs)=>{
                            res.status(200)
                            res.setHeader('Content-Type', 'application/json')
                            res.send({"Favourites": favs})
                        }, (err)=>next(err)
                    )
                }
    
            }, (err)=>next(err)
        )
    }else{
        let err= new Error("Pls review, request body should be an array of objects containing 1 field named _id");
        (err)=>next(err)
    }
    
}
)

favRouter.route('/:dishid').options(cors.corsWithOptions, (req, res) => res.sendStatus())
    .post(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favourites.findOne({user : ObjectId(req.user._id)}).then(
            (favourites)=>{
                if(favourites){
                    console.log(favourites)
                    console.log("favs doc not equals null : true")
                    favourites.dishes.push(req.params.dishid);
                    favourites.save().then(
                        (favourites)=>{
                            res.status(200);
                            res.setHeader('Content-Type', 'application/json')
                            res.send({"updated favourites": favourites})
                        }
                    )
                }else{
                    Favourites.create({
                        user: req.user._id,
                        dishes: [req.params.dishid]
                    }).then(
                        (favs)=>{
                            res.status(200)
                            res.setHeader('Content-Type', 'application/json')
                            res.send({"Favourites": favs})
                        }, (err)=>next(err)
                    )
                }

            }, (err)=>next(err)
        )
    }
    )
    .delete(cors.cors, authenticate.verifyUser, (req, res, next)=>{
        Favourites.findOne({user: ObjectId(req.user._id)}).then(
            (favs)=>{
                if(favs){
                   targetDish= favs.dishes.indexOf(req.params.dishid);
                   if(targetDish>=0){
                       favs.dishes.splice(targetDish,1);
                       favs.save().then((favs)=>{
                           res.status(200)
                           res.setHeader('Content-Type', 'application/json');
                           res.send({"dish deleted from favourites": req.params.dishid})
                           res.send(favs)
                       }, (err)=>next(err))
                   }
                }
            }, (err)=>next(err)
        )
    })

module.exports= favRouter;