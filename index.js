// // console.log("hello world");

// // const http = require("http");
// // console.log(http);
// // const gfName = require("./features")

// import http from "http";
// // import gfName  from "./features.js";
// import { generateLoveParent } from "./features.js";
// import fs from "fs"
// import path from "path";
// // import champakChacha from "./features.js";
// // import { gfName2, gfName3 } from "./features.js";
// // import champakChacha , {gfName2, gfName3} from "./features.js";
// import * as myObj from "./features.js"
// // console.log(gfName, gfName2, gfName3)
// // console.log(champakChacha); // it's going to work because it's importing default value from the features.js
// // console.log(myObj);
// // console.log(myObj.gfName);
// // console.log(myObj.gfName2);
// // console.log(myObj.gfName3);
// console.log(generateLoveParent())
// const  home=fs.readFile("./index.html", ()=>{
//     console.log("File Read")
// })

// console.log(home);
// console.log(path.extname("/home/random/index.html"));
// console.log(path.extname("/home/random/index.js"));
// console.log(path.dirname("/home/random/index.js"));

// const home2 = fs.readFileSync("./index.html")
// //if the file isn't read yet the below code won't be served
// // console.log(home2)
// const server = http.createServer((req, res)=>{
//     // console.log("inside the server")
   
//     // console.log(req.url)
//     // res.end("<h1>Nice</h1>");
//     console.log(req.method)
//     if(req.url==='/about'){
//         res.end(`<h1>Love is ${generateLoveParent()}</h1>`);
//     }
//    else if(req.url==="/"){
//     fs.readFile("./index.html", (err, home)=>{
//         console.log("File Read");
//         // console.log(home)
//         // res.end(home)
//         res.end("home2");
//     })
//          console.log(home)
//         // res.end("<h1>Home page</>")
//     }
//    else if(req.url==='/contact'){
//         res.end("<h1>contact page</>")
//     }
//     else{
//         res.end("<h1>page not found</h1>")
//     }


// })



// server.listen(5000, ()=>{
//     console.log("server is working perfectly");

// })

import express from "express"; 
import fs from "fs"
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

mongoose.connect('mongodb://localhost:27017', {dbName: "backend"}).then(()=> console.log("database connected")).catch((e)=>console.log(e))

const messageSchema = new mongoose.Schema({
    name : String, email : String
})

const userSchema = new mongoose.Schema({
    name : String,
    email: String,
    password : String
})

const Message = mongoose.model("Messages", messageSchema)
const User = mongoose.model("Users",userSchema)
const app = express();



// using middlewares
const users =[]
app.use(express.static(path.join(path.resolve(),"public")))
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
// app.get("/getProducts",(req, res,next)=>{
//     // res.send("hi")

// // res.sendStatus(404); // Not Found
// // res.sendStatus(500) // internal server error

// // res.json({
// //     success: true,
// //     products : []
// // })

// // res.sendFile
// // res.status(400).send("Meri Marzi");
// // res.sendFile("./index.html");
// // this will give me that error : path must be absolute or specify root to res.sendFile

// // const file =fs.readFileSync("./index.html");
// // res.sendFile(file);
// // this will give us that error path must be a string to res.sendFile


// // console.log(path.resolve());
// // res.sendFile('./index.html');


// // how to find current directory
// // console.log(path.resolve());
// const pathlocation = path.resolve();
// // console.log(path.join(pathlocation, "nice"))
// // res.sendFile(path.join(pathlocation, "./index.html"));


// // now better way to do this
// res.render("index");
// })

app.set('view engine' , 'ejs'); // Set EJS as the view engine
const isAuthenticated = async(req, res, next)=>{
    // using it as a middleware
    const token = req.cookies.token;
    if(token){
        // res.render("logout");
       const decoded= jwt.verify(token, "vikasBhardwaj")
       console.log(decoded);
       req.user = await User.findById(decoded._id); 
    //    this will give an output like this : { _id: '64e0ad8f6f27a92a4fd399cf', iat: 1692446095 }

        next();
    } 
    else{
        res.redirect("/login");
    }

}
app.get("/",isAuthenticated,(req,res)=>{
    // console.log(req.cookies.token) // won't work because we eill have to install coookieparser
    console.log(req.user)
    res.render("logout", {name : req.user.name });



})

app.get("/register", (req, res)=>{
    res.render("register")
})
app.get("/login", (req,res)=>{
    res.render("login")
})


app.post("/register", async(req, res)=>{
    console.log(req.body)
    const {name, email, password} = req.body;
    let user = await User.findOne({email})
    if(user){
        //    return console.log("Register first")
        return res.redirect("/login");
           // if the user isn't registered, nothing would happen and tha application will keep on loading
    }

    const hashedPassword = await bcrypt.hash(password, 10)
     user = await User.create({
        name,email,
        password: hashedPassword
    })

    const token = jwt.sign({_id: user._id},"vikasBhardwaj");
    console.log(token);
    res.cookie("token", token,{
        httpOnly: true,
        expires : new Date(Date.now()+ 60*1000),
    });
    res.redirect("/")
    // data gets stored inside cookies, at the time of logging out, cookies get destroyed
})



app.post("/login", async(req, res)=>{
    console.log(req.body)
    const {name, email, password} = req.body;
    let user = await User.findOne({email})
    if(!user){
        //    return console.log("Register first")
        return res.redirect("/register");
           // if the user isn't registered, nothing would happen and tha application will keep on loading
    }
    //  user = await User.create({
    //     name,email
    // })
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        return res.render("login", {email,message: "incorrect pasword"})
    }
    const token = jwt.sign({_id: user._id},"vikasBhardwaj");
    console.log(token);
    res.cookie("token", token,{
        httpOnly: true,
        expires : new Date(Date.now()+ 60*1000),
    });
    res.redirect("/")
    // data gets stored inside cookies, at the time of logging out, cookies get destroyed
})

app.get("/logout", (req, res)=>{
    res.cookie("token", null, {
        httpOnly: true,
        expires : new Date(Date.now())
    })
    res.redirect("/")
})

// app.get("/add", async(req,res, next)=>{
//     // res.render("index", {name : "abhishek"});
//    await Message.create({name : "Abhi", email: "abc@gmail.com"}).then(()=>{
//         res.send("nice")
//     })
// })

// app.get("/success", (req, res)=>{
//     res.render("success.ejs");
// })
// app.post("/contact", async(req,res)=>{
//     // users.push({userName : req.body.name, userEmail : req.body.email})
    
//     // const messageData = {userName : req.body.name, userEmail : req.body.email}
//     // res.render("success");
//    await Message.create({name : req.body.name, email : req.body.email})
//     res.redirect("/success");
// })
// app.get("/users", (req, res)=>{
//     res.json({
//         users
//     })
// })

app.listen(5000, ()=>{
    console.log(`port is running at 5000`);
})

// if we were to do this without using the set, it were to happen like this 

// app.get("/", (req,res)=>{
//     res.render("index.ejs", {name : "abhishek"});
// })

// app.listen(5000, ()=>{
//     console.log("server is running at 5000")
// })