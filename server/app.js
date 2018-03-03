var express= require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);


var storyParts = [];
var mongoose = require('mongoose');

var Word = require('./Model/word');
const dbMongo = 'mongodb://localhost:27017/bdStory';
const port = 8085;

var currentWord ="";

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(cors());

mongoose.connect(dbMongo,function(err,res){

    if (err) {
        console.log(`Error al conectarse a la red ${err}`);
    } else {
        console.log('conexión exitosa')
    }

});

server.listen(port,function(){
    console.log("corriendo puerto"+port)
});


app.post('/api/setWord',function(req,res){
    let word = new Word();
    word.word=req.param('inputWord');
    word.save(function(err,storedWord){


        if (err) {
            res.status(500)
            res.send({message:`Error al guardar ${err}`})
        } else {
            res.status(200);
            res.redirect('/');
            res.end();

        }
    })
});


io.on('connection',function(socket){
 console.log("Alguien se ha conectado a los sockets");
 socket.emit('story',storyParts);
 socket.emit('story',currentWord);
 socket.emit('new-word',function(data){
     storyParts.push(data);
     io.sockets.emit('story',storyParts);
     randomWord(function(err,data){
        io.emit('new-word',data);
     });

 }); 
});

function randomWord(callback){
    Word.find({},function(err,words){
        var number = Math.floor(Math.random()*words.length);
        currentWord = words[number].word;
        callback(0, currentWord);
    })
}