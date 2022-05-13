const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');

//import variables necessary for functions
const {
  findUserByUserName,
  getUserByEmail,
  generateRandomString
} = require('./helpers');

//define variables keeping the hardcoded values for testing purposes
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

let urlDatabase = {
  b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "tghjlW"
    }
};

//set cookies
app.use(cookieSession({
  name: 'session',
  keys: ["topsecret"],
  maxAge: 24 * 60 * 60 * 1000  //24 hours
}))

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//=========
//Endpoints
//=========
app.get("/", (req, res) => {
  if(req.session.user_ID) {
    res.redirect("/urls")
  }
  res.redirect("/login")
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// === /urls ===

app.get("/urls", (req, res) => {
  if (!req.session.user_ID) {
    res.status(400).send("You must be logged in to see this page.")
  }
  const urls = findUserByUserName(req.session.user_ID, urlDatabase);
  const templateVars = { 
    urls: urls,
    user: users[req.session.user_ID]
   };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const loggedInUser = req.session.user_ID
  if (!loggedInUser) {
    res.status(401).send("You must be logged in to create a URL")
    return
  }
  const shortURL = generateRandomString();
  console.log(req.body.longURL);  // Log the POST request body to the console

  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_ID
  };
  res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});

// === /urls/new ===

app.get("/urls/new", (req, res) => {
  if (!req.session.user_ID) {
    res.redirect("/login")
    return
  }
  const templateVars = { 
    user: users[req.session.user_ID]
   };
  res.render("urls_new", templateVars);
});

// === /urls/short ===

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = req.session.user_ID
  const databaseObject = urlDatabase[req.params.shortURL]

  if (!databaseObject) {
    res.status(401).send("<h1>Short URL does not exist</h1>")
    return
  }
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_ID]
  };
  res.render("urls_show", templateVars);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  const user = req.session.user_ID
  const databaseObject = urlDatabase[req.params.shortURL].userID

  if (!databaseObject) {
    res.status(401).send("<h1>Short URL does not exist</h1>")
    return
  }
  if (user !== databaseObject) {
    res.status(404).send("Cannot delete something you didn't create.")
    return
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`)
});

app.post("/urls/:shortURL", (req, res) => {
  const loggedInUser = req.session.user_ID
  if (!loggedInUser) {
    res.status(401).send("You must be logged in to gain access")
    return
  }
  urlDatabase[req.params.shortURL] = {
    longURL: req.body.newURL,
    userID: req.session.user_ID
  };
  res.redirect(`/urls`)
});

// === /urls/login ===

app.get("/login", (req, res) => {
  const loggedInUser = req.session.user_ID
  if (loggedInUser) {
    res.redirect(`/urls`)
  }
  let templateVars = {
    user: req.session.user_ID
  };
  res.render("urls_login", templateVars)
});

app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users)
  const loggedInUser = users[user]
  if (loggedInUser) {
    if (bcrypt.compareSync(req.body.password, loggedInUser.password)) {
      req.session.user_ID = loggedInUser.id
      return res.redirect(`/urls`)
    } else {
      res.status(403).send("Passwords don't match")
      return
    }
  } else {
    res.status(403).send("Email not found")
    return res.redirect(`/urls`)
  } 
});

// === /urls/logout ===

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`)
});

// === /urls/register ===

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session.user_ID]
  };
  if (users[req.session.user_ID]) {
    res.redirect("/urls")
    return
  } else {
    res.render("urls_register", templateVars)
  }
});

app.post("/register", (req, res) => {
  const emailEntered = req.body.email;  
  const passwordEntered = req.body.password;
  let userID = generateRandomString();
  const hashedPassword = bcrypt.hashSync(passwordEntered, 10);

  if (!emailEntered || !passwordEntered) {
    res.status(400).send("Please enter valid credentials")
    return
  };

  if (getUserByEmail(emailEntered, users)) {
    res.status(400).send("This email address has been used")
    return
  }
  
  users[userID] = { 
    id: userID,
    email: req.body.email,
    password: hashedPassword
  };

  req.session.user_ID = userID
   res.redirect(`/urls`)
});


// === .listen === 

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});