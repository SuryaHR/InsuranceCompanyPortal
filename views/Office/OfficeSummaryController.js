angular.module('MetronicApp').controller('OfficeSummaryController', function ($rootScope, $scope, $http, $location, $translatePartialLoader, $translate) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('OfficeSummary');
    $translate.refresh();

   
   
   
   
    

    $scope.data = [{ FirstName: "Jon", LastName: "Doe", EmailId: "Jon@gmail.com", PhoneNo: "987645673", Role: "Admin" },
   { FirstName: "Jon", LastName: "Doe", EmailId: "Jon@gmail.com", PhoneNo: "987645673", Role: "Admin" },
   { FirstName: "Jon", LastName: "Doe", EmailId: "Jon@gmail.com", PhoneNo: "987645673", Role: "Admin" },
   { FirstName: "Jon", LastName: "Doe", EmailId: "Jon@gmail.com", PhoneNo: "987645673", Role: "Admin" },
   { FirstName: "Jon", LastName: "Doe", EmailId: "Jon@gmail.com", PhoneNo: "987645673", Role: "Admin" },
   { FirstName: "Jon", LastName: "Doe", EmailId: "Jon@gmail.com", PhoneNo: "987645673", Role: "Admin" },
   { FirstName: "Jon", LastName: "Doe", EmailId: "Jon@gmail.com", PhoneNo: "987645673", Role: "Admin" }, ];
    $scope.EditOfficebtn = false;
    $scope.EditOffice = EditOffice;
    function EditOffice() {
        $scope.EditOfficebtn = true;
    }
    $scope.Save = Save;
    function Save() {
        $scope.EditOfficebtn = false;
    }
    $scope.Cancel = Cancel;
    function Cancel() {
        $scope.EditOfficebtn = false;
    }
});