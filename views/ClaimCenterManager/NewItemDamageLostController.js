
angular.module('MetronicApp').controller('NewItemDamageLostController', function ($rootScope, ClaimCenterClaimDetailsService, $log, $uibModal, $scope, settings, $http, $timeout, $location,
    NewItemDamageLostService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
   
   
   
   
    $scope.category;
    $scope.SubCategory;
    $scope.Common = { Category: null };
    init();
    function init()
    {
        var GetCategory = NewItemDamageLostService.getCategory();
        GetCategory.then(function (success) {
            $scope.category = success.data.data;
        }, function (errorPl) {          
            $scope.category = null;
        });
    }
    $scope.getSubCategory = getSubCategory;
        function getSubCategory() {         
            var GetSubCategory = NewItemDamageLostService.GetSubCategory($scope.Common.Category);
            GetSubCategory.then(function (success) {               
                $scope.SubCategory = success.data.data;
            }, function (errorPl) {
                $scope.SubCategory = null;
            });
        }

        $scope.getSubCategory = getSubCategory;
        function getSubCategory() {
            var param = {
                "categoryId": $scope.Common.Category
            }
            var GetSubCategory = NewItemDamageLostService.GetSubCategory(param);
            GetSubCategory.then(function (success) {
                $scope.SubCategory = success.data.data;
            }, function (errorPl) {
                $scope.SubCategory = null;
            });
        }
    $scope.cancel = cancel;
    function cancel () {
        $scope.$close("");
    };
    
    $scope.Error = "";
    $scope.SaveNewItem = SaveNewItem;
    function SaveNewItem()
    {
        $scope.Error = "";
            var param = {
                "itemName": "Mobile Phone Iphone",
                "price": 42000,
                "quantity": 1,
                "dateOfPurchase": "2010-11-01",
                "categoryId": "1",
                "collectionId": 1001,
                "subCategoryId": 14,
                "roomId": "439",
                "currentValue": 22000,
                "brand": "Apple",
                "model": "iPhone 6s",
                "description": "iPhone 6s 64GB Gold",
                "productSerialNo": "CNDYMX1131ZL15",
                "policyNumber": "P21LOS73",
                "imageId": "1058"
            };       
            var promisePost = ClaimCenterClaimDetailsService.addLostDamageItem(param);
            promisePost.then(function (pl) {
              
                $scope.Error = "";
                if (pl.data.status == 200)
                    $scope.$close("Item saved succeefully..");
                else {
                    $scope.Error = "Failed to save Item..";
                }
            }, function (errorPl) {
                
                $scope.Error = errorPl.data.errorMessage;
            });

    }
});