const TAG = "LoginScene.js";
const g_ada = cc.g_ada;
 
cc.Class({
    extends: cc.Component,

    properties: {
        nameLablel: cc.Label
    },

    // use this for initialization
    onLoad: function () {
        console.log(TAG, "onlogin1111", cc.g_ada, g_ada);
        if (cc.g_ada){
            this.nameLablel.string = cc.g_ada.localVersion || 0;
        }
    },
    
    start:function(){
    }
});
