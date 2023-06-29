const express = require('express')
const app = express()
const cors = require("cors");
const meta = require("./routes/meta")
const prediction = require("./routes/prediction")
const baseline = require("./routes/baseline")
const port = process.env.PORT || 5000
//const {logger, httpLogger} = require("../logging/backend/express/logger")
require("dotenv").config();

//Middleware:
app.use(cors());
app.use(express.json())
//Below is used to serve a build version of the React frontend application:
//  app.use(express.static(path.join(__dirname, "build")));
//  app.get("/", function(req, res) {res.sendFile(path.join(__dirname, "build", "index.html"))})

//Routes:
app.use("/api/meta", meta)
app.use("/api/predict", prediction)
app.use("/api/baseline", baseline)


app.get('/', (req, res) => {
  res.status(200).send("Home Page. I will serve React App later :)")
});

app.get('*', (req, res) => {
  res.status(404).send("Unknown route. Please check the URL entered")
});

//START SERVER
app.listen(port, () => {
    console.log('server is listening on port', port)
});