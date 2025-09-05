const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema({
    example_num: Number,
    example_text: String,
    images: [String],
});

const problemSchema = new mongoose.Schema({
    problem_id: { type: String, unique: true },  // unique ID
    frontend_id: String,                         // UI ID
    title: String,                               // problem title
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
    problem_slug: String,                        // slug for URL (/problems/two-sum)
    topics: [String],                            // tags (Array, Hash Table, etc.)
    description: String,                         // full description text
    examples: [exampleSchema],                   // input/output examples
    constraints: [String],                       // input rules
    follow_ups: [String],                        // optional extra challenges
    hints: [String],                             // hint messages
    code_snippets: {                             // starter code for multiple langs
        cpp: String,
        java: String,
        python: String,
        python3: String,
        c: String,
        csharp: String,
        javascript: String,
        typescript: String,
        php: String,
        swift: String,
        kotlin: String,
        dart: String,
        golang: String,
        ruby: String,
        scala: String,
        rust: String,
        racket: String,
        erlang: String,
        elixir: String,
    },
    solution: String,                            // editorial explanation
});



module.exports = mongoose.model("Problem", problemSchema)
