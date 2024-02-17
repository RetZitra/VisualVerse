const mongoose=require('mongoose');
const boardSchema = new mongoose.Schema({
  boradstitle:{
    type:String
  },
  user: {
    type:mongoose.Schema.Types.ObjectId,
    ref:"user"
  },
  posts: [{
    type:mongoose.Schema.Types.ObjectId,
    ref:'post',
  }]
});
module.exports=mongoose.model("board",boardSchema);