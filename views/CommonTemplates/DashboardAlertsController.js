angular.module('MetronicApp').controller('DashboardAlertsController', function ($translate, $translatePartialLoader, $rootScope, $log, $scope, $filter,
    settings, $http, $timeout, $location, DashboardAlertsService) {

    $translatePartialLoader.addPart('DashboardAlerts');
    $translate.refresh();

    $scope.AlertList = [];
    $scope.alert = [];
    $scope.CurrentNotificationPage = 1;
    $scope.TotalNotificationPages = 0;
    $scope.EmployeeList = [];
    $scope.IsLoading = false;
    $scope.tab = "messages";

    function init() {
        GetAlertsList();
        showNotification();
    }
    init();

    $scope.GetAlertsList = GetAlertsList;
    function GetAlertsList() {
        //Get Alert List
        $scope.IsLoading = true;
        var param = {
            "id": sessionStorage.getItem("UserId").toString(),
            "page": $scope.CurrentNotificationPage
            // "id":"252"
        };
        var GetAlertList = DashboardAlertsService.getAlertList(param);
        GetAlertList.then(function (success) {
            var AlertList = success.data.data;
            if (angular.isDefined(AlertList) && AlertList != null) {
                angular.forEach(AlertList.notifications, function (item) {
                    $scope.alert.push(item);
                    if($scope.tab == "messages" && item.notificationPurpose == "NOTE"){
                        $scope.AlertList.push(item);
                    }
                    if($scope.tab == "notification" && item.notificationPurpose != "NOTE"){
                        $scope.AlertList.push(item);
                    }
                });
                $scope.TotalNotificationPages = Math.ceil(AlertList.totalCount / 10);
            }

            $scope.IsLoading = false;
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
            $scope.ErrorMessage = error.data.errorMessage;
        });
    };

    $scope.showMessage = showMessage;
    function showMessage(){
        $scope.AlertList = [];
        $scope.tab = "messages";
        if($scope.alert != null){
            angular.forEach($scope.alert, function(item){
                if(item.notificationPurpose == "NOTE"){
                    $scope.AlertList.push(item);
                }
            })
        }
    }

    $scope.showNotification = showNotification;
    function showNotification(){
        $scope.AlertList = [];
        $scope.tab = "notification";
        if($scope.alert != null){
            angular.forEach($scope.alert, function(item){
                if(item.notificationPurpose != "NOTE"){
                    $scope.AlertList.push(item);
                }
            })
        }
    }

    //Make Notification as read
    $scope.$on('readNotification', function (event, data) {
        var readAlert = DashboardAlertsService.readNotification(data);
        readAlert.then(function (success) {
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        });
    });

    $scope.NextPage = function () {
        if ($scope.CurrentNotificationPage < $scope.TotalNotificationPages) {
            $scope.CurrentNotificationPage += 1;
            GetAlertsList();
        }
    }

    $scope.DeleteNotification = function (index, alert) {
        if ($scope.AlertList != null) {
            $scope.AlertList.splice(index, 1);
            var param = {
                "id": alert.id,
                "page": $scope.CurrentNotificationPage
            };
            var deleteAlert = DashboardAlertsService.deleteNotification(param);
            deleteAlert.then(function (success) {
                var deleteAlert = success.data.data;
                if (deleteAlert.notification != null)
                    $scope.AlertList.push(deleteAlert.notification);
                $scope.TotalNotificationPages = Math.ceil(deleteAlert.totalCount / 10);
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
                $scope.ErrorMessage = error.data.errorMessage;
            });
        }
    }

});