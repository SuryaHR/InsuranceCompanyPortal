angular.module('MetronicApp')
    .controller('ManagerReportsController', function ($rootScope, $scope, $filter, settings, $http, $location, $translate, $translatePartialLoader, InsuranceReportService, InsuranceAccountManagerDashboardService,
        AddPolicyService, AuthHeaderService) {

        $translatePartialLoader.addPart('InsuranceReports');
        $translate.refresh();
        $scope.ShowHeader = true;
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });
        $translate.refresh();

        $scope.ErrorMessage = "";
        $scope.currentPage = 1;
        $scope.FlagForBreadcrumb = null;
        $scope.UserType = sessionStorage.getItem('RoleList');
        $scope.yearValues = {};
        $scope.reportFilter = {};
        $scope.appraisals = [];

        // Pagination
        $scope.pageSize = 20;
        $scope.totalItems = 0;
        var startPos = 0;
        var maxPos = 20;
        $scope.currentPage = 1;

        function init() {
            $scope.isShowAlerts = true;
            $scope.isShowKpis = true;
            $scope.pageNumber = 0;
            {
                ShowItem: "All"
            };
            $(".page-spinner-bar").removeClass("hide");
            //get all appraisal status
            var status = InsuranceReportService.getAppraisalStatusList();
            status.then(function (success) { $scope.appraisalStatus = success.data.appraisalStatus; }, function (error) { $scope.appraisalStatus = []; });

            // get states
            var statePromise = AddPolicyService.getStates();
            statePromise.then(function (success) { $scope.StateList = success.data.data; }, function (error) { $scope.StateList = []; });
            populateDate();
            populateDateButtons();
            getCompanyPerformance(1);
            getAppraisalReports(1);
            $(".page-spinner-bar").addClass("hide");
        }
        init();

        // get current month, quarter, year.
        $scope.populateDateButtons = populateDateButtons;
        function populateDateButtons() {
            var now = new Date();
            //var currentQuarter = Math.floor(now.getMonth() / 3) + 1;
            //var obj = moment().subtract(currentQuarter, 'quarter');
            var currentQuarter = moment().quarter();
            $scope.yearValues =
                {
                    "thisMonth": moment().format('MMM'),
                    "thisYear": now.getFullYear(),
                    "lastYear": now.getFullYear() - 1,
                    "thisQuaterFirstMonth": moment().quarter(currentQuarter).startOf('quarter').format('MMM'),
                    "thisQuaterLastMonth": moment().quarter(currentQuarter).endOf('quarter').format('MMM')
                }
        }

        $scope.getAppraisalReports = getAppraisalReports;
        function getAppraisalReports() {
            $(".page-spinner-bar").removeClass("hide");
            $scope.appraisals = [];
            var data = {
                "agentId": null,
                "effectiveFromDate": $filter('DatabaseDateFormatMMddyyyy')($scope.reportFilter.fromDate),
                "effectiveToDate": $filter('DatabaseDateFormatMMddyyyy')($scope.reportFilter.toDate),
                "appraisalStatus": $scope.reportFilter.appraisalStatus ? $scope.reportFilter.appraisalStatus : null,
                "state": $scope.reportFilter.state ? $scope.filteReport.state : null,
                "filterBy": 1, //View by appraisal
                "isManager": false,
                "startPos": startPos,
                "maxCount": maxPos,
                "sortBy": $scope.sortKey,
                "orderBy": $scope.reverse ? 1 : 0,
            }
            var reports = InsuranceAccountManagerDashboardService.getAppraisalReports(data);
            reports.then(function (success) {
                var reports = success.data.policyAppraisalReports;
                if (reports) {
                    if (reports.appraisals.length > 0)
                        $scope.totalItems = reports.appraisals[0].totalCount;
                    if (reports.appraisals.length > 0) {
                        angular.forEach(reports.appraisals, function (item) {
                            item.policyholderName = $filter('constructName')(item.policyholderDetails.primaryPolicyHolderFname, item.policyholderDetails.primaryPolicyHolderLname);

                            $scope.appraisals.push(item);
                        });
                    }
                    $scope.totalValues = {
                        "totalCoverageApproved": reports.totalCoverageApproved,
                    }
                }
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
                $(".page-spinner-bar").addClass("hide");
            });
        }

        //function to get get company performance(by param) added by SanthoshM
        $scope.getCompanyPerformance = getCompanyPerformance;
        function getCompanyPerformance(timeInterval) {
            param = {
                "statusFlag": timeInterval,
                "agentId": "ALL"
            }
            var companyPerformanceCount = InsuranceReportService.getAgencyPerformance(param);
            companyPerformanceCount.then(function (success) {
                //$(".page-spinner-bar").addClass("hide");
                //console.log(success.data.EfficeincyReport);
                var result = success.data.EfficeincyReport;
                $scope.AppraisalsEvaluatedPerDay = roundOf2Decimal(result.appraisalEvaluatedPerDay);
                $scope.AvgEvaluationTime = result.avgEvaluationTime;
                $scope.AppraisalsCreatedPerDay = roundOf2Decimal(result.appraisalaCreatedPerDay);
                $scope.AppraisalsSentToArtigem = result.appraisalsSentToArtigem != null ? result.appraisalsSentToArtigem : 0;
                $scope.TotalAppraisalsCreated = result.totalAppraisalsCreated != null ? result.totalAppraisalsCreated : 0;
            }, function (error) {
                if (error.status === 500 || error.status === 404) {
                    toastr.remove();
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                };
                //$(".page-spinner-bar").addClass("hide");
            });
        }

        $scope.roundOf2Decimal = roundOf2Decimal;
        function roundOf2Decimal(num) {
            if (num != null) {
                return (Math.round(num * 100) / 100).toFixed(2);
            }
            return num;
        }

        $scope.gotoDashboard = gotoDashboard;
        function gotoDashboard() {
            $location.path("/InsuranceAccountManager");
        }

        // get current date
        $scope.populateDate = populateDate;
        function populateDate() {
            // from date
            var currentTime = new Date()
            var year = currentTime.getFullYear();
            $scope.reportFilter.fromDate = "01/01/"+year;
            var d = $filter("TodaysDate")();
            $scope.reportFilter.toDate = d;

           

        }

        // Pagination
        $scope.pageChanged = pageChanged;
        function pageChanged(pageNum) {
            if (pageNum == 1) {
                startPose = 0;
                maxPose = 20;
            } else {
                startPose = maxPose * (pageNum - 1);
                $scope.currentPage = pageNum;
            }
            // get appraisal reports
            getAppraisalReports();
        }

        // sort function
        $scope.sort = function (keyname) {
            $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false;
            $scope.sortKey = keyname;   //set the sortKey to the param passed
            getAppraisalReports();
        }

        $scope.changeDate = changeDate;
        function changeDate() {
            $("#fromDate").datepicker({
                todayBtn: 1,
                autoclose: true,
            }).on('changeDate', function (selected) {
                var minDate = new Date(selected.date.valueOf());
                $('#toDate').datepicker('setStartDate', minDate);
                $('#todate').datepicker('setDate', minDate);
                $('#todate').datepicker('update', '');
            });
        }
    });
