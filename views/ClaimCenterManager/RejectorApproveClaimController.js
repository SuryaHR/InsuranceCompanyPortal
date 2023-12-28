angular.module('MetronicApp').controller('RejectOrApproveClaimController',
function RejectOrApproveClaimController($translate, $translatePartialLoader, $rootScope, $scope, RejectApproveClaimService,
     $http, $location, ClaimDetails) {
    $translatePartialLoader.addPart('RejectApproveClaimPopUp');
    $translate.refresh();
    $scope.ClaimDetails = ClaimDetails;
    $scope.IsApprove = $scope.ClaimDetails.IsApprove;
    $scope.IsReject= $scope.ClaimDetails.IsReject;
    $scope.ClaimDetails.Reject;
    $scope.Rejectclaim=Rejectclaim;
    function Rejectclaim()
    {
        paramReject = {
            "claimNumber": $scope.ClaimDetails.claimNumber,
            "isApproved": false,
        };
        var respnse = RejectApproveClaimService.RejectOrApproveClaim(paramReject);
        respnse.then(function (success) {
            $scope.$close("Success");
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }
    function Approveclaim() {
        paramApprove = {
            "claimNumber": $scope.ClaimDetails.claimNumber,
            "isApproved": true,
        }
        var respnse = RejectApproveClaimService.RejectOrApproveClaim(paramApprove);
        respnse.then(function (success) {
            $scope.$close();
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }
    $scope.cancel = function () {
        $scope.$close();
    };

});