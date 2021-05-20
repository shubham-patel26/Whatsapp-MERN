// importing
import { MessageSharp } from '@material-ui/icons';
import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher from 'pusher';
import cors from 'cors';
// app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1206488",
    key: "4190e64c3dd093f7b991",
    secret: "6c0445bb91d87468a206",
    cluster: "ap2",
    useTLS: true
  });

// middleware
app.use(express.json());
app.use(cors());
// DB config
const connection_url = 'mongodb+srv://Shubham26:KSw1OFmFLrU6fP15@cluster0.s877k.mongodb.net/whatsappdb?retryWrites=true&w=majority';
mongoose.connect(connection_url,{
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// ????
const db = mongoose.connection;
db.once("open", () => {
    console.log("DB connected");

    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();

    changeStream.on("change" , (change) => {
        console.log(change);

        if(change.operationType === "insert"){
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted',
            {
                name: messageDetails.name,
                message: messageDetails.message,
            });
        } else {
            console.log('Error triggering Pusher');
        }
    });
});
 

// api routes
app.get('/' , (req, res) => res.status(200).send('hello from the backend'));

app.get("/messages/sync", (req, res) => {
    Messages.find((err, data) => {
        if(err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
        }

    });
});

app.post("/messages/new", (req,res) => {
    const dbMessage = req.body;
    console.log(req.body);

    Messages.create( dbMessage, (err, data) => {
        if(err) {
            res.status(500).send(err);
        } else {
            res.status(201).send(data);
        }
    });
});

// listener

app.listen(port , ()=> console.log(`Listening on localhost:${port}`));

// KSw1OFmFLrU6fP15