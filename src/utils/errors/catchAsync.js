//for globally catch the errors/exceptions -> needs to wrap child function inside this function
const catchAsync = (fn) => {
    const errorHandler = (req, res, next) => {
        fn(req, res, next).catch(next);
    };

    return errorHandler;
};

module.exports = { catchAsync };


