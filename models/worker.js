const mongoose=require("mongoose");
const schema=mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const workerschema=new schema({
    aadhar:{  type: Number,
        required: true,
        unique: true,
        min: 100000000000, // Aadhar is 12 digits
        max: 999999999999,},
    phone:{
        type: Number,
        required: true,
    },
    gender:{
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other'], // Drop-down options
    },
    email:String,
    address:String,
    dob:{
        type: Date,
        required: true,
        validate: {
            validator: (value) => value < new Date(),
            message: 'Date of birth cannot be in the future',
        },
    },
});
workerschema.plugin(passportLocalMongoose);
const worker=mongoose.model("worker",workerschema);
module.exports=worker;