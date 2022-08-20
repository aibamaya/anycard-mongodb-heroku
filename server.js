const express = require('express'); //webserver for node.js
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const URI = process.env.MONGODB_URI || 'mongodb://localhost/database';
const PORT = process.env.PORT || 5000;
const DB_NAME = process.env.DB_NAME

// middleware body-parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//routes

app.get('/secret', (req, res) => res.sendFile(path.join(__dirname, 'secret.html')));
app.post('/secret', (req, res) => {
    MongoClient.connect(URI, {useNewUrlParser: true}, (err, client) => {
        if (err) {
            console.log(err);
        } else {
            const db = client.db(DB_NAME);
            const collection = db.collection('names');
            const entry = {
                name: req.body.name.toLowerCase(),
                card: req.body.number + '_of_' + req.body.suit
            };
            collection.insertOne(entry, (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    res.send(' Inserted into database')
                }
            })
            client.close()
        }
    })
})
app.get('/:param*', (req, res) => {
    const name = req.url.slice(1).toLowerCase();

    MongoClient.connect(URI, {useNewUrlParser: true}, (err, client) => {
        if (err) {
            console.log(err);
        } else {
            const db = client.db(DB_NAME);
            const collection = db.collection('name');

            if (name === 'deleteall') {
                collection.deleteMany({})
                res.send('database reset')
            } else {
                collection.find({name: name}).toArray((err, result) => {
                    if (err) {
                        console.log(err);
                    } else if (result.length) {
                        const card = result[result.length-1].card+'.png';
                        res.sendFile(path.join(__dirname + '/cards/' + card));
                    } else {
                        res.sendStatus(404);
                    }
                    client.close()
                })
            }
        }
    })
})

// start the database to listening
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

