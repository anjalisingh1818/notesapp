require('dotenv').config()
const express=require('express')
const app=express();
const methodOverride=require('method-override')
const path=require('path')
const mongoose=require('mongoose')
const Notes=require('./models/noteslist')
const Register=require('./models/register')
const catchAsync=require('./utilities/catchAsync')
const expresserror=require('./utilities/expresserror')
const joi=require('joi')
const PORT=process.env.PORT||2000
mongoose.set('strictQuery', true);
mongoose.connect(process.env.DA)//
.then(()=>{
    console.log("MONOGO Connection opened")
})
.catch(()=>{
    console.log("Oh no ! Error occured")
})

const registerSchema=joi.object({
    email:joi.string().email().lowercase().required(),
    password:joi.string().min(3).max(10).required(),
    name:joi.string().required()
}).required()
const notesSchema=joi.object({
    title:joi.string().required(),
    category:joi.string().required(),
    description:joi.string().required()
}).required()
var exists=false
var isValid=false
app.use('/public', express.static('public'));
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))


app.use(express.static(path.join(__dirname,'public')))
app.set('view engine','ejs')

app.get("/",(req,res)=>{
    res.render('register/home')
})
app.get('/register',(req,res)=>{
   
    res.render('register/reg',{ exists:false})
})

app.post("/register",catchAsync(async(req,res,next)=>{
   const {error,value} =registerSchema.validate(req.body)
   if(error){
    console.log(error)
    next(new expresserror('Bad Request',400))
   }
    const checkUser=await Register.findOne({email:req.body.email})
    if(!checkUser){
    const newUser=new Register(req.body)
    await newUser.save()
    console.log(newUser)
    res.redirect(`/user/${newUser.id}/notes`)
    }
    else
    {
        res.render('register/reg',{exists:true})
    }
   
   }))
   app.get('/login',(req,res)=>{
    res.render('register/login',{isValid:false})
   })
   app.post('/login',catchAsync(async(req,res)=>{

   const checkUser=await Register.findOne({email:req.body.email})
   if(checkUser.password===req.body.password)
   {
    res.redirect(`/user/${checkUser.id}/notes`)
   }
   else{
   
    res.render('register/login',{isValid:true})
    }
    }))
    app.get('/user/:id/notes',catchAsync(async(req,res)=>{
    const userid=req.params.id
    const User= await Register.findById(userid).populate('note')
    res.render('notes/index',{User,userid})
    }))

    app.get("/user/:id/notes/new",(req,res)=>{
    const userid=req.params.id
    console.log(req.params.userid)
    res.render('notes/new',{userid})
    })

    app.post('/user/:id/notes',catchAsync(async(req,res)=>{
     const user = await Register.findById(req.params.id);
    const newnote = new Notes(req.body);
    const {error,value} =notesSchema.validate(req.body)
    if(error){
     console.log(error)
     next(new expresserror('Bad Request',400))
    }
    if(newnote){
        console.log(newnote)
    user.note.push(newnote);
    await newnote.save();
    await user.save();
    res.redirect(`/user/${user._id}/notes/${newnote.id}`)
    }
    else{
        next(new expresserror('INVALID',400))
    }
    }))

   app.get('/user/:id/notes/:noteid',catchAsync(async(req,res)=>{
    const userid=req.params.id;
    const notes=await Notes.findById(req.params.noteid)
    res.render('notes/show',{notes,userid})
    }))

    app.get('/user/:id/notes/:noteid/edit',catchAsync(async(req,res)=>{
        const {id,noteid}=req.params;
        const editnotes=await Notes.findById(noteid)
        res.render('notes/edit',{editnotes,id})
     }))

    app.put('/user/:id/notes/:noteid',catchAsync(async(req,res)=>{
        const {id,noteid}=req.params
        const user=await Notes.findByIdAndUpdate(req.params.noteid,req.body)
        res.redirect(`/user/${id}/notes/${noteid}`)
    }))

    app.delete('/user/:id/notes/:noteid',catchAsync(async(req,res)=>{
        const { id, noteid } = req.params;
        await Register.findByIdAndUpdate(id, { $pull: { note: noteid } });
        await Notes.findByIdAndDelete(noteid);
        console.log(noteid,id)
        res.redirect(`/user/${id}/notes`)
    }))
   
   app.all("*",(req,res,next)=>{
    next(new expresserror('Page Not Found',404))
})
app.use((err,req,res,next)=>{
    console.log(err)
    const {statusCode=500,message}=err
    if(!err.message) err="something went wrong"
   res.status(statusCode).render("notes/error",{err})
})


app.listen(PORT,()=>{
    console.log("listening")
})
