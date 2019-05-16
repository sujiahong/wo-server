/*alert弹框*/
function dialogbox(option) {
    var dialoghtml = '<div class="dialog-shadow">' +
        '<div class="dialog">' +
        '<div class="dialog-body">' +
        '<p>' + option.msg + '</p>' +
        '</div>' +
        '<div class="dialog-footer">' +
        '<button class="dialog-close">关闭</button>' +
        '</div>' +
        '</div>' +
        '</div>';
    $('body').append(dialoghtml);
    $('.dialog-close').click(function() {
        $('.dialog-shadow').remove();
        option.callback && option.callback();
    });
}
/*confirm弹框*/
function dialogConfirm(option) {
    var dialoghtml = '<div class="dialog-shadow">' +
        '<div class="dialog">' +
        /*'<div class="dialog-header">' +
        '<a class="dialog-close" href="javascript:void(0);"></a>' +
        '</div>' +*/
        '<div class="dialog-body">' +
        '<p>' + option.msg + '</p>' +
        '</div>' +
        '<div class="dialog-footer">' +
        '<button class="dialog-confirm">确认</button>' +
        '<button class="dialog-cancel">取消</button>' +
        '</div>' +
        '</div>' +
        '</div>';
    $('body').append(dialoghtml);
    /*setTimeout(function() {
        var H = document.documentElement.clientHeight;
        var h = document.body.clientHeight;
        if(h < H) {
            $('.dialog-shadow').css('height', H);
        } else {
            $('.dialog-shadow').css('height', h);
        }
    }, 300);*/

    $('.dialog-confirm').click(function() {
        $('.dialog-shadow').remove();
        option.confirmCallback && option.confirmCallback();
    });
    $('.dialog-cancel').click(function() {
        $('.dialog-shadow').remove();
        option.cancelCallback && option.cancelCallback();
    });
}