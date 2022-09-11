const { assert } = require('chai');


const { fetchUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};


describe('fetchUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = fetchUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    return assert.equal(user.id, expectedUserID);
  });
  it('should return null if an invalid email is used to login', function() {
    const user = fetchUserByEmail("shaunjiji@gmail.com", testUsers)
    const expectedReturn = null;
    return assert.equal(user, expectedReturn);
  });
});


