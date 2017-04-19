const Promise = require('bluebird');
const Notifications = require('../../db/Notifications/Notifications.js');
const { sendNotifications } = require('../Firebase/Firebase.js');
const phone = require('phone');

exports.addSubscriptionToTable = (req, res) => {
  Notifications.findOrCreate({where: {pubId: req.user.id, subToken: req.friend.FCMToken}})
  .then(() => {
    res.status(200).json({status: 'Subscription created.'});
  })
  .then(() => {
    exports.checkSubscriptions(1, 'Elsewhere', 'Home');
  })
  .catch((err) => {
    res.status(500);
    if (res.error) {
      res.json();
    } else {
      res.error = err;
      res.json();
    }
  })
};

exports.checkSubscriptions = (userId, oldLabel, newLabel) => {
  if (oldLabel === 'Home' || newLabel !== 'Home') { return; }
  if (newLabel === 'Home') {
    Notifications.find({where: {pubId: userId}})
    .then((subs) => {
      console.log(subs);
    })
    .catch((err) => {
      console.log(err);
    })
  }
}
