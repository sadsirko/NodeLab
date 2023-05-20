const { connect, disconnect } = require('../db/mongo');

async function changeUserRole(req, res) {
    const client = await connect();
    const db = client.db('databaseName'); // provide your DB name here
    const collection = db.collection('users');

    const user = await collection.findOne({id: req.params.id});

    if (!user) {
        return res.status(404).send("User not found.");
    }

    const updatedRole = user.role === 'user' ? 'moderator' : 'user';

    await collection.updateOne({id: req.params.id}, {$set: {role: updatedRole}});
    await disconnect();
    res.status(200).send(`User role changed to ${updatedRole}.`);
}

async function getUserProfile(req, res) {
    const client = await connect();
    const db = client.db('mydatabase'); // provide your DB name here
    const collection = db.collection('users');
    console.log(req.session.passport.user)
    const user = await collection.findOne({id: req.session.passport.user});

    if (!user) {
        return res.status(404).send("User not found.");
    }
    await disconnect();
    res.render('users/profile', { res, user: user });
}

module.exports = {
    changeUserRole,
    getUserProfile
};
