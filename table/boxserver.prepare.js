var Sequelize = require('sequelize');

const APP = "promoserver";
var sequelize = new Sequelize(APP, APP, `${APP}`, {
    host: "localhost",
    logging: false,
    define: {
        freezeTableName: true,
        underscored: true

    },
    dialect: 'postgres',
    timezone: '+08:00' //东八时区
});

const CONFIG = {
     addMiningCoins:{
        port:8101,
        hostname:"192.168.1.168",
        method:"POST",
        path:"/promo/public/boxes/everytime/mining/coins",
        timeout: 300000
    },
};

exports.sequelize = sequelize;
exports.CONFIG = CONFIG;
