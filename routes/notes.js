const express=require('express')
const router=express.Router()
const catchAsync=require('../utilities/catchAsync')
const expresserror=require('../utilities/expresserror')
const Notes=require('../models/noteslist')
const Register=require('../models/register')
const joi=require('joi')

const notesSchema=joi.object({
    title:joi.string().required(),
    category:joi.string().required(),
    description:joi.string().required()
}).required()

router.get('/:id/notes',catchAsync(async(req,res)=>{
    const userid=req.params.id
    const User= await Register.findById(userid).populate('note')
    
    res.render('notes/index',{User,userid})
    }))

    router.get("/:id/notes/new",(req,res)=>{
    const userid=req.params.id

    res.render('notes/new',{userid})
    })

    router.post('/:id/notes',catchAsync(async(req,res)=>{

     const user = await Register.findById(req.params.id);
    const newnote = new Notes(req.body);
    const {error,value} =notesSchema.validate(req.body)
    if(error){
     
     next(new expresserror('Bad Request',400))
    }
    if(newnote){
     req.flash('success','successfully made a new note')
    user.note.push(newnote);
    await newnote.save();
    await user.save();
    res.redirect(`/user/${user._id}/notes/${newnote.id}`)
    }
    else{
        next(new expresserror('INVALID',400))
    }
    }))

   router.get('/:id/notes/:noteid',catchAsync(async(req,res)=>{
    const userid=req.params.id;
    const notes=await Notes.findById(req.params.noteid)
   
    res.render('notes/show',{notes,userid})
    }))

    router.get('/:id/notes/:noteid/edit',catchAsync(async(req,res)=>{
        const {id,noteid}=req.params;
        const editnotes=await Notes.findById(noteid)
        res.render('notes/edit',{editnotes,id})
     }))

    router.put('/:id/notes/:noteid',catchAsync(async(req,res)=>{
        const {id,noteid}=req.params
        const user=await Notes.findByIdAndUpdate(req.params.noteid,req.body)
        req.flash('success','Edit Saved')
        res.redirect(`/user/${id}/notes/${noteid}`)
    }))

    router.delete('/:id/notes/:noteid',catchAsync(async(req,res)=>{
        const { id, noteid } = req.params;
        await Register.findByIdAndUpdate(id, { $pull: { note: noteid } });
        await Notes.findByIdAndDelete(noteid);
       
        res.redirect(`/user/${id}/notes`)
    }))
    module.exports=router