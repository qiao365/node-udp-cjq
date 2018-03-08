#!/usr/bin/env node
// based on http://www.bford.info/pub/net/p2pnat/index.html
var dgram = require('dgram');
var redisdb = require('redis');
var http = require("http");
var CONFIG = require('./utils').CONFIG;
var redis = redisdb.createClient();
var appVersion = {
	"version":"0.1.0",
	"versionCode":10,
	"downLoad":"http://mobipromo.io/public/download/apk/canwallet_5utoken.apk"
};

// 172.24.34.141
var socket = dgram.createSocket('udp4');
socket.bind(3333, '192.168.1.168');

var publicEndpointA = null;
var publicEndpointB = null;

socket.on('listening', function () {
    console.log('UDP Server listening on ' + socket.address().address + ":" + socket.address().port);
});

socket.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port +' - ' + message);
	var data = JSON.parse(message);
	switch(data.type)
	{
	 case 'boxBoot':
	//   redis.hmset(data.boxSN,0);
		sendAppVersionMSG(remote.address,remote.port);
		boxBoot(data,remote);
		break;
	 case 'updateBox':
	//   redis.hmset(data.boxSN,{
	// 	message: message,
	// 	remote: remote
	//   });
		connectToMobipromo(data,remote);
		break;
	}
});

//产币规则 产币
function CalculationAmount(data,remote){

	return 1;
}

//10分钟一次 
function connectToMobipromo(data,remote){
	return new Promise((resolve, reject) => {
		let amount = CalculationAmount(data,remote);
        let write = JSON.stringify({
			boxSN: data.boxSN,
			boxIp:remote.address,
			miningCoin:amount,
			bandwidth: data.bandwidth,//单位：bps
  			diskUsage: data.diskUsage,//单位：mb
			diskTotal: data.diskTotal, //单位：mb
			status: 1 ,//状态：0:未连接  1:挖矿中  2:待机中 3:异常
			isMining: true
        });
        let option = Object.assign({}, CONFIG.api.uploadCanData);
        option.headers= {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(write)
        };
        var req = http.request(option, (res) =>{
                var data = "";
                res.setEncoding("utf8");
                res.on("data", (chunk) => {
                    data += chunk;
                });
                res.on("end", () => {
                    resolve(data);
                });
        });
        req.on('error', (e) => {
            reject(e);
        });
        req.write(write);
        req.end();
    }).then((unlock)=>{
		console.log(JSON.stringify(unlock));
	});
};

//开机
function boxBoot(data,remote){
	return new Promise((resolve, reject) => {
		let amount = CalculationAmount(data,remote);
        let write = JSON.stringify({
            boxSN: data.boxSN,
			boxIp:remote.address,
			miningCoin:amount,
			bandwidth: data.bandwidth,//单位：bps
  			diskUsage: data.diskUsage,//单位：mb
			diskTotal: data.diskTotal, //单位：mb
			status: 1 ,//状态：0:未连接  1:挖矿中  2:待机中 3:异常
			isMining: true,
        });
        let option = Object.assign({}, CONFIG.api.boxStart);
        option.headers= {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(write)
        };
        var req = http.request(option, (res) =>{
                var data = "";
                res.setEncoding("utf8");
                res.on("data", (chunk) => {
                    data += chunk;
                });
                res.on("end", () => {
                    resolve(data);
                });
        });
        req.on('error', (e) => {
            reject(e);
        });
        req.write(write);
        req.end();
    }).then((unlock)=>{
		console.log(JSON.stringify(unlock));
	});
};

//版本检测
function sendAppVersionMSG(address,port){
	var messageVersion = new Buffer(JSON.stringify(appVersion));
	socket.send(messageVersion, 0, messageVersion.length, port, address, function (err, nrOfBytesSent) {
		if(err) return console.log(err);
		console.log('> messageVersion sent to ' + address);
	});
};








