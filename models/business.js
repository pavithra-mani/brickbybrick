const mongoose=require("mongoose");
const schema=mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const businesschema=new schema({
    email:String,
    registrationId: {
        type: String,
        required: true,
    },
    permitNumber: {
        type: String,
        required: true,
    }
});
businesschema.plugin(passportLocalMongoose);
const business=mongoose.model("business",businesschema);
module.exports=business;