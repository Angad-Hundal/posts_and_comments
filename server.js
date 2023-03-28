'use strict';

// load package
const express = require('express');
const app = express();

const bodyParser = require("body-parser");
app.use( bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 8080;
const HOST = '0.0.0.0';

const NodeCouchDb = require('node-couchdb');



// node-couchdb instance with default options
const couch = new NodeCouchDb({
  auth: {
      user: 'admin',
      pass: 12345
  }
});


// direct it to given page
app.get('/', (req, res) => {
  res.redirect("/TestRestLevel2.html");
})




// Test the connection to CouchDB by listing all databases
couch.listDatabases().then(dbs => {
  console.log(`Connected to CouchDB, found ${dbs.length} databases`);
  
  // create database "posts" if it doesn't already exist
  if (!dbs.includes('posts')) {
  return couch.createDatabase('posts');
  }
  }).then(() => {
  console.log('Database "posts" ready to use');
  }).catch(err => {
  console.error('Failed to connect to CouchDB:', err);
  });



// POST request to create a post
app.post('/addPost', (req, res) => {

  const topic = req.body.topic;
  const postData = req.body.postData;

  // generate an ID for the new post
  const postID = Date.now().toString();

  // create the new post document
  const post = {
    _id: postID,
    topic: topic,
    postData: postData,
    comments: []
  };

  // insert the new post document into the "posts" database
  couch.insert('posts', post).then(({ data, headers, status }) => {
    res.status(201).send(`Post created with ID: ${postID}`);
  }, err => {
    res.status(500).send(err);
  });
});





// Get all posts from the "posts" database
app.get('/getPosts', (req, res) => {
  couch.get('posts', '_all_docs', {include_docs: true}).then(result => {

    console.log("RESULT:", result);

    const rows = result["data"]["rows"];
    console.log("ROWS", rows);

    const posts = rows.map(row => {
      console.log(row["doc"]);
      return row["doc"];
    });

    console.log("POSTS: ", posts);

    res.json(posts);

  }).catch(err => {
    console.error('Failed to get posts from database:', err);
    res.status(500).send('Failed to get posts from database');
  });

});



app.use('/', express.static(__dirname));
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
