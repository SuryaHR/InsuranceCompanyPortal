$(function () {
    iOSHandler();
    $(window).on("orientationchange", function (event) {
        iOSHandler();
    });
});
function iOSHandler() {
    var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    var width = screen.width;


    if (iOS) {

        var orientation;
        if (window.orientation == undefined) {
            orientation = window.screen.orientation.angle;
        }
        else {
            orientation = window.orientation;
        }

        if (orientation != 0) {
            if (screen.width < screen.height) {
                width = screen.height;
            }
        }
        //iPhone4-Landscape
        if (width > 475 && width < 485) {
            $(".comparablesDivDB").css("height", "auto");
            $(".addedComp").css("width", "100%");
            $(".addedComp").css("overflow", "scroll");
            $(".addedComp").css("-webkit-overflow-scrolling", "touch");
        }

            //iPhone5-Landscape
        else if (width > 562 && width < 572) {
            $(".comparablesDivDB").css("height", "auto");
            $(".addedComp").css("width", "100%");
            $(".addedComp").css("overflow", "scroll");
            $(".addedComp").css("-webkit-overflow-scrolling", "touch");
        }
            //iPhone4,5-Portrait
        else if (width > 315 && width < 325) {
            $(".comparablesDivDB").css("height", "auto");
            $(".addedComp").css("width", "100%");
            $(".addedComp").css("overflow", "scroll");
            $(".addedComp").css("-webkit-overflow-scrolling", "touch");
        }

            //iPhone6-Landscape
        else if (width > 660 && width < 670) {
            $(".comparablesDivDB").css("height", "auto");
            $(".addedComp").css("width", "100%");
            $(".addedComp").css("overflow", "scroll");
            $(".addedComp").css("-webkit-overflow-scrolling", "touch");
        }
            //iPhone6-Portrait
        else if (width > 370 && width < 380) {
            $(".comparablesDivDB").css("height", "auto");
            $(".addedComp").css("width", "100%");
            $(".addedComp").css("overflow", "scroll");
            $(".addedComp").css("-webkit-overflow-scrolling", "touch");
        }

            //iPhone6+-Landscape
        else if (width > 730 && width < 740) {
            $(".comparablesDivDB").css("height", "auto");
            $(".addedComp").css("width", "100%");
            $(".addedComp").css("overflow", "scroll");
            $(".addedComp").css("-webkit-overflow-scrolling", "touch");
        }
            //iPhone6+-Portrait
        else if (width > 410 && width < 420) {
            $(".comparablesDivDB").css("height", "auto");
            $(".addedComp").css("width", "100%");
            $(".addedComp").css("overflow", "scroll");
            $(".addedComp").css("-webkit-overflow-scrolling", "touch");
        }

            //ipad
        else if (width > 1020 && width < 1025) {
            $(".comparablesDivDB").css("height", "785px");
            $(".googleComparableBodyHeight").css("height", "555px");
            $(".noteDiv").css("height", "223px");
            $(".addedComp").css("width", "100%");
            $(".addedComp").css("overflow", "scroll");
            $(".addedComp").css("-webkit-overflow-scrolling", "touch");
        }

            //else if (width > 760 && width < 769) {

            //    $(".googleComparableBodyHeight").css("height", "680px");

            //}
        else if (width > 1360 && width < 1367) {
            $(".googleComparableBodyHeight").css("height", "540px");
            $(".comparablesDivDB").css("height", "697px");
        }
    }
}
