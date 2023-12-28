angular.module('MetronicApp').controller('InsuranceAgentController', function ($rootScope, $scope, $filter, settings, $http, $location, $translate, $translatePartialLoader,
    AuthHeaderService) {

        $translatePartialLoader.addPart('UnderWriter');
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
            $location.path('UnderWriter')
        }
     
        $scope.GoToDashboard = GoToDashboard;
        function GoToDashboard() {
            $(".page-spinner-bar").removeClass("hide");    
            $scope.tab = 'Dashboard';
            $(".page-spinner-bar").addClass("hide");    
        }

        $scope.GoToAllAppraisals = GoToAllAppraisals;
        function GoToAllAppraisals() {
            $(".page-spinner-bar").removeClass("hide");    
            $scope.tab = 'AllAppraisals';
            $(".page-spinner-bar").addClass("hide");    
        }

        $scope.GoToReports = GoToReports;
        function GoToReports() {
            $(".page-spinner-bar").removeClass("hide");    
            $scope.tab = 'Reports';
            $(".page-spinner-bar").addClass("hide");    
        }

        $scope.GoToSettings = GoToSettings;
        function GoToSettings() {
            $(".page-spinner-bar").removeClass("hide");    
           $scope.tab = 'Settings';
            $(".page-spinner-bar").addClass("hide");    
        }        

    
});