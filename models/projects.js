const mongoose=require("mongoose");
const schema=mongoose.Schema;
const projectschema=new schema({
    projectName: {
        type: String,
        required: true,
        trim: true,
    },
    startdate: {
        type: Date,
        required: true,
    },
    enddate: {
        type: Date,
        required: true,
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    supervisor: {
        type: String,
        required: true,
        trim: true,
    },
    numberofworkers: {
        type: Number,
        min: 1, // At least 1 worker is required
    },
    payperday:Number,
    status: {
        type: String,
    },
});
const project=mongoose.model("project",projectschema);
module.exports=project;