angular.module('MetronicApp').controller('SuperVisorAllClaimController', function ($rootScope, $filter, $scope, settings, $http, $timeout, $location, $translate, $translatePartialLoader, SupervisorAllClaimsService,CommonUtils, CommonConstants) {
    //set language
    $translatePartialLoader.addPart('SuperVisorAllClaim');
    $translate.refresh();
    $scope.pagesize = $rootScope.settings.pagesize;
    $scope.claimList = [];
    $scope.PageLength = $rootScope.settings.pagesize;
    $scope.ClaimFilter = "ALL";
    // $scope.tab = 'Last3Month';
    $scope.Adjuster;
    $scope.claimStatusList=[];
    $scope.selectedStatus = [];
    $scope.ClaimRowFilter;
    var fromDate = "";
    var toDate = "";
    $scope.claimsPerpage=20;
    $scope.pageNumber = 1;
    $scope.Adjuster;
    $scope.status;
    $scope.searchBy ="All";
    $scope.filterReports = sessionStorage.getItem('filterReports') && sessionStorage.getItem('filterReports')!=null ? new Map(Object.entries(JSON.parse(sessionStorage.getItem('filterReports')))) : null;

    function init() {
        // Update existing report saved filters
        if($scope.filterReports && $scope.filterReports.get(CommonConstants.filters.SUPERVISOR_ALL_CLAIMS_RPT)){
            let supervisorAllClaimsRpt = new Map(Object.entries(JSON.parse($scope.filterReports.get(CommonConstants.filters.SUPERVISOR_ALL_CLAIMS_RPT))));
            console.log("supervior all claims report", supervisorAllClaimsRpt);
            if(supervisorAllClaimsRpt){                    
                $scope.fromDate = supervisorAllClaimsRpt.get("dateFrom");
                $scope.toDate = supervisorAllClaimsRpt.get("dateTo");
                $scope.status = angular.isDefined(supervisorAllClaimsRpt.get("status"))? supervisorAllClaimsRpt.get("status"): [];
                $scope.Adjuster = angular.isDefined(supervisorAllClaimsRpt.get("adjuster"))? supervisorAllClaimsRpt.get("adjuster"): []; 
                $scope.searchBy = supervisorAllClaimsRpt.get("searchBy") ; 
        }
    }
        $(".page-spinner-bar").removeClass("hide");
        getClaimStatusList();
        // searchByDate('Last3Month'); //default we set the tab Last3Month
        //getAllSupervisorClaims();
        GetAdjustorList();
        getAllSupervisorClaims("");
    }
    init();

    $scope.getAllSupervisorClaims = getAllSupervisorClaims;
    function getAllSupervisorClaims() {
        // if($scope.status)
        // angular.forEach($scope.status, function (item) {
        //     $scope.selectedStatus.push({"id":item});
        // });
        $(".page-spinner-bar").removeClass("hide");

        var paramCompanyId = {
            "companyId": sessionStorage.getItem("CompanyId"),
            // "fromDate": fromDate ? fromDate :null,
            // "toDate": toDate ? toDate : null,
            "fromDate": angular.isDefined($scope.fromDate) && $scope.fromDate != null ? $filter('DatabaseDateFormatMMddyyyy')($scope.fromDate) : null,
            "toDate": angular.isDefined($scope.toDate) && $scope.toDate != null ? $filter('DatabaseDateFormatMMddyyyy')($scope.toDate) : null,
            "supervisorId": sessionStorage.getItem("UserId"),
            "statusIds":$scope.status,
            "adjusterIds":$scope.Adjuster,
            "pagination":{ "pageNumber": $scope.pageNumber,
            "pageSize": 20},
            "searchKeyword" : $scope.searchKeyword && $scope.searchKeyword != null && $scope.searchKeyword != '' ? $scope.searchKeyword : null,
            "searchByKeyword" : $scope.searchByKeyword ? $scope.searchByKeyword : false
        };
         // Set report filters in session
         const supervisorAllClaimsRpt = new Map();
         supervisorAllClaimsRpt.set("dateFrom", $scope.fromDate);
         supervisorAllClaimsRpt.set("dateTo", $scope.toDate);
         supervisorAllClaimsRpt.set("status", $scope.status);
         supervisorAllClaimsRpt.set("adjuster",$scope.Adjuster); 
         supervisorAllClaimsRpt.set("searchBy", $scope.searchBy); 
         CommonUtils.setReportFilters(CommonConstants.filters.SUPERVISOR_ALL_CLAIMS_RPT, JSON.stringify(Object.fromEntries(supervisorAllClaimsRpt)));
         
        var GetAllClaims = SupervisorAllClaimsService.getAllClaims(paramCompanyId);
        GetAllClaims.then(function (success) {
            $scope.totalClaims = success.data.data && success.data.data.totalClaims > 0 ? success.data.data.totalClaims : 0;
            var resultList = success.data.data && success.data.data.claims ? success.data.data.claims : null;
            if (resultList != null && resultList.length > 0) {
                if ($scope.pageNumber == 1) {
                    $scope.toShowingPage = resultList.length;
                } else {
                    $scope.toShowingPage = resultList.length + ($scope.claimsPerpage * ($scope.pageNumber - 1))
                }
            }
            $scope.claimList = resultList;
            //var currentListLength = ($scope.pageNumber - 1) * $scope.claimsPerpage;
            // $scope.claimList = [];
            // if (currentListLength != $scope.claimList.length) {
            //     $scope.claimList = new Array(currentListLength).fill(new Object());
            // }
            // angular.forEach(resultList, function (item) {
            //     $scope.claimList.push(item);
            // });
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }

    $scope.GetAdjustorList = GetAdjustorList;
    function GetAdjustorList() {
        var param = {
            "companyId": sessionStorage.getItem("CompanyId")
        };
        var getpromise = SupervisorAllClaimsService.getAdjusterList(param);
        getpromise.then(function (success) {
            $scope.AdjusterList = success.data.data;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        });
    };

    //Filter by dates
    // $scope.searchByDate = searchByDate;
    // function searchByDate(key) {
    //     $(".page-spinner-bar").removeClass("hide");
    //     if (key === "All") {
    //         fromDate = '';
    //         toDate = '';
    //         getAllSupervisorClaims();
    //         $(".page-spinner-bar").addClass("hide");
    //     }
    //     else {
    //         if (key === "Last3Month") {
    //             var dt = $filter("TodaysDate")();
    //             $scope.toDate = dt;
    //             var currentTime = new Date();
    //             currentTime.setDate(currentTime.getDate() - 90);
    //             $scope.fromDate = (currentTime.getMonth()+1)+'/'+currentTime.getDate()+'/'+currentTime.getFullYear();
    //             var d = new Date(Date.apply(null, arguments));
    //             d.setMonth(d.getMonth() - 2);
    //             d.setDate(1);
    //             fromDate = $filter('date')(d, "MM-dd-yyyy");
    //             d.setMonth(d.getMonth() + 3);
    //             d.setDate(0);
    //             toDate = $filter('date')(d, "MM-dd-yyyy");

    //         }
    //         if (key === "ThisMonth") {
    //             var d = new Date(Date.apply(null, arguments));
    //             d.setDate(1);
    //             fromDate = $filter('date')(d, "MM-dd-yyyy");
    //             d.setMonth(d.getMonth() + 1);
    //             d.setDate(0);
    //             toDate = $filter('date')(d, "MM-dd-yyyy");

    //         }
    //         if (key === "ByDate") {
    //             fromDate = $filter('date')(new Date($scope.fromDate), "MM-dd-yyyy");
    //             toDate = $filter('date')(new Date($scope.toDate), "MM-dd-yyyy");
    //         }
    //         var param = {
    //             "fromDate": fromDate,
    //             "toDate": toDate,
    //             "companyId": sessionStorage.getItem("CompanyId")
    //         };
    //         getAllSupervisorClaims();
    //     }
    // }
    $scope.searchByDate = searchByDate;
    function searchByDate(param) {
        var dt = new Date();
        var month = dt.getMonth(), year = dt.getFullYear();
        if (param == 'ThisMonth') {
            $scope.fromDate = moment(new Date(year, month, 1)).format("MM/DD/YYYY");
            $scope.toDate = moment(new Date(year, month, dt.getDate())).format("MM/DD/YYYY");
        }
        else if (param == 'Last3Month') {
            $scope.fromDate = moment(new Date(year, month - 3, 1)).format("MM/DD/YYYY");
            $scope.toDate = moment(new Date(year, month, dt.getDate())).format("MM/DD/YYYY");
        } else if (param == "All") {
            $scope.fromDate = "";
            $scope.toDate = "";
        }
        $scope.searchBy = param;
    };

    //Filter by claim type
    $scope.FilterList = function () {
        // $scope.FilteredAllClaims = [];
        // if (($scope.ClaimFilter === "ALL") || (angular.isUndefined($scope.ClaimFilter) || $scope.ClaimFilter === null)) {
        //     $scope.FilteredAllClaims = TempFilteredAllClaims;
        // }
        // else {
        //     angular.forEach(TempFilteredAllClaims, function (item) {
        //         if (item.claimType == $scope.ClaimFilter) {
        //             $scope.FilteredAllClaims.push(item)
        //         }
        //     });
        // }
        if ($scope.ClaimFilter === 'ALL') {
            getAllSupervisorClaims();
        } else {
            $scope.claimList = $filter('filter')($scope.claimList, { claimType: $scope.ClaimFilter });
        }
        $scope.Adjuster.id = null;
        $scope.FilteredAllClaims = $scope.FilteredAllClaims;// scroling not working if this statement is hide
    }

    //Filer by Adjuster
    $scope.FilterByAdjustor = function () {
        $scope.FilteredAllClaims = [];
        if ($scope.Adjuster.id == null || angular.isUndefined($scope.Adjuster.id)) {
            $scope.FilteredAllClaims = TempFilteredAllClaims
        } else {
            angular.forEach(TempFilteredAllClaims, function (item) {
                if (item.adjuster.id == $scope.Adjuster.id) {
                    $scope.FilteredAllClaims.push(item)
                }
            });
        }
        $scope.ClaimFilter = null;
        $scope.FilteredAllClaims = $scope.FilteredAllClaims;// scroling not working if this statement is hide
    }

    //Filter number of rows
    $scope.ClaimRowFilterfun = function () {
        $scope.PageLength = $scope.ClaimRowFilter;
        $scope.FilteredAllClaims = $scope.FilteredAllClaims;// scroling not working if this statement is hide
    };

    // Go to claim details
    $scope.GoTOClaimDetails = function (item) {
        sessionStorage.setItem("ClaimNo", item.claimNumber);
        sessionStorage.setItem("ClaimId", item.claimId);
        sessionStorage.setItem("BackPage","SupervisorAllClaim");
        sessionStorage.setItem("refferer","SupervisorAllClaim");
        $location.url("SupervisorClaimDetails");
    }

    //   Sort All claims
    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.claimList = $filter('orderBy')($scope.claimList, $scope.sortKey);

        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
        $scope.pageNumber = 1;
    };
    $scope.GoToHome = function () {
        $location.url(sessionStorage.getItem('HomeScreen'));
    }

    /**
     * Page Change function.
     */
    $scope.pageChanged = pageChanged;
    function pageChanged(pageNo) {
        $scope.pageNumber = pageNo;
        getAllSupervisorClaims();
    }


    $scope.getClaimStatusList = getClaimStatusList;
    function getClaimStatusList(){
        var getpromise = SupervisorAllClaimsService.getClaimStatusList();
        getpromise.then(function (success) {
            $scope.claimStatusList = success.data.data;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        });
    }

    $scope.exportAllClaims = function () {
        $(".page-spinner-bar").removeClass("hide");
        var data = {
          "companyId": sessionStorage.getItem("CompanyId"),
          "pageNumber": $scope.pageNumber,
          "fromDate": fromDate ? fromDate :null,
          "toDate": toDate ? toDate : null,
          "limit":$scope.claimsPerpage,
          "supervisorId": sessionStorage.getItem("UserId"),
          "statusIds":$scope.status,
          "adjusterIds":$scope.Adjuster
        }
        var reports = SupervisorAllClaimsService.getAllClaimsReport(data);
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
          } catch (ex) {
              console.log(ex);
          }
             $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            $(".page-spinner-bar").addClass("hide");
        });
    }

    $scope.checkKeyCode = checkKeyCode;
    function checkKeyCode(e,searchKeyword){
        if(e.keyCode == 13){
            $scope.searchKeyword = searchKeyword;
            $scope.searchByKeyword = true;
            getAllSupervisorClaims();
        }
    }
    $scope.filterReports = filterReports
    function filterReports() {
        $scope.claimsList = [];
        getAllSupervisorClaims();
    }
});
