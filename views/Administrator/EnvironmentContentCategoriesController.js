angular.module('MetronicApp').controller('EnvironmentContentCategoriesController', function ($rootScope, $scope, $uibModal, settings, $http, $location,
    $translate, $translatePartialLoader, CategoryService, AuthHeaderService,$timeout) {
        $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });

    $translatePartialLoader.addPart('AddCategory');
    $translate.refresh();
    $scope.ErrorMessage = "";
    $scope.pagesize = $rootScope.settings.pagesize;
    $scope.CategoryList;
    $scope.SubCategoryList;
    $scope.Categoryobject;

    init();
    function init() {
        $scope.Category = true;
        $scope.AddCategory = false;
        var promisePost = CategoryService.GetCategoryList();
        promisePost.then(function (success) {
            $scope.CategoryList = success.data.data;
        }, function (error) {
            if (error.status === 500 || error.status === 404) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
            else {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            }
        });
    }

    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }
    $scope.sortCategory = function (keyname) {
        $scope.CategorysortKey = keyname;   //set the sortKey to the param passed
        $scope.Categoryreverse = !$scope.Categoryreverse; //if true make it false and vice versa
    }

    //Show Edit or Add new Category screen
    $scope.showNewCategory = showNewCategory;
    function showNewCategory(item) {
        $scope.Category = false;
        $scope.AddCategory = true;
        if (angular.isDefined(item)) {
            $scope.Categoryobject = angular.copy(item);
            if (item.categoryId > 0) {
                var param = {
                    "categoryId": item.categoryId
                }
                var response = CategoryService.GetSubCategoryList(param);
                response.then(function (Success) {                   
                    $scope.SubCategoryList = Success.data.data;
                }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
            }
        }
        else {
            $scope.Categoryobject = {};
            $scope.SubCategoryList = [];
        }

    }

    //Go back to Category list
    $scope.BtnBackClick = BtnBackClick;
    function BtnBackClick() {
        $scope.Category = true;
        $scope.AddCategory = false;
    }

    //Add Update category
    $scope.AddUpdateCategory = AddUpdateCategory
    function AddUpdateCategory() {
        //"deductible": $scope.Categoryobject.deductible,         
        if (angular.isUndefined($scope.Categoryobject.categoryId))
            $scope.Categoryobject.categoryId = null;
        var param = {
            "categoryId": $scope.Categoryobject.categoryId,
            "categoryName": $scope.Categoryobject.categoryName,
            "coverageLimit": $scope.Categoryobject.coverageLimit,
            "description": $scope.Categoryobject.description
        };
        

        var AddCategoryPromise = CategoryService.AddUpdateCategory(param);
        AddCategoryPromise.then(function (success) {
            var promisePost = CategoryService.GetCategoryList();
            promisePost.then(function (success) {               
                $scope.CategoryList = success.data.data;
            }, function (error) {               
            });
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
            $scope.Show = true;
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
            $scope.ErrorMessage = error.data.ErrorMessage;
        });
    }
    $scope.closeSuccess = closeSuccess
    function closeSuccess() {

        $scope.Show = false;
    }
    //Pop to add sub category
    $scope.AddSubCategory = AddSubCategory;
    function AddSubCategory(item) {
        $scope.animationsEnabled = true;
        
        $scope.Subcat = {};
        if (angular.isDefined(item)) {
            
          
            $scope.Subcat = angular.copy(item)
            $scope.Subcat.categoryId = $scope.Categoryobject.categoryId;
        }
        else {
            $scope.Subcat.categoryId = $scope.Categoryobject.categoryId;
            
        }
        var out = $uibModal.open({
            templateUrl: "views/Administrator/AddSubCategory.html",
            controller: "AddSubCategoryController",
            resolve:
            {
                SubCategoryObject: function () {
                    return $scope.Subcat;
                }
            }
        });
        out.result.then(function (value) {
            //Call Back Function success
           
            var param = {
                "categoryId":  $scope.Categoryobject.categoryId
            }
            $timeout(function(){
            var response = CategoryService.GetSubCategoryList(param);
            response.then(function (Success) {
                $scope.SubCategoryList = Success.data.data;
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
            });
        },500);            


        }, function () {
        });
        return {

        };
    }

    $scope.GotoDashboard=function()
    {
        $location.url(sessionStorage.getItem('HomeScreen'));
    }
});