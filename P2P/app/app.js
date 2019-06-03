/* 渲染模板代码开始 */

var http=require("http");
var express=require("express");
var app=express();
var path = require('path');
// 1.在app.js的头上定义ejs:
var ejs = require('ejs');
/* //定义变量
var tem={
  message:"我是中间部分"
};
//创建服务器
//在控制台输入node app.js启动服务器
var server1 = http.createServer(app).listen(8082,function(){
  console.log("服务器地址为:http://localhost:8082");
});
var io = require('socket.io').listen(server1);


//挂载静态资源处理中间件,设置css或者js引用文件的静态路径
app.use(express.static("../public"));
// 或者以下这个也可以
// app.use(express.static(path.join(__dirname, 'public'), {maxAge: 36000}));
//设置模板视图的目录
app.set("views","../public/views");
//设置是否启用视图编译缓存，启用将加快服务器执行效率
app.set("view cache",true);
// 2.注册html模板引擎：
app.engine('html',ejs.__express);
//设置模板引擎的格式即运用何种模板引擎
app.set("view engine","html");
//设置路由
app.get("/index",function(req,res){
  res.render("index",{title:tem.message});
}); */






/* 渲染模板代码结束 */

/* 客户端代码开始 */
const dgram = require('dgram');
const client = dgram.createSocket('udp4');
const multicastAddr = '10.1.1.255';

/* client.on('close', () => {
  console.log('socket已关闭');
});

client.on('error', (err) => {
  console.log(err);
});
client.on('listening', () => {
  console.log('socket正在监听中...');
  //client.addMembership(multicastAddr);
});
client.on('message', (msg, rinfo) => {
  console.log(`receive server message from ${rinfo.address}:${rinfo.port}：${msg}`);
});
client.bind(8083); // 此处必须绑定自己的局域网IP或者不填，填localhost是不行的 */
/* 客户端代码结束 */

/* 服务端代码开始 */
const server = dgram.createSocket('udp4');

var server1 = app.listen(8082);
var io = require('socket.io').listen(server1);
io.on('connection', function (socket) {
console.log('连接成功')

/* 第一次使用登陆设置用户名字函数 */
socket.on('ServerLogin', (data) => {  //服务端监听
  server.send('username:' + data.username + ',服务端广播消息', 8082, '10.1.1.255');
});

server.on('message', (msg, rinfo) => {  //收到广播之后
  console.log(`receive client message from ${rinfo.address}:${rinfo.port}：${msg}`);
  var name = msg.toString();
  console.log(name);
  socket.emit('ClientLogin', {  //收到广播之后将IP地址和端口号返回给客户端处理
    name:name,
    IP:rinfo.address + ":" + rinfo.port
   });
   server.send('username:' + data.username + ',服务端广播消息', 8082, rinfo.address + ":" + rinfo.port);  //收到广播之后单播自己的信息返回
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
  //server.addMembership(multicastAddr); // 不写也行
  server.setBroadcast(true);
  server.setMulticastTTL(128);
/*   setInterval(() => {
    sendMsg();
  }, 1500); */
});



function sendLoginMsg(data) {
    var that = this;
    console.log(that.data);
  console.log('sending');
/*   server.send('大家好啊，我是服务端广播消息', 8061, '10.1.1.255');
  server.send('大家好啊，我是服务端组播消息', 8061, multicastAddr); */
  server.send('大家好啊，我是' + that.data + ',服务端广播消息', 8061, '10.1.1.255');
}

server.bind('8082'); // 此处填写IP后无法组播



/* 服务端代码结束 */