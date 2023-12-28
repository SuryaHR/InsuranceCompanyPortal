angular.module('MetronicApp').controller('AdjusterInviteVendorController', function ($rootScope, $scope, settings, $translate, $translatePartialLoader, $location,
    $uibModal, ThirdPartyVendorService) {

    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
   
   
   
   

    //set language
    $translatePartialLoader.addPart('AdjusterInviteThirdPartyVendor');
    $translate.refresh();

    $scope.GoBack=function()
    {
        $location.url('AdjusterThirdPartyVendor');
    }

    //Invite vendor
    $scope.InviteVendor = function () {

        //bootbox.alert({
        //    size: "",
        //    title: $translate.instant('AlertBox.InviteTitle'),
        //    closeButton: false,
        //    message: $translate.instant('AlertBox.InviteMessage'),
        //    className: "modalcustom",
        //    callback: function () { /* your callback code */ }
        //});

        var param = {
                "firstName" : "Rajesh",
                "lastName" : "Khanna",
                "email" : "gauravk@chetu.com"
        }

        var InviteVendor = ThirdPartyVendorService.inviteVendor(param);
        InviteVendor.then(function(success)
        {
            
            $scope.Status=success.data.status;
            if($scope.Status==200)
            {

            }
        },
        function(error)
        {
            
        });
    }
});