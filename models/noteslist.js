const mongoose=require('mongoose')
const {Schema}=mongoose
const notesSchema=new Schema({
    title:{
        type:String
    },
    description:{
        type:String,
    },
    category:{
        type:String,
    },
    
})
const Notes=mongoose.model('Notes',notesSchema)
module.exports=Notes