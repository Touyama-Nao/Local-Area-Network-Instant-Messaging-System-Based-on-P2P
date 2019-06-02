window.onload=function(){
    var socket=io.connect('http://localhost:8080');    //监听的本机路径用来和本机的服务端联系在一起
    /* 获取本机IP地址函数开始 */
    function getUserIP(onNewIP) { //  onNewIp - your listener function for new IPs
        //compatibility for firefox and chrome
        var myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        var pc = new myPeerConnection({
           iceServers: []
       }),
       noop = function() {},
       localIPs = {},
       ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g,
       key;
    
       function iterateIP(ip) {
           if (!localIPs[ip]) onNewIP(ip);
           localIPs[ip] = true;
      }
    
        //create a bogus data channel
       pc.createDataChannel("");
    
       // create offer and set local description
       pc.createOffer().then(function(sdp) {
           sdp.sdp.split('\n').forEach(function(line) {
               if (line.indexOf('candidate') < 0) return;
               line.match(ipRegex).forEach(iterateIP);
           });
           
           pc.setLocalDescription(sdp, noop, noop);
       }).catch(function(reason) {
           // An error occurred, so handle the failure to connect
       });
    
       //sten for candidate events
       pc.onicecandidate = function(ice) {
           if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) return;
           ice.candidate.candidate.match(ipRegex).forEach(iterateIP);
       };
    }
    
    // Usage
    
    /* getUserIP(function(ip){
       alert("Got IP! :" + ip);
    }); */
    
    /* 获取本机的IP地址结束 */
    
    $(".login__button").on("click",function(){   //登录事件绑定
        var that = this;
        var data = {
            NAME:"",
            IP:""
        }
        getUserIP(function(ip){
            that.data.IP = ip;
         });
        console.log(data);
        socket.emit("setNick",data);    //socket触发服务端事件--广播
    })  
}
