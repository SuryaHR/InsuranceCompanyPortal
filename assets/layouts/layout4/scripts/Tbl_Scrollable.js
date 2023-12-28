var isMobile = {
    Android: function () {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function () {
        return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
    },
    any: function () {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

if (isMobile.Android() == 'Android' || isMobile.any() == 'Mobile' || isMobile.Windows() == 'Windows' || isMobile.BlackBerry() == 'BlackBerry' || isMobile.iOS() == 'iOS' || isMobile.Opera() == 'Opera') {
    $("#div_TblScrollable thead tr").css({ "width": "100%", "width": "-webkit-calc(100% - 0px)", "width": "-moz-calc(100% - 0px)", "width": "calc(100% - 0px)" });
    $("#div_TblScrollable tfoot tr").css({ "width": "100%", "width": "-webkit-calc(100% - 0px)", "width": "-moz-calc(100% - 0px)", "width": "calc(100% - 0px)" });
}
else {
    alert($('#div_TblScrollable').height());
    if ($('#div_TblScrollable').height() > 160) {

        $("#div_TblScrollable thead tr").css({ "width": "100%", "width": "-webkit-calc(100% - 17px)", "width": "-moz-calc(100% - 17px)", "width": "calc(100% - 17px)" });
        $("#div_TblScrollable tfoot tr").css({ "width": "100%", "width": "-webkit-calc(100% - 17px)", "width": "-moz-calc(100% - 17px)", "width": "calc(100% - 17px)" });
    }
    else {
        $("#div_TblScrollable thead tr").css({ "width": "100%", "width": "-webkit-calc(100% - 0px)", "width": "-moz-calc(100% - 0px)", "width": "calc(100% - 0px)" });
        $("#div_TblScrollable tfoot tr").css({ "width": "100%", "width": "-webkit-calc(100% - 0px)", "width": "-moz-calc(100% - 0px)", "width": "calc(100% - 0px)" });
    }
}