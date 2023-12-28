angular.module('MetronicApp').controller('MyPaymentController', function ($translate, $translatePartialLoader, $scope,$uibModal, $rootScope, $state, settings,
    $location) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $scope.PageSize = $rootScope.settings.pagesize;
    $translatePartialLoader.addPart('MyPayment');
    $translate.refresh();

    //Open Add banck account modal
    $scope.animationsEnabled = true;

    $scope.OpenAddBankAccount = function ()
    {
    var vm = this;
    var out = $uibModal.open(
        {
            animation: $scope.animationsEnabled,
            size: "md",
            templateUrl: "views/PolicyHolder/AddBankAccount.html",
            controller: "AddBankAccountController",

            resolve:
            {
                /**
                 * @return {?}
                 */

                items: function () {

                  
                }
            }

        });
    out.result.then(function (value) {

        //Call Back Function success
    }, function () {

    });
    return {
        open: open
    };
}


    $scope.OpenAddCard = function () {
        var vm = this;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                size: "md",
                templateUrl: "views/PolicyHolder/AddCard.html",
                controller: "AddCardController",

                resolve:
                {
                    /**
                     * @return {?}
                     */

                    items: function () {


                    }
                }

            });
        out.result.then(function (value) {

            //Call Back Function success
        }, function () {

        });
        return {
            open: open
        };
    };
    $scope.GoToHome = function () {
        $location.url(sessionStorage.getItem('HomeScreen'));
    }
});