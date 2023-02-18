const express=require("express");
const {CustomResponse} = require("./ApiConstants");
const APIConstants=require("./ApiConstants")
const ejs=require("ejs");
// const ejsLint = require('ejs-lint');
const cloudinary = require('cloudinary').v2
var wkhtmltopdf = require('wkhtmltopdf');
const multer=require("multer");
const path=require("path")
var unirest = require("unirest");
const fs = require('fs');
var options = { format: 'Letter' };
const ResumeParser = require('simple-resume-parser');
const app=express();
const bodyparser=require("body-parser");
// const { Schema } = mongoose;
cloudinary.config({
    cloud_name: "dfy3abzt0",
    api_key: "343664451281917",
    api_secret: "wMXPCBOc6XURqDJsmFC1rWft0TM",
  });
  
  
var frontend = new Set();

frontend.add("HTML");
frontend.add("CSS");
frontend.add("Javascript");
frontend.add("React.js");
frontend.add("Next.js");
frontend.add("React");

frontend.add("Android");
frontend.add("Flutter");


var backend=new Set();
backend.add("Node.js");
backend.add("Django");
backend.add("Php");
backend.add("Java");
backend.add("Flask");
backend.add("Firebase");
backend.add("MongoDB");

backend.add("Dart");



var stack=new Set();
stack.add("AWS");
stack.add("S3");
stack.add("npm");
stack.add("cloud");




// var keywords=new Set();
// keywords.add("Implemented");
// keywords.add("Created");
// keywords.add("Desgined");
// keywords.add("Desgined");





let teamid="";

const  mongoose=require("mongoose");
const { rawListeners } = require("process");

const { Schema } = mongoose;

    mongoose.connect("mongodb://127.0.0.1:27017/hackworldDB",{
        useNewUrlParser: true,
        useUnifiedTopology: true,
    
}).catch((err) => {
        console.log("Error connecting to database", err);
});
let userid="";
const profileSchema={
    name:String,
    email:String,
    ph:Number,
    Forte:String,
    Skills:[String],
    Work:[
        {
title:String,
Brief:String,
TechStack:String,
        }
    ],
    Projects:[
        {
            title:String,
Brief:String,
TechStack:String,
        }
    ],
    HackathonExp:[String],
    Achievement:[String],
    frontend:Number,
    Backend:Number,
    projectscore:Number,
    Experience:Number,
    Achievements:Number,
    id:String,
   

}
const Profile=mongoose.model("Profile",profileSchema);
const teamnameSchema={
    teamname:String,
    teamids:[{
    type:Schema.Types.ObjectId,
    ref:'Profile'
    }],
    id:String,
    frontendScore:Number,
    backendScore:Number,
    workExpScore:Number,
    projectScore:Number,
    overAll:Number,
    status:{type:String, default:"Under Review"}
    

}
let hackathonid="";
const hackathonSchema={
    name:String,
    mode:String,
    tagline:String,
    About:String,
    Theme:String,
    Venue:String,
    imglink:String,
    Links:String,
    Fees:String,
    Registeredteams:Number,
    AcceptedTeams:Number,
    teamid:[String]

}
const userSchema={
    email:String,
    password:String,
    hackid:[{
        type:Schema.Types.ObjectId,
        ref:'hackathon'
    }]


}
const User=mongoose.model("User",userSchema);
const hackathon=mongoose.model("hackathon",hackathonSchema);
const team=mongoose.model("team",teamnameSchema)
app.use(express.static('public'));
app.use(bodyparser.urlencoded({
    extended: true
}));
app.use(bodyparser.json());
// app.use("/v3",primaryRoutes);
app.set('view engine', 'ejs');
app.get("/",async(req,res)=>{
    const data=await hackathon.find({});

    res.render("home",{data:data});
})
app.get("/register",async(req,res)=>{
    res.render("register")
})

app.get("/organize",async(req,res)=>{
    res.render("newhack")
})
app.get("/fill",async(req,res)=>{
    res.render("profile");
})
app.get("/timeline",async(req,res)=>{
    const data=await team.findById(teamid).populate("teamids");

    res.render("timeline",{data:data});
})
app.get("/resume",async(req,res)=>{
    res.render("resume")
;})
app.get("/v2hackathon",async(req,res)=>{
    const result=await hackathon.find({});
    res.json(result);
})
app.get("/top",async(req,res)=>{
    const data=await team.find({}).sort({"overAll":-1});
    res.render("top40",{data:data});
})
let work=[]
app.post("/detailsTeam",async(req,res)=>{
    let id=req.body.teamId
    teamid=id;
    // console.log(id);
    const data=await team.findById(id).populate("teamids");
    // const work=data.teamids[0].Work;
    let work=[]
    data.teamids.forEach(ele=>{
        // console.log(ele.Work);
        ele.Work.forEach(ele1=>{
            work.push(ele1);
        })

    })
    console.log(work);
    const update=await team.findByIdAndUpdate(id,{"status":"Resume Viewed"});
    // res.render("resume",{data:data,work:work})
    res.render("resume",{data:data,work:work});


})
app.post("/accepted",async(req,res)=>{
    const u1=await team.findByIdAndUpdate(teamid,{"status":"Accepted"},{new:true});
    res.redirect("/top");
})
app.post("/reject",async(req,res)=>{
    const u1=await team.findByIdAndUpdate(teamid,{"status":"Rejected"},{new:true});
    res.redirect("/top");
})
app.post("/generate",async(req,res)=>{
    const data=await team.findById(teamid).populate("teamids");
    // const work=data.teamids[0].Work;
    let work=[]
    data.teamids.forEach(ele=>{
        // console.log(ele.Work);
        ele.Work.forEach(ele1=>{
            work.push(ele1);
        })

    })
    console.log(work);
    // res.render("resume",{data:data,work:work})
    res.render("resume",{data:data,work:work},function(err,html){
                // console.log(html);
                let string =String(html)
                console.log(string);
                
                wkhtmltopdf(string, {
                    output:  `${data.teamname} Resume.pdf`
        ,            pageSize: 'letter'
                });
            });
})

app.post("/profileSubmit",async(req,res)=>
{
    try{
        let separatedArray=[];
        let work=[],proj=[];
        let string=req.body.tech;
    for(let i=0;i<1;i++){
        let obj={
            title:req.body.title1,
            Brief:req.body.Brief1,
            TechStack:req.body.TechStack1

        }
         let obj1={
            title:req.body.title2,
            Brief:req.body.Brief2,
            TechStack:req.body.TechStack2

        }
        work.push(obj);
        work.push(obj1);
        let obj2={
            title:req.body.title3,
            Brief:req.body.Brief3,
            TechStack:req.body.TechStack3

        }
         let obj3={
            title:req.body.title4,
            Brief:req.body.Brief4,
            TechStack:req.body.TechStack4

        }
        proj.push(obj2);
        proj.push(obj3);

        
    }
        console.log(string);
        let previousIndex = 0;
     
        for(i = 0; i < string.length; i++) {
         
        // check the character for a comma
        if (string[i] == ',') {
         
        // split the string from the last index
        // to the comma
        separated = string.slice(previousIndex, i);
        separatedArray.push(separated);
         
        // update the index of the last string
        previousIndex = i + 1;
        }
        }
         
        // push the last string into the array
        separatedArray.push(string.slice(previousIndex, i));

    let data=req.body;
    console.log(data);
    const obj=new Profile({...data,Skills:separatedArray,Work:work,Projects:proj});
    const result=await obj.save();
    console.log(teamid);
    const update=await team.findByIdAndUpdate(teamid,{$push:{teamids:result._id}});
    console.log(result);
    if(result){
    res.json({
        "data":result
    })
}
    // return CustomResponse(null, APIConstants.Status.Success, APIConstants.StatusCode.Ok, result, null);
    }catch(e){
        console.log(e.message);
        res.json({
            "error":e
        })
        // return CustomResponse('Error while fetching signUp!', APIConstants.Status.Failure, APIConstants.StatusCode.BadRequest, null, error.message);

    }


})
app.post("/v2profileSubmit",async(req,res)=>
{
    try{
        let separatedArray=[];
        let work=[],proj=[];
        let string=req.body.tech;
    for(let i=0;i<1;i++){
        let obj={
            title:req.body.title1,
            Brief:req.body.Brief1,
            TechStack:req.body.TechStack1

        }
         let obj1={
            title:req.body.title2,
            Brief:req.body.Brief2,
            TechStack:req.body.TechStack2

        }
        work.push(obj);
        work.push(obj1);
        let obj2={
            title:req.body.title3,
            Brief:req.body.Brief3,
            TechStack:req.body.TechStack3

        }
         let obj3={
            title:req.body.title4,
            Brief:req.body.Brief4,
            TechStack:req.body.TechStack4

        }
        proj.push(obj2);
        proj.push(obj3);

        
    }
        console.log(string);
        let previousIndex = 0;
     
        for(i = 0; i < string.length; i++) {
         
        // check the character for a comma
        if (string[i] == ',') {
         
        // split the string from the last index
        // to the comma
        separated = string.slice(previousIndex, i);
        separatedArray.push(separated);
         
        // update the index of the last string
        previousIndex = i + 1;
        }
        }
         
        // push the last string into the array
        separatedArray.push(string.slice(previousIndex, i));

    let data=req.body;
    console.log(data);
    const obj=new Profile({...data,Skills:separatedArray,Work:work,Projects:proj});
    const result=await obj.save();
    console.log(teamid);
    const update=await team.findByIdAndUpdate(teamid,{$push:{teamids:result._id}});
    console.log(result);
    if(result){
    res.json({
        "data":result
    })
}
    // return CustomResponse(null, APIConstants.Status.Success, APIConstants.StatusCode.Ok, result, null);
    }catch(e){
        console.log(e.message);
        res.json({
            "error":e
        })
        // return CustomResponse('Error while fetching signUp!', APIConstants.Status.Failure, APIConstants.StatusCode.BadRequest, null, error.message);

    }


})
app.get("/check",async(req,res)=>{
    res.render("dummy")
})
app.get("/team",async(req,res)=>{
    res.render("teamname")
})
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
 
var upload = multer({ storage: storage });
app.post('/host', upload.single('image'),async (req, res, next) => {
    console.log(req.file.path);
    let imagee=req.file.path;
let imag=fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename));
  const uploadRes = await cloudinary.uploader.upload(imagee, {
                  upload_preset: "onlineShop",
                });
                if(uploadRes){
                const body=req.body;
                                body.imglink=uploadRes.url
                                const data =new hackathon({...body});
                                const result=await data.save();
                                res.json(body);
                }
                // res.json(body)
});

app.post("/create",async(req,res)=>{
    const data=req.body;
    const obj=new User({...data});
    const result=await obj.save();
    res.render("login");
})
app.post("/login",async(req,res)=>{
let email=req.body.email;
let password=req.body.password;

User.findOne({email:email},(er,data)=>{
    console.log(data);
    if(data.password==password){
userid=data._id;
// console.log("done");
res.redirect("/")
    }
})
})
app.get("/gethackathon",async(req,res)=>{
   const data=await hackathon.find({})
   res.json(data);
})

app.post("/registerHackathon",async(req,res)=>{
    let hackid=req.body.hackid;
    console.log(teamid);
    console.log(hackid);
    hackathonid=hackid;

    const u1=await User.findOneAndUpdate({_id:userid},{$push:{hackid:hackid}},{new:true});

res.render("teamname")
    // res.json(u1)







})
app.post("/kdd",async(req,res,next)=>{
    // try{
        upload.single('image')(req, res, function (error) {
            if (error) {
              console.log(`upload.single error: ${error}`);
              return res.sendStatus(500);
            }
            // code
          })
        console.log(req.file)
     
    //    let op= fs.readFileSync(path.join(__dirname+'/uploads/'+req.body.file.filename));
    //    console.log(op);;

//     const image=req.body.imglink;
// console.log(image);
//         if (image) {
//             const uploadRes = await cloudinary.uploader.upload(image, {
//               upload_preset: "onlineShop",
//             });
//             if (uploadRes) {
//                 const body=req.body;
//                 body.imglink=uploadRes
//                 const data =new hackathon({...body});
//                 const result=await data.save();
// res.json(result);
//             //   const photo = new Image({
//             //     image: uploadRes,
//             //   });
//             //   const savedImage = await photo.save();
//             //   res.status(200).send(savedImage);
//             }
//           }
      
       
//         res.json(result);

//     }catch(e){
//         console.log(e.message);
//     }
})
app.get("/login",async(req,res)=>{
    res.render("login")
})
app.post("/teamName",async(req,res)=>{
    let data=req.body;
    const obj=new team({...data});
    const result=await obj.save();
    teamid=result._id;
    console.log(hackathonid);
    console.log(teamid);

    const u2=await hackathon.findByIdAndUpdate(hackathonid,{$push:{teamid:teamid}});

res.render("profile");
    // res.json({
    //     "data":result
    // })
})
app.get('/details',async(req,res)=>{
    // let separatedArray1 = [];
    // let frontendScore=0;
    // let teamid="";

// console.log(`Map size: ${myMap.size}`); // 3
// if(frontend.has("vue")==true){
//     console.log("yesss");
// }else{
//     console.log("mno");
// }
// console.log(fr.get("7"));

    const data=await team.find({}).populate("teamids");
    data.forEach(async data=>{
        let finalFrontendScore=0,finalBackendScore=0,finalProjectScore=0,finalworkScore=0,finalAchivementScore=0,count1=0,count2=0;
       let teamid=data._id;
  
    // res.json({"data":data}

   
    data.teamids.forEach(async member=>{
     
        // let forte=member.forte;
        let frontendScore=0,backendScore=0,exp=0,match=0,proj=0,Achievements=0;;
        member.HackathonExp.forEach(async skill=>{
            // console.log(skill);
            let a1=/winner/i,a2=/runner up/i,a3=/first/i,a4=/second/i,a5=/top/i,a6=/Hackathon/i;
         if(skill.match(a1)!=null ||skill.match(a2)!=null || skill.match(a3)!=null || skill.match(a4)!=null || skill.match(a5)!=null || skill.match(a6)!=null) {
            Achievements++;
         }
            

           
        })
        console.log(Achievements);

        member.Skills.forEach(async skill=>{
            if(frontend.has(skill)){
                
                frontendScore++;
            }
            if(backend.has(skill)){
                backendScore++;
            }
            // console.log(frontendScore);

           
        })

        // console.log(frontendScore);
    let separatedArray = [];
    let separatedArray1 = [];


        member.Work.forEach(element => {
            let pattern=element.Brief;
            let pattern1=element.title;
            let p1=/android/i,p2=/web/i,p3=/developer/i,p4=/frontend/i,p5=/backend/i;


            let keyword1=/implemented/i,keyword2=/created/i,keyword3=/designed/i,keyword4=/developed/i,keyword5=/api/i;
            if(pattern.match(keyword1)!=null ||pattern.match(keyword2)!=null || pattern.match(keyword3)!=null || pattern.match(keyword4)!=null || pattern.match(keyword5)!=null || pattern1.match(p1)!=null || pattern1.match(p2)!=null || pattern1.match(p3)!=null || pattern1.match(p4)!=null || pattern1.match(p5)!=null){
                exp++;
                // console.log("helllooooo");
            }
            // console.log(match);
    // let separatedArray = [];

            // console.log(element.TechStack);
    let string=element.TechStack;
    
    let previousIndex = 0;
     
    for(i = 0; i < string.length; i++) {
     
    // check the character for a comma
    if (string[i] == ',') {
     
    // split the string from the last index
    // to the comma
    separated = string.slice(previousIndex, i);
    separatedArray.push(separated);
     
    // update the index of the last string
    previousIndex = i + 1;
    }
    }
     
    // push the last string into the array
    separatedArray.push(string.slice(previousIndex, i));
            // res.json(separatedArray)
    
            //separate the words by comma  in string
    
    
            
        });
        // console.log(separatedArray);

for(var i=0;i<separatedArray.length;i++){
    if(frontend.has(separatedArray[i])|| backend.has(separatedArray[i]) || stack.has(separatedArray[i])){
        exp++;
    }
}
// console.log(exp);

        separatedArray=[];
        //////////////////////

        member.Projects.forEach(element => {
            let pattern=element.Brief;
            let pattern1=element.title;
            let p1=/android/i,p2=/web/i,p3=/developer/i,p4=/frontend/i,p5=/backend/i;


            let keyword1=/implemented/i,keyword2=/created/i,keyword3=/designed/i,keyword4=/developed/i,keyword5=/api/i;
            if(pattern.match(keyword1)!=null ||pattern.match(keyword2)!=null || pattern.match(keyword3)!=null || pattern.match(keyword4)!=null || pattern.match(keyword5)!=null ){
                proj++;
                // console.log("helllooooo");
            }
            // console.log(match);
    // let separatedArray = [];

            // console.log(element.TechStack);
    let string=element.TechStack;
    
    let previousIndex = 0;
     
    for(i = 0; i < string.length; i++) {
     
    // check the character for a comma
    if (string[i] == ',') {
     
    // split the string from the last index
    // to the comma
    separated = string.slice(previousIndex, i);
    separatedArray1.push(separated);
     
    // update the index of the last string
    previousIndex = i + 1;
    }
    }
     
    // push the last string into the array
    separatedArray1.push(string.slice(previousIndex, i));
            // res.json(separatedArray1)
    
            //separate the words by comma  in string
    
    
            
        });
        // console.log(separatedArray1);

for(var i=0;i<separatedArray1.length;i++){
    if(frontend.has(separatedArray1[i])|| backend.has(separatedArray1[i]) || stack.has(separatedArray1[i])){
        proj++;
    }
}
// console.log(proj);
separatedArray1=[];
    
            
        
       
                // const updatyee
                console.log("Efasdfasdfasdf");
        const update=await Profile.findByIdAndUpdate(member._id,{"frontend":frontendScore,"Backend":backendScore,"Experience":exp,"projectscore":proj,"Achievements":Achievements},{new:true});
        // if(update.forte=="Frontend"){
            finalFrontendScore+=frontendScore;
            count1++;
        // }else if(update.forte=="Backend"){
            finalBackendScore+=backendScore;
            count2++;
        // }
        finalAchivementScore+=update.Achievements;
        finalProjectScore+=update.projectscore;
        finalworkScore+=update.Experience;
        // console.log(finalFrontendScore);
        let av1=(finalFrontendScore/count1)+finalFrontendScore;
        
        let av2=(finalBackendScore/count2)+finalBackendScore;
        const updatefinal=await team.findByIdAndUpdate(teamid,{"frontendScore":av1,"backendScore":av2,"workExpScore":finalworkScore,"projectScore":finalProjectScore,
"overAll":av1+av2+finalAchivementScore+finalProjectScore+finalworkScore},{new:true});

        // "overAll":av1+av2+finalAchivementScore+finalProjectScore+finalworkScore},{new:true});
            


        // const update1=await Profile.findByIdAndUpdate(member._id,{"backend":backendScore});


        // member.Work.forEach(exp=>{

        // })
        // console.log(backendScore);
        // if(frontend==3)
        // const update=await Profile.findByIdAndUpdate(member._id,{})



    })
    // frontendScore:Number,
    // backendScore:Number,
    // workExpScore:Number,
    // projectScore:Number,
    // overAll:Number
    // console.log(finalFrontendScore);
    // let av1=(finalFrontendScore/count1);
    // let av2=(finalBackendScore/count2);
//     const updatefinal=await team.findByIdAndUpdate(teamid,{"frontendScore":av1,"backendScore":av2,"workExpScore":finalworkScore,"projectScore":finalProjectScore,
// "overAll":av1+av2+finalAchivementScore+finalProjectScore+finalworkScore},{new:true});
    


})
    // if(count>=3){

    //     console.log("frontend op");
    // }

//     data.teamids.forEach(element1 => {



//             element1.Work.forEach(element => {
//         // console.log(element.TechStack);
// let string=element.TechStack;

// let previousIndex = 0;
 
// for(i = 0; i < string.length; i++) {
 
// // check the character for a comma
// if (string[i] == ',') {
 
// // split the string from the last index
// // to the comma
// separated = string.slice(previousIndex, i);
// separatedArray1.push(separated);
 
// // update the index of the last string
// previousIndex = i + 1;
// }
// }
 
// // push the last string into the array
// separatedArray1.push(string.slice(previousIndex, i));
//         // res.json(separatedArray1)

//         //separate the words by comma  in string


        
//     });

        
//     });

res.json(data)

})

// app.get("/parse",async(req,res)=>{
//     const resume = new ResumeParser("Sachin_Jangid_Resume_2022.docx");


// // From URL
// // const resume = new ResumeParser("https://drive.google.com/file/d/1uDLVojOS8ENMWRFS03qs5Z_GetMkFVuF/view?usp=sharing");

// //Convert to JSON Object
//   resume.parseToJSON()
//   .then(data => {
//    res.json( data.parts);
// const save=new Profile({
//     name:data.parts.name,
//     email:data.parts.email,
//     ph:data.parts.ph,


    

// })
//   })
//   .catch(error => {
//     console.error(error);
//   });
// })
// app.get()
app.post('/filter',async(req,res)=>{
    let top=req.body.no;
    const data=await team.find({}).sort({"overAll":-1}).limit(top).exec();
    res.render("top40",{data:data})
    
})
app.post("/filter1",async(req,res)=>{
let filter=req.body.filter;
if(filter=="project"){
    const data=await team.find({}).sort({"projectScore":-1}).limit(4).exec();
    res.render("top40",{data:data})
}else{
    const data=await team.find({}).sort({"workExpScore":-1}).limit(4).exec();
    res.render("top40",{data:data})
}
console.log(filter);
})
// app.post()
app.listen(80,async(req,res)=>{
    console.log("listening on port 80");
})