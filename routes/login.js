const express=require('express')
const router=express.Router()
const catchAsync=require('../utilities/catchAsync')
const expresserror=require('../utilities/expresserror')
const Notes=require('../models/noteslist')
const Register=require('../models/register')
const joi=require('joi')

const registerSchema=joi.object({
    email:joi.string().email().lowercase().required(),
    password:joi.string().min(3).max(10).required(),
    name:joi.string().required()
}).required()


var isValid=false

router.get('',(req,res)=>{
    res.render('register/login',{isValid:false})
   })
 router.post('',catchAsync(async(req,res)=>{
    try{
    const {email,password}=req.body
   const checkUser=await Register.findByUsernameAndValidate(email,password)
    if(checkUser)
 {  req.session.user_id=checkUser._id
    req.flash('success','Successfully logged in !!')
    res.redirect(`/user/${checkUser.id}/notes`)
 }
else{
    req.flash('error','INVALID CREDENTIALS')
    res.redirect('/login')
}
}
catch(e){
    req.flash('error','INVALID CREDENTIALS')
    res.redirect('/login')
}
}))


module.exports=router