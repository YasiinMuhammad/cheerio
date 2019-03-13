

// Dependencies
var express = require("express");
var mongoose = require("mongoose");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();


// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Database configuration


// Hook mongojs configuration to the db variable
var db = require("./models");

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);
// Main route (simple Hello World Message)
// app.get("/", function(req, res) {
//   res.send("Hello world");
// });


// TODO: make two more routes

// Route 1
// =======
app.get("/scrape", function(req, res){
axios.get("https://www.azcentral.com/").then(function(response) {

 
  var $ = cheerio.load(response.data);

  $(".flh3m-feed-item").each(function(i, element) {
    // Save an empty result object
    // console.log($('flh3m-feed-list').children('a').text());
    // console.log($(this).find("a").text())
    var result = {};

    // Add the text and href of every link, and save them as properties of the result object
    result.title = $(this)
      .find("a")
      .text();
    result.link = $(this)
      .find("a")
      .attr("href");

    console.log(result)
    // Create a new Article using the `result` object built from scraping
  

    

    
    db.Article.create(result)
      .then(function(dbscrapedData) {
        // View the added result in the console
        console.log(dbscrapedData);
      })
      .catch(function(err) {
        // If an error occurred, log it
        console.log(err);
      });
    });
 
  // Send a message to the client
  res.send("Scrape Complete");
});
});
  // Log the results once you've looped through each of te elements found with cheerio
  
// This route will retrieve all of the data
// from the scrapedData collection as a json (this will be populated
// by the data you scrape using the next route)
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbscrapedData) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbscrapedData);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
  });
// Route 2
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbscrapedData) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbscrapedData);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});
// =======
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbscrapedData) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbscrapedData);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});
// When you visit this route, the server will
// scrape data from the site of your choice, and save it to
// MongoDB.
// TIP: Think back to how you pushed website data
// into an empty array in the last class. How do you
// push it into a MongoDB collection instead?

/* -/-/-/-/-/-/-/-/-/-/-/-/- */

// Listen on port 8000
app.listen(8000, function() {
  console.log("App running on port 8000!");
});
