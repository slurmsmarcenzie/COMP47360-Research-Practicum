const express = require('express')
const app = express()
const cors = require("cors");
const meta = require("./routes/meta")
const prediction = require("./routes/prediction")
const baseline = require("./routes/baseline")
const port = process.env.PORT || 5000
const http_logger = require("./middleware/http_logger");
const rateLimiter = require("./middleware/rate_limiter")
const helmet = require('helmet')
require("dotenv").config();

//Middleware:
app.use(cors());
app.use(express.json())
app.use(helmet.frameguard())
app.use(helmet.noSniff());
app.use(helmet.contentSecurityPolicy())
//app.use(rateLimiter)
//Below is used to serve a build version of the React frontend application:
//  app.use(express.static(path.join(__dirname, "build")));
//  app.get("/", function(req, res) {res.sendFile(path.join(__dirname, "build", "index.html"))})

//Routes:
app.use("/api/meta", meta, http_logger)
app.use("/api/predict", prediction, http_logger)
app.use("/api/baseline", baseline, http_logger)

app.get('/', (req, res, next) => {
  res.status(200).send("Home Page. I will serve React App later :)")
  next()
}, http_logger);

app.get('*', (req, res, next) => {
  res.status(404).send("Unknown route. Please check the URL entered")
  next()
}, http_logger);


app.disable('x-powered-by')
//START SERVER
app.listen(port, () => {
    console.log('server is listening on port', port)
});