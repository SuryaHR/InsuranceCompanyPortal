angular.module('MetronicApp')
    .directive('ngFileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var model = $parse(attrs.ngFileModel);
                var isMultiple = attrs.multiple;
                var modelSetter = model.assign;
                element.bind('change', function () {
                    var values = [];
                    angular.forEach(element[0].files, function (item) {
                        var value = {
                            // File Name
                            name: item.name,
                            //File Size
                            size: item.size,
                            //File URL to view
                            url: URL.createObjectURL(item),
                            // File Input Value
                            _file: item
                        };
                        values.push(value);
                    });
                    scope.$apply(function () {
                        if (isMultiple) {
                            modelSetter(scope, values);
                        } else {
                            modelSetter(scope, values[0]);
                        }
                    });
                });
            }
        };
    }])

    .directive('disablearrows', function () {
        function disableArrows(event) {
            if (event.keyCode === 38 || event.keyCode === 40) {
                event.preventDefault();
            }
        }
        return {
            link: function (scope, element, attrs) {
                element.on('keydown', disableArrows);
            }
        };
    })

    .directive('stringToNumber', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function (value) {
                    return '' + value;
                });
                ngModel.$formatters.push(function (value) {
                    if (value == '0.0') {
                        return value = null;
                    } else {
                        return parseFloat(value, 100);
                    }
                });
            }
        };
    })
    .controller('AllAppraisalsController', function ($http, $rootScope, $scope, settings, $location, $translate, $translatePartialLoader, $window,CalendarUtility,
        $filter, UnderWriterDashboardService, AuthHeaderService, $uibModal,InsuranceReportService, InsuranceInvoicesService, utility, CommonUtils, CommonConstants) {

        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        $translatePartialLoader.addPart('AllAppraisals');
        $translate.refresh();

        $scope.filterReports = sessionStorage.getItem('filterReports') && sessionStorage.getItem('filterReports')!=null ? new Map(Object.entries(JSON.parse(sessionStorage.getItem('filterReports')))) : null;
        $scope.UserType = sessionStorage.getItem("RoleList");
        $scope.UserName = sessionStorage.getItem("UserLastName") + ", " + sessionStorage.getItem("UserFirstName")
        $scope.isEditAppraisal = false;
    
        // Pagination
        $scope.pageSize = 20;
        $scope.totalItems = 0;
        var startPos = 0;
        var max = 20;
        $scope.currentPage = 1;
        $scope.toShowingPage = 20;

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

        $scope.appraisals = [];
        $scope.search = '';
        var userId = sessionStorage.getItem("UserId");
        $scope.filter = {};
        $scope.init = init;
        function init() {
            populateDate();
            getAllAppraisaList($scope.currentPage, max);
            statusList();
            categoryList();
            getAllAgency();
              // Update existing report saved filters
              if($scope.filterReports && $scope.filterReports.get(CommonConstants.filters.UNDERWRITER_ALL_APPR_RPT)){
                let underwriterAllApprRpt = new Map(Object.entries(JSON.parse($scope.filterReports.get(CommonConstants.filters.UNDERWRITER_ALL_APPR_RPT))));
                console.log("underwriterAllApprRpt", underwriterAllApprRpt);
                if(underwriterAllApprRpt){                    
                    $scope.filter.fromDate = underwriterAllApprRpt.get("dateFrom");
                    $scope.filter.toDate = underwriterAllApprRpt.get("dateTo");
                    $scope.statusIds = angular.isDefined(underwriterAllApprRpt.get("status"))? underwriterAllApprRpt.get("status"): [];
                    $scope.Agencies = angular.isDefined(underwriterAllApprRpt.get("agency"))? underwriterAllApprRpt.get("agency"):[];     
                    $scope.categoryType = angular.isDefined(underwriterAllApprRpt.get("itemCategory"))? underwriterAllApprRpt.get("itemCategory"):[];     
                }                
            }
        }
        init();
        $scope.populateDate = populateDate;
        function populateDate() {
            // from date
            var currentTime = new Date()
            var year = currentTime.getFullYear();
            $scope.filter.fromDate = "01/01/"+year;
            var d = $filter("TodaysDate")();
            $scope.filter.toDate = d;
        }
        //statusList
        $scope.statusList = statusList;
        function statusList() {
            var status = InsuranceReportService.getAppraisalStatusList();
            status.then(function (success) { 
                $scope.appraisalStatus = success.data.appraisalStatus;
                $scope.statusArr = [...$scope.appraisalStatus];
             }, function (error) { $scope.appraisalStatus = []; });
            // var status = SpeedCheckAssociateService.getAppraisalStatusList();
            // status.then(function (success) {
            // $scope.appraisalStatus = success.data.appraisalStatus;
            

            // },
            // function (error) {
            //     $scope.appraisalStatus = [];
            // });
        }

        // get approved appraisals list
        $scope.getAllAppraisaList = getAllAppraisaList;
        function getAllAppraisaList(page, max) {
            $scope.IsEditOrder = false;
            var param = {
                "page": page,
                "max": max,
                "searchKeyword": $scope.search.length > 0 ? $scope.search.split('/').join('-') : "",
                "sortBy": $scope.sortKey,
                "orderBy": $scope.reverse ? 0 : 1,
                "effectiveFromDate": $scope.filter.fromDate,
                "effectiveToDate": $scope.filter.toDate,
                "filterByStatus" : $scope.statusIds,
                "filterByItemCategory": $scope.categoryType,
                "appraisalAgency": $scope.Agencies
            }

            // Set report filters in session
            const underwriterAllApprRpt = new Map();
            underwriterAllApprRpt.set("dateFrom", $scope.filter.fromDate);
            underwriterAllApprRpt.set("dateTo", $scope.filter.toDate);
            underwriterAllApprRpt.set("status", $scope.statusIds);
            underwriterAllApprRpt.set("agency", $scope.Agencies); 
            underwriterAllApprRpt.set("itemCategory", $scope.categoryType);     
            CommonUtils.setReportFilters(CommonConstants.filters.UNDERWRITER_ALL_APPR_RPT, JSON.stringify(Object.fromEntries(underwriterAllApprRpt)));

            $(".page-spinner-bar").removeClass("hide");
            $scope.appraisals = [];
            var appraisalsList = UnderWriterDashboardService.getAllAppraisals(param);
            appraisalsList.then(function (success) {
                var appraisalsList = success.data && success.data.data ? success.data.data.appraisals : null;
                $scope.totalItems = appraisalsList != null && appraisalsList.totalCount > 0 ? appraisalsList.totalCount : 0;
                if (appraisalsList) {
                    if ($scope.currentPage == 1) {
                        $scope.toShowingPage = appraisalsList.reviewedAppraisals.length;
                    } else {
                        $scope.toShowingPage = appraisalsList.reviewedAppraisals.length + (max * ($scope.currentPage - 1))
                    }
                    // var currentListLength = ($scope.currentPage - 1) * max;
                    // if (currentListLength != $scope.appraisals.length) {
                    //     $scope.appraisals = new Array(currentListLength).fill(new Object());
                    // }
                    angular.forEach(appraisalsList.reviewedAppraisals, function (item) {
                        item.appraisal.policyholderName = $filter('constructName')(item.appraisal.policyholderDetails.primaryPolicyHolderFname, item.appraisal.policyholderDetails.primaryPolicyHolderLname);
                        item.appraisal.submittedToUnderwriter = item.submittedDate
                        item.appraisal.underwriterReviewedDate = item.reviewedDate;
                        // if (item.appraisal.isUnderwriterReviewed == true) {
                        // }
                        // else
                        //     item.appraisal.newInsurancePremiumCost = (item.appraisal.sc_insuranceReplacementValue) ? item.appraisal.sc_insuranceReplacementValue / 1000 * 12 : 0.0;

                        $scope.appraisals.push(item.appraisal);
                    });
                }
                $(".page-spinner-bar").addClass("hide");

            }, function (error) {
                toastr.remove();
                if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                    toastr.error(error.data.errorMessage, "Error")
                }
                else {
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
                }
                $(".page-spinner-bar").addClass("hide");
            });
        }

          // Export policy reports in
          $scope.exportPolicyReport = exportPolicyReport;
          function exportPolicyReport(fileType) {
              $(".page-spinner-bar").removeClass("hide");
              var data = {
                  "userId": userId,
                  "filterBy": 1, //View by appraisal
                  "isManager": false,
                  "isUnderwriter": false,
                  "userRole": "UNDERWRITER",
                  "fileType": fileType
              }
              var reports = UnderWriterDashboardService.getPolicyReport(data);
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
        //get Searched approved appraisals list
        $scope.searchAppraisalsByKeyword = searchAppraisalsByKeyword;
        function searchAppraisalsByKeyword(search) {
            $scope.search = search.length > 0 ? search : '';
            $scope.appraisals = [];
            getAllAppraisaList(1, 20);
        }

        // Open AppraisalDetailsPage
        $scope.openAppraisalDetails = openAppraisalDetails;
        function openAppraisalDetails(item) {
            $(".page-spinner-bar").removeClass("hide");
            if (item != null) {
                sessionStorage.setItem("appraisalId", item.id);
                sessionStorage.setItem("AppraisalNo", item.appraisalNumber);
                sessionStorage.setItem("policyNumber", item.policyNumber);
                sessionStorage.setItem("approvedList", true);
                sessionStorage.setItem("refferer", "ALL_APPRAISALS");
                $location.path('/UnderwriterAppraisal');
            }
            $(".page-spinner-bar").addClass("hide");
        }

        $scope.GoToHome = GoToHome;
        function GoToHome() {
            $location.path('/UnderWriter');
        }

        // Pagination
        $scope.pageChangeHandler = pageChangeHandler;
        function pageChangeHandler(pageNum) {
            if (pageNum == 1) {
                startPos = 0;
            } else {
                startPos = max * (pageNum - 1);
            }
            $scope.currentPage = pageNum;
            getAllAppraisaList(pageNum, max);
        }

        // sort function
        $scope.sort = function (keyname) {
            $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false;
            $scope.sortKey = keyname;   //set the sortKey to the param passed
            $scope.appraisals = [];
            startPos = 0;
            $scope.currentPage = 1;
            getAllAppraisaList(1, 20);
        }
        $scope.categoryList = categoryList;
        function categoryList() {
            $(".page-spinner-bar").removeClass("hide");
            // get Item categories
            var itemCategories = InsuranceInvoicesService.getAppraisalItemCategories();
            itemCategories.then(function (success) {
                $scope.itemCategoryList = success.data.data;
                $scope.categoryTypeArr =  [...$scope.itemCategoryList];
                console.log($scope.itemCategoryList);
            }, function (error) {
                toastr.remove();
                toastr.error(error.errorMessage, "Error");
                $scope.itemCategoryList = [];
            });
            $(".page-spinner-bar").addClass("hide");
        }

        $scope.searchFilter = searchFilter;
        function searchFilter(){
            getAllAppraisaList(1,20);
        }

        $scope.cancel = cancel;
        function cancel(){
            populateDate();
            $('#agency').val('').select2('destroy').select2();
            $('#status').val('').select2('destroy').select2();
            $('#Inscompany').val('').select2('destroy').select2();
            $scope.statusIds = [];
            $scope.categoryType = [];
            $scope.Agencies = [];
            clearAllAgencies();
            clearAllTypes();
            clearAllStatus();
            clearAllTypes();
            console.log($scope.filter.agency);
            getAllAppraisaList(1,20);
        }
        $scope.getAllAgency = getAllAgency;
        function getAllAgency(){
            $(".page-spinner-bar").removeClass("hide");
            var agencyCode = InsuranceReportService.getAllAgency();
            agencyCode.then(function (success) {
                $scope.agencyCodes = success.data;
                $scope.agencyCodeArr =  [...$scope.agencyCodes.agencyCode];
            }, function (error) {
                toastr.remove();
                toastr.error(error.errorMessage, "Error");
                $scope.itemCategoryList = [];
            });
            //$(".page-spinner-bar").addClass("hide");
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
            var id ="check"+event.target.value;
            $scope.Agencies = utility.handleChange(event,$scope.Agencies,id,$scope.agencyCodeArr,"select-All-Agency");
        }
    
        $scope.handleAgencySelectAll = handleAgencySelectAll
        function handleAgencySelectAll(event)
        {
          $scope.Agencies = utility.handleSelectAll(event,$scope.agencyCodeArr,$scope.Agencies,"agencyCode","check");
        }

        $scope.findAgencies = findAgencies;
        function findAgencies(id)
        {
            return utility.find(id,$scope.agencyCodes.agencyCode,"agencyCode","agencyCode")
        }
    
       $scope.clearAgencies = clearAgencies
       function clearAgencies(id)
        {
            var ele_id = "check"+id;
            $scope.Agencies = utility.clear(id,$scope.Agencies,ele_id,$scope.agencyCodeArr,"select-All-Agency");
        }
    
        $scope.clearAllAgencies = clearAllAgencies
       function clearAllAgencies()
        {
            $scope.Agencies = utility.clearAll($scope.agencyCodeArr,$scope.Agencies,"agencyCode","check","select-All-Agency");
            $scope.AgenciesAll = false;
        }
    
        $scope.checkAgencyValues = checkAgencyValues
        function checkAgencyValues(id)
        {
            return utility.checkValues(id,$scope.Agencies);
        }
    });
