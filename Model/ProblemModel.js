const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: [String], required: true }
}, { _id: false });


const functionTemplateSchema = new mongoose.Schema({
  python: { type: String, required: true },
  javascript: { type: String, required: true },
  cpp: { type: String, required: true },
},{_id:false})

const problemSchema = new mongoose.Schema({
  problem_slug: { type: String, required: true, unique: true }, // unique identifier
  title: { type: String, required: true },
  difficulty_level: { type: String, required: true },
  topic: { type: String, required: true },
  description: { type: String, required: true },
  input: { type: String, required: true },
  output: { type: String, required: true },
  example: { type: exampleSchema, required: true },
  hints: { type: [String], default: [] },
  function_template: { type: functionTemplateSchema, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);

