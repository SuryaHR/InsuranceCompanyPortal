angular.module('MetronicApp').controller('InsuranceAgentReviewPopupController', function ($rootScope,$filter, $location, AdjusterPropertyClaimDetailsService, $uibModal, $scope, $translate, $translatePartialLoader,appraisalData,AppraisalService, InsuranceAgentReviewService,
    AuthHeaderService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    //set language
    $translatePartialLoader.addPart('InsuranceAgentReview');
    $translate.refresh();

    $scope.init = init;
    function init() {
        $scope.popup = {};
        $scope.popup.message = '';
    }
    init();

    //Ok
    $scope.ok = function (e) {
        $(".page-spinner-bar").removeClass("hide");
        var appraisalId = sessionStorage.getItem("appraisalId");
        //Save & Update -> send for additional info or reject.
         var param = {
                "userId" : sessionStorage.getItem("UserId"),
                "userName":sessionStorage.getItem("UserName"),
                "appraisalId": appraisalId,
                "role": "UNDERWRITER",
                "approved": !(appraisalData.needInfo) ,
                "rejected": appraisalData.rejected ,
                "newInsurancePremiumCost": appraisalData.newInsurancePremiumCost,
                "oldInsurancePremiumCost":  appraisalData.oldInsurancePremiumCost,
                "popupMessage": $scope.popup.message
            };

            //Before Update save & update premium amount
            var promis = AppraisalService.updateInsurancePremium(param);
            promis.then(function (success) {
                    toastr.remove();
                    if(param.rejected){
                    toastr.success("The appraisal was rejected and sent to Insurance Agent ", "Confirmation");
                    }else{
                        toastr.success("The appraisal was submitted to Insurance Agent ", "Confirmation");
                    }
                    $(".page-spinner-bar").addClass("hide");
                    $location.path('/UnderWriter');
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
