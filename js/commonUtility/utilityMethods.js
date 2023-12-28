angular.module('MetronicApp').factory('utilityMethods', ['$http', '$rootScope', function () {
    //i is for focusing only 1st element
    var validateForm = function (form) {
        var i = 0;
        angular.forEach(form.$error, function (field) {
            angular.forEach(field, function (errorField) {
                if (i == 0 && document.getElementById(errorField.$name))
                    document.getElementById(errorField.$name).focus();
                errorField.$setTouched();
                i++;
            })
        });
    };

    // START MultiSelectDropDown
    var multiSelectDropdown = function (DropdownContainerId, DropdownId, HeaderId, dataText, dataValue, dropdownData, placeholder) {
        $("#" + DropdownId).kendoMultiSelect({
            dataTextField: dataText,
            dataValueField: dataValue,
            autoClose: false,
            dataSource: dropdownData,
            placeholder: placeholder,
            //autoBind: true,
            //index: -1,
            dataBound: function () {
                var items = this.ul.find("li");
                setTimeout(function () {
                    checkInputs(items, HeaderId);
                });
            },
            itemTemplate: "<input type='checkbox'/> #:" + dataText + "#",
            headerTemplate: "<div id='" + HeaderId + "' style='margin-left:13px;'><input type='checkbox' ><label style='vertical-align: middle;'>&nbsp;Select All</label></div>",
            change: function () {
                $("#"+DropdownId).data("kendoMultiSelect").refresh();    
                var items = this.ul.find("li");
                checkInputs(items, HeaderId);
            }
        });

        $("#" + HeaderId).click(function () {
            var selAll = $('#' + HeaderId).find("input");
            if (selAll.is(':checked')) {
                $('#' + DropdownId + '_listbox').find("li").each(function () {
                    if (!$(this).find("input").is(':checked')) {
                        $(this).trigger("click");
                    }
                    // $(this).find("input").prop("checked", true);
                });
            } else {
                $('#' + DropdownId + '_listbox').find("li").each(function () {
                    if ($(this).find("input").is(':checked')) {
                        $(this).trigger("click");
                    } 
                    // $(this).find("input").prop("checked", false);
                });
            }
        });

        $('#' + DropdownContainerId).keydown(function () {
            var selAll = $('#' + HeaderId).find("input");
            selAll.attr("checked", false);
        });
    }

    // Common SelectAll dropdown checkbox
    var checkInputs = function (elements, HeaderId) {
        var selectAllFlg = true;
        var selAll = $('#' + HeaderId).find("input");
        elements.each(function () {
            var element = $(this);
            var input = element.children("input");
            if (!element.hasClass("k-state-selected")) {
                selectAllFlg = false;
            }
            input.prop("checked", element.hasClass("k-state-selected"));

            if (selectAllFlg)
                selAll.attr("checked", true);
            else
                selAll.attr("checked", false);
        });

    };
    // END MultiSelectDropDown
    // START - Clear MultiSelectDropdown values    
    var clearMultiSelectDropdownValues = function (DropdownId, HeaderId) {
        var statusSel = $('#' + DropdownId).data("kendoMultiSelect");
        if (statusSel != null && angular.isDefined(statusSel)) {
            statusSel.value("-1");

            $('#' + DropdownId + '_listbox').find("li").each(function () {
                $(this).find("input").prop("checked", false);
            });

            var selAll = $('#' + HeaderId).find("input");
            if (selAll != null && angular.isDefined(selAll))
                selAll.attr("checked", false);
        }
    };
    // END - Clear MultiSelectDropdown values 

    //Return exact 2 decimal places
    var parseFloatWithFixedDecimal = function (number) {
        number=Number(number)
        if (!Number.isNaN(number))
            //return (Math.round(num * 100) / 100).toFixed(2); // Performance Issues
            //return +(Math.round(number + "e+2")  + "e-2");     
            return Math.round((number + Number.EPSILON) * 100) / 100;
        else
            return 0;
    };

    return {        
        validateForm: validateForm,
        multiSelectDropdown: multiSelectDropdown,
        checkInputs: checkInputs,
        clearMultiSelectDropdownValues: clearMultiSelectDropdownValues,
        parseFloatWithFixedDecimal: parseFloatWithFixedDecimal
    };
}]);