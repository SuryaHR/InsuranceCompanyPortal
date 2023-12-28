angular.module('MetronicApp').controller('ClaimCenterMangerDashboardController', function ($translatePartialLoader, $translate, $rootScope, $uibModal, $scope, $location, $filter,
    ClaimCenterDashboardService, AssignClaimForManagerService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('ClaimCenterManagerDashboard');
    $translate.refresh();
    $scope.pagesize = $rootScope.settings.pagesize;
    $scope.FnolList;
    $scope.FilteredFnolList;
    $scope.ClaimFilter = "ALL";
    $scope.ErrorMessage = "";
    //Search
    $scope.Searchpagesize = $rootScope.settings.pagesize;
    $scope.Globalsearch = "";
    $scope.IsSearch = false;
    $scope.ClaimFilterForSearch = "ALL";
    $scope.SearchFnolList;
    $scope.SearchFilteredList;

    function init() {
        //Get fnol list for data table - API # 15
        $(".page-spinner-bar").removeClass("hide");
        var paramFNOLList = {
            //"branchId":sessionStorage.getItem("CompanyId")
            "claimStatus": "CREATED"
        };
        var promisePost = ClaimCenterDashboardService.getFNOLSubmissionList(paramFNOLList);
        promisePost.then(function (success) {
            $scope.FilteredFnolList =  success.data.data  && success.data.data.claims ? success.data.data.claims :"";
            $scope.FnolList =  success.data.data  && success.data.data.claims ? success.data.data.claims :"";
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            //Error Message
            $scope.FilteredFnolList = null;
            $scope.ErrorMessage = error.data.errorMessage;
        });
    }
    init();
    //Filter FNOL list
    $scope.FilterList = FilterList;
    function FilterList() {
        if (($scope.ClaimFilter === "ALL") || (angular.isUndefined($scope.ClaimFilter) || $scope.ClaimFilter === null)) {
            $scope.FilteredFnolList = $scope.FnolList;
        }
        else {
            $scope.FilteredFnolList = $filter('filter')($scope.FnolList, { claimType: $scope.ClaimFilter });
        }
    }

    //Sorting on columns of table
    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

    //Serch Record
    $scope.GetSearchResult = GetSearchResult;
    function GetSearchResult() {
        if ($scope.Globalsearch !== "") {
            $scope.IsSearch = true;
            //call method to get search result
            var param = {
                "searchString": $scope.Globalsearch,
                "companyId": sessionStorage.getItem("CompanyId")
            };
            var result = ClaimCenterDashboardService.GetSearchResult(param);
            result.then(function (success) {
                $scope.GlobalsearchText = $scope.Globalsearch;
                $scope.SearchFilteredList = success.data.data;
                $scope.SearchFnolList = success.data.data;

            }, function (error) {
                $scope.SearchFilteredList = null;
                $scope.SearchFnolList = null;
                $scope.ErrorMessage = error.data.errorMessage;
            });
        }
    }

    //Filter Serch Record
    $scope.FilterSearchList = FilterSearchList;
    function FilterSearchList() {
        if (($scope.ClaimFilterForSearch === "ALL") || (angular.isUndefined($scope.ClaimFilterForSearch) || $scope.ClaimFilterForSearch === null)) {
            $scope.SearchFilteredList = $scope.SearchFnolList;
        }
        else {
            $scope.SearchFilteredList = $filter('filter')($scope.SearchFnolList, { claimType: $scope.ClaimFilterForSearch });
        }
    }
    //datatable Functionality
    $scope.sortSearchGrid = function (keyname) {
        $scope.SerchGridsortKey = keyname;   //set the sortKey to the param passed
        $scope.SearchGridreverse = !$scope.SearchGridreverse; //if true make it false and vice versa
    }

    //Hide Search Results
    $scope.HideSearchResult = HideSearchResult;
    function HideSearchResult()
    {
        $scope.IsSearch = false;
    }
    //Edit Claim Details And New Fnol
    $scope.GotoFnolRequest = GotoFnolRequest;
    function GotoFnolRequest(ev) {
        $location.url('PropertyFNOLRequest');
    }
    $scope.GotoClaimDetails = GotoClaimDetails;
    function GotoClaimDetails(ev,item) {
        sessionStorage.setItem("ManagerScreenClaimId", item.claimId);
        sessionStorage.setItem("ManagerScreenpolicyNo", item.policyNumber);
        sessionStorage.setItem("ManagerScreenClaimNo", item.claimNumber);
        $location.url('ClaimCenter-ClaimDetails');
    }

    //Open popup to assign claim to adjuster
    $scope.AssignClaim = AssignClaim;
    function AssignClaim(obj, rowindex, listname) {
        $scope.animationsEnabled = true;
        var paramCompanyId = {
            "companyId": sessionStorage.getItem("CompanyId")
        };
        var promiseGetAdjuster = AssignClaimForManagerService.GetAdjusterList(paramCompanyId);
        promiseGetAdjuster.then(function (success) {
            $scope.AdjusterList = success.data.data;
            var out = $uibModal.open(
           {
               animation: $scope.animationsEnabled,
               templateUrl: "views/ClaimCenterManager/AssignClaimForManager.html",
               controller: "AssignClaimForManagerController",
               resolve:
               {
                   items: function () {
                       objClaim = obj;
                       return objClaim;
                   },
                   AdjusterList: function () {
                       return $scope.AdjusterList;
                   }
               }

           });
            out.result.then(function (value) {
                //Call Back Function success
                if (value === "Success") {

                    if (listname === "FilteredFnolList") {
                        $scope.FilteredFnolList.splice(rowindex, 1);
                        //$scope.FilteredFnolList[rowindex].status.status = "ASSIGNED";
                        $scope.FnolList.splice($scope.FnolList.indexOf(obj), 1);
                        //$scope.FnolList[$scope.FnolList.indexOf(obj)].status.status = "ASSIGNED";
                    }
                    if (listname === "SearchFilteredList"){
                       // $scope.SearchFilteredList[rowindex].status.status = "ASSIGNED";
                        $scope.SearchFilteredList.splice(rowindex, 1);
                        $scope.SearchFnolList.splice($scope.SearchFnolList.indexOf(obj), 1);
                       // $scope.SearchFnolList[$scope.SearchFnolList.indexOf(obj)].status.status = "ASSIGNED";
                    }
                }
            }, function (res) {
                //Call Back Function close
            });
            return {
                open: open
            };
        }, function (errorPl) {
            //Error Message
            $scope.ErrorMessage = errorPl.data.errorMessage;
        });
    }

    $scope.RejectClaim = RejectClaim;
    function RejectClaim(item, rowindex, listname) {
        $scope.animationsEnabled = true;

        var paramClaimId = {
            "claimNumber": item.claimNumber,
            "isApproved": false,
            "IsApprove": false,
            "IsReject": true
        };

        var out = $uibModal.open(        {
            animation: $scope.animationsEnabled,
            templateUrl: "views/ClaimCenterManager/RejectorApproveClaimPopUp.html",
            controller: "RejectOrApproveClaimController",
            resolve:
            {
                ClaimDetails: function () {
                    return paramClaimId;
                }
            }
        });
        out.result.then(function (value) {
            //Call Back remove item
            if (value === "Success") {
                if (listname === "FilteredFnolList") {
                    $scope.FilteredFnolList.splice(rowindex, 1);
                    // $scope.FilteredFnolList[rowindex].status.status = "REJECTED";
                    $scope.FnolList.splice($scope.FnolList.indexOf(item), 1);
                    //$scope.FnolList[$scope.FnolList.indexOf(obj)].status.status = "REJECTED";
                }
                if (listname === "SearchFilteredList") {
                    $scope.SearchFilteredList.splice(rowindex, 1);
                    //$scope.SearchFilteredList[rowindex].status.status = "REJECTED";
                    $scope.SearchFnolList.splice($scope.SearchFnolList.indexOf(item), 1);
                    //$scope.SearchFnolList[$scope.SearchFnolList.indexOf(obj)].status.status = "REJECTED";
                }
            }
        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };

    }


    //upload excelsheet for claims
    $scope.UploadClaimsFromFile = UploadClaimsFromFile;
    function UploadClaimsFromFile()
    {
        $location.url("UploadClaimFromCSV");
    }
});
