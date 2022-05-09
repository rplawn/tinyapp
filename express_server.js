const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const users = { 
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
}

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

function generateRandomString() {
  let result = "";
  // declare all characters
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 5; i++) {
  result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

function generateRandomUser() {
  let result = "";
  // declare all characters
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 5; i++) {
  result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};


//function to check if user exists

const oldUser = function (email) {
  for (const user in users) {
    if (users[user].email === email) {
      return true;
    }
  } return false;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"],
    users: req.cookies["user_" + req.cookies["user_ID"]]
   };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"],
    users: req.cookies["user_" + req.cookies["user_ID"]]
   };
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase,
    username: req.cookies["username"],
    users: req.cookies["user_" + req.cookies["user_ID"]] 
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  console.log(req.body.longURL);  // Log the POST request body to the console
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`)
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newURL;
  res.redirect(`/urls`)
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username)
  res.redirect(`/urls`)
});

app.get("/login", (req, res) => {
  res.cookie("username", req.body.username)
  res.redirect(`/urls`)
});

app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect(`/urls`)
});

app.get("/register", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    users: req.cookies["user_" + req.cookies["user_ID"]]
  };
  res.render("urls_register", templateVars)
});

app.post("/register", (req, res) => {
  const emailEntered = req.body.email;  
  const passwordEntered = req.body.password;

  if (!emailEntered || !passwordEntered) {
    res.status(400).send("Please enter valid credentials")
  };

  if (oldUser(emailEntered)) {
    res.status(400).send("This email address has been used")
  }

  let userID = generateRandomUser();
  users = { 
    id: userID,
    email: req.body.email,
    password: req.body.password
  };

   res.cookie("user_ID", userID)
   res.cookie("user_" + userID, users)
   res.redirect(`/urls`)
});

