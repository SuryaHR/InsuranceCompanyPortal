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

    .controller('AddAppraisalController', function ($http, $rootScope, $scope, settings, $location, $translate, $translatePartialLoader, $window,
        $filter, $timeout, AuthHeaderService, AppraisalService, InsuranceAgentHomeService, $uibModal, ContractService) {
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

        $scope.isPolicyInactive = false;

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
        $scope.breadcrumFlag = false;

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
                    '<style type="text/css" media="print">'+
                    '@page {margin-top:10px}'+
                    'footer { text-align:center;}'+
                    '</style>'+
                    '</head><body><div class="reward-body">' + printContents + '</div></body>'+
                    '<footer>'+
                    '<span style="font-weight: 400;font-size:12px;">This appraisal was generated on behalf of </span>'+
                    '<span style="font-weight: bold;font-size:12px;">'+ $scope.Appraisal.company.companyName+' | '+ $scope.Appraisal.company.officeAddress.completeAddress +' | '+$scope.Appraisal.company.companyWebsite+' | Phone: '+$filter("tel")($scope.Appraisal.company.companyPhoneNumber)+'</span>'+
                    '</footer>'+
                    '</html>');

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
            $(".page-spinner-bar").removeClass("hide");
            $scope.quantity = 0;

            $scope.showMountingandSetting = false;
            $scope.disableScreen = false;
            GetAppraisalDropdowns();
            getMappingData();
            GetPolicyHolderDetails();
            getAppSettngValue();
            getSubcriptionDetails();
            $scope.decslaimer = "Artigem has identified a new replacement value of your item based off current market conditions. The valuation is derived by entering the attributes that affect value into software to compile the new replacement value including sales tax. This value is calculated by market averages and adding 20-25% for potential market price fluctuations and possible limited availability. While the actual cost to replace may be less than the appraised value, it is important to protect against these scenarios. Artigem does not warrant the value as the item was not inspected. ";

            $scope.imgDiv = false;
            $scope.getConfigData();  
            $scope.companyUrn = sessionStorage.getItem("CRN");
        }
      
        $scope.getConfigData = function(){
            var GetGlobaldata = $http.get('Config/Configuration.json');
            GetGlobaldata.then(function (success) {
                ConfigSettings = success.data.data;
                $scope.serverAddress = ConfigSettings.serverAddress;
                $scope.gemGuideApi = ConfigSettings.gemGuideApi;
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
            var data = AppraisalService.getSpeedcheMapping();
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

        //getAppraisalDetails
        var oldInsurancePremiumCost;
        $scope.getAppraisalDetails = getAppraisalDetails;

        function getAppraisalDetails() {
            if (!$scope.disableScreen) {
                $(".page-spinner-bar").removeClass("hide");
            }
            $scope.IsEditOrder = true;
            $scope.showValue = true;
            var param = {
                "appraisalId": sessionStorage.getItem("appraisalId"),
                "agentId": sessionStorage.getItem("UserId"),
                "role": "INSURANCE_AGENT"
            }
            //var appraisalId = sessionStorage.getItem("appraisalId");
            var details = AppraisalService.getAppraisal(param);
            details.then(function (success) {
                if (!$scope.disableScreen) {
                    $(".page-spinner-bar").removeClass("hide");
                }
                if(success.data.data.appraisalDataDTO.active == true){
                    sessionStorage.setItem("isAppraisalActive",true);

                }else {
                    sessionStorage.setItem("isAppraisalActive",false);

                }

                if (!success.data.data.appraisalDataDTO.policyholderDetails.policyStatus) {
                    toastr.remove();
                    $scope.isPolicyInactive = true;
                    toastr.warning('Access denied for editing appraisal since policy is inactive!!')
                    //(error.data.errorMessage, "Error")
                }

                else if (success.data.data.appraisalDataDTO.insuranceAgentReviewStatus != 1 && success.data.data.appraisalDataDTO.active) {
                    $scope.isEditAppraisal = true;
                    $scope.isDisable = true;
                    $scope.temp = true;
                } else if (success.data.data.appraisalDataDTO.insuranceAgentReviewStatus != 1 && !success.data.data.appraisalDataDTO.active) {
                    toastr.remove();
                    toastr.warning('Access denied for editing appraisal since this appraisal is deactivated!!')
                    getActiveInactiveMessage();
                } else if (success.data.data.appraisalDataDTO.insuranceAgentReviewStatus == 1 && !success.data.data.appraisalDataDTO.active) {
                    toastr.remove();
                    toastr.warning('Access denied for editing appraisal since this appraisal is deactivated!!')
                    getActiveInactiveMessage();
                }

                var appraisalDetails = success.data.data.appraisalDataDTO;

                $scope.isWeddingBandExists = appraisalDetails.weddingBandExists;
                
                updateValues(appraisalDetails.appraisalOldValue);

                // if(!$scope.primaryFname || !$scope.primaryLname || sessionStorage.getItem('notifications') == "true")
                // {
                //     populatePolicyDetails(appraisalDetails);
                // }

                $scope.appraisalNumber = (appraisalDetails.appraisalNumber) ? appraisalDetails.appraisalNumber : "";

                $scope.PolicyDetails = appraisalDetails.policyholderDetails;

                // $scope.PolicyDetails.policyHolderAddress = ($scope.PolicyDetails.streetAddressOne)?$scope.PolicyDetails.streetAddressOne:""+($scope.PolicyDetails.city)?$scope.PolicyDetails.city:""+($scope.PolicyDetails.stateName)?", "+$scope.PolicyDetails.stateName:""
                $scope.Comparables = appraisalDetails;
                sessionStorage.setItem("appraisalNumber", appraisalDetails.appraisalNumber);
                var mounting = {};
                var chain = {};
                var MetalWeight = {};
                var chainMetalWeight = {};
                $scope.desc = {};

                $scope.desc.settings = appraisalDetails.speedcheckResultDescription;
                $scope.pdfDesc = ($scope.desc.settings != null && $scope.desc.settings != "") ? $scope.desc.settings.split("\n") : [];

                $scope.summaryTotal = appraisalDetails.summaryTotal;

                // var MetalType = ;
                mounting.MetalType = appraisalDetails.mountingDetails.typeOfMetal;
                mounting.MetalColor = appraisalDetails.mountingDetails.metalColor;
                MetalWeight.weight = appraisalDetails.mountingDetails.metalWeight;
                MetalWeight.MetalUnit = appraisalDetails.mountingDetails.metalUnitWeight;

                mounting.MetalWeight = MetalWeight;


                mounting.MetalWidth = appraisalDetails.mountingDetails.width;

                mounting.id = appraisalDetails.mountingDetails.id;

                //chain
                chain.MetalType = appraisalDetails.chainDetails.typeOfMetal;
                chain.MetalColor = appraisalDetails.chainDetails.metalColor;
                chainMetalWeight.weight = appraisalDetails.chainDetails.metalWeight;
                chainMetalWeight.MetalUnit = appraisalDetails.chainDetails.metalUnitWeight;

                chain.MetalWeight = chainMetalWeight;

                chain.MetalLength = appraisalDetails.chainDetails.length;
                // chain.MetalWidth = appraisalDetails.chainDetails.width;

                chain.id = appraisalDetails.chainDetails.id;

                var accentDiamondsTotal = 0;
                $scope.diamondItems = appraisalDetails.mountingDetails.diamondDetails;
                angular.forEach($scope.diamondItems, function (item) {
                    var tempColorto = item.colorTo.attributeValueId;
                    var tempClarityto = item.clarityTo.attributeValueId;
                    var tempId = item.id - 1;
                    $scope.colorTo[tempId] = [];
                    $scope.clarityTo[tempId] = [];

                    if (item.colorFrom && item.colorFrom.attributeValueId)
                        $scope.onChangeDiamondFromColor(item.colorFrom.attributeValueId, tempId);

                    if (item.clarityFrom && item.clarityFrom.attributeValueId)
                        $scope.onChangeDiamondFromClarity(item.clarityFrom.attributeValueId, tempId);

                    if (item.scDiamondEstimate == null || item.scDiamondEstimate == 0) {
                        item.scDiamondEstimate = "0.0";
                        $scope.isAttributeZero = true;
                    } else {
                        var roundVal = roundOf2Decimal(item.scDiamondEstimate);
                        accentDiamondsTotal += parseFloat(roundVal);
                        item.scDiamondEstimate = roundVal;
                    }

                    item.colorTo.attributeValueId = tempColorto;
                    item.clarityTo.attributeValueId = tempClarityto;
                });

                $scope.accentDiamondsTotal = accentDiamondsTotal;

                var accentGemstonesTotal = 0;
                $scope.gemstoneItems = appraisalDetails.mountingDetails.stoneDetails;
                angular.forEach($scope.gemstoneItems, function (item) {
                    if (item.scStoneEstimate == null || item.scStoneEstimate == 0) {
                        item.scStoneEstimate = "0.0";
                        $scope.isAttributeZero = true;
                    } else {
                        var roundVal = roundOf2Decimal(item.scStoneEstimate);
                        accentGemstonesTotal += parseFloat(roundVal);
                        item.scStoneEstimate = roundVal;
                    }
                });

                $scope.accentGemstonesTotal = accentGemstonesTotal;

                //pearl
                $scope.pearlItems = appraisalDetails.pearlDetails == null ? $scope.defaultPearlItem : appraisalDetails.pearlDetails;

                var newItemNo = 1;
                angular.forEach($scope.pearlItems, function (item) {
                    if (item.id == null) {
                        item.id = newItemNo
                    }
                    newItemNo++;
                    if(item.sc_totalPearlPrice == null || item.sc_totalPearlPrice == 0)
                    $scope.isAttributeZero = true;
                });

                if (appraisalDetails.weddingBandExists) {
                    $scope.isWedding = appraisalDetails.weddingBandExists;
                    $scope.weddingItems = appraisalDetails.weddingBandDetails;
                } else {
                    $scope.isWedding = appraisalDetails.weddingBandExists;
                }

                $scope.wbandSettingTotal = 0.0;
                var total = 0.0;
                var totalWeddingBandGemstoneTotal = 0.0;
                var totalWeddingBandDiamondTotal = 0.0;

                if (appraisalDetails.weddingBandDetails) {
                    angular.forEach(appraisalDetails.weddingBandDetails, function (data) {
                        if(data.sc_totalWeddingBandDiamondsEstimate == null || data.sc_totalWeddingBandDiamondsEstimate == 0)
                        $scope.isAttributeZero = true;
                        //DimondTotal
                        var diamondTotal = data.sc_totalWeddingBandDiamondsEstimate ? parseFloat(data.sc_totalWeddingBandDiamondsEstimate) : 0.0;
                        totalWeddingBandDiamondTotal += parseFloat(diamondTotal);
                        if(data.sc_totalWeddingBandGemstonesEstimate == null || data.sc_totalWeddingBandGemstonesEstimate == 0)
                        $scope.isAttributeZero = true;
                        //StoneTotal
                        var stoneTotal = data.sc_totalWeddingBandGemstonesEstimate ? parseFloat(data.sc_totalWeddingBandGemstonesEstimate) : 0.0;
                        totalWeddingBandGemstoneTotal += parseFloat(stoneTotal);

                        //SettingTotal
                        $scope.wbandSettingTotal += isNullData(data.mounting && data.mounting.scMountingEstimates) ? 0.0 : parseFloat(data.mounting.scMountingEstimates); 
                        //total += isNullData(data.mounting && data.mounting.scMountingEstimates) ? 0.0 : parseFloat(data.mounting.scMountingEstimates);

                        $scope.weddingDiamondItems = data.mounting.diamondDetails;
                        var parentId = data.id - 1;
                        $scope.weddingColorToTemp[parentId] = [];
                        $scope.weddingClarityToTemp[parentId] = [];
                        angular.forEach($scope.weddingDiamondItems, function (item) {
                            var tempColorto = item.colorTo.attributeValueId;
                            var tempClarityto = item.clarityTo.attributeValueId;
                            var childId = item.id - 1;
                            if (item.colorFrom && item.colorFrom.attributeValueId) {
                                $scope.OnChangeWeddingDiamondColor(item.colorFrom.attributeValueId, parentId, childId)
                            }

                            if (item.clarityFrom && item.clarityFrom.attributeValueId) {
                                $scope.onChangeWeddingDiamondClarity(item.clarityFrom.attributeValueId, parentId, childId)
                            }

                            if (item.scDiamondEstimate == null || item.scDiamondEstimate == 0) {
                                item.scDiamondEstimate = "0.0";
                            } else {
                                var roundVal = roundOf2Decimal(item.scDiamondEstimate);
                                item.scDiamondEstimate = roundVal;
                            }

                            item.colorTo.attributeValueId = tempColorto;
                            item.clarityTo.attributeValueId = tempClarityto;

                        });
                    });
                }

                $scope.costSalesTax = roundOf2Decimal(appraisalDetails.salesTaxEstimation != null ? parseFloat(appraisalDetails.salesTaxEstimation) : 0);
                $scope.Appraisal.salesTaxPt = roundOf2Decimal($scope.costSalesTax == 0 ? 8.1 : ($scope.costSalesTax * 100 / parseFloat($scope.summaryTotal)));
                calSalesTax();

                var AppraisalValue = roundOf2Decimal(appraisalDetails.appraisalOldValue);
                var insurancePremiumCost = roundOf2Decimal(appraisalDetails.insurancePremiumCost);
                var newInsurancePremiumCost = roundOf2Decimal(appraisalDetails.newInsurancePremiumCost);
                oldInsurancePremiumCost = appraisalDetails.oldInsurancePremiumCost!=null ? roundOf2Decimal(appraisalDetails.oldInsurancePremiumCost) : $scope.updatedValue;
                var sc_insuranceReplacementValue = roundOf2Decimal(appraisalDetails.sc_insuranceReplacementValue);
                var sc_retailValue = roundOf2Decimal(appraisalDetails.sc_retailValue);
                var applicationSettingValueDTO = appraisalDetails.applicationSettingValueDTO;
                
                $scope.insuranceValueWithoutTax = 0.0;
                $scope.retailValueWithoutTax = 0.0;
                
                if (applicationSettingValueDTO && applicationSettingValueDTO.insuranceReplaceCost === 'true') {
                    $scope.isRetailValue = false;
                    $scope.isIRCost = true;
                    $scope.both = false;
                } else if (applicationSettingValueDTO && applicationSettingValueDTO.retailValue === 'true') {
                    $scope.isRetailValue = true;
                    $scope.isIRCost = false;
                    $scope.both = false;
                } else if (applicationSettingValueDTO && applicationSettingValueDTO.both === 'true' && applicationSettingValueDTO.isInsuranceReplacementCostSelected === 'true') {
                    $scope.isRetailValue = false;
                    $scope.isIRCost = false;
                    $scope.both = true;
                    $scope.isInsuranceReplacementCostSelected = true;
                    $scope.retailValueWithoutTax = appraisalDetails.sc_retailValue ? roundOf2Decimal(appraisalDetails.sc_retailValue) : 0.0;
                } else if (applicationSettingValueDTO && applicationSettingValueDTO.both === 'true' && applicationSettingValueDTO.isRetailValueSelected === 'true') {
                    $scope.isRetailValue = false;
                    $scope.isIRCost = false;
                    $scope.both = true;
                    $scope.isRetailCostSelected = true;
                    $scope.insuranceValueWithoutTax = appraisalDetails.sc_insuranceReplacementValue ? roundOf2Decimal(appraisalDetails.sc_insuranceReplacementValue) : 0.0;
                }

                //$scope.itemCategoryValue = appraisalDetails.itemCategory;
                $scope.tempType = appraisalDetails.type;
                $scope.Appraisal = {
                    "id": appraisalDetails.id,
                    "appraisalNumber": appraisalDetails.appraisalNumber,
                    "OriginalDescription": appraisalDetails.original_appraisal_description,
                    "AppraisalValue": (AppraisalValue == null || AppraisalValue == 0) ? "0.0" : AppraisalValue,
                    //"AppraisalDate": appraisalDetails.createdDate,
                    "AppraisalDate": $filter('DateFormatMMddyyyy')(appraisalDetails.appraisalEffectiveDate),
                    "SpeedCheckSubmittedDate": !!appraisalDetails.speedcheckAppraisalDate? formatDatetoDisplay(appraisalDetails?.speedcheckAppraisalDate):null,
                    // "AppraisalLastUpdatedDate": $filter('DateFormatMMddyyyy')(appraisalDetails.appraisalUpdatedDate),
                    "Gender": appraisalDetails.gender,
                    "Custom": appraisalDetails.isCustom,
                    "Designer": appraisalDetails.designer,
                    "ItemCategory": appraisalDetails.itemCategory,
                    "ItemType": appraisalDetails.type,
                    "Mounting": mounting,
                    "Chain": chain,
                    "comment": appraisalDetails.comparableComment,
                    //"insurancePremiumCost": (insurancePremiumCost == null || insurancePremiumCost == 0) ? "0.0" : insurancePremiumCost,
                    "newInsurancePremiumCost": (newInsurancePremiumCost) ? newInsurancePremiumCost : "0.00",
                    "oldInsurancePremiumCost": (oldInsurancePremiumCost) ? oldInsurancePremiumCost : "0.00",
                    "active": appraisalDetails.active,
                    "status": appraisalDetails.status.status,
                    "speedCheckAppraisalDate": appraisalDetails.speedcheckAppraisalDate ? $filter('DateFormatMMddyyyy')(appraisalDetails.speedcheckAppraisalDate) : null,
                    "company":appraisalDetails.company

                }

                $scope.status = $scope.Appraisal.status;

                $scope.summaryTotal = (appraisalDetails.summaryTotal || appraisalDetails.summaryTotal != null) ? roundOf2Decimal(appraisalDetails.summaryTotal) : 0.0;

                if (appraisalDetails.isNewPremiumChanged) {
                    $scope.isPremiumCostEdited = true;
                    $scope.Appraisal.newInsurancePremiumCost = roundOf2Decimal(appraisalDetails.newInsurancePremiumCost);
                }
                
                if (appraisalDetails.isOldPremiumChanged) {
                    $scope.isPremiumCostEdited = true;
                    $scope.Appraisal.oldInsurancePremiumCost = roundOf2Decimal(appraisalDetails.oldInsurancePremiumCost);
                    if($scope.Appraisal.oldInsurancePremiumCost==null){

                       $scope.Appraisal.oldInsurancePremiumCost = roundOf2Decimal(($scope.Appraisal.AppraisalValue * $scope.premiumValue) / 1000);
                    }
                }
                /*
                 When underwriter updates new premium cost in underwriter dashboard.
                */
                //if($scope.status === 'APPROVED' || $scope.status === 'AGENT REVIEW' || $scope.status == 'REJECTED'){
                
                // Set default premium value if not available
                if($scope.premiumValue == null || $scope.premiumValue == '' || $scope.premiumValue == 0 ){
                    $scope.premiumValue = 12;
                }                 

                if (appraisalDetails.isUnderwriterReviewed == true) {
                    if (appraisalDetails.type && appraisalDetails.type.atttibuteType == 'Watch') {
                        $scope.summaryTotal = appraisalDetails.watchDetails.totalWatchEstimation != null ? appraisalDetails.watchDetails.totalWatchEstimation : 0;
                    }

                    $scope.isPremiumCostEdited = true;
                    $scope.Appraisal.newInsurancePremiumCost = roundOf2Decimal(appraisalDetails.newInsurancePremiumCost);
                    $scope.Appraisal.oldInsurancePremiumCost = roundOf2Decimal(appraisalDetails.oldInsurancePremiumCost);

                } else {
                    if (appraisalDetails.type && appraisalDetails.type.atttibuteType != null) {

                        if (appraisalDetails.type.atttibuteType == 'Watch') {
                            $scope.summaryTotal = appraisalDetails.watchDetails.totalWatchEstimation != null ? appraisalDetails.watchDetails.totalWatchEstimation : 0;

                            $scope.costSalesTax = parseFloat(roundOf2Decimal(appraisalDetails.salesTaxEstimation != null ? parseFloat(appraisalDetails.salesTaxEstimation) : 0));
                            $scope.Appraisal.salesTaxPt = parseFloat(roundOf2Decimal($scope.costSalesTax == 0 ? 8.1 : ($scope.costSalesTax * 100 / parseFloat($scope.summaryTotal))));

                            $scope.summaryGrandTotal = $scope.summaryTotal + $scope.costSalesTax;
                            
                            var newValue = $scope.summaryGrandTotal / 1000;
                            var newCost = newValue * $scope.premiumValue;
                            $scope.Appraisal.newInsurancePremiumCost = parseFloat(roundOf2Decimal(newCost));

                        } else if (applicationSettingValueDTO && applicationSettingValueDTO.insuranceReplaceCost === 'true' && !appraisalDetails.isNewPremiumChanged) {
                            $scope.isPremiumCostEdited = false;

                            var newValue = 0;
                            var newCost = 0;
                            if(roundOf2Decimal($scope.summaryGrandTotal) == roundOf2Decimal(sc_insuranceReplacementValue) ){
                                newValue = parseFloat(sc_insuranceReplacementValue) / 1000;
                                newCost = newValue * $scope.premiumValue;
                            }else{
                                newValue = $scope.summaryGrandTotal / 1000;
                                newCost = newValue * $scope.premiumValue;
                            }

                            $scope.Appraisal.newInsurancePremiumCost = roundOf2Decimal(newCost);
                        } else if (applicationSettingValueDTO && applicationSettingValueDTO.retailValue === 'true' && !appraisalDetails.isNewPremiumChanged) {
                            $scope.isPremiumCostEdited = false;

                            var newValue = 0;
                            var newCost = 0;
                            if(roundOf2Decimal($scope.summaryGrandTotal) == roundOf2Decimal(sc_retailValue) ){
                                newValue = parseFloat(sc_retailValue) / 1000;
                                newCost = newValue * $scope.premiumValue;
                            }else{
                                newValue = $scope.summaryGrandTotal / 1000;
                                newCost = newValue * $scope.premiumValue;
                            }

                            $scope.Appraisal.newInsurancePremiumCost = roundOf2Decimal(newCost);
                        } else if (applicationSettingValueDTO && applicationSettingValueDTO.both === 'true' && applicationSettingValueDTO.isInsuranceReplacementCostSelected === 'true' && !appraisalDetails.isNewPremiumChanged) {
                            $scope.isPremiumCostEdited = false;

                            var newValue = 0;
                            var newCost = 0;
                            if(roundOf2Decimal($scope.summaryGrandTotal) == roundOf2Decimal(sc_insuranceReplacementValue) ){
                                newValue = parseFloat(sc_insuranceReplacementValue) / 1000;
                                newCost = newValue * $scope.premiumValue;
                            }else{
                                newValue = $scope.summaryGrandTotal / 1000;
                                newCost = newValue * $scope.premiumValue;
                            }

                            $scope.Appraisal.newInsurancePremiumCost = roundOf2Decimal(newCost);
                        } else if (applicationSettingValueDTO && applicationSettingValueDTO.both === 'true' && applicationSettingValueDTO.isRetailValueSelected === 'true' && !appraisalDetails.isNewPremiumChanged) {
                            $scope.isPremiumCostEdited = false;
                            var newValue = 0;
                            var newCost = 0;
                            if(roundOf2Decimal($scope.summaryGrandTotal) == roundOf2Decimal(sc_retailValue) ){
                                newValue = parseFloat(sc_retailValue) / 1000;
                                newCost = newValue * $scope.premiumValue;
                            }else{
                                newValue = $scope.summaryGrandTotal / 1000;
                                newCost = newValue * $scope.premiumValue;
                            }                            
                            $scope.Appraisal.newInsurancePremiumCost = roundOf2Decimal(newCost);
                        }

                        //commented by pooja no need to calculate seperately bcoz estimation will be in summary total for pearl also
                        //   if(appraisalDetails.type.atttibuteType=='Pearl'){
                        //     var newValue = roundOf2Decimal(appraisalDetails.watchDetails.totalPearlEstimation / 1000);
                        //     var newCost = newValue * 12
                        //     $scope.Appraisal.newInsurancePremiumCost = roundOf2Decimal(newCost);

                        //    }

                    }
                }

                $scope.speedcheckSubmitDate = appraisalDetails.speedcheckAppraisalDate;

                if (appraisalDetails.itemCategory && appraisalDetails.itemCategory.atttibuteValue) {

                    if ($scope.Appraisal.ItemCategory && $scope.Appraisal.ItemCategory.atttibuteValue) {
                        var category = $scope.Appraisal.ItemCategory.atttibuteValue;
                        sessionStorage.setItem("appraisalCat", category);
                    }

                    if ($scope.Appraisal.ItemType && $scope.Appraisal.ItemType.atttibuteType) {
                        var type = $scope.Appraisal.ItemType.atttibuteType;
                        sessionStorage.setItem("appraisalType", type);
                    }

                    $scope.onCategoryChange();

                    if (appraisalDetails.mountingDetails.diamondDetails == null ||
                        appraisalDetails.mountingDetails.diamondDetails != null && appraisalDetails.mountingDetails.diamondDetails.length == 0) {
                        appraisalDetails.sc_totalDiamondPrice = 0;
                    }

                    if (appraisalDetails.mountingDetails.stoneDetails == null ||
                        appraisalDetails.mountingDetails.stoneDetails != null && appraisalDetails.mountingDetails.stoneDetails.length == 0) {
                        appraisalDetails.sc_totalGemStonePrice = 0;
                    }

                    $scope.Appraisal.ItemType = $scope.tempType;
                    // Rounding of SpeedCheck Values
                    var totalSalvageCost = roundOf2Decimal(appraisalDetails.sc_salvageValue);
                    var totalJeweleryCost = roundOf2Decimal(appraisalDetails.sc_jwelersCost);
                    var totalArtigemReplacementCost = roundOf2Decimal(appraisalDetails.sc_artigemReplacementValue);
                    var totalInsuranceReplacementCost = roundOf2Decimal(appraisalDetails.summaryTotal + appraisalDetails.salesTaxEstimation);
                    var totalRetailValue = roundOf2Decimal(appraisalDetails.sc_retailValue);
                    var diamondInsuranceReplacementCost = parseFloat(roundOf2Decimal(appraisalDetails.sc_totalDiamondPrice));
                    var gemstoneArtigemReplacementCost = parseFloat(roundOf2Decimal(appraisalDetails.sc_totalGemStonePrice));

                    // Total of Accent Diamond & Gemstone / Wedding Band Diamond & Gemstone
                    var totalAccentWeddingbandDiamonds = totalWeddingBandDiamondTotal;
                    var totalAccentWeddingbandGemstones = totalWeddingBandGemstoneTotal;

                    //var totalAccentWeddingbandDiamonds = diamondInsuranceReplacementCost + totalWeddingBandDiamondTotal;
                    //var totalAccentWeddingbandGemstones = gemstoneArtigemReplacementCost + totalWeddingBandGemstoneTotal;

                    var pearlInsuranceReplacementCost = roundOf2Decimal(appraisalDetails.sc_totalPearlPrice);

                    var laborCost = roundOf2Decimal(appraisalDetails.sc_labourCost);
                    var ScTotalMountingPrice = roundOf2Decimal(appraisalDetails.sc_totalMountingPrice);
                    $scope.totalSetting = roundOf2Decimal(parseFloat(ScTotalMountingPrice)); 
                    //$scope.totalSetting = roundOf2Decimal(total + parseFloat(ScTotalMountingPrice));
                    var ScTotalChainPrice = roundOf2Decimal(appraisalDetails.sc_totalChainPrice);

                    var scCenterDiamondTotal = roundOf2Decimal(appraisalDetails.sc_centerDiamondTotal);
                    var scCenterStoneTotal = roundOf2Decimal(appraisalDetails.sc_centerStoneTotal);
                    var ScTotalMountingAccentStonePrice = roundOf2Decimal(appraisalDetails.sc_totalMountingAccentStonePrice);


                    //for dynamic population
                    if (appraisalDetails.sc_insuranceReplacementValue != 0) {
                        $scope.showSpeedcheckInfo = true;
                    }
                    //speedcheck values

                    onChangePopulate();

                    $scope.totalSalvageCost = (totalSalvageCost == null || totalSalvageCost == 0) ? "0.0" : totalSalvageCost;
                    $scope.totalJeweleryCost = (totalJeweleryCost == null || totalJeweleryCost == 0) ? "0.0" : totalJeweleryCost;
                    $scope.totalArtigemReplacementCost = (totalArtigemReplacementCost == null || totalArtigemReplacementCost == 0) ? "0.0" : totalArtigemReplacementCost;
                    $scope.totalInsuranceReplacementCost = (totalInsuranceReplacementCost == null || totalInsuranceReplacementCost == 0) ? "0.0" : totalInsuranceReplacementCost;
                    $scope.totalRetailValue = (totalRetailValue == null || totalRetailValue == 0) ? "0.0" : totalRetailValue;
                    $scope.diamondInsuranceReplacementCost = (diamondInsuranceReplacementCost == null || diamondInsuranceReplacementCost == 0) ? "0.0" : diamondInsuranceReplacementCost;
                    $scope.gemstoneArtigemReplacementCost = (gemstoneArtigemReplacementCost == null || gemstoneArtigemReplacementCost == 0) ? "0.0" : gemstoneArtigemReplacementCost;

                    // Total of Accent Diamond & Gemstone / Wedding Band Diamond & Gemstone
                    $scope.totalAccentWeddingbandDiamonds = (totalAccentWeddingbandDiamonds == null || totalAccentWeddingbandDiamonds == 0) ? "0.0" : totalAccentWeddingbandDiamonds;
                    $scope.totalAccentWeddingbandGemstones = (totalAccentWeddingbandGemstones == null || totalAccentWeddingbandGemstones == 0) ? "0.0" : totalAccentWeddingbandGemstones;

                    $scope.pearlInsuranceReplacementCost = (pearlInsuranceReplacementCost == null || pearlInsuranceReplacementCost == 0) ? "0.0" : pearlInsuranceReplacementCost;

                    $scope.Appraisal.labourCost = (laborCost == null || laborCost == 0) ? "0.0" : laborCost;
                    $scope.Appraisal.ScTotalMountingPrice = (ScTotalMountingPrice == null || ScTotalMountingPrice == 0) ? "0.0" : ScTotalMountingPrice;
                    $scope.Appraisal.ScTotalChainPrice = (ScTotalChainPrice == null || ScTotalChainPrice == 0) ? "0.0" : ScTotalChainPrice;

                    $scope.Appraisal.scEstimateDescription = (appraisalDetails.sc_finalEstimate == null) ? " " : appraisalDetails.sc_finalEstimate;


                    $scope.Appraisal.ScTotalMountingAccentStonePrice = ScTotalMountingAccentStonePrice;
                    $scope.scCenterDiamondTotal = scCenterDiamondTotal;
                    $scope.scCenterStoneTotal = scCenterStoneTotal;


                    $scope.Appraisal.comparablesUpdatedDate = (appraisalDetails.comparablesUpdatedDate == null) ? " " : appraisalDetails.comparablesUpdatedDate;


                    $scope.Appraisal.centeredStone = {};
                    $scope.isParedCenteredStone = appraisalDetails.isParedCenteredStone;
                    $scope.Appraisal.centeredStone.type = appraisalDetails.centreStoneType;

                    if ($scope.showCenteredStoneEarring) {

                        $scope.pairedDiamondItems = [];
                        $scope.pairedGemstoneItems = [];
                        $scope.showCenteredDiamondEarring = false;
                        $scope.showCenteredGemstoneEarring = false;

                        if (appraisalDetails.isParedCenteredStone == 5) {


                            //187 is diamond
                            if (appraisalDetails.centreStoneType == 187) {
                                $scope.showCenteredDiamondEarring = true;
                                $scope.centerStone.diamond = (appraisalDetails.diamondDetails && appraisalDetails.diamondDetails.length > 0) ? appraisalDetails.diamondDetails[0] : {};


                            } else if (appraisalDetails.centreStoneType == 188) {
                                $scope.showCenteredGemstoneEarring = true;
                                $scope.centerStone.gemstone = (appraisalDetails.stoneDetails && appraisalDetails.stoneDetails.length > 0) ? appraisalDetails.stoneDetails[0] : {};


                            }
                        } else if (appraisalDetails.isParedCenteredStone == 6) {

                            //187 is diamond
                            if (appraisalDetails.centreStoneType == 187) {
                                $scope.showPairedDiamondEarring = true;
                                $scope.pairedDiamondItems = appraisalDetails.diamondDetails;
                                $scope.pairedGemstoneItems = [];
                            } else if (appraisalDetails.centreStoneType == 188) {
                                $scope.showPairedGemstoneEarring = true;
                                $scope.pairedGemstoneItems = appraisalDetails.stoneDetails;
                                $scope.pairedDiamondItems = [];
                            }

                        }
                    } else if (appraisalDetails.diamondDetails.length > 1 && appraisalDetails.isParedCenteredStone == 6) {
                        //$scope.isParedCenteredStone = 6;
                        $scope.pairedDiamondItems = appraisalDetails.diamondDetails;
                        $scope.showParedDiamond($scope.isParedCenteredStone);
                        $scope.pairedDiamondItems = appraisalDetails.diamondDetails;

                        if ($scope.showAdditionalGemstone == true) {
                            if (appraisalDetails.stoneDetails.length > 0)
                                $scope.showAdditionalGemstoneDetails = true;
                        }
                        if ($scope.showAdditionalDiamond == true) {
                            if (appraisalDetails.diamondDetails.length > 0)
                                $scope.showAdditionalDiamondDetails = true;
                        }
                    } else if (appraisalDetails.stoneDetails.length > 0 && $scope.showPairedGemstone && $scope.showMainGemstone == false && appraisalDetails.isParedCenteredStone == 6 && appraisalDetails.itemCategory && appraisalDetails.itemCategory.attributeValueId != 7) {
                        // $scope.isParedCenteredStone = 6;


                        $scope.pairedGemstoneItems = appraisalDetails.stoneDetails;
                        $scope.showParedDiamond($scope.isParedCenteredStone);
                        $scope.pairedGemstoneItems = appraisalDetails.stoneDetails;

                        if ($scope.showAdditionalGemstone == true) {
                            if (appraisalDetails.stoneDetails.length > 0)
                                $scope.showAdditionalGemstoneDetails = true;
                        }
                        if ($scope.showAdditionalDiamond == true) {
                            if (appraisalDetails.diamondDetails.length > 0)
                                $scope.showAdditionalDiamondDetails = true;
                        }
                    } else if (appraisalDetails.isParedCenteredStone == 5 && appraisalDetails.diamondDetails.length > 0 && appraisalDetails.stoneDetails.length > 0 && checkAllfieldsOfDiamond(appraisalDetails.diamondDetails) && checkAllfieldsOfGemstone(appraisalDetails.stoneDetails)) {

                        // $scope.isParedCenteredStone = 5;
                        $scope.pairedDiamondItems = [];
                        if ($scope.showAdditionalGemstone == true) {
                            $scope.onChangeShowDiamondGemstone(187);
                            $scope.Appraisal.centeredStone.type = 187;
                            $scope.showAdditionalGemstoneDetails = true;
                        }
                        if ($scope.showAdditionalDiamond == true) {
                            $scope.onChangeShowDiamondGemstone(188);
                            $scope.Appraisal.centeredStone.type = 188;
                            $scope.showAdditionalDiamondDetails = true;
                        }
                        if ($scope.showMainDiamond == true) {
                            $scope.showMainDiamondDetails = true;
                        }

                        if ($scope.showMainGemstone == true) {

                            $scope.showMainGemstoneDetails = true;
                        }
                    } else if (appraisalDetails.diamondDetails.length > 0 && checkAllfieldsOfDiamond(appraisalDetails.diamondDetails)) {



                        if ($scope.showMainGemstone == true && appraisalDetails.stoneDetails.length > 0 && checkAllfieldsOfGemstone(appraisalDetails.stoneDetails)) {

                            $scope.showMainGemstoneDetails = true;
                        }

                        if ($scope.showMainDiamond == true) {
                            $scope.showMainDiamondDetails = true;
                        } else if (appraisalDetails.isParedCenteredStone == 5 || appraisalDetails.isParedCenteredStone == null) {
                            $scope.onChangeShowDiamondGemstone(187);
                            $scope.Appraisal.centeredStone.type = 187;
                            //$scope.isParedCenteredStone = 5;
                            $scope.pairedDiamondItems = [];
                            $scope.pairedGemstoneItems = [];
                        } else {
                            onChangeShowDiamondGemstone(187);
                            $scope.Appraisal.centeredStone.type = 187;
                            $scope.pairedDiamondItems = [];
                            $scope.pairedGemstoneItems = [];
                        }


                    } else if (appraisalDetails.stoneDetails.length > 0 && checkAllfieldsOfGemstone(appraisalDetails.stoneDetails)) {


                        if ($scope.showMainDiamond == true && appraisalDetails.diamondDetails.length > 0 && checkAllfieldsOfDiamond(appraisalDetails.diamondDetails)) {
                            $scope.showMainDiamondDetails = true;
                        }

                        if ($scope.showMainGemstone == true) {

                            $scope.showMainGemstoneDetails = true;
                        } else if (appraisalDetails.isParedCenteredStone == 5 || appraisalDetails.isParedCenteredStone == null) {

                            $scope.onChangeShowDiamondGemstone(188);
                            $scope.Appraisal.centeredStone.type = 188;
                            $scope.isParedCenteredStone = 5;
                            $scope.pairedDiamondItems = [];
                            $scope.pairedGemstoneItems = [];
                        } else {
                            $scope.onChangeShowDiamondGemstone(188);
                            $scope.Appraisal.centeredStone.type = 188;
                            $scope.isParedCenteredStone = 5;
                            $scope.pairedDiamondItems = [];
                            $scope.pairedGemstoneItems = [];
                        }
                    } else if (appraisalDetails.diamondDetails.length < 2) {

                        if ($scope.showMainDiamond == true) {

                        } else if (appraisalDetails.isParedCenteredStone == 5) {
                            //$scope.isParedCenteredStone = 5
                            $scope.pairedDiamondItems = [];
                            $scope.pairedGemstoneItems = [];
                        }
                    }



                    $scope.Appraisal.Gender = appraisalDetails.gender;
                    $scope.Appraisal.Custom = appraisalDetails.isCustom;
                    $scope.Appraisal.Designer = appraisalDetails.designer;
                    $scope.centerStone.diamond = (appraisalDetails.diamondDetails && !$scope.showCenteredStoneEarring && appraisalDetails.diamondDetails.length > 0) ? appraisalDetails.diamondDetails[0] : {};
                    $scope.centerStone.gemstone = (appraisalDetails.stoneDetails && !$scope.showCenteredStoneEarring && appraisalDetails.stoneDetails.length > 0) ? appraisalDetails.stoneDetails[0] : {};

                    $scope.diamondItems = appraisalDetails.mountingDetails.diamondDetails;
                    $scope.gemstoneItems = appraisalDetails.mountingDetails.stoneDetails;

                    if (appraisalDetails.diamondDetails && appraisalDetails.diamondDetails.length > 0) {
                        if ($scope.centerStone.diamond && $scope.centerStone.diamond.colorFrom && $scope.centerStone.diamond.colorFrom.attributeValueId)
                            $scope.onchangeCenteredColorFrom($scope.centerStone.diamond.colorFrom.attributeValueId);

                        if ($scope.centerStone.diamond && $scope.centerStone.diamond.clarityFrom && $scope.centerStone.diamond.clarityFrom.attributeValueId)
                            $scope.onchangeCenteredClarityFrom($scope.centerStone.diamond.clarityFrom.attributeValueId);
                    }

                    $scope.Appraisal.Mounting = mounting;

                    if (appraisalDetails.chainExists) {
                        //if (chain && checkFieldsforGetChainDetails(chain)) {
                        $scope.onChangeShowChain(appraisalDetails.chainExists);
                        $scope.Appraisal.Chain.isChain = appraisalDetails.chainExists;
                        chain.isChain = appraisalDetails.chainExists;
                        /* }
                         else {
                             $scope.onChangeShowChain(appraisalDetails.chainExists);
                             $scope.Appraisal.Chain.isChain = appraisalDetails.chainExists;
                             chain.isChain = appraisalDetails.chainExists;
                         }*/
                    }
                    $scope.Appraisal.Chain = chain;

                    $scope.Appraisal.Watch = appraisalDetails.watchDetails;

                    // update watch estimate to summaryTotal
                    //commmented since summary totasl will be updated by artigem this settings is done in artigem
                    // var itemCatagory = ($scope.Appraisal.ItemCategory) ? $scope.Appraisal.ItemCategory.attributeValueId : "";
                    // if(itemCatagory==149){
                    //     var watchEstimates= $scope.Appraisal.Watch.totalWatchEstimation == null ? 0.0 : $scope.Appraisal.Watch.totalWatchEstimation;
                    //     $scope.summaryTotal=parseFloat($scope.summaryTotal)+parseFloat(watchEstimates);
                    // }

                    if (appraisalDetails.itemCategory.atttibuteValue === 'Watch' && appraisalDetails.type && appraisalDetails.type.atttibuteType === 'Watch') {
                        if ($scope.Appraisal.Watch && isNullData($scope.Appraisal.Watch.totalWatchEstimation)) {
                            var watchOldCost = roundOf2Decimal($scope.Appraisal.Watch.totalWatchEstimation / 1000);
                            var updatedWatchCost = watchOldCost * 12;
                            if(!(!!$scope.Appraisal.newInsurancePremiumCost))
                                 $scope.Appraisal.newInsurancePremiumCost = roundOf2Decimal(updatedWatchCost);
                        }
                    }

                    $scope.centerStone.diamond = (appraisalDetails.diamondDetails && !$scope.showCenteredStoneEarring && appraisalDetails.diamondDetails.length > 0 && appraisalDetails.diamondDetails.length < 2) ? appraisalDetails.diamondDetails[0] : {};

                    $scope.centerStone.gemstone = (appraisalDetails.stoneDetails && !$scope.showCenteredStoneEarring && appraisalDetails.stoneDetails.length > 0 && appraisalDetails.stoneDetails.length < 2) ? appraisalDetails.stoneDetails[0] : {};

                    if ($scope.showCenteredStoneEarring) {

                        $scope.pairedDiamondItems = [];
                        $scope.pairedGemstoneItems = [];
                        $scope.showCenteredDiamondEarring = false;
                        $scope.showCenteredGemstoneEarring = false;

                        if (appraisalDetails.isParedCenteredStone == 5) {


                            //187 is diamond
                            if (appraisalDetails.centreStoneType == 187) {
                                $scope.showCenteredDiamondEarring = true;
                                $scope.centerStone.diamond = (appraisalDetails.diamondDetails && appraisalDetails.diamondDetails.length > 0) ? appraisalDetails.diamondDetails[0] : {};


                            } else if (appraisalDetails.centreStoneType == 188) {
                                $scope.showCenteredGemstoneEarring = true;
                                $scope.centerStone.gemstone = (appraisalDetails.stoneDetails && appraisalDetails.stoneDetails.length > 0) ? appraisalDetails.stoneDetails[0] : {};


                            }
                        } else if (appraisalDetails.isParedCenteredStone == 6) {

                            //187 is diamond
                            if (appraisalDetails.centreStoneType == 187) {
                                $scope.showPairedDiamondEarring = true;
                                $scope.pairedDiamondItems = appraisalDetails.diamondDetails;
                                $scope.pairedGemstoneItems = [];
                            } else if (appraisalDetails.centreStoneType == 188) {
                                $scope.showPairedGemstoneEarring = true;
                                $scope.pairedGemstoneItems = appraisalDetails.stoneDetails;
                                $scope.pairedDiamondItems = [];
                            }

                        }
                    } else if (appraisalDetails.diamondDetails.length > 1 && appraisalDetails.isParedCenteredStone == 6) {
                        // $scope.isParedCenteredStone = 6;
                        $scope.pairedDiamondItems = appraisalDetails.diamondDetails;
                        $scope.showParedDiamond($scope.isParedCenteredStone);
                        $scope.pairedDiamondItems = appraisalDetails.diamondDetails;

                        if ($scope.showAdditionalGemstone == true) {
                            if (appraisalDetails.stoneDetails.length > 0)
                                $scope.showAdditionalGemstoneDetails = true;
                        }
                        if ($scope.showAdditionalDiamond == true) {
                            if (appraisalDetails.diamondDetails.length > 0)
                                $scope.showAdditionalDiamondDetails = true;
                        }
                    } else if (appraisalDetails.stoneDetails.length > 0 && $scope.showPairedGemstone && appraisalDetails.isParedCenteredStone == 6 && appraisalDetails.itemCategory && appraisalDetails.itemCategory.attributeValueId != 7) {
                        //$scope.isParedCenteredStone = 6;
                        $scope.pairedGemstoneItems = appraisalDetails.stoneDetails;
                        $scope.showParedDiamond($scope.isParedCenteredStone);
                        $scope.pairedGemstoneItems = appraisalDetails.stoneDetails;

                        if ($scope.showAdditionalGemstone == true) {
                            if (appraisalDetails.stoneDetails.length > 0)
                                $scope.showAdditionalGemstoneDetails = true;
                        }
                        if ($scope.showAdditionalDiamond == true) {
                            if (appraisalDetails.diamondDetails.length > 0)
                                $scope.showAdditionalDiamondDetails = true;
                        }
                    } else if (appraisalDetails.stoneDetails.length == 1 && appraisalDetails.isParedCenteredStone == 5) {
                        // $scope.isParedCenteredStone = 5;
                        $scope.pairedGemstoneItems = appraisalDetails.stoneDetails;
                        $scope.showParedDiamond($scope.isParedCenteredStone);
                        $scope.pairedGemstoneItems = appraisalDetails.stoneDetails;

                        if ($scope.showAdditionalGemstone == false) {
                            if (appraisalDetails.stoneDetails.length > 0)
                                $scope.showAdditionalGemstoneDetails = false;
                        }
                        if ($scope.showAdditionalDiamond == true) {
                            if (appraisalDetails.diamondDetails.length > 0)
                                $scope.showAdditionalDiamondDetails = true;
                        }
                    }

                    $scope.scDiamondEstimateTotal = 0;
                    angular.forEach($scope.pairedDiamondItems, function (item) {
                        if (item.scDiamondEstimate == null || item.scDiamondEstimate == 0) {
                            item.scDiamondEstimate = "0.0";
                        } else {
                            var roundVal = roundOf2Decimal(item.scDiamondEstimate);
                            $scope.scDiamondEstimateTotal += parseFloat(roundVal);
                        }
                    });

                    angular.forEach($scope.pairedGemstoneItems, function (item) {
                        if (item.scStoneEstimate == null || item.scStoneEstimate == 0) {
                            item.scStoneEstimate = "0.0";
                        } else {
                            var roundVal = roundOf2Decimal(item.scStoneEstimate);
                            $scope.scStoneEstimateTotal += parseFloat(roundVal);
                        }
                    });


                    var tempDropdowns = [];
                    var tempTypeDropdowns = [];

                    angular.forEach($scope.AppraisalDropdowns, function (Item) {
                        angular.forEach(Item.attributeValue, function (subItem) {
                            tempDropdowns.push(subItem);
                        });
                    });


                    function getByFind(id) {
                        var value = tempDropdowns.filter(x => x.attributeValueId === id);
                        var res = value[0];
                        if (res)
                            return res.atttibuteValue;
                        else
                            return "";
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
                    if ($scope.Appraisal.ItemType && $scope.Appraisal.ItemType.attributeValueTypeId)
                        $scope.itemTypeValue = getByFindType($scope.Appraisal.ItemType.attributeValueTypeId);

                    if ($scope.Appraisal.ItemCategory && $scope.Appraisal.ItemCategory.attributeValueId)
                        $scope.itemCategoryValue = getByFind($scope.Appraisal.ItemCategory.attributeValueId);
                    //$scope.desc = {"originalAppraisalValue":"Original Appraisal Value 87687.00","originalAppraisalDate":"Original Appraisal Date 11/19/2018","todaysDate":"Today’s Date 11/19/2018","insuranceReplacementCost":"Insurance Replacement Value 0","gender":"Women`s","custom":"custom","designer":"designer brand","itemCategory":"Ring","itemType":"Wedding Band / Anniversary","metalType":"10 Karat, ","metalColor":"White ","metalWeight":1,"metalWeightUnit":"GRAMS","metalLength":"","metalWidth":"","chainType":"","chainColor":"","chainWeight":"0.0","chainWeightUnit":"","chainLength":"","diamonds":[],"gemstones":[],"pearls":[]}

                    // SPEED - 984
                    if ($scope.summaryGrandTotal != null && parseFloat($scope.summaryGrandTotal) != 0) {
                        if (parseFloat(roundOf2Decimal($scope.summaryGrandTotal)) > parseFloat(AppraisalValue)) {
                            //$('#speedCheck-Estimate').removeClass('text-green').addClass('text-red');
                            $scope.estimateText = 'red';
                        } else if (parseFloat(roundOf2Decimal($scope.summaryGrandTotal)) <= parseFloat(AppraisalValue)) {
                            //$('#speedCheck-Estimate').removeClass('text-red').addClass('text-green');
                            $scope.estimateText = 'green';
                        }
                    }

                    //speedcheck result field
                    //  if (!$scope.desc.settings || $scope.desc.settings == "")
                    //      GeneratDescription($scope.totalInsuranceReplacementCost);

                }

                if (appraisalDetails.type && appraisalDetails.type.attributeValueTypeId && appraisalDetails.type.attributeValueTypeId == 22) {
                    if (($scope.pairedGemstoneItems.length > 0 && checkAllfieldsOfGemstone($scope.pairedGemstoneItems)) || ($scope.centerStone.gemstone && checkAllfieldsOfGemstoneNonArray($scope.centerStone.gemstone))) {
                        $scope.addCenterGemstone = false;

                    } else {
                        $scope.pairedGemstoneItems = [];
                        $scope.centerStone.gemstone = {};
                        $scope.addCenterGemstone = true;
                    }
                    // $scope.addCenterGemstone = ($scope.pairedGemstoneItems.length>0 && checkAllfieldsOfGemstone($scope.pairedGemstoneItems)) || ($scope.centerStone.gemstone && checkAllfieldsOfGemstoneNonArray($scope.centerStone.gemstone))?false:true;

                    if ($scope.showAdditionalGemstone == true) {
                        if (appraisalDetails.stoneDetails.length > 0)
                            $scope.showAdditionalGemstoneDetails = true;
                    }
                    if ($scope.showAdditionalDiamond == true) {
                        $scope.showCenteredDiamond = false;
                        if (appraisalDetails.diamondDetails.length > 0)
                            $scope.showAdditionalDiamondDetails = true;
                    }
                }
                //FileExtension
                $scope.attachmentList = [];
                angular.forEach(appraisalDetails.attachments, function (ItemFile) {
                    var name = ItemFile.appraisalDocuments;
                    var names = name.split('_');
                    var fileType = name.split('.').pop();
                    var filename = name.split('/').pop();
                    var str = filename;
                    var words = str.substring(str.indexOf('_') + 1);
                    $scope.attachmentList.push({
                        "fileName": words,
                        "url": $scope.serverAddress + name,
                        "type": fileType,
                        "fileData": ItemFile.multipartFiles,
                        "Image": $scope.serverAddress + name,
                        "isLocal": false
                    });
                });                

                $scope.costSalesTax = roundOf2Decimal(appraisalDetails.salesTaxEstimation != null ? parseFloat(appraisalDetails.salesTaxEstimation) : 0);
                $scope.Appraisal.salesTaxPt = roundOf2Decimal($scope.costSalesTax == 0 ? 8.1 : ($scope.costSalesTax * 100 / parseFloat($scope.summaryTotal)));
                calSalesTax();
                var broadcastData = {
                    "appraisalNumber": appraisalDetails.appraisalNumber,
                    "editAppraisal": "true"
                }
                
                $rootScope.$broadcast('ReadNotification', broadcastData);
                $rootScope.$broadcast('eventEmitedAppraisalNo', broadcastData);

                if ($scope.isSubmittedToSC) {
                    
                    //    if(appraisalDetails.designer && appraisalDetails.designer.atttibuteValue && appraisalDetails.designer.atttibuteValue =="Yes" );
                    //     AddArtigemReviewRecommendPopup();

                    var suggestedValue = $scope.summaryGrandTotal;

                    $scope.increasePercentage = 0.0;
                    $scope.increasePercentage = calculateIncreasePercentage(suggestedValue, appraisalDetails.appraisalOldValue);

                    $scope.appraisalAge = calculateAppraisalAge(appraisalDetails.appraisalEffectiveDate);

                    // if (appraisalDetails.designer && appraisalDetails.designer.atttibuteValue && appraisalDetails.designer.atttibuteValue == "Yes")
                    //     AddArtigemReviewRecommendPopup(false);
                    //     else
                            if ($scope.isAttributeZero)
                                AddArtigemReviewRecommendPopup(true);
                    // else
                    //     if ($scope.increasePercentage > 50)
                    //         AddArtigemReviewRecommendPopup(false);
                    //     else
                    //         if (($scope.appraisalAge >= 0 && $scope.appraisalAge < 4) && $scope.increasePercentage > 20)
                    //             AddArtigemReviewRecommendPopup(false);
                    //         else
                    //             if (($scope.appraisalAge > 5 && $scope.appraisalAge < 10) && $scope.increasePercentage > 30)
                    //                 AddArtigemReviewRecommendPopup(false);
                                
                    else if(parseFloat($scope.totalInsuranceReplacementCost) > parseFloat($scope.Appraisal.AppraisalValue))
                    AddArtigemReviewRecommendPopup(false);
                    
                    $scope.isSubmittedToSC = false;
                }
                
                console.log("disableScreen: ",!$scope.disableScreen);

                if (!$scope.disableScreen) {
                    $timeout(function(){
                        $(".page-spinner-bar").addClass("hide");
                    },4000);                    
                }
                // GeneratDescription($scope.totalInsuranceReplacementCost);
                // console.log(success.data.appraisalDataDTO);
            }, function (error) { });

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
            //$(".page-spinner-bar").removeClass("hide");
            var promis = AppraisalService.getAppraisalDropdowns();

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
                    $timeout(function () {
                        $scope.getAppraisalDetails();
                    }, 100)
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

        $scope.diamondItems = [];
        $scope.updateDiamondsBox = function (diadiamondItems) {
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

        $scope.gemstoneItems = [];
        $scope.updateGemstoneBox = function (gemstoneItems) {
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
                                scDiamond.quantity = (Item.quantity) ? Item.quantity : 1,
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
                                scStone.quantity = (Item.quantity) ? Item.quantity : 1,

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
                                centerDiamond.quantity = (Item.quantity) ? Item.quantity : 1,
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
                                    centerDiamond.quantity = (Item.quantity) ? Item.quantity : 1,
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
                            centerGemstone.quantity = $scope.showTwo ? 2 : 1;

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
                            centerGemstone.quantity = Item.quantity ? Item.quantity : 1;

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
                                centerGemstone.quantity = Item.quantity ? Item.quantity : 1;

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
                                            scDiamond.quantity = (Item.quantity) ? Item.quantity : 1,
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
                    speedcheckData.gemGuideApi =$scope.gemGuideApi;
                    speedcheckData.companyUrn = $scope.companyUrn;
                    //getSpeedcheValues
                    //data.append("appraisalDocuments", JSON.stringify(appraisalDocuments[0]));




                    var promis = AppraisalService.getSpeedcheValues(speedcheckData);

                    promis.then(function (success) {
                        $rootScope.ApprisalFormPristine = false;
                        $rootScope.ApprisalFormPristine = false;
                        var result = success.data.data;
                        var display = null;
                        
                        var getSettingValue = AppraisalService.getAppSettingValues();
                        getSettingValue.then(function (success) {
                            $scope.appData = success.data.data;

                            if ($scope.appData.insuranceReplaceCost === 'true') {

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
                                    if($scope.centerStone.diamond.scDiamondEstimate == null || $scope.centerStone.diamond.scDiamondEstimate == 0)
                                    $scope.isAttributeZero = true;
                                    //recpmmend purpose
                                    if ((scCenterDiamond && scCenterDiamond.length > 0 && scCenterDiamond[0].prices != null && (scCenterDiamond[0].prices.insuranceReplacementCost == null || scCenterDiamond[0].prices.insuranceReplacementCost == 0)))
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
                                        // if ($scope.pairedDiamondItems.scDiamondEstimate == 0)
                                        //     $scope.isAttributeZero = true;
                                    }
                                }
    
                                //center stone
    
                                //stone details
                                var tempCenterStoneDetail = [];
                                if (centerGemstones.length == 1 && $scope.centerStone.gemstone != null) {
                                    $scope.centerStone.gemstone.scStoneEstimate = (scCenterGemstone && scCenterGemstone.length > 0 && scCenterGemstone[0].prices != null && scCenterGemstone[0].prices.insuranceReplacementCost != null) ? roundOf2Decimal(scCenterGemstone[0].prices.insuranceReplacementCost) : 0.0;
                                    if($scope.centerStone.gemstone.scStoneEstimate == null || $scope.centerStone.gemstone.scStoneEstimate ==0)
                                    $scope.isAttributeZero = true;
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
    
                                        // if ($scope.pairedGemstoneItems[i].scStoneEstimate == 0)
                                        //     $scope.isAttributeZero = true;
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
                                $scope.wbandSettingTotal = 0.0;
                                //$scope.totalSetting = 0.0;
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
                                            $scope.wbandSettingTotal += parseFloat(roundVal);
                                            //$scope.totalSetting += parseFloat(roundVal);
                                            $scope.weddingItems[parentId].mounting.scMountingEstimates = parseFloat(roundVal);
                                        } else {
                                            $scope.weddingItems[parentId].mounting.scMountingEstimates = 0.0;
                                        }
                                    });

                                    if (!$scope.wbandSettingTotal)
                                        $scope.isAttributeZero = true;
                                    $scope.summaryTotal += $scope.wbandSettingTotal;
                                    $scope.totalSetting = parseFloat(roundOf2Decimal($scope.Appraisal.ScTotalMountingPrice));
    
                                    //if (!$scope.totalSetting)
                                    //    $scope.isAttributeZero = true;
                                    //$scope.summaryTotal += $scope.totalSetting;
                                    //$scope.totalSetting = parseFloat(roundOf2Decimal($scope.totalSetting + $scope.Appraisal.ScTotalMountingPrice));
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
    
                                    //Total Wedding band Cost of setting.
                                    GeneratDescription($scope.totalInsuranceReplacementCost);
    
                                    $scope.isSubmittedToSC = true;
    
                                    // After successfull SpeedCheck API call - Save/Update appraisal data
                                    if ($scope.formStatus && $scope.IsEditOrder) {
                                        UpdateApprisal();
                                    } else if ($scope.formStatus && !$scope.IsEditOrder) {
                                        $scope.IsSpeedCheckDisabled = true;
                                        saveApprisal();
                                    }
                                    //  $(".page-spinner-bar").addClass("hide");
                                    toastr.remove();
                                    toastr.success("Successfully validated the item's value from SpeedCheck.", "Confirmation");
                                }
                            } else if ($scope.appData.retailValue === 'true') {
    
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
                                    if($scope.centerStone.diamond.scDiamondEstimate == null || $scope.centerStone.diamond.scDiamondEstimate == 0)
                                    $scope.isAttributeZero = true;
                                    //recpmmend purpose
                                    if ((scCenterDiamond && scCenterDiamond.length > 0 && scCenterDiamond[0].prices != null && (scCenterDiamond[0].prices.retailPrice == null || scCenterDiamond[0].prices.retailPrice == 0)))
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
                                        // if ($scope.pairedDiamondItems.scDiamondEstimate == 0)
                                        //     $scope.isAttributeZero = true;
                                    }
                                }
    
                                //center stone
    
                                //stone details
                                var tempCenterStoneDetail = [];
                                if (centerGemstones.length == 1 && $scope.centerStone.gemstone != null) {
                                    $scope.centerStone.gemstone.scStoneEstimate = (scCenterGemstone && scCenterGemstone.length > 0 && scCenterGemstone[0].prices != null && scCenterGemstone[0].prices.retailPrice != null) ? roundOf2Decimal(scCenterGemstone[0].prices.retailPrice) : 0.0;
                                    if($scope.centerStone.gemstone.scStoneEstimate == null || $scope.centerStone.gemstone.scStoneEstimate ==0)
                                    $scope.isAttributeZero = true;
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
    
                                        // if ($scope.pairedGemstoneItems[i].scStoneEstimate == 0)
                                        //     $scope.isAttributeZero = true;
                                    }
                                }
    
                                //total estimation for gemstone
                                if (scStoneDetails && scStoneDetails.gemstoneRetailCost > 0)
                                    $scope.gemstoneArtigemReplacementCost = roundOf2Decimal(scStoneDetails.gemstoneRetailCost);
                                else
                                    $scope.gemstoneArtigemReplacementCost = 0.0;
    
                                //recpmmend purpose
                                if (scStoneDetails && (!scStoneDetails.gemstoneRetailCost || scStoneDetails.gemstoneRetailCost == 0))
                                    $scope.isAttributeZero = true;
    
    
                                //total estimate for center diamond gemstone
                                $scope.scCenterDiamondTotal = (result.diamonds && result.diamonds.diamondRetailValue) ? result.diamonds.diamondRetailValue : 0.0;
                                $scope.scCenterStoneTotal = (result.gemstones && result.gemstones.gemstoneRetailCost) ? result.gemstones.gemstoneRetailCost : 0.0;
    
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
                                $scope.wbandSettingTotal = 0.0;
                                //$scope.totalSetting = 0.0;
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
                                            $scope.wbandSettingTotal += parseFloat(roundVal);
                                            //$scope.totalSetting += parseFloat(roundVal);
                                            $scope.weddingItems[parentId].mounting.scMountingEstimates = parseFloat(roundVal);
                                        } else {
                                            $scope.weddingItems[parentId].mounting.scMountingEstimates = 0.0;
                                        }
                                    });

                                    if (!$scope.wbandSettingTotal)
                                        $scope.isAttributeZero = true;
                                    $scope.summaryTotal += $scope.wbandSettingTotal;
                                    $scope.totalSetting = parseFloat(roundOf2Decimal($scope.Appraisal.ScTotalMountingPrice));
    
                                    //if (!$scope.totalSetting)
                                    //    $scope.isAttributeZero = true;
                                    //$scope.summaryTotal += $scope.totalSetting;
                                    //$scope.totalSetting = parseFloat(roundOf2Decimal($scope.totalSetting + $scope.Appraisal.ScTotalMountingPrice));
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
                                    GeneratDescription($scope.totalRetailValue);
    
                                    $scope.isSubmittedToSC = true;
    
                                    // After successfull SpeedCheck API call - Save/Update appraisal data
                                    if ($scope.formStatus && $scope.IsEditOrder) {
                                        UpdateApprisal();
                                    } else if ($scope.formStatus && !$scope.IsEditOrder) {
                                        $scope.IsSpeedCheckDisabled = true;
                                        saveApprisal();
                                    }
                                    //  $(".page-spinner-bar").addClass("hide");
                                    toastr.remove();
                                    toastr.success("Successfully validated the item's value from SpeedCheck.", "Confirmation");
                                }
    
                            } else if ($scope.appData.both === 'true' && $scope.appData.isInsuranceReplacementCostSelected === 'true') {
    
    
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
                                    if($scope.centerStone.diamond.scDiamondEstimate == null || $scope.centerStone.diamond.scDiamondEstimate == 0)
                                    $scope.isAttributeZero = true;
                                    //recpmmend purpose
                                    if ((scCenterDiamond && scCenterDiamond.length > 0 && scCenterDiamond[0].prices != null &&(scCenterDiamond[0].prices.insuranceReplacementCost == null ||  scCenterDiamond[0].prices.insuranceReplacementCost == 0)))
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
                                        // if ($scope.pairedDiamondItems.scDiamondEstimate == 0)
                                        //     $scope.isAttributeZero = true;
                                    }
                                }
    
                                //center stone
    
                                //stone details
                                var tempCenterStoneDetail = [];
                                if (centerGemstones.length == 1 && $scope.centerStone.gemstone != null) {
                                    $scope.centerStone.gemstone.scStoneEstimate = (scCenterGemstone && scCenterGemstone.length > 0 && scCenterGemstone[0].prices != null && scCenterGemstone[0].prices.insuranceReplacementCost != null) ? roundOf2Decimal(scCenterGemstone[0].prices.insuranceReplacementCost) : 0.0;
                                    if($scope.centerStone.gemstone.scStoneEstimate == null || $scope.centerStone.gemstone.scStoneEstimate ==0)
                                    $scope.isAttributeZero = true;
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
    
                                        // if ($scope.pairedGemstoneItems[i].scStoneEstimate == 0)
                                        //     $scope.isAttributeZero = true;
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
                                $scope.wbandSettingTotal = 0.0;
                                //$scope.totalSetting = 0.0;
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
                                            $scope.wbandSettingTotal += parseFloat(roundVal);
                                            //$scope.totalSetting += parseFloat(roundVal);
                                            $scope.weddingItems[parentId].mounting.scMountingEstimates = parseFloat(roundVal);
                                        } else {
                                            $scope.weddingItems[parentId].mounting.scMountingEstimates = 0.0;
                                        }
                                    });

                                    if (!$scope.wbandSettingTotal)
                                        $scope.isAttributeZero = true;
                                    $scope.summaryTotal += $scope.wbandSettingTotal;
                                    $scope.totalSetting = parseFloat(roundOf2Decimal($scope.Appraisal.ScTotalMountingPrice));
    
                                    //if (!$scope.totalSetting)
                                    //    $scope.isAttributeZero = true;
                                    //$scope.summaryTotal += $scope.totalSetting;
                                    //$scope.totalSetting = parseFloat(roundOf2Decimal($scope.totalSetting + $scope.Appraisal.ScTotalMountingPrice));
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
                                    GeneratDescription($scope.totalInsuranceReplacementCost);
    
                                    $scope.isSubmittedToSC = true;
    
                                    // After successfull SpeedCheck API call - Save/Update appraisal data
                                    if ($scope.formStatus && $scope.IsEditOrder) {
                                        UpdateApprisal();
                                    } else if ($scope.formStatus && !$scope.IsEditOrder) {
                                        $scope.IsSpeedCheckDisabled = true;
                                        saveApprisal();
                                    }
                                    //  $(".page-spinner-bar").addClass("hide");
                                    toastr.remove();
                                    toastr.success("Successfully validated the item's value from SpeedCheck.", "Confirmation");
                                }
    
                            } else if ($scope.appData.both === 'true' && $scope.appData.isRetailValueSelected === 'true') {
    
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
                                    if($scope.centerStone.diamond.scDiamondEstimate == null || $scope.centerStone.diamond.scDiamondEstimate == 0)
                                    $scope.isAttributeZero = true;
                                    //recpmmend purpose
                                    if ((scCenterDiamond && scCenterDiamond.length > 0 && scCenterDiamond[0].prices != null && (scCenterDiamond[0].prices.retailPrice == null || scCenterDiamond[0].prices.retailPrice == 0)))
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
                                        // if ($scope.pairedDiamondItems.scDiamondEstimate == 0)
                                        //     $scope.isAttributeZero = true;
                                    }
                                }
    
                                //center stone
    
                                //stone details
                                var tempCenterStoneDetail = [];
                                if (centerGemstones.length == 1 && $scope.centerStone.gemstone != null) {
                                    $scope.centerStone.gemstone.scStoneEstimate = (scCenterGemstone && scCenterGemstone.length > 0 && scCenterGemstone[0].prices != null && scCenterGemstone[0].prices.retailPrice != null) ? roundOf2Decimal(scCenterGemstone[0].prices.retailPrice) : 0.0;
                                    if($scope.centerStone.gemstone.scStoneEstimate == null || $scope.centerStone.gemstone.scStoneEstimate ==0)
                                    $scope.isAttributeZero = true;
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
    
                                        // if ($scope.pairedGemstoneItems[i].scStoneEstimate == 0)
                                        //     $scope.isAttributeZero = true;
                                    }
                                }
    
                                //total estimation for gemstone
                                if (scStoneDetails && scStoneDetails.gemstoneRetailCost > 0)
                                    $scope.gemstoneArtigemReplacementCost = roundOf2Decimal(scStoneDetails.gemstoneRetailCost);
                                else
                                    $scope.gemstoneArtigemReplacementCost = 0.0;
    
                                //recpmmend purpose
                                if (scStoneDetails && (!scStoneDetails.gemstoneRetailCost || scStoneDetails.gemstoneRetailCost == 0))
                                    $scope.isAttributeZero = true;
    
    
                                //total estimate for center diamond gemstone
                                $scope.scCenterDiamondTotal = (result.diamonds && result.diamonds.diamondRetailValue) ? result.diamonds.diamondRetailValue : 0.0;
                                $scope.scCenterStoneTotal = (result.gemstones && result.gemstones.gemstoneRetailCost) ? result.gemstones.gemstoneRetailCost : 0.0;
    
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
                                $scope.wbandSettingTotal = 0.0;
                                //$scope.totalSetting = 0.0;
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
                                            $scope.wbandSettingTotal += parseFloat(roundVal);
                                            //$scope.totalSetting += parseFloat(roundVal);
                                            $scope.weddingItems[parentId].mounting.scMountingEstimates = parseFloat(roundVal);
                                        } else {
                                            $scope.weddingItems[parentId].mounting.scMountingEstimates = 0.0;
                                        }
                                    });

                                    if (!$scope.wbandSettingTotal)
                                        $scope.isAttributeZero = true;
                                    $scope.summaryTotal += $scope.wbandSettingTotal;
                                    $scope.totalSetting = parseFloat(roundOf2Decimal($scope.Appraisal.ScTotalMountingPrice));
    
                                    //if (!$scope.totalSetting)
                                    //    $scope.isAttributeZero = true;
                                    //$scope.summaryTotal += $scope.totalSetting;
                                    //$scope.totalSetting = parseFloat(roundOf2Decimal($scope.totalSetting + $scope.Appraisal.ScTotalMountingPrice));
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
                                    GeneratDescription($scope.totalRetailValue);
    
                                    $scope.isSubmittedToSC = true;
    
                                    // After successfull SpeedCheck API call - Save/Update appraisal data
                                    if ($scope.formStatus && $scope.IsEditOrder) {
                                        UpdateApprisal();
                                    } else if ($scope.formStatus && !$scope.IsEditOrder) {
                                        $scope.IsSpeedCheckDisabled = true;
                                        saveApprisal();
                                    }
                                    //  $(".page-spinner-bar").addClass("hide");
                                    toastr.remove();
                                    toastr.success("Successfully validated the item's value from SpeedCheck.", "Confirmation");
                                }
    
                            }
    
                            console.log('data',$scope.appData)
                        });
                        

                        
                    }, function (error) {
                        toastr.remove();
                        $(".page-spinner-bar").addClass("hide");
                        if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                            toastr.error("Error fetching SpeedCheck values for item.", "Error");
                        } else if(error.data.message && error.data.message != null) {
                            toastr.error(error.data.message);
                        }

                    }


                    );

            }else{
                // Open Contract Expired popup
                companyContractExpiredPopop();
            }
                
        }


        function GeneratDescription(insuranceReplacementCost) {

            var tempDropdowns = [];
            var tempTypeDropdowns = [];
            $scope.isDesc = true;

            var value = '';
            var text = '';

            if ($scope.appData.insuranceReplaceCost === 'true') {
                value = insuranceReplacementCost;
                text = 'Insurance replacement value  ';
            } else if ($scope.appData.retailValue === 'true') {
                value = insuranceReplacementCost;
                text = 'Retaill value  ';
            } else if ($scope.appData.both === 'true' && $scope.appData.isRetailValueSelected === 'true') {
                value = insuranceReplacementCost;
                text = 'Retail value   ';
            } else if ($scope.appData.both === 'true' && $scope.appData.isInsuranceReplacementCostSelected === 'true') {
                value = insuranceReplacementCost;
                text = 'Insurance replacement value  ';
            }

            angular.forEach($scope.AppraisalDropdowns, function (Item) {

                angular.forEach(Item.attributeValue, function (subItem) {
                    tempDropdowns.push(subItem);
                });
            });



            function getByFind(id) {
                var value = tempDropdowns.filter(x => x.attributeValueId === id);
                var res = value[0];
                if (res != null) {
                    return res.atttibuteValue;
                } else
                    return "";
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


            $scope.desc = {};

            $scope.desc.settings = "";

            $scope.desc.originalAppraisalValue = ($scope.Appraisal.AppraisalValue) ? "Original appraisal Value    " + $filter('currency')(parseFloat($scope.Appraisal.AppraisalValue)) : "Original appraisal value    ";
            $scope.desc.originalAppraisalDate = ($scope.Appraisal.AppraisalDate) ? "Original appraisal Date    " + $scope.Appraisal.AppraisalDate : "Original appraisal date    ";

            $scope.desc.todaysDate = "Today's date   " + $filter('date')(new Date(), 'MM/dd/yyyy');
            $scope.desc.insuranceReplacementCost = text + $filter('currency')(parseFloat(roundOf2Decimal(value)));

            //$scope.Appraisal.newInsurancePremiumCost = insuranceReplacementCost * 0.012;

            var newValue = roundOf2Decimal(value / 1000);
            var newCost = newValue * 12
            $scope.Appraisal.newInsurancePremiumCost = roundOf2Decimal(newCost);

            //$scope.Appraisal.newInsurancePremiumCost = insuranceReplacementCost  * 0.012;

            if ($scope.Appraisal.Gender && $scope.Appraisal.Gender.attributeValueId)
                $scope.desc.gender = (getByFind($scope.Appraisal.Gender.attributeValueId) == "Universal") ? " " + getByFind($scope.Appraisal.Gender.attributeValueId) + " gender" : " " + getByFind($scope.Appraisal.Gender.attributeValueId);
            else
                $scope.desc.gender = "";

            if ($scope.Appraisal.Custom && $scope.Appraisal.Custom.attributeValueId)
                $scope.desc.custom = getByFind($scope.Appraisal.Custom.attributeValueId) == "Yes" ? " custom made" : "";
            else
                $scope.desc.custom = "";
            if ($scope.Appraisal.Designer && $scope.Appraisal.Designer.attributeValueId)
                $scope.desc.designer = getByFind($scope.Appraisal.Designer.attributeValueId) == "Yes" ? " designer brand" : "";
            else
                $scope.desc.designer = "";

            if ($scope.Appraisal.ItemCategory && $scope.Appraisal.ItemCategory.attributeValueId)
                $scope.desc.itemCategory = (getByFind($scope.Appraisal.ItemCategory.attributeValueId)) ? " " + getByFind($scope.Appraisal.ItemCategory.attributeValueId) : "";
            else
                $scope.desc.itemCategory = "";

            if ($scope.Appraisal.ItemType && $scope.Appraisal.ItemType.attributeValueTypeId)
                $scope.desc.itemType = " " + (getByFindType($scope.Appraisal.ItemType.attributeValueTypeId) == "Chain (No Stones)" ? "chain" : getByFindType($scope.Appraisal.ItemType.attributeValueTypeId));
            else
                $scope.desc.itemType = "";



            //mounting
            if ($scope.Appraisal.Mounting) {

                $scope.desc.metalType = ($scope.Appraisal.Mounting.MetalType && $scope.Appraisal.Mounting.MetalType.attributeValueId &&
                    getByFind($scope.Appraisal.Mounting.MetalType.attributeValueId) &&
                    getByFind($scope.Appraisal.Mounting.MetalType.attributeValueId) != "Other") ?
                    getByFind($scope.Appraisal.Mounting.MetalType.attributeValueId) + "" : "";
                $scope.desc.metalColor = ($scope.Appraisal.Mounting.MetalColor && $scope.Appraisal.Mounting.MetalColor.attributeValueId &&
                    getByFind($scope.Appraisal.Mounting.MetalColor.attributeValueId) &&
                    getByFind($scope.Appraisal.Mounting.MetalColor.attributeValueId) != "Other" &&
                    getByFind($scope.Appraisal.Mounting.MetalColor.attributeValueId) != "Two-Tone" &&
                    getByFind($scope.Appraisal.Mounting.MetalColor.attributeValueId) != "Tri-Tone" &&
                    ($scope.desc.metalType != "Platinum" && $scope.desc.metalType != "Sterling Silver")) ?
                    " " + getByFind($scope.Appraisal.Mounting.MetalColor.attributeValueId).trim() + " gold" : "";

                if ($scope.Appraisal.Mounting.MetalColor && $scope.Appraisal.Mounting.MetalColor.attributeValueId &&
                    getByFind($scope.Appraisal.Mounting.MetalColor.attributeValueId) &&
                    (getByFind($scope.Appraisal.Mounting.MetalColor.attributeValueId) == "Two-Tone" ||
                        getByFind($scope.Appraisal.Mounting.MetalColor.attributeValueId) == "Tri-Tone")) {

                    $scope.desc.metalColor = " " + getByFind($scope.Appraisal.Mounting.MetalColor.attributeValueId).trim()
                }

                if ($scope.desc.metalType.includes("& Platinum")) {
                    $scope.desc.metalType = $scope.desc.metalType.split('& Platinum')[0] + "gold " + "& Platinum";
                    if (getByFind($scope.Appraisal.Mounting.MetalColor.attributeValueId) != "Other")
                        $scope.desc.metalColor = " " + (getByFind($scope.Appraisal.Mounting.MetalColor.attributeValueId)).trim();
                    else
                        $scope.desc.metalColor = "";

                }


                $scope.desc.metalWeight = ($scope.Appraisal.Mounting.MetalWeight && $scope.Appraisal.Mounting.MetalWeight.weight) ? $scope.Appraisal.Mounting.MetalWeight.weight : "";
                $scope.desc.metalWeightUnit = ($scope.Appraisal.Mounting.MetalWeight && $scope.Appraisal.Mounting.MetalWeight.MetalUnit && $scope.Appraisal.Mounting.MetalWeight.MetalUnit.attributeValueId) ?
                    "" + getByFind($scope.Appraisal.Mounting.MetalWeight.MetalUnit.attributeValueId) : "";

                $scope.desc.metalweightUnits = ($scope.desc.metalWeightUnit == 'Grams' && $scope.desc.metalWeight > 1) ? " that weighs " + $scope.desc.metalWeight + " grams" : ($scope.desc.metalWeightUnit == 'Grams' && $scope.desc.metalWeight <= 1) ?
                    ($scope.desc.metalWeight) ? " that weighs " + $scope.desc.metalWeight + " gram" : "" : ($scope.desc.metalWeight && $scope.desc.metalWeightUnit) ? " that weighs " + $scope.desc.metalWeight + " " + $scope.desc.metalWeightUnit : "";
                $scope.desc.metalLength = ($scope.Appraisal.Mounting.MetalLength) ? " " + $scope.Appraisal.Mounting.MetalLength : "";
                $scope.desc.metalWidth = ($scope.Appraisal.Mounting.MetalWidth) ? " " + $scope.Appraisal.Mounting.MetalWidth : "";


                /* if($scope.desc.metalType){


                     if($scope.desc.metalType.indexOf("10K")!=-1){
                         var index = $scope.desc.metalType.indexOf("10K") + 3;
                         $scope.desc.tempMetalType = $scope.desc.metalType.substr(0, index) + " gold" + $scope.desc.metalType.substr(index);

                         $scope.desc.metalType = $scope.desc.tempMetalType;
                     }

                     if($scope.desc.metalType.indexOf("18K")!=-1){
                         var index = $scope.desc.metalType.indexOf("18K") + 3;
                         $scope.desc.tempMetalType = $scope.desc.metalType.substr(0, index) + " gold" + $scope.desc.metalType.substr(index);

                         $scope.desc.metalType = $scope.desc.tempMetalType;

                     }

                     if($scope.desc.metalType.indexOf("14K")!=-1){
                         var index = $scope.desc.metalType.indexOf("14K") + 3;
                         $scope.desc.tempMetalType = $scope.desc.metalType.substr(0, index) + " gold" + $scope.desc.metalType.substr(index);

                         $scope.desc.metalType = $scope.desc.tempMetalType;

                     }

                     //$scope.desc.metalType.indexOf("20K")!=-1

                     if($scope.desc.metalType.indexOf("20K")!=-1){
                         var index = $scope.desc.metalType.indexOf("20K")+3;
                         $scope.desc.tempMetalType =  $scope.desc.metalType.substr(0, index) + " gold" + $scope.desc.metalType.substr(index);

                         $scope.desc.metalType = $scope.desc.tempMetalType;

                     }
                 }
                 */

            } else {
                $scope.desc.metalType = "";
                $scope.desc.metalColor = "";
                $scope.desc.metalWeight = "";
                $scope.desc.metalWeightUnit = "";
                $scope.desc.metalLength = "";
                $scope.desc.metalWidth = "";

            }




            //Chain
            if ($scope.Appraisal.Chain) {

                $scope.desc.chainType = ($scope.Appraisal.Chain.MetalType && $scope.Appraisal.Chain.MetalType.attributeValueId &&
                    getByFind($scope.Appraisal.Chain.MetalType.attributeValueId) &&
                    getByFind($scope.Appraisal.Chain.MetalType.attributeValueId) != "Other") ?
                    " " + getByFind($scope.Appraisal.Chain.MetalType.attributeValueId) + "" : "";

                $scope.desc.chainColor = ($scope.Appraisal.Chain.MetalColor && $scope.Appraisal.Chain.MetalColor.attributeValueId &&
                    getByFind($scope.Appraisal.Chain.MetalColor.attributeValueId) &&
                    getByFind($scope.Appraisal.Chain.MetalColor.attributeValueId) != "Other" &&
                    ($scope.desc.chainType != "Platinum" && $scope.desc.chainType != "Sterling Silver")) ?
                    " " + getByFind($scope.Appraisal.Chain.MetalColor.attributeValueId) + " gold" : "";


                $scope.desc.chainWeight = ($scope.Appraisal.Chain.MetalWeight && $scope.Appraisal.Chain.MetalWeight.weight) ? "" + $scope.Appraisal.Chain.MetalWeight.weight : "";
                $scope.desc.chainWeightUnit = ($scope.Appraisal.Chain.MetalWeight && $scope.Appraisal.Chain.MetalWeight.MetalUnit && $scope.Appraisal.Chain.MetalWeight.MetalUnit.attributeValueId) ? "" + getByFind($scope.Appraisal.Chain.MetalWeight.MetalUnit.attributeValueId) : "";



                $scope.desc.chainweightUnits = ($scope.desc.chainWeightUnit == 'Grams' && $scope.desc.chainWeight > 1) ? " weighing " + $scope.desc.chainWeight + " grams" : ($scope.desc.chainWeightUnit == 'Grams' && $scope.desc.chainWeight <= 1) ?
                    ($scope.desc.chainWeight) ? " weighing " + $scope.desc.chainWeight + " gram" : "" : ($scope.desc.chainWeight || $scope.desc.chainWeightUnit) ? " weighing " + $scope.desc.chainWeight + " " + $scope.desc.chainWeightUnit : "";

                $scope.desc.chainLength = ($scope.Appraisal.Chain.MetalLength) ? " " + $scope.Appraisal.Chain.MetalLength + " inch chain" : "";







            } else {
                $scope.desc.chainType = "";
                $scope.desc.chainColor = "";
                $scope.desc.chainWeight = "";
                $scope.desc.chainWeightUnit = "";
                $scope.desc.chainLength = "";


            }

            $scope.desc.settings = $scope.desc.settings + $scope.desc.metalType.charAt(0).toUpperCase() + $scope.desc.metalType.slice(1).toLowerCase() +
                $scope.desc.metalColor.toLowerCase() + $scope.desc.gender.toLowerCase() + $scope.desc.designer.toLowerCase() + $scope.desc.custom.toLowerCase() +
                $scope.desc.itemType.toLowerCase() + $scope.desc.itemCategory.toLowerCase() + $scope.desc.metalweightUnits + "";



            if ($scope.desc && checkAllFieldOfChain($scope.desc)) {

                $scope.desc.settings = $scope.desc.settings + " with" + $scope.desc.chainType.toLowerCase() +
                    $scope.desc.chainColor.toLowerCase() + $scope.desc.chainLength.toLowerCase() + $scope.desc.chainweightUnits.toLowerCase();

                settings
            }

            //only chain details

            if ($scope.desc.itemType == " Chain (No Stones)") {


                $scope.desc.chainType = ($scope.Appraisal.Chain.MetalType && $scope.Appraisal.Chain.MetalType.attributeValueId &&
                    getByFind($scope.Appraisal.Chain.MetalType.attributeValueId) &&
                    getByFind($scope.Appraisal.Chain.MetalType.attributeValueId) != "Other") ?
                    "" + getByFind($scope.Appraisal.Chain.MetalType.attributeValueId) + "" : "";

                $scope.desc.chainweightUnits = ($scope.desc.chainWeightUnit == 'Grams' && $scope.desc.chainWeight > 1) ? " that weighs " + $scope.desc.chainWeight + " grams" : ($scope.desc.chainWeightUnit == 'Grams' && $scope.desc.chainWeight <= 1) ?
                    ($scope.desc.chainWeight) ? " that weighs " + $scope.desc.chainWeight + " gram" : "" : ($scope.desc.chainWeight || $scope.desc.chainWeightUnit) ? " that weighs " + $scope.desc.chainWeight + " " + $scope.desc.chainWeightUnit : "";

                $scope.desc.chainLength = ($scope.Appraisal.Chain.MetalLength && $scope.Appraisal.Chain.MetalLength > 1) ? " and is " + $scope.Appraisal.Chain.MetalLength + " inches" : ($scope.Appraisal.Chain.MetalLength && $scope.Appraisal.Chain.MetalLength > 0) ?
                    " and is " + $scope.Appraisal.Chain.MetalLength + " inch" : "";


                $scope.desc.settings = $scope.desc.chainType.charAt(0).toUpperCase() + $scope.desc.chainType.slice(1).toLowerCase() +
                    $scope.desc.chainColor.toLowerCase() + $scope.desc.gender.toLowerCase() + $scope.desc.designer.toLowerCase() + $scope.desc.custom.toLowerCase() +
                    $scope.desc.itemType.toLowsettingserCase() + $scope.desc.itemCategory.toLowerCase() + $scope.desc.chainweightUnits.toLowerCase() + $scope.desc.chainLength.toLowerCase();

            }

            // $scope.desc.settings = $scope.desc.settings+$scope.desc.metalType.charAt(0).toUpperCase() + $scope.desc.metalType.slice(1).toLowerCase()+
            //                          $scope.desc.metalColor.toLowerCase()+$scope.desc.chainColor.toLowerCase()+ $scope.desc.gender.toLowerCase()+$scope.desc.designer.toLowerCase()+$scope.desc.custom.toLowerCase()+
            //                             $scope.desc.itemType.toLowerCase()+$scope.desc.itemCategory.toLowerCase()+ $scope.desc.metalweightUnits +$scope.desc.chainweightUnits + "";



            // $scope.desc.settings =  $scsettingsope.desc.settings+$scope.desc.metalType.toLowerCase()+
            //                             $scope.desc.metalColor.toLowerCase()+ $scope.desc.gender+$scope.desc.designer+$scope.desc.custom+
            //                             $scope.desc.itemType.toLowerCase()+$scope.desc.itemCategory.toLowerCase()+ $scope.desc.metalweightUnits + "";


            $scope.desc.settings = ($scope.desc.settings && $scope.desc.settings != "") ? $scope.desc.settings + ".\n" : ""

            //generate 1 line
            // $scope.desc.settings = $scope.desc.gender+" "+$scope.desc.designer+$scope.desc.custom+
            //                         $scope.desc.itemType.toLowerCase()+" "+$scope.desc.itemCategory.toLowerCase()+" "+$scope.desc.metalType.toLowerCase()+" "+
            //                         $scope.desc.metalColor.toLowerCase()+" "+$scope.desc.metalweightUnits + ".\n";






            $scope.desc.centerDiamonds = [];
            //CENTER STONE
            if (($scope.pairedDiamondItems && $scope.pairedDiamondItems.length > 1 && checkAllfieldsOfDiamond($scope.pairedDiamondItems)) ||
                ($scope.pairedGemstoneItems && $scope.pairedGemstoneItems.length > 1) && checkAllfieldsOfGemstone($scope.pairedGemstoneItems) ||
                (($scope.pairedGemstoneItems && $scope.pairedGemstoneItems.length > 0) && checkAllfieldsOfGemstone($scope.pairedGemstoneItems) &&
                    $scope.centerStone.diamond && checkAllfieldsOfDiamondNonArray($scope.centerStone.diamond)))
                $scope.desc.settings = $scope.desc.settings + "\nCenter Stones:\n";
            else
                // $scope.desc.settings = (($scope.centerStone.gemstone && $scope.centerStone.gemstone.quantity )||( $scope.centerStone.gemstone && $scope.centerStone.gemstone.id) ||
                //                         ($scope.centerStone.diamond && $scope.centerStone.diamond.id && checkAllfieldsOfDiamond)  ||
                //                         ($scope.centerStone.diamond && $scope.centerStone.diamond.caratWeight)
                //                         )
                //                         ?$scope.desc.settings+ "\nCenter Stone:\n":$scope.desc.settings+"";


                $scope.desc.settings = (($scope.centerStone.diamond && checkAllfieldsOfDiamondNonArray($scope.centerStone.diamond)) || ($scope.centerStone.gemstone && checkAllfieldsOfGemstoneNonArray($scope.centerStone.gemstone) || ($scope.pairedGemstoneItems && $scope.pairedGemstoneItems.length > 0) && checkAllfieldsOfGemstone($scope.pairedGemstoneItems))) ?
                    $scope.desc.settings + "\nCenter Stone:\n" : $scope.desc.settings + "";


            // center stone paired diamonds

            $scope.desc.pairedDiamonds = [];


            angular.forEach($scope.pairedDiamondItems, function (Item) {

                var descPairedDiamond = {};
                if (Item) {
                    descPairedDiamond.id = Item.id;
                    descPairedDiamond.quantity = (Item.quantity) ? "(" + Item.quantity + ") " : "";
                    descPairedDiamond.caratWeight = (Item.caratWeight) ? " weighing " + (Item.caratWeight > 1 ? Item.caratWeight + " carats" : Item.caratWeight + " carat ") : "";
                    descPairedDiamond.measurement1 = (Item.length) ? Item.length + "mm" : "";
                    descPairedDiamond.measurement2 = (Item.width) ? " X " + Item.width + "mm" : "";
                    descPairedDiamond.measurement3 = (Item.depth) ? " X " + Item.depth + "mm " : "";

                    descPairedDiamond.measurements = (Item.length && Item.width && Item.depth) ? " measuring " + Item.length + "-" + Item.width + "x" + Item.depth +
                        " mm " : (Item.length && Item.width) ? " measuring " + Item.length + "x" + Item.width + " mm " : (Item.length && Item.depth) ?
                            " measuring " + Item.length + "x" + Item.depth + " mm " : (Item.width && Item.depth) ? " measuring " + Item.width + "x" + Item.depth + " mm " : (Item.length) ?
                                " measuring " + Item.length + " mm " : (Item.width) ? " measuring " + Item.width + " mm " : (Item.depth) ? " measuring " + Item.depth + " mm " : "";

                    descPairedDiamond.shape = (Item.shape && Item.shape.attributeValueId) ? (Item.quantity && Item.quantity > 1) ? getByFind(Item.shape.attributeValueId) + " cut diamonds" : getByFind(Item.shape.attributeValueId) + " cut diamond" : "";
                    descPairedDiamond.colorFrom = (Item.colorFrom && Item.colorFrom.attributeValueId) ? " with " + getByFind(Item.colorFrom.attributeValueId) : "";
                    descPairedDiamond.colorTo = (Item.colorTo && Item.colorTo.attributeValueId) ? getByFind(Item.colorTo.attributeValueId) : "";


                    descPairedDiamond.clarityFrom = (Item.clarityFrom && Item.clarityFrom.attributeValueId) ? getByFind(Item.clarityFrom.attributeValueId) : "";
                    descPairedDiamond.clarityTo = (Item.clarityTo && Item.clarityTo.attributeValueId) ? getByFind(Item.clarityTo.attributeValueId) : "";




                    if (Item.cutGrade && Item.cutGrade.attributeValueId && getByFind(Item.cutGrade.attributeValueId) && getByFind(Item.cutGrade.attributeValueId) != "None") {

                        descPairedDiamond.color = (descPairedDiamond.colorFrom && descPairedDiamond.colorTo) ? descPairedDiamond.colorFrom + "-" + descPairedDiamond.colorTo + " color, " : (descPairedDiamond.colorFrom) ? descPairedDiamond.colorFrom + " color, " : "";

                        descPairedDiamond.clarity = (descPairedDiamond.clarityFrom && descPairedDiamond.clarityTo) ? (" " + descPairedDiamond.clarityFrom + "-" + descPairedDiamond.clarityTo + " clarity") : (descPairedDiamond.clarityFrom) ? " " + descPairedDiamond.clarityFrom + " clarity" : "";

                    } else {

                        descPairedDiamond.color = (descPairedDiamond.colorFrom && descPairedDiamond.colorTo) ? descPairedDiamond.colorFrom + "-" + descPairedDiamond.colorTo + " color " : (descPairedDiamond.colorFrom) ? descPairedDiamond.colorFrom + " color " : "";

                        descPairedDiamond.clarity = (descPairedDiamond.clarityFrom && descPairedDiamond.clarityTo) ? ("and " + descPairedDiamond.clarityFrom + "-" + descPairedDiamond.clarityTo + " clarity") : (descPairedDiamond.clarityFrom) ? " and " + descPairedDiamond.clarityFrom + " clarity" : "";


                    }




                    descPairedDiamond.cutGrade = (Item.cutGrade && Item.cutGrade.attributeValueId && getByFind(Item.cutGrade.attributeValueId) && getByFind(Item.cutGrade.attributeValueId) != "None") ? " and " + getByFind(Item.cutGrade.attributeValueId) + " cut grade" : "";

                    if (descPairedDiamond.cutGrade == "")
                        descPairedDiamond.gemlab = (Item.gemlab && Item.gemlab.attributeValueId) ? (getByFind(Item.gemlab.attributeValueId) != "NONE" && getByFind(Item.gemlab.attributeValueId) != "OTHER") ? " that is " + getByFind(Item.gemlab.attributeValueId) + " certified" : "" : "";
                    else
                        descPairedDiamond.gemlab = (descPairedDiamond.cutGrade) ? (Item.gemlab && Item.gemlab.attributeValueId) ? (getByFind(Item.gemlab.attributeValueId) != "NONE" && getByFind(Item.gemlab.attributeValueId) != "OTHER") ? " by " + getByFind(Item.gemlab.attributeValueId) + "" : "" : "" : "";

                    descPairedDiamond.certificateNumber = (Item.certificateNumber) ? " with the report number of " + Item.certificateNumber : ""

                }

                $scope.desc.pairedDiamonds.push(descPairedDiamond);

            });

            if ($scope.desc.pairedDiamonds && $scope.desc.pairedDiamonds.length > 1) {


                angular.forEach($scope.desc.pairedDiamonds, function (Item) {
                    var pairedDiamond = Item.shape.charAt(0).toUpperCase() + Item.shape.slice(1).toLowerCase() + Item.caratWeight.toLowerCase() + Item.measurements +
                        Item.color + Item.clarity +
                        Item.cutGrade.toLowerCase() + Item.gemlab + Item.certificateNumber;

                    $scope.desc.settings = (pairedDiamond != "" && pairedDiamond != " ") ? $scope.desc.settings + pairedDiamond + ".\n" : $scope.desc.settings + "";
                });



            }


            //center stone paired gemstones
            $scope.desc.pairedGemstones = [];
            //$scope.gemstoneItems
            angular.forEach($scope.pairedGemstoneItems, function (Item) {

                var descPairedGemstone = {};
                if (Item) {
                    descPairedGemstone.id = "(" + Item.id + ") ";
                    descPairedGemstone.type = (Item.type && Item.type.attributeValueId) ? getByFind(Item.type.attributeValueId) + "s " : "";
                    descPairedGemstone.stoneCount = (Item.quantity) ? "(" + Item.quantity + ") " : "";
                    //descPairedGemstone.weight = (Item.weight) ? ("weighing " +(Item.weight>1)? Item.weight+" carats total weight ":(Item.weight<=1)?Item.weight+" carat total weight ":"" ): "";

                    descPairedGemstone.weight = (Item.weight) ? " weighing " + (Item.weight > 1 ? Item.weight + " carats " : Item.weight + " carat ") : "";

                    descPairedGemstone.measurement1 = (Item.length) ? Item.length + "mm" : "";
                    descPairedGemstone.measurement2 = (Item.width) ? " X " + Item.width + "mm" : "";
                    descPairedGemstone.measurement3 = (Item.depth) ? " X " + Item.depth + "mm, " : "";


                    descPairedGemstone.measurements = (Item.length && Item.width && Item.depth) ? " measuring " + Item.length + "-" + Item.width + "x" + Item.depth +
                        " mm " : (Item.length && Item.width) ? " measuring " + Item.length + "x" + Item.width + " mm " : (Item.length && Item.depth) ?
                            " measuring " + Item.length + "x" + Item.depth + " mm " : (Item.width && Item.depth) ? " measuring " + Item.width + "x" + Item.depth + " mm " : (Item.length) ?
                                " measuring " + Item.length + " mm " : (Item.width) ? " measuring " + Item.width + " mm " : (Item.depth) ? " measuring " + Item.depth + " mm " : "";


                    descPairedGemstone.shape = (Item.shape && Item.shape.attributeValueId) ? getByFind(Item.shape.attributeValueId) + " cut " : "";
                    descPairedGemstone.quality = (Item.clarity && Item.clarity.attributeValueId && getByFind(Item.clarity.attributeValueId) &&
                        getByFind(Item.clarity.attributeValueId) != "None" &&
                        getByFind(Item.clarity.attributeValueId) != "Other") ?
                        "with " + getByFind(Item.clarity.attributeValueId) + " quality" : "";
                    descPairedGemstone.grade = (Item.grade && Item.grade.attributeValueId) ? getByFind(Item.grade.attributeValueId) + " Grade" : "";


                    descPairedGemstone.gemlab = (Item.gemlab && Item.gemlab.attributeValueId &&
                        getByFind(Item.gemlab.attributeValueId) &&
                        getByFind(Item.gemlab.attributeValueId) != "NONE" &&
                        getByFind(Item.gemlab.attributeValueId) != "OTHER") ?
                        " by " + getByFind(Item.gemlab.attributeValueId) : "";
                    // gemlab.attributeValueId
                    descPairedGemstone.certificateNumber = (Item.certificateNumber) ? " with the report number of " + Item.certificateNumber : ""

                }

                $scope.desc.pairedGemstones.push(descPairedGemstone);

            });

            if ($scope.desc.pairedGemstones && $scope.showPairedGemstone && $scope.desc.pairedGemstones.length > 0) {

                angular.forEach($scope.desc.pairedGemstones, function (Item) {
                    $scope.desc.settings
                    var paireGemstone = Item.shape.charAt(0).toUpperCase() + Item.shape.slice(1).toLowerCase() +
                        Item.type.toLowerCase() + Item.weight + Item.measurements + Item.quality + Item.gemlab + Item.certificateNumber;


                    $scope.desc.settings = (paireGemstone != "" && paireGemstone != " ") ? $scope.desc.settings + paireGemstone + ".\n" : $scope.desc.settings + "";
                });

            }



            // center diamond
            if ($scope.centerStone.diamond && checkAllfieldsOfDiamondNonArray($scope.centerStone.diamond)) {

                var Item = $scope.centerStone.diamond;
                var descCenterDiamond = {};
                if (Item) {
                    descCenterDiamond.id = Item.id;
                    descCenterDiamond.quantity = (Item.quantity) ? "(" + Item.quantity + ")" : "";
                    descCenterDiamond.caratWeight = (Item.caratWeight) ? " weighing " + (Item.caratWeight > 1 ? Item.caratWeight + " carats " : Item.caratWeight + " carat ") : "";
                    descCenterDiamond.measurement1 = (Item.length) ? Item.length + "mm" : "";
                    descCenterDiamond.measurement2 = (Item.width) ? " X " + Item.width + "mm" : "";
                    descCenterDiamond.measurement3 = (Item.depth) ? " X " + Item.depth + "mm " : "";


                    descCenterDiamond.measurements = (Item.length && Item.width && Item.depth) ? " measuring " + Item.length + "-" + Item.width + "x" + Item.depth +
                        " mm " : (Item.length && Item.width) ? " measuring " + Item.length + "x" + Item.width + " mm " : (Item.length && Item.depth) ?
                            " measuring " + Item.length + "x" + Item.depth + " mm " : (Item.width && Item.depth) ? " measuring " + Item.width + "x" + Item.depth + " mm " : (Item.length) ?
                                " measuring " + Item.length + " mm " : (Item.width) ? " measuring " + Item.width + " mm " : (Item.depth) ? " measuring " + Item.depth + " mm " : "";

                    if (Item.quantity > 1)
                        descCenterDiamond.shape = (Item.shape && Item.shape.attributeValueId) ? getByFind(Item.shape.attributeValueId) + " cut diamonds" : "";
                    else
                        descCenterDiamond.shape = (Item.shape && Item.shape.attributeValueId) ? getByFind(Item.shape.attributeValueId) + " cut diamond" : "";

                    descCenterDiamond.colorFrom = (Item.colorFrom && Item.colorFrom.attributeValueId) ? " with " + getByFind(Item.colorFrom.attributeValueId) : "";
                    descCenterDiamond.colorTo = (Item.colorTo && Item.colorTo.attributeValueId) ? getByFind(Item.colorTo.attributeValueId) : "";

                    descCenterDiamond.color = (descCenterDiamond.colorFrom && descCenterDiamond.colorTo) ? descCenterDiamond.colorFrom + "-" + descCenterDiamond.colorTo + " color " : (descCenterDiamond.colorFrom) ? descCenterDiamond.colorFrom + " color " : "";

                    descCenterDiamond.clarityFrom = (Item.clarityFrom && Item.clarityFrom.attributeValueId) ? getByFind(Item.clarityFrom.attributeValueId) : "";
                    descCenterDiamond.clarityTo = (Item.clarityTo && Item.clarityTo.attributeValueId) ? getByFind(Item.clarityTo.attributeValueId) : "";


                    descCenterDiamond.clarity = (descCenterDiamond.clarityFrom && descCenterDiamond.clarityTo) ? ("and " + descCenterDiamond.clarityFrom + "-" + descCenterDiamond.clarityTo + " clarity") : (descCenterDiamond.clarityFrom) ? "and " + descCenterDiamond.clarityFrom + " clarity" : "";


                    if (Item.cutGrade && Item.cutGrade.attributeValueId && getByFind(Item.cutGrade.attributeValueId) && getByFind(Item.cutGrade.attributeValueId) != "None") {

                        descCenterDiamond.color = (descCenterDiamond.colorFrom && descCenterDiamond.colorTo) ? descCenterDiamond.colorFrom + "-" + descCenterDiamond.colorTo + " color, " : (descCenterDiamond.colorFrom) ? descCenterDiamond.colorFrom + " color, " : "";

                        descCenterDiamond.clarity = (descCenterDiamond.clarityFrom && descCenterDiamond.clarityTo) ? (" " + descCenterDiamond.clarityFrom + "-" + descCenterDiamond.clarityTo + " clarity") : (descCenterDiamond.clarityFrom) ? " " + descCenterDiamond.clarityFrom + " clarity" : "";

                    } else {

                        descCenterDiamond.color = (descCenterDiamond.colorFrom && descCenterDiamond.colorTo) ? descCenterDiamond.colorFrom + "-" + descCenterDiamond.colorTo + " color " : (descCenterDiamond.colorFrom) ? descCenterDiamond.colorFrom + " color " : "";

                        descCenterDiamond.clarity = (descCenterDiamond.clarityFrom && descCenterDiamond.clarityTo) ? ("and " + descCenterDiamond.clarityFrom + "-" + descCenterDiamond.clarityTo + " clarity") : (descCenterDiamond.clarityFrom) ? " and " + descCenterDiamond.clarityFrom + " clarity" : "";


                    }
                    descCenterDiamond.cutGrade = (Item.cutGrade && Item.cutGrade.attributeValueId && getByFind(Item.cutGrade.attributeValueId) && getByFind(Item.cutGrade.attributeValueId) != "None") ? " and " + getByFind(Item.cutGrade.attributeValueId) + " cut grade" : "";

                    if (descCenterDiamond.cutGrade == "")
                        descCenterDiamond.gemlab = (Item.gemlab && Item.gemlab.attributeValueId && getByFind(Item.gemlab.attributeValueId) != "NONE" && getByFind(Item.gemlab.attributeValueId) != "OTHER") ? " that is " + getByFind(Item.gemlab.attributeValueId) + " certified" : "";
                    else
                        descCenterDiamond.gemlab = (descCenterDiamond.cutGrade && Item.gemlab && Item.gemlab.attributeValueId && getByFind(Item.gemlab.attributeValueId) != "NONE" && getByFind(Item.gemlab.attributeValueId) != "OTHER") ? " by " + getByFind(Item.gemlab.attributeValueId) : "";




                    descCenterDiamond.certificateNumber = (Item.certificateNumber) ? " with the report number of " + Item.certificateNumber : ""


                }

                $scope.desc.centerDiamonds.push(descCenterDiamond);

            }

            if ($scope.desc.centerDiamonds && $scope.desc.centerDiamonds.length > 0) {

                var cntrDiamond = $scope.desc.centerDiamonds[0];
                // if (cntrDiamond.quantity == "(2)") {
                //     $scope.desc.settings = $scope.desc.settings + "(2) ";
                // }

                angular.forEach($scope.desc.centerDiamonds, function (Item) {
                    var centerDiamnd = Item.shape.charAt(0).toUpperCase() + Item.shape.slice(1).toLowerCase() + Item.caratWeight.toLowerCase() + Item.measurements +
                        Item.color + Item.clarity +
                        Item.cutGrade.toLowerCase() + Item.gemlab + Item.certificateNumber;

                    if (cntrDiamond.quantity == "(2)" && centerDiamnd !== "" && centerDiamnd != " ") {
                        $scope.desc.settings = $scope.desc.settings + "(2) ";
                    }

                    var looseDimond = "";
                    if ($scope.showLooseDiamond) {
                        looseDimond = "Loose Diamond: ";
                        $scope.desc.settings = "";
                    }


                    $scope.desc.settings = (centerDiamnd !== "" && centerDiamnd != " ") ? $scope.desc.settings + looseDimond + centerDiamnd + ".\n" : $scope.desc.settings + "";
                });

            }

            //center gemstone

            $scope.desc.centerGemstones = [];

            //$scope.gemstoneItems
            if ($scope.centerStone.gemstone && checkAllfieldsOfGemstoneNonArray($scope.centerStone.gemstone)) {

                var Item = $scope.centerStone.gemstone;
                var descCenterGemstone = {};

                descCenterGemstone.id = "(" + Item.id + ") ";
                descCenterGemstone.type = (Item.type && Item.type.attributeValueId) ? getByFind(Item.type.attributeValueId) + " " : "";
                descCenterGemstone.stoneCount = (Item.quantity) ? "(" + Item.quantity + ")" : "";
                //descCenterGemstone.weight = (Item.weight) ? ("weighing " +(Item.weight>1)? Item.weight+" carats total weight ":(Item.weight<=1)?Item.weight+" carat total weight ":"" ): "";

                descCenterGemstone.weight = (Item.weight) ? " weighing " + (Item.weight > 1 ? Item.weight + " carats " : Item.weight + " carat ") : "";

                descCenterGemstone.measurement1 = (Item.length) ? Item.length + "mm" : "";
                descCenterGemstone.measurement2 = (Item.width) ? " X " + Item.width + "mm" : "";
                descCenterGemstone.measurement3 = (Item.depth) ? " X " + Item.depth + "mm, " : "";

                descCenterGemstone.measurements = (Item.length && Item.width && Item.depth) ? " measuring " + Item.length + "-" + Item.width + "x" + Item.depth +
                    " mm " : (Item.length && Item.width) ? " measuring " + Item.length + "x" + Item.width + " mm " : (Item.length && Item.depth) ?
                        " measuring " + Item.length + "x" + Item.depth + " mm " : (Item.width && Item.depth) ? " measuring " + Item.width + "x" + Item.depth + " mm " : (Item.length) ?
                            " measuring " + Item.length + " mm " : (Item.width) ? " measuring " + Item.width + " mm " : (Item.depth) ? " measuring " + Item.depth + " mm " : "";

                descCenterGemstone.shape = (Item.shape && Item.shape.attributeValueId) ? getByFind(Item.shape.attributeValueId) + " cut " : "";
                descCenterGemstone.quality = (Item.clarity && Item.clarity.attributeValueId && getByFind(Item.clarity.attributeValueId) &&
                    getByFind(Item.clarity.attributeValueId) != "None" &&
                    getByFind(Item.clarity.attributeValueId) != "Other") ? "with " + getByFind(Item.clarity.attributeValueId) + " quality" : "";

                descCenterGemstone.grade = (Item.grade && Item.grade.attributeValueId) ? getByFind(Item.grade.attributeValueId) + " Grade" : "";


                descCenterGemstone.gemlab = (Item.gemlab && Item.gemlab.attributeValueId &&
                    getByFind(Item.gemlab.attributeValueId) &&
                    getByFind(Item.gemlab.attributeValueId) != "NONE" &&
                    getByFind(Item.gemlab.attributeValueId) != "OTHER") ?
                    " by " + getByFind(Item.gemlab.attributeValueId) : "";

                descCenterGemstone.certificateNumber = (Item.certificateNumber) ? " with the report number of " + Item.certificateNumber : ""



                $scope.desc.centerGemstones.push(descCenterGemstone);

            }

            if ($scope.desc.centerGemstones && $scope.desc.centerGemstones.length > 0) {

                var cntrstone = $scope.desc.centerGemstones[0];

                angular.forEach($scope.desc.centerGemstones, function (Item) {
                    var centerGem = Item.shape.charAt(0).toUpperCase() + Item.shape.slice(1).toLowerCase() +
                        Item.type.toLowerCase() + Item.weight + Item.measurements + Item.quality + Item.gemlab + Item.certificateNumber;

                    if (cntrstone.stoneCount == "(2)" && centerGem != "" && centerGem != " ") {
                        $scope.desc.settings = $scope.desc.settings + "(2) ";
                    }

                    var looseGemstone = "";
                    if ($scope.showLooseGemstone) {
                        looseGemstone = "Loose Gemstone: ";
                        $scope.desc.settings = "";

                    }

                    $scope.desc.settings = (centerGem != "" && centerGem != " ") ? $scope.desc.settings + looseGemstone + centerGem + ".\n" : $scope.desc.settings + ""
                });

            }


            //side stones
            //diamond

            $scope.desc.diamonds = [];

            if (($scope.diamondItems && $scope.diamondItems.length > 1) ||
                ($scope.gemstoneItems && $scope.gemstoneItems.length > 1) || ($scope.diamondItems && $scope.gemstoneItems && $scope.diamondItems.length > 0 && $scope.gemstoneItems.length > 0))
                $scope.desc.settings = $scope.desc.settings + "\nSide Stones: \n";
            else
                $scope.desc.settings = (($scope.diamondItems && $scope.diamondItems.length > 0) ||
                    ($scope.gemstoneItems && $scope.gemstoneItems.length > 0)) ? $scope.desc.settings + "\nSide Stone: \n" : $scope.desc.settings + "";

            //diamond $scope.diamondItems
            angular.forEach($scope.diamondItems, function (Item) {

                var descDiamond = {};
                if (Item) {
                    descDiamond.id = Item.id;
                    descDiamond.quantity = (Item.quantity) ? "(" + Item.quantity + ") " : "";
                    descDiamond.caratWeight = (Item.caratWeight) ? " weighing " + (Item.caratWeight > 1 ? Item.caratWeight + " carats total weight " : Item.caratWeight + " carat total weight ") : "";
                    descDiamond.measurement1 = (Item.length) ? Item.length + "mm" : "";
                    descDiamond.measurement2 = (Item.width) ? " X " + Item.width + "mm" : "";
                    descDiamond.measurement3 = (Item.depth) ? " X " + Item.depth + "mm " : "";

                    descDiamond.measurements = (Item.length && Item.width && Item.depth) ? Item.length + "-" + Item.width + "x" + Item.depth +
                        " mm " : (Item.length && Item.width) ? Item.length + "x" + Item.width + " mm " : (Item.length && Item.depth) ?
                            Item.length + "x" + Item.depth + " mm " : (Item.width && Item.depth) ? Item.width + "x" + Item.depth + " mm " : (Item.length) ?
                                Item.length + " mm " : (Item.width) ? Item.width + " mm " : (Item.depth) ? Item.depth + " mm " : "";

                    descDiamond.shape = (Item.shape && Item.shape.attributeValueId) ? (Item.quantity && Item.quantity > 1) ? getByFind(Item.shape.attributeValueId) + " cut diamonds" : getByFind(Item.shape.attributeValueId) + " cut diamond" : "";
                    descDiamond.colorFrom = (Item.colorFrom && Item.colorFrom.attributeValueId) ? "with " + getByFind(Item.colorFrom.attributeValueId) : "";
                    descDiamond.colorTo = (Item.colorTo && Item.colorTo.attributeValueId) ? getByFind(Item.colorTo.attributeValueId) : "";

                    //descDiamond.color = (descDiamond.colorFrom && descDiamond.colorTo) ? descDiamond.colorFrom + "-" + descDiamond.colorTo + " color " : (descDiamond.colorFrom) ? descDiamond.colorFrom + " color " : "";

                    descDiamond.clarityFrom = (Item.clarityFrom && Item.clarityFrom.attributeValueId) ? getByFind(Item.clarityFrom.attributeValueId) : "";
                    descDiamond.clarityTo = (Item.clarityTo && Item.clarityTo.attributeValueId) ? getByFind(Item.clarityTo.attributeValueId) : "";


                    //descDiamond.clarity = (descDiamond.clarityFrom && descDiamond.clarityTo) ? ("and " + descDiamond.clarityFrom + "-" + descDiamond.clarityTo + " clarity") : (descDiamond.clarityFrom) ? "and " + descDiamond.clarityFrom + " clarity" : "";


                    if (Item.cutGrade && Item.cutGrade.attributeValueId && getByFind(Item.cutGrade.attributeValueId) && getByFind(Item.cutGrade.attributeValueId) != "None") {

                        descDiamond.color = (descDiamond.colorFrom && descDiamond.colorTo) ? descDiamond.colorFrom + "-" + descDiamond.colorTo + " color, " : (descDiamond.colorFrom) ? descDiamond.colorFrom + " color, " : "";

                        descDiamond.clarity = (descDiamond.clarityFrom && descDiamond.clarityTo) ? (" " + descDiamond.clarityFrom + "-" + descDiamond.clarityTo + " clarity") : (descDiamond.clarityFrom) ? " " + descDiamond.clarityFrom + " clarity" : "";

                    } else {

                        descDiamond.color = (descDiamond.colorFrom && descDiamond.colorTo) ? descDiamond.colorFrom + "-" + descDiamond.colorTo + " color " : (descDiamond.colorFrom) ? descDiamond.colorFrom + " color " : "";

                        descDiamond.clarity = (descDiamond.clarityFrom && descDiamond.clarityTo) ? ("and " + descDiamond.clarityFrom + "-" + descDiamond.clarityTo + " clarity") : (descDiamond.clarityFrom) ? " and " + descDiamond.clarityFrom + " clarity" : "";


                    }
                    descDiamond.cutGrade = (Item.cutGrade && Item.cutGrade.attributeValueId && getByFind(Item.cutGrade.attributeValueId) && getByFind(Item.cutGrade.attributeValueId) != "None") ? " and " + getByFind(Item.cutGrade.attributeValueId) + " cut grade " : "";
                    if (descDiamond.cutGrade == "")
                        descDiamond.gemlab = (Item.gemlab && Item.gemlab.attributeValueId) ? (getByFind(Item.gemlab.attributeValueId) != "NONE" && getByFind(Item.gemlab.attributeValueId) != "OTHER") ? " that is " + getByFind(Item.gemlab.attributeValueId) + " certified" : "" : "";
                    else
                        descDiamond.gemlab = (descDiamond.cutGrade) ? (Item.gemlab && Item.gemlab.attributeValueId) ? (getByFind(Item.gemlab.attributeValueId) != "NONE" && getByFind(Item.gemlab.attributeValueId) != "OTHER") ? "by " + getByFind(Item.gemlab.attributeValueId) + "" : "" : "" : "";


                }

                $scope.desc.diamonds.push(descDiamond);

            });


            if ($scope.desc.diamonds && $scope.desc.diamonds.length > 0) {


                angular.forEach($scope.desc.diamonds, function (Item) {
                    $scope.desc.settings = $scope.desc.settings + Item.quantity + Item.measurements + Item.shape.toLowerCase() + Item.caratWeight.toLowerCase() + Item.color + Item.clarity + Item.cutGrade.toLowerCase() + Item.gemlab + ".\n";
                });

            }


            //side stone gemstone
            $scope.desc.gemstones = [];
            //$scope.gemstoneItems
            angular.forEach($scope.gemstoneItems, function (Item) {

                var descGemstone = {};
                if (Item) {
                    descGemstone.id = "(" + Item.id + ") ";
                    descGemstone.type = (Item.type && Item.type.attributeValueId) ? (Item.quantity && Item.quantity > 1) ? getByFind(Item.type.attributeValueId) + "s " : getByFind(Item.type.attributeValueId) + " " : "";
                    descGemstone.stoneCount = (Item.quantity) ? "(" + Item.quantity + ") " : "";
                    //descGemstone.weight = (Item.weight) ? ("weighing " +(Item.weight>1)? Item.weight+" carats total weight ":(Item.weight<=1)?Item.weight+" carat total weight ":"" ): "";

                    descGemstone.weight = (Item.weight) ? " weighing " + (Item.weight > 1 ? Item.weight + " carats total weight " : Item.weight + " carat total weight ") : "";

                    descGemstone.measurement1 = (Item.length) ? Item.length + "mm" : "";
                    descGemstone.measurement2 = (Item.width) ? " X " + Item.width + "mm" : "";
                    descGemstone.measurement3 = (Item.depth) ? " X " + Item.depth + "mm, " : "";

                    descGemstone.measurements = (Item.length && Item.width && Item.depth) ? Item.length + "-" + Item.width + "x" + Item.depth +
                        " mm " : (Item.length && Item.width) ? Item.length + "x" + Item.width + " mm " : (Item.length && Item.depth) ?
                            Item.length + "x" + Item.depth + " mm " : (Item.width && Item.depth) ? Item.width + "x" + Item.depth + " mm " : (Item.length) ?
                                Item.length + " mm " : (Item.width) ? Item.width + " mm " : (Item.depth) ? Item.depth + " mm " : "";

                    descGemstone.shape = (Item.shape && Item.shape.attributeValueId) ? getByFind(Item.shape.attributeValueId) + " cut " : "";
                    descGemstone.quality = (Item.clarity && Item.clarity.attributeValueId) ? "with " + getByFind(Item.clarity.attributeValueId) + " quality" : "";
                    descGemstone.grade = (Item.grade && Item.grade.attributeValueId) ? getByFind(Item.grade.attributeValueId) + " Grade" : "";

                }

                $scope.desc.gemstones.push(descGemstone);

            });

            if ($scope.desc.gemstones && $scope.desc.gemstones.length > 0) {

                angular.forEach($scope.desc.gemstones, function (Item) {
                    $scope.desc.settings = $scope.desc.settings + Item.stoneCount + Item.measurements + Item.shape.toLowerCase() + Item.type.toLowerCase() + Item.weight + Item.quality + ".\n";
                });

            }

            // Wedding Band Item Starts
            //side stones
            //diamond
            $scope.wedDiamondDetails = [];
            $scope.wedGemstoneDetails = [];
            if ($scope.weddingItems && $scope.weddingItems.length > 0) {
                $scope.desc.settings = $scope.desc.settings + "\nWith:";
                angular.forEach($scope.weddingItems, function (data) {
                    $scope.desc.settings = $scope.desc.settings + "\nWedding band #" + data.id + "\n";

                    if (data.custom && data.custom.attributeValueId)
                        $scope.desc.weddingMountingCustom = getByFind(data.custom.attributeValueId) == "Yes" ? " custom made" : "";
                    else
                        $scope.desc.weddingMountingCustom = "";
                    if (data.designer && data.designer.attributeValueId)
                        $scope.desc.weddingMountingDesigner = getByFind(data.designer.attributeValueId) == "Yes" ? " designer brand" : "";
                    else
                        $scope.desc.weddingMountingDesigner = "";

                    $scope.desc.weddingMountingMetalType = (data.mounting.typeOfMetal && data.mounting.typeOfMetal.attributeValueId &&
                        getByFind(data.mounting.typeOfMetal.attributeValueId) &&
                        getByFind(data.mounting.typeOfMetal.attributeValueId) != "Other") ?
                        getByFind(data.mounting.typeOfMetal.attributeValueId) + "" : "";

                    $scope.desc.weddingMountingMetalColor = (data.mounting.metalColor && data.mounting.metalColor.attributeValueId &&
                        getByFind(data.mounting.metalColor.attributeValueId) &&
                        getByFind(data.mounting.metalColor.attributeValueId) != "Other" &&
                        getByFind(data.mounting.metalColor.attributeValueId) != "Two-Tone" &&
                        getByFind(data.mounting.metalColor.attributeValueId) != "Tri-Tone" &&
                        ($scope.desc.weddingMountingMetalType != "Platinum" && $scope.desc.weddingMountingMetalType != "Sterling Silver")) ?
                        " " + getByFind(data.mounting.metalColor.attributeValueId) + " gold" : "";

                    if (data.mounting.metalColor && data.mounting.metalColor.attributeValueId &&
                        getByFind(data.mounting.metalColor.attributeValueId) &&
                        (getByFind(data.mounting.metalColor.attributeValueId) == "Two-Tone" ||
                            getByFind(data.mounting.metalColor.attributeValueId) == "Tri-Tone")) {

                        $scope.desc.weddingMountingMetalColor = " " + getByFind(data.mounting.metalColor.attributeValueId)
                    }

                    $scope.desc.weddingMountingMetalWeight = data.mounting && data.mounting.metalWeight ? data.mounting.metalWeight : "";
                    $scope.desc.weddingMountingMetalWeightUnit = data.mounting && data.mounting.metalUnitWeight && data.mounting.metalUnitWeight.atttibuteValue ? data.mounting.metalUnitWeight.atttibuteValue : "";
                    $scope.desc.weddingMountingMetalWeightAndUnit = ($scope.desc.weddingMountingMetalWeightUnit == 'Grams' && $scope.desc.weddingMountingMetalWeight > 1) ? " that weighs " + $scope.desc.weddingMountingMetalWeight + " grams" : ($scope.desc.weddingMountingMetalWeightUnit == 'Grams' && $scope.desc.weddingMountingMetalWeight <= 1) ?
                        ($scope.desc.weddingMountingMetalWeight) ? " that weighs " + $scope.desc.weddingMountingMetalWeight + " gram" : "" : ($scope.desc.weddingMountingMetalWeight && $scope.desc.weddingMountingMetalWeightUnit) ? " that weighs " + $scope.desc.weddingMountingMetalWeight + " " + $scope.desc.weddingMountingMetalWeightUnit : "";
                    $scope.desc.weddingMountingMetalLength = (data.mounting && data.mounting.length) ? " " + data.mounting.length : "";
                    $scope.desc.weddingMountingMetalWidth = (data.mounting && data.mounting.width) ? " " + data.mounting.width : "";

                    //Speedcheck description for wedding band
                    $scope.desc.settings = $scope.desc.settings + $scope.desc.weddingMountingMetalType.toLowerCase() +
                        $scope.desc.weddingMountingMetalColor.toLowerCase() + $scope.desc.gender.toLowerCase() + $scope.desc.weddingMountingDesigner + $scope.desc.weddingMountingCustom + ' wedding band / anniversary ' +
                        $scope.desc.itemCategory.toLowerCase() + $scope.desc.weddingMountingMetalWeightAndUnit + "." + " " + '\n';

                    $scope.wedDiamondDetails = data.mounting.diamondDetails;
                    $scope.wedGemstoneDetails = data.mounting.stoneDetails;
                    $scope.desc.wedDiamonds = [];
                    if (($scope.wedGemstoneDetails && $scope.wedGemstoneDetails.length > 0 && checkAllfieldsOfGemstone($scope.wedGemstoneDetails)) || ($scope.wedDiamondDetails && $scope.wedDiamondDetails.length > 0 && checkAllfieldsOfDiamond($scope.wedDiamondDetails))) {
                        $scope.desc.settings = $scope.desc.settings + "\nSide Stone:\n";
                    }
                    angular.forEach($scope.wedDiamondDetails, function (Item) {
                        var descDiamond = {};
                        if (Item) {
                            descDiamond.id = Item.id;
                            descDiamond.quantity = (Item.quantity) ? "(" + Item.quantity + ") " : "";
                            descDiamond.caratWeight = (Item.caratWeight) ? " weighing " + (Item.caratWeight > 1 ? Item.caratWeight + " carats total weight " : Item.caratWeight + " carat total weight ") : "";
                            descDiamond.measurement1 = (Item.length) ? Item.length + "mm" : "";
                            descDiamond.measurement2 = (Item.width) ? " X " + Item.width + "mm" : "";
                            descDiamond.measurement3 = (Item.depth) ? " X " + Item.depth + "mm " : "";

                            descDiamond.measurements = (Item.length && Item.width && Item.depth) ? Item.length + "-" + Item.width + "x" + Item.depth +
                                " mm " : (Item.length && Item.width) ? Item.length + "x" + Item.width + " mm " : (Item.length && Item.depth) ?
                                    Item.length + "x" + Item.depth + " mm " : (Item.width && Item.depth) ? Item.width + "x" + Item.depth + " mm " : (Item.length) ?
                                        Item.length + " mm " : (Item.width) ? Item.width + " mm " : (Item.depth) ? Item.depth + " mm " : "";

                            descDiamond.shape = (Item.shape && Item.shape.attributeValueId) ? (Item.quantity && Item.quantity > 1) ? getByFind(Item.shape.attributeValueId) + " cut diamonds" : getByFind(Item.shape.attributeValueId) + " cut diamond" : "";
                            descDiamond.colorFrom = (Item.colorFrom && Item.colorFrom.attributeValueId) ? "with " + getByFind(Item.colorFrom.attributeValueId) : "";
                            descDiamond.colorTo = (Item.colorTo && Item.colorTo.attributeValueId) ? getByFind(Item.colorTo.attributeValueId) : "";

                            //descDiamond.color = (descDiamond.colorFrom && descDiamond.colorTo) ? descDiamond.colorFrom + "-" + descDiamond.colorTo + " color " : (descDiamond.colorFrom) ? descDiamond.colorFrom + " color " : "";

                            descDiamond.clarityFrom = (Item.clarityFrom && Item.clarityFrom.attributeValueId) ? getByFind(Item.clarityFrom.attributeValueId) : "";
                            descDiamond.clarityTo = (Item.clarityTo && Item.clarityTo.attributeValueId) ? getByFind(Item.clarityTo.attributeValueId) : "";


                            //descDiamond.clarity = (descDiamond.clarityFrom && descDiamond.clarityTo) ? ("and " + descDiamond.clarityFrom + "-" + descDiamond.clarityTo + " clarity") : (descDiamond.clarityFrom) ? "and " + descDiamond.clarityFrom + " clarity" : "";


                            if (Item.cutGrade && Item.cutGrade.attributeValueId && getByFind(Item.cutGrade.attributeValueId) && getByFind(Item.cutGrade.attributeValueId) != "None") {

                                descDiamond.color = (descDiamond.colorFrom && descDiamond.colorTo) ? descDiamond.colorFrom + "-" + descDiamond.colorTo + " color, " : (descDiamond.colorFrom) ? descDiamond.colorFrom + " color, " : "";

                                descDiamond.clarity = (descDiamond.clarityFrom && descDiamond.clarityTo) ? (" " + descDiamond.clarityFrom + "-" + descDiamond.clarityTo + " clarity") : (descDiamond.clarityFrom) ? " " + descDiamond.clarityFrom + " clarity" : "";

                            } else {

                                descDiamond.color = (descDiamond.colorFrom && descDiamond.colorTo) ? descDiamond.colorFrom + "-" + descDiamond.colorTo + " color " : (descDiamond.colorFrom) ? descDiamond.colorFrom + " color " : "";

                                descDiamond.clarity = (descDiamond.clarityFrom && descDiamond.clarityTo) ? ("and " + descDiamond.clarityFrom + "-" + descDiamond.clarityTo + " clarity") : (descDiamond.clarityFrom) ? " and " + descDiamond.clarityFrom + " clarity" : "";


                            }
                            descDiamond.cutGrade = (Item.cutGrade && Item.cutGrade.attributeValueId && getByFind(Item.cutGrade.attributeValueId) && getByFind(Item.cutGrade.attributeValueId) != "None") ? " and " + getByFind(Item.cutGrade.attributeValueId) + " cut grade " : "";
                            if (descDiamond.cutGrade == "")
                                descDiamond.gemlab = (Item.gemlab && Item.gemlab.attributeValueId) ? (getByFind(Item.gemlab.attributeValueId) != "NONE" && getByFind(Item.gemlab.attributeValueId) != "OTHER") ? " that is " + getByFind(Item.gemlab.attributeValueId) + " certified" : "" : "";
                            else
                                descDiamond.gemlab = (descDiamond.cutGrade) ? (Item.gemlab && Item.gemlab.attributeValueId) ? (getByFind(Item.gemlab.attributeValueId) != "NONE" && getByFind(Item.gemlab.attributeValueId) != "OTHER") ? "by " + getByFind(Item.gemlab.attributeValueId) + "" : "" : "" : "";


                        }
                        $scope.desc.wedDiamonds.push(descDiamond);
                    });

                    if ($scope.desc.wedDiamonds && $scope.desc.wedDiamonds.length > 0 && checkAllfieldsOfDiamond($scope.desc.wedDiamonds)) {
                        angular.forEach($scope.desc.wedDiamonds, function (Item) {
                            $scope.desc.settings = $scope.desc.settings + Item.quantity + Item.measurements + Item.shape.toLowerCase() + Item.caratWeight.toLowerCase() + Item.color + Item.clarity + Item.cutGrade.toLowerCase() + Item.gemlab + ".\n";
                        });

                    }


                    //Gemstone Details
                    $scope.desc.wedGemstones = [];
                    angular.forEach($scope.wedGemstoneDetails, function (Item) {
                        var descGemstone = {};
                        if (Item) {
                            descGemstone.id = "(" + Item.id + ") ";
                            descGemstone.type = (Item.type && Item.type.attributeValueId) ? (Item.quantity && Item.quantity > 1) ? getByFind(Item.type.attributeValueId) + "s " : getByFind(Item.type.attributeValueId) + " " : "";
                            descGemstone.stoneCount = (Item.quantity) ? "(" + Item.quantity + ") " : "";
                            //descGemstone.weight = (Item.weight) ? ("weighing " +(Item.weight>1)? Item.weight+" carats total weight ":(Item.weight<=1)?Item.weight+" carat total weight ":"" ): "";

                            descGemstone.weight = (Item.weight) ? " weighing " + (Item.weight > 1 ? Item.weight + " carats total weight " : Item.weight + " carat total weight ") : "";

                            descGemstone.measurement1 = (Item.length) ? Item.length + "mm" : "";
                            descGemstone.measurement2 = (Item.width) ? " X " + Item.width + "mm" : "";
                            descGemstone.measurement3 = (Item.depth) ? " X " + Item.depth + "mm, " : "";

                            descGemstone.measurements = (Item.length && Item.width && Item.depth) ? Item.length + "-" + Item.width + "x" + Item.depth +
                                " mm " : (Item.length && Item.width) ? Item.length + "x" + Item.width + " mm " : (Item.length && Item.depth) ?
                                    Item.length + "x" + Item.depth + " mm " : (Item.width && Item.depth) ? Item.width + "x" + Item.depth + " mm " : (Item.length) ?
                                        Item.length + " mm " : (Item.width) ? Item.width + " mm " : (Item.depth) ? Item.depth + " mm " : "";

                            descGemstone.shape = (Item.shape && Item.shape.attributeValueId) ? getByFind(Item.shape.attributeValueId) + " cut " : "";
                            descGemstone.quality = (Item.clarity && Item.clarity.attributeValueId) ? "with " + getByFind(Item.clarity.attributeValueId) + " quality" : "";
                            descGemstone.grade = (Item.grade && Item.grade.attributeValueId) ? getByFind(Item.grade.attributeValueId) + " Grade" : "";

                        }

                        $scope.desc.wedGemstones.push(descGemstone);

                    });

                    if ($scope.desc.wedGemstones && $scope.desc.wedGemstones.length > 0 && checkAllfieldsOfGemstone($scope.desc.wedGemstones)) {

                        angular.forEach($scope.desc.wedGemstones, function (Item) {
                            $scope.desc.settings = $scope.desc.settings + Item.stoneCount + Item.measurements + Item.shape.toLowerCase() + Item.type.toLowerCase() + Item.weight + Item.quality + ".\n";
                        });

                    }

                });

            }

            // Wedding Band Item Ends

            if (!$scope.desc.itemCategory) {
                $scope.desc.settings = "";
                $scope.pdfDesc = [];
            }

            //$scope.desc.settings = $scope.desc.settings+ "\n"+"Disclaimer:\n";
            //var comment = "Artigem has identified a new replacement value of your item based off current market conditions. The valuation is derived by entering the attributes that affect value into software to compile the new replacement value including sales tax. This value is calculated by market averages and adding 20-25% for potential market price fluctuations and possible limited availability. While the actual cost to replace may be less than the appraised value, it is important to protect against these scenarios. Artigem does not warrant the value as the item was not inspected. ";

            $scope.desc.settings = $scope.desc.settings + "\n";

            /*var apprasialDateValueDetails = "";
            if($scope.Appraisal.AppraisalDate){
                apprasialDateValueDetails = "The above appraisal description and values are based off of the information from the original appraisal dated "+$scope.Appraisal.AppraisalDate+" and valued at "+$filter('currency')(parseFloat($scope.Appraisal.AppraisalValue))+"."
            }else{
                apprasialDateValueDetails = "The above appraisal description and values are based off of the information from the original appraisal valued at "+$filter('currency')(parseFloat($scope.Appraisal.AppraisalValue))+".";
            }*/


            $scope.desc.settings = $scope.desc.settings + $scope.desc.insuranceReplacementCost + "\n\n" +
                $scope.desc.todaysDate;

            /*$scope.desc.settings = $scope.desc.settings + $scope.desc.insuranceReplacementCost + "\n\n" +
                $scope.desc.todaysDate + "\n\n" + $scope.desc.originalAppraisalValue + "\n\n" +
                $scope.desc.originalAppraisalDate;*/

            $scope.pdfDesc = ($scope.desc.settings != null && $scope.desc.settings != "") ? $scope.desc.settings.split("\n") : [];

            $scope.desclaimer = "Artigem has identified a new replacement value of your item based off current market conditions. The valuation is derived by entering the attributes that affect value into software to compile the new replacement value including sales tax. This value is calculated by market averages and adding 20-25% for potential market price fluctuations and possible limited availability. While the actual cost to replace may be less than the appraised value, it is important to protect against these scenarios. Artigem does not warrant the value as the item was not inspected. ";

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
                    //$scope.showAdditionalDiamond = true;

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


            // && angular.isDefined($scope.Appraisal.Mounting.MetalColor) && $scope.Appraisal.Mounting.MetalWeight != null
            if ($scope.Appraisal.Mounting) {
                mountingDetails = {

                    "metalWeight": ($scope.Appraisal.Mounting.MetalWeight)?$scope.Appraisal.Mounting.MetalWeight.weight:"",
                    "metalUnitWeight": ($scope.Appraisal.Mounting.MetalWeight)?$scope.Appraisal.Mounting.MetalWeight.MetalUnit:"",
                    "length": $scope.Appraisal.Mounting.MetalLength,
                    "width": $scope.Appraisal.Mounting.MetalWidth,
                    //check
                    "metalUnitWeight": ($scope.Appraisal.Mounting.MetalWeight)?$scope.Appraisal.Mounting.MetalWeight.MetalUnit:"",
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
                "speedcheckAppraisalDate": $scope.speedcheckSubmitDate !== null && angular.isDefined($scope.speedcheckSubmitDate) ? formatDate($scope.speedcheckSubmitDate) : null,

                "centreStoneType": ($scope.Appraisal.centeredStone) ? $scope.Appraisal.centeredStone.type : null,
                "chainExists": ($scope.Appraisal.Chain) ? $scope.Appraisal.Chain.isChain : null,

                "speedCheckVendorRegNumber" : sessionStorage.getItem("speedCheckVendor")
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
            var promis = AppraisalService.SaveAppraisal(data);
            promis.then(function (success) {
                $rootScope.ApprisalFormPristine = false;
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
                getAppraisalDetails();
                $scope.IsSpeedCheckDisabled = false;
                $scope.IsSaveDisabled = false;
                if($scope.breadcrumFlag){
                    $scope.breadcrumFlag = false;
                    $location.path('/PolicyDetail');
                }
                toastr.remove();
                toastr.success("The appraisal # " + sessionStorage.getItem("AppraisalNo") + " is saved successfully", "Confirmation");
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

            if($rootScope.ApprisalFormPristine == true)
            {
                $scope.speedcheckSubmitDate = new Date();
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


                "newInsurancePremiumCost": $scope.Appraisal.newInsurancePremiumCost != 'NaN'? $scope.Appraisal.newInsurancePremiumCost : null ,
                "oldInsurancePremiumCost": $scope.Appraisal.oldInsurancePremiumCost ? $scope.Appraisal.oldInsurancePremiumCost : null ,
                //"attachments" : appraisalDocuments
                "deletedAttachments": $scope.deletedAttachmentList,
                //speedcheck values
                "sc_salvageValue": $scope.totalSalvageCost,
                "sc_jwelersCost": $scope.totalJeweleryCost,
                "sc_artigemReplacementValue": $scope.totalArtigemReplacementCost,
                "sc_insuranceReplacementValue": isNaN($scope.totalInsuranceReplacementCost)?0.00:$scope.totalInsuranceReplacementCost,
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
                "speedcheckAppraisalDate":!!$scope.speedcheckSubmitDate ? formatDate($scope.speedcheckSubmitDate): null,

                "centreStoneType": ($scope.Appraisal.centeredStone) ? $scope.Appraisal.centeredStone.type : null,
                "chainExists": ($scope.Appraisal.Chain) ? $scope.Appraisal.Chain.isChain : null,

                "speedCheckVendorRegNumber" : sessionStorage.getItem("speedCheckVendor")
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
            var promis = AppraisalService.UpdateAppraisal(data);
            promis.then(function (success) {
                $rootScope.ApprisalFormPristine = false;
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
                    $scope.getAppraisalDetails();
                }, 100);
                // if($scope.breadcrumFlag){
                //     $scope.breadcrumFlag = false;
                //     $location.path('/PolicyDetail');
                // }
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
                //$scope.Appraisal.ItemCategory = {};
                //$scope.Appraisal.ItemType = {};    
                if($scope.Appraisal.ItemCategory)
                $scope.Appraisal.ItemCategory.attributeValueId = "";

                if($scope.Appraisal.ItemType)
                $scope.Appraisal.ItemType.attributeValueTypeId = "";            
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
            $scope.summaryGrandTotal=0;
            $scope.costSalesTax=0;
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

            $scope.Appraisal.newInsurancePremiumCost = 0;
            $scope.totalInsuranceReplacementCost = 0;            

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

            $scope.desc.settings = "";
            $scope.decslaimer = "";

            $scope.isWeddingBand=false;
            $scope.showMountingandSetting=false;
            $scope.isPearl=false;
            $scope.showLooseDiamond=false;
            $scope.showLooseGemstone=false;
            $scope.showChainandSetting=false;
            $scope.showChain=false;
            $scope.showCenteredStone=false;
            $scope.showCenteredStoneEarring=false;
            $scope.showMainStone=false;
            $scope.showLoosePearl=false;
            $scope.showSpeedcheckInfo=false;

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
                            var promis = AppraisalService.deleteAppraisal(param);
                            promis.then(function (success) {
                                $rootScope.ApprisalFormPristine = false;
                                toastr.remove()
                                toastr.success(success.data.message);
                                $scope.Appraisal = {};
                                $scope.Desc.description = "";
                                $scope.ApprisalOrderAddEdit = false;
                                $scope.IsEditOrder = false;
                                // toastr.remove()
                                // toastr.success("The valuable " + $scope.Appraisal.appraisalNumber + " was deleted successfully", "Confirmation");
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
            var updateAppraisal = AppraisalService.updateAppraisalStatus(details);
            updateAppraisal.then(function (success) {
                $rootScope.ApprisalFormPristine = false;
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

        //get Policy HolderDetails
        $scope.GetPolicyHolderDetails = GetPolicyHolderDetails;
        function GetPolicyHolderDetails() {
            //$(".page-spinner-bar").removeClass("hide");
            var param = {
                "id": sessionStorage.getItem("policyNumber"),
                "AgentId": sessionStorage.getItem("UserId"),
                "Role": sessionStorage.getItem("UserType")
            }
            var getDetails = InsuranceAgentHomeService.getPolicyDetailsById(param);
            getDetails.then(function (success) {
                $scope.PolicyholderDetails = success.data.PolicyHolderDetails;
                $scope.premiumValue = $scope.PolicyholderDetails.address.state.premiumValueWrtState
                $scope.primaryPolicyHolderFullName = $scope.PolicyholderDetails.primaryPolicyHolderLname + ', ' + $scope.PolicyholderDetails.primaryPolicyHolderFname;

                if (isNullData($scope.PolicyholderDetails.secondaryPolicyHolderFname) && isNullData($scope.PolicyholderDetails.secondaryPolicyHolderLname)) {
                    $scope.isNotSecondaryName = false;
                    $scope.secondaryPHName = "";
                } else if (!isNullData($scope.PolicyholderDetails.secondaryPolicyHolderLname) && isNullData($scope.PolicyholderDetails.secondaryPolicyHolderFname)) {
                    $scope.isNotSecondaryName = true;
                    $scope.secondaryPHName = $scope.PolicyholderDetails.secondaryPolicyHolderLname;
                } else if (isNullData($scope.PolicyholderDetails.secondaryPolicyHolderLname) && !isNullData($scope.PolicyholderDetails.secondaryPolicyHolderFname)) {
                    $scope.isNotSecondaryName = true;
                    $scope.secondaryPHName = $scope.PolicyholderDetails.secondaryPolicyHolderFname;
                } else {
                    $scope.isNotSecondaryName = true;
                    $scope.secondaryPHName = $scope.PolicyholderDetails.secondaryPolicyHolderLname + ', ' + $scope.PolicyholderDetails.secondaryPolicyHolderFname;
                }

                $scope.secondaryPhone = "";
                if (isNullData($scope.PolicyholderDetails.secondaryPolicyHolderCellphoneNo)) {
                    $scope.isNotSecondaryPhone = false;
                    $scope.secondaryPhone = "";
                } else {
                    $scope.isNotSecondaryPhone = true;
                    $scope.secondaryPhone = $scope.PolicyholderDetails.secondaryPolicyHolderCellphoneNo;
                }

                $scope.secEmailId = "";
                if (isNullData($scope.PolicyholderDetails.secondaryPolicyHolderEmailId)) {
                    $scope.isNotSecondaryEmail = false;
                    $scope.secEmailId = "";
                } else {
                    $scope.isNotSecondaryEmail = true;
                    $scope.secEmailId = $scope.PolicyholderDetails.secondaryPolicyHolderEmailId;
                }

                var fullEffectiveDate = $scope.PolicyholderDetails.policyEffectiveDate;
                var effectiveDate = fullEffectiveDate.split(' ')[0];
                var fullRenewalDate = $scope.PolicyholderDetails.policyRenewalDate;
                var renewalDate = fullRenewalDate.split(' ')[0];
                $scope.policyCurrentTerm = effectiveDate + ' to ' + renewalDate;
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
            formFlag();
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
                        var size = file.size;
                        var name = file.name.split('.');

                        if(isFileNameValid(name[0])){              
                            if(size <= 20000000){
                                var reader = new FileReader();
                                reader.file = file;
                                reader.fileName = files[i].name;
                                reader.fileType = files[i].type;
                                reader.fileExtension = files[i].name.substr(files[i].name.lastIndexOf('.'));
                                reader.onload = $scope.LoadFileInList;
                                reader.readAsDataURL(file);
                                $scope.showAttachmentErro = false;

                            }else{
                                toastr.remove()
                                toastr.error("File size exceeded . Please upload image below 20Mb", $translate.instant("File Size")); 
                                
                            }
                        }else{
                            toastr.remove()
                            toastr.warning("File name should contains only alphabates, numbers, space and only special characters underscore(_), hyphen(-) or ampersand(&)", $translate.instant("File Name")); 
                            
                        }
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
                            var promiseResponse = AppraisalService.deteleAttachment(url);
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

        $scope.RemoveAttachment = RemoveAttachment;
        function RemoveAttachment(index) {
            $("#FileUpload1").val('');
            $scope.deleted = $scope.attachmentList[index];
            var msg = "Are you sure you want to delete the attachment " + $scope.deleted.fileName + "?";
            if ($scope.attachmentList.length > 0) {
                bootbox.confirm({
                    size: "",
                    title: "Delete Attachment",
                    message: msg,
                    closeButton: false,
                    className: "modalcustom",
                    buttons: {
                        confirm: {
                            label: "Delete",
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
                                if($scope.deleted.isLocal){
                                    // Remove from local - Soft delete for new added file which is not saved yet 
                                    if (angular.isDefined($scope.deleted.url)) {
                                        $scope.deletedAttachmentList.push($scope.deleted.url);
                                    }
                                    $scope.attachmentList.splice(index, 1);
                                    toastr.remove();
                                    toastr.success("The attachment " + $scope.deleted.fileName + " was deleted successfully.", "Confirmation"); 
                                }else{
                                    // Remove from DB - Hard delete for already added file
                                    var promiseResponse = AppraisalService.deteleAttachment($scope.deleted.url);
                                    promiseResponse.then(function (data) {
                                        $scope.attachmentList.splice(index, 1);
                                        toastr.remove();
                                        toastr.success("The attachment " + $scope.deleted.fileName + " was deleted successfully.", "Confirmation");
                                        //location.reload();
                                    }, function (error) {
                                        $(".page-spinner-bar").addClass("hide");
                                        toastr.remove();
                                        toastr.error('Error while Deletting attachment.', "Error");
                                    });
                                }
                                
                            });
                        }
                    }
                });               

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
                    "sc_insuranceReplacementValue": isNaN($scope.totalInsuranceReplacementCost) ? 0.00 : $scope.totalInsuranceReplacementCost ,
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
                    "speedcheckAppraisalDate": $scope.speedcheckSubmitDate !== null && angular.isDefined($scope.speedcheckSubmitDate) ? formatDate($scope.speedcheckSubmitDate) : null,

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
                    "sc_insuranceReplacementValue": isNaN($scope.totalInsuranceReplacementCost) ? 0.00 : $scope.totalInsuranceReplacementCost ,
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
                    "speedcheckAppraisalDate": $scope.speedcheckSubmitDate !== null && angular.isDefined($scope.speedcheckSubmitDate) ? formatDate($scope.speedcheckSubmitDate) : null,
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
                    "speedcheckAppraisalDate": $scope.speedcheckSubmitDate !== null && angular.isDefined($scope.speedcheckSubmitDate) ? formatDate($scope.speedcheckSubmitDate) : null,

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
                    "sc_insuranceReplacementValue": isNaN($scope.totalInsuranceReplacementCost)?0.00:$scope.totalInsuranceReplacementCost,
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
                    "speedcheckAppraisalDate": !!$scope.speedcheckSubmitDate ? formatDate($scope.speedcheckSubmitDate) : null,
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
                    "sc_insuranceReplacementValue": isNaN($scope.totalInsuranceReplacementCost) ? 0.00 : $scope.totalInsuranceReplacementCost,
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
                    "speedcheckAppraisalDate": $scope.speedcheckSubmitDate !== null && angular.isDefined($scope.speedcheckSubmitDate) ? formatDate($scope.speedcheckSubmitDate): null,

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

        function AddArtigemReviewRecommendPopup(isAttributeZeroCheck) {
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
                "sc_insuranceReplacementValue": isNaN($scope.totalInsuranceReplacementCost) ? 0.00 :$scope.totalInsuranceReplacementCost,
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
                "speedcheckAppraisalDate": $scope.speedcheckSubmitDate !== null && angular.isDefined($scope.speedcheckSubmitDate) ? formatDate($scope.speedcheckSubmitDate): null,

                "centreStoneType": ($scope.Appraisal.centeredStone) ? $scope.Appraisal.centeredStone.type : null,
                "chainExists": ($scope.Appraisal.Chain) ? $scope.Appraisal.Chain.isChain : null,
                "isAttributeZeroCheck":isAttributeZeroCheck

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

            if (param!=undefined  && param != 5) {

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
        $scope.isPdf = function (fileName) {
            if (/\.(pdf|PDF)$/i.test(fileName.toLowerCase())) {
                return true;
            }
        }
        
        $scope.isExcel = function (fileName) {
            if (/\.(xls|xlsx)$/i.test(fileName.toLowerCase())) {
                return true;
            }
        }
        
        $scope.isImage = function (fileName) {
            if (/\.(jpe?g|png|gif|bmp)$/i.test(fileName.toLowerCase())) {
                return true;
            }
        }

        $scope.isDocx = function (fileName) {
            if (/\.(docx|doc)$/i.test(fileName.toLowerCase())) {
                return true;
            }
        }

        $scope.isVideo = function (fileName) {
            if (/\.(mp4|flv|ogg|3gp|webm)$/i.test(fileName.toLowerCase())) {
                return true;
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
                            var promiseResponse = AppraisalService.deteleAttachment(url);
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
            var oldCost = roundOf2Decimal((values / 1000) * 12);
            // var updatedOldCost = oldCost * 12;
            $scope.updatedValue = oldCost;
        }

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
            var getAvgCount = AppraisalService.getAvgStoneCount(param);
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
            var getAvgCount = AppraisalService.getAvgStoneCount(param);
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
            var getAvgCount = AppraisalService.getAvgStoneCount(param);
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
            var getAvgCount = AppraisalService.getAvgStoneCount(param);
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
            var getSettingValue = AppraisalService.getAppSettingValues();
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

        $scope.getSubcriptionDetails = getSubcriptionDetails;
        function getSubcriptionDetails() {
            //$(".page-spinner-bar").removeClass("hide");
            var param = {
                type: "speedcheck"
            }
            var subscription = ContractService.getSpeedCheckSubscriptionInfo(param);
            subscription.then(function (success) {
                $scope.subscriptionInfo = success && success.data ? success.data.data : null;
                if ($scope.subscriptionInfo != null) {
                    $scope.subscriptionInfo.billingContact = $filter('constructName')($scope.subscriptionInfo.billedTo.firstName, $scope.subscriptionInfo.billedTo.lastName);
                }
                
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
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

        $scope.GoToPolicyDetails = GoToPolicyDetails;
        function GoToPolicyDetails() {
            var flag = $rootScope.ApprisalFormPristine;
            sessionStorage.setItem("nextPage","policyDetails");
            confirmBeforeChangindPage();
            if(!flag)
            $location.path('/PolicyDetail');
            // confirmBeforeChangindPage();
            // console.log("GoToPolicyDetails")
            //$location.path('/PolicyDetail');
        }

        $scope.getRapnetDiamondPrice = getRapnetDiamondPrice;
        function getRapnetDiamondPrice() {
            $(".page-spinner-bar").addClass("hide");
            var centerDiamonds = [];
            var centerDiamond = {};
            if ($scope.centerStone.diamond || ($scope.pairedDiamondItems && $scope.pairedDiamondItems.length > 1)) {
                angular.forEach($scope.AppraisalDropdowns, function (Item) {
                    angular.forEach(Item.attributeValue, function (subItem) {
                        tempDropdowns.push(subItem);
                    });
                });
                var dColor = "";
                var dClarity = "";
                var dCutGrade = "";
                var dGemlab = "";
                var dShape = "";
                var dClarityMax = "";
                var dColorMax = "";
                var shapes = [], labs = [];
                var colorTemp = "", claritytemp = "", cutGradetemp = "", gemLabTemp = "", shapeTemp = "";
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
                        //dCutGrade = $scope.cutGradeMap[cutGradetemp[0].atttibuteValue];
                        dCutGrade = cutGradetemp[0].atttibuteValue;
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
                        labs.push(dGemlab);
                    centerDiamond.shape = dShape,
                        shapes.push(dShape);
                    centerDiamond.quantity = Item.quantity;
                    centerDiamond.maxColor = dColorMax,
                        centerDiamond.maxClarity = dClarityMax,
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
                        dCutGrade = cutGradetemp[0].atttibuteValue;
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
                            // dCutGrade = $scope.cutGradeMap[cutGradetemp[0].atttibuteValue];
                            dCutGrade = cutGradetemp[0].atttibuteValue;
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
            var postURL = "https://technet.rapaport.com/HTTP/JSON/RetailFeed/GetDiamonds.aspx"
            //Request body
            var param = {
                "request": {
                    "header": {
                        "username": "42029C",
                        "password": "cobillas321"
                    },
                    "body": {
                        "search_type": "White",
                        "shapes": shapes,
                        "labs": labs,
                        "size_from": parseFloat(centerDiamond.caratWeight - (0.2 * (centerDiamond.caratWeight))).toFixed(2),
                        "size_to": parseFloat(centerDiamond.caratWeight + (0.2 * (centerDiamond.caratWeight))).toFixed(2),
                        "color_from": centerDiamond.color,
                        "color_to": centerDiamond.maxColor,
                        "clarity_from": centerDiamond.clarity,
                        "clarity_to": centerDiamond.maxClarity,
                        //"cut_from": "Very Good",
                        "cut_to": centerDiamond.cutGrade,
                        "page_number": "1",
                        "page_size": "100",
                        "sort_by": "price",
                        "sort_direction": "Asc"
                    }
                }
            }
            var diamondPrice = AppraisalService.getRapnetDiamondPrice(param, postURL);
            diamondPrice.then(function (success) {
                console.log(diamondPrice);
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
                $(".page-spinner-bar").addClass("hide");
            });
        }
        $scope.formFlag = formFlag;
        function formFlag(){
            $rootScope.ApprisalFormPristine = true;
        }
        $rootScope.UpdateApprisal = function() {
            $scope.breadcrumFlag = true;
            if(sessionStorage.getItem("isEditAppraisal") == "true")
            UpdateApprisal();
            else
            saveApprisal();
        }
        
        $scope.confirmBeforeChangindPage = confirmBeforeChangindPage;
        function confirmBeforeChangindPage(){
            var flag = $rootScope.ApprisalFormPristine;
            if(flag){
            bootbox.confirm({
                size: "",
                title: "Need to save changes",
                message: "Changes made by you have not been saved. Would you like to save them?", closeButton: false,
                className: "modalcustom", buttons: {
                    confirm: {
                        label: "Yes, save changes",
                        className: 'btn-success'
                    },
                    cancel: {
                        label: "No, I am okay",
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    if (result) {
                        
                        $rootScope.UpdateApprisal();
                        
                    }
                    $rootScope.ApprisalFormPristine = false;
                    if(sessionStorage.getItem("nextPage") == "policyDetails"){
                        $scope.$apply(function () {
                            $location.path('/PolicyDetail');
                        });
                    }
                        else if(sessionStorage.getItem("nextPage") == "note"){
                            //GetNotes();
                            $scope.tab = 'Notes';
                            $rootScope.$emit("CallNotesInitMethod", {});
                        }
                        else if(sessionStorage.getItem("nextPage") == "activityLog"){
                            $scope.tab = 'ActivityLog';
                            $scope.limit = 50;
                            $scope.moreShown = false;
                            getActivityLog();
                            $scope.showBell = false;
                        }
                        else if(sessionStorage.getItem("nextPage") == "home"){
                            sessionStorage.removeItem("currentTab");
                            $location.path('/InsuranceAgent');
                        }
                }
            })
        }
        }

        function formatDate(input)
        {
            input = input.toString()
            if(input.charAt(input.length-1)==='Z' && input.match('T')){
            input = input?.replace("T"," ");
            input = input?.replace("Z","");
            }
            input = new Date(input);
            var string = "";
            string= Number(input.getMonth()+1)+"-"+input.getDate()+"-"+input.getFullYear()+"T"+convertSingleDigittoDouble(input.getHours())+":"+convertSingleDigittoDouble(input.getMinutes())+":"+convertSingleDigittoDouble(input.getSeconds())+"Z";
            return string;
        }

        function formatDatetoDisplay(input)
        {
            input = input.toString()
            if(input.charAt(input.length-1)==='Z' && input.match('T')){
            input = input?.replace("T"," ");
            input = input?.replace("Z","");
            }
            input = new Date(input);
            var string = "";
            string= Number(input.getMonth()+1)+"/"+input.getDate()+"/"+input.getFullYear();
            return string;
        }

        function convertSingleDigittoDouble(digit)
        {
            if(digit.toString().length==1)
            {
                digit = "0"+digit;
            }
            return digit;
        }

        /* Validate file attachment Name -  Allow only Num(0-9), alphabates(a to z / A to Z) and special chars( underscore_ and hyphen -) */
        function isFileNameValid(strNm){
            var regexp = /^[a-zA-Z0-9&_-]+(?:\s+[a-zA-Z0-9&_-]+)*$/;
            // /^[a-zA-Z0-9-_]+*$/;
            if((strNm == undefined || strNm ==null || strNm=="")){
                return false;
            }else{
                if(strNm.search(regexp) === -1){ 
                    return false;
                }else{
                    return true;
                }
            }             
        }

    });