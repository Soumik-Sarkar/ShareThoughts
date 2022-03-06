const express = require("express");
const router = express.Router({mergeParams: true});
const Post = require('../model/post');
const Comment = require('../model/comment');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isCommentAuthor } = require("../middleware");

router.get('/:commentId/edit',isLoggedIn,isCommentAuthor, catchAsync(async(req,res)=>{
    const {id, commentId} = req.params
    const post = await Post.findById(id);
    const comment = await Comment.findById(commentId);
    if(!post || !comment){
      return res.redirect('/posts');
    }
    res.render('posts/commentedit',{post,comment});
}));

router.post('/', catchAsync(async(req,res)=>{
  const {id} = req.params;
  if(!req.isAuthenticated()){
    req.session.returnTo = `/posts/${id}`;
    req.flash('error', 'You must be signed in first!');
    return res.redirect('/login');
  }
  const post = await Post.findById(id);
  const comment = new Comment(req.body.comment);
  comment.author = req.user._id;
  post.comments.push(comment);
  await comment.save();
  await post.save();
  req.flash('success','Created New Comment');
  res.redirect(`/posts/${post._id}`)
}));

router.delete('/:commentId',isLoggedIn,isCommentAuthor, catchAsync(async(req, res)=>{
  const { id , commentId } = req.params;
  await Post.findByIdAndUpdate(id,{$pull: { comments : commentId}});
  await Comment.findByIdAndDelete(commentId);
  res.redirect(`/posts/${id}`)
}));

router.put('/:commentId',isLoggedIn,isCommentAuthor, catchAsync(async(req, res)=>{
  const {id,commentId } = req.params;
  const comment = await Comment.findByIdAndUpdate(commentId,{...req.body.comment})
  await comment.save();
  req.flash('success','Successfully Updated Your Comment');
  res.redirect(`/posts/${id}`)
}));


module.exports = router