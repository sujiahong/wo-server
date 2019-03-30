module.exports = {
    GATE_NAME: "gate-server",
    GATE_HTTP_PORT: 8090,
    GATE_SOCKET_PORT: 8091,

    REDIS_IP: "192.168.10.34",
    REDIS_PORT: 6379,

    GAME_SERVER_LIST: [
        {
            ID: 1,
            NAME: "game-server-1",
            IP: "",
            PORT: 8110,
            ISUSED: false,
        },
        {
            ID: 2,
            NAME: "game-server-2",
            IP: "",
            PORT: 8210,
            ISUSED: false,
        }
    ],

    WX_LOGIN_URL: "https://api.weixin.qq.com/sns/jscode2session?",
};