const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    username: { type: String },
    solvedProblems: { type: [String], default: [] }, // problem IDs
    role: { type: String, default: "user" },
}) 

export default mongoose.model("User", userSchema);