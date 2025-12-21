const { catchAsyncSocket } = require("../utils/errors/catchAsyncSocket");
const mongoose = require("mongoose");
const User = require("../models/user.js");
// const Writer = require("../models/writer.js");
// const {Thread} = require("../models/thread.js");
const { getThreadsStages } = require("../queries/thread.js");
const { roles, threadStatus } = require("../constants/commonConstants.js");
const { verifyTokenUtility } = require("../utils/tokens/verifyTokenUtility.js");

exports.joinRoom = (socket) => {

    // NOTE: Join a socket to a room joinRoomResponse
    socket.on('join-room', catchAsyncSocket(socket, async ({ userId }) => {
        
        await verifyTokenUtility({token: socket.authToken});
    
        if(!mongoose.isValidObjectId(userId)){
            throw new Error("Invalid User ID", {cause: "logical"});
        }
        
        const {baseStage} = getThreadsStages(new mongoose.Types.ObjectId(userId));

        const threads = await Thread.aggregate(baseStage)

        // NOTE: join for all associated threads
        threads.forEach(thread => {            
            if(thread.threadStatus === threadStatus.ACTIVE){                
                socket.join(thread._id.toString());
            }
        });

        // NOTE: emiting a success message if all joins get successfully
        socket.emit("joinRoomResponse", {status: "success", message: "Rooms Joined Successfully"})
    }));
}