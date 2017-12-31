var express = require("express");
var app = express();

app.use('/app', express.static(__dirname+'/app'));

var server = require('http').createServer(app);
//var users =[];
var userOnline =[];
var connections =[];

server.listen(process.env.PORT || 3000);

console.log('server running');
app.get('/',function (req,res) {
    res.sendFile(__dirname + '/index.html');
});

// Socket Implementation
var io = require('socket.io').listen(server);
//connect
io.sockets.on('connect', onConnect);



function onConnect(socket) {
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    // Disconnect
    socket.on('disconnect',function (data) {
        //if(!socket.username) return;
        var leftUser = socket.username;
        socket.broadcast.emit('user notification',{msg: 'lefted',name: socket.username});
        //delete users[leftUser]; //users.splice(users.indexOf(socket.username),1);
        userOnline.splice(userOnline.indexOf(userOnline.find(x=>x.username === data)),1);
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
                console.log(userOnline);
                console.log(user in userOnline);
                socket.sendTo = user.trim();
                if(userOnline.find(x=>x.username === user) !== undefined){
                    console.log(message +' ???? '+ user);
                    var uid = userOnline.find(x=>x.username === user).userId;
                    socket.to(uid).emit('private chat',{msg:message,name:user});
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
    socket.on('new user',function (uname,callback) {
        if(uname.trim() ==''){
            callback('Please enter valid name', false);
            return;
        }
        // if(uname in users){
        //     console.log(uname + '..');
        //     callback(false);
        //     return;
        // }
        if(userOnline.indexOf(userOnline.find(x=>x.username === uname)) != -1){
            console.log(uname + '..');
            callback('user already exist. try to another name',false);
            return;
        }

        callback('success',true);
        userOnline.push({'username': uname,'userId':socket.id});
        socket.username = uname;
        //users[socket.username] = uname;
        updateUsernames();
        socket.broadcast.emit('user notification',{msg: 'joined in this room',name: socket.username});
    });
}
function updateUsernames () {
    io.sockets.emit('get users',userOnline);
}


