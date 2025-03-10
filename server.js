const express=require('express');
const app=express();
const mongoose=require('mongoose');
app.use(express.json()); 
// for ejs
const path=require("path");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
// to get the data from url
app.use(express.urlencoded({extended:true}));
// to use static file it should be save in public folder only
app.use(express.static(path.join(__dirname,"public")));
// express session 
const session=require("express-session");

// method override
const methodOverride=require("method-override");
app.use(methodOverride("_method"));
// models
const project=require('./models/projects.js');


// passport
const worker = require('./models/worker.js'); 
const business = require('./models/business.js'); 
const supervisor=require('./models/supervisor.js');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

const wrapAsync = require("./public/util/WrapAsync.js");
// Connection to DB
const MONGO_URL="mongodb://127.0.0.1:27017/BrickByBrick";
// Error Handling
main().then(()=>{
    console.log("Connected to DB");
}).catch((err)=> {
    console.log(err)});
// main fxn to connect to DB
async function main() {
    await mongoose.connect(MONGO_URL);
}
// Session for cookies
const sessionOptions={
    secret:"BMSCE",
    resave:false,
    saveUninitialized: true,
    Cookie:{
        expires:Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly:true,
        
    },
};
app.use(session(sessionOptions));
app.use(express.json()); 

// passport setup
passport.use('worker-local', new localStrategy(worker.authenticate()));
passport.use('business-local', new localStrategy(business.authenticate()));
passport.use('supervisor-local', new localStrategy(supervisor.authenticate()));

// Serialize User (include role information)
passport.serializeUser((user, done) => {
  let role;
  if (user instanceof worker) {
    role = 'worker';
  } else if (user instanceof business) {
    role = 'business';
  } else if (user instanceof supervisor) {
    role = 'supervisor';
  }
  done(null, { id: user.id, role });
});

// Deserialize User (based on role)
passport.deserializeUser(async (data, done) => {
  try {
    let Model;
    if (data.role === 'worker') {
      Model = worker;
    } else if (data.role === 'business') {
      Model = business;
    } else if (data.role === 'supervisor') {
      Model = supervisor;
    }
    const user = await Model.findById(data.id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
// signup worker
app.post("/worker_signup",wrapAsync(async(req,res)=>{
  let { username,aadhar,phone,gender,email,address,dob,password}=req.body;
  const newuser=new worker({username,aadhar,phone,gender,email,address,dob,password});
  const registereduser=await worker.register(newuser,password);
  console.log(registereduser);
  res.redirect("/worker_home");
}));

// login worker
app.post("/worker_login",passport.authenticate('worker-local',
  { failureRedirect: '/worker_login' }),async(req,res)=>{
      res.redirect("/worker_home");
})
// logout worker
app.get('/worker_logout',(req, res, next)=>{
  
    res.redirect('/');
 
});

// signup business
app.post("/business_signup",wrapAsync(async(req,res)=>{
  let { username,email,registrationId,permitNumber,password}=req.body;
  const newuser=new business({username,email,registrationId,permitNumber,password});
  const business_user=await business.register(newuser,password);
  console.log(business_user);
  res.redirect("/business_home");
}));

// login business
app.post("/business_login",passport.authenticate('business-local',
  { failureRedirect: '/business_login' }),async(req,res)=>{
      res.redirect("/business_home");
})

// business logout
app.get('/business_logout',(req, res, next)=>{
  res.redirect('/');
});
app.get('/',(req,res)=>{
  res.render("../views/mainpage.ejs");
})

app.get('/business_login',(req,res)=>{
  res.render("../views/business_login.ejs");
})

app.get('/business_signup',(req,res)=>{
  res.render("../views/business_signup.ejs");
})


app.get('/worker_signup',(req,res)=>{
  res.render("../views/worker_signup.ejs");
})

app.get('/worker_login',(req,res)=>{
  res.render("../views/worker_login.ejs");
})

app.get('/worker_home',async(req,res)=>{
  const projects=await project.find({})
  res.render("../views/Worker_interface.ejs",{projects});
})

app.get('/supervisor_login',(req,res)=>{
  res.render("../views/supervisor_login.ejs");
})
app.get('/supervisor_signup',(req,res)=>{
  res.render("../views/supervisor_signup.ejs");
})
app.post("/supervisor_login",passport.authenticate('supervisor-local',
  { failureRedirect: '/supervisor_login' }),async(req,res)=>{
      res.redirect("/supervisor_home");
})
app.post("/supervisor_signup",wrapAsync(async(req,res)=>{
  let {username,aadharno,phoneNumber,gender,email,supervisorid,password}=req.body;
  const newuser=new supervisor({username,aadharno,phoneNumber,gender,email,supervisorid,password});
  const supervisor_user=await supervisor.register(newuser,password);
  console.log(supervisor_user);
  res.redirect("/supervisor_home");
}));

app.get('/supervisor_logout',(req, res, next)=>{
  res.redirect('/');
});

app.get('/supervisor_home',async(req,res)=>{
  const projects=await project.find({})
  res.render("../views/supervisor_interface.ejs",{projects});
})

app.get('/business_home',async(req,res)=>{
  const projects=await project.find({})
  res.render("../views/business_interface.ejs",{projects});
})

app.post('/business__home',async(req,res)=>{
  let { projectName,startdate,enddate,location,supervisor,numberofworkers,payperday}=req.body;
  const newactivity = new project({ projectName,startdate,enddate,location,supervisor,numberofworkers,payperday});
  newactivity.status="In Progress";
  await newactivity.save();
  console.log("project saved");
  res.redirect("/business_home");
})

app.post('/update-status/:id', async (req, res) => {
  try {
      const projectId = req.params.id;
      const { status } = req.body;

      // Update the status in the database
      await project.findByIdAndUpdate(projectId, { status });

      // Send JSON response
      res.status(200).json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
      console.error('Error updating status:', error);
      res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.delete('/business_home/:id',async (req,res)=>{
  let {id}=req.params;
  let deleted=await project.findByIdAndDelete(id);
  console.log("Deleted");
  res.redirect('/business_home');
})

app.listen(8080,()=>{
  console.log("server is running");
});