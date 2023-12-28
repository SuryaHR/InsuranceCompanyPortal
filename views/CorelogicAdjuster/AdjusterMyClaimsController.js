
angular.module('MetronicApp').controller('AdjusterMyClaimsController', function ($rootScope, $scope, settings, $http, $timeout, $location, $uibModal,
    $translate, $translatePartialLoader, AdjusterMyClaimsService, AssignClaimForManagerService) {

    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });

    //set language
    $translatePartialLoader.addPart('AdjusterMyClaims');
    $translate.refresh();
    $scope.pagesize = "10";
    var cred = "username=" + "demo@artigem.com" + "&password=" + "demo";
    $scope.MyClaims = null;
    //get all claims
    $scope.init = function () {
        var param = {
            "assignedUserId": 252
        };
        var response = AdjusterMyClaimsService.getAllClaims(param); //calling method from service to get data
        response.then(function (response) { $scope.MyClaims = response.data.data; }, function (error) {
            $scope.error = error.data.errorMessage;
        });
    };
    //assing claims
    $scope.AssignClaimToAdjuster = AssignClaimToAdjuster;
    function AssignClaimToAdjuster(obj) {
        $scope.animationsEnabled = true;
        var paramCompanyId = 265;

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
                            return obj;
                        },
                        AdjusterList: function () {
                            return $scope.AdjusterList;
                        }
                    }

                });
            out.result.then(function (value) {
                //Call Back Function success
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

    $scope.init();
    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }
    $scope.getAllCheck = getAllCheck;
    function getAllCheck() {
        var toggleStatus = $scope.isAllSelected;
        angular.forEach($scope.data, function (itm) { itm.IsSelected = toggleStatus; });
    }

    $scope.optionToggled = function () {
        $scope.isAllSelected = $scope.data.every(function (itm) { return itm.IsSelected; })
    }
    $scope.GotoClaimDetails = GotoClaimDetails;
    function GotoClaimDetails() {
        $location.url('AdjusterPropertyClaimDetails');
    }
    $scope.AssignClaims = AssignClaims;
    function AssignClaims() {

        $scope.animationsEnabled = true;
        $scope.items = "Testing Pas Value";
        var vm = this;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/ClaimCenterManager/AssignClaimForManager.html",
                controller: "AssignClaimForManagerController",

                resolve:
                {
                    /**
                     * @return {?}
                     */

                    items: function () {
                        $rootScope.items = "Root";
                        return "Testing Pas Value";
                    }
                }

            });
        out.result.then(function (value) {

            //Call Back Function success
        }, function () {

        });
        return {
            open: open
        };
    }


});