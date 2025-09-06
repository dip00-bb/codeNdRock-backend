const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors')
const User = require('./Model/UserModel')
const Problem = require('./Model/ProblemModel')
const axios = require('axios')
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors())

// Connect to MongoDB
mongoose.connect(`mongodb+srv://${process.env.DB}:${process.env.PASS}@clusterone.0khaeh6.mongodb.net/?retryWrites=true&w=majority&appName=ClusterOne`)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));


app.get('/', (req, res) => {
  res.send('Hello from Express with Mongoose!');
});

app.post('/add-user', async (req, res) => {

  try {
    const { clerkId, email, name } = req.body;
    console.log(clerkId, email, name)
    const user = await User.findOneAndUpdate(
      { clerkId },
      { email, name },
      { new: true, upsert: true }
    );

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
})


app.get("/all-problems", async (req, res) => {
  try {

    const problems = await Problem.find().sort({ frontend_id: 1 });
    res.json(problems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/all-problem/:slug", async (req, res) => {

  try {
    const slug=req.params.slug
    console.log(slug)
    const particularProblem=await Problem.findOne({problem_slug:slug})
    console.log(particularProblem)
    res.status(200).send(particularProblem)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
  
})


app.post("/submit-code", async (req, res) => {
  const { source_code, language_id, stdin } = req.body;
  console.log(source_code, language_id, stdin)
  try {
    // Call Judge0 API
    const response = await axios.post(
      "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
      {
        source_code,
        language_id,
        stdin
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        },
      }
    );

    // Return Judge0 result back to frontend
    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error calling Judge0 API" });
  }
});


// app.post('/register',)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));