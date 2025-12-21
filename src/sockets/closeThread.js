const { catchAsyncSocket } = require("../utils/errors/catchAsyncSocket");

exports.CloseThread = (socket, redisClient) => {
    
    // Remove active viewers when the are leaveing in in-memory db: Redis => tracking who left from the active threads
    socket.on('close-thread', catchAsyncSocket(socket, async ({ userId, roomId }) => {

        await redisClient.lRem(`thread:${roomId?.toString()}`, 0, userId?.toString());

    }));
}