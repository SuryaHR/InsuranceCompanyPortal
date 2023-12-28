angular.module('MetronicApp').controller('CategoryChangePopUpController', function (AdjusterPropertyClaimDetailsService, $scope, $translate, $translatePartialLoader, itemData,LineItemService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    //set language
    $translatePartialLoader.addPart('CategoryChangePopUp');
    $translate.refresh();
    $scope.init = init;
    function init() {
        var getCategories = AdjusterPropertyClaimDetailsService.getCategory();
        getCategories.then(function (success) {
            $scope.CategoryList = success.data.data;
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    }
    init();
    $scope.cancel = function () {
        $scope.$close();
    };
    $scope.saveCategory = function (category) {
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "itemIds": itemData,
            "categoryId": category.categoryId
        }
        var getCategories = LineItemService.bulkUpdateCategory(param);
        getCategories.then(function (success) {
            toastr.remove();
            toastr.success("Successfully updated category", $translate.instant("SuccessHeading"));
            $scope.$close();
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            $scope.ErrorMessage = error.data.errorMessage;
            // $scope.$close();
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
            $scope.$close();
        });
    }
});
