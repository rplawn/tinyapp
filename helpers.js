const findUserByUserName = function (userID, database) {
  const usersURLS = {};
  for (const URLS in database) {
    console.log(database[URLS].userID);
    if (database[URLS].userID === userID) {
      usersURLS[URLS] = database[URLS].longURL
    }
  } return usersURLS
};

const getUserByEmail = function (email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return user;
    }
  } return undefined;
};

const generateRandomString = function () {
  let result = "";
  // declare all characters
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 5; i++) {
  result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

module.exports = {
  findUserByUserName,
  generateRandomString,
  getUserByEmail,
}