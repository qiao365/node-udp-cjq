#请求格式  
 reqest:  
 {
  type:'reg'或者'live',
  bandwidth:integer, 单位：bps
  diskUsage：integer， 单位：mb
  diskTotal: integer, 单位：mb
 }


#Box端  
 startup()
 {
  //加载基础模块： ipfs，程序，检测更新
  //如果基础模块不存在, 下载
     // mineforever
 }

 mineforever()
 {
  
  //每10分钟， 下载一个512K的文件，计算时间，然后提交服务器

 }


#服务器端
 server()
 {
  accept();//接入请求
  server.on('connection',function(conn){
     connections.add(conn)
  });

  server.on('data',function(data){
   var req = JSON.parse(data);
   
   switch(req.type)
   {
    case 'reg':
     redis.push(req.uuid,now(),0);
    case 'update':
     redis.update(req.uuid,now(),{数据});

     //数据格式： 带宽，通过下载文件测试获得的带宽。 磁盘剩余空间。
   }

  })
  
 }

 onRequest()
 {
  
 }