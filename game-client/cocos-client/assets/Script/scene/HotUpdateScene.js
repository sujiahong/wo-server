const TAG = "HotUpdateScene.js";
const HotUpdate = require("../util/hot_update");
const errcode = require("../share/errcode");

cc.Class({
    extends: cc.Component,

    properties: {
        local_manifest: cc.Asset,
        st_label: cc.Label,
        ver_label: cc.Label,
        pct_label: cc.Label,
        file_lable: cc.Label
    },

    // use this for initialization
    onLoad: function () {
        if (!cc.sys.isNative && cc.sys.isMobile) {}
        var self = this;
        console.log(TAG, "HotUpdateScene onloaded!!!!!!", this.local_manifest);
        this.hotUpdate = new HotUpdate(this.local_manifest);
    },
    start: function () {
        var self = this;
        var localVersion = this.hotUpdate.getLocalVersion();
        self.ver_label.string = "V" + localVersion;
        cc.g_ada.localVersion = localVersion;
        console.log(TAG, "local version: ", localVersion);
        this.hotUpdate.check(function(code, data){
            if (code != errcode.OK){
                if (code == errcode.UPDATEING_ASSETS){
                    self.pct_label.string = data.percent;
                    self.file_lable.string = data.fileTotal;
                }else{
                    return self.st_label.string = code;
                }
            }else{
                cc.director.loadScene("LoginScene");
            }
        });
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
    }
});