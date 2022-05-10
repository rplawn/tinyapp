const findUserByUserName = function (email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  } return undefined;
};

const oldUser = function (email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return true;
    }
  } return false;
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
  oldUser,
  generateRandomString
}