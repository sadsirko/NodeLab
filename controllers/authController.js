const crypto = require('crypto');
const fs = require('fs');
const User = require('../models/user');
const usersFilePath = './data/users.json';

async function registerUser(req, res, next) {
    let salt = crypto.randomBytes(16);
    crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', (err, hashedPassword) => {
        if (err) {
            return next(err);
        }

        const newUser = new User(
            req.body.username,
            req.body.email,
            hashedPassword.toString('hex'),
            salt.toString('hex')
        );

        fs.readFile(usersFilePath, (err, data) => {
            if (!req.body.username || !req.body.email || !req.body.password) {
                req.flash('error', 'All fields are required.');
            }

            if (err) {
                if (err.code === 'ENOENT') {
                    fs.writeFileSync(usersFilePath, JSON.stringify({ arr: [newUser] }), 'utf8');
                    return;
                } else {
                    return next(err);
                }
            } else {
                const usersData = JSON.parse(data);
                const users = usersData.arr;

                const existingUser = users.find(user => user.username === req.body.username);
                if (existingUser) {
                    return res.status(400).render('auth/signup', { res: res, error: "Username already exists." });
                }

                const existingEmail = users.find(user => user.email === req.body.email);
                if (existingEmail) {
                    return res.status(400).render('auth/signup', {res : res , error: "Email already exists." });
                }

                users.push(newUser);
                fs.writeFileSync(usersFilePath, JSON.stringify({ arr: users }), 'utf8');
                res.redirect('login');
            }
        });
    });
}
async function loginUser(req, res, next) {
    passport.authenticate('local', async (err, user, info) => {
        try {
            if (err) {
                console.error(err);
                return res.status(500).send("An internal server error occurred.", res);
            }

            if (!user) {
                console.error(info);
                return res.status(401).render('auth/login', { error: "Incorrect username or password.", res });

            }

            req.login(user, { session: false }, async (error) => {
                if (error) return next(error);

                req.session.user = user;
                return res.redirect('/api/advertisement/allAdvertisement');
            });
        } catch (error) {
            return next(error);
        }
    })(req, res, next);
}

module.exports = {
    registerUser,
    loginUser
};
