angular.module('MetronicApp').controller('ClaimTimesController', function ($rootScope, $scope,
    settings, $location, $translate, $translatePartialLoader, ClaimTimesService) {
    $translatePartialLoader.addPart('BusinessRules');
    $translate.refresh();
    function init() {
        getClaimTimes();
    };init();

    $scope.getClaimTimes = getClaimTimes;
    function getClaimTimes() {
        var claimTimesCall = ClaimTimesService.getClaimTimes();
        claimTimesCall.then(function (success) {
            $scope.claimTimes = success.data.data;
           
        }, function (error) {
            if (angular.isDefined(error.data.errorMessag)) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            }
            else {
                if (error.status === 500 || error.status === 404) {
                    toastr.remove();
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                }
            }
        });
    }
    $scope.saveClaimTimes = saveClaimTimes;
    function saveClaimTimes(claimTimes) {
        var param = {
            "daysFor50itemsOrLess":$scope.claimTimes.daysFor50itemsOrLess,
            "daysFor200itemsOrLess":$scope.claimTimes.daysFor200itemsOrLess ,
            "daysFor200itemsOrMore": $scope.claimTimes.daysFor200itemsOrMore
        };
        var saveClaimTimesCall = ClaimTimesService.saveClaimTimes(param);
        saveClaimTimesCall.then(function (success) {
            $scope.claimTimes = success.data.data;
            toastr.remove();
            toastr.success("Claim Times saved successfully", "Success");
        }, function (error) {
            if (angular.isDefined(error.data.errorMessag)) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            }
            else {
                if (error.status === 500 || error.status === 404) {
                    toastr.remove();
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                }
            }
        });
    }

});