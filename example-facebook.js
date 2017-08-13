// load the cashbot.ai library
var Cashbot = require('cashbot');

// initialize the cashbot client
var cashbot = Cashbot.init('API_KEY');
cashbot.setConfig({ debug: true });

// get cashbot.ai recommendations for user with a promise
// in the form of a Facebook carousel widget
// using a callback function
cashbot.facebook.getCarousel('TEST_USER', { n: 3, label: 'Take a Look' }, function(err, res) {
  console.log('err: ', err);
  // returns a formatted message body
  console.log('res: ', res);
});

// get cashbot.ai recommendations for a user
// in the form of a Facebook carousel widget
// using promises
cashbot.facebook.getCarousel('TEST_USER')
  .then(function(res) {
    // returns a formatted message body
    console.log(res);
  })
  .catch(function(err) {
    console.log(err);
  });

// register user input for improved recommendations
// from the Facebook webhook callback
// using a callback function
cashbot.facebook.sendUserInput('TEST_USER', { n: 1, recommend: true, webhook: { /*PUT WEBHOOK RAW CONTENTS HERE*/ } }, function(err, res) {
  console.log(err);
  console.log(res);
});

// register user input for improved recommendations
// from the webhook
// using promises
cashbot.facebook.sendUserInput('TEST_USER', { webhook: { /*PUT WEBHOOK RAW CONTENTS HERE*/ } })
  .then(function(res) {
    console.log(res);
  })
  .catch(function(err) {
    console.log(err);
  });
