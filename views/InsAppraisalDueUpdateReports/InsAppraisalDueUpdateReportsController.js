angular.module('MetronicApp')

    .controller('InsAppraisalDueUpdateReportsController', function ($rootScope, $scope, $filter, settings, $http, $location, $translate, $translatePartialLoader,
        AuthHeaderService, InsuranceAccountManagerDashboardService) {

        $translatePartialLoader.addPart('InsAppraisalDueUpdateReports');
        $translate.refresh();
        $scope.ShowHeader = true;
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        $scope.tab = 'Dashboard';
        //set language

        $scope.ErrorMessage = "";
        $scope.report = sessionStorage.getItem("reportType");
        $scope.reportHeader = $scope.report == 'NeedUpdate' ? 'Appraisals Needing Update' : 'Appraisals Expiring';

        $scope.appraisalsNeedSCUpdate = [];
        $scope.appraisalsForExpiringPolicy = [];

        // Pagination
        $scope.pageSize = 20;
        $scope.totalItems = 0;
        var startPose = 0;
        var maxPose = 20;
        $scope.currentPage = 1;
        //search keyword
        var searchKeyword = '';

        function init() {
            if ($scope.report == 'NeedUpdate')
                getAppraisalsNeedUpdate();
            else
                getAppraisalsPolicyExpiring();
        }
        init();

        $scope.GoToHome = GoToHome;
        function GoToHome() {
            $location.path('/InsuranceAccountManager')
        }

        $scope.GoToDashboard = GoToDashboard;
        function GoToDashboard() {
            $(".page-spinner-bar").removeClass("hide");
            $scope.tab = 'Dashboard';
            $(".page-spinner-bar").addClass("hide");
        }

        $scope.searchAppraisalsBykey = searchAppraisalsBykey;
        function searchAppraisalsBykey(searchQuery, tableType) {
            searchKeyword = searchQuery.length > 0 ? searchQuery : '';
            $scope.currentPage = 1;
            if (tableType == 'NeedUpdate')
                getAppraisalsNeedUpdate();
            else
                getAppraisalsPolicyExpiring();
        }

        $scope.getAppraisalsNeedUpdate = getAppraisalsNeedUpdate;
        function getAppraisalsNeedUpdate() {
            $(".page-spinner-bar").removeClass("hide");
            var param = {
                "page": $scope.currentPage,
                "maxCount": maxPose,
                "searchKeyword": searchKeyword,
                "orderBy": $scope.reverse ? 1 : 0,
                "sortBy": $scope.sortKey
            }
            var appraisalsNeedSCUpdateTemp = [];
            var getAppraisalsNeedSCUpdate = InsuranceAccountManagerDashboardService.getAppraisalsNeedSCUpdate(param);
            getAppraisalsNeedSCUpdate.then(function (success) {
                if(success.data.data){
                    appraisalsNeedSCUpdateTemp = success.data.data.appraisals;
                    $scope.totalItems = appraisalsNeedSCUpdateTemp.length > 0 ? success.data.data.totalCount : 0;
                    var currentListLength = ($scope.currentPage - 1) * maxPose;
                    if (currentListLength != $scope.appraisalsNeedSCUpdate.length) {
                        $scope.appraisalsNeedSCUpdate = new Array(currentListLength).fill(new Object());
                    }
                    angular.forEach(appraisalsNeedSCUpdateTemp, function (item) {
                        item.primaryPolicyHolderFname = $filter('constructName')(item.policyholderDetails.primaryPolicyHolderFname, item.policyholderDetails.primaryPolicyHolderLname);
                        $scope.appraisalsNeedSCUpdate.push(item);
                    });
                }               
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                if (error.status === 500 || error.status === 404) {
                    toastr.remove();
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                };
                $(".page-spinner-bar").addClass("hide");
            });
        }

        $scope.getAppraisalsPolicyExpiring = getAppraisalsPolicyExpiring;
        function getAppraisalsPolicyExpiring() {
            $scope.appraisalsForExpiringPolicy = [];
            $(".page-spinner-bar").removeClass("hide");
            var param = {
                "page": $scope.currentPage,
                "maxCount": maxPose,
                "searchKeyword": searchKeyword,
                "orderBy": $scope.reverse ? 1 : 0,
                "sortBy": $scope.sortKey
            }
            var appraisalsForExpiringPolicyTemp = [];
            var getPolicyExpiringAppraials = InsuranceAccountManagerDashboardService.getPolicyExpiringAppraials(param);
            getPolicyExpiringAppraials.then(function (success) {
                if (success.data.data) {
                    appraisalsForExpiringPolicyTemp = success.data.data.appraisals;
                    $scope.totalItems = appraisalsForExpiringPolicyTemp.length > 0 ? success.data.data.totalCount : 0;
                    var currentListLength = ($scope.currentPage - 1) * maxPose;
                    if (currentListLength != $scope.appraisalsForExpiringPolicy.length) {
                        $scope.appraisalsForExpiringPolicy = new Array(currentListLength).fill(new Object());
                    }
                    angular.forEach(appraisalsForExpiringPolicyTemp, function (item) {
                        item.primaryPolicyHolderFname = $filter('constructName')(item.policyholderDetails.primaryPolicyHolderFname, item.policyholderDetails.primaryPolicyHolderLname);
                        $scope.appraisalsForExpiringPolicy.push(item);
                    });
                }
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                if (error.status === 500 || error.status === 404) {
                    toastr.remove();
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                };
                $(".page-spinner-bar").addClass("hide");
            });

        }

        // Sort Appraisal List Columns
        $scope.sort = function (keyname) {
            $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false;
            $scope.sortKey = keyname;   //set the sortKey to the param passed
            if ($scope.report == 'NeedUpdate')
                getAppraisalsNeedUpdate();
            else
                getAppraisalsPolicyExpiring();
        }

        // Pagination
        $scope.pageChanged = pageChanged;
        function pageChanged(pageNum) {
            if (pageNum == 1) {
                startPose = 0;
                if ($scope.report == 'NeedUpdate')
                    $scope.appraisalsNeedSCUpdate = [];
                else
                    $scope.appraisalsForExpiringPolicy = [];
            } else {
                startPose = maxPose * (pageNum - 1);
            }
            $scope.currentPage = pageNum;
            if ($scope.report == 'NeedUpdate')
                getAppraisalsNeedUpdate();
            else
                getAppraisalsPolicyExpiring();
        }

        // openAppraisalDetails
        $scope.openAppraisalDetails = openAppraisalDetails;
        function openAppraisalDetails(item) {
            sessionStorage.setItem("appraisalId", item.id);
            sessionStorage.setItem("AppraisalNo", item.appraisalNumber);
            sessionStorage.setItem("policyNumber", item.policyNumber);
            if ($scope.report == 'NeedUpdate')
                sessionStorage.setItem("refferer", "APPRAISALS_NEED_UPDATE");
            else
                sessionStorage.setItem("refferer", "APPRAISALS_EXPIRING");
            sessionStorage.setItem("policyNumber", item.policyNumber);
            $location.path('/InsuranceManagerAppraisal');
        }
    });
