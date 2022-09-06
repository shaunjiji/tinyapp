const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
app.set("view engine", "ejs");

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
  

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
})

app.post("/urls", (req, res) => {
  console.log(req.body);
  let newId = generateRandomString(req.body)
  urlDatabase[newId] = req.body['longURL'];
  console.log(urlDatabase);

  res.redirect("/urls/" + newId);
});

app.get("/u/:id", (req, res) => {
const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});



app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});