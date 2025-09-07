const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String },
    solvedProblems: { type: [String], default: [] }, 
    role: { type: String, default: "user" },
    totalPoint:{type:Number,default:0}
}) 

module.exports = mongoose.model('User', userSchema);