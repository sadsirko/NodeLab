const fs = require('fs');
const usersFilePath = './data/users.json';

async function changeUserRole(req, res) {
    let savedData = fs.readFileSync(usersFilePath);
    let users = JSON.parse(savedData);

    const index = users.arr.findIndex(user => user.id === req.params.id);

    if (index === -1) {
        return res.status(404).send("User not found.");
    }

    // Зміна ролі користувача
    if (users.arr[index].role === 'user') {
        users.arr[index].role = 'moderator';
    } else if (users.arr[index].role === 'moderator') {
        users.arr[index].role = 'user';
    }

    let jsonUsers = JSON.stringify(users);
    fs.writeFileSync(usersFilePath, jsonUsers);

    res.status(200).send(`User role changed to ${users.arr[index].role}.`);
}

async function getUserProfile(req, res) {
    let savedData = fs.readFileSync(usersFilePath);
    let users = JSON.parse(savedData);
    console.log(req.session.user);
    console.log("in profile");
    console.log("in profile");

    const index = users.arr.findIndex(user => user.id == req.session.passport.user);
    console.log(index)
    if (index === -1) {
        return res.status(404).send("User not found.");
    }
    res.render('users/profile', { res, user: users.arr[index]});
}

module.exports = {
    changeUserRole,
    getUserProfile
};
