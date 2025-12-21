const mongoose = require("mongoose");
const currentEnvironment = require('./environmentConfig')
const DB_URI = currentEnvironment.DB_URI;

const connectDB = async() => {    
    let connectionInstance;
    try {
        connectionInstance = await mongoose.connect(
            DB_URI,
            {
                useUnifiedTopology: true,
                useNewUrlParser: true,
            }

        ).then(async() => {
            console.log(`connection to Database established`);
        })
    } catch (error) {
        console.error("Error connecting to database:", error.message);
        process.exit(1); 
    }
    return connectionInstance;
};

module.exports = connectDB;