module.exports = {
    GATE_NAME: "gate-server",
    GATE_SOCKET_PORT: 9090,
    GATE_HTTP_PORT: 8090,


    REDIS_IP: "192.168.10.34",
    REDIS_PORT: 6379,
    REDIS_PASSWD: "",

    MONGO_URL: "mongodb://127.0.0.1:7772",

    MYSQL_IP: "127.0.0.1",
    MYSQL_PORT: 7773,
    MYSQL_USER: "root",
    MYSQL_PASSWD: "root",
    MYSQL_CONNECTION_LIMIT: 100,

    DB_NAME_LIST: ["test", "mini_program", ],

    HOME_SERVER_LIST: [
        {
            ID: 1,
            NAME: "home-server-1",
            IP: "192.168.10.34",
            FOR_LOGIC_PORT: 9100,
            FOR_CLIENT_PORT: 8110,
            ISUSED: false,
        },
        {
            ID: 2,
            NAME: "home-server-2",
            IP: "192.168.10.34",
            FOR_LOGIC_PORT: 9120,
            FOR_CLIENT_PORT: 8120,
            ISUSED: false,
        }
    ],

    GAEM_SERVER_LIST: [
        {
            ID: 11,
            NAME: "game-server-11",
            IP: "192.168.10.34",
            FOR_CLIENT_PORT: 8310,
            ISUSED: false,
        },
        {
            ID: 12,
            NAME: "game-server-12",
            IP: "192.168.10.34",
            FOR_CLIENT_PORT: 8311,
            ISUSED: false,
        },
        {
            ID: 21,
            NAME: "game-server-21",
            IP: "192.168.10.34",
            FOR_CLIENT_PORT: 8320,
            ISUSED: false,
        },
        {
            ID: 22,
            NAME: "game-server-22",
            IP: "192.168.10.34",
            FOR_CLIENT_PORT: 8321,
            ISUSED: false,
        }
    ],

    WX_LOGIN_URL: "https://api.weixin.qq.com/sns/jscode2session?",
};