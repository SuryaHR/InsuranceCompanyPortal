angular.module('MetronicApp').controller('ItemsSetteledController', function ($scope, $rootScope, $translatePartialLoader, $translate, $location, AdjusterPropertyClaimDetailsService) {
    $translatePartialLoader.addPart('ItemsSetteled');
    $translate.refresh();
    $scope.pagesize = $rootScope.settings.pagesize;
    $scope.search;
    $scope.Category="1";
    $scope.ItemList = null;
    init();
    function init()
    {
        $scope.ClaimNo = sessionStorage.getItem("AdjusterClaimNo").toString();
        var GetItemsList = AdjusterPropertyClaimDetailsService.GetItemsTobesettle({
            "claimNumber": $scope.ClaimNo
        });
        GetItemsList.then(function (success) {  $scope.ItemsList = success.data.data; }, function (error) { });
        
    }
    $scope.GoBack = GoBack;
    function GoBack()
    {
        $location.url('AdjusterPropertyClaimDetails');
    }
});