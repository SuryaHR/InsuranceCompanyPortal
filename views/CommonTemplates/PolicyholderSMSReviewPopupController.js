angular.module('MetronicApp').controller('PolicyholderSMSReviewPopupController', function ($timeout, $rootScope, $filter, $uibModal, $scope, $translate, $translatePartialLoader, $location, JewelryCustomComparableService, SMSData) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    //set language
    $translatePartialLoader.addPart('PolicyHolderReview');
    $translate.refresh();
    $scope.description = "";    
    $scope.Policyholder = {};
    $timeout(function () {
        $scope.Policyholder.InsuranceCarrier = sessionStorage.getItem('insuranceCarrier');
    }, 500);
    console.log("SMSData: ", SMSData);
     if (!isNullData(SMSData)) {
        $scope.Policyholder.FullName = SMSData ? $filter('constructName')(SMSData.policyHolderLName, SMSData.policyHolderFName) : "";        
        $scope.Policyholder.Name = SMSData ? SMSData.policyHolderFName : "";
        $scope.Policyholder.PhoneNo = $filter('tel')(SMSData.phone ? SMSData.phone : null);
        $scope.Policyholder.email = SMSData.email ? SMSData.email : "";
       
        $scope.smsId = SMSData.ClaimNumber + "*" +  SMSData.claimId + "*" +SMSData.ItemId;
        $scope.associatePhone = $filter('tel')(SMSData.associatePhone ? SMSData.associatePhone : null);
   }
    if (sessionStorage.getItem('Name') != null && sessionStorage.getItem('Name') != "") {
        // var name = sessionStorage.getItem('Name');
        // var fullAssociateName = name.split(',');
        $scope.associateName = sessionStorage.getItem('UserLastName');
    } else {
        $scope.associateName = '';
    }
    var url = window.location.href;
    var domain = url.split("#")[0];
    domain += '#/JewelryPolicyHolderReview?id=' + $scope.smsId;

    $scope.description  = "Dear " + $scope.Policyholder.Name + ', ' + '\n\n' + "Please find the link to access the MER for your jewelry item that you had claimed. Please reach out to me on "+ $scope.associatePhone + " incase you have any questions."+ '' + '\n\n' + 'Thanks,'+ ''+ '\n'+$scope.associateName + '\n\n' + domain;

    //Cancel
    $scope.cancel = function () {
        $scope.$close();
    };    

    // Send to Policy Holder review - SMS
    $scope.SendSMSToPH = SendSMSToPH;
    function SendSMSToPH() {
        $(".page-spinner-bar").removeClass("hide");
        $scope.$close();
        $scope.cellPhoneNumber = SMSData && SMSData.phone ? SMSData.phone : null;        
        var param = {
            "mobileNumber": $scope.cellPhoneNumber,
            "messageContents": $scope.description,
            "createdBy": sessionStorage.getItem("UserId"),
            "createdDate" : new Date(),
            "claim": {
                "claimNumber": SMSData.ClaimNumber,
                "id": SMSData.claimId
            },
            "item" : {
                 "id" : SMSData.ItemId,
                 "itemUID" : SMSData.itemUID
            },
            "webSite": window.location.href,
            
            "policyHolder": {
                "id": SMSData.policyHolderId,

            },
            "vendorAssociate" : {
                "email" : SMSData.associateEmail
            }
        };
        
        var sendSMS = JewelryCustomComparableService.sendSMSToPolicyholder(param);
        sendSMS.then(function (success) {
            var smsInfo = success.data;
            //sessionStorage.setItem("smsJewelryUrl", smsInfo.urlInfo.url);
            $(".page-spinner-bar").addClass("hide");
            toastr.remove()
            var msg = "SMS with a link to the MER was successfully sent to the policyholder";
            toastr.success(msg, "Confirmation");
            $scope.$close();
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
            $(".page-spinner-bar").addClass("hide");
        });
    };

    function isNullData(objData) {
        if (objData == null || objData == 'null' || objData == '' || objData == 'undefined') {
            return true;
        } else {
            return false;
        }
    }

});
