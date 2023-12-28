angular.module('MetronicApp')
    .controller('InsuranceInvoicesController', function ($rootScope, $scope, $filter, settings, $http, $location, $translate, $translatePartialLoader, InsuranceInvoicesService, AuthHeaderService, 
        utilityMethods, AddPolicyService, ContractService, CalendarUtility,utility, CommonUtils,CommonConstants) {

        $scope.ShowHeader = true;
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });
        //set language
        $translatePartialLoader.addPart('InsuranceInvoices');
        //$translatePartialLoader.addPart('InsuranceAgentHome');
        $translate.refresh();
        $scope.ErrorMessage = "";
        $scope.UserType = sessionStorage.getItem('RoleList');
        $scope.IncomingAppraisalsCount = {};
        $scope.filterReports = sessionStorage.getItem('filterReports') && sessionStorage.getItem('filterReports')!=null ? new Map(Object.entries(JSON.parse(sessionStorage.getItem('filterReports')))) : null;

        $scope.CommonObj = {};
        $scope.CommonObj.Role = [];

        // Pagination
        $scope.pageSize = 20;
        $scope.totalItems = 0;
        $scope.currentPage = 1;
        $scope.toShowingPage = 20;

        //search keyword
        $scope.searchKeyword = '';
        $scope.invoiceList = [];
        $scope.filter = {};
        $scope.appraisalInvoices = [];
        $scope.states = [];
        $scope.dateRangeInvalid = false
        $scope.searchInvoicesKeyword = '';
        $scope.itemCategoryIds = [];

        function init() {
            $scope.isShowAlerts = true;
            $scope.reverse = true;
            $scope.pageNumber = 0;
            {
                ShowItem: "All"
            };
            loadPage();
            // Loading data
            // Update existing report saved filters
            if($scope.filterReports && $scope.filterReports.get(CommonConstants.filters.AGENT_INVOICES)){
                let agentInvoices = new Map(Object.entries(JSON.parse($scope.filterReports.get(CommonConstants.filters.AGENT_INVOICES))));
                console.log("agentInvoices", agentInvoices);
                if(agentInvoices){
                    $scope.filter.invoiceFromDate = agentInvoices.get("dateFrom");
                    $scope.filter.invoiceToDate = agentInvoices.get("dateTo");
                    $scope.itemCategoryIds = angular.isDefined(agentInvoices.get("itemCategoryIds"))?agentInvoices.get("itemCategoryIds"):[]; 
                }                
            }

            if ($scope.UserType == 'INSURANCE ACCOUNT MANAGER') {
                getSubcriptionDetails();
                getMonthlyInvoiceList();
                populateBarGraph(1);
            }

            if ($scope.UserType == 'INSURANCE AGENT') {
                getSubInvoicesForMonthly();
            }

        }
        init();

        $scope.loadPage = loadPage;
        function loadPage() {
            $(".page-spinner-bar").removeClass("hide");
            populateDateButtons();
            // get Item categories
            var itemCategories = InsuranceInvoicesService.getAppraisalItemCategories();
            itemCategories.then(function (success) {
                $scope.itemCategoryList = success.data.data;
                $scope.itemCategoryArr = [...$scope.itemCategoryList];
            }, function (error) {
                toastr.remove();
                toastr.error(error.errorMessage, "Error");
                $scope.itemCategoryList = [];
            });
            $(".page-spinner-bar").addClass("hide");
        }
        $scope.getMonthlyInvoiceList = getMonthlyInvoiceList;
        function getMonthlyInvoiceList() {
            var param = {};
            param.orderBy = 1;
            param.recordsPerPage = 20;
            param.pageNumber = 1;
            var getInvoiceList = InsuranceInvoicesService.getMonthlyInvoices(param);
            getInvoiceList.then(function (success) {
                $scope.invoiceData = success.data.data;
                $scope.invoiceList = $scope.invoiceData.appraisalInvoices;

                // Pagination settings
                if ($scope.invoiceList != null && angular.isDefined($scope.invoiceList)) {
                    $scope.totalItems = $scope.invoiceList.length;
                    if ($scope.currentPage == 1) {
                        $scope.toShowingPage = $scope.invoiceList.length;
                    } else {
                        $scope.toShowingPage = $scope.invoiceList.length + ($scope.pageSize * ($scope.currentPage - 1))
                    }
                }
            });
        }
        $scope.getSubInvoicesForMonthly = getSubInvoicesForMonthly;
        function getSubInvoicesForMonthly() {
            var from = new Date($scope.filter.invoiceFromDate);
            var to = new Date($scope.filter.invoiceToDate);
            if (from > to) {
                $scope.dateRangeInvalid = true;
                return false;
            } else {
                $scope.dateRangeInvalid = false;
            }
            $(".page-spinner-bar").removeClass("hide");
            var param = {};
            param.paginationDTO = {};
            var agentids = [];
            agentids.push(sessionStorage.getItem('UserId'));
            param.agentIds = agentids;
            if ($scope.filter) {
                param.startDate = $scope.filter.invoiceFromDate != null && angular.isDefined($scope.filter.invoiceFromDate) ? $filter('DatabaseDateFormatMMddyyyy')($scope.filter.invoiceFromDate) : null;
                param.endDate = $scope.filter.invoiceToDate != null && angular.isDefined($scope.filter.invoiceToDate) ? $filter('DatabaseDateFormatMMddyyyy')($scope.filter.invoiceToDate) : null;
                // param.stateIds = $scope.filter.stateIds;
                // param.policyTypeIds = $scope.filter.policyTypeIds;
                param.searchKeyword = $scope.searchInvoicesKeyword;
                param.itemCategoryIds = $scope.itemCategoryIds ? $scope.itemCategoryIds : null ;
            }
            param.paginationDTO.pageNumber = $scope.currentPage;
            param.paginationDTO.pageSize = $scope.pageSize;
            param.paginationDTO.sortBy = $scope.sortKey;
            param.paginationDTO.orderBy = $scope.reverse ? 'desc' : 'asc';

            // Set report filters in session
            const agentInvoices = new Map();
            agentInvoices.set("dateFrom", $scope.filter.invoiceFromDate);
            agentInvoices.set("dateTo", $scope.filter.invoiceToDate);
            agentInvoices.set("itemCategoryIds", $scope.itemCategoryIds);    
            CommonUtils.setReportFilters(CommonConstants.filters.AGENT_INVOICES, JSON.stringify(Object.fromEntries(agentInvoices)));

            var subInvoiceListCallBack = InsuranceInvoicesService.getSubInvoicesForMonthly(param);
            subInvoiceListCallBack.then(function (success) {
                $scope.appraisalInvoices = [];
                $scope.totalItems = 0;
                var resultList = success.data.data;
                if (resultList != null) {                    
                    $scope.totalItems = resultList && resultList.totalNumberOfRecords > 0 ? resultList.totalNumberOfRecords : 0;
                    if ($scope.currentPage == 1) {
                        $scope.toShowingPage = resultList.appraisalInvoiceItemsDTOS.length;
                    } else {
                        $scope.toShowingPage = resultList.appraisalInvoiceItemsDTOS.length + ($scope.pageSize * ($scope.currentPage - 1));
                        // var currentListLength = ($scope.currentPage - 1) * $scope.pageSize;
                        // if (currentListLength != $scope.appraisalInvoices.length) {
                        //     $scope.appraisalInvoices = new Array(currentListLength).fill(new Object());
                        // }
                    }
                    angular.forEach(resultList.appraisalInvoiceItemsDTOS, function (item) {
                        $scope.appraisalInvoices.push(item);
                    });
                }
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                $(".page-spinner-bar").addClass("hide");
                toastr.remove();
                toastr.error((angular.isDefined(error.data) && angular.isDefined(error.data.errorMessage) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage()), "Error");
            });
        };

        // Config for pie chart.
        $scope.populateBarGraph = populateBarGraph;
        function populateBarGraph(numberOfMonths) {
            var responsePromise = InsuranceInvoicesService.getGraphData(numberOfMonths);
            responsePromise.success(function (data, status, headers) {
                var graphData = data.data;
                var barCount = graphData.newAppraisals.length
                var width = 0.5
                if (barCount == 1 || barCount == 3) {
                    width = 0.2
                }
                var trace1 = {
                    x: graphData.months,
                    y: graphData.newAppraisals,
                    name: 'New Appraisals',
                    type: 'bar',
                    width: width
                };

                var trace2 = {
                    x: graphData.months,
                    y: graphData.appraisalUpdates,
                    name: 'Appraisal Updates',
                    type: 'bar',
                    width: width
                };
                var trace3 = {
                    x: graphData.months,
                    y: graphData.artigemReviews,
                    name: 'Artigem Reviews',
                    type: 'bar',
                    width: width
                };
                var data = [trace1, trace2, trace3];

                var layout = { barmode: 'stack', yaxis: { rangemode: 'tozero' } };

                Plotly.newPlot('myDiv', data, layout, { displayModeBar: false });

                $scope.newAppraisalsCount = 0;
                for (var i = 0; i < graphData.newAppraisals.length; i++) {
                    $scope.newAppraisalsCount = parseInt($scope.newAppraisalsCount) + parseInt(graphData.newAppraisals[i]);
                }
                $scope.artigemReviewsCount = 0;
                for (var i = 0; i < graphData.artigemReviews.length; i++) {
                    $scope.artigemReviewsCount = parseInt($scope.artigemReviewsCount) + parseInt(graphData.artigemReviews[i]);
                }
            });

        }


        $scope.downloadAppraisalInvociesExcel = downloadAppraisalInvociesExcel
        function downloadAppraisalInvociesExcel() {
            $(".page-spinner-bar").removeClass("hide");
            var param = {};
            param.paginationDTO = {};
            var agentids = [];
            agentids.push(sessionStorage.getItem('UserId'));
            param.agentIds = agentids;
            if ($scope.filter) {
                param.startDate = $scope.filter.invoiceFromDate != null && angular.isDefined($scope.filter.invoiceFromDate) ? $filter('DatabaseDateFormatMMddyyyy')($scope.filter.invoiceFromDate) : null;
                param.endDate = $scope.filter.invoiceToDate != null && angular.isDefined($scope.filter.invoiceToDate) ? $filter('DatabaseDateFormatMMddyyyy')($scope.filter.invoiceToDate) : null;
                // param.stateIds = $scope.filter.stateIds;
                // param.policyTypeIds = $scope.filter.policyTypeIds;
                param.itemCategoryIds = $scope.filter.itemCategoryIds;
            }
            // param.paginationDTO.pageNumber = $scope.currentPage;
            // param.paginationDTO.pageSize = $scope.pageSize;
            var responsePromise = InsuranceInvoicesService.getAppraisalInvoicesExcel(param);
            responsePromise.success(function (data, status, headers) {
                headers = headers();
                var filename = headers['x-filename'];
                var contentType = headers['content-type'];
                var linkElement = document.createElement('a');
                try {
                    var blob = new Blob([data], { type: contentType });
                    var url = window.URL.createObjectURL(blob);

                    linkElement.setAttribute('href', url);
                    linkElement.setAttribute("download", "Appraisal Invoices.xlsx");

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

            })
        }

        $scope.getMonthlyInvoicePDF = getMonthlyInvoicePDF;
        function getMonthlyInvoicePDF(invoiceNumber) {
            var callBackForPDF = InsuranceInvoicesService.getMonthlyInvoicePDF(invoiceNumber);
            callBackForPDF.success(function (data, status, headers) {

                headers = headers();

                var filename = headers['x-filename'];
                var contentType = headers['content-type'];

                var linkElement = document.createElement('a');
                try {
                    var blob = new Blob([data], { type: contentType });
                    var url = window.URL.createObjectURL(blob);

                    linkElement.setAttribute('href', url);
                    linkElement.setAttribute("download", "MonthlyInvoice.Pdf");

                    var clickEvent = new MouseEvent("click", {
                        "view": window,
                        "bubbles": true,
                        "cancelable": false
                    });
                    linkElement.dispatchEvent(clickEvent);
                } catch (ex) {
                    console.log(ex);
                }

            });
            return false;
        }


        //$scope.statusList = [2017,2018,2019];
        $scope.yearList = [{ "id": 1, "year": "2017" }, { "id": 2, "year": "2018" }, { "id": 3, "year": "2019" }]
        // utilityMethods.multiSelectDropdown('statusDropdownDiv', 'statusMultiSelect', 'statusSelectAll', "status", "id", $scope.statusList);

        // Sort Appraisal invoice List        
        $scope.sort = function (keyname) {
            $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false;
            $scope.sortKey = keyname;   //set the sortKey to the param passed                       
            getSubInvoicesForMonthly();
        }

        // get current month, quarter, year.
        $scope.populateDateButtons = populateDateButtons;
        function populateDateButtons() {
            var now = new Date();
            var currentQuarter = moment().quarter();
            var year = now.getFullYear();
            var splitYear = year.toString().substr(2, 2);
            var startOfWeek = moment().startOf('week').toDate();
            var endOfWeek = moment().endOf('week').toDate();
            var firstDay = moment(startOfWeek).format('dddd');
            var lastDay = moment(endOfWeek).format('dddd');
            var today = moment(now).format('dddd');
            $scope.yearValues =
            {
                "thisMonth": moment().format('MMM'),
                "thisYear": now.getFullYear(),
                "lastYear": now.getFullYear() - 1,
                "thisQuaterFirstMonth": moment().quarter(currentQuarter).startOf('quarter').format('MMM'),
                "thisQuaterLastMonth": moment().quarter(currentQuarter).endOf('quarter').format('MMM'),
                "thisSplitYear": splitYear,
                "today": today
            }

            // Load calendar option data
            updateInvoiceDate(1);
        }

        $scope.updateInvoiceDate = updateInvoiceDate;
        function updateInvoiceDate(option) {
            var now = new Date();
            var currentQuarter = moment().quarter();
            if (option == 1) {
                $scope.filter.invoiceFromDate = moment().startOf('month').format('MM/DD/YYYY');;
                $scope.filter.invoiceToDate = moment().endOf('month').format('MM/DD/YYYY');
            } else if (option == 2) {
                $scope.filter.invoiceFromDate = moment().quarter(currentQuarter).startOf('quarter').startOf('month').format('MM/DD/YYYY');
                $scope.filter.invoiceToDate = moment().quarter(currentQuarter).endOf('quarter').endOf('month').format('MM/DD/YYYY');
            } else if (option == 3) {
                now.setMonth(0);
                $scope.filter.invoiceFromDate = moment(now).startOf('month').format('MM/DD/YYYY');
                now.setMonth(11);
                $scope.filter.invoiceToDate = moment(now).endOf('month').format('MM/DD/YYYY');
            }
        }

        // Get Formated date in MM/DD/YYYY 
        function getFormattedDate(date) {
            let year = date.getFullYear();
            let month = (1 + date.getMonth()).toString().padStart(2, '0');
            let day = date.getDate().toString().padStart(2, '0');

            console.log(month + '/' + day + '/' + year);

            return month + '/' + day + '/' + year;
        }

        // Config for pie chart.
        $scope.populatePieChart = populatePieChart;
        function populatePieChart(incomingAppraisalsCount) {
            $scope.pieLabels = ["Open", "Work In Progress", "Supervisor Review", "Completed", "Rejected"];
            $scope.pieData = [incomingAppraisalsCount.openAppraialCount, incomingAppraisalsCount.inProgressAppraialCount, incomingAppraisalsCount.superViserReviewAppraialCount, incomingAppraisalsCount.completedAppraialCount, incomingAppraisalsCount.rejectedAppraialCount];

            if (incomingAppraisalsCount.completedAppraialCount > 0 || incomingAppraisalsCount.superViserReviewAppraialCount > 0 || incomingAppraisalsCount.inProgressAppraialCount > 0 || incomingAppraisalsCount.openAppraialCount > 0 || incomingAppraisalsCount.rejectedAppraialCount > 0)
                $scope.showCanvas = true;
            else
                $scope.showCanvas = false;

            $scope.pieColors = ['#E67E22', '#2E86C1', '#D4AC0D', '#1E8449', '#E74C3C'];
            //PieDataSetOverride is used to draw lines to display the labels
            $scope.DataSetOverride = [{ yAxisID: 'y-axis-1' }]; //y-axis-1 is the ID defined in scales under options.

            $scope.pieOptions = {
                animation: {
                    duration: 900,
                    easing: 'linear',
                    animateScale: true,
                    animateRotate: true
                },
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        boxWidth: 10,
                        fontSize: 11
                    }
                },
                responsive: true,
                hover: false,
                tooltips: false,
                plugins: {
                    datalabels: {
                        font: {
                            size: 15,
                            weight: 'bold',
                        },
                        color: '#fff',
                        display: function (context) {
                            return context.dataset.data[context.dataIndex] >= 1;
                        },
                        formatter: Math.round,
                    }
                }
            };
        }

        //Round of 2 Decimal point
        $scope.roundOf2Decimal = roundOf2Decimal;
        function roundOf2Decimal(num) {
            if (num != null) {
                return (Math.round(num * 100) / 100).toFixed(2);
            }
            return num;
        }

        // Null Object check
        function isNullData(objData) {
            if (objData == null || objData == 'null' || objData == '' || objData == 'undefined') {
                return true;
            } else {
                return false;
            }
        }

        // Pagination
        $scope.pageChanged = pageChanged;
        function pageChanged(pageNum) {
            if (pageNum == 1) {
                startPos = 0;
            } else {
                startPos = $scope.pageSize * (pageNum - 1);
            }
            $scope.currentPage = pageNum;
            $scope.appraisalInvoices =[];
            getSubInvoicesForMonthly();
        }

        // Get State list
        $scope.GetStates = GetStates;
        function GetStates() {
            var statePromise = InsuranceInvoicesService.getStates();
            statePromise.then(
                function (success) {
                    $scope.StateList = success.data.data;
                }, function (error) {
                    $scope.StateList = [];
                });
        }

        // Get Ho policy type list
        $scope.GetHoPolicyTypes = GetHoPolicyTypes;
        function GetHoPolicyTypes() {
            var hoPolicyTypes = InsuranceInvoicesService.getHomeOwnerPolicyTypes();
            hoPolicyTypes.then(function (success) {
                $scope.HOPolicyTypes = success.data.data;
            }, function (error) {
                $scope.HOPolicyTypes = [];
            });
        }

        // Get All invoices list
        $scope.getInvoicesDetails = getInvoicesDetails;
        function getInvoicesDetails() {
            var getInvoicesDetails = SpeedCheckInvoicesService.getInvoicesDetails();
            getInvoicesDetails.then(function (success) {
                $scope.invoiceList = []; // success.data;
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                if (error.status === 500 || error.status === 404) {
                    toastr.remove();
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                };
                $(".page-spinner-bar").addClass("hide");
            });
        }

        // Reset Filters fields
        $scope.resetFilters = resetFilters;
        function resetFilters() {
            $scope.filter.invoiceFromDate = moment().startOf('month').format('MM/DD/YYYY');;
            $scope.filter.invoiceToDate = moment().endOf('month').format('MM/DD/YYYY');
            // $scope.filter.invoiceFromDate = null;
            // $scope.filter.invoiceToDate = null;
            updateInvoiceDate(1);
            $scope.filter.stateIds = null;
            //$scope.filter.agentIds = null;
            $scope.filter.policyTypeIds = null;
            $scope.searchInvoicesKeyword = null;
            $scope.currentPage = 1;
            $scope.filter.itemCategoryIds = null;
            $scope.itemCategoryIds = [];
            $("select").val("").select2();
            getSubInvoicesForMonthly();
            //$("select").select2('destroy').val("").select2();            
        }

        // Open Invoice Details page
        $scope.openInvoiceDetailsPage = openInvoiceDetailsPage;
        function openInvoiceDetailsPage(item) {
            sessionStorage.setItem("invoiceNumber", item.invoiceNumber);
            $location.url('/InsuranceInvoiceDetails');
        }

        // $scope.getAppraisalInvoices = getAppraisalInvoices;
        // function getAppraisalInvoices() {
        //     $(".page-spinner-bar").removeClass("hide");
        //     var param = {
        //         "fromDate": $scope.filter.invoiceFromDate,
        //         "toDate": $scope.filter.invoiceToDate,
        //         "states": $scope.filter.stateIds ? $scope.filter.stateIds : [],
        //         "policyType": $scope.filter.policyTypeIds ? $scope.filter.policyTypeIds : [],
        //         "page": startPos,
        //         "max": max,
        //         "searchKeyword": null,
        //         "sortBy": null,
        //         "orderBy": $scope.reverse ? 1 : 0,
        //     }
        //     //console.log(param);

        //     var appraisalInvoices = InsuranceInvoicesService.getAppraisalInvoices(param);
        //     appraisalInvoices.then(function (success) {
        //         var invoices = success && success.data ? success.data.data : null;
        //         $scope.totalItems = invoices && invoices.totalInvoices > 0 ? invoices.totalInvoices : 0;
        //         if (invoices) {
        //             if ($scope.currentPage == 1) {
        //                 $scope.toShowingPage = invoices.appraisalInvoices ? invoices.appraisalInvoices.length : 0;
        //             } else {
        //                 $scope.toShowingPage = invoices.appraisalInvoices ? invoices.appraisalInvoices.length + ($scope.pageSize * ($scope.currentPage - 1)) : 0
        //             }
        //             var currentListLength = ($scope.currentPage - 1) * max;
        //             if (currentListLength != $scope.appraisalInvoices.length) {
        //                 $scope.appraisalInvoices = new Array(currentListLength).fill(new Object());
        //             }
        //             angular.forEach(invoices.appraisalInvoices, function (item) {
        //                 item.appraisal.policyholderName = $filter('constructName')(item.appraisal.policyholderDetails.primaryPolicyHolderFname, item.appraisal.policyholderDetails.primaryPolicyHolderLname);
        //                 item.appraisal.agent = $filter('constructName')(item.appraisal.agentDetails.firstName, item.appraisal.agentDetails.lastName);
        //                 $scope.appraisalInvoices.push(item);
        //             });
        //         }
        //         $(".page-spinner-bar").addClass("hide");
        //     }, function (error) {
        //         $scope.ErrorMessage = error.data.errorMessage;
        //         $(".page-spinner-bar").addClass("hide");
        //     });
        // }

        $scope.getSubcriptionDetails = getSubcriptionDetails;
        function getSubcriptionDetails() {
            $(".page-spinner-bar").removeClass("hide");
            var param = {
                type: "speedcheck"
            }
            var subscription = ContractService.getSpeedCheckSubscriptionInfo(param);
            subscription.then(function (success) {
                $scope.subscriptionInfo = success && success.data ? success.data.data : null;
                if ($scope.subscriptionInfo != null) {
                    $scope.subscriptionInfo.billingContact = $filter('constructName')($scope.subscriptionInfo.billedTo.firstName, $scope.subscriptionInfo.billedTo.lastName);
                }
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
                $(".page-spinner-bar").addClass("hide");
            });
        }

        $scope.searchInvoices = searchInvoices;
        function searchInvoices(key) {
            $scope.searchInvoicesKeyword = key;
            $scope.currentPage = 1;
            getSubInvoicesForMonthly();
        }

        $scope.fun = fun;
        function fun(){
            $scope.dispItemCategory = !$scope.dispItemCategory;
        }

        $scope.funz = funz;
        function funz(){
            $scope.dispItemCategory = false;
        }

        $scope.func = func;
        function func(){
            $scope.dispItemCategory = true;
        }

        $scope.findItemCategory = findItemCategory;
        function findItemCategory(id){
            return utility.find(id,$scope.itemCategoryList,"id","atttibuteValue")
        }

        $scope.clearAllItemCategory = clearAllItemCategory;
        function clearAllItemCategory()
        {
            $scope.itemCategoryIds = utility.clearAll($scope.itemCategoryArr,$scope.itemCategoryIds,"id","check","select-All-category");
            $scope.itemCategoryAll = false;
        }

        $scope.clearItemCategory = clearItemCategory;
        function clearItemCategory(itemId){
            var id = "check"+itemId;
            $scope.itemCategoryIds = utility.clear(itemId,$scope.itemCategoryIds,id,$scope.itemCategoryArr,"select-All-category")
        }

        $scope.searchItemCategory = searchItemCategory;
        function searchItemCategory(){
            $scope.itemCategoryArr = utility.search($scope.itemCategoryList,"atttibuteValue",$scope.itemCategorySearch,$scope.itemCategoryIds,"select-All-category")
        }

        handleItemCategorySelectAll = function handleItemCategorySelectAll(event){
            $scope.itemCategoryIds = utility.handleSelectAll(event,$scope.itemCategoryArr,$scope.itemCategoryIds,"id","check");
        }

        $scope.checkCategoryValues = checkCategoryValues;
        function checkCategoryValues(id){
            return utility.checkValues(id,$scope.itemCategoryIds);
        }

        handleItemCategoryChange = function handleItemCategoryChange(event){
            var id = "check"+event.target.value;
            $scope.itemCategoryIds = utility.handleChange(event,$scope.itemCategoryIds,id,$scope.itemCategoryArr,"select-All-category");
        }
    });