require('dotenv').config({path: './config.env'});
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const { 
  getAllFriendData,
  getFriendById,
  addFriend,
  updateFriendById,
  updatePrivacy,
  updateCoordinates,
  getContactInformation,
} = require('./Users/Users.js');

const authorization = require('./Authorization/Authorization.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//this route for server side validation with Google
//this may actually need to be set up as middleware rather than it's own route
//as every request may need to be validated

//this middleware is for server side authorization from Google
//see https://developers.google.com/identity/sign-in/android/backend-auth
app.use(authorization);

app.route('/api/friends')
  .get(getAllFriendData)
  .post(addFriend);

app.route('/api/friends/:id')
  .get(getFriendById)
  .put(updateFriendById);

/******************************************/
/*Did Post Because GET was stringifying the array weird*/

app.post('/api/contacts', getContactInformation);
/******************************************/

app.put('/api/privacySettings', updatePrivacy);

app.put('/api/coordinates', updateCoordinates);

let port = process.env.PORT || 1337;

app.listen(port);

console.log('Listening on port ', port);