const { catchAsyncSocket } = require("../utils/errors/catchAsyncSocket");

exports.stopTyping = (socket) => {
    
    // Listen for stopTyping event
    socket.on('stopTyping', catchAsyncSocket(socket, ({ roomId, userId }) => {
        socket.to(roomId).emit('userStoppedTyping', { roomId, userId });
    }));
    
}