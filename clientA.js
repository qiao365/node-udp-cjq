#!/usr/bin/env node
var dgram = require('dgram');

// based on http://www.bford.info/pub/net/p2pnat/index.html



var socket = dgram.createSocket('udp4');
let boxSN = '967135891631';//'U6656Sj74325';//967135891631
var serverPort = 9999;
var serverHost = '192.168.1.168';

socket.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port +' - ' + message);
    try{
		console.log("版本信息："+message);
    }catch(err) {}
});

function connectS () {
	var message = new Buffer(JSON.stringify({
		type:"boxBoot",//boxBoot开机／updateBox10分钟更新一次数据
		boxSN:boxSN,
		bandwidth: 11,//单位：bps
  		diskUsage: 62,//单位：mb
  		diskTotal: 680 //单位：mb
	}));
	socket.send(message, 0, message.length, serverPort, serverHost, function (err, nrOfBytesSent) {
	    if (err) return console.log(err);
		console.log('UDP message sent to ' + serverHost +':'+ serverPort);
		console.log('nrOfBytesSent'+nrOfBytesSent);
		// socket.close();
	});
}

function sendMessageToS () {
	var upmessage = new Buffer(JSON.stringify({
		type:"updateBox",//boxBoot开机／updateBox 10分钟更新一次数据
		boxSN:boxSN,
		bandwidth: 9500000,//单位：bps
  		diskUsage: 329806,//单位：mb
  		diskTotal: 953867 //单位：mb
	}));

	socket.send(upmessage, 0, upmessage.length, serverPort, serverHost, function (err, nrOfBytesSent) {
	    if (err) return console.log(err);
	    console.log('UDP message sent to ' + serverHost +':'+ serverPort);
		// socket.close();
		setTimeout(function () {
			sendMessageToS();
		}, 2 * 1000);
	});
}

connectS();
sendMessageToS();

