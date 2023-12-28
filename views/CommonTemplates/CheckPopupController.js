angular.module('MetronicApp').controller('CheckPopupController', function ($timeout, $rootScope, $filter, $uibModal, $scope, $translate, $translatePartialLoader, $location,  AdjusterPropertyClaimDetailsService,objClaim) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('PolicyHolderReview');
    $translate.refresh();
    $scope.itemCnt = objClaim.claimLineItemDetails.length>1?objClaim.claimLineItemDetails.length+" items":objClaim.claimLineItemDetails.length+" item";
    $scope.total = objClaim.ammount;
    $scope.checkNumber = "";
    $scope.paymentType = objClaim.payment == 'payment'?'Payment Details':'Holdover Details';
    //set language
   $scope.submit=function(){
    var param = {
        "checkNumber": $scope.checkNumber,
        "ammount": objClaim.ammount,
        "claimLineItemDetails": objClaim.claimLineItemDetails,
        "registrationNumber": sessionStorage.getItem("jewelryVendor") ? sessionStorage.getItem("jewelryVendor") : sessionStorage.getItem("speedCheckVendor")
    }
    var getpromise = AdjusterPropertyClaimDetailsService.updatePostLostItemsStatus(param);
    getpromise.then(function (success) {
        $scope.$close();
        $(".page-spinner-bar").addClass("hide");
       
    }, function (error) {
        $(".page-spinner-bar").addClass("hide");
        $scope.ErrorMessage = error.data.errorMessage;
    });  
   }
   $scope.cancel = function () {
    $scope.$close();
};
});
