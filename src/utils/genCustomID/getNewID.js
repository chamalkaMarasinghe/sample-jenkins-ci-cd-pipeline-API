const DocumentCounter = require("../../models/documentCounter");

exports.getNewID = async (schema) => {

    const documentCount = await DocumentCounter.findOneAndUpdate(
        {collection: schema}, 
        {$inc: {count: 1}},
        {new: true, returnNewDocument : true }
    );
    
    let generatedId = null;
    if(documentCount){
        generatedId = Number(documentCount?.count);        
    }
    return generatedId ? `ID${generatedId}` : null;
};

