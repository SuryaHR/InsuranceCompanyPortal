angular.module('MetronicApp').controller('MemberContactController', function ($rootScope, $scope, $http, $location, $translatePartialLoader, $translate) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('OfficeSummary');
    $translate.refresh();
    
    $scope.AddNewContact = false;
    $scope.AddNewContacts = AddNewContacts;
    function AddNewContacts() {
        $scope.AddNewContact = true;
    }

    $scope.CancelAddNewContacts = CancelAddNewContacts;
    function CancelAddNewContacts() {
        $scope.AddNewContact = false;
    }

    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

    $scope.data = [{ Id: 1, FirstName: "Jon", LastName: "Doe", EmailId: "Jon@gmail.com", PhoneNo: "987645673", Role: "Admin" },
    { Id: 2, FirstName: "Jon1", LastName: "Doe", EmailId: "Jon@gmail.com", PhoneNo: "987645673", Role: "Admin" },
    { Id: 3, FirstName: "Jon2", LastName: "Doe", EmailId: "Jon@gmail.com", PhoneNo: "987645673", Role: "Admin" },
    { Id: 4, FirstName: "Jon3", LastName: "Doe", EmailId: "Jon@gmail.com", PhoneNo: "987645673", Role: "Admin" },
    { Id: 4, FirstName: "Jon4", LastName: "Doe", EmailId: "Jon@gmail.com", PhoneNo: "987645673", Role: "Admin" },
    { Id: 5, FirstName: "Jon5", LastName: "Doe", EmailId: "Jon@gmail.com", PhoneNo: "987645673", Role: "Admin" },
        { Id: 6, FirstName: "Jon6", LastName: "Doe", EmailId: "Jon@gmail.com", PhoneNo: "987645673", Role: "Admin" }, ];
    $scope.selected = {};

    $scope.getTemplate = function (item) {
        if (!angular.isUndefined(item)) {
            if (item.Id === $scope.selected.Id) return 'edit';
            else
                return 'display';
        }
        else
            return 'display';
    };

    $scope.editContact = function (item) {
        $scope.selected = angular.copy(item);
    };

    $scope.saveContact = function (idx) {
        if (!angular.isUndefined(idx)) {
            console.log("Saving contact");
            $scope.data[idx] = angular.copy($scope.selected);
        }
        else {//Call Api save And get its id then assign id and pass 
            $scope.selected.Id = 101;
            $scope.data.splice(0, 0, $scope.selected)
        }
        $scope.reset();
    };

    $scope.reset = function () {
        $scope.AddNewContact = false;
        $scope.selected = {};
    };
});