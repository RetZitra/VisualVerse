var express = require('express');
var router = express.Router();
const userModel=require('./users');
const localStrategy=require("passport-local");
const passport = require('passport');
passport.use(new localStrategy(userModel.authenticate()));
const upload=require('./multer');
const postModel=require("./posts");
const boardModel=require("./boards");
router.get('/', function(req, res, next) {
  res.render('index', {nav:false});
});
router.get("/register",function(req,res,next){
  res.render('register',{nav:false});
})
router.get("/profile",isLoggedIn, async function(req,res,next){
  const user=await userModel.findOne({username:req.session.passport.user}).populate("posts").populate("boards");
  const boards=await boardModel.find({user:user._id}).populate("posts");
  res.render('profile',{user,boards,nav:true});
})
router.get('/show/posts',isLoggedIn, async function(req,res,next){
  const user=await userModel.findOne({username:req.session.passport.user}).populate("posts");
  res.render('show',{user,nav:true});
})
router.post('/show/:boardId',isLoggedIn,async function(req,res,next){
  const boardId=req.params.boardId;
  res.redirect(`/show/${boardId}`);
})
router.get('/show/:boardId',isLoggedIn,async function(req,res,next){
  const boardId=req.params.boardId;
  const board=await boardModel.findOne({_id:boardId}).populate("posts");
  res.render('showboard',{board,nav:true});
})
router.get('/feed',isLoggedIn, async function(req,res,next){
  const user=await userModel.findOne({username:req.session.passport.user})
  const posts= await postModel.find()
  .populate("user")
  res.render('feed',{user,posts,nav:true,save:false});
})
router.get("/popup",function(req,res){
  res.render("popup");
})
router.get("/add",isLoggedIn, async function(req,res,next){
  const user=await userModel.findOne({username:req.session.passport.user})
  res.render('add',{user,nav:true});
})
router.get("/board",isLoggedIn, async function(req,res,next){
  const user=await userModel.findOne({username:req.session.passport.user})
  res.render('board',{user,nav:true});
})
router.post("/fileupload",isLoggedIn,upload.single("image"),async function(req,res,next){
  const user=await userModel.findOne({username:req.session.passport.user})
  user.profileImage=req.file.filename
  await user.save();
  res.redirect("profile");
})
router.post("/createpost",isLoggedIn,upload.single("postimage"),async function(req,res,next){
  const user=await userModel.findOne({username:req.session.passport.user})
  const post=await postModel.create({
    user:user._id,
    image:req.file.filename,
    title:req.body.title,
    description:req.body.description
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
})
router.post("/createboard",isLoggedIn,async function(req,res,next){
  const user=await userModel.findOne({username:req.session.passport.user})
  const board=await boardModel.create({
    user:user._id,
    boradstitle:req.body.boradstitle
  })
  user.boards.push(board._id);
  await user.save();
  res.redirect("/profile");
})
router.post("/deleteboard",isLoggedIn,async function(req,res,next){
  const user=await userModel.findOne({username:req.session.passport.user})
  const deletedboard=await boardModel.findOneAndDelete({_id:req.body.boardId});
  await userModel.updateOne({ _id: user._id }, { $pull: { boards: deletedboard._id } });
  res.redirect("/profile"); 
})
router.post("/feed/:boardId",isLoggedIn,async function(req,res,next){
  const user=await userModel.findOne({username:req.session.passport.user})
  const boardId=req.params.boardId;
  res.redirect(`/feed/${boardId}`)
})
router.post("/feed/:boardId/:postId",isLoggedIn,async function(req,res,next){
  const user=await userModel.findOne({username:req.session.passport.user})
  const boardId=req.params.boardId;
  const postId=req.params.postId;
  const board=await boardModel.findOne({_id:boardId})
  board.posts.push(postId);
  await board.save();
})
router.post("/delete/:boardId/:postId",isLoggedIn,async function(req,res,next){
  const boardId=req.params.boardId;
  const postId=req.params.postId;
  await boardModel.updateOne({ _id: boardId }, { $pull: { posts: postId } });
})
router.get("/feed/:boardId",isLoggedIn,async function(req,res,next){
  const user=await userModel.findOne({username:req.session.passport.user})
  const posts= await postModel.find()
  .populate("user")
  const boardId=req.params.boardId;
  res.render('feed',{user,posts,nav:true,save:true});
  console.log("feed get page with board id run hua he")
})
router.post('/register',function(req,res){
  var userdata=new userModel({
    username:req.body.username,
    name:req.body.name,
    email:req.body.email,
    contact:req.body.contact
  });
  userModel.register(userdata,req.body.password)
    .then(function(){
      passport.authenticate("local")(req,res,function(){
        res.redirect('/profile');
      })
    })
});
router.post('/login',passport.authenticate("local",{
  successRedirect:"/profile",
  failureRedirect:"/",
}),function(req,res){})
router.get("/logout",function(req,res,next){
  req.logout(function(err){
    if(err){return next(err);}
    res.redirect('/');
  });
});
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
     return next();
  }
  res.redirect("/");
}
module.exports = router;
