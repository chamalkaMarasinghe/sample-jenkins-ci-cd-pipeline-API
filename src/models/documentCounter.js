const mongoose = require("mongoose");

const documentCounterSchema = new mongoose.Schema(
    {
        collection:{
            type: String,
            required:true,
            unique : true,
            trim: true
        },
        count: {
            type: Number,
            required: true,
            default: 1000,
        },
        
    },
    {timestamps: true }
)

const DocumentCounter = new mongoose.model("DocumentCounter", documentCounterSchema);
module.exports = DocumentCounter;