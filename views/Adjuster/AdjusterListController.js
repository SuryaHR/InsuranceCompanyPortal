angular.module('MetronicApp').controller('AdjustorListController', ['$rootScope', '$scope', 'settings', '$translate', '$translatePartialLoader', 'AdjusterListService', function ($rootScope, $scope, settings, $translate, $translatePartialLoader, AdjusterListService) {
    $scope.PageSize = $rootScope.pagesize;
    //set language
    $translatePartialLoader.addPart('AdjusterList');
    $translate.refresh();

    $scope.ErrorMessage = '';
    $scope.AdjusterList='';

    function init()
    {
        //get adjuster list API #94
        var param = {
            "companyId": sessionStorage.getItem("CompanyId")
        };
        var getpromise = AdjusterListService.getAdjusterList(param);
        getpromise.then(function (success) {
            $scope.AdjusterList = success.data.data;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        });

    }

    init();

    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

//Assign claim to adjuster/pricing specialist/vendor API #64
    $scope.AssignClaim = function () {

            var param = {
                "claimId": 27552,
                "assignedUserId": 252,
                "claimStatusId": 2
            }

            var getpromise = AdjusterListService.assignClaim(param);
            getpromise.then(function (success) {

                $scope.status = success.data.status;

                if ($scope.status == 200) {
                    $scope.$close();

                    //bootbox.alert({
                    //    size: "",
                    //    title: "Assign Claim",
                    //    closeButton: false,
                    //    message: success.data.message,
                    //    className: "modalcustom",
                    //    callback: function () { /* your callback code */ }
                    //});
                }
                else {
                    $scope.$close();
                }

            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
            });
        
        
    };
    $scope.cancel = function () {

        $scope.$close();
    };


}]);