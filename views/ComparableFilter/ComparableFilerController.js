angular.module('MetronicApp')

    .directive('ngFileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var model = $parse(attrs.ngFileModel);
                var isMultiple = attrs.multiple;
                var modelSetter = model.assign;
                element.bind('change', function () {
                    var values = [];
                    angular.forEach(element[0].files, function (item) {
                        var value = {
                            // File Name
                            name: item.name,
                            //File Size
                            size: item.size,
                            //File URL to view
                            url: URL.createObjectURL(item),
                            // File Input Value
                            _file: item
                        };
                        values.push(value);
                    });
                    scope.$apply(function () {
                        if (isMultiple) {
                            modelSetter(scope, values);
                        } else {
                            modelSetter(scope, values[0]);
                        }
                    });
                });
            }
        };
    }])

    /* Directive for File Drag and Drop */
    .directive('filedropzone', ['$log', function ($log) {
        return {
            restrict: 'A',
            scope: {
                dropfiles: '=' //One way to return your drop file data to your controller
            },
            link: function (scope, element, attrs) {
                var processDragOverOrEnter;
                processDragOverOrEnter = function (event) {
                    if (event != null) {
                        event.preventDefault();
                    }
                    return false;
                }
                element.bind('dragover', processDragOverOrEnter);
                element.bind('dragenter', processDragOverOrEnter);
                return element.bind('drop', function (event) {
                    if (event != null) {
                        event.preventDefault();
                    }
                    var fileObjectArray = [];
                    angular.forEach(event.originalEvent.dataTransfer.files, function (file) {
                        var reader = new FileReader();
                        reader.onload = function (event) {
                            scope.$apply(function () {
                                var base64 = event.target.result;
                                var fileName = file.name;
                                var type = file.type;
                                var extension = fileName.substring(fileName.lastIndexOf('.'));
                                var fileObject = {
                                    File: file,
                                    fileName: fileName,
                                    type: type,
                                    Image: base64,
                                    FileExtension: extension,
                                    isLocal: true
                                }
                                scope.dropfiles.push(fileObject);
                            });
                        }

                        reader.readAsDataURL(file);
                    });

                });

            }
        }
    }])

    .directive('disablearrows', function () {
        function disableArrows(event) {
            if (event.keyCode === 38 || event.keyCode === 40) {
                event.preventDefault();
            }
        }
        return {
            link: function (scope, element, attrs) {
                element.on('keydown', disableArrows);
            }
        };
    })

    .directive('stringToNumber', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function (value) {
                    return '' + value;
                });
                ngModel.$formatters.push(function (value) {
                    if (value == '0.0') {
                        return value = null;
                    } else {
                        return parseFloat(value, 100);
                    }
                });
            }
        };
    })

    .controller('ComparableFilterController', function ($http, $rootScope, $scope, settings, $location, $translate, $translatePartialLoader, $window,
        $filter, $timeout, AuthHeaderService, ComparableFilterService, $uibModal, ContractService) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        //set language
        $translatePartialLoader.addPart('AddAppraisal');
        $translatePartialLoader.addPart('TooltipInfo');

        $translate.refresh();
        $scope.PageSize = settings.pagesize;
        $scope.UserType = sessionStorage.getItem("RoleList");
        $scope.UserName = sessionStorage.getItem("UserLastName") + ", " + sessionStorage.getItem("UserFirstName")
        $scope.isEditAppraisal = sessionStorage.getItem("isEditAppraisal") == "true";
        $scope.ApprisalOrderAddEdit = true;
        $scope.ApprisalList = [];
        $scope.MyLength;
        $scope.Desc = {
            "description": ""
        };
        $scope.isSubmittedToSC = false;
        $scope.isAttributeZero = false;
        $scope.premiumValue = '';
        //sessionStorage.setItem("isSubmittedToSC",false)

        $scope.desc = {};
        var details = {};



        $scope.files = [];
        $rootScope.tempFiles = [];
        $scope.genderList = [];
        $scope.Custom = [];
        $scope.appraisals = [];
        $scope.Metal = [];
        $scope.MetalColor = [];
        $scope.JewellaryType = [];
        $scope.shape = [];
        $scope.color = [];
        $scope.attachmentList = [];
        $scope.attachmentEditList = [];
        $scope.clarity = [];
        $scope.typeofAppraisal = [];
        $scope.isReplacement = false;
        $scope.showAttachmentErro = false;
        var stoneDetails = [];
        $scope.centerStone = {};

        //new changes if gemstone removed
        $scope.addCenterGemstone = false;

        $scope.scDiamondEstimateTotal = 0;
        $scope.scStoneEstimateTotal = 0;

        $scope.IsSpeedCheckDisabled = false;
        $scope.IsSaveDisabled = false;

        $scope.showToaster = true;
        $scope.chainWeights = [];
                
        $scope.Appraisal = {
            "selectedGender": "",
            "SelectedCustom": "",
            "selectedMetal": "",
            "metalcolor": "",
            "jewellarytype": "",
            "lengthInInches": "",
            "WaightInGrams": "",
            "shapes": "",
            "measurement1": "",
            "measurement2": "",
            "measurement3": "",
            "WaightInCarats": "",
            "color1": "",
            "Clarity1": "",
            "GIA": "",
            "Quantity": "",
            "shp": "",
            "WeightCTW": "",
            "color2": "",
            "Clarity2": "",
            "Quantity1": "",
            "shapes": "",
            "weightctw1": "",
            "color3": "",
            "Clarity3": "",
            "shapes1": ""
        };
        $scope.Appraisal.Watch = {};

        $scope.diamondInsuranceReplacementCost = 0.0;
        $scope.gemstoneArtigemReplacementCost = 0.0;
        $scope.pearlInsuranceReplacementCost = 0.0;

        $scope.totalAccentWeddingbandDiamonds = 0.0;
        $scope.totalAccentWeddingbandGemstones = 0.0;

        $scope.laborCost = 0.0;
        $scope.totalSalvageCost = 0.0;
        $scope.totalJeweleryCost = 0.0;
        $scope.totalArtigemReplacementCost = 0.0;
        $scope.totalInsuranceReplacementCost = 0.0;
        $scope.totalRetailValue = 0.0;
        //$scope.details.sc_totalMountingPrice = 0.0;

        $scope.deletedAttachmentList = [];
        $scope.isDesc = false;
        $scope.showAddADiamond = false;
        $scope.showAddAGemstone = false;
        $scope.showAddAPearl = false;
        $scope.defaultPearlItem = [{
            "type": "",
            "shape": "",
            "quality": "",
            "size": "",
            "color": "",
            "lengthOfStrand": "",
            "typeOfClasp": "",
            "quantity": ""
        }];

        $scope.Desc.description = "";
        $scope.AppraisalDropdowns = [];
        $scope.Appraisal.InsurancePremium = 0;

        $scope.diamond = {};
        $scope.diamond.quantity = 0;

        $scope.Comparables = {};
        $scope.Comparables.comparableItems = [];
        $scope.isDisable = false;

        //dynamic form population
        $scope.showDiamond = false;
        $scope.showGemstone = false;
        $scope.showMounting = false;
        $scope.showChain = false;
        $scope.showPearl = false;
        $scope.showSpeedcheckInfo = false;

        $scope.Appraisal.centeredStone = {};
        $scope.item_types = [];

        $scope.itemCategoryValue = "";
        $scope.itemTypeValue = "";

        $scope.itemCategoryText = "";
        $scope.itemTypeText = "";

        $scope.itemCategorySelect = "";
        $scope.itemTypeSelect = "";
        $scope.chainSelectedOpt = "";
        $scope.pairSelectedOpt = "";

        $scope.pdfDesc = [];

        //pdf template start here

        //additional stones
        $scope.showAdditionalGemstoneDetails = false;
        $scope.showCenteredGemstone = false;

        $scope.showAdditionalDiamondDetails = false;
        $scope.showCenteredDiamond = false;
        $scope.centerStone.diamond = {};
        $scope.centerStone.diamond.quantity = 1;

        $scope.centerStone.gemstone = {};
        $scope.centerStone.gemstone.quantity = 1;




        $scope.Appraisal.Gender = {};

        $scope.Appraisal.Custom = {};

        $scope.Appraisal.Designer = {};

        $scope.estimateText = '';

        $scope.costSalesTax = 0;
        $scope.summaryGrandTotal = 0;
        $scope.summaryTotal = 0;

        $scope.inValidFieldApprDesc = false;
        $scope.inValidFieldApprValue = false;

        $scope.isRetailValue = false;
        $scope.isIRCost = false;
        $scope.both = false;
        $scope.isInsuranceReplacementCostSelected = false;
        $scope.isRetailCostSelected = false;

        // String Title case
        function toTitleCase(str) {
            return str.replace(
                /\w\S*/g,
                function (txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                }
            );
        }

        // Print / PDF - Complete AppraisalDetails Page
        $scope.printDiv = function () {
            var printContents = document.getElementById('pdfGenerator').innerHTML;
            var id = 1;
            var pdfTitle = "#" + $scope.appraisalNumber + "_" + toTitleCase($scope.PolicyholderDetails.primaryPolicyHolderLname) + toTitleCase($scope.PolicyholderDetails.primaryPolicyHolderFname);

            if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
                var popupWin = window.open('', 'Print' + id++, 'width=600,height=600,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
                popupWin.window.focus();
                popupWin.document.write('<!DOCTYPE html><html><head>' +
                    '<link rel="stylesheet" href="assets/layouts/layout4/css/custom.css" media="print" /><link href="assets/Customplugin.css" rel="stylesheet"  media="print"/> <link href="assets/global/plugins/bootstrap/css/bootstrap.css" rel="stylesheet" type="text/css" />' +
                    '<title>' + pdfTitle + '</title>' +
                    '</head><body><div class="reward-body">' + printContents + '</div></html>');

                popupWin.onload = function (event) {
                    popupWin.print();
                    popupWin.close();
                };
                popupWin.onbeforeunload = function (event) {
                    popupWin.close();
                    return '.\n';
                };
                popupWin.onabort = function (event) {
                    popupWin.document.close();
                    popupWin.close();
                }
            } else {
                var popupWin = window.open('_blank', 'Print' + id++, 'width=800,height=600');
                popupWin.document.open();
                popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /><title>' + pdfTitle + '</title></head><body onload="window.print()">' + printContents + '</html>');
                popupWin.document.close();
            }
            popupWin.document.close();
        }

        // Print / PDF SpeedCheck Results
        $scope.printpdfSpeedCheckRS = function () {
            var printContents = document.getElementById('SCResultsPdfGenerator').innerHTML;
            var id = 1;
            var pdfTitle = "#" + $scope.appraisalNumber;

            if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
                var popupWin = window.open('', 'Print' + id++, 'width=600,height=600,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
                popupWin.window.focus();
                popupWin.document.write('<!DOCTYPE html><html><head>' +
                    '<link rel="stylesheet" href="assets/layouts/layout4/css/custom.css" media="print" /><link href="assets/Customplugin.css" rel="stylesheet"  media="print"/> <link href="assets/global/plugins/bootstrap/css/bootstrap.css" rel="stylesheet" type="text/css" />' +
                    '<title>' + pdfTitle + '</title>' +
                    '</head><body><div class="reward-body">' + printContents + '</div></html>');

                popupWin.onload = function (event) {
                    popupWin.print();
                    popupWin.close();
                };
                popupWin.onbeforeunload = function (event) {
                    popupWin.close();
                    return '.\n';
                };
                popupWin.onabort = function (event) {
                    popupWin.document.close();
                    popupWin.close();
                }
            } else {
                var popupWin = window.open('_blank', 'Print' + id++, 'width=800,height=600');
                popupWin.document.open();
                popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /><title>' + pdfTitle + '</title></head><body onload="window.print()">' + printContents + '</html>');
                popupWin.document.close();
            }
            popupWin.document.close();
        }



        //   $scope.downloadPdf = function() {

        //


        //     kendo.drawing.drawDOM($("#pdfGenerator")).then(function(group) {
        //         kendo.drawing.pdf.saveAs(group, "Appraisal.pdf");


        //       });

        //
        //   };

        //pdf template ends here

        $scope.formStatus = false;

        $scope.init = init;

        function init() {
            $scope.quantity = 0;

            $scope.showMountingandSetting = false;
            $scope.disableScreen = false;
            GetAppraisalDropdowns();
            getMappingData();
            getSubcriptionDetails();
            $scope.decslaimer = "Artigem has identified a new replacement value of your item based off current market conditions. The valuation is derived by entering the attributes that affect value into software to compile the new replacement value including sales tax. This value is calculated by market averages and adding 20-25% for potential market price fluctuations and possible limited availability. While the actual cost to replace may be less than the appraised value, it is important to protect against these scenarios. Artigem does not warrant the value as the item was not inspected. ";

            $scope.imgDiv = false;

            var GetGlobaldata = $http.get('Config/Configuration.json');
            GetGlobaldata.then(function (success) {
                ConfigSettings = success.data.data;
                $scope.serverAddress = ConfigSettings.serverAddress;
            });            
        }
        init();

        /* Start - OnClick of Note notification on dashboard, Notes tab will display*/
        function notesTabDisplay() {
            if (sessionStorage.getItem("IsNoteNotification") == "true") {
                $scope.showNotes();
                sessionStorage.setItem("IsNoteNotification", false);
            }
        }
        notesTabDisplay();
        /* End */

        // Current Form status updated
        $scope.setFormStatus = setFormStatus;

        function setFormStatus(status) {
            $scope.formStatus = status;
            //console.log($scope.formStatus);
        }


        $scope.diamondClarityMap = [];
        $scope.cutGradeMap = [];
        $scope.metalTypeMap = [];
        $scope.metalWeightMap = [];

        function getMappingData() {
            var data = ComparableFilterService.getSpeedcheMapping();
            data.then(function (success) {
                // console.log(success.data);
                $scope.diamondClarityMap = success.data.DiamondClarities;
                $scope.cutGradeMap = success.data.CutGrades;
                $scope.metalTypeMap = success.data.MetalTypes;
                $scope.metalWeightMap = success.data.MetalWeights;
            }, function (error) {
                toastr.remove();

            });
        }

       
        //calculateAppraisalAge
        function calculateAppraisalAge(effectiveDate) {
            /* if(effectiveDate){
             var effDate = new Date(effectiveDate);
             var diff = Math.floor(effDate.getTime() - new Date().getTime());
             var day = 1000 * 60 * 60 * 24;
             var days = Math.floor(diff/day);
             var months = Math.floor(days/31);
             //var years = Math.floor(months/12);
             return Math.floor(months/12);
             }
             else
             return 0;
             */

            if (effectiveDate) {
                var date2 = new Date($scope.formatString($filter('DatabaseDateFormatMMddyyyyTime')(new Date())));
                var date1 = new Date($scope.formatString(effectiveDate));
                var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

                return diffDays / 365;
            } else
                return 0;



        }
        $scope.formatString = function (format) {
            var month = parseInt(format.substring(0, 2));
            var day = parseInt(format.substring(3, 5));
            var year = parseInt(format.substring(6, 10));
            var date = new Date(year, month - 1, day);
            return date;
        }

        //calculateIncreasePercentage
        function calculateIncreasePercentage(suggestedValue, originalValue) {
            var diff = 0;
            diff = suggestedValue - originalValue;
            if (diff > 0) {
                return diff / originalValue * 100;
            } else
                return 0;
        }

        // Update Sales tax on Change dinamically:
        $scope.calSalesTax = calSalesTax;

        function calSalesTax() {
            $scope.summaryTotal = parseFloat($scope.summaryTotal);
            $scope.costSalesTax = ($scope.summaryTotal * $scope.Appraisal.salesTaxPt) / 100;
            $scope.summaryGrandTotal = $scope.summaryTotal + $scope.costSalesTax;
        }

        function checkAllfieldsOfDiamond(param) {

            var d = param[0];
            if (d.quantity || (d.shape && d.shape.attributeValueId) || (d.clarityFrom && d.clarityFrom.attributeValueId) || (d.cutGrade && d.cutGrade.attributeValueId) || (d.gemlab && d.gemlab.attributeValueId) || (d.colorFrom && d.colorFrom.attributeValueId))
                return true;
            else
                return false;

        }

        function checkAllfieldsOfGemstone(param) {

            var d = param[0];
            if (d.type || (d.clarity && d.clarity.attributeValueId) || d.shape || d.appraisalId || d.weight || d.grade || d.quantity)
                return true;
            else
                return false;
        }

        function checkAllfieldsOfDiamondNonArray(param) {

            var d = param;
            if (d && (d.quantity || (d.shape && d.shape.attributeValueId) || (d.clarityFrom && d.clarityFrom.attributeValueId) || (d.cutGrade && d.cutGrade.attributeValueId) || (d.gemlab && d.gemlab.attributeValueId) || (d.colorFrom && d.colorFrom.attributeValueId)))
                return true;
            else
                return false;

        }

        function checkAllfieldsOfGemstoneNonArray(param) {

            var d = param;
            if (d && (d.type != null || (d.clarity && d.clarity.attributeValueId != null) || d.shape != null || d.appraisalId != null || d.weight != null || d.quantity != null || d.grade != null))
                return true;
            else
                return false;
        }
        //Function to covert base64 data to blob.
        function b64toBlob(b64Data, contentType, sliceSize) {
            contentType = contentType || '';
            sliceSize = sliceSize || 512;
            var byteCharacters = atob(b64Data);
            var byteArrays = [];
            for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                var slice = byteCharacters.slice(offset, offset + sliceSize);
                var byteNumbers = new Array(slice.length);
                for (var i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }
            var blob = new Blob(byteArrays, {
                type: contentType
            });
            return blob;
        }

        //Fuction to download uploaded files.
        $scope.getAttachements = function (data) {
            var b64Data = data;
            var contentType = 'application/octet-stream';
            var blob = b64toBlob(b64Data, contentType);
            var url = window.URL.createObjectURL(blob);
            var downloadLink = angular.element('<a></a>');
            downloadLink.attr('href', url);
            downloadLink.attr('target', '_self');
            downloadLink.attr('download', (($scope.DocxDetails.fileName != null && angular.isDefined($scope.DocxDetails.fileName) && $scope.DocxDetails.fileName !== "") ? $scope.DocxDetails.fileName : "Document"));
            downloadLink[0].click();
        }

        // Display toastr notification.
        function getActiveInactiveMessage() {
            $scope.isEditAppraisal = true;
            $scope.isDisable = true;
            $scope.temp = true;
        }

        /* set itemCategory Selected Value  */
        $scope.itemCategorySelectedVal = itemCategorySelectedVal;

        function itemCategorySelectedVal(id) {
            var elm = document.getElementById(id);
            if (angular.isDefined(elm)) {
                $scope.itemCategoryText = elm.options[elm.selectedIndex].text;
                $scope.itemCategorySelect = elm.options[elm.selectedIndex].value;
            }
        }
        /* set itemType Selected Value  */
        $scope.itemTypeSelectedVal = itemTypeSelectedVal;

        function itemTypeSelectedVal(id) {
            var elm = document.getElementById(id);
            if (angular.isDefined(elm)) {
                $scope.itemTypeText = elm.options[elm.selectedIndex].text;
                $scope.itemTypeSelect = elm.options[elm.selectedIndex].value;
            }
        }

        /* set selected chain value */
        $scope.chainSelectedVal = chainSelectedVal;

        function chainSelectedVal(id) {
            var elm = document.getElementById(id);
            if (angular.isDefined(elm)) {
                $scope.chainSelectedOpt = elm.options[elm.selectedIndex].value;
            }
        }

        $scope.onCategoryChange = onCategoryChange;

        function onCategoryChange() {

            $scope.itemTypeList = [];
            var catagoryId = $scope.Appraisal.ItemCategory.attributeValueId;

            angular.forEach($scope.item_types, function (Item) {

                if (Item.attributeValueId == catagoryId)
                    $scope.itemTypeList.push(Item);
            });

            $scope.Appraisal.ItemType = $scope.tempType;

            $scope.showLabel = false;

            if (catagoryId == 149 || catagoryId == 150) {

                $scope.showLabel = true;
                $scope.Appraisal.ItemType = {};

                if (catagoryId == 149) {
                    $scope.Appraisal.ItemType.attributeValueTypeId = 19;
                } else {
                    $scope.Appraisal.ItemType.attributeValueTypeId = 20;
                }
                $scope.onChangePopulate();
            }


            // if($scope.Appraisal.ItemType=='others' || $scope.Appraisal.ItemType=='watch'){
            //     $scope.onChangePopulate();
            // }


        }
        //GetAppraisalDropdowns
        $scope.GetAppraisalDropdowns = GetAppraisalDropdowns;

        function GetAppraisalDropdowns() {
            $(".page-spinner-bar").removeClass("hide");
            var promis = ComparableFilterService.getAppraisalDropdowns();

            promis.then(function (success) {


                $scope.AppraisalDropdowns = success.data.appraisalDropdownValue;



                for (var i = 0; i < $scope.AppraisalDropdowns.length; i++) {
                    var AppraisalDropdown = $scope.AppraisalDropdowns[i];
                    if (AppraisalDropdown.attributeName == 'GENDER') {
                        $scope.genderList = AppraisalDropdown.attributeValue;
                        //$scope.Appraisal.Gender.attributeValueId = 1;
                    } else if (AppraisalDropdown.attributeName == 'CUSTOM') {
                        $scope.customList = AppraisalDropdown.attributeValue;

                        $scope.Appraisal.Custom.attributeValueId = 4;

                    } else if (AppraisalDropdown.attributeName == 'DESIGNER') {
                        $scope.designerList = AppraisalDropdown.attributeValue;

                        $scope.Appraisal.Designer.attributeValueId = 6;
                    } else if (AppraisalDropdown.attributeName == 'ITEM_CATEGORY') {

                        $scope.itemCategoryList = AppraisalDropdown.attributeValue;

                    } else if (AppraisalDropdown.attributeName == 'ITEM_TYPE') {

                        // $scope.itemTypeList = AppraisalDropdown.attributeValueTypes;

                        $scope.item_types = AppraisalDropdown.attributeValueTypes;

                    } else if (AppraisalDropdown.attributeName == 'METAL_TYPE') {

                        $scope.metalTypeList = AppraisalDropdown.attributeValue;

                    } else if (AppraisalDropdown.attributeName == 'METAL_COLOR') {

                        $scope.metalColorList = AppraisalDropdown.attributeValue;

                    } else if (AppraisalDropdown.attributeName == 'METAL_WEIGHT') {

                        $scope.metalWeightList = AppraisalDropdown.attributeValue;



                        angular.forEach(AppraisalDropdown.attributeValue, function (subItem) {
                            $scope.chainWeights.push(subItem);
                        });

                        if ($scope.chainWeights.length > 2)
                            $scope.chainWeights.splice(2);



                    } else if (AppraisalDropdown.attributeName == 'DIAMOND_SHAPE') {

                        $scope.diamondShapeList = AppraisalDropdown.attributeValue;

                    } else if (AppraisalDropdown.attributeName == 'DIAMOND_COLOR') {

                        $scope.diamondColorFromList = AppraisalDropdown.attributeValue;
                        $scope.diamondColorToList = AppraisalDropdown.attributeValue;

                        $scope.tempDiamondColorFromList = AppraisalDropdown.attributeValue;
                        $scope.tempDiamondColorToList = AppraisalDropdown.attributeValue;

                        $scope.tempWeddingDiamondColorFromList = AppraisalDropdown.attributeValue;
                        $scope.tempWeddingDiamondColorToList = AppraisalDropdown.attributeValue;

                        $scope.centerStoneColorToList = AppraisalDropdown.attributeValue;

                        $scope.pearlColorList = AppraisalDropdown.attributeValue;

                    } else if (AppraisalDropdown.attributeName == 'DIAMOND_CLARITY') {

                        $scope.diamondClarityList = AppraisalDropdown.attributeValue;

                        $scope.tempDiamondClarityFromList = AppraisalDropdown.attributeValue;
                        $scope.tempDiamondClarityToList = AppraisalDropdown.attributeValue;

                        $scope.tempWeddingDiamondClarityFromList = AppraisalDropdown.attributeValue;
                        $scope.tempWeddingDiamondClarityToList = AppraisalDropdown.attributeValue;

                        $scope.centerStoneClarityTo = AppraisalDropdown.attributeValue;


                    } else if (AppraisalDropdown.attributeName == 'GEM_LAB') {

                        $scope.diamondGemlabList = AppraisalDropdown.attributeValue;

                    } else if (AppraisalDropdown.attributeName == 'CUT_GRADE') {

                        $scope.diamondCutGradeList = AppraisalDropdown.attributeValue;

                    } else if (AppraisalDropdown.attributeName == 'GEMSTONE_TYPE') {

                        $scope.gemstoneTypeList = AppraisalDropdown.attributeValue;

                    } else if (AppraisalDropdown.attributeName == 'GEMSTONE_SHAPE') {

                        $scope.gemstoneShapeList = AppraisalDropdown.attributeValue;

                    } else if (AppraisalDropdown.attributeName == 'GEMSTONE_QUALITY') {

                        $scope.gemstoneQualityList = AppraisalDropdown.attributeValue;

                    } else if (AppraisalDropdown.attributeName == 'GEMSTONE_GRADE') {

                        $scope.gemstoneGradeList = AppraisalDropdown.attributeValue;

                    } else if (AppraisalDropdown.attributeName == 'PEARL_TYPE') {

                        $scope.pearlTypeList = AppraisalDropdown.attributeValue;

                    } else if (AppraisalDropdown.attributeName == 'PEARL_SHAPE') {

                        $scope.pearlShapeList = AppraisalDropdown.attributeValue;

                    } else if (AppraisalDropdown.attributeName == 'PEARL_QUALITY') {

                        $scope.pearlQualityList = AppraisalDropdown.attributeValue;

                    } else if (AppraisalDropdown.attributeName == 'PEARL_CLASP') {

                        $scope.pearlClaspList = AppraisalDropdown.attributeValue;
                    } else if (AppraisalDropdown.attributeName == 'CENTERSTONE_TYPE') {

                        $scope.centerStoneTypeList = AppraisalDropdown.attributeValue;
                    }
                    //STRAP_MATERIAL
                    else if (AppraisalDropdown.attributeName == 'STRAP_MATERIAL') {

                        $scope.strapMaterialList = AppraisalDropdown.attributeValue;
                    }


                }



                $scope.IsEditOrder = sessionStorage.getItem("EditAppraisal") == "true";
                if ($scope.IsEditOrder) {
                    $scope.isEditAppraisal = sessionStorage.getItem("isEditAppraisal") == "false";
                    //$timeout(function () {
                        //$scope.getAppraisalDetails(); CTB-3582
                    //}, 100)
                } else {
                    $scope.Appraisal.AppraisalValue = "0.0";
                    $scope.Appraisal.newInsurancePremiumCost = "0.0";
                    $scope.Appraisal.oldInsurancePremiumCost = "0.0";
                    //speedcheck values
                    $scope.totalSalvageCost = "0.0";
                    $scope.totalJeweleryCost = "0.0";
                    $scope.totalArtigemReplacementCost = "0.0";
                    $scope.totalInsuranceReplacementCost = "0.0";
                    $scope.totalRetailValue = "0.0";
                    $scope.diamondInsuranceReplacementCost = "0.0";
                    $scope.gemstoneArtigemReplacementCost = "0.0";
                    $scope.pearlInsuranceReplacementCost = "0.0";
                    $scope.laborCost = "0.0";
                    $scope.Appraisal.ScTotalMountingPrice = "0.0";
                    $scope.isEditAppraisal = false;
                }
            }, function (error) {
                toastr.remove();
                $(".page-spinner-bar").addClass("hide");
                if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                    toastr.error(error.data.errorMessage, "Error")
                } else {
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error")

                }

            });
        }

        // Round of 2 Decimal point
        $scope.roundOf2Decimal = roundOf2Decimal;

        function roundOf2Decimal(num) {
            if (num != null) {
                return (Math.round(num * 100) / 100).toFixed(2);
            }
            return num;
        }

        $scope.roundOfValue = roundOfValue;

        function roundOfValue(event) {
            if (event.currentTarget.value != null && event.currentTarget.value != "") {
                var roundVal = roundOf2Decimal(event.currentTarget.value);
                event.currentTarget.value = roundVal;
            }
        }


        //ng-repeat Diamond and Gemstone details

        //DIAMONDS
        $scope.Appraisal.diamonds = [];
        $scope.diamondItems = [];
        // adding new diamond slabs
        // $scope.diamondItems = [{
        //     id: '1',
        //     removeButton: false
        // }];

        $scope.addNewDiamondItem = addNewDiamondItem;

        function addNewDiamondItem() {

            $scope.showAddADiamond = false;

            if (!$scope.diamondItems) {
                $scope.diamondItems = [{
                    id: '1',
                    removeButton: false
                }];
            } else {
                var newItemNo = $scope.diamondItems.length + 1;
                $scope.diamondItems.push({
                    'id': newItemNo,
                    'removeButton': true
                });
            }
        };

        $scope.removeDiamond = removeDiamond;

        function removeDiamond() {


            if ($scope.diamondItems.length == 1) {
                $scope.showAddADiamond = true;
            }
            var lastItem = $scope.diamondItems.length - 1;
            $scope.diamondItems.splice(lastItem);
        };

        $scope.removeThisDiamond = removeThisDiamond;

        function removeThisDiamond(index) {
            bootbox.confirm({
                size: "",
                title: "Remove Diamond Details",
                message: "Are you sure you want to remove the diamond details? ",
                closeButton: false,
                className: "modalcustom",
                buttons: {
                    confirm: {
                        label: "Remove",
                        className: 'btn-success'
                    },
                    cancel: {
                        label: "Cancel",
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    if (result) {
                        $scope.$apply(function () {
                            if (index == 0) {
                                $scope.showAddADiamond = true;
                            }
                            $scope.diamondItems.splice(index, 1);
                            $scope.updateDiamondsBox($scope.diamondItems);

                            // SpeedCheck Call & Save/Update appraisal Details
                            if ($scope.showSpeedcheckInfo) {
                                SubmitToSpeedCheck();
                            }
                        });
                    }
                }
            });
        }

        $scope.updateDiamondsBox = function (diadiamondItems) {
            $scope.diamondItems = [];
            $scope.diamondItems = angular.copy(diadiamondItems);

            for (var i = 0; i < diadiamondItems.length; i++) {
                $scope.diamondItems[i].id = i + 1
            }

        }


        //pearl

        $scope.addNewPearlItem = addNewPearlItem;

        function addNewPearlItem() {

            if (!$scope.pearlItems) {
                $scope.pearlItems = [{
                    id: '1',
                    removeButton: false
                }];
            } else {
                var newItemNo = $scope.pearlItems.length + 1;
                $scope.pearlItems.push({
                    'id': newItemNo,
                    'removeButton': true
                });
            }

        };

        //removeThisPearl
        $scope.removeThisPearl = removeThisPearl;

        function removeThisPearl(index) {
            bootbox.confirm({
                size: "",
                title: "Remove Pearl Details?",
                message: "Are you sure you want to remove the pearl details? ",
                closeButton: false,
                className: "modalcustom",
                buttons: {
                    confirm: {
                        label: "Remove",
                        className: 'btn-success'
                    },
                    cancel: {
                        label: "Cancel",
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    if (result) {
                        $scope.$apply(function () {

                            $scope.pearlItems.splice(index, 1);
                            $scope.updatePearlBox($scope.pearlItems);

                            // SpeedCheck Call & Save/Update appraisal Details
                            if ($scope.showSpeedcheckInfo) {
                                SubmitToSpeedCheck();
                            }
                        });
                    }
                }
            });
        }



        //pared diamond


        $scope.pairedDiamondItems = [];
        // adding new diamond slabs
        $scope.pairedDiamondItems = [{
            'id': 1,
            'removeButton': false
        }, {
            'id': 2,
            'removeButton': false
        }];

        //paired gemstone

        $scope.pairedGemstoneItems = [];
        // adding new diamond slabs
        $scope.pairedGemstoneItems = [{
            'id': 1,
            'removeButton': false,
            'quantity': 1
        }, {
            'id': 2,
            'removeButton': false,
            'quantity': 1
        }];



        // GEMSTONES
        $scope.Appraisal.gemstones = [];
        // adding new gemstone slabs
        // $scope.gemstoneItems = [{
        //     id: '1',
        //     removeButton: false
        // }];
        $scope.gemstoneItems = [];

        $scope.addNewGemstone = function () {

            $scope.showAddAGemstone = false;
            var newItemNo = $scope.gemstoneItems.length + 1;
            $scope.gemstoneItems.push({
                'id': newItemNo,
                'removeButton': true
            });
        };

        $scope.removeGemstone = function () {

            if ($scope.gemstoneItems.length == 1) {
                $scope.showAddAGemstone = true;
            }
            var lastItem = $scope.gemstoneItems - 1;
            $scope.gemstoneItems.splice(lastItem);
        };

        $scope.removeThisGemstone = removeThisGemstone;

        function removeThisGemstone(index) {
            bootbox.confirm({
                size: "",
                title: "Remove Colored Gemstone Details?",
                message: "Are you sure you want to remove the colored gemstone details?",
                closeButton: false,
                className: "modalcustom",
                buttons: {
                    confirm: {
                        label: "Remove",
                        className: 'btn-success'
                    },
                    cancel: {
                        label: "Cancel",
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    if (result) {
                        $scope.$apply(function () {
                            if (index == 0) {
                                $scope.showAddAGemstone = true;
                            }
                            $scope.gemstoneItems.splice(index, 1);
                            $scope.updateGemstoneBox($scope.gemstoneItems);

                            // SpeedCheck Call & Save/Update appraisal Details
                            if ($scope.showSpeedcheckInfo) {
                                SubmitToSpeedCheck();
                            }
                        });
                    }
                }
            });
        }

        $scope.updateGemstoneBox = function (gemstoneItems) {
            $scope.gemstoneItems = [];
            $scope.gemstoneItems = angular.copy(gemstoneItems);

            for (var i = 0; i < gemstoneItems.length; i++) {
                $scope.gemstoneItems[i].id = i + 1
            }

        }

        //Pearl

        //$scope.Appraisal.pearls = $scope.defaultPearlItem;
        // adding new Pearl slabs
        /* $scope.pearlItems = [{
             id: '1',
             removeButton: false
         }];*/

        $scope.addNewPearl = function () {
            $scope.showAddAPearl = false;
            $scope.pearlItems = $scope.pearlItems == null ? [] : $scope.pearlItems;
            var newItemNo = $scope.pearlItems.length + 1;
            $scope.pearlItems.push({
                'id': newItemNo,
                'removeButton': true
            });
        };

        $scope.removePearl = function () {

            if ($scope.gemstopearlItemsneItems.length == 1) {
                $scope.showAddAPearl = true;
            }
            var lastItem = $scope.pearlItems - 1;
            $scope.pearlItems.splice(lastItem);
        };



        $scope.updatePearlBox = function (pearlItems) {
            $scope.pearlItems = [];
            $scope.pearlItems = angular.copy(pearlItems);

            for (var i = 0; i < pearlItems.length; i++) {
                $scope.pearlItems[i].id = i + 1
            }

        }



        //get
        $scope.SubmitToSpeedCheck = SubmitToSpeedCheck;

        function SubmitToSpeedCheck() {
            if($scope.subscriptionInfo!=null && !$scope.subscriptionInfo.contractExpiry){
                    $scope.disableScreen = true;
                    $(".page-spinner-bar").removeClass("hide");

                    $scope.inValidFieldApprDesc = false;
                    $scope.inValidFieldApprValue = false;
                    //console.log($scope.AppraisalDropdowns);
                    //for labourcost and final speedcheck result
                    $scope.showSpeedcheckInfo = true;
                    $scope.isAttributeZero = false;

                    var tempDropdowns = [];
                    var tempTypeDropdowns = [];

                    //getMappingData();

                    angular.forEach($scope.AppraisalDropdowns, function (Item) {
                        angular.forEach(Item.attributeValue, function (subItem) {
                            tempDropdowns.push(subItem);
                        });
                    });


                    function getByFind(id) {
                        return tempDropdowns.filter(x => x.attributeValueId === id);
                    }

                    //type attributeValueTypes
                    angular.forEach($scope.AppraisalDropdowns, function (Item) {
                        angular.forEach(Item.attributeValueTypes, function (subItem) {
                            tempTypeDropdowns.push(subItem);
                        });
                    });

                    function getByFindType(id) {
                        var value = tempTypeDropdowns.filter(x => x.attributeValueTypeId === id);
                        var res = value[0];
                        if (res)
                            return res.atttibuteType;
                        else
                            return "";
                    }

                    var itemCategory = null;
                    if ($scope.Appraisal.ItemCategory && $scope.Appraisal.ItemCategory.attributeValueId)
                        itemCategory = getByFind($scope.Appraisal.ItemCategory.attributeValueId);

                    if (itemCategory != null)
                        $scope.itemCategoryValue = itemCategory[0].atttibuteValue;
                    else
                        $scope.itemCategoryValue = "";

                    var itemType = null;
                    if ($scope.Appraisal.ItemType && $scope.Appraisal.ItemType.attributeValueTypeId)
                        $scope.itemTypeValue = getByFindType($scope.Appraisal.ItemType.attributeValueTypeId);


                    var speedcheckData = {};
                    var diamonds = [];
                    var gemstones = [];
                    //var pearls = [];



                    // console.log(data);
                    var unitWeightTemp = "";
                    var metalTypeTemp = "";
                    var mountingDetails = {};


                    //"accentDiamonds" : $scope.diamondItems,
                    //var stoneDetails = $scope.gemstoneItems;
                    //chain
                    var unitWeightTemp = "";
                    var metalTypeTemp = "";
                    var chainDetails = {};


                    if ($scope.Appraisal.Chain) {


                        var weigtChain = 0.0;

                        if ($scope.Appraisal.Chain.MetalWeight && $scope.Appraisal.Chain.MetalWeight.weight) {
                            weigtChain = $scope.Appraisal.Chain.MetalWeight.weight;
                        }
                        if ($scope.Appraisal.Chain.MetalWeight && $scope.Appraisal.Chain.MetalWeight.MetalUnit && $scope.Appraisal.Chain.MetalWeight.MetalUnit.attributeValueId)
                            unitWeightTemp = getByFind($scope.Appraisal.Chain.MetalWeight.MetalUnit.attributeValueId);


                        if ($scope.Appraisal.Chain.MetalType && $scope.Appraisal.Chain.MetalType.attributeValueId)
                            metalTypeTemp = getByFind($scope.Appraisal.Chain.MetalType.attributeValueId);




                        var weigtMounting = 0.0;
                        var unitOfMeasure = "";

                        var metalType = "";



                        if (unitWeightTemp && unitWeightTemp != 0.0 && $scope.metalWeightMap[unitWeightTemp[0].atttibuteValue]) {
                            unitOfMeasure = $scope.metalWeightMap[unitWeightTemp[0].atttibuteValue];
                        }

                        if (metalTypeTemp && metalTypeTemp != "" && $scope.metalTypeMap[metalTypeTemp[0].atttibuteValue])
                            metalType = $scope.metalTypeMap[metalTypeTemp[0].atttibuteValue];


                        chainDetails = {


                            "metalWeight": weigtChain,


                            "unitOfMeasure": unitOfMeasure,


                            "metalType": metalType
                        };
                    } else {
                        unitWeightTemp = "";
                        metalTypeTemp = "";

                    }




                    var diamondDetails = $scope.diamondItems;
                    var stoneDetails = $scope.gemstoneItems;


                    var pearlDetails = $scope.pearlItems;

                    angular.forEach(diamondDetails, function (Item) {

                        var scDiamond = {};
                        var claritytemp;
                        var cutGradetemp;
                        var colorTemp;
                        var gemLabTemp;
                        var shapeTemp;

                        if (Item) {


                            var dColor = "";
                            var dClarity = "";
                            var dCutGrade = "";
                            var dGemlab = "";
                            var dShape = "";
                            var dClarityMax = "";
                            var dColorMax = "";

                            if (Item.colorFrom && Item.colorFrom.attributeValueId) {

                                colorTemp = getByFind(Item.colorFrom.attributeValueId)
                                dColor = colorTemp[0].atttibuteValue;
                            }
                            if (Item.clarityFrom && Item.clarityFrom.attributeValueId) {

                                claritytemp = getByFind(Item.clarityFrom.attributeValueId);
                                dClarity = claritytemp[0].atttibuteValue;

                                if (dClarity == 'SI')
                                    dClarity = "SI1";

                                if (dClarity == 'SI3')
                                    dClarity = "I1";
                                if (dClarity == 'VVS')
                                    dClarity = 'VVS1';

                                if (dClarity == 'VS')
                                    dClarity = 'VS1';

                                if (dClarity == 'FL')
                                    dClarity = 'IF';


                            }

                            if (Item.colorTo && Item.colorTo.attributeValueId) {

                                colorTemp = getByFind(Item.colorTo.attributeValueId)
                                dColorMax = colorTemp[0].atttibuteValue;
                            }
                            if (Item.clarityTo && Item.clarityTo.attributeValueId) {

                                claritytemp = getByFind(Item.clarityTo.attributeValueId);
                                dClarityMax = claritytemp[0].atttibuteValue;

                                if (dClarityMax == 'SI')
                                    dClarityMax = "SI1";

                                if (dClarityMax == 'SI3')
                                    dClarityMax = "I1";
                                if (dClarityMax == 'VVS')
                                    dClarityMax = 'VVS1';

                                if (dClarityMax == 'VS')
                                    dClarityMax = 'VS1';

                                if (dClarityMax == 'FL')
                                    dClarityMax = 'IF';


                            }

                            if (Item.cutGrade && Item.cutGrade.attributeValueId) {

                                cutGradetemp = getByFind(Item.cutGrade.attributeValueId);
                                dCutGrade = $scope.cutGradeMap[cutGradetemp[0].atttibuteValue];
                            }

                            // centerStone.diamond.cutGrade.attributeValueId



                            if (Item.gemlab && Item.gemlab.attributeValueId) {
                                gemLabTemp = getByFind(Item.gemlab.attributeValueId);
                                dGemlab = gemLabTemp[0].atttibuteValue;
                            }

                            if (Item.shape && Item.shape.attributeValueId) {
                                shapeTemp = getByFind(Item.shape.attributeValueId)
                                dShape = shapeTemp[0].atttibuteValue;
                            }


                            scDiamond.diamondUID = Item.id,
                                scDiamond.caratWeight = (Item.caratWeight) ? Item.caratWeight : 0.0,
                                scDiamond.color = dColor,
                                scDiamond.clarity = dClarity,
                                scDiamond.cutGrade = dCutGrade,
                                scDiamond.gemlab = dGemlab,
                                scDiamond.shape = dShape,
                                scDiamond.quantity = (Item.quantity) ? Item.quantity : 0,
                                scDiamond.maxColor = dColorMax,
                                scDiamond.maxClarity = dClarityMax,

                                diamonds.push(scDiamond);
                        }



                    });

                    angular.forEach(stoneDetails, function (Item) {

                        var scStone = {};

                        //attributeValueId
                        var typeTemp;
                        var shapeTemp;
                        var qualityTemp;
                        var gradeTemp;

                        if (Item) {
                            scStone.gemstoneUID = Item.id,

                                typeTemp = (Item.type && Item.type.attributeValueId) ? getByFind(Item.type.attributeValueId) : "";
                            scStone.type = (typeTemp && typeTemp != "") ? typeTemp[0].atttibuteValue : "",

                                scStone.totalWeight = (Item.weight) ? Item.weight : 0.0,
                                scStone.quantity = (Item.quantity) ? Item.quantity : 0,

                                shapeTemp = (Item.shape && Item.shape.attributeValueId) ? getByFind(Item.shape.attributeValueId) : "";
                            scStone.shape = (shapeTemp && shapeTemp != "") ? shapeTemp[0].atttibuteValue : "",

                                qualityTemp = (Item.clarity && Item.clarity.attributeValueId) ? getByFind(Item.clarity.attributeValueId) : "";
                            scStone.quality = (qualityTemp && qualityTemp != "") ? qualityTemp[0].atttibuteValue : "",

                                gemstones.push(scStone);
                        }





                    });



                    if ($scope.Appraisal.Mounting) {

                        if ($scope.Appraisal.Mounting.MetalWeight && $scope.Appraisal.Mounting.MetalWeight.MetalUnit && $scope.Appraisal.Mounting.MetalWeight.MetalUnit.attributeValueId)
                            unitWeightTemp = getByFind($scope.Appraisal.Mounting.MetalWeight.MetalUnit.attributeValueId);

                        if ($scope.Appraisal.Mounting.MetalType && $scope.Appraisal.Mounting.MetalType.attributeValueId)
                            metalTypeTemp = getByFind($scope.Appraisal.Mounting.MetalType.attributeValueId);

                        var weigtMounting = 0.0;
                        var unitOfMeasure = "";

                        var metalType = "";

                        if ($scope.Appraisal.Mounting && $scope.Appraisal.Mounting.MetalWeight && $scope.Appraisal.Mounting.MetalWeight.weight) {
                            weigtMounting = $scope.Appraisal.Mounting.MetalWeight.weight;
                        }

                        if (unitWeightTemp != "" && $scope.metalWeightMap[unitWeightTemp[0].atttibuteValue]) {
                            unitOfMeasure = $scope.metalWeightMap[unitWeightTemp[0].atttibuteValue];
                        }

                        if (metalTypeTemp != "" && $scope.metalTypeMap[metalTypeTemp[0].atttibuteValue])
                            metalType = $scope.metalTypeMap[metalTypeTemp[0].atttibuteValue];

                        var isCustom = '';
                        angular.forEach($scope.customList, function (item) {

                            if (item != null && $scope.Appraisal.Custom != null) {
                                if (item.attributeValueId === $scope.Appraisal.Custom.attributeValueId) {
                                    if (item.atttibuteValue === 'Yes')
                                        isCustom = 'Yes';
                                    else
                                        isCustom = 'No';
                                }
                            }
                        });


                        mountingDetails = {
                            "metalWeight": weigtMounting,
                            "unitOfMeasure": unitOfMeasure,
                            "metalType": metalType,
                            "accentDiamonds": diamonds,
                            "accentGemstones": gemstones,
                            "isCustom": isCustom
                        };
                    } else {
                        unitWeightTemp = "";
                        metalTypeTemp = "";

                    }
                    //Pearl
                    /* angular.forEach(pearlDetails, function (Item) {

                        var scPearl = {};

                        //attributeValueId
                        var typeTemp;
                        var shapeTemp;
                        var qualityTemp;
                        var gradeTemp;

                        if(Item && Item.type && Item.radius && Item.stoneCount){
                            scPearl.pearlUID = Item.id,

                            typeTemp = getByFind(Item.type.attributeValueId);
                            scPearl.type = typeTemp[0].atttibuteValue,

                            scPearl.radius = Item.radius,
                            scPearl.quantity = Item.stoneCount,

                            shapeTemp = getByFind(Item.shape.attributeValueId);
                            scPearl.shape = shapeTemp[0].atttibuteValue;

                            qualityTemp = getByFind(Item.quality.attributeValueId);
                            scPearl.quality = qualityTemp[0].atttibuteValue;




                            pearls.push(scPearl);
                        }





                    });
                    */

                    var centerDiamonds = [];
                    var centerDiamond = {};

                    if ($scope.centerStone.diamond || ($scope.pairedDiamondItems && $scope.pairedDiamondItems.length > 1)) {

                        var dColor = "";
                        var dClarity = "";
                        var dCutGrade = "";
                        var dGemlab = "";
                        var dShape = "";
                        var dClarityMax = "";
                        var dColorMax = "";

                        if (($scope.centerStone.diamond != null || $scope.centerStone.diamond != undefined ? Object.keys($scope.centerStone.diamond).length != 0 : false) && checkAllfieldsOfDiamondNonArray($scope.centerStone.diamond)) {

                            var Item = $scope.centerStone.diamond;
                            if (Item.colorFrom && Item.colorFrom.attributeValueId) {

                                colorTemp = getByFind(Item.colorFrom.attributeValueId)
                                dColor = colorTemp[0].atttibuteValue;
                            }
                            if (Item.clarityFrom && Item.clarityFrom.attributeValueId) {

                                claritytemp = getByFind(Item.clarityFrom.attributeValueId);
                                dClarity = claritytemp[0].atttibuteValue;

                                if (dClarity == 'SI')
                                    dClarity = "SI1";

                                if (dClarity == 'SI3')
                                    dClarity = "I1";

                                if (dClarity == 'VVS')
                                    dClarity = 'VVS1';

                                if (dClarity == 'VS')
                                    dClarity = 'VS1';

                                if (dClarity == 'FL')
                                    dClarity = 'IF';
                            }

                            if (Item.colorTo && Item.colorTo.attributeValueId) {

                                colorTemp = getByFind(Item.colorTo.attributeValueId)
                                dColorMax = colorTemp[0].atttibuteValue;
                            }
                            if (Item.clarityTo && Item.clarityTo.attributeValueId) {

                                claritytemp = getByFind(Item.clarityTo.attributeValueId);
                                dClarityMax = claritytemp[0].atttibuteValue;

                                if (dClarityMax == 'SI')
                                    dClarityMax = "SI1";

                                if (dClarityMax == 'SI3')
                                    dClarityMax = "I1";
                                if (dClarityMax == 'VVS')
                                    dClarityMax = 'VVS1';

                                if (dClarityMax == 'VS')
                                    dClarityMax = 'VS1';

                                if (dClarityMax == 'FL')
                                    dClarityMax = 'IF';


                            }

                            if (Item.cutGrade && Item.cutGrade.attributeValueId) {

                                cutGradetemp = getByFind(Item.cutGrade.attributeValueId);
                                dCutGrade = $scope.cutGradeMap[cutGradetemp[0].atttibuteValue];
                            }

                            if (Item.gemlab && Item.gemlab.attributeValueId) {
                                gemLabTemp = getByFind(Item.gemlab.attributeValueId);
                                dGemlab = gemLabTemp[0].atttibuteValue;
                            }

                            if (Item.shape && Item.shape.attributeValueId) {
                                shapeTemp = getByFind(Item.shape.attributeValueId)
                                dShape = shapeTemp[0].atttibuteValue;
                            }


                            centerDiamond.diamondUID = Item.id,
                                centerDiamond.caratWeight = (Item.caratWeight) ? Item.caratWeight : 0.0,
                                centerDiamond.color = dColor,
                                centerDiamond.clarity = dClarity,
                                centerDiamond.cutGrade = dCutGrade,

                                centerDiamond.gemlab = dGemlab,
                                centerDiamond.shape = dShape,
                                centerDiamond.quantity = Item.quantity;
                            centerDiamond.maxColor = dColorMax,
                                centerDiamond.maxClarity = dClarityMax,
                                // centerDiamond.quantity = $scope.showTwo ? 2 : 0

                                centerDiamonds.push(centerDiamond);
                        }


                        if ($scope.pairedDiamondItems.length != 0 && $scope.pairedDiamondItems.length < 2) {
                            var Item = $scope.centerStone.diamond;
                            if (Item.colorFrom && Item.colorFrom.attributeValueId) {

                                colorTemp = getByFind(Item.colorFrom.attributeValueId)
                                dColor = colorTemp[0].atttibuteValue;
                            }
                            if (Item.clarityFrom && Item.clarityFrom.attributeValueId) {

                                claritytemp = getByFind(Item.clarityFrom.attributeValueId);
                                dClarity = claritytemp[0].atttibuteValue;

                                if (dClarity == 'SI')
                                    dClarity = "SI1";

                                if (dClarity == 'SI3')
                                    dClarity = "I1";
                                if (dClarity == 'VVS')
                                    dClarity = 'VVS1';

                                if (dClarity == 'VS')
                                    dClarity = 'VS1';

                                if (dClarity == 'FL')
                                    dClarity = 'IF';
                            }

                            if (Item.colorTo && Item.colorTo.attributeValueId) {

                                colorTemp = getByFind(Item.colorTo.attributeValueId)
                                dColorMax = colorTemp[0].atttibuteValue;
                            }
                            if (Item.clarityTo && Item.clarityTo.attributeValueId) {

                                claritytemp = getByFind(Item.clarityTo.attributeValueId);
                                dClarityMax = claritytemp[0].atttibuteValue;

                                if (dClarityMax == 'SI')
                                    dClarityMax = "SI1";

                                if (dClarityMax == 'SI3')
                                    dClarityMax = "I1";
                                if (dClarityMax == 'VVS')
                                    dClarityMax = 'VVS1';

                                if (dClarityMax == 'VS')
                                    dClarityMax = 'VS1';

                                if (dClarityMax == 'FL')
                                    dClarityMax = 'IF';


                            }

                            if (Item.cutGrade && Item.cutGrade.attributeValueId) {

                                cutGradetemp = getByFind(Item.cutGrade.attributeValueId);
                                dCutGrade = $scope.cutGradeMap[cutGradetemp[0].atttibuteValue];
                            }

                            if (Item.gemlab && Item.gemlab.attributeValueId) {
                                gemLabTemp = getByFind(Item.gemlab.attributeValueId);
                                dGemlab = gemLabTemp[0].atttibuteValue;
                            }

                            if (Item.shape && Item.shape.attributeValueId) {
                                shapeTemp = getByFind(Item.shape.attributeValueId)
                                dShape = shapeTemp[0].atttibuteValue;
                            }


                            centerDiamond.diamondUID = Item.id,
                                centerDiamond.caratWeight = (Item.caratWeight) ? Item.caratWeight : 0.0,
                                centerDiamond.color = dColor,
                                centerDiamond.clarity = dClarity,
                                centerDiamond.cutGrade = dCutGrade,

                                centerDiamond.gemlab = dGemlab,
                                centerDiamond.shape = dShape,
                                centerDiamond.quantity = (Item.quantity) ? Item.quantity : 0,
                                centerDiamond.maxColor = dColorMax,
                                centerDiamond.maxClarity = dClarityMax,

                                centerDiamonds.push(centerDiamond);
                        } else if ($scope.pairedDiamondItems && $scope.pairedDiamondItems.length > 0 && checkAllfieldsOfDiamond($scope.pairedDiamondItems)) {
                            angular.forEach($scope.pairedDiamondItems, function (Item) {

                                var centerDiamond = {};

                                if (Item.colorFrom && Item.colorFrom.attributeValueId) {

                                    colorTemp = getByFind(Item.colorFrom.attributeValueId)
                                    dColor = colorTemp[0].atttibuteValue;
                                }
                                if (Item.clarityFrom && Item.clarityFrom.attributeValueId) {

                                    claritytemp = getByFind(Item.clarityFrom.attributeValueId);
                                    dClarity = claritytemp[0].atttibuteValue;

                                    if (dClarity == 'SI')
                                        dClarity = "SI1";

                                    if (dClarity == 'SI3')
                                        dClarity = "I1";

                                    if (dClarity == 'VVS')
                                        dClarity = 'VVS1';

                                    if (dClarity == 'VS')
                                        dClarity = 'VS1';

                                    if (dClarity == 'FL')
                                        dClarity = 'IF';
                                }
                                if (Item.colorTo && Item.colorTo.attributeValueId) {

                                    colorTemp = getByFind(Item.colorTo.attributeValueId)
                                    dColorMax = colorTemp[0].atttibuteValue;
                                }
                                if (Item.clarityTo && Item.clarityTo.attributeValueId) {

                                    claritytemp = getByFind(Item.clarityTo.attributeValueId);
                                    dClarityMax = claritytemp[0].atttibuteValue;

                                    if (dClarityMax == 'SI')
                                        dClarityMax = "SI1";

                                    if (dClarityMax == 'SI3')
                                        dClarityMax = "I1";
                                    if (dClarityMax == 'VVS')
                                        dClarityMax = 'VVS1';

                                    if (dClarityMax == 'VS')
                                        dClarityMax = 'VS1';

                                    if (dClarityMax == 'FL')
                                        dClarityMax = 'IF';


                                }


                                if (Item.cutGrade && Item.cutGrade.attributeValueId) {

                                    cutGradetemp = getByFind(Item.cutGrade.attributeValueId);
                                    dCutGrade = $scope.cutGradeMap[cutGradetemp[0].atttibuteValue];
                                }


                                if (Item.gemlab && Item.gemlab.attributeValueId) {
                                    gemLabTemp = getByFind(Item.gemlab.attributeValueId);
                                    dGemlab = gemLabTemp[0].atttibuteValue;
                                }

                                if (Item.shape && Item.shape.attributeValueId) {
                                    shapeTemp = getByFind(Item.shape.attributeValueId)
                                    dShape = shapeTemp[0].atttibuteValue;
                                }


                                centerDiamond.diamondUID = Item.id,
                                    centerDiamond.caratWeight = (Item.caratWeight) ? Item.caratWeight : 0.0,
                                    centerDiamond.color = dColor,
                                    centerDiamond.clarity = dClarity,
                                    centerDiamond.cutGrade = dCutGrade,
                                    centerDiamond.gemlab = dGemlab,
                                    centerDiamond.shape = dShape,
                                    centerDiamond.quantity = (Item.quantity) ? Item.quantity : 0,
                                    centerDiamond.maxColor = dColorMax,
                                    centerDiamond.maxClarity = dClarityMax,

                                    centerDiamonds.push(centerDiamond);

                            });
                        }

                    }

                    var centerGemstones = [];
                    var centerGemstone = {};

                    if ($scope.centerStone.gemstone || ($scope.pairedGemstoneItems && $scope.pairedGemstoneItems.length > 1)) {
                        var typeTemp;
                        var shapeTemp;
                        var qualityTemp;

                        if (($scope.centerStone.gemstone != null || $scope.centerStone.gemstone != undefined ? Object.keys($scope.centerStone.gemstone).length != 0 : false) && $scope.pairedGemstoneItems.length == 0) {

                            var Item = $scope.centerStone.gemstone;
                            centerGemstone.gemstoneUID = 1;
                            centerGemstone.quantity = $scope.showTwo ? 2 : 0;

                            typeTemp = (Item.type && Item.type.attributeValueId) ? getByFind(Item.type.attributeValueId) : "";
                            centerGemstone.type = (typeTemp && typeTemp != "") ? typeTemp[0].atttibuteValue : "";

                            centerGemstone.totalWeight = (Item.weight) ? Item.weight : 0.0;

                            shapeTemp = (Item.shape && Item.shape.attributeValueId) ? getByFind(Item.shape.attributeValueId) : "";
                            centerGemstone.shape = (shapeTemp && shapeTemp != "") ? shapeTemp[0].atttibuteValue : "",

                                //clarity
                                qualityTemp = (Item.clarity && Item.clarity.attributeValueId) ? getByFind(Item.clarity.attributeValueId) : "";
                            centerGemstone.quality = (qualityTemp && qualityTemp != "") ? qualityTemp[0].atttibuteValue : "",

                                centerGemstones.push(centerGemstone);


                        }

                        if ($scope.pairedGemstoneItems.length != 0 && $scope.pairedGemstoneItems.length < 2) {

                            var Item = $scope.centerStone.gemstone;
                            centerGemstone.gemstoneUID = 1;
                            centerGemstone.quantity = Item.quantity ? Item.quantity : 0;

                            typeTemp = (Item.type && Item.type.attributeValueId) ? getByFind(Item.type.attributeValueId) : "";
                            centerGemstone.type = (typeTemp && typeTemp != "") ? typeTemp[0].atttibuteValue : "";

                            centerGemstone.totalWeight = (Item.weight) ? Item.weight : 0.0;

                            shapeTemp = (Item.shape && Item.shape.attributeValueId) ? getByFind(Item.shape.attributeValueId) : "";
                            centerGemstone.shape = (shapeTemp && shapeTemp != "") ? shapeTemp[0].atttibuteValue : "",

                                //clarity
                                qualityTemp = (Item.clarity && Item.clarity.attributeValueId) ? getByFind(Item.clarity.attributeValueId) : "";
                            centerGemstone.quality = (qualityTemp && qualityTemp != "") ? qualityTemp[0].atttibuteValue : "",

                                centerGemstones.push(centerGemstone);


                        } else {

                            angular.forEach($scope.pairedGemstoneItems, function (Item) {
                                var centerGemstone = {};
                                centerGemstone.gemstoneUID = Item.id;
                                centerGemstone.quantity = Item.quantity ? Item.quantity : 0;

                                typeTemp = (Item.type && Item.type.attributeValueId) ? getByFind(Item.type.attributeValueId) : "";
                                centerGemstone.type = (typeTemp && typeTemp != "") ? typeTemp[0].atttibuteValue : "";

                                centerGemstone.totalWeight = (Item.weight) ? Item.weight : 0.0;

                                shapeTemp = (Item.shape && Item.shape.attributeValueId) ? getByFind(Item.shape.attributeValueId) : "";
                                centerGemstone.shape = (shapeTemp && shapeTemp != "") ? shapeTemp[0].atttibuteValue : "",

                                    //clarity
                                    qualityTemp = (Item.clarity && Item.clarity.attributeValueId) ? getByFind(Item.clarity.attributeValueId) : "";
                                centerGemstone.quality = (qualityTemp && qualityTemp != "") ? qualityTemp[0].atttibuteValue : "",

                                    centerGemstones.push(centerGemstone);
                            });

                        }
                    }


                    $scope.weddingBandList = [];
                    if ($scope.weddingItems.length > 0) {
                        angular.forEach($scope.weddingItems, function (data) {
                            var mounting = data.mounting;
                            if (mounting) {
                                if (mounting.metalUnitWeight && mounting.metalUnitWeight.attributeValueId)
                                    unitWeightTemp = getByFind(mounting.metalUnitWeight.attributeValueId);

                                if (mounting.typeOfMetal && mounting.typeOfMetal.attributeValueId)
                                    metalTypeTemp = getByFind(mounting.typeOfMetal.attributeValueId);

                                var weigtMounting = 0.0;
                                var unitOfMeasure = "";

                                var metalType = "";

                                if (mounting && mounting.metalWeight) {
                                    weigtMounting = mounting.metalWeight;
                                }

                                if (unitWeightTemp != "" && $scope.metalWeightMap[unitWeightTemp[0].atttibuteValue]) {
                                    unitOfMeasure = $scope.metalWeightMap[unitWeightTemp[0].atttibuteValue];
                                }

                                if (metalTypeTemp != "" && $scope.metalTypeMap[metalTypeTemp[0].atttibuteValue])
                                    metalType = $scope.metalTypeMap[metalTypeTemp[0].atttibuteValue];
                            }

                            var isCustom = '';
                            angular.forEach($scope.customList, function (item) {
                                if (item != null && data.custom != null) {
                                    if (item.attributeValueId === data.custom.attributeValueId) {
                                        if (item.atttibuteValue === 'Yes')
                                            isCustom = 'Yes';
                                        else
                                            isCustom = 'No';
                                    }
                                }
                            });

                            var wedDiamondDetails = mounting.diamondDetails;
                            var wedStoneDetails = mounting.stoneDetails;

                            var weddingDiamonds = [];
                            if (wedDiamondDetails) {
                                angular.forEach(wedDiamondDetails, function (Item) {
                                    var scDiamond = {};
                                    var claritytemp;
                                    var cutGradetemp;
                                    var colorTemp;
                                    var gemLabTemp;
                                    var shapeTemp;
                                    if (Item) {
                                        var dColor = "";
                                        var dClarity = "";
                                        var dCutGrade = "";
                                        var dGemlab = "";
                                        var dShape = "";
                                        var dClarityMax = "";
                                        var dColorMax = "";

                                        if (Item.colorFrom && Item.colorFrom.attributeValueId) {
                                            colorTemp = getByFind(Item.colorFrom.attributeValueId)
                                            dColor = colorTemp[0].atttibuteValue;
                                        }

                                        if (Item.clarityFrom && Item.clarityFrom.attributeValueId) {
                                            claritytemp = getByFind(Item.clarityFrom.attributeValueId);
                                            dClarity = claritytemp[0].atttibuteValue;
                                            if (dClarity == 'SI')
                                                dClarity = "SI1";
                                            if (dClarity == 'SI3')
                                                dClarity = "I1";
                                            if (dClarity == 'VVS')
                                                dClarity = 'VVS1';
                                            if (dClarity == 'VS')
                                                dClarity = 'VS1';
                                            if (dClarity == 'FL')
                                                dClarity = 'IF';
                                        }

                                        if (Item.colorTo && Item.colorTo.attributeValueId) {

                                            colorTemp = getByFind(Item.colorTo.attributeValueId)
                                            dColorMax = colorTemp[0].atttibuteValue;
                                        }
                                        if (Item.clarityTo && Item.clarityTo.attributeValueId) {

                                            claritytemp = getByFind(Item.clarityTo.attributeValueId);
                                            dClarityMax = claritytemp[0].atttibuteValue;

                                            if (dClarityMax == 'SI')
                                                dClarityMax = "SI1";

                                            if (dClarityMax == 'SI3')
                                                dClarityMax = "I1";
                                            if (dClarityMax == 'VVS')
                                                dClarityMax = 'VVS1';

                                            if (dClarityMax == 'VS')
                                                dClarityMax = 'VS1';

                                            if (dClarityMax == 'FL')
                                                dClarityMax = 'IF';


                                        }
                                        if (Item.cutGrade && Item.cutGrade.attributeValueId) {
                                            cutGradetemp = getByFind(Item.cutGrade.attributeValueId);
                                            dCutGrade = $scope.cutGradeMap[cutGradetemp[0].atttibuteValue];
                                        }

                                        if (Item.gemlab && Item.gemlab.attributeValueId) {
                                            gemLabTemp = getByFind(Item.gemlab.attributeValueId);
                                            dGemlab = gemLabTemp[0].atttibuteValue;
                                        }

                                        if (Item.shape && Item.shape.attributeValueId) {
                                            shapeTemp = getByFind(Item.shape.attributeValueId)
                                            dShape = shapeTemp[0].atttibuteValue;
                                        }


                                        scDiamond.diamondUID = Item.id,
                                            scDiamond.caratWeight = (Item.caratWeight) ? Item.caratWeight : 0.0,
                                            scDiamond.color = dColor,
                                            scDiamond.clarity = dClarity,
                                            scDiamond.cutGrade = dCutGrade,
                                            scDiamond.gemlab = dGemlab,
                                            scDiamond.shape = dShape,
                                            scDiamond.quantity = (Item.quantity) ? Item.quantity : 0,
                                            scDiamond.maxColor = dColorMax,
                                            scDiamond.maxClarity = dClarityMax,

                                            weddingDiamonds.push(scDiamond);
                                    }



                                });

                                var weddingStones = [];
                                angular.forEach(wedStoneDetails, function (Item) {
                                    var scStone = {};
                                    //attributeValueId
                                    var typeTemp;
                                    var shapeTemp;
                                    var qualityTemp;
                                    var gradeTemp;
                                    if (Item) {
                                        scStone.gemstoneUID = Item.id,

                                            typeTemp = (Item.type && Item.type.attributeValueId) ? getByFind(Item.type.attributeValueId) : "";
                                        scStone.type = (typeTemp && typeTemp != "") ? typeTemp[0].atttibuteValue : "",

                                            scStone.totalWeight = (Item.weight) ? Item.weight : 0.0,
                                            scStone.quantity = (Item.quantity) ? Item.quantity : 0,

                                            shapeTemp = (Item.shape && Item.shape.attributeValueId) ? getByFind(Item.shape.attributeValueId) : "";
                                        scStone.shape = (shapeTemp && shapeTemp != "") ? shapeTemp[0].atttibuteValue : "",

                                            qualityTemp = (Item.clarity && Item.clarity.attributeValueId) ? getByFind(Item.clarity.attributeValueId) : "";
                                        scStone.quality = (qualityTemp && qualityTemp != "") ? qualityTemp[0].atttibuteValue : "",
                                            weddingStones.push(scStone);
                                    }
                                });
                            }

                            $scope.weddingBandList.push({
                                'metalWeight': weigtMounting,
                                'unitOfMeasure': unitOfMeasure,
                                'metalType': metalType,
                                'accentDiamonds': weddingDiamonds,
                                'accentGemstones': weddingStones,
                                'isCustom': isCustom
                            })

                        });
                    }


                    if ($scope.Appraisal.ItemCategory == null || $scope.Appraisal.ItemType == null ||
                        !angular.isDefined($scope.Appraisal.ItemCategory) || !angular.isDefined($scope.Appraisal.ItemType)) {

                        mountingDetails = {
                            "metalWeight": 0,
                            "unitOfMeasure": '',
                            "metalType": '',
                            "accentDiamonds": [],
                            "accentGemstones": [],
                            "isCustom": "No"
                        };
                        chainDetails = {
                            "metalWeight": 0,
                            "unitOfMeasure": '',
                            "metalType": ''
                        };
                    }


                    speedcheckData.diamonds = centerDiamonds;
                    speedcheckData.gemstones = centerGemstones;
                    // speedcheckData.pearls = pearls;
                    speedcheckData.mounting = mountingDetails;
                    speedcheckData.chain = chainDetails;
                    speedcheckData.weddingBandList = $scope.weddingBandList;

                    //getSpeedcheValues
                    //data.append("appraisalDocuments", JSON.stringify(appraisalDocuments[0]));




                    var promis = ComparableFilterService.getSpeedcheValues(speedcheckData);

                    promis.then(function (success) {

                        var result = success.data.data;
                        if ($scope.appData && $scope.appData.insuranceReplaceCost) {

                            $scope.isIRCost = true;
                            $scope.isRetailValue = false;
                            $scope.both = false;

                            var tempDiamond = [];
                            $scope.summaryTotal = 0;

                            var scMaunting = result.mountingCost;

                            var scStoneDetails;
                            var scDiamondDetails;

                            var scCenterDiamond;
                            var scCenterGemstone;
                            var scCenterDiamonds = [];
                            scCenterDiamond = (result.diamonds) ? result.diamonds.diamonds : null;
                            scCenterGemstone = result.gemstones ? result.gemstones.gemstones : null;

                            if (scCenterDiamond && scCenterDiamond.diamonds) {
                                scCenterDiamonds = scCenterDiamond.diamonds;
                            }

                            if (scMaunting) {
                                scStoneDetails = scMaunting.accentGemstonesValue;
                                scDiamondDetails = scMaunting.accentDiamondsValue;
                            }

                            if (scDiamondDetails)
                                var scDiamonds = scDiamondDetails.diamonds;

                            if (scStoneDetails)
                                var scGemstones = scStoneDetails.gemstones;

                            var scChain = result.chain;
                            if (diamondDetails) {
                                for (var i = 0; i < diamondDetails.length; i++) {

                                    var diamondDetail = diamondDetails[i];

                                    if (scDiamonds && scDiamonds.length > 0 && scDiamonds[i].prices != null && scDiamonds[i].prices.insuranceReplacementCost != null) {
                                        diamondDetail.scDiamondEstimate = roundOf2Decimal(scDiamonds[i].prices.insuranceReplacementCost);

                                    } else {
                                        diamondDetail.scDiamondEstimate = 0.0;
                                    }


                                    tempDiamond.push(diamondDetail);
                                }

                                diamondDetails = tempDiamond;
                                $scope.diamondItems = diamondDetails;
                            }

                            //totasl estimation for diamonds
                            if (scDiamondDetails && scDiamondDetails.diamondInsuranceReplacementCost > 0)
                                $scope.diamondInsuranceReplacementCost = roundOf2Decimal(scDiamondDetails.diamondInsuranceReplacementCost);
                            else
                                $scope.diamondInsuranceReplacementCost = 0.0;

                            //recommend purpose
                            if (scDiamondDetails && (!scDiamondDetails.diamondInsuranceReplacementCost || scDiamondDetails.diamondInsuranceReplacementCost == 0))
                                $scope.isAttributeZero = true;

                            $scope.summaryTotal += parseFloat($scope.diamondInsuranceReplacementCost);

                            //stone details
                            var tempStoneDetail = [];
                            if (stoneDetails) {
                                for (var i = 0; i < stoneDetails.length; i++) {

                                    var stoneDetail = stoneDetails[i];
                                    if (scGemstones && scGemstones.length > 0 && scGemstones[i].prices != null && scGemstones[i].prices.insuranceReplacementCost != null) {
                                        stoneDetail.scStoneEstimate = roundOf2Decimal(scGemstones[i].prices.insuranceReplacementCost);
                                    } else {
                                        stoneDetail.scStoneEstimate = 0.0;
                                    }


                                    tempStoneDetail.push(stoneDetail);
                                }
                                stoneDetails = tempStoneDetail;
                                $scope.gemstoneItems = stoneDetails;
                            }
                            //console.log(tempDiamond);




                            //center diamond

                            var tempCenterDiamondDetail = [];

                            if (centerDiamonds.length == 1 && $scope.centerStone.diamond != null) {
                                $scope.centerStone.diamond.scDiamondEstimate = (scCenterDiamond && scCenterDiamond.length > 0 && scCenterDiamond[0].prices != null && scCenterDiamond[0].prices.insuranceReplacementCost != null) ? roundOf2Decimal(scCenterDiamond[0].prices.insuranceReplacementCost) : 0.0;

                                //recpmmend purpose
                                if ((scCenterDiamond && scCenterDiamond.length > 0 && scCenterDiamond[0].prices != null && scCenterDiamond[0].prices.insuranceReplacementCost == null))
                                    $scope.isAttributeZero = true;
                            } else if ($scope.pairedDiamondItems) {
                                $scope.scDiamondEstimateTotal = 0;
                                for (var i = 0; i < $scope.pairedDiamondItems.length; i++) {
                                    var diamondDetail = $scope.pairedDiamondItems[i];
                                    if (scCenterDiamond && scCenterDiamond.length > 0 && scCenterDiamond.length > 0 && scCenterDiamond[i] && scCenterDiamond[i].prices && scCenterDiamond[i].prices != null && scCenterDiamond[i].prices.insuranceReplacementCost != null) {
                                        $scope.pairedDiamondItems[i].scDiamondEstimate = roundOf2Decimal(scCenterDiamond[i].prices.insuranceReplacementCost);
                                        $scope.scDiamondEstimateTotal += parseFloat($scope.pairedDiamondItems[i].scDiamondEstimate);
                                        //$scope.centerStone.diamond.scDiamondEstimate = $scope.scDiamondEstimateTotal;
                                    } else {
                                        $scope.pairedDiamondItems.scDiamondEstimate = 0.0;
                                    }
                                    if ($scope.pairedDiamondItems.scDiamondEstimate == 0)
                                        $scope.isAttributeZero = true;
                                }
                            }

                            //center stone

                            //stone details
                            var tempCenterStoneDetail = [];
                            if (centerGemstones.length == 1 && $scope.centerStone.gemstone != null) {
                                $scope.centerStone.gemstone.scStoneEstimate = (scCenterGemstone && scCenterGemstone.length > 0 && scCenterGemstone[0].prices != null && scCenterGemstone[0].prices.insuranceReplacementCost != null) ? roundOf2Decimal(scCenterGemstone[0].prices.insuranceReplacementCost) : 0.0;

                                if (scCenterGemstone && scCenterGemstone.length > 0 && scCenterGemstone[0].prices != null && !scCenterGemstone[0].prices.insuranceReplacementCost)
                                    $scope.isAttributeZero = true;
                            } else if ($scope.pairedGemstoneItems) {
                                $scope.scStoneEstimateTotal = 0;
                                for (var i = 0; i < $scope.pairedGemstoneItems.length; i++) {

                                    var stoneDetail = $scope.pairedGemstoneItems[i];
                                    if (scCenterGemstone && scCenterGemstone.length > 0 && scCenterGemstone[i] && scCenterGemstone[i].prices != null && scCenterGemstone[i].prices.insuranceReplacementCost != null) {
                                        $scope.pairedGemstoneItems[i].scStoneEstimate = roundOf2Decimal(scCenterGemstone[i].prices.insuranceReplacementCost);
                                        //$scope.scStoneEstimateTotal += parseFloat($scope.pairedGemstoneItems[i].scStoneEstimate);

                                    } else {
                                        $scope.pairedGemstoneItems[i].scStoneEstimate = 0.0;
                                    }

                                    if ($scope.pairedGemstoneItems[i].scStoneEstimate == 0)
                                        $scope.isAttributeZero = true;
                                }
                            }

                            //total estimation for gemstone
                            if (scStoneDetails && scStoneDetails.gemstoneInsuranceReplacementCost > 0)
                                $scope.gemstoneArtigemReplacementCost = roundOf2Decimal(scStoneDetails.gemstoneInsuranceReplacementCost);
                            else
                                $scope.gemstoneArtigemReplacementCost = 0.0;

                            //recpmmend purpose
                            if (scStoneDetails && (!scStoneDetails.gemstoneInsuranceReplacementCost || scStoneDetails.gemstoneInsuranceReplacementCost == 0))
                                $scope.isAttributeZero = true;


                            //total estimate for center diamond gemstone
                            $scope.scCenterDiamondTotal = (result.diamonds && result.diamonds.diamondInsuranceReplacementCost) ? result.diamonds.diamondInsuranceReplacementCost : 0.0;
                            $scope.scCenterStoneTotal = (result.gemstones && result.gemstones.gemstoneInsuranceReplacementCost) ? result.gemstones.gemstoneInsuranceReplacementCost : 0.0;

                            $scope.summaryTotal += parseFloat($scope.gemstoneArtigemReplacementCost);
                            $scope.summaryTotal += parseFloat($scope.scCenterDiamondTotal);
                            $scope.summaryTotal += parseFloat($scope.scCenterStoneTotal);

                            //mounting estimate
                            //total estimate for mounting
                            if (scMaunting && scMaunting != null && scMaunting.metalMounting != null && scMaunting.metalMounting.prices && scMaunting.metalMounting.prices.insuranceReplacementCost > 0)
                                $scope.Appraisal.ScTotalMountingPrice = parseFloat(roundOf2Decimal(scMaunting.metalMounting.prices.insuranceReplacementCost));
                            else
                                $scope.Appraisal.ScTotalMountingPrice = 0.0;

                            //recommend purpose
                            if (scMaunting && scMaunting != null && scMaunting.metalMounting != null && scMaunting.metalMounting.prices && !scMaunting.metalMounting.prices.insuranceReplacementCost)
                                $scope.isAttributeZero = true;
                            //total with accentstone
                            $scope.Appraisal.ScTotalMountingAccentStonePrice = (scMaunting && scMaunting.mountingInsuranceReplacementCost) ? roundOf2Decimal(scMaunting.mountingInsuranceReplacementCost) : 0.0;

                            $scope.summaryTotal += parseFloat($scope.Appraisal.ScTotalMountingPrice);

                            //chain estimates
                            if (scChain && scChain != null && scChain.prices != null && scChain.prices.insuranceReplacementCost > 0)
                                $scope.Appraisal.ScTotalChainPrice = roundOf2Decimal(scChain.prices.insuranceReplacementCost);
                            else
                                $scope.Appraisal.ScTotalChainPrice = 0.0;

                            $scope.summaryTotal += parseFloat($scope.Appraisal.ScTotalChainPrice);

                            //labour cosst
                            if (result.laborCost && result.laborCost > 0)
                                $scope.Appraisal.labourCost = roundOf2Decimal(result.laborCost);
                            else
                                $scope.Appraisal.labourCost = 0.0;

                            $scope.summaryTotal += parseFloat($scope.Appraisal.labourCost);

                            //totalSalvageCost
                            if (result.totalSalvageCost > 0)
                                $scope.totalSalvageCost = roundOf2Decimal(result.totalSalvageCost);
                            else
                                $scope.totalSalvageCost = 0.0;

                            //totalJeweleryCost
                            if (result.totalJeweleryCost > 0)
                                $scope.totalJeweleryCost = roundOf2Decimal(result.totalJeweleryCost);
                            else
                                $scope.totalJeweleryCost = 0.0;

                            //totalArtigemReplacementCost
                            if (result.totalArtigemReplacementCost > 0)
                                $scope.totalArtigemReplacementCost = roundOf2Decimal(result.totalArtigemReplacementCost);
                            else
                                $scope.totalArtigemReplacementCost = 0.0;

                            //totalInsuranceReplacementCost
                            if (result.totalInsuranceReplacementCost > 0)
                                $scope.totalInsuranceReplacementCost = roundOf2Decimal(result.totalInsuranceReplacementCost);
                            else
                                $scope.totalInsuranceReplacementCost = 0.0;

                            //totalRetailValue
                            if (result.totalRetailValue > 0)
                                $scope.totalRetailValue = roundOf2Decimal(result.totalRetailValue);
                            else
                                $scope.totalRetailValue = 0.0;

                            $scope.speedcheckSubmitDate = new Date();

                            if ($scope.totalInsuranceReplacementCost != null && parseFloat($scope.totalInsuranceReplacementCost) != 0) {
                                if (parseFloat($scope.totalInsuranceReplacementCost) > parseFloat($scope.Appraisal.AppraisalValue)) {
                                    // $("#speedCheck-Estimate").removeClass("text-green").addClass("text-red");
                                    $scope.Appraisal.scEstimateDescription = "Typical appraisals range from " + $filter('currency')(parseFloat($scope.totalInsuranceReplacementCost)) + " to " + $filter('currency')(parseFloat($scope.totalRetailValue)) + " depending on appraiser. Original appraisal value of " + $filter('currency')(parseFloat($scope.Appraisal.AppraisalValue)) + " is low. Suggest a new appraisal to the policyholder.";
                                    $scope.estimateText = 'red';
                                } else if (parseFloat($scope.totalInsuranceReplacementCost) <= parseFloat($scope.Appraisal.AppraisalValue)) {
                                    //$("#speedCheck-Estimate").removeClass("text-red").addClass("text-green");
                                    $scope.Appraisal.scEstimateDescription = "The item is insured adequately.";
                                    $scope.estimateText = 'green';
                                }
                            }

                            //WeddingBand.
                            $scope.showWeddingBandCost = false;
                            $scope.totalSetting = 0.0;
                            if (angular.isDefined(result.weddingBandCost) && result.weddingBandCost.length > 0) {
                                $scope.showWeddingBandCost = true;
                                var scWeddingBandCostList = result.weddingBandCost;
                                angular.forEach(scWeddingBandCostList, function (data, key) {
                                    var parentId = key;

                                    if (data.accentDiamondsValue && data.accentDiamondsValue.diamonds)
                                        var weddingDiamondCost = data.accentDiamondsValue.diamonds;
                                    if (data.accentGemstonesValue && data.accentGemstonesValue.gemstones)
                                        var weddingGemstoneCost = data.accentGemstonesValue.gemstones;

                                    var weddingBandDiamondTotal = 0;
                                    $scope.weddingItems[parentId].sc_totalWeddingBandDiamondsEstimate = 0;
                                    angular.forEach(weddingDiamondCost, function (data, key) {
                                        var childDiamondKey = key;
                                        if (data.prices && data.prices.insuranceReplacementCost != null) {
                                            var roundVal = roundOf2Decimal(data.prices.insuranceReplacementCost);
                                            weddingBandDiamondTotal += parseFloat(roundVal);
                                            $scope.weddingItems[parentId].mounting.diamondDetails[childDiamondKey].scDiamondEstimate = parseFloat(roundOf2Decimal(data.prices.insuranceReplacementCost));
                                            $scope.weddingItems[parentId].sc_totalWeddingBandDiamondsEstimate = parseFloat(weddingBandDiamondTotal);
                                        } else {
                                            $scope.weddingItems[parentId].mounting.diamondDetails[childDiamondKey].scDiamondEstimate = 0.0;
                                            $scope.weddingItems[parentId].sc_totalWeddingBandDiamondsEstimate = 0.0;
                                        }
                                    });

                                    $scope.summaryTotal += parseFloat(weddingBandDiamondTotal);
                                    if (!weddingBandDiamondTotal)
                                        $scope.isAttributeZero = true;

                                    var totalStoneValue = 0;
                                    $scope.weddingItems[parentId].sc_totalWeddingBandGemstonesEstimate = 0;
                                    angular.forEach(weddingGemstoneCost, function (data, key) {
                                        var childKey = key;
                                        if (data.prices && data.prices.insuranceReplacementCost != null) {
                                            var roundValue = roundOf2Decimal(data.prices.insuranceReplacementCost);
                                            totalStoneValue += parseFloat(roundValue);
                                            $scope.weddingItems[parentId].mounting.stoneDetails[childKey].scStoneEstimate = parseFloat(roundOf2Decimal(data.prices.insuranceReplacementCost));
                                            $scope.weddingItems[parentId].sc_totalWeddingBandGemstonesEstimate = parseFloat(totalStoneValue);
                                        } else {
                                            $scope.weddingItems[parentId].mounting.stoneDetails[childKey].scStoneEstimate = 0.0;
                                            $scope.weddingItems[parentId].sc_totalWeddingBandGemstonesEstimate = 0.0;
                                        }
                                    });

                                    if (!totalStoneValue)
                                        $scope.isAttributeZero = true;
                                    $scope.summaryTotal += parseFloat(totalStoneValue);

                                    var mountingCost = data.metalMounting;
                                    if (mountingCost.prices && mountingCost.prices.insuranceReplacementCost != null) {
                                        var roundVal = roundOf2Decimal(mountingCost.prices.insuranceReplacementCost);
                                        $scope.totalSetting += parseFloat(roundVal);
                                        $scope.weddingItems[parentId].mounting.scMountingEstimates = parseFloat(roundVal);
                                    } else {
                                        $scope.weddingItems[parentId].mounting.scMountingEstimates = 0.0;
                                    }
                                });

                                if (!$scope.totalSetting)
                                    $scope.isAttributeZero = true;
                                $scope.summaryTotal += $scope.totalSetting;
                                $scope.totalSetting = parseFloat(roundOf2Decimal($scope.totalSetting + $scope.Appraisal.ScTotalMountingPrice));
                            }

                            // Calculate Sales Tax
                            $scope.Appraisal.salesTaxPt = $scope.costSalesTax == 0 ? 8.1 : $scope.Appraisal.salesTaxPt;
                            calSalesTax();

                            $scope.totalInsuranceReplacementCost = parseFloat(roundOf2Decimal($scope.summaryTotal)) + parseFloat(roundOf2Decimal($scope.costSalesTax));

                            var speedCheckSuggestion = '';
                            if ($scope.totalInsuranceReplacementCost != null && parseFloat($scope.totalInsuranceReplacementCost) != 0) {
                                if (parseFloat($scope.totalInsuranceReplacementCost) > parseFloat($scope.Appraisal.AppraisalValue)) {
                                    // $("#speedCheck-Estimate").removeClass("text-green").addClass("text-red");
                                    $scope.Appraisal.scEstimateDescription = "Typical appraisals range from " + $filter('currency')(parseFloat($scope.totalInsuranceReplacementCost)) + " to " + $filter('currency')(parseFloat($scope.totalRetailValue)) + " depending on appraiser. Original appraisal value of " + $filter('currency')(parseFloat($scope.Appraisal.AppraisalValue)) + " is low. Suggest a new appraisal to the policyholder.";
                                    $scope.estimateText = 'red';
                                } else if (parseFloat($scope.totalInsuranceReplacementCost) <= parseFloat($scope.Appraisal.AppraisalValue)) {
                                    //$("#speedCheck-Estimate").removeClass("text-red").addClass("text-green");
                                    $scope.Appraisal.scEstimateDescription = "The item is insured adequately.";
                                    $scope.estimateText = 'green';
                                }
                            }

                            if (!angular.isDefined($scope.Appraisal.OriginalDescription) || (!angular.isDefined($scope.Appraisal.AppraisalValue) || $scope.Appraisal.AppraisalValue == "0.0")) {
                                var elm = document.getElementById('OriginalDescription');
                                //$scope.inValidField = true;
                                if (!angular.isDefined($scope.Appraisal.OriginalDescription) && (!angular.isDefined($scope.Appraisal.AppraisalValue) || $scope.Appraisal.AppraisalValue == "0.0")) {
                                    elm.focus();
                                    $scope.inValidFieldApprDesc = true;
                                    $scope.inValidFieldApprValue = true;
                                    toastr.remove();
                                    toastr.warning("Please enter 'Original Appraisal Description' and 'Original Appraisal Value' required fields", "Required");
                                } else if (!angular.isDefined($scope.Appraisal.OriginalDescription)) {
                                    elm.focus();
                                    $scope.inValidFieldApprDesc = true;
                                    $scope.inValidFieldApprValue = false;
                                    toastr.remove();
                                    toastr.warning("Please enter 'Original Appraisal Description' required field", "Required");
                                } else if ((!angular.isDefined($scope.Appraisal.AppraisalValue) || $scope.Appraisal.AppraisalValue == "0.0")) {
                                    elm = document.getElementById('appraisalValue');
                                    elm.focus();
                                    $scope.inValidFieldApprValue = true;
                                    $scope.inValidFieldApprDesc = false;
                                    toastr.remove();
                                    toastr.warning("Please enter 'Original Appraisal Value' required field", "Required");
                                }
                                $(".page-spinner-bar").addClass("hide");

                            } else {

                               $(".page-spinner-bar").addClass("hide");
                                toastr.remove();
                                toastr.success("Successfully validated the item's value from SpeedCheck.", "Confirmation");
                            }
                        } else if ($scope.appData && $scope.appData.retailValue) {

                            $scope.isRetailValue = true;
                            $scope.isIRCost = false;
                            $scope.both = false;

                            var tempDiamond = [];
                            $scope.summaryTotal = 0;

                            var scMaunting = result.mountingCost;

                            var scStoneDetails;
                            var scDiamondDetails;

                            var scCenterDiamond;
                            var scCenterGemstone;
                            var scCenterDiamonds = [];
                            scCenterDiamond = (result.diamonds) ? result.diamonds.diamonds : null;
                            scCenterGemstone = result.gemstones ? result.gemstones.gemstones : null;

                            if (scCenterDiamond && scCenterDiamond.diamonds) {
                                scCenterDiamonds = scCenterDiamond.diamonds;
                            }

                            if (scMaunting) {
                                scStoneDetails = scMaunting.accentGemstonesValue;
                                scDiamondDetails = scMaunting.accentDiamondsValue;
                            }

                            if (scDiamondDetails)
                                var scDiamonds = scDiamondDetails.diamonds;

                            if (scStoneDetails)
                                var scGemstones = scStoneDetails.gemstones;

                            var scChain = result.chain;
                            if (diamondDetails) {
                                for (var i = 0; i < diamondDetails.length; i++) {

                                    var diamondDetail = diamondDetails[i];

                                    if (scDiamonds && scDiamonds.length > 0 && scDiamonds[i].prices != null && scDiamonds[i].prices.retailPrice != null) {
                                        diamondDetail.scDiamondEstimate = roundOf2Decimal(scDiamonds[i].prices.retailPrice);

                                    } else {
                                        diamondDetail.scDiamondEstimate = 0.0;
                                    }


                                    tempDiamond.push(diamondDetail);
                                }

                                diamondDetails = tempDiamond;
                                $scope.diamondItems = diamondDetails;
                            }

                            //totasl estimation for diamonds
                            if (scDiamondDetails && scDiamondDetails.diamondRetailValue > 0)
                                $scope.diamondRetailValue = roundOf2Decimal(scDiamondDetails.diamondRetailValue);
                            else
                                $scope.diamondRetailValue = 0.0;

                            //recommend purpose
                            if (scDiamondDetails && (!scDiamondDetails.diamondRetailValue || scDiamondDetails.diamondRetailValue == 0))
                                $scope.isAttributeZero = true;

                            $scope.summaryTotal += parseFloat($scope.diamondRetailValue);

                            //stone details
                            var tempStoneDetail = [];
                            if (stoneDetails) {
                                for (var i = 0; i < stoneDetails.length; i++) {

                                    var stoneDetail = stoneDetails[i];
                                    if (scGemstones && scGemstones.length > 0 && scGemstones[i].prices != null && scGemstones[i].prices.retailPrice != null) {
                                        stoneDetail.scStoneEstimate = roundOf2Decimal(scGemstones[i].prices.retailPrice);
                                    } else {
                                        stoneDetail.scStoneEstimate = 0.0;
                                    }


                                    tempStoneDetail.push(stoneDetail);
                                }
                                stoneDetails = tempStoneDetail;
                                $scope.gemstoneItems = stoneDetails;
                            }
                            //console.log(tempDiamond);




                            //center diamond

                            var tempCenterDiamondDetail = [];

                            if (centerDiamonds.length == 1 && $scope.centerStone.diamond != null) {
                                $scope.centerStone.diamond.scDiamondEstimate = (scCenterDiamond && scCenterDiamond.length > 0 && scCenterDiamond[0].prices != null && scCenterDiamond[0].prices.retailPrice != null) ? roundOf2Decimal(scCenterDiamond[0].prices.retailPrice) : 0.0;

                                //recpmmend purpose
                                if ((scCenterDiamond && scCenterDiamond.length > 0 && scCenterDiamond[0].prices != null && scCenterDiamond[0].prices.retailPrice == null))
                                    $scope.isAttributeZero = true;
                            } else if ($scope.pairedDiamondItems) {
                                $scope.scDiamondEstimateTotal = 0;
                                for (var i = 0; i < $scope.pairedDiamondItems.length; i++) {
                                    var diamondDetail = $scope.pairedDiamondItems[i];
                                    if (scCenterDiamond && scCenterDiamond.length > 0 && scCenterDiamond.length > 0 && scCenterDiamond[i] && scCenterDiamond[i].prices && scCenterDiamond[i].prices != null && scCenterDiamond[i].prices.retailPrice != null) {
                                        $scope.pairedDiamondItems[i].scDiamondEstimate = roundOf2Decimal(scCenterDiamond[i].prices.retailPrice);
                                        $scope.scDiamondEstimateTotal += parseFloat($scope.pairedDiamondItems[i].scDiamondEstimate);
                                        //$scope.centerStone.diamond.scDiamondEstimate = $scope.scDiamondEstimateTotal;
                                    } else {
                                        $scope.pairedDiamondItems.scDiamondEstimate = 0.0;
                                    }
                                    if ($scope.pairedDiamondItems.scDiamondEstimate == 0)
                                        $scope.isAttributeZero = true;
                                }
                            }

                            //center stone

                            //stone details
                            var tempCenterStoneDetail = [];
                            if (centerGemstones.length == 1 && $scope.centerStone.gemstone != null) {
                                $scope.centerStone.gemstone.scStoneEstimate = (scCenterGemstone && scCenterGemstone.length > 0 && scCenterGemstone[0].prices != null && scCenterGemstone[0].prices.retailPrice != null) ? roundOf2Decimal(scCenterGemstone[0].prices.retailPrice) : 0.0;

                                if (scCenterGemstone && scCenterGemstone.length > 0 && scCenterGemstone[0].prices != null && !scCenterGemstone[0].prices.retailPrice)
                                    $scope.isAttributeZero = true;
                            } else if ($scope.pairedGemstoneItems) {
                                $scope.scStoneEstimateTotal = 0;
                                for (var i = 0; i < $scope.pairedGemstoneItems.length; i++) {

                                    var stoneDetail = $scope.pairedGemstoneItems[i];
                                    if (scCenterGemstone && scCenterGemstone.length > 0 && scCenterGemstone[i] && scCenterGemstone[i].prices != null && scCenterGemstone[i].prices.retailPrice != null) {
                                        $scope.pairedGemstoneItems[i].scStoneEstimate = roundOf2Decimal(scCenterGemstone[i].prices.retailPrice);
                                        //$scope.scStoneEstimateTotal += parseFloat($scope.pairedGemstoneItems[i].scStoneEstimate);

                                    } else {
                                        $scope.pairedGemstoneItems[i].scStoneEstimate = 0.0;
                                    }

                                    if ($scope.pairedGemstoneItems[i].scStoneEstimate == 0)
                                        $scope.isAttributeZero = true;
                                }
                            }

                            //total estimation for gemstone
                            if (scStoneDetails && scStoneDetails.gemstoneInsuranceReplacementCost > 0)
                                $scope.gemstoneArtigemReplacementCost = roundOf2Decimal(scStoneDetails.gemstoneRetailValue);
                            else
                                $scope.gemstoneArtigemReplacementCost = 0.0;

                            //recpmmend purpose
                            if (scStoneDetails && (!scStoneDetails.gemstoneRetailValue || scStoneDetails.gemstoneRetailValue == 0))
                                $scope.isAttributeZero = true;


                            //total estimate for center diamond gemstone
                            $scope.scCenterDiamondTotal = (result.diamonds && result.diamonds.diamondRetailValue) ? result.diamonds.diamondRetailValue : 0.0;
                            $scope.scCenterStoneTotal = (result.gemstones && result.gemstones.gemstoneRetailValue) ? result.gemstones.gemstoneRetailValue : 0.0;

                            $scope.summaryTotal += parseFloat($scope.gemstoneArtigemReplacementCost);
                            $scope.summaryTotal += parseFloat($scope.scCenterDiamondTotal);
                            $scope.summaryTotal += parseFloat($scope.scCenterStoneTotal);

                            //mounting estimate
                            //total estimate for mounting
                            if (scMaunting && scMaunting != null && scMaunting.metalMounting != null && scMaunting.metalMounting.prices && scMaunting.metalMounting.prices.retailPrice > 0)
                                $scope.Appraisal.ScTotalMountingPrice = parseFloat(roundOf2Decimal(scMaunting.metalMounting.prices.retailPrice));
                            else
                                $scope.Appraisal.ScTotalMountingPrice = 0.0;

                            //recommend purpose
                            if (scMaunting && scMaunting != null && scMaunting.metalMounting != null && scMaunting.metalMounting.prices && !scMaunting.metalMounting.prices.retailPrice)
                                $scope.isAttributeZero = true;
                            //total with accentstone
                            $scope.Appraisal.ScTotalMountingAccentStonePrice = (scMaunting && scMaunting.mountingRetailCost) ? roundOf2Decimal(scMaunting.mountingRetailCost) : 0.0;

                            $scope.summaryTotal += parseFloat($scope.Appraisal.ScTotalMountingPrice);

                            //chain estimates
                            if (scChain && scChain != null && scChain.prices != null && scChain.prices.retailPrice > 0)
                                $scope.Appraisal.ScTotalChainPrice = roundOf2Decimal(scChain.prices.retailPrice);
                            else
                                $scope.Appraisal.ScTotalChainPrice = 0.0;

                            $scope.summaryTotal += parseFloat($scope.Appraisal.ScTotalChainPrice);

                            //labour cosst
                            if (result.laborCost && result.laborCost > 0)
                                $scope.Appraisal.labourCost = roundOf2Decimal(result.laborCost);
                            else
                                $scope.Appraisal.labourCost = 0.0;

                            $scope.summaryTotal += parseFloat($scope.Appraisal.labourCost);

                            //totalSalvageCost
                            if (result.totalSalvageCost > 0)
                                $scope.totalSalvageCost = roundOf2Decimal(result.totalSalvageCost);
                            else
                                $scope.totalSalvageCost = 0.0;

                            //totalJeweleryCost
                            if (result.totalJeweleryCost > 0)
                                $scope.totalJeweleryCost = roundOf2Decimal(result.totalJeweleryCost);
                            else
                                $scope.totalJeweleryCost = 0.0;

                            //totalArtigemReplacementCost
                            if (result.totalArtigemReplacementCost > 0)
                                $scope.totalArtigemReplacementCost = roundOf2Decimal(result.totalArtigemReplacementCost);
                            else
                                $scope.totalArtigemReplacementCost = 0.0;

                            //totalInsuranceReplacementCost
                            if (result.totalInsuranceReplacementCost > 0)
                                $scope.totalInsuranceReplacementCost = roundOf2Decimal(result.totalInsuranceReplacementCost);
                            else
                                $scope.totalInsuranceReplacementCost = 0.0;

                            //totalRetailValue
                            if (result.totalRetailValue > 0)
                                $scope.totalRetailValue = roundOf2Decimal(result.totalRetailValue);
                            else
                                $scope.totalRetailValue = 0.0;

                            $scope.speedcheckSubmitDate = new Date();

                            if ($scope.totalRetailValue != null && parseFloat($scope.totalRetailValue) != 0) {
                                if (parseFloat($scope.totalRetailValue) > parseFloat($scope.Appraisal.AppraisalValue)) {
                                    // $("#speedCheck-Estimate").removeClass("text-green").addClass("text-red");
                                    $scope.Appraisal.scEstimateDescription = "Typical appraisals range from " + $filter('currency')(parseFloat($scope.totalInsuranceReplacementCost)) + " to " + $filter('currency')(parseFloat($scope.totalRetailValue)) + " depending on appraiser. Original appraisal value of " + $filter('currency')(parseFloat($scope.Appraisal.AppraisalValue)) + " is low. Suggest a new appraisal to the policyholder.";
                                    $scope.estimateText = 'red';
                                } else if (parseFloat($scope.totalRetailValue) <= parseFloat($scope.Appraisal.AppraisalValue)) {
                                    //$("#speedCheck-Estimate").removeClass("text-red").addClass("text-green");
                                    $scope.Appraisal.scEstimateDescription = "The item is insured adequately.";
                                    $scope.estimateText = 'green';
                                }
                            }

                            //WeddingBand.
                            $scope.showWeddingBandCost = false;
                            $scope.totalSetting = 0.0;
                            if (angular.isDefined(result.weddingBandCost) && result.weddingBandCost.length > 0) {
                                $scope.showWeddingBandCost = true;
                                var scWeddingBandCostList = result.weddingBandCost;
                                angular.forEach(scWeddingBandCostList, function (data, key) {
                                    var parentId = key;

                                    if (data.accentDiamondsValue && data.accentDiamondsValue.diamonds)
                                        var weddingDiamondCost = data.accentDiamondsValue.diamonds;
                                    if (data.accentGemstonesValue && data.accentGemstonesValue.gemstones)
                                        var weddingGemstoneCost = data.accentGemstonesValue.gemstones;

                                    var weddingBandDiamondTotal = 0;
                                    $scope.weddingItems[parentId].sc_totalWeddingBandDiamondsEstimate = 0;
                                    angular.forEach(weddingDiamondCost, function (data, key) {
                                        var childDiamondKey = key;
                                        if (data.prices && data.prices.retailPrice != null) {
                                            var roundVal = roundOf2Decimal(data.prices.retailPrice);
                                            weddingBandDiamondTotal += parseFloat(roundVal);
                                            $scope.weddingItems[parentId].mounting.diamondDetails[childDiamondKey].scDiamondEstimate = parseFloat(roundOf2Decimal(data.prices.retailPrice));
                                            $scope.weddingItems[parentId].sc_totalWeddingBandDiamondsEstimate = parseFloat(weddingBandDiamondTotal);
                                        } else {
                                            $scope.weddingItems[parentId].mounting.diamondDetails[childDiamondKey].scDiamondEstimate = 0.0;
                                            $scope.weddingItems[parentId].sc_totalWeddingBandDiamondsEstimate = 0.0;
                                        }
                                    });

                                    $scope.summaryTotal += parseFloat(weddingBandDiamondTotal);
                                    if (!weddingBandDiamondTotal)
                                        $scope.isAttributeZero = true;

                                    var totalStoneValue = 0;
                                    $scope.weddingItems[parentId].sc_totalWeddingBandGemstonesEstimate = 0;
                                    angular.forEach(weddingGemstoneCost, function (data, key) {
                                        var childKey = key;
                                        if (data.prices && data.prices.retailPrice != null) {
                                            var roundValue = roundOf2Decimal(data.prices.retailPrice);
                                            totalStoneValue += parseFloat(roundValue);
                                            $scope.weddingItems[parentId].mounting.stoneDetails[childKey].scStoneEstimate = parseFloat(roundOf2Decimal(data.prices.retailPrice));
                                            $scope.weddingItems[parentId].sc_totalWeddingBandGemstonesEstimate = parseFloat(totalStoneValue);
                                        } else {
                                            $scope.weddingItems[parentId].mounting.stoneDetails[childKey].scStoneEstimate = 0.0;
                                            $scope.weddingItems[parentId].sc_totalWeddingBandGemstonesEstimate = 0.0;
                                        }
                                    });

                                    if (!totalStoneValue)
                                        $scope.isAttributeZero = true;
                                    $scope.summaryTotal += parseFloat(totalStoneValue);

                                    var mountingCost = data.metalMounting;
                                    if (mountingCost.prices && mountingCost.prices.retailPrice != null) {
                                        var roundVal = roundOf2Decimal(mountingCost.prices.retailPrice);
                                        $scope.totalSetting += parseFloat(roundVal);
                                        $scope.weddingItems[parentId].mounting.scMountingEstimates = parseFloat(roundVal);
                                    } else {
                                        $scope.weddingItems[parentId].mounting.scMountingEstimates = 0.0;
                                    }
                                });

                                if (!$scope.totalSetting)
                                    $scope.isAttributeZero = true;
                                $scope.summaryTotal += $scope.totalSetting;
                                $scope.totalSetting = parseFloat(roundOf2Decimal($scope.totalSetting + $scope.Appraisal.ScTotalMountingPrice));
                            }

                            // Calculate Sales Tax
                            $scope.Appraisal.salesTaxPt = $scope.costSalesTax == 0 ? 8.1 : $scope.Appraisal.salesTaxPt;
                            calSalesTax();

                            // $scope.totalRetailValue = $scope.summaryTotal + $scope.costSalesTax;
                            $scope.totalRetailValue = parseFloat(roundOf2Decimal($scope.summaryTotal)) + parseFloat(roundOf2Decimal($scope.costSalesTax));


                            var speedCheckSuggestion = '';
                            if ($scope.totalRetailValue != null && parseFloat($scope.totalRetailValue) != 0) {
                                if (parseFloat($scope.totalRetailValue) > parseFloat($scope.Appraisal.AppraisalValue)) {
                                    // $("#speedCheck-Estimate").removeClass("text-green").addClass("text-red");
                                    $scope.Appraisal.scEstimateDescription = "Typical appraisals range from " + $filter('currency')(parseFloat($scope.totalInsuranceReplacementCost)) + " to " + $filter('currency')(parseFloat($scope.totalRetailValue)) + " depending on appraiser. Original appraisal value of " + $filter('currency')(parseFloat($scope.Appraisal.AppraisalValue)) + " is low. Suggest a new appraisal to the policyholder.";
                                    $scope.estimateText = 'red';
                                } else if (parseFloat($scope.totalRetailValue) <= parseFloat($scope.Appraisal.AppraisalValue)) {
                                    //$("#speedCheck-Estimate").removeClass("text-red").addClass("text-green");
                                    $scope.Appraisal.scEstimateDescription = "The item is insured adequately.";
                                    $scope.estimateText = 'green';
                                }
                            }

                            if (!angular.isDefined($scope.Appraisal.OriginalDescription) || (!angular.isDefined($scope.Appraisal.AppraisalValue) || $scope.Appraisal.AppraisalValue == "0.0")) {
                                var elm = document.getElementById('OriginalDescription');
                                //$scope.inValidField = true;
                                if (!angular.isDefined($scope.Appraisal.OriginalDescription) && (!angular.isDefined($scope.Appraisal.AppraisalValue) || $scope.Appraisal.AppraisalValue == "0.0")) {
                                    elm.focus();
                                    $scope.inValidFieldApprDesc = true;
                                    $scope.inValidFieldApprValue = true;
                                    toastr.remove();
                                    toastr.warning("Please enter 'Original Appraisal Description' and 'Original Appraisal Value' required fields", "Required");
                                } else if (!angular.isDefined($scope.Appraisal.OriginalDescription)) {
                                    elm.focus();
                                    $scope.inValidFieldApprDesc = true;
                                    $scope.inValidFieldApprValue = false;
                                    toastr.remove();
                                    toastr.warning("Please enter 'Original Appraisal Description' required field", "Required");
                                } else if ((!angular.isDefined($scope.Appraisal.AppraisalValue) || $scope.Appraisal.AppraisalValue == "0.0")) {
                                    elm = document.getElementById('appraisalValue');
                                    elm.focus();
                                    $scope.inValidFieldApprValue = true;
                                    $scope.inValidFieldApprDesc = false;
                                    toastr.remove();
                                    toastr.warning("Please enter 'Original Appraisal Value' required field", "Required");
                                }
                                $(".page-spinner-bar").addClass("hide");

                            } else {

                                //Total Wedding band Cost of setting.
                               // GeneratDescription($scope.totalRetailValue);

                                $scope.isSubmittedToSC = true;

                                // // After successfull SpeedCheck API call - Save/Update appraisal data
                                // if ($scope.formStatus && $scope.IsEditOrder) {
                                //     UpdateApprisal();
                                // } else if ($scope.formStatus && !$scope.IsEditOrder) {
                                //     $scope.IsSpeedCheckDisabled = true;
                                //     saveApprisal();
                                // }
                                  $(".page-spinner-bar").addClass("hide");
                                toastr.remove();
                                toastr.success("Successfully validated the item's value from SpeedCheck.", "Confirmation");
                            }

                        } else if ($scope.appData && $scope.appData.both && $scope.appData.isInsuranceReplacementCostSelected ) {


                            $scope.isIRCost = false;
                            $scope.isRetailValue = false;
                            $scope.both = true;
                            $scope.isInsuranceReplacementCostSelected = true;

                            var tempDiamond = [];
                            $scope.summaryTotal = 0;

                            var scMaunting = result.mountingCost;

                            var scStoneDetails;
                            var scDiamondDetails;

                            var scCenterDiamond;
                            var scCenterGemstone;
                            var scCenterDiamonds = [];
                            scCenterDiamond = (result.diamonds) ? result.diamonds.diamonds : null;
                            scCenterGemstone = result.gemstones ? result.gemstones.gemstones : null;

                            if (scCenterDiamond && scCenterDiamond.diamonds) {
                                scCenterDiamonds = scCenterDiamond.diamonds;
                            }

                            if (scMaunting) {
                                scStoneDetails = scMaunting.accentGemstonesValue;
                                scDiamondDetails = scMaunting.accentDiamondsValue;
                            }

                            if (scDiamondDetails)
                                var scDiamonds = scDiamondDetails.diamonds;

                            if (scStoneDetails)
                                var scGemstones = scStoneDetails.gemstones;

                            var scChain = result.chain;
                            if (diamondDetails) {
                                for (var i = 0; i < diamondDetails.length; i++) {

                                    var diamondDetail = diamondDetails[i];

                                    if (scDiamonds && scDiamonds.length > 0 && scDiamonds[i].prices != null && scDiamonds[i].prices.insuranceReplacementCost != null) {
                                        diamondDetail.scDiamondEstimate = roundOf2Decimal(scDiamonds[i].prices.insuranceReplacementCost);

                                    } else {
                                        diamondDetail.scDiamondEstimate = 0.0;
                                    }


                                    tempDiamond.push(diamondDetail);
                                }

                                diamondDetails = tempDiamond;
                                $scope.diamondItems = diamondDetails;
                            }

                            //totasl estimation for diamonds
                            if (scDiamondDetails && scDiamondDetails.diamondInsuranceReplacementCost > 0)
                                $scope.diamondInsuranceReplacementCost = roundOf2Decimal(scDiamondDetails.diamondInsuranceReplacementCost);
                            else
                                $scope.diamondInsuranceReplacementCost = 0.0;

                            //recommend purpose
                            if (scDiamondDetails && (!scDiamondDetails.diamondInsuranceReplacementCost || scDiamondDetails.diamondInsuranceReplacementCost == 0))
                                $scope.isAttributeZero = true;

                            $scope.summaryTotal += parseFloat($scope.diamondInsuranceReplacementCost);

                            //stone details
                            var tempStoneDetail = [];
                            if (stoneDetails) {
                                for (var i = 0; i < stoneDetails.length; i++) {

                                    var stoneDetail = stoneDetails[i];
                                    if (scGemstones && scGemstones.length > 0 && scGemstones[i].prices != null && scGemstones[i].prices.insuranceReplacementCost != null) {
                                        stoneDetail.scStoneEstimate = roundOf2Decimal(scGemstones[i].prices.insuranceReplacementCost);
                                    } else {
                                        stoneDetail.scStoneEstimate = 0.0;
                                    }


                                    tempStoneDetail.push(stoneDetail);
                                }
                                stoneDetails = tempStoneDetail;
                                $scope.gemstoneItems = stoneDetails;
                            }
                            //console.log(tempDiamond);




                            //center diamond

                            var tempCenterDiamondDetail = [];

                            if (centerDiamonds.length == 1 && $scope.centerStone.diamond != null) {
                                $scope.centerStone.diamond.scDiamondEstimate = (scCenterDiamond && scCenterDiamond.length > 0 && scCenterDiamond[0].prices != null && scCenterDiamond[0].prices.insuranceReplacementCost != null) ? roundOf2Decimal(scCenterDiamond[0].prices.insuranceReplacementCost) : 0.0;

                                //recpmmend purpose
                                if ((scCenterDiamond && scCenterDiamond.length > 0 && scCenterDiamond[0].prices != null && scCenterDiamond[0].prices.insuranceReplacementCost == null))
                                    $scope.isAttributeZero = true;
                            } else if ($scope.pairedDiamondItems) {
                                $scope.scDiamondEstimateTotal = 0;
                                for (var i = 0; i < $scope.pairedDiamondItems.length; i++) {
                                    var diamondDetail = $scope.pairedDiamondItems[i];
                                    if (scCenterDiamond && scCenterDiamond.length > 0 && scCenterDiamond.length > 0 && scCenterDiamond[i] && scCenterDiamond[i].prices && scCenterDiamond[i].prices != null && scCenterDiamond[i].prices.insuranceReplacementCost != null) {
                                        $scope.pairedDiamondItems[i].scDiamondEstimate = roundOf2Decimal(scCenterDiamond[i].prices.insuranceReplacementCost);
                                        $scope.scDiamondEstimateTotal += parseFloat($scope.pairedDiamondItems[i].scDiamondEstimate);
                                        //$scope.centerStone.diamond.scDiamondEstimate = $scope.scDiamondEstimateTotal;
                                    } else {
                                        $scope.pairedDiamondItems.scDiamondEstimate = 0.0;
                                    }
                                    if ($scope.pairedDiamondItems.scDiamondEstimate == 0)
                                        $scope.isAttributeZero = true;
                                }
                            }

                            //center stone

                            //stone details
                            var tempCenterStoneDetail = [];
                            if (centerGemstones.length == 1 && $scope.centerStone.gemstone != null) {
                                $scope.centerStone.gemstone.scStoneEstimate = (scCenterGemstone && scCenterGemstone.length > 0 && scCenterGemstone[0].prices != null && scCenterGemstone[0].prices.insuranceReplacementCost != null) ? roundOf2Decimal(scCenterGemstone[0].prices.insuranceReplacementCost) : 0.0;

                                if (scCenterGemstone && scCenterGemstone.length > 0 && scCenterGemstone[0].prices != null && !scCenterGemstone[0].prices.insuranceReplacementCost)
                                    $scope.isAttributeZero = true;
                            } else if ($scope.pairedGemstoneItems) {
                                $scope.scStoneEstimateTotal = 0;
                                for (var i = 0; i < $scope.pairedGemstoneItems.length; i++) {

                                    var stoneDetail = $scope.pairedGemstoneItems[i];
                                    if (scCenterGemstone && scCenterGemstone.length > 0 && scCenterGemstone[i] && scCenterGemstone[i].prices != null && scCenterGemstone[i].prices.insuranceReplacementCost != null) {
                                        $scope.pairedGemstoneItems[i].scStoneEstimate = roundOf2Decimal(scCenterGemstone[i].prices.insuranceReplacementCost);
                                        //$scope.scStoneEstimateTotal += parseFloat($scope.pairedGemstoneItems[i].scStoneEstimate);

                                    } else {
                                        $scope.pairedGemstoneItems[i].scStoneEstimate = 0.0;
                                    }

                                    if ($scope.pairedGemstoneItems[i].scStoneEstimate == 0)
                                        $scope.isAttributeZero = true;
                                }
                            }

                            //total estimation for gemstone
                            if (scStoneDetails && scStoneDetails.gemstoneInsuranceReplacementCost > 0)
                                $scope.gemstoneArtigemReplacementCost = roundOf2Decimal(scStoneDetails.gemstoneInsuranceReplacementCost);
                            else
                                $scope.gemstoneArtigemReplacementCost = 0.0;

                            //recpmmend purpose
                            if (scStoneDetails && (!scStoneDetails.gemstoneInsuranceReplacementCost || scStoneDetails.gemstoneInsuranceReplacementCost == 0))
                                $scope.isAttributeZero = true;


                            //total estimate for center diamond gemstone
                            $scope.scCenterDiamondTotal = (result.diamonds && result.diamonds.diamondInsuranceReplacementCost) ? result.diamonds.diamondInsuranceReplacementCost : 0.0;
                            $scope.scCenterStoneTotal = (result.gemstones && result.gemstones.gemstoneInsuranceReplacementCost) ? result.gemstones.gemstoneInsuranceReplacementCost : 0.0;

                            $scope.summaryTotal += parseFloat($scope.gemstoneArtigemReplacementCost);
                            $scope.summaryTotal += parseFloat($scope.scCenterDiamondTotal);
                            $scope.summaryTotal += parseFloat($scope.scCenterStoneTotal);

                            //mounting estimate
                            //total estimate for mounting
                            if (scMaunting && scMaunting != null && scMaunting.metalMounting != null && scMaunting.metalMounting.prices && scMaunting.metalMounting.prices.insuranceReplacementCost > 0)
                                $scope.Appraisal.ScTotalMountingPrice = parseFloat(roundOf2Decimal(scMaunting.metalMounting.prices.insuranceReplacementCost));
                            else
                                $scope.Appraisal.ScTotalMountingPrice = 0.0;

                            //recommend purpose
                            if (scMaunting && scMaunting != null && scMaunting.metalMounting != null && scMaunting.metalMounting.prices && !scMaunting.metalMounting.prices.insuranceReplacementCost)
                                $scope.isAttributeZero = true;
                            //total with accentstone
                            $scope.Appraisal.ScTotalMountingAccentStonePrice = (scMaunting && scMaunting.mountingInsuranceReplacementCost) ? roundOf2Decimal(scMaunting.mountingInsuranceReplacementCost) : 0.0;

                            $scope.summaryTotal += parseFloat($scope.Appraisal.ScTotalMountingPrice);

                            //chain estimates
                            if (scChain && scChain != null && scChain.prices != null && scChain.prices.insuranceReplacementCost > 0)
                                $scope.Appraisal.ScTotalChainPrice = roundOf2Decimal(scChain.prices.insuranceReplacementCost);
                            else
                                $scope.Appraisal.ScTotalChainPrice = 0.0;

                            $scope.summaryTotal += parseFloat($scope.Appraisal.ScTotalChainPrice);

                            //labour cosst
                            if (result.laborCost && result.laborCost > 0)
                                $scope.Appraisal.labourCost = roundOf2Decimal(result.laborCost);
                            else
                                $scope.Appraisal.labourCost = 0.0;

                            $scope.summaryTotal += parseFloat($scope.Appraisal.labourCost);

                            //totalSalvageCost
                            if (result.totalSalvageCost > 0)
                                $scope.totalSalvageCost = roundOf2Decimal(result.totalSalvageCost);
                            else
                                $scope.totalSalvageCost = 0.0;

                            //totalJeweleryCost
                            if (result.totalJeweleryCost > 0)
                                $scope.totalJeweleryCost = roundOf2Decimal(result.totalJeweleryCost);
                            else
                                $scope.totalJeweleryCost = 0.0;

                            //totalArtigemReplacementCost
                            if (result.totalArtigemReplacementCost > 0)
                                $scope.totalArtigemReplacementCost = roundOf2Decimal(result.totalArtigemReplacementCost);
                            else
                                $scope.totalArtigemReplacementCost = 0.0;

                            //totalInsuranceReplacementCost
                            if (result.totalInsuranceReplacementCost > 0)
                                $scope.totalInsuranceReplacementCost = roundOf2Decimal(result.totalInsuranceReplacementCost);
                            else
                                $scope.totalInsuranceReplacementCost = 0.0;

                            //totalRetailValue
                            if (result.totalRetailValue > 0)
                                $scope.totalRetailValue = roundOf2Decimal(result.totalRetailValue);
                            else
                                $scope.totalRetailValue = 0.0;

                            $scope.speedcheckSubmitDate = new Date();

                            if ($scope.totalInsuranceReplacementCost != null && parseFloat($scope.totalInsuranceReplacementCost) != 0) {
                                if (parseFloat($scope.totalInsuranceReplacementCost) > parseFloat($scope.Appraisal.AppraisalValue)) {
                                    // $("#speedCheck-Estimate").removeClass("text-green").addClass("text-red");
                                    $scope.Appraisal.scEstimateDescription = "Typical appraisals range from " + $filter('currency')(parseFloat($scope.totalInsuranceReplacementCost)) + " to " + $filter('currency')(parseFloat($scope.totalRetailValue)) + " depending on appraiser. Original appraisal value of " + $filter('currency')(parseFloat($scope.Appraisal.AppraisalValue)) + " is low. Suggest a new appraisal to the policyholder.";
                                    $scope.estimateText = 'red';
                                } else if (parseFloat($scope.totalInsuranceReplacementCost) <= parseFloat($scope.Appraisal.AppraisalValue)) {
                                    //$("#speedCheck-Estimate").removeClass("text-red").addClass("text-green");
                                    $scope.Appraisal.scEstimateDescription = "The item is insured adequately.";
                                    $scope.estimateText = 'green';
                                }
                            }

                            //WeddingBand.
                            $scope.showWeddingBandCost = false;
                            $scope.totalSetting = 0.0;
                            if (angular.isDefined(result.weddingBandCost) && result.weddingBandCost.length > 0) {
                                $scope.showWeddingBandCost = true;
                                var scWeddingBandCostList = result.weddingBandCost;
                                angular.forEach(scWeddingBandCostList, function (data, key) {
                                    var parentId = key;

                                    if (data.accentDiamondsValue && data.accentDiamondsValue.diamonds)
                                        var weddingDiamondCost = data.accentDiamondsValue.diamonds;
                                    if (data.accentGemstonesValue && data.accentGemstonesValue.gemstones)
                                        var weddingGemstoneCost = data.accentGemstonesValue.gemstones;

                                    var weddingBandDiamondTotal = 0;
                                    $scope.weddingItems[parentId].sc_totalWeddingBandDiamondsEstimate = 0;
                                    angular.forEach(weddingDiamondCost, function (data, key) {
                                        var childDiamondKey = key;
                                        if (data.prices && data.prices.insuranceReplacementCost != null) {
                                            var roundVal = roundOf2Decimal(data.prices.insuranceReplacementCost);
                                            weddingBandDiamondTotal += parseFloat(roundVal);
                                            $scope.weddingItems[parentId].mounting.diamondDetails[childDiamondKey].scDiamondEstimate = parseFloat(roundOf2Decimal(data.prices.insuranceReplacementCost));
                                            $scope.weddingItems[parentId].sc_totalWeddingBandDiamondsEstimate = parseFloat(weddingBandDiamondTotal);
                                        } else {
                                            $scope.weddingItems[parentId].mounting.diamondDetails[childDiamondKey].scDiamondEstimate = 0.0;
                                            $scope.weddingItems[parentId].sc_totalWeddingBandDiamondsEstimate = 0.0;
                                        }
                                    });

                                    $scope.summaryTotal += parseFloat(weddingBandDiamondTotal);
                                    if (!weddingBandDiamondTotal)
                                        $scope.isAttributeZero = true;

                                    var totalStoneValue = 0;
                                    $scope.weddingItems[parentId].sc_totalWeddingBandGemstonesEstimate = 0;
                                    angular.forEach(weddingGemstoneCost, function (data, key) {
                                        var childKey = key;
                                        if (data.prices && data.prices.insuranceReplacementCost != null) {
                                            var roundValue = roundOf2Decimal(data.prices.insuranceReplacementCost);
                                            totalStoneValue += parseFloat(roundValue);
                                            $scope.weddingItems[parentId].mounting.stoneDetails[childKey].scStoneEstimate = parseFloat(roundOf2Decimal(data.prices.insuranceReplacementCost));
                                            $scope.weddingItems[parentId].sc_totalWeddingBandGemstonesEstimate = parseFloat(totalStoneValue);
                                        } else {
                                            $scope.weddingItems[parentId].mounting.stoneDetails[childKey].scStoneEstimate = 0.0;
                                            $scope.weddingItems[parentId].sc_totalWeddingBandGemstonesEstimate = 0.0;
                                        }
                                    });

                                    if (!totalStoneValue)
                                        $scope.isAttributeZero = true;
                                    $scope.summaryTotal += parseFloat(totalStoneValue);

                                    var mountingCost = data.metalMounting;
                                    if (mountingCost.prices && mountingCost.prices.insuranceReplacementCost != null) {
                                        var roundVal = roundOf2Decimal(mountingCost.prices.insuranceReplacementCost);
                                        $scope.totalSetting += parseFloat(roundVal);
                                        $scope.weddingItems[parentId].mounting.scMountingEstimates = parseFloat(roundVal);
                                    } else {
                                        $scope.weddingItems[parentId].mounting.scMountingEstimates = 0.0;
                                    }
                                });

                                if (!$scope.totalSetting)
                                    $scope.isAttributeZero = true;
                                $scope.summaryTotal += $scope.totalSetting;
                                $scope.totalSetting = parseFloat(roundOf2Decimal($scope.totalSetting + $scope.Appraisal.ScTotalMountingPrice));
                            }

                            // Calculate Sales Tax
                            $scope.Appraisal.salesTaxPt = $scope.costSalesTax == 0 ? 8.1 : $scope.Appraisal.salesTaxPt;
                            calSalesTax();

                            // $scope.totalInsuranceReplacementCost = $scope.summaryTotal + $scope.costSalesTax;
                            $scope.totalInsuranceReplacementCost = parseFloat(roundOf2Decimal($scope.summaryTotal)) + parseFloat(roundOf2Decimal($scope.costSalesTax));



                            var speedCheckSuggestion = '';
                            if ($scope.totalInsuranceReplacementCost != null && parseFloat($scope.totalInsuranceReplacementCost) != 0) {
                                if (parseFloat($scope.totalInsuranceReplacementCost) > parseFloat($scope.Appraisal.AppraisalValue)) {
                                    // $("#speedCheck-Estimate").removeClass("text-green").addClass("text-red");
                                    $scope.Appraisal.scEstimateDescription = "Typical appraisals range from " + $filter('currency')(parseFloat($scope.totalInsuranceReplacementCost)) + " to " + $filter('currency')(parseFloat($scope.totalRetailValue)) + " depending on appraiser. Original appraisal value of " + $filter('currency')(parseFloat($scope.Appraisal.AppraisalValue)) + " is low. Suggest a new appraisal to the policyholder.";
                                    $scope.estimateText = 'red';
                                } else if (parseFloat($scope.totalInsuranceReplacementCost) <= parseFloat($scope.Appraisal.AppraisalValue)) {
                                    //$("#speedCheck-Estimate").removeClass("text-red").addClass("text-green");
                                    $scope.Appraisal.scEstimateDescription = "The item is insured adequately.";
                                    $scope.estimateText = 'green';
                                }
                            }

                            if (!angular.isDefined($scope.Appraisal.OriginalDescription) || (!angular.isDefined($scope.Appraisal.AppraisalValue) || $scope.Appraisal.AppraisalValue == "0.0")) {
                                var elm = document.getElementById('OriginalDescription');
                                //$scope.inValidField = true;
                                if (!angular.isDefined($scope.Appraisal.OriginalDescription) && (!angular.isDefined($scope.Appraisal.AppraisalValue) || $scope.Appraisal.AppraisalValue == "0.0")) {
                                    elm.focus();
                                    $scope.inValidFieldApprDesc = true;
                                    $scope.inValidFieldApprValue = true;
                                    toastr.remove();
                                    toastr.warning("Please enter 'Original Appraisal Description' and 'Original Appraisal Value' required fields", "Required");
                                } else if (!angular.isDefined($scope.Appraisal.OriginalDescription)) {
                                    elm.focus();
                                    $scope.inValidFieldApprDesc = true;
                                    $scope.inValidFieldApprValue = false;
                                    toastr.remove();
                                    toastr.warning("Please enter 'Original Appraisal Description' required field", "Required");
                                } else if ((!angular.isDefined($scope.Appraisal.AppraisalValue) || $scope.Appraisal.AppraisalValue == "0.0")) {
                                    elm = document.getElementById('appraisalValue');
                                    elm.focus();
                                    $scope.inValidFieldApprValue = true;
                                    $scope.inValidFieldApprDesc = false;
                                    toastr.remove();
                                    toastr.warning("Please enter 'Original Appraisal Value' required field", "Required");
                                }
                                $(".page-spinner-bar").addClass("hide");

                            } else {

                                //Total Wedding band Cost of setting.
                               // GeneratDescription($scope.totalInsuranceReplacementCost);

                                $scope.isSubmittedToSC = true;

                                // // After successfull SpeedCheck API call - Save/Update appraisal data
                                // if ($scope.formStatus && $scope.IsEditOrder) {
                                //     UpdateApprisal();
                                // } else if ($scope.formStatus && !$scope.IsEditOrder) {
                                //     $scope.IsSpeedCheckDisabled = true;
                                //     saveApprisal();
                                // }
                                $(".page-spinner-bar").addClass("hide");
                                toastr.remove();
                                toastr.success("Successfully validated the item's value from SpeedCheck.", "Confirmation");
                            }

                        } else if ($scope.appData && $scope.appData.both && $scope.appData.isRetailValueSelected ) {

                            $scope.isRetailValue = false;
                            $scope.isIRCost = false;
                            $scope.both = true;
                            $scope.isRetailCostSelected = true;


                            var tempDiamond = [];
                            $scope.summaryTotal = 0;

                            var scMaunting = result.mountingCost;

                            var scStoneDetails;
                            var scDiamondDetails;

                            var scCenterDiamond;
                            var scCenterGemstone;
                            var scCenterDiamonds = [];
                            scCenterDiamond = (result.diamonds) ? result.diamonds.diamonds : null;
                            scCenterGemstone = result.gemstones ? result.gemstones.gemstones : null;

                            if (scCenterDiamond && scCenterDiamond.diamonds) {
                                scCenterDiamonds = scCenterDiamond.diamonds;
                            }

                            if (scMaunting) {
                                scStoneDetails = scMaunting.accentGemstonesValue;
                                scDiamondDetails = scMaunting.accentDiamondsValue;
                            }

                            if (scDiamondDetails)
                                var scDiamonds = scDiamondDetails.diamonds;

                            if (scStoneDetails)
                                var scGemstones = scStoneDetails.gemstones;

                            var scChain = result.chain;
                            if (diamondDetails) {
                                for (var i = 0; i < diamondDetails.length; i++) {

                                    var diamondDetail = diamondDetails[i];

                                    if (scDiamonds && scDiamonds.length > 0 && scDiamonds[i].prices != null && scDiamonds[i].prices.retailPrice != null) {
                                        diamondDetail.scDiamondEstimate = roundOf2Decimal(scDiamonds[i].prices.retailPrice);

                                    } else {
                                        diamondDetail.scDiamondEstimate = 0.0;
                                    }


                                    tempDiamond.push(diamondDetail);
                                }

                                diamondDetails = tempDiamond;
                                $scope.diamondItems = diamondDetails;
                            }

                            //totasl estimation for diamonds
                            if (scDiamondDetails && scDiamondDetails.diamondRetailValue > 0)
                                $scope.diamondRetailValue = roundOf2Decimal(scDiamondDetails.diamondRetailValue);
                            else
                                $scope.diamondRetailValue = 0.0;

                            //recommend purpose
                            if (scDiamondDetails && (!scDiamondDetails.diamondRetailValue || scDiamondDetails.diamondRetailValue == 0))
                                $scope.isAttributeZero = true;

                            $scope.summaryTotal += parseFloat($scope.diamondRetailValue);

                            //stone details
                            var tempStoneDetail = [];
                            if (stoneDetails) {
                                for (var i = 0; i < stoneDetails.length; i++) {

                                    var stoneDetail = stoneDetails[i];
                                    if (scGemstones && scGemstones.length > 0 && scGemstones[i].prices != null && scGemstones[i].prices.retailPrice != null) {
                                        stoneDetail.scStoneEstimate = roundOf2Decimal(scGemstones[i].prices.retailPrice);
                                    } else {
                                        stoneDetail.scStoneEstimate = 0.0;
                                    }


                                    tempStoneDetail.push(stoneDetail);
                                }
                                stoneDetails = tempStoneDetail;
                                $scope.gemstoneItems = stoneDetails;
                            }
                            //console.log(tempDiamond);




                            //center diamond

                            var tempCenterDiamondDetail = [];

                            if (centerDiamonds.length == 1 && $scope.centerStone.diamond != null) {
                                $scope.centerStone.diamond.scDiamondEstimate = (scCenterDiamond && scCenterDiamond.length > 0 && scCenterDiamond[0].prices != null && scCenterDiamond[0].prices.retailPrice != null) ? roundOf2Decimal(scCenterDiamond[0].prices.retailPrice) : 0.0;

                                //recpmmend purpose
                                if ((scCenterDiamond && scCenterDiamond.length > 0 && scCenterDiamond[0].prices != null && scCenterDiamond[0].prices.retailPrice == null))
                                    $scope.isAttributeZero = true;
                            } else if ($scope.pairedDiamondItems) {
                                $scope.scDiamondEstimateTotal = 0;
                                for (var i = 0; i < $scope.pairedDiamondItems.length; i++) {
                                    var diamondDetail = $scope.pairedDiamondItems[i];
                                    if (scCenterDiamond && scCenterDiamond.length > 0 && scCenterDiamond.length > 0 && scCenterDiamond[i] && scCenterDiamond[i].prices && scCenterDiamond[i].prices != null && scCenterDiamond[i].prices.retailPrice != null) {
                                        $scope.pairedDiamondItems[i].scDiamondEstimate = roundOf2Decimal(scCenterDiamond[i].prices.retailPrice);
                                        $scope.scDiamondEstimateTotal += parseFloat($scope.pairedDiamondItems[i].scDiamondEstimate);
                                        //$scope.centerStone.diamond.scDiamondEstimate = $scope.scDiamondEstimateTotal;
                                    } else {
                                        $scope.pairedDiamondItems.scDiamondEstimate = 0.0;
                                    }
                                    if ($scope.pairedDiamondItems.scDiamondEstimate == 0)
                                        $scope.isAttributeZero = true;
                                }
                            }

                            //center stone

                            //stone details
                            var tempCenterStoneDetail = [];
                            if (centerGemstones.length == 1 && $scope.centerStone.gemstone != null) {
                                $scope.centerStone.gemstone.scStoneEstimate = (scCenterGemstone && scCenterGemstone.length > 0 && scCenterGemstone[0].prices != null && scCenterGemstone[0].prices.retailPrice != null) ? roundOf2Decimal(scCenterGemstone[0].prices.retailPrice) : 0.0;

                                if (scCenterGemstone && scCenterGemstone.length > 0 && scCenterGemstone[0].prices != null && !scCenterGemstone[0].prices.retailPrice)
                                    $scope.isAttributeZero = true;
                            } else if ($scope.pairedGemstoneItems) {
                                $scope.scStoneEstimateTotal = 0;
                                for (var i = 0; i < $scope.pairedGemstoneItems.length; i++) {

                                    var stoneDetail = $scope.pairedGemstoneItems[i];
                                    if (scCenterGemstone && scCenterGemstone.length > 0 && scCenterGemstone[i] && scCenterGemstone[i].prices != null && scCenterGemstone[i].prices.retailPrice != null) {
                                        $scope.pairedGemstoneItems[i].scStoneEstimate = roundOf2Decimal(scCenterGemstone[i].prices.retailPrice);
                                        //$scope.scStoneEstimateTotal += parseFloat($scope.pairedGemstoneItems[i].scStoneEstimate);

                                    } else {
                                        $scope.pairedGemstoneItems[i].scStoneEstimate = 0.0;
                                    }

                                    if ($scope.pairedGemstoneItems[i].scStoneEstimate == 0)
                                        $scope.isAttributeZero = true;
                                }
                            }

                            //total estimation for gemstone
                            if (scStoneDetails && scStoneDetails.gemstoneInsuranceReplacementCost > 0)
                                $scope.gemstoneArtigemReplacementCost = roundOf2Decimal(scStoneDetails.gemstoneRetailValue);
                            else
                                $scope.gemstoneArtigemReplacementCost = 0.0;

                            //recpmmend purpose
                            if (scStoneDetails && (!scStoneDetails.gemstoneRetailValue || scStoneDetails.gemstoneRetailValue == 0))
                                $scope.isAttributeZero = true;


                            //total estimate for center diamond gemstone
                            $scope.scCenterDiamondTotal = (result.diamonds && result.diamonds.diamondRetailValue) ? result.diamonds.diamondRetailValue : 0.0;
                            $scope.scCenterStoneTotal = (result.gemstones && result.gemstones.gemstoneRetailValue) ? result.gemstones.gemstoneRetailValue : 0.0;

                            $scope.summaryTotal += parseFloat($scope.gemstoneArtigemReplacementCost);
                            $scope.summaryTotal += parseFloat($scope.scCenterDiamondTotal);
                            $scope.summaryTotal += parseFloat($scope.scCenterStoneTotal);

                            //mounting estimate
                            //total estimate for mounting
                            if (scMaunting && scMaunting != null && scMaunting.metalMounting != null && scMaunting.metalMounting.prices && scMaunting.metalMounting.prices.retailPrice > 0)
                                $scope.Appraisal.ScTotalMountingPrice = parseFloat(roundOf2Decimal(scMaunting.metalMounting.prices.retailPrice));
                            else
                                $scope.Appraisal.ScTotalMountingPrice = 0.0;

                            //recommend purpose
                            if (scMaunting && scMaunting != null && scMaunting.metalMounting != null && scMaunting.metalMounting.prices && !scMaunting.metalMounting.prices.retailPrice)
                                $scope.isAttributeZero = true;
                            //total with accentstone
                            $scope.Appraisal.ScTotalMountingAccentStonePrice = (scMaunting && scMaunting.mountingRetailCost) ? roundOf2Decimal(scMaunting.mountingRetailCost) : 0.0;

                            $scope.summaryTotal += parseFloat($scope.Appraisal.ScTotalMountingPrice);

                            //chain estimates
                            if (scChain && scChain != null && scChain.prices != null && scChain.prices.retailPrice > 0)
                                $scope.Appraisal.ScTotalChainPrice = roundOf2Decimal(scChain.prices.retailPrice);
                            else
                                $scope.Appraisal.ScTotalChainPrice = 0.0;

                            $scope.summaryTotal += parseFloat($scope.Appraisal.ScTotalChainPrice);

                            //labour cosst
                            if (result.laborCost && result.laborCost > 0)
                                $scope.Appraisal.labourCost = roundOf2Decimal(result.laborCost);
                            else
                                $scope.Appraisal.labourCost = 0.0;

                            $scope.summaryTotal += parseFloat($scope.Appraisal.labourCost);

                            //totalSalvageCost
                            if (result.totalSalvageCost > 0)
                                $scope.totalSalvageCost = roundOf2Decimal(result.totalSalvageCost);
                            else
                                $scope.totalSalvageCost = 0.0;

                            //totalJeweleryCost
                            if (result.totalJeweleryCost > 0)
                                $scope.totalJeweleryCost = roundOf2Decimal(result.totalJeweleryCost);
                            else
                                $scope.totalJeweleryCost = 0.0;

                            //totalArtigemReplacementCost
                            if (result.totalArtigemReplacementCost > 0)
                                $scope.totalArtigemReplacementCost = roundOf2Decimal(result.totalArtigemReplacementCost);
                            else
                                $scope.totalArtigemReplacementCost = 0.0;

                            //totalInsuranceReplacementCost
                            if (result.totalInsuranceReplacementCost > 0)
                                $scope.totalInsuranceReplacementCost = roundOf2Decimal(result.totalInsuranceReplacementCost);
                            else
                                $scope.totalInsuranceReplacementCost = 0.0;

                            //totalRetailValue
                            if (result.totalRetailValue > 0)
                                $scope.totalRetailValue = roundOf2Decimal(result.totalRetailValue);
                            else
                                $scope.totalRetailValue = 0.0;

                            $scope.speedcheckSubmitDate = new Date();

                            if ($scope.totalRetailValue != null && parseFloat($scope.totalRetailValue) != 0) {
                                if (parseFloat($scope.totalRetailValue) > parseFloat($scope.Appraisal.AppraisalValue)) {
                                    // $("#speedCheck-Estimate").removeClass("text-green").addClass("text-red");
                                    $scope.Appraisal.scEstimateDescription = "Typical appraisals range from " + $filter('currency')(parseFloat($scope.totalInsuranceReplacementCost)) + " to " + $filter('currency')(parseFloat($scope.totalRetailValue)) + " depending on appraiser. Original appraisal value of " + $filter('currency')(parseFloat($scope.Appraisal.AppraisalValue)) + " is low. Suggest a new appraisal to the policyholder.";
                                    $scope.estimateText = 'red';
                                } else if (parseFloat($scope.totalRetailValue) <= parseFloat($scope.Appraisal.AppraisalValue)) {
                                    //$("#speedCheck-Estimate").removeClass("text-red").addClass("text-green");
                                    $scope.Appraisal.scEstimateDescription = "The item is insured adequately.";
                                    $scope.estimateText = 'green';
                                }
                            }

                            //WeddingBand.
                            $scope.showWeddingBandCost = false;
                            $scope.totalSetting = 0.0;
                            if (angular.isDefined(result.weddingBandCost) && result.weddingBandCost.length > 0) {
                                $scope.showWeddingBandCost = true;
                                var scWeddingBandCostList = result.weddingBandCost;
                                angular.forEach(scWeddingBandCostList, function (data, key) {
                                    var parentId = key;

                                    if (data.accentDiamondsValue && data.accentDiamondsValue.diamonds)
                                        var weddingDiamondCost = data.accentDiamondsValue.diamonds;
                                    if (data.accentGemstonesValue && data.accentGemstonesValue.gemstones)
                                        var weddingGemstoneCost = data.accentGemstonesValue.gemstones;

                                    var weddingBandDiamondTotal = 0;
                                    $scope.weddingItems[parentId].sc_totalWeddingBandDiamondsEstimate = 0;
                                    angular.forEach(weddingDiamondCost, function (data, key) {
                                        var childDiamondKey = key;
                                        if (data.prices && data.prices.retailPrice != null) {
                                            var roundVal = roundOf2Decimal(data.prices.retailPrice);
                                            weddingBandDiamondTotal += parseFloat(roundVal);
                                            $scope.weddingItems[parentId].mounting.diamondDetails[childDiamondKey].scDiamondEstimate = parseFloat(roundOf2Decimal(data.prices.retailPrice));
                                            $scope.weddingItems[parentId].sc_totalWeddingBandDiamondsEstimate = parseFloat(weddingBandDiamondTotal);
                                        } else {
                                            $scope.weddingItems[parentId].mounting.diamondDetails[childDiamondKey].scDiamondEstimate = 0.0;
                                            $scope.weddingItems[parentId].sc_totalWeddingBandDiamondsEstimate = 0.0;
                                        }
                                    });

                                    $scope.summaryTotal += parseFloat(weddingBandDiamondTotal);
                                    if (!weddingBandDiamondTotal)
                                        $scope.isAttributeZero = true;

                                    var totalStoneValue = 0;
                                    $scope.weddingItems[parentId].sc_totalWeddingBandGemstonesEstimate = 0;
                                    angular.forEach(weddingGemstoneCost, function (data, key) {
                                        var childKey = key;
                                        if (data.prices && data.prices.retailPrice != null) {
                                            var roundValue = roundOf2Decimal(data.prices.retailPrice);
                                            totalStoneValue += parseFloat(roundValue);
                                            $scope.weddingItems[parentId].mounting.stoneDetails[childKey].scStoneEstimate = parseFloat(roundOf2Decimal(data.prices.retailPrice));
                                            $scope.weddingItems[parentId].sc_totalWeddingBandGemstonesEstimate = parseFloat(totalStoneValue);
                                        } else {
                                            $scope.weddingItems[parentId].mounting.stoneDetails[childKey].scStoneEstimate = 0.0;
                                            $scope.weddingItems[parentId].sc_totalWeddingBandGemstonesEstimate = 0.0;
                                        }
                                    });

                                    if (!totalStoneValue)
                                        $scope.isAttributeZero = true;
                                    $scope.summaryTotal += parseFloat(totalStoneValue);

                                    var mountingCost = data.metalMounting;
                                    if (mountingCost.prices && mountingCost.prices.retailPrice != null) {
                                        var roundVal = roundOf2Decimal(mountingCost.prices.retailPrice);
                                        $scope.totalSetting += parseFloat(roundVal);
                                        $scope.weddingItems[parentId].mounting.scMountingEstimates = parseFloat(roundVal);
                                    } else {
                                        $scope.weddingItems[parentId].mounting.scMountingEstimates = 0.0;
                                    }
                                });

                                if (!$scope.totalSetting)
                                    $scope.isAttributeZero = true;
                                $scope.summaryTotal += $scope.totalSetting;
                                $scope.totalSetting = parseFloat(roundOf2Decimal($scope.totalSetting + $scope.Appraisal.ScTotalMountingPrice));
                            }

                            // Calculate Sales Tax
                            $scope.Appraisal.salesTaxPt = $scope.costSalesTax == 0 ? 8.1 : $scope.Appraisal.salesTaxPt;
                            calSalesTax();

                            // $scope.totalRetailValue = $scope.summaryTotal + $scope.costSalesTax;
                            $scope.totalRetailValue = parseFloat(roundOf2Decimal($scope.summaryTotal)) + parseFloat(roundOf2Decimal($scope.costSalesTax));


                            var speedCheckSuggestion = '';
                            if ($scope.totalRetailValue != null && parseFloat($scope.totalRetailValue) != 0) {
                                if (parseFloat($scope.totalRetailValue) > parseFloat($scope.Appraisal.AppraisalValue)) {
                                    // $("#speedCheck-Estimate").removeClass("text-green").addClass("text-red");
                                    $scope.Appraisal.scEstimateDescription = "Typical appraisals range from " + $filter('currency')(parseFloat($scope.totalInsuranceReplacementCost)) + " to " + $filter('currency')(parseFloat($scope.totalRetailValue)) + " depending on appraiser. Original appraisal value of " + $filter('currency')(parseFloat($scope.Appraisal.AppraisalValue)) + " is low. Suggest a new appraisal to the policyholder.";
                                    $scope.estimateText = 'red';
                                } else if (parseFloat($scope.totalRetailValue) <= parseFloat($scope.Appraisal.AppraisalValue)) {
                                    //$("#speedCheck-Estimate").removeClass("text-red").addClass("text-green");
                                    $scope.Appraisal.scEstimateDescription = "The item is insured adequately.";
                                    $scope.estimateText = 'green';
                                }
                            }

                            if (!angular.isDefined($scope.Appraisal.OriginalDescription) || (!angular.isDefined($scope.Appraisal.AppraisalValue) || $scope.Appraisal.AppraisalValue == "0.0")) {
                                var elm = document.getElementById('OriginalDescription');
                                //$scope.inValidField = true;
                                if (!angular.isDefined($scope.Appraisal.OriginalDescription) && (!angular.isDefined($scope.Appraisal.AppraisalValue) || $scope.Appraisal.AppraisalValue == "0.0")) {
                                    elm.focus();
                                    $scope.inValidFieldApprDesc = true;
                                    $scope.inValidFieldApprValue = true;
                                    toastr.remove();
                                    toastr.warning("Please enter 'Original Appraisal Description' and 'Original Appraisal Value' required fields", "Required");
                                } else if (!angular.isDefined($scope.Appraisal.OriginalDescription)) {
                                    elm.focus();
                                    $scope.inValidFieldApprDesc = true;
                                    $scope.inValidFieldApprValue = false;
                                    toastr.remove();
                                    toastr.warning("Please enter 'Original Appraisal Description' required field", "Required");
                                } else if ((!angular.isDefined($scope.Appraisal.AppraisalValue) || $scope.Appraisal.AppraisalValue == "0.0")) {
                                    elm = document.getElementById('appraisalValue');
                                    elm.focus();
                                    $scope.inValidFieldApprValue = true;
                                    $scope.inValidFieldApprDesc = false;
                                    toastr.remove();
                                    toastr.warning("Please enter 'Original Appraisal Value' required field", "Required");
                                }
                                $(".page-spinner-bar").addClass("hide");

                            } else {

                            
                                $scope.isSubmittedToSC = true;

                                // After successfull SpeedCheck API call - Save/Update appraisal data
                               $(".page-spinner-bar").addClass("hide");
                                toastr.remove();
                                toastr.success("Successfully validated the item's value from SpeedCheck.", "Confirmation");
                            }

                        }
                        else{

                            $scope.isIRCost = true;
                            $scope.isRetailValue = false;
                            $scope.both = false;

                            var tempDiamond = [];
                            $scope.summaryTotal = 0;

                            var scMaunting = result.mountingCost;

                            var scStoneDetails;
                            var scDiamondDetails;

                            var scCenterDiamond;
                            var scCenterGemstone;
                            var scCenterDiamonds = [];
                            scCenterDiamond = (result.diamonds) ? result.diamonds.diamonds : null;
                            scCenterGemstone = result.gemstones ? result.gemstones.gemstones : null;

                            if (scCenterDiamond && scCenterDiamond.diamonds) {
                                scCenterDiamonds = scCenterDiamond.diamonds;
                            }

                            if (scMaunting) {
                                scStoneDetails = scMaunting.accentGemstonesValue;
                                scDiamondDetails = scMaunting.accentDiamondsValue;
                            }

                            if (scDiamondDetails)
                                var scDiamonds = scDiamondDetails.diamonds;

                            if (scStoneDetails)
                                var scGemstones = scStoneDetails.gemstones;

                            var scChain = result.chain;
                            if (diamondDetails) {
                                for (var i = 0; i < diamondDetails.length; i++) {

                                    var diamondDetail = diamondDetails[i];

                                    if (scDiamonds && scDiamonds.length > 0 && scDiamonds[i].prices != null && scDiamonds[i].prices.insuranceReplacementCost != null) {
                                        diamondDetail.scDiamondEstimate = roundOf2Decimal(scDiamonds[i].prices.insuranceReplacementCost);

                                    } else {
                                        diamondDetail.scDiamondEstimate = 0.0;
                                    }


                                    tempDiamond.push(diamondDetail);
                                }

                                diamondDetails = tempDiamond;
                                $scope.diamondItems = diamondDetails;
                            }

                            //totasl estimation for diamonds
                            if (scDiamondDetails && scDiamondDetails.diamondInsuranceReplacementCost > 0)
                                $scope.diamondInsuranceReplacementCost = roundOf2Decimal(scDiamondDetails.diamondInsuranceReplacementCost);
                            else
                                $scope.diamondInsuranceReplacementCost = 0.0;

                            //recommend purpose
                            if (scDiamondDetails && (!scDiamondDetails.diamondInsuranceReplacementCost || scDiamondDetails.diamondInsuranceReplacementCost == 0))
                                $scope.isAttributeZero = true;

                            $scope.summaryTotal += parseFloat($scope.diamondInsuranceReplacementCost);

                            //stone details
                            var tempStoneDetail = [];
                            if (stoneDetails) {
                                for (var i = 0; i < stoneDetails.length; i++) {

                                    var stoneDetail = stoneDetails[i];
                                    if (scGemstones && scGemstones.length > 0 && scGemstones[i].prices != null && scGemstones[i].prices.insuranceReplacementCost != null) {
                                        stoneDetail.scStoneEstimate = roundOf2Decimal(scGemstones[i].prices.insuranceReplacementCost);
                                    } else {
                                        stoneDetail.scStoneEstimate = 0.0;
                                    }


                                    tempStoneDetail.push(stoneDetail);
                                }
                                stoneDetails = tempStoneDetail;
                                $scope.gemstoneItems = stoneDetails;
                            }
                            //console.log(tempDiamond);




                            //center diamond

                            var tempCenterDiamondDetail = [];

                            if (centerDiamonds.length == 1 && $scope.centerStone.diamond != null) {
                                $scope.centerStone.diamond.scDiamondEstimate = (scCenterDiamond && scCenterDiamond.length > 0 && scCenterDiamond[0].prices != null && scCenterDiamond[0].prices.insuranceReplacementCost != null) ? roundOf2Decimal(scCenterDiamond[0].prices.insuranceReplacementCost) : 0.0;

                                //recpmmend purpose
                                if ((scCenterDiamond && scCenterDiamond.length > 0 && scCenterDiamond[0].prices != null && scCenterDiamond[0].prices.insuranceReplacementCost == null))
                                    $scope.isAttributeZero = true;
                            } else if ($scope.pairedDiamondItems) {
                                $scope.scDiamondEstimateTotal = 0;
                                for (var i = 0; i < $scope.pairedDiamondItems.length; i++) {
                                    var diamondDetail = $scope.pairedDiamondItems[i];
                                    if (scCenterDiamond && scCenterDiamond.length > 0 && scCenterDiamond.length > 0 && scCenterDiamond[i] && scCenterDiamond[i].prices && scCenterDiamond[i].prices != null && scCenterDiamond[i].prices.insuranceReplacementCost != null) {
                                        $scope.pairedDiamondItems[i].scDiamondEstimate = roundOf2Decimal(scCenterDiamond[i].prices.insuranceReplacementCost);
                                        $scope.scDiamondEstimateTotal += parseFloat($scope.pairedDiamondItems[i].scDiamondEstimate);
                                        //$scope.centerStone.diamond.scDiamondEstimate = $scope.scDiamondEstimateTotal;
                                    } else {
                                        $scope.pairedDiamondItems.scDiamondEstimate = 0.0;
                                    }
                                    if ($scope.pairedDiamondItems.scDiamondEstimate == 0)
                                        $scope.isAttributeZero = true;
                                }
                            }

                            //center stone

                            //stone details
                            var tempCenterStoneDetail = [];
                            if (centerGemstones.length == 1 && $scope.centerStone.gemstone != null) {
                                $scope.centerStone.gemstone.scStoneEstimate = (scCenterGemstone && scCenterGemstone.length > 0 && scCenterGemstone[0].prices != null && scCenterGemstone[0].prices.insuranceReplacementCost != null) ? roundOf2Decimal(scCenterGemstone[0].prices.insuranceReplacementCost) : 0.0;

                                if (scCenterGemstone && scCenterGemstone.length > 0 && scCenterGemstone[0].prices != null && !scCenterGemstone[0].prices.insuranceReplacementCost)
                                    $scope.isAttributeZero = true;
                            } else if ($scope.pairedGemstoneItems) {
                                $scope.scStoneEstimateTotal = 0;
                                for (var i = 0; i < $scope.pairedGemstoneItems.length; i++) {

                                    var stoneDetail = $scope.pairedGemstoneItems[i];
                                    if (scCenterGemstone && scCenterGemstone.length > 0 && scCenterGemstone[i] && scCenterGemstone[i].prices != null && scCenterGemstone[i].prices.insuranceReplacementCost != null) {
                                        $scope.pairedGemstoneItems[i].scStoneEstimate = roundOf2Decimal(scCenterGemstone[i].prices.insuranceReplacementCost);
                                        //$scope.scStoneEstimateTotal += parseFloat($scope.pairedGemstoneItems[i].scStoneEstimate);

                                    } else {
                                        $scope.pairedGemstoneItems[i].scStoneEstimate = 0.0;
                                    }

                                    if ($scope.pairedGemstoneItems[i].scStoneEstimate == 0)
                                        $scope.isAttributeZero = true;
                                }
                            }

                            //total estimation for gemstone
                            if (scStoneDetails && scStoneDetails.gemstoneInsuranceReplacementCost > 0)
                                $scope.gemstoneArtigemReplacementCost = roundOf2Decimal(scStoneDetails.gemstoneInsuranceReplacementCost);
                            else
                                $scope.gemstoneArtigemReplacementCost = 0.0;

                            //recpmmend purpose
                            if (scStoneDetails && (!scStoneDetails.gemstoneInsuranceReplacementCost || scStoneDetails.gemstoneInsuranceReplacementCost == 0))
                                $scope.isAttributeZero = true;


                            //total estimate for center diamond gemstone
                            $scope.scCenterDiamondTotal = (result.diamonds && result.diamonds.diamondInsuranceReplacementCost) ? result.diamonds.diamondInsuranceReplacementCost : 0.0;
                            $scope.scCenterStoneTotal = (result.gemstones && result.gemstones.gemstoneInsuranceReplacementCost) ? result.gemstones.gemstoneInsuranceReplacementCost : 0.0;

                            $scope.summaryTotal += parseFloat($scope.gemstoneArtigemReplacementCost);
                            $scope.summaryTotal += parseFloat($scope.scCenterDiamondTotal);
                            $scope.summaryTotal += parseFloat($scope.scCenterStoneTotal);

                            //mounting estimate
                            //total estimate for mounting
                            if (scMaunting && scMaunting != null && scMaunting.metalMounting != null && scMaunting.metalMounting.prices && scMaunting.metalMounting.prices.insuranceReplacementCost > 0)
                                $scope.Appraisal.ScTotalMountingPrice = parseFloat(roundOf2Decimal(scMaunting.metalMounting.prices.insuranceReplacementCost));
                            else
                                $scope.Appraisal.ScTotalMountingPrice = 0.0;

                            //recommend purpose
                            if (scMaunting && scMaunting != null && scMaunting.metalMounting != null && scMaunting.metalMounting.prices && !scMaunting.metalMounting.prices.insuranceReplacementCost)
                                $scope.isAttributeZero = true;
                            //total with accentstone
                            $scope.Appraisal.ScTotalMountingAccentStonePrice = (scMaunting && scMaunting.mountingInsuranceReplacementCost) ? roundOf2Decimal(scMaunting.mountingInsuranceReplacementCost) : 0.0;

                            $scope.summaryTotal += parseFloat($scope.Appraisal.ScTotalMountingPrice);

                            //chain estimates
                            if (scChain && scChain != null && scChain.prices != null && scChain.prices.insuranceReplacementCost > 0)
                                $scope.Appraisal.ScTotalChainPrice = roundOf2Decimal(scChain.prices.insuranceReplacementCost);
                            else
                                $scope.Appraisal.ScTotalChainPrice = 0.0;

                            $scope.summaryTotal += parseFloat($scope.Appraisal.ScTotalChainPrice);

                            //labour cosst
                            if (result.laborCost && result.laborCost > 0)
                                $scope.Appraisal.labourCost = roundOf2Decimal(result.laborCost);
                            else
                                $scope.Appraisal.labourCost = 0.0;

                            $scope.summaryTotal += parseFloat($scope.Appraisal.labourCost);

                            //totalSalvageCost
                            if (result.totalSalvageCost > 0)
                                $scope.totalSalvageCost = roundOf2Decimal(result.totalSalvageCost);
                            else
                                $scope.totalSalvageCost = 0.0;

                            //totalJeweleryCost
                            if (result.totalJeweleryCost > 0)
                                $scope.totalJeweleryCost = roundOf2Decimal(result.totalJeweleryCost);
                            else
                                $scope.totalJeweleryCost = 0.0;

                            //totalArtigemReplacementCost
                            if (result.totalArtigemReplacementCost > 0)
                                $scope.totalArtigemReplacementCost = roundOf2Decimal(result.totalArtigemReplacementCost);
                            else
                                $scope.totalArtigemReplacementCost = 0.0;

                            //totalInsuranceReplacementCost
                            if (result.totalInsuranceReplacementCost > 0)
                                $scope.totalInsuranceReplacementCost = roundOf2Decimal(result.totalInsuranceReplacementCost);
                            else
                                $scope.totalInsuranceReplacementCost = 0.0;

                            //totalRetailValue
                            if (result.totalRetailValue > 0)
                                $scope.totalRetailValue = roundOf2Decimal(result.totalRetailValue);
                            else
                                $scope.totalRetailValue = 0.0;

                            $scope.speedcheckSubmitDate = new Date();

                            if ($scope.totalInsuranceReplacementCost != null && parseFloat($scope.totalInsuranceReplacementCost) != 0) {
                                if (parseFloat($scope.totalInsuranceReplacementCost) > parseFloat($scope.Appraisal.AppraisalValue)) {
                                    // $("#speedCheck-Estimate").removeClass("text-green").addClass("text-red");
                                    $scope.Appraisal.scEstimateDescription = "Typical appraisals range from " + $filter('currency')(parseFloat($scope.totalInsuranceReplacementCost)) + " to " + $filter('currency')(parseFloat($scope.totalRetailValue)) + " depending on appraiser. Original appraisal value of " + $filter('currency')(parseFloat($scope.Appraisal.AppraisalValue)) + " is low. Suggest a new appraisal to the policyholder.";
                                    $scope.estimateText = 'red';
                                } else if (parseFloat($scope.totalInsuranceReplacementCost) <= parseFloat($scope.Appraisal.AppraisalValue)) {
                                    //$("#speedCheck-Estimate").removeClass("text-red").addClass("text-green");
                                    $scope.Appraisal.scEstimateDescription = "The item is insured adequately.";
                                    $scope.estimateText = 'green';
                                }
                            }

                            //WeddingBand.
                            $scope.showWeddingBandCost = false;
                            $scope.totalSetting = 0.0;
                            if (angular.isDefined(result.weddingBandCost) && result.weddingBandCost.length > 0) {
                                $scope.showWeddingBandCost = true;
                                var scWeddingBandCostList = result.weddingBandCost;
                                angular.forEach(scWeddingBandCostList, function (data, key) {
                                    var parentId = key;

                                    if (data.accentDiamondsValue && data.accentDiamondsValue.diamonds)
                                        var weddingDiamondCost = data.accentDiamondsValue.diamonds;
                                    if (data.accentGemstonesValue && data.accentGemstonesValue.gemstones)
                                        var weddingGemstoneCost = data.accentGemstonesValue.gemstones;

                                    var weddingBandDiamondTotal = 0;
                                    $scope.weddingItems[parentId].sc_totalWeddingBandDiamondsEstimate = 0;
                                    angular.forEach(weddingDiamondCost, function (data, key) {
                                        var childDiamondKey = key;
                                        if (data.prices && data.prices.insuranceReplacementCost != null) {
                                            var roundVal = roundOf2Decimal(data.prices.insuranceReplacementCost);
                                            weddingBandDiamondTotal += parseFloat(roundVal);
                                            $scope.weddingItems[parentId].mounting.diamondDetails[childDiamondKey].scDiamondEstimate = parseFloat(roundOf2Decimal(data.prices.insuranceReplacementCost));
                                            $scope.weddingItems[parentId].sc_totalWeddingBandDiamondsEstimate = parseFloat(weddingBandDiamondTotal);
                                        } else {
                                            $scope.weddingItems[parentId].mounting.diamondDetails[childDiamondKey].scDiamondEstimate = 0.0;
                                            $scope.weddingItems[parentId].sc_totalWeddingBandDiamondsEstimate = 0.0;
                                        }
                                    });

                                    $scope.summaryTotal += parseFloat(weddingBandDiamondTotal);
                                    if (!weddingBandDiamondTotal)
                                        $scope.isAttributeZero = true;

                                    var totalStoneValue = 0;
                                    $scope.weddingItems[parentId].sc_totalWeddingBandGemstonesEstimate = 0;
                                    angular.forEach(weddingGemstoneCost, function (data, key) {
                                        var childKey = key;
                                        if (data.prices && data.prices.insuranceReplacementCost != null) {
                                            var roundValue = roundOf2Decimal(data.prices.insuranceReplacementCost);
                                            totalStoneValue += parseFloat(roundValue);
                                            $scope.weddingItems[parentId].mounting.stoneDetails[childKey].scStoneEstimate = parseFloat(roundOf2Decimal(data.prices.insuranceReplacementCost));
                                            $scope.weddingItems[parentId].sc_totalWeddingBandGemstonesEstimate = parseFloat(totalStoneValue);
                                        } else {
                                            $scope.weddingItems[parentId].mounting.stoneDetails[childKey].scStoneEstimate = 0.0;
                                            $scope.weddingItems[parentId].sc_totalWeddingBandGemstonesEstimate = 0.0;
                                        }
                                    });

                                    if (!totalStoneValue)
                                        $scope.isAttributeZero = true;
                                    $scope.summaryTotal += parseFloat(totalStoneValue);

                                    var mountingCost = data.metalMounting;
                                    if (mountingCost.prices && mountingCost.prices.insuranceReplacementCost != null) {
                                        var roundVal = roundOf2Decimal(mountingCost.prices.insuranceReplacementCost);
                                        $scope.totalSetting += parseFloat(roundVal);
                                        $scope.weddingItems[parentId].mounting.scMountingEstimates = parseFloat(roundVal);
                                    } else {
                                        $scope.weddingItems[parentId].mounting.scMountingEstimates = 0.0;
                                    }
                                });

                                if (!$scope.totalSetting)
                                    $scope.isAttributeZero = true;
                                $scope.summaryTotal += $scope.totalSetting;
                                $scope.totalSetting = parseFloat(roundOf2Decimal($scope.totalSetting + $scope.Appraisal.ScTotalMountingPrice));
                            }

                            // Calculate Sales Tax
                            $scope.Appraisal.salesTaxPt = $scope.costSalesTax == 0 ? 8.1 : $scope.Appraisal.salesTaxPt;
                            calSalesTax();

                            $scope.totalInsuranceReplacementCost = parseFloat(roundOf2Decimal($scope.summaryTotal)) + parseFloat(roundOf2Decimal($scope.costSalesTax));

                            var speedCheckSuggestion = '';
                            if ($scope.totalInsuranceReplacementCost != null && parseFloat($scope.totalInsuranceReplacementCost) != 0) {
                                if (parseFloat($scope.totalInsuranceReplacementCost) > parseFloat($scope.Appraisal.AppraisalValue)) {
                                    // $("#speedCheck-Estimate").removeClass("text-green").addClass("text-red");
                                    $scope.Appraisal.scEstimateDescription = "Typical appraisals range from " + $filter('currency')(parseFloat($scope.totalInsuranceReplacementCost)) + " to " + $filter('currency')(parseFloat($scope.totalRetailValue)) + " depending on appraiser. Original appraisal value of " + $filter('currency')(parseFloat($scope.Appraisal.AppraisalValue)) + " is low. Suggest a new appraisal to the policyholder.";
                                    $scope.estimateText = 'red';
                                } else if (parseFloat($scope.totalInsuranceReplacementCost) <= parseFloat($scope.Appraisal.AppraisalValue)) {
                                    //$("#speedCheck-Estimate").removeClass("text-red").addClass("text-green");
                                    $scope.Appraisal.scEstimateDescription = "The item is insured adequately.";
                                    $scope.estimateText = 'green';
                                }
                            }

                            if (!angular.isDefined($scope.Appraisal.OriginalDescription) || (!angular.isDefined($scope.Appraisal.AppraisalValue) || $scope.Appraisal.AppraisalValue == "0.0")) {
                            //     var elm = document.getElementById('OriginalDescription');
                            //     //$scope.inValidField = true;
                            //     if (!angular.isDefined($scope.Appraisal.OriginalDescription) && (!angular.isDefined($scope.Appraisal.AppraisalValue) || $scope.Appraisal.AppraisalValue == "0.0")) {
                            //         elm.focus();
                            //         $scope.inValidFieldApprDesc = true;
                            //         $scope.inValidFieldApprValue = true;
                            //         toastr.remove();
                            //         toastr.warning("Please enter 'Original Appraisal Description' and 'Original Appraisal Value' required fields", "Required");
                            //     } else if (!angular.isDefined($scope.Appraisal.OriginalDescription)) {
                            //         elm.focus();
                            //         $scope.inValidFieldApprDesc = true;
                            //         $scope.inValidFieldApprValue = false;
                            //         toastr.remove();
                            //         toastr.warning("Please enter 'Original Appraisal Description' required field", "Required");
                            //     } else if ((!angular.isDefined($scope.Appraisal.AppraisalValue) || $scope.Appraisal.AppraisalValue == "0.0")) {
                            //         elm = document.getElementById('appraisalValue');
                            //         elm.focus();
                            //         $scope.inValidFieldApprValue = true;
                            //         $scope.inValidFieldApprDesc = false;
                            //         toastr.remove();
                            //         toastr.warning("Please enter 'Original Appraisal Value' required field", "Required");
                            //     }
                                $(".page-spinner-bar").addClass("hide");

                            } else {

                               $(".page-spinner-bar").addClass("hide");
                                toastr.remove();
                                toastr.success("Successfully validated the item's value from SpeedCheck.", "Confirmation");
                            }
                        } 

                    }, function (error) {
                        toastr.remove();
                        $(".page-spinner-bar").addClass("hide");
                        if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                            toastr.error("Error fetching SpeedCheck values for item.", "Error");
                        } else {
                            toastr.error("Error fetching speedcheck values for item.", "Error");
                        }

                    });

            }else{
                // Open Contract Expired popup
                companyContractExpiredPopop();
            }
                
        }


       

        function checkFieldsforGetChainDetails(p) {
            if (p.MetalColor || p.MetalLength || p.MetalType || (p.MetalWeight && p.MetalWeight.weight) || (p.MetalWeight && p.MetalWeight.MetalUnit))
                return true;
            else
                return false;
        }

        function checkAllFieldOfChain(c) {

            if (c.chainType || c.chainColor || c.chainWeight || c.chainWeightUnit || c.chainLength)
                return true;
            else
                return false;


        }

        //onChangePopulate
        $scope.onChangePopulate = onChangePopulate;

        function onChangePopulate() {

            var tempTypeDropdowns = [];
            $scope.isMountingRequired = true;
            $scope.isDiamondRequired = false;
            $scope.isGemstomeRequired = false;
            $scope.isPearlRequired = false;
            $scope.isChainRequired = false;
            $scope.isWeddingBand = false;

            $scope.addCenterGemstone = false;
            $scope.deleteDiamond = false;

            $scope.moreDiamonds = true;
            $scope.moreGemstones = true;
            $scope.morePearls = true;
            //$scope.pairedDiamondItems = [];
            $scope.pairedGemstoneItems = [];

            $scope.nonPairedGemstone = false;
            $scope.nonPairedDiamond = false;



            //resetting
            $scope.centerStoneClarityTo = $scope.diamondClarityList;
            $scope.diamondItems = [];

            $scope.Appraisal.Watch = {};
            $scope.Appraisal.Designer = {}
            $scope.Appraisal.Designer.attributeValueId = 6;
            $scope.Appraisal.Custom = {}
            $scope.Appraisal.Custom.attributeValueId = 4;
            $scope.Appraisal.Gender = {};
            $scope.decslaimer = "Artigem has identified a new replacement value of your item based off current market conditions. The valuation is derived by entering the attributes that affect value into software to compile the new replacement value including sales tax. This value is calculated by market averages and adding 20-25% for potential market price fluctuations and possible limited availability. While the actual cost to replace may be less than the appraised value, it is important to protect against these scenarios. Artigem does not warrant the value as the item was not inspected. ";

            $scope.centerStone = {};

            // $scope.diamondItems = [{
            //     id: '1',
            //     removeButton: false
            // }];

            $scope.gemstoneItems = [];
            // $scope.gemstoneItems = [{
            //     id: '1',
            //     removeButton: false
            // }];

            //$scope.pearlItems = $scope.defaultPearlItem;
            // $scope.pearlItems = [{
            //     id: '1',
            //     removeButton: false
            // }];

            $scope.Appraisal.Chain = {};
            $scope.Appraisal.Mounting = {};

            $scope.showAddADiamond = false;
            $scope.showAddAGemstone = false;
            $scope.showAddAPearl = false;



            $scope.Appraisal.centeredStone = {};
            $scope.Appraisal.centeredStone.type = "";
            $scope.Appraisal.Chain.isChain = "";
            //chain and settings
            $scope.showChainandSetting = false;

            $scope.showChain = false;
            $scope.showWatch = false;

            //accent stone
            $scope.showAccentDiamond = false;
            $scope.showAccentGemstone = false;
            $scope.moreDiamonds = false;
            $scope.moreGemstones = false;
            $scope.showCheckboxOption = false;

            //paired diamond gemstone
            $scope.showCheckboxOption = false;
            $scope.showPairedDiamond = false;
            $scope.showPairedGemstone = false;


            //centered stone
            $scope.showCenteredStone = false;
            $scope.showTypeOption = false;
            $scope.showCenteredDiamond = false;
            //additional centered stone
            $scope.showAdditionalGemstone = false;
            $scope.showAdditionalDiamond = false;
            $scope.showMountingandSetting = true;
            $scope.showLooseDiamond = false;
            $scope.showLooseGemstone = false;

            //main diamond
            $scope.showMainStone = false;
            $scope.showMainDiamond = false;
            $scope.showMainGemstone = false;
            $scope.showMainGemstoneDetails = false;

            $scope.showMainDiamondDetails = false;

            $scope.showChainDetailForm = false;
            //additional stones
            $scope.showAdditionalGemstoneDetails = false;
            $scope.showCenteredGemstone = false;

            $scope.showAdditionalDiamondDetails = false;
            $scope.showCenteredDiamond = false;

            $scope.showTwo = false;

            $scope.showLoosePearl = false;

            //for earring pearl
            $scope.showCenteredStoneEarring = false;
            $scope.showCenteredDiamondEarring = false;
            $scope.showCenteredGemstoneEarring = false;
            $scope.showPairedDiamondEarring = false;
            $scope.showPairedGemstoneEarring = false;
            $scope.addCenterGemstoneEarring = false;
            $scope.addCenterDiamondEarring = false;
            $scope.isPearlStrand = false;






            //get type values
            angular.forEach($scope.AppraisalDropdowns, function (Item) {

                angular.forEach(Item.attributeValueTypes, function (subItem) {
                    tempTypeDropdowns.push(subItem);
                });
            });

            var averageObject = {
                "attributeValueId": 240,
                "atttibuteValue": "Average",
                "id": null
            }

            var elementPos = 0;


            if ($scope.metalWeightList)
                elementPos = $scope.metalWeightList.map(function (x) {
                    return x.attributeValueId;
                }).indexOf(240);
            // var objectFound = $scope.metalWeightList[elementPos];

            if (elementPos < 0)
                $scope.metalWeightList.push(averageObject);








            //find type by id
            function getByFindType(id) {
                var value = tempTypeDropdowns.filter(x => x.attributeValueTypeId === id);
                var res = value[0];
                if (res) {
                    return res.atttibuteType;
                } else
                    return "";
            }

            $scope.Appraisal.Mounting = {};
            $scope.Appraisal.Mounting.MetalWeight = {};
            $scope.Appraisal.Mounting.MetalWeight.weight;

            $scope.Appraisal.Chain.MetalWeight = {};
            $scope.Appraisal.Chain.MetalWeight.weight;
            var itemCatagory = ($scope.Appraisal.ItemCategory) ? $scope.Appraisal.ItemCategory.attributeValueId : "";
            var itemType = ($scope.Appraisal.ItemType) ? $scope.Appraisal.ItemType.attributeValueTypeId : "";
            //ring id=7
            if (itemCatagory == 7 && (itemType != null || itemType != "undefined")) {


                // var itemTypebyId = getByFindType(itemType);
                if (getByFindType(itemType) == "Diamond Solitaire" || itemType == 1) {

                    //show centered stone type options drop down

                    $scope.showCenteredStone = true;
                    $scope.showCenteredDiamond = true;

                    //Wedding Band
                    $scope.isWeddingBand = true;





                } else if (getByFindType(itemType) == "Engagement" || itemType == 2) {

                    //show centered stone type options drop down
                    $scope.showTypeOption = true;
                    $scope.showCenteredDiamond = false;
                    $scope.showCenteredGemstone = false;
                    $scope.showCenteredStone = true;

                    //accent stones
                    $scope.showAccentDiamond = true;
                    $scope.showAccentGemstone = true;
                    $scope.moreDiamonds = true;
                    $scope.moreGemstones = true;

                    //Wedding Band
                    $scope.isWeddingBand = true;


                } else if (getByFindType(itemType) == "Wedding Band / Anniversary" || itemType == 3) {


                    //accent stones
                    $scope.showAccentDiamond = true;
                    $scope.showAccentGemstone = true;
                    $scope.moreDiamonds = true;
                    $scope.moreGemstones = true;

                } else if (getByFindType(itemType) == "Colored Gemstone" || itemType == 4) {


                    //show centered stone type options drop down
                    $scope.showTypeOption = true;
                    $scope.showCenteredDiamond = false;
                    $scope.showCenteredGemstone = false;
                    $scope.showCenteredStone = true;

                    //accent stones
                    $scope.showAccentDiamond = true;
                    $scope.showAccentGemstone = true;
                    $scope.moreDiamonds = true;
                    $scope.moreGemstones = true;





                } else if (getByFindType(itemType) == "Pearl" || itemType == 25) {
                    $scope.showPearl = true;
                    $scope.showMountingandSetting = true;
                    $scope.isPearl = true;

                    $scope.showAccentDiamond = true;
                    $scope.showAccentGemstone = true;
                    $scope.moreDiamonds = true;
                    $scope.moreGemstones = true;

                    $scope.showTypeOption = true;
                    $scope.showCenteredDiamond = false;
                    $scope.showCenteredGemstone = false;
                    $scope.showCenteredStone = true;
                    $scope.showSpeedcheckInfo = true;
                } else if (getByFindType(itemType) == "Fashion" || itemType == 28) {

                    //show centered stone type options drop down
                    $scope.showTypeOption = true;
                    $scope.showCenteredDiamond = false;
                    $scope.showCenteredGemstone = false;
                    $scope.showCenteredStone = true;

                    //accent stones
                    $scope.showAccentDiamond = true;
                    $scope.showAccentGemstone = true;
                    $scope.moreDiamonds = true;
                    $scope.moreGemstones = true;

                } else if (getByFindType(itemType) == "Eternity Band" || itemType == 29) {

                    //accent stones
                    $scope.showAccentDiamond = true;
                    $scope.showAccentGemstone = true;
                    $scope.moreDiamonds = true;
                    $scope.moreGemstones = true;

                }

            }
            //bracelets id=8
            else if (itemCatagory == 8 && (itemType != null || itemType != "undefined")) {


                if (getByFindType(itemType) == "Bangle" || itemType == 5) {


                    //accent stones
                    $scope.showAccentDiamond = true;
                    $scope.showAccentGemstone = true;
                    $scope.moreDiamonds = true;
                    $scope.moreGemstones = true;


                } else if (getByFindType(itemType) == "Diamond Tennis" || itemType == 6) {



                    //accent stones
                    $scope.showAccentDiamond = true;

                    $scope.moreDiamonds = true;







                } else if (getByFindType(itemType) == "Diamond Gemstone Tennis" || itemType == 7) {


                    //accent stones
                    $scope.showAccentDiamond = true;
                    $scope.showAccentGemstone = true;
                    $scope.moreDiamonds = true;
                    $scope.moreGemstones = true;

                } else if (getByFindType(itemType) == "Chain (No Stones)" || itemType == 8) {

                    $scope.showChainandSetting = true;
                    $scope.showMountingandSetting = false;
                    $scope.isPearl = false;

                    elementPos = $scope.metalWeightList.map(function (x) {
                        return x.attributeValueId;
                    }).indexOf(240);

                    if (elementPos >= 0)
                        $scope.metalWeightList.splice(elementPos, 1);

                } else if (getByFindType(itemType) == "Pearl Strand" || itemType == 24) {
                    $scope.showPearl = true;
                    $scope.showMountingandSetting = true;
                    $scope.isPearl = true;
                    $scope.isPearlStrand = true;

                    //accent stones
                    $scope.showAccentDiamond = true;
                    $scope.showAccentGemstone = true;
                    $scope.moreDiamonds = true;
                    $scope.moreGemstones = true;
                    $scope.showSpeedcheckInfo = true;

                } else {

                }

            }
            //Necklaces id=9
            else if (itemCatagory == 9 && (itemType != null || itemType != "undefined")) {


                if (getByFindType(itemType) == "Diamond Solitaire" || itemType == 9) {

                    //show centered stone type options drop down
                    $scope.showCenteredStone = true;
                    $scope.showCenteredDiamond = true;

                    //chain details
                    $scope.showChain = true;
                    $scope.Appraisal.Chain.isChain = 6


                } else if (getByFindType(itemType) == "Diamond Fashion" || itemType == 10) {

                    //accent stones
                    $scope.showAccentDiamond = true;
                    $scope.showAccentGemstone = true;
                    $scope.moreDiamonds = true;
                    $scope.moreGemstones = true;

                    //show centered stone type options drop down
                    $scope.showTypeOption = true;
                    $scope.showCenteredStone = true;

                    //chain details
                    $scope.showChain = true;
                    $scope.Appraisal.Chain.isChain = 6


                } else if (getByFindType(itemType) == "Diamond Tennis Necklace" || itemType == 11) {

                    //accent stones
                    $scope.showAccentDiamond = true;
                    $scope.moreDiamonds = true;

                } else if (getByFindType(itemType) == "Colored Gemstone" || itemType == 12) {


                    //accent stones
                    $scope.showAccentDiamond = true;
                    $scope.showAccentGemstone = true;
                    $scope.moreDiamonds = true;
                    $scope.moreGemstones = true;

                    //show centered stone type options drop down
                    $scope.showTypeOption = true;
                    $scope.showCenteredStone = true;

                    //chain details
                    $scope.showChain = true;
                    $scope.Appraisal.Chain.isChain = 6;
                }
                //Chain (No Stones)
                else if (getByFindType(itemType) == "Chain (No Stones)" || itemType == 21) {



                    $scope.showChainandSetting = true;
                    $scope.showMountingandSetting = false;
                    $scope.isPearl = false;


                    elementPos = $scope.metalWeightList.map(function (x) {
                        return x.attributeValueId;
                    }).indexOf(240);

                    if (elementPos >= 0)
                        $scope.metalWeightList.splice(elementPos, 1);


                } else if (getByFindType(itemType) == "Pearl Strand" || itemType == 23) {
                    $scope.showPearl = true;
                    $scope.showMountingandSetting = true;
                    $scope.isPearl = true;
                    $scope.isPearlStrand = true;

                    //accent stones
                    $scope.showAccentDiamond = true;
                    $scope.showAccentGemstone = true;
                    $scope.moreDiamonds = true;
                    $scope.moreGemstones = true;

                    //show centered stone type options drop down
                    $scope.showTypeOption = true;
                    $scope.showCenteredStone = true;

                    //chain details
                    $scope.showChain = true;
                    $scope.Appraisal.Chain.isChain = 6

                    $scope.showSpeedcheckInfo = true;
                } else {

                }
            }
            //Earrings id=10
            else if (itemCatagory == 10 && (itemType != null || itemType != "undefined")) {

                if (getByFindType(itemType) == "Diamond Stud" || itemType == 13) {
                    //accent stones
                    $scope.showAccentDiamond = true;
                    $scope.moreDiamonds = true;


                    //show centered stone
                    $scope.showCenteredStone = true;
                    $scope.showCenteredDiamond = false;

                    $scope.showTwo = true;


                    //for paired diamond
                    $scope.showCheckboxOption = true;
                    $scope.showPairedDiamond = true;
                    $scope.isParedCenteredStone = 6;
                    $scope.nonPairedDiamond = true;


                    showParedDiamond($scope.isParedCenteredStone);




                } else if (getByFindType(itemType) == "Hoop" || itemType == 14) {

                    //accent stones
                    $scope.showAccentDiamond = true;
                    $scope.showAccentGemstone = true;
                    $scope.moreDiamonds = true;
                    $scope.moreGemstones = true;

                } else if (getByFindType(itemType) == "Diamond Fashion" || itemType == 15) {

                    //show centered stone type options drop down


                    // $scope.showCenteredStone = true;


                    //$scope.showCenteredDiamond = true;
                    $scope.showAdditionalGemstone = true;

                    //for paired diamond
                    /* $scope.showCheckboxOption = true;
                     $scope.showPairedDiamond = true;
                     $scope.isParedCenteredStone = 6;
                     $scope.showTwo = true;

                     $scope.pairedDiamondItems = [];
                     $scope.nonPairedDiamond = true;
                     */
                    //show centered stone type options drop down
                    $scope.showCenteredStoneEarring = true;
                    $scope.isParedCenteredStone = 6;


                    //accent stones
                    $scope.showAccentDiamond = true;
                    $scope.showAccentGemstone = true;
                    $scope.moreDiamonds = true;
                    $scope.moreGemstones = true;

                    //showParedDiamond($scope.isParedCenteredStone);
                } else if (getByFindType(itemType) == "Colored Gemstone" || itemType == 22) {

                    //show centered stone type options drop down


                    // $scope.showCenteredStone = true;

                    //$scope.showCenteredDiamond = true;
                    $scope.showAdditionalDiamond = true;

                    //for paired diamond
                    /*$scope.showCheckboxOption = true;
                    $scope.showPairedGemstone = true;
                    $scope.isParedCenteredStone = 6;

                    $scope.showTwo = true;


                    $scope.pairedGemstoneItems = [{ "id": 1 }, { "id": 2 }];

                    //non paired
                    $scope.nonPairedGemstone = true;

                    showParedDiamond($scope.isParedCenteredStone);
                    */



                    //show centered stone type options drop down
                    $scope.showCenteredStoneEarring = true;
                    $scope.isParedCenteredStone = 6;

                    //accent stones
                    $scope.showAccentDiamond = true;
                    $scope.showAccentGemstone = true;
                    $scope.moreDiamonds = true;
                    $scope.moreGemstones = true;;
                } else if (getByFindType(itemType) == "Pearl" || itemType == 26) {
                    $scope.showPearl = true;
                    $scope.showMountingandSetting = true;
                    $scope.isPearl = true;

                    //accent stones
                    $scope.showAccentDiamond = true;
                    $scope.showAccentGemstone = true;
                    $scope.moreDiamonds = true;
                    $scope.moreGemstones = true;

                    //show centered stone type options drop down
                    $scope.showCenteredStoneEarring = true;
                    $scope.isParedCenteredStone = 6;


                    $scope.showSpeedcheckInfo = true;




                } else {


                }


            }
            //stone id=11
            else if (itemCatagory == 11 && (itemType != null || itemType != "undefined")) {

                if (getByFindType(itemType) == "Loose Diamonds" || itemType == 16) {
                    $scope.showLooseDiamond = true;
                    $scope.showMountingandSetting = false;
                    $scope.isPearl = false;

                } else if (getByFindType(itemType) == "Loose Gemstones" || itemType == 17) {
                    $scope.showLooseGemstone = true;
                    $scope.showMountingandSetting = false;
                    $scope.isPearl = false;
                } else if (getByFindType(itemType) == "Loose Pearl" || itemType == 27) {
                    $scope.showLoosePearl = true;
                    $scope.showMountingandSetting = false;
                    $scope.isPearl = false;
                    $scope.showSpeedcheckInfo = true;
                } else {

                    $scope.isDiamondRequired = false;
                    $scope.isGemstomeRequired = false;

                    $scope.isPearlRequired = false;
                    $scope.isChainRequired = false;

                    $scope.moreDiamonds = false;
                    $scope.moreGemstones = false;
                    $scope.morePearls = false;

                    $scope.showDiamond = false;
                    $scope.showGemstone = false;
                    $scope.showMounting = false;
                    $scope.showPearl = false;
                    $scope.showChain = false;

                    $scope.diamondItems = [];
                    $scope.diamondItems = [{
                        id: '1',
                        removeButton: false
                    }];

                    $scope.gemstoneItems = [];
                    $scope.gemstoneItems = [{
                        id: '1',
                        removeButton: false
                    }];

                    $scope.pearlItems = [];
                    $scope.pearlItems = $scope.defaultPearlItem;
                    // [{
                    //     id: '1',
                    //     removeButton: false
                    // }];
                }
            }
            //watch =
            else if (itemCatagory == 149) {



                $scope.showWatch = true;
                $scope.showMountingandSetting = false;
                $scope.isPearl = false;


            }
            //other
            else if (itemCatagory == 150 && (itemType != null || itemType != "undefined")) {

                //if (getByFindType(itemType) == "Other" || itemType == 20) {


                //accent stones
                $scope.showAccentDiamond = true;
                $scope.showAccentGemstone = true;
                $scope.moreDiamonds = true;
                $scope.moreGemstones = true;

                //main diamond
                $scope.showMainStone = true;
                $scope.showMainDiamond = true;
                $scope.showMainGemstone = true;

                //chain details
                $scope.showChain = true;
                $scope.Appraisal.Chain.isChain = 6;

                elementPos = $scope.metalWeightList.map(function (x) {
                    return x.attributeValueId;
                }).indexOf(240);


                if (elementPos >= 0)
                    $scope.metalWeightList.splice(elementPos, 1);





                //}

            }

        }
        //saveApprisal
        var weddingDetails = [];
        $scope.saveApprisal = saveApprisal;

        function saveApprisal() {
            $scope.IsSaveDisabled = true;
            var policyNum = sessionStorage.getItem("policyNumber");
            var createdBy = sessionStorage.getItem("UserId");
            var mountingDetails = {};
            var diamondDetails = $scope.diamondItems;
            var stoneDetails = $scope.gemstoneItems;
            var pearlDetails = $scope.pearlItems;


            if (angular.isDefined($scope.Appraisal.Mounting) && angular.isDefined($scope.Appraisal.Mounting.MetalColor) && $scope.Appraisal.Mounting.MetalWeight != null) {
                mountingDetails = {

                    "metalWeight": $scope.Appraisal.Mounting.MetalWeight.weight,
                    "metalUnitWeight": $scope.Appraisal.Mounting.MetalWeight.MetalUnit,
                    "length": $scope.Appraisal.Mounting.MetalLength,
                    "width": $scope.Appraisal.Mounting.MetalWidth,
                    //check
                    "metalUnitWeight": $scope.Appraisal.Mounting.MetalWeight.MetalUnit,
                    "metalColor": $scope.Appraisal.Mounting.MetalColor,
                    "typeOfMetal": $scope.Appraisal.Mounting.MetalType,

                    "stoneDetails": stoneDetails,

                    "diamondDetails": diamondDetails,
                };
            }
            //chainDetails

            var chainDetails = {};
            if ($scope.Appraisal.Chain && $scope.Appraisal.Chain.isChain != 6 && checkFieldsforGetChainDetails($scope.Appraisal.Chain)) {


                chainDetails = {

                    "metalWeight": $scope.Appraisal.Chain.MetalWeight.weight,
                    "metalUnitWeight": $scope.Appraisal.Chain.MetalWeight.MetalUnit,
                    "length": $scope.Appraisal.Chain.MetalLength,

                    //check
                    "metalUnitWeight": $scope.Appraisal.Chain.MetalWeight.MetalUnit,
                    "metalColor": $scope.Appraisal.Chain.MetalColor,
                    "typeOfMetal": $scope.Appraisal.Chain.MetalType,

                };
            }


            var appraisalDocuments = $scope.attachmentList;

            var stoneDetails = [];
            var diamondDetails = [];
            var CenteredstoneDetails = [];

            /* $scope.centerStone.diamond.isAdditionalStone =false;
             $scope.centerStone.gemstone.isAdditionalStone = false;
             if(showAdditionalDiamondDetails == true){
                 $scope.centerStone.diamond.isAdditionalStone = true;
             }
             if(showAdditionalGemstone == true){
                 $scope.centerStone.gemstone.isAdditionalStone = true;
             }*/

            /*if ($scope.pairedDiamondItems.length > 1 && !$scope.showCenteredDiamond)
                diamondDetails = $scope.pairedDiamondItems;
            else if ($scope.centerStone.diamond && Object.keys($scope.centerStone.diamond).length > 0)
                diamondDetails.push($scope.centerStone.diamond);
            else
                diamondDetails = [];


            if ($scope.pairedGemstoneItems.length > 1 && !$scope.showCenteredGemstone)
                CenteredstoneDetails = $scope.pairedGemstoneItems;
            else if ($scope.centerStone.gemstone && Object.keys($scope.centerStone.gemstone).length > 0)
                CenteredstoneDetails.push($scope.centerStone.gemstone);
            else
                CenteredstoneDetails = [];
                */

            if ($scope.pairedDiamondItems.length > 0 && $scope.showPairedDiamondEarring)
                diamondDetails = $scope.pairedDiamondItems;
            else if ($scope.pairedDiamondItems.length > 1 && !$scope.showCenteredDiamond && !$scope.showMainDiamondDetails && checkAllfieldsOfDiamond($scope.pairedDiamondItems))
                diamondDetails = $scope.pairedDiamondItems;
            else if ($scope.centerStone.diamond && Object.keys($scope.centerStone.diamond).length > 0)
                diamondDetails.push($scope.centerStone.diamond);
            else
                diamondDetails = [];


            if ($scope.pairedGemstoneItems.length > 0 && ($scope.showPairedGemstone || $scope.showPairedGemstoneEarring) && !$scope.showCenteredGemstone && !$scope.showMainGemstoneDetails && checkAllfieldsOfGemstone($scope.pairedGemstoneItems))
                CenteredstoneDetails = $scope.pairedGemstoneItems;
            else if ($scope.centerStone.gemstone && ($scope.showCenteredGemstone || $scope.showMainGemstoneDetails || $scope.showAdditionalGemstone || $scope.showLooseGemstone || $scope.showCenteredGemstoneEarring) && Object.keys($scope.centerStone.gemstone).length > 0)
                CenteredstoneDetails.push($scope.centerStone.gemstone);
            else
                CenteredstoneDetails = [];

            if ($scope.weddingItems.length > 0) {
                $scope.isWeddingBand = true;
                weddingDetails = $scope.weddingItems;
            } else {
                $scope.isWeddingBand = false;
            }

            var details = {
                "original_appraisal_description": $scope.Appraisal.OriginalDescription,
                "appraisalEffectiveDate": (($scope.Appraisal.AppraisalDate !== null && angular.isDefined($scope.Appraisal.AppraisalDate)) ? $filter('DatabaseDateFormatMMddyyyyTime')($scope.Appraisal.AppraisalDate) + "T" + $filter('date')(new Date(), 'HH:mm:ss') + "Z" : null),

                "appraisalOldValue": $scope.Appraisal.AppraisalValue,
                "policyNumber": policyNum,
                "createdBy": createdBy,

                "gender": $scope.Appraisal.Gender,

                "isCustom": $scope.Appraisal.Custom,
                "designer": $scope.Appraisal.Designer,
                "itemCategory": $scope.Appraisal.ItemCategory,
                "type": $scope.Appraisal.ItemType,

                "mountingDetails": mountingDetails,
                "chainDetails": chainDetails,

                "diamondDetails": diamondDetails,
                "stoneDetails": CenteredstoneDetails,
                "pearlDetails": pearlDetails,

                //Wedding Band Details
                "weddingBandExists": $scope.isWeddingBand,
                "weddingBandDetails": weddingDetails,

                //display values
                "applicationSettingValueDTO": $scope.appData,

                "watchDetails": $scope.Appraisal.Watch,
                "isParedCenteredStone": $scope.isParedCenteredStone,

                "newInsurancePremiumCost": $scope.Appraisal.newInsurancePremiumCost,
                "oldInsurancePremiumCost": $scope.Appraisal.oldInsurancePremiumCost,
                //speedcheck values
                "sc_salvageValue": $scope.totalSalvageCost,
                "sc_jwelersCost": $scope.totalJeweleryCost,
                "sc_artigemReplacementValue": $scope.totalArtigemReplacementCost,
                "sc_insuranceReplacementValue": $scope.totalInsuranceReplacementCost,
                "sc_retailValue": $scope.totalRetailValue,
                "sc_totalMountingPrice": $scope.Appraisal.ScTotalMountingPrice,
                "sc_totalChainPrice": $scope.Appraisal.ScTotalChainPrice,
                "sc_totalDiamondPrice": $scope.diamondInsuranceReplacementCost,
                "sc_totalGemStonePrice": $scope.gemstoneArtigemReplacementCost,
                "sc_totalPearlPrice": $scope.pearlInsuranceReplacementCost,

                "sc_centerDiamondTotal": $scope.scCenterDiamondTotal,
                "sc_centerStoneTotal": $scope.scCenterStoneTotal,
                "sc_totalMountingAccentStonePrice": $scope.Appraisal.ScTotalMountingAccentStonePrice,

                "speedcheckResultDescription": $scope.desc.settings,
                "summaryTotal": $scope.summaryTotal,

                "salesTaxEstimation": $scope.costSalesTax,

                "sc_labourCost": $scope.Appraisal.labourCost,

                "sc_finalEstimate": $scope.Appraisal.scEstimateDescription,
                "speedcheckAppraisalDate": $scope.speedcheckSubmitDate !== null && angular.isDefined($scope.speedcheckSubmitDate) ? $filter('DatabaseDateFormatMMddyyyyTime')($scope.speedcheckSubmitDate) + "T" + $filter('date')(new Date(), 'HH:mm:ss') + "Z" : null,

                "centreStoneType": ($scope.Appraisal.centeredStone) ? $scope.Appraisal.centeredStone.type : null,
                "chainExists": ($scope.Appraisal.Chain) ? $scope.Appraisal.Chain.isChain : null
            };
            //"appraisalDocuments":appraisalDocuments
            $scope.details = details;
            var data = new FormData();
            angular.forEach($scope.attachmentList, function (ItemFile) {
                //data.append('filesDetails', JSON.stringify([{ "fileName": ItemFile.FileName, "fileType": ItemFile.FileType, "extension": ItemFile.FileExtension, "filePurpose": "ITEM_APPRAISAL", "latitude": 41.403528, "longitude": 2.173944 }]));
                data.append('file', ItemFile.File);
            });
            data.append("details", angular.toJson(details));
            $scope.data = angular.toJson(details);
            $(".page-spinner-bar").removeClass("hide");
            var promis = ComparableFilterService.SaveAppraisal(data);
            promis.then(function (success) {
                sessionStorage.setItem("appraisalId", success.data.saveSuccess.appraisalId);
                sessionStorage.setItem("AppraisalNo", success.data.saveSuccess.appraisalNumber);
                //$scope.IsEditOrder = true;
                sessionStorage.setItem("EditAppraisal", true);
                sessionStorage.setItem("isEditAppraisal", true);
                sessionStorage.setItem("isNotification", true);
                sessionStorage.setItem("newAppraisalSaveMsg", success.data.saveSuccess.message);

                $scope.formStatus = true;
                $scope.IsEditOrder = true;
                //if($scope.showToaster){
                //location.reload();
                // getAppraisalDetails(); CTB-3582 -Removed
                $scope.IsSpeedCheckDisabled = false;
                $scope.IsSaveDisabled = false;
                $(".page-spinner-bar").addClass("hide");
                /*}
                else{
                    //$(".page-spin.page-spinner-bar").addClass("hide");
                    getAppraisalDetails();
                    $(".page-spinner-bar").addClass("hide");
                AddArtigemReviewPopup();
                }*/
                // $(".page-spin.page-spinner-bar").addClass("hide");

                //getAppraisalDetails();
                //$location.path('/Appraisal');
            }, function (error) {
                $scope.IsSpeedCheckDisabled = false;
                $scope.IsSaveDisabled = false;
                toastr.remove();
                if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                    toastr.error(error.data.errorMessage, "Error")
                } else {
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
                }
                $(".page-spinner-bar").addClass("hide");
            });
        }

        //UpdateApprisal
        $scope.UpdateApprisal = UpdateApprisal;

        function UpdateApprisal() {
            var policyNum = sessionStorage.getItem("policyNumber");
            var createdBy = sessionStorage.getItem("UserId");
            var mountingDetails = {};
            var diamondDetails = $scope.diamondItems;
            var stoneDetails = $scope.gemstoneItems;
            var pearlDetails = $scope.pearlItems;

            if (angular.isDefined($scope.Appraisal.Mounting) || (diamondDetails && diamondDetails.length > 0) || (stoneDetails && stoneDetails.length > 0)) {
                mountingDetails = {

                    "id": $scope.Appraisal.Mounting.id,
                    "metalWeight": $scope.Appraisal.Mounting.MetalWeight.weight,
                    "metalUnitWeight": $scope.Appraisal.Mounting.MetalWeight.MetalUnit,
                    "length": $scope.Appraisal.Mounting.MetalLength,
                    "width": $scope.Appraisal.Mounting.MetalWidth,
                    //check
                    "metalUnitWeight": $scope.Appraisal.Mounting.MetalWeight.MetalUnit,
                    "metalColor": $scope.Appraisal.Mounting.MetalColor,
                    "typeOfMetal": $scope.Appraisal.Mounting.MetalType,

                    "stoneDetails": stoneDetails,

                    "diamondDetails": diamondDetails,
                };
            }
            //chainDetails
            var chainDetails = {};
            if ($scope.Appraisal.Chain && $scope.Appraisal.Chain.isChain != 6 && checkFieldsforGetChainDetails($scope.Appraisal.Chain)) {
                chainDetails = {

                    "metalWeight": $scope.Appraisal.Chain.MetalWeight.weight,
                    "metalUnitWeight": $scope.Appraisal.Chain.MetalWeight.MetalUnit,
                    "length": $scope.Appraisal.Chain.MetalLength,

                    //check
                    "metalUnitWeight": $scope.Appraisal.Chain.MetalWeight.MetalUnit,
                    "metalColor": $scope.Appraisal.Chain.MetalColor,
                    "typeOfMetal": $scope.Appraisal.Chain.MetalType,

                };
            }


            var appraisalDocuments = $scope.attachmentList;

            var CenteredstoneDetails = [];
            var diamondDetails = [];

            /* $scope.centerStone.diamond.isAdditionalStone =false;
             $scope.centerStone.gemstone.isAdditionalStone = false;
             if(showAdditionalDiamondDetails == true){
                 $scope.centerStone.diamond.isAdditionalStone = true;
             }
             if(showAdditionalGemstone == true){
                 $scope.centerStone.gemstone.isAdditionalStone = true;
             }*/


            /*if($scope.centerStone.diamond && $scope.centerStone.diamond.length>0)
            diamondDetails.push($scope.centerStone.diamond);
            else
            diamondDetails =[];
            */

            if ($scope.pairedDiamondItems.length > 0 && $scope.showPairedDiamondEarring)
                diamondDetails = $scope.pairedDiamondItems;
            else if ($scope.pairedDiamondItems.length > 1 && !$scope.showCenteredDiamond && !$scope.showMainDiamondDetails && checkAllfieldsOfDiamond($scope.pairedDiamondItems))
                diamondDetails = $scope.pairedDiamondItems;
            else if ($scope.centerStone.diamond && Object.keys($scope.centerStone.diamond).length > 0)
                diamondDetails.push($scope.centerStone.diamond);
            else
                diamondDetails = [];


            if ($scope.pairedGemstoneItems.length > 0 && ($scope.showPairedGemstone || $scope.showPairedGemstoneEarring) && !$scope.showCenteredGemstone && !$scope.showMainGemstoneDetails && checkAllfieldsOfGemstone($scope.pairedGemstoneItems))
                CenteredstoneDetails = $scope.pairedGemstoneItems;
            else if ($scope.centerStone.gemstone && ($scope.showCenteredGemstone || $scope.showMainGemstoneDetails || $scope.showAdditionalGemstone || $scope.showLooseGemstone || $scope.showCenteredGemstoneEarring) && Object.keys($scope.centerStone.gemstone).length > 0)
                CenteredstoneDetails.push($scope.centerStone.gemstone);
            else
                CenteredstoneDetails = [];

            if ($scope.weddingItems.length > 0) {
                $scope.isWeddingBand = true;
                weddingDetails = $scope.weddingItems;
            } else {
                $scope.isWeddingBand = false;
            }

            if(!$scope.isSubmittedToSC && $scope.appData && $scope.appData.both === 'true' && $scope.appData.isRetailValueSelected === 'true') {
                $scope.totalInsuranceReplacementCost = $scope.insuranceValueWithoutTax;
            }

            if(!$scope.isSubmittedToSC && $scope.appData && $scope.appData.both === 'true' && $scope.appData.isInsuranceReplacementCostSelected === 'true') {
                $scope.totalRetailValue = $scope.retailValueWithoutTax;
            }

            var details = {

                "id": sessionStorage.getItem("appraisalId"),
                "appraisalNumber": sessionStorage.getItem("appraisalNumber"),

                "original_appraisal_description": $scope.Appraisal.OriginalDescription,
                "appraisalEffectiveDate": (($scope.Appraisal.AppraisalDate !== null && angular.isDefined($scope.Appraisal.AppraisalDate)) ? $filter('DatabaseDateFormatMMddyyyyTime')($scope.Appraisal.AppraisalDate) + "T" + $filter('date')(new Date(), 'HH:mm:ss') + "Z" : null),

                "appraisalOldValue": $scope.Appraisal.AppraisalValue,
                "policyNumber": policyNum,
                "createdBy": createdBy,

                "gender": $scope.Appraisal.Gender,

                "isCustom": $scope.Appraisal.Custom,
                "designer": $scope.Appraisal.Designer,
                "itemCategory": $scope.Appraisal.ItemCategory,
                "type": $scope.Appraisal.ItemType,

                "mountingDetails": mountingDetails,
                "chainDetails": chainDetails,
                "pearlDetails": pearlDetails,

                //Wedding Band Details
                "weddingBandExists": $scope.isWeddingBand,
                "weddingBandDetails": weddingDetails,

                "isParedCenteredStone": $scope.isParedCenteredStone,

                "diamondDetails": diamondDetails,
                "stoneDetails": CenteredstoneDetails,

                "watchDetails": $scope.Appraisal.Watch,

                //display values
                "applicationSettingValueDTO": $scope.appData,


                "newInsurancePremiumCost": $scope.Appraisal.newInsurancePremiumCost,
                "oldInsurancePremiumCost": $scope.Appraisal.oldInsurancePremiumCost,
                //"attachments" : appraisalDocuments
                "deletedAttachments": $scope.deletedAttachmentList,
                //speedcheck values
                "sc_salvageValue": $scope.totalSalvageCost,
                "sc_jwelersCost": $scope.totalJeweleryCost,
                "sc_artigemReplacementValue": $scope.totalArtigemReplacementCost,
                "sc_insuranceReplacementValue": $scope.totalInsuranceReplacementCost,
                "sc_retailValue": $scope.totalRetailValue,
                "sc_totalMountingPrice": $scope.Appraisal.ScTotalMountingPrice,
                "sc_totalChainPrice": $scope.Appraisal.ScTotalChainPrice,
                "sc_totalDiamondPrice": $scope.diamondInsuranceReplacementCost,
                "sc_totalGemStonePrice": $scope.gemstoneArtigemReplacementCost,
                "sc_totalPearlPrice": $scope.pearlInsuranceReplacementCost,

                "sc_centerDiamondTotal": $scope.scCenterDiamondTotal,
                "sc_centerStoneTotal": $scope.scCenterStoneTotal,
                "sc_totalMountingAccentStonePrice": $scope.Appraisal.ScTotalMountingAccentStonePrice,


                "sc_labourCost": $scope.Appraisal.labourCost,

                "speedcheckResultDescription": $scope.desc.settings,
                "summaryTotal": $scope.summaryTotal,
                "salesTaxEstimation": $scope.costSalesTax,

                "sc_finalEstimate": $scope.Appraisal.scEstimateDescription,
                "speedcheckAppraisalDate": $scope.speedcheckSubmitDate !== null && angular.isDefined($scope.speedcheckSubmitDate) ? $filter('DatabaseDateFormatMMddyyyyTime')($scope.speedcheckSubmitDate) + "T" + $filter('date')(new Date(), 'HH:mm:ss') + "Z" : null,

                "centreStoneType": ($scope.Appraisal.centeredStone) ? $scope.Appraisal.centeredStone.type : null,
                "chainExists": ($scope.Appraisal.Chain) ? $scope.Appraisal.Chain.isChain : null
            };
            //"appraisalDocuments":appraisalDocuments
            $scope.details = details;


            var data = new FormData();
            angular.forEach($scope.attachmentList, function (ItemFile) {
                //data.append('filesDetails', JSON.stringify([{ "fileName": ItemFile.FileName, "fileType": ItemFile.FileType, "extension": ItemFile.FileExtension, "filePurpose": "ITEM_APPRAISAL", "latitude": 41.403528, "longitude": 2.173944 }]));
                data.append('file', ItemFile.File);
            });

            data.append("details", angular.toJson(details));
            $scope.data = angular.toJson(details);
            if (!$scope.disableScreen) {
                $(".page-spinner-bar").removeClass("hide");
            }
            //data.append("appraisalDocuments", JSON.stringify(appraisalDocuments[0]));
            var promis = ComparableFilterService.UpdateAppraisal(data);
            promis.then(function (success) {
                $scope.attachmentList = [];
                $scope.isUpload = false;
                toastr.remove();
                //to remove population of unwanted toaster
                // if($scope.showToaster){
                toastr.success("The appraisal # " + sessionStorage.getItem("appraisalNumber") + " was successfully updated", "Confirmation");
                /*  }
                  else{
                      $scope.getAppraisalDetails();
                  $(".page-spinner-bar").addClass("hide");

                  AddArtigemReviewPopup();
                  }*/
                $timeout(function () {
                    $scope.disableScreen = false;
                    //$scope.getAppraisalDetails(); CTB-3582
                }, 100);
            }, function (error) {
                $scope.attachmentList = [];
                toastr.remove();
                $(".page-spinner-bar").addClass("hide");
                if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                    toastr.error('Please enter all mandatory fields.', "Error")
                } else {
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                }
            });
        }

        //reset filters
        $scope.ClearFilters = ClearFilters;

        function ClearFilters(param) {

            if (param == "all") {
                $scope.Appraisal.ItemCategory = {};
                $scope.Appraisal.ItemType = {};
            } else if (param == "ItemType") {

                $scope.Appraisal.ItemType = {};
            }
            $scope.Appraisal.Gender = {};

            $scope.Appraisal.Custom.attributeValueId = 4;
            $scope.Appraisal.Designer.attributeValueId = 6;

            $scope.Appraisal.Mounting = {};
            $scope.Appraisal.Mounting.MetalWeight = {};

            $scope.centerStone = {}

            $scope.pairedDiamondItems = [];

            $scope.pairedGemstoneItems = [];

            $scope.Appraisal.Watch = {};

            $scope.weddingItems = [];

            $scope.Appraisal.Chain = {};


            $scope.desc.settings = "";
            $scope.decslaimer = "";

            $scope.summaryTotal = 0;
            $scope.diamondInsuranceReplacementCost = 0;
            $scope.gemstoneArtigemReplacementCost = 0;
            $scope.pearlInsuranceReplacementCost = 0;
            $scope.Appraisal.ScTotalMountingAccentStonePrice = 0;
            $scope.Appraisal.ScTotalChainPrice = 0;
            $scope.Appraisal.labourCost = 0;
            $scope.Appraisal.ScTotalMountingPrice = 0;

            $scope.totalJeweleryCost = 0.0;
            $scope.totalArtigemReplacementCost = 0.0;
            $scope.totalRetailValue = 0.0;

            $scope.diamondItems = [];
            // $scope.diamondItems = [{
            //     id: '1',
            //     removeButton: false
            // }];

            $scope.gemstoneItems = [];
            // $scope.gemstoneItems = [{
            //     id: '1',
            //     removeButton: false
            // }];

            $scope.pearlItems = [{
                "id": "1"
            }];

        }



        $scope.DeleteAppraisalDetails = DeleteAppraisalDetails;

        function DeleteAppraisalDetails() {
            var msg = "";
            if (angular.isDefined($scope.Appraisal.appraisalNumber)) {
                msg = "Are you sure you want to delete this appraisal? All information saved under this appraisal will be deleted.";
            } else {
                msg = "Are you sure you want to delete this appraisal? All information saved under this appraisal will be deleted.";
                appraisalNumber = $scope.Appraisal.appraisalNumber;
            }

            bootbox.confirm({
                size: "",
                title: "Delete Appraisal",
                message: msg,
                closeButton: false,
                className: "modalcustom",
                buttons: {
                    confirm: {
                        label: "Yes",
                        className: 'btn-success'
                    },
                    cancel: {
                        label: "No", //$translate.instant('ClaimDetails_Delete.BtnNo'),
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    if (result) {
                        if (angular.isDefined($scope.Appraisal.id) && $scope.Appraisal.id !== null) {
                            var param = {
                                "appraisalId": $scope.Appraisal.id,
                                "speedCheckVendor": sessionStorage.getItem("speedCheckVendor")
                            }
                            var promis = ComparableFilterService.deleteAppraisal(param);
                            promis.then(function (success) {
                                toastr.remove()
                                toastr.success(success.data.message);
                                $scope.Appraisal = {};
                                $scope.Desc.description = "";
                                $scope.ApprisalOrderAddEdit = false;
                                $scope.IsEditOrder = false;
                                toastr.remove()
                                toastr.success("The valuable " + $scope.Appraisal.appraisalNumber + " was deleted successfully", "Confirmation");
                                $location.path('/PolicyDetail');
                            },
                                function (error) {
                                    toastr.remove();
                                    if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                                        toastr.error(error.data.errorMessage, "Error")
                                    } else {
                                        toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
                                    }
                                });

                        };
                    }
                }
            });
        }

        // Activate / Deativate appraisal
        $scope.appraisalAction = appraisalAction

        function appraisalAction(item, status) {
            var details = {
                "id": item.id,
                "appraisalNumber": item.appraisalNumber,
                "active": status,
                "createdBy": sessionStorage.getItem("userId"),
                "speedCheckVendorRegNumber": sessionStorage.getItem("speedCheckVendor")

            };
            $(".page-spinner-bar").removeClass("hide");
            var updateAppraisal = ComparableFilterService.updateAppraisalStatus(details);
            updateAppraisal.then(function (success) {
                $(".page-spinner-bar").addClass("hide");
                toastr.remove();
                toastr.success("valuable # " + item.appraisalNumber + " " + success.data.message, "Confirmation");
                $location.path('/PolicyDetail');
            }, function (error) {
                $(".page-spinner-bar").addClass("hide");
                toastr.remove()
                if (angular.isDefined(error.data.errorMessage)) {
                    toastr.error('Failed to update valuable # ' + item.appraisalNumber + '. Please try again..', "Error");
                } else
                    toastr.error('Failed to update valuable # ' + item.appraisalNumber + '. Please try again..', "Error");
            });
        }

      
        $scope.IntialiseComponent = IntialiseComponent;

        function IntialiseComponent() {
            $scope.ApprisalOrderAddEdit = false;
            SetInitialApprisalDetails();
        };
        $scope.SetInitialApprisalDetails = SetInitialApprisalDetails;

        function SetInitialApprisalDetails() { }
        //File Upload for attachment
        $scope.AddAttachment = function () {
            $scope.isUpload = true;
            angular.element('#FileUpload1').trigger('click');

        }

        $scope.splice = splice;

        function splice(item) {

        }
        $scope.displayAddImageButton = false;
        $scope.getAttachmentDetails = function (e) {
            $scope.$apply(function () {
                if (e.files.length > 0) {
                    var files = event.target.files;
                    $scope.filed = event.target.files;
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        var reader = new FileReader();
                        reader.file = file;
                        reader.fileName = files[i].name;
                        reader.fileType = files[i].type;
                        reader.fileExtension = files[i].name.substr(files[i].name.lastIndexOf('.'));
                        reader.onload = $scope.LoadFileInList;
                        reader.readAsDataURL(file);
                        $scope.showAttachmentErro = false;
                    }
                } else {
                    $scope.showAttachmentErro = true;
                }
            });
        };
        $scope.LoadFileInList = function (e) {
            $scope.$apply(function () {
                var itemExist = false;
                var newFilenm = e.target.fileName
                angular.forEach($scope.attachmentList, function (item) {
                    var filenm = item.fileName;
                    if (filenm == newFilenm) {
                        itemExist = true;
                    }
                });
                if (!itemExist) {
                    $scope.attachmentList.push({
                        "fileName": e.target.fileName,
                        "FileExtension": e.target.fileExtension,
                        "type": e.target.fileType,
                        "Image": e.target.result,
                        "File": e.target.file,
                        "isLocal": true
                    })
                } else {
                    toastr.remove();
                    toastr.warning('<b>File <u>' + newFilenm + '</u> is added already! Please add another file.</b>')
                }
                $("#FileUpload1").val('');

            });
        }

        $scope.RemoveAttachment = RemoveAttachment;

        function RemoveAttachment(index) {
            $("#FileUpload1").val('');
            if ($scope.attachmentList.length > 0) {

                var deleted = $scope.attachmentList[index];

                if (angular.isDefined(deleted.url)) {
                    $scope.deletedAttachmentList.push(deleted.url);
                }
                $scope.attachmentList.splice(index, 1);

            }
        };



        //policyHolderPreview
        $scope.AddPolicyHolderReviewPopup = AddPolicyHolderReviewPopup;

        function AddPolicyHolderReviewPopup() {
            if($scope.subscriptionInfo!=null && !$scope.subscriptionInfo.contractExpiry){
                //added by pooja to update appraisal before sending for policyholder review
                $scope.Appraisal.Mounting.stoneDetails = $scope.gemstoneItems;
                $scope.Appraisal.Mounting.diamondDetails = $scope.diamondItems;

                var stoneDetails = [];
                var diamondDetails = [];

                if ($scope.pairedDiamondItems.length > 0 && $scope.showPairedDiamondEarring)
                    diamondDetails = $scope.pairedDiamondItems;
                else if ($scope.pairedDiamondItems.length > 1 && !$scope.showCenteredDiamond && !$scope.showMainDiamondDetails && checkAllfieldsOfDiamond($scope.pairedDiamondItems))
                    diamondDetails = $scope.pairedDiamondItems;
                else if ($scope.centerStone.diamond && Object.keys($scope.centerStone.diamond).length > 0)
                    diamondDetails.push($scope.centerStone.diamond);
                else
                    diamondDetails = [];

                if ($scope.pairedGemstoneItems.length > 0 && ($scope.showPairedGemstone || $scope.showPairedGemstoneEarring) && !$scope.showCenteredGemstone && !$scope.showMainGemstoneDetails && checkAllfieldsOfGemstone($scope.pairedGemstoneItems))
                    stoneDetails = $scope.pairedGemstoneItems;
                else if ($scope.centerStone.gemstone && ($scope.showCenteredGemstone || $scope.showMainGemstoneDetails || $scope.showAdditionalGemstone || $scope.showLooseGemstone || $scope.showCenteredGemstoneEarring) && Object.keys($scope.centerStone.gemstone).length > 0)
                    stoneDetails.push($scope.centerStone.gemstone);
                else
                    stoneDetails = [];

                if ($scope.weddingItems.length > 0) {
                    $scope.isWeddingBand = true;
                    weddingDetails = $scope.weddingItems;
                } else {
                    $scope.isWeddingBand = false;
                }

                if($scope.appData && $scope.appData.both === 'true' && $scope.appData.isRetailValueSelected === 'true') {
                    $scope.totalInsuranceReplacementCost = $scope.insuranceValueWithoutTax;
                }

                if($scope.appData && $scope.appData.both === 'true' && $scope.appData.isInsuranceReplacementCostSelected === 'true') {
                    $scope.totalRetailValue = $scope.retailValueWithoutTax;
                }


                var appraisalDTOs = {
                    "Appraisal": $scope.Appraisal,
                    "diamondItems": diamondDetails,
                    "gemstoneItems": stoneDetails,
                    "pearlItems": $scope.pearlItems,
                    "attachmentList": $scope.attachmentList,

                    "watchDetails": $scope.Appraisal.Watch,
                    //speedcheck data
                    "sc_salvageValue": $scope.totalSalvageCost,
                    "sc_jwelersCost": $scope.totalJeweleryCost,
                    "sc_artigemReplacementValue": $scope.totalArtigemReplacementCost,
                    "sc_insuranceReplacementValue": $scope.totalInsuranceReplacementCost,
                    "sc_retailValue": $scope.totalRetailValue,
                    "sc_totalMountingPrice": $scope.Appraisal.ScTotalMountingPrice,
                    "sc_totalDiamondPrice": $scope.diamondInsuranceReplacementCost,
                    "sc_totalGemStonePrice": $scope.gemstoneArtigemReplacementCost,
                    "sc_labourCost": $scope.Appraisal.labourCost,
                    "sc_totalChainPrice": $scope.Appraisal.ScTotalChainPrice,
                    "sc_totalPearlPrice": $scope.pearlInsuranceReplacementCost,
                    "isParedCenteredStone": $scope.isParedCenteredStone,

                    //Wedding Band Details
                    "weddingBandExists": $scope.isWeddingBand,
                    "weddingBandDetails": weddingDetails,

                    "sc_centerDiamondTotal": $scope.scCenterDiamondTotal,
                    "sc_centerStoneTotal": $scope.scCenterStoneTotal,
                    "sc_totalMountingAccentStonePrice": $scope.Appraisal.ScTotalMountingAccentStonePrice,


                    "speedcheckResultDescription": $scope.desc.settings,
                    "summaryTotal": $scope.summaryTotal,
                    "salesTaxEstimation": $scope.costSalesTax,

                    "deletedAttachments": $scope.deletedAttachmentList,

                    "sc_finalEstimate": $scope.Appraisal.scEstimateDescription,
                    "speedcheckAppraisalDate": $scope.speedcheckSubmitDate !== null && angular.isDefined($scope.speedcheckSubmitDate) ? $scope.speedcheckSubmitDate : null,
                    "centreStoneType": ($scope.Appraisal.centeredStone) ? $scope.Appraisal.centeredStone.type : null,
                    "chainExists": ($scope.Appraisal.Chain) ? $scope.Appraisal.Chain.isChain : null,

                    "policyholderInfo": {
                        "id": $scope.PolicyholderDetails.id,
                        "email": $scope.PolicyholderDetails.primaryPolicyHolderEmailId,
                        "firstName": $scope.PolicyholderDetails.primaryPolicyHolderFname,
                        "lastName": $scope.PolicyholderDetails.primaryPolicyHolderLname,
                        "cellphone": $scope.PolicyholderDetails.primaryPolicyHolderCellphoneNo
                    }
                };


                //existing implementation
                var appraisalDTO = {
                    //speedcheck data
                    "sc_salvageValue": $scope.totalSalvageCost,
                    "sc_jwelersCost": $scope.totalJeweleryCost,
                    "sc_artigemReplacementValue": $scope.totalArtigemReplacementCost,
                    "sc_insuranceReplacementValue": $scope.totalInsuranceReplacementCost,
                    "sc_retailValue": $scope.totalRetailValue,
                    "sc_totalMountingPrice": $scope.Appraisal.ScTotalMountingPrice,
                    "sc_totalDiamondPrice": $scope.diamondInsuranceReplacementCost,
                    "sc_totalGemStonePrice": $scope.gemstoneArtigemReplacementCost,
                    "sc_labourCost": $scope.Appraisal.labourCost,
                    "sc_totalChainPrice": $scope.Appraisal.ScTotalChainPrice,
                    "sc_totalPearlPrice": $scope.pearlInsuranceReplacementCost,
                    "sc_totalcoveragevalue": $scope.summaryTotal,
                    "isParedCenteredStone": $scope.isParedCenteredStone,


                    "sc_centerDiamondTotal": $scope.scCenterDiamondTotal,
                    "sc_centerStoneTotal": $scope.scCenterStoneTotal,
                    "sc_totalMountingAccentStonePrice": $scope.Appraisal.ScTotalMountingAccentStonePrice,


                    "speedcheckResultDescription": $scope.desc.settings,
                    "summaryTotal": $scope.summaryTotal,
                    "salesTaxEstimation": $scope.costSalesTax,
                    "deletedAttachments": $scope.deletedAttachmentList,
                    "sc_finalEstimate": $scope.Appraisal.scEstimateDescription,
                    "speedcheckAppraisalDate": $scope.speedcheckSubmitDate !== null && angular.isDefined($scope.speedcheckSubmitDate) ? $filter('DatabaseDateFormatMMddyyyyTime')($scope.speedcheckSubmitDate) + "T" + $filter('date')(new Date(), 'HH:mm:ss') + "Z" : null,

                    "centreStoneType": ($scope.Appraisal.centeredStone) ? $scope.Appraisal.centeredStone.type : null,
                    "chainExists": ($scope.Appraisal.Chain) ? $scope.Appraisal.Chain.isChain : null

                };

                window.sessionStorage.setItem('appraisalDTO', JSON.stringify(appraisalDTO));
                //$rootScope.$broadcast('suggestedCoverage',appraisalDTO);
                $scope.animationsEnabled = true;
                var out = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: "views/CommonTemplates/PolicyHolderReview.html",
                    controller: "PolicyHolderReviewController",
                    backdrop: 'static',
                    keyboard: false,
                    resolve: {
                        appraisalData: function () {
                            appraisalData = appraisalDTOs;
                            return appraisalData;
                        }
                    }
                });
                window.setTimeout(function () {
                    out.close();
                }, 300000);
                out.result.then(function (value) {
                    //Call Back Function success
                    if (value === "Success") {

                        // GetNotes();
                    }

                }, function (res) {
                    //Call Back Function close
                });
                return {
                    open: open
                };
            }else{
                // Open Contract Expired popup
                companyContractExpiredPopop();
            }
        }
        //AddEmailPopup
        $scope.AddEmailPopup = AddEmailPopup;

        function AddEmailPopup() {
            if($scope.subscriptionInfo!=null && !$scope.subscriptionInfo.contractExpiry){
                //added by pooja to update appraisal before sending for policyholder review
                $scope.Appraisal.Mounting.stoneDetails = $scope.gemstoneItems;
                $scope.Appraisal.Mounting.diamondDetails = $scope.diamondItems;

                var stoneDetails = [];
                var diamondDetails = [];

                if ($scope.pairedDiamondItems.length > 0 && $scope.showPairedDiamondEarring)
                    diamondDetails = $scope.pairedDiamondItems;
                else if ($scope.pairedDiamondItems.length > 1 && !$scope.showCenteredDiamond && !$scope.showMainDiamondDetails && checkAllfieldsOfDiamond($scope.pairedDiamondItems))
                    diamondDetails = $scope.pairedDiamondItems;
                else if ($scope.centerStone.diamond && Object.keys($scope.centerStone.diamond).length > 0)
                    diamondDetails.push($scope.centerStone.diamond);
                else
                    diamondDetails = [];

                if ($scope.pairedGemstoneItems.length > 0 && ($scope.showPairedGemstone || $scope.showPairedGemstoneEarring) && !$scope.showCenteredGemstone && !$scope.showMainGemstoneDetails && checkAllfieldsOfGemstone($scope.pairedGemstoneItems))
                    stoneDetails = $scope.pairedGemstoneItems;
                else if ($scope.centerStone.gemstone && ($scope.showCenteredGemstone || $scope.showMainGemstoneDetails || $scope.showAdditionalGemstone || $scope.showLooseGemstone || $scope.showCenteredGemstoneEarring) && Object.keys($scope.centerStone.gemstone).length > 0)
                    stoneDetails.push($scope.centerStone.gemstone);
                else
                    stoneDetails = [];

                if ($scope.weddingItems.length > 0) {
                    $scope.isWeddingBand = true;
                    weddingDetails = $scope.weddingItems;
                } else {
                    $scope.isWeddingBand = false;
                }

                var appraisalDTOs = {
                    "Appraisal": $scope.Appraisal,
                    "diamondItems": diamondDetails,
                    "gemstoneItems": stoneDetails,
                    "pearlItems": $scope.pearlItems,
                    "attachmentList": $scope.attachmentList,

                    "watchDetails": $scope.Appraisal.Watch,
                    //speedcheck data
                    "sc_salvageValue": $scope.totalSalvageCost,
                    "sc_jwelersCost": $scope.totalJeweleryCost,
                    "sc_artigemReplacementValue": $scope.totalArtigemReplacementCost,
                    "sc_insuranceReplacementValue": $scope.totalInsuranceReplacementCost,
                    "sc_retailValue": $scope.totalRetailValue,
                    "sc_totalMountingPrice": $scope.Appraisal.ScTotalMountingPrice,
                    "sc_totalDiamondPrice": $scope.diamondInsuranceReplacementCost,
                    "sc_totalGemStonePrice": $scope.gemstoneArtigemReplacementCost,
                    "sc_labourCost": $scope.Appraisal.labourCost,
                    "sc_totalChainPrice": $scope.Appraisal.ScTotalChainPrice,
                    "sc_totalPearlPrice": $scope.pearlInsuranceReplacementCost,
                    "isParedCenteredStone": $scope.isParedCenteredStone,

                    //Wedding Band Details
                    "weddingBandExists": $scope.isWeddingBand,
                    "weddingBandDetails": weddingDetails,

                    "sc_centerDiamondTotal": $scope.scCenterDiamondTotal,
                    "sc_centerStoneTotal": $scope.scCenterStoneTotal,
                    "sc_totalMountingAccentStonePrice": $scope.Appraisal.ScTotalMountingAccentStonePrice,


                    "speedcheckResultDescription": $scope.desc.settings,
                    "summaryTotal": $scope.summaryTotal,
                    "salesTaxEstimation": $scope.costSalesTax,

                    "deletedAttachments": $scope.deletedAttachmentList,

                    "sc_finalEstimate": $scope.Appraisal.scEstimateDescription,
                    "speedcheckAppraisalDate": $scope.speedcheckSubmitDate !== null && angular.isDefined($scope.speedcheckSubmitDate) ? $filter('DatabaseDateFormatMMddyyyyTime')($scope.speedcheckSubmitDate) + "T" + $filter('date')(new Date(), 'HH:mm:ss') + "Z" : null,
                    "centreStoneType": ($scope.Appraisal.centeredStone) ? $scope.Appraisal.centeredStone.type : null,
                    "chainExists": ($scope.Appraisal.Chain) ? $scope.Appraisal.Chain.isChain : null,

                    "policyholderInfo": {
                        "id": $scope.PolicyholderDetails.id,
                        "email": $scope.PolicyholderDetails.primaryPolicyHolderEmailId,
                        "firstName": $scope.PolicyholderDetails.primaryPolicyHolderFname,
                        "lastName": $scope.PolicyholderDetails.primaryPolicyHolderLname,
                        "cellphone": $scope.PolicyholderDetails.primaryPolicyHolderCellphoneNo
                    }
                };
                var appraisalDTO = {
                    //speedcheck data
                    "sc_salvageValue": $scope.totalSalvageCost,
                    "sc_jwelersCost": $scope.totalJeweleryCost,
                    "sc_artigemReplacementValue": $scope.totalArtigemReplacementCost,
                    "sc_insuranceReplacementValue": $scope.totalInsuranceReplacementCost,
                    "sc_retailValue": $scope.totalRetailValue,
                    "sc_totalMountingPrice": $scope.Appraisal.ScTotalMountingPrice,
                    "sc_totalDiamondPrice": $scope.diamondInsuranceReplacementCost,
                    "sc_totalGemStonePrice": $scope.gemstoneArtigemReplacementCost,
                    "sc_labourCost": $scope.Appraisal.labourCost,
                    "sc_totalChainPrice": $scope.Appraisal.ScTotalChainPrice,
                    "sc_totalPearlPrice": $scope.pearlInsuranceReplacementCost,
                    "sc_totalcoveragevalue": $scope.summaryTotal,
                    "isParedCenteredStone": $scope.isParedCenteredStone,

                    "sc_centerDiamondTotal": $scope.scCenterDiamondTotal,
                    "sc_centerStoneTotal": $scope.scCenterStoneTotal,
                    "sc_totalMountingAccentStonePrice": $scope.Appraisal.ScTotalMountingAccentStonePrice,

                    "speedcheckResultDescription": $scope.desc.settings,
                    "summaryTotal": $scope.summaryTotal,
                    "salesTaxEstimation": $scope.costSalesTax,
                    "deletedAttachments": $scope.deletedAttachmentList,
                    "sc_finalEstimate": $scope.Appraisal.scEstimateDescription,
                    "speedcheckAppraisalDate": $scope.speedcheckSubmitDate !== null && angular.isDefined($scope.speedcheckSubmitDate) ? $filter('DatabaseDateFormatMMddyyyyTime')($scope.speedcheckSubmitDate) + "T" + $filter('date')(new Date(), 'HH:mm:ss') + "Z" : null,

                    "policyholderInfo": {
                        "id": $scope.PolicyholderDetails.id,
                        "email": $scope.PolicyholderDetails.primaryPolicyHolderEmailId,
                        "firstName": $scope.PolicyholderDetails.primaryPolicyHolderFname,
                        "lastName": $scope.PolicyholderDetails.primaryPolicyHolderLname,
                        "cellphone": $scope.PolicyholderDetails.primaryPolicyHolderCellphoneNo
                    }

                };

                window.sessionStorage.setItem('appraisalDTO', JSON.stringify(appraisalDTO));
                $scope.animationsEnabled = true;
                var out = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: "views/CommonTemplates/EmailPopup.html",
                    controller: "EmailPopupController",
                    backdrop: 'static',
                    keyboard: false,
                    resolve: {
                        appraisalData: function () {
                            appraisalData = appraisalDTOs;
                            return appraisalData;
                        }
                    }


                });
                window.setTimeout(function () {
                    out.close();
                }, 300000);
                out.result.then(function (value) {
                    //Call Back Function success
                    if (value === "Success") {

                        // GetNotes();
                    }

                }, function (res) {
                    //Call Back Function close
                });
                return {
                    open: open
                };
            }else{
                // Open Contract Expired popup
                companyContractExpiredPopop();
            }
        }
        //AddUnderWriterPopup
        $scope.AddUnderWriterPopup = AddUnderWriterPopup;

        function AddUnderWriterPopup() {
            if($scope.subscriptionInfo!=null && !$scope.subscriptionInfo.contractExpiry){
                $scope.Appraisal.Mounting.stoneDetails = $scope.gemstoneItems;
                $scope.Appraisal.Mounting.diamondDetails = $scope.diamondItems;

                var stoneDetails = [];
                var diamondDetails = [];

                if ($scope.pairedDiamondItems.length > 0 && $scope.showPairedDiamondEarring)
                    diamondDetails = $scope.pairedDiamondItems;
                else if ($scope.pairedDiamondItems.length > 1 && !$scope.showCenteredDiamond && !$scope.showMainDiamondDetails && checkAllfieldsOfDiamond($scope.pairedDiamondItems))
                    diamondDetails = $scope.pairedDiamondItems;
                else if ($scope.centerStone.diamond && Object.keys($scope.centerStone.diamond).length > 0)
                    diamondDetails.push($scope.centerStone.diamond);
                else
                    diamondDetails = [];

                if ($scope.pairedGemstoneItems.length > 0 && ($scope.showPairedGemstone || $scope.showPairedGemstoneEarring) && !$scope.showCenteredGemstone && !$scope.showMainGemstoneDetails && checkAllfieldsOfGemstone($scope.pairedGemstoneItems))
                    stoneDetails = $scope.pairedGemstoneItems;
                else if ($scope.centerStone.gemstone && ($scope.showCenteredGemstone || $scope.showMainGemstoneDetails || $scope.showAdditionalGemstone || $scope.showLooseGemstone || $scope.showCenteredGemstoneEarring) && Object.keys($scope.centerStone.gemstone).length > 0)
                    stoneDetails.push($scope.centerStone.gemstone);
                else
                    stoneDetails = [];

                if ($scope.weddingItems.length > 0) {
                    $scope.isWeddingBand = true;
                    weddingDetails = $scope.weddingItems;
                } else {
                    $scope.isWeddingBand = false;
                }
                
                if($scope.appData && $scope.appData.both === 'true' && $scope.appData.isRetailValueSelected === 'true') {
                    $scope.totalInsuranceReplacementCost = $scope.insuranceValueWithoutTax;
                }

                if($scope.appData && $scope.appData.both === 'true' && $scope.appData.isInsuranceReplacementCostSelected === 'true') {
                    $scope.totalRetailValue = $scope.retailValueWithoutTax;
                }
                

                var appraisalDTO = {
                    "Appraisal": $scope.Appraisal,
                    "diamondItems": diamondDetails,
                    "gemstoneItems": stoneDetails,
                    "pearlItems": $scope.pearlItems,
                    "attachmentList": $scope.attachmentList,

                    "watchDetails": $scope.Appraisal.Watch,
                    //speedcheck data
                    "sc_salvageValue": $scope.totalSalvageCost,
                    "sc_jwelersCost": $scope.totalJeweleryCost,
                    "sc_artigemReplacementValue": $scope.totalArtigemReplacementCost,
                    "sc_insuranceReplacementValue": $scope.totalInsuranceReplacementCost,
                    "sc_retailValue": $scope.totalRetailValue,
                    "sc_totalMountingPrice": $scope.Appraisal.ScTotalMountingPrice,
                    "sc_totalDiamondPrice": $scope.diamondInsuranceReplacementCost,
                    "sc_totalGemStonePrice": $scope.gemstoneArtigemReplacementCost,
                    "sc_labourCost": $scope.Appraisal.labourCost,
                    "sc_totalChainPrice": $scope.Appraisal.ScTotalChainPrice,
                    "sc_totalPearlPrice": $scope.pearlInsuranceReplacementCost,
                    "isParedCenteredStone": $scope.isParedCenteredStone,

                    //Wedding Band Details
                    "weddingBandExists": $scope.isWeddingBand,
                    "weddingBandDetails": weddingDetails,

                    "newInsurancePremiumCost": $scope.Appraisal.newInsurancePremiumCost,
                    "oldInsurancePremiumCost": $scope.Appraisal.oldInsurancePremiumCost,


                    //display values
                    "applicationSettingValueDTO": $scope.appData,

                    "sc_centerDiamondTotal": $scope.scCenterDiamondTotal,
                    "sc_centerStoneTotal": $scope.scCenterStoneTotal,
                    "sc_totalMountingAccentStonePrice": $scope.Appraisal.ScTotalMountingAccentStonePrice,


                    "speedcheckResultDescription": $scope.desc.settings,
                    "summaryTotal": $scope.summaryTotal,
                    "salesTaxEstimation": $scope.costSalesTax,

                    "deletedAttachments": $scope.deletedAttachmentList,

                    "sc_finalEstimate": $scope.Appraisal.scEstimateDescription,
                    "speedcheckAppraisalDate": $scope.speedcheckSubmitDate !== null && angular.isDefined($scope.speedcheckSubmitDate) ? $filter('DatabaseDateFormatMMddyyyyTime')($scope.speedcheckSubmitDate) + "T" + $filter('date')(new Date(), 'HH:mm:ss') + "Z" : null,
                    "centreStoneType": ($scope.Appraisal.centeredStone) ? $scope.Appraisal.centeredStone.type : null,
                    "chainExists": ($scope.Appraisal.Chain) ? $scope.Appraisal.Chain.isChain : null


                };
                $scope.animationsEnabled = true;
                var out = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: "views/CommonTemplates/UnderwritterReviewPopup.html",
                    controller: "UnderwritterReviewPopupController",
                    backdrop: 'static',
                    keyboard: false,
                    resolve: {
                        appraisalData: function () {
                            appraisalData = appraisalDTO;
                            return appraisalData;
                        }
                    }
                });
                window.setTimeout(function () {
                    out.close();
                }, 300000);
                out.result.then(function (value) {
                    //Call Back Function success
                    if (value === "Success") {
                        e.log("done");
                        // GetNotes();
                    }

                }, function (res) {
                    //Call Back Function close
                });
                return {
                    open: open
                };
            }else{
                // Open Contract Expired popup
                companyContractExpiredPopop();
            }
        }

        //AddArtigemReviewPopup
        $scope.AddArtigemReviewPopup = AddArtigemReviewPopup;

        function AddArtigemReviewPopup() {
            if($scope.subscriptionInfo!=null && !$scope.subscriptionInfo.contractExpiry){
                $scope.Appraisal.Mounting.stoneDetails = $scope.gemstoneItems;
                $scope.Appraisal.Mounting.diamondDetails = $scope.diamondItems;

                var stoneDetails = [];
                var diamondDetails = [];

                if ($scope.pairedDiamondItems.length > 0 && $scope.showPairedDiamondEarring)
                    diamondDetails = $scope.pairedDiamondItems;
                else if ($scope.pairedDiamondItems.length > 1 && !$scope.showCenteredDiamond && !$scope.showMainDiamondDetails && checkAllfieldsOfDiamond($scope.pairedDiamondItems))
                    diamondDetails = $scope.pairedDiamondItems;
                else if ($scope.centerStone.diamond && Object.keys($scope.centerStone.diamond).length > 0)
                    diamondDetails.push($scope.centerStone.diamond);
                else
                    diamondDetails = [];

                if ($scope.pairedGemstoneItems.length > 0 && ($scope.showPairedGemstone || $scope.showPairedGemstoneEarring) && !$scope.showCenteredGemstone && !$scope.showMainGemstoneDetails && checkAllfieldsOfGemstone($scope.pairedGemstoneItems))
                    stoneDetails = $scope.pairedGemstoneItems;
                else if ($scope.centerStone.gemstone && ($scope.showCenteredGemstone || $scope.showMainGemstoneDetails || $scope.showAdditionalGemstone || $scope.showLooseGemstone || $scope.showCenteredGemstoneEarring) && Object.keys($scope.centerStone.gemstone).length > 0)
                    stoneDetails.push($scope.centerStone.gemstone);
                else
                    stoneDetails = [];

                if ($scope.weddingItems.length > 0) {
                    $scope.isWeddingBand = true;
                    weddingDetails = $scope.weddingItems;
                } else {
                    $scope.isWeddingBand = false;
                }

                if($scope.appData && $scope.appData.both === 'true' && $scope.appData.isRetailValueSelected === 'true') {
                    $scope.totalInsuranceReplacementCost = $scope.insuranceValueWithoutTax;
                }

                if($scope.appData && $scope.appData.both === 'true' && $scope.appData.isInsuranceReplacementCostSelected === 'true') {
                    $scope.totalRetailValue = $scope.retailValueWithoutTax;
                }

                var appraisalDTO = {
                    
                    "formStatus": $scope.formStatus,
                    "IsEditOrder": $scope.IsEditOrder,
                    "Appraisal": $scope.Appraisal,
                    "diamondItems": diamondDetails,
                    "gemstoneItems": stoneDetails,
                    "pearlItems": $scope.pearlItems,
                    "attachmentList": $scope.attachmentList,
                    "applicationSettingValueDTO":$scope.appData,

                    "watchDetails": $scope.Appraisal.Watch,
                    //speedcheck data
                    "sc_salvageValue": $scope.totalSalvageCost,
                    "sc_jwelersCost": $scope.totalJeweleryCost,
                    "sc_artigemReplacementValue": $scope.totalArtigemReplacementCost,
                    "sc_insuranceReplacementValue": $scope.totalInsuranceReplacementCost,
                    "sc_retailValue": $scope.totalRetailValue,
                    "sc_totalMountingPrice": $scope.Appraisal.ScTotalMountingPrice,
                    "sc_totalDiamondPrice": $scope.diamondInsuranceReplacementCost,
                    "sc_totalGemStonePrice": $scope.gemstoneArtigemReplacementCost,
                    "sc_labourCost": $scope.Appraisal.labourCost,
                    "sc_totalChainPrice": $scope.Appraisal.ScTotalChainPrice,
                    "sc_totalPearlPrice": $scope.pearlInsuranceReplacementCost,
                    "isParedCenteredStone": $scope.isParedCenteredStone,

                    "newInsurancePremiumCost": $scope.Appraisal.newInsurancePremiumCost,
                    "oldInsurancePremiumCost": $scope.Appraisal.oldInsurancePremiumCost,

                    //Wedding Band Details
                    "weddingBandExists": $scope.isWeddingBand,
                    "weddingBandDetails": weddingDetails,

                    "sc_centerDiamondTotal": $scope.scCenterDiamondTotal,
                    "sc_centerStoneTotal": $scope.scCenterStoneTotal,
                    "sc_totalMountingAccentStonePrice": $scope.Appraisal.ScTotalMountingAccentStonePrice,

                    "speedcheckResultDescription": $scope.desc.settings,
                    "summaryTotal": $scope.summaryTotal,
                    "salesTaxEstimation": $scope.costSalesTax,

                    "deletedAttachments": $scope.deletedAttachmentList,

                    "sc_finalEstimate": $scope.Appraisal.scEstimateDescription,
                    "speedcheckAppraisalDate": $scope.speedcheckSubmitDate !== null && angular.isDefined($scope.speedcheckSubmitDate) ? $filter('DatabaseDateFormatMMddyyyyTime')($scope.speedcheckSubmitDate)+ "T" + $filter('date')(new Date(), 'HH:mm:ss') + "Z" : null,

                    "centreStoneType": ($scope.Appraisal.centeredStone) ? $scope.Appraisal.centeredStone.type : null,
                    "chainExists": ($scope.Appraisal.Chain) ? $scope.Appraisal.Chain.isChain : null


                };
                $scope.animationsEnabled = true;
                var out = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: "views/CommonTemplates/ArtigemReview.html",
                    controller: "ArtigemReviewController",
                    backdrop: 'static',
                    keyboard: false,
                    resolve: {
                        appraisalData: function () {
                            appraisalData = appraisalDTO;
                            return appraisalData;
                        }
                    }
                });
                window.setTimeout(function () {
                    out.close();
                }, 300000);
                out.result.then(function (value) {
                    //Call Back Function success
                    if (value === "Success") {
                        // GetNotes();
                    }

                }, function (res) {
                    //Call Back Function close
                });
                return {
                    open: open
                };
            }else{
                // Open Contract Expired popup
                companyContractExpiredPopop();
            }
        }

        //AddArtigemReviewRecommentPopup
        $scope.AddArtigemReviewRecommendPopup = AddArtigemReviewRecommendPopup;

        function AddArtigemReviewRecommendPopup() {
            $scope.Appraisal.Mounting.stoneDetails = $scope.gemstoneItems;
            $scope.Appraisal.Mounting.diamondDetails = $scope.diamondItems;

            var stoneDetails = [];
            var diamondDetails = [];

            if ($scope.pairedDiamondItems.length > 0 && $scope.showPairedDiamondEarring)
                diamondDetails = $scope.pairedDiamondItems;
            else if ($scope.pairedDiamondItems.length > 1 && !$scope.showCenteredDiamond && !$scope.showMainDiamondDetails && checkAllfieldsOfDiamond($scope.pairedDiamondItems))
                diamondDetails = $scope.pairedDiamondItems;
            else if ($scope.centerStone.diamond && Object.keys($scope.centerStone.diamond).length > 0)
                diamondDetails.push($scope.centerStone.diamond);
            else
                diamondDetails = [];

            if ($scope.pairedGemstoneItems.length > 0 && ($scope.showPairedGemstone || $scope.showPairedGemstoneEarring) && !$scope.showCenteredGemstone && !$scope.showMainGemstoneDetails && checkAllfieldsOfGemstone($scope.pairedGemstoneItems))
                stoneDetails = $scope.pairedGemstoneItems;
            else if ($scope.centerStone.gemstone && ($scope.showCenteredGemstone || $scope.showMainGemstoneDetails || $scope.showAdditionalGemstone || $scope.showLooseGemstone || $scope.showCenteredGemstoneEarring) && Object.keys($scope.centerStone.gemstone).length > 0)
                stoneDetails.push($scope.centerStone.gemstone);
            else
                stoneDetails = [];

            if ($scope.weddingItems.length > 0) {
                $scope.isWeddingBand = true;
                weddingDetails = $scope.weddingItems;
            } else {
                $scope.isWeddingBand = false;
            }

            var appraisalDTO = {
                "formStatus": $scope.formStatus,
                "IsEditOrder": $scope.IsEditOrder,
                "Appraisal": $scope.Appraisal,
                "diamondItems": diamondDetails,
                "gemstoneItems": stoneDetails,
                "pearlItems": $scope.pearlItems,
                "attachmentList": $scope.attachmentList,

                "watchDetails": $scope.Appraisal.Watch,
                //speedcheck data
                "sc_salvageValue": $scope.totalSalvageCost,
                "sc_jwelersCost": $scope.totalJeweleryCost,
                "sc_artigemReplacementValue": $scope.totalArtigemReplacementCost,
                "sc_insuranceReplacementValue": $scope.totalInsuranceReplacementCost,
                "sc_retailValue": $scope.totalRetailValue,
                "sc_totalMountingPrice": $scope.Appraisal.ScTotalMountingPrice,
                "sc_totalDiamondPrice": $scope.diamondInsuranceReplacementCost,
                "sc_totalGemStonePrice": $scope.gemstoneArtigemReplacementCost,
                "sc_labourCost": $scope.Appraisal.labourCost,
                "sc_totalChainPrice": $scope.Appraisal.ScTotalChainPrice,
                "sc_totalPearlPrice": $scope.pearlInsuranceReplacementCost,
                "isParedCenteredStone": $scope.isParedCenteredStone,

                //Wedding Band Details
                "weddingBandExists": $scope.isWeddingBand,
                "weddingBandDetails": weddingDetails,

                //Display Values
                "applicationSettingValueDTO": $scope.appData,

                "sc_centerDiamondTotal": $scope.scCenterDiamondTotal,
                "sc_centerStoneTotal": $scope.scCenterStoneTotal,
                "sc_totalMountingAccentStonePrice": $scope.Appraisal.ScTotalMountingAccentStonePrice,

                "speedcheckResultDescription": $scope.desc.settings,
                "summaryTotal": $scope.summaryTotal,
                "salesTaxEstimation": $scope.costSalesTax,

                "deletedAttachments": $scope.deletedAttachmentList,

                "sc_finalEstimate": $scope.Appraisal.scEstimateDescription,
                "speedcheckAppraisalDate": $scope.speedcheckSubmitDate !== null && angular.isDefined($scope.speedcheckSubmitDate) ? $filter('DatabaseDateFormatMMddyyyyTime')($scope.speedcheckSubmitDate) + "T" + $filter('date')(new Date(), 'HH:mm:ss') + "Z" : null,

                "centreStoneType": ($scope.Appraisal.centeredStone) ? $scope.Appraisal.centeredStone.type : null,
                "chainExists": ($scope.Appraisal.Chain) ? $scope.Appraisal.Chain.isChain : null


            };
            $scope.animationsEnabled = true;
            var out = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "views/CommonTemplates/RecommendArtigemReview.html",
                controller: "RecommendArtigemReviewController",
                backdrop: 'static',
                keyboard: false,
                resolve: {
                    appraisalData: function () {
                        appraisalData = appraisalDTO;
                        return appraisalData;
                    }
                }
            });
            window.setTimeout(function () {
                out.close();
            }, 300000);
            out.result.then(function (value) {
                //Call Back Function success
                if (value === "Success") {
                    // GetNotes();
                }

            }, function (res) {
                //Call Back Function close
            });
            return {
                open: open
            };
        }


        //onChangeDiamondFromColor()
        $scope.colorTo = [];

        $scope.onChangeDiamondFromColor = onChangeDiamondFromColor;

        function onChangeDiamondFromColor(param, id) {
            //$scope.tempDiamondColorFromList = AppraisalDropdown.attributeValue;
            if (param) {


                var index = $scope.tempDiamondColorFromList.findIndex(DiamondColorFrom => DiamondColorFrom.attributeValueId === param);



                if (index >= 0) {
                    $scope.diamondColorToList = [];
                    $scope.colorTo[id] = [];
                    for (var i = index; i < $scope.tempDiamondColorFromList.length; i++) {

                        $scope.diamondColorToList.push($scope.tempDiamondColorFromList[i]);
                        $scope.colorTo[id].push($scope.tempDiamondColorFromList[i]);
                    }
                }
                //var index = $scope.tempDiamondColorFromList.indexOf(param);


            }

        }

        //for centered stone
        $scope.centerStoneColorToList = [];
        $scope.onchangeCenteredColorFrom = onchangeCenteredColorFrom;

        function onchangeCenteredColorFrom(param) {

            if (param) {


                var index = $scope.tempDiamondColorFromList.findIndex(DiamondColorFrom => DiamondColorFrom.attributeValueId === param);



                if (index >= 0) {
                    $scope.centerStoneColorToList = [];

                    for (var i = index; i < $scope.tempDiamondColorFromList.length; i++) {

                        $scope.centerStoneColorToList.push($scope.tempDiamondColorFromList[i]);

                    }
                }
                //var index = $scope.tempDiamondColorFromList.indexOf(param);


            }

        }
        //for centered stone clarity
        $scope.centerStoneClarityTo = [];
        $scope.onchangeCenteredClarityFrom = onchangeCenteredClarityFrom;

        function onchangeCenteredClarityFrom(param) {

            //$scope.tempDiamondClarityFromList = AppraisalDropdown.attributeValue;
            //          $scope.tempDiamondClarityToList = AppraisalDropdown.attributeValue;

            if (param) {


                var index = $scope.tempDiamondClarityFromList.findIndex(DiamondClarityFrom => DiamondClarityFrom.attributeValueId === param);



                if (index >= 0) {
                    $scope.centerStoneClarityTo = [];

                    for (var i = index; i < $scope.tempDiamondClarityFromList.length; i++) {

                        $scope.centerStoneClarityTo.push($scope.tempDiamondClarityFromList[i]);

                    }
                }
                //var index = $scope.tempDiamondColorFromList.indexOf(param);


            }

        }


        //onChangeDiamondFromClarity()
        $scope.clarityTo = [];

        $scope.onChangeDiamondFromClarity = onChangeDiamondFromClarity;

        function onChangeDiamondFromClarity(param, id) {

            //$scope.tempDiamondClarityFromList = AppraisalDropdown.attributeValue;
            //          $scope.tempDiamondClarityToList = AppraisalDropdown.attributeValue;

            if (param) {


                var index = $scope.tempDiamondClarityFromList.findIndex(DiamondClarityFrom => DiamondClarityFrom.attributeValueId === param);



                if (index >= 0) {
                    $scope.diamondClarityToList = [];
                    $scope.clarityTo[id] = [];
                    for (var i = index; i < $scope.tempDiamondClarityFromList.length; i++) {

                        $scope.diamondClarityToList.push($scope.tempDiamondClarityFromList[i]);
                        $scope.clarityTo[id].push($scope.tempDiamondClarityFromList[i]);
                    }
                }
                //var index = $scope.tempDiamondColorFromList.indexOf(param);


            }

        }

        $scope.onChangeShowChain = onChangeShowChain;

        function onChangeShowChain(param) {
            //id 5 is yes and 6 is no
            if (param == 5) {
                $scope.showChainDetailForm = true;
            } else {
                $scope.showChainDetailForm = false;
                $scope.Appraisal.Chain = {};
                $scope.Appraisal.Chain.isChain = 6;
                $scope.Appraisal.ScTotalChainPrice = 0;
            }
        }


        $scope.changeChainDetails = changeChainDetails;

        function changeChainDetails(param) {
            //id 5 is yes and 6 is no
            var currSelection = document.getElementById("chainDetails").value;
            if ((param == 6 && $scope.chainSelectedOpt != currSelection) && checkFieldsforGetChainDetails($scope.Appraisal.Chain)) {
                bootbox.confirm({
                    size: "",
                    title: "Remove Chain Details?",
                    message: "Are you sure you want to remove the chain details?",
                    closeButton: false,
                    className: "modalcustom",
                    buttons: {
                        confirm: {
                            label: "Remove",
                            className: 'btn-success'
                        },
                        cancel: {
                            label: "Cancel",
                            className: 'btn-danger'
                        }
                    },
                    callback: function (result) {
                        if (result) {
                            $scope.$apply(function () {
                                onChangeShowChain(param);

                                // SpeedCheck Call & Save/Update appraisal Details
                                SubmitToSpeedCheck();
                            });
                        } else {
                            $scope.$apply(function () {
                                var elm = document.getElementById('chainDetails');
                                $scope.Appraisal.Chain.isChain = 5;
                                elm.value = $scope.chainSelectedOpt;
                            });
                        }
                    }
                });
            } else {
                //id 5 is yes and 6 is no
                onChangeShowChain(param);
            }
        }

        $scope.onChangeShowDiamondGemstone = onChangeShowDiamondGemstone;

        function onChangeShowDiamondGemstone(param) {
            //187 diamond nd 188 gemstone
            if (param == 187) {
                $scope.showCenteredDiamond = true;
                $scope.showCenteredGemstone = false;
                $scope.centerStone.gemstone = {};
            } else {
                $scope.showCenteredGemstone = true;
                $scope.showCenteredDiamond = false;
                $scope.centerStone.diamond = {};
            }
        }
        //additional gemstone
        $scope.addAdditionalGemstone = addAdditionalGemstone;

        function addAdditionalGemstone() {
            $scope.showAdditionalGemstoneDetails = true;

            $scope.centerStone.gemstone = {};
            $scope.centerStone.gemstone.quantity = 1;

        }

        $scope.removeAdditionalGemstone = removeAdditionalGemstone;

        function removeAdditionalGemstone() {
            bootbox.confirm({
                size: "",
                title: "Remove Colored Gemstone Details?",
                message: "Are you sure you want to remove the colored gemstone details?",
                closeButton: false,
                className: "modalcustom",
                buttons: {
                    confirm: {
                        label: "Remove",
                        className: 'btn-success'
                    },
                    cancel: {
                        label: "Cancel",
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    if (result) {
                        $scope.$apply(function () {
                            $scope.showAdditionalGemstoneDetails = false;
                            $scope.centerStone.gemstone = {};

                            // SpeedCheck Call & Save/Update appraisal Details
                            if ($scope.showSpeedcheckInfo) {
                                SubmitToSpeedCheck();
                            }
                        });
                    }
                }
            });
        }

        //additional diamond

        $scope.addAdditionalDiamond = addAdditionalDiamond;

        function addAdditionalDiamond() {
            $scope.showAdditionalDiamondDetails = true;

            $scope.centerStone.diamond = {};
            $scope.centerStone.diamond.quantity = 1;


        }

        $scope.removeAdditionalDiamond = removeAdditionalDiamond;

        function removeAdditionalDiamond(index) {
            bootbox.confirm({
                size: "",
                title: "Remove Diamond Details?",
                message: "Are you sure you want to remove the diamond details? ",
                closeButton: false,
                className: "modalcustom",
                buttons: {
                    confirm: {
                        label: "Remove",
                        className: 'btn-success'
                    },
                    cancel: {
                        label: "Cancel",
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    if (result) {
                        $scope.$apply(function () {
                            $scope.showAdditionalDiamondDetails = false;
                            $scope.centerStone.diamond = {};

                            // SpeedCheck Call & Save/Update appraisal Details
                            if ($scope.showSpeedcheckInfo) {
                                SubmitToSpeedCheck();
                            }
                        });
                    }
                }
            });
        }


        ///main diamonds
        $scope.addMainDiamond = addMainDiamond;

        function addMainDiamond() {
            $scope.showMainDiamondDetails = true;
            $scope.centerStone.diamond = {};
            $scope.centerStone.diamond.quantity = 1;

        }

        $scope.removeMainDiamond = removeMainDiamond;

        function removeMainDiamond(index) {
            bootbox.confirm({
                size: "",
                title: "Remove Diamond Details?",
                message: "Are you sure you want to remove the diamond details? ",
                closeButton: false,
                className: "modalcustom",
                buttons: {
                    confirm: {
                        label: "Remove",
                        className: 'btn-success'
                    },
                    cancel: {
                        label: "Cancel",
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    if (result) {
                        $scope.$apply(function () {
                            $scope.showMainDiamondDetails = false;
                            $scope.centerStone.diamond = {};

                            // SpeedCheck Call & Save/Update appraisal Details
                            if ($scope.showSpeedcheckInfo) {
                                SubmitToSpeedCheck();
                            }
                        });
                    }
                }
            });
        }

        //main gemstone
        $scope.addMainGemstone = addMainGemstone;

        function addMainGemstone() {
            $scope.showMainGemstoneDetails = true;
            $scope.centerStone.gemstone = {};
            $scope.centerStone.gemstone.quantity = 1;
        }

        $scope.removeMainGemstone = removeMainGemstone;

        function removeMainGemstone() {
            bootbox.confirm({
                size: "",
                title: "Remove Colored Gemstone Details?",
                message: "Are you sure you want to remove the colored gemstone details?",
                closeButton: false,
                className: "modalcustom",
                buttons: {
                    confirm: {
                        label: "Remove",
                        className: 'btn-success'
                    },
                    cancel: {
                        label: "Cancel",
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    if (result) {
                        $scope.$apply(function () {
                            $scope.showMainGemstoneDetails = false;
                            $scope.centerStone.gemstone = {};

                            // SpeedCheck Call & Save/Update appraisal Details
                            if ($scope.showSpeedcheckInfo) {
                                SubmitToSpeedCheck();
                            }
                        });
                    }
                }
            });
        }

        $scope.showParedDiamond = showParedDiamond;

        function showParedDiamond(param) {

            $scope.isParedCenteredStone = param;

            if (param != 5) {

                //no == 6

                if (!$scope.nonPairedGemstone) {

                    $scope.showCenteredDiamond = false;
                    $scope.centerStone.diamond = {};

                    $scope.pairedDiamondItems = [{
                        id: '1',
                        removeButton: false
                    }, {
                        id: '2',
                        removeButton: false
                    }];

                    $scope.showPairedDiamond = true;
                } else {

                    $scope.showCenteredGemstone = false;
                    $scope.centerStone.gemstone = {};

                    $scope.pairedGemstoneItems = [{
                        id: '1',
                        removeButton: false
                    }, {
                        id: '2',
                        removeButton: false
                    }];

                    $scope.showPairedGemstone = true;
                }
            } else {
                $scope.pairedDiamondItems = [];
                $scope.pairedGemstoneItems = [];
                $scope.showPairedDiamond = false;
                if ($scope.nonPairedDiamond) {
                    $scope.showCenteredDiamond = true;
                    $scope.showPairedDiamond = false;
                }
                if ($scope.nonPairedGemstone) {
                    $scope.showCenteredGemstone = true;
                    $scope.showPairedGemstone = false;
                }
            }
        }

        // areYouSureConfirmation panel
        $scope.areYouSureConfirmation = areYouSureConfirmation;

        function areYouSureConfirmation(catagoryId) {
            var msg = "";
            var header = "";
            if (catagoryId == 'ItemCategory') {
                header = "Change Item Category?";
                msg = "Are you sure you want to change the item category?";
            } else {
                header = "Change Item Type?";
                msg = "Are you sure you want to change the item type?";
            }

            if ((catagoryId == 'ItemCategory' && angular.isDefined($scope.itemCategorySelect) && $scope.itemCategorySelect != '' && $scope.itemCategorySelect != '?') ||
                (catagoryId == 'type' && angular.isDefined($scope.itemTypeSelect) && $scope.itemTypeSelect != '' && $scope.itemTypeSelect != '?')) {
                bootbox.confirm({
                    size: "",
                    title: header,
                    message: msg,
                    closeButton: false,
                    className: "modalcustom",
                    buttons: {
                        confirm: {
                            label: "Change",
                            className: 'btn-success'
                        },
                        cancel: {
                            label: "Cancel",
                            className: 'btn-danger'
                        }
                    },
                    callback: function (result) {
                        $scope.$apply(function () {
                            if (result) {


                                hideAllItemsSection();
                                if (catagoryId == 'ItemCategory') {

                                    ClearFilters('ItemType');
                                    onCategoryChange();

                                    //Reseting Type selections
                                    var elm = document.getElementById('type');
                                    if (elm != null && angular.isDefined(elm)) {
                                        elm.value = '?';
                                        $scope.itemTypeSelect = '?';
                                    }
                                } else {
                                    ClearFilters('IteyymType');
                                    onChangePopulate();
                                }
                            } else {
                                if (catagoryId == 'ItemCategory') {

                                    //var elm = document.getElementById(catagoryId);
                                    //elm.value = $scope.itemCategorySelect;
                                    var id = $scope.itemCategorySelect.split(":");
                                    $scope.Appraisal.ItemCategory.attributeValueId = parseInt(id[1]);
                                    $scope.Appraisal.ItemCategory.atttibuteValue = $scope.itemCategoryText;

                                } else {
                                    //var elm = document.getElementById(catagoryId);
                                    //elm.value = $scope.itemTypeSelect;
                                    var id = $scope.itemTypeSelect.split(":");
                                    $scope.Appraisal.ItemType.attributeValueTypeId = parseInt(id[1]);
                                    $scope.Appraisal.ItemType.atttibuteType = $scope.itemTypeText;
                                }
                            }
                        });
                    }
                });
            } else {
                if (catagoryId == 'ItemCategory') {
                    ClearFilters('ItemType');
                    onCategoryChange();

                } else {
                    var elm = document.getElementById(catagoryId);
                    $scope.itemTypeSelect = elm.value;
                    ClearFilters('ItemyyType');
                    onChangePopulate();

                }

                if (catagoryId == 'type' && ($scope.itemTypeSelect == '?' || $scope.itemTypeSelect == '') && angular.isDefined($scope.itemCategorySelect) && $scope.itemCategorySelect != '' && $scope.itemCategorySelect != '?') {
                    $scope.showMountingandSetting = false;
                }
            }
        }


        $scope.changeDrop = changeDrop;

        function changeDrop(newVl, oldVl) {
            console.log(newVl);
            console.log(oldVl);
        }
        // hideAllItemsSection
        $scope.hideAllItemsSection = hideAllItemsSection;

        function hideAllItemsSection() {
            $scope.showAddADiamond = false;
            $scope.showAddAGemstone = false;
            $scope.showAddAPearl = false;
            $scope.showDiamond = false;
            $scope.showGemstone = false;
            $scope.showMounting = false;
            $scope.showChain = false;
            $scope.showPearl = false;
            $scope.showSpeedcheckInfo = false;
            $scope.showCenteredGemstone = false;
            $scope.showCenteredDiamond = false;
            $scope.showMountingandSetting = false;
            $scope.showCenteredStone = false;
            $scope.showChainandSetting = false;
            $scope.showLooseGemstone = false;
            $scope.showLooseDiamond = false;
            $scope.showAccentDiamond = false;
            $scope.showAccentGemstone = false;
            $scope.showPairedDiamond = false;
            $scope.showPairedGemstone = false;
            $scope.showAdditionalDiamond = false;
            $scope.showAdditionalGemstone = false;
            $scope.showWatch = false;
            $scope.showMainStone = false;
            $scope.showMainGemstone = false;
        }

        //onchange color make cutgrade field mandatory

        /*$scope.onchangeShape = onchangeShape;
        function onchangeShape(param){
            //33 id for shape round
            if(param == 37){
                $scope.isCutGradeRequired = true;
            }
        }*/

        //Disable scroll for input type number.
        $(document).on("wheel", "input[type=number]", function (e) {
            $(this).blur();
        });

        function isNullData(objData) {
            if (objData == null || objData == 'null' || objData == '' || objData == 'undefined') {
                return true;
            } else {
                return false;
            }
        }

        $scope.unitAvg = false;
        $scope.weightAvg = 0;
        // on change gender onchangeGender
        $scope.onchangeGender = onchangeGender;

        function onchangeGender() {



            // var tempWeight=($scope.Appraisal.Mounting && $scope.Appraisal.Mounting.MetalWeight && $scope.Appraisal.Mounting.MetalWeight.weight)?$scope.Appraisal.Mounting.MetalWeight.weight:0;

            var gender = ($scope.Appraisal.Gender && $scope.Appraisal.Gender.attributeValueId) ? $scope.Appraisal.Gender.attributeValueId : "";
            var metalType = ($scope.Appraisal.Mounting && $scope.Appraisal.Mounting.MetalType &&
                $scope.Appraisal.Mounting.MetalType.attributeValueId) ?
                $scope.Appraisal.Mounting.MetalType.attributeValueId : "";
            var unit = ($scope.Appraisal.Mounting && $scope.Appraisal.Mounting.MetalWeight &&
                $scope.Appraisal.Mounting.MetalWeight.MetalUnit &&
                $scope.Appraisal.Mounting.MetalWeight.MetalUnit.attributeValueId) ? $scope.Appraisal.Mounting.MetalWeight.MetalUnit.attributeValueId : "";
            var itemCatagory = $scope.Appraisal.ItemCategory.attributeValueId;
            var itemType = $scope.Appraisal.ItemType.attributeValueTypeId;

            //unit 197=average
            if (unit && gender && unit == 240) {


                $scope.unitAvg = true;
                $scope.Appraisal.Mounting.MetalWeight.weight = 0;
                //ring
                if (itemCatagory == 7 && (itemType != null || itemType != "undefined")) {

                    //set default weight for ring

                    if (itemType == 3) {
                        if (metalType == 16)
                            $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 5 : 14.3;
                        if (metalType != 16) {
                            $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 3 : 9;

                        }
                    } else if (itemType == 25) {

                        //if (metalType == 16) //16---platinum
                        $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 5 : 9;
                        // if(metalType!= 16 && metalType!= 17){ //17---sterling silver
                        //     $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 3 : 9;

                        // }
                    } else if (itemType == 29) {

                        if (metalType == 16) //16---platinum
                            $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 8 : 14.3;
                        else if (metalType) { //17---sterling silver
                            $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 5 : 9;

                        }
                    } else {
                        if (metalType == 16)
                            $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 8 : 14.3;
                        else
                            $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 5 : 9;
                    }
                }
                //bracelate
                else if (itemCatagory == 8 && (itemType != null || itemType != "undefined")) {


                    //bangle
                    if (itemType == 5) {

                        if (metalType == 16)
                            $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 23.85 : 23.85;
                        else
                            $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 15 : 15;


                    }

                    //bangle tennis
                    else if (itemType == 6 || itemType == 7) {

                        if (metalType == 16)
                            $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 22.26 : 22.26;
                        else
                            $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 14 : 14;
                    }
                    //pearl strand
                    if (itemType == 24) {

                        $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 0.5 : 0.5;
                    }

                }
                //necklace
                else if (itemCatagory == 9 && (itemType != null || itemType != "undefined")) {

                    //diamond solitire
                    if (itemType == 9) {

                        if (metalType == 16)
                            $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 1.59 : 1.59;
                        else
                            $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 1 : 1;

                    }
                    //diamond fashion || colored gemstone
                    if (itemType == 10 || itemType == 12) {

                        if (metalType == 16)
                            $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 4.77 : 4.77;
                        else
                            $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 3 : 3;
                    }
                    //diamond tennis 11
                    if (itemType == 11) {

                        if (metalType == 16)
                            $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 35 : 35;
                        else if (metalType)
                            $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 25 : 25;
                    }


                    //pearl strand
                    if (itemType == 23) {

                        $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 0.5 : 0.5;
                    }


                }

                //earrings
                else if (itemCatagory == 10 && (itemType != null || itemType != "undefined")) {
                    //getByFindType(itemType) == "Diamond Stud" ||
                    if (itemType == 13) {

                        if (metalType == 16)
                            $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 3.18 : 3.18;
                        else
                            $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 2 : 2;
                    }
                    //getByFindType(itemType) == "Hoop" ||
                    else if (itemType == 14) {

                        if (metalType == 16)
                            $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 12.72 : 12.72;
                        else
                            $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 8 : 8;

                    }
                    //getByFindType(itemType) == "Diamond Fashion" ||
                    else if (itemType == 15) {

                        if (metalType == 16)
                            $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 9.54 : 9.54;
                        else
                            $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 6 : 6;
                    }
                    //getByFindType(itemType) == "Colored Gemstone" ||
                    else if (itemType == 22) {

                        if (metalType == 16)
                            $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 6.36 : 6.36;
                        else
                            $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 4 : 4;
                    }
                    //pearl
                    else if (itemType == 26) {


                        $scope.Appraisal.Mounting.MetalWeight.weight = gender == 1 ? 2 : 2;

                    }
                }

                $scope.weightAvg = $scope.Appraisal.Mounting.MetalWeight.weight;

                $scope.Appraisal.Mounting.MetalWeight.MetalUnit.attributeValueId = 26;

            } else {

            }
        }

        /* Function to preview uploaded Documents */
        $scope.GetDocxDetails = function (item) {
            $scope.pdf = true;
            $scope.currentPDFUrl = $scope.pdfUrl;
            $scope.pageToDisplay = 1;
            $scope.pageNum = 1;
            $scope.isPDF = 0;
            $scope.DocxDetails = item;
            if ($scope.DocxDetails.isLocal) {
                $scope.showButton = false;
                $scope.DocxDetails.url = item.Image;
            } else {
                $scope.showButton = true;
            }
            $scope.ReceiptList = $scope.DocxDetails.url;
            $scope.pdfUrl = $scope.ReceiptList;
            var pdf = ["pdf", "application/pdf"];
            var img = ["image", "application/image", "image/png", "image/jpeg", "image/gif", "png", "jpg", "jpeg", "gif", "image", "PNG", "JPEG", "GIF", "JPG"];
            $scope.imgDiv = true;
            if (pdf.indexOf(($scope.DocxDetails.type.toLowerCase())) > -1) {
                $scope.isPDF = 1;
            } else if (img.indexOf(($scope.DocxDetails.type.toLowerCase())) > -1) {
                $scope.isPDF = 2;
            } else {
                $scope.isPDF = 0;
                var downloadLink = angular.element('<a></a>');
                downloadLink.attr('href', $scope.DocxDetails.url);
                downloadLink.attr('target', '_self');
                downloadLink.attr('download', (($scope.DocxDetails.fileName != null && angular.isDefined($scope.DocxDetails.fileName) && $scope.DocxDetails.fileName !== "") ? $scope.DocxDetails.fileName : "Document"));
                downloadLink[0].click();
            }
            window.setTimeout(function () {
                $("#img_preview").css({
                    'right': $('.page-wrapper-middle').offset().left + 'px'
                }).show();
            }, 100);

        }

        $scope.close = function () {
            $("#img_preview").hide();
        }

        /* Delete attachements */
        $scope.DeleteAttachement = DeleteAttachement;

        function DeleteAttachement() {
            var msg = "";
            msg = "Are you sure you want to delete the attachment " + $scope.DocxDetails.fileName + "?";
            bootbox.confirm({
                size: "",
                title: "Delete Attachement?",
                message: msg,
                closeButton: false,
                className: "modalcustom",
                buttons: {
                    confirm: {
                        label: "Delete",
                        className: 'btn-success'
                    },
                    cancel: {
                        label: "Cancel", //$translate.instant('ClaimDetails_Delete.BtnNo'),
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    if (result) {
                        if ($scope.DocxDetails) {
                            var url = $scope.DocxDetails.url;
                            var promiseResponse = ComparableFilterService.deteleAttachment(url);
                            promiseResponse.then(function (data) {
                                toastr.remove();
                                $scope.imgDiv = false;
                                toastr.success("The attachment " + $scope.DocxDetails.fileName + " was deleted successfully.", "Confirmation");
                                location.reload();
                            }, function (error) {
                                $(".page-spinner-bar").addClass("hide");
                                toastr.remove();
                                toastr.error('Error while downloading attachment.', "Error");
                            });
                        }
                    }
                }
            });
        }

        /* Change Values */
        $scope.updateValues = updateValues;

        function updateValues(values) {
            $scope.isPremiumCostEdited = false;
            var oldCost = roundOf2Decimal(values / 1000);
            var updatedOldCost = oldCost * 12;
            $scope.updatedValue = roundOf2Decimal(updatedOldCost);
        }

        var oldInsurancePremiumCost = 0;
        $scope.$watch(function () {
            if ($scope.updatedValue && !$scope.isPremiumCostEdited) {
                $scope.Appraisal.oldInsurancePremiumCost = $scope.updatedValue;
            } else {
                $scope.Appraisal.oldInsurancePremiumCost = oldInsurancePremiumCost;
            }
        });

        //removePairedGemstone
        $scope.removePairedGemstone = removePairedGemstone;

        function removePairedGemstone(index) {
            $scope.pairedGemstoneItems.splice(index, 1);

            if ($scope.pairedGemstoneItems.length == 0) {

                //for paired diamond
                $scope.addCenterGemstone = true;
            } else {
                $scope.updatePairedGemstoneBox($scope.pairedGemstoneItems);
            }
        }

        //showPairedStone
        $scope.showPairedStone = showPairedStone;

        function showPairedStone() {
            $scope.showPairedGemstone = true;

            $scope.addCenterGemstone = false;

            //         if(){
            //         $scope.pairedGemstoneItems = [];
            //     // adding new diamond slabs
            //     $scope.pairedGemstoneItems = [{
            //         'id': 1,

            //         'quantity': 1
            //     }, {
            //         'id': 2,

            //         'quantity': 1
            //     }
            //     ];
            //     }
            // }
            showParedDiamond($scope.isParedCenteredStone);
        }

        $scope.removeCenteredGemstone = removeCenteredGemstone;

        function removeCenteredGemstone() {
            $scope.centerStone.gemstone = {};
            $scope.pairedGemstoneItems = [];
            $scope.showCenteredGemstone = false;
            $scope.addCenterGemstone = true;
        }

        $scope.updatePairedGemstoneBox = function (pairedGemstoneItems) {
            $scope.pairedGemstoneItems = [];
            $scope.pairedGemstoneItems = angular.copy(pairedGemstoneItems);

            for (var i = 0; i < pairedGemstoneItems.length; i++) {
                $scope.pairedGemstoneItems[i].id = i + 1
            }

        }

        $scope.saveAndSubmitToArtigem = saveAndSubmitToArtigem;

        function saveAndSubmitToArtigem() {
            $scope.showToaster = false;
            if ($scope.formStatus && $scope.IsEditOrder) {
                // UpdateApprisal();
            } else if ($scope.formStatus && !$scope.IsEditOrder) {
                $scope.IsSpeedCheckDisabled = true;
                // saveApprisal();
            }
            AddArtigemReviewPopup();
        }

        $scope.showPairedBytype = showPairedBytype;

        function showPairedBytype(param) {

            $scope.isParedCenteredStone = param;
            $scope.pairedDiamondItems = [];
            $scope.pairedGemstoneItems = [];
            $scope.showCenteredDiamondEarring = false;
            $scope.showCenteredGemstoneEarring = false;
            $scope.showPairedDiamondEarring = false;
            $scope.showPairedGemstoneEarring = false;


            //reset add oprion
            $scope.addCenterGemstoneEarring = false;
            $scope.addCenterDiamondEarring = false;

            if ($scope.isParedCenteredStone == 5) {


                //187 is diamond
                if ($scope.Appraisal.centeredStone && $scope.Appraisal.centeredStone.type == 187) {
                    $scope.showCenteredDiamondEarring = true;


                } else if ($scope.Appraisal.centeredStone && $scope.Appraisal.centeredStone.type == 188) {
                    $scope.showCenteredGemstoneEarring = true;

                }
            } else if ($scope.isParedCenteredStone == 6) {

                //187 is diamond
                if ($scope.Appraisal.centeredStone && $scope.Appraisal.centeredStone.type == 187) {
                    $scope.showPairedDiamondEarring = true;
                    $scope.pairedDiamondItems = [{
                        "id": 1
                    }, {
                        "id": 2
                    }];
                    $scope.pairedGemstoneItems = [];
                } else if ($scope.Appraisal.centeredStone && $scope.Appraisal.centeredStone.type == 188) {
                    $scope.showPairedGemstoneEarring = true;
                    $scope.pairedGemstoneItems = [{
                        "id": 1
                    }, {
                        "id": 2
                    }];
                    $scope.pairedDiamondItems = [];
                }

            }
        }

        //removePairedDiamond
        $scope.removePairedDiamond = removePairedDiamond;

        function removePairedDiamond(index) {
            $scope.pairedDiamondItems.splice(index, 1);

            //  if ($scope.pairedDiamondItems.length == 0) {

            //      //for paired diamond
            //      //$scope.addCenterDiamondEarring = true;
            //  }
            //  else {
            $scope.updatePairedDiamondBox($scope.pairedDiamondItems);
            //}
        }

        // update paired diamond box
        $scope.updatePairedDiamondBox = function (pairedDiamondItems) {
            $scope.pairedDiamondItems = [];
            $scope.pairedDiamondItems = angular.copy(pairedDiamondItems);

            for (var i = 0; i < pairedDiamondItems.length; i++) {
                $scope.pairedDiamondItems[i].id = i + 1
            }

        }

        $scope.removeCenteredDiamondEarring = removeCenteredDiamondEarring;

        function removeCenteredDiamondEarring() {
            $scope.centerStone.diamond = {};
            $scope.pairedDiamondItems = [];
            $scope.showCenteredDiamondEarring = false;
            $scope.addCenterDiamondEarring = true;
        }

        $scope.removeCenteredGemstoneEarring = removeCenteredGemstoneEarring;

        function removeCenteredGemstoneEarring() {
            $scope.centerStone.gemstone = {};
            $scope.pairedGemstoneItems = [];
            $scope.showCenteredGemstoneEarring = false;
            $scope.addCenterGemstoneEarring = true;


        }

        var zoomFactor = 100;
        $scope.largeMe = largeMe;

        function largeMe() {
            zoomFactor += 5;
            document.getElementById('imagepre').style.zoom = zoomFactor + "%";
        }

        $scope.smallMe = smallMe;

        function smallMe() {
            zoomFactor -= 5;
            document.getElementById('imagepre').style.zoom = zoomFactor + "%";
        }


        ///get/average/count
        $scope.populateAvgStoneWeight = populateAvgStoneWeight;

        function populateAvgStoneWeight(index, caratWeight) {


            var itemType = $scope.Appraisal.ItemType.attributeValueTypeId;


            var param = {
                "itemType": itemType,
                "caratWeight": caratWeight,

            }
            var getAvgCount = ComparableFilterService.getAvgStoneCount(param);
            getAvgCount.then(function (success) {
                console.log(success.data.avgStoneCount);

                $scope.diamondItems[index].quantity = success.data.avgStoneCount;

                //  $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                toastr.remove();
                if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                    toastr.error(error.data.errorMessage, "Error")
                } else {
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
                }
                $(".page-spinner-bar").addClass("hide");
            });
        }


        //populateAvgGemstoneWeight
        $scope.populateAvgGemstoneWeight = populateAvgGemstoneWeight;

        function populateAvgGemstoneWeight(index, caratWeight) {


            var itemType = $scope.Appraisal.ItemType.attributeValueTypeId;


            var param = {
                "itemType": itemType,
                "caratWeight": caratWeight,

            }
            var getAvgCount = ComparableFilterService.getAvgStoneCount(param);
            getAvgCount.then(function (success) {
                //console.log(success.data.avgStoneCount);

                $scope.gemstoneItems[index].quantity = success.data.avgStoneCount;

                //  $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                toastr.remove();
                if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                    toastr.error(error.data.errorMessage, "Error")
                } else {
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
                }
                $(".page-spinner-bar").addClass("hide");
            });
        }

        // US Format Current Date
        $scope.currUSFormatDate = currUSFormatDate;

        function currUSFormatDate() {
            var todayTime = new Date();
            var month = todayTime.getMonth() + 1;
            var day = todayTime.getDate();
            var year = todayTime.getFullYear();
            return month + "/" + day + "/" + year;
        }

        //Wedding Band Details.
        //Adding New Diamond Item.
        $scope.weddingItems = [];
        $scope.weddingDiamondItems = [];
        $scope.weddingBand = {};
        $scope.weddingBand.DiamondItems = [];
        $scope.weddingBand.GemstoneItems = [];
        $scope.addWeddingBand = false;
        $scope.addNewWeddingItem = addNewWeddingItem;

        function addNewWeddingItem() {
            $scope.addWeddingBand = true;
            if (!$scope.weddingItems) {
                $scope.weddingItems = [{
                    id: '1',
                    removeButton: false
                }];

            } else {
                var newItemNo = $scope.weddingItems.length + 1;
                var newWedBandDiamondNo = $scope.weddingBand.DiamondItems.length + 1;
                $scope.weddingColorToTemp[newItemNo - 1] = [];
                $scope.weddingClarityToTemp[newItemNo - 1] = [];
                $scope.weddingItems.push({
                    'id': newItemNo,
                    'removeButton': true,
                    'quantity': "",
                    'mounting': {
                        'diamondDetails': [{
                            'id': newWedBandDiamondNo,
                            'removeButton': true,
                            'quantity': "",
                        }],
                        'stoneDetails': []
                    }
                });
            }

        }

        //Remove wedding band
        $scope.removeWeddingBand = removeWeddingBand;

        function removeWeddingBand(index) {
            bootbox.confirm({
                size: "",
                title: "Remove Wedding Details",
                message: "Are you sure you want to remove the Wedding details? ",
                closeButton: false,
                className: "modalcustom",
                buttons: {
                    confirm: {
                        label: "Remove",
                        className: 'btn-success'
                    },
                    cancel: {
                        label: "Cancel",
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    if (result) {
                        $scope.$apply(function () {
                            if (index == 0) {
                                $scope.addWeddingBand = false;
                            }
                            $scope.weddingItems.splice(index, 1);
                            // SpeedCheck Call & Save/Update appraisal Details
                            if ($scope.showSpeedcheckInfo) {
                                SubmitToSpeedCheck();
                            }
                        });
                    }
                }
            });
        }

        //Add WeddingBand Diamond Items
        $scope.addNewWeddingBandDiamondItem = addNewWeddingBandDiamondItem;

        function addNewWeddingBandDiamondItem(index) {
            var anotherDiamondItemIdNo = $scope.weddingItems[index].mounting.diamondDetails.length + 1;
            $scope.weddingItems[index].mounting.diamondDetails.push({
                'id': anotherDiamondItemIdNo,
                'removeButton': true,
                'quantity': ""
            });
            $scope.weddingClarityToTemp[index][anotherDiamondItemIdNo - 1] = $scope.tempWeddingDiamondClarityFromList;
            $scope.weddingColorToTemp[index][anotherDiamondItemIdNo - 1] = $scope.tempWeddingDiamondColorFromList;
        }

        //Remove WeddingBand Diamond Items
        $scope.removeThisWeddingBandItemDiamond = removeThisWeddingBandItemDiamond;

        function removeThisWeddingBandItemDiamond(parentIndex, childIndex) {
            bootbox.confirm({
                size: "",
                title: "Remove Diamond Wedding Details",
                message: "Are you sure you want to remove the diamond wedding details? ",
                closeButton: false,
                className: "modalcustom",
                buttons: {
                    confirm: {
                        label: "Remove",
                        className: 'btn-success'
                    },
                    cancel: {
                        label: "Cancel",
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    if (result) {
                        $scope.$apply(function () {
                            $scope.weddingItems[parentIndex].mounting.diamondDetails.splice(childIndex, 1);
                            for (var i = 0; i < $scope.weddingItems[parentIndex].mounting.diamondDetails.length; i++) {
                                $scope.weddingItems[parentIndex].mounting.diamondDetails[i].id = i + 1;
                            }
                            // SpeedCheck Call & Save/Update appraisal Details
                            if ($scope.showSpeedcheckInfo) {
                                SubmitToSpeedCheck();
                            }
                        });
                    }
                }
            });
        }

        //Add WeddingBand Gemstone Items
        $scope.addNewWeddingBandGemstoneItem = addNewWeddingBandGemstoneItem;

        function addNewWeddingBandGemstoneItem(index) {
            var anotherGemstoneItemId = $scope.weddingItems[index].mounting.stoneDetails.length + 1;
            $scope.weddingItems[index].mounting.stoneDetails.push({
                'id': anotherGemstoneItemId,
                'removeButton': true,
                'quantity': ""
            });
        }
        //Remove WeddingBand Gemstone Items
        $scope.removeThisWeddingBandItemGemstone = removeThisWeddingBandItemGemstone;

        function removeThisWeddingBandItemGemstone(parentIndex, childIndex) {
            bootbox.confirm({
                size: "",
                title: "Remove Diamond Wedding Details",
                message: "Are you sure you want to remove the diamond wedding details? ",
                closeButton: false,
                className: "modalcustom",
                buttons: {
                    confirm: {
                        label: "Remove",
                        className: 'btn-success'
                    },
                    cancel: {
                        label: "Cancel",
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    if (result) {
                        $scope.$apply(function () {
                            $scope.weddingItems[parentIndex].mounting.stoneDetails.splice(childIndex, 1);
                            for (var i = 0; i < $scope.weddingItems[parentIndex].mounting.stoneDetails.length; i++) {
                                $scope.weddingItems[parentIndex].mounting.stoneDetails[i].id = i + 1;
                            }
                            // SpeedCheck Call & Save/Update appraisal Details
                            if ($scope.showSpeedcheckInfo) {
                                SubmitToSpeedCheck();
                            }
                        });
                    }
                }
            });
        }

        //OnChangeWeddingDiamondColor
        $scope.weddingDiamondColorTo = [];
        $scope.weddingdiamondColorToList = [];
        $scope.weddingColorToTemp = [];
        $scope.weddingColorToTemp[0] = [];
        $scope.OnChangeWeddingDiamondColor = function (data, weddingId, id) {
            if (data) {
                var index = $scope.tempWeddingDiamondColorFromList.findIndex(weddingDiamondColorFrom => weddingDiamondColorFrom.attributeValueId === data);
                if (index >= 0) {
                    $scope.weddingColorToTemp[weddingId][id] = [];
                    for (var i = index; i < $scope.tempWeddingDiamondColorFromList.length; i++) {
                        $scope.weddingColorToTemp[weddingId][id].push($scope.tempWeddingDiamondColorFromList[i]);
                    }
                }
            }
        }

        //onChangeWeddingDiamondClarity
        $scope.weddingDiamondClarityTo = [];
        $scope.weddingdiamondClarityToList = [];
        $scope.weddingClarityToTemp = [];
        $scope.weddingClarityToTemp[0] = [];
        $scope.onChangeWeddingDiamondClarity = function (data, weddingId, id) {
            if (data) {
                var index = $scope.tempWeddingDiamondClarityFromList.findIndex(weddingDiamondClarityFrom => weddingDiamondClarityFrom.attributeValueId === data);
                if (index >= 0) {
                    $scope.weddingClarityToTemp[weddingId][id] = [];
                    for (var i = index; i < $scope.tempWeddingDiamondClarityFromList.length; i++) {
                        $scope.weddingClarityToTemp[weddingId][id].push($scope.tempWeddingDiamondClarityFromList[i]);
                    }
                }
            }
        }


        //wedding band avg count
        ///get/average/count
        $scope.weddingBandAvgDiamonWeight = weddingBandAvgDiamonWeight;

        function weddingBandAvgDiamonWeight(parentIndex, index, caratWeight) {

            //added because it takes same value as wedding band item type id3 =wedding band
            var itemType = 3;


            var param = {
                "itemType": itemType,
                "caratWeight": caratWeight,

            }
            //$(".page-spinner-bar").removeClass("hide");
            var getAvgCount = ComparableFilterService.getAvgStoneCount(param);
            getAvgCount.then(function (success) {
                //console.log(success.data.avgStoneCount);

                $scope.weddingItems[parentIndex].mounting.diamondDetails[index].quantity = success.data.avgStoneCount;
                //$scope.diamondItems[index].quantity = success.data.avgStoneCount;

                //$(".page-spinner-bar").addClass("hide");
            }, function (error) {
                toastr.remove();
                if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                    toastr.error(error.data.errorMessage, "Error")
                } else {
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
                }
                $(".page-spinner-bar").addClass("hide");
            });
        }
        //weddingAvgGemstoneWeight
        $scope.weddingAvgGemstoneWeight = weddingAvgGemstoneWeight;

        function weddingAvgGemstoneWeight(parentIndex, index, caratWeight) {

            //added because it takes same value as wedding band item type id3 =wedding band
            var itemType = 3;

            var param = {
                "itemType": itemType,
                "caratWeight": caratWeight,
            }
            var getAvgCount = ComparableFilterService.getAvgStoneCount(param);
            getAvgCount.then(function (success) {

                //mounting.stoneDetails
                $scope.weddingItems[parentIndex].mounting.stoneDetails[index].quantity = success.data.avgStoneCount;

            }, function (error) {
                toastr.remove();
                if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                    toastr.error(error.data.errorMessage, "Error")
                } else {
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
                }
                $(".page-spinner-bar").addClass("hide");
            });
        }

        // on change gender onchangeGender
        $scope.weddingAvgWeights = weddingAvgWeights;

        function weddingAvgWeights(weddingBandIndex) {

            var gender = ($scope.Appraisal.Gender && $scope.Appraisal.Gender.attributeValueId) ? $scope.Appraisal.Gender.attributeValueId : "";
            var itemCatagory = $scope.Appraisal.ItemCategory.attributeValueId;
            var itemType = $scope.Appraisal.ItemType.attributeValueTypeId;
            var unit;
            var metalType;

            //weddingItems
            if ($scope.weddingItems[weddingBandIndex] && $scope.weddingItems[weddingBandIndex].mounting && $scope.weddingItems[weddingBandIndex].mounting.metalUnitWeight && $scope.weddingItems[weddingBandIndex].mounting.metalUnitWeight.attributeValueId)
                unit = $scope.weddingItems[weddingBandIndex].mounting.metalUnitWeight.attributeValueId;

            //metalType
            if ($scope.weddingItems[weddingBandIndex] && $scope.weddingItems[weddingBandIndex].mounting && $scope.weddingItems[weddingBandIndex].mounting.typeOfMetal && $scope.weddingItems[weddingBandIndex].mounting.typeOfMetal.attributeValueId)
                metalType = $scope.weddingItems[weddingBandIndex].mounting.typeOfMetal.attributeValueId;

            //unit 197=average
            if (unit && gender && unit == 240) {


                $scope.unitAvg = true;
                //ring
                if (itemCatagory == 7 && (itemType != null || itemType != "undefined")) {

                    //set default weight for ring mounting.metalWeight

                    //3==wedding band

                    if (metalType == 16) //platinum
                        $scope.weddingItems[weddingBandIndex].mounting.metalWeight = gender == 1 ? 5 : 14.3;
                    if (metalType != 16) {
                        $scope.weddingItems[weddingBandIndex].mounting.metalWeight = gender == 1 ? 3 : 9;

                    }
                }

            }

            $scope.weddingItems[weddingBandIndex].mounting.metalUnitWeight.attributeValueId = 26;
        }

        // Update Appraisal Desc & Value validations flag 
        $scope.updateValidation = updateValidation;

        function updateValidation(id) {
            var elm = document.getElementById(id);
            if (elm.value != null && angular.isDefined(elm.value)) {
                if (id == 'OriginalDescription') {
                    $scope.inValidFieldApprDesc = false;
                }
                if (elm.value != '0.0' && id == 'appraisalValue') {
                    $scope.inValidFieldApprValue = false;
                }
            }
        }


        $scope.getAppSettngValue = getAppSettngValue;
        function getAppSettngValue() {
            var getSettingValue = ComparableFilterService.getAppSettingValues();
            getSettingValue.then(function (success) {
                $scope.appData = success.data.data;
            }, function (error) {
                toastr.remove();
                if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                    toastr.error(error.data.errorMessage, "Error")
                } else {
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
                }
                $(".page-spinner-bar").addClass("hide");
            });
        }

     
        function companyContractExpiredPopop() {
            var contractMsg;
            if($scope.subscriptionInfo==null ){
                contractMsg= "Company contract is not created. Please contact company administrator.";
            }else if($scope.subscriptionInfo.contractExpiry){
                contractMsg= "Company contract is expired. Please contact company administrator.";
            }
            bootbox.alert({
                title: "Alert",
                message: contractMsg
            });           
        }

        $scope.getSubcriptionDetails = getSubcriptionDetails;
        function getSubcriptionDetails() {
            $(".page-spinner-bar").removeClass("hide");
            var param = {
                type: "speedcheck"
            }
            var subscription = ContractService.getSpeedCheckSubscriptionInfo(param);
            subscription.then(function (success) {
                $scope.subscriptionInfo = success && success.data ? success.data.data : null;
                if ($scope.subscriptionInfo != null) {
                    $scope.subscriptionInfo.billingContact = $filter('constructName')($scope.subscriptionInfo.billedTo.firstName, $scope.subscriptionInfo.billedTo.lastName);
                }
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
                $(".page-spinner-bar").addClass("hide");
            });
        }
    });