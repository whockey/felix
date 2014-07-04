var bodyParser = require('body-parser'),
    CronJob = require('cron').CronJob,
    express = require('express'),
    nodemailer = require('nodemailer'),
    twilio = require('twilio'),
    _ = require('underscore');

var config = require('./config'),
    users = require('./users');

var app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded());

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
    user: config.gmail.username,
    pass: config.gmail.password
  }
});


function sendEmail(destination, body) {
  console.log("Sending to %s", destination);
  console.log(body);
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

app.get('/', function (req, res) {
  res.send('This is Felix');
});

app.post('/message', function(req, res){
  var user = _.findWhere(users, {
    phone_number: req.body.From
  });
  if (!user) {
    res.json({success: false, message: 'User not found'});
  } else {
    user.messages.push(req.body.Body);
    console.log("Succesful push for %s to %s", user.email, req.body.Body);
    res.json({success: true});
  }
});

app.post('./user', function(req, res){
  users.push(req.body);
  createCron(req.body);
  res.json({success: true, message: 'User was created successfully.' +
    ' Let\'s hope its in the right format!'});
});

app.listen(3000, function () {
  console.log("Hello world this is Felix.");
});
//On startup create a cron job for each new user
users.forEach(createCron);

function createCron(user) {
  new CronJob(user.cron, function () {
    if (!_.isEmpty(user.messages)) {
      sendEmail(user.email, format(user));
    }
  }, null, true);
}


function format(user) {
  var body = 'Hi ' + user.first_name + ', here are your todo items! \n\n';
  user.messages.forEach(function(message){
    body+='[] - '+ message +' \n'
  });
  return body;
}
