angular.module("MetronicApp")
    .controller("InsuranceAccountManagerMarkupController", function (
        $translate,
        $rootScope,
        $scope,
        $filter,
        $translatePartialLoader, $location,
        InsuranceAccountManagerDashboardService
    ) {

        $scope.companyCrn = sessionStorage.getItem("CRN");
        function init() {
            getSpeedcheckMarkups();
        }
        init();
$scope.originalMarkup = [];
        $scope.getSpeedcheckMarkups = getSpeedcheckMarkups;
        function getSpeedcheckMarkups(){
            $(".page-spinner-bar").removeClass("hide");
            var speedcheckMarkupReport = InsuranceAccountManagerDashboardService.getSpeedcheckMarkups($scope.companyCrn);
            speedcheckMarkupReport.then(
                function (success) {
                   // console.log(success.data.data);
                    $scope.speedcheckMarkupData = success.data.data;
                    $scope.originalMarkup=success.data.data;
                    
                    $(".page-spinner-bar").addClass("hide");
                },
                function (error) {
                    $scope.tableBody = [];
                    $(".page-spinner-bar").addClass("hide");
                    toastr.remove();
                    toastr.error(
                        error.data.errorMessage !== null
                            ? error.data.errorMessage
                            : "Failed to Rapnet price data. Please try again.",
                        "Error"
                    );
                    $scope.ErrorMessage = error.data.errorMessage;
                });
        }
    })