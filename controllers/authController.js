const crypto = require('crypto');
const User = require('../models/user');
const { connect, disconnect } = require('../db/mongo');
const dbName = "mydatabase"
async function registerUser(req, res, next) {
    let salt = crypto.randomBytes(16);
    crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', async (err, hashedPassword) => {
        if (err) {
            return next(err);
        }

        const newUser = new User(
            req.body.username,
            req.body.email,
            hashedPassword.toString('hex'),
            salt.toString('hex')
        );
        console.log("reg")
        const dbClient = await connect();
        const collection = dbClient.db(dbName).collection("users");

        if (!req.body.username || !req.body.email || !req.body.password) {
            req.flash('error', 'All fields are required.');
        }

        const existingUser = await collection.findOne({ username: req.body.username });
        if (existingUser) {
            await disconnect();
            return res.status(400).render('auth/signup', { res: res, error: "Username already exists." });
        }

        const existingEmail = await collection.findOne({ email: req.body.email });
        if (existingEmail) {
            await disconnect();
            return res.status(400).render('auth/signup', { res: res, error: "Email already exists." });
        }

        try {
            await collection.insertOne(newUser);
        } catch (err) {
            console.error(err);
        } finally {
            await disconnect();
        }

        res.redirect('login');
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
