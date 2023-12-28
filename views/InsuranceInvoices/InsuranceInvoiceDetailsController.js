angular.module('MetronicApp')
    .controller('InsuranceInvoiceDetailsController', function ($rootScope, $scope, $filter, settings, $http, $location, $translate, $translatePartialLoader, InsuranceInvoicesService,
        AuthHeaderService, utilityMethods) {

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
        $scope.InvoiceNum = sessionStorage.getItem("invoiceNum");


        $scope.CommonObj = {};
        $scope.CommonObj.Role = [];

        // Pagination
        var startPos = 0;
        $scope.pageSize = 20;
        $scope.totalItems = 0;
        $scope.currentPage = 1;
        $scope.toShowingPage = 20;
        $scope.filter = [];
        $scope.appraisalInvoices = [];
        $scope.searchInvoicesKeyword = '';

        function init() {
            $scope.reverse = true;
            $("#searchInvoicesKeyword").on("keypress", function (e) {
                var startPos = e.currentTarget.selectionStart;
                if ((e.which === 32 && startPos == 0) || ((e.which != 32 && (e.which < 48 ||
                    (e.which > 57 && e.which < 65) ||
                    (e.which > 90 && e.which < 97) ||
                    e.which > 122))))
                    e.preventDefault();
            });
            // get Item categories
            var itemCategories = InsuranceInvoicesService.getAppraisalItemCategories();
            itemCategories.then(function (success) {
                $scope.itemCategoryList = success.data.data;
            }, function (error) {
                toastr.remove();
                toastr.error(error.errorMessage, "Error");
                $scope.itemCategoryList = [];
            });
            GetStates();
            GetAgentsList();
            GetHoPolicyTypes();
            getMonthlyInvoiceDetails();
            getSubInvoicesForMonthly();
        }
        init();

        function getMonthlyInvoiceDetails() {
            var invoiceNumber = sessionStorage.getItem("invoiceNumber");
            var miDetailsCallback = InsuranceInvoicesService.getMonthlyInvoiceDetails(invoiceNumber);
            miDetailsCallback.then(function (success) {
                $scope.monthlyInvoicesSummary = success.data;
                // Filter default invoice date
                setInvoiceDate();
            });
        }

        $scope.getSubInvoicesForMonthly = getSubInvoicesForMonthly;
        function getSubInvoicesForMonthly() {
            $(".page-spinner-bar").removeClass("hide");
            var invoiceNumber = sessionStorage.getItem("invoiceNumber");
            var param = {};
            param.invoiceNumber = invoiceNumber;
            param.paginationDTO = {};
            if ($scope.filter) {
                param.startDate = $scope.filter.invoiceFromDate != null && angular.isDefined($scope.filter.invoiceFromDate) ? $filter('DatabaseDateFormatMMddyyyy')($scope.filter.invoiceFromDate) : null;
                param.endDate = $scope.filter.invoiceToDate != null && angular.isDefined($scope.filter.invoiceToDate) ? $filter('DatabaseDateFormatMMddyyyy')($scope.filter.invoiceToDate) : null;
                param.stateIds = $scope.filter.stateIds;
                param.agentIds = $scope.filter.agentIds;
                param.policyTypeIds = $scope.filter.policyType;
                param.searchKeyword = $scope.searchInvoicesKeyword;
                param.itemCategoryIds = $scope.filter.itemCategoryIds;
            }
            param.paginationDTO.pageNumber = $scope.currentPage;
            param.paginationDTO.pageSize = $scope.pageSize;
            param.paginationDTO.sortBy = $scope.sortKey;
            param.paginationDTO.orderBy = $scope.reverse ? 'desc' : 'asc';
            var subInvoiceListCallBack = InsuranceInvoicesService.getSubInvoicesForMonthly(param);
            subInvoiceListCallBack.then(function (success) {
                $scope.totalItems = 0;
                $scope.appraisalInvoices = [];
                if (success.data.data != null) {                    
                    var resultList = success.data.data;
                    $scope.totalItems = resultList && resultList.totalNumberOfRecords > 0 ? resultList.totalNumberOfRecords : 0;
                    if ($scope.currentPage == 1) {
                        $scope.toShowingPage = resultList.appraisalInvoiceItemsDTOS.length;
                    } else {
                        $scope.toShowingPage = resultList.appraisalInvoiceItemsDTOS.length + ($scope.pageSize * ($scope.currentPage - 1))
                    }
                    // var currentListLength = ($scope.currentPage - 1) * $scope.pageSize;
                    // if (currentListLength != $scope.appraisalInvoices.length) {
                    //     $scope.appraisalInvoices = new Array(currentListLength).fill(new Object());
                    // }
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

        $scope.downloadAppraisalInvociesExcel = downloadAppraisalInvociesExcel
        function downloadAppraisalInvociesExcel() {
            $(".page-spinner-bar").removeClass("hide");
            var invoiceNumber = sessionStorage.getItem("invoiceNumber");
            var param = {};
            param.invoiceNumber = invoiceNumber;
            //param.paginationDTO = {};
            var agentids = [];
            param.agentIds = agentids;
            if ($scope.filter) {
                param.startDate = $scope.filter.apprFromDate != null && angular.isDefined($scope.filter.apprFromDate) ? $filter('DatabaseDateFormatMMddyyyy')($scope.filter.apprFromDate) : null;
                param.endDate = $scope.filter.apprToDate != null && angular.isDefined($scope.filter.apprToDate) ? $filter('DatabaseDateFormatMMddyyyy')($scope.filter.apprToDate) : null;
                // param.itemCategoryIds =  $scope.filter.itemCategoryIds;
                // param.speedCheckAssociates = $scope.filter.associateIds;
                // param.insuranceCompanyIds = $scope.filter.InsCompanyIds;
                param.agentIds = $scope.filter.agentIds;
                param.stateIds = $scope.filter.stateIds;
                param.policyTypeIds = $scope.filter.policyType;
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
                    toastr.remove();
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                    console.log(ex);
                }

            })
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

        // Get List Of Agent
        $scope.GetAgentsList = GetAgentsList;
        function GetAgentsList() {
            console.log(sessionStorage.getItem("CompanyId"));
            var companyIdParam = {
                "companyId": sessionStorage.getItem("CompanyId")
            };
            var GetAgents = InsuranceInvoicesService.GetListOfAgent(companyIdParam);
            GetAgents.then(function (success) {
                $scope.AgentList = success.data.data;
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
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
            // $scope.filter.invoiceFromDate = null;
            // $scope.filter.invoiceToDate = null;
            setInvoiceDate();
            $scope.filter.stateIds = null;
            $scope.filter.agentIds = null;
            $scope.filter.policyType = null;
            $scope.searchInvoicesKeyword = null;
            $scope.filter.itemCategoryIds = null;
            $scope.currentPage = 1;
            getSubInvoicesForMonthly();
            $("select").val("").select2();
            //$("select").select2('destroy').val("").select2();            
        }

        // Go to InsuranceInvoices page
        $scope.GoToInvoicesDashboard = GoToInvoicesDashboard;
        function GoToInvoicesDashboard() {
            $location.url('/InsuranceInvoices');
        }

        // setInvoiceDate default date
        $scope.setInvoiceDate = setInvoiceDate;
        function setInvoiceDate() {
            $scope.filter.invoiceFromDate = $scope.monthlyInvoicesSummary.startDate;
            $scope.filter.invoiceToDate = $scope.monthlyInvoicesSummary.endDate;
        }

        $scope.searchInvoices = searchInvoices;
        function searchInvoices(key) {
            $scope.searchInvoicesKeyword = key;           
            $scope.currentPage = 1;
            getSubInvoicesForMonthly();
        }
    });