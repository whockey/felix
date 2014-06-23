var nodemailer = require("nodemailer"),
    twilio = require('twilio');

// Settings for the email client
// Gmail settings are stored in environment variables
// so they don't get checked into code
var smtpTransport = nodemailer.createTransport("SMTP",{
  service: "Gmail",
  auth: {
      user: process.env.gmailUsername,
      pass: process.env.gmailPassword
  }
});

// Settings or twilio clinet
// Account SID and Auth Token are stored as enviromental variables
// so they don't get checked into code
var client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);



function sendEmail(emailBody) {
  // This would returns todays Month, appends a / and then appends the date
  // Output would be 5/22
  var structured_date = new Date().getMonth() + '/' + new Date().getDate();

  var mailOptions = {
    from: "Daily Notes <lombard@computingclub.com>",
    to: "William Hockey, williamrhockey@gmail.com",
    subject: "Notes for " + structured_date,
    text: emailBody, // plaintext body
  };

  // send mail with defined transport object
  smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
        console.log(error);
    }else{
        console.log("Message sent: " + response.message);
    }
  });
}


function sendText(textBody) {
  client.sendMessage({

      to:'+16515556677',
      from: '+14506667788',
      body: textBody

  }, function(error, response) {
      if (!error) {
        console.log(error);
      } else {
        console.log(response.from);
        console.log(response.body);
      }
  });
}
