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

const languageMap = {
  javascript: 63,
  python: 71,
  cpp: 54
};




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

    const problems = await Problem.find();
    res.json(problems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/all-problem/:slug", async (req, res) => {

  try {
    const slug = req.params.slug
    console.log(slug)
    const particularProblem = await Problem.findOne({ problem_slug: slug })
    res.status(200).send(particularProblem)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }

})


app.post("/submit-code", async (req, res) => {
  const { source_code, language_id, expected_output } = req.body
  console.log(language_id)

  console.log(Array.isArray(expected_output))

  const response = await axios.post("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
    {
      source_code,
      language_id,
    },

    {
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
      }
    }

  )


  let compiled_output = response.data.stdout

  if (typeof compiled_output === "string") {
    compiled_output = response.data.stdout.trim()
  }


  // console.log("compiled", compiled_output)
  // console.log("expected", expected_output)

  let resultDescription = ''

  if (expected_output.includes(compiled_output)) {


    resultDescription = "Accepted"
  } else {
    resultDescription = "Rejected"
  }



  res.status(200).json({ resultDescription })

})


app.patch("/update-point", async (req, res) => {
  try {

    const { resultStatus, clerkId } = req.body;

    // Determine the increment value
    const incrementValue = resultStatus === "Accepted" ? 10 : -10;

    // Update totalPoint using $inc
    const updatedUser = await User.findOneAndUpdate(
      { clerkId: clerkId },           // filter by clerkId
      { $inc: { totalPoint: incrementValue } },
      { new: true }                   // return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Points updated", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Leaderboard route
app.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find().sort({ totalPoint: -1 }); // highest points first
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching leaderboard" });
  }
});



// app.post('/register',)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


