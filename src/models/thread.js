const mongoose = require("mongoose");
const commonConstants = require("../constants/commonConstants");

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // offer: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "Offer",
        // },
        content: {
            type: String,
            required: false,
            trim: true
        },
        attachments: {
            type: [String],
            required: false,
        },
        iv: { 
            type: String, 
            required: false 
        },
        // messageTye: {
        //     type: String,
        //     required: true,
        //     default: commonConstants.messageTypes.TEXT,
        //     enum: Object.values(commonConstants.messageTypes)
        // }
    },
    { timestamps: true }
);

const threadSchema = new mongoose.Schema(
    {
        roomId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        serviceprovider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Serviceprovider",
            required: true,
        },
        messages: {
            type: [messageSchema],
            required: false,
        },
        lastMessage: {
            type: messageSchema,
            required: false,
        },
        threadStatus: {
            type: String,
            enum: [commonConstants.threadStatus.ACTIVE, commonConstants.threadStatus.INACTIVE],
            required: true,
            default: commonConstants.threadStatus.ACTIVE,
            trim: true
        },
        lastRead: {
            type: [
                {
                    userId: mongoose.Schema.Types.ObjectId,
                    lastReadTimestamp: Date,
                    unreadCount: Number,
                }
            ],
            required: true,
        }
    },
    { timestamps: true }
);

const Thread = new mongoose.model("Thread", threadSchema);
module.exports = { Thread, messageSchema };