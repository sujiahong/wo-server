
DROP TABLE IF EXISTS `admin_user`;
CREATE TABLE `admin_user`(
    `id`            int(5)              NOT NULL     AUTO_INCREMENT COMMENT "ID",
    `passwd`        varchar(255)        DEFAULT ""   COMMENT "密码",
    `nickname`      varchar(64)         DEFAULT ""   COMMENT "昵称",
    `lv`            smallint            DEFAULT "1" COMMENT "等级",
    `create_time`   bigint unsigned     NOT NULL COMMENT "创建时间",
    `login_time`    bigint unsigned     DEFAULT 0 COMMENT "登录时间",
    PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET @time = unix_timestamp()*1000;
INSERT INTO `admin_user` set id=10000, passwd="10000", create_time=@time;