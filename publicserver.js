#!/usr/bin/env node
// based on http://www.bford.info/pub/net/p2pnat/index.html
var dgram = require('dgram');
// var redisdb = require('redis');
var http = require("http");
var prepare = require('./table/boxserver.prepare');
var CONFIG = prepare.CONFIG;
const TABLE_DEFINE = require("./table/table.define");
const moment = require('moment');
// const DomainEveryTimeBox = TABLE_DEFINE.DomainEveryTimeBox;
const DomainBoxSum = TABLE_DEFINE.DomainBoxSum;
// var redis = redisdb.createClient();
var appVersion = {
	"version":"0.1.0",
	"versionCode":10,
	"downLoad":"http://mobipromo.io/public/download/boxmingfile/update.tar.gz"
};

// 172.24.34.141
var socket = dgram.createSocket('udp4');
socket.bind(9999, '192.168.1.168');

var publicEndpointA = null;
var publicEndpointB = null;

socket.on('listening', function () {
    console.log('UDP Server listening on ' + socket.address().address + ":" + socket.address().port);
});

socket.on('message', function (message, remote) {
    // console.log(remote.address + ':' + remote.port +' - ' + message);
    console.log(remote.address + ':' + remote.port);
	var data = JSON.parse(message);
	switch(data.type)
	{
	 case 'boxBoot':
		sendAppVersionMSG(remote.address,remote.port);
		break;
	 case 'updateBox':
        return DomainBoxSum.findOne({
            where:{
                boxSN: data.boxSN
            }
        }).then((boxSum)=>{
            if(boxSum == null){
                if(!data.boxSN){
                    return {};
                }
                return DomainBoxSum.create({
                    boxSN: data.boxSN,
                    boxIp:remote.address,
                    bandwidth: data.bandwidth,//单位：bps
                    diskUsage: data.diskUsage,//单位：mb
                    diskTotal: data.diskTotal, //单位：mb
                    bt: data.bandwidth,
                    st: data.diskTotal,
                    activeTime:1
                });
            }else{
                return DomainBoxSum.update({
                    boxIp:remote.address,
                    bandwidth: data.bandwidth,//单位：bps
                    diskUsage: data.diskUsage,//单位：mb
                    diskTotal: data.diskTotal, //单位：mb
                },{
                    where:{
                        boxSN: data.boxSN
                    }
                }).then(()=>{
                    if(boxSum.status == 0){
                        console.log("大于3分钟,清零");
                        return DomainBoxSum.update({
                            st:0,
                            bt: 0,
                            activeTime: 1,
                        },{
                            where:{
                                boxSN: data.boxSN
                            }
                        });
                    }else{
                        return boxSum.increment({activeTime:1,bt: data.bandwidth, st: data.diskTotal}).then((data)=>{
                            // console.log(data.boxSN + "加1分钟");
                        }).then(()=>{
                            // console.log("这里计算是否达到产币条件");
                        });
                    }
                });
            }
        });
		break;
	}
});

//10分钟一次 
function connectToMobipromo(allSNs){
	return new Promise((resolve, reject) => {
        let write = JSON.stringify({
			password: '32u&*GVI(CJHkj)',
			arraySN:allSNs
        });
        let option = Object.assign({}, CONFIG.addMiningCoins);
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



var intervalHandle;
intervalHandle=setInterval(function(){
	var totalB =0;
	var totalCoin =0;
    return DomainBoxSum.findAll().then((boxes)=>{
       return DomainBoxSum.sum("bandwidth").then(totalB=>{
            let allboxes = boxes.map(box=>{
                if(((3000*box.bt/(totalB*10)) >1)&&(box.activeTime>10)){
                    totalCoin++;
                    return DomainBoxSum.update({
                            bt: 0,
                            st: 0,
                            activeTime: 0
                        },{
                            where:{
                                boxSN: box.boxSN
                            }
                        }
                    ).then(()=>{
                        return box.boxSN;
                    });
                }else{
                    return undefined;
                }
            });
            return Promise.all(allboxes).then((allbox)=>{
                let allSNs = allbox.filter((ele)=> ele);//过滤 undefined   
                console.log('\n\n-----------------------有'+totalCoin+'台设备采到矿-----------------------');
                if(allSNs.length > 0){
                    return connectToMobipromo(allSNs).then((back)=>{
                        console.log('-----------------------'+JSON.stringify(back)+'-----------------------\n\n');
                    });
                }
            });
       });
    });
}, 2*1000);//2s

