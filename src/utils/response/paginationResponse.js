const paginationResponse = ({offset = 0, limit = 0, page = 0, size = 0, currentPage = 0, currentPageSize = 0, totalPages = 0, totalDocuments = 0}) => {
    return {
        offset: offset,
        limit: limit,
        // page: page,
        // pageSize: size,
        // currentPage: currentPage,
        // currentPageSize: currentPageSize,
        // totalPages: totalPages,
        totalDocuments: totalDocuments,
    };
};

module.exports = paginationResponse;
