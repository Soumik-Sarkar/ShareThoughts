if(process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require("express");
const ejs = require("ejs");
const ejsMate = require('ejs-mate');
const path = require('path')
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/users');
const User = require('./model/user');
const {MongoStore} = require("connect-mongo");
const MongoDBStore = require("connect-mongo")(session);


const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static("public"));


const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/sharethoughtsDB';
mongoose.connect(dbUrl, {useNewUrlParser: true});

const secret = process.env.SECRET || 'secret';

const store = new MongoDBStore({
  url : dbUrl,
  secret ,
  touchAfter : 24 * 60 * 60
});

const sessionConfig ={
  store,
  name: 'session',
  secret ,
  resave: false,
  saveUninitialized: true,
  cookie:{
      httpOnly: true,
      expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
      maxAge: 1000 * 60 * 60 * 24 * 7
  }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize())
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.get("/", function (req, res) {
  if(!req.isAuthenticated()){
    return res.redirect('/login');
  }else{
    res.redirect('/posts');
  }
});

app.use('/posts', postRoutes);
app.use('/posts/:id/comments', commentRoutes);
app.use('/',userRoutes);

app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh No, Something Went Wrong!'
  res.status(statusCode).render('error', { err })
})


const port = process.env.PORT || 3000

app.listen(port, function() {
  console.log("Server started on port 3000");
});
