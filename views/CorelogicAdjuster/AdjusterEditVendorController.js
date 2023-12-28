angular.module('MetronicApp').controller('AdjusterEditVendorController', function ($rootScope, $scope, settings, $translate, $translatePartialLoader, $location,AdjusterPropertyClaimDetailsService,
    $uibModal) {

    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
   
   
   
   

    //set language
    $translatePartialLoader.addPart('AdjusterEditThirdPartyVendor');
    $translate.refresh();


    $scope.Categories = [];
    $scope.ExportCategories = [];
    $scope.SelectedCategory = [];

    $scope.ErrorMessage = "";

    function init() {

        var getcategory = AdjusterPropertyClaimDetailsService.getCategories();
        getcategory.then(function (success) {

            $scope.Categories = success.data.data;
            bindexpert();

        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        });


    }

    init();

    $scope.bindexpert = bindexpert;
    function bindexpert() {
        angular.forEach($scope.Categories, function (obj, key) {
            $scope.category = {};
            $scope.category.select = false,
            $scope.category.categoryId = obj.categoryId,
            $scope.category.coverageId = obj.coverageId,
            $scope.category.categoryName = obj.categoryName,
            $scope.category.coverageLimit = obj.coverageLimit,
            $scope.category.categoryLimit = obj.categoryLimit,
            $scope.category.deductable = obj.deductable,
            $scope.category.coverage = obj.coverage,
            $scope.category.description = obj.description,
            $scope.category.subCategories = obj.subCategories
            $scope.category.IsExpert = 0
            $scope.ExportCategories.push($scope.category);
        });
    }

    $scope.AddToExportCategory = function () {
        angular.forEach($scope.ExportCategories, function (obj, key) {

            if (obj.select == true) {
                
                obj.IsExpert = 1;
                obj.select = false;
            }
        });
    }

    $scope.RemoveFromExportCategory = function () {
        angular.forEach($scope.ExportCategories, function (obj, key) {

            if (obj.select == true) {
                
                obj.IsExpert = 0;
                obj.select = false;
            }
        });
    }


    $scope.GoBack=function()
    {
        $location.url('AdjusterThirdPartyVendor');
    }

    //Dynamically adding textboxes

    $scope.ContactDeatils = [];
    $scope.counter = 0;

    $scope.PhoneNumbers = [];
    $scope.phonecounter = 0;
    $scope.AddRow = function (type) {
        if (type == 'contactdetails') {
            $scope.ContactDeatils.push($scope.counter)
            $scope.counter = parseInt($scope.counter) + 1;
        }
        else {
            $scope.PhoneNumbers.push($scope.phonecounter)
            $scope.phonecounter = parseInt($scope.phonecounter) + 1;
        }

    }

    $scope.RemoveRow = function (row, type) {
        if (type == 'contactdetails') {
            $scope.ContactDeatils.splice(row, 1)   //1 -removes item , 0- adds item
        }
        else {
            $scope.PhoneNumbers.splice(row, 1)
        }

    }

    $scope.SaveVendor= function ()
    {

        bootbox.alert({
            size: "",
            title: $translate.instant('AlertBox.SaveTitle'),
            closeButton: false,
            message: $translate.instant('AlertBox.SaveMessage'),
            className: "modalcustom",
            callback: function () { /* your callback code */ }
        });
    }

    $scope.UpdateVendor = function () {

        bootbox.alert({
            size: "",
            title: $translate.instant('AlertBox.UpdateTitle'),
            closeButton: false,
            message: $translate.instant('AlertBox.UpdateMessage'),
            className: "modalcustom",
            callback: function () { /* your callback code */ }
        });
    }
});