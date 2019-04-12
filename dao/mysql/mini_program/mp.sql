
SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE if EXISTS `mp_user`;
CREATE TABLE `mp_user` (
    `userid`        char(10)            NOT NULL COMMENT "ID",
    `nickname`      varchar(64)         DEFAULT ""  COMMENT "昵称",
    `sex`           tinyint             DEFAULT "0" COMMENT "性别",
    `icon`          varchar(256)        DEFAULT ""  COMMENT "头像",
    `lv`            smallint            DEFAULT "1" COMMENT "等级",
    `coins`         int                 DEFAULT "0" COMMENT "金币",
    `create_time`   bigint unsigned     NOT NULL COMMENT "创建时间",
    `login_time`    bigint unsigned     NOT NULL COMMENT "登录时间",
    `mini_id`       tinyint unsigned    NOT NULL COMMENT "小程序id",
    `cli_type`      char(12)            NOT NULL COMMENT "客户端类别",
    `account_type`  char(12)            NOT NULL COMMENT "帐号类型",
    `account`       varchar(64)         NOT NULL COMMENT "帐号",
    `location`      varchar(64)         DEFAULT "" COMMENT "定位",
    `login_ip`      char(16)            DEFAULT "" COMMENT "登录IP",
    `successive_sign` smallint          DEFAULT "0" COMMENT "连续签到",
    PRIMARY KEY (`userid`),
    UNIQUE KEY (`account`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;