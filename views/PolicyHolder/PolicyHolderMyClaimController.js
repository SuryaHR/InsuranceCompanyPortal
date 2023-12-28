angular.module('MetronicApp').controller('PolicyHolderMyClaimController', function ($translate, $translatePartialLoader, $scope, $rootScope, $state, settings, $filter,
    $location, PolicyHolderMyClaimService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $scope.PageSize = $rootScope.settings.pagesize;
    $translatePartialLoader.addPart('PolicyHolderMyClaim');
    $translate.refresh();

    $scope.MyClaims = [];
    $scope.CurrentClaimTab = 'OpenClaims';//For showing current active tab
    $scope.ErrorMessage;
    $scope.sortKey = "lastUpdatedDate";
    $scope.reverse = true;
    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.MyClaims = $filter('orderBy')($scope.MyClaims, $scope.sortKey);

        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }
    $scope.ClosedsortKey = "createDate";
    $scope.Closedreverse = true;
    $scope.Closedsort = function () {
        $scope.ClosedsortKey = keyname;   //set the sortKey to the param passed
        $scope.ClosedClaimList = $filter('orderBy')($scope.ClosedClaimList, $scope.ClosedsortKey);

        $scope.Closedreverse = !$scope.Closedreverse; //if true make it false and vice versa
    };
    init();
    function init() {
        $scope.CommonObj =
        {
            UserRole: sessionStorage.getItem("RoleList")
        };
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            // "companyId": sessionStorage.getItem("CompanyId"),
            "policyHolderId": sessionStorage.getItem("UserId")
        };
        var ClaimList = PolicyHolderMyClaimService.getClaimList(param);
        ClaimList.then(function (success) {
            $scope.MyClaims = success.data.data.claims;
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
        var param = {
            "claimStatus": "SETTLED",
            //"companyId": sessionStorage.getItem("CompanyId"),
            "policyHolderId": sessionStorage.getItem("UserId")
        };
        var ClaimListClose = PolicyHolderMyClaimService.getClaimList(param);
        ClaimListClose.then(function (success) {
            $scope.ClosedClaimList = success.data.data;
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
            $(".page-spinner-bar").addClass("hide");

        });
    };

    $scope.GotoClaimDetails = function (item) {
        if (item.claimId != null && item.claimNumber != null) {
            sessionStorage.setItem("PolicyHolderClaimNo", item.claimNumber);
            sessionStorage.setItem("PolicyHolderClaimId", item.claimId);
            $location.url('PolicyholderClaimDetails');
        }
    };
    $scope.GoToHome = function () {
        $location.url(sessionStorage.getItem('HomeScreen'));
    }

    $scope.GoToDetails = function (item) {
        sessionStorage.setItem("PolicyHolderClaimNo", 10)
        sessionStorage.setItem("PolicyHolderClaimId", 20)
        sessionStorage.setItem("PolicyHolderPostLostItemId", 30)
        $location.url('PolicyholderItemDetails');
    }

});