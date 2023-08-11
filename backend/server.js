const express = require('express')
const app = express()
const meta = require("./routes/meta")
const prediction = require("./routes/prediction")
const historic = require("./routes/historic")
const http_logger = require("./middleware/http_logger");
const rateLimiter = require("./middleware/rate_limiter")
const helmet = require('helmet')
const cors = require("cors");
const path = require("path")
require("dotenv").config();


//Middleware:
app.use(cors());
app.use(express.json())
app.use(rateLimiter)
app.disable('x-powered-by')
// Turn on later:
// app.use(helmet.frameguard())
// app.use(helmet.noSniff());
// app.use(helmet.contentSecurityPolicy())

// Serve React App Build:
app.use(express.static(path.join(__dirname, "build")));
app.get("/", function(req, res) {res.sendFile(path.join(__dirname, "build", "index.html"))})

//Routes:
app.use("/app/v1/meta", meta, http_logger)
app.use("/app/v1/prediction", prediction, http_logger)
app.use("/app/v1/historic", historic, http_logger)

// app.get('/', (req, res, next) => {
//   res.status(200).send("DEV mode. In production, REACT APP will be served here")
//   next()
// }, http_logger);

// Handle bad routes
app.get('*', (req, res, next) => {
  res.status(404).send("Unknown route. Please check the URL entered")
  next()
}, http_logger);


const port = process.env.PORT || 8000
//START APP
app.listen(port, () => { 
    console.log('server is listening on port', port)
});