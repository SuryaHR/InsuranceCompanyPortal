//
angular.module('MetronicApp').controller('SupervisorGlobalSearchController', function ($rootScope,SupervisorDashboardService, $scope, settings, $filter, $location, $translate, $translatePartialLoader) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    //set language
    $translatePartialLoader.addPart('SupervisorGlobalSearch');
    $translate.refresh();

    //End side bar
    $scope.MyClaims = [];
    $scope.ClaimHolder = [];
    $scope.pagesize = $rootScope.settings.pagesize;
    $scope.ClaimStatus = "ALL";
    $scope.ddlClaimStatusList;
    $scope.GlobalsearchText = sessionStorage.getItem("GlobalSearchtext");
    $scope.DisplayRecordForText = sessionStorage.getItem("GlobalSearchtext");
    $scope.totalitemcount = "";
    $scope.ErrorMessage = "";
    $scope.pagination={
        "current" : 1
    }

    var pageName = "SEARCH_RESULT";

    function init() {

        getSearchResult(); //call to get search result

        //Get ClaimStatus List API # 124            
        var GetClaimStatusList = SupervisorDashboardService.getClaimStatusList();
        GetClaimStatusList.then(function (success) {
            $scope.ddlClaimStatusList = success.data.data;
        }, function (error) {
            // $scope.ErrorMessage = error.data.errorMessage;
        });
    }
    init();

    function getSearchResult() {
        //Get Claims list for my claims API #148
        $(".page-spinner-bar").removeClass("hide");
        var param =
           {
               "searchString": sessionStorage.getItem("GlobalSearchtext"),
               "companyId": sessionStorage.getItem("CompanyId"),
               "pagination": {
                "pageNumber": $scope.pagination.current,
                "limit": $scope.pagesize,
                "pageSize":20
            }

           };
        var GetSearchRecord = SupervisorDashboardService.getSearchClaims(param);
        GetSearchRecord.then(function (success) {
            $scope.MyClaims = success.data.data?.claims === undefined ? null : success.data.data?.claims;
            $scope.ClaimHolder = success.data.data?.claims === undefined ? null : success.data.data?.claims;
            $scope.totalitemcount = success.data.data?.totalClaims;
            setPageSize();
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            // $scope.ErrorMessage = error.data.errorMessage;
        });
    }

    function setPageSize() {
        if ($scope.MyClaims === null) {
            $scope.pagesize = 0;
            $scope.totalitemcount = 0;
        }
        else {
            //$scope.totalitemcount = $scope.MyClaims.length;
            // if ($scope.totalitemcount < 20) {
            //     $scope.pagesize = $scope.totalitemcount;
            // }
            // else {
            //     $scope.pagesize = $rootScope.settings.pagesize;
            // }
            $scope.startIndex = ($scope.pagesize * ($scope.pagination.current-1) + 1);
            $scope.endIndex = ($scope.pagesize * $scope.pagination.current);

        }
    }
    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

    $scope.GotoClaimDetails = GotoClaimDetails;
    function GotoClaimDetails(claim,tab) {
       sessionStorage.setItem("ClaimId", claim.claimId);
       sessionStorage.setItem("ClaimNo", claim.claimNumber);
       sessionStorage.setItem("refferer",pageName);
       sessionStorage.setItem("claimDetailsCurrentTab",tab);
       $location.url('\SupervisorClaimDetails');
    }

    $scope.GoBack = function () {
        $location.url('SupervisorDashboard');
    }

    $scope.GetClaimOnStatus = function () {

        $scope.ClaimStatus;
        if (($scope.ClaimStatus === "ALL") || (angular.isUndefined($scope.ClaimStatus) || $scope.ClaimStatus === null)) {

            $scope.MyClaims = $scope.ClaimHolder;
            setPageSize();

        }
        else {
            $scope.data = [];
            angular.forEach($scope.ClaimHolder, function (obj, key) {
                if (obj.status.status == $scope.ClaimStatus) {
                    $scope.data.push(obj);
                }

            });
            $scope.MyClaims = $scope.data;
            setPageSize();
        }
    }

    $scope.Search = function () {
        $scope.DisplayRecordForText = $scope.GlobalsearchText;
        sessionStorage.setItem("GlobalSearchtext", $scope.GlobalsearchText)
        getSearchResult();
    }
    $scope.setCurrentPage = setCurrentPage;
    function setCurrentPage(pageNum){
        $scope.pagination.current = pageNum;
        getSearchResult();
    }
});