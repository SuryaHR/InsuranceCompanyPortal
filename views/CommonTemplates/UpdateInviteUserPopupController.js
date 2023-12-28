angular.module('MetronicApp').controller('UpdateInviteUserPopupController', function ($rootScope, $filter, AdjusterPropertyClaimDetailsService, $uibModal, $scope, $timeout, $translate, $translatePartialLoader, objClaim) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });

    //set language
    $translatePartialLoader.addPart('AdjusterPropertyClaimDetails');
    $translate.refresh();
    $scope.currentUserName = sessionStorage.getItem("Name");
    $scope.CommonObj = {
        "ClaimId": objClaim.claimId,
        "claimNumber": objClaim.ClaimNumber,
        "participant": objClaim.participant
    };
    
    //Update function
    $scope.update = function (e) {
        $(".page-spinner-bar").removeClass("hide"); 

        var data = {
            "claimId" : $scope.CommonObj.ClaimId,
            "userId" : $scope.CommonObj.participant.id,
            "email" : $scope.CommonObj.participant.emailId
        }        
        var getpromise = AdjusterPropertyClaimDetailsService.UpdateInviteContact(data);
        getpromise.then(function (success) {
            $scope.Status = success.data.status;
            if ($scope.Status == 200) {
                // Send reset link
                resetUserPsw();
            }else{
                toastr.remove();
                $(".page-spinner-bar").addClass("hide");
                toastr.warning(success.data.message, "Error");
            }
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
            $scope.ErrorMessage = error.data.errorMessage;
        });
    }

    //Cancel
    $scope.cancel = function () {
        $scope.$close("Cancel");
    };

    function resetUserPsw() {
        $(".page-spinner-bar").removeClass("hide");        
        var EmpDetails = {
            "id": $scope.CommonObj.participant.id
        }
        var resetPassword = AdjusterPropertyClaimDetailsService.resetUserPassword(EmpDetails);
        resetPassword.then(function (success) {
            $(".page-spinner-bar").addClass("hide");
            $scope.Status = success.data.status;
            if ($scope.Status == 200) {
                $scope.$close("Success");
                toastr.remove();
                $(".page-spinner-bar").addClass("hide");
                toastr.success(success.data.message, "Confirmation");
            }
            
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove()
            toastr.error(error.data.errorMessage, "Error");
        });        
    }
});
