angular.module('MetronicApp').controller('WaitingForApprovalController', function ($rootScope, $scope, settings, $http, $timeout, $location, $uibModal, $translate,RejectApproveClaimService,
    $translatePartialLoader, AdjusterMyDraftService) {

    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });

    //set language
    $translatePartialLoader.addPart('AdjusterClaimsInProgress');
    $translate.refresh();
    $scope.claims = "";
    $scope.ErrorMessage = "";
    function init() {
        //get claims with status  API #71
        var param = {
            //"claimStatus": "UNDER REVIEW"
             "claimStatus": "INSPECTION" 
        };
        var getpromise = AdjusterMyDraftService.getClaimsList(param);
        getpromise.then(function (success) {        
            $scope.claims = success.data.data;
        }, function (error) {           
            $scope.ErrorMessage = error.data.errorMessage;
        });
    }
    init();
    $scope.ApproveClaim = ApproveClaim;
    function ApproveClaim(e) {
        var paramClaimId = {
            "claimNumber": sessionStorage.getItem("ManagerScreenClaimNo"),
            "isApproved": true
        };
        var response = RejectApproveClaimService.RejectOrApproveClaim(paramClaimId);
        response.then(function (success) {
            bootbox.alert({
                size: "", closeButton: false,
                title: $translate.instant('ClaimDetails_Approve.Title'),
                message: $translate.instant('ClaimDetails_Approve.Message'),
                className: "modalcustom",
                callback: function () { /* your callback code */ }
            });
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

    }
    $scope.RejectClaim = RejectClaim;
    function RejectClaim(e) {
        $scope.animationsEnabled = true;
        var paramClaimId = {
            "claimNumber": sessionStorage.getItem("ManagerScreenClaimNo").toString,
            "isApproved": false,
            "IsApprove": false,
            "IsReject": true
        }
        var out = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "views/ClaimCenterManager/RejectorApproveClaimPopUp.html",
            controller: "RejectOrApproveClaimController",
            resolve:
            {
                ClaimDetails: function () {
                    return paramClaimId;
                }
            }
        });
        out.result.then(function (value) {
            //Call Back remove item
            // if (angular.isDefined(value))
            //   $scope.RoleOfUser = list;
        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };

    }
    $scope.GotoClaimDetails = GotoClaimDetails;
    function GotoClaimDetails(claim) {
        if (claim.claimId != null && claim.claimNumber != null) {
            sessionStorage.setItem("AdjusterClaimId", claim.claimId);
            sessionStorage.setItem("AdjusterClaimNo", claim.claimNumber);
        }

        $location.url('\AdjusterPropertyClaimDetails')
    }
});