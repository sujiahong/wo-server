module.exports = {
    CENTER_IP: "192.168.10.34",
    CENTER_SOCKET_PORT: 9001,
    CENTER_HTTP_PORT: 8001,

    REDIS_IP: "192.168.10.34",
    REDIS_PORT: 6379,
    REDIS_PASSWD: "",

    MONGO_URL: "mongodb://127.0.0.1:7772",

    MYSQL_IP: "192.168.10.34",
    MYSQL_PORT: 7773,
    MYSQL_USER: "root",
    MYSQL_PASSWD: "root",
    MYSQL_CONNECTION_LIMIT: 1000,

    DB_NAME_LIST: ["test", "mini_program", "admin"],
    WX_LOGIN_URL: "https://api.weixin.qq.com/sns/jscode2session?",

    KOA_SESSION: {
        key: "session-id",
        cookie:{
            maxAge:100000,
            httpOnly: false
        }
    },
};