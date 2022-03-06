const mongoose = require('mongoose');
const Comment = require('./comment');
const User = require('./user')
const Schema = mongoose.Schema;


const postSchema = new Schema ({
    title: String,
    content: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    comments:[
        {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
        }
    ] 
  });


  postSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        await Comment.remove({
            _id:{
                $in: doc.comments
            }
        })
    }
})
  
module.exports = mongoose.model("Post", postSchema);