angular.module('MetronicApp').controller('SalvageReportsController', function ($rootScope, $filter, $http, $scope, $location, $translate, $translatePartialLoader, AuthHeaderService,
    AdjusterDashboardService, SalvageReportsService, utilityMethods,utility,CommonUtils, CommonConstants) {

    $translatePartialLoader.addPart('SalvageReports');
    $translate.refresh();

    $scope.pagesize = $rootScope.settings.pagesize; // 20
    $scope.PageLength = 20;
    $scope.currentPage = 1;
    $scope.keyword = "";
    $scope.totalSize = 0;

    $scope.toShowingPage = 20;
    $scope.salvageList = [];
    $scope.serverAddress = "";
    $scope.ownerRetained = "0";
    $scope.salvageStatus = [];
    $scope.disp = false;
    $scope.statusAll = false;
    $scope.statusSearch ='';
    $scope.filterReports = sessionStorage.getItem('filterReports') && sessionStorage.getItem('filterReports')!=null ? new Map(Object.entries(JSON.parse(sessionStorage.getItem('filterReports')))) : null;
    function init() {
       
        var date = new Date(), year = date.getFullYear(), month = date.getMonth();
        // $scope.fromDate = $filter('DateFormatMMddyyyy')(($filter('DatabaseDateFormatMMddyyyyTime'))(new Date(year, month, 1)));
        // $scope.toDate = $filter('DateFormatMMddyyyy')($filter('DatabaseDateFormatMMddyyyyTime')(new Date()));
        var currentTime = new Date()
        var year = currentTime.getFullYear();
        $scope.fromDate = "01/01/"+year;
        var d = $filter("TodaysDate")();
        $scope.toDate = d;

        var GetGlobaldata = $http.get('Config/Configuration.json');
        GetGlobaldata.then(function (success) {
            ConfigSettings = success.data.data;
            $scope.serverAddress = ConfigSettings.serverAddress;
        });
        // Update existing report saved filters
        if($scope.filterReports && $scope.filterReports.get(CommonConstants.filters.SALVAGE_RPT)){
            let salvageRpt = new Map(Object.entries(JSON.parse($scope.filterReports.get(CommonConstants.filters.SALVAGE_RPT))));
            console.log("salvage report", salvageRpt);
            if(salvageRpt){                    
                $scope.fromDate = salvageRpt.get("dateFrom");
                $scope.toDate = salvageRpt.get("dateTo");
                $scope.salvageStatus = angular.isDefined(salvageRpt.get("salvageStatus"))? salvageRpt.get("salvageStatus"): [];
                $scope.ownerRetained = angular.isDefined(salvageRpt.get("ownerRetained"))? salvageRpt.get("ownerRetained"): [];
            }
    }
    getStatusList();
    searchByDate(); 
    }
    init();

    $scope.sort = function (keyname) {
        $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false;
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.currentPage = 1;
        searchByDate();
    }

    $scope.searchByDate = searchByDate;
    function searchByDate() {
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "reportStartDate": $scope.fromDate,
            "reportEndDate": $scope.toDate,
            "sortBy": $scope.sortKey,
            "orderBy": $scope.reverse ? 1 : 0,
            "keyword": $scope.keyword,
            "salvageStatus": $scope.salvageStatus,
            "ownerRetained": $scope.ownerRetained

        }
       //set Report filters n session
       const salvageRpt = new Map();
       salvageRpt.set("dateFrom", $scope.fromDate);
       salvageRpt.set("dateTo", $scope.toDate);
       salvageRpt.set("salvageStatus", $scope.salvageStatus);
       salvageRpt.set("ownerRetained",$scope.ownerRetained);
       CommonUtils.setReportFilters(CommonConstants.filters.SALVAGE_RPT, JSON.stringify(Object.fromEntries(salvageRpt)));

        var getSalvageList = SalvageReportsService.getSalvageList(param, $scope.currentPage, $scope.pagesize);
        getSalvageList.then(function (success) {
            // console.log(success.data);

            //     $scope.resultList = success.data.data;
            //     $scope.totalSize = ($scope.resultList && $scope.resultList[0]) ? $scope.resultList[0].totalSize : 0;

            //     //console.log($scope.totalSize);

            //    if ($scope.currentPage == 1) {
            //             $scope.toShowingPage = $scope.salvageList.length;
            //         } else {
            //             $scope.toShowingPage = $scope.salvageList.length + ($scope.pagesize * ($scope.currentPage - 1))
            //         }

            //     angular.forEach($scope.resultList, function (item) {
            //         $scope.salvageList.push(item);
            //     });


            var resultList = success.data.data && success.data.data ? success.data.data : null;
            $scope.totalSize = (resultList && resultList[0]) ? resultList[0].totalSize : 0;
            if (resultList != null && resultList.length > 0) {
                if ($scope.currentPage == 1) {
                    $scope.toShowingPage = resultList.length;
                } else {
                    $scope.toShowingPage = resultList.length + ($scope.PageLength * ($scope.currentPage - 1))
                }
            }
            $scope.salvageList = resultList;

            // var currentListLength = ($scope.currentPage - 1) * $scope.PageLength;
            // if (currentListLength != $scope.salvageList.length) {
            //     $scope.salvageList = new Array(currentListLength).fill(new Object());
            // }
            // angular.forEach(resultList, function (item) {
            //     $scope.salvageList.push(item);
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
        // searchByDate();
        $scope.currentPage = pageNum;

        // get policy reports
        searchByDate();
    }
    $scope.getStatusList = getStatusList;
    function getStatusList() {

        var StatusList = SalvageReportsService.getStatusList();
        StatusList.then(function (success) {
            //console.log(success.data);

            $scope.statusList = success.data.data;
            $scope.statusArr = [...$scope.statusList];
            utilityMethods.multiSelectDropdown('statusDropdownDiv', 'statusMultiSelect', 'statusSelectAll', "status", "id", $scope.statusList);
            // toastr.remove();
            // toastr.success("success", "Success")

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


    //exportAsExcel
    $scope.exportAsExcel = exportAsExcel;
    function exportAsExcel() {
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "reportStartDate": $scope.fromDate,
            "reportEndDate": $scope.toDate,
            "sortBy": $scope.sortKey,
            "orderBy": $scope.reverse ? 1 : 0,
            "keyword": $scope.keyword,
            "salvageStatus": $scope.salvageStatus,
            "ownerRetained": $scope.ownerRetained
        }

        var getSalvageListExportFile = SalvageReportsService.exportSalvageReport(param);
        getSalvageListExportFile.then(function (success) {
            $scope.result = success.data.salvageReports;
            if ($scope.result) {
                $scope.downloadFile($scope.result.downloadURL);
            }
            //    salvageList
            //toastr.remove();
            //toastr.success("success","Success")

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
        $scope.currentPage = 1;
        $scope.keyword = "";
        var currentTime = new Date()
            var year = currentTime.getFullYear();
        $scope.fromDate = "01/01/"+year;
        var d = $filter("TodaysDate")();
        $scope.toDate = d;
        $scope.ownerRetained = "0";
        clearAllStatus();
        utilityMethods.clearMultiSelectDropdownValues('statusMultiSelect', 'statusSelectAll');
        searchByDate();
        // 'statusDropdownDiv', 'statusMultiSelect', 'statusSelectAll',
        // utilityMethods.multiSelectDropdown('statusDropdownDiv', 'statusMultiSelect', 'statusSelectAll', "status","id", $scope.salvageStatus);

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
                $scope.salvageStatus = utility.handleChange(event,$scope.salvageStatus,id,$scope.statusArr,"select-All");
            }
        
            $scope.handleStatusSelectAll = handleStatusSelectAll
            function handleStatusSelectAll(event)
            {
              $scope.salvageStatus = utility.handleSelectAll(event,$scope.statusArr,$scope.salvageStatus,"id","check");
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
                $scope.salvageStatus = utility.clear(id,$scope.salvageStatus,ele_id,$scope.statusArr,"select-All");
            }
        
            $scope.clearAllStatus = clearAllStatus
           function clearAllStatus()
            {
                $scope.salvageStatus = utility.clearAll($scope.statusArr,$scope.salvageStatus,"id","check","select-All");
                $scope.statusAll = false;
            }
        
            $scope.checkValues = checkValues
            function checkValues(id)
            {
                return utility.checkValues(id,$scope.salvageStatus);
            }
         
});