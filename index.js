    const express = require('express');
    const mongoose = require('mongoose');
    const dotenv = require('dotenv');

    dotenv.config(); 

    const app = express();
    app.use(express.json()); 

    // Connect to MongoDB
    mongoose.connect(`mongodb+srv://${process.env.DB}:${process.env.PASS}@clusterone.0khaeh6.mongodb.net/?retryWrites=true&w=majority&appName=ClusterOne`)
        .then(() => console.log('MongoDB connected successfully!'))
        .catch(err => console.error('MongoDB connection error:', err));

 
    app.get('/', (req, res) => {
        res.send('Hello from Express with Mongoose!');
    });


    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));