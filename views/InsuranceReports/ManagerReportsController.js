angular.module('MetronicApp')
    .controller('ManagerReportsController', function ($rootScope, $scope, $filter, settings, $http, $location, $translate, $translatePartialLoader, InsuranceReportService, InsuranceAccountManagerDashboardService,
        AddPolicyService, AuthHeaderService, ExportReportService, $window, CalendarUtility,CommonUtils, CommonConstants) {

        $translatePartialLoader.addPart('InsuranceReports');
        $translate.refresh();
        $scope.ShowHeader = true;
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });
        $translate.refresh();

        $scope.ErrorMessage = "";
        $scope.FlagForBreadcrumb = null;
        $scope.UserType = sessionStorage.getItem('RoleList');
        $scope.loggedInUser = sessionStorage.getItem('Name');
        $scope.InsCompanyName = sessionStorage.getItem('InsuranceCompanyName');
        $scope.yearValues = {};
        $scope.reportFilter = {};
        $scope.appraisals = [];

        $scope.serverAddress = '';

        var companyPerformanceTimeStatus = 1;

        // Pagination
        $scope.pageSize = 20;
        $scope.totalItems = 0;
        var startPos = 0;
        var max = 20;
        $scope.currentPage = 1;
        $scope.toShowingPage = 20;

        $scope.reportFilter.searchQuery = '';
        $scope.state = [];
        $scope.appraisalStatus =[];
        $scope.filterReports = sessionStorage.getItem('filterReports') && sessionStorage.getItem('filterReports')!=null ? new Map(Object.entries(JSON.parse(sessionStorage.getItem('filterReports')))) : null;

        function init() {
            $(".page-spinner-bar").removeClass("hide");
            $scope.isShowAlerts = true;
            $scope.isShowKpis = true;
            $scope.pageNumber = 0;
            {
                ShowItem: "All"
            };
            
            //get all appraisal status
            var status = InsuranceReportService.getAppraisalStatusList();
            status.then(function (success) { $scope.appraisalStatus = success.data.appraisalStatus; }, function (error) { $scope.appraisalStatus = []; });

            // get states
            var statePromise = AddPolicyService.getStates();
            statePromise.then(function (success) { $scope.StateList = success.data.data; }, function (error) { $scope.StateList = []; });
            populateDate();
            populateDateButtons();            
            var GetGlobaldata = $http.get('Config/Configuration.json');
            GetGlobaldata.then(function (success) {
                ConfigSettings = success.data.data;
                $scope.serverAddress = ConfigSettings.serverAddress;
            });
                 // Update existing report saved filters
         if($scope.filterReports && $scope.filterReports.get(CommonConstants.filters.INSURANCE_ACC_MANAGER_RPT)){
            let insuranceAccManagerRpt = new Map(Object.entries(JSON.parse($scope.filterReports.get(CommonConstants.filters.INSURANCE_ACC_MANAGER_RPT))));
            console.log("insurance account manager report", insuranceAccManagerRpt);
            if(insuranceAccManagerRpt){                    
                $scope.reportFilter.fromDate = insuranceAccManagerRpt.get("dateFrom");
                $scope.reportFilter.toDate = insuranceAccManagerRpt.get("dateTo");
                $scope.reportFilter.appraisalStatus = angular.isDefined(insuranceAccManagerRpt.get("appraisalStatus"))? insuranceAccManagerRpt.get("appraisalStatus"): [];
                $scope.reportFilter.state = angular.isDefined(insuranceAccManagerRpt.get("state"))? insuranceAccManagerRpt.get("state"): [];  
        }
    }
    getAppraisalReports();
    getCompanyPerformance(1);

            //$(".page-spinner-bar").addClass("hide");
        }
        init();

        $scope.getAgentsByState = function (stateId) {
          var agentsPromise =  InsuranceReportService.getAgentsByState(stateId);
          agentsPromise.then(
              function (success) {
                  $scope.agentsList = success.data.data
              },
              function (error) {
                  $scope.agentsList = [];
              });
        }

        // get current month, quarter, year.
        $scope.populateDateButtons = populateDateButtons;
        function populateDateButtons() {
            var now = new Date();
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

        // Search appraisal reports
        $scope.searchAppraisalReportBykey = searchAppraisalReportBykey
        function searchAppraisalReportBykey(searchQuery) {
            $scope.reportFilter.searchQuery = searchQuery;
            $scope.currentPage = 1;
            $scope.appraisals = [];
            getAppraisalReports();
        }

        $scope.getAppraisalReports = getAppraisalReports;
        function getAppraisalReports() {
            $(".page-spinner-bar").removeClass("hide");
            var data = {
                "userId": $scope.reportFilter.agent ? $scope.reportFilter.agent : null,
                "effectiveFromDate": $filter('DatabaseDateFormatMMddyyyy')($scope.reportFilter.fromDate),
                "effectiveToDate": $filter('DatabaseDateFormatMMddyyyy')($scope.reportFilter.toDate),
                "appraisalStatus": $scope.reportFilter.appraisalStatus ? $scope.reportFilter.appraisalStatus : null,
                "state": $scope.reportFilter.state ? $scope.reportFilter.state : null,
                "filterBy": 1, //View by appraisal
                "isManager": true,
                "isUnderwriter": false,
                "startPos": startPos,
                "maxCount": max,
                "searchKeyword": $scope.reportFilter.searchQuery.length > 0 ? $scope.reportFilter.searchQuery : null,
                "sortBy": $scope.sortKey,
                "orderBy": $scope.reverse ? 1 : 0,
            }
             // Set report filters in session
        const insuranceAccManagerRpt = new Map();
        insuranceAccManagerRpt.set("dateFrom", $scope.reportFilter.fromDate);
        insuranceAccManagerRpt.set("dateTo", $scope.reportFilter.toDate);
        insuranceAccManagerRpt.set("appraisalStatus", $scope.reportFilter.appraisalStatus);
        insuranceAccManagerRpt.set("state",$scope.reportFilter.state );  
        CommonUtils.setReportFilters(CommonConstants.filters.INSURANCE_ACC_MANAGER_RPT, JSON.stringify(Object.fromEntries(insuranceAccManagerRpt)));
           
        var reports = InsuranceAccountManagerDashboardService.getAppraisalReports(data);
            reports.then(function (success) {
                var reports = success && success.data ? success.data.data : null;
                $scope.totalItems = reports && reports.total > 0 ? reports.total : 0;
                if (reports) {
                    if ($scope.currentPage == 1) {
                        $scope.toShowingPage = reports.appraisals ? reports.appraisals.length : 0;
                    } else {
                        $scope.toShowingPage = reports.appraisals ? reports.appraisals.length + ($scope.pageSize * ($scope.currentPage - 1)) : 0
                    }

                    var currentListLength = ($scope.currentPage - 1) * max;
                    if (currentListLength != $scope.appraisals.length) {
                        $scope.appraisals = new Array(currentListLength).fill(new Object());
                    }
                    $scope.appraisals = []
                    if (reports.appraisals.length > 0) {
                        angular.forEach(reports.appraisals, function (item) {
                            item.agentName = $filter('constructName')(item.agentDetails.firstName, item.agentDetails.lastName);
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
                    }
                    
                    $scope.totalValues = {
                        "totalOldAppraisalValue" : reports.totalOldAppraisalValue,
                        "totalCoverageApproved": reports.totalCoverageApproved,
                        "appraisalNewValue": reports.totalSpeedCheckValue,
                        "totalChangeInCoverage": Math.abs(reports.totalChangeInCoverage),
                        "isNegativeValue": isNegativeValue
                    }
                }
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
                //$(".page-spinner-bar").addClass("hide");
            });
        }



        //function to get get company performance(by param) added by SanthoshM
        $scope.getCompanyPerformance = getCompanyPerformance;
        function getCompanyPerformance(timeInterval) {
            $(".page-spinner-bar").removeClass("hide");

            companyPerformanceTimeStatus = timeInterval;

            param = {
                "statusFlag": timeInterval,
                "agentId": "ALL"
            }
            var companyPerformanceCount = InsuranceReportService.getAgencyPerformance(param);
            companyPerformanceCount.then(function (success) {
                //$(".page-spinner-bar").addClass("hide");
                //console.log(success.data.EfficeincyReport);
                var result = success.data.EfficeincyReport;
                $scope.AppraisalsEvaluatedPerDay = result.appraisalEvaluatedPerDay != null ? roundOf2Decimal(result.appraisalEvaluatedPerDay) : 0;
                $scope.AvgEvaluationTime = result.avgEvaluationTime != null ? result.avgEvaluationTime : 0;
                $scope.AppraisalsCreatedPerDay = result.appraisalaCreatedPerDay != null ? roundOf2Decimal(result.appraisalaCreatedPerDay) : 0;
                $scope.AppraisalsSentToArtigem = result.appraisalsSentToArtigem != null ? result.appraisalsSentToArtigem : 0;
                $scope.TotalAppraisalsCreated = result.totalAppraisalsCreated != null ? result.totalAppraisalsCreated : 0;

                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                if (error.status === 500 || error.status === 404) {
                    toastr.remove();
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                    $(".page-spinner-bar").addClass("hide");
                };
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
            $scope.reportFilter.fromDate = "01/01/" + year;
            var d = $filter("TodaysDate")();
            $scope.reportFilter.toDate = d;
            $("#fromDate").datepicker({autoclose: true}).datepicker('update', $scope.reportFilter.fromDate);
            $("#toDate").datepicker({autoclose: true}).datepicker('update', $scope.reportFilter.toDate);
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

            // get appraisal reports
            getAppraisalReports();
        }

        // Export as CSV format
        $scope.exportCSV = exportCSV;
        function exportCSV(DataId, csvFileName) {
            var secId = "#" + DataId;
            var csvFileName = csvFileName + ".csv";
            var data = alasql('SELECT * FROM HTML(' + '"' + secId + '"' + ',{headers:true})');
            alasql('SELECT * INTO CSV(' + '"' + csvFileName + '"' + ',{headers:true}) FROM ?', [data]);
        }


        // Export Appraisal report in given format
        $scope.exportAppraisalReport = exportAppraisalReport;
        function exportAppraisalReport(fileType) {
            $(".page-spinner-bar").removeClass("hide");
            var data = {
                "userId": sessionStorage.getItem("UserId"),
                "effectiveFromDate": $filter('DatabaseDateFormatMMddyyyy')($scope.reportFilter.fromDate),
                "effectiveToDate": $filter('DatabaseDateFormatMMddyyyy')($scope.reportFilter.toDate),
                "appraisalStatus": $scope.reportFilter.appraisalStatus ? $scope.reportFilter.appraisalStatus : null,
                "state": $scope.reportFilter.state ? $scope.reportFilter.state : null,
                "filterBy": 1, //View by appraisal
                "isManager": true,
                "isUnderwriter": false,
                "userRole": "INSURANCE ACCOUNT MANAGER",
                "fileType": fileType
            }

            var reports = ExportReportService.getPolicyReport(data);
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

        // Export Company performance
        $scope.exportCompanyPerformanceReport = exportCompanyPerformanceReport;
        function exportCompanyPerformanceReport(fileType) {
            $(".page-spinner-bar").removeClass("hide");
            var param = {
                "agentId": "ALL",
                "filterBy": companyPerformanceTimeStatus, //time intervals
                "isManager": true,
                "isUnderwriter": false,
                "userRole": "INSURANCE ACCOUNT MANAGER",
                "fileType": fileType
            }
            var reports = ExportReportService.exportPerformanceReportForInsuranceManager(param);
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

        // Export as PDF format
        $scope.exportPDF = exportPDF;
        function exportPDF() {
            var doc = new jsPDF('l', 'mm', 'b2');
            var specialElementHandlers = {
                '#editor': function (element, renderer) {
                    return true;
                }
            };
            doc = pdfPageHeaderData(doc, "Appraisals Reports");
            doc.setFontSize(20);
            document.getElementById('AppraisalsReportsTbl').style.display = 'block';
            doc.fromHTML($('#AppraisalsReportsTbl').html(), 80, 70, {
                //'width': '100%',
                'elementHandlers': specialElementHandlers
            });
            doc.save("AppraisalsReports.pdf");
            document.getElementById('AppraisalsReportsTbl').style.display = 'none';
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

        $scope.sort = function (keyname) {
            $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false;
            $scope.sortKey = keyname;   //set the sortKey to the param passed
            $scope.appraisals = [];
            startPos = 0;
            getAppraisalReports();
        }

        $scope.openAppraisalDetailsPage = openAppraisalDetailsPage;
        function openAppraisalDetailsPage(item) {
            sessionStorage.setItem("AppraisalNo", item.appraisalNumber);
            sessionStorage.setItem("appraisalId", item.appraisalId);
            sessionStorage.setItem("policyNumber", item.policyNumber);
            sessionStorage.setItem("refferer", "REPORTS");
            sessionStorage.setItem("EditAppraisal", true);
            $location.path('/UnderwriterAppraisal');
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
            getAppraisalReports();
        }
        $scope.resetSearchValues = function () {
            $scope.reportFilter.agent = ""
            $scope.reportFilter.state = null;
            $scope.reportFilter.appraisalStatus = ""
            $scope.appraisals = [];
            populateDate();
            getAppraisalReports();
        }
    });
