const mongoose=require('mongoose')
const {Schema}=mongoose
const registerSchema=new Schema({
    email:{
        type:String,
        require:true
    },password:{
        type:String,
        require:true
    },
    name:{
        type:String
    },
    note:[
        {
        type:Schema.Types.ObjectId,
        ref:'Notes'
        }
]

})
const Register=mongoose.model("Register",registerSchema)
module.exports=Register