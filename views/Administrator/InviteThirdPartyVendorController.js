angular.module('MetronicApp').controller('InviteThirdPartyVendorController', function ($rootScope, $scope, $http, $location, $translatePartialLoader, $translate) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('InviteThirdPartyVendor');
    $translate.refresh();

    $scope.category1 = [{ Category: 'Catogery1' }, { Category: 'Catogery2' }, { Category: 'Catogery3' }, { Category: 'Catogery4' }, { Category: 'Catogery5' }];
    $scope.category2 = [{ Category: 'Catogery41' }, { Category: 'Catogery42' }, { Category: 'Catogery43' }];


    $scope.GoBack = GoBack;
    function GoBack()
    {
        $location.url('AdministratorThirdPartyVendor');
    }


    $scope.InviteVendor = InviteVendor;
    function InviteVendor()
    {
        bootbox.alert({
            size: "",
            title: "Invitation", closeButton: false,
            message: "Supplier Invited Successfully..!!!",
            className: "modalcustom",
            callback: function () { /* your callback code */ }
        });
    }


    $scope.SaveRecord = SaveRecord;
    function SaveRecord() {
        bootbox.alert({
            size: "",
            title: "Supplier Information", closeButton: false,
            message: "Supplier Information Saved Successfully..!!!",
            className: "modalcustom",
            callback: function () { /* your callback code */ }
        });
    }
    $scope.UpdateRecord = UpdateRecord;
    function UpdateRecord() {
        bootbox.alert({
            size: "",
            title: "Update Supplier Information", closeButton: false,
            message: "Supplier Information Updated Successfully..!!!",
            className: "modalcustom",
            callback: function () { /* your callback code */ }
        });
    }


    //Dynamically adding textboxes

    $scope.ContactDeatils = [];
    $scope.counter = 0;

    $scope.PhoneNumbers = [];
    $scope.phonecounter = 0;
    $scope.AddRow = function (type) {
        if (type == 'contactdetails') {
            $scope.ContactDeatils.push($scope.counter)
            $scope.counter = parseInt($scope.counter) + 1;
        }
        else {
            $scope.PhoneNumbers.push($scope.phonecounter)
            $scope.phonecounter = parseInt($scope.phonecounter) + 1;
        }

    }

    $scope.RemoveRow = function (row, type) {
        if (type == 'contactdetails') {
            $scope.ContactDeatils.splice(row, 1)   //1 -removes item , 0- adds item
        }
        else {
            $scope.PhoneNumbers.splice(row, 1)
        }

    }
});