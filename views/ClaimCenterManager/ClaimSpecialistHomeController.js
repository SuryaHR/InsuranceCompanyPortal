angular.module('MetronicApp').controller('ClaimSpecialistHomeController', function ($rootScope, $translate, $translatePartialLoader, $scope, settings, $location, ClaimSpecialistHomeService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('ClaimSpecialistHome');
    $translate.refresh();   
    $scope.PageLength = $rootScope.settings.pagesize;
    $scope.ErrorMessage = "";
    $scope.CategoryList = [];
    $scope.PricingSpecialistList=[];
    function init()
    {   //Get pricing specialists list for company
        var ComapanyId = {
            "companyId":  sessionStorage.getItem("CompanyId")
        };
        var getPricingSpecialistlist= ClaimSpecialistHomeService.GetPricingSpecialistsList(ComapanyId);
        getPricingSpecialistlist.then(function (success) {
            $scope.PricingSpecialistList = success.data.data;
        }, function (error) {  $scope.ErrorMessage = error.data.errorMessage });
        var categoryPromise = ClaimSpecialistHomeService.GetCategoryList();
        categoryPromise.then(function (success) { $scope.CategoryList = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage });
    }
   
   init();

    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }
    $scope.NewSpecialists = NewSpecialists;
    function NewSpecialists(e, item) {       
        $location.url('SearchClaimSpecialists');
    }
    $scope.EditSpecialists = EditSpecialists;
    function EditSpecialists(e, item) {
        //Add specialistId in session and access it on new specilists if null the new 
        sessionStorage.setItem("ClaimSpecialistsId", item);
        $location.url('EditClaimSpecialists');
    };
    $scope.back = function ()
    {
        $location.url(sessionStorage.getItem('HomeScreen'));
    }
});