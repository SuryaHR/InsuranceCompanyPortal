angular.module('MetronicApp').controller('AllClaimsController', function ($rootScope, $filter, $scope, $location, $translate, $translatePartialLoader, ClaimCenterMyClaimdService,
    AssignClaimForManagerService,CommonUtils, CommonConstants) {
    //set language
    $translatePartialLoader.addPart('AllClaims');
    $translate.refresh();
    $scope.pageNumber = 1;
    $scope.recordsPerPage = 10;
    $scope.claimList = [];
    $scope.ClaimFilter = "ALL";
    // var fromDate = "";
    // var toDate = "";
    $scope.searchBy = "All";
    $scope.filterReports = sessionStorage.getItem('filterReports') && sessionStorage.getItem('filterReports')!=null ? new Map(Object.entries(JSON.parse(sessionStorage.getItem('filterReports')))) : null;
    function init() {
        // Update existing report saved filters
        if($scope.filterReports && $scope.filterReports.get(CommonConstants.filters.CLAIM_MANGER_ALL_CLAIM_RPT)){
            let claimManagerAllClaimsRpt = new Map(Object.entries(JSON.parse($scope.filterReports.get(CommonConstants.filters.CLAIM_MANGER_ALL_CLAIM_RPT))));
            console.log("claim manager all claims report", claimManagerAllClaimsRpt);
            if(claimManagerAllClaimsRpt){                    
                $scope.fromDate = claimManagerAllClaimsRpt.get("dateFrom");
                $scope.toDate = claimManagerAllClaimsRpt.get("dateTo"); 
                $scope.searchBy = claimManagerAllClaimsRpt.get("searchBy");
        }
    }
        getAllManagerClaims();
    }
    init();


    //Get All Claims
    $scope.getAllManagerClaims = getAllManagerClaims;
    function getAllManagerClaims() {
        $(".page-spinner-bar").removeClass("hide");
        var paramCompanyId = {
            "companyId": sessionStorage.getItem("CompanyId"),
             // "fromDate": fromDate ? fromDate :null,
            // "toDate": toDate ? toDate : null,
            "fromDate": angular.isDefined($scope.fromDate) && $scope.fromDate != null ? $filter('DatabaseDateFormatMMddyyyy')($scope.fromDate) : null,
            "toDate": angular.isDefined($scope.toDate) && $scope.toDate != null ? $filter('DatabaseDateFormatMMddyyyy')($scope.toDate) : null,
            // "supervisorId": sessionStorage.getItem("UserId"),
            // "statusIds":$scope.status,
            // "adjusterIds":$scope.Adjuster,
            "pagination":{ "pageNumber": $scope.pageNumber,
            "pageSize": 10},
            "searchKeyword" : $scope.searchKeyword && $scope.searchKeyword != null && $scope.searchKeyword != '' ? $scope.searchKeyword : null,
        };
         // Set report filters in session
         const claimManagerAllClaimsRpt = new Map();
         claimManagerAllClaimsRpt.set("dateFrom", $scope.fromDate);
         claimManagerAllClaimsRpt.set("dateTo", $scope.toDate);
         claimManagerAllClaimsRpt.set("searchBy",$scope.searchBy);
         CommonUtils.setReportFilters(CommonConstants.filters.CLAIM_MANGER_ALL_CLAIM_RPT, JSON.stringify(Object.fromEntries(claimManagerAllClaimsRpt)));
        
         var GetAllClaims = ClaimCenterMyClaimdService.getMyClaimList(paramCompanyId);
        GetAllClaims.then(function (success) {
            $scope.totalClaims = success.data.data && success.data.data.totalClaims > 0 ? success.data.data.totalClaims : 0;
            var resultList = success.data.data && success.data.data.claims ? success.data.data.claims : null;
            if (resultList != null && resultList.length > 0) {
                if ($scope.pageNumber == 1) {
                    $scope.toShowingPage = resultList.length;
                } else {
                    $scope.toShowingPage = resultList.length + ($scope.recordsPerPage * ($scope.pageNumber - 1))
                }
            }
            var currentListLength = ($scope.pageNumber - 1) * $scope.recordsPerPage;
            if (currentListLength != $scope.claimList.length) {
                $scope.claimList = new Array(currentListLength).fill(new Object());
            }
            angular.forEach(resultList, function (item) {
                $scope.claimList.push(item);
            });
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $scope.claimList = [];
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }

    //Filter by dates
    // $scope.searchByDate = searchByDate;
    // function searchByDate(key) {
    //     $(".page-spinner-bar").removeClass("hide");
    //     if (key === "All") {
    //         fromDate = '';
    //         toDate = '';
    //         getAllManagerClaims();
    //     }
    //     else {
    //         if (key === "Last3Month") {
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
    //         getAllManagerClaims();

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
        $scope.searchBy =param;
        //getAllManagerClaims();
    };


    //Filer by claim type
    $scope.FilterList = function () {
        if ($scope.ClaimFilter === 'ALL') {
            getAllManagerClaims();
        } else {
            $scope.claimList = $filter('filter')($scope.claimList, { claimType: $scope.ClaimFilter });
        }
    }

    // Go to claim details
    $scope.GoTOClaimDetails = function (item) {
        sessionStorage.setItem("ManagerScreenClaimId", item.claimId);
        sessionStorage.setItem("ManagerScreenpolicyNo", item.policyNumber);
        sessionStorage.setItem("ManagerScreenClaimNo", item.claimNumber);
        $location.url('ClaimCenter-ClaimDetails');
    }

    //   Sort All claims

    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.claimList = $filter('orderBy')($scope.claimList, $scope.sortKey);
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    };

    $scope.GoToHome = function () {
        $location.url(sessionStorage.getItem('HomeScreen'));
    };

    /**
     * Page Change function.
     */
    $scope.pageChanged = pageChanged;
    function pageChanged(pageNo) {
        $scope.pageNumber = pageNo;
        console.log('pageNo', $scope.pageNumber);
        getAllManagerClaims();
    }
});