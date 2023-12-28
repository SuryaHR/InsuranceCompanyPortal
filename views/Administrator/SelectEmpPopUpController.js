angular.module('MetronicApp').controller('SelectEmpPopUpController', function ($rootScope, $scope, $location, $translate, $translatePartialLoader,
    DepartmentsService, AuthHeaderService, EmpObj) {

    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('Departments');
    $scope.EmployeeList = angular.copy(EmpObj.EmployeeList); //Getting this list from Department Controller   
    $scope.cancel = cancel;
    function cancel() {
        $scope.$close();
    };

    $scope.Ok = function()
    {       
         var SelectedEmp = [];

         angular.forEach($scope.EmployeeList, function (employee) {
            if(employee.IsSelect==true)
            {
                SelectedEmp.push(employee);
            }

        });
       
        $scope.$close(SelectedEmp);
    };

});