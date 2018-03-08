const CONFIG = {
    api:{
        uploadCanData:{
            port:8101,
            hostname:"192.168.1.168",
            method:"POST",
            path:"/promo/public/box/everytime/mining/coins",
            timeout: 300000
        },
        boxStart:{
            port:8101,
            hostname:"192.168.1.168",
            method:"POST",
            path:"/promo/public/box/status/update",
            timeout: 300000
        }
    }
}
exports.CONFIG = CONFIG;