// REQUIREMENTS
require('dotenv').config();
const express = require('express');
const mongoose = require("mongoose")
const ejsLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override')
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { DATABASE_URL, PORT } = require("./config");


// MIDDLEWARE
const app = express();

app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"))
app.use(cookieParser());


// ROUTERS
const userRouter = require("./routers/userRouter")
app.use("/", userRouter)

const adminRouter = require("./routers/adminRouter")
app.use("/admin", adminRouter)


// START SERVER
const startServer = async () => {
  try {
    await mongoose.connect(DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    app.listen(PORT, () => {
      console.log(`Your app is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};
startServer();