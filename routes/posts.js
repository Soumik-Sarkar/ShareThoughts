const express = require("express");
const router = express.Router();
const Post = require('../model/post');
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn , isAuthor} = require('../middleware');

  router.get("/", catchAsync(async(req, res)=>{
    if (req.query.search) {
      const searchQuery = new RegExp(escapeRegExp(req.query.search), 'gi');
      Post.find({ title: searchQuery }, (err, foundPosts) => {
        if (err) {
          console.error(err);
          return res.redirect('/posts');
        }
        if (foundPosts < 1) {
          req.flash('error', 'No Post Title could be found using the search term provided.');
          return res.redirect('/posts');
        }
        res.render('posts/home', { posts: foundPosts});
      }).populate('author');
    } else {
    const posts = await Post.find({}).populate('author');
    res.render("posts/home",{posts});
    }
  }));

  router.get("/user",isLoggedIn, catchAsync(async(req, res)=>{
    const posts = await Post.find({});
    res.render("posts/userpost",{posts});
  }));
  
  router.get("/compose",isLoggedIn, (req, res)=>{
    res.render("posts/compose");
  });
  
  router.post("/",isLoggedIn, catchAsync(async (req, res)=>{
    const post = new Post(req.body.post);
    post.author = req.user._id;
    await post.save();
    req.flash('success','Your New Post is Added')
    res.redirect('/posts')
  }));
  
  router.get("/:id", catchAsync(async(req, res)=>{
    const post = await Post.findById(req.params.id).populate({path: 'comments' , populate :{path: 'author'}}).populate('author');
    if(!post){
      req.flash('error','Cannot Find The Post');
      return res.redirect('/posts');
    }
    res.render("posts/post", {post});
  }));
  
  router.get('/:id/edit',isLoggedIn,isAuthor, catchAsync(async(req, res)=>{
    const post = await Post.findById(req.params.id);
    if(!post){
      req.flash('error','Cannot Find The Post');
      return res.redirect('/posts');
    }
    res.render('posts/edit',{post});
  }));
  
  router.put('/:id',isLoggedIn,isAuthor, catchAsync(async(req,res)=>{
    const {id} = req.params;
    const post = await Post.findByIdAndUpdate(id, {...req.body.post});
    await post.save();
    req.flash('success','Successfully Updated Your Post')
    res.redirect(`/posts/${id}`);
  }));
  
  router.delete('/:id',isLoggedIn,isAuthor, catchAsync(async(req,res)=>{
    const { id } = req.params;
    await Post.findByIdAndDelete(id);
    res.redirect('/posts');
  }));

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }
  
  module.exports = router