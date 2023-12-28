angular.module('MetronicApp').controller('ClaimLifeCycleFAQController', function ($translate, $translatePartialLoader, $rootScope, $log, $scope, $filter,
    settings, $http, $timeout, $location) {

    $translatePartialLoader.addPart('FAQDashboard');
    $translate.refresh();

    function init() {

    }
    init();


    $scope.gotoTableContents = gotoTableContents;

    function gotoTableContents() {
        $location.url('/helpAndfrequentlyaskedquestions')
    }

    // handle links with @href started with '#' only
    $(document).on('click', 'a[href^="#"]', function (e) {
        // target element id
        var id = $(this).attr('href');

        // target element
        var $id = $(id);
        if ($id.length === 0) {
            return;
        }

        // prevent standard hash navigation (avoid blinking in IE)
        e.preventDefault();

        // top position relative to the document
        var pos = $id.offset().top;

        // animated top scrolling
        $('body, html').animate({ scrollTop: pos });
    });

    //Go to user admin FAQ page

    $scope.gotoUserAdminPage = gotoUserAdminPage;
    function gotoUserAdminPage() {
        $location.url('/useradmistrationfaq');
    }

})