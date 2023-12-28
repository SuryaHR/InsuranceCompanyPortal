angular.module('MetronicApp').controller('PolicyholderEmailReviewPopupController', function ($timeout, $rootScope, $filter, $uibModal, $scope, $translate, $translatePartialLoader, $location, JewelryCustomComparableService, EmailData) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    
    $translatePartialLoader.addPart('PolicyHolderReview');
    $translate.refresh();
    $scope.description = "";    
    $scope.Policyholder = {};
    $timeout(function () {
        $scope.Policyholder.InsuranceCarrier = sessionStorage.getItem('insuranceCarrier');
    }, 500);
    console.log("EmailData: ", EmailData);
     if (!isNullData(EmailData)) {
        $scope.Policyholder.FullName = EmailData ? $filter('constructName')(EmailData.policyHolderLName, EmailData.policyHolderFName) : "";        
        $scope.Policyholder.Name = EmailData ? EmailData.policyHolderFName : "";
        $scope.Policyholder.PhoneNo = $filter('tel')(EmailData.phone ? EmailData.phone : null);
        $scope.Policyholder.email = EmailData.email ? EmailData.email : "";
       
        $scope.emailId =EmailData.ClaimNumber + "*" + EmailData.claimId + "*" +EmailData.ItemId;
        $scope.associatePhone = $filter('tel')(EmailData.associatePhone ? EmailData.associatePhone : null);
   }
    if (sessionStorage.getItem('Name') != null && sessionStorage.getItem('Name') != "") {
        var name = sessionStorage.getItem('Name');
        var fullAssociateName = name.split(',');
        $scope.associateName = fullAssociateName[1] + ' ' + fullAssociateName[0];
    } else {
        $scope.associateName = '';
    }
    var url = window.location.href;
    var domain = url.split("#")[0];
    domain += '#/JewelryPolicyHolderReview?id=' + $scope.emailId;

    $scope.description  = "Dear " + $scope.Policyholder.Name + ', ' + '\n\n' + "Please find the link to access the MER for your jewelry item that you had claimed. Please reach out to me on "+ $scope.associatePhone + " incase you have any questions."+ '' + '\n\n' + 'Thanks,' + '\n' + $scope.associateName + ' ' + '\n\n' + domain;
    $scope.message ="Dear " + $scope.Policyholder.Name + ', ' + '\n\n' + "Please find the link to access the MER for your jewelry item that you had claimed. Please reach out to me on "+ $scope.associatePhone + " in case you have any questions."+ '' + '\n\n' + 'Thanks,' + '\n' + $scope.associateName + ' ' + '\n\n';

    
    //Cancel
    $scope.cancel = function () {
        $scope.$close();
    };    

    // Send to Policy Holder review - SMS
    $scope.SendEmailToPH = SendEmailToPH;
    function SendEmailToPH() {
        $(".page-spinner-bar").removeClass("hide");
        $scope.$close();
        $scope.cellPhoneNumber = EmailData && EmailData.phone ? EmailData.phone : null;        
        var param = {
            "receiverEmail" : EmailData.email,
            "subject" : "Review Jewelry Custom Comparables from " + $scope.associateName,
            "message" : $scope.message,
            "from" : $scope.associateName,
            "url" :domain
        };
        
        var sendEmail = JewelryCustomComparableService.sendEmailToPolicyholder(param);
        sendEmail.then(function (success) {
            var emailInfo = success.data;
            //sessionStorage.setItem("emailJewelryUrl", emailInfo.urlInfo.url);
            $(".page-spinner-bar").addClass("hide");
            toastr.remove()
            var msg = "Email with a link to the MER was successfully sent to the policyholder";
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
