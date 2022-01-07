// const { application } = require("express");
/*
 THIS SERVER will not work in POWERSHELL.
 TRY in CMD environment.
*/
const express = require("express");
const env = require("./config/environment");
const logger = require("morgan");
// console.log("ENV NAME " + env.name);
// we use cookie parser to use cookies and modify them.
const cookieParser = require("cookie-parser");
const app = express();
require("./config/view_helper")(app);
const port = 8000;
const expressLayouts = require("express-ejs-layouts");
const db = require("./config/mongoose");
// used for session cookie
const session = require("express-session");
const passport = require("passport");
const passportLocal = require("./config/passport_local_strategy");
const passportJWT = require("./config/passport_jwt_strategy");
const passportGoogle = require("./config/passport_google_oauth2_strategy");
const MongoStore = require("connect-mongo");
// mongo store is used to store the session cookie in the db
const sassMiddleware = require("node-sass-middleware");
const flash = require("connect-flash");
const customMware = require("./config/middleware");

// Setup the chat server to be used with socket.io
const chatServer = require("http").createServer(app);
const chatSockets = require("./config/chat_sockets").chatSockets(chatServer);
chatServer.listen(5000);
console.log("chat server is listening on port 5000");

const path = require("path");

if (env.name == "development") {
  app.use(
    sassMiddleware({
      src: path.join(__dirname, env.asset_path, "scss"),
      dest: path.join(__dirname, env.asset_path, "css"),
      debug: true,
      outputStyle: "extended",
      prefix: "/css",
    })
  );
}

app.use(express.urlencoded());

app.use(cookieParser());

app.use(express.static(env.asset_path));

//make the uploads path available for browser
app.use("/uploads", express.static(__dirname + "/uploads"));

app.use(logger(env.morgan.mode, env.morgan.options));

//We use expressLayouts so that routes should know about layouts bcoz it uses files from views.
app.use(expressLayouts);
// To direct the style to specific ejs files
// extract styles and scripts from sub pages into the layout
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);

// set up view engine
app.set("view engine", "ejs");
app.set("views", "./views"); // you can also use this method instead of path.join(__dirname,views);

// For encrypting the cookie
app.use(
  session({
    // Name of cookie
    name: "codeial",
    //TODO change the secret before deployment in production mode
    secret: env.session_cookie_key,
    // if user is not logged in then don't save the cookie
    saveUninitialized: false,
    // don't save data again and again in the database
    resave: false,
    //Give time session for cookie and after that cookie expires
    cookie: {
      maxAge: 1000 * 60 * 100,
    },
    store: MongoStore.create({
      mongoUrl: "mongodb://localhost/codeial_development",
      autoRemove: "disabled",
    }),
  })
);

/*In a Connect or Express-based application, passport.initialize() middleware is required to initialize Passport.
 If your application uses persistent login sessions, passport.session() middleware must also be used.*/
app.use(passport.initialize());
app.use(passport.session());
/*Note that enabling session support is entirely optional,
 though it is recommended for most applications. 
 If enabled, be sure to use session() before passport.session() to ensure that
  the login session is restored in the correct order.*/
app.use(passport.setAuthenticatedUser);

app.use(flash());
// When the flash is created in request then customeMware
// middleware puts this req.flash message to res.locals.flash ;
app.use(customMware.setFlash);

// use express router MIDDLEWARE
app.use("/", require("./routes")); // By default fetches index.js. Not need to extend as /index.js

app.listen(port, function (err) {
  if (err) {
    console.log(`Error occurred when running sever: ${err}`);
    return;
  }
  console.log(`Server is running on port: ${port}`);
});
