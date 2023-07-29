const express=require('express')
const router=express.Router()
const catchAsync=require('../utilities/catchAsync')
const expresserror=require('../utilities/expresserror')
const Notes=require('../models/noteslist')
const Register=require('../models/register')
const joi=require('joi')

const registerSchema=joi.object({
    email:joi.string().email().lowercase().required(),
    password:joi.string().min(5).max(10).required(),
    name:joi.string().required()
}).required()

var exists=false
router.get('',(req,res)=>{
    res.render('register/reg',{ exists:false})
})

router.post('',catchAsync(async(req,res,next)=>{
  
//    const {error,value} =registerSchema.validate(req.body)
//    if(error){
//     throw new expresserror('Error Found',400)
//   }else{
    const checkUser=await Register.findOne({email:req.body.email})
    // try{
    if(!checkUser){
    const newUser=new Register(req.body)
    await newUser.save()
    req.flash('success','Successfully registered ')
    res.redirect(`/user/${newUser.id}/notes`)
    }
    else
    {
        res.render('register/reg',{exists:true})
    }

// catch(e){
//     req.flash('error','Provide Valid Information!! ')
//     res.redirect('/register')
// }
//   }
}))
module.exports=router
