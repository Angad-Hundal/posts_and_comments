'use strict';

// load package
const express = require('express');
const app = express();

const bodyParser = require("body-parser");
app.use( bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 8080;
const HOST = '0.0.0.0';

//load couchdb
var nano = require('nano')('http://admin:admin@couchdb1:5984');
var posts = nano.use('posts');

// Get a list of all documents in the database
posts.list((err, body) => {
    if (err) {
      console.log(err)
    } else {
      console.log(body.rows)
    }
  })

app.get('/test', function (req, res) {
	posts.list({ include_docs: true }, function(err, body){
        if (!err) {
            body.rows.forEach(function(doc) {
                res.send(body);
            });
        }
	});
});
//lists all the posts
app.get('/getposts', function (req, res) {
  posts.list({ include_docs: true },function(err, body) {
    if (!err) {
        //res.send(body)
        body.rows.forEach(function(doc) {
            res.send(doc);
        });
   }
  });
});

//add a new post
app.post('/addposts', function (req, res) {
    var topic = req.body.topic;
    var data = req.body.data;
    posts.insert({topic, data}, function(err, body, header) {
        if (err) {
            console.log(err)
        } else {
            res.send(body);
        }
    });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);