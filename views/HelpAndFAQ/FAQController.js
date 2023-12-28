angular.module('MetronicApp').controller('FAQController', function ($translate, $translatePartialLoader, $rootScope, $log, $scope, $filter,
    settings, $http, $timeout, $location) {

    // $translatePartialLoader.addPart('FAQDashboard');
    $translate.refresh();

    function init() {

    }
    init();


    $scope.gotoClaimLifeCyclePage = gotoClaimLifeCyclePage;

    function gotoClaimLifeCyclePage() {
        $location.url('cliamlifecyclefaq')
    }

    $scope.gotoUserAdminPage = gotoUserAdminPage;

    function gotoUserAdminPage() {
        $location.url('useradmistrationfaq')
    }

    $scope.gotoBillingAndPaymentsPage = gotoBillingAndPaymentsPage;

    function gotoBillingAndPaymentsPage() {
        $location.url('billingandpaymentsfaq')
    }

})