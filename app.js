const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require ("mongoose");

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine" , "ejs");
app.use(express.static("public"));

// Initialize the mongodb connection
mongoose.connect("mongodb://localhost:27017/wikiDB", {useNewUrlParser: true});

// Create the article Schema
const articleSchema = new mongoose.Schema({
    title: String,
    content: String
})

// Create the  Model
const Article = mongoose.model("Article", articleSchema);


//////////////////////////////////////// Requests for all articles/////////////////////////////////////////////////////
//Using app.route chain methods
app.route("/articles")

.get(async (req,res)=> {
    try{
        const foundArticles = await Article.find();
        res.send(foundArticles);
    }catch(e){
        res.status(500).json({error: e.message})
    };
})

.post(async (req,res) => {
    const newArticle = new Article({
        title : req.body.title,
        content : req.body.content
    })
    try{
        await newArticle.save();
    }catch(e){
        res.status(400).json({error: e.message})
    }
})

.delete(async (req,res) => {
    try{
        await Article.deleteMany();
        res.send("Successfully Deleted all articles");
    } catch(e){
        res.status(500).json({error: "Something went wrong"});
    }
}); // <= Never forget semi-colon to cap off chain

// Tests

// Getting data from the data base
// app.get("/articles",async (req,res)=> {
//     try{
//         const foundArticles = await Article.find();
//         res.send(foundArticles);
//     }catch(e){
//         res.status(500).json({error: e.message})
//     };
// });

// Saving data from the database
// app.post("/articles", async (req,res) => {
//     const newArticle = new Article({
//         title : req.body.title,
//         content : req.body.content
//     })
//     try{
//         await newArticle.save();
//     }catch(e){
//         res.status(400).json({error: e.message})
//     }
//    });

// Deleting data from database
//    app.delete("/articles", async (req,res) => {
//     try{
//         await Article.deleteMany();
//         res.send("Successfully Deleted all articles");
//     } catch(e){
//        res.status(500).json({error: "Something went wrong"});
//     }
//    });

////////////////////////////////////// Requests Targetting particular Articles ////////////////////////////////////////

app.route("/articles/:articleTitle")

.get(async (req,res) =>{
    try {
    foundArticle = await Article.findOne({title: req.params.articleTitle })  
    res.send(foundArticle);
    } catch{
       res.send("No article with that name was found")
    }
})

.put(async (req,res) =>{ // TODO, has problems
    try{
        await Article.update({title : req.params.articleTitle}, // Find the article with this title
            {title: req.body.title, content: req.body.content},{overwrite: true}) // Update with this data
            res.send("Successfully updated article.");
    } catch{
        res.send("Error putting in the data");
    }
})
.patch(async (req,res)=> {  // Update only the field we provide and does not have overwrite true
    try{
        await Article.update({title: req.params.articleTitle},{$set: req.body}) // Only updates a particular field
    }catch{
        return res.status(422).json({"errors": error.details()})
    }
})
.delete(async (req,res) => { // Delete request 
    try{
        await Article.deleteOne({title: req.params.articleTitle})
    }catch{
        res.send("Document has been successfully deleted")
    }
});



app.listen(3000,function(){
    console.log('Server is running on port', 3000)
});