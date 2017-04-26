const Promise = require('bluebird');
const Users = require('../../db/Users/Users.js');
const Contacts = require('../../db/Contacts/Contacts.js');
const Labels = require('../../db/Labels/Labels.js');
const { sendFriendRequest } = require('../Firebase/Firebase.js');
const phone = require('phone');

exports.addFriend = (req, res) => {
  Contacts.find({ where: {userId: req.user.id, friendId: req.friend.id} })
  .then((friendship) => {
    if (friendship !== null) {
      throw friendship;
    }
    return sendFriendRequest(req.user, req.friend.FCMToken);
  })
  .then((response) => {
    // TODO: only update the db after confirming that the notification has been sent (no errors)
    console.log('response after sending notification: ', response.successCount, (response.successCount === 1));
    return Contacts.bulkCreate([
      {userId: req.user.id, friendId: req.friend.id, privacy: 'pending'},
      {userId: req.friend.id, friendId: req.user.id, privacy: 'request'}
    ]);
  })
  .error((err) => {
    console.error('There was an error sending a friend request: ', err);
    res.status(500).send();
  })
  .catch((friendship) => {
    return friendship.update({privacy: 'label'}); //TODO: error handling
  }).then((updated) => {
    return Contacts.find({where: {userId: req.friend.id, friendId: req.user.id}});
  }).then((friendship) => {
    return friendship.update({privacy: 'label'});
  })
  .then((createdFriendship) => {
    res.status(201).send();
  })
  .error((err) => {
    console.log('There was an error in creating a mutual friendship: ', err);
    res.status(500).send();
  });
};

exports.getAllFriendData = (req, res, next) => {
  let query = {
    where: {
      userId: req.user.id
    }
  };
  if (req.query.groups === 'true') {
    query['where']['privacy'] = {$ne: 'pending'};
  }
  let showFriendPrivacy = [];
  let friendData = Contacts.findAll(query)
  .then((contactInst) => {
    return Promise.map(contactInst, (contact) => {
      let contactData = contact.get();
      showFriendPrivacy.push(contactData.privacy);
      return Users.findOne({where: {id: contactData.friendId}});
    });
  })
  .then((friendInst) => {
    return Promise.map(friendInst, (friend, index) => {
      let friendObj = friend.get();
      friendObj['showFriendSetting'] = showFriendPrivacy[index];
      return friendObj;
    });
  })
  .catch((err) => {
    console.error('There was an error getting all friend data: ', err);
  });

  let privacyData = Contacts.findAll(query)
  .then((contactInst) => {
    return Promise.map(contactInst, (contact) => {
      let contactData = contact.get();
      return Contacts.findOne({where: {userId: contactData.friendId, friendId: req.user.id}});
    });
  })
  .then((privacyInst) => {
    return Promise.map(privacyInst, (privacy) => {
      return privacy ? privacy.get() : privacy;
    });
  })
  .catch((err) => {
    console.error('There was an error getting privacy data: ', err);
  });

  Promise.all([friendData, privacyData])
  .spread((friend, privacy) => {
    return Promise.map(friend, (data, index) => {
      if (privacy[index] === null) { 
        data.showSetting = 'pending'; 
      } else {
        data.showSetting = privacy[index].privacy;
      }
      return data;
    });
  })
  .then((results) => {
    res.status(200).json(results);
  })
  .catch((err) => {
    console.error('There was an error packaging the friend and privacy data: ', err);
    res.status(500).json(err);
  });
};

exports.getFriendById = (req, res) => {
  res.status(200).json({});
};

exports.getContactInformation = (req, res) => {
  let contactArray = req.body.friends;
  let notFriends = [];
  Promise.each(contactArray, (contact) => {
    let phoneNumber = phone(contact.phoneNumber);
    return Users.findOne( {where: {phoneNumber: phoneNumber[0]} } )
    .then((user) => {
      if ( user !== null ) {
        let userData = user.get();
        return Contacts.findOne({where: {userId: req.user.id, friendId: userData.id} } )
        .then((user) => {
          if (user === null) {
            contact.hasApp = true;
            notFriends.push(contact);  
          }
        });
      } else {
        contact.app = false;
        notFriends.push(contact);
      }
      // let userExist = !(user === null);
    });
  })
  .then((results) => {
    res.status(200).json(notFriends);
  });
};

exports.updateFriend = (req, res) => {
  Contacts.findOne({where: {userId: req.user.id, friendId: req.params.id} } )
  .then(contactInst => {
    return contactInst.update(req.body);
  })
  .then(newContactInst => {
    res.status(200).json(newContactInst.get());
  })
  .catch(err => {
    console.error(err);
    res.status(400).json(err);
  });
};

exports.updateUser = (req, res) => {
  if (req.body.phoneNumber) {
    req.body.phoneNumber = phone(req.body.phoneNumber)[0];
  }
  Users.update(req.body, {where: {id: req.user.id}})
  .then(() => {
    res.status(201).send();
  })
  .catch((err) => {
    console.error('There was an error updating the user: ', err);
    res.status(500).json({err: err});
  });
};

exports.findUserWithPhoneNumber = (req, res, next) => {
  Users.findOne({ 
    where: { phoneNumber: phone(req.body.phoneNumber)[0] },
  })
  .then((user) => {
    if (user) {
      req.friend = user.get();
    }
    next();
  })
  .catch((err) => {
    console.error('There was an error finding a user via phone number: ', err);
    res.error = err;
    next();
  });
};
