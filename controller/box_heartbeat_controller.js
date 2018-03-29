"use strict";

var http = require("http");
var prepare = require('../table/boxserver.prepare');
var CONFIG = prepare.CONFIG;
const TABLE_DEFINE = require("../table/table.define");
const moment = require('moment');
const DomainBoxSum = TABLE_DEFINE.DomainBoxSum;

var ControllerHeartBeat = module.exports;

ControllerHeartBeat.listener = function listener(req, res){
    console.log(getClientIp(req));
    let remote = {
        address:getClientIp(req)
    };
    let data = req.body;
    if(!data.boxSN){
        res.status(403);
        res.json({
            message: false
        });
        return;
    }
    return DomainBoxSum.findOne({
        where:{
            boxSN: data.boxSN
        }
    }).then((boxSum)=>{
        if(boxSum == null){
            return DomainBoxSum.create({
                boxSN: data.boxSN,
                boxIp:remote.address,
                bandwidth: data.bandwidth,//单位：bps
                diskUsage: data.diskUsage,//单位：mb
                diskTotal: data.diskTotal, //单位：mb
                bt: data.bandwidth,
                st: data.diskTotal,
                activeTime:1
            }).then(()=>{
                res.status(200);
                res.json({
                    isSuccess: true,
                    message: true
                });
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
                     console.log(data.boxSN + "加1分钟");
                    return boxSum.increment({activeTime:1,bt: data.bandwidth, st: data.diskTotal});
                }
            }).then(()=>{
                res.status(200);
                res.json({
                    isSuccess: true,
                    message: true
                });
            });
        }
    });
};

function getClientIp(req) {
    var ipAddress;
    var forwardedIpsStr = req.header('x-forwarded-for'); 
    if (forwardedIpsStr) {
        var forwardedIps = forwardedIpsStr.split(',');
        ipAddress = forwardedIps[0];
    }
    if (!ipAddress) {
        ipAddress = req.connection.remoteAddress;
    }
    return ipAddress;
}