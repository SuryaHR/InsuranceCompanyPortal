angular.module('MetronicApp').controller('JewelryPolicyHolderReviewController', function ($timeout, $rootScope, $filter, $uibModal, $scope, $translate, $translatePartialLoader, $location, AppraisalService,JewelryCustomComparableService, appraisalData) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    //set language
    $translatePartialLoader.addPart('PolicyHolderReview');
    $translate.refresh();
    $scope.description = "";
    $scope.isEditPhone = false;
    $scope.Policyholder = {};
    $scope.mobNo=null;
    $scope.costSalesTax = 0;
    $scope.summaryGrandTotal = 0;

    //jewelry MER
    $scope.diamondOptions = [];
    $scope.settingOptions = [];
    $scope.weddingbandOptions = [];
    $scope.centerStoneGemstonesOptions = [];
    $scope.chains = [];
    $scope.leftCenterStoneDiamonds = [];
    $scope.leftCenterStoneGemstones = [];
    $scope.rightCenterStoneDiamonds = [];
    $scope.rightCenterStoneGemstones = [];
    $scope.centerStonePearls = [];
    $scope.mainWatchs = [];
    $scope.customAdditions = [];
    
    $scope.subTotal = 0;
    $scope.date = new Date();
    $scope.optionsItems = [];
    $scope.wrongPin = false;
    
    $scope.yourSelections = {
        "diamondOptions" : [],
        "settingOptions" : [],
        "weddingbandOptions" : [],
        "centerStoneGemstonesOptions":[],
        "chains":[],
        "leftCenterStoneDiamonds":[],
        "leftCenterStoneGemstones":[],
        "rightCenterStoneDiamonds":[],
        "rightCenterStoneGemstones":[],
        "centerStonePearls":[],
        "mainWatchs":[],
        "customAdditions":[],
        total: 0
        }
    
    $timeout(function () {
        $scope.Policyholder.InsuranceCarrier = sessionStorage.getItem('insuranceCarrier');
    }, 500);
     if (!isNullData(appraisalData)) {
        $scope.Policyholder.Name = appraisalData.policyholderInfo ? $filter('constructName')(appraisalData.policyholderInfo.firstName, appraisalData.policyholderInfo.lastName) : "";
        $scope.name = appraisalData.policyholderInfo ? appraisalData.policyholderInfo.firstName : "";
        $scope.Policyholder.PhoneNo = $filter('tel')(appraisalData.policyholderInfo ? appraisalData.policyholderInfo.cellphone : null);
            // $scope.Policyholder.FName = sessionStorage.getItem("primaryPolicyHolderFname"),
            // $scope.Policyholder.LName = sessionStorage.getItem("primaryPolicyHolderLname"),
        $scope.Policyholder.PolicyNumber = sessionStorage.getItem("policyNumber");
        $scope.Policyholder.AppraisalNumber = sessionStorage.getItem("AppraisalNo");
   }
    if (sessionStorage.getItem('Name') != null && sessionStorage.getItem('Name') != "") {
        var name = sessionStorage.getItem('Name');
        var fullAgentName = name.split(',');
        $scope.agentName = fullAgentName[1] + ' ' + fullAgentName[0];
    } else {
        $scope.agentName = '';
    }
    var url = window.location.href;
    var domain = url.split("#")[0];
    domain += '#/PolicyHolderReview?id=' + sessionStorage.getItem('AppraisalNo');

    $scope.description = "Dear " + $scope.name + ', ' + '\n\n' + "Please review the Appraisal Evaluation Report for your scheduled jewelry item by clicking the link below." + '' + '\n\n' + 'Thanks,' + '\n' + $scope.agentName + ' ' + '\n\n' + domain;
    //$scope.description="Dear "+ $scope.name +', '+'\n\n'+"Please review the new appraisal details for your policy # "+$scope.Policyholder.PolicyNumber+" by clicking the link below."+''+'\n\n'+'Thanks,'+'\n'+$scope.agentName+' '+'\n\n'+domain;

    $rootScope.appraisalData = sessionStorage.getItem('appraisalDTO', JSON.parse(window.sessionStorage.getItem("appraisalDTO")));

    $scope.ok = function (e) {
        $scope.SendSMSToPH();

        $scope.$close();
    }
    //Cancel
    $scope.cancel = function () {
        $scope.$close();
    };

    function checkFieldsforGetChainDetails(p) {
        if (p.MetalColor || p.MetalLength || p.MetalType || (p.MetalWeight && p.MetalWeight.weight) || (p.MetalWeight && p.MetalWeight.MetalUnit))
            return true;
        else
            return false;
    }

    $scope.SendSMSToPH = SendSMSToPH;
    function SendSMSToPH() {
        $(".page-spinner-bar").removeClass("hide");
        var appraisalId = sessionStorage.getItem("appraisalId");
        $scope.review = {};
        $scope.review.appraisalId = appraisalId;
        $scope.review.userId = sessionStorage.getItem("UserId");
        // $scope.review.userType = "UnderWriter";
        // $scope.review.popupMessage = $scope.popup.message;

        // Save Updated data before Underwriter Review
        var policyNum = sessionStorage.getItem("policyNumber");
        var createdBy = sessionStorage.getItem("UserId");

        // var mountingDiamondDetails = appraisalData.Appraisal.Mounting.diamondDetails;
        // var mountingStoneDetails = appraisalData.Appraisal.Mounting.stoneDetails;

        var mountingDetails = {};
        if (angular.isDefined(appraisalData.Appraisal.Mounting)) {
            mountingDetails = {
                "id": appraisalData.Appraisal.Mounting.id,
                "metalWeight": appraisalData.Appraisal.Mounting.MetalWeight.weight,
                "metalUnitWeight": appraisalData.Appraisal.Mounting.MetalWeight.MetalUnit,
                "length": appraisalData.Appraisal.Mounting.MetalLength,
                "width": appraisalData.Appraisal.Mounting.MetalWidth,
                //check
                "metalUnitWeight": appraisalData.Appraisal.Mounting.MetalWeight.MetalUnit,
                "metalColor": appraisalData.Appraisal.Mounting.MetalColor,
                "typeOfMetal": appraisalData.Appraisal.Mounting.MetalType,
                "stoneDetails": appraisalData.Appraisal.Mounting.stoneDetails,
                "diamondDetails": appraisalData.Appraisal.Mounting.diamondDetails,
            };
        }

        //chainDetails
        var chainDetails = {};
        if (appraisalData.Appraisal.Chain && appraisalData.Appraisal.Chain.isChain != 6 && checkFieldsforGetChainDetails(appraisalData.Appraisal.Chain)) {
            chainDetails = {

                "metalWeight": appraisalData.Appraisal.Chain.MetalWeight.weight,
                "metalUnitWeight": appraisalData.Appraisal.Chain.MetalWeight.MetalUnit,
                "length": appraisalData.Appraisal.Chain.MetalLength,

                //check
                "metalUnitWeight": appraisalData.Appraisal.Chain.MetalWeight.MetalUnit,
                "metalColor": appraisalData.Appraisal.Chain.MetalColor,
                "typeOfMetal": appraisalData.Appraisal.Chain.MetalType
            };
        }
        var diamondDetails = appraisalData.diamondItems;
        var stoneDetails = appraisalData.gemstoneItems;
        var pearlDetails = appraisalData.pearlItems;
        var appraisalDocuments = appraisalData.attachmentList;

        if (appraisalData.Appraisal.ItemCategory && appraisalData.Appraisal.ItemCategory.atttibuteValue === 'Watch') {
            appraisalData.sc_insuranceReplacementValue = (appraisalData.watchDetails && appraisalData.watchDetails.totalWatchEstimation) ? appraisalData.watchDetails.totalWatchEstimation : 0.0;
        }

        var details = {
            "id": sessionStorage.getItem("appraisalId"),
            "appraisalNumber": sessionStorage.getItem("appraisalNumber"),
            "original_appraisal_description": appraisalData.Appraisal.OriginalDescription,
            "appraisalEffectiveDate": ((appraisalData.Appraisal.AppraisalDate !== null && angular.isDefined(appraisalData.Appraisal.AppraisalDate)) ? $filter('DatabaseDateFormatMMddyyyy')(appraisalData.Appraisal.AppraisalDate) : null),

            "appraisalOldValue": appraisalData.Appraisal.AppraisalValue,
            "policyNumber": policyNum,
            "createdBy": createdBy,

            "gender": appraisalData.Appraisal.Gender,
            "watchDetails": appraisalData.watchDetails,

            "isCustom": appraisalData.Appraisal.Custom,
            "designer": appraisalData.Appraisal.Designer,
            "itemCategory": appraisalData.Appraisal.ItemCategory,
            "type": appraisalData.Appraisal.ItemType,

            "mountingDetails": mountingDetails,
            "chainDetails": chainDetails,
            "stoneDetails": stoneDetails,
            "pearlDetails": pearlDetails,
            "diamondDetails": diamondDetails,
            "weddingBandDetails": appraisalData.weddingBandDetails,
            "weddingBandExists": appraisalData.weddingBandExists,
            //   "insurancePremiumCost": appraisalData.Appraisal.insurancePremiumCost,
            "newInsurancePremiumCost": appraisalData.Appraisal.newInsurancePremiumCost,
            "oldInsurancePremiumCost": appraisalData.Appraisal.oldInsurancePremiumCost,
            //speedcheck
            "sc_salvageValue": appraisalData.sc_salvageValue,
            "sc_jwelersCost": appraisalData.sc_jwelersCost,
            "sc_artigemReplacementValue": appraisalData.sc_artigemReplacementValue,
            "sc_insuranceReplacementValue": appraisalData.sc_insuranceReplacementValue,
            "sc_retailValue": appraisalData.sc_retailValue,
            "sc_totalMountingPrice": appraisalData.sc_totalMountingPrice,
            "sc_totalDiamondPrice": appraisalData.sc_totalDiamondPrice,
            "sc_totalGemStonePrice": appraisalData.sc_totalGemStonePrice,
            "sc_labourCost": appraisalData.sc_labourCost,
            "sc_totalChainPrice": appraisalData.sc_totalChainPrice,
            "sc_totalPearlPrice": appraisalData.sc_totalPearlPrice,

            "sc_centerDiamondTotal": appraisalData.sc_centerDiamondTotal,
            "sc_centerStoneTotal": appraisalData.sc_centerStoneTotal,
            "sc_totalMountingAccentStonePrice": appraisalData.sc_totalMountingAccentStonePrice,

            "isParedCenteredStone": appraisalData.isParedCenteredStone,

            "speedcheckResultDescription": appraisalData.speedcheckResultDescription,
            "summaryTotal": appraisalData.summaryTotal,
            "salesTaxEstimation": appraisalData.salesTaxEstimation,

            "sc_finalEstimate": appraisalData.sc_finalEstimate,
            "speedcheckAppraisalDate": appraisalData.speedcheckAppraisalDate,
            "centreStoneType": (appraisalData.centreStoneType) ? appraisalData.centreStoneType : null,
            "chainExists": (appraisalData.chainExists) ? appraisalData.chainExists : null


        };
        $scope.details = details;
        var data = new FormData();
        angular.forEach(appraisalData.attachmentList, function (ItemFile) {
            data.append('file', ItemFile.File);
        });
        data.append("details", angular.toJson(details));
        var promis = AppraisalService.UpdateAppraisal(data);
        promis.then(function (success) {
            $rootScope.ApprisalFormPristine = false;
            // After Save / Updated data, send for Underwriter Review
            // var promis = UnderWriterReviewService.UnderWriterReview($scope.review);
            // promis.then(function (success) {
            //     toastr.remove();
            //     toastr.success("The appraisal was submitted to Underwriter for approval", "Confirmation");
            //     $(".page-spinner-bar").addClass("hide");
            //     $location.path('/PolicyDetail');
            // }, function (error) {
            //     toastr.remove();
            //     $(".page-spinner-bar").addClass("hide");
            //     if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
            //         toastr.error(error.data.errorMessage, "Error")
            //     }
            //     else {
            //         toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
            //     }
            // });

            $scope.cellPhoneNumber = appraisalData && appraisalData.policyholderInfo ? appraisalData.policyholderInfo.cellphone : null;
            
            var param = {
                "mobileNumber": $scope.cellPhoneNumber,
                "messageContents": $scope.description,
                "createdBy": sessionStorage.getItem("UserId"),
                "webSite": window.location.href,

                "appraisalDetails": {
                    "id": sessionStorage.getItem("appraisalId")

                },
                "policyHolder": {
                    "policyId": sessionStorage.getItem("policyId"),

                },
                "userId": sessionStorage.getItem("UserId")
            };
            $(".page-spinner-bar").removeClass("hide");
            var sendSMS = AppraisalService.sendSMSToPolicyholder(param);
            sendSMS.then(function (success) {
                $rootScope.ApprisalFormPristine = false;
                var smsInfo = success.data.SMSInfo;
                sessionStorage.setItem("smsUrl", smsInfo.urlInfo.url);
                $(".page-spinner-bar").addClass("hide");
                toastr.remove()
                var msg = "The new appraisal value and premium details were sent to the policyholder for review.";
                toastr.success(msg, "Confirmation");
                $location.url("/PolicyDetail");
                $(".page-spinner-bar").addClass("hide");
                $scope.$close();
            }, function (error) {
                toastr.remove()
                toastr.error(error.data.errorMessage, "Error");
                $(".page-spinner-bar").addClass("hide");
            });
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



    };

    $scope.PhoneValidation = true;
    $scope.ItemTab = 'Assembled';
    $scope.IsJwellery = false;
    $scope.PhoneNumber = {};
    $scope.ItemDetails = {};
    $scope.ShowItem = false;
    $scope.CheckNumber = CheckNumber;
    $scope.URL = null;
    function init() {
        $scope.URL = $location.absUrl();
        debugger;
        $scope.Prev = true;
        $scope.Next = true;
        getVendorLogo();
    }
console.log("$scope.yourSelections", $scope.yourSelections);
    init();
    function CheckNumber(event) {
        switch (event) {
            case 'txtFirst':
                $("#txtSecond").focus();
                CheckPhonenUmber();
                break;
            case 'txtSecond':
                $("#txtThird").focus();
                CheckPhonenUmber();
                break;
            case 'txtThird':
                $("#txtFourth").focus();
                CheckPhonenUmber();
                break;
            case 'txtFourth':
                $("#txtFirst").focus();
                CheckPhonenUmber();
                break;
            default:

        }
    };

    function CheckPhonenUmber() {
        if (angular.isDefined($scope.PhoneNumber)) {
            var first = (parseInt(angular.isDefined($scope.PhoneNumber.FirstDigit) && $scope.PhoneNumber.FirstDigit != "" ? $scope.PhoneNumber.FirstDigit : null));
            var second = (parseInt(angular.isDefined($scope.PhoneNumber.SecondDigit) && $scope.PhoneNumber.SecondDinigit != "" ? $scope.PhoneNumber.SecondDigit : null));
            var third = (parseInt(angular.isDefined($scope.PhoneNumber.ThirdDigit) && $scope.PhoneNumber.ThirdDigit != "" ? $scope.PhoneNumber.ThirdDigit : null));
            var fourth = (parseInt(angular.isDefined($scope.PhoneNumber.FourthDigit) && $scope.PhoneNumber.FourthDigit != "" ? $scope.PhoneNumber.FourthDigit : null));
            if (first != null && second != null && third != null && fourth != null) {
                var MobileNumber = first.toString() + "" + second.toString() + "" + third.toString() + "" + fourth.toString()
                if (MobileNumber.length == 4) {
                    ValidateMobileNumber(MobileNumber);
                }
            }
        }
    };
    $scope.ShowItemDetails = ShowItemDetails;
    function ShowItemDetails(item) {
        $scope.ItemDetails = angular.copy(item)
        $scope.ShowItem = true;
        $scope.Prev = false;
        $scope.Next = true;

    };
    $scope.Back = function () {
        $scope.ItemDetails = {};
        $scope.ShowItem = false;
    };
    $scope.GotoNext = function ($event) {
        $(".page-spinner-bar").removeClass("hide");
        var index;
        angular.forEach($scope.AllComparablesList.nonJewelleryItemComparables, function (item, key) {
            if (item.id == $scope.ItemDetails.id) {
                index = key;
                $scope.Prev = true;

            }
        })

        if (index != $scope.AllComparablesList.nonJewelleryItemComparables.length - 1) {
            $scope.ItemDetails = {};
            $scope.ItemDetails = angular.copy($scope.AllComparablesList.nonJewelleryItemComparables[index + 1]);
        }
        else {
            $scope.Prev = true;
            $scope.Next = false;
        }
        $(".page-spinner-bar").addClass("hide");

    };
    $scope.GotoPrevious = function ($event) {
        $(".page-spinner-bar").removeClass("hide");
        var index;
        angular.forEach($scope.AllComparablesList.nonJewelleryItemComparables, function (item, key) {
            if (item.id == $scope.ItemDetails.id) {
                index = key;
                $scope.Next = true;
            }
        })

        if (index != 0) {
            $scope.ItemDetails = {};
            $scope.ItemDetails = angular.copy($scope.AllComparablesList.nonJewelleryItemComparables[index - 1]);
        }
        else {
            $scope.Prev = false;
            $scope.Next = true;

        }
        $(".page-spinner-bar").addClass("hide");
    };

    //jewelry MER changes
    $scope.ValidateMobileNumber = ValidateMobileNumber;
    function ValidateMobileNumber(mobileNumber) {
        $scope.mobNo = mobileNumber;
        $(".page-spinner-bar").removeClass("hide");
            var param = {"lastDigits":mobileNumber,
                        "url": sessionStorage.getItem("smsUrlForJewelryPH"),
                        "claimNumber": sessionStorage.getItem("claimNumberForJewelryPH"),
                        "itemId": sessionStorage.getItem("itemIdForJewelryPH")};
            var validateMobile = JewelryCustomComparableService.validateMobileNum(param);
            validateMobile.then(function(success){
                $scope.merPageDetails = success.data.validateMobile;
                    $(".page-spinner-bar").addClass("hide");
                    toastr.success(success.data.errorMessage, "success");
                    $scope.PhoneValidation = false;
                    // getting insurance details from scope variable
                    $scope.companyInfo = $scope.merPageDetails.company;
                    $scope.adjusterInfo = $scope.merPageDetails.adjuster;
                    $scope.policyHolderReviewDetails = $scope.merPageDetails.policyHolder;
                    $scope.policyHolderReviewDetails.lastName = $scope.policyHolderReviewDetails.lastName.charAt(0).toUpperCase() + $scope.policyHolderReviewDetails.lastName.substr(1).toLowerCase();
                    $scope.policyHolderReviewDetails.firstName = $scope.policyHolderReviewDetails.firstName.charAt(0).toUpperCase() + $scope.policyHolderReviewDetails.firstName.substr(1).toLowerCase();
                    $scope.claimNumber = sessionStorage.getItem("claimNumberForJewelryPH");
                    $scope.itemNumber = sessionStorage.getItem("itemIdForJewelryPH");
                    
                        $scope.jewleryItemDetails = $scope.merPageDetails.item;
                        $scope.jewelryComparableItemDetails = $scope.merPageDetails.item.comparableItems;
                        angular.forEach($scope.jewelryComparableItemDetails, function(item){
                            if(item.isReplacementItem == true){
                                $scope.replacedJewelryItem = item;
                                $scope.subTotal = item.price;
                                // angular.forEach($scope.replacedJewelryItem.subJewelryReplacements, function(subItem){
                                //     $scope.subTotal +=  parseFloat(subItem.totalReplacementPrice);
                                // });
                            }
                        });
                        var itemDetailsJewlery = JewelryCustomComparableService.getWholeJewelryCustomItem($scope.replacedJewelryItem.id);
                        itemDetailsJewlery.then(function(success){
                        const allComparableComponets = success.data.data['customJewelryReplacementDTOS'];
                        // component list
                        $scope.diamondOptions = getComponentList(allComparableComponets, 'CENTER_DIAMOND');
                        $scope.centerStoneGemstonesOptions = getComponentList(allComparableComponets, 'CENTER_GEMSTONE');
                        $scope.settingOptions = getComponentList(allComparableComponets, 'SETTINGS');
                        $scope.weddingbandOptions = getComponentList(allComparableComponets, 'WEDDING_BAND');

                        $scope.chains = getComponentList(allComparableComponets, 'CHAINS');
                        $scope.leftCenterStoneDiamonds = getComponentList(allComparableComponets, 'LEFT_CENTER_DIAMOND');
                        $scope.leftCenterStoneGemstones = getComponentList(allComparableComponets, 'LEFT_CENTER_GEMSTONE');
                        $scope.rightCenterStoneDiamonds = getComponentList(allComparableComponets, 'RIGHT_CENTER_DIAMOND');
                        $scope.rightCenterStoneGemstones = getComponentList(allComparableComponets, 'RIGHT_CENTER_GEMSTONE');
                        $scope.centerStonePearls = getComponentList(allComparableComponets, 'CENTER_PEARL');

                        $scope.mainWatchs = getComponentList(allComparableComponets, 'MAIN_WATCH');
                        $scope.customAdditions = getComponentList(allComparableComponets, 'CUSTOM_ADDITIONS');
        
                        angular.forEach($scope.diamondOptions, function(likedItem){
                            if(likedItem.itemLiked == true){
                                $scope.yourSelections.diamondOptions.push(likedItem);
                                $scope.yourSelections.total += parseFloat(likedItem.totalReplacementPrice);
                            }
                           
                        });
                        angular.forEach($scope.centerStoneGemstonesOptions, function(likedItem){
                            if(likedItem.itemLiked == true){
                                $scope.yourSelections.centerStoneGemstonesOptions.push(likedItem);
                                $scope.yourSelections.total += parseFloat(likedItem.totalReplacementPrice);
                            }
                            
                        });
                        angular.forEach($scope.settingOptions, function(likedItem){
                            if(likedItem.itemLiked == true){
                                $scope.yourSelections.settingOptions.push(likedItem);
                                $scope.yourSelections.total += parseFloat(likedItem.totalReplacementPrice);
                            }
                        });
                        angular.forEach($scope.weddingbandOptions, function(likedItem){
                            if(likedItem.itemLiked == true){
                                $scope.yourSelections.weddingbandOptions.push(likedItem);
                                $scope.yourSelections.total += parseFloat(likedItem.totalReplacementPrice);
                            }
                           
                        });

                        angular.forEach($scope.chains, function(likedItem){
                            if(likedItem.itemLiked == true){
                                $scope.yourSelections.chains.push(likedItem);
                                $scope.yourSelections.total += parseFloat(likedItem.totalReplacementPrice);
                            }                           
                        });
                        angular.forEach($scope.leftCenterStoneDiamonds, function(likedItem){
                            if(likedItem.itemLiked == true){
                                $scope.yourSelections.leftCenterStoneDiamonds.push(likedItem);
                                $scope.yourSelections.total += parseFloat(likedItem.totalReplacementPrice);
                            }                           
                        });
                        angular.forEach($scope.leftCenterStoneGemstones, function(likedItem){
                            if(likedItem.itemLiked == true){
                                $scope.yourSelections.leftCenterStoneGemstones.push(likedItem);
                                $scope.yourSelections.total += parseFloat(likedItem.totalReplacementPrice);
                            }                           
                        });
                        angular.forEach($scope.rightCenterStoneDiamonds, function(likedItem){
                            if(likedItem.itemLiked == true){
                                $scope.yourSelections.rightCenterStoneDiamonds.push(likedItem);
                                $scope.yourSelections.total += parseFloat(likedItem.totalReplacementPrice);
                            }                           
                        });
                        angular.forEach($scope.rightCenterStoneGemstones, function(likedItem){
                            if(likedItem.itemLiked == true){
                                $scope.yourSelections.rightCenterStoneGemstones.push(likedItem);
                                $scope.yourSelections.total += parseFloat(likedItem.totalReplacementPrice);
                            }                           
                        });
                        angular.forEach($scope.centerStonePearls, function(likedItem){
                            if(likedItem.itemLiked == true){
                                $scope.yourSelections.centerStonePearls.push(likedItem);
                                $scope.yourSelections.total += parseFloat(likedItem.totalReplacementPrice);
                            }                           
                        });
                        angular.forEach($scope.mainWatchs, function(likedItem){
                            if(likedItem.itemLiked == true){
                                $scope.yourSelections.mainWatchs.push(likedItem);
                                $scope.yourSelections.total += parseFloat(likedItem.totalReplacementPrice);
                            }                           
                        });
                        angular.forEach($scope.customAdditions, function(likedItem){
                            if(likedItem.itemLiked == true){
                                $scope.yourSelections.customAdditions.push(likedItem);
                                $scope.yourSelections.total += parseFloat(likedItem.totalReplacementPrice);
                            }                           
                        });

                        angular.forEach(allComparableComponets, function(itm) {
                            $scope.optionsItems.push(itm);
                        });
                        sortLikedItems();
                    });
                    

        }, function (error) {
            toastr.remove();
            $scope.wrongPin = true;
            $scope.wrongPinMessage = "Wrong PIN entered. Try again";
            // toastr.error(success.data.errorMessage, "Error");
            $(".page-spinner-bar").addClass("hide");
        });
    };

    // Get componentList from allComponent List 
    $scope.getComponentList = getComponentList
    function getComponentList(componentsList,itemType){
         const compList = componentsList.filter(fElm => fElm.itemType == itemType);
         return compList;
    }
    // Round of 2 Decimal point
    $scope.roundOf2Decimal = roundOf2Decimal;
    function roundOf2Decimal(num) {
        if (num != null) {
            return (Math.round(num * 100) / 100).toFixed(2);
        }
        return num;
    }

    $scope.itemSelectedPopulate = itemSelectedPopulate;
    function itemSelectedPopulate(ItemCategory, type) {
        var itemCatagory = ($scope.policyHolderReviewDetails.appraisalDetails.itemCategory) ? $scope.policyHolderReviewDetails.appraisalDetails.itemCategory.attributeValueId : "";
        var itemType = ($scope.policyHolderReviewDetails.appraisalDetails.type) ? $scope.policyHolderReviewDetails.appraisalDetails.type.attributeValueTypeId : "";
        var itemTypeNM = ($scope.policyHolderReviewDetails.appraisalDetails.type) ? $scope.policyHolderReviewDetails.appraisalDetails.type.atttibuteType : "";
        $scope.centeredStoneType = $scope.policyHolderReviewDetails.appraisalDetails.centreStoneType;
        $scope.showMountingandSetting = true;
        console.log("itemCatagory: " + itemCatagory + ", itemType" + itemType + ", itemTypeNM" + itemTypeNM);
        //ring id=7
        if (itemCatagory == 7 && (itemType != null || itemType != "undefined")) {

            if (itemTypeNM == "Diamond Solitaire" || itemType == 1) {

                $scope.showCenteredDiamond = true;
                //Wedding Band
                $scope.isWeddingBand = true;

            }
            else if (itemTypeNM == "Engagement" || itemType == 2) {

                $scope.showCenteredDiamond = false;
                $scope.showCenteredGemstone = false;

                //accent stones
                $scope.showAccentDiamond = true;
                $scope.showAccentGemstone = true;

                //Wedding Band
                $scope.isWeddingBand = true;
            }
            else if (itemTypeNM == "Wedding Band / Anniversary" || itemType == 3) {

                //accent stones
                $scope.showAccentDiamond = true;
                $scope.showAccentGemstone = true;
            }
            else if (itemTypeNM == "Colored Gemstone" || itemType == 4) {

                $scope.showCenteredDiamond = false;
                $scope.showCenteredGemstone = false;

                //accent stones
                $scope.showAccentDiamond = true;
                $scope.showAccentGemstone = true;

            } else if (itemTypeNM == "Pearl" || itemType == 25) {
                $scope.showPearl = true;
                $scope.showMountingandSetting = true;

                $scope.showAccentDiamond = true;
                $scope.showAccentGemstone = true;

                $scope.showCenteredDiamond = false;
                $scope.showCenteredGemstone = false;
            } else if (itemTypeNM == "Fashion" || itemType == 28) {

                $scope.showCenteredDiamond = false;
                $scope.showCenteredGemstone = false;

                //accent stones
                $scope.showAccentDiamond = true;
                $scope.showAccentGemstone = true;
            }
            else if (itemTypeNM == "Eternity Band" || itemType == 29) {

                //accent stones
                $scope.showAccentDiamond = true;
                $scope.showAccentGemstone = true;
            }

        }
        //bracelets id=8
        else if (itemCatagory == 8 && (itemType != null || itemType != "undefined")) {

            if (itemTypeNM == "Bangle" || itemType == 5) {
                //accent stones
                $scope.showAccentDiamond = true;
                $scope.showAccentGemstone = true;
            }
            else if (itemTypeNM == "Diamond Tennis" || itemType == 6) {

                //accent stones
                $scope.showAccentDiamond = true;
            }
            else if (itemTypeNM == "Diamond Gemstone Tennis" || itemType == 7) {

                //accent stones
                $scope.showAccentDiamond = true;
                $scope.showAccentGemstone = true;
            }
            else if (itemTypeNM == "Chain (No Stones)" || itemType == 8) {

                $scope.showChainandSetting = true;
                $scope.showMountingandSetting = false;

            } else if (itemTypeNM == "Pearl Strand" || itemType == 24) {
                $scope.showPearl = true;
                $scope.showMountingandSetting = true;
                //accent stones
                $scope.showAccentDiamond = true;
                $scope.showAccentGemstone = true;
            } else {

            }
        }
        //Necklaces id=9
        else if (itemCatagory == 9 && (itemType != null || itemType != "undefined")) {

            if (itemTypeNM == "Diamond Solitaire" || itemType == 9) {
                //show centered stone type options drop down
                $scope.showCenteredStone = true;
                $scope.showCenteredDiamond = true;

                //chain details
                $scope.showChain = true;
            }
            else if (itemTypeNM == "Diamond Fashion" || itemType == 10) {
                //accent stones
                $scope.showAccentDiamond = true;
                $scope.showAccentGemstone = true;

                $scope.showCenteredStone = true;

                //chain details
                $scope.showChain = true;
            }
            else if (itemTypeNM == "Diamond Tennis Necklace" || itemType == 11) {

                //accent stones
                $scope.showAccentDiamond = true;
            }
            else if (itemTypeNM == "Colored Gemstone" || itemType == 12) {

                //accent stones
                $scope.showAccentDiamond = true;
                $scope.showAccentGemstone = true;

                //chain details
                $scope.showChain = true;
            }
            //Chain (No Stones)
            else if (itemTypeNM == "Chain (No Stones)" || itemType == 21) {

                $scope.showChainandSetting = true;
                $scope.showMountingandSetting = false;

            } else if (itemTypeNM == "Pearl Strand" || itemType == 23) {
                $scope.showPearl = true;
                $scope.showMountingandSetting = true;

                //accent stones
                $scope.showAccentDiamond = true;
                $scope.showAccentGemstone = true;

                $scope.showCenteredStone = true;

                //chain details
                $scope.showChain = true;
            } else {

            }
        }
        //Earrings id=10
        else if (itemCatagory == 10 && (itemType != null || itemType != "undefined")) {

            if (itemTypeNM == "Diamond Stud" || itemType == 13) {
                //accent stones
                $scope.showAccentDiamond = true;

                //show centered stone
                $scope.showCenteredStone = true;
                $scope.showCenteredDiamond = false;

                //for paired diamond
                $scope.showCheckboxOption = true;
                $scope.showPairedDiamond = true;
            }
            else if (itemTypeNM == "Hoop" || itemType == 14) {
                //accent stones
                $scope.showAccentDiamond = true;
                $scope.showAccentGemstone = true;
            }
            else if (itemTypeNM == "Diamond Fashion" || itemType == 15) {

                //$scope.showCenteredDiamond = true;
                $scope.showAdditionalGemstone = true;

                //accent stones
                $scope.showAccentDiamond = true;
                $scope.showAccentGemstone = true;
            }
            else if (itemTypeNM == "Colored Gemstone" || itemType == 22) {

                $scope.showAdditionalDiamond = true;

                //accent stones
                $scope.showAccentDiamond = true;
                $scope.showAccentGemstone = true;
            } else if (itemTypeNM == "Pearl" || itemType == 26) {
                $scope.showPearl = true;
                $scope.showMountingandSetting = true;

                //accent stones
                $scope.showAccentDiamond = true;
                $scope.showAccentGemstone = true;

                //show centered stone type options drop down
                $scope.showCenteredStoneEarring = true;

            }
            else {
            }
        }
        //stone id=11
        else if (itemCatagory == 11 && (itemType != null || itemType != "undefined")) {

            if (itemTypeNM == "Loose Diamonds" || itemType == 16) {
                $scope.showLooseDiamond = true;
                $scope.showMountingandSetting = false;
            }
            else if (itemTypeNM == "Loose Gemstones" || itemType == 17) {
                $scope.showLooseGemstone = true;
                $scope.showMountingandSetting = false;
            }

            else if (itemTypeNM == "Loose Pearl" || itemType == 27) {
                $scope.showLoosePearl = true;
                $scope.showMountingandSetting = false;
            }
            else {
            }
        }
        //watch =
        else if (itemCatagory == 149) {
            $scope.showWatch = true;
            $scope.showMountingandSetting = false;
        }
        //other
        else if (itemCatagory == 150 && (itemType != null || itemType != "undefined")) {

            //accent stones
            $scope.showAccentDiamond = true;
            $scope.showAccentGemstone = true;

            //chain details
            $scope.showChain = true;

            if ($scope.policyHolderReviewDetails.appraisalDetails.diamondDetails != null && $scope.policyHolderReviewDetails.appraisalDetails.diamondDetails.length > 0) {
                $scope.showMainDiamondDetails = true;
            }

            if ($scope.policyHolderReviewDetails.appraisalDetails.stoneDetails != null && $scope.policyHolderReviewDetails.appraisalDetails.stoneDetails.length > 0) {
                $scope.showMainGemstoneDetails = true;
            }

        }


        // Centered diamond / gemstone
        if ($scope.centeredStoneType == 187) {
            $scope.showCenteredDiamond = true;
        }

        if ($scope.centeredStoneType == 188) {
            $scope.showCenteredGemstone = true;
        }

        // Chain question "Yes" then display estimate label
        if ($scope.policyHolderReviewDetails.appraisalDetails.chainExists == 5) {
            $scope.showChainDetailForm = true;
        } else {
            $scope.showChainDetailForm = false;
        }

    }

    $scope.GoToPolicyHolderAcceptStatus = GoToPolicyHolderAcceptStatus;
    function GoToPolicyHolderAcceptStatus() {
        $(".page-spinner-bar").removeClass("hide");
        var status = "COVERAGE APPROVED";
        var msg = "Congratulations! Your new appraisal should be issued shortly.";
        setPolicyHolderReviewStatus(status, msg);
    };

    $scope.GoToPolicyHolderDeclineStatus = GoToPolicyHolderDeclineStatus;
    function GoToPolicyHolderDeclineStatus() {
        $(".page-spinner-bar").removeClass("hide");
        var status = "COVERAGE DECLINED";
        var msg = "Okay, thanks. We will note the file that you've declined the additional coverage.";
        setPolicyHolderReviewStatus(status, msg);
    };

    $scope.GoToPolicyHolderOwnAppraisalStatus = GoToPolicyHolderOwnAppraisalStatus;
    function GoToPolicyHolderOwnAppraisalStatus() {
        $(".page-spinner-bar").removeClass("hide");
        var status = "WAITING ON PH APPRAISAL";
        var msg = "Okay, we'll wait for your new appraisal.";
        setPolicyHolderReviewStatus(status, msg);
    };

    $scope.setPolicyHolderReviewStatus = setPolicyHolderReviewStatus;
    function setPolicyHolderReviewStatus(status, msg) {
        var param =
        {
            "appraisalId": sessionStorage.getItem("appraisalId"),
            "reviewStatus": status,
            "appraisalNumber": sessionStorage.getItem("smsAppraisalIdForPH"),
            "phFname": $scope.Policyholder.FName,
            "phLname": $scope.Policyholder.LName,
            "policyNumber": sessionStorage.getItem("policyNumber"),
            "xOriginator":sessionStorage.getItem("Xoriginator")
        }


        var reviewStatus = AppraisalService.setPHReviewStatus(param);
        reviewStatus.then(function (success) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            bootbox.alert("<b>Confirmation</b><hr/>" + msg + "");
            ValidateMobileNumber($scope.mobNo);

        }, function (error) {
            toastr.remove()
            toastr.error(error.data.errorMessage, "Error");
            $(".page-spinner-bar").addClass("hide");
        });

    };

    function ConfirmationMsgBox(msg) {
        bootbox.confirm({
            title: "Confirmation",
            message: msg,
            buttons: {
                confirm: {
                    label: "Ok",
                    className: 'btn-success'
                }
            },
            callback: function (result) { }
        });
    }

    function isNullData(objData) {
        if (objData == null || objData == 'null' || objData == '' || objData == 'undefined') {
            return true;
        } else {
            return false;
        }
    }

    //Jewelry MER
    $scope.likeOrUnlikeOption = likeOrUnlikeOption;
    function likeOrUnlikeOption(replacementId) {
        angular.forEach($scope.optionsItems, function (item) {
            if(replacementId == item.replacementId){
                    if(item.itemType == "CENTER_DIAMOND"){
                        if(item.itemLiked  == true){
                            $scope.yourSelections.diamondOptions.splice($scope.yourSelections.diamondOptions.indexOf(item),1);
                            $scope.yourSelections.total -= parseFloat(item.totalReplacementPrice);
                            item.itemLiked  = false;
                        } else {
                            $scope.yourSelections.diamondOptions.push(item);
                            $scope.yourSelections.total += parseFloat(item.totalReplacementPrice);
                            item.itemLiked  = true;
                        }
                    }
                    if(item.itemType == "SETTINGS"){
                        if(item.itemLiked  == true){
                            $scope.yourSelections.settingOptions.splice($scope.yourSelections.settingOptions.indexOf(item),1);
                            $scope.yourSelections.total -= parseFloat(item.totalReplacementPrice);
                            item.itemLiked  = false;
                        } else {
                            $scope.yourSelections.settingOptions.push(item);
                            $scope.yourSelections.total += parseFloat(item.totalReplacementPrice);
                            item.itemLiked  = true;
                        }
                    }
                    if(item.itemType == "CENTER_GEMSTONE"){
                        if(item.itemLiked  == true){
                            $scope.yourSelections.centerStoneGemstonesOptions.splice($scope.yourSelections.centerStoneGemstonesOptions.indexOf(item),1);
                            $scope.yourSelections.total -= parseFloat(item.totalReplacementPrice);
                            item.itemLiked  = false;
                        } else {
                            $scope.yourSelections.centerStoneGemstonesOptions.push(item);
                            $scope.yourSelections.total += parseFloat(item.totalReplacementPrice);
                            item.itemLiked  = true;
                        }
                    }
                    if(item.itemType == "WEDDING_BAND"){
                        if(item.itemLiked  == true){
                            $scope.yourSelections.weddingbandOptions.splice($scope.yourSelections.weddingbandOptions.indexOf(item),1);
                            $scope.yourSelections.total -= parseFloat(item.totalReplacementPrice);
                            item.itemLiked  = false;
                        } else {
                            $scope.yourSelections.weddingbandOptions.push(item);
                            $scope.yourSelections.total += parseFloat(item.totalReplacementPrice);
                            item.itemLiked  = true;
                        }
                    }

                    if(item.itemType == "CHAINS"){
                        if(item.itemLiked  == true){
                            $scope.yourSelections.chains.splice($scope.yourSelections.chains.indexOf(item),1);
                            $scope.yourSelections.total -= parseFloat(item.totalReplacementPrice);
                            item.itemLiked  = false;
                        } else {
                            $scope.yourSelections.chains.push(item);
                            $scope.yourSelections.total += parseFloat(item.totalReplacementPrice);
                            item.itemLiked  = true;
                        }
                    }
                    if(item.itemType == "LEFT_CENTER_DIAMOND"){
                        if(item.itemLiked  == true){
                            $scope.yourSelections.leftCenterStoneDiamonds.splice($scope.yourSelections.leftCenterStoneDiamonds.indexOf(item),1);
                            $scope.yourSelections.total -= parseFloat(item.totalReplacementPrice);
                            item.itemLiked  = false;
                        } else {
                            $scope.yourSelections.leftCenterStoneDiamonds.push(item);
                            $scope.yourSelections.total += parseFloat(item.totalReplacementPrice);
                            item.itemLiked  = true;
                        }
                    }
                    if(item.itemType == "LEFT_CENTER_GEMSTONE"){
                        if(item.itemLiked  == true){
                            $scope.yourSelections.leftCenterStoneGemstones.splice($scope.yourSelections.leftCenterStoneGemstones.indexOf(item),1);
                            $scope.yourSelections.total -= parseFloat(item.totalReplacementPrice);
                            item.itemLiked  = false;
                        } else {
                            $scope.yourSelections.leftCenterStoneGemstones.push(item);
                            $scope.yourSelections.total += parseFloat(item.totalReplacementPrice);
                            item.itemLiked  = true;
                        }
                    }
                    if(item.itemType == "RIGHT_CENTER_DIAMOND"){
                        if(item.itemLiked  == true){
                            $scope.yourSelections.rightCenterStoneDiamonds.splice($scope.yourSelections.rightCenterStoneDiamonds.indexOf(item),1);
                            $scope.yourSelections.total -= parseFloat(item.totalReplacementPrice);
                            item.itemLiked  = false;
                        } else {
                            $scope.yourSelections.rightCenterStoneDiamonds.push(item);
                            $scope.yourSelections.total += parseFloat(item.totalReplacementPrice);
                            item.itemLiked  = true;
                        }
                    }
                    if(item.itemType == "RIGHT_CENTER_GEMSTONE"){
                        if(item.itemLiked  == true){
                            $scope.yourSelections.rightCenterStoneGemstones.splice($scope.yourSelections.rightCenterStoneGemstones.indexOf(item),1);
                            $scope.yourSelections.total -= parseFloat(item.totalReplacementPrice);
                            item.itemLiked  = false;
                        } else {
                            $scope.yourSelections.rightCenterStoneGemstones.push(item);
                            $scope.yourSelections.total += parseFloat(item.totalReplacementPrice);
                            item.itemLiked  = true;
                        }
                    }
                    if(item.itemType == "CENTER_PEARL"){
                        if(item.itemLiked  == true){
                            $scope.yourSelections.centerStonePearls.splice($scope.yourSelections.centerStonePearls.indexOf(item),1);
                            $scope.yourSelections.total -= parseFloat(item.totalReplacementPrice);
                            item.itemLiked  = false;
                        } else {
                            $scope.yourSelections.centerStonePearls.push(item);
                            $scope.yourSelections.total += parseFloat(item.totalReplacementPrice);
                            item.itemLiked  = true;
                        }
                    }
                    if(item.itemType == "MAIN_WATCH"){
                        if(item.itemLiked  == true){
                            $scope.yourSelections.mainWatchs.splice($scope.yourSelections.mainWatchs.indexOf(item),1);
                            $scope.yourSelections.total -= parseFloat(item.totalReplacementPrice);
                            item.itemLiked  = false;
                        } else {
                            $scope.yourSelections.mainWatchs.push(item);
                            $scope.yourSelections.total += parseFloat(item.totalReplacementPrice);
                            item.itemLiked  = true;
                        }
                    }
                    if(item.itemType == "CUSTOM_ADDITIONS"){
                        if(item.itemLiked  == true){
                            $scope.yourSelections.customAdditions.splice($scope.yourSelections.customAdditions.indexOf(item),1);
                            $scope.yourSelections.total -= parseFloat(item.totalReplacementPrice);
                            item.itemLiked  = false;
                        } else {
                            $scope.yourSelections.customAdditions.push(item);
                            $scope.yourSelections.total += parseFloat(item.totalReplacementPrice);
                            item.itemLiked  = true;
                        }
                    }
            }            
        });  
    }


    $scope.sendMailToAssociate = sendMailToAssociate;
    function sendMailToAssociate(){
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            // "claimNumber" : $scope.claimNumber,
            // "associateName" : $scope.jewleryItemDetails.associate != null && $scope.jewleryItemDetails.associate.firstName,
            // "policyholderName" : $scope.policyHolderReviewDetails != null && $scope.policyHolderReviewDetails.firstName+" "+$scope.policyHolderReviewDetails.lastName,
            // "companyWebsite" : $scope.companyInfo.companyWebsite,
            // "itemId" : $scope.itemNumber,
            // "vendorAssociateEmail":$scope.jewleryItemDetails.associate != null && $scope.jewleryItemDetails.associate.email
            "claimId": sessionStorage.getItem("claimIdForJewelryPH"),
            "itemId" : $scope.itemNumber
        }
        var mailStatus = JewelryCustomComparableService.sendMailToAssociate(param);
        mailStatus.then(function (success) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.success("Your request for a contact with the Artigem associate has been sent. You will shortly receive a phone call from the associate.")

        }, function (error) {
            toastr.remove()
            toastr.error("Error");
            $(".page-spinner-bar").addClass("hide");
        });
    }

    $scope.sortLikedItems = sortLikedItems;
        function sortLikedItems(){
            // Sort Favourite Selected item first
            $scope.diamondOptions.sort((a, b) =>  (a.itemFavourite === b.itemFavourite)? 0 : a.itemFavourite? -1 : 1);
            $scope.centerStoneGemstonesOptions.sort((a, b) =>  (a.itemFavourite === b.itemFavourite)? 0 : a.itemFavourite? -1 : 1);
            $scope.settingOptions.sort((a, b) =>  (a.itemFavourite === b.itemFavourite)? 0 : a.itemFavourite? -1 : 1);
            $scope.weddingbandOptions.sort((a, b) =>  (a.itemFavourite === b.itemFavourite)? 0 : a.itemFavourite? -1 : 1);

            $scope.chains.sort((a, b) =>  (a.itemFavourite === b.itemFavourite)? 0 : a.itemFavourite? -1 : 1);
            $scope.leftCenterStoneDiamonds.sort((a, b) =>  (a.itemFavourite === b.itemFavourite)? 0 : a.itemFavourite? -1 : 1);
            $scope.leftCenterStoneGemstones.sort((a, b) =>  (a.itemFavourite === b.itemFavourite)? 0 : a.itemFavourite? -1 : 1);
            $scope.rightCenterStoneDiamonds.sort((a, b) =>  (a.itemFavourite === b.itemFavourite)? 0 : a.itemFavourite? -1 : 1);
            $scope.rightCenterStoneGemstones.sort((a, b) =>  (a.itemFavourite === b.itemFavourite)? 0 : a.itemFavourite? -1 : 1);
            $scope.centerStonePearls.sort((a, b) =>  (a.itemFavourite === b.itemFavourite)? 0 : a.itemFavourite? -1 : 1);
            $scope.mainWatchs.sort((a, b) =>  (a.itemFavourite === b.itemFavourite)? 0 : a.itemFavourite? -1 : 1);
            $scope.customAdditions.sort((a, b) =>  (a.itemFavourite === b.itemFavourite)? 0 : a.itemFavourite? -1 : 1);
        }


         // Update for favourite item
         $scope.updateLikedItem = updateLikedItem;
         function updateLikedItem() {
              //Request param
             var param = {
                 "replacementItems": $scope.optionsItems
             };
 
             //Add/Update quick addcustom item
             var getItemDetailsOnId = JewelryCustomComparableService.updateLikeItem(param);
             getItemDetailsOnId.then(function (success) {
                 sendMailToAssociate();
                 
             }, function (error) { 
                 $(".page-spinner-bar").addClass("hide");               
                 toastr.remove();
                 toastr.error(error.data.errorMessage, "Error");
             });
         }

         $scope.CreateMerPDF = CreateMerPDF;
         function CreateMerPDF() {
             var printContents = document.getElementById('PrintableDiv').innerHTML;
             var pdfTitle = "#" + $scope.claimNumber + "_" + $scope.policyHolderReviewDetails.lastName + "_" + $scope.jewleryItemDetails.itemNumber;
             var popupWin = window.open('', '_blank', 'width=300,height=300');
             popupWin.document.open();
             popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /> <link href="assets/global/plugins/bootstrap/css/bootstrap.css" rel="stylesheet" type="text/css" /> <title>' + pdfTitle + '</title></head><body onload="window.print()">' + printContents + '</body></html>');
             popupWin.document.close();
     
         };

         $scope.getVendorLogo = getVendorLogo;
         function getVendorLogo(){
            $scope.vendorLogo = localStorage.getItem("vendorLogo");
         }
});
