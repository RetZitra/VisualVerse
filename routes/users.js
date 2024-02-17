const mongoose=require('mongoose');
const plm=require('passport-local-mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/VisualVerse");
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  profileImage: {
    type: String, 
  },
  contract:{
    type:Number
  },
  boards: [{
    type:mongoose.Schema.Types.ObjectId,
    ref:'board',
  }],
  posts: [{
    type:mongoose.Schema.Types.ObjectId,
    ref:'post',
  }]
});
userSchema.plugin(plm);
module.exports=mongoose.model("user",userSchema);

