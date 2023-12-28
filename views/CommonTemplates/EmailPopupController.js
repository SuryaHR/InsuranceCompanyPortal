angular.module('MetronicApp').controller('EmailPopupController', function ($rootScope, $filter, AppraisalService, AuthHeaderService, appraisalData, $uibModal, $scope, $translate, $translatePartialLoader, $location) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    //set language 
    $translatePartialLoader.addPart('EmailPopup');
    $translate.refresh();
    $scope.fileName = null;
    $scope.FileType = null;
    $scope.FileExtension = null;
    $scope.files = [];

    var userRole = sessionStorage.getItem("RoleList");

    $scope.Email = {};
    $scope.Email.emailList = [
    ];
    // if (sessionStorage.getItem('primaryPolicyHolderEmailId') != null && sessionStorage.getItem('primaryPolicyHolderEmailId') != "") {
    //     $scope.emailEnable = false;
    //     $scope.Email.emailList.push(sessionStorage.getItem('primaryPolicyHolderEmailId'));
    // }

    if (appraisalData.policyholderInfo) {
            $scope.emailEnable = false;
            $scope.Email.emailList.push(appraisalData.policyholderInfo.email);
    }

    /* email template */
    var Fname="";
    var Lname="";
    var agentName="";
    var bodyDescription = "The appraisal for your scheduled jewelry item is not valued appropriately on your policy. Please review the Appraisal Evaluation Report in the link below. You can indicate your preferences on whether you would like to move forward with the new coverage and premiums, keep the old coverage and premiums, or if you would like to get your own updated appraisal.";
    if(appraisalData.policyholderInfo){
        Fname = appraisalData.policyholderInfo.firstName;
    }
    if (appraisalData.policyholderInfo) {
        Lname = appraisalData.policyholderInfo.lastName;
    }
    if ((Fname != null && Fname != "") && (Lname != null && Lname != "")) {
        $scope.fullName = Fname + ' ' + Lname;
    }

    $scope.pdfName = sessionStorage.getItem('policyNumber') + ' - ' + $scope.fullName + '.pdf';

    if (sessionStorage.getItem('Name') != null && sessionStorage.getItem('Name') != "") {
        $scope.agentName = sessionStorage.getItem('Name').replace(',', '');
    }

    $scope.url = function () {
        $scope.Email.role = "INSURANCE_AGENT";
        $scope.Email.appraisalId = sessionStorage.getItem("appraisalId");
        $scope.Email.website = window.location.href;
        var responsePromise = AppraisalService.getUrlData($scope.Email);
        responsePromise.then(function (success) {
            $scope.detailURL = success.data.PolicyholderReviewDetails.urlInfo.url;
            var mailDescription = 'Dear ' + Fname.charAt(0).toUpperCase() + Fname.substr(1).toLowerCase() + ',' + '\n\n' + bodyDescription + '\n\n' + 'Thank you,' + '\n\n' + $scope.agentName + '\n\n' + $scope.detailURL;

            $scope.Email.description = mailDescription;
        }, function (error) {

        });
    }

    $scope.Email.subject = "Appraisal For Review";

    //for note attachment
    $scope.SelectNoteFile = SelectNoteFile;
    function SelectNoteFile() {
        angular.element('#NoteFileUpload').trigger('click');
    }
    $scope.filed;
    $scope.getNoteFileDetails = getNoteFileDetails;
    function getNoteFileDetails(event) {
        var files = event.target.files;
        $scope.filed = event.target.files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.file = file;
            reader.fileName = files[i].name;
            reader.fileType = files[i].type;
            reader.fileExtension = files[i].name.substr(files[i].name.lastIndexOf('.'));
            reader.onload = $scope.imageIsLoaded;
            reader.readAsDataURL(file);
        }
    }
    $scope.imageIsLoaded = function (e) {
        $scope.$apply(function () {
            $scope.files.push({ "FileName": e.target.fileName, "FileExtension": e.target.fileExtension, "FileType": e.target.fileType, "Image": e.target.result, "File": e.target.file })
        });
    }
    $scope.RemoveImage = RemoveImage;
    function RemoveImage(item) {
        var index = $scope.files.indexOf(item);
        if (index > -1) {
            $scope.files.splice(index, 1);
        }
    }

    function checkFieldsforGetChainDetails(p){
        if(p.MetalColor || p.MetalLength || p.MetalType || (p.MetalWeight && p.MetalWeight.weight) || (p.MetalWeight && p.MetalWeight.MetalUnit) )
        return true;
        else
        return false;
    }
    
    //$scope.ClaimParticipantsList = objClaim.ParticipantList;    
    $scope.PraticipantIdList = [];

    $scope.Email.emailTo = [];
    $scope.emailId = '';
    //Add note function
    $scope.ok = function (e) {
        $(".page-spinner-bar").removeClass("hide");


        var appraisalId = sessionStorage.getItem("appraisalId");
        $scope.review = {};
        $scope.review.appraisalId = appraisalId;
        $scope.review.userId = sessionStorage.getItem("UserId");
        //$scope.review.userType = "UnderWriter";
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
            "salesTaxEstimation" : appraisalData.salesTaxEstimation,

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
            $scope.Email.appraisalId = sessionStorage.getItem("appraisalId");
            angular.forEach($scope.Email.emailList, function (item) {

                $scope.Email.emailTo.push(item.text);

            });//$scope.Email.emailList
            $scope.Email.userId = sessionStorage.getItem("UserId");
            $scope.Email.role = userRole;
            var promis = AppraisalService.EmailAppraisal($scope.Email);
            promis.then(function (success) {
                $rootScope.ApprisalFormPristine = false;
                // After Save / Updated data, send for Artigem Review
                $scope.emails = "";
                $scope.details = $scope.Email.emailList;
                for (var i = 0; i < $scope.details.length; i++) {
                    var emailId = $scope.details[i].text
                    $scope.emails += emailId;
                    $scope.emails += (i < $scope.details.length - 1) ? ", " : "";
                }
                toastr.remove();
                toastr.success('An email was successfully sent to the recipient ' + $scope.emails, 'Confirmation');
                $(".page-spinner-bar").addClass("hide");
                $location.url("/PolicyDetail");
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



        $scope.$close();



    }
    //Cancel
    $scope.cancel = function () {
        $scope.$close();
    };


});