const express = require('express');
const cors = require('cors');
const app= express();

const whitelist = ['http://localhost:3000', 'https://localhost:3433', 'http://SAMUEL-PC:3005','https://localhost:3005','http://localhost:3005'];
var corsOptions = {
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
          console.log("origin : true")
        callback(null, true)
      } else {
        console.log("origin : false") 
        callback(new Error('Not allowed by CORS'))
      }
    }
  }

exports.cors = cors();
exports.corsWithOptions = cors(corsOptions);
