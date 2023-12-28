angular.module('MetronicApp').controller('PerformanceController', function ($rootScope, $filter, $scope, settings, $http, $timeout, $uibModal,
    $location, $translate, $translatePartialLoader, AuthHeaderService, SupervisorDashboardService) {
    //set language
    $translatePartialLoader.addPart('Performance');
    $translate.refresh();
    $scope.status = null;

    $scope.reverse = true;
    $scope.limit = 50;
    $scope.moreShown = false;
    $scope.lastRecord = 20;
    $scope.pagesize = 20;
    $scope.AdjusterClaims = [];
    $scope.currentPage = 1;
    $scope.searchKeyword = '';
    $scope.sortKey = null;

    function init() {
        $(".page-spinner-bar").removeClass("hide");
        $scope.tab = 'All';
        $scope.CommonObj = {
            AdjusterId: sessionStorage.getItem("AdjusterId"),
            AdjusterName: sessionStorage.getItem("AdjusterName")
        };
        statusList();
        getFiltererdClaims();
    }
    init();
    $scope.statusList = statusList;
    function statusList() {
        var GetClaimStatusList = SupervisorDashboardService.getClaimStatusList();
        GetClaimStatusList.then(function (success) {
            $scope.StatusList = success.data.data;
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.error((angular.isDefined(error.data) && angular.isDefined(error.data.errorMessage) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage()), "Error");
        });
    };
    $scope.searchByDate = searchByDate;
    function searchByDate(param) {
        //$(".page-spinner-bar").removeClass("hide");      
        $scope.fromDate = null;
        $scope.toDate = null;
        var d = null;
        if (param == 'ThisMonth') {
            $scope.tab = 'ThisMonth';
            //To date will be today's date 
            d = new Date();
            $scope.toDate = $filter('date')(d, "MM/dd/yyyy");
            //Set Date as 1st of month                          
            d.setDate(1);
            $scope.fromDate = $filter('date')(d, "MM/dd/yyyy");
        }
        else if (param == 'Last3Month') {
            $scope.tab = 'Last3Month';
            // var dt = $filter("TodaysDate")();
            // toDate = dt;
            // var currentTime = new Date();
            // currentTime.setDate(currentTime.getDate() - 90);
            // fromDate = (currentTime.getMonth() + 1) + '/' + currentTime.getDate() + '/' + currentTime.getFullYear();
            d = new Date();
            $scope.toDate = $filter('date')(d, "MM/dd/yyyy");
            d.setMonth(d.getMonth() - 2);
            d.setDate(1);
            $scope.fromDate = $filter('date')(d, "MM/dd/yyyy");
        }
        else if (param == 'All') {
            $scope.tab = 'All';
            $scope.fromDate = null;
            $scope.toDate = null;
        }
        $('#toDate').datepicker('update', $scope.toDate);
        $('#fromDate').datepicker('update', $scope.fromDate);
    }

    $scope.getFiltererdClaims = getFiltererdClaims;
    function getFiltererdClaims() {
        $(".page-spinner-bar").removeClass("hide");
        var Param = {
            "id": $scope.CommonObj.AdjusterId,
            "status": $scope.status ? [$scope.status] : null,
            "startDate": angular.isUndefined($scope.fromDate) ? null : $filter('DatabaseDateFormatMMddyyyy')($scope.fromDate),
            "endDate": angular.isUndefined($scope.toDate) ? null : $filter('DatabaseDateFormatMMddyyyy')($scope.toDate),
            "searchKeyword": $scope.searchKeyword.length > 0 ? $scope.searchKeyword : '',
            "page": $scope.currentPage,
            "limit": $scope.pagesize,
            "sortBy": $scope.sortKey,
            "orderBy": $scope.reverse ? "desc" : "asc"
        };
        var filteredClaims = SupervisorDashboardService.getAdjusterDetailsWithClaim(Param);
        filteredClaims.then(function (success) {
            $scope.AdjusterClaims = [];
            var filteredResult = success.data ? success.data.data : null
            if (filteredResult != null) {
                $scope.totalItems = filteredResult.totalClaims;
                $scope.AdjusterClaims = filteredResult.adjusterClaimDetails;
                if ($scope.AdjusterClaims && $scope.AdjusterClaims.length > 0) {
                    if ($scope.currentPage == 1)
                        $scope.lastRecord = $scope.AdjusterClaims.length;
                    else {
                        $scope.lastRecord = $scope.AdjusterClaims.length + ($scope.pagesize * ($scope.currentPage - 1))
                    }
                }
            }
            else {
                $scope.AdjusterClaims = null;
            }
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.error((angular.isDefined(error.data) && angular.isDefined(error.data.errorMessage) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage()), "Error");
        });
    };

    $scope.back = back;
    function back() {
        $location.url('SupervisorMyTeam');
    }

    $scope.goToClaimDetails = function (claim) {
        if (claim.id != null && claim.claimNumber != null) {
            sessionStorage.setItem("ClaimId", claim.id);
            sessionStorage.setItem("ClaimNo", claim.claimNumber);
            sessionStorage.setItem("ShowNoteActive", "");
            sessionStorage.setItem("ShowEventActive", "");
            sessionStorage.setItem("BackPage", "Performance");
            $location.url('SupervisorClaimDetails');
        }
    }

    $scope.goToAssignmentDetails = function (claim, assignment) {
        if (claim && assignment) {
            sessionStorage.setItem("ClaimId", claim.id);
            sessionStorage.setItem("ClaimNo", claim.claimNumber);
            sessionStorage.setItem("assignementObject", assignment.assignmentNumber);            
            sessionStorage.getItem("vrn", assignment.vendor.registrationNumber)
            sessionStorage.setItem("BackPage", "Performance");
            $location.url('SupervisorClaimDetails');
        }
    }

    //Settings for customized pagination
    $scope.setCurrentPage = setCurrentPage;
    function setCurrentPage(pageNum) {
        $scope.currentPage = pageNum;
        getFiltererdClaims();
    }

    // Search keyword
    $scope.customSearch = customSearch
    function customSearch(searchQuery) {
        $scope.searchKeyword = angular.isDefined(searchQuery) && searchQuery != null && searchQuery.length > 0 ? searchQuery : '';
        $scope.currentPage = 1;
        getFiltererdClaims();
    }

    $scope.sortClaim = function (keyname) {
        $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false; //if true make it false and vice versa 
        $scope.sortKey = keyname; //set the sortKey to the param passed
        $scope.currentPage = 1;
        getFiltererdClaims();
    }
});
