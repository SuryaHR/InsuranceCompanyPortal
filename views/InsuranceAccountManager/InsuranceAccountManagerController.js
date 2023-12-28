angular.module('MetronicApp').controller('InsuranceAccountManagerController', function ($rootScope, $scope, $filter, settings, $http, $location, $translate, $translatePartialLoader,
    AuthHeaderService) {

        $translatePartialLoader.addPart('InsuranceAccountManagerDashboard');
        $translate.refresh();
        $scope.ShowHeader = true;
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        $scope.tab = 'Dashboard';
        //set language
       
        $scope.ErrorMessage = "";
        
        function init() {         
          
        }
        init();

        $scope.GoToHome = GoToHome;
        function GoToHome(){
            $location.path('/InsuranceAccountManager')
        }
     
        $scope.GoToDashboard = GoToDashboard;
        function GoToDashboard() {
            $(".page-spinner-bar").removeClass("hide");    
            $scope.tab = 'Dashboard';
            $(".page-spinner-bar").addClass("hide");    
        }

                 

});