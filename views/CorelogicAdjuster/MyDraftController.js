angular.module('MetronicApp').controller('MyDraftController', function ($rootScope, $scope, settings, $http, $timeout, $location, $uibModal, $translate,
    $translatePartialLoader, AdjusterMyDraftService, RejectApproveClaimService) {

    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });

    //set language
    $translatePartialLoader.addPart('AdjusterClaimsInProgress');
    $translate.refresh();
    $scope.claims = "";
    $scope.ErrorMessage = "";
    function init()
    {
        //get claims with status  API #71
        var param = {          
           "claimStatus":"ASSIGNED"           
        };
        var getpromise = AdjusterMyDraftService.getClaimsList(param);
        getpromise.then(function (success) {
            $scope.claims = success.data.data;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        });
    }

    init();
    $scope.GotoClaimDetails = GotoClaimDetails;
    function GotoClaimDetails(claim) {
        if (claim.claimId != null && claim.claimNumber != null) {
            sessionStorage.setItem("AdjusterClaimId", claim.claimId);
            sessionStorage.setItem("AdjusterClaimNo", claim.claimNumber);
        }

        $location.url('\AdjusterPropertyClaimDetails')
    }
});