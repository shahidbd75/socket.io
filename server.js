var express = require("express");
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var users =[];
var connections =[];

server.listen(process.env.PORT || 3000);

console.log('server running');
app.get('/',function (req,res) {
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection',function (socket) {
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    // Disconnect
    socket.on('disconnect',function (data) {
        //if(!socket.username) return;
        delete users[socket.username]; //users.splice(users.indexOf(socket.username),1);
        updateUsernames();
        connections.splice(connections.indexOf(socket),1);
        console.log('Disconnected: %s sockets connected', connections.length);
    });

    socket.on('send message',function (data,callback) {
        var message = data.trim();
        if(message.substring(0,2)==='/w'){
            message = message.substring(2);
            var spaceIndex = message.indexOf('>');
            if(spaceIndex !== -1){
                var user = message.substring(0,spaceIndex);
                message = message.substring(spaceIndex + 1);
                console.log(users);
                if(user in users){
                    console.log(user in users);
                    io.to(users[user]).emit('privatechat',{msg:message,name:user});
                    console.log('private message start');
                } else{
                    callback('User not valid');
                }
            } else{
                callback('Please enter message for private chat');
            }
        } else{
            io.sockets.emit('new message',{msg: message,user: socket.username});
        }
    });

    //new user
    socket.on('new user',function (data,callback) {

        if(data in users){
            console.log(data + '..');
            callback(false);
            return;
        }
        callback(true);
        socket.username = data;
        users[socket.username] = data;        //users.push(socket.username);
        updateUsernames();
        //io.broadcast.emit('')
    });
    function updateUsernames () {
        io.sockets.emit('get users',Object.keys(users));
    }
});

