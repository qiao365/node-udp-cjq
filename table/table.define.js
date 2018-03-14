const sequelize = require('./boxserver.prepare').sequelize;
var Sequelize = require('sequelize');
const moment = require('moment');

const createdAt = {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    field: "created_at",
    get() {
        return getDate.call(this, 'createdAt');
    }
}

const updatedAt = {
    type: Sequelize.DATE,
    field: "updated_at",
    get() {
        return getDate.call(this, 'updatedAt');
    }
}

function getDate(field, tz) {
    tz = tz === undefined ? 8 : tz;
    let value = this.getDataValue(field);
    if(value == null) {
        return '';
    }
    return moment(this.getDataValue(field)).utcOffset(tz).format('YYYY-MM-DD HH:mm:ss');
}

var model = module.exports;

model.DomainBoxSum = sequelize.define("t_box_sum", {
    boxSN: {
        type: Sequelize.STRING,
        unique: true
    },
    boxIp: {
        type: Sequelize.STRING
    },
    bandwidth: {
        type: Sequelize.DOUBLE,
        defaultValue: 0
    },
    diskUsage: {
        type: Sequelize.DOUBLE,
        defaultValue: 0
    },
    diskTotal: {
        type: Sequelize.DOUBLE,
        defaultValue: 0
    },  
    bt: {
        type: Sequelize.DOUBLE,
        defaultValue: 0
    },
    st: {
        type: Sequelize.DOUBLE,
        defaultValue: 0
    },
    activeTime: {
        type: Sequelize.DOUBLE,
        defaultValue: 0
    },
    createdAt: createdAt,
    updatedAt: updatedAt,
    status: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        get() {
            let updatedAt = this.getDataValue('updatedAt');
            if(updatedAt == null){
                return 0;
            }
            var m1 = new Date(moment(updatedAt).format("YYYY-MM-DD HH:mm:ss"));
            var m2 = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
            if((m2.getTime() - m1.getTime()) < 3*60*1000){//小于3分，则在线
                return 1;
            }else{
                return 0;
            }
        }
    }
});

sequelize.sync({ force: false }).then(() => {
        console.log('==================================   ok   =====================================');
}).catch((error) => {
    console.log(`init redis error:${error}`);
});;
