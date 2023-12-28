angular.module('MetronicApp').controller('AddNewLostDamageItemController', function ($scope, $rootScope, $translatePartialLoader, $translate, NewItemDamageLostService) {
    $translatePartialLoader.addPart('AdjusterClaimDetailAddNewLostItem');
    $translate.refresh();
    $scope.cancel = cancel;
    function cancel() {
        $scope.$close("");
    }
    $scope.category;
    $scope.SubCategory;
    $scope.Common = { Category: null };
    init();
    function init() {
        var GetCategory = NewItemDamageLostService.getCategory();
        GetCategory.then(function (success) {
          
            $scope.category = success.data.data;
        }, function (errorPl) {
            $scope.category = null;
        });
    }
    $scope.getSubCategory = getSubCategory;
    function getSubCategory() {
      var param ={
          "categoryId": $scope.Common.Category
        }
      var GetSubCategory = NewItemDamageLostService.GetSubCategory(param);
        GetSubCategory.then(function (success) {           
            $scope.SubCategory = success.data.data;
        }, function (errorPl) {
            $scope.SubCategory = null;
        });
    }
    //Images Of Lost Or Damaged Item
    $scope.IncidentImages = [1, 2];
});