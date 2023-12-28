angular.module('MetronicApp').controller('RecommendArtigemReviewController', function ($rootScope,$timeout, $filter,$location, ArtigemReviewService, $uibModal, $scope, $translate, $translatePartialLoader,AppraisalService,appraisalData,
    AuthHeaderService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    ///home/pooja/Artigem_sakha_development/InsuranceCompanyPortal/views/InsuranceCommonModules/Popups/RrecommendArtigemReviewController.js
    //set language
    $translatePartialLoader.addPart('ArtigemReview');
    $translate.refresh();

    $scope.init = init;
        function init() {
            $scope.popup = {};
            $scope.popup.message = '';
            $scope.item_Details_Found = appraisalData.item_Speedcheck_Details_Found;
            $scope.isAttributeZeroCheck = appraisalData.isAttributeZeroCheck;
        }
        init();

        function checkFieldsforGetChainDetails(p){
            if(p.MetalColor || p.MetalLength || p.MetalType || (p.MetalWeight && p.MetalWeight.weight) || (p.MetalWeight && p.MetalWeight.MetalUnit) )
            return true;
            else
            return false;
        }

    //Add note function
    $scope.ok = function (e) {
        $(".page-spinner-bar").removeClass("hide");
        var appraisalId = sessionStorage.getItem("appraisalId");
        $scope.count++;
        $scope.review = {};
        $scope.review.appraisalId = appraisalId;
        $scope.review.userId = sessionStorage.getItem("UserId");
        $scope.review.userType = "SpeedcheckContact";
        $scope.review.xOriginator = sessionStorage.getItem("Xoriginator");
        $scope.review.vendorRegNumber = sessionStorage.getItem("speedCheckVendor");
        $scope.review.popupMessage = $scope.popup.message;


        // Save Updated data before send to Artigem Review
        var policyNum = sessionStorage.getItem("policyNumber");
        var createdBy = sessionStorage.getItem("UserId");
        // var mountingDiamondDetails = appraisalData.Appraisal.Mounting.diamondDetails;
        //     var mountingStoneDetails = appraisalData.Appraisal.Mounting.stoneDetails;
        var mountingDetails ={};
        if(angular.isDefined(appraisalData.Appraisal.Mounting) ){
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
     var chainDetails ={};
     if(appraisalData.Appraisal.Chain && appraisalData.Appraisal.Chain.isChain!=6 && checkFieldsforGetChainDetails(appraisalData.Appraisal.Chain) ){
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

        if(appraisalData.Appraisal.ItemCategory && appraisalData.Appraisal.ItemCategory.atttibuteValue === 'Watch'){
           appraisalData.sc_insuranceReplacementValue = (appraisalData.watchDetails && appraisalData.watchDetails.totalWatchEstimation)?appraisalData.watchDetails.totalWatchEstimation:0.0;
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

            "weddingBandDetails":appraisalData.weddingBandDetails,
            "weddingBandExists":appraisalData.weddingBandExists,

            "watchDetails":appraisalData.watchDetails,
            "isCustom": appraisalData.Appraisal.Custom,
            "designer": appraisalData.Appraisal.Designer,
            "itemCategory": appraisalData.Appraisal.ItemCategory,
            "type": appraisalData.Appraisal.ItemType,

            "mountingDetails": mountingDetails,
            "chainDetails": chainDetails,
            "stoneDetails": stoneDetails,
            "pearlDetails" : pearlDetails,
            "diamondDetails": diamondDetails,
            "insurancePremiumCost": appraisalData.Appraisal.insurancePremiumCost,
            "newInsurancePremiumCost": appraisalData.Appraisal.newInsurancePremiumCost,
            "oldInsurancePremiumCost": appraisalData.Appraisal.oldInsurancePremiumCost,
             //speedcheck
             "sc_salvageValue": appraisalData.sc_salvageValue,
             "sc_jwelersCost": appraisalData.sc_jwelersCost,
             "sc_artigemReplacementValue": appraisalData.sc_artigemReplacementValue,
             "sc_insuranceReplacementValue": appraisalData.sc_insuranceReplacementValue,
             "sc_retailValue": appraisalData.sc_retailValue,
             "sc_totalMountingPrice":appraisalData.sc_totalMountingPrice,
             "sc_totalDiamondPrice": appraisalData.sc_totalDiamondPrice,
             "sc_totalGemStonePrice": appraisalData.sc_totalGemStonePrice,
             "sc_labourCost": appraisalData.sc_labourCost,
             "sc_totalChainPrice": appraisalData.sc_totalChainPrice,
             "sc_totalPearlPrice": appraisalData.pearlArtigemReplacementCost,

             "sc_centerDiamondTotal":appraisalData.sc_centerDiamondTotal,
                "sc_centerStoneTotal":appraisalData.sc_centerStoneTotal,
                "sc_totalMountingAccentStonePrice":appraisalData.sc_totalMountingAccentStonePrice,

                "isParedCenteredStone":appraisalData.isParedCenteredStone,

             "speedcheckResultDescription": appraisalData.speedcheckResultDescription,
                "summaryTotal":appraisalData.summaryTotal,
                "salesTaxEstimation" : appraisalData.salesTaxEstimation,
             "deletedAttachments":appraisalData.deletedAttachments,

            "sc_finalEstimate": appraisalData.sc_finalEstimate,
            "speedcheckAppraisalDate" : appraisalData.speedcheckAppraisalDate,

            "centreStoneType":(appraisalData.centreStoneType)?appraisalData.centreStoneType:null,
                "chainExists": (appraisalData.chainExists)?appraisalData.chainExists:null

        };
        $scope.details = details;
        var data = new FormData();
        angular.forEach(appraisalData.attachmentList, function (ItemFile) {
            data.append('file', ItemFile.File);
        });
        data.append("details", angular.toJson(details));

        //first save then send for review
        if (appraisalData.formStatus && !appraisalData.IsEditOrder) {
            //$scope.IsSpeedCheckDisabled = true;

            if(angular.isDefined(appraisalData.Appraisal.Mounting) ){
                mountingDetails = {
                   //"id": appraisalData.Appraisal.Mounting.id,
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
            var details = {

                //"id": sessionStorage.getItem("appraisalId"),
                //"appraisalNumber": sessionStorage.getItem("appraisalNumber"),
                "original_appraisal_description": appraisalData.Appraisal.OriginalDescription,
                "appraisalEffectiveDate": ((appraisalData.Appraisal.AppraisalDate !== null && angular.isDefined(appraisalData.Appraisal.AppraisalDate)) ? $filter('DatabaseDateFormatMMddyyyy')(appraisalData.Appraisal.AppraisalDate) : null),

                "appraisalOldValue": appraisalData.Appraisal.AppraisalValue,
                "policyNumber": policyNum,
                "createdBy": createdBy,

                "gender": appraisalData.Appraisal.Gender,

                "watchDetails":appraisalData.watchDetails,
                "isCustom": appraisalData.Appraisal.Custom,
                "designer": appraisalData.Appraisal.Designer,
                "itemCategory": appraisalData.Appraisal.ItemCategory,
                "type": appraisalData.Appraisal.ItemType,

                "weddingBandDetails":appraisalData.weddingBandDetails,
                "weddingBandExists":appraisalData.weddingBandExists,

                "mountingDetails": mountingDetails,
                "chainDetails": chainDetails,
                "stoneDetails": stoneDetails,
                "pearlDetails" : pearlDetails,
                "diamondDetails": diamondDetails,
                "insurancePremiumCost": appraisalData.Appraisal.insurancePremiumCost,
                "newInsurancePremiumCost": appraisalData.Appraisal.newInsurancePremiumCost,
                "oldInsurancePremiumCost": appraisalData.Appraisal.oldInsurancePremiumCost,
                 //speedcheck
                 "sc_salvageValue": appraisalData.sc_salvageValue,
                 "sc_jwelersCost": appraisalData.sc_jwelersCost,
                 "sc_artigemReplacementValue": appraisalData.sc_artigemReplacementValue,
                 "sc_insuranceReplacementValue": appraisalData.sc_insuranceReplacementValue,
                 "sc_retailValue": appraisalData.sc_retailValue,
                 "sc_totalMountingPrice":appraisalData.sc_totalMountingPrice,
                 "sc_totalDiamondPrice": appraisalData.sc_totalDiamondPrice,
                 "sc_totalGemStonePrice": appraisalData.sc_totalGemStonePrice,
                 "sc_labourCost": appraisalData.sc_labourCost,
                 "sc_totalChainPrice": appraisalData.sc_totalChainPrice,
                 "sc_totalPearlPrice": appraisalData.sc_totalPearlPrice,

                 "sc_centerDiamondTotal":appraisalData.sc_centerDiamondTotal,
                    "sc_centerStoneTotal":appraisalData.sc_centerStoneTotal,
                    "sc_totalMountingAccentStonePrice":appraisalData.sc_totalMountingAccentStonePrice,

                    "isParedCenteredStone":appraisalData.isParedCenteredStone,

                 "speedcheckResultDescription": appraisalData.speedcheckResultDescription,
                    "summaryTotal":appraisalData.summaryTotal,
                    "salesTaxEstimation" : appraisalData.salesTaxEstimation,
                 "deletedAttachments":appraisalData.deletedAttachments,

                "sc_finalEstimate": appraisalData.sc_finalEstimate,
                "speedcheckAppraisalDate" : appraisalData.speedcheckAppraisalDate,
                "centreStoneType":(appraisalData.centreStoneType)?appraisalData.centreStoneType:null,
                "chainExists": (appraisalData.chainExists)?appraisalData.chainExists:null

            };
            $scope.details = details;
            var data = new FormData();
            angular.forEach(appraisalData.attachmentList, function (ItemFile) {
                data.append('file', ItemFile.File);
            });
            data.append("details", angular.toJson(details));
            var promis = AppraisalService.SaveAppraisal(data);

            //var promis = AppraisalService.UpdateAppraisal(data);
            promis.then(function (success) {
                // After Save / Updated data, send for Artigem Review
                sessionStorage.setItem("appraisalId", success.data.saveSuccess.appraisalId);
                appraisalId = success.data.saveSuccess.appraisalId;
                $scope.review.appraisalId = appraisalId;
                var promis = ArtigemReviewService.ArtigemReview($scope.review);
                promis.then(function (success) {
                    toastr.remove();
                    toastr.success("The appraisal was submitted to Artigem for review", "Confirmation");
                    $(".page-spinner-bar").addClass("hide");
                    $location.path('/PolicyDetail');
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
        else{
        var promis = AppraisalService.UpdateAppraisal(data);
        promis.then(function (success) {
            // After Save / Updated data, send for Artigem Review
            var promis = ArtigemReviewService.ArtigemReview($scope.review);
            promis.then(function (success) {
                toastr.remove();
                toastr.success("The appraisal was submitted to Artigem for review", "Confirmation");
                $(".page-spinner-bar").addClass("hide");
                $location.path('/PolicyDetail');
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
        $scope.$close();
    }
    //Cancel
    $scope.cancel = function () {
        $scope.$close();
    };
});
