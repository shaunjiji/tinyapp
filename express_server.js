const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; //default port 8080
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://wwww.google.com"
};

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
  
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase, username: req.cookies["username"]};
  res.render('urls_index', templateVars);
})

app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
})

app.get("/register", (req, res) => {
  const templateVars = {username: req.cookies["username"]}
  res.render("register",templateVars);
})
app.post("/register", (req, res) => {
  res.redirect("/urls");
})

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
})

app.get("/urls/:id", (req, res) => { //user is taken to page where you can edit longURLs
  console.log(req.params.id);
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"]};
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