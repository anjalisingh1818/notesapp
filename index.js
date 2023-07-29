if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express=require('express')
const app=express();
const methodOverride=require('method-override')
const path=require('path')
const mongoose=require('mongoose')
const session=require('express-session')
const flash=require('connect-flash')
const expresserror=require('./utilities/expresserror')
const notes=require('./routes/notes.js')
const reg=require('./routes/reg.js')
const login=require('./routes/login.js')
const PORT=process.env.PORT||2000
const DA=process.env.DB_URL

const MongoDBStore = require("connect-mongo")(session);
 mongoose.connect(DA,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
   
})
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
const store = new MongoDBStore({
    url: DA,
    secret:process.env.SECRET,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig={
    name:process.env.NAME,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7,
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use((req,res,next)=>{
   res.locals.success= req.flash('success')
   res.locals.error=req.flash('error')
   next()
})
app.use('/public',express.static('public'));
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,'public')))
app.set('view engine','ejs')


app.get("/",(req,res)=>{
    res.render('register/home')
})
const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/login')
    }
    next();
}
    
app.use('/user',notes)
app.use('/register',reg)
app.use('/login',login)

app.all("*",(req,res,next)=>{
    next(new expresserror('Page Not Found',404))
   })
app.use((err,req,res,next)=>{
    
    const {statusCode=500,message}=err
    if(!err.message) err="something went wrong"
   res.status(statusCode).render("notes/error",{err})
})
app.post('/logout',(req,res)=>{
    req.session.destroy()
    res.redirect('/login')
})
app.listen(PORT,()=>{
    console.log("listening")
})
