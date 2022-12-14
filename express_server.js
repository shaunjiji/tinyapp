const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080; //default port 8080
const bcrypt = require("bcryptjs");
const { fetchUserByEmail } = require('./helpers.js');

//MIDDLEWARE FUNCTIONS
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["cookie"]
}
));

//DATABASES
const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  s9m5xK: {
    longURL: "http://www.google.com",
    userID: "user2RandomID",
  },
};
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//HELPER FUNCTIONS
function generateRandomString(length) {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

  if (!length) {
    length = Math.floor(Math.random() * chars.length);
  }

  var str = '';
  for (var i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}

function urlsForUser(id) {
  let newURLDatabase = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      newURLDatabase[key] = urlDatabase[key];
    }

  }
  return newURLDatabase;
}

app.get("/", (req, res) => {
  console.log("test");
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    let currentUserData = urlsForUser(req.session.user_id)
    const templateVars = { urls: currentUserData, user: users[req.session.user_id] };
    return res.render('urls_index', templateVars);
  }
  else {
    return res.status(400).send({
      message: 'Please login/register to view this page.'
    });
  }
})

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
})

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id] }
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  res.render("register", templateVars);
})

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id] }
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  res.render("login", templateVars);

})

app.get("/urls/:id", (req, res) => { //user is taken to page where you can edit longURLs
  if (!req.session.user_id) {
    return res.status(400).send({
      message: 'Please login/register to view this page.'
    });
  }
  if (req.session.user_id) {
    let currentUserData = urlsForUser(req.session.user_id);

    if (currentUserData[req.params.id]) {
      const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.session.user_id] };
      return res.render("urls_show", templateVars);
    }

    if (!urlDatabase[req.params.id]) {
      return res.status(400).send({
        message: 'This id does not exist. Sorry!:('
      });
    }

    if (!currentUserData[req.params.id]) {
      return res.status(400).send({
        message: 'You do not have access to this page since you do not own this URL. Sorry! :('
      });
    }
  }

});


app.post("/register", (req, res) => {
  const newUserID = generateRandomString(6);
  const newUserEmail = req.body.email;
  const newUserPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(newUserPassword, 10);

  if (!newUserEmail || !newUserPassword) {
    return res.status(400).send();
  }
  if (!fetchUserByEmail(newUserEmail, users)) {
    users[newUserID] = {
      id: newUserID,
      email: newUserEmail,
      password: hashedPassword
    }
    req.session.user_id = newUserID;
    return res.redirect('/urls');
  }
  if (fetchUserByEmail(newUserEmail, users)) {
    return res.status(400).send({
      message: 'This email already exists.'
    });

  }
})

app.post("/login", (req, res) => {
  const testUserEmail = req.body.email;
  const testUserPassword = req.body.password;

  if (fetchUserByEmail(testUserEmail, users)) {
    const currentUser = fetchUserByEmail(testUserEmail, users);

    if (bcrypt.compareSync(testUserPassword, currentUser.password)) {
      req.session.user_id = currentUser.id;
      return res.redirect("/urls");
    }
    return res.status(403).send();
  }
  if (!fetchUserByEmail(testUserEmail, users)) {
    return res.status(403).send();
  }
})

app.post("/logout", (req, res) => {
  // res.clearCookie('user_id');
  req.session = null;
  res.redirect("/login");
})

app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    let newId = generateRandomString(6);
    urlDatabase[newId] = {
      longURL: req.body['longURL'],
      userID: req.session.user_id
    };
    return res.redirect("/urls/" + newId);
  }
  else {
    return res.status(400).send({
      message: 'Please login to be able to shorten URLs!'
    });

  }
});

app.post("/urls/:id/delete", (req, res) => { //allows users to delete entries from databasee
  if (!req.session.user_id) {
    return res.status(400).send({
      message: 'Please login to be able to delete URLs!'
    });
  }

  let currentUserData = urlsForUser(req.session.user_id);

  if (currentUserData[req.params.id]) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }
  if (!urlDatabase[req.params.id]) {
    return res.status(400).send({
      message: 'This id does not exist. Sorry!:('
    });
  }
  else {
    return res.status(400).send({
      message: 'You do not have access to this page since you do not own this URL. Sorry! :('
    });
  }


});

app.post("/urls/:id", (req, res) => { // allows user to edit longURLs in database
  if (!req.session.user_id) {
    return res.status(400).send({
      message: 'Please login to be able to shorten URLs!'
    });
  }

  let currentUserData = urlsForUser(req.session.user_id);
  if (currentUserData[req.params.id]) {
    urlDatabase[req.params.id] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    }
    return res.redirect("/urls");
  }

  if (!urlDatabase[req.params.id]) {
    return res.status(400).send({
      message: 'This id does not exist. Sorry!:('
    });
  }
  if (!currentUserData[req.params.id]) {
    return res.status(400).send({
      message: 'You do not have access to this page since you do not own this URL. Sorry! :('
    });
  }

});

app.get("/u/:id", (req, res) => { //user is redirected to longURL page 
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  }
  else {
    return res.status(400).send({
      message: 'This shortened URL does not exist! Sorry :('
    });
  }
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});