import express from "express";
import axios from "axios";
import Problem from "../models/Problem.js"; // your Problem schema

const router = express.Router();

router.post("/submit-code", async (req, res) => {
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

export default router;
