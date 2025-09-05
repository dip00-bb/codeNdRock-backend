const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors')
const User = require('./Model/UserModel')


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
        console.log(clerkId,email,name)
        const user = await User.findOneAndUpdate (
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

// app.post('/register',)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));