angular.module('MetronicApp')
    .controller('DashboardController', function ($rootScope, $scope, $filter, settings, $http, $location, $translate, $translatePartialLoader, InsuranceAccountManagerDashboardService,
        AuthHeaderService, InsuranceReportService, ExportReportService) {

        $scope.ShowHeader = true;
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });
        //set language
        $translatePartialLoader.addPart('InsuranceAccountManagerDashboard');
        //$translatePartialLoader.addPart('InsuranceAgentHome');
        $translate.refresh();
        $scope.ErrorMessage = "";
        $scope.UserType = sessionStorage.getItem('RoleList');
        $scope.loggedInUser = sessionStorage.getItem('Name');
        $scope.InsCompanyName = sessionStorage.getItem('InsuranceCompanyName');
        $scope.FileUploadSave = false;
        $scope.parameter = {};
        $scope.policy = {};
        $scope.catogorySplit = {};
        $scope.catogorySplit.status = 1;
        $scope.NotificationsList = [];
        $scope.PolicyAppraisalCount = {};
        $scope.PolicyHoldersReviewStatus = {};
        $scope.yearValues = {};
        $scope.showPolicyholderChart = false;
        $scope.showItemCategoryChart = false;
        $scope.reportList = [];

        $scope.totalThisYearCoverage = "";
        $scope.totalThisYearPremium = "";


        var policyHolderReviewTimeStatus = 1;
        var coverageAndPremiumTimeStatus = 1;
        var itemCategorySplitTimeStatus = 1;
        var companyPerformanceTimeStatus = 1;

        $scope.searchKeyword = '';

        var userId = sessionStorage.getItem("UserId");

        // Pagination
        $scope.pageSize = 20;
        $scope.totalItems = 0;
        var start = 0;
        var max = 20;
        $scope.currentPage = 1;
        $scope.toShowingPage = 20;

        $scope.teamPerformanceList = [
            { associate: "Payne, Liam", openAppraisals: 10, overdueAppraisals: 0 },
            { associate: "Kors, Michael", openAppraisals: 9, overdueAppraisals: 1 },
            { associate: "Pitt, Bradd", openAppraisals: 25, overdueAppraisals: 2 },
            { associate: "Payne, Liam", openAppraisals: 10, overdueAppraisals: 0 },
            { associate: "Kors, Michael", openAppraisals: 9, overdueAppraisals: 1 },
            { associate: "Pitt, Bradd", openAppraisals: 25, overdueAppraisals: 2 }
        ];

        $scope.itemCategorySplitColor = ['#f58a42', '#f5e342', '#aaf542', '#42f5b0', '#42ecf5', '#4275f5', '#ad42f5', '#f542e3', '#f54257'];

        var refferer = "MANAGER_DASHBOARD";

        function init() {

            sessionStorage.setItem("AgentReports", false);
            sessionStorage.setItem("ManagerReports", true);

            $scope.isShowAlerts = true;
            $scope.isShowKpis = true;
            $scope.pageNumber = 0;

            {
                ShowItem: "All"
            };

            $scope.catogorySplit.status = "1";
            $(".page-spinner-bar").removeClass("hide");
            GetAgentsReport();
            populateDateButtons();
            getPoliciesAndAppraisalsCount();
            getPolicyHoldersReviewStatus(1);
            populategetItemCategorySplitChart(1, 1);
            getNotifications();
            getCompanyPerformance(1);
            populateArticleCoveragePremiumTrendChart(1);
            //GetAppraisalList($scope.pageNumber);
            //pageChangeHandler($scope.pageNumber);
            Date.shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

            var GetGlobaldata = $http.get('Config/Configuration.json');
            GetGlobaldata.then(function (success) {
                var ConfigSettings = success.data.data;
                $scope.serverAddress = ConfigSettings.serverAddress;
            });
            $(".page-spinner-bar").addClass("hide");
        }
        init();

        //get the current month
        function short_months(dt) {
            return Date.shortMonths[dt.getMonth()];
        }

        $scope.getNotifications = getNotifications;
        function getNotifications() {
            $scope.showViewBtn = true;
            var role = "INSURANCE ACCOUNT MANAGER";
            var param = {
                "limit": 5,
                "ParticipantId": sessionStorage.getItem("UserId"),
                "Role": role,
                "Company": sessionStorage.getItem("CompanyId")
            }

            $(".page-spinner-bar").removeClass("hide");
            var getNotifications = InsuranceAccountManagerDashboardService.getNotifications(param);
            getNotifications.then(function (success) {
                $scope.NotificationsList = success.data.notifications;
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                if (error.status === 500 || error.status === 404) {
                    toastr.remove();
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                };
                $(".page-spinner-bar").addClass("hide");
            });
        }

        $scope.getAllNotifications = getAllNotifications;
        function getAllNotifications() {
            $scope.showViewBtn = true;
            var role = "INSURANCE ACCOUNT MANAGER";
            var param = {
                "limit": 0,
                "ParticipantId": sessionStorage.getItem("UserId"),
                "Role": role,
                "Company": sessionStorage.getItem("CompanyId")
            }
            $(".page-spinner-bar").removeClass("hide");
            var getNotifications = InsuranceAccountManagerDashboardService.getNotifications(param);
            getNotifications.then(function (success) {
                $scope.NotificationsList = success.data.notifications;
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                if (error.status === 500 || error.status === 404) {
                    toastr.remove();
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                };
                $(".page-spinner-bar").addClass("hide");
            });
        }

        $scope.removeNotification = removeNotification;
        function removeNotification(notification) {
            var remove = InsuranceAccountManagerDashboardService.removeNotification(notification);
            remove.then(function (success) {
                getNotifications();
            }, function (error) {
                if (error.status === 500 || error.status === 404) {
                    toastr.remove();
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                };
            });
        }


        // Search keyword
        $scope.searchAgencyReportBykey = searchAgencyReportBykey
        function searchAgencyReportBykey(searchQuery)
        {
            $scope.searchKeyword = searchQuery.length > 0 ? searchQuery : '';
            $scope.currentPage = 1;
            GetAgentsReport();
        }

        //agency report
        $scope.GetAgentsReport = GetAgentsReport;
        function GetAgentsReport() {
            var parameters = {
                "pageNumber" : $scope.currentPage,
                "itemsPerPage" : max,
                "status" : false,
                "keyword" : $scope.searchKeyword,
                "orderBy" : $scope.reverse ? 1 : 0,
                "sortBy" : !!$scope.sortKey ? $scope.sortKey: null
            }
            var getReports = InsuranceAccountManagerDashboardService.getReportList(parameters);
            getReports.then(function (success) {
            var reportList = success.data.AgencyReportsList;
            if (reportList !=null && reportList.length > 0) {
                $scope.totalItems = reportList[0].totalAgents;
                if($scope.currentPage==1){
                  $scope.toShowingPage = reportList.length;
                }else{
                    $scope.toShowingPage = reportList.length + ($scope.pageSize * ($scope.currentPage-1))
                }
            }
            var currentListLength = ($scope.currentPage - 1) * max;
            if (currentListLength != $scope.reportList.length) {
                $scope.reportList = new Array(currentListLength).fill(new Object());
            }
            // angular.forEach(reportList, function (item) {
            //     $scope.reportList.push(item);
            // });

            $scope.reportList = reportList;

            $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
                $(".page-spinner-bar").addClass("hide");
            });
        }


        $scope.getPoliciesAndAppraisalsCount = getPoliciesAndAppraisalsCount;
        function getPoliciesAndAppraisalsCount() {
            var role = "INSURANCE ACCOUNT MANAGER";
            $(".page-spinner-bar").removeClass("hide");
            var getCount = InsuranceAccountManagerDashboardService.getPoliciesAndAppraisalsCount();
            getCount.then(function (success) {
                $scope.PolicyAppraisalCount.policyCount = success.data.appraisalPolicyCounts.appraisalsExpiring;
                $scope.PolicyAppraisalCount.appraisalCount = success.data.appraisalPolicyCounts.appraisalsNeedUpdate;
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
            $scope.currentPage = 1;
            GetAgentsReport();
        }

        // Open Appraisal 'NeedUpdate' or 'Expiring' Reports
        $scope.openAppraisalReports = openAppraisalReports;
        function openAppraisalReports(report) {
            // report - 'NeedUpdate' or 'Expiring'
            sessionStorage.setItem("reportType", report);
            $location.path('/InsAppraisalDueUpdateReports');
        }

        // get current month, quarter, year.
        $scope.populateDateButtons = populateDateButtons;
        function populateDateButtons() {
            var now = new Date();
            //var currentQuarter = Math.floor(now.getMonth() / 3) + 1;
            //var obj = moment().subtract(currentQuarter, 'quarter');
            var currentQuarter = moment().quarter();
            var year = now.getFullYear();
            var splitYear = year.toString().substr(2, 2);
            $scope.yearValues =
                {
                    "thisMonth": moment().format('MMM'),
                    "thisYear": now.getFullYear(),
                    "lastYear": now.getFullYear() - 1,
                    "thisQuaterFirstMonth": moment().quarter(currentQuarter).startOf('quarter').format('MMM'),
                    "thisQuaterLastMonth": moment().quarter(currentQuarter).endOf('quarter').format('MMM'),
                    "thisSplitYear": splitYear
                }
        }

        $scope.getPolicyHoldersReviewStatus = getPolicyHoldersReviewStatus;
        function getPolicyHoldersReviewStatus(status) {
            policyHolderReviewTimeStatus = status;
            var param = {
                "statusFlag": status,
                "agentId": "ALL"
            }
            var getReviewsCount = InsuranceAccountManagerDashboardService.getPolicyHoldersReviewStatus(param);
            getReviewsCount.then(function (success) {
                $scope.PolicyHoldersReviewStatus = success.data.ReviewsCount;
                populateChart($scope.PolicyHoldersReviewStatus);
                //$(".page-spinner-bar").addClass("hide");
            }, function (error) {
                if (error.status === 500 || error.status === 404) {
                    toastr.remove();
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                };
                $(".page-spinner-bar").addClass("hide");
            });
        }

        $scope.populateChart = populateChart;
        function populateChart(PolicyHoldersReviewStatus) {
            $scope.labels = ["Approved", "Denied", "Opted to get Own Appraisal"];
            $scope.policyholderReviewGraphData = [PolicyHoldersReviewStatus.approvedCount, PolicyHoldersReviewStatus.declinedCount, PolicyHoldersReviewStatus.optedCount];

            if (PolicyHoldersReviewStatus.approvedCount > 0 || PolicyHoldersReviewStatus.declinedCount > 0 || PolicyHoldersReviewStatus.optedCount > 0)
                $scope.showPolicyholderChart = true;
            else
                $scope.showPolicyholderChart = false;


            //$scope.data = [ 10, 20, 70];
            $scope.Color = ['#1E8449', '#E74C3C', '#8080FF'];
            //PieDataSetOverride is used to draw lines to display the labels
            $scope.DataSetOverride = [{ yAxisID: 'y-axis-1' }]; //y-axis-1 is the ID defined in scales under options.

            $scope.options = {
                animation: {
                    duration: 780,
                    easing: 'linear',
                    animateScale: true,
                    animateRotate: true
                },
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        boxWidth: 12
                    }
                },
                responsive: true,
                hover: false,
                tooltips: false,
                pieceLabel: {
                    render: 'value',
                    fontColor: '#fff',
                    fontSize: 12,
                    fontweight: 'bold',
                    position: 'inside',
                    segment: true
                }
            }
        }

        //item category split chart starts here
        $scope.populategetItemCategorySplitChart = populategetItemCategorySplitChart;
        function populategetItemCategorySplitChart(ItemCategorySplitFlag, typeStatus) {

            $scope.statusFlag = ItemCategorySplitFlag;
            itemCategorySplitTimeStatus = ItemCategorySplitFlag;
            $scope.typeStatus = typeStatus;
            if (typeStatus == 1) {
                $scope.param = {
                    "statusFlag": ItemCategorySplitFlag,
                    "agentId": "ALL"
                }
                var promis = InsuranceReportService.getItemCategorySplit($scope.param);
                promis.then(function (success) {
                    var result = success.data.itemCategories;
                    $scope.showItemCategoryChart = false;
                    $scope.itemCategorySplitLabels = [];
                    $scope.itemCategorySplitData = [];
                    if (result) {
                        angular.forEach(result, function (Item) {
                            var count = Item.totalItemCategoryCount ? " (" + Item.totalItemCategoryCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ")" : " (0)";
                            // $scope.approved.push(count);
                            count = Item.attributeName + count;
                            $scope.itemCategorySplitLabels.push(count);
                            $scope.itemCategorySplitData.push(Item.approvedCoverageByItemCategory);
                            if (!$scope.showItemCategoryChart && Item.approvedCoverageByItemCategory > 0)
                                $scope.showItemCategoryChart = true;
                        });
                    }
                }, function (error) {
                    toastr.remove();
                    if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                        toastr.error(error.data.errorMessage, "Error")
                    }
                    else {
                        toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
                    }
                });


            }
            else {
                $scope.param = {
                    "statusFlag": ItemCategorySplitFlag,
                    "agentId": "ALL"
                }
                var promis = InsuranceReportService.getApprovedItemCategorySplit($scope.param);
                promis.then(function (success) {
                    var result = success.data.itemCategories;
                    $scope.itemCategorySplitLabels = [];
                    $scope.itemCategorySplitData = [];
                    $scope.showItemCategoryChart = false;
                    if (result) {
                        angular.forEach(result, function (Item) {

                            // var count = Item.approvedItemCategoryCount ? " (" + '$' + Item.approvedItemCategoryCount.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ")" : " ($0.0)";

                            // // $scope.approved.push(count);

                            // count = Item.attributeName + count;
                            var count = Item.totalItemCategoryCount ? " (" + Item.totalItemCategoryCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ")" : " (0)";

                            // $scope.approved.push(count);

                            count = Item.attributeName + count;
                            $scope.itemCategorySplitLabels.push(count);


                            $scope.itemCategorySplitData.push(Item.approvedItemCategoryCount);


                            //if (!$scope.showItemCategoryChart && Item.approvedItemCategoryCount > 0)
                            $scope.showItemCategoryChart = true;
                        });
                    }
                }, function (error) {
                    toastr.remove();
                    if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                        toastr.error(error.data.errorMessage, "Error")
                    }
                    else {
                        toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
                    }
                });


            }

            $scope.itemCategorySplitDataSetOverride = [{ yAxisID: 'y-axis-1' }]; //y-axis-1 is the ID defined in scales under options.

            $scope.itemCategorySplitOptions = {
                animation: {
                    duration: 780,
                    easing: 'linear',
                    animateScale: true,
                    animateRotate: true
                },
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        boxWidth: 12
                    }
                },
                responsive: true,
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            var value = data.datasets[0].data[tooltipItem.index];
                            if (parseInt(value) >= 1000) {
                                return '$' + value.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            } else {
                                if (value)
                                    return '$' + value.toFixed(2)
                                else
                                    return '$' + 0;
                            }
                        }
                    } // end callbacks:
                },
                pieceLabel: {
                    render: function (args) {

                        // var c= args.label
                        //var l = c.substring(c.indexOf("("));
                        var value = args.value;
                        if (parseInt(value) >= 1000) {
                            return '$' + value.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        } else {
                            if (value)
                                return '$' + value.toFixed(2)
                            else
                                return '$' + 0;
                        }
                    },
                    fontColor: '#000000',
                    fontSize: 12,
                    fontweight: 'bold',
                    position: 'inside',
                    segment: true
                }


            }
        }
        //Item category split chart ends here

        //function to get get company performance(by param) added by SanthoshM
        $scope.getCompanyPerformance = getCompanyPerformance;
        function getCompanyPerformance(timeInterval) {
            companyPerformanceTimeStatus = timeInterval;
            var param = {
                "statusFlag": timeInterval,
                "agentId": "ALL"
            }
            var companyPerformanceCount = InsuranceReportService.getAgencyPerformance(param);
            companyPerformanceCount.then(function (success) {
                //$(".page-spinner-bar").addClass("hide");
                //console.log(success.data.EfficeincyReport);
                var result = success.data.EfficeincyReport;
                $scope.AppraisalsEvaluatedPerDay = result.appraisalEvaluatedPerDay != null && result.appraisalEvaluatedPerDay > 0 ? roundOf2Decimal(result.appraisalEvaluatedPerDay) : 0;
                $scope.AvgEvaluationTime = result.avgEvaluationTime != null && result.avgEvaluationTime.length > 0 ? result.avgEvaluationTime : 0;
                $scope.AppraisalsCreatedPerDay = result.appraisalaCreatedPerDay != null && result.appraisalaCreatedPerDay > 0 ? roundOf2Decimal(result.appraisalaCreatedPerDay) : 0;
                $scope.AppraisalsSentToArtigem = result.appraisalsSentToArtigem != null && result.appraisalsSentToArtigem > 0 ? result.appraisalsSentToArtigem : 0;
                $scope.TotalAppraisalsCreated = result.totalAppraisalsCreated != null && result.totalAppraisalsCreated > 0 ? result.totalAppraisalsCreated : 0;
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

        // Common All Reports Filters
        $scope.populateReportsChart = populateReportsChart;
        function populateReportsChart(flag) {

            // Policyholder review status
            getPolicyHoldersReviewStatus(flag);

            // Item Category Split
            populategetItemCategorySplitChart(flag, $scope.typeStatus);

            // Company performnce
            getCompanyPerformance(flag);

            // Article Coverage Premium
            populateArticleCoveragePremiumTrendChart(flag);

        }

        // Article coverage and premium trends
        $scope.populateArticleCoveragePremiumTrendChart = populateArticleCoveragePremiumTrendChart;
        function populateArticleCoveragePremiumTrendChart(flag) {

            coverageAndPremiumTimeStatus = flag;

            //line chart starts here
            $scope.coverageTrendLabels = [];
            $scope.coverageTrendSeries = [];
            $scope.coverageTrendData = [];

            var days = daysInThisMonth();
            var todayDate = new Date().getDate();
            var thisQuarter = moment().quarter();
            var thisQuarterMonths = [];

            var allMonths = moment.months();
            if (thisQuarter == 1) {
                for (var i = 0; i <= 2; i++)
                    thisQuarterMonths.push(allMonths[i]);
            }
            if (thisQuarter == 2) {
                for (var i = 3; i <= 5; i++)
                    thisQuarterMonths.push(allMonths[i]);
            }
            if (thisQuarter == 3) {
                for (var i = 6; i <= 8; i++)
                    thisQuarterMonths.push(allMonths[i]);
            }
            if (thisQuarter == 4) {
                for (var i = 9; i <= 11; i++)
                    thisQuarterMonths.push(allMonths[i]);
            }

            $scope.data = {
                "statusFlag": flag,
                "agentId": "ALL"
            }

            var promis = InsuranceReportService.getArticleCoverageTrend($scope.data);
            promis.then(function (success) {
                var thisYearTrendData = [];
                var lastYearTrendData = [];

                var thisYearCoverageCount = [];
                var lastYearCoverageCount = [];

                var result = success.data.coverageAndPremiumReport;
                if (result) {
                    thisYearCoverageCount = result.CoverageCounts;

                    lastYearCoverageCount = result.oldYearcoverageCounts;

                    //coverage trend labels
                    if (flag === 1) {
                        for (var i = 0; i < days; i++) {
                            for (var j = 0; j < thisYearCoverageCount.length; j++) {
                                if (Number(thisYearCoverageCount[j].date) - 1 === i) {
                                    thisYearTrendData[i] = thisYearCoverageCount[j].totalCoverageValue > 0 ? thisYearCoverageCount[j].totalCoverageValue : (i > 0 ? thisYearTrendData[i - 1] : 0);
                                    break;
                                }
                                else if (i < todayDate && i > 0)
                                    thisYearTrendData[i] = thisYearTrendData[i - 1];
                                else if (i < todayDate)
                                    thisYearTrendData[i] = 0
                                
                                if(j==(thisYearCoverageCount.length - 1)){
                                    $scope.totalThisYearCoverage = '$' + (thisYearCoverageCount[j].totalCoverageValue).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") ;
                                }
                            }

                            for (var k = 0; k < lastYearCoverageCount.length; k++) {
                                if (Number(lastYearCoverageCount[k].date) - 1 === i) {
                                    lastYearTrendData[i] = lastYearCoverageCount[k].totalCoverageValue > 0 ? lastYearCoverageCount[k].totalCoverageValue : (i > 0 ? lastYearTrendData[i - 1] : 0);
                                    break;
                                }
                                else if (i < todayDate && i > 0)
                                    lastYearTrendData[i] = lastYearTrendData[i - 1];
                                else
                                    lastYearTrendData[i] = 0
                            }
                            $scope.coverageTrendLabels.push(i + 1);
                        }
                        $scope.coverageTrendData = [thisYearTrendData, lastYearTrendData];
                    }

                    if (flag === 2) {
                        for (var i = 0; i < thisQuarterMonths.length; i++) {
                            for (var j = 0; j < thisYearCoverageCount.length; j++) {
                                if (thisYearCoverageCount[j].monthName === thisQuarterMonths[i] && thisYearCoverageCount[j].totalCoverageValue > 0) {
                                    thisYearTrendData[i] = thisYearCoverageCount[j].totalCoverageValue > 0 ? thisYearCoverageCount[j].totalCoverageValue : thisYearTrendData[i - 1];
                                    break;
                                }
                                else if (thisYearCoverageCount[j].monthName != thisQuarterMonths[i]) {

                                }
                                else
                                    thisYearTrendData[i] = 0

                                    if(j==(thisYearCoverageCount.length - 1)){
                                        $scope.totalThisYearCoverage = '$' + (thisYearCoverageCount[j].totalCoverageValue).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") ;
                                    }
                            }

                            for (var k = 0; k < lastYearCoverageCount.length; k++) {
                                if (lastYearCoverageCount[k].monthName === thisQuarterMonths[i]) {
                                    lastYearTrendData[i] = lastYearCoverageCount[k].totalCoverageValue > 0 ? lastYearCoverageCount[k].totalCoverageValue : lastYearTrendData[i - 1];
                                    break;
                                }
                                else if (lastYearCoverageCount[k].monthName != thisQuarterMonths[i]) {

                                }
                                else
                                    lastYearTrendData[i] = 0
                            }
                            $scope.coverageTrendLabels.push(thisQuarterMonths[i]);
                        }

                        $scope.coverageTrendData = [thisYearTrendData, lastYearTrendData];
                    }

                    if (flag === 3) {
                        for (var i = 0; i < allMonths.length; i++) {
                            for (var j = 0; j < thisYearCoverageCount.length; j++) {
                                if (thisYearCoverageCount[j].monthName === allMonths[i] && thisYearCoverageCount[j].totalCoverageValue > 0) {
                                    thisYearTrendData[i] = thisYearCoverageCount[j].totalCoverageValue > 0 ? thisYearCoverageCount[j].totalCoverageValue : thisYearTrendData[i - 1];
                                    break;
                                }
                                else if (thisYearCoverageCount[j].monthName === allMonths[i] && thisYearCoverageCount[j].totalCoverageValue <= 0) {
                                    thisYearTrendData[i] = thisYearTrendData[i - 1];
                                }
                                else if (thisYearCoverageCount[j].monthName != allMonths[i]) {

                                }
                                else
                                    thisYearTrendData[i] = 0

                                    if(j==(thisYearCoverageCount.length - 1)){
                                        $scope.totalThisYearCoverage = '$' + (thisYearCoverageCount[j].totalCoverageValue).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") ;
                                    }
                            }

                            for (var k = 0; k < lastYearCoverageCount.length; k++) {
                                if (lastYearCoverageCount[k].monthName === allMonths[i]) {
                                    lastYearTrendData[i] = lastYearCoverageCount[k].totalCoverageValue > 0 ? lastYearCoverageCount[k].totalCoverageValue : lastYearTrendData[i - 1];
                                    break;
                                }
                                else if (lastYearCoverageCount[k].monthName === allMonths[i] && lastYearCoverageCount[k].totalCoverageValue <= 0) {
                                    lastYearTrendData[i] = lastYearTrendData[i - 1];
                                }
                                else if (lastYearCoverageCount[k].monthName != allMonths[i]) {

                                }
                                else
                                    lastYearTrendData[i] = 0
                            }

                            $scope.coverageTrendLabels.push(allMonths[i].substr(0, 3));
                        }

                        $scope.coverageTrendData = [thisYearTrendData, lastYearTrendData];
                    }
                }
            }, function (error) {
                toastr.remove();
                if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                    toastr.error(error.data.errorMessage, "Error")
                }
                else {
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
                }
            });

            $scope.coverageTrendSeries = ['This year', $scope.yearValues.lastYear];

            $scope.coverageTrendOptions = {
                responsive: true,
                maintainAspectRatio: false,

                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            var value = data.datasets[0].data[tooltipItem.index];
                            if (parseInt(value) >= 1000) {
                                return '$' + value.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            } else {
                                if (value)
                                    return '$' + value.toFixed(2)
                                else
                                    return '$' + 0;
                            }
                        }
                    } // end callbacks:
                },
                scales: {
                    xAxes: [
                        {
                            id: 'y-axis-1',
                            gridLines: {
                                display: false
                            },
                            ticks: {
                                fontSize: 9
                            }
                        }],
                    yAxes: [{
                        id: 'x-axis-1',
                        gridLines: {
                            display: false
                        },
                        ticks: {
                            callback: function (label, index, labels) {
                                return ' $' + label.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            },
                            min: 0
                        },
                        scaleLabel: {
                            display: true,

                        }

                    },
                    ]
                },
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        boxWidth: 12
                    }
                },
            }

            $scope.coverageTrendColors = ['#00e6ac', '#ff661a', '#A0B421', '#00A39F'];
            $scope.coverageTrendDatasetOverride = [
                {
                    fill: false,
                    backgroundColor: [
                        "#00e6ac"
                    ]
                },
                {
                    fill: false,
                    backgroundColor: [
                        "#ff661a"
                    ]
                }
            ];


            //Premium trends
            $scope.premiumTrendLabels = [];
            $scope.premiumTrendSeries = [];
            $scope.premiumTrendData = [];

            //Premium Trends
            var promis = InsuranceReportService.getPremiumTrend($scope.data);
            promis.then(function (success) {
                var thisYearTrendData = [];
                var lastYearTrendData = [];

                var thisYearCoverageCount = [];
                var lastYearCoverageCount = [];

                var result = success.data.averagePremiumTrendCounts;
                if (result) {

                    thisYearCoverageCount = result.CoverageCounts;

                    lastYearCoverageCount = result.oldYearcoverageCounts;

                    //coverage trend labels
                    if (flag === 1) {
                        for (var i = 0; i < days; i++) {
                            for (var j = 0; j < thisYearCoverageCount.length; j++) {
                                if (Number(thisYearCoverageCount[j].date) - 1 === i) {
                                    thisYearTrendData[i] = thisYearCoverageCount[j].sumofPremiumValue > 0 ? thisYearCoverageCount[j].sumofPremiumValue : (i > 0 ? thisYearTrendData[i - 1] : 0);
                                    break;
                                }
                                else if (i < todayDate && i > 0)
                                    thisYearTrendData[i] = thisYearTrendData[i - 1];
                                else if (i < todayDate)
                                    thisYearTrendData[i] = 0

                                    if(j==(thisYearCoverageCount.length - 1)){
                                        $scope.totalThisYearPremium = '$' + (thisYearCoverageCount[j].sumofPremiumValue).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") ;
                                    }
                            }

                            for (var k = 0; k < lastYearCoverageCount.length; k++) {
                                if (Number(lastYearCoverageCount[k].date) - 1 === i) {
                                    lastYearTrendData[i] = lastYearCoverageCount[k].sumofPremiumValue > 0 ? lastYearCoverageCount[k].sumofPremiumValue : (i > 0 ? lastYearTrendData[i - 1] : 0);
                                    break;
                                }
                                else if (i < todayDate && i > 0)
                                    lastYearTrendData[i] = lastYearTrendData[i - 1];
                                else if (i < todayDate)
                                    lastYearTrendData[i] = 0
                            }
                            $scope.premiumTrendLabels.push(i + 1);
                        }
                        $scope.premiumTrendData = [thisYearTrendData, lastYearTrendData];
                    }

                    if (flag === 2) {
                        for (var i = 0; i < thisQuarterMonths.length; i++) {
                            for (var j = 0; j < thisYearCoverageCount.length; j++) {
                                if (thisYearCoverageCount[j].monthName === thisQuarterMonths[i] && thisYearCoverageCount[j].sumofPremiumValue > 0) {
                                    thisYearTrendData[i] = thisYearCoverageCount[j].sumofPremiumValue > 0 ? thisYearCoverageCount[j].sumofPremiumValue : thisYearTrendData[i - 1];
                                    break;
                                }
                                else if (thisYearCoverageCount[j].monthName === thisQuarterMonths[i] && thisYearCoverageCount[j].sumofPremiumValue <= 0) {
                                    thisYearTrendData[i] = thisYearTrendData[i - 1];
                                }
                                else if (thisYearCoverageCount[j].monthName != thisQuarterMonths[i]) {

                                }
                                else
                                    thisYearTrendData[i] = 0

                                    if(j==(thisYearCoverageCount.length - 1)){
                                        $scope.totalThisYearPremium = '$' + (thisYearCoverageCount[j].sumofPremiumValue).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") ;
                                    }
                            }

                            for (var k = 0; k < lastYearCoverageCount.length; k++) {
                                if (lastYearCoverageCount[k].monthName === thisQuarterMonths[i]) {
                                    lastYearTrendData[i] = lastYearCoverageCount[k].sumofPremiumValue > 0 ? lastYearCoverageCount[k].sumofPremiumValue : lastYearTrendData[i - 1];
                                    break;
                                }
                                else if (lastYearCoverageCount[k].monthName === thisQuarterMonths[i] && lastYearCoverageCount[k].sumofPremiumValue <= 0) {
                                    lastYearTrendData[i] = lastYearTrendData[i][i - 1];
                                }
                                else if (lastYearCoverageCount[k].monthName != thisQuarterMonths[i]) {

                                }
                                else
                                    lastYearTrendData[i] = 0
                            }
                            $scope.premiumTrendLabels.push(thisQuarterMonths[i]);
                        }

                        $scope.premiumTrendData = [thisYearTrendData, lastYearTrendData];
                    }

                    if (flag === 3) {

                        for (var i = 0; i < allMonths.length; i++) {
                            for (var j = 0; j < thisYearCoverageCount.length; j++) {
                                if (thisYearCoverageCount[j].monthName === allMonths[i] && thisYearCoverageCount[j].sumofPremiumValue > 0) {
                                    thisYearTrendData[i] = thisYearCoverageCount[j].sumofPremiumValue > 0 ? thisYearCoverageCount[j].sumofPremiumValue : thisYearTrendData[i - 1];
                                    break;
                                }
                                else if (thisYearCoverageCount[j].monthName === allMonths[i] && thisYearCoverageCount[j].sumofPremiumValue <= 0) {
                                    thisYearTrendData[i] = thisYearTrendData[i - 1];
                                }
                                else if (thisYearCoverageCount[j].monthName != allMonths[i]) {

                                }
                                else
                                    thisYearTrendData[i] = 0

                                    if(j==(thisYearCoverageCount.length - 1)){
                                        $scope.totalThisYearPremium = '$' + (thisYearCoverageCount[j].sumofPremiumValue).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") ;
                                    }
                            }

                            for (var k = 0; k < lastYearCoverageCount.length; k++) {
                                if (lastYearCoverageCount[k].monthName === allMonths[i]) {
                                    lastYearTrendData[i] = lastYearCoverageCount[k].sumofPremiumValue > 0 ? lastYearCoverageCount[k].sumofPremiumValue : lastYearTrendData[i - 1];
                                    break;
                                }
                                else if (lastYearCoverageCount[k].monthName === allMonths[i] && lastYearCoverageCount[k].sumofPremiumValue <= 0) {
                                    lastYearTrendData[i] = lastYearTrendData[i][i - 1];
                                }
                                else if (lastYearCoverageCount[keyname].monthName != allMonths[i]) {

                                }
                                else
                                    lastYearTrendData[i] = 0
                            }
                            $scope.premiumTrendLabels.push(allMonths[i].substr(0, 3));
                        }

                        $scope.premiumTrendData = [thisYearTrendData, lastYearTrendData];
                    }
                }
            }, function (error) {
                toastr.remove();
                if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                    toastr.error(error.data.errorMessage, "Error")
                }
                else {
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
                }
            });

            //Premium Trends
            $scope.premiumTrendSeries = ['This year', $scope.yearValues.lastYear];

            $scope.premiumTrendOptions = {
                responsive: true,
                maintainAspectRatio: false,

                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            var value = data.datasets[0].data[tooltipItem.index];
                            if (parseInt(value) >= 1000) {
                                return '$' + value.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            } else {
                                if (value)
                                    return '$' + value.toFixed(2)
                                else
                                    return '$' + 0;
                            }
                        }
                    } // end callbacks:
                },
                scales: {
                    xAxes: [
                        {
                            id: 'y-axis-1',
                            gridLines: {
                                display: false
                            },
                            ticks: {
                                fontSize: 9
                            }
                        }],
                    yAxes: [
                        {
                            id: 'x-axis-1',
                            gridLines: {
                                display: false
                            },
                            ticks: {
                                callback: function (label, index, labels) {
                                    return ' $' + label.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                },
                                min: 0
                            },
                        }]
                },
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        boxWidth: 12
                    }
                },
            }

            $scope.premiumTrendColors = ['#3939ac', '#ff661a', '#A0B421', '#00A39F'];
            $scope.premiumTrendDatasetOverride = [
                {
                    fill: false,
                    backgroundColor: [
                        "#3939ac"
                    ]
                },
                {
                    fill: false,
                    backgroundColor: [
                        "#ff661a"
                    ]
                }
            ];
        }
        //second line chart ends here

        // Populate Insurance Manager reports
        $scope.openInsuranceMgrReports = openInsuranceMgrReports;
        function openInsuranceMgrReports(item, report) {
            if (report == 'AgentReports') {
                sessionStorage.setItem("AgentReports", true);
                sessionStorage.setItem("ManagerReports", false);
                sessionStorage.setItem("refferer", refferer);
                sessionStorage.setItem("agentInfo", JSON.stringify(item));
                $location.url("InsuranceReports");
            }
            if (report == 'ManagerReports') {
                sessionStorage.setItem("AgentReports", false);
                sessionStorage.setItem("ManagerReports", true);
                $location.url("InsuranceManagerReports");
            }
        }

        // Export as CSV format
        $scope.exportCSV = exportCSV;
        function exportCSV(DataId, csvFileName) {
            var secId = "#" + DataId;
            var csvFileName = csvFileName + ".csv";
            var data = alasql('SELECT * FROM HTML(' + '"' + secId + '"' + ',{headers:true})');
            alasql('SELECT * INTO CSV(' + '"' + csvFileName + '"' + ',{headers:true}) FROM ?', [data]);
        }

        // Export Agency Reports in the given formats
        $scope.exportAgencyReports = exportAgencyReports;
        function exportAgencyReports(fileType) {
            var param = {
                "userId": sessionStorage.getItem("UserId"),
                "fileType": fileType,
            }
            $(".page-spinner-bar").removeClass("hide");
            var getReports = ExportReportService.exportAgentsReport(param);
            getReports.then(function success(response) {
              var headers = response.headers();
              var filename = headers['x-filename'];
              var contentType = headers['content-type'];
              var linkElement = document.createElement('a');
              try {
                  var blob = new Blob([response.data], { type: contentType });
                  var url = window.URL.createObjectURL(blob);
                  linkElement.setAttribute('href', url);
                  linkElement.setAttribute("download", filename);
                  var clickEvent = new MouseEvent("click", {
                      "view": window,
                      "bubbles": true,
                      "cancelable": false
                  });
                  linkElement.dispatchEvent(clickEvent);
                  $(".page-spinner-bar").addClass("hide");
              } catch (ex) {
                  console.log(ex);
              }
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
                $(".page-spinner-bar").addClass("hide");
            });
        }

        // Export as PDF format
        $scope.exportPDF = exportPDF;
        function exportPDF(GraphName) {
            var doc = new jsPDF('l', 'mm', 'b2');
            var specialElementHandlers = {
                '#editor': function (element, renderer) {
                    return true;
                }
            };
            if (GraphName == 'CompanyPerformance') {
                document.getElementById('performanceIndicators').style.display = 'block';
                var doc = new jsPDF('p', 'pt', 'a4');
                doc.addHTML($('#performanceIndicators'), 150, 30, function () {
                    doc.save('CompanyPerformance.pdf');
                });
                document.getElementById('performanceIndicators').style.display = 'none';
            } else if (GraphName == 'AgencyReports') {
                doc = pdfPageHeaderData(doc, "Agency Reports");
                doc.setFontSize(20);
                document.getElementById('AgencyReportsTbl').style.display = 'block';
                doc.fromHTML($('#AgencyReportsTbl').html(), 80, 70, {
                    //'width': '100%',
                    'elementHandlers': specialElementHandlers
                });
                doc.save("AgencyReports.pdf");
                document.getElementById('AgencyReportsTbl').style.display = 'none';
            }

        }

        // Export Graph as PDF
        $scope.exportGraphPDF = exportGraphPDF;
        function exportGraphPDF(GraphName) {
            var doc = new jsPDF('l', 'mm', 'b2');
            //var doc = new jsPDF("p", "mm", "a4");
            let options = { background: '#fff', format: 'PNG', width: 500 };
            if (GraphName == 'ArticleCvgPremiums') {
                //doc = new jsPDF('landscape');
                var canvas1 = $("#ArticleCoverageGraph").get(0);
                var canvas2 = $("#premiumGraph").get(0);
                var canvas1Img = canvas1.toDataURL("image/png", 1.0);
                var canvas2Img = canvas2.toDataURL("image/png", 1.0);

                doc = pdfPageHeaderData(doc, "Article Coverage And Premiums");
                doc.text(210, 90, "Article Coverage");
                doc.addImage(canvas1Img, 'png', 80, 100, 250, 160);
                doc.text(480, 90, "Premiums");
                doc.addImage(canvas2Img, 'png', 350, 100, 250, 160);
                doc.addHTML($('#ArticleCoveragePremiumBtns'), 240, 65, options, function () {
                    doc.save("ArticleCvgPremiums.pdf");
                });

            } else if (GraphName == 'ItemCategory') {
                //var width = doc.internal.pageSize.getWidth();
                //var height = doc.internal.pageSize.getHeight();
                var canvas = $("#itemCategoryGraph").get(0);
                var canvasImg = canvas.toDataURL("image/png", 1.0);
                doc = pdfPageHeaderData(doc, "Item Category Split");
                var e = document.getElementById("catogorySplitChartSel");
                var selCatogorySplitChart = e.options[e.selectedIndex].text;
                doc.text(250, 90, "Catogory Split Chart by: ");
                doc.text(320, 90, selCatogorySplitChart);
                doc.addImage(canvasImg, 'png', 80, 105, 330, 160);
                doc.addHTML($('#ItemCategorySplitBtns'), 220, 70, options, function () {
                    doc.save("ItemCategorySplit.pdf");
                });

            } else if (GraphName == 'PolicyholderReviewResults') {
                var canvas = $("#policyholderReviewGraph").get(0);
                var canvasImg = canvas.toDataURL("image/png", 1.0);
                doc = pdfPageHeaderData(doc, "Policyholder Review Results");
                doc.addImage(canvasImg, 'png', 80, 90, 330, 160);
                doc.addHTML($('#PolicyHoldersReviewBtns'), 220, 70, options, function () {
                    doc.save("PolicyholderReviewResults.pdf");
                });
            }

        }

        // Export data as Graph to CSV format TBD
        $scope.exportGraphCSV = exportGraphCSV;
        function exportGraphCSV() {

        }

        // Export data as Graph to Excel format TBD
        $scope.exportGraphExcel = exportGraphExcel;
        function exportGraphExcel() {

        }

        // Format Current Date with Time AM/PM
        $scope.dateTimeFormatAMPM = dateTimeFormatAMPM;
        function dateTimeFormatAMPM() {
            var d = new Date(),
                seconds = d.getSeconds().toString().length == 1 ? '0' + d.getSeconds() : d.getSeconds(),
                minutes = d.getMinutes().toString().length == 1 ? '0' + d.getMinutes() : d.getMinutes(),
                hours = d.getHours().toString().length == 1 ? '0' + d.getHours() : d.getHours(),
                ampm = d.getHours() >= 12 ? 'PM' : 'AM',
                months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return days[d.getDay()] + ' ' + months[d.getMonth()] + ' ' + d.getDate() + ' ' + d.getFullYear() + ' ' + hours + ':' + minutes + ':' + seconds + ' ' + ampm;
        }

        // Comman PDF header data
        $scope.pdfPageHeaderData = pdfPageHeaderData;
        function pdfPageHeaderData(doc, report) {
            doc.text(80, 15, $scope.InsCompanyName);
            doc.text(80, 20, "______________________________________________________________________________________________________________________________________________________________________");
            doc.text(80, 35, "Report Date: ");
            doc.text(130, 35, dateTimeFormatAMPM());
            doc.text(80, 50, "Downloaded By: ");
            doc.text(130, 50, $scope.loggedInUser);
            doc.text(80, 65, "Report Name: ");
            doc.text(130, 65, report);
            return doc;
        }

        function daysInThisMonth() {
            var now = new Date();
            return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        }

        // Pagination
        $scope.pageChanged = pageChanged;
        function pageChanged(pageNum) {
            $scope.currentPage = pageNum;
            GetAgentsReport();
        }


        $scope.exportPolicyholderReviewReport = exportPolicyholderReviewReport;
        function exportPolicyholderReviewReport(fileType)
        {
            $(".page-spinner-bar").removeClass("hide");
            var param = {
                "agentId": "ALL",
                "filterBy": policyHolderReviewTimeStatus, //time intervals
                "isManager": true,
                "isUnderwriter": false,
                "userRole": "INSURANCE ACCOUNT MANAGER",
                "fileType": fileType
            }
            var reports = ExportReportService.getPolicyholderReviewReports(param);
            reports.then(function success(response) {
              var headers = response.headers();
              var filename = headers['x-filename'];
              var contentType = headers['content-type'];
              var linkElement = document.createElement('a');
              try {
                  var blob = new Blob([response.data], { type: contentType });
                  var url = window.URL.createObjectURL(blob);
                  linkElement.setAttribute('href', url);
                  linkElement.setAttribute("download", filename);
                  var clickEvent = new MouseEvent("click", {
                      "view": window,
                      "bubbles": true,
                      "cancelable": false
                  });
                  linkElement.dispatchEvent(clickEvent);
                $(".page-spinner-bar").addClass("hide");
              } catch (ex) {
                  console.log(ex);
              }
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
                $(".page-spinner-bar").addClass("hide");
            });
        }

        //export article coverage and premium trends
        $scope.exportCoverageAndPremium = exportCoverageAndPremium;
        function exportCoverageAndPremium(fileType) {
            $(".page-spinner-bar").removeClass("hide");
            var data = {
                "userId": userId,
                "filterBy": coverageAndPremiumTimeStatus, //time intervals
                "isManager": true,
                "isUnderwriter": false,
                "userRole": "INSURANCE ACCOUNT MANAGER",
                "fileType": fileType
            }
            var reports = ExportReportService.getCoverageAndPremiumReports(data);
            reports.then(function success(response) {
              var headers = response.headers();
              var filename = headers['x-filename'];
              var contentType = headers['content-type'];
              var linkElement = document.createElement('a');
              try {
                  var blob = new Blob([response.data], { type: contentType });
                  var url = window.URL.createObjectURL(blob);
                  linkElement.setAttribute('href', url);
                  linkElement.setAttribute("download", filename);
                  var clickEvent = new MouseEvent("click", {
                      "view": window,
                      "bubbles": true,
                      "cancelable": false
                  });
                  linkElement.dispatchEvent(clickEvent);
                $(".page-spinner-bar").addClass("hide");
              } catch (ex) {
                  console.log(ex);
              }
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
                $(".page-spinner-bar").addClass("hide");
            });
        }


        //export Item category split reports
        $scope.exportItemCategorySplit = exportItemCategorySplit;
        function exportItemCategorySplit(fileType) {
            $(".page-spinner-bar").removeClass("hide");
            var param = {
                "agentId": "ALL",
                "filterBy": itemCategorySplitTimeStatus, //time intervals
                "isManager": true,
                "isUnderwriter": false,
                "userRole": "INSURANCE ACCOUNT MANAGER",
                "fileType": fileType,
                "typeStatus":$scope.typeStatus,
            }
            var reports = ExportReportService.exportItemCategorySplitReport(param);
            reports.then(function success(response) {
              var headers = response.headers();
              var filename = headers['x-filename'];
              var contentType = headers['content-type'];
              var linkElement = document.createElement('a');
              try {
                  var blob = new Blob([response.data], { type: contentType });
                  var url = window.URL.createObjectURL(blob);
                  linkElement.setAttribute('href', url);
                  linkElement.setAttribute("download", filename);
                  var clickEvent = new MouseEvent("click", {
                      "view": window,
                      "bubbles": true,
                      "cancelable": false
                  });
                  linkElement.dispatchEvent(clickEvent);
                  $(".page-spinner-bar").addClass("hide");
              } catch (ex) {
                  console.log(ex);
              }
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
                $(".page-spinner-bar").addClass("hide");
            });
        }

         // Export Company performance
         $scope.exportCompanyPerformanceReport = exportCompanyPerformanceReport;
         function exportCompanyPerformanceReport(fileType) {
             $(".page-spinner-bar").removeClass("hide");
             var data = {
                 "agentId": "ALL",
                 "filterBy": companyPerformanceTimeStatus, //time intervals
                 "isManager": true,
                 "isUnderwriter": false,
                 "userRole": "INSURANCE ACCOUNT MANAGER",
                 "fileType": fileType
             }
             var reports = ExportReportService.exportPerformanceReportForInsuranceManager(data);
             reports.then(function success(response) {
               var headers = response.headers();
               var filename = headers['x-filename'];
               var contentType = headers['content-type'];
               var linkElement = document.createElement('a');
               try {
                   var blob = new Blob([response.data], { type: contentType });
                   var url = window.URL.createObjectURL(blob);
                   linkElement.setAttribute('href', url);
                   linkElement.setAttribute("download", filename);
                   var clickEvent = new MouseEvent("click", {
                       "view": window,
                       "bubbles": true,
                       "cancelable": false
                   });
                   linkElement.dispatchEvent(clickEvent);
                   $(".page-spinner-bar").addClass("hide");
               } catch (ex) {
                   console.log(ex);
               }
             }, function (error) {
                 $scope.ErrorMessage = error.data.errorMessage;
                 $(".page-spinner-bar").addClass("hide");
             });
         }

        //Download file / documents
        $scope.downloadFile = function (url) {
            var filename = url.split('/');
            filename = filename[filename.length - 1].split('_');
            var s = $scope.serverAddress + url;
            var linkElement = document.createElement('a');
            linkElement.setAttribute('href', s);
            linkElement.setAttribute("download", filename[filename.length - 1]);
            var clickEvent = new MouseEvent("click", {
                "view": window,
                "bubbles": true,
                "cancelable": false
            });
            linkElement.dispatchEvent(clickEvent);
        }
    });
