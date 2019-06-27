var http=require("http");
var express=require("express");
var app=express();
var path = require('path');
// 1.在app.js的头上定义ejs:
var ejs = require('ejs');


const dgram = require('dgram');
const client = dgram.createSocket('udp4');
const multicastAddr = '224.100.100.100';  //组播端口号

/* 服务端代码开始 */
const server = dgram.createSocket('udp4');

var server1 = app.listen(8082);
var io = require('socket.io').listen(server1);
io.on('connection', function (socket) {
console.log('连接成功')

/* 第一次使用登陆设置用户名字函数 */
socket.on('ServerLogin', (data) => {  //服务端监听
  console.log(multicastAddr);
  //server.addMembership(multicastAddr);
  server.send('username:' + data.username, 8081, multicastAddr);  //向组播广播号发送信息
});

/* 服务端收到消息时候 */
server.on('message', (msg, rinfo) => {  //收到广播之后
  console.log(`receive client message from ${rinfo.address}:${rinfo.port}：${msg}`);
  if(msg.toString().split(";")[0] == "用户信息"){ //判断是不是别的用户的新加入广播
    var name = msg.toString().split(";")[0].split(":")[1];
    socket.emit('ClientLogin', {  //收到广播之后将IP地址和端口号返回给客户端处理
      name:name,
      IP:rinfo.address + ":" + rinfo.port
     });
     server.send('用户信息;username:' + data.username, 8082, rinfo.address + ":" + rinfo.port);  //收到广播之后单播自己的信息返回
  }else if(msg.toString().split(";")[0] == "用户消息"){   //收到消息之后给用户端添加上去
    socket.emit('ClientGetMsg', {  //收到广播之后将IP地址和端口号返回给客户端处理
      name:msg.toString().split(";")[1].split(":")[1],
      IP:rinfo.address + ":" + rinfo.port,
      Msg:msg.toString().split(";")[2].split(":")[1]
     }); 

  }
});


});

server.on('close', () => {
  console.log('socket已关闭');
});

server.on('error', (err) => {
  console.log(err);
});

server.on('listening', () => {
  console.log('socket正在监听中...');
  server.addMembership(multicastAddr); // 不写也行
  server.setBroadcast(true);
  server.setMulticastTTL(128);
/*   setInterval(() => {
    sendMsg();
  }, 1500); */
});

server.bind('8081'); // 此处填写IP后无法组播



/* 服务端代码结束 */