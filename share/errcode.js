module.exports = {
	OK: 0,							//成功
	FAIL: 1,        				//服务器错误
	TIMEOUT: 2,				    	//超时
	HAVE_FROZEN: 3,					//帐号已被冻结
	BIND_UID_FAIL: 8,				//绑定用户id失败
	REGISTER_FAIL: 9,				//注册失败
	WXOPNEID_NULL:10,				//微信openid为空
	LOGIN_ERR: 11,   				//登录失败
	LOGINED: 12,     				//你的账号已登录！
	LOGINED_INVALID: 13,			//登录信息失效
    LOGIN_USERID_NULL: 14,			//登录用户Id为空
};