const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');

//define variables
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
        userID: "aJ48lW"
    }
};

const urlDatabaseMapper = function(database) {
  let obj = {};
  for (let data in database) {
    obj[data] = database[data]["longURL"]
  }
  return obj
}
//use function to map over new urlDatabase object to old one in order to prevent multiple code changes
urlDatabase = urlDatabaseMapper(urlDatabase);


app.use(cookieSession({
  name: 'session',
  keys: ["topsecret"],
  maxAge: 24 * 60 * 60 * 1000  //24 hours
}))

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


//function declarations

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

const oldUser = function (email) {
  for (const user in users) {
    if (users[user].email === email) {
      return true;
    }
  } return false;
};

const findUserByUserName = function (email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  } return undefined;
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


app.get("/urls/new", (req, res) => {
  if (!req.session.user_ID) {
    res.redirect("/login")
  }
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.session.user_ID]
   };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  if (!req.session.user_ID) {
    res.redirect("/login")
  }
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.session.user_ID]
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
    user: users[req.session.user_ID]
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
  const shortURL = req.params.shortURL
  const user = req.session.user_ID
  if (user === urlDatabase[shortURL].user && user) {
    delete urlDatabase[req.params.shortURL];
    return res.redirect(`/urls`)
  }
  res.status(404).send("Cannot delete")
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newURL;
  res.redirect(`/urls`)
});

app.post("/login", (req, res) => {
  const user = findUserByUserName(req.body.email, users)
  if (!user) {
    res.status(403).send("Email cannot be found")
    return
  } else if (!bcrypt.compareSync(req.body.password, user.password)) {
    res.status(403).send("Password doesn't match")
    return
  } else {
    req.session.user_ID
    res.redirect(`/urls`)
  }
});

app.get("/login", (req, res) => {
  if (req.session.user_ID) {
    res.redirect("/urls")
  }
  let templateVars = {
    user: req.session.user_ID
  };
  res.render("urls_login", templateVars)
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`)
});

app.get("/register", (req, res) => {
  if (req.session.user_ID) {
    res.redirect("/urls")
  }
  let templateVars = {
    user: req.session.user_ID
  };
  res.render("urls_register", templateVars)
});

app.post("/register", (req, res) => {
  const emailEntered = req.body.email;  
  const passwordEntered = req.body.password;

  if (!emailEntered || !passwordEntered) {
    res.status(400).send("Please enter valid credentials")
    return
  };

  if (oldUser(emailEntered)) {
    res.status(400).send("This email address has been used")
    return
  }
  const hashedPassword = bcrypt.hashSync(passwordEntered, 10);
  let userID = generateRandomUser();
  users[userID] = { 
    id: userID,
    email: req.body.email,
    password: hashedPassword
  };

  req.session.user_ID = userID
   res.redirect(`/urls`)
});

