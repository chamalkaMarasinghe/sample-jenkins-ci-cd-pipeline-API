const { catchAsyncSocket } = require("../utils/errors/catchAsyncSocket");
const { verifyTokenUtility } = require("../utils/tokens/verifyTokenUtility");

exports.openThread = (socket, redisClient) => {

    // Store active viewers per thread in in-memory db: Redis => tracking what is the active threads and who are the users those open the thread at meantime
    socket.on('open-thread', catchAsyncSocket(socket, async ({ userId, roomId }) => {

        await verifyTokenUtility({token: socket.authToken});        
    
        const activeUsers = await redisClient.lRange(`thread:${roomId.toString()}`, 0, -1);
    
        if(activeUsers?.length <= 0 || activeUsers?.filter((userid) => userId?.toString() === userid?.toString()).length <= 0){
            await redisClient.rPush(`thread:${roomId?.toString()}`, userId?.toString());
        }
        
    }));
}