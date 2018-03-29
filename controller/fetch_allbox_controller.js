const TABLE_DEFINE = require("../table/table.define");
const DomainBoxSum = TABLE_DEFINE.DomainBoxSum;

var ControllerFetchAllBoxes = module.exports;

ControllerFetchAllBoxes.fetchAll = function fetchAll(){
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
    }, 60*1000);//60s
}

//1分钟一次 
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