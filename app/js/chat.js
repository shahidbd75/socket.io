(function () {
    var socket = io.connect();

    var $messageForm = $("#messageForm");
    var $message = $("#message");
    var $chat = $("#chat");
    var $userArea  =$("#userArea");
    var $messageArea = $("#messageArea");
    var $users = $("#users");
    var $username = $("#username");
    var $userForm = $("#userform")

    $messageForm.submit(function (e) {
        e.preventDefault();
        console.log('submitted');

        socket.emit('send message',$message.val(),function (data) {
            $chat.append("<div class='error'>"+data+"</div>");
        });
        $message.val('');
    });
    socket.on('new message',function (data) {
        $chat.append("<div class='well'><strong>"+ data.user +" :</strong> "+data.msg+"</div>");
    });
    $userForm.submit(function (e) {
        e.preventDefault();
        socket.emit('new user',$username.val(),function (msg,isSuccess) {
            if(isSuccess){
                $userArea.hide();
                $messageArea.show();
            } else{
                alert(msg);
            }
        });
        $username.val('');
    });
    socket.on('get users',function (data) {
        var html ='';
        for(var i=0;i<data.length;i++){
            html +="<li class='list-group-item'>"+data[i].username+"</li>";
        }
        $users.html(html);
    });
    socket.on('private chat',function (data) {
        console.log(data);
        $chat.append("<div class='private'><strong>"+ data.name +" :</strong> "+data.msg+"</div>");
    });
    socket.on('user notification',function (data) {
        $chat.append("<div class='italic'>" + data.name +' ' + data.msg + "</div>");
    });
})();