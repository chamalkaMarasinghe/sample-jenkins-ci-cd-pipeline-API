require("dotenv").config({ path: "../.env" });
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const useragent = require("express-useragent");
const cors = require("cors");
const debug = require("debug")("workflow-api");
const mongoose = require("mongoose");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

// NOTE: importing neccessary files/moules.....
const connectDB = require("./config/databaseConnection");
const { catchAsync } = require("./utils/errors/catchAsync.js");
const handleResponse = require("./utils/response/response");
const { globalErrorHandler } = require("./controllers/error.js");
const { startupMethod } = require("./config/startupMethod.js");
const { initSocket } = require("./sockets/initSocket.js");
const { authenticateSocket } = require("./middlewares/authenticateSocket.js");

// NOTE: importing routes
const AuthRoutes = require("./routes/auth.js");

// NOTE: building the current environment according to env variables
const currentEnvironment = require("./config/environmentConfig");
const {
  UnauthorizedError,
  RecordNotFoundError,
} = require("./utils/errors/CustomErrors");
const { environmentTypes } = require("./constants/commonConstants.js");

const PORT = currentEnvironment.PORT;
const CLIENT = currentEnvironment.CLIENT;

const app = express();

// NOTE: disable X-Powered-By header && suppress other vulnerable headers from exposing
app.disable("x-powered-by");
app.use(function (req, res, next) {
  res.header("X-XSS-Protection", "1; mode=block");
  res.header("X-Frame-Options", "deny");
  res.header("X-Content-Type-Options", "nosniff");
  next();
});

// NOTE: Middleware to parse JSON with an increased limit (30MB)
app.use(bodyParser.json({ limit: "30mb" }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(useragent.express());

// NOTE: Sanitizing incoming request values before to save in db
app.use(mongoSanitize());
app.use(xss());

// NOTE: Set CORS configuration
app.use(
  cors({
    origin: [`${CLIENT}`],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  })
);

// NOTE: testing route: verifing the api running or not
app.get("/api", async (req, res, next) => {
  try {
    return handleResponse(res, 200, `Hello there !! Welcome to testing jenkins ci/cd pipeline API ! \n API is running successfully \n sec var: ${process.env.MYNAM}`);
  } catch (error) {
    return next(error);
  }
});

// NOTE: Add catch all route - for handling the unmatched routes
app.use(
  "*",
  catchAsync(async (req, res, next) => {
    throw new RecordNotFoundError("Requested Path");
  })
);

// NOTE: This events prevent the application from crashing
process.on("unhandledRejection", (e) => {
  debug(e);
});

process.on("uncaughtException", (e) => {
  debug(e);
});

// NOTE: socket communication
const http = require("http").Server(app);

const socketIO = require("socket.io")(http, {
  cors: {
    origin: [`${CLIENT}`],
  },
});

socketIO.use(authenticateSocket);

// NOTE: initializing socket communicating modules
initSocket(socketIO);

// NOTE: set gloabal exception handler
app.use(globalErrorHandler);

// NOTE: binding the server
http.listen(PORT, async function () {

  try {
    await connectDB();

    // NOTE: startup logics =============================
    await startupMethod();
    console.log(`Server listening on port ${PORT}`);
  } catch (err) {
    console.log(err);
  }
});
