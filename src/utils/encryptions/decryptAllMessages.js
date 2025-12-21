const { messageTypes } = require("../../constants/commonConstants");
const {decryptMessage} = require("./encryptAndDecryptMessages");

exports.decryptAllMessages = (arrayOfMessages = []) => {
    
    if(arrayOfMessages === null || arrayOfMessages === undefined || (!Array.isArray(arrayOfMessages) && arrayOfMessages["content"] === undefined)){
        return {};
    }

    if(Array.isArray(arrayOfMessages)){        
        return arrayOfMessages?.map((msg) => {
            // if(msg?.messageTye === messageTypes.TEXT){
                return {
                    ...JSON.parse(JSON.stringify(msg)), // creating a deep copy of msg object
                    content: decryptMessage(msg?.content, msg?.iv),
                    iv: null
                }
            // }
            // return msg;
        });
    }else{//if the arrayOfMessages is an object instead of an array        
        // if(arrayOfMessages?.messageTye === messageTypes.TEXT){
            return {
                ...JSON.parse(JSON.stringify(arrayOfMessages)),
                content: decryptMessage(arrayOfMessages?.content, arrayOfMessages?.iv),
                iv: null
            }
        // }
        // return arrayOfMessages;
    }

}