const mongoose=require('mongodb')
const bcrypt=require('bcrypt')
const {Schema}=mongoose
const registerSchema=new Schema({
    email:{
        type:String,
        required:true
    },password:{
        type:String,
        required:true
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
registerSchema.statics.findByUsernameAndValidate=async function(email,password){
    const user=await this.findOne({email});
  const isValid=  await bcrypt.compare(password,user.password)
  return isValid?user:false;
}
registerSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next()
    this.password= await bcrypt.hash(this.password,10)
    next()
})
const Register=mongoose.model("Register",registerSchema)
module.exports=Register