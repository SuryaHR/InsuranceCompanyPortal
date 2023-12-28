angular.module('MetronicApp').controller('PolicyHolderReviewController', function ($timeout, $rootScope, $filter, $uibModal, $scope, $translate, $translatePartialLoader, $location, AppraisalService, appraisalData) {
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
        //  console.log('appraisalData',JSON.parse(window.sessionStorage.getItem("appraisalDTO")));
    }

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
            var second = (parseInt(angular.isDefined($scope.PhoneNumber.SecondDigit) && $scope.PhoneNumber.SecondDigit != "" ? $scope.PhoneNumber.SecondDigit : null));
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

    $scope.ValidateMobileNumber = ValidateMobileNumber;
    function ValidateMobileNumber(mobileNumber) {
        $scope.mobNo = mobileNumber;
        $(".page-spinner-bar").removeClass("hide");
        var param =
        {
            "url": sessionStorage.getItem("smsUrlForPH"),
            "lastDigits": parseInt(mobileNumber)

        }
        var validateMobileNo = AppraisalService.ValidateMobileNumber(param);
        validateMobileNo.then(function (success) {
            $scope.policyHolderReviewDetails = success.data.PolicyholderReviewDetails;
            if ($scope.policyHolderReviewDetails == null) {
                toastr.remove();
                toastr.error(success.data.message, "Error");
                $(".page-spinner-bar").addClass("hide");
            }
            else {
                $(".page-spinner-bar").addClass("hide");
                if ($scope.policyHolderReviewDetails != null) {
                    $scope.Policyholder.InsuranceAgentFname = $scope.policyHolderReviewDetails.contactInfo.firstName;
                    $scope.Policyholder.InsuranceAgentLname = $scope.policyHolderReviewDetails.contactInfo.lastName;
                    $scope.Policyholder.AgencyCode = $scope.policyHolderReviewDetails.contactInfo.agencyCode;
                    $scope.Policyholder.AppraisalData = $scope.policyHolderReviewDetails.appraisalDetails.appraisalEffectiveDate;
                    $scope.Policyholder.TodaysDate = $scope.policyHolderReviewDetails.todaysDate;
                    $scope.Policyholder.OriginalAppraisalValue = $scope.policyHolderReviewDetails.appraisalDetails.appraisalOldValue;
                    $scope.Policyholder.SCInsuranceReplaceValue = $scope.policyHolderReviewDetails.appraisalDetails.sc_insuranceReplacementValue;
                    $scope.Policyholder.RenewalDate = $scope.policyHolderReviewDetails.policyHolder.policyRenewalDate;
                    $scope.Policyholder.FName = $scope.policyHolderReviewDetails.policyHolder.primaryPolicyHolderFname,
                        //sessionStorage.setItem("phFname", $scope.Policyholder.FName);
                        $scope.Policyholder.LName = $scope.policyHolderReviewDetails.policyHolder.primaryPolicyHolderLname,
                        //sessionStorage.setItem("phLname",$scope.Policyholder.LName);
                        $scope.Policyholder.PolicyNumber = $scope.policyHolderReviewDetails.policyHolder.policyNumber,
                        sessionStorage.setItem("policyNumber", $scope.Policyholder.PolicyNumber);
                    $scope.Policyholder.AppraisalNumber = $scope.policyHolderReviewDetails.appraisalDetails.appraisalNumber;
                    if ($scope.policyHolderReviewDetails.appraisalDetails.itemCategory.atttibuteValue == 'Loose Stone') {
                        $scope.Policyholder.Gender = ($scope.policyHolderReviewDetails.appraisalDetails.gender) ? $scope.policyHolderReviewDetails.appraisalDetails.gender : "";
                    } else if ($scope.policyHolderReviewDetails.appraisalDetails.itemCategory.atttibuteValue == 'Watch') {
                        $scope.isshowSpeedCheckDescription = false;
                        $scope.Policyholder.Gender = ($scope.policyHolderReviewDetails.appraisalDetails.gender) ? $scope.policyHolderReviewDetails.appraisalDetails.attributeValue : "";
                    }
                    else {
                        $scope.isshowSpeedCheckDescription = true;
                        $scope.Policyholder.Gender = ($scope.policyHolderReviewDetails.appraisalDetails.gender) ? $scope.policyHolderReviewDetails.appraisalDetails.gender.attributeValue : "";
                    }
                    if ($scope.policyHolderReviewDetails.appraisalDetails.isCustom.atttibuteValue == "yes")
                        $scope.Policyholder.Custom = "custom";
                    $scope.totalInsuranceValue = $scope.policyHolderReviewDetails.appraisalDetails.insurancePremiumCost * 12;

                    //console.log($scope.policyHolderReviewDetails.appraisalDetails);

                    if ($scope.policyHolderReviewDetails.appraisalDetails.designer.atttibuteValue == "yes")
                        $scope.Policyholder.designer = "designer brand";

                    $scope.Policyholder.Type = ($scope.policyHolderReviewDetails.appraisalDetails.type) ? $scope.policyHolderReviewDetails.appraisalDetails.type.atttibuteType : "";
                    $scope.Policyholder.ItemCategory = ($scope.policyHolderReviewDetails.appraisalDetails.itemCategory) ? $scope.policyHolderReviewDetails.appraisalDetails.itemCategory.atttibuteValue : "";
                    $scope.Policyholder.metalType = ($scope.policyHolderReviewDetails.appraisalDetails.mountingDetails.typeOfMetal) ? $scope.policyHolderReviewDetails.appraisalDetails.mountingDetails.typeOfMetal.atttibuteValue : "";
                    $scope.Policyholder.metalcolor = ($scope.policyHolderReviewDetails.appraisalDetails.mountingDetails.metalColor) ? $scope.policyHolderReviewDetails.appraisalDetails.mountingDetails.metalColor.atttibuteValue : "";
                    $scope.Policyholder.metalweight = ($scope.policyHolderReviewDetails.appraisalDetails.mountingDetails.metalWeight) ? $scope.policyHolderReviewDetails.appraisalDetails.mountingDetails.metalWeight : "";
                    $scope.Policyholder.Grams = "grams";

                    $scope.labourCost = ($scope.policyHolderReviewDetails.appraisalDetails.sc_labourCost) ? $scope.policyHolderReviewDetails.appraisalDetails.sc_labourCost : 0.0;
                    $scope.totalChainPrice = ($scope.policyHolderReviewDetails.appraisalDetails.sc_totalChainPrice) ? $scope.policyHolderReviewDetails.appraisalDetails.sc_totalChainPrice : 0.0;
                    $scope.totalDiamondPrice = ($scope.policyHolderReviewDetails.appraisalDetails.sc_totalDiamondPrice) ? $scope.policyHolderReviewDetails.appraisalDetails.sc_totalDiamondPrice : 0.0;
                    $scope.totalGemstonePrice = ($scope.policyHolderReviewDetails.appraisalDetails.sc_totalGemStonePrice) ? $scope.policyHolderReviewDetails.appraisalDetails.sc_totalGemStonePrice : 0.0;
                    $scope.totalMountingPrice = ($scope.policyHolderReviewDetails.appraisalDetails.sc_totalMountingPrice) ? $scope.policyHolderReviewDetails.appraisalDetails.sc_totalMountingPrice : 0.0;
                    $scope.totalPearlPrice = ($scope.policyHolderReviewDetails.appraisalDetails.sc_totalPearlPrice) ? $scope.policyHolderReviewDetails.appraisalDetails.sc_totalPearlPrice : 0.0;

                    $scope.centerDiamondTotal = ($scope.policyHolderReviewDetails.appraisalDetails.sc_centerDiamondTotal) ? $scope.policyHolderReviewDetails.appraisalDetails.sc_centerDiamondTotal : 0.0;
                    $scope.centerStoneTotal = ($scope.policyHolderReviewDetails.appraisalDetails.sc_centerStoneTotal) ? $scope.policyHolderReviewDetails.appraisalDetails.sc_centerStoneTotal : 0.0;
                    $scope.totalWeddingBandEstimation = ($scope.policyHolderReviewDetails.appraisalDetails.sc_totalWeddingBandEstimation) ? $scope.policyHolderReviewDetails.appraisalDetails.sc_totalWeddingBandEstimation : 0.0;
                    $scope.totalWatchEstimation = ($scope.policyHolderReviewDetails.appraisalDetails.watchDetails!=null && $scope.policyHolderReviewDetails.appraisalDetails.watchDetails.totalWatchEstimation) ? $scope.policyHolderReviewDetails.appraisalDetails.watchDetails.totalWatchEstimation : 0.0;

                    $scope.accentDiamondItems = $scope.policyHolderReviewDetails.appraisalDetails.mountingDetails.diamondDetails;
                    $scope.accentGemstoneItems = $scope.policyHolderReviewDetails.appraisalDetails.mountingDetails.stoneDetails;

                    // START - Wedding Band changes
                    $scope.wbSettingTotal = 0.0;
                    $scope.totalWeddingBandGemstoneTotal = 0.0;
                    $scope.totalWeddingBandDiamondTotal = 0.0;
                    $scope.isWedding = false;
                    $scope.showWbandDiamond = false;
                    $scope.showWbandGemstone = false;
                    if ($scope.policyHolderReviewDetails.appraisalDetails.weddingBandExists) {
                        $scope.isWedding = true;
                        angular.forEach($scope.policyHolderReviewDetails.appraisalDetails.weddingBandDetails, function (data) {
                            //DimondTotal
                            var diamondTotal = data.sc_totalWeddingBandDiamondsEstimate ? parseFloat(data.sc_totalWeddingBandDiamondsEstimate) : 0.0;
                            $scope.totalWeddingBandDiamondTotal += parseFloat(diamondTotal);
                            //StoneTotal
                            var stoneTotal = data.sc_totalWeddingBandGemstonesEstimate ? parseFloat(data.sc_totalWeddingBandGemstonesEstimate) : 0.0;
                            $scope.totalWeddingBandGemstoneTotal += parseFloat(stoneTotal);
                            //SettingTotal
                            $scope.wbSettingTotal += isNullData(data.mounting && data.mounting.scMountingEstimates) ? 0.0 : parseFloat(data.mounting.scMountingEstimates);

                            $scope.showWbandDiamond = data.mounting.diamondDetails && data.mounting.diamondDetails.length >0 ? true : false;
                            $scope.showWbandGemstone = data.mounting.stoneDetails && data.mounting.stoneDetails.length >0 ? true : false;

                        });
                        // Total of mounting
                        //$scope.totalMountingPrice += $scope.wbSettingTotal;

                        // Total of Accent Diamond & Gemstone / Wedding Band Diamond & Gemstone
                        //var totalAccentWeddingbandDiamonds = parseFloat($scope.totalDiamondPrice) + $scope.totalWeddingBandDiamondTotal;
                        //var totalAccentWeddingbandGemstones = parseFloat($scope.totalGemstonePrice) + $scope.totalWeddingBandGemstoneTotal;
                        //$scope.totalAccentWeddingbandDiamonds = (totalAccentWeddingbandDiamonds == null || totalAccentWeddingbandDiamonds == 0) ? "0.0" : totalAccentWeddingbandDiamonds;
                        //$scope.totalAccentWeddingbandGemstones = (totalAccentWeddingbandGemstones == null || totalAccentWeddingbandGemstones == 0) ? "0.0" : totalAccentWeddingbandGemstones;
                    }
                    // END - Wedding Band changes

                    // Total of mounting
                   // $scope.totalMountingPrice += $scope.wbSettingTotal;

                    // Total of Accent Diamond & Gemstone / Wedding Band Diamond & Gemstone
                    // var totalAccentWeddingbandDiamonds = parseFloat($scope.totalDiamondPrice) + $scope.totalWeddingBandDiamondTotal;
                    // var totalAccentWeddingbandGemstones = parseFloat($scope.totalGemstonePrice) + $scope.totalWeddingBandGemstoneTotal;
                    // $scope.totalAccentWeddingbandDiamonds = (totalAccentWeddingbandDiamonds == null || totalAccentWeddingbandDiamonds == 0) ? "0.0" : totalAccentWeddingbandDiamonds;
                    // $scope.totalAccentWeddingbandGemstones = (totalAccentWeddingbandGemstones == null || totalAccentWeddingbandGemstones == 0) ? "0.0" : totalAccentWeddingbandGemstones;

                    var totalAccentDiamonds = parseFloat($scope.totalDiamondPrice);
                    var totalAccentGemstones = parseFloat($scope.totalGemstonePrice);
                    $scope.totalAccentDiamonds = (totalAccentDiamonds == null || totalAccentDiamonds == 0) ? "0.0" : totalAccentDiamonds;
                    $scope.totalAccentGemstones = (totalAccentGemstones == null || totalAccentGemstones == 0) ? "0.0" : totalAccentGemstones;

                    //$scope.summaryTotal = $scope.labourCost + $scope.totalChainPrice + $scope.totalDiamondPrice + $scope.totalGemstonePrice + $scope.totalMountingPrice + $scope.wbSettingTotal + $scope.totalPearlPrice + $scope.centerDiamondTotal + $scope.centerStoneTotal + $scope.totalWeddingBandEstimation + $scope.totalWatchEstimation + $scope.totalWeddingBandDiamondTotal + $scope.totalWeddingBandGemstoneTotal;
                    $scope.summaryTotal = $scope.labourCost + $scope.totalChainPrice + $scope.totalDiamondPrice + $scope.totalGemstonePrice + $scope.totalMountingPrice + $scope.wbSettingTotal + $scope.totalPearlPrice + $scope.centerDiamondTotal + $scope.centerStoneTotal + $scope.totalWatchEstimation + $scope.totalWeddingBandDiamondTotal + $scope.totalWeddingBandGemstoneTotal;

                    $scope.costSalesTax = $scope.policyHolderReviewDetails.appraisalDetails.salesTaxEstimation != null ? parseFloat($scope.policyHolderReviewDetails.appraisalDetails.salesTaxEstimation) : 0;
                    $scope.salesTaxPt = roundOf2Decimal($scope.costSalesTax == 0 ? 0 : ($scope.costSalesTax * 100 / parseFloat($scope.summaryTotal)));

                    $scope.totalCoverageValue = parseFloat($scope.policyHolderReviewDetails.appraisalDetails.summaryTotal) + $scope.costSalesTax;

                    if ($scope.policyHolderReviewDetails.appraisalDetails.oldInsurancePremiumCost) {
                        $scope.newInsValue = $filter('currency')(parseFloat($scope.policyHolderReviewDetails.appraisalDetails.newInsurancePremiumCost));
                    } else {
                        $scope.newInsValue = $ + '0.00';
                    }

                    if ($scope.policyHolderReviewDetails.appraisalDetails.speedcheckResultDescription) {
                        var description = $scope.policyHolderReviewDetails.appraisalDetails.speedcheckResultDescription;
                        $scope.details = description.substring(0, description.indexOf("Insurance replacement value"));
                    }

                    if ($scope.policyHolderReviewDetails.appraisalDetails.sc_insuranceReplacementValue) {
                        $scope.replacementValue = $filter('currency')(parseFloat($scope.policyHolderReviewDetails.appraisalDetails.sc_insuranceReplacementValue));
                    }

                    if ($scope.totalCoverageValue > $scope.Policyholder.OriginalAppraisalValue) {
                        $scope.hideParagraph = true;
                    } else {
                        $scope.hideParagraph = false;
                    }

                    if ($scope.policyHolderReviewDetails.appraisalDetails.type && $scope.policyHolderReviewDetails.appraisalDetails.type.atttibuteType === 'Pearl') {
                        $scope.showSpeedCheckDescription = false;
                    } else {
                        $scope.showSpeedCheckDescription = true;
                    }

                    var appraisalDetails = $scope.policyHolderReviewDetails.appraisalDetails;
                    if (appraisalDetails.itemCategory && appraisalDetails.itemCategory.atttibuteValue === 'Watch') {
                        $scope.isWatch = true;
                        if (appraisalDetails.watchDetails) {
                            $scope.totalSugValueForWatch = appraisalDetails.watchDetails.totalWatchEstimation ? appraisalDetails.watchDetails.totalWatchEstimation : 0.0;
                        }
                    } else {
                        $scope.isWatch = false;
                    }
                }
                itemSelectedPopulate();

                $scope.PhoneValidation = false;
            }

        }, function (error) {
            $scope.PhoneNumber.FirstDigit = '';
            $scope.PhoneNumber.SecondDigit = '';
            $scope.PhoneNumber.ThirdDigit = '';
            $scope.PhoneNumber.FourthDigit = '';
            toastr.remove()
            toastr.error("Invalid passcode, please try again", "Error");
            $(".page-spinner-bar").addClass("hide");
        });
    };

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


});
