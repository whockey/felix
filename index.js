var bodyParser = require('body-parser'),
    CronJob = require('cron').CronJob,
    express = require('express'),
    nodemailer = require('nodemailer'),
    twilio = require('twilio'),
    _ = require('underscore');

var config = require('./config'),
    users = require('./users');

var app = express();
    app.use(bodyParser());
    app.use(app.router);

// Settings or twilio clinet
// Account SID and Auth Token are stored as enviromental variables
// so they don't get checked into code
var client = twilio(config.twilio.auth_token, config.twilio.sid);

// Settings for the email client
// Gmail settings are stored in environment variables
// so they don't get checked into code
var smtpTransport = nodemailer.createTransport('SMTP',{
  service: 'Gmail',
  auth: {
    user: config.email.user,
    pass: config.email.password
  }
});


function sendEmail(destination, body) {
  // This would returns todays Month, appends a / and then appends the date
  // Output would be 5/22
  var structured_date = new Date().getMonth() + '/' + new Date().getDate();

  var mailOptions = {
    from: 'Daily Notes <lombard@computingclub.com>',
    to: destination,
    subject: 'Notes for ' + structured_date,
    text: body, // plaintext body
  };

  // send mail with defined transport object
  smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
      console.error(error);
    }else{
      console.log('Message sent: ' + response.message);
    }
  });
}


app.post('/message', function(req, res){
  var user = _.findWhere(users, {
    phone_number: req.phone
  });
  if (!user) {
    res.json({success: false, message: 'User not found'});
  } else {
    user.messages.push(res.body);
    res.json({success: true});
  }
});

app.post('./user', function(req, res){
  users.push(req.body);
  createCron(req.body);
  res.json({success: true, message: 'User was created successfully.' +
    ' Let\'s hope its in the right format!'});
});

app.listen(3000);
//On startup create a cron job for each new user
users.forEach(createCron);

function createCron(user) {
  new CronJob(user.cron, function () {
    sendEmail(user.messages);
  }, null, true);
}
