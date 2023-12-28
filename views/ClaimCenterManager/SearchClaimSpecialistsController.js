angular.module('MetronicApp').controller('SearchClaimSpecialistsController', function ($rootScope, $translate, $translatePartialLoader, $scope, settings,SearchClaimSpecialistsService, $location) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('SearchClaimSpecialists');
    $translate.refresh();

    $scope.PageLength = $rootScope.settings.pagesize;
    $scope.ErrorMessage = "";
    $scope.ShowSearchResult = false;
    $scope.SearchEmployeetext = "";
    $scope.init = function () {
    };
    $scope.init();

    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

    $scope.GetEmployeeList = GetEmployeeList;
    function GetEmployeeList()
    {
        $scope.ErrorMessage = "";
        if ($scope.SearchEmployeetext !== "" && angular.isDefined($scope.SearchEmployeetext)) {
            $scope.ShowSearchResult = true;
            var param = {
                "searchString": $scope.SearchEmployeetext,
                "companyId": 265//sessionStorage.getItem("CompanyId")
            }; 
            var getEmployee = SearchClaimSpecialistsService.GetEmployeeListForSpecialist(param);
            getEmployee.then(function (success) {
                $scope.serchtext = $scope.SearchEmployeetext;
                if (success.data.data === null)
                    $scope.EmployeeList = [];
                else
                    $scope.EmployeeList = success.data.data;

            }, function (error) {
                $scope.serchtext = ""; toastr.remove();
                toastr.error(error.data.errorMessage, "Error"); $scope.EmployeeList = null;
            })
        }
        else
        {
            $scope.serchtext = "";
            toastr.remove();
            toastr.warning("Enter employee name (Search text) to search.", "Search");
            $scope.ErrorMessage=""
        }
    }

    $scope.NewPricingSpecialist = NewPricingSpecialist;
    function NewPricingSpecialist() {              
        $location.url('NewClaimSpecialist');
    }
    $scope.EditPricingSpecialists = EditPricingSpecialists;
    function EditPricingSpecialists( item) {
        //Add specialistId in session and access it on new specilists if null the new 
        sessionStorage.setItem("ClaimSpecialistsId", item);
        $location.url('EditClaimSpecialists');
    }
    $scope.GoBack = GoBack;
    function GoBack() {
        $location.url('ClaimSpecialistHome');
    }
});