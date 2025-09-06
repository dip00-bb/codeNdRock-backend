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

    const problems = await Problem.find().sort({ frontend_id: 1 });
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
    console.log(particularProblem)
    res.status(200).send(particularProblem)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }

})


// app.post("/submit-code", async (req, res) => {
//   const { source_code, language_id, slug } = req.body;
//   console.log(source_code, language_id, slug)
//   try {
//     // Call Judge0 API

//     const problems = await Problem.findOne({ problem_slug: slug })
//     const exampleText = problems.examples[0].example_text
//     const inputMatch = exampleText
//       .match(/Input:\s*(.*)\n/)[1]
//       .trim();

//     const outputMatch = exampleText
//       .match(/Output:\s*(.*)/)[1]
//       .trim();



//     // const response = await axios.post(
//     //   "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
//     //   {
//     //     source_code,
//     //     language_id,
//     //     stdin:input,
//     //   },
//     //   {
//     //     headers: {
//     //       "Content-Type": "application/json",
//     //       "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
//     //       "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
//     //     },
//     //   }
//     // );

//     // Return Judge0 result back to frontend


//     console.log(response.data)

//     res.json(response.data);

//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ error: "Error calling Judge0 API" });
//   }
// });




// // Map frontend language to Judge0 language_id


// app.post("/submit-code", async (req, res) => {
//   try {
//     const { problem_slug, language, code } = req.body;

//     // 1. Get problem from DB
//     const problem = await Problem.findOne({ problem_slug });
//     if (!problem) {
//       return res.status(404).json({ error: "Problem not found" });
//     }

//     // 2. Validate language
//     const langId = languageMap[language];
//     if (!langId) {
//       return res.status(400).json({ error: "Unsupported language" });
//     }

//     // 3. Run all examples
//     const results = [];
//     for (let example of problem.examples) {
//       const input = example.example_text
//         .match(/Input:\s*(.*)\n/)[1] // quick way to extract input
//         .trim();
//       const expected = example.example_text
//         .match(/Output:\s*(.*)/)[1] // extract expected output
//         .trim();

//       // 4. Call Judge0
//       const submission = await axios.post(
//         "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
//         {
//           source_code: code,
//           language_id: langId,
//           stdin: input,
//         },
//         {
//           headers: {
//             "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
//             "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const output = submission.data.stdout?.trim();

//       // 5. Compare output
//       const passed = output === expected;
//       results.push({
//         input,
//         expected,
//         output,
//         passed,
//       });
//     }

//     // 6. Check if all test cases passed
//     const allPassed = results.every(r => r.passed);

//     res.json({
//       status: allPassed ? "Accepted" : "Wrong Answer",
//       results,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// });



app.post("/submit-code", async (req, res) => {
  const { source_code, language_id, slug } = req.body;

  try {
    // 1. Get problem from DB
    const problem = await Problem.findOne({ problem_slug: slug });
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    // 2. Get examples (test cases)
    const examples = problem.examples;

    // Store results for each test case
    const results = [];

    // 3. Loop through each example
    for (const example of examples) {
      // Parse input + expected from your DB
      const inputMatch = example.example_text.match(/Input:\s*(.*)\n/);
      const outputMatch = example.example_text.match(/Output:\s*(.*)/);

      const input = inputMatch ? inputMatch[1].trim() : "";
      const expected = outputMatch ? outputMatch[1].trim() : "";

      // Example: "nums = [2,7,11,15], target = 9"
      // You’ll need to parse it properly for your function call
      // For simplicity, we’ll hardcode to JS format here:
      let testHarness = "";
      if (language_id === 63) {
        // 63 = JavaScript
        testHarness = `
${source_code}const input = ${input.replace("nums =", "").replace("target =", "")};

console.log(JSON.stringify(twoSum([2,7,11,15], 9)));
        `;
      } else {
        // TODO: handle Python, C++, etc
        testHarness = source_code;
      }

      // 4. Call Judge0
      const response = await axios.post(
        "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
        {
          source_code: testHarness,
          language_id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          },
        }
      );

      const stdout = response.data.stdout ? response.data.stdout.trim() : null;

      // 5. Compare with expected
      const isCorrect = stdout === expected;

      results.push({
        example_num: example.example_num,
        input,
        expected,
        got: stdout,
        status: isCorrect ? "Accepted" : "Wrong Answer",
      });
    }

    // 6. Final verdict
    const allPassed = results.every(r => r.status === "Accepted");

    res.json({
      verdict: allPassed ? "Accepted" : "Wrong Answer",
      results,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error running submission" });
  }
});


// app.post('/register',)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));