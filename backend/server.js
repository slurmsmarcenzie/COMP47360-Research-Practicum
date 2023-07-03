const express = require('express')
const app = express()
const cors = require("cors");
const meta = require("./routes/meta")
const prediction = require("./routes/prediction")
const baseline = require("./routes/baseline")
const port = process.env.PORT || 5000
const http_logger = require("./middleware/http_logger");
require("dotenv").config();

//Middleware:
app.use(cors());
app.use(express.json())
//Below is used to serve a build version of the React frontend application:
//  app.use(express.static(path.join(__dirname, "build")));
//  app.get("/", function(req, res) {res.sendFile(path.join(__dirname, "build", "index.html"))})

//Routes:
app.use("/api/meta", meta, http_logger)
app.use("/api/predict", prediction, http_logger)
app.use("/api/baseline", baseline, http_logger)

app.get('/', (req, res, next) => {
  res.status(200).send("Home Page. I will serve React App later :)")
  http_logger(req, res, next)
});

app.get('*', (req, res, next) => {
  res.status(404).send("Unknown route. Please check the URL entered")
  http_logger(req, res, next)
});

//TODO - I do not like how the http_logger is being used here. This was the only way i can currently get the middleware to work. Will return to this later



//START SERVER
app.listen(port, () => {
    console.log('server is listening on port', port)
});