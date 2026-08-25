const mongoose = require("mongoose");
const profileSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    rating:Number,
    maxRating:Number,
    rank:String,

    contestCount:Number,

    solvedProblems:Number,

    topicStats:{
        type:Map,
        of:Number
    }

},
{
    timestamps:true
});

module.exports = mongoose.model("Profile", profileSchema);