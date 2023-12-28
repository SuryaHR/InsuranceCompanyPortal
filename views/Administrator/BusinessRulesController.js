angular.module('MetronicApp').controller('BusinessRulesController', function ($rootScope, $scope,
    settings, $location, $translate, $translatePartialLoader,BusinessRuleService) {

    //set language
    $translatePartialLoader.addPart('BusinessRules');
    $translate.refresh(); 
    $scope.RoleList;  
    function init() {       
        $scope.GetRoles();
    };
    $scope.GetRoles=function()
    {
        var getRoles = BusinessRuleService.GetRoleList();
        getRoles.then(function (success) {        
            $scope.RoleList = success.data.data;
            angular.forEach($scope.RoleList, function (role) {
                if (role.descriptions === null) {
                    role.descriptions = "Role description for " + role.name
                }
            });
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }
    init();
    $scope.UpdateRolesAndBudget = UpdateRolesAndBudget;
    function UpdateRolesAndBudget() {
        var RolelistDetails=[];
        angular.forEach($scope.RoleList, function (role) {
            RolelistDetails.push({
                "id": role.id,
                "description": (role.descriptions !== null) ? role.descriptions : "Role description for " + role.name,
                "roleName":role.name,
                "status":true,
                "invoiceLimit":role.invoiceLimit,
                "claimLimit":role.claimLimit,
                "annualLimit": role.annualLimit           
            });           
        });
        var param = RolelistDetails;

        var updateRole = BusinessRuleService.updateRole(param);
        updateRole.then(function (success) {
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
       
    }
});