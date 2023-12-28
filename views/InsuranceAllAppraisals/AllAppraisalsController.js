angular.module('MetronicApp')
    .controller('AllAppraisalsController', function ($rootScope, $scope, $filter, $uibModal, settings, $http, $location, $translate, $translatePartialLoader, InsuranceReportService, InsuranceInvoicesService, InsuranceAccountManagerDashboardService,
        AddPolicyService, AuthHeaderService, ExportReportService, $window, CalendarUtility,utility,utilityMethods, CommonUtils, CommonConstants) {

        $translatePartialLoader.addPart('InsuranceAllAppraisals');
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
        $scope.reverse = true;

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

        var userId = sessionStorage.getItem("UserId");
        $scope.isFromManager = false;
        var policyHolderReviewTimeStatus = 1;
        var coverageAndPremiumTimeStatus = 1;
        var itemCategorySplitTimeStatus = 1;
        var agencyPerformanceTimeStatus = 1;
        $scope.policyReport.searchQuery = '';
        $scope.statusIds = [];
        $scope.itemCategoryIds = [];

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
            categoryList();
            //get all appraisal status
            var status = InsuranceReportService.getAppraisalStatusList();
            status.then(function (success) {
                $scope.appraisalStatus = success.data.appraisalStatus;
                $scope.statusArr = [...$scope.appraisalStatus];
                //utilityMethods.multiSelectDropdown('statusDropdownDiv', 'statusMultiSelect', 'statusSelectAll', "status", "id", $scope.appraisalStatus);
            }, function (error) {
                $scope.appraisalStatus = []; 
            });
            // get states
            var statePromise = AddPolicyService.getStates();
            statePromise.then(function (success) { $scope.StateList = success.data.data; }, function (error) { $scope.StateList = []; });
            $scope.isShowAlerts = true;
            $scope.isShowKpis = true;
            $scope.pageNumber = 0;
            {
                ShowItem: "All"
            };
            // Update existing report saved filters
            if($scope.filterReports && $scope.filterReports.get(CommonConstants.filters.MY_APPRAISALS)){
                let myAppraisals = new Map(Object.entries(JSON.parse($scope.filterReports.get(CommonConstants.filters.MY_APPRAISALS))));
                console.log("myAppraisals", myAppraisals);
                if(myAppraisals){
                    $scope.policyReport.fromDate = myAppraisals.get("dateFrom");
                    $scope.policyReport.toDate = myAppraisals.get("dateTo");
                    $scope.statusIds = angular.isDefined(myAppraisals.get("status"))? myAppraisals.get("status"): [];
                    $scope.itemCategoryIds = angular.isDefined(myAppraisals.get("itemCategoryIds"))?myAppraisals.get("itemCategoryIds"):[]; 
                    $scope.policyReport.policyHolderFullName = myAppraisals.get("policyHolderFullName");    
                }                
            }
            getPolicyReports();
            loadCalendar(1);
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
            var currentTime = new Date()
            var year = currentTime.getFullYear();
            
           // $scope.fromDate = "01/01/"+year;
            $scope.policyReport.fromDate = "01/01/"+year;
            var d = $filter("TodaysDate")();
            $scope.policyReport.toDate = d;
        }

        $scope.resetForm = function () {                        
            $scope.allAppraisalFilters.$dirty = false;
            $scope.allAppraisalFilters.$pristine = true;
            $scope.allAppraisalFilters.$submitted = false;
            $scope.allAppraisalFilters.$setPristine();
            $scope.policyReport.appraisalStatus = '';
            $scope.policyReport.policyHolderFullName = '';
            $scope.policyReport.firstName = '';

            $scope.policyReport.lastName = '';
            $scope.itemCategory = '';

            $scope.statusIds = [];
            $scope.itemCategoryIds = [];
            populateDate();
            getPolicyReports();
        };
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

        //Policy report
        $scope.getPolicyReports = getPolicyReports;
        function getPolicyReports() {
            $(".page-spinner-bar").removeClass("hide");
            var data = {
                "userId": userId,
                "effectiveFromDate": $filter('DatabaseDateFormatMMddyyyy')($scope.policyReport.fromDate),
                "effectiveToDate": $filter('DatabaseDateFormatMMddyyyy')($scope.policyReport.toDate),
                "filterByStatus": $scope.statusIds ? $scope.statusIds : null,
                "policyHolderFullName": $scope.policyReport.policyHolderFullName ? $scope.policyReport.policyHolderFullName : null,
                "filterByItemCategory": $scope.itemCategoryIds ? $scope.itemCategoryIds : null,
                "state": $scope.policyReport.state ? $scope.policyReport.state : null,
                "filterBy": 1, //View by appraisal
                "isManager": false,
                "isUnderwriter": false,
                "startPos": startPos,
                "maxCount": max,
                "policyHolderFname": $scope.policyReport.firstName,
                "policyHolderLname": $scope.policyReport.lastName,
                "searchKeyword": $scope.policyReport.searchQuery.length > 0 ? $scope.policyReport.searchQuery : null,
                "sortBy": $scope.sortKey,
                "orderBy": $scope.reverse ? 1 : 0,
            } 
            
            // Set report filters in session
            const myAppraisals = new Map();
            myAppraisals.set("dateFrom", $scope.policyReport.fromDate);
            myAppraisals.set("dateTo", $scope.policyReport.toDate);
            myAppraisals.set("status", $scope.statusIds);
            myAppraisals.set("itemCategoryIds", $scope.itemCategoryIds);  
            myAppraisals.set("policyHolderFullName", $scope.policyReport.policyHolderFullName);     
            CommonUtils.setReportFilters(CommonConstants.filters.MY_APPRAISALS, JSON.stringify(Object.fromEntries(myAppraisals)));
            
            $scope.appraisals = [];
            var reports = InsuranceReportService.getMyAppraisalList(data);
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
            startPos = 0;                            
            getPolicyReports();
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
            var data = {
                "userId": userId,
                "effectiveFromDate": $filter('DatabaseDateFormatMMddyyyy')($scope.policyReport.fromDate),
                "effectiveToDate": $filter('DatabaseDateFormatMMddyyyy')($scope.policyReport.toDate),
                "appraisalStatus": $scope.policyReport.appraisalStatus ? $scope.policyReport.appraisalStatus : null,
                "itemCategory": $scope.itemCategory ? $scope.itemCategory : null,
                "state": $scope.policyReport.state ? $scope.policyReport.state : null,
                "filterBy": 1, //View by appraisal
                "isManager": false,
                "isUnderwriter": false,
                "userRole": "INSURANCE_AGENT",
                "fileType": fileType
            }
            var reports = ExportReportService.getPolicyReport(data);
            reports.then(function   success(response) {
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
            var data = {
                "userId": userId,
                "filterBy": policyHolderReviewTimeStatus, //time intervals
                "isManager": false,
                "isUnderwriter": false,
                "userRole": "INSURANCE_AGENT",
                "fileType": fileType
            }
            var reports = ExportReportService.getPolicyholderReviewReports(data);
            reports.then(function (success) {
                var reports = success.data.policyholderReviewReport;
                if (reports) {
                    $scope.downloadFile(reports.downloadURL);
                }
                $(".page-spinner-bar").addClass("hide");
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
            sessionStorage.setItem("refferer", "ALLAPPRAISALS");
            sessionStorage.setItem("EditAppraisal", true);
            $location.path('/Appraisal');
        }

        $scope.filterReports = filterReports;
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
                $scope.itemCategoryArr = [...$scope.itemCategoryList];
                console.log($scope.itemCategoryArr);
            }, function (error) {
                toastr.remove();
                toastr.error(error.errorMessage, "Error");
                $scope.itemCategoryList = [];
            });
            $(".page-spinner-bar").addClass("hide");
        }

        $scope.fun = fun;
        function fun(divSection){
            if(divSection == 'status'){
                $scope.dispStatus = !$scope.dispStatus;
                console.log($scope.dispStatus);
            } else if(divSection == 'itemCategory'){
                $scope.dispItemCategory = !$scope.dispItemCategory;
            }

        }

        $scope.funz = funz;
        function funz(divSection){
            if(divSection == 'status'){
                $scope.dispStatus = false;
            } else if(divSection == 'itemCategory'){
                $scope.dispItemCategory = false;
            }
            
        }

        $scope.func = func;
        function func(divSection){
            if(divSection == 'status'){
                $scope.dispStatus = true;
            } else if(divSection == 'itemCategory'){
                $scope.dispItemCategory = true;
            }
            
        }

        handleStatusChange =
        function handleStatusChange(event)
        {
            var id ="check"+event.target.value;
            $scope.statusIds = utility.handleChange(event,$scope.statusIds,id,$scope.statusArr,"select-All");
        }

        handleStatusSelectAll =
        function handleStatusSelectAll(event)
        {
        $scope.statusIds = utility.handleSelectAll(event,$scope.statusArr,$scope.statusIds,"id","check");
        }

        $scope.findStatus = findStatus;
        function findStatus(id)
        {
            return utility.find(id,$scope.appraisalStatus,"id","status")
        }

        $scope.clearAllStatus = clearAllStatus
        function clearAllStatus()
        {
            $scope.statusIds = utility.clearAll($scope.statusArr,$scope.statusIds,"id","check","select-All");
            $scope.statusAll = false;
        }

        $scope.clearStatus = clearStatus
        function clearStatus(id)
        {
            var ele_id = "check"+id;
            $scope.statusIds = utility.clear(id,$scope.statusIds,ele_id,$scope.statusArr,"select-All");
        }

        $scope.checkValues = checkValues
        function checkValues(id)
        {
            return utility.checkValues(id,$scope.statusIds);
        }

        handleItemCategoryChange = function handleItemCategoryChange(event){
            var id = "check"+event.target.value;
            $scope.itemCategoryIds = utility.handleChange(event,$scope.itemCategoryIds,id,$scope.itemCategoryArr,"select-All-category");
        }

        $scope.findItemCategory = findItemCategory;
        function findItemCategory(id){
            return utility.find(id,$scope.itemCategoryList,"id","atttibuteValue")
        }

        handleItemCategorySelectAll = function handleItemCategorySelectAll(event){
            $scope.itemCategoryIds = utility.handleSelectAll(event,$scope.itemCategoryArr,$scope.itemCategoryIds,"id","check");
        }

        $scope.clearItemCategory = clearItemCategory;
        function clearItemCategory(itemId){
            var id = "check"+itemId;
            $scope.itemCategoryIds = utility.clear(itemId,$scope.itemCategoryIds,id,$scope.itemCategoryArr,"select-All-category")
        }

        $scope.clearAllItemCategory = clearAllItemCategory;
        function clearAllItemCategory()
        {
            $scope.itemCategoryIds = utility.clearAll($scope.itemCategoryArr,$scope.itemCategoryIds,"id","check","select-All-category");
            $scope.itemCategoryAll = false;
        }

        $scope.searchStatus = searchStatus;
        function searchStatus()
        {
            $scope.statusArr = utility.search($scope.appraisalStatus,"status",$scope.statusSearch,$scope.statusIds,"select-All");
        }

        $scope.searchItemCategory = searchItemCategory;
        function searchItemCategory(){
            $scope.itemCategoryArr = utility.search($scope.itemCategoryList,"atttibuteValue",$scope.itemCategorySearch,$scope.itemCategoryIds,"select-All-category")
        }

        $scope.checkCategoryValues = checkCategoryValues;
        function checkCategoryValues(id){
            return utility.checkValues(id,$scope.itemCategoryIds);
        }
    });
