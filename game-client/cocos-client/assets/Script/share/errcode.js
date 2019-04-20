module.exports = {
    OK: 0,
	FAIL: 1,        				//服务器错误
	TIMEOUT: 2,				    	//超时
	HAVE_FROZEN: 3,					//帐号已被冻结
	ACCOUNT_TYPE_ERR: 4,			//帐号类型错误
	RECOMMENDATION_NOT_EXIST: 5,	//推荐码不存在
	ROUTE_ERR: 6,					//路由错误
	REGISTER_FAIL: 9,				//注册失败
	UP_GEN_USREID_LIMIT: 10,		//达到生成Id上限
	
	LOGIN_ERR: 11,   				//登录失败
	LOGINED: 12,     				//你的账号已登录！
	LOGIN_INVALID: 13,				//登录信息失效
	LOGIN_USERID_NULL: 14,			//登录用户Id为空
	
	REDIS_DATABASE_ERR: 20,
	MYSQL_DATABASE_ERR: 21,




////////////////客户端////////////////////
    CHECK_UPDATE_ERR: 10000,
    HOT_UPDATE_ERR: 10001,
    DECOMPRESS_ERR: 10002,
    ASSET_UPDATE_ERR: 10003,
    LOCAL_MANIFEST_LOAD_ERR: 10004,
    ASSET_MANAGER_UNINITED: 10005,
    UPDATEING_ASSETS: 10006,
    UPDATE_FINISHED: 10007,

    UNKNOW_ACCOUNT_TYPE: 10010,
    LOGIN_ACCOUNT_NULL: 10011,

    CODE_MSG:{
        10000: "检查更新错误！",

    }
};
