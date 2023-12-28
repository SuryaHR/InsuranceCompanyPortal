angular.module('MetronicApp').controller('AdjusterAllClaimsController', function ($rootScope, $filter, $scope, $location, $translate, $translatePartialLoader, AuthHeaderService,
    AdjusterDashboardService, AllClaimsService, utilityMethods,utility,$window,CommonUtils, CommonConstants) {
    //set language
    $translatePartialLoader.addPart('AdjusterAllClaims');
    $translate.refresh();
    $scope.pagesize = $rootScope.settings.pagesize;
    $scope.FilteredAllClaims = [];
    $scope.PageLength = 30
    $scope.ClaimFilter = "ALL";
    $scope.StatusList = [];
    $scope.claimsList = [];
    $scope.DuplicateStatusList = [];
    $scope.CheckedStatus = {
        status: []
    };
    $scope.statusIds = [];
    $scope.status = [{ Selected: null }];
    //pagination
    $scope.pageSize = 20;
    $scope.totalItems = 0;
    $scope.currentPage = 1;
    //search keyword
    $scope.searchKeyword = '';
    $scope.limit = 50;
    $scope.moreShown = false;
    $scope.lastRecord = 20;

    $scope.endCount = 0;
    $scope.firstCount = 0;
    $scope.reverse = true;
    $scope.disp = false;
    $scope.statusAll = false;
    $scope.statusSearch ='';
    $scope.searchBy ="All";
    $scope.filterReports = sessionStorage.getItem('filterReports') && sessionStorage.getItem('filterReports')!=null ? new Map(Object.entries(JSON.parse(sessionStorage.getItem('filterReports')))) : null;

    function init() {
         // Update existing report saved filters
         if($scope.filterReports && $scope.filterReports.get(CommonConstants.filters.ADJUSTER_ALL_CLAIMS_RPT)){
            let adjusterAllClaimsRpt = new Map(Object.entries(JSON.parse($scope.filterReports.get(CommonConstants.filters.ADJUSTER_ALL_CLAIMS_RPT))));
            console.log("adjuster all claims report", adjusterAllClaimsRpt);
            if(adjusterAllClaimsRpt){                    
                $scope.fromDate = adjusterAllClaimsRpt.get("dateFrom");
                $scope.toDate = adjusterAllClaimsRpt.get("dateTo");
                $scope.statusIds = angular.isDefined(adjusterAllClaimsRpt.get("status"))? adjusterAllClaimsRpt.get("status"): [];
                $scope.searchKeyword=adjusterAllClaimsRpt.get("searchKeyword");
                $scope.searchBy= adjusterAllClaimsRpt.get("searchBy");
        }
    }
        $scope.UserDetails = {
            UserId: (angular.isDefined(sessionStorage.getItem("UserId")) ? sessionStorage.getItem("UserId") : null)
        };
        GetClaimStatus();
        GetAllClaim("");
    }
    init();
    $scope.GetClaimStatus = GetClaimStatus;
    function GetClaimStatus() {
        $(".page-spinner-bar").removeClass("hide");
        var GetClaimStatusList = AdjusterDashboardService.getClaimStatus();
        GetClaimStatusList.then(function (success) {
            $scope.TempStatusList = success.data.data;
            angular.forEach($scope.TempStatusList, function(status){
                if(status.status == "Work In Progress" || status.status == "Created" || status.status == "Supervisor Approval" || status.status == "Closed"){
                    $scope.StatusList.push(status);
             }           
            })
            $scope.statusArr = [...$scope.StatusList];
            angular.forEach($scope.StatusList, function (Item) {
                $scope.DuplicateStatusList.push({ "id": Item.id, status: Item.status, Selected: false });
            });
            utilityMethods.multiSelectDropdown('statusDropdownDiv', 'statusMultiSelect', 'statusSelectAll', "status", "id", $scope.DuplicateStatusList, $translate.instant("Select Status"));
        }, function (error) {
            if (error != null) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            }
            else {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
            $(".page-spinner-bar").addClass("hide");
        });
     
    };

    $scope.GetAllClaim = GetAllClaim;
    function GetAllClaim() {
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "assignedUserId": $scope.UserDetails.UserId,
            "filter": {
                "startDate": angular.isDefined($scope.fromDate) && $scope.fromDate != null ? $filter('DatabaseDateFormatMMddyyyy')($scope.fromDate) : null,
                "endDate": angular.isDefined($scope.toDate) && $scope.toDate != null ? $filter('DatabaseDateFormatMMddyyyy')($scope.toDate) : null
            },
            "pagination": {
                "pageNumber": $scope.currentPage,
                "limit": $scope.pageSize,
                "orderBy": $scope.reverse ? "desc" : "asc",
                "sortBy": $scope.sortKey != null || $scope.sortKey != '' ? $scope.sortKey : null,
            },
            "searchKeyword": $scope.searchKeyword.length > 0 ? $scope.searchKeyword : '',
            "statusIds": angular.isDefined($scope.statusIds) && $scope.statusIds != null ? $scope.statusIds : null
            // "searchKeyword": $scope.searchKeyword,
            // "statusIds": $scope.statusIds
        }
        // Set report filters in session
        const adjusterAllClaimsRpt = new Map();
        adjusterAllClaimsRpt.set("dateFrom", $scope.fromDate);
        adjusterAllClaimsRpt.set("dateTo", $scope.toDate);
        adjusterAllClaimsRpt.set("status", $scope.statusIds);
        adjusterAllClaimsRpt.set("searchKeyword",$scope.searchKeyword); 
        adjusterAllClaimsRpt.set("searchBy",$scope.searchBy);
        CommonUtils.setReportFilters(CommonConstants.filters.ADJUSTER_ALL_CLAIMS_RPT, JSON.stringify(Object.fromEntries(adjusterAllClaimsRpt)));
        

        var GetAllClaims = AllClaimsService.getAllClaims(param);
        GetAllClaims.then(function (success) {
            $scope.claimsList = [];
            var claims = angular.isDefined(success.data.data) && success.data.data != null
                && success.data.data.claims.length > 0 ? success.data.data.claims : null;
            if (angular.isDefined(claims) && claims != null && claims.length > 0) {
                if ($scope.currentPage == 1)
                    $scope.lastRecord = claims.length;
                else {
                    // var currentListLength = ($scope.currentPage - 1) * $scope.pagesize;
                    // if (currentListLength != $scope.claimsList)
                    //     $scope.claimsList = new Array(currentListLength).fill(new Object());
                    $scope.lastRecord = claims.length + ($scope.pageSize * ($scope.currentPage - 1))
                }
                angular.forEach(claims, function (item) {
                    $scope.claimsList.push(item);
                });
            }
            $scope.totalItems = success.data.data && success.data.data.totalClaims != null ? success.data.data.totalClaims : 0;
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            if (error != null) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            }
            else {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
            $(".page-spinner-bar").addClass("hide");
        });

    };

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
    };

    $scope.GoTOClaimDetails = GoTOClaimDetails;
    function GoTOClaimDetails(claim) {
        if (claim.claimId != null && claim.claimNumber != null) {
            sessionStorage.setItem("ClaimId", claim.claimId);
            sessionStorage.setItem("ClaimNo", claim.claimNumber);
            sessionStorage.setItem("ShowNoteActive", "");
            sessionStorage.setItem("ShowEventActive", "");
            sessionStorage.setItem("NavFrom","AllClaim");
            if(sessionStorage.getItem("isCoreLogic")=="true"){
                $location.url('CorelogicAdjusterPropertyClaimDetails')

            }else {
                $location.url('AdjusterPropertyClaimDetails')

            }
        }
    };

    // Search keyword
    $scope.searchByKeyword = searchByKeyword
    function searchByKeyword(searchQuery) {
        $scope.searchKeyword = angular.isDefined(searchQuery) && searchQuery != null && searchQuery.length > 0 ? searchQuery : '';
        $scope.currentPage = 1;
        GetAllClaim();
    };

    // Sort invoices List
    $scope.sort = function (keyname) {
        $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false;
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.currentPage = 1;
        GetAllClaim();
    };

    // Pagination
    $scope.setCurrentPage = setCurrentPage;
    function setCurrentPage(pageNum) {
        $scope.currentPage = pageNum;
        GetAllClaim();
    };

    $scope.clearFilter = clearFilter;
    function clearFilter() {
        $(".ThisMonth").removeClass("active");
        $(".Last3Month").removeClass("active");
        $(".All").addClass("active");
        $scope.fromDate = '';
        $scope.toDate = '';
        $scope.searchKeyword = '';
        $scope.searchBy="All";
        clearAllStatus();
        //var multiSelect = $('#statusMultiSelect').data("kendoMultiSelect");
        //multiSelect.value([]);
        $scope.currentPage = 1;
        
        $scope.sortKey = '';
        $scope.statusIds = [];
        document.getElementById('select-All').checked = false;
        utilityMethods.clearMultiSelectDropdownValues('statusMultiSelect', 'statusSelectAll');
        GetAllClaim();
    };

    $scope.openDropDown = openDropDown;
    function openDropDown(){
        $scope.disp = true;
    }

    $scope.closeorOpenDropDown = closeorOpenDropDown;
    function closeorOpenDropDown(){
        $scope.disp = !$scope.disp;
        console.log($scope.disp);
    }

    $scope.closeDropDown = closeDropDown;
    function closeDropDown(){
        $scope.disp = false;
    }

    $scope.searchStatus = searchStatus;
    function searchStatus()
    {
        $scope.statusArr = utility.search($scope.StatusList,"status",$scope.statusSearch,$scope.statusIds,"select-All");
    }
 
    $scope.handleStatusSelectAll = handleStatusSelectAll
    function handleStatusSelectAll(event)
    {
      $scope.statusIds = utility.handleSelectAll(event,$scope.statusArr,$scope.statusIds,"id","check");
    }

    $scope.checkValues = checkValues
    function checkValues(id)
    {
        return utility.checkValues(id,$scope.statusIds);
    }

    $scope.handleStatusChange = handleStatusChange
    function handleStatusChange(event)
    {
        var id ="check"+event.target.value;
        $scope.statusIds = utility.handleChange(event,$scope.statusIds,id,$scope.statusArr,"select-All");
    }

    $scope.clearStatus = clearStatus
   function clearStatus(id)
    {
        var ele_id = "check"+id;
        $scope.statusIds = utility.clear(id,$scope.statusIds,ele_id,$scope.statusArr,"select-All");
    }
   
    $scope.findStatus = findStatus;
    function findStatus(id)
    {
        return utility.find(id,$scope.StatusList,"id","status")
    }


    $scope.clearAllStatus = clearAllStatus
   function clearAllStatus()
    {
        $scope.statusIds = utility.clearAll($scope.statusArr,$scope.statusIds,"id","check","select-All");
        $scope.statusAll = false;
    }
});
