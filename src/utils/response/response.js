const handleResponse = (res, status, message, data, error) => {
    res.status(status).json({
        status,
        message,
        data,
        error,
    });
};

module.exports = handleResponse;
