window.onload = function(){
    var jq = new JQ()
    jq.init()
}
var JQ = function(){
    this.socket = null
}
JQ.prototype = {
    init: function(){
        var that = this;
        this.socket = io.connect();
        this.socket.on('connect', function(){
            document.getElementById('info').textContent = '输入昵称名字:';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        })

        this.socket.on('nickExisted', function(){
            document.getElementById('info').textContent = '呢称已使用，🌤换一个';
        })

        /////////////////// 
        this.socket.on('loginSuccess', function(){
            document.title = '刘西贝 | ' + document.getElementById('nicknameInput').value;
            document.getElementById('loginWrapper').style.display = 'none';
            document.getElementById('messageInput').focus();
        })
        ///////////////////
        this.socket.on('error', function(err){
            if(document.getElementById('loginWrapper').style.display == 'none'){
                document.getElementById('status').textContent = '连接失败'
                
            }else{
                document.getElementById('info').textContent = 'lianjieshibai!'
            }
        })

        this.socket.on('system', function(nickName, userCount, type){
            var msg = nickName + (type == 'login' ? 'joined' : 'left')
            that._displayNewMsg('system', msg, 'green')
            document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';

        })




        ///下面是服务端 lxb.js调用方法



        //调用消息方法
        this.socket.on('newMsg', function(user, msg, color) {
            that._displayNewMsg(user, msg, color);
        });

/* 
        this.socket.on('newMsg', function(user, msg, color){
            that._displayNewMsg(user, msg, color)
        }) */
        //调用图片方法
        this.socket.on('newImg', function(user, msg, color){
            that._displayImage(user, msg, color)
        })



        //登录按钮
        document.getElementById('loginBtn').addEventListener('click', function() {
            var nickName = document.getElementById('nicknameInput').value;
            if (nickName.trim().length != 0) {
                that.socket.emit('login', nickName);
            } else {
                document.getElementById('nicknameInput').focus();
            };
        }, false);


        //回车按键
        document.getElementById('nicknameInput').addEventListener('keyup', function(e) {
            if (e.keyCode == 13) {
                var nickName = document.getElementById('nicknameInput').value;
                if (nickName.trim().length != 0) {
                    that.socket.emit('login', nickName);
                };
            };
        }, false);



        //发送按钮
        document.getElementById('sendBtn').addEventListener('click', function(){
            var messageInput = document.getElementById('messageInput')
                msg = messageInput.value
                color = document.getElementById('colorStyle').value

            messageInput.value = ''
            messageInput.focus();

            if(msg.trim().length != 0){
                that.socket.emit('postMsg', msg, color)
                that._displayNewMsg('我', msg, color)
                return
            }
            
        }, false);

        //回车发送
        document.getElementById('messageInput').addEventListener('keyup', function(e){
            var messageInput = document.getElementById('messageInput')
            msg = messageInput.value
            color = document.getElementById('colorStyle').value

            if(e.keyCode == 13 && msg.trim() != 0){
                messageInput.value = ''
                that.socket.emit('postmsg', msg, color)
                that._displayNewMsg('我', msg, color)
            }
        },false);



        //清屏按钮
        document.getElementById('clearBtn').addEventListener('click', function(){
            document.getElementById('historyMsg').innerHTML = ''

        },false)



        //发送图片按钮
        document.getElementById('sendImage').addEventListener('change', function(){
            if(this.files.length != 0){
                var file = this.files[0]
                reader = new FileReader()
                color = document.getElementById('colorStyle').value
                    if(!reader){
                        that._displayNewMsg('system', '不支持', 'red')
                        this.value = ''
                        return
                    }
                    reader.onload = function(e){
                        this.value = ''
                        that.socket.emit('img', e.target.result, color)
                        that._displayImage('我', e.target.result, color)
                    }
                    reader.readAsDataURL(file)
            }
        },false)




        this._initialEmoji();
        //表情方法启用
        document.getElementById('emoji').addEventListener('click', function(e){
            var emojiwrapper = document.getElementById('emojiWrapper')
            emojiwrapper.style.display = 'block'
            e.stopPropagation();

        },false)

        document.body.addEventListener('click', function(e){
            var emojiwrapper = document.getElementById('emojiWrapper')
            if(e.target != emojiwrapper){
                emojiwrapper.style.display = 'none'
            }
        })

      /*   document.getElementById('emojiWrapper').addEventListener('click', function(e){
            var target = e.target
            if(target.nodeName.toLowerCase() == 'img'){
                var messageInput = document.getElementById('messageInput')
                messageInput.focus()
                messageInput.value = messageInput.value + '[emoji:' + target.title + ']'
            }
        },false)
    },  */
        document.getElementById('emojiWrapper').addEventListener('click', function(e){
            var target = e.target
            if(target.nodeName.toLowerCase() == 'img'){
                var messageInput = document.getElementById('messageInput')
                messageInput.focus();         
                messageInput.value = messageInput.value +'[emoji:' + target.title + ']'  //表情转换
            }
        },false)
    },  



        _initialEmoji: function() {
            var emojiContainer = document.getElementById('emojiWrapper')
            docFragment = document.createDocumentFragment()
            for(var i = 69; i > 0; i--){
                var emojiItem = document.createElement('img')
                emojiItem.src = '../img/emoji/' + i + '.gif'
                emojiItem.title = i
                docFragment.appendChild(emojiItem)
            }
            emojiContainer.appendChild(docFragment)
        },
    
        _displayNewMsg: function(user, msg, color) {
            var container = document.getElementById('historyMsg'),
                msgToDisplay = document.createElement('p'),
                date = new Date().toTimeString().substr(0, 8),
                //determine whether the msg contains emoji
                msg = this._showEmoji(msg);
            msgToDisplay.style.color = color || '#000';
            msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + msg;
            container.appendChild(msgToDisplay);
            container.scrollTop = container.scrollHeight;
        },


        _displayImage: function(user, imgData, color){

            var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
           /*  var container = document.getElementById('historyMsg')
                msgToDisplay = document.createElement('p')
                data = new Date().toTimeString().substr(0, 8); */
                msgToDisplay.style.color = color || '#000';
            /* msgToDisplay.style.color = color || '#000' */

            msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
            container.appendChild(msgToDisplay);
            container.scrollTop = container.scrollHeight;
        },
 

        //正则表达式
        _showEmoji: function(msg) {
        var match, result = msg,
            reg = /\[emoji:\d+\]/g,
            emojiIndex,
            totalEmojiNum = document.getElementById('emojiWrapper').children.length;
        while (match = reg.exec(msg)) {
            emojiIndex = match[0].slice(7, -1);
            if (emojiIndex > totalEmojiNum) {
                result = result.replace(match[0], '[X]');
            } else {
                result = result.replace(match[0], '<img class="emoji" src="../img/emoji/' + emojiIndex + '.gif" />');//todo:fix this in chrome it will cause a new request for the image
            };
        };
        return result;
    }
};

    










    
