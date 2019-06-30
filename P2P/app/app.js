var http=require("http");
var express=require("express");
var app=express();
var path = require('path');
// 1.在app.js的头上定义ejs:
var ejs = require('ejs');


const dgram = require('dgram');
const client = dgram.createSocket('udp4');
const multicastAddr = '224.100.100.100';  //组播端口号
var UserInfo = {  //保存个人信息
  Username:"",
  IP:"",
  port:""
}

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

UserInfo.IP = getClientIp() ;//node服务端保存IP地址和端口号
UserInfo.port = "8081";  

/* 获取IP地址函数 */

socket.emit('getIPAdress',{  //收到广播之后将IP地址和端口号返回给客户端处理
  type: 0,  //发送自己的IP地址
  Msg:{
    content:"",
  },
  User:{
    name:"",
    IP:getClientIp(),
    port:"8081",
  },
 });

/* 第一次使用登陆设置用户名字函数 */
socket.on('ServerLogin', (data) => {  //服务端监听
/*   console.log(multicastAddr); */
  //server.addMembership(multicastAddr);
  UserInfo.Username = data.username;
  var Msg = '{"type":0,"Msg":{"content":""},"User":{"name":' + JSON.stringify(UserInfo.Username) + ',"IP":' + JSON.stringify(UserInfo.IP) + ',"port":' + JSON.stringify(UserInfo.port) + '}}'; //json格式一定要标准！
  server.send(Msg, 8083, multicastAddr);  //向组播广播号发送信息
});

socket.on('ServerLogout', (data) => {  //本机服务端登出
  /*   console.log(multicastAddr); */
    //server.addMembership(multicastAddr);
    UserInfo.Username = data.username;
    var Msg = '{"type":0,"Msg":{"content":"Logout"},"User":{"name":' + JSON.stringify(UserInfo.Username) + ',"IP":""}}'; //json格式一定要标准！发出登出信息
    server.send(Msg, 8083, multicastAddr);  //向组播广播号发送信息
});

/* 服务端收到消息时候 */
server.on('message', (msg, rinfo) => {  //收到广播之后
  console.log(`receive client message from ${rinfo.address}:${rinfo.port}：${msg}`);
  console.log(JSON.parse(msg.toString()));
  if(JSON.parse(msg.toString()).type == 0){ //判断是不是别的用户的新加入广播
    console.log(rinfo.address,rinfo.port);;
    var name = JSON.parse(msg.toString()).User.name;
    socket.emit('ClientLogin', {  //收到广播之后将IP地址和端口号返回给客户端处理
      type: 4,  //返回时让他们不要互相发，重复发占用网络通道。
      Msg:{
        content:"Login",
      },
      User:{
        name:name,
        IP:rinfo.address,
        port:rinfo.port,
      },
     });
     console.log(33);
     var Msg = '{"type":4,"Msg":{"content":""},"User":{"name":' + JSON.stringify(UserInfo.Username) + ',"IP":' + JSON.stringify(UserInfo.IP) + ',"port":' + JSON.stringify(UserInfo.port) + '}}'; //json格式一定要标准！
/*      server.send(Msg, 8085,"127.0.0.1" );  //收到广播之后单播自己的信息返回 */
console.log(rinfo.port,rinfo.address)
      server.send(Msg,rinfo.port, rinfo.address);  //向组播广播号发送信息  
  }else if(JSON.parse(msg.toString()).type == 1){   //收到消息之后给用户端添加上去
    var name =JSON.parse(msg.toString()).User.name;
    socket.emit('CilentLogout', {  //收到消息后将消息给客户端处理--提醒这个人要登出!
      type: 1,
      Msg:{
        content:"Logout",
      },
      User:{
        name:name,
        IP:rinfo.address,
        port:rinfo.port
      },
     }); 
  }else if(JSON.parse(msg.toString()).type == 4){
    console.log(rinfo.address,rinfo.port);;
    var name = JSON.parse(msg.toString()).User.name;
    socket.emit('ClientLogin', {  //收到广播之后将IP地址和端口号返回给客户端处理
      type: 4,  //返回时让他们不要互相发，重复发占用网络通道。
      Msg:{
        content:"Login",
      },
      User:{
        name:name,
        IP:rinfo.address,
        port:rinfo.port,
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
var TCPClientList = []; //本机服务端与TCP客户端连接的数组
var TCPServerList = []; //本机客户端与TCP服务端连接的数组

// 创建一个net.Server用来监听,当连接进来的时候，就会调用我们的函数
// client_sock,就是我们的与客户端通讯建立连接配对的socket
// client_sock 就是与客户端通讯的net.Socket
var serverNet = net.createServer(function(client_sock) { 
console.log("client comming", client_sock.remoteAddress, client_sock.remotePort);
// 设置你接受的格式, 
// client_sock.setEncoding("utf8");
// client_sock.setEncoding("hex"); // 转成二进制的文本编码
// 

  var same = false;
  for(let i = 0;i < clientList.length;i++){
    if(client_sock == clientList[i].client_sock){
      same = true;
    }
  };
  if(same == false){
    //更新客户机数组
    /* client_sock.name = data.receiver.name; //用户机的名字填进去 */
    clientList.push(client_sock); 
    /* client_sock.write('【聊天室提示】欢迎' + socket.name + '\n');  */
    
    
    var isChange = false;//是否有相同的连接
    for(let j =0;j<TCPServerList.length;j++){
      if(TCPServerList[j].receiver.IP == client_sock.remotePort){
        isChange = true;
      }
    }
    if(!isChange){
    //1.创建socket
    var TCPClientConnectSeversocket = new net.Socket();
    //2.socket连接服务器
    TCPClientConnectSeversocket.connect(/* client_sock.remotePort */6082,client_sock.remoteAddress.split(":")[3],()=>{ //建立连接,端口号何url顺序不能写乱
      console.log(77);
/*       TCPClientConnectSeversocket.name = data.receiver.name; */
      TCPClientConnectSeversocket.name = "";
      TCPClientConnectSeversocket.IP = client_sock.remoteAddress.split(":")[3];
      TCPClientConnectSeversocket.port = client_sock.remotePort;     
      console.log(TCPClientConnectSeversocket.IP, TCPClientConnectSeversocket.port) 
      TCPServerList.push({receiver:{name:TCPClientConnectSeversocket.name,IP:TCPClientConnectSeversocket.IP,port:TCPClientConnectSeversocket.port},ServerTCP:TCPClientConnectSeversocket});  //本机客户端全部放入数组当中--已经建立了连接
    }); 
    TCPClientConnectSeversocket.on("error", function(e) {
      console.log("error", e);
    });
    console.log(TCPClientConnectSeversocket.IP, TCPClientConnectSeversocket.port) 

    };
  };




function showClients(){ //显示用户机数量
    console.log('【当前在线用户】：');
    for(var i=0;i<clientList.length;i++) { 
        console.log(clientList[i].name);
    }        
}

// 客户端断开连接的时候处理,用户断线离开了
client_sock.on("close", function() {
console.log("close socket");
/* clientList.splice(clientList.indexOf(socket), 1); */
});

// 接收到客户端的数据，调用这个函数
// data 默认是Buffer对象，如果你强制设置为utf8,那么底层会先转换成utf8的字符串，传给你
// hex 底层会把这个Buffer对象转成二进制字符串传给你
// 如果你没有设置任何编码 <Buffer 48 65 6c 6c 6f 57 6f 72 6c 64 21>
// utf8 --> HelloWorld!!! hex--> "48656c6c6f576f726c6421"
client_sock.on("data", function(data) {
  console.log(data);
  console.log(client_sock.remoteAddress,client_sock.remotePort);
  //把当前连接的客户机的信息转发到其他客户机  
/*   for(var i=0;i<clientList.length;i++) { 
    if(socket !== clientList[i]) {      
      clientList[i].write('【' + socket.name + '】：' + data);   
      }  
    } */

    io.emit('GetMsg', { //传送消息给界面,这样也行不要嵌套太多函数了
      Sender:{
        name:"",
        IP:client_sock.remoteAddress.toString().split(":")[3],
        port:client_sock.remotePort,
      },
      receiver:{
        name:UserInfo.Username, //填入个人信息
        IP:UserInfo.IP,
      },
      content:data.toString(), //发送内容先将buff转换为uft8
      date:"", //发送时间
      type:0, //指示传送的是文件还是消息
    });


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
host: (UserInfo.IP).split(":")[0],
exclusive: true,
});

/* TCP服务端代码结束 */

/* TCP客户端代码开始 */

//TCP建立连接函数
process.stdin.resume();
process.stdin.setEncoding('utf8');
io.on('connection', function (socket) {
socket.on("TCPClientConnectServer",(data)=>{  //TCP主动建立连接
  var isChange = false;//是否有相同的连接
  for(let j =0;j<TCPServerList.length;j++){
    if(TCPServerList[j].receiver.IP == data.receiver.IP && TCPServerList[j].receiver.port == data.receiver.port){
      isChange = true;
    }
  }
  if(!isChange){
  //1.创建socket
  var TCPClientConnectSeversocket = new net.Socket();
  //2.socket连接服务器
	TCPClientConnectSeversocket.connect(data.receiver.IP,data.receiver.port,()=>{ //建立连接
    TCPClientConnectSeversocket.name = data.receiver.name;
    TCPClientConnectSeversocket.IP = data.receiver.IP;
    TCPClientConnectSeversocket.port = data.receiver.port;
    TCPServerList.push({receiver:{name:TCPClientConnectSeversocket.name,IP:TCPClientConnectSeversocket.IP,port:TCPClientConnectSeversocket.port},ServerTCP:TCPClientConnectSeversocket});  //本机客户端全部放入数组当中--已经建立了连接
  }); 
  }
})

socket.on('TCPClientSendSever',(data) => {   //TCP发送消息
  console.log(1);
  for(let k = 0;k < TCPServerList.length;k++){
    console.log(data.receiver.IP,TCPServerList[k].receiver.IP,data.receiver.port,TCPServerList[k].receiver.port)
    if( data.receiver.IP == TCPServerList[k].receiver.IP && data.receiver.port == TCPServerList[k].receiver.port){
      console.log("我发了!");
      TCPServerList[k].ServerTCP.write(data.content); //发送消息
    }
  }
});

socket.on('TCPClientDisConnect',(data) => {   //TCP断开连接
  for(let k = 1;k < TCPServerList.length;k++){
    if(data.receiver.name == TCPServerList[k].receiver.name && ata.receiver.IP == TCPServerList[k].receiver.IP){
      TCPServerList[k].ServerTCP.end(); //断开连接
      TCPServerList.splice(k, 1);  //从客户列表中清除，但是本机的服务端连接数组中不清除，因为这要对面清除，现在是半双工
    }
  }
});

})
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