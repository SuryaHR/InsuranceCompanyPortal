angular.module('MetronicApp').controller('ClaimReportsController', function ($rootScope, $filter, $http, $scope, $location, $translate, $translatePartialLoader, AuthHeaderService,
    AdjusterDashboardService, SalvageReportsService, utilityMethods, ClaimReportsService, utility,$uibModal,CommonUtils, CommonConstants) {

    $translatePartialLoader.addPart('ClaimReports');
    $translate.refresh();

    $scope.pagesize = $rootScope.settings.pagesize; // 20
    $scope.PageLength = 20;
    $scope.currentPage = 1;
    $scope.keyword = "";
    $scope.totalSize = 0;

    $scope.toShowingPage = 20;
    $scope.claimList = [];
    $scope.policyTypes = [];
    $scope.branchList = [];

    $scope.disp = false;
    $scope.statusAll = false;
    $scope.statusSearch ='';
    $scope.statusIds = [];
    $scope.claimTypesList = [];
    $scope.serverAddress = "";
    $scope.ownerRetained = "0";
    $scope.selectedPolicies = [];
    $scope.policyTypesList = [];
    $scope.role = sessionStorage.getItem("RoleList");
    $scope.UserDetails = {
        UserId: (angular.isDefined(sessionStorage.getItem("UserId")) ? sessionStorage.getItem("UserId") : null)
    };
    $scope.userIds = [$scope.UserDetails.UserId];
    $scope.policySearch='';
    $scope.policyAll=false;
    $scope.policyDisp=false;
    $scope.policy=[{ Selected: null }];
    $scope.adjusterIds = [];
    $scope.branchesIds = [];
    $scope.Adjusterdisp=false;
    $scope.AllAdjuster=false;
    $scope.AdjusterSearch='';
    $scope.Branchdisp = false;
    $scope.BranchDispAll=false;
    $scope.branchSearch='';
    $scope.filterReports = sessionStorage.getItem('filterReports') && sessionStorage.getItem('filterReports')!=null ? new Map(Object.entries(JSON.parse(sessionStorage.getItem('filterReports')))) : null;
    function init() {
        $scope.ClaimProfile = sessionStorage.getItem("claimProfile");
        var currentTime = new Date()
        var year = currentTime.getFullYear();
        $scope.fromDate = "01/01/" + year;
        var d = $filter("TodaysDate")();
        $scope.toDate = d;
       
          // Update existing report saved filters
          if($scope.filterReports && $scope.filterReports.get(CommonConstants.filters.CLAIM_RPT)){
            let claimRpt = new Map(Object.entries(JSON.parse($scope.filterReports.get(CommonConstants.filters.CLAIM_RPT))));
            console.log("claim report", claimRpt);
            if(claimRpt){                    
                $scope.fromDate = claimRpt.get("dateFrom");
                $scope.toDate = claimRpt.get("dateTo");
                $scope.statusIds = angular.isDefined(claimRpt.get("status"))? claimRpt.get("status"): [];
                $scope.searchKeyword =claimRpt.get("searchKeyword");
                $scope.adjusterIds = angular.isDefined(claimRpt.get("adjusterIds"))? claimRpt.get("adjusterIds"): [];
                $scope.selectedPolicies = angular.isDefined(claimRpt.get("policyTypes"))? claimRpt.get("policyTypes"): [];  
                $scope.branchesIds = angular.isDefined(claimRpt.get("branchIds"))? claimRpt.get("branchIds"): [];
            }
    }
    getStatusList();
    getPolicyTypesList();
    getAdjustersList();
    getBranchList();
    //getClaimTypesList();
    getClaimReports();
    var GetGlobaldata = $http.get('Config/Configuration.json');
    GetGlobaldata.then(function (success) {
        var ConfigSettings = success.data.data;
        $scope.serverAddress = ConfigSettings.serverAddress;
    });
         
//    window.setTimeout(()=>    {
//         $('#fromDate').ready(function() {
//             startDate = $('#fromDate')[0].value;
//             $("#toDate").datepicker({minDate : new Date(startDate)});
//         })
    
//         $('#toDate').ready(function() {
//             endDate = $('#toDate')[0].value;
//             $("#fromDate").datepicker({maxDate : new Date(endDate)});
//         })},1000);
        
    }
    init();

    $scope.sort = function (keyname) {
        $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false;
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.currentPage = 1;
        getClaimReports();
    }

    $scope.getClaimReportsFromFilter = getClaimReportsFromFilter;
    function getClaimReportsFromFilter() {
        $scope.currentPage = 1;
        getClaimReports();
    }

    $scope.getClaimReports = getClaimReports;
    function getClaimReports() {
        $(".page-spinner-bar").removeClass("hide");
        //$scope.selectedPolicies = [];
        // $scope.selectedBranchs = [];
        // if ($scope.policyTypes) {
        //     var p = null;
        //     angular.forEach($scope.policyTypes, function (item) {
        //         angular.forEach($scope.policyTypesList, function (x) {
        //             if (x.id === Number(item)) {
        //                 p = x;
        //             }
        //         });
        //         if (p)
        //             $scope.selectedPolicies.push(p.typeName);
        //     });
        // }
        var param = {
            "fromDate": $filter('DatabaseDateFormatMMddyyyy')($scope.fromDate),
            "toDate": $filter('DatabaseDateFormatMMddyyyy')($scope.toDate),
            "pagination": {
                "pageNumber": $scope.currentPage,
                "limit": $scope.pagesize,
                "sortBy": $scope.sortKey,
                "orderBy": $scope.reverse ? "desc" : "asc",
            },
            "searchKeyword": $scope.searchKeyword,
            "salvageStatus": $scope.salvageStatus,
            "statusIds": $scope.statusIds,
            "adjusterIds": $scope.adjusterIds,
            "assignedUserId": $scope.role === "ADJUSTER" ? $scope.UserDetails.UserId : null,
            "policyTypes": $scope.selectedPolicies,
            "claimServiceTypes": $scope.claimTypes,
            "branchIds": $scope.branchesIds,
        }
        //set Report filters n session
        const claimRpt = new Map();
        claimRpt.set("dateFrom", $scope.fromDate);
        claimRpt.set("dateTo", $scope.toDate);
        claimRpt.set("status", $scope.statusIds);
        claimRpt.set("searchKeyword",$scope.searchKeyword);
        claimRpt.set("adjusterIds", $scope.adjusterIds);  
        claimRpt.set("policyTypes",$scope.selectedPolicies); 
        claimRpt.set("branchIds",$scope.branchesIds);
        CommonUtils.setReportFilters(CommonConstants.filters.CLAIM_RPT, JSON.stringify(Object.fromEntries(claimRpt)));

        var getSalvageList = ClaimReportsService.getClaimList(param);
        getSalvageList.then(function (success) {
            $(".page-spinner-bar").removeClass("hide");
            var resultList = success.data.data ? success.data.data.claims : null;
            $scope.totalSize = success.data.data ? success.data.data.totalClaims : 0;
            if (resultList != null && resultList.length > 0) {
                if ($scope.currentPage == 1) {
                    $scope.toShowingPage = resultList.length;
                } else {
                    $scope.toShowingPage = resultList.length + ($scope.PageLength * ($scope.currentPage - 1))
                }
            }
            $scope.claimList = resultList;
            // var currentListLength = ($scope.currentPage - 1) * $scope.PageLength;
            // if (currentListLength != $scope.claimList.length) {
            //     $scope.claimList = new Array(currentListLength).fill(new Object());
            // }
            // angular.forEach(resultList, function (item) {
            //     $scope.claimList.push(item);
            // });
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
        //$(".page-spinner-bar").addClass("hide");
    }

    $scope.pageChanged = pageChanged;
    function pageChanged(pageNum) {
        // if (pageNum == 1) {
        //     startPose = 0;
        //     $scope.policyList = [];
        // } else {
        //     startPose = maxPose * (pageNum - 1);
        // }
        // $scope.currentPage = pageNum;

        // // get policy reports
        // getClaimReports();
        $scope.currentPage = pageNum;
        // get policy reports
        getClaimReports();
    }
    $scope.getStatusList = getStatusList;
    function getStatusList() {
        var StatusList = ClaimReportsService.getStatusList();
        StatusList.then(function (success) {
            $scope.statusList = success.data.data;
            $scope.statusArr = [...$scope.statusList];
            utilityMethods.multiSelectDropdown('statusDropdownDiv', 'statusMultiSelect', 'statusSelectAll', "status", "id", $scope.statusList);
            //$(".page-spinner-bar").addClass("hide");
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
    }

    $scope.getPolicyTypesList = getPolicyTypesList;
    function getPolicyTypesList() {
        var PolicyTypes = ClaimReportsService.getPolicyTypesList();
        PolicyTypes.then(function (success) {
            var uniq = {};
            $scope.policyTypesList = success.data.data.filter(obj => !uniq[obj.typeName] && (uniq[obj.typeName] = true));
            $scope.policyTypeArr = [...$scope.policyTypesList];
            utilityMethods.multiSelectDropdown('policyTypesDropdownDiv', 'policyTypesMultiSelect', 'policyTypesSelectAll', "typeName", "id", $scope.policyTypesList);
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


    }


    // adjusters
    $scope.getAdjustersList = getAdjustersList;
    function getAdjustersList() {
        var param = {
            "companyId": sessionStorage.getItem("CompanyId")
        };
        var Adjusters = ClaimReportsService.getAdjustersList(param);
        Adjusters.then(function (success) {
            $scope.adjusters = success.data.data;
            $scope.AdjusterArr = [...$scope.adjusters];
              angular.forEach($scope.AdjusterArr, function(adjuster){
                adjuster.adjusterFullName = adjuster.firstName + " " + adjuster.lastName;
            })
            utilityMethods.multiSelectDropdown('adjustersDropdownDiv', 'adjustersMultiSelect', 'adjustersSelectAll', "firstName", "userId", $scope.adjusters);
            //$(".page-spinner-bar").addClass("hide");
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


    }

    $scope.getBranchList = getBranchList;
    function getBranchList() {
        var param = {
            "id": sessionStorage.getItem("CompanyId")
        };
        var branchs = ClaimReportsService.getCompanyBranchList(param);
        branchs.then(function (success) {
            $scope.branchs = success.data.data.companyBranches;
            $scope.branchArr= [...$scope.branchs];
            utilityMethods.multiSelectDropdown('branchsDropdownDiv', 'branchsMultiSelect', 'branchsSelectAll', "branchName", "id", $scope.branchs);
            //$(".page-spinner-bar").addClass("hide");
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
     }
          
    // /content/services claimtypes
    $scope.getClaimTypesList = getClaimTypesList;
    function getClaimTypesList() {
        var ClaimTypesList = ClaimReportsService.getClaimTypesList();
        ClaimTypesList.then(function (success) {
            $scope.claimTypesList = success.data.data;
            utilityMethods.multiSelectDropdown('claimTypesDropdownDiv', 'claimTypesMultiSelect', 'claimTypesSelectAll', "service", "id", $scope.claimTypesList);
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


    }

    $scope.expand = false;
    $scope.assignmentExpand = [];
    $scope.expanddiv = expanddiv;
    function expanddiv(index, event) {
        if ($scope.assignmentExpand[index] && angular.isDefined($scope.assignmentExpand[index].expand))
            $scope.assignmentExpand[index].expand = (event === "toggle") ? !$scope.assignmentExpand[index].expand : $scope.assignmentExpand[index].expand;
        else {
            $scope.assignmentExpand[index] = {};
            $scope.assignmentExpand[index].expand = true;
            $scope.expand = !$scope.expand;
        }
    }

    //exportAsExcel
    $scope.exportAsExcel = exportAsExcel;
    function exportAsExcel() {
        var obj={
            "labels":{0:"Claim #",1:"Created Date", 2:"Status",3:"Policy Limits $", 4:"Policy Type", 5:"Policyholder", 6:"Adjuster", 7:"Assignment #",8:"Service", 9:"# of Items",
            10:"Quote Date", 11:"Material Cost $", 12:"Taxes $", 13:"Labor Cost $", 14:"Shipping Cost $", 15:"Quote Price (w. taxes) $", 16:"Item Replaced",
            17:"Total Replacement Cost $",18:"Vendor Invoice $", 19:"Indemnity Opportunity $", 20:"Indemnity %", 21:"Close Date"}
        }
        $scope.animationsEnabled = true;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/ClaimReports/ExportsPopUp.html",
                controller: "ExportsPopUpController",
                backdrop: 'static',
                keyboard: false,
                resolve:
                {
                    labelObj: function () {
                        return obj;
                    }
                }
            });
            out.result.then(function (value) {
                if (value) {
                    var colList = value;
                    $(".page-spinner-bar").removeClass("hide");
                    if($scope.role === "ADJUSTER" )
                    {
                        $scope.adjusterIds=[];
                        $scope.adjusterIds.push($scope.UserDetails.UserId);
                    }
                    var param = {
                        "reportStartDate": $filter('DatabaseDateFormatMMddyyyy')($scope.fromDate),
                        "reportEndDate": $filter('DatabaseDateFormatMMddyyyy')($scope.toDate),
                        "sortBy": $scope.sortKey,
                        "orderBy": $scope.reverse ? 1 : 0,
                        "keyword": $scope.searchKeyword,
                        "salvageStatus": $scope.statusIds,
                        "pageNumber": $scope.currentPage,
                        "recordsPerPage": $scope.PageLength,
                        "reportType": "claim",
                        "adjusterIds": ($scope.adjusterIds != null ? $scope.adjusterIds :null),
                       // "adjusterIds": ( $scope.role != "CLAIM SUPERVISOR" ) ?($scope.adjusterIds ? $scope.adjusterIds : $scope.userIds )  : null,
                        "supervisorId": ( $scope.role == "CLAIM SUPERVISOR" ) ? $scope.UserDetails.UserId : null,
                        "columnList":colList
                    }
                    var getSalvageListExportFile = SalvageReportsService.exportSalvageReport(param);
                    getSalvageListExportFile.then(function (success) {
                        $scope.result = success.data.salvageReports;
                        if ($scope.result) {
                            $scope.downloadFile($scope.result.downloadURL);
                        }
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
                }
            }, function (res) {
            });
            return {
                open: open
            };
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

    $scope.resetFilter = resetFilter;
    function resetFilter() {
        $scope.salvageStatus = [];
        $scope.adjusterIds = [];
        $scope.claimTypes = [];
        $scope.claimOffice = [];
        $scope.policyTypes = [];
        $scope.branchesIds = [];
        $scope.searchKeyword = "";
        $scope.currentPage = 1;
        clearAllStatus();
        clearAllPolicy();
        clearAllBranch();
        var currentTime = new Date()
        var year = currentTime.getFullYear();
        $scope.fromDate = "01/01/" + year;
        var d = $filter("TodaysDate")();
        $scope.toDate = d;
        $scope.ownerRetained = "0";
        $("#fromDate").datepicker({autoclose: true}).datepicker('update', $scope.fromDate);
        $("#toDate").datepicker({autoclose: true}).datepicker('update', $scope.toDate);

        document.getElementById('select-All').checked = false;
        utilityMethods.clearMultiSelectDropdownValues('statusMultiSelect', 'statusSelectAll');
        utilityMethods.clearMultiSelectDropdownValues('policyTypesMultiSelect', 'policyTypesSelectAll');
        utilityMethods.clearMultiSelectDropdownValues('adjustersMultiSelect', 'adjustersSelectAll');
        utilityMethods.clearMultiSelectDropdownValues('claimTypesMultiSelect', 'claimTypesSelectAll');
        // utilityMethods.clearMultiSelectDropdownValues('claimOfficeMultiSelect', 'claimOfficeSelectAll');
        utilityMethods.clearMultiSelectDropdownValues('branchsMultiSelect','branchsSelectAll');
        getClaimReports();
        clearAllAdjuster();
       
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
        $scope.statusArr = utility.search($scope.statusList,"status",$scope.statusSearch,$scope.statusIds,"select-All");
    }

    $scope.handleStatusChange = handleStatusChange
    function handleStatusChange(event)
    {
        var id ="check"+event.target.value;
        $scope.statusIds = utility.handleChange(event,$scope.statusIds,id,$scope.statusArr,"select-All");
    }

    $scope.handleStatusSelectAll = handleStatusSelectAll
    function handleStatusSelectAll(event)
    {
      $scope.statusIds = utility.handleSelectAll(event,$scope.statusArr,$scope.statusIds,"id","check");
    }

    $scope.findStatus = findStatus;
    function findStatus(id)
    {
        return utility.find(id,$scope.statusList,"id","status")
    }

   $scope.clearStatus = clearStatus
   function clearStatus(id)
    {
        var ele_id = "check"+id;
        $scope.statusIds = utility.clear(id,$scope.statusIds,ele_id,$scope.statusArr,"select-All");
    }

    $scope.clearAllStatus = clearAllStatus
   function clearAllStatus()
    {
        $scope.statusIds = utility.clearAll($scope.statusArr,$scope.statusIds,"id","check","select-All");
        $scope.statusAll = false;
    }

    $scope.checkValues = checkValues
    function checkValues(id)
    {
        return utility.checkValues(id,$scope.statusIds);
    }
    $scope.closeorOpenPolicyDropDown = closeorOpenPolicyDropDown;
    function closeorOpenPolicyDropDown(){
        $scope.policyDisp = !$scope.policyDisp;
        console.log($scope.policyDisp);
    }

    $scope.closePolicyDropDown = closePolicyDropDown;
    function closePolicyDropDown(){
        $scope.policyDisp = false;
    }

    $scope.openPolicyDropDown = openPolicyDropDown;
    function openPolicyDropDown(){
        $scope.policyDisp = true;
    }


  
    $scope.searchPolicy= searchPolicy;
    function searchPolicy()
    {
        $scope.policyTypeArr = utility.search($scope.policyTypesList,"typeName",$scope.policySearch, $scope.selectedPolicies,"select-All-Policy");
    }
 
    $scope.handlePolicySelectAll = handlePolicySelectAll
    function handlePolicySelectAll(event)
    {
        $scope.selectedPolicies = utility.handleSelectAll(event,$scope.policyTypeArr,$scope.selectedPolicies,"id","checkPolicy");
    }

    $scope.checkPolicyValues = checkPolicyValues
    function checkPolicyValues(id)
    {
        return utility.checkValues(id, $scope.selectedPolicies);
    }

    $scope.handlePolicyChange = handlePolicyChange
    function handlePolicyChange(event)
    {
        var id ="checkPolicy"+event.target.value;
        $scope.selectedPolicies = utility.handleChange(event, $scope.selectedPolicies,id,$scope.policyTypeArr,"select-All-Policy");
    }

    $scope.clearPolicy = clearPolicy
   function clearPolicy(id)
    {
        var ele_id = "checkPolicy"+id;
        $scope.selectedPolicies = utility.clear(id,$scope.selectedPolicies,ele_id,$scope.policyTypeArr,"select-All-Policy");
    }
   
    $scope.findPolicy= findPolicy;
    function findPolicy(id)
    {
        return utility.find(id,$scope.policyTypesList,"id","typeName")
    }


    $scope.clearAllPolicy = clearAllPolicy
   function clearAllPolicy()
    {
        $scope.selectedPolicies = utility.clearAll($scope.policyTypeArr,$scope.selectedPolicies,"id","checkPolicy","select-All-Policy");
        $scope.policyAll=false;
    }

        //adjuster dropdown
        $scope.closeorOpenDropDownAdjuster = closeorOpenDropDownAdjuster;
            function closeorOpenDropDownAdjuster(){
                $scope.Adjusterdisp = !$scope.Adjusterdisp;
            }
        
            $scope.closeDropDownAdjuster = closeDropDownAdjuster;
            function closeDropDownAdjuster(){
                $scope.Adjusterdisp = false;
            }
        
            $scope.openDropDownAdjuster = openDropDownAdjuster;
            function openDropDownAdjuster(){
                $scope.Adjusterdisp = true;
            }
        
            $scope.searchAdjuster = searchAdjuster;
            function searchAdjuster()
            {
                $scope.AdjusterArr = utility.search($scope.adjusters,"firstName",$scope.AdjusterSearch,$scope.adjusterIds,"select-All-Adjuster");
            }
        
            $scope.handleAdjusterChange = handleAdjusterChange
            function handleAdjusterChange(event)
            {
                var id ="checkAdjuster"+event.target.value;
                $scope.adjusterIds = utility.handleChange(event,$scope.adjusterIds,id,$scope.AdjusterArr,"select-All-Adjuster");
            }
        
            $scope.handleAdjusterSelectAll = handleAdjusterSelectAll
            function handleAdjusterSelectAll(event)
            {
              $scope.adjusterIds = utility.handleSelectAll(event,$scope.AdjusterArr,$scope.adjusterIds,"userId","checkAdjuster");
            }
        
            $scope.findAdjuster = findAdjuster;
            function findAdjuster(id)
            {console.log("adjuster" ,$scope.adjusters);
                return utility.find(id,$scope.adjusters,"userId","firstName")
            }
        
           $scope.clearAdjuster = clearAdjuster
           function clearAdjuster(id)
            {
                var ele_id = "checkAdjuster"+id;
                $scope.adjusterIds = utility.clear(id,$scope.adjusterIds,ele_id,$scope.AdjusterArr,"select-All-Adjuster");
            }
        
            $scope.clearAllAdjuster = clearAllAdjuster
           function clearAllAdjuster()
            {
                $scope.adjusterIds = utility.clearAll($scope.AdjusterArr,$scope.adjusterIds,"userId","checkAdjuster","select-All-Adjuster");
                $scope.AllAdjuster=false; 
            }
        
            $scope.checkAdjusterValues = checkAdjusterValues
            function checkAdjusterValues(id)
            {
                return utility.checkValues(id,$scope.adjusterIds);
            }

            //branch dropdown
            $scope.closeorOpenDropDownBranch = closeorOpenDropDownBranch;
            function closeorOpenDropDownBranch(){
                $scope.Branchdisp = !$scope.Branchdisp;
                console.log($scope.disp);
            }
        
            $scope.closeDropDownBranch = closeDropDownBranch;
            function closeDropDownBranch(){
                $scope.Branchdisp = false;
            }
        
            $scope.openDropDownBranch = openDropDownBranch;
            function openDropDownBranch(){
                $scope.Branchdisp = true;
            }
        
            $scope.searchBranch = searchBranch;
            function searchBranch()
            {
                $scope.branchArr = utility.search($scope.branchs,"branchName",$scope.branchSearch,$scope.branchesIds,"select-All-Branch");
            }
        
            $scope.handleChangeBranch = handleChangeBranch
            function handleChangeBranch(event)
            {
                var id ="checkBranch"+event.target.value;
                $scope.branchesIds = utility.handleChange(event,$scope.branchesIds,id,$scope.branchArr,"select-All-Branch");
            }
        
            $scope.handleSelectAllBranch = handleSelectAllBranch
            function handleSelectAllBranch(event)
            {
              $scope.branchesIds = utility.handleSelectAll(event,$scope.branchArr,$scope.branchesIds,"id","checkBranch");
            }
        
            $scope.findBranch = findBranch;
            function findBranch(id)
            {
                return utility.find(id,$scope.branchs,"id","branchName")
            }
        
           $scope.clearBranch = clearBranch
           function clearBranch(id)
            {
                var ele_id = "checkBranch"+id;
                $scope.branchesIds = utility.clear(id,$scope.branchesIds,ele_id,$scope.branchArr,"select-All-Branch");
            }
        
            $scope.clearAllBranch = clearAllBranch
           function clearAllBranch()
            {
                $scope.branchesIds = utility.clearAll($scope.branchArr,$scope.branchesIds,"id","checkBranch","select-All-Branch");
                $scope.BranchDispAll=false;
            }
        
            $scope.checkValuesBranch = checkValuesBranch
            function checkValuesBranch(id)
            {
                return utility.checkValues(id,$scope.branchesIds);
            }     

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
});