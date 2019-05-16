module.exports = {
	OK: 0,							//成功
	FAIL: 1,        				//服务器错误
	TIMEOUT: 2,				    	//超时
	HAVE_FROZEN: 3,					//帐号已被冻结
	ACCOUNT_TYPE_ERR: 4,			//帐号类型错误
	RECOMMENDATION_NOT_EXIST: 5,	//推荐码不存在
	ROUTE_ERR: 6,					//路由错误
	HTTP_ERR: 7,					//HTTP错误
	REGISTER_FAIL: 9,				//注册失败
	UP_GEN_USREID_LIMIT: 10,		//达到生成Id上限
	
	LOGIN_ERR: 11,   				//登录失败
	LOGINED: 12,     				//你的账号已登录！
	LOGIN_INVALID: 13,				//登录信息失效
	LOGIN_USERID_NULL: 14,			//登录用户Id为空
	CONNECTION_CODE_INVALID: 15,	//连接码失效
	LOGIN_USERID_NOT_EXIST: 16,		//登录用户Id不存在
	LOGIN_PASSWD_ERR: 17,			//登录密码错误

	REDIS_DATABASE_ERR: 20,
	MYSQL_DATABASE_ERR: 21,
	CLIENT_SOCKET_CLOSE: 22,
	SERVER_SOCKET_CLOSE: 23,
	CLIENT_SOCKET_ERR: 24,
	SERVER_SOCKET_ERR: 25,
	WS_SOCKET_CLOSE: 26,
	WS_SOCKET_ERR: 27,

	UP_TIMES_LIMIT: 50,				//超过次数限制
	HAVE_SIGNIN: 51,				//已经签过到

	PLAYER_NOT_EXIST: 100,			//玩家不存在	
};