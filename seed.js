const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Problem = require('./Model/ProblemModel'); // import your schema



dotenv.config();

// const data = fs.readFileSync("../problems_set/leetcode-problems/merged_problems.json", "utf-8");
// console.log(typeof data)
// const problems = JSON.parse(data);
// console.log(problems)

const run = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(`mongodb+srv://${process.env.DB}:${process.env.PASS}@clusterone.0khaeh6.mongodb.net/?retryWrites=true&w=majority&appName=ClusterOne`);
    console.log("Connected to DB");

    // Read JSON file
    const data = fs.readFileSync("../problems_set/leetcode-problems/merged_problems.json", "utf-8");
    console.log(typeof data)
    const problems = JSON.parse(data);

    for (const p of problems) {
      await Problem.updateOne(
        { problem_slug: p.problem_slug }, // match by unique slug
        { $set: p },
        { upsert: true }
      );

    }

    console.log("Problems seeded successfully!");
    await mongoose.disconnect();
    console.log("Disconnected from DB");
  } catch (err) {
    console.error(err);
  }
};

run();
