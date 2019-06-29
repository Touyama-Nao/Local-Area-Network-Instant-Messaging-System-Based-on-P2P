var http=require("http");
var express=require("express");
var app=express();
var path = require('path');
// 1.在app.js的头上定义ejs:
var ejs = require('ejs');


const dgram = require('dgram');
const client = dgram.createSocket('udp4');
const multicastAddr = '224.100.100.100';  //组播端口号
var Username = "";

/* 服务端代码开始 */
const server = dgram.createSocket('udp4');

var server1 = app.listen(8082);
var io = require('socket.io').listen(server1);
io.on('connection', function (socket) {
console.log('连接成功')


function getClientIp() { //获取IP地址的os函数
  var interfaces = require('os').networkInterfaces();
  for(var devName in interfaces){
      var iface = interfaces[devName];
      for(var i=0;i<iface.length;i++){
          var alias = iface[i];
          if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
              return alias.address;
          }
      }
  }
}

/* 获取IP地址函数 */

socket.emit('getIPAdress',{  //收到广播之后将IP地址和端口号返回给客户端处理
  type: 0,  //发送自己的IP地址
  Msg:{
    content:"",
  },
  User:{
    name:"",
    IP:getClientIp() + ":8081"
  },
 });

/* 第一次使用登陆设置用户名字函数 */
socket.on('ServerLogin', (data) => {  //服务端监听
/*   console.log(multicastAddr); */
  //server.addMembership(multicastAddr);
  Username = data.username;
  var Msg = '{"type":0,"Msg":{"content":""},"User":{"name":' + JSON.stringify(Username) + ',"IP":""}}'; //json格式一定要标准！
  server.send(Msg, 8081, multicastAddr);  //向组播广播号发送信息
});

/* 服务端收到消息时候 */
server.on('message', (msg, rinfo) => {  //收到广播之后
  console.log(`receive client message from ${rinfo.address}:${rinfo.port}：${msg}`);
  console.log(JSON.parse(msg.toString()));
  if(JSON.parse(msg.toString()).type == 0){ //判断是不是别的用户的新加入广播
    var name =JSON.parse(msg.toString()).User.name;
    socket.emit('ClientLogin', {  //收到广播之后将IP地址和端口号返回给客户端处理
      type: 4,  //返回时让他们不要互相发，重复发占用网络通道。
      Msg:{
        content:"",
      },
      User:{
        name:name,
        IP:rinfo.address + ":" + rinfo.port
      },
     });
     var Msg = '{"type":0,"Msg":{"content":""},"User":{"name":' + JSON.stringify(name) + ',"IP":'+ JSON.stringify(rinfo.address + ":" + rinfo.port) +'}}'; //json格式一定要标准！
     server.send(Msg, 8082, rinfo.address + ":" + rinfo.port);  //收到广播之后单播自己的信息返回
  }else if(JSON.parse(msg.toString()).type == 1){   //收到消息之后给用户端添加上去
    socket.emit('ClientGetMsg', {  //收到消息后将消息给客户端处理
      type: 1,
      Msg:{
        content:JSON.parse(msg.toString()).Msg.content,
      },
      User:{
        name:name,
        IP:rinfo.address + ":" + rinfo.port
      },
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
});

server.bind('8081'); // 此处填写IP后无法组播



/* TCP连接代码开始 */

/* TCP连接服务端代码开始 */

// 将net模块 引入进来
var net = require("net");
//保存客户机
var clientList = [];
var TCPClientList = []; //TCP客户端连接的数组

// 创建一个net.Server用来监听,当连接进来的时候，就会调用我们的函数
// client_sock,就是我们的与客户端通讯建立连接配对的socket
// client_sock 就是与客户端通讯的net.Socket
var serverNet = net.createServer(function(client_sock) { 
console.log("client comming", client_sock.remoteAddress, client_sock.remotePort);
// 设置你接受的格式, 
// client_sock.setEncoding("utf8");
// client_sock.setEncoding("hex"); // 转成二进制的文本编码
// 

server.on('TCPServerBuild',(data) => {  
  var same = false;
  for(let i = 0;i < clientList.length;i++){
    if(data.name == clientList[i].name){
      same = true;
    }
  };
  if(same == false){
    //更新客户机数组
    client_sock.name = data.receiver.name; //用户机的名字填进去
    clientList.push(client_sock); 
    client_sock.write('【聊天室提示】欢迎' + socket.name + '\n');  
    var clientTCP = net.connect({port: 6081,host:data.host},function(){ //本机客户端与对面的服务端建立连接
    });
    TCPClientList.push({receiver:{name:client_sock.name,IP:data.receiver.IP},clientTCP:clientTCP});  //本机客户端全部放入数组当中--已经建立了连接
  };
})



function showClients(){ //显示用户机数量
    console.log('【当前在线用户】：');
    for(var i=0;i<clientList.length;i++) { 
        console.log(clientList[i].name);
    }        
}

// 客户端断开连接的时候处理,用户断线离开了
client_sock.on("close", function() {
console.log("close socket");
clientList.splice(clientList.indexOf(socket), 1);
});

// 接收到客户端的数据，调用这个函数
// data 默认是Buffer对象，如果你强制设置为utf8,那么底层会先转换成utf8的字符串，传给你
// hex 底层会把这个Buffer对象转成二进制字符串传给你
// 如果你没有设置任何编码 <Buffer 48 65 6c 6c 6f 57 6f 72 6c 64 21>
// utf8 --> HelloWorld!!! hex--> "48656c6c6f576f726c6421"
client_sock.on("data", function(data) {
  console.log(data);
  //把当前连接的客户机的信息转发到其他客户机  
/*   for(var i=0;i<clientList.length;i++) { 
    if(socket !== clientList[i]) {      
      clientList[i].write('【' + socket.name + '】：' + data);   
      }  
    } */
    client_sock
/* client_sock.end(); // 正常关闭 */
});


client_sock.on("error", function(err) {
console.log("error", err);
});
});

// 当我开始监听的时候就会调用这个回掉函数
serverNet.on("listening", function() {
console.log("start listening...");
});


// 监听发生错误的时候调用
serverNet.on("error", function() {
console.log("listen error");
});

serverNet.on("close", function() {
console.log("server stop listener");
});
/*
serverNet.on("connection", function(client_sock) {
console.log("client comming 22222");
});
*/
// 编写代码，指示这个server监听到哪个端口上面。
// 127.0.0.1: 6080
// node就会来监听我们的server,等待连接接入
serverNet.listen({
port: 6080,
host: "127.0.0.1",
exclusive: true,
});

/* TCP服务端代码结束 */

/* TCP客户端代码开始 */

//TCP建立连接函数
process.stdin.resume();
process.stdin.setEncoding('utf8');

server.on('TCPClientSend',(data) => {   //TCP发送消息
  for(let k = 1;k < TCPClientList.length;k++){
    if(data.receiver.name == TCPClientList[k].receiver.name && ata.receiver.IP == TCPClientList[k].receiver.IP){
      TCPClientList[k].clientTCP.write(data.content); //发闪送消息
    }
  }
});

server.on('TCPClientDisConnect',(data) => {   //TCP断开连接
  for(let k = 1;k < TCPClientList.length;k++){
    if(data.receiver.name == TCPClientList[k].receiver.name && ata.receiver.IP == TCPClientList[k].receiver.IP){
      TCPClientList[k].clientTCP.end(); //断开连接
      TCPClientList.splice(k, 1);  //从客户列表中清除，但是本机的服务端连接数组中不清除，因为这要对面清除，现在是半双工
    }
  }
});

/* var clientTCP = net.connect({port: 6080},function(){
  console.log('【本机提示】登录到聊天室');
  process.stdin.on('data',function(data){
    clientTCP.write(data);
  })
  clientTCP.on("data", function(data) {
      console.log(data.toString());
  });
  clientTCP.on('end', function() {
      console.log('【本机提示】退出聊天室');
      process.exit();
  });
  clientTCP.on('error', function() {
      console.log('【本机提示】聊天室异常');
      process.exit();
  });
}); */


/* TCP客户端代码结束 */

/* TCP代码结束 */

/* 服务端代码结束 */