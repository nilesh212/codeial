const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const env = require("./environment");
// THis is the part where emails are sent to the user
// This is the key which has the account of user who is sending the emails to the user
// REMEMBER in auth:{ pass:xyxcxvxj} and NOT auth:{password:cljsdfj};
// *******Invalid login: 535-5.7.8 Username and Password not accepted.***
// If you are getting above error then please check "less secure app access of your gmail account"
let transporter = nodemailer.createTransport(env.smtp);

// This part renders the template to given path i.e. ../views/mailer
let renderTemplate = (data, relativePath) => {
  let mainHTML;
  ejs.renderFile(
    path.join(__dirname, "../views/mailers", relativePath),
    data,
    function (err, template) {
      if (err) {
        console.log("error in rendering template");
        return;
      }
      mainHTML = template;
    }
  );
  return mainHTML;
};

module.exports = {
  transporter: transporter,
  renderTemplate: renderTemplate,
};
