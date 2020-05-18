var express = require('express')
var app = express()
var server = require('http').createServer(app)
var io = require('socket.io')(server)

var port = 7777


/* var admin = express */
//创建一个用户列表
const users = []
//监听端口
server.listen(port, () =>{
    console.log('监听了端口'+ port)
})


//通过在静态中间件之后加载记录器中间件，禁用静态内容请求的日志记录
app.use('/', express.static(__dirname + '/LXB'));


app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html')
})






io.sockets.on('connection', function(socket){
    //新连接
    socket.on('login', function(nickname){
        if(users.indexOf(nickname) > -1){
            socket.emit('nickExisted');
        }else{
            //socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname)
            socket.emit('loginSuccess')
            io.sockets.emit('system', nickname, users.length, 'login')
        }
    })
    //断开连接
    socket.on('disconnect', function(){
        if(socket.nickname != null){
            users.splice(users.indexOf(socket.nickname), 1);
            socket.broadcast.emit('system', socket.nickname,users.length, 'logout')
        }
    })
    //接收消息
    socket.on('postMsg', function(msg, color) {
        socket.broadcast.emit('newMsg', socket.nickname, msg, color);
    });


    //接收图片
    socket.on('img', function(imgData, color){
        socket.broadcast.emit('newImg', socket.nickname, imgData, color)
    })

})

