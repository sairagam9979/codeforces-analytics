const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true,
        unique:true
    },

    password:{
        type:String,
        required:true
    },

    codeforcesHandle:{
        type:String
    },

    friends:[
        {
            type:String,
            trim:true,
            lowercase:true
        }
    ]
},
{
    timestamps:true
});

module.exports = mongoose.model("User", userSchema);