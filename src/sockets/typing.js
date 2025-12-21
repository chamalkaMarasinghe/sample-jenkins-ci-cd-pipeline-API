const { catchAsyncSocket } = require("../utils/errors/catchAsyncSocket");

exports.typing = (socket) => {
    
    // Listen for typing event
    socket.on('typing', catchAsyncSocket(socket, ({ roomId, userId }) => {
        socket.to(roomId).emit('userTyping', { roomId, userId });
    }));

}