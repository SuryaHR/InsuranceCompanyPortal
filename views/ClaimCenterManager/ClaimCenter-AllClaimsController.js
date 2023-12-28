angular.module('MetronicApp').controller('ClaimCenter-AllClaimsController', function ($rootScope, $translate, ClaimCenterMyClaimdService, $translatePartialLoader, $uibModal, $scope,
    settings, $location, AssignClaimForManagerService, $filter) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('ClaimCenter-AllClaims');
    $translate.refresh();
    $scope.PageLength = $rootScope.settings.pagesize;
    $scope.ErrorMessageMessage = "";
    $scope.FilteredMyClaims = [];
    $scope.ClaimFilter = "ALL";
    
    $scope.MyClaims = null;
    $scope.init = function () {
        var UserId = sessionStorage.getItem("UserId"); //get UserId  API-#72 (have to use by sameer)
        var param = {
            //"assignedUserId": UserId
            "branchId":sessionStorage.getItem("CompanyId")
           
        };
        var response = ClaimCenterMyClaimdService.getMyClaimList(param); //calling method from service to get data
        response.then(function (success) {
            $scope.FilteredMyClaims = success.data.data;
            $scope.MyClaims = success.data.data; 
        }, function (error) {
            $scope.MyClaims = null;
            $scope.ErrorMessage = error.data.errorMessage;
        });
    };
    $scope.init();

    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

    //Filter Home / Auto claim
    $scope.FilterList = FilterList;
    function FilterList() {
        if (($scope.ClaimFilter === "ALL") || (angular.isUndefined($scope.ClaimFilter) || $scope.ClaimFilter === null))
            $scope.FilteredMyClaims = $scope.MyClaims;
        else {
            $scope.FilteredMyClaims = $filter('filter')($scope.MyClaims, { claimType: $scope.ClaimFilter });
        }
    }

    $scope.AssignClaimToAdjuster = AssignClaimToAdjuster;
    function AssignClaimToAdjuster(obj, rowindex) {
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
                        $scope.FilteredMyClaims.splice(rowindex, 1);
                        //$scope.FilteredFnolList[rowindex].status.status = "ASSIGNED";
                        $scope.MyClaims.splice($scope.MyClaims.indexOf(obj), 1);
                        //$scope.FnolList[$scope.FnolList.indexOf(obj)].status.status = "ASSIGNED";
                }
            }, function (res) {
                //Call Back Function close
            });
            return {
                open: open
            };
        }, function (errorPl) {
            //Error Message           
            $scope.ErrorMessageMessage = errorPl.data.errorMessage;
        });
    }

    $scope.RejectClaim = RejectClaim;
    function RejectClaim(item, rowindex) {

        $scope.animationsEnabled = true;
        var paramClaimId = {
            "claimNumber": item.claimNumber,
            "isApproved": false,
            "IsApprove": false,
            "IsReject": true
        }
        var out = $uibModal.open({
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
                $scope.FilteredMyClaims.splice(rowindex, 1);
                //$scope.FilteredFnolList[rowindex].status.status = "ASSIGNED";
                $scope.MyClaims.splice($scope.MyClaims.indexOf(item), 1);
                //$scope.FnolList[$scope.FnolList.indexOf(obj)].status.status = "ASSIGNED";
            }
        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };

    }

    $scope.GoTOClaimDetails = GoTOClaimDetails;
    function GoTOClaimDetails(e, item) {
        sessionStorage.setItem("ManagerScreenClaimId", item.claimId);
        sessionStorage.setItem("ManagerScreenpolicyNo", item.policyNumber);
        sessionStorage.setItem("ManagerScreenClaimNo", item.claimNumber);
        $location.url('ClaimCenter-ClaimDetails');
    };

    $scope.UploadClaimFromExcel = UploadClaimFromExcel;
    function UploadClaimFromExcel()
    {
        $location.url('UploadClaimFromCSV');
    }
});