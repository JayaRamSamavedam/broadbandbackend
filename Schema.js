const mongoose = require("mongoose");
const number = require("mongoose/lib/cast/number");

const Schema = new mongoose.Schema(
    {
        id:Number,
        name:String,
        role:String,
        instagram:String,
        linkdin:String,
        github:String,
        image:String,
    },
    {
        collection:"Team Details",
    }

);


const Otp = new mongoose.Schema(
    {
        otp:String,
    },
    {
        collection:"Otp",
    }
)
const otp = mongoose.model("Otp",Otp);
module.exports=otp;



const UserForm = new mongoose.Schema(
    {
        id:Number,
        Event:{type: mongoose.Schema.Types.ObjectId, ref: 'event'},
        name:String,
        email:String
    },
    {
        collection:"userform"
    }
)

const userform = mongoose.model("userform",UserForm);
module.exports = userform;


const Event = new mongoose.Schema(
    {
        Eventid:Number,
        Eventname:String,
        EventSpeakers:String,
        EventDate:String,
        EventTime:String,
        EventImage:String,
        EventisActive:Boolean,
        twitter:String,
        instagram:String,
        linkdin:String,
        Eventvenue:String,
        RegisteredUsers:Number,
        joditcontent:String,
    },
    {
        collection:"Event"
    }
)


const Subscribers = new mongoose.Schema(
    {
        email:{type:String,unique:true}
    },
    {
        collection:"subscribers"
    }
    
)

const subscribers = mongoose.model("subscibers",Subscribers);
const team = mongoose.model("Team",Schema);
const event =mongoose.model("event",Event);
module.exports = team,subscribers,event;
