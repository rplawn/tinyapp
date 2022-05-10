const findUserByUserName = function (email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  } return undefined;
};

const oldUser = function (email) {
  for (const user in users) {
    if (users[user].email === email) {
      return true;
    }
  } return false;
};

module.exports = {
  findUserByUserName,
  oldUser
}