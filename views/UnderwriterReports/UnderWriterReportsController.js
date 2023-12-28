angular.module('MetronicApp')
    .controller('UnderWriterReportsController', function ($rootScope, $scope, $filter, settings, $http, $location, $translate, $translatePartialLoader, InsuranceReportService, InsuranceAccountManagerDashboardService,
        AddPolicyService, AuthHeaderService, CalendarUtility, ExportReportService, $window, InsuranceInvoicesService, utility, CommonUtils, CommonConstants) {

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

        $scope.disp = false;
        $scope.statusAll = false;
        $scope.statusSearch ='';
        $scope.statusIds = [];

        $scope.categoryDisp = false;
        $scope.categoryTypeAll = false;
        $scope.categoryType = [];
        $scope.categoryTypeSearch ='';

        $scope.AgencyDisp = false;
        $scope.AgenciesAll = false;
        $scope.Agencies = [];
        $scope.AgencySearch ='';

        //item category
        $scope.itemCategorySplitLabels = [];
        $scope.itemCategorySplitData = [];
        $scope.showPolicyholderChart = false;
        $scope.showItemCategoryChart = false;
        $scope.itemCategorySplitColor = ['#f58a42', '#f5e342', '#aaf542', '#42f5b0', '#42ecf5', '#4275f5', '#ad42f5', '#f542e3', '#f54257'];

        $scope.serverAddress = '';
        $scope.policyReport.searchQuery = '';

        // Pagination
        $scope.pageSize = 20;
        $scope.totalItems = 0;
        var startPos = 0;
        var max = 20;
        $scope.currentPage = 1;
        $scope.toShowingPage = 20;

        $scope.myObj = {};
        var userId = sessionStorage.getItem("UserId");
        $scope.isFromManager = false;
        var coverageAndPremiumTimeStatus = 1;
        var itemCategorySplitTimeStatus = 1;
        var appraisalReviewTimeStatus = 1;
        $scope.totalThisYearCoverage = "";
        $scope.totalThisYearPremium = "";

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
            $(".page-spinner-bar").removeClass("hide");
            // populate date
            populateDate();
            populateDateButtons();
        // Update existing report saved filters
       if($scope.filterReports && $scope.filterReports.get(CommonConstants.filters.UNDERWRITER_APPR_RPT)){
        let underwriterApprRpt = new Map(Object.entries(JSON.parse($scope.filterReports.get(CommonConstants.filters.UNDERWRITER_APPR_RPT))));
        console.log("underwriterApprRpt", underwriterApprRpt);
         if(underwriterApprRpt){                    
        $scope.policyReport.fromDate = underwriterApprRpt.get("dateFrom");
        $scope.policyReport.toDate = underwriterApprRpt.get("dateTo");
        $scope.statusIds = angular.isDefined(underwriterApprRpt.get("status"))? underwriterApprRpt.get("status"): [];
        $scope.Agencies = angular.isDefined(underwriterApprRpt.get("agency"))? underwriterApprRpt.get("agency"):[];     
        $scope.categoryType = angular.isDefined(underwriterApprRpt.get("itemCategory"))? underwriterApprRpt.get("itemCategory"):[];     
        }                
    }
            //get all appraisal status
            var status = InsuranceReportService.getAppraisalStatusList();
            status.then(function (success) {
                 $scope.appraisalStatus = success.data.appraisalStatus;
                 $scope.statusArr = [...$scope.appraisalStatus];
                var arr = $scope.appraisalStatus.filter((x)=>x.status==="APPROVED")
                $scope.policyReport.status = [arr[0].id];
            getPolicyReports();

            }, function (error) { $scope.appraisalStatus = []; });

            // get states
            var statePromise = AddPolicyService.getStates();
            statePromise.then(function (success) { $scope.StateList = success.data.data; }, function (error) { $scope.StateList = []; });

            $scope.isShowAlerts = true;
            $scope.isShowKpis = true;

            $scope.pageNumber = 0;
            {
                ShowItem: "All"
            };

            getPolicyHoldersReviewStatus(1);
            populategetItemCategorySplitChart(1, 1);
            loadCalendar(1);
            getAppraisalReview(1);
            populateArticleCoveragePremiumTrendChart(1);
            categoryList();
            getAllAgency();

            var GetGlobaldata = $http.get('Config/Configuration.json');
            GetGlobaldata.then(function (success) {
                ConfigSettings = success.data.data;
                $scope.serverAddress = ConfigSettings.serverAddress;
            });

            $(".page-spinner-bar").addClass("hide");
        }
        init();

        // get current date
        $scope.populateDate = populateDate;
        function populateDate() {
            // from date
            var currentTime = new Date()
            var year = currentTime.getFullYear();
            $scope.policyReport.fromDate = "01/01/"+year;
            var d = $filter("TodaysDate")();
            $scope.policyReport.toDate = d;
            $("#fromDate").datepicker({autoclose: true}).datepicker('update', $scope.policyReport.fromDate);
            $("#toDate").datepicker({autoclose: true}).datepicker('update', $scope.policyReport.toDate);
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
            $scope.policyReport.searchQuery = searchQuery.length > 0 ? searchQuery : '';
            $scope.currentPage = 1;
            $scope.appraisals = [];
            getPolicyReports();
        }

        //agency report
        $scope.getPolicyReports = getPolicyReports;
        function getPolicyReports() {
            $(".page-spinner-bar").removeClass("hide");
            // var data = {
            //     "userId": userId,
            //     "effectiveFromDate": $filter('DatabaseDateFormatMMddyyyy')($scope.policyReport.fromDate),
            //     "effectiveToDate": $filter('DatabaseDateFormatMMddyyyy')($scope.policyReport.toDate),
            //     "appraisalStatus": $scope.policyReport.appraisalStatus ? $scope.policyReport.appraisalStatus : null,
            //     "state": $scope.policyReport.state ? $scope.policyReport.state : null,
            //     "filterBy": 1, //View by appraisal
            //     "isManager": false,
            //     "isUnderwriter": true,
            //     "startPos": startPos,
            //     "maxCount": max,
            //     "searchKeyword": $scope.policyReport.searchQuery.length > 0 ? $scope.policyReport.searchQuery : null,
            //     "sortBy": $scope.sortKey,
            //     "orderBy": $scope.reverse ? 1 : 0,
            // }
            var data = {
                "userId": userId,
                "filterBy": 1, //View by appraisal
                "isManager": false,
                "isUnderwriter": true,
                "startPos": startPos,
                "maxCount": max,
                "searchKeyword": $scope.policyReport.searchQuery.length > 0 ? $scope.policyReport.searchQuery : null,
                "sortBy": $scope.sortKey,
                "orderBy": $scope.reverse ? 0 : 1,
                "filterByStatus" : $scope.statusIds,
                "filterByItemCategory": $scope.categoryType,
                "appraisalAgency": $scope.Agencies,
                "effectiveFromDate": $scope.policyReport.fromDate,
                "effectiveToDate": $scope.policyReport.toDate
                
            }

            // Set report filters in session
            const underwriterApprRpt = new Map();
            underwriterApprRpt.set("dateFrom", $scope.policyReport.fromDate);
            underwriterApprRpt.set("dateTo", $scope.policyReport.toDate);
            underwriterApprRpt.set("status", $scope.statusIds);
            underwriterApprRpt.set("agency", $scope.Agencies); 
            underwriterApprRpt.set("itemCategory", $scope.categoryType);     
            CommonUtils.setReportFilters(CommonConstants.filters.UNDERWRITER_APPR_RPT, JSON.stringify(Object.fromEntries(underwriterApprRpt)));
            
            var reports = InsuranceReportService.getUnderWriterPolicyReportList(data);
            reports.then(function (success) {
                var reports = success && success.data ? success.data.data : null;
                $scope.totalItems = $scope.KPIsAppraisals = reports && reports.total > 0 ? reports.total : 0;
                if (reports) {
                    if ($scope.currentPage == 1) {
                        $scope.toShowingPage = reports.appraisals ? reports.appraisals.length : 0;
                    } else {
                        $scope.toShowingPage = reports.appraisals ? reports.appraisals.length + ($scope.pageSize * ($scope.currentPage - 1)) : 0
                    }
                    // var currentListLength = ($scope.currentPage - 1) * max;
                    // if (currentListLength != $scope.appraisals.length) {
                    //     $scope.appraisals = new Array(currentListLength).fill(new Object());
                    // }
                    $scope.appraisals = [];
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
                $(".page-spinner-bar").addClass("hide");
                $scope.ErrorMessage = error.data.errorMessage;
            });
        }

        // Sort Appraisal List Columns
        $scope.sort = function (keyname) {
            $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false;
            $scope.sortKey = keyname;   //set the sortKey to the param passed
            $scope.appraisals = [];
            startPos = 0;
            $scope.currentPage = 1;
            getPolicyReports();
        }

        $scope.getPolicyHoldersReviewStatus = getPolicyHoldersReviewStatus;
        function getPolicyHoldersReviewStatus(status) {

            var param = {
                "statusFlag": status,
                "agentId": userId
            }
            var getReviewsCount = InsuranceAccountManagerDashboardService.getPolicyHoldersReviewStatus(param);
            getReviewsCount.then(function (success) {
                $scope.PolicyHoldersReviewStatus = success.data.ReviewsCount;
                populateChart($scope.PolicyHoldersReviewStatus);

            }, function (error) {
                if (error.status === 500 || error.status === 404) {
                    toastr.remove();
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                };
            });
        }

        $scope.populateChart = populateChart;
        function populateChart(PolicyHoldersReviewStatus) {
            $scope.labels = ["Approved", "Denied", "Opted to get Own Appraisal"];
            $scope.data = [PolicyHoldersReviewStatus.approvedCount, PolicyHoldersReviewStatus.declinedCount, PolicyHoldersReviewStatus.optedCount];
            // $scope.data = [10, 80, 10];

            $scope.Color = ['#227E38', '#FF6600', '#8080FF'];

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
                var promis = InsuranceReportService.getUnderwriterItemCategorySplit($scope.param);
                promis.then(function (success) {
                    var result = success.data.itemCategories;
                    $scope.itemCategorySplitLabels = [];
                    $scope.itemCategorySplitData = [];
                    $scope.showItemCategoryChart = false;
                    if (result) {
                        angular.forEach(result, function (Item) {
                            var count = Item.totalItemCategoryCount ? " (" + Item.totalItemCategoryCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ")" : " (0)";
                            // $scope.approved.push(count);
                            count = Item.attributeName + count;
                            $scope.itemCategorySplitLabels.push(count);
                            $scope.itemCategorySplitData.push(Item.approvedCoverageByItemCategory);                            
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
                var promis = InsuranceReportService.getUnderwritterApprovedItemCategorySplit($scope.param);
                promis.then(function (success) {
                    var result = success.data.itemCategories;
                    $scope.itemCategorySplitLabels = [];
                    $scope.itemCategorySplitData = [];
                    $scope.showItemCategoryChart = false;
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
                    fontSize: 12,
                    fontweight: 'bold',
                    position: 'inside',
                    segment: true
                }
            }
        }
        //Item category split chart ends here


        // Common All Reports Filters
        $scope.populateReportsChart = populateReportsChart;
        function populateReportsChart(flag) {            
            
            // Policyholder review status
            getPolicyHoldersReviewStatus(flag);

            // Item Category Split
            populategetItemCategorySplitChart(flag, $scope.typeStatus);

            // Appraisal Review
            getAppraisalReview(flag);

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
            var allMonths = [];
            allMonths = moment.months();
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

            var promis = InsuranceReportService.getArticleCoverageTrendForUnderwriter($scope.data);
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
                                if (lastYearCoverageCount[k].monthName === thisQuarterMonths[i]) {
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
                                else if (lastYearCoverageCount[j].monthName === allMonths[i] && lastYearCoverageCount[j].totalCoverageValue <= 0) {
                                    lastYearTrendData[i] = lastYearTrendData[i][i - 1];
                                }
                                else if (lastYearCoverageCount[j].monthName != allMonths[i]) {

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
                                fontSize: 10
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
            var promis = InsuranceReportService.getPremiumTrendForUnderwriter($scope.data);
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
                                if (lastYearCoverageCount[k][j].monthName === thisQuarterMonths[i]) {
                                    lastYearTrendData[i] = lastYearCoverageCount[k].sumofPremiumValue > 0 ? lastYearCoverageCount[k].sumofPremiumValue : lastYearTrendData[i - 1];
                                    break;
                                }
                                else if (lastYearCoverageCount[j].monthName === thisQuarterMonths[i] && lastYearCoverageCount[j].sumofPremiumValue <= 0) {
                                    lastYearTrendData[i] = lastYearTrendData[i][i - 1];
                                }
                                else if (lastYearCoverageCount[j].monthName != thisQuarterMonths[i]) {

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
                                else if (lastYearCoverageCount[j].monthName === allMonths[i] && lastYearCoverageCount[j].sumofPremiumValue <= 0) {
                                    lastYearTrendData[i] = lastYearTrendData[i][i - 1];
                                }
                                else if (lastYearCoverageCount[j].monthName != allMonths[i]) {

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
                                fontSize: 10
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
        $scope.getAppraisalReview = getAppraisalReview;
        function getAppraisalReview(appraisalReviewStatus) {
            appraisalReviewTimeStatus = appraisalReviewStatus;
            param = {
                "statusFlag": appraisalReviewStatus,
                "agentId": userId
            }
            var agencyPerformanceCount = InsuranceReportService.getUnderWriterAgencyPerformance(param);
            agencyPerformanceCount.then(function (success) {
                //$(".page-spinner-bar").addClass("hide");
                //console.log(success.data.EfficeincyReport);
                var result = success.data.UnderWriterAgencyPerformanceReport;
                $scope.AppraisalsEvaluatedPerDay = result.appraisalEvaluatedPerDay != null ? roundOf2Decimal(result.appraisalEvaluatedPerDay) : 0.0;
                $scope.AvgEvaluationTime = result.avgEvaluationTime != null && result.avgEvaluationTime != "" ? result.avgEvaluationTime : '00:00';
                $scope.totalNumberOfAppraisalsReviewed = result.totalNumberOfAppraisalsReviewed != null ? result.totalNumberOfAppraisalsReviewed : 0;
                $scope.appraisalsSentBackToAgent = result.totalNumberOfAppraisalSentBackToAgent != null ? result.totalNumberOfAppraisalSentBackToAgent : 0;
                $scope.totalNumberOfApraisalsApproved = result.totalNumberOfApraisalsApproved != null ? result.totalNumberOfApraisalsApproved : 0;
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
            else
                return 0.0;
        }

        // Pagination
        $scope.pageChanged = pageChanged;
        function pageChanged(pageNum) {
            $scope.appraisals = [];
            if (pageNum == 1) {
                startPos = 0;
                max = 20;
            } else {
                startPos = max * (pageNum - 1);
                $scope.currentPage = pageNum;
            }
            // get policy reports
            getPolicyReports();
        }

        // path to dashboard
        $scope.gotoDashboard = gotoDashboard;
        function gotoDashboard() {
            $location.url("UnderWriter");
        }


        // Export as CSV format
        $scope.exportCSV = exportCSV;
        function exportCSV(DataId, csvFileName) {
            var secId = "#" + DataId;
            var csvFileName = csvFileName + ".csv";
            var data = alasql('SELECT * FROM HTML(' + '"' + secId + '"' + ',{headers:true})');
            alasql('SELECT * INTO CSV(' + '"' + csvFileName + '"' + ',{headers:true}) FROM ?', [data]);
        }

        // Export as Excel format
        $scope.exportAppraisalReport = exportAppraisalReport;
        function exportAppraisalReport(fileType) {
            $(".page-spinner-bar").removeClass("hide");
            var param = {
                "userId": userId,
                // "effectiveFromDate": $filter('DatabaseDateFormatMMddyyyy')($scope.policyReport.fromDate),
                // "effectiveToDate": $filter('DatabaseDateFormatMMddyyyy')($scope.policyReport.toDate),
                "effectiveFromDate": $scope.policyReport.fromDate,
                "effectiveToDate": $scope.policyReport.toDate,
                "appraisalStatus": $scope.policyReport.appraisalStatus ? $scope.policyReport.appraisalStatus : null,
                "state": $scope.policyReport.state ? $scope.policyReport.state : null,
                "filterBy": 1, //View by appraisal
                "filterByStatus" : $scope.statusIds,
                "isManager": false,
                "isUnderwriter": true,
                "filterByItemCategory": $scope.categoryType,
                "appraisalAgency": $scope.Agencies,
                "userRole": "UNDERWRITER",
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

        //export article coverage and premium trends
        $scope.exportCoverageAndPremium = exportCoverageAndPremium;
        function exportCoverageAndPremium(fileType) {
            $(".page-spinner-bar").removeClass("hide");
            var data = {
                "userId": userId,
                "filterBy": coverageAndPremiumTimeStatus, //time intervals
                "isManager": false,
                "isUnderwriter": true,
                "userRole": "UNDERWRITER",
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
            var data = {
                "agentId": userId,
                "filterBy": itemCategorySplitTimeStatus, //time intervals
                "isManager": false,
                "isUnderwriter": true,
                "userRole": "UNDERWRITER",
                "fileType": fileType,
                "typeStatus":$scope.typeStatus,
            }
            var reports = ExportReportService.exportItemCategorySplitReport(data);
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

        // Export Appraisal performance
        $scope.exportAppraisalReviewReport = exportAppraisalReviewReport;
        function exportAppraisalReviewReport(fileType) {
            $(".page-spinner-bar").removeClass("hide");
            var data = {
                "userId": userId,
                "filterBy": appraisalReviewTimeStatus, //time intervals
                "isManager": false,
                "isUnderwriter": true,
                "userRole": "UNDERWRITER",
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
            if (item != null) {
                sessionStorage.setItem("appraisalId", item.id);
                sessionStorage.setItem("AppraisalNo", item.appraisalNumber);
                sessionStorage.setItem("policyNumber", item.policyNumber);
                sessionStorage.setItem("refferer", "REPORTS");
                $location.path('/UnderwriterAppraisal');
            }
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

        $scope.filterReports = filterReports
        function filterReports() {
            $scope.appraisals = [];
            getPolicyReports();
        }
        $scope.categoryList = categoryList;
        function categoryList() {
            $(".page-spinner-bar").removeClass("hide");
            // get Item categories
            var itemCategories = InsuranceInvoicesService.getAppraisalItemCategories();
            itemCategories.then(function (success) {
                $scope.itemCategoryList = success.data.data;
                $scope.categoryTypeArr =  [...$scope.itemCategoryList];
            }, function (error) {
                toastr.remove();
                toastr.error(error.errorMessage, "Error");
                $scope.itemCategoryList = [];
            });
            $(".page-spinner-bar").addClass("hide");
        }

        $scope.getAllAgency = getAllAgency;
        function getAllAgency(){
            $(".page-spinner-bar").removeClass("hide");
            var agencyCode = InsuranceReportService.getAllAgency();
            agencyCode.then(function (success) {
                $scope.agencyCodes = success.data;
                console.log("agency",$scope.agencyCodes)
                $scope.agencyCodeArr =  [...$scope.agencyCodes.agencyCode];
            }, function (error) {
                toastr.remove();
                toastr.error(error.errorMessage, "Error");
                $scope.itemCategoryList = [];
            });
            $(".page-spinner-bar").addClass("hide");
        }


        $scope.resetFilter = resetFilter;
        function resetFilter() {
            // Clear - dropdown selected value
            $('#agencyCode').val('').select2('destroy').select2();
            $('#polyStatus').val('').select2('destroy').select2();
            $('#polyItmCategory').val('').select2('destroy').select2();
            
            populateDate();
            $scope.policyReport.appraisalAgency = [];
            $scope.policyReport.status = [];
            $scope.policyReport.categoryItem = [];
            $scope.statusIds = [];
            $scope.categoryType = [];
            $scope.Agencies = [];
            clearAllAgencies();
            clearAllTypes();
            clearAllStatus();
            clearAllTypes();
            getPolicyReports();
        }


        //status multiselect
        $scope.closeorOpenDropDown = closeorOpenDropDown;
        function closeorOpenDropDown(){
            $scope.disp = !$scope.disp;
            console.log($scope.disp);
        }
    
        $scope.closeDropDown = closeDropDown;
        function closeDropDown(){
            $scope.disp = false;
        }
    
        $scope.openDropDown = openDropDown;
        function openDropDown(){
            $scope.disp = true;
        }
    
        $scope.searchStatus = searchStatus;
        function searchStatus()
        {
            $scope.statusArr = utility.search($scope.appraisalStatus,"status",$scope.statusSearch,$scope.statusIds,"select-All-Status");
        }
    
        $scope.handleStatusChange = handleStatusChange
        function handleStatusChange(event)
        {
            var id ="check"+event.target.value;
            $scope.statusIds = utility.handleChange(event,$scope.statusIds,id,$scope.statusArr,"select-All-Status");
        }
    
        $scope.handleStatusSelectAll = handleStatusSelectAll
        function handleStatusSelectAll(event)
        {
          $scope.statusIds = utility.handleSelectAll(event,$scope.statusArr,$scope.statusIds,"id","check");
        }
    
        $scope.findStatus = findStatus;
        function findStatus(id)
        {
            return utility.find(id,$scope.appraisalStatus,"id","status")
        }
    
       $scope.clearStatus = clearStatus
       function clearStatus(id)
        {
            var ele_id = "check"+id;
            $scope.statusIds = utility.clear(id,$scope.statusIds,ele_id,$scope.statusArr,"select-All-Status");
        }
    
        $scope.clearAllStatus = clearAllStatus
       function clearAllStatus()
        {
            $scope.statusIds = utility.clearAll($scope.statusArr,$scope.statusIds,"id","check","select-All-Status");
            $scope.statusAll = false;
        }
    
        $scope.checkValues = checkValues
        function checkValues(id)
        {
            return utility.checkValues(id,$scope.statusIds);
        }

        //category type multiselect
        
        $scope.closeorOpenCategoryDropDown = closeorOpenCategoryDropDown;
        function closeorOpenCategoryDropDown(){
            $scope.categoryDisp = !$scope.categoryDisp;
        }
    
        $scope.closeCategoryDropDown = closeCategoryDropDown;
        function closeCategoryDropDown(){
            $scope.categoryDisp = false;
        }
    
        $scope.openCategoryDropDown = openCategoryDropDown;
        function openCategoryDropDown(){
            $scope.categoryDisp = true;
        }

        $scope.searchCategoryType = searchCategoryType;
        function searchCategoryType()
        {
            $scope.categoryTypeArr = utility.search($scope.itemCategoryList,"atttibuteValue",$scope.categoryTypeSearch,$scope.categoryType,"select-All-Category");
        }
    
        $scope.handlecategoryTypeChange = handlecategoryTypeChange
        function handlecategoryTypeChange(event)
        {
            var id ="checkCat"+event.target.value;
            $scope.categoryType = utility.handleChange(event,$scope.categoryType,id,$scope.categoryTypeArr,"select-All-Category");
        }
    
        $scope.handlecategoryTypeSelectAll = handlecategoryTypeSelectAll
        function handlecategoryTypeSelectAll(event)
        {
          $scope.categoryType = utility.handleSelectAll(event,$scope.categoryTypeArr,$scope.categoryType,"id","checkCat");
        }

        $scope.findTypes = findTypes;
        function findTypes(id)
        {
            return utility.find(id,$scope.itemCategoryList,"id","atttibuteValue")
        }
    
        $scope.clearTypes = clearTypes
        function clearTypes(id)
         {
             var ele_id = "checkCat"+id;
             $scope.categoryType = utility.clear(id,$scope.categoryType,ele_id,$scope.categoryTypeArr,"select-All-Category");
         }
     
         $scope.clearAllTypes = clearAllTypes
        function clearAllTypes()
         {
             $scope.categoryType = utility.clearAll($scope.categoryTypeArr,$scope.categoryType,"id","checkCat","select-All-Category");
             $scope.categoryTypeAll = false;
         }
    
        $scope.checkCategoryValues = checkCategoryValues
        function checkCategoryValues(id)
        {
            return utility.checkValues(id,$scope.categoryType);
        }

        // agency multiselect
        $scope.closeorOpenAgencyDropDown = closeorOpenAgencyDropDown;
        function closeorOpenAgencyDropDown(){
            $scope.AgencyDisp = !$scope.AgencyDisp;
        }
    
        $scope.closeAgencyDropDown = closeAgencyDropDown;
        function closeAgencyDropDown(){
            $scope.AgencyDisp = false;
        }
    
        $scope.openAgencyDropDown = openAgencyDropDown;
        function openAgencyDropDown(){
            $scope.AgencyDisp = true;
        }

        $scope.searchAgency = searchAgency;
        function searchAgency()
        {
            $scope.agencyCodeArr = utility.search($scope.agencyCodes.agencyCode,"agencyCode",$scope.AgencySearch,$scope.Agencies,"select-All-Agency");
        }
    
        $scope.handleAgencyChange = handleAgencyChange
        function handleAgencyChange(event)
        {
            var id ="checkAgency"+event.target.value;
            $scope.Agencies = utility.handleChange(event,$scope.Agencies,id,$scope.agencyCodeArr,"select-All-Agency");
        }
    
        $scope.handleAgencySelectAll = handleAgencySelectAll
        function handleAgencySelectAll(event)
        {
          $scope.Agencies = utility.handleSelectAll(event,$scope.agencyCodeArr,$scope.Agencies,"agencyCode","checkAgency");
        }

        $scope.findAgencies = findAgencies;
        function findAgencies(id)
        {
            return utility.find(id,$scope.agencyCodes.agencyCode,"agencyCode","agencyCode")
        }
    
       $scope.clearAgencies = clearAgencies
       function clearAgencies(id)
        {
            var ele_id = "checkAgency"+id;
            $scope.Agencies = utility.clear(id,$scope.Agencies,ele_id,$scope.agencyCodeArr,"select-All-Agency");
        }
    
        $scope.clearAllAgencies = clearAllAgencies
       function clearAllAgencies()
        {
            $scope.Agencies = utility.clearAll($scope.agencyCodeArr,$scope.Agencies,"agencyCode","checkAgency","select-All-Agency");
            $scope.AgenciesAll = false;
        }
    
        $scope.checkAgencyValues = checkAgencyValues
        function checkAgencyValues(id)
        {
            return utility.checkValues(id,$scope.Agencies);
        }

    });
