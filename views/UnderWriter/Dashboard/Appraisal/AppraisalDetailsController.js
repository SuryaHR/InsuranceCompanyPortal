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

    .controller('AppraisalDetailsController', function ($http, $rootScope, $scope, settings, $location, $translate, $translatePartialLoader, $window,
        $filter, InsuranceAgentHomeService, AuthHeaderService, AppraisalService, InsuranceAgentReviewService, $uibModal) {
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
        $scope.isEditAppraisal = false;
        $scope.ApprisalOrderAddEdit = true;
        $scope.ApprisalList = [];
        $scope.MyLength;
        $scope.Desc = { "description": "" }

        var details = {};

        $scope.files = [];

        $scope.attachmentList = [];
        $scope.attachmentEditList = [];

        $scope.showAttachmentErro = false;
        var stoneDetails = [];
        $scope.showChain = false;
        $scope.showPearl = false;

        $scope.showMountingandSetting = true;

        //Accent stone
        $scope.showAccentDiamond = false;
        $scope.showAccentGemstone = false;

        //Centered stone
        $scope.showCenteredStone = false;
        $scope.showCenteredDiamond = false;

        //Loose stone
        $scope.showLooseDiamond = false;
        $scope.showLooseGemstone = false;

        //chain and settings
        $scope.showChainandSetting = false;

        $scope.centerStone = {};
        $scope.centerStone.diamond = {};
        $scope.centerStone.gemstone = {};

        $scope.scDiamondEstimateTotal = 0;
        $scope.scStoneEstimateTotal = 0;

        $scope.totalAccentWeddingbandDiamonds =0.0;
        $scope.totalAccentWeddingbandGemstones =0.0;

        $scope.scPairedDiamondEstimateTotal = 0;
        $scope.scPairedStoneEstimateTotal = 0;

        $scope.itemTypeValue = "";
        $scope.itemCategoryValue = "";

        $scope.estimateText = '';
        $scope.isUpload = true;
        $scope.isUploaded = false;

        $scope.showLoosePearl = false;
        $scope.isPearlStrand = false;

        //for earring pearl
        $scope.showCenteredStoneEarring = false;
        $scope.showCenteredDiamondEarring = false;
        $scope.showCenteredGemstoneEarring = false;
        $scope.showPairedDiamondEarring = false;
        $scope.showPairedGemstoneEarring = false;

        $scope.pdfDesc = [];

        $scope.Appraisal =
            {
                "metalcolor": "",
                "shapes": "",
                "Quantity": "",
                "shapes": ""
            };

        $scope.Desc.description = "";
        $scope.AppraisalDropdowns = [];
        $scope.diamond = {};
        $scope.Appraisal = {};
        $scope.Appraisal.Chain = {}

        $scope.costSalesTax = 0;
        $scope.summaryGrandTotal = 0;

        $scope.init = init;
        function init() {
            $(".page-spinner-bar").removeClass("hide");
            getAppraisalDetails();

            var GetGlobaldata = $http.get('Config/Configuration.json');
            GetGlobaldata.then(function (success) {
                ConfigSettings = success.data.data;
                $scope.serverAddress = ConfigSettings.serverAddress;
            });
        }
        init();

        /* Start - OnClick of Note notification on dashboard, Notes tab will display*/
        function notesTabDisplay(){            
            if(sessionStorage.getItem("IsNoteNotification")=="true"){
                $scope.showNotes();
                sessionStorage.setItem("IsNoteNotification",false);
            }
        }
        notesTabDisplay();
        /* End */

        //ng-repeat Diamond and Gemstone details

        //DIAMONDS
        $scope.Appraisal.diamonds = [];
        $scope.diamondItems = [];
        // adding new diamond slabs
        $scope.diamondItems = [{
            id: '1',
            removeButton: false
        }];

        $scope.addNewDiamondItem = addNewDiamondItem;
        function addNewDiamondItem() {
            var newItemNo = $scope.diamondItems.length + 1;
            $scope.diamondItems.push({
                'id': newItemNo,
                'removeButton': true
            });
        };

        $scope.removeDiamond = removeDiamond;
        function removeDiamond() {
            var lastItem = $scope.diamondItems.length - 1;
            $scope.diamondItems.splice(lastItem);
        };

        $scope.removeThisDiamond = function (index) {
            $scope.diamondItems.splice(index, 1);
        };


        // GEMSTONES
        $scope.Appraisal.gemstones = [];
        // adding new gemstone slabs
        $scope.gemstoneItems = [{
            id: '1',
            removeButton: false
        }];

        $scope.addNewGemstone = function () {
            var newItemNo = $scope.gemstoneItems.length + 1;
            $scope.gemstoneItems.push({
                'id': newItemNo,
                'removeButton': true
            });
        };

        $scope.removeGemstone = function () {
            var lastItem = $scope.gemstoneItems - 1;
            $scope.gemstoneItems.splice(lastItem);
        };

        $scope.removeThisGemstone = function (index) {
            $scope.gemstoneItems.splice(index, 1);
        };


        //Save & Update Apprisal premium
        $scope.updateApprisalInsurancePremium = updateApprisalInsurancePremium;
        function updateApprisalInsurancePremium() {
            $(".page-spinner-bar").removeClass("hide");

            var param = {
                "userId": sessionStorage.getItem("UserId"),
                "appraisalId": sessionStorage.getItem("appraisalId"),
                "role": "UNDERWRITER",
                "approved": true,
                "rejected": false,
                "newInsurancePremiumCost": ($scope.Appraisal.newInsurancePremiumCost &&  !isNaN($scope.Appraisal.newInsurancePremiumCost))?$scope.Appraisal.newInsurancePremiumCost:0.00,
                "oldInsurancePremiumCost": ($scope.Appraisal.oldInsurancePremiumCost &&  !isNaN($scope.Appraisal.oldInsurancePremiumCost))?$scope.Appraisal.oldInsurancePremiumCost:0.00
            };

            var promis = AppraisalService.updateInsurancePremium(param)
            promis.then(function (success) {
                toastr.remove();
                toastr.success("The appraisal was approved at a coverage of " + $filter('currency')($scope.Appraisal.newInsurancePremiumCost) + " and sent to agent for review.", "Confirmation");
                $location.path('/UnderWriter');
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                toastr.remove();
                $(".page-spinner-bar").addClass("hide");
                if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                    toastr.error(error.data.errorMessage, "Error")
                }
                else {
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
                }
            });
        }

        //reset filters
        $scope.ClearFilters = ClearFilters;
        function ClearFilters() {
            $scope.Appraisal.ItemType = {};
            $scope.Appraisal.Gender = {};
            $scope.Appraisal.Custom = {};
            $scope.Appraisal.Designer = {};


            $scope.Appraisal.Mounting = {};
            $scope.Appraisal.Mounting.MetalWeight = {};

            $scope.centerStone = {};

            $scope.pairedDiamondItems = [];

            $scope.pairedGemstoneItems = [];

            $scope.Appraisal.Watch = {};


            $scope.desc.settings = "";

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


        }


        // getPolicy Details
        $scope.populatePolicyDetails = populatePolicyDetails;
        function populatePolicyDetails(policyDetails) {
            var policyData = policyDetails;
            var policyEffectiveDate = $filter('DateFormatMMddyyyy')(policyData.policyEffectiveDate);
            var policyRenewalDate = $filter('DateFormatMMddyyyy')(policyData.policyRenewalDate);

            if (isNullData(policyData.secondaryPolicyHolderFname) && isNullData(policyData.secondaryPolicyHolderLname)) {
                $scope.isNotSecondaryName = false;
                $scope.secondaryPHName = "";
            } else if (!isNullData(policyData.secondaryPolicyHolderLname) && isNullData(policyData.secondaryPolicyHolderFname)) {
                $scope.isNotSecondaryName = true;
                $scope.secondaryPHName = policyData.secondaryPolicyHolderLname;
            } else if (isNullData(policyData.secondaryPolicyHolderLname) && !isNullData(policyData.secondaryPolicyHolderFname)) {
                $scope.isNotSecondaryName = true;
                $scope.secondaryPHName = policyData.secondaryPolicyHolderFname;
            } else {
                $scope.isNotSecondaryName = true;
                $scope.secondaryPHName = policyData.secondaryPolicyHolderLname + ', ' + policyData.secondaryPolicyHolderFname;
            }

            $scope.secondaryPhone = "";
            if (isNullData(policyData.secondaryPolicyHolderCellphoneNo)) {
                $scope.isNotSecondaryPhone = false;
                $scope.secondaryPhone = "";
            } else {
                $scope.isNotSecondaryPhone = true;
                $scope.secondaryPhone = policyData.secondaryPolicyHolderCellphoneNo;
            }

            $scope.secEmailId = "";
            if (isNullData(policyData.secondaryPolicyHolderEmailId)) {
                $scope.isNotSecondaryEmail = false;
                $scope.secEmailId = "";
            } else {
                $scope.isNotSecondaryEmail = true;
                $scope.secEmailId = policyData.secondaryPolicyHolderEmailId;
            }


            $scope.PolicyDetails = {
                "policyNumber": policyData.policyNumber,
                "primaryPolicyholder": policyData.primaryPolicyHolderLname + ", " + policyData.primaryPolicyHolderFname,
                "primaryPolicyHolderLname": policyData.primaryPolicyHolderLname,
                "primaryPolicyHolderFname": policyData.primaryPolicyHolderFname,
                "phoneNumber": policyData.primaryPolicyHolderCellphoneNo,
                "emailId": policyData.primaryPolicyHolderEmailId,
                "streetAddress1": policyData.streetAddressOne,
                "streetAddress2": policyData.streetAddressTwo,
                "cityTown": policyData.city,
                "state": policyData.stateName,
                "zipCode": policyData.zipcode,
                "currentTerm": policyEffectiveDate + " to " + policyRenewalDate,
                "secondaryName": $scope.secondaryPHName,
                "completeAddress": policyData.streetAddressOne + ", " + policyData.streetAddressTwo + ", " + policyData.city + ", " + policyData.state.state + ", " + policyData.zipcode,
                "secondaryPolicyHolderEmailId": $scope.secEmailId,
                "secondaryPhoneNumber": $scope.secondaryPhone
            }
            //for further use store into session
            sessionStorage.setItem("id", policyData.id);
            sessionStorage.setItem("policyId", policyData.policyId);
            sessionStorage.setItem("policyNumber", policyData.policyNumber);
            sessionStorage.setItem("primaryPolicyholder", policyData.primaryPolicyHolderLname + " , " + policyData.primaryPolicyHolderFname);
            sessionStorage.setItem("primaryPolicyHolderLname", policyData.primaryPolicyHolderLname);
            sessionStorage.setItem("primaryPolicyHolderFname", policyData.primaryPolicyHolderFname);
            sessionStorage.setItem("secondaryPolicyHolderName", $scope.secondaryPHName);
            sessionStorage.setItem("zipcode", policyData.zipcode);
            sessionStorage.setItem("primaryPolicyHolderCellphoneNo", policyData.primaryPolicyHolderCellphoneNo);
            sessionStorage.setItem("primaryPolicyHolderEmailId", policyData.primaryPolicyHolderEmailId);
            sessionStorage.setItem("policyEffectiveDate", policyEffectiveDate);
            sessionStorage.setItem("streetAddressOne", policyData.streetAddressOne);
            sessionStorage.setItem("streetAddressTwo", policyData.streetAddressTwo);
            sessionStorage.setItem("city", policyData.city);
            sessionStorage.setItem("stateName", policyData.stateName);
            sessionStorage.setItem("completeAddress", $scope.PolicyDetails.completeAddress);

            //$scope.FilteredOffice = success.data.data;
            //$(".page-spinner-bar").addClass("hide");
        }

        //getAppraisalDetails_BKUP
        $scope.getAppraisalDetails = getAppraisalDetails;
        function getAppraisalDetails() {
            $(".page-spinner-bar").removeClass("hide");

            $scope.IsEditOrder = true;
            $scope.companyName = sessionStorage.getItem("InsuranceCompanyName");
            var param = {
                "appraisalId": sessionStorage.getItem("appraisalId"),
                "agentId": sessionStorage.getItem("UserId"),
                "role": "UNDERWRITER"
            }
            
            var details = AppraisalService.getAppraisal(param);
            details.then(function (success) {

                $(".page-spinner-bar").removeClass("hide");
                if (success.data.data.appraisalDataDTO.underWriterReviewStatus != 1) {
                    $scope.isEditAppraisal = true;
                }

                if (!success.data.data.appraisalDataDTO.active) {
                    $scope.isDisable = true;
                } else {
                    $scope.isDisable = false;
                }

                if (sessionStorage.getItem("approvedList") == "true") {
                    $scope.showPrint = true;
                    sessionStorage.setItem("approvedList", true);
                }

                var appraisalDetails = success.data.data.appraisalDataDTO;


                var applicationSettingValueDTO = appraisalDetails && appraisalDetails.applicationSettingValueDTO ? appraisalDetails.applicationSettingValueDTO: null ;

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

                //polpulate policyholder details
                populatePolicyDetails(appraisalDetails.policyholderDetails);

                $scope.Comparables = appraisalDetails;

                $scope.appraisalCurrentStatus = appraisalDetails.status.status;

                sessionStorage.setItem("appraisalNumber", appraisalDetails.appraisalNumber);
                var mounting = {};
                var MetalWeight = {};
                var chainDetails = {};

                $scope.desc = {};

                $scope.desc.settings = appraisalDetails.speedcheckResultDescription;
                $scope.pdfDesc = ($scope.desc.settings != null && $scope.desc.settings != "") ? $scope.desc.settings.split("\n") : [];
                $scope.summaryTotal = appraisalDetails.summaryTotal;


                $scope.chainExists = appraisalDetails.chainExists;

                if (appraisalDetails.itemCategory.atttibuteValue === 'Watch') {
                    $scope.isType = false;
                    if (appraisalDetails.watchDetails) {
                        $scope.summaryTotal = appraisalDetails.watchDetails.totalWatchEstimation;
                    }
                } else {
                    $scope.isType = true;
                }

                // var MetalType = ;
                mounting.MetalType = appraisalDetails.mountingDetails.typeOfMetal;
                mounting.MetalColor = appraisalDetails.mountingDetails.metalColor;
                MetalWeight.weight = appraisalDetails.mountingDetails.metalWeight;
                MetalWeight.MetalUnit = appraisalDetails.mountingDetails.metalUnitWeight;

                mounting.MetalWeight = MetalWeight;

                mounting.MetalLength = appraisalDetails.mountingDetails.length;
                mounting.MetalWidth = appraisalDetails.mountingDetails.width;

                mounting.id = appraisalDetails.mountingDetails.id;

                //chain
                //$scope.Appraisal.Chain = appraisalDetails.chainDetails;
                //console.log($scope.Appraisal.chain);

                // chainDetails
                chainDetails = appraisalDetails.chainDetails;
                //$scope.showChain = chainDetails.id !=null ? true : false;

                //console.log(chainDetails);

                var accentDiamondsTotal = 0;
                $scope.diamondItems = appraisalDetails.mountingDetails.diamondDetails;
                angular.forEach($scope.diamondItems, function (item) {
                    if (item.scDiamondEstimate == null || item.scDiamondEstimate == 0) {
                        item.scDiamondEstimate = "0.0";
                    } else {
                        var roundVal = roundOf2Decimal(item.scDiamondEstimate);
                        accentDiamondsTotal += parseFloat(roundVal);
                        item.scDiamondEstimate = roundVal;
                    }
                });
                $scope.accentDiamondsTotal = accentDiamondsTotal;

                var accentGemstonesTotal = 0;
                $scope.gemstoneItems = appraisalDetails.mountingDetails.stoneDetails;
                angular.forEach($scope.gemstoneItems, function (item) {
                    if (item.scStoneEstimate == null || item.scStoneEstimate == 0) {
                        item.scStoneEstimate = "0.0";
                    } else {
                        var roundVal = roundOf2Decimal(item.scStoneEstimate);
                        accentGemstonesTotal += parseFloat(roundVal);
                        item.scStoneEstimate = roundVal;
                    }
                });
                $scope.accentGemstonesTotal = accentGemstonesTotal;

                if(appraisalDetails.weddingBandExists){
                   $scope.isWedding = appraisalDetails.weddingBandExists;
                   $scope.weddingItems = appraisalDetails.weddingBandDetails;
                }else{
                   $scope.isWedding = appraisalDetails.weddingBandExists;
                }

                $scope.isWeddingDiamond = false;
                $scope.isWeddingStone = false;
                $scope.totalSetting = 0.0;
                //var total = 0;
                $scope.wbandSettingTotal = 0.0;
                $scope.totalWeddingBandGemstoneTotal = 0.0;
                $scope.totalWeddingBandDiamondTotal = 0.0;

                if (appraisalDetails.weddingBandDetails && appraisalDetails.weddingBandDetails.length > 0) {
                    angular.forEach(appraisalDetails.weddingBandDetails, function(data) {
                    var totalValue = data.mounting.scMountingEstimates ? parseFloat(data.mounting.scMountingEstimates):0.0;
                    $scope.wbandSettingTotal += parseFloat(totalValue);
                    //total += parseFloat(totalValue);

                    //DimondTotal
                    var diamondTotal = data.sc_totalWeddingBandDiamondsEstimate ? parseFloat(data.sc_totalWeddingBandDiamondsEstimate):0.0;
                    $scope.totalWeddingBandDiamondTotal += parseFloat(diamondTotal);

                    //StoneTotal
                    var stoneTotal = data.sc_totalWeddingBandGemstonesEstimate ? parseFloat(data.sc_totalWeddingBandGemstonesEstimate):0.0;
                    $scope.totalWeddingBandGemstoneTotal += parseFloat(stoneTotal);

                     if(data.mounting && data.mounting.diamondDetails && data.mounting.diamondDetails.length > 0 ){
                      $scope.isWeddingDiamond = true;
                     }
                     if(data.mounting && data.mounting.stoneDetails && data.mounting.stoneDetails.length > 0 ){
                      $scope.isWeddingStone = true;
                     }
                  });
                }

                var itemCatagoryId = null;
                var itemTypeId = null;

                if (appraisalDetails.itemCategory) {
                    itemCatagoryId = appraisalDetails.itemCategory.attributeValueId;
                    $scope.itemCategoryValue = appraisalDetails.itemCategory.atttibuteValue;
                }
                if (appraisalDetails.type) {
                    if (appraisalDetails.itemCategory.attributeValueId != 149 &&
                        appraisalDetails.itemCategory.attributeValueId != 150) {

                        $scope.itemTypeValue = appraisalDetails.type.atttibuteType
                        itemTypeId = appraisalDetails.type.attributeValueTypeId;
                    }
                }


                //ring id=7
                if (itemCatagoryId == 7 && (itemTypeId != null || itemTypeId != "undefined")) {
                    // var itemTypebyId = getByFindType(itemType);
                    if ($scope.itemTypeValue == "Diamond Solitaire" || itemTypeId == 1) {
                        //show centered stone type options drop down
                        $scope.showCenteredStone = true;
                        $scope.showCenteredDiamond = true;
                        //weddingBandDetails
                        $scope.isWeddingBand = appraisalDetails.weddingBandExists;
                    } else if ($scope.itemTypeValue == "Engagement" || itemTypeId == 2) {
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

                        //weddingBandDetails
                        $scope.isWeddingBand = appraisalDetails.weddingBandExists;

                    } else if ($scope.itemTypeValue == "Wedding Band / Anniversary" || itemTypeId == 3) {
                        //accent stones
                        $scope.showAccentDiamond = true;
                        $scope.showAccentGemstone = true;
                        $scope.moreDiamonds = true;
                        $scope.moreGemstones = true;
                    } else if ($scope.itemTypeValue == "Colored Gemstone" || itemTypeId == 4) {
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
                    } else if ($scope.itemTypeValue == "Pearl" || itemTypeId == 25) {
                        $scope.showPearl = true;
                        $scope.isPearl = true;

                        $scope.showAccentDiamond = true;
                        $scope.showAccentGemstone = true;
                        $scope.moreDiamonds = true;
                        $scope.moreGemstones = true;

                        $scope.showTypeOption = true;
                        $scope.showCenteredDiamond = false;
                        $scope.showCenteredGemstone = false;
                        $scope.showCenteredStone = true;
                    } else if ($scope.itemTypeValue == "Fashion" || itemTypeId == 28) {

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

                    } else {

                    }
                }

                //bracelets id=8
                else if (itemCatagoryId == 8 && (itemTypeId != null || itemTypeId != "undefined")) {
                    if ($scope.itemTypeValue == "Bangle" || itemTypeId == 5) {
                        //accent stones
                        $scope.showAccentDiamond = true;
                        $scope.showAccentGemstone = true;
                        $scope.moreDiamonds = true;
                        $scope.moreGemstones = true;
                    } else if ($scope.itemTypeValue == "Diamond Tennis" || itemTypeId == 6) {
                        //accent stones
                        $scope.showAccentDiamond = true;
                        $scope.moreDiamonds = true;
                    } else if ($scope.itemTypeValue == "Diamond Gemstone Tennis" || itemTypeId == 7) {
                        //accent stones
                        $scope.showAccentDiamond = true;
                        $scope.showAccentGemstone = true;
                        $scope.moreDiamonds = true;
                        $scope.moreGemstones = true;
                    } else if ($scope.itemTypeValue == "Chain (No Stones)" || itemTypeId == 8) {
                        $scope.showChainandSetting = true;
                        $scope.showMountingandSetting = false;
                    } else if ($scope.itemTypeValue == "Pearl Strand" || itemTypeId == 24) {
                        $scope.showPearl = true;
                        $scope.isPearl = true;
                        $scope.isPearlStrand = true;


                        //accent stones
                        $scope.showAccentDiamond = true;
                        $scope.showAccentGemstone = true;
                        $scope.moreDiamonds = true;
                        $scope.moreGemstones = true;
                    } else {

                    }
                }

                //Necklaces id=9
                else if (itemCatagoryId == 9 && (itemTypeId != null || itemTypeId != "undefined")) {
                    if ($scope.itemTypeValue == "Diamond Solitaire" || itemTypeId == 9) {
                        //show centered stone type options drop down
                        $scope.showCenteredStone = true;
                        $scope.showCenteredDiamond = true;

                        //chain details
                        $scope.showChain = true;
                        //$scope.Appraisal.Chain.isChain = 6
                    } else if ($scope.itemTypeValue == "Diamond Fashion" || itemTypeId == 10) {
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
                        //$scope.Appraisal.Chain.isChain = 6
                    } else if ($scope.itemTypeValue == "Diamond Tennis Necklace" || itemTypeId == 11) {
                        //accent stones
                        $scope.showAccentDiamond = true;
                        $scope.moreDiamonds = true;
                    } else if ($scope.itemTypeValue == "Colored Gemstone" || itemTypeId == 12) {
                        //show centered stone type options drop down
                        $scope.showTypeOption = true;
                        $scope.showCenteredStone = true;

                        //chain details
                        $scope.showChain = true;
                        //$scope.Appraisal.Chain.isChain = 6;
                    }//Chain (No Stones)
                    else if ($scope.itemTypeValue == "Chain (No Stones)" || itemTypeId == 21) {
                        $scope.showChainandSetting = true;
                        $scope.showMountingandSetting = false;
                    } else if ($scope.itemTypeValue == "Pearl Strand" || itemTypeId == 23) {
                        $scope.showPearl = true;
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
                    } else {

                    }
                }

                //Earrings id=10
                else if (itemCatagoryId == 10 && (itemTypeId != null || itemTypeId != "undefined")) {
                    if ($scope.itemTypeValue == "Diamond Stud" || itemTypeId == 13) {
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

                        $scope.pairedDiamondItems = [{ "id": 1 }, { "id": 2 }];
                    } else if ($scope.itemTypeValue == "Hoop" || itemTypeId == 14) {
                        //accent stones
                        $scope.showAccentDiamond = true;
                        $scope.showAccentGemstone = true;
                        $scope.moreDiamonds = true;
                        $scope.moreGemstones = true;
                    } else if ($scope.itemTypeValue == "Diamond Fashion" || itemTypeId == 15) {
                        //show centered stone type options drop down

                        // $scope.showCenteredStone = true;

                        //$scope.showCenteredDiamond = true;
                        $scope.showAdditionalGemstone = true;

                       //show centered stone type options drop down
                       $scope.showCenteredStoneEarring = true;
                       $scope.isParedCenteredStone = 6;

                        //accent stones
                        $scope.showAccentDiamond = true;
                        $scope.showAccentGemstone = true;
                        $scope.moreDiamonds = true;
                        $scope.moreGemstones = true;
                    } else if ($scope.itemTypeValue == "Colored Gemstone" || itemTypeId == 22) {
                        //show centered stone type options drop down

                        // $scope.showCenteredStone = true;

                        //$scope.showCenteredDiamond = true;
                        $scope.showAdditionalDiamond = true;
                        

                        //for paired diamond
                        /* $scope.showCheckboxOption = true;
                         $scope.showPairedGemstone = true;
                         $scope.isParedCenteredStone = 6;

                         $scope.showTwo = true;

                         $scope.pairedGemstoneItems = [{ "id": 1 }, { "id": 2 }];

                         //non paired
                         $scope.nonPairedGemstone = true;
                         */
                        
                        //show centered stone type options drop down
                        $scope.showCenteredStoneEarring = true;
                        $scope.isParedCenteredStone = 6;

                        //accent stones
                        $scope.showAccentDiamond = true;
                        $scope.showAccentGemstone = true;
                        $scope.moreDiamonds = true;
                        $scope.moreGemstones = true;;
                    } else if ($scope.itemTypeValue == "Pearl" || itemTypeId == 26) {
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
                else if (itemCatagoryId == 11 && (itemTypeId != null || itemTypeId != "undefined")) {
                    if ($scope.itemTypeValue == "Loose Diamonds" || itemTypeId == 16) {
                        $scope.showLooseDiamond = true;
                        $scope.showMountingandSetting = false;
                    } else if ($scope.itemTypeValue == "Loose Gemstones" || itemTypeId == 17) {
                        $scope.showLooseGemstone = true;
                        $scope.showMountingandSetting = false;
                    } else if ($scope.itemTypeValue == "Loose Pearl" || itemTypeId == 18) {

                        $scope.showLoosePearl = true;
                        $scope.showMountingandSetting = false;
                        $scope.isPearl = false;

                    } else {

                    }
                }

                //watch =
                else if (itemCatagoryId == 149 && (itemTypeId != null || itemTypeId != "undefined")) {
                    $scope.showWatch = true;
                    $scope.showMountingandSetting = false;
                }

                //other
                else if (itemCatagoryId == 150 && (itemTypeId != null || itemTypeId != "undefined")) {
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
                    //$scope.Appraisal.Chain.isChain = 6;

                }

                $scope.showAccentDiamond = ($scope.diamondItems != null && $scope.diamondItems.length != 0) ? true : false;
                $scope.showAccentGemstone = ($scope.gemstoneItems != null && $scope.gemstoneItems.length != 0) ? true : false;


                //pearl Items
                $scope.pearlItems = appraisalDetails.pearlDetails;
                // $scope.showPearl = ($scope.pearlItems != null && $scope.pearlItems.length != 0) ? true : false;
                angular.forEach($scope.pearlItems, function (item) {
                    if (item.scPearlEstimate == null || item.scPearlEstimate == 0) {
                        item.scPearlEstimate = "0.0";
                    } else {
                        var roundVal = roundOf2Decimal(item.scPearlEstimate);
                        item.scPearlEstimate = roundVal;
                    }
                });

                var AppraisalValue = roundOf2Decimal(appraisalDetails.appraisalOldValue);

                // Speedcheck Value
                var speedCheckSuggestedValue = roundOf2Decimal(appraisalDetails.sc_artigemReplacementValue);
                var ScTotalMountingPrice = roundOf2Decimal(appraisalDetails.sc_totalMountingPrice);
                var ScTotalDiamondPrice = roundOf2Decimal(appraisalDetails.sc_totalDiamondPrice);
                var ScTotalGemStonePrice = roundOf2Decimal(appraisalDetails.sc_totalGemStonePrice);

                // Total of Accent Diamond & Gemstone / Wedding Band Diamond & Gemstone
                var totalAccentWeddingbandDiamonds = $scope.totalWeddingBandDiamondTotal;
                var totalAccentWeddingbandGemstones = $scope.totalWeddingBandGemstoneTotal;

                //var totalAccentWeddingbandDiamonds = parseFloat(ScTotalDiamondPrice) + totalWeddingBandDiamondTotal;
                //var totalAccentWeddingbandGemstones = parseFloat(ScTotalGemStonePrice) + totalWeddingBandGemstoneTotal;

                var ScTotalMountingAccentStonePrice = roundOf2Decimal(appraisalDetails.sc_totalMountingAccentStonePrice);

                var ScTotalSalvageValue = roundOf2Decimal(appraisalDetails.sc_salvageValue);
                var ScTotalJewelersCost = roundOf2Decimal(appraisalDetails.sc_jwelersCost);
                var ScArtigemReplacementValue = roundOf2Decimal(appraisalDetails.sc_artigemReplacementValue);
                var ScInsuranceReplacementValue = roundOf2Decimal(appraisalDetails.sc_insuranceReplacementValue);
                var ScRetailValue = roundOf2Decimal(appraisalDetails.sc_retailValue);

                var ScLabourCharges = roundOf2Decimal(appraisalDetails.sc_labourCost);
                var insurancePremiumCost = roundOf2Decimal(appraisalDetails.insurancePremiumCost);
                var newInsurancePremiumCost = roundOf2Decimal(appraisalDetails.newInsurancePremiumCost);
                var oldInsurancePremiumCost = roundOf2Decimal(appraisalDetails.oldInsurancePremiumCost);

                var ScTotalChainPrice = roundOf2Decimal(appraisalDetails.sc_totalChainPrice);
                var ScTotalPearlPrice = roundOf2Decimal(appraisalDetails.sc_totalPearlPrice);

                var ScTotalMountingAccentStonePrice = roundOf2Decimal(appraisalDetails.sc_totalMountingAccentStonePrice);
                $scope.totalSetting = parseFloat(ScTotalMountingPrice); 
                //$scope.totalSetting = parseFloat(ScTotalMountingPrice) + total;

                //speedcheck Estimate Description Speed-984
                // if ($scope.summaryGrandTotal != null && parseFloat($scope.summaryGrandTotal) != 0) {
                //     if (parseFloat($scope.summaryGrandTotal) > parseFloat(AppraisalValue)) {
                //         $scope.estimateText = 'red';
                //         //$("#speedCheck-Estimate").removeClass("text-green").addClass("text-red");
                //     }
                //     else if (parseFloat($scope.summaryGrandTotal) <= parseFloat(AppraisalValue)) {
                //         $scope.estimateText = 'green';
                //         //$("#speedCheck-Estimate").removeClass("text-red").addClass("text-green");
                //     }
                // }

                $scope.Appraisal = {
                    "OriginalDescription": appraisalDetails.original_appraisal_description,
                    "AppraisalValue": AppraisalValue == null ? "0.0" : AppraisalValue,
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
                    "chainDetails": chainDetails,
                    "Watch": appraisalDetails.watchDetails,
                    "weddingBandDetails": appraisalDetails.weddingBandDetails,
                    "weddingBandExists": appraisalDetails.weddingBandExists,
                    "policyNumber": appraisalDetails.policyNumber,
                    "speedCheckSuggestedValue": (speedCheckSuggestedValue == null || speedCheckSuggestedValue == 0) ? "0.0" : speedCheckSuggestedValue,
                    "ScTotalMountingPrice": (ScTotalMountingPrice == null || ScTotalMountingPrice == 0) ? "0.0" : ScTotalMountingPrice,
                    "ScTotalDiamondPrice": (ScTotalDiamondPrice == null || ScTotalDiamondPrice == 0) ? "0.0" : ScTotalDiamondPrice,
                    "ScTotalGemStonePrice": (ScTotalGemStonePrice == null || ScTotalGemStonePrice == 0) ? "0.0" : ScTotalGemStonePrice,
                    "totalAccentWeddingbandDiamonds": (totalAccentWeddingbandDiamonds == null || totalAccentWeddingbandDiamonds == 0) ? "0.0" : totalAccentWeddingbandDiamonds,
                    "totalAccentWeddingbandGemstones": (totalAccentWeddingbandGemstones == null || totalAccentWeddingbandGemstones == 0) ? "0.0" : totalAccentWeddingbandGemstones,
                    "ScTotalMountingAccentStonePrice": (ScTotalMountingAccentStonePrice == null || ScTotalMountingAccentStonePrice == 0) ? "0.0" : ScTotalMountingAccentStonePrice,
                    "ScLabourCharges": (ScLabourCharges == null || ScLabourCharges == 0) ? "0.0" : ScLabourCharges,
                    //  "insurancePremiumCost": (insurancePremiumCost == null || insurancePremiumCost == 0) ? "0.0" : insurancePremiumCost,
                    "newInsurancePremiumCost": (newInsurancePremiumCost) ? newInsurancePremiumCost : "0.00",
                    "oldInsurancePremiumCost": (oldInsurancePremiumCost) ? oldInsurancePremiumCost : "0.00",
                    "ScTotalSalvageValue": (ScTotalSalvageValue == null || ScTotalSalvageValue == 0) ? "0.0" : ScTotalSalvageValue,
                    "ScTotalJewelersCost": (ScTotalJewelersCost == null || ScTotalJewelersCost == 0) ? "0.0" : ScTotalJewelersCost,
                    "ScArtigemReplacementValue": (ScArtigemReplacementValue == null || ScArtigemReplacementValue == 0) ? "0.0" : ScArtigemReplacementValue,
                    "ScInsuranceReplacementValue": (ScInsuranceReplacementValue == null || ScInsuranceReplacementValue == 0) ? "0.0" : ScInsuranceReplacementValue,
                    "ScRetailValue": (ScRetailValue == null || ScRetailValue == 0) ? "0.0" : ScRetailValue,

                    "scEstimateDescription": (appraisalDetails.sc_finalEstimate == null) ? " " : appraisalDetails.sc_finalEstimate,

                    "comparablesUpdatedDate": (appraisalDetails.comparablesUpdatedDate == null) ? " " : appraisalDetails.comparablesUpdatedDate,
                    "comparableComment": appraisalDetails.comparableComment,

                    "ScTotalChainPrice": (ScTotalChainPrice == null || ScTotalChainPrice == 0) ? "0.0" : ScTotalChainPrice,
                    "ScTotalPearlPrice": (ScTotalPearlPrice == null || ScTotalPearlPrice == 0) ? "0.0" : ScTotalPearlPrice,
                    "company": appraisalDetails.company,
                    "isParedCenteredStone":appraisalDetails.isParedCenteredStone

                }

                // update watch estimate to summaryTotal
                var itemCatagory = ($scope.Appraisal.ItemCategory) ? $scope.Appraisal.ItemCategory.attributeValueId : "";

                $scope.Appraisal.labourCost = (ScLabourCharges == null || ScLabourCharges == 0) ? "0.0" : ScLabourCharges;

                $scope.pearlInsuranceReplacementCost = $scope.Appraisal.ScTotalPearlPrice;

                $scope.Appraisal.ScTotalMountingAccentStonePrice = ScTotalMountingAccentStonePrice;
                //FileExtension
                angular.forEach(appraisalDetails.attachments, function (ItemFile) {
                    var name = ItemFile.appraisalDocuments;
                    var names = name.split('_');
                    var fileType = name.split('.').pop();
                    var filename = name.split('/').pop();
                    var str = filename;

                    var words = str.substring(str.indexOf('_') + 1);

                    $scope.attachmentList.push({ "fileName": words, "url": $scope.serverAddress + name, "type": fileType, "fileData": ItemFile.multipartFiles, "Image": $scope.serverAddress + name });
                });



                $scope.Appraisal.centeredStone = {};

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


                        }
                        else if (appraisalDetails.centreStoneType == 188) {
                            $scope.showCenteredGemstoneEarring = true;
                            $scope.centerStone.gemstone = (appraisalDetails.stoneDetails && appraisalDetails.stoneDetails.length > 0) ? appraisalDetails.stoneDetails[0] : {};


                        }
                    }
                    else if (appraisalDetails.isParedCenteredStone == 6) {

                        //187 is diamond
                        if (appraisalDetails.centreStoneType == 187) {
                            $scope.showPairedDiamondEarring = true;
                            $scope.pairedDiamondItems = appraisalDetails.diamondDetails;
                            $scope.pairedGemstoneItems = [];
                        }
                        else if (appraisalDetails.centreStoneType == 188) {
                            $scope.showPairedGemstoneEarring = true;
                            $scope.pairedGemstoneItems = appraisalDetails.stoneDetails;
                            $scope.pairedDiamondItems = [];
                        }

                    }
                }
                else if (appraisalDetails.diamondDetails.length > 1) {
                    $scope.isParedCenteredStone = 6;
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
                }
                else if (appraisalDetails.stoneDetails.length > 1) {
                    $scope.isParedCenteredStone = 6;
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
                }
                else if (appraisalDetails.diamondDetails.length > 0 && appraisalDetails.stoneDetails.length > 0 && checkAllfieldsOfDiamond(appraisalDetails.diamondDetails) && checkAllfieldsOfGemstone(appraisalDetails.stoneDetails)) {
                    $scope.isParedCenteredStone = 5;
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
                }
                else if (appraisalDetails.diamondDetails.length > 0 && checkAllfieldsOfDiamond(appraisalDetails.diamondDetails)) {
                    if ($scope.showMainDiamond == true) {
                        $scope.showMainDiamondDetails = true;
                    }
                    else {
                        $scope.onChangeShowDiamondGemstone(187);
                        $scope.Appraisal.centeredStone.type = 187;
                        $scope.isParedCenteredStone = 5;
                        $scope.pairedDiamondItems = [];
                        //$scope.pairedGemstoneItems = [];
                    }

                }
                else if (appraisalDetails.stoneDetails.length > 0 && checkAllfieldsOfGemstone(appraisalDetails.stoneDetails)) {
                    if ($scope.showMainGemstone == true) {

                        $scope.showMainGemstoneDetails = true;
                    }
                    else {

                        $scope.onChangeShowDiamondGemstone(188);
                        $scope.Appraisal.centeredStone.type = 188;
                        $scope.isParedCenteredStone = 5;
                        //$scope.pairedDiamondItems = [];
                        $scope.pairedGemstoneItems = [];
                    }
                }
                else if (appraisalDetails.diamondDetails.length < 2) {
                    if ($scope.showMainDiamond == true) {

                    }
                    else {
                        $scope.isParedCenteredStone = 5
                        $scope.pairedDiamondItems = [];
                        //$scope.pairedGemstoneItems = [];
                    }
                }

                angular.forEach(appraisalDetails.diamondDetails, function (item) {
                    if (item.scDiamondEstimate == null || item.scDiamondEstimate == 0) {
                        item.scDiamondEstimate = "0.0";
                    } else {
                        var roundVal = roundOf2Decimal(item.scDiamondEstimate);
                        item.scDiamondEstimate = roundVal;
                        $scope.scDiamondEstimateTotal += parseFloat(roundVal);
                    }
                });

                angular.forEach(appraisalDetails.stoneDetails, function (item) {
                    if (item.scStoneEstimate == null || item.scStoneEstimate == 0) {
                        item.scStoneEstimate = "0.0";
                    } else {
                        var roundVal = roundOf2Decimal(item.scStoneEstimate);
                        item.scStoneEstimate = roundVal;
                        $scope.scStoneEstimateTotal += parseFloat(roundVal);
                    }
                });



    //if($scope.Appraisal.newInsurancePremiumCost!=null && $scope.Appraisal.newInsurancePremiumCost!='0.00'){
     if(appraisalDetails.isUnderwriterReviewed){
        //$scope.Appraisal.newInsurancePremiumCost = appraisalDetails
      }else{
              if(appraisalDetails.type && appraisalDetails.type.atttibuteType!=null){

                        if (appraisalDetails.type.atttibuteType == 'Watch') {
                            // var newValue = roundOf2Decimal(appraisalDetails.watchDetails.totalWatchEstimation / 1000);
                            // var newCost = newValue * 12;

                            // $scope.Appraisal.newInsurancePremiumCost = roundOf2Decimal(newCost);


                            $scope.summaryTotal = appraisalDetails.watchDetails.totalWatchEstimation;

                            $scope.costSalesTax = roundOf2Decimal(appraisalDetails.salesTaxEstimation != null ? parseFloat(appraisalDetails.salesTaxEstimation) : 0);
                            $scope.Appraisal.salesTaxPt = roundOf2Decimal($scope.costSalesTax == 0 ? 8.1 : ($scope.costSalesTax * 100 / parseFloat($scope.summaryTotal)));
                            calSalesTax();
                            //$scope.summaryGrandTotal
                            //var newValue = roundOf2Decimal(appraisalDetails.watchDetails.totalWatchEstimation / 1000);
                            var newValue = roundOf2Decimal($scope.summaryGrandTotal / 1000);
                            var newCost = newValue * 12;
                            if(!(!!$scope.Appraisal.newInsurancePremiumCost))
                                 $scope.Appraisal.newInsurancePremiumCost = roundOf2Decimal(newCost);

                            //Old Premium
                            var oldValue = roundOf2Decimal($scope.Appraisal.AppraisalValue / 1000);
                            var oldCost = oldValue * 12;
                            $scope.Appraisal.oldInsurancePremiumCost = roundOf2Decimal(oldCost);


                    }

                     else
                     {
                        var newValue = ($scope.Appraisal.ScInsuranceReplacementValue / 1000);
                        var newCost = newValue * 12
                        if(!(!!$scope.Appraisal.newInsurancePremiumCost))
                            $scope.Appraisal.newInsurancePremiumCost = roundOf2Decimal(newCost);

                        //Old Premium
                        var oldValue = roundOf2Decimal($scope.Appraisal.AppraisalValue / 1000);
                        var oldCost = oldValue * 12;
                        $scope.Appraisal.oldInsurancePremiumCost = roundOf2Decimal(oldCost);
                        
                       }
                       $scope.Appraisal.newInsurancePremiumCost = isNaN($scope.Appraisal.newInsurancePremiumCost) ? 0.00 : $scope.Appraisal.newInsurancePremiumCost;

                    }
                }
                
                if(!$scope.showCenteredStoneEarring)
                $scope.centerStone.diamond = (appraisalDetails.diamondDetails && appraisalDetails.diamondDetails.length > 0) ? appraisalDetails.diamondDetails[0] : {};
                
                if(!$scope.showCenteredStoneEarring)
                $scope.centerStone.gemstone = (appraisalDetails.stoneDetails && appraisalDetails.stoneDetails.length > 0) ? appraisalDetails.stoneDetails[0] : {};
                // GeneratDescription();

                $scope.costSalesTax = roundOf2Decimal(appraisalDetails.salesTaxEstimation!=null ? parseFloat(appraisalDetails.salesTaxEstimation) : 0);
                $scope.Appraisal.salesTaxPt =  roundOf2Decimal($scope.costSalesTax ==0 ? 0 :($scope.costSalesTax * 100 / parseFloat($scope.summaryTotal))) ;
                $scope.summaryGrandTotal = parseFloat($scope.summaryTotal) + parseFloat($scope.costSalesTax);

                //speedcheck Estimate Description SPEED-984
                if ($scope.summaryGrandTotal != null && parseFloat($scope.summaryGrandTotal) != 0) {
                    if (parseFloat($scope.summaryGrandTotal) > parseFloat(AppraisalValue)) {
                        $scope.estimateText = 'red';
                        //$("#speedCheck-Estimate").removeClass("text-green").addClass("text-red");
                    }
                    else if (parseFloat($scope.summaryGrandTotal) <= parseFloat(AppraisalValue)) {
                        $scope.estimateText = 'green';
                        //$("#speedCheck-Estimate").removeClass("text-red").addClass("text-green");
                    }
                }

                setTimeout(() => {
                    $(".page-spinner-bar").addClass("hide");
                }, 4000);                
            }, function (error) {
                $(".page-spinner-bar").addClass("hide");
            });
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
            if (d.quantity != null || (d.shape && d.shape.attributeValueId != null) || (d.clarityFrom && d.clarityFrom.attributeValueId != null) || (d.cutGrade && d.cutGrade.attributeValueId != null) || (d.gemlab && d.gemlab.attributeValueId != null) || (d.colorFrom && d.colorFrom.attributeValueId != null))
                return true;
            else
                return false;

        }

        function checkAllfieldsOfGemstone(param) {

            var d = param[0];
            if (d.type != null || (d.clarity && d.clarity.attributeValueId != null) || d.shape != null || d.appraisalId != null || d.weight != null || d.quantity != null || d.grade != null)
                return true;
            else
                return false;
        }

        // onChangeShowDiamondGemstone
        $scope.onChangeShowDiamondGemstone = onChangeShowDiamondGemstone;
        function onChangeShowDiamondGemstone(param) {
            //187 diamond nd 188 gemstone
            if (param == 187) {
                $scope.showCenteredDiamond = true;
                $scope.showCenteredGemstone = false;
                $scope.centerStone.gemstone = {};
            }
            else {
                $scope.showCenteredGemstone = true;
                $scope.showCenteredDiamond = false;
                $scope.centerStone.diamond = {};
            }
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
            if (angular.isDefined(event.currentTarget.value)) {
                var roundVal = roundOf2Decimal(event.currentTarget.value);
                event.currentTarget.value = roundVal;
            }
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
                }
                else {
                    $scope.showAttachmentErro = true;
                }
            });
        };
        $scope.LoadFileInList = function (e) {
            $scope.$apply(function () {
                $scope.attachmentList.push(
                    {
                        "FileName": e.target.fileName, "FileExtension": e.target.fileExtension, "FileType": e.target.fileType,
                        "Image": e.target.result, "File": e.target.file
                    })
            });
        }

        $scope.RemoveAttachment = RemoveAttachment;
        function RemoveAttachment(index) {
            if ($scope.attachmentList.length > 0) {
                $scope.attachmentList.splice(index, 1);
            }
        };
        //End File Upload

        //AddInsuranceAgentPopup
        $scope.AddInsuranceAgentPopup = AddInsuranceAgentPopup;
        function AddInsuranceAgentPopup(status) {
            var appraisalDTO = {
                "newInsurancePremiumCost": ($scope.Appraisal.newInsurancePremiumCost && !isNaN($scope.Appraisal.newInsurancePremiumCost))?$scope.Appraisal.newInsurancePremiumCost:0.0,
                "oldInsurancePremiumCost": $scope.Appraisal.oldInsurancePremiumCost,
                "needInfo": status === 'NEED_INFO' ? true : false,
                "rejected": status === 'REJECT' ? true : false,
            };
            $scope.animationsEnabled = true;
            var out = $uibModal.open(
                {
                    animation: $scope.animationsEnabled,
                    templateUrl: "views/CommonTemplates/InsuranceAgentReviewPopup.html",
                    controller: "InsuranceAgentReviewPopupController",
                    backdrop: 'static',
                    keyboard: false,
                    resolve:
                    {
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
                    e.log("done"); consol
                    // GetNotes();
                }

            }, function (res) {
                //Call Back Function close
            });
            return {
                open: open
            };
        }


        $scope.NewApprisal = NewApprisal;
        function NewApprisal() {
            $scope.Appraisal = {};
            $scope.Desc.description = "";
            $scope.ApprisalOrderAddEdit = true;
            $scope.IsEditOrder = false;

            //dropDown Apis
            // GetGenderList();
            // GetAppraisalTypeList();
            // GetCustomTypeList();
            // GetMetalList();
            // GetMetaColor();
            // GetjewelleryTypeList();
            // GetStoneShapeList();
            // GetStoneColorList();
            // GetStoneclarityList();
        }

        $scope.btnCancel = btnCancel;
        function btnCancel() {
            this.ApprisalForm.$setUntouched();
            $scope.Appraisal = {};
            $scope.Desc.description = "";
            $scope.attachmentList = [];
            angular.element("input[type='file']").val(null);
            $scope.ApprisalOrderAddEdit = false;
            $scope.IsEditOrder = false;
        }

        $scope.GotoDetails = GotoDetails;
        function GotoDetails(item) {
            GetAppraisalDetails(item.appraisalNumber);
            $scope.ApprisalOrderAddEdit = true;
            $scope.IsEditOrder = true;
            //dropDown Apis
            // GetGenderList();
            // GetAppraisalTypeList();
            // GetCustomTypeList();
            // GetMetalList();
            // GetMetaColor();
            // GetjewelleryTypeList();
            // GetStoneShapeList();
            // GetStoneColorList();
            // GetStoneclarityList();
        }

        $scope.DeleteAppraisal = DeleteAppraisal;
        function DeleteAppraisal(item) {
            DeleteAppraisalDetails(item.appraisalNumber);
        }

        //AddEmailPopup
        $scope.AddEmailPopup = AddEmailPopup;
        function AddEmailPopup() {

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
                "deletedAttachments": $scope.deletedAttachmentList,
                "sc_finalEstimate": $scope.Appraisal.scEstimateDescription,
                "speedcheckAppraisalDate": (($scope.speedcheckSubmitDate !== null && angular.isDefined($scope.speedcheckSubmitDate)) ? $filter('DatabaseDateFormatMMddyyyy')($scope.speedcheckSubmitDate) : null)

            };

            window.sessionStorage.setItem('appraisalDTO', JSON.stringify(appraisalDTO));

            $scope.animationsEnabled = true;
            var out = $uibModal.open(
                {
                    animation: $scope.animationsEnabled,
                    templateUrl: "views/CommonTemplates/EmailPopup.html",
                    controller: "EmailPopupController",
                    backdrop: 'static',
                    keyboard: false,
                    resolve:
                    {
                        appraisalData: function () {

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

        $scope.showParedDiamond = showParedDiamond;
        function showParedDiamond(param) {

            if (param != 5) {


                if (!$scope.nonPairedGemstone) {

                    $scope.showCenteredDiamond = false;
                    $scope.centerStone.diamond = {};

                    $scope.pairedDiamondItems = [{
                        id: '1',
                        removeButton: false
                    }, {
                        id: '2',
                        removeButton: false
                    }
                    ];

                    $scope.showPairedDiamond = true;
                }
                else {

                    $scope.showCenteredGemstone = false;
                    $scope.centerStone.gemstone = {};

                    $scope.pairedGemstoneItems = [{
                        id: '1',
                        removeButton: false
                    }, {
                        id: '2',
                        removeButton: false
                    }
                    ];

                    $scope.showPairedGemstone = true;
                }
            }
            else {
                $scope.pairedDiamondItems = [];
                $scope.pairedGemstoneItems = [];
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
        $scope.printAppraisalDetails = function () {
            var printContents = document.getElementById('pdfGenerator').innerHTML;
            var id = 1;
            var pdfTitle = "#"+$scope.AppraisalNo + "_" + toTitleCase($scope.PolicyDetails.primaryPolicyHolderLname) + toTitleCase($scope.PolicyDetails.primaryPolicyHolderFname);
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
            var pdfTitle = "#"+$scope.AppraisalNo;

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

        /*  Modified By Vinod */
        $scope.showParedDiamond = showParedDiamond;
        function showParedDiamond(param) {

            if (param != 5) {


                if (!$scope.nonPairedGemstone) {

                    $scope.showCenteredDiamond = false;
                    $scope.centerStone.diamond = {};

                    $scope.pairedDiamondItems = [{
                        id: '1',
                        removeButton: false
                    }, {
                        id: '2',
                        removeButton: false
                    }
                    ];

                    $scope.showPairedDiamond = true;
                }
                else {

                    $scope.showCenteredGemstone = false;
                    $scope.centerStone.gemstone = {};

                    $scope.pairedGemstoneItems = [{
                        id: '1',
                        removeButton: false
                    }, {
                        id: '2',
                        removeButton: false
                    }
                    ];

                    $scope.showPairedGemstone = true;
                }
            }
            else {
                $scope.pairedDiamondItems = [];
                $scope.pairedGemstoneItems = [];
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


        /* Function to preview uploaded Documents */
        $scope.GetDocxDetails = function (item) {
            $scope.pdf = true;
            $scope.currentPDFUrl = $scope.pdfUrl;
            $scope.pageToDisplay = 1;
            $scope.pageNum = 1;
            $scope.isPDF = 0;
            $scope.DocxDetails = item;
            $scope.ReceiptList = $scope.DocxDetails.url;
            $scope.pdfUrl = $scope.ReceiptList;
            var pdf = ["pdf", "application/pdf"];
            var img = ["image", "application/image", "image/png", "image/jpeg", "image/gif", "png", "jpg", "jpeg", "gif", "image", "PNG", "JPEG", "GIF", "JPG"];
            $scope.imgDiv = true;
            if (pdf.indexOf(($scope.DocxDetails.type.toLowerCase())) > -1) {
                $scope.isPDF = 1;
            }
            else if (img.indexOf(($scope.DocxDetails.type.toLowerCase())) > -1) {
                $scope.isPDF = 2;
            }
            else {
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
            /* $("#previewclose").click(function(){ */
            $("#img_preview").hide();
            /*  }); */
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
            var blob = new Blob(byteArrays, { type: contentType });
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

        function isNullData(objData) {
            if (objData == null || objData == 'null' || objData == '' || objData == 'undefined') {
                return true;
            } else {
                return false;
            }
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

        // US Format Current Date
        $scope.currUSFormatDate = currUSFormatDate;
        function currUSFormatDate() {
            var todayTime = new Date();
            var month = todayTime.getMonth() + 1;
            var day = todayTime.getDate();
            var year = todayTime.getFullYear();
            return month + "/" + day + "/" + year;
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

        /* Select & Activate - Tab */
        $(document).ready(function() {
            /* Select & Activate - Approved Appraisals tab for Appraisal Details page */
            if(sessionStorage.getItem("refferer") == "APPROVED_APPRAISALS"){ 
               $rootScope.$broadcast('updateActiveTab', 'apprAppraisals');
            }
             
            /* Select & Activate - Reports tab for Appraisal Details page */
            if(sessionStorage.getItem("refferer") == "REPORTS"){
                $rootScope.$broadcast('updateActiveTab', 'Reports');
             }
        });

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

    });
