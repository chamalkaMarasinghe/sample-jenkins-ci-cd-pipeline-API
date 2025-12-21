const fs = require('fs');
const { promisify } = require('util');
const { transporter } = require("../../config/nodeMailer");
const { emailSenderNickName, emailSendingActionTypes, minutesTakenToExpireTheForgotPasswordToken } = require("../../constants/commonConstants");
const { EmailSendingError } = require('../errors/CustomErrors');
// const { FAILURES } = require("../constants/errorMessages");
// const AppError = require("./AppError");

const currentEnvironment = require("../../config/environmentConfig");
const sender_email = currentEnvironment.MAIL_USERNAME;

const readFileAsync = promisify(fs.readFile);

const sendMail = async (to, subject, data, type = null, html, from = null) => {

  try {

    if (!to || !subject  /*|| !html*/) {
      throw new EmailSendingError();
    }

    if (!from) {
      from = `${emailSenderNickName}<${sender_email}>`;
    }

    // Read the HTML template and image file
    const htmlTemplate = await readFileAsync('./assets/emailTemplate/mailtemp.html', 'utf-8');

    // Replace placeholders of the email template with dynamic values
    const filledHtml = htmlTemplate
        .replace('{{topic}}', data?.topic || '')
        .replace('{{content}}',
            type === emailSendingActionTypes.RESET_PASSWORD ?
                `We received a request to reset your password. Click the link below to proceed: <a href="${data?.content}" style="color: #0020BD;">Reset Password</a>. This link is valid for ${minutesTakenToExpireTheForgotPasswordToken} minutes. If you didn't request this, you can ignore this email.`
                : type === emailSendingActionTypes.CONTACT_FORM ?
                    data?.content || ''
                    : data?.content || '');
    
    mailOptions = {
      from: from,
      to,
      subject,
      html: filledHtml,
      // text,
      //html
    };

    const info = await transporter.sendMail(mailOptions);

    if (!info) throw new EmailSendingError();

    return info?.response;

  } catch (error) {
    console.log(error);
    throw new EmailSendingError();
  }
};

module.exports = sendMail;