angular.module('MetronicApp')
    .controller('AgentReportsController', function ($rootScope, $scope, $filter, $uibModal, settings, $http, $location, $translate, $translatePartialLoader, InsuranceReportService, InsuranceAccountManagerDashboardService,
        AddPolicyService, AuthHeaderService, ExportReportService, $window, CalendarUtility, utility, CommonUtils, CommonConstants) {

        $translatePartialLoader.addPart('InsuranceReports');
        $translate.refresh();
        $scope.ShowHeader = true;
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        $translate.refresh();
        $scope.ErrorMessage = "";

        $scope.appraisalStatus = [];
        $scope.stateList = [];
        $scope.currentPage = 1;

        $scope.filterReports = sessionStorage.getItem('filterReports') && sessionStorage.getItem('filterReports')!=null ? new Map(Object.entries(JSON.parse(sessionStorage.getItem('filterReports')))) : null;
        $scope.UserType = sessionStorage.getItem('RoleList');
        $scope.loggedInUser = sessionStorage.getItem('Name');
        $scope.InsCompanyName = sessionStorage.getItem('InsuranceCompanyName');
        $scope.PolicyAppraisalCount = {};
        $scope.PolicyHoldersReviewStatus = {};
        $scope.reportList = [];
        $scope.policyReport = {};
        $scope.appraisals = [];
        $scope.catogorySplit = {};
        $scope.catogorySplit.status = "1";
        //item category
        $scope.itemCategorySplitLabels = [];
        $scope.itemCategorySplitData = [];
        $scope.showPolicyholderChart = false;
        $scope.showItemCategoryChart = false;

        $scope.PolicyReportSessionData = sessionStorage.getItem('PolicyReport');
        $scope.AppraisalToReport = sessionStorage.getItem('AppraisalToReport'); 

        $scope.totalThisYearCoverage = "";
        $scope.totalThisYearPremium = "";


        // Pagination
        $scope.pageSize = 20;
        $scope.totalItems = 0;
        var startPos = 0;
        var max = 20;
        $scope.currentPage = 1;
        $scope.toShowingPage = 20;

        $scope.myObj = {};
        $scope.document = {};
        $scope.serverAddress = '';
        $scope.startDate="";
        $scope.fromDate="";
        $scope.toDate="";
        var userId = sessionStorage.getItem("UserId");
        $scope.isFromManager = false;
        var policyHolderReviewTimeStatus = 1;
        var coverageAndPremiumTimeStatus = 1;
        var itemCategorySplitTimeStatus = 1;
        var agencyPerformanceTimeStatus = 1;
        $scope.policyReport.searchQuery = '';
        $scope.statusIds = [];
        $scope.stateIds = [];

        var refferer = sessionStorage.getItem("refferer");
        if (refferer === "MANAGER_DASHBOARD") {
            var agentInfo = JSON.parse(sessionStorage.getItem("agentInfo"));
            userId = agentInfo.agentId;
            $scope.agent = {
                "agentName": agentInfo.agentName,
                "ageny": agentInfo.agencyCode,
                "agentId": agentInfo.agentId,
            }
            $scope.isFromManager = true;
        }

        function init() {
            // populate date
            populateDate();
            populateDateButtons();

            //get all appraisal status
            var status = InsuranceReportService.getAppraisalStatusList();
            status.then(function (success) { 
                $scope.appraisalStatus = success.data.appraisalStatus;
                $scope.statusArr = [...$scope.appraisalStatus];
                $scope.policyReport.appraisalStatus = defaultApprovedStatus($scope.appraisalStatus)
            }, function (error) { $scope.appraisalStatus = []; });

            

            // get states
            var statePromise = AddPolicyService.getStates();
            statePromise.then(function (success) {
                $scope.StateList = success.data.data; 
                $scope.stateArr = [...$scope.StateList];
            }, function (error) {
                $scope.StateList = [];
            });

            $scope.isShowAlerts = true;
            $scope.isShowKpis = true;

            $scope.pageNumber = 0;
            {
                ShowItem: "All"
            };
         // Update existing report saved filters
        if($scope.filterReports && $scope.filterReports.get(CommonConstants.filters.AGENT_APPR_RPT)){
             let agentApprRpt = new Map(Object.entries(JSON.parse($scope.filterReports.get(CommonConstants.filters.AGENT_APPR_RPT))));
              console.log("agentApprRpt", agentApprRpt);
        if(agentApprRpt){
         $scope.policyReport.fromDate = agentApprRpt.get("dateFrom");
         $scope.policyReport.toDate = agentApprRpt.get("dateTo");
        $scope.fromDate = agentApprRpt.get("dateFrom");
        $scope.toDate = agentApprRpt.get("dateTo");
        $scope.statusIds = angular.isDefined(agentApprRpt.get("status"))? agentApprRpt.get("status"): [];
        $scope.stateIds = angular.isDefined(agentApprRpt.get("state"))?agentApprRpt.get("state"):[];     
    }                
}
            //debugger;
            //$scope.PolicyReportSessionData=null;
            // Coming from Appraisal Details page - Retain old selected filter values
            if($scope.AppraisalToReport == "yes"){
                let rptArrs = $scope.PolicyReportSessionData.split("=");
                //$scope.appraisals = [];
                $scope.policyReport.fromDate =rptArrs[0];
                $scope.policyReport.toDate = rptArrs[1];
                $scope.fromDate =rptArrs[0];
                $scope.toDate = rptArrs[1];
                $scope.policyReport.appraisalStatus = rptArrs[2] == "undefined" ? null : parseInt(rptArrs[2]);
                $scope.policyReport.state = rptArrs[3]== "undefined" ? null : parseInt(rptArrs[3]);
                sessionStorage.removeItem("AppraisalToReport");
            }

            window.setTimeout(()=>{$scope.policyReport.appraisalStatus = defaultApprovedStatus($scope.appraisalStatus);
            getPolicyReports();},1000);
            getPolicyHoldersReviewStatus(1);
            populategetItemCategorySplitChart(1, 1);
            loadCalendar(1);
            getAgencyPerformance(1);
            populateArticleCoveragePremiumTrendChart(1);
            // populateAppraisalReports(1);

            var GetGlobaldata = $http.get('Config/Configuration.json');
            GetGlobaldata.then(function (success) {
                ConfigSettings = success.data.data;
                $scope.serverAddress = ConfigSettings.serverAddress;
            });
        }
        init();

        // get current date
        $scope.populateDate = populateDate;
        function populateDate() {
            // from date
            // var currentTime = new Date()
            // var year = currentTime.getFullYear();
            // $scope.policyReport.fromDate = "01/01/"+year;            
            // var d = $filter("TodaysDate")();
            // $scope.policyReport.toDate = d;
            // $("#fromDate").datepicker({autoclose: true}).datepicker('update', $scope.policyReport.fromDate);
            // $("#toDate").datepicker({autoclose: true}).datepicker('update', $scope.policyReport.toDate);
            var currentTime = new Date()
            var year = currentTime.getFullYear();
            $scope.fromDate = "01/01/" + year;
            var d = $filter("TodaysDate")();
            $scope.toDate = d;
            
            
        }


        // get current month, quarter, year.
        $scope.populateDateButtons = populateDateButtons;
        function populateDateButtons() {
            var now = new Date();
            var currentQuarter = moment().quarter();
            var year = now.getFullYear();
            var splitYear = year.toString().substr(2, 2);
            //console.log("year"+year);
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

        // Search appraisal reports
        $scope.searchAppraisalReportBykey = searchAppraisalReportBykey
        function searchAppraisalReportBykey(searchQuery) {
            $scope.policyReport.searchQuery = searchQuery;
            $scope.currentPage = 1;
            $scope.appraisals = [];
            getPolicyReports();
        }

        $scope.resetFilter = resetFilter;
        function resetFilter() {
            $scope.policyReport.appraisalStatus = defaultApprovedStatus($scope.appraisalStatus);
            $scope.policyReport.state = null;
            $scope.statusIds = [];
            $scope.stateIds = [];
            populateDate();
             $("#fromDate").datepicker({autoclose: true}).datepicker('update', $scope.fromDate);
             $("#toDate").datepicker({autoclose: true}).datepicker('update', $scope.toDate);
            populateDateButtons();
            getPolicyReports();
            clearAllState();
            clearAllStatus();
        }

        //Policy report
        $scope.getPolicyReports = getPolicyReports;
        function getPolicyReports() {
            $(".page-spinner-bar").removeClass("hide");
            var data = {
                "userId": userId,
                // "effectiveFromDate": $filter('DatabaseDateFormatMMddyyyy')($scope.policyReport.fromDate),
                // "effectiveToDate": $filter('DatabaseDateFormatMMddyyyy')($scope.policyReport.toDate),
                "effectiveFromDate": $filter('DatabaseDateFormatMMddyyyy')($scope.fromDate),
                "effectiveToDate": $filter('DatabaseDateFormatMMddyyyy')($scope.toDate),
                "filterByStatus": $scope.statusIds ? $scope.statusIds : null,
                "filterByState": $scope.stateIds ? $scope.stateIds : null,
                "filterBy": 1, //View by appraisal
                "isManager": $scope.policyReport.appraisalStatus==null ?true: false ,
                "isUnderwriter": false,
                "startPos": startPos,
                "maxCount": max,
                "searchKeyword": $scope.policyReport.searchQuery.length > 0 ? $scope.policyReport.searchQuery : null,
                "sortBy": $scope.sortKey,
                "orderBy": $scope.reverse ? 1 : 0,
            }

            // Set policy Data in session for navigation use
            // let policyReportDataStr = $scope.policyReport.fromDate+"="+$scope.policyReport.toDate+"="+$scope.policyReport.appraisalStatus+"="+$scope.policyReport.state;
            let policyReportDataStr = $scope.fromDate+"="+$scope.toDate+"="+$scope.policyReport.appraisalStatus+"="+$scope.policyReport.state;
            sessionStorage.setItem('PolicyReport', policyReportDataStr);

            // Set report filters in session
            const agentApprRpt = new Map();
            agentApprRpt.set("dateFrom", $scope.fromDate);
            agentApprRpt.set("dateTo", $scope.toDate);
            agentApprRpt.set("status", $scope.statusIds);
            agentApprRpt.set("state", $scope.stateIds);     
            CommonUtils.setReportFilters(CommonConstants.filters.AGENT_APPR_RPT, JSON.stringify(Object.fromEntries(agentApprRpt)));

            // var data = {
            //     "userId": userId,
            //     "isManager": false,
            //     "isUnderwriter": false,
            //     "startPos": startPos,
            //     "maxCount": max,
            //     "filterBy": 1, //View by appraisal
            //     "searchKeyword": $scope.policyReport.searchQuery.length > 0 ? $scope.policyReport.searchQuery : null,
            //     "sortBy": $scope.sortKey,
            //     "orderBy": $scope.reverse ? 1 : 0,
            // }
            $scope.appraisals = [];
            var reports = InsuranceReportService.getPolicyReportList(data);
            reports.then(function (success) {
                var reports = success && success.data ? success.data.data : null;
                $scope.totalItems = reports && reports.total > 0 ? reports.total : 0;
                if (reports) {
                    if ($scope.currentPage == 1) {
                        $scope.toShowingPage = reports.appraisals ? reports.appraisals.length : 0;
                    } else {
                        $scope.toShowingPage = reports.appraisals ? reports.appraisals.length + ($scope.pageSize * ($scope.currentPage - 1)) : 0
                    }
                    //$scope.appraisals = reports.appraisals;
                    // var currentListLength = ($scope.currentPage - 1) * max;
                    // if (currentListLength != $scope.appraisals.length) {
                    //     $scope.appraisals = new Array(currentListLength).fill(new Object());
                    // }

                    angular.forEach(reports.appraisals, function (item) {
                        item.policyholderName = $filter('constructName')(item.policyholderDetails.primaryPolicyHolderFname, item.policyholderDetails.primaryPolicyHolderLname);
                        item.isNegativeValue = false;
                        var coverageChange = item.sc_insuranceReplacementValue - item.appraisalOldValue;
                        if (coverageChange > 0)
                            item.changeInCoverage = Math.abs(coverageChange) != item.appraisalOldValue ? Math.abs(coverageChange) : 0;
                        else {
                            item.changeInCoverage = Math.abs(coverageChange);
                            item.isNegativeValue = true;
                        }
                        $scope.appraisals.push(item);
                    });

                    var isNegativeValue = false;
                    if (reports.totalChangeInCoverage < 0)
                        isNegativeValue = true;
                    $scope.totalValues = {
                        "totalOldAppraisalValue": reports.totalOldAppraisalValue,
                        "totalSpeedCheckValue": reports.totalSpeedCheckValue,
                        "totalCoverageApproved": reports.totalCoverageApproved,
                        "totalChangeInCoverage": Math.abs(reports.totalChangeInCoverage),
                        "isNegativeValue": isNegativeValue
                    }
                }
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
                $(".page-spinner-bar").addClass("hide");
            });
        }

        // Sort Appraisal List Columns
        $scope.sort = function (keyname) {
            $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false;
            $scope.sortKey = keyname;   //set the sortKey to the param passed
            $scope.appraisals = [];
            $scope.currentPage = 1;
            getPolicyReports();
        }

        $scope.getPolicyHoldersReviewStatus = getPolicyHoldersReviewStatus;
        function getPolicyHoldersReviewStatus(status) {
            policyHolderReviewTimeStatus = status;
            var param = {
                "statusFlag": status,
                "agentId": userId
            }
            var getReviewsCount = InsuranceAccountManagerDashboardService.getPolicyHoldersReviewStatus(param);
            getReviewsCount.then(function (success) {
                $scope.PolicyHoldersReviewStatus = success.data.ReviewsCount;
                populateChart($scope.PolicyHoldersReviewStatus);
                $(".page-spinner-bar").addClass("hide");
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
            // $scope.data = [10, 80, 10];

            $scope.Color = ['#227E38', '#E74C3C', '#8080FF'];

            if (PolicyHoldersReviewStatus.approvedCount > 0 || PolicyHoldersReviewStatus.declinedCount > 0 || PolicyHoldersReviewStatus.optedCount > 0)
                $scope.showPolicyholderChart = true;
            else
                $scope.showPolicyholderChart = false;
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

        $scope.approved = [];



        //item category split chart starts here
        $scope.populategetItemCategorySplitChart = populategetItemCategorySplitChart;
        function populategetItemCategorySplitChart(ItemCategorySplitFlag, typeStatus) {
            itemCategorySplitTimeStatus = ItemCategorySplitFlag;
            $scope.statusFlag = ItemCategorySplitFlag;
            $scope.typeStatus = typeStatus;
            if (typeStatus == 1) {
                $scope.param = {
                    "statusFlag": ItemCategorySplitFlag,
                    "agentId": userId
                }
                var promis = InsuranceReportService.getItemCategorySplit($scope.param);
                promis.then(function (success) {
                    var result = success.data.itemCategories;
                    $scope.itemCategorySplitLabels = [];
                    $scope.itemCategorySplitData = [];
                    $scope.showItemCategoryChart = true;
                    if (result) {
                        angular.forEach(result, function (Item) {

                            var count = Item.totalItemCategoryCount ? " (" + Item.totalItemCategoryCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ")" : " (0)";

                            // $scope.approved.push(count);

                            count = Item.attributeName + count;
                            $scope.itemCategorySplitLabels.push(count);
                            
                            $scope.itemCategorySplitColor = ['#f58a42', '#f5e342', '#aaf542', '#42f5b0', '#42ecf5', '#4275f5', '#ad42f5', '#f542e3', '#f54257'];

                            $scope.itemCategorySplitData.push(Item.approvedCoverageByItemCategory);

                            // if (!$scope.showItemCategoryChart && Item.approvedCoverageByItemCategory > 0)
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
                    "agentId": userId
                }
                var promis = InsuranceReportService.getApprovedItemCategorySplit($scope.param);
                promis.then(function (success) {
                    var result = success.data.itemCategories;
                    $scope.itemCategorySplitLabels = [];
                    $scope.itemCategorySplitData = [];
                    $scope.showItemCategoryChart = true;
                    if (result) {
                        angular.forEach(result, function (Item) {

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
                    fontSize: 10,
                    fontweight: 'bold',
                    position: 'inside',
                    segment: true
                }


            }


        }
        //Item category split chart ends here

        // appraisal reposts starts SPEED-1048
        // $scope.populateAppraisalReports = populateAppraisalReports;
        // function populateAppraisalReports(flag){

        // }
        // appraisal reposts ends

        
        // Common All Reports Filters
        $scope.populateReportsChart = populateReportsChart;
        function populateReportsChart(flag) {

            // Policyholder review status
            getPolicyHoldersReviewStatus(flag);

            // Item Category Split
            populategetItemCategorySplitChart(flag, $scope.typeStatus);

            // Agency performnce
            getAgencyPerformance(flag);

            // Article Coverage Premium
            populateArticleCoveragePremiumTrendChart(flag);

        }

        // Article coverage and premium trends
        $scope.populateArticleCoveragePremiumTrendChart = populateArticleCoveragePremiumTrendChart;
        function populateArticleCoveragePremiumTrendChart(flag) {

            coverageAndPremiumTimeStatus = flag

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
                "agentId": userId
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
                                        $scope.totalThisYearCoverage = '$' + (thisYearCoverageCount[j].totalCoverageValue).toFixed(2) ;
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
                                        $scope.totalThisYearCoverage = '$' + (thisYearCoverageCount[j].totalCoverageValue).toFixed(2) ;
                                    }
                            }

                            for (var k = 0; k < lastYearCoverageCount.length; k++) {
                                if (lastYearCoverageCount[k][j].monthName === thisQuarterMonths[i]) {
                                    lastYearTrendData[i] = lastYearCoverageCount[k].totalCoverageValue > 0 ? lastYearCoverageCount[k].totalCoverageValue : lastYearTrendData[i - 1];
                                    break;
                                }
                                else if (lastYearCoverageCount[j].monthName != thisQuarterMonths[i]) {

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
                                        $scope.totalThisYearCoverage = '$' + (thisYearCoverageCount[j].totalCoverageValue).toFixed(2) ;
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
                            min: 0,
                        }
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
                                        $scope.totalThisYearPremium = '$' + (thisYearCoverageCount[j].sumofPremiumValue).toFixed(2) ;
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
                                        $scope.totalThisYearPremium = '$' + (thisYearCoverageCount[j].sumofPremiumValue).toFixed(2) ;
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
                                        $scope.totalThisYearPremium = '$' + (thisYearCoverageCount[j].sumofPremiumValue).toFixed(2) ;
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
                                else if (lastYearCoverageCount[k].monthName != allMonths[i]) {

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
                            }
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

        // populate buttons with correct month, quarter, year
        $scope.loadCalendar = loadCalendar;
        function loadCalendar(param) {
            $scope.policyDetails = {};
            $scope.durationFlag = param;
            var dateTo = moment().format('MM/DD/YYYY');
            if (param == 1) {
                $scope.policyDetails = {};
                $scope.policyDetails.filterToDate = dateTo;
                var dateFrom = moment().startOf('month').format('MM/DD/YYYY');
                $scope.policyDetails.filterFromDate = dateFrom;
            }
            else if (param == 2) {
                $scope.policyDetails = {};
                $scope.policyDetails.filterToDate = dateTo;
                var dateFrom = moment().subtract(3, 'months').startOf('month').format('MM/DD/YYYY');
                $scope.policyDetails.filterFromDate = dateFrom;
            }
            else {
                $scope.policyDetails = {};
                $scope.policyDetails.filterToDate = dateTo;
                var dateFrom = moment().startOf('year').format('MM/DD/YYYY');

                $scope.policyDetails.filterFromDate = dateFrom;
            }
        }


        //function to get getAgencyPerformance(by param) added by SanthoshM
        $scope.getAgencyPerformance = getAgencyPerformance;
        function getAgencyPerformance(agencyPerformanceStatus) {
            agencyPerformanceTimeStatus = agencyPerformanceStatus;
            param = {
                "statusFlag": agencyPerformanceStatus,
                "agentId": userId
            }
            var agencyPerformanceCount = InsuranceReportService.getAgencyPerformance(param);
            agencyPerformanceCount.then(function (success) {
                //$(".page-spinner-bar").addClass("hide");
                //console.log(success.data.EfficeincyReport);
                var result = success.data.EfficeincyReport;
                $scope.AppraisalsEvaluatedPerDay = result.appraisalEvaluatedPerDay != null && result.appraisalEvaluatedPerDay > 0 ? roundOf2Decimal(result.appraisalEvaluatedPerDay) : 0;
                $scope.AvgEvaluationTime = result.avgEvaluationTime != null && result.avgEvaluationTime.length > 0 ? result.avgEvaluationTime : 0;
                $scope.AppraisalsCreatedPerDay = result.appraisalaCreatedPerDay != null && result.appraisalaCreatedPerDay > 0 ? roundOf2Decimal(result.appraisalaCreatedPerDay) : 0;
                $scope.appraisalsSentToArtigem = result.appraisalsSentToArtigem != null && result.appraisalsSentToArtigem > 0 ? result.appraisalsSentToArtigem : 0;
                $scope.totalAppraisalsCreated = result.totalAppraisalsCreated != null ? result.totalAppraisalsCreated : 0;
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

        // Pagination
        $scope.pageChanged = pageChanged;
        function pageChanged(pageNum) {
            if (pageNum == 1) {
                startPos = 0;
                $scope.appraisals = [];
            } else {
                startPos = max * (pageNum - 1);
            }
            $scope.currentPage = pageNum;
            // get policy reports
            getPolicyReports();
        }

        // path to dashboard
        $scope.gotoDashboard = gotoDashboard;
        function gotoDashboard() {
            $location.url("InsuranceAgent");
        }


        // Export as CSV format
        $scope.exportCSV = exportCSV;
        function exportCSV(DataId, csvFileName) {
            var secId = "#" + DataId;
            var csvFileName = csvFileName + ".csv";
            var data = alasql('SELECT * FROM HTML(' + '"' + secId + '"' + ',{headers:true})');
            alasql('SELECT * INTO CSV(' + '"' + csvFileName + '"' + ',{headers:true}) FROM ?', [data]);
        }

        // Export policy reports in
        $scope.exportPolicyReport = exportPolicyReport;
        function exportPolicyReport(fileType) {
            $(".page-spinner-bar").removeClass("hide");
            var param = {
                "userId": userId,
                // "effectiveFromDate": $filter('DatabaseDateFormatMMddyyyy')($scope.policyReport.fromDate),
                // "effectiveToDate": $filter('DatabaseDateFormatMMddyyyy')($scope.policyReport.toDate),
                "effectiveFromDate": $filter('DatabaseDateFormatMMddyyyy')($scope.fromDate),
                "effectiveToDate": $filter('DatabaseDateFormatMMddyyyy')($scope.toDate),
                "filterByStatus": $scope.statusIds ? $scope.statusIds : null,
                "filterByState": $scope.stateIds ? $scope.stateIds : null,
                "state": $scope.policyReport.state ? $scope.policyReport.state : null,
                "filterBy": 1, //View by appraisal
                "isManager": $scope.policyReport.appraisalStatus==null ?true: false,
                "isUnderwriter": false,
                "userRole": "INSURANCE_AGENT",
                "fileType": fileType
            }
            var reports = ExportReportService.getPolicyReport(param);
            reports.then(function success(response) {
              headers = response.headers();
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
              } catch (ex) {
                  console.log(ex);
              }
                $(".page-spinner-bar").addClass("hide");
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
            if (GraphName == 'AgencyPerformance') {
                document.getElementById('performanceIndicators').style.display = 'block';
                var doc = new jsPDF('p', 'pt', 'a4');
                doc.addHTML($('#performanceIndicators'), 150, 30, function () {
                    doc.save('AgencyPerformance.pdf');
                });
                document.getElementByIfd('performanceIndicators').style.display = 'none';

            } else if (GraphName == 'PolicyReports') {
                doc = pdfPageHeaderData(doc, "Policy Reports");
                doc.setFontSize(20);
                document.getElementById('PolicyReportsTbl').style.display = 'block';
                doc.fromHTML($('#PolicyReportsTbl').html(), 80, 70, {
                    //'width': '100%',
                    'elementHandlers': specialElementHandlers
                });
                doc.save("PolicyReports.pdf");
                document.getElementById('PolicyReportsTbl').style.display = 'none';
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

        $scope.gotoManagerDashboard = gotoManagerDashboard;
        function gotoManagerDashboard() {
            // sessionStorage.removeItem("refferer");
            // sessionStorage.removeItem("agentInfo");
            $location.url("InsuranceAccountManager");
        }

        function daysInThisMonth() {
            var now = new Date();
            return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
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

        // export Policyholder review report
        $scope.exportPolicyholderReviewReport = exportPolicyholderReviewReport;
        function exportPolicyholderReviewReport(fileType) {
            $(".page-spinner-bar").removeClass("hide");
            var param = {
                "agentId": userId,
                "filterBy": policyHolderReviewTimeStatus, //time intervals
                "isManager": false,
                "isUnderwriter": false,
                "userRole": "INSURANCE_AGENT",
                "fileType": fileType
            }
            var reports = ExportReportService.getPolicyholderReviewReports(param);
            reports.then(function success(response) {
              headers = response.headers();
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
                "isManager": false,
                "isUnderwriter": false,
                "userRole": "INSURANCE_AGENT",
                "fileType": fileType
            }
            var reports = ExportReportService.getCoverageAndPremiumReports(data);
            reports.then(function success(response) {
              headers = response.headers();
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
                "agentId": userId,
                "filterBy": itemCategorySplitTimeStatus, //time intervals
                "isManager": false,
                "isUnderwriter": false,
                "userRole": "INSURANCE_AGENT",
                "fileType": fileType,
                "typeStatus":$scope.typeStatus,
            }
            var reports = ExportReportService.exportItemCategorySplitReport(param);
            reports.then(function success(response) {
              headers = response.headers();
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
                // var reports = success.data.policyAppraisalReports;
                // if (reports) {
                //     $scope.downloadFile(reports.downloadURL);
                // }
                 // $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
                $(".page-spinner-bar").addClass("hide");
            });
        }

        // Export Agency performance
        $scope.exportAgencyPerformanceReport = exportAgencyPerformanceReport;
        function exportAgencyPerformanceReport(fileType) {
            $(".page-spinner-bar").removeClass("hide");
            var data = {
                "userId": userId,
                "filterBy": agencyPerformanceTimeStatus, //time intervals
                "isManager": false,
                "isUnderwriter": false,
                "userRole": "INSURANCE_AGENT",
                "fileType": fileType
            }
            var reports = ExportReportService.exportPerformanceReport(data);
            reports.then(function success(response) {
              headers = response.headers();
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

        $scope.openAppraisalDetailsPage = openAppraisalDetailsPage;
        function openAppraisalDetailsPage(item) {
            sessionStorage.setItem("AppraisalNo", item.appraisalNumber);
            sessionStorage.setItem("appraisalId", item.appraisalId);
            sessionStorage.setItem("policyNumber", item.policyNumber);
            sessionStorage.setItem("refferer", "REPORTS");
            sessionStorage.setItem("EditAppraisal", true);
            $location.path('/Appraisal');
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

        $scope.filterReports = filterReports;
        function filterReports() {
            $scope.appraisals = [];
            getPolicyReports();
        }

        /* Select & Activate - Tab - Manually */
        $(document).ready(function() {
            if(sessionStorage.getItem("refferer") == "MANAGER_DASHBOARD"){
                setTimeout(function(){ $rootScope.$broadcast('updateActiveTab', 'InsAcDashboard'); }, 100);
            }
        });

        function defaultApprovedStatus(list)
        {
            var a =list.filter((x)=>x.status=="APPROVED");
            return a[0].id;
        }

        $scope.fun = fun;
        function fun(divSection){
            if(divSection == 'status'){
                $scope.dispStatus = !$scope.dispStatus;
                console.log($scope.dispStatus);
            } else if(divSection == 'state'){
                $scope.dispState = !$scope.dispState;
            }

        }

        $scope.funz = funz;
        function funz(divSection){
            if(divSection == 'status'){
                $scope.dispStatus = false;
            } else if(divSection == 'state'){
                $scope.dispState = false;
            }
            
        }

        $scope.func = func;
        function func(divSection){
            if(divSection == 'status'){
                $scope.dispStatus = true;
            } else if(divSection == 'state'){
                $scope.dispState = true;
            }
            
        }

        handleStatusChange =
        function handleStatusChange(event)
        {
            var id ="checkStatus"+event.target.value;
            $scope.statusIds = utility.handleChange(event,$scope.statusIds,id,$scope.statusArr,"select-All");
        }

        handleStatusSelectAll =
        function handleStatusSelectAll(event)
        {
        $scope.statusIds = utility.handleSelectAll(event,$scope.statusArr,$scope.statusIds,"id","checkStatus");
        }

        $scope.findStatus = findStatus;
        function findStatus(id)
        {
            return utility.find(id,$scope.appraisalStatus,"id","status")
        }

        $scope.clearAllStatus = clearAllStatus
        function clearAllStatus()
        {
            $scope.statusIds = utility.clearAll($scope.statusArr,$scope.statusIds,"id","checkStatus","select-All");
            $scope.statusAll = false;
        }

        $scope.clearStatus = clearStatus
        function clearStatus(id)
        {
            var ele_id = "checkStatus"+id;
            $scope.statusIds = utility.clear(id,$scope.statusIds,ele_id,$scope.statusArr,"select-All");
        }

        $scope.checkValues = checkValues
        function checkValues(id)
        {
            return utility.checkValues(id,$scope.statusIds);
        }

        $scope.searchStatus = searchStatus;
        function searchStatus()
        {
            $scope.statusArr = utility.search($scope.appraisalStatus,"status",$scope.statusSearch,$scope.statusIds,"select-All");
        }

        $scope.findState = findState;
        function findState(stateId){
            return utility.find(stateId,$scope.StateList,"id","state");
        }

        $scope.clearState = clearState;
        function clearState(stateId){
            var elementId = "checkstate"+stateId;
            $scope.stateIds = utility.clear(stateId,$scope.stateIds,elementId,$scope.stateArr,"select-All-State")
        }

        $scope.clearAllState = clearAllState;
        function clearAllState(){
            $scope.stateIds = utility.clearAll($scope.stateArr,$scope.stateIds,"id","checkstate","select-All-State");
            $scope.stateAll = false;
        }

        $scope.searchState = searchState;
        function searchState(){
            $scope.stateArr = utility.search($scope.StateList,"state",$scope.stateSearch,$scope.stateIds,"select-All-State");
        }

        handleStateSelectAll = 
        function handleStateSelectAll(event){
            $scope.stateIds = utility.handleSelectAll(event,$scope.stateArr,$scope.stateIds,"id","checkstate");
        }

        $scope.checkStateValues = checkStateValues;
        function checkStateValues(id){
            return utility.checkValues(id,$scope.stateIds);
        }

        handleStateChange = 
        function handleStateChange(event){
            var id ="checkstate"+event.target.value;
            $scope.stateIds = utility.handleChange(event,$scope.stateIds,id,$scope.stateArr,"select-All-State");
        }
    });
