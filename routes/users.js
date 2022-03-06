const express = require('express')
const router = express.Router();
const passport = require('passport');
const User = require('../model/user')
const catchAsync = require('../utils/catchAsync')
const {isLoggedIn,alreadyLoggedIn,alreadyLoggedOff} = require('../middleware')


router.get('/register',alreadyLoggedIn, (req,res) =>{
    res.render('users/register')
});

router.post('/register',alreadyLoggedIn, catchAsync(async(req,res,next)=>{
    try{
        const { name, email, username, password} = req.body;
        const user = new User({name,email,username});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser,err => {
            if(err){
                return next(err);
            }
            req.flash('success', 'Welcome to Share Thoughts' );
            res.redirect('/posts');
        });
    }catch(e){
        req.flash('error', e.message );
        res.redirect('/register');
    }
}));

router.get('/login',alreadyLoggedIn, (req,res)=>{
    res.render('users/login')
});

router.post('/login',alreadyLoggedIn,passport.authenticate('local',{failureFlash: true, failureRedirect:'/login'}), (req,res)=>{
    req.flash('success','Welcome Back!!');
    const redirectUrl = req.session.returnTo || '/posts';
    delete req.session.returnTo
    res.redirect(redirectUrl);
});

router.get('/logout',alreadyLoggedOff, (req,res)=>{
    req.logout();
    req.flash('success','GoodBye!')
    res.redirect('/posts');
});

router.get('/account',isLoggedIn, (req,res)=>{
    res.render('users/account')
});

module.exports = router;