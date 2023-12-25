const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require("nodemailer");
require('dotenv').config()
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));
// app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // Use express.json() middleware to parse JSON data
app.use(cors({
    origin: process.env.origin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.email, // replace with your email
      pass: process.env.password, // replace with your email password
    },
  });


const mongoUrl = process.env.dburl;

mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log("Connected to the database");
    })
    .catch((e) => console.error("Error connecting to the database:", e));

require("./Schema");

// const Images = mongoose.model("Image");

const PORT = 8888;

app.listen(PORT, () => {
    console.log(`Server started listening at http://localhost:${PORT}`);
});
// app.post("/upload-image", (req, res) => {
//   const image = req.body.image;
//   console.log(image);
//   try {
//       Images.create({ image: image })
//           .then(result => {
//               console.log("Image created successfully:", result);
//               res.send({ Status: "ok", data: image });
//           })
//           .catch(error => {
//               console.error("Error creating image:", error);
//               res.status(500).send({ Status: "error", data: error.message });
//           });
//   } catch (error) {
//       console.error('Error uploading image:', error);
//       res.status(500).send({ Status: "error", data: error.message });
//   }
// });

// ---------------------------user routes----------------------------------
// get all the records sorted in order by id
// update all the details of the user

const user = mongoose.model("Team");

app.post("/create",(req,res)=>{
    
    try{
        const data = {
     id : req.body.id,
    name: req.body.name,
     role:req.body.role,
     instagram:req.body.instagram,
     linkdin:req.body.linkdin,
     github:req.body.github,
     image:req.body.image,
    }

    user.create(data)
    .then(result => {
        console.log("user created successfully:", result);
        res.send({ Status: "ok", data: data });
         })
    .catch(error => {
        console.error("Error creating user:", error);
        res.status(500).send({ Status: "error", data: error.message });
        });

    }
    catch(error){
        res.status(500).send({ Status: "error", data: error.message });
    }

})

app.post("/getbyid",async(req,res)=>{
    try{
        console.log(req.body.id);
        if(req.body.id){
        const teammember = await user.findOne({id:req.body.id})
        res.send({Status:"Ok",data:teammember});
        }
        else
        res.send({error:"cannot find the user with this id"});
    }
    catch(error){
        res.send({error:error});
    }
})

app.get("/get", async (req, res) => {
    try {
        const teammembers = await user.find().sort({ id: -1 });
        res.send({ Status: "ok", team: teammembers });
    } catch (error) {
        res.send({ error: error.message });
    }
});


app.post("/update", async (req, res) => {
    try {
        const id = req.body.id;
        const teammate = await user.findOne({ id: id });

        if (!teammate) {
            return res.status(404).send({ Status: "error", data: "Teammate not found" });
        }

        const updatedValues = {};

        // Check each field in req.body and update if present
        if (req.body.name) updatedValues.name = req.body.name;
        if (req.body.role) updatedValues.role = req.body.role;
        if (req.body.instagram) updatedValues.instagram = req.body.instagram;
        if (req.body.linkdin) updatedValues.linkdin = req.body.linkdin;
        if (req.body.github) updatedValues.github = req.body.github;
        if (req.body.image) updatedValues.image = req.body.image;

        const updatedTeammate = await user.findOneAndUpdate({ id: id }, updatedValues, { new: true });

        console.log("Updated User:", updatedTeammate);
        res.status(200).send({ Status: "successful", data: updatedTeammate });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ Status: "error", data: error.message });
    }
});


app.post("/del",async (req,res)=>{
    const a = req.body.id;
    if(a){
        const c=await user.find({id:a})
        if(c){
        const b = await user.deleteOne({id:a});
        console.log(b)
        res.status(200).send({data:"user deleted sucessfully"});
        }
        else{
            res.status(500).send({error:"please enter the valid id"});
        }
    }
    else{
        res.status(500).send({error:"enter the id first"});
    }
})

// -------------------------------------- event routes---------------------
// create event delete event update event getreport

// create event

const subscribers = mongoose.model("subscibers");

const Event = mongoose.model("event");
app.post("/event/create", async (req, res) => {
    try {
        const data = req.body;
        data.RegisteredUsers = 0;

        const event = await Event.create(data);

        // Send email to subscribers with a timeout
        const ss = await subscribers.find();
        const emailPromises = ss.map((subscriber, index) => {
            const mailOptions = {
                from: process.env.email, // Replace with your Gmail email
                to: subscriber.email,
                subject: 'We came up with the new Session',
                text: `A new event "${event.Eventname}" has been created. Check it out!
                <a href="http://localhost:3000"> click here<a>`
            };

            // Introduce a timeout between sending emails
            const timeout = index * 1000; // Adjust the timeout duration as needed
            return new Promise(resolve => {
                setTimeout(() => {
                    transporter.sendMail(mailOptions)
                        .then(() => resolve())
                        .catch(error => console.error('Error sending email:', error));
                }, timeout);
            });
        });

        await Promise.all(emailPromises);

        console.log("Event created successfully:", event);
        res.send({ Status: "ok", data: event });
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).send({ Status: "error", data: error.message });
    }
});
app.get("/event/get", async (req, res) => {
    try {
        const events = await Event.find().sort({ Eventid: -1 });
        res.status(200).send({ events: events });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});




app.post("/event/update/", async (req, res) => {
    try {
        const id = req.body.Eventid;
        const event = await Event.findOne({ Eventid: id });

        if (!event) {
            return res.status(404).send({ Status: "error", data: "event not found" });
        }
        const updatedValues = {};
        // Check each field in req.body and update if present
        if (req.body.Eventname) updatedValues.Eventname = req.body.Eventname;
        if (req.body.EventSpeakers) updatedValues.EventSpeakers = req.body.EventSpeakers;
        if (req.body.EventDate) updatedValues.EventDate = req.body.EventDate;
        if (req.body.EventTime) updatedValues.EventTime = req.body.EventTime;
        if (req.body.EventisActive) updatedValues.EventisActive = req.body.EventisActive;
        if (req.body.twitter) updatedValues.twitter = req.body.twitter;
        if (req.body.instagram) updatedValues.instagram = req.body.instagram;
        if (req.body.linkdin) updatedValues.linkdin = req.body.linkdin;
        if (req.body.github) updatedValues.github = req.body.github;
        if (req.body.EventImage) updatedValues.EventImage = req.body.EventImage;
        if (req.body.joditcontent) updatedValues.joditcontent = req.body.joditcontent;
        if (req.body.RegisteredUsers) updatedValues.RegisteredUsers = req.body.RegisteredUsers;

        const updatedevent = await Event.findOneAndUpdate({ Eventid: id }, updatedValues, { new: true });

        console.log("Updated Event:", updatedevent);
        res.status(200).send({ Status: "successful", data: updatedevent });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ Status: "error", data: error.message });
    }
});

const regusers = mongoose.model("userform");

app.post("/event/del",async (req,res)=>{
    const a = req.body.Eventid;
    if(a){
        const c=await Event.find({Eventid:a})
        if(c){
            const f= await regusers.deleteMany({Event:c});
        const b = await Event.deleteOne({Eventid:a});
        console.log(b)
        res.status(200).send({data:"Event deleted sucessfully"});
        }
        else{
            res.status(500).send({error:"please enter the valid id"});
        }
    }
    else{
        res.status(500).send({error:"enter the id first"});
    }
})


// -----------------------useform--------------

// register event

app.post("/register/event", async (req, res) => {
  try {
    const eve = req.body.Eventid;
    if (eve) {
      const abcd = await Event.findOne({ Eventid: eve });

      if (abcd) {
        const data = {
          id: req.body.id,
          Event: abcd._id,
          name: req.body.name,
          email: req.body.email,
        };

        const reg = regusers.create(data) 
        .then(result => {
            console.log("User registered successfully:", result);
            // res.send({ Status: "ok", data: data });
             })
        .catch(error => {
            console.error("Error registering user:", error);
            res.send({ Status: "error", data: error.message });
            });
            // const getdata = regusers.findById(reg._id)
            const s = abcd.RegisteredUsers+1;
        console.log(s);
        const eventstatus = await Event.updateOne({Eventid:eve},{RegisteredUsers:s})
        // Send confirmation email

        await sendConfirmationEmail(data);

        // Additional processing or saving to the database can be done here

        res.status(200).json({ message: "Registration successful" });
      } else {
        res.status(404).json({ message: "Event not found" });
      }
    } else {
      res.status(400).json({ message: "Invalid request" });
    }
  } catch (error) {
    console.error("Error registering:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



async function sendConfirmationEmail(data) {
   
    const mailOptions = {
      from: process.env.email, // replace with your email
      to: data.email,
      subject: "Registration Confirmation",
      text: `Dear ${data.name},
  
  Thank you for registering for the event "${data.Event.Eventname}".
  
  Event Details:
  - Event Name: ${data.Event.Eventname}
  - Event Date: ${data.Event.EventDate}
  - Event Venu : ${data.Event.Eventvenue}
  - Event Location: KL University
  
  We look forward to seeing you at the event!
  
  Best Regards,
  Your Organization`,
    };
    await transporter.sendMail(mailOptions);
  }


app.get("/register/get",async (req,res)=>{
    try{
        if(req.body.Eventid){
            
            const event = await Event.findOne({ Eventid: req.body.Eventid });
            console.log(event)

            // console.log(Event.findOne({Eventid:event._id}));
            if(event){
                const x = await regusers.find({Event:event._id});
                console.log(x);
                res.send({users:x});
            }
        }
    }catch(error){
        res.send({error:error});
    }
})
// ----------- subscribe -----------


app.post("/subscribers/subscribe",async (req,res)=>{
    if(req.body.email){
        subscribers.create({email:req.body.email})
        .then(result => {
            console.log("you subscribed successfully:", result);
            // res.send({ Status: "ok", data: data });
            res.send({data:"you have sucessfully subscribed our newsletter"})
             })
        .catch(error => {
            console.error("Error registering user:", error);
            res.send({error: error.message });
        });
        
            const mailOptions = {
                from: process.env.email, // replace with your email
                    to: req.body.email,
                    subject: "Congratulations for Subscribing our NewsLetter",
                    text: `Dear ${req.body.email},
  
  Thank you for subscribing our newsletter".
  
  
  We look forward to seeing you at the event!
  
  Best Regards,
  Broadband Club`,
    };
    await transporter.sendMail(mailOptions);
    }
    else{
        res.status(500).send({error :"enter the email to subscribe"});
    }
})