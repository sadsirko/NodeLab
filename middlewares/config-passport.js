const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const { connect, disconnect } = require('../db/mongo');
const dbName = "mydatabase"
passport.use('local', new LocalStrategy(
    async function(username, password, done) {
        const dbClient = await connect();
        const collection = dbClient.db(dbName).collection("users");
        const user = await collection.findOne({ username: username });
        if (!user) {
            await disconnect();
            return done(null, false, { message: 'Incorrect username.' });
        }

        const hashedPassword = crypto.pbkdf2Sync(password, Buffer.from(user.salt, 'hex'), 310000, 32, 'sha256');

        if (hashedPassword.toString('hex') !== user.hashedPassword) {
            await disconnect();
            return done(null, false, { message: 'Incorrect password.' });
        }

        await disconnect();
        return done(null, user);
    }));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialization of the user
passport.deserializeUser(async (id, done) => {
    const dbClient = await connect();
    const collection = dbClient.db("mydatabase").collection("users");

    const user = await collection.findOne({ id: id });
    if (!user) {
        await disconnect();
        return done(null, false);
    }

    await disconnect();
    return done(null, user);
});
