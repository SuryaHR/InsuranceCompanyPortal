

// On focus select2 dropdown open options
$(function () {

    // Freezing Page header details
    $(document).scroll(function() {
        var y = $(this).scrollTop();
        var wrap = $(".headerFreez");
        var headerElm = $('#page-header-top');
        var contentTabElm = $('#content-tab-body');
        var contentChildElm = $('#content-child');   
        var contentParentElm = $('#content-parent');   
        var newClaimContents = $('#newClaimContents');
        if (y > 65) {
            wrap.addClass("fix-TopHeader");
            wrap.removeClass("border_bottom");
            headerElm.addClass("heightZero");
            contentChildElm.addClass("marginTop90");
            contentParentElm.addClass("marginTop55");
            contentTabElm.addClass("marginTop25");
            newClaimContents.addClass("marginTop150");
        } else {
            wrap.removeClass("fix-TopHeader");
            wrap.addClass("border_bottom");
            headerElm.removeClass("heightZero");
            contentChildElm.removeClass("marginTop90");
            contentParentElm.removeClass("marginTop55");
            contentTabElm.removeClass("marginTop25");
            newClaimContents.removeClass("marginTop150");
        }
    });             
    /* Start - Custome - select2 Dropdown focus open dropdown*/
    $(document).on('focus', '.select2-selection.select2-selection--single', function (e) {
        $(this).closest(".select2-container").siblings('select:enabled').select2('open');
    });
    // steal focus during close - only capture once and stop propogation
    $('select.select2').on('select2:closing', function (e) {
        $(e.target).data("select2").$selection.one('focus focusin', function (e) {
            e.stopPropagation();
        });
    });
    /* End - Custome - select2 Dropdown focus open dropdown*/
});