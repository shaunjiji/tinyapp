const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; //default port 8080

//MIDDLEWARE FUNCTIONS
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

//DATABASES
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://wwww.google.com"
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
function generateRandomString() {
  let result = ' ';
  var characters = 'ABIJrstuvwxyz0123456789';
  var charactersLength = characters.length;
      for ( var i = 0; i < (charactersLength - 16); i++ ) {
        result += characters.charAt(Math.floor(Math.random() * 
   charactersLength));
     }
     return result;
  }

function fetchUserByEmail (email) {
for(const userID in users) {
  if(users[userID].email === email){
    return users[userID];
  }
} 
return null;
}




app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase, user: users[req.cookies["user_id"]]};
  res.render('urls_index', templateVars);
})

app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
})

app.get("/register", (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]]}
  res.render("register",templateVars);
})

// app.get("/login", (req, res) => {

//   res.render()
// })





app.post("/register", (req, res) => {
  const newUserID = generateRandomString();
  const newUserEmail = req.body.email;
  const newUserPassword = req.body.password;

  if (!newUserEmail || !newUserPassword) {
    return res.status(400).send();
  }
if (!fetchUserByEmail(newUserEmail)){
  users[newUserID] = {
    id: newUserID,
    email: newUserEmail,
    password: newUserPassword
  }
  res.cookie('user_id', newUserID);
  console.log(users); // to check if new user has been added
  return res.redirect('/urls');
}
if (fetchUserByEmail(newUserEmail)) {
  return res.status(400).send({
    message: 'This email already exists.'
  });
  //can remove messag here if only 400 status needs to be sent out
}
})

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
})

app.get("/urls/:id", (req, res) => { //user is taken to page where you can edit longURLs
  console.log(req.params.id);
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies["user_id"]]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  let newId = generateRandomString(req.body)
  urlDatabase[newId] = req.body['longURL'];
  console.log(urlDatabase);

  res.redirect("/urls/" + newId);
});

app.post("/urls/:id/delete", (req, res) => { //allows users to delete entries from databasee

  delete urlDatabase[req.params.id];
  res.redirect("/urls");

})

app.post("/urls/:id", (req, res) => { // allows user to edit longURLs in database
  urlDatabase[req.params.id] = req.body['longURL'];
  res.redirect("/urls"); 
})



app.get("/u/:id", (req, res) => { //user is redirected to longURL page 
const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});