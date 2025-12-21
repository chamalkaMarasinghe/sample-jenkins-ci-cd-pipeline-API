const sendMail = require("../email/sendEmail");

exports.sendNotifications = ({
    isSendingEmail = true,
    emailOptions = null
}) => {

    // NOTE: sending the email as a part of the notification  
    if(isSendingEmail && emailOptions){
        sendMail(
            emailOptions?.email,
            emailOptions?.subject,
            {
                topic: emailOptions?.topic,
                content: emailOptions?.content
            }
        )
    }

}