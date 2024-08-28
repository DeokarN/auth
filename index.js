const express =require('express');
const mongoose =require('mongoose');
const bcrypt =require('bcryptjs');
const jwt = require('jsonwebtoken');

const PORT =4000;

const app=express();
app.use(express.json())

// database connection 
mongoose.connect('mongodb://127.0.0.1:27017/auth')
.then(()=>{
    console.log("database conected succesfully...")
}).catch((err)=>{
    console.log("err in connecting database",err)
})


// user schema

const userShema =new mongoose.Schema({
    username:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
})



userShema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt)
    next();
})

const User = mongoose.model('user',userShema);

app.get('/',(req,res)=>{
    res.send("hello nishi")
})

app.post('/signup',async(req,res)=>{
    // res.send('user signed up')
    try{
        const {username,email,password} = req.body
        const newuser =new User({username,email,password});
        await newuser.save()
        res.status(201).send('user created succesfully..')
    }catch(err){
        res.status(400).send(err.message)
    }
   
})
app.post('/login',async(req,res)=>{
    // res.send('user loged in')
    try{
        const {email,password}=req.body;
        const user =await User.findOne({email});

        if(!user) return res.status(400).send('user not found')
            const ismatch =await bcrypt.compare(password,user.password);
        if(!ismatch) return res.status(400).send('invalid user')

            const token = jwt.sign({userId:user._id},"your jwt secret",{
                expiresIn:"1h"
            })
            res.json({message:"user logged in succesfully..",token})
    }
    catch(err){
        res.status(400).send(err.message);
    }
})

app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`)
})