//for globally catch the errors/exceptions -> needs to wrap child function inside this function
const { DEFAULT_ERROR } = require("../../constants/errorCodes");

const catchAsyncSocket = (socket, fn) => {
    return async (parameters, ...args) => {
        try {
            await fn(parameters, ...args);
        } catch (err) {
            console.log(err);
            
            let errMessage = DEFAULT_ERROR.message;

            if(err?.cause === "logical"){
                errMessage = err.message
            }

            console.error(`Socket error: ${err.message}`);
            
            socket.emit("error", {
                message: `${errMessage}`,
            });
        }
    };
};

module.exports = { catchAsyncSocket };
