const nodemailer = require("nodemailer");
const currentEnvironment = require("./environmentConfig");
const { environmentTypes } = require("../constants/commonConstants");
const MAIL_USERNAME = currentEnvironment.MAIL_USERNAME;
const MAIL_PASSWORD = currentEnvironment.MAIL_PASSWORD;
const MAIL_HOST = currentEnvironment.MAIL_HOST;
const MAIL_PORT = currentEnvironment.MAIL_PORT;
const CURRENT_ENV = currentEnvironment.NAME;

exports.transporter = CURRENT_ENV === environmentTypes.PROD ?  nodemailer.createTransport({
  host: MAIL_HOST,
  port: MAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: MAIL_USERNAME,
    pass: MAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
}) :
nodemailer.createTransport({
  service: MAIL_HOST,
  port: MAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: MAIL_USERNAME,
    pass: MAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});


