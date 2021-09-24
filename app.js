var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var projectsRouter = require("./routes/getprojects");
var reportRouter = require("./routes/getsprintreport");

var app = express();

const cors = require("cors");

/* ------------------------------ Dotenv setup ------------------------------ */
const dotenv = require("dotenv");
dotenv.config();

/* ------------------------------- Axios setup ------------------------------ */
const axios = require("axios");
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const API_BASE_URL = process.env.API_BASE_URL;

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common["Authorization"] = AUTH_TOKEN;

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/getprojects", projectsRouter);
app.use("/getsprintreport", reportRouter);
module.exports = app;
