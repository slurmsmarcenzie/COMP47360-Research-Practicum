const express = require('express')
const app = express()
const cors = require("cors");
const path = require("path");
const meta = require("./routes/meta")
const prediction = require("./routes/prediction")
//const mongoose = require("mongoose");
require("dotenv").config();
const port = process.env.PORT || 5000;


//Middleware:
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "build")));
app.get("/", function(req, res) {res.sendFile(path.join(__dirname, "build", "index.html"))})

//Routes:
app.use("/api/meta", meta)
app.use("/api/predict", prediction)

app.get('/', (req, res) => {
  res.status(200).send("I will serve React App later :)")
});

//CONNECT TO LOCAL MONGODB
// const uri = process.env.ATLAS_URI;
// mongoose.connect(uri, { useNewUrlParser: true }); //newUrlParser is just to avoid a depreciation warning
// const connection = mongoose.connection
// connection.once("open", () => {console.log("MongoDB connection established")});


//START SERVER
app.listen(port, () => {
    console.log('server is listening on port', port)
});