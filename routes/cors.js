const express = require('express');
const cors = require('cors');
const app= express();

const whitelist = ['http://localhost:3000', 'https://localhost:3433', 'http://SAMUEL-PC:3005','https://localhost:3005','http://localhost:3005'];
var corsOptionsDelegate = (req, callback)=>{
    var corsOptions;

    if(whitelist.lastIndexOf(req.header('Origin')) !== -1){
        corsOptions = {origin : true};
    }else {
        corsOptions = {origin : false};
    }
    callback(null, corsOptions)
};
exports.cors = cors();
exports.corsWithOptions = cors({corsOptionsDelegate});
