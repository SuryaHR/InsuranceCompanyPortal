/***
Metronic AngularJS App Main Script
***/
/* Metronic App */
var MetronicApp = angular.module("MetronicApp", [
    "ui.router",
    "ngTouch",
    "ui.bootstrap",
    "oc.lazyLoad",
    "ngSanitize",
    "ngCookies",
    "angularUtils.directives.dirPagination",
    "pascalprecht.translate",
    "ngIdle",
    "ngTagsInput",
    "angucomplete-alt",
    "anguFixedHeaderTable",
    "scrollable-table", "pdf",
    "ui.calendar", "pickadate", "zingchart-angularjs",
    "vcRecaptcha", "chart.js", "angularjs-crypto"
]);

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
MetronicApp.config(['$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
        // global configs go here
    });
}]);
MetronicApp.directive('select2me', function ($timeout) {
    return {
        restrict: 'C',
        require: 'ngModel',
        link: function (scope, element, attr, model) {
            element.bind('click', function () {
                scope.$apply(function () {
                    model.$touched = true;
                });
            });
        }
    };
    return {
        link: link
    };
});
//AngularJS v1.3.x workaround for old style controller declarition in HTML
MetronicApp.config(['$controllerProvider', function ($controllerProvider) {
    // this option might be handy for migrating old apps, but please don't use it
    // in new ones!
    $controllerProvider.allowGlobals();
}]);

MetronicApp.config(function ($translateProvider, $translatePartialLoaderProvider) {
    $translateProvider.useLoader('$translatePartialLoader', {
        urlTemplate: 'Translation/{part}/{lang}.json'
    });
    $translateProvider.useSanitizeValueStrategy('sanitize');
    $translateProvider.preferredLanguage('en-US');
    $translateProvider.useLoaderCache(true);

});

/********************************************
 END: BREAKING CHANGE in AngularJS v1.3.x:
*********************************************/

/* Setup global settings */
MetronicApp.factory('settings', ['$rootScope', function ($rootScope) {
    // supported languages
    var settings = {
        layout: {
            pageSidebarClosed: true, // sidebar menu state
            pageContentWhite: true, // set page content layout
            pageBodySolid: false, // solid body color state
        },
        assetsPath: 'assets',
        globalPath: 'assets/global',
        layoutPath: 'assets/layouts/layout4',
        pagesize: "20",
        itemPagesize: "20",
        //apiurl: 'http://69.164.195.59:8080/ArtigemRS-FI/api/',
        apiurl: 'http://182.74.239.14:8080/ArtigemRS-FI/api/',
        NoImagePath: "assets/global/img/no-image.png"
    };
    $rootScope.settings = settings;
    return settings;
}])
    .service('authInterceptor', function ($q, $window, $location) {
        var service = this;
        sessionStorage.setItem("AccessDenied","false");
        service.responseError = function (response) {
            if (response.status == 401 || response.status == 403 || (response.config && response.config.url 
                && !response.config.url.includes("https://api.bestbuy.com/")
                && !response.config.url.includes("/api/web/claim/search/replacement")
                && response.status == -1)) {
                //   $location.path("/login");
                var APIURL = sessionStorage.getItem("apiurl");
                var ReceiptURL = sessionStorage.getItem("receipturl");
                var ExportURL = sessionStorage.getItem("ExportUrl");
                var Xoriginator = sessionStorage.getItem("Xoriginator");
                var ClaimTemplate = sessionStorage.getItem("ClaimTemplate");
                var ItemTemplate = sessionStorage.getItem("ItemTemplate");
                var VendorDetailsTemplate = sessionStorage.getItem("VendorDetailsTemplate");
                var UserDetailsTemplate = sessionStorage.getItem("UserDetailsTemplate");
                var zipCodesAndPremiumTemplate = sessionStorage.getItem("zipcodeAndPremiumTemplate");
                var claimProfile = sessionStorage.getItem("claimProfile");
                var serviceRequests = sessionStorage.getItem("serviceRequests");
                var googleShoppingDropdown = sessionStorage.getItem("googleShoppingDropdown");
                var jewelryVendor = sessionStorage.getItem("jewelryVendor");
                var AdminApiurl = sessionStorage.getItem("AdminApiurl");
                var insuranceCarrier = sessionStorage.getItem("insuranceCarrier");
                var token = sessionStorage.getItem("AccessToken");
                var userid = sessionStorage.getItem("UserId");

                sessionStorage.clear();
                window.localStorage.clear();
                
                sessionStorage.setItem("apiurl", APIURL)
                sessionStorage.setItem("receipturl", ReceiptURL);
                sessionStorage.setItem("ExportUrl", ExportURL);
                sessionStorage.setItem("Xoriginator", Xoriginator);
                sessionStorage.setItem("ClaimTemplate", ClaimTemplate);
                sessionStorage.setItem("ItemTemplate", ItemTemplate);
                sessionStorage.setItem("VendorDetailsTemplate", VendorDetailsTemplate);
                sessionStorage.setItem("UserDetailsTemplate", UserDetailsTemplate);
                sessionStorage.setItem("zipCodesAndPremiumTemplate", zipCodesAndPremiumTemplate);
                sessionStorage.setItem("claimProfile", claimProfile);
                sessionStorage.setItem("serviceRequests", serviceRequests);
                sessionStorage.setItem("googleShoppingDropdown", googleShoppingDropdown);
                sessionStorage.setItem("jewelryVendor", jewelryVendor);
                sessionStorage.setItem("AdminApiurl", AdminApiurl);
                //Set name of Insurance company from Config file
                sessionStorage.setItem("insuranceCarrier", insuranceCarrier);
                sessionStorage.setItem("AccessToken",token);
                sessionStorage.setItem("loginScreen", $location.absUrl())
                sessionStorage.setItem("UserId",userid);
                sessionStorage.setItem("AccessDenied","true");
                //$window.location.href = "/login";
                $location.path('/login');


            }else{
                return $q.reject(response);
            }            
        };
    });

/* Setup App Main Controller */
MetronicApp.controller('AppController', ['$scope', '$rootScope', '$state', 'Idle', '$location', '$http', '$cookies', 'Keepalive', 'UserService', function ($scope, $rootScope, $state, Idle, $location, $http, $cookies, Keepalive, UserService) {
    $scope.$on('$viewContentLoaded', function () {
        App.initComponents(); // init core components
        Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive
        //<!-- Toster notification options -->
        toastr.options = {
            "closeButton": true,
            "debug": false,
            "newestOnTop": false,
            "progressBar": false,
            "positionClass": "toast-top-full-width",
            "preventDuplicates": true,
            "onclick": null,
            "showDuration": "300",
            "hideDuration": "1000",
            "timeOut": "5000",
            "extendedTimeOut": "0",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
            //,
            //"tapToDismiss":"false"
        }
    });

    /*$scope.$on('IdleStart', function () {
        // the user appears to have gone idle
        $("title", "head").text("Artigem 3CircleCRM");
        console.log("Ideal time start");
    });*/

    /* $scope.$on('IdleWarn', function (e, countdown) {
         // follows after the IdleStart event, but includes a countdown until the user is considered timed out
         // the countdown arg is the number of seconds remaining until then.
         // you can change the title or display a warning dialog from here.
         // you can let them resume their session by calling Idle.watch()
         $("title", "head").text("Artigem 3CircleCRM");
         console.log("Ideal warn time start");
     });*/

    /* $scope.$on('IdleTimeout', function () {
         // the user has timed out (meaning idleDuration + timeout has passed without any activity logout user)
         if (angular.isDefined(sessionStorage.getItem("IsVendorLogIn")) && (sessionStorage.getItem("IsVendorLogIn") === "True")) {
             toastr.remove();
             sessionStorage.setItem("IsVendorLogIn", undefined);
             $(".wrapBoxShodow").css("box-shadow", "0px 1px 16px 1px #364150");
             var APIURL = sessionStorage.getItem("apiurl");
             var ReceiptURL = sessionStorage.getItem("receipturl");
             var ExportURL = sessionStorage.getItem("ExportUrl");
             var Xoriginator = sessionStorage.getItem("Xoriginator");
             var ClaimTemplate = sessionStorage.getItem("ClaimTemplate");
             var ItemTemplate = sessionStorage.getItem("ItemTemplate");
             var VendorDetailsTemplate = sessionStorage.getItem("VendorDetailsTemplate");
             var UserDetailsTemplate = sessionStorage.getItem("UserDetailsTemplate");
             var zipCodesAndPremiumTemplate = sessionStorage.getItem("zipcodeAndPremiumTemplate");
             var claimProfile = sessionStorage.getItem("claimProfile");
             var jewelryVendor = sessionStorage.getItem("jewelryVendor");
             var AdminApiurl = sessionStorage.getItem("AdminApiurl");

             sessionStorage.clear();
             sessionStorage.setItem("apiurl", APIURL)
             sessionStorage.setItem("receipturl", ReceiptURL);
             sessionStorage.setItem("ExportUrl", ExportURL);
             sessionStorage.setItem("Xoriginator", Xoriginator);
             sessionStorage.setItem("ClaimTemplate", ClaimTemplate);
             sessionStorage.setItem("ItemTemplate", ItemTemplate);
             sessionStorage.setItem("VendorDetailsTemplate", VendorDetailsTemplate);
             sessionStorage.setItem("UserDetailsTemplate", UserDetailsTemplate);
             sessionStorage.setItem("zipCodesAndPremiumTemplate", zipCodesAndPremiumTemplate);
             sessionStorage.setItem("claimProfile", claimProfile);
             sessionStorage.setItem("jewelryVendor", jewelryVendor);
             sessionStorage.setItem("AdminApiurl", AdminApiurl);
             $cookies.remove('UserName');
             $cookies.remove('Password'); $("title", "head").text("Artigem 3CircleCRM");
             $rootScope.IsLoginedUser = false;
             $state.go('VendorLogin');
             toastr.warning("Session expired. You have been logged out.", "Session time out..!");

         }
         else {
             toastr.remove();
             $(".wrapBoxShodow").css("box-shadow", "0px 1px 16px 1px #364150");
             var APIURL = sessionStorage.getItem("apiurl")
             var ReceiptURL = sessionStorage.getItem("receipturl");
             var ExportURL = sessionStorage.getItem("ExportUrl");
             var Xoriginator = sessionStorage.getItem("Xoriginator");
             var ClaimTemplate = sessionStorage.getItem("ClaimTemplate");
             var ItemTemplate = sessionStorage.getItem("ItemTemplate");
             var VendorDetailsTemplate = sessionStorage.getItem("VendorDetailsTemplate");
             var UserDetailsTemplate = sessionStorage.getItem("UserDetailsTemplate");
             var zipCodesAndPremiumTemplate = sessionStorage.getItem("zipcodeAndPremiumTemplate");
             var claimProfile = sessionStorage.getItem("claimProfile");
             var jewelryVendor = sessionStorage.getItem("jewelryVendor");
             var AdminApiurl = sessionStorage.getItem("AdminApiurl");
             sessionStorage.clear();
             sessionStorage.setItem("apiurl", APIURL)
             sessionStorage.setItem("receipturl", ReceiptURL);
             sessionStorage.setItem("ExportUrl", ExportURL);
             sessionStorage.setItem("Xoriginator", Xoriginator);
             sessionStorage.setItem("ClaimTemplate", ClaimTemplate);
             sessionStorage.setItem("ItemTemplate", ItemTemplate);
             sessionStorage.setItem("VendorDetailsTemplate", VendorDetailsTemplate);
             sessionStorage.setItem("UserDetailsTemplate", UserDetailsTemplate);
             sessionStorage.setItem("zipCodesAndPremiumTemplate", zipCodesAndPremiumTemplate);
             sessionStorage.setItem("claimProfile", claimProfile);
             sessionStorage.setItem("jewelryVendor", jewelryVendor);
             sessionStorage.setItem("AdminApiurl", AdminApiurl);
             $cookies.remove('UserName');
             $cookies.remove('Password'); $("title", "head").text("Artigem 3CircleCRM");
             $rootScope.IsLoginedUser = false;
             $state.go('login');
             toastr.warning("Session expired. You have been logged out.", "Session time out..!");
         }
         console.log("Ideal time out. Session end");
     });*/

    /* $scope.$on('IdleEnd', function () {
         // the user has come back from AFK and is doing stuff. if you are warning them, you can use this to hide the dialog
         console.log("User is alive. Active again.");
     });*/

    //$scope.$on('Keepalive', function () {
    //    // do something to keep the user's session alive
    //});

}]);

/***
Layout Partials.
By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial
initialization can be disabled and Layout.init() should be called on page load complete as explained above.
***/

/* Setup Layout Part - Header */
MetronicApp.controller('HeaderController', ['$scope', '$location', '$state', '$rootScope', '$http', '$translatePartialLoader', '$translate', 'RoleBasedService', '$interval', '$filter', 'UserService', 'HeaderService', function ($scope, $location, $state, $rootScope, $http, $translatePartialLoader, $translate, RoleBasedService, $interval, $filter, UserService, HeaderService, CorelogicConstants) {
    $scope.$on('$includeContentLoaded', function () {
        Layout.initHeader(); // init header
    });

    $scope.accessCalendar = !["INSURANCE COMPANY ADMINISTRATOR","UNDERWRITER","INSURANCE AGENT","INSURANCE ACCOUNT MANAGER"].includes(sessionStorage.getItem("RoleList"));

    $scope.ShowHeader = true;
    $scope.isCoreLogic = sessionStorage.getItem("isCoreLogic")=="true" ? true : false;
    $scope.ShowSearchBar = true;
    $scope.insuranceCompanyName = sessionStorage.getItem("InsuranceCompanyName");
    $scope.coreLogicConst = CorelogicConstants;
    $translatePartialLoader.addPart('AdjusterDashboard');
    $translate.refresh();
    var UserType = sessionStorage.getItem("UserType")
    if (UserType === "POLICY_HOLDER") {
        $scope.ShowSearchBar = false;
        $scope.ShowHeader = false;
    }
    $scope.ShowMyCalendar = true;
    if (UserType === "INSURANCE_AGENT" || UserType === "COMPANY_USER") {
        $scope.ShowMyCalendar = false;
    }
    $scope.CommonObj = {
        GlobalSearchText: ""
    }
    $scope.Notifications = [];
    $scope.LatestNotification = [];
    $scope.Events = [];

    $scope.LatestEvents = [];
    $scope.EventCount;
    $scope.totalCount;
    $scope.ErrorMessage;
    $translatePartialLoader.addPart('SideBar');
    $translate.refresh();
    $scope.ScreenList;
    $scope.accessReport = sessionStorage.getItem("accessReport") ? sessionStorage.getItem("accessReport") : false;
    //Method should be call on init method
    function init() {       

        //It again calling getscreenlist so list is null make anothre method which return screen list form session storage
        $scope.ScreenList = RoleBasedService.GetUserScreenListFromSession();
        GetNotification();
        // $interval(function () {
        //     if ($rootScope.IsLoginedUser === true) {
        //         $scope.GetNotification();
        //     }
        // }, 60000);
    }
    init();
    $scope.GetNotification = GetNotification;
    function GetNotification() {
        //get notification for the user
        var param =
        {
            "id": sessionStorage.getItem("UserId")
        }
        var getNotification = HeaderService.getAlertList(param);
        getNotification.then(function (success) {
            if (success.data.data) {
                $scope.Notifications = success.data.data;
                $scope.getRecent();
            }
        }, function (error) {
            if (error != null) {
                $scope.ErrorMessage = error.data.errorMessage;
            }
        });
    }

    // $rootScope.$on('$locationChangeStart', function (event, current, previous) {
    //     debugger;
    //     var currentURL = '/' + current.split('/')[current.split('/').length - 1];
    //     console.log("currentURL", currentURL);
    //     if(currentURL && currentURL.includes("login")){   
    //         $scope.resetSessionData(); 
    //         console.log("Cleared Existing Session Data and session reset to default");
    //     }

    //     var previousURL = '/' + previous.split('/')[previous.split('/').length - 1];
    //     if (!previousURL.includes("Security") && !previousURL.includes("ResetPassword"))
    //         sessionStorage.setItem("previous", previousURL)
    // });

    $scope.getRecent = getRecent;
    function getRecent() {
        $scope.LatestNotification = [];
        if ($scope.Notifications != null) {
            angular.forEach($scope.Notifications.notifications, function (notification) {
                if (notification.isRead == false) {
                    $scope.LatestNotification.push(notification);
                }
            })
            $scope.totalCount = $scope.Notifications.totalCount;
            $scope.getTime();
        }
    }

    $scope.Globalsearch = function Globalsearch() {
        var role = sessionStorage.getItem("RoleList");
        var abc = $location.path();
        if (role === "INSURANCE AGENT" || role === "UNDERWRITER" || role === "Insurance Underwriter" || role === 'INSURANCE ACCOUNT MANAGER') {
            if (abc === "/InsuranceGlobalSearch") {
                sessionStorage.setItem("GlobalSearchtext", $scope.CommonObj.GlobalSearchText);
                var backpath = $location.path();
                sessionStorage.setItem("BackPage", backpath);
                $state.reload()
            }
            else {
                sessionStorage.setItem("GlobalSearchtext", $scope.CommonObj.GlobalSearchText);
                var backpath = $location.path();
                sessionStorage.setItem("BackPage", backpath);
                $location.url('InsuranceGlobalSearch');
            }


        } else if (role === "ADJUSTER" || role === "Adjuster" || role === "Insurance Adjuster") {
            if (abc === "/AdjusterGlobalSearch") {
                sessionStorage.setItem("GlobalSearchtext", $scope.CommonObj.GlobalSearchText);
                var backpath = $location.path();
                sessionStorage.setItem("BackPage", backpath);
                $state.reload()
            }

            else {
                sessionStorage.setItem("GlobalSearchtext", $scope.CommonObj.GlobalSearchText);
                var backpath = $location.path();
                sessionStorage.setItem("BackPage", backpath);
                $location.url('AdjusterGlobalSearch');
            }


        } else if (role === "CLAIM SUPERVISOR" || role === "Insurance Claims Supervisor") {
            if (abc === "/SupervisorGlobalSearch") {
                sessionStorage.setItem("GlobalSearchtext", $scope.CommonObj.GlobalSearchText);
                var backpath = $location.path();
                sessionStorage.setItem("BackPage", backpath);
                $state.reload()
            }
            else {
                sessionStorage.setItem("GlobalSearchtext", $scope.CommonObj.GlobalSearchText);
                var backpath = $location.path();
                sessionStorage.setItem("BackPage", backpath);
                $location.url('SupervisorGlobalSearch');
            }


        } else {
            $state.reload()
        }

    }
    $rootScope.$on("$locationChangeStart", function () {
        if ($location.path() !== "/AdjusterGlobalSearch")
            $scope.CommonObj.GlobalSearchText = "";
        else
            $scope.CommonObj.GlobalSearchText = sessionStorage.getItem("GlobalSearchtext");

    });
    if ($location.path() === "/AdjusterGlobalSearch")
        $scope.CommonObj.GlobalSearchText = sessionStorage.getItem("GlobalSearchtext");

    $rootScope.$on("$locationChangeStart", function () {
        if ($location.path() !== "/InsuranceGlobalSearch")
            $scope.CommonObj.GlobalSearchText = "";
        else
            $scope.CommonObj.GlobalSearchText = sessionStorage.getItem("GlobalSearchtext");

    });
    if ($location.path() === "/InsuranceGlobalSearch")
        $scope.CommonObj.GlobalSearchText = sessionStorage.getItem("GlobalSearchtext");

    $scope.getTime = getTime;
    function getTime() {
        $scope.TodaysDate = $filter('date')(new Date(), "MM/dd/yyyy");

        angular.forEach($scope.LatestNotification, function (notification) {
            notification.createDate = $filter('date')(notification.createDate, "MM/dd/yyyy");
        });
        angular.forEach($scope.LatestNotification, function (notification) {
            if (notification.createDate == $scope.TodaysDate) {
                notification.notificationdate = "Today"
            }
            else {
                notification.notificationdate = $filter('date')(notification.createDate, "dd/MM/yyyy");
            }
        });

        $scope.LatestNotification = $filter('orderBy')($scope.LatestNotification, 'createDate');
    };

    $scope.MarkAsRead = function (obj) {
        var param =
        {
            "id": obj.id
        }
        var getNotification = HeaderService.markAsRead(param);
        getNotification.then(function (success) {
            $scope.status = success.data.status;
            if ($scope.status === 200) {
                $scope.totalCount = $scope.totalCount - 1;
                var index = $scope.LatestNotification.indexOf(obj);
                $scope.LatestNotification.splice(index, 1);

                $scope.RedirectTodetail(obj);
            }
        }, function (error) {
            if (error != null) {
                $scope.ErrorMessage = error.data.errorMessage;
            }

        });
    };

    $scope.RedirectTodetail = RedirectTodetail;
    function RedirectTodetail(obj) {
        var role = sessionStorage.getItem("RoleList");
        if (role === 'ADJUSTER') {
            sessionStorage.setItem("AdjusterClaimId", obj.notificationParams.claimId);
            sessionStorage.setItem("AdjusterClaimNo", obj.notificationParams.claimNumber);
            $location.url('\AdjusterPropertyClaimDetails');
        }
        //For Third party vendor
        else if (role === 'VENDOR CONTACT PERSON') {
            sessionStorage.setItem("ThirdPartyClaimId", obj.notificationParams.claimId);
            sessionStorage.setItem("ThirdPartyClaimNo", obj.notificationParams.claimNumber);

            $location.url('\ThirdPartyClaimDetails');
        }
        //For policyholder
        else if (role === 'INSURED') {
            sessionStorage.setItem("ThirdPartyClaimId", obj.notificationParams.claimId);
            sessionStorage.setItem("ThirdPartyClaimNo", obj.notificationParams.claimNumber);
            $location.url('\ThirdPartyClaimDetails');
        }
        //For vendor associate
        else if (role === 'CLAIM ASSOCIATE') {
            sessionStorage.setItem("VendorAssociateClaimId", obj.notificationParams.claimId);
            sessionStorage.setItem("VendorAssociateClaimNo", obj.notificationParams.claimNumber);
            $location.url('\VendorAssociateClaimDetails');
        }
        //For Claim Supervisor
        else if (role === 'SUPERVISOR') {
            sessionStorage.setItem("SupervisorClaimId", obj.notificationParams.claimId);
            sessionStorage.setItem("SupervisorClaimNo", obj.notificationParams.claimNumber);
            $location.url('\SupervisorClaimDetails');
        }
        else if (role === "CLAIM MANAGER" || role === "CLAIM CENTER ADMIN" || role === "AGENT") {
            sessionStorage.setItem("ManagerScreenClaimId", obj.notificationParams.claimId);
            sessionStorage.setItem("ManagerScreenClaimNo", obj.notificationParams.claimNumber);
            $location.url('\ClaimCenter-ClaimDetails');
        }

    };

    // Start - SPEED-15 Insurance Agent / Account Manager Reports
    var RoleList = sessionStorage.getItem("RoleList");
    if (RoleList === "INSURANCE AGENT") {
        sessionStorage.setItem("AgentReports", true);
        sessionStorage.setItem("ManagerReports", false);
    }
    if (RoleList === "INSURANCE ACCOUNT MANAGER") {
        sessionStorage.setItem("AgentReports", false);
        sessionStorage.setItem("ManagerReports", true);
    }
    $scope.getReport = getReport;
    function getReport() {
        var AgentReports = sessionStorage.getItem("AgentReports");
        var ManagerReports = sessionStorage.getItem("ManagerReports");
        if (AgentReports == 'true') {
            return 'AgentReports';
        }
        if (ManagerReports == 'true') {
            return 'ManagerReports';
        }
    }
    // End - SPEED-15 Insurance Agent / Account Manager Reports

    /* Select & Activate - Particular Tab */
    $scope.$on('updateActiveTab', function (event, data) {
        var menu = $('.hor-menu');
        // disable active states
        menu.find('li.active').removeClass('active');
        menu.find('li > a > .selected').remove();
        menu.find('li.open').removeClass('open');
        // Activate particular tab
        $("." + data).addClass('active');
    });

    $scope.gotoInsuranceAgent = gotoInsuranceAgent;
    function gotoInsuranceAgent(){
        var flag = $rootScope.ApprisalFormPristine;
        sessionStorage.setItem("nextPage","InsuranceDashboad");
        confirmBeforeChangindPage();
        if(!flag)
        $location.path('/InsuranceAgent');
    }

    $scope.goToInsuranceAgentMyAppraisal = goToInsuranceAgentMyAppraisal;
    function goToInsuranceAgentMyAppraisal(){
        var flag = $rootScope.ApprisalFormPristine;
        sessionStorage.setItem("nextPage","InsuranceAgentMyAppraisal");
        confirmBeforeChangindPage();
        if(!flag)
        $location.path('/InsuranceAllAppraisals');
    }

    $scope.goToInsuranceAgentReports = goToInsuranceAgentReports;
    function goToInsuranceAgentReports(){
        var flag = $rootScope.ApprisalFormPristine;
        sessionStorage.setItem("nextPage","InsuranceAgentReports");
        confirmBeforeChangindPage();
        if(!flag)
        $location.path('/InsuranceReports');
    }

    $scope.goToInsuranceAgentInvoices = goToInsuranceAgentInvoices;
    function goToInsuranceAgentInvoices(){
        var flag = $rootScope.ApprisalFormPristine;
        sessionStorage.setItem("nextPage","InsuranceAgentInvoices");
        confirmBeforeChangindPage();
        if(!flag)
        $location.path('/InsuranceInvoices');
    }
    $scope.confirmBeforeChangindPage = confirmBeforeChangindPage;
        function confirmBeforeChangindPage(){
            var flag = $rootScope.ApprisalFormPristine;
            if(flag){
            bootbox.confirm({
                size: "",
                title: "Need to save changes",
                message: "Changes made by you have not been saved. Would you like to save them?", closeButton: false,
                className: "modalcustom", buttons: {
                    confirm: {
                        label: "Yes, save changes",
                        className: 'btn-success'
                    },
                    cancel: {
                        label: "No, I am okay",
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    if (result) {
                        
                        $rootScope.UpdateApprisal();
                        
                    }
                    $rootScope.ApprisalFormPristine = false;
                    if(sessionStorage.getItem("nextPage") == "InsuranceDashboad"){
                        $scope.$apply(function () {
                            $location.path('/InsuranceAgent');
                        });
                    }
                    else if(sessionStorage.getItem("nextPage") == "InsuranceAgentMyAppraisal"){
                        $scope.$apply(function () {
                            $location.path('/InsuranceAllAppraisals');
                        });
                    }
                    else if(sessionStorage.getItem("nextPage") == "InsuranceAgentReports"){
                        $scope.$apply(function () {
                            $location.path('/InsuranceReports');
                        });
                    }
                    else if(sessionStorage.getItem("nextPage") == "InsuranceAgentInvoices"){
                        $scope.$apply(function () {
                            $location.path('/InsuranceInvoices');
                        });
                    }
                }
            })
        }
        }
    $scope.IsAccess = IsAccess;
    function IsAccess(param) {
        if ($scope.ScreenList === null)
            $scope.ScreenList = RoleBasedService.GetUserScreenListFromSession();
        var abc = $scope.ScreenList;
        //var index = $scope.ScreenList.indexOf(param);
        //if(index !==-1)
        //{
        //    return true;
        //}
        //else
        //{
        //    if ("webuser@artigem.com" === sessionStorage.getItem("UserName"))
        //        return true
        //    else
        //    return false;
        //}
        //When need to turn off Role based screen use this and comment above part
        // return true;
        var CurrentRole = sessionStorage.getItem("RoleList")
        var profile = sessionStorage.getItem("claimProfile");
        if (CurrentRole == "CLAIM MANAGER" && profile.toUpperCase() == "Salvage".toUpperCase()
            && param == "ClaimSpecialistHome") {
            return false;
        }
        if (CurrentRole == "CLAIM SUPERVISOR" &&
            (profile.toUpperCase() == "Contents".toUpperCase() || profile == "Salvage".toUpperCase())
            && param == "ClaimSpecialistHome") {
            return false;
        }
        var list = $filter('filter')($scope.ScreenList, { ScreenCode: param });
        if (list != null && list.length > 0) {
            if (list[0].ScreenCode === param)
                return true;
            // else
            //     return false;
        }
        //else {
        //if ("webuser@artigem.com" === sessionStorage.getItem("UserName"))
        //    return true
        //else
        return false;
        //}
    }

    /* updateProfilePicture */
    $scope.$on('updateProfilePicture', function (event, data) {
        sessionStorage.setItem("ProfilePicture", JSON.stringify(data));
        $scope.ProfilePicture = JSON.parse(sessionStorage.getItem("ProfilePicture"));
    });

    $scope.Name = sessionStorage.getItem("Name");
    $scope.placeholder = "";
    var firstnameLastname = $scope.Name.split(" ");
    $scope.placeholder = firstnameLastname[1].charAt(0) + firstnameLastname[0].charAt(0);
    $scope.ProfilePicture = JSON.parse(sessionStorage.getItem("ProfilePicture"));
    $scope.claimProfile = sessionStorage.getItem("claimProfile");

    //$scope.toggleSidebar = function () {
    //    var body = $('body');
    //    var sidebar = $('.page-sidebar');
    //    var sidebarMenu = $('.page-sidebar-menu');
    //    $(".sidebar-search", sidebar).removeClass("open");

    //    if (body.hasClass("page-sidebar-closed")) {
    //        body.removeClass("page-sidebar-closed");
    //        sidebarMenu.removeClass("page-sidebar-menu-closed");
    //        if (Cookies) {
    //            Cookies.set('sidebar_closed', '0');
    //        }
    //    } else {
    //        body.addClass("page-sidebar-closed");
    //        sidebarMenu.addClass("page-sidebar-menu-closed");
    //        if (body.hasClass("page-sidebar-fixed")) {
    //            sidebarMenu.trigger("mouseleave");
    //        }
    //        if (Cookies) {
    //            Cookies.set('sidebar_closed', '1');
    //        }
    //    }
    //    $(window).trigger('resize');
    //};
    $scope.Logout = Logout;
    function Logout(e) {

        console.log("login out...ended");

        if (angular.isDefined(sessionStorage.getItem("IsVendorLogIn")) && (sessionStorage.getItem("IsVendorLogIn") === "True")) {
            sessionStorage.setItem("IsVendorLogIn", undefined);
            document.body.style.backgroundColor = "#364150";
            $(".wrapBoxShodow").css("box-shadow", "0px 1px 16px 1px #364150");
            var APIURL = sessionStorage.getItem("apiurl")
            var ReceiptURL = sessionStorage.getItem("receipturl");
            var ExportURL = sessionStorage.getItem("ExportUrl");
            var Xoriginator = sessionStorage.getItem("Xoriginator");
            var ClaimTemplate = sessionStorage.getItem("ClaimTemplate");
            var ItemTemplate = sessionStorage.getItem("ItemTemplate");
            var VendorDetailsTemplate = sessionStorage.getItem("VendorDetailsTemplate");
            var UserDetailsTemplate = sessionStorage.getItem("UserDetailsTemplate");
            var claimProfile = sessionStorage.getItem("claimProfile");
            var serviceRequests = sessionStorage.getItem("serviceRequests");
            var googleShoppingDropdown = sessionStorage.getItem("googleShoppingDropdown");
            var jewelryVendor = sessionStorage.getItem("jewelryVendor");
            var hideCaptcha = sessionStorage.getItem("hideCaptcha");
            var disableSerpWow = sessionStorage.getItem("disableSerpWow");
            var token = sessionStorage.getItem("AccessToken");
            var userid = sessionStorage.getItem("UserId");
            var loginWithSSO = sessionStorage.getItem("loginWithSSO");
            var loginWithSAML = sessionStorage.getItem("loginWithSAML");
            var isCoreLogic = sessionStorage.getItem("isCoreLogic");


            var AdminApiurl = sessionStorage.getItem("AdminApiurl");
            UserService.removeUserDetails();
            sessionStorage.setItem("apiurl", APIURL)
            sessionStorage.setItem("receipturl", ReceiptURL);
            sessionStorage.setItem("ExportUrl", ExportURL);
            sessionStorage.setItem("Xoriginator", Xoriginator);
            sessionStorage.setItem("ClaimTemplate", ClaimTemplate);
            sessionStorage.setItem("ItemTemplate", ItemTemplate);
            sessionStorage.setItem("VendorDetailsTemplate", VendorDetailsTemplate);
            sessionStorage.setItem("UserDetailsTemplate", UserDetailsTemplate);
            sessionStorage.setItem("claimProfile", claimProfile);
            sessionStorage.setItem("serviceRequests", serviceRequests);
            sessionStorage.setItem("googleShoppingDropdown", googleShoppingDropdown);
            sessionStorage.setItem("jewelryVendor", jewelryVendor);
            sessionStorage.setItem("AdminApiurl", AdminApiurl);
            sessionStorage.setItem("hideCaptcha", hideCaptcha);
            sessionStorage.setItem("loginWithSSO", loginWithSSO);
            sessionStorage.setItem("loginWithSAML",loginWithSAML);

            // disableSerpWow
            sessionStorage.setItem("disableSerpWow", disableSerpWow);
            sessionStorage.setItem("AccessToken",token);
            sessionStorage.setItem("loginScreen", $location.absUrl());
            sessionStorage.setItem("UserId",userid);
            
            sessionStorage.setItem("isCoreLogic",isCoreLogic);


            $location.path('/VendorLogin');
            //$cookieStore.removeAll()
        }
        else {
            var myE2 = angular.element(document.querySelector('.page-wrapper'));
            myE2.removeClass('wrapBoxShodow');
            //document.body.style.backgroundColor = "#364150";
            $(".wrapBoxShodow").css("box-shadow", "0px 1px 16px 1px #364150");
            var APIURL = sessionStorage.getItem("apiurl")
            var ReceiptURL = sessionStorage.getItem("receipturl");
            var ExportURL = sessionStorage.getItem("ExportUrl");
            var Xoriginator = sessionStorage.getItem("Xoriginator");
            var ClaimTemplate = sessionStorage.getItem("ClaimTemplate");
            var ItemTemplate = sessionStorage.getItem("ItemTemplate");
            var VendorDetailsTemplate = sessionStorage.getItem("VendorDetailsTemplate");
            var UserDetailsTemplate = sessionStorage.getItem("UserDetailsTemplate");
            var claimProfile = sessionStorage.getItem("claimProfile");
            var serviceRequests = sessionStorage.getItem("serviceRequests");
            var googleShoppingDropdown = sessionStorage.getItem("googleShoppingDropdown");
            var jewelryVendor = sessionStorage.getItem("jewelryVendor");
            var AdminApiurl = sessionStorage.getItem("AdminApiurl");
            var hideCaptcha = sessionStorage.getItem("hideCaptcha");
            var disableSerpWow = sessionStorage.getItem("disableSerpWow");
            var token = sessionStorage.getItem("AccessToken");
            var userid = sessionStorage.getItem("UserId");
            var loginWithSSO = sessionStorage.getItem("loginWithSSO");
            var loginWithSAML = sessionStorage.getItem("loginWithSAML");
            var isCoreLogic = sessionStorage.getItem("isCoreLogic");
            
            // Clear session data
            sessionStorage.clear();
            UserService.removeUserDetails();
            // window.localStorage.clear();

            sessionStorage.setItem("apiurl", APIURL)
            sessionStorage.setItem("receipturl", ReceiptURL);
            sessionStorage.setItem("ExportUrl", ExportURL);
            sessionStorage.setItem("Xoriginator", Xoriginator);
            sessionStorage.setItem("ClaimTemplate", ClaimTemplate);
            sessionStorage.setItem("ItemTemplate", ItemTemplate);
            sessionStorage.setItem("VendorDetailsTemplate", VendorDetailsTemplate);
            sessionStorage.setItem("UserDetailsTemplate", UserDetailsTemplate);
            sessionStorage.setItem("jewelryVendor", jewelryVendor);
            sessionStorage.setItem("claimProfile", claimProfile);
            sessionStorage.setItem("serviceRequests", serviceRequests);
            sessionStorage.setItem("googleShoppingDropdown", googleShoppingDropdown);
            sessionStorage.setItem("AdminApiurl", AdminApiurl);
            sessionStorage.setItem("hideCaptcha", hideCaptcha);
            sessionStorage.setItem("disableSerpWow", disableSerpWow);
            sessionStorage.setItem("AccessToken",token);
            sessionStorage.setItem("loginScreen", $location.absUrl())
            sessionStorage.setItem("UserId",userid);
            sessionStorage.setItem("loginWithSSO", loginWithSSO);
            sessionStorage.setItem("loginWithSAML",loginWithSAML);
            sessionStorage.setItem("isCoreLogic",isCoreLogic);
                        
            $location.path('/');
        }
    }    

}]);

MetronicApp.config(['KeepaliveProvider', 'IdleProvider', function (KeepaliveProvider, IdleProvider) {
    IdleProvider.idle(28800); // 1800 seconds (30 minutes) / 28800 seconds (8 hour) / 86400 seconds (24 hour)
    IdleProvider.timeout(1);
    KeepaliveProvider.interval(3600); // heartbeat every 1 hour
    
    //IdleProvider.idle(600); // in seconds user ideal time start after 600000
    //IdleProvider.timeout(5); // wait seconds user gets in idel state
    //KeepaliveProvider.interval(2); // in seconds
    //KeepaliveProvider.http('/api/web'); // URL that makes sure session is alive call the method to get the token has expired or not
}]);

/* Setup Layout Part - Sidebar */
MetronicApp.controller('SidebarController', ['$state', '$scope', '$translatePartialLoader', '$translate', '$filter', 'RoleBasedService', function ($state, $scope, $translatePartialLoader, $translate, $filter, RoleBasedService) {
    $scope.$on('$includeContentLoaded', function () {
        Layout.initSidebar($state); // init sidebar
    });
    $translatePartialLoader.addPart('SideBar');
    $translate.refresh();
    $scope.ScreenList;
    //Method should be call on init method
    function init() {
        //It again calling getscreenlist so list is null make anothre method which return screen list form session storage
        $scope.ScreenList = RoleBasedService.GetUserScreenListFromSession();
    }
    init();

    $scope.IsAccess = IsAccess;
    function IsAccess(param) {
        if ($scope.ScreenList === null)
            $scope.ScreenList = RoleBasedService.GetUserScreenListFromSession();
        //var index = $scope.ScreenList.indexOf(param);
        //if(index !==-1)
        //{
        //    return true;
        //}
        //else
        //{
        //    if ("webuser@artigem.com" === sessionStorage.getItem("UserName"))
        //        return true
        //    else
        //    return false;
        //}
        //When need to turn off Role based screen use this and comment above part
        // return true;
        var list = $filter('filter')($scope.ScreenList, { ScreenCode: param });
        if (list.length > 0)
            return true;
        else {
            if ("webuser@artigem.com" === sessionStorage.getItem("UserName"))
                return true;
            else
                return false;
        }
    }
}]);

/* Setup Layout Part - Sidebar */
MetronicApp.controller('PageHeadController', ['$scope', function ($scope) {
    $scope.$on('$includeContentLoaded', function () {
        Demo.init(); // init theme panel
    });
}]);

/* Setup Layout Part - Quick Sidebar */
MetronicApp.controller('QuickSidebarController', ['$scope', function ($scope) {
    $scope.$on('$includeContentLoaded', function () {
        setTimeout(function () {
            QuickSidebar.init(); // init quick sidebar
        }, 2000);
    });
}]);

/* Setup Layout Part - Theme Panel */
MetronicApp.controller('ThemePanelController', ['$scope', function ($scope) {
    $scope.$on('$includeContentLoaded', function () {
        Demo.init(); // init theme panel
    });
}]);

/* Setup Layout Part - Footer */
MetronicApp.controller('FooterController', ['$scope', function ($scope) {
    $scope.$on('$includeContentLoaded', function () {
        Layout.initFooter(); // init footer
    });
}]);

/* Setup Rounting For All Pages */
MetronicApp.config(['$stateProvider', '$urlRouterProvider', '$urlMatcherFactoryProvider', '$httpProvider', function ($stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider, $httpProvider) {
    var AdjusterRole = "ADJUSTER";
    var SupervisorRole = "CLAIM SUPERVISOR";
    var InsuranceAdmin = "INSURANCE COMPANY ADMINISTRATOR";
    var claimManager = "CLAIM MANAGER";
    var Policyholder = "POLICYHOLDER";
    //For case In-sensitive url Ignore case
    $urlMatcherFactoryProvider.caseInsensitive(true);
    $httpProvider.interceptors.push('authInterceptor');

    localStorage.setItem("check", true);
    console.log("localstorage", window.localStorage.getItem("islogedIn"));

    $stateProvider
        .state('login', {
            url: "/login",
            templateUrl: "views/User/Login2.html",
            data: { pageTitle: '' },
            controller: "LoginController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/jquery-validation/js/jquery.validate.min.js',
                            'assets/global/plugins/backstretch/jquery.backstretch.min.js',
                            // 'assets/global/plugins/jquery-validation/js/additional-methods.min.js',
                            'assets/global/plugins/morris/morris.css',
                            'assets/global/plugins/morris/morris.min.js',
                            'assets/global/plugins/morris/raphael-min.js',
                            'assets/global/plugins/jquery.sparkline.min.js',
                            //'assets/pages/css/login.css',
                            'assets/pages/css/login-5.min.css',
                            //'assets/pages/scripts/login-5.js',
                            'assets/login-5.js',
                            'views/User/LoginController.js',
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/LoginService.js'

                        ]
                    });
                }]
            }
        })
        .state('gemlabKeySuccess', {
            url: "/gemlabKeySuccess",
            templateUrl: "views/InsuranceAgent/GemlabLogin/gemlabsuccess.html",
            data: {
                pageTitle: 'gemlabsuccess',
                roles: [InsuranceAdmin]
            },
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        // files: [
                        //     'assets/global/plugins/jquery-validation/js/jquery.validate.min.js',
                        //     'assets/global/plugins/backstretch/jquery.backstretch.min.js',
                        //     // 'assets/global/plugins/jquery-validation/js/additional-methods.min.js',
                        //     'assets/global/plugins/morris/morris.css',
                        //     'assets/global/plugins/morris/morris.min.js',
                        //     'assets/global/plugins/morris/raphael-min.js',
                        //     'assets/global/plugins/jquery.sparkline.min.js',
                        //     //'assets/pages/css/login.css',
                        //     'assets/pages/css/login-5.min.css',
                        //     //'assets/pages/scripts/login-5.js',
                        //     'assets/login-5.js',
                        //     'views/User/LoginController.js',
                        //     'js/Services/CommonServices/AuthHeaderService.js',
                        //     'js/Services/LoginService.js'

                        // ]
                    });
                }]
            }
        })
        .state('forgotpassword', {
            url: "/forgotpassword",
            //templateUrl: "views/User/ForgotPassword.html",
            templateUrl: "views/User/ForgetPass.html",
            data: { pageTitle: 'Forgot Password' },
            controller: "ForgotPasswordController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/pages/css/login-5.min.css',
                            'assets/global/plugins/jquery-validation/js/jquery.validate.min.js',
                            'assets/global/plugins/backstretch/jquery.backstretch.min.js',
                            'assets/pages/scripts/login-5.js',
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ForgetpasswordService.js',
                            'views/User/ForgotPasswordController.js',
                            'js/Services/LoginService.js'
                        ]
                    });
                }]
            }
        })
        .state('submitnewclaimjewelry', {
            url: "/submitnewclaimjewelry",
            templateUrl: "views/User/submitNewClaim.html",
            data: { pageTitle: 'Submit new claim' },
            controller: "submitNewClaimController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            'assets/pages/css/login-5.min.css',
                            'assets/global/plugins/jquery-validation/js/jquery.validate.min.js',
                            'assets/global/plugins/backstretch/jquery.backstretch.min.js',
                            'assets/pages/scripts/login-5.js',
                            'js/commonUtility/utilityMethods.js',
                            'js/Services/CommonServices/AuthHeaderService.js', 
                            'js/Services/submitNewClaimService.js',
                            'views/User/submitNewClaimController.js',
                            'js/Services/LoginService.js'
                        ]
                    });
                }]
            }
        })
        .state('submitnewclaimcontents', {
            url: "/submitnewclaimcontents",
            templateUrl: "views/User/submitNewClaimContents.html",
            data: { pageTitle: 'Submit new claim' },
            controller: "submitNewClaimController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/pages/css/login-5.min.css',
                            'assets/global/plugins/jquery-validation/js/jquery.validate.min.js',
                            'assets/global/plugins/backstretch/jquery.backstretch.min.js',
                            'assets/pages/scripts/login-5.js',
                            'js/commonUtility/utilityMethods.js',
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/submitNewClaimService.js',
                            'views/User/submitNewClaimController.js',
                            'js/Services/LoginService.js',
                        ]
                    });
                }]
            }
        })
        .state('VendorRegistration', {
            url: "/VendorRegistration?VRN",
            templateUrl: "views/VendorRegistration/NewVendorRegistration.html",
            data: {
                pageTitle: '',
                roles: [InsuranceAdmin]
            },
            controller: "NewVendorRegistrationController",
            resolve: {
                id: ['$stateParams', function ($stateParams) {
                    return $stateParams.VRN;
                }],
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/morris/morris.css',
                            'assets/global/plugins/morris/morris.min.js',
                            'assets/global/plugins/morris/raphael-min.js',
                            'assets/global/plugins/jquery.sparkline.min.js',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/pages/css/login.css',
                            'views/VendorRegistration/NewVendorRegistrationController.js',
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/VendorRegistration/NewVendorRegistrationService.js',
                            'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js'
                        ]
                    });
                }]
            }
        })
        .state('register', {
            url: "/register",
            templateUrl: "views/User/RegisterUser.html",
            data: { pageTitle: 'Register' },
            controller: "RegisterController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/pages/css/login.css',
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'js/Services/RegisterUserService.js',
                            'views/User/RegisterController.js'
                        ]
                    });
                }]
            }
        })
        .state('ClaimCenterMangerDashboard', {
            url: "/ManagerDashboard",
            templateUrl: "views/ClaimCenterManager/ClaimCenterManagerDashboard.html",
            data: {
                pageTitle: 'Dashboard',
                roles: [claimManager]
            },
            controller: "ClaimCenterMangerDashboardController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',

                            'assets/global/plugins/datatables/datatables.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',

                            'assets/global/plugins/datatables/datatables.all.min.js',

                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'views/ClaimCenterManager/ClaimCenterManagerDashboard.js',
                            'views/ClaimCenterManager/AssignClaimForManagerController.js',
                            'views/ClaimCenterManager/RejectorApproveClaimController.js',

                            //services
                            'js/Services/ClaimCenterManager/ClaimCenterDashboardService.js',
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ClaimCenterManager/AssignClaimForManagerService.js',
                            'js/Services/ClaimCenterManager/RejectApproveClaimService.js'

                        ]
                    });
                }]
            }
        })
        .state('PropertyFNOLRequest', {
            url: "/PropertyFNOLRequest",
            templateUrl: "views/ClaimCenterManager/ClaimCenterPropertyFNOLRequest.html",
            data: {
                pageTitle: 'FNOL Request',
                roles: [claimManager]
            },
            controller: "ClaimCenterPropertyFNOLRequestController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',

                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',


                            'views/ClaimCenterManager/ClaimCenterPropertyFNOLRequestController.js',
                            'views/ClaimCenterManager/AssignClaimForManagerController.js',
                            'views/ClaimCenterManager/NewItemDamageLostController.js',
                            'views/Adjuster/AddNewLostDamageItemDetailsController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ClaimCenterManager/AssignClaimForManagerService.js',
                            'js/Services/ClaimCenterManager/PropertyFNOLRequestService.js',
                            'js/Services/ClaimCenterManager/NewItemDamageLostService.js'
                        ]
                    });
                }]
            }
        })
        .state('ClaimCenterAllClaims', {
            url: "/ClaimCenterAllClaims",
            templateUrl: "views/ClaimCenterManager/ClaimCenter-AllClaims.html",
            data: { pageTitle: 'My Claims' },
            controller: "ClaimCenter-AllClaimsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'views/ClaimCenterManager/ClaimCenter-AllClaimsController.js',
                            'views/ClaimCenterManager/AssignClaimForManagerController.js',
                            'views/ClaimCenterManager/RejectorApproveClaimController.js',


                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ClaimCenterManager/ClaimCenterMyClaims.js',
                            'js/Services/ClaimCenterManager/AssignClaimForManagerService.js',
                            'js/Services/ClaimCenterManager/RejectApproveClaimService.js']
                    });
                }]
            }
        })
        .state('AllClaims', {
            url: "/AllClaims",
            templateUrl: "views/ClaimCenterManager/AllClaims.html",
            data: {
                pageTitle: 'My Claims',
                roles: [claimManager]
            },
            controller: "AllClaimsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'views/ClaimCenterManager/AllClaimsController.js',
                            'views/ClaimCenterManager/AssignClaimForManagerController.js',
                            'views/ClaimCenterManager/RejectorApproveClaimController.js',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ClaimCenterManager/ClaimCenterMyClaims.js',
                            'js/Services/ClaimCenterManager/AssignClaimForManagerService.js',
                            'js/Services/ClaimCenterManager/RejectApproveClaimService.js',  'js/commonUtility/CommonUtils.js',
                            'Contants/CommonConstants.js'
]
                    });
                }]
            }
        })
        .state('ClaimCenter-ClaimDetails', {
            url: "/ClaimCenter-ClaimDetails",
            templateUrl: "views/ClaimCenterManager/ClaimCenter-ClaimDetails.html",
            data: {
                pageTitle: 'Claim Details',
                roles: [claimManager]
            },
            controller: "ClaimCenter-ClaimDetailsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',

                            'views/ClaimCenterManager/ClaimCenter-ClaimDetailsController.js',
                            'views/ClaimCenterManager/AssignClaimForManagerController.js',
                            'views/ClaimCenterManager/NewItemDamageLostController.js',
                            'views/ClaimCenterManager/RejectorApproveClaimController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ClaimCenterManager/AssignClaimForManagerService.js',
                            'js/Services/ClaimCenterManager/ClaimCenterClaimDetailsService.js',
                            'js/Services/ClaimCenterManager/NewItemDamageLostService.js',
                            'js/Services/ClaimCenterManager/RejectApproveClaimService.js'


                        ]
                    });
                }]
            }
        })

        .state('ClaimSpecialists', {
            url: "/ClaimSpecialists",
            templateUrl: "views/ClaimCenterManager/ClaimSpecialists.html",
            data: {
                pageTitle: 'Claim Specialists',
                roles: [claimManager]
            },
            controller: "ClaimSpecialistsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',

                            'views/ClaimCenterManager/ClaimSpecialistsController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ClaimCenterManager/ClaimSpecialistsService.js'
                        ]
                    });
                }]
            }
        })
        .state('EditClaimSpecialists', {
            url: "/EditClaimSpecialists",
            templateUrl: "views/ClaimCenterManager/EditClaimSpecialists.html",
            data: {
                pageTitle: 'Claim Specialists',
                roles: [claimManager]
            },
            controller: "EditClaimSpecialistsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',

                            'views/ClaimCenterManager/EditClaimSpecialistsController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ClaimCenterManager/EditClaimSpecialistsService.js'
                        ]
                    });
                }]
            }
        })


        .state('UploadClaimFromCSV', {
            url: "/UploadClaimFromCSV",
            templateUrl: "views/UploadClaim/UploadClaimFromCSV.html",
            data: {
                pageTitle: 'Upload Claim',
                roles: [claimManager]
            },
            controller: "UploadClaimFromCSVController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'views/UploadClaim/UploadClaimFromCSVController.js',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/UploadClaim/UploadClaimFromCSVService.js'
                        ]
                    });
                }]
            }
        })

        //#####################################################
        //Adjuster Routes Starts******************************
        //#####################################################
        .state('AdjusterDashboard', {
            url: "/AdjusterDashboard",
            templateUrl: "views/Adjuster/AdjusterDashboard.html",
            data: {
                pageTitle: 'Dashboard',
                roles: [AdjusterRole]
            },
            controller: "AdjusterDashboardController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'views/Adjuster/AdjusterDashboardController.js',
                            'views/CommonTemplates/DashboardAlertsController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Adjuster/AdjusterDashboardService.js',
                            'js/Services/CommonServices/DashboardAlertsService.js'
                        ]
                    });
                }]
            }
        })
        .state('AdjusterPropertyClaimDetails', {
            url: "/AdjusterPropertyClaimDetails",
            templateUrl: "views/Adjuster/AdjusterPropertyClaimDetails.html",
            data: {
                pageTitle: 'Claim Details',
                roles: [AdjusterRole, Policyholder,"CLAIM SPECIALIST"]
            },
            controller: "AdjusterPropertyClaimController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            //end switch css-
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/global/plugins/jquery-multi-select/css/multi-select.css',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/jquery-multi-select/js/jquery.multi-select.js',
                            //controllers
                            'views/Adjuster/AdjusterPropertyClaimDetails.js',
                            'views/Adjuster/AdjusterListController.js',
                            'views/Adjuster/AdjusterReAssignController.js',
                            'views/ClaimCenterManager/NewItemDamageLostController.js',
                            'views/Adjuster/AddNewLostDamageItemDetailsController.js',
                            'views/Adjuster/AddNewVendorController.js',
                            'views/Adjuster/ItemValueController.js',
                            'views/Adjuster/ItemPayoutController.js',
                            'views/Adjuster/AssignPostLostItemController.js',
                            'views/Adjuster/ShowNotesAttachmentController.js',
                            'views/Adjuster/ShowClaimAttachmentController.js',
                            'views/CommonTemplates/AddNotePopupController.js',
                            'views/Adjuster/AddEventPopupController.js',
                            'views/Adjuster/AddRequestPopupController.js',
                            'views/Adjuster/NewClaimFormPopupController.js',
                            'views/Adjuster/EventDetailsController.js',
                            'views/Adjuster/RequestDetailsController.js',
                            'views/Adjuster/InvoicePaymentPopupController.js',
                            'views/ClaimFormDetails/ClaimFormDetailsController.js',
                            'views/Reports/ReportController.js',
                            'views/ActivityLog/ActivityLogController.js',
                            'views/Policy/PolicyDetailsController.js',
                            'views/CommonTemplates/CategoryChangePopUpController.js',
                            'views/CommonTemplates/AddItemPopupController.js',
                            'views/AllReplQuotes/AllReplQuotesController.js',
                            'views/CommonTemplates/ClaimDocumentsController.js',
                            'views/Adjuster/ConversationController.js',
                            'views/PolicyHolder/CompleteTaskPopupController.js',
                            'views/Adjuster/itemAssignmentPopUpController.js',
                            'views/Adjuster/AssignmentRatingPopUpController.js',
                            'views/ActivityLog/AddCustomActivityLogController.js',
                            'views/CommonTemplates/CheckPopupController.js',
                            'views/CommonTemplates/UpdateInviteUserPopupController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js',
                            'js/Services/Adjuster/AdjusterListService.js',
                            'js/Services/Adjuster/AdjusterItemPayoutService.js',
                            'js/Services/Adjuster/AdjusterItemValueService.js',
                            'js/Services/Adjuster/NewClaimFormPopupService.js',
                            'js/Services/ClaimCenterManager/NewItemDamageLostService.js',
                            'js/Services/Adjuster/EventService.js',
                            'js/Services/Adjuster/RequestService.js',
                            'js/Services/Report/ReportService.js',
                            'js/Services/ActivityLog/ActivityLogService.js',
                            'js/Services/Policy/PolicyDetailsService.js',
                            'js/Services/CommonServices/LineItemService.js',
                            'js/Services/Adjuster/ReceiptMapperService.js',
                            'js/Services/AllReplQuotes/AllReplQuotesService.js',
                            'js/Services/ClaimDocuments/ClaimDocumentsService.js',
                            'js/Services/PolicyHolder/PolicyHolderClaimDetailsService.js',
                            //CSS
                            'Css/claims/propertyClaims.css',
                            //For note details
                            'views/AllNotes/NoteDetailsController.js',
                            'js/Services/Adjuster/AdjusterLineItemDetailsService.js',
                            'js/commonUtility/utilityMethods.js',
                            //Factory
                            'js/factory/LineItemsFactory.js',
                            //Constants
                            'Contants/StatusConstants.js'
                            
                        ]
                    });
                }]
            }
        })
        .state('CorelogicAdjusterPropertyClaimDetails', {
            url: "/CorelogicAdjusterPropertyClaimDetails",
            templateUrl: "views/CorelogicAdjuster/AdjusterPropertyClaimDetails.html",
            data: {
                pageTitle: 'Claim Details',
                roles: [AdjusterRole, Policyholder]
            },
            controller: "AdjusterPropertyClaimController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            //end switch css-
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/global/plugins/jquery-multi-select/css/multi-select.css',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/jquery-multi-select/js/jquery.multi-select.js',
                            //controllers
                            'views/CorelogicAdjuster/AdjusterPropertyClaimDetails.js',
                            'views/CorelogicAdjuster/AdjusterListController.js',
                            'views/CorelogicAdjuster/AdjusterReAssignController.js',
                            'views/ClaimCenterManager/NewItemDamageLostController.js',
                            'views/CorelogicAdjuster/AddNewLostDamageItemDetailsController.js',
                            'views/CorelogicAdjuster/AddNewVendorController.js',
                            'views/CorelogicAdjuster/ItemValueController.js',
                            'views/CorelogicAdjuster/ItemPayoutController.js',
                            'views/CorelogicAdjuster/AssignPostLostItemController.js',
                            'views/CorelogicAdjuster/ShowNotesAttachmentController.js',
                            'views/CorelogicAdjuster/ShowClaimAttachmentController.js',
                            'views/CommonTemplates/AddNotePopupController.js',
                            'views/CorelogicAdjuster/AddEventPopupController.js',
                            'views/CorelogicAdjuster/AddRequestPopupController.js',
                            'views/CorelogicAdjuster/NewClaimFormPopupController.js',
                            'views/CorelogicAdjuster/EventDetailsController.js',
                            'views/CorelogicAdjuster/RequestDetailsController.js',
                            'views/CorelogicAdjuster/InvoicePaymentPopupController.js',
                            'views/ClaimFormDetails/ClaimFormDetailsController.js',
                            'views/Reports/ReportController.js',
                            'views/ActivityLog/ActivityLogController.js',
                            'views/Policy/PolicyDetailsController.js',
                            'views/CommonTemplates/CategoryChangePopUpController.js',
                            'views/CommonTemplates/AddItemPopupController.js',
                            'views/AllReplQuotes/AllReplQuotesController.js',
                            'views/CommonTemplates/ClaimDocumentsController.js',
                            'views/CorelogicAdjuster/ConversationController.js',
                            'views/PolicyHolder/CompleteTaskPopupController.js',
                            'views/CorelogicAdjuster/itemAssignmentPopUpController.js',
                            'views/CorelogicAdjuster/AssignmentRatingPopUpController.js',
                            'views/ActivityLog/AddCustomActivityLogController.js',
                            'views/CommonTemplates/CheckPopupController.js',
                            'views/CommonTemplates/UpdateInviteUserPopupController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js',
                            'js/Services/Adjuster/AdjusterListService.js',
                            'js/Services/Adjuster/AdjusterItemPayoutService.js',
                            'js/Services/Adjuster/AdjusterItemValueService.js',
                            'js/Services/Adjuster/NewClaimFormPopupService.js',
                            'js/Services/ClaimCenterManager/NewItemDamageLostService.js',
                            'js/Services/Adjuster/EventService.js',
                            'js/Services/Adjuster/RequestService.js',
                            'js/Services/Report/ReportService.js',
                            'js/Services/ActivityLog/ActivityLogService.js',
                            'js/Services/Policy/PolicyDetailsService.js',
                            'js/Services/CommonServices/LineItemService.js',
                            'js/Services/Adjuster/ReceiptMapperService.js',
                            'js/Services/AllReplQuotes/AllReplQuotesService.js',
                            'js/Services/ClaimDocuments/ClaimDocumentsService.js',
                            'js/Services/PolicyHolder/PolicyHolderClaimDetailsService.js',
                            //CSS
                            'Css/claims/propertyClaims.css',
                            //For note details
                            'views/AllNotes/NoteDetailsController.js',
                            'js/Services/Adjuster/AdjusterLineItemDetailsService.js',
                            'js/commonUtility/utilityMethods.js',
                            //Factory
                            'js/factory/LineItemsFactory.js',
                            //Constants
                            'Contants/StatusConstants.js',
                            'Contants/CorelogicConstants.js',
                            
                        ]
                    });
                }]
            }
        })
        .state('CorelogicSupervisorClaimDetails', {
            url: "/CorelogicSupervisorClaimDetails",
            templateUrl: "views/CorelogicClaimsSupervisor/SupervisorClaimDetails.html",
            data: {
                pageTitle: 'Claim Details',
                roles: [SupervisorRole]
            },
            controller: "SupervisorClaimDetailsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [

                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/fullcalendar.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            //controllers
                            'views/CorelogicClaimsSupervisor/SupervisorClaimDetailsController.js',
                            'views/CorelogicClaimsSupervisor/AddNewVendorController.js',
                            'views/CorelogicClaimsSupervisor/ShowNotesAttachmentController.js',
                            'views/CorelogicClaimsSupervisor/ShowClaimAttachmentController.js',
                            'views/CorelogicAdjuster/AddEventPopupController.js',
                            'views/CorelogicAdjuster/NewClaimFormPopupController.js',
                            'views/CorelogicAdjuster/EventDetailsController.js',
                            'views/CorelogicAdjuster/InvoicePaymentPopupController.js',
                            'views/Reports/ReportController.js',
                            'views/CorelogicAdjuster/AdjusterReAssignController.js',
                            'views/ActivityLog/ActivityLogController.js',
                            'views/CorelogicAdjuster/AddRequestPopupController.js',
                            'views/CorelogicAdjuster/RequestDetailsController.js',
                            'views/Policy/PolicyDetailsController.js',
                            'views/CommonTemplates/CategoryChangePopUpController.js',
                            'views/CommonTemplates/StatusChangePopUpController.js',
                            'views/CorelogicAdjuster/ConversationController.js',
                            'views/ActivityLog/AddCustomActivityLogController.js',

                            //CTB-2689
                            'views/AllReplQuotesSupervisor/AllReplQuotesSupervisorController.js',
                            'views/CommonTemplates/ClaimDocumentsController.js',
                            'views/CommonTemplates/AddNotePopupController.js',
                            'views/CommonTemplates/AddItemPopupController.js',
                            //Services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ClaimSupervisor/SupervisorClaimDetailsService.js',
                            'js/Services/Adjuster/NewClaimFormPopupService.js',
                            'js/Services/Adjuster/EventService.js',
                            'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js',
                            'js/Services/Report/ReportService.js',
                            'js/Services/ClaimSupervisor/AdjusterListService.js',
                            'js/Services/ActivityLog/ActivityLogService.js',
                            'js/Services/Adjuster/RequestService.js',
                            'js/Services/Policy/PolicyDetailsService.js',
                            'js/Services/Adjuster/NewClaimService.js',
                            'js/Services/CommonServices/LineItemService.js',
                            'js/Services/ClaimDocuments/ClaimDocumentsService.js',
                            'js/Services/Adjuster/ReceiptMapperService.js',
                            //CSS
                            'Css/claims/propertyClaims.css',
                            //For note details
                            'views/AllNotes/NoteDetailsController.js',
                            'js/factory/LineItemsFactory.js',
                            'js/Services/Adjuster/AdjusterLineItemDetailsService.js',
                            'js/commonUtility/utilityMethods.js',
                            'Contants/StatusConstants.js',
                            //CTB-2689
                            'js/Services/AllReplQuotes/AllReplQuotesService.js',
                            'Contants/CorelogicConstants.js',
                        ]
                    });
                }]
            }
        })

        .state('AdjusterLineItemDetails', {
            url: "/AdjusterLineItemDetails",
            templateUrl: "views/Adjuster/AdjusterLineItemDetails.html",
            data: {
                pageTitle: 'Line Item Details',
                roles: [AdjusterRole, Policyholder]
            },
            controller: "AdjusterLineItemDetailsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before',
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                            'assets/layouts/layout4/scripts/IPadResolution.js',
                            'assets/global/plugins/bootstrap-switch/css/bootstrap-switch.min.css',                            
                            //end switch css-
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/global/plugins/jquery-multi-select/css/multi-select.css',
                            'assets/global/plugins/jquery-multi-select/js/jquery.multi-select.js',                            //start switch js-
                            'assets/global/plugins/bootstrap-switch/js/bootstrap-switch.min.js',
                            //end switch js
                            'assets/pages/scripts/ui-bootstrap-tpls-0.13.0.js',

                            'views/Adjuster/ItemValueController.js',
                            'views/Adjuster/ItemPayoutController.js',
                            'views/Adjuster/AdjusterListController.js',
                            'views/Adjuster/AdjusterLineItemDetailsController.js',
                            'views/ClaimCenterManager/AssignClaimForManagerController.js',
                            'views/Adjuster/AdjusterComparablesListController.js',
                            'views/Adjuster/AssignLineItem.js',
                            'views/Salvage/SalvageDetailsController.js',
                            'views/ActivityLog/ActivityLogController.js',
                            'views/CommonTemplates/AddNotePopupController.js',
                            'views/CommonTemplates/AddItemNotePopupController.js',
                            'views/ComparableFilter/ComparableFilerController.js',
                            'views/Adjuster/ConversationController.js',
                            'views/Adjuster/AddCustomItemPopupController.js',
                            'views/CommonTemplates/PolicyholderSMSReviewPopupController.js',
                            'views/CommonTemplates/PolicyholderEmailReviewPopupController.js',
                            'views/CommonTemplates/JewelryPolicyHolderReviewController.js',
                            'views/CommonTemplates/JewelryCustomComparableController.js',
                            'views/Salvage/AddConfirmationPopupController.js',

                            //services
                            'js/Services/CustomJewelryComparable/JewelryCustomComparableService.js',
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Adjuster/AdjusterListService.js',
                            'js/Services/Adjuster/AdjusterLineItemDetailsService.js',
                            'js/Services/Adjuster/AdjusterComparablesListService.js',
                            'js/Services/Adjuster/AdjusterItemPayoutService.js',
                            'js/Services/Adjuster/AdjusterItemValueService.js',
                            'js/Services/Adjuster/AssignLineItem.js',
                            'js/Services/Adjuster/ItemValueService.js',
                            'js/Services/PolicyHolder/PolicyHolderClaimDetailsService.js',
                            'js/Services/Salvage/SalvageService.js',
                            'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js',
                            'js/Services/ActivityLog/ActivityLogService.js',
                            'js/Services/ClaimSupervisor/SupervisorLineItemService.js',
                            'js/Services/ComparableService/ComparableFilterService.js',
                            'js/Services/ContractService/ContractService.js',
                            'js/Services/CommonServices/LineItemService.js',
                            'js/scripts/html2canvas.min.js',
                            'js/Services/CommonServices/ItemDetailService.js',
                            //Utility methods
                            'js/commonUtility/utilityMethods.js',
                            //Factory
                            'js/factory/LineItemsFactory.js',
                            'Contants/StatusConstants.js',
                            //Utility
                            'js/commonUtility/utilityMethods.js',
                        ]
                    });
                }]
            }
        })
        .state('NewClaim', {
            url: "/NewClaim",
            templateUrl: "views/Adjuster/NewClaim.html",
            data: {
                pageTitle: 'New Claim',
                roles: [AdjusterRole]
            },
            controller: "NewClaimController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            'views/Adjuster/NewClaimController.js',
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Adjuster/NewClaimService.js',
                            'js/commonUtility/utilityMethods.js',
                            'views/Adjuster/itemAssignmentPopUpController.js',
                            'views/CommonTemplates/AddItemPopupController.js',
                            'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js',
                            'js/Services/Adjuster/AdjusterLineItemDetailsService.js',
                            'js/factory/LineItemsFactory.js',
                            'Contants/StatusConstants.js'

                        ]
                    });
                }]
            }
        })
        .state('ClaimSpecialistHome', {
            url: "/ClaimSpecialistHome",
            templateUrl: "views/ClaimCenterManager/ClaimSpecialistHome.html",
            data: {
                pageTitle: 'Claim Specialists',
                roles: [AdjusterRole, SupervisorRole, claimManager]
            },
            controller: "ClaimSpecialistHomeController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',

                            'views/ClaimCenterManager/ClaimSpecialistHomeController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ClaimCenterManager/ClaimSpecialistHomeService.js'
                        ]
                    });
                }]
            }
        })
        .state('SearchClaimSpecialists', {
            url: "/SearchClaimSpecialists",
            templateUrl: "views/ClaimCenterManager/SearchClaimSpecialists.html",
            data: {
                pageTitle: 'Specialists',
                roles: [AdjusterRole, SupervisorRole, claimManager]
            },
            controller: "SearchClaimSpecialistsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'views/ClaimCenterManager/SearchClaimSpecialistsController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ClaimCenterManager/SearchClaimSpecialistsService.js'
                        ]
                    });
                }]
            }
        })
        .state('NewClaimSpecialist', {
            url: "/NewClaimSpecialist",
            templateUrl: "views/ClaimCenterManager/NewClaimSpecialist.html",
            data: {
                pageTitle: 'Claim Specialist',
                roles: [AdjusterRole, SupervisorRole, claimManager]
            },
            controller: "NewClaimSpecialistController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'views/ClaimCenterManager/NewClaimSpecialistController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ClaimCenterManager/NewClaimSpecialistService.js'
                        ]
                    });
                }]
            }
        })
        .state('AdjusterServiceRequest', {
            url: "/AdjusterServiceRequest",
            templateUrl: "views/Adjuster/AdjusterServiceRequest.html",
            data: {
                pageTitle: 'Edit Service Request',
                roles: [AdjusterRole]
            },
            controller: "AdjusterServiceRequestController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            //services
                            'js/Services/Adjuster/AdjusterServiceRequestService.js',
                            'js/Services/CommonServices/AuthHeaderService.js',
                            //controller
                            'views/Adjuster/AdjusterServiceRequestController.js',




                        ]
                    });
                }]
            }
        })
        .state('AdjusterServiceRequestEdit', {
            url: "/AdjusterServiceRequestEdit",
            templateUrl: "views/Adjuster/AdjusterServiceRequestEdit.html",
            data: {
                pageTitle: 'Edit Service Request',
                roles: [AdjusterRole]
            },
            controller: "AdjusterServiceRequestEditController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',

                            //services
                            'js/Services/Adjuster/AdjusterServiceRequestService.js',
                            'js/Services/CommonServices/AuthHeaderService.js',
                            //controller
                            'views/Adjuster/AdjusterServiceRequestEditController.js',

                        ]
                    });
                }]
            }
        })
        .state('AdjusterMyClaims', {
            url: "/AdjusterMyClaims",
            templateUrl: "views/Adjuster/AdjusterMyClaims.html",
            data: {
                pageTitle: 'My Claims',
                roles: [AdjusterRole]
            },
            controller: "AdjusterMyClaimsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'views/Adjuster/AdjusterMyClaimsController.js',
                            'views/ClaimCenterManager/AssignClaimForManagerController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Adjuster/AdjusterMyClaimsService.js',
                            'js/Services/ClaimCenterManager/AssignClaimForManagerService.js'

                        ]
                    });
                }]
            }
        })
        .state('AddItem', {
            url: "/AddItem",
            templateUrl: "views/Adjuster/AddItem.html",
            data: {
                pageTitle: 'Add Item',
                roles: [AdjusterRole]
            },
            controller: "AdjusterPropertyClaimController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            //controllers
                            'views/Adjuster/AdjusterPropertyClaimDetails.js',
                            'views/Adjuster/AdjusterListController.js',
                            'views/ClaimCenterManager/NewItemDamageLostController.js',
                            'views/Adjuster/AddNewLostDamageItemDetailsController.js',
                            'views/Adjuster/AddNewVendorController.js',
                            'views/Adjuster/ItemValueController.js',
                            'views/Adjuster/ItemPayoutController.js',
                            'views/Adjuster/AssignPostLostItemController.js',
                            'views/Adjuster/ShowNotesAttachmentController.js',
                            'views/Adjuster/ShowClaimAttachmentController.js',
                            'views/CommonTemplates/AddNotePopupController.js',
                            'views/Adjuster/AddEventPopupController.js',
                            'views/Adjuster/NewClaimFormPopupController.js',
                            'views/Adjuster/EventDetailsController.js',
                            'views/ClaimFormDetails/ClaimFormDetailsController.js',
                            'views/Adjuster/ConversationController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js',
                            'js/Services/Adjuster/AdjusterListService.js',
                            'js/Services/Adjuster/AdjusterItemPayoutService.js',
                            'js/Services/Adjuster/NewClaimService.js',
                            'js/Services/Adjuster/AdjusterItemValueService.js',
                            'js/Services/Adjuster/NewClaimFormPopupService.js',
                            'js/Services/ClaimCenterManager/NewItemDamageLostService.js',
                            'js/Services/Adjuster/EventService.js',
                            //For note details
                            'views/AllNotes/NoteDetailsController.js',
                            'js/Services/Adjuster/AdjusterLineItemDetailsService.js',

                            //Factory
                            'js/factory/LineItemsFactory.js',
                            'views/CommonTemplates/CheckPopupController.js'
                        ]
                    });
                }]
            }
        })
        .state('AdjusterAllClaims', {
            url: "/AdjusterAllClaims",
            templateUrl: "views/AllClaims/AllClaims.html",
            data: {
                pageTitle: 'My Claims',
                roles: [AdjusterRole]
            },
            controller: "AdjusterAllClaimsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'views/AllClaims/AllClaimController.js',
                            'assets/global/plugins/kendo/css/kendo.common-material.min.css',
                            'assets/global/plugins/kendo/css/kendo.material.min.css',
                            'assets/global/plugins/kendo/css/kendo.material.mobile.min.css',
                            'assets/pages/scripts/kendo.all.min.js',
                        
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/AllClaims/AllClaimsServices.js',
                            'js/Services/Adjuster/AdjusterDashboardService.js',
                            'js/commonUtility/utilityMethods.js',
                            'js/commonUtility/utility.js',
                            'js/commonUtility/CommonUtils.js',
                            'Contants/CommonConstants.js'

                        ]
                    });
                }]
            }
        })
        .state('ViewQuote', {
            url: "/ViewQuote",
            templateUrl: "views/Adjuster/ViewQuote.html",
            data: {
                pageTitle: 'View Quote',
                roles: [AdjusterRole, SupervisorRole]
            },
            controller: "ViewQuoteController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',

                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',

                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                            'assets/layouts/layout4/scripts/IPadResolution.js',
                            //start switch css-

                            'assets/global/plugins/bootstrap-switch/css/bootstrap-switch.min.css',

                            //end switch css-

                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/global/plugins/jquery-multi-select/css/multi-select.css',


                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/jquery-multi-select/js/jquery.multi-select.js',

                            //start switch js-
                            'assets/global/plugins/bootstrap-switch/js/bootstrap-switch.min.js',
                            //end switch js

                            'views/Adjuster/ViewQuoteController.js',
                            'views/Adjuster/ViewQuoteApprovePopUpController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Adjuster/QuoteService.js'
                        ]
                    });
                }]
            }
        })
        .state('AdjusterGlobalSearch', {
            url: "/AdjusterGlobalSearch",
            templateUrl: "views/Adjuster/AdjusterGlobalSearch.html",
            data: { pageTitle: 'Search Result', roles: [AdjusterRole] },
            controller: "AdjusterGlobalSearchController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',

                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',

                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'views/Adjuster/AdjusterGlobalSearchController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Adjuster/AdjusterDashboardService.js',
                            'views/GlobalSearch/DocumentDetailsController.js'
                        ]
                    });
                }]
            }
        })

        .state('AssignPostLostItem', {
            url: "/AssignPostLostItem",
            templateUrl: "views/Adjuster/AssignPostLostItem.html",
            data: { pageTitle: 'Assign Line Items' },
            controller: "AssignPostLostItemController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',

                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',

                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

                            'views/Adjuster/AdjusterPropertyClaimDetails.js',
                            'views/Adjuster/AdjusterListController.js',
                            'views/ClaimCenterManager/NewItemDamageLostController.js',
                            'views/Adjuster/AddNewLostDamageItemDetailsController.js',
                            //'views/Adjuster/AddNewVendorController.js',
                            //'views/Adjuster/ItemValueController.js',
                            //'views/Adjuster/ItemPayoutController.js',
                            'views/Adjuster/AssignPostLostItemController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js',
                            'js/Services/Adjuster/AdjusterListService.js',
                            //'js/Services/Adjuster/AdjusterItemPayoutService.js',
                            //'js/Services/Adjuster/AdjusterItemValueService.js',
                            'js/Services/ClaimCenterManager/NewItemDamageLostService.js'

                        ]
                    });
                }]
            }
        })
        .state('AdjusterClaimInProgress', {
            url: "/AdjusterClaimInProgress",
            templateUrl: "views/Adjuster/AdjusterClaimsInProgress.html",
            data: {
                pageTitle: 'Claims In Progress'
            },
            controller: "AdjusterClaimsInProgressController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'views/Adjuster/AdjusterClaimsInProgressContorller.js',
                            'views/Adjuster/AdjusterListController.js',
                            'views/Adjuster/MyDraftController.js',
                            'views/Adjuster/InProgressController.js',
                            'views/Adjuster/WaitingForApprovalController.js',
                            'views/Adjuster/DeclinedController.js',
                            'views/ClaimCenterManager/RejectorApproveClaimController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Adjuster/AdjusterClaimsInProgressService.js',
                            'js/Services/Adjuster/AdjusterListService.js',
                            'js/Services/Adjuster/AdjusterMyDraftService.js',
                            'js/Services/ClaimCenterManager/RejectApproveClaimService.js'

                        ]
                    });
                }]
            }
        })
        .state('ItemsSetteled',
            {
                url: "/ItemsSetteled",
                templateUrl: "views/Adjuster/ItemsSetteled.html",
                data: { pageTitle: 'Items Settled' },
                controller: "ItemsSetteledController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',

                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',

                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'views/Adjuster/ItemsSetteledController.js'
                                //services
                                //'js/Services/CommonServices/AuthHeaderService.js'
                            ]
                        });
                    }]
                }
            })
        .state('ItemsToBeSetteled',
            {
                url: "/ItemsToBeSetteled",
                templateUrl: "views/Adjuster/ItemsToBeSettled.html",
                data: { pageTitle: 'Items To Be Settled' },
                controller: "ItemsToBeSettledController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',

                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',

                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'views/Adjuster/ItemsToBeSettledController.js',
                                //services
                                'js/Services/CommonServices/AuthHeaderService.js',
                                'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js'
                            ]
                        });
                    }]
                }
            })
        .state('ItemsHoldover',
            {
                url: "/ItemsHoldover",
                templateUrl: "views/Adjuster/ItemsHoldover.html",
                data: { pageTitle: 'Holdover' },
                controller: "ItemsHoldoverController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',

                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'views/Adjuster/ItemsHoldoverController.js'
                                //services
                                //'js/Services/CommonServices/AuthHeaderService.js'
                            ]
                        });
                    }]
                }
            })
        .state('VendorInvoices',
            {
                url: "/VendorInvoices",
                templateUrl: "views/Adjuster/VendorInvoices.html",
                data: {
                    pageTitle: 'Vendor Invoices',
                    roles: [AdjusterRole]
                },
                controller: "VendorInvoicesController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',

                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'views/Adjuster/VendorInvoicesController.js',

                                //services
                                'js/Services/CommonServices/AuthHeaderService.js',
                                'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js'
                            ]
                        });
                    }]
                }
            })
        .state('VendorInvoiceDetails',
            {
                url: "/VendorInvoiceDetails",
                templateUrl: "views/Adjuster/VendorInvoiceDetails.html",
                data: {
                    pageTitle: 'Vendor Invoice',
                    roles: [AdjusterRole, SupervisorRole, claimManager]
                },
                controller: "VendorInvoiceDetailsController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',

                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'views/Adjuster/VendorInvoiceDetailsController.js',
                                'views/Contract/ContractPopupController.js',

                                //services
                                'js/Services/CommonServices/AuthHeaderService.js',
                                'js/Services/Adjuster/VenderInvoiceDetailsService.js',
                                'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js',
                                'js/Services/Adjuster/AccountPayableService.js'
                            ]
                        });
                    }]
                }
            })
        .state('ThirdPartyVendor',
            {
                url: "/ThirdPartyVendor",
                templateUrl: "views/Adjuster/ThirdPartyVendor.html",
                data: { pageTitle: 'Third Party Vendor' },
                controller: "ThirdPartyVendorController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                                'views/Adjuster/ThirdPartyVendorController.js',
                                //services
                                'js/Services/CommonServices/AuthHeaderService.js',
                                'js/Services/Adjuster/ThirdPartyVendorService.js'
                            ]
                        });
                    }]
                }
            })
        .state('AdjusterThirdPartyVendor',
            {
                url: "/AdjusterThirdPartyVendor",
                templateUrl: "views/Adjuster/AdjusterThirdPartyVendor.html",
                data: {
                    pageTitle: 'Third Party Vendor',
                    roles: [SupervisorRole, AdjusterRole, claimManager]
                },
                controller: "AdjusterThirdPartyVendorController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                                'views/Adjuster/AdjusterThirdPartyVendorController.js',
                                //services
                                'js/Services/CommonServices/AuthHeaderService.js',
                                'js/Services/Adjuster/ThirdPartyVendorService.js'
                            ]
                        });
                    }]
                }
            })
        .state('AdjusterVendorDetails',
            {
                url: "/AdjusterVendorDetails",
                templateUrl: "views/Adjuster/AdjusterVendorDetails.html",
                data: {
                    pageTitle: 'Vendor Details',
                    roles: [SupervisorRole, AdjusterRole, claimManager]
                },
                controller: "AdjusterVendorDetailsController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',

                                //Controller
                                'views/Adjuster/AdjusterVendorDetailsController.js',
                                //services
                                'js/Services/CommonServices/AuthHeaderService.js',
                                'js/Services/Adjuster/AdjusterCatalogService.js',
                                //services
                                'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js',
                                'js/Services/Adjuster/ThirdPartyContractService.js',
                                'views/Contract/ContractsController.js',
                                'js/Services/ContractService/ContractService.js'
                            ]
                        });
                    }]
                }
            })

        .state('NewThirdPartyVendor',
            {
                url: "/NewThirdPartyVendor",
                templateUrl: "views/Adjuster/NewThirdPartyVendor.html",
                data: {
                    pageTitle: 'Third Party Vendor',
                    roles: [InsuranceAdmin]
                },
                controller: "NewThirdPartyVendorController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',

                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                'assets/pages/scripts/components-date-time-pickers.min.js',
                                'views/Adjuster/NewThirdPartyVendorController.js',
                                //services
                                'js/Services/CommonServices/AuthHeaderService.js',
                                'js/Services/Adjuster/AdjusterCatalogService.js',
                                'js/commonUtility/utilityMethods.js',
                                //services
                                'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js',
                                'js/Services/Adjuster/ThirdPartyContractService.js'
                            ]
                        });
                    }]
                }
            })
        .state('ServiceRequestInvoicesVendor',
            {
                url: "/ServiceRequestInvoicesVendor",
                templateUrl: "views/ThirdPartyVendor/ServiceRequestInvoicesVendor.html",
                data: { pageTitle: 'Third Party Vendor' },
                controller: "ServiceRequestInvoicesVendorController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',

                                'views/ThirdPartyVendor/ServiceRequestInvoicesVendorController.js',
                                //services
                                'js/Services/CommonServices/AuthHeaderService.js',

                                'js/Services/ThirdPartyVendor/ServiceRequestInvoicesVendorService.js'
                            ]
                        });
                    }]
                }
            })
        .state('ServiceRequestInvoicesAssociate',
            {
                url: "/ServiceRequestInvoicesAssociate",
                templateUrl: "views/VendorAssociate/ServiceRequestInvoicesAssociate.html",
                data: { pageTitle: 'Associate' },
                controller: "ServiceRequestInvoicesAssociateController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                'views/VendorAssociate/ServiceRequestInvoicesAssociateController.js',
                                //services
                                'js/Services/CommonServices/AuthHeaderService.js',
                                'js/Services/VendorAssociate/ServiceRequestInvoicesAssociateService.js'
                            ]
                        });
                    }]
                }
            })
        .state('ServiceRequestInvoices',
            {
                url: "/ServiceRequestInvoices",
                templateUrl: "views/ClaimsSupervisor/ServiceRequestInvoices.html",
                data: { pageTitle: 'SuperVisor' },
                controller: "ServiceRequestInvoicesController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                'views/ClaimsSupervisor/ServiceRequestInvoicesController.js',
                                //services
                                'js/Services/CommonServices/AuthHeaderService.js',
                                'js/Services/ClaimSupervisor/ServiceRequestInvoicesService.js'
                            ]
                        });
                    }]
                }
            })
        .state('ServiceRequestInvoiceDetails',
            {
                url: "/ServiceRequestInvoiceDetails",
                templateUrl: "views/ClaimsSupervisor/ServiceRequestInvoiceDetails.html",
                data: { pageTitle: 'Invoice Details' },
                controller: "ServiceRequestInvoiceDetailsController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                'views/ClaimsSupervisor/ServiceRequestInvoiceDetailsController.js',
                                //services
                                'js/Services/CommonServices/AuthHeaderService.js',
                                'js/Services/ClaimSupervisor/SupervisorClaimDetailsService.js',
                                'js/Services/ClaimSupervisor/VendorInvoiceDetailsService.js'
                            ]
                        });
                    }]
                }
            })
        .state('AdjusterInviteVendor',
            {
                url: "/AdjusterInviteVendor",
                templateUrl: "views/Adjuster/AdjusterInviteVendor.html",
                data: { pageTitle: 'Invite Third Party Vendor' },
                controller: "AdjusterInviteVendorController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',

                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',


                                'views/Adjuster/AdjusterInviteVendorController.js',

                                //services
                                'js/Services/CommonServices/AuthHeaderService.js',
                                'js/Services/Adjuster/ThirdPartyVendorService.js'
                            ]
                        });
                    }]
                }
            })
        .state('AdjusterEditVendor',
            {
                url: "/AdjusterEditVendor",
                templateUrl: "views/Adjuster/AdjusterEditVendor.html",
                data: { pageTitle: 'Edit Third Party Vendor' },
                controller: "AdjusterEditVendorController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',

                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',


                                'views/Adjuster/AdjusterEditVendorController.js',

                                //services
                                'js/Services/CommonServices/AuthHeaderService.js',
                                'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js'

                            ]
                        });
                    }]
                }
            })
        .state('ReceiptMapperHome', {
            url: "/ReceiptMapperHome",
            templateUrl: "views/Adjuster/ReceiptMapperHome.html",
            data: {
                pageTitle: 'Receipt Mapper Home',
                roles: [SupervisorRole, AdjusterRole]
            },
            controller: "ReceiptMapperHomeController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'views/Adjuster/ReceiptMapperHomeController.js',
                            'views/Adjuster/ReceiptMapperLabelController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Adjuster/ReceiptMapperService.js',
                            'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js',
                            //Constants
                            'Contants/StatusConstants.js'

                        ]
                    });
                }]
            }
        })
        .state('AttachmentMapping', {
            url: "/AttachmentMapping",
            templateUrl: "views/Adjuster/AttachmentMapping.html",
            data: {
                pageTitle: 'Attachment Mapping',
                roles: [AdjusterRole, SupervisorRole]
            },
            controller: "AttachmentMappingController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'views/Adjuster/AttachmentMappingController.js',
                            //'views/Adjuster/ReceiptMapperLabelController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Adjuster/DocumentMappingService.js'
                        ]
                    });
                }]
            }
        })
        .state('AdjusterAssignServiceRequest', {
            url: "/AdjusterAssignServiceRequest",
            templateUrl: "views/Adjuster/AdjusterAssignServiceRequest.html",
            data: {
                pageTitle: 'Assign Service Request',
                roles: [AdjusterRole]
            },
            controller: "AdjusterAssignServiceRequesttController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            //controller
                            'views/Adjuster/AdjsuterAssignServiceRequestController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Adjuster/AdjusterServiceRequestService.js'
                        ]
                    });
                }]
            }
        })
        //Comapany
        .state('Company', {
            url: "/Company",
            templateUrl: "views/Company/CompanyHome.html",
            data: {
                pageTitle: 'Company',
                roles: [InsuranceAdmin]
            },
            controller: "CompanyHomeController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            'views/Company/CompanyHomeController.js',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Company/CompanyHomeService.js'
                        ]
                    });
                }]
            }
        })
        //Departments
        .state('Departments',
            {
                url: "/Departments",
                templateUrl: "views/Administrator/Departments.html",
                data: {
                    pageTitle: 'Departments',
                    roles: [InsuranceAdmin]
                },
                controller: "DepartmentsController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                //Controller
                                'views/Administrator/DepartmentsController.js',
                                'views/Administrator/SelectEmpPopUpController.js',
                                //services
                                'js/Services/CommonServices/AuthHeaderService.js',
                                'js/Services/Administrator/DepartmentsService.js',
                            ]
                        });
                    }]
                }
            })
        //added by pooja for insurance agent dashboard
        .state('InsuranceAgent', {
            url: "/InsuranceAgent",
            templateUrl: "views/InsuranceAgent/InsuranceAgent.html",
            data: {
                pageTitle: 'InsuranceAgent',
                roles: ['INSURANCE AGENT']
            },
            controller: "InsuranceAgentController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',

                            // controller
                            'views/InsuranceAgent/InsuranceAgentHomeController.js',
                            'views/InsuranceAgent/InsuranceAgentController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/InsuranceAgent/InsuranceAgentHomeService.js',
                            'js/Services/InsuranceCommonServices/InsuranceCommonServices.js'
                        ]
                    });
                }]
            }
        })

        //added by pooja for policy detail page
        .state('PolicyDetail', {
            url: "/PolicyDetail",
            templateUrl: "views/InsuranceAgent/PolicyDetail/PolicyDetail.html",
            data: {
                pageTitle: 'PolicyDetail',
                roles: ['INSURANCE AGENT']
            },
            controller: "PolicyDetailController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'views/InsuranceAgent/InsuranceAgentHomeController.js',
                            'views/InsuranceAgent/PolicyDetail/PolicyDetailController.js',

                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',

                            //date picker
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',

                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/InsuranceAgent/InsuranceAgentHomeService.js',
                            'js/Services/Appraisals/AppraisalService.js',
                            'js/Services/AddPolicy/AddPolicyService.js',

                            'js/commonUtility/CalendarUtility.js'
                        ]
                    });
                }]
            }
        })
        //added by pooja for appraisal
        .state('Appraisal', {
            url: "/Appraisal",
            templateUrl: "views/InsuranceAgent/Appraisals/Appraisal.html",
            data: {
                pageTitle: 'Appraisal',
                roles: ['INSURANCE AGENT', 'INSURANCE ACCOUNT MANAGER']
            },
            controller: "AppraisalController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/fullcalendar.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            'assets/pages/scripts/ui-bootstrap-tpls-0.13.0.js',

                            'views/InsuranceAgent/InsuranceAgentHomeController.js',
                            'views/InsuranceAgent/PolicyDetail/PolicyDetailController.js',
                            'views/InsuranceAgent/Appraisals/AppraisalController.js',
                            'views/InsuranceAgent/Appraisals/AddAppraisalController.js',
                            'views/AppraisalNotes/NotesController.js',
                            'views/AppraisalNotes/AddItemNotePopupController.js',
                            'views/CommonTemplates/PolicyHolderReviewController.js',
                            'views/CommonTemplates/EmailPopupController.js',
                            'views/CommonTemplates/ArtigemReviewController.js',
                            'views/CommonTemplates/UnderwritterReviewPopupController.js',
                            'views/CommonTemplates/PolicyholderMobileViewController.js',
                            'views/CommonTemplates/RecommendArtigemReviewController.js',
                            'views/GlobalSearch/DocumentDetailsController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/InsuranceAgent/InsuranceAgentHomeService.js',
                            'js/Services/Appraisals/AppraisalService.js',
                            'js/Services/UnderWriterReview/UnderWriterReviewService.js',
                            'js/Services/ArtigemReviewService/ArtigemReviewService.js',
                            'js/Services/Appraisals/PHMobileViewService.js',
                            'js/Services/AppraisalNotes/AppraisalNotesService.js',
                            'js/Services/ContractService/ContractService.js'
                        ]
                    });
                }]
            }
        })
        //added sub menu remittance address
        .state('Services', {
            url: "/Services",
            templateUrl: "views/Administrator/Services.html",
            data: {
                pageTitle: 'Services',
                roles: [InsuranceAdmin]
            },
            controller: "ServicesController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'views/Administrator/ServicesController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Administrator/EnvironmentSettingsService.js'
                        ]
                    });
                }]
            }
        })
        //added sub menu remittance address
        .state('PolicyholderPortalSettings', {
            url: "/PolicyholderPortalSettings",
            templateUrl: "views/Administrator/PolicyholderPortalSettings.html",
            data: {
                pageTitle: 'PolicyholderPortalSettings',
                roles: [InsuranceAdmin]
            },
            controller: "PolicyholderPortalSettingsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'views/Administrator/PolicyholderPortalSettingsController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Administrator/EnvironmentSettingsService.js'
                        ]
                    });
                }]
            }
        })
        //added sub menu remittance address
        .state('ContentService', {
            url: "/ContentService",
            templateUrl: "views/Administrator/ContentService.html",
            data: {
                pageTitle: 'Content Services',
                roles: [SupervisorRole, InsuranceAdmin, AdjusterRole]
            },
            controller: "ContentServiceController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',

                            'views/Administrator/ContentServiceController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Administrator/EnvironmentSettingsService.js'


                        ]
                    });
                }]
            }
        })
        //Business Rules start
        .state('RolesAndBudget', {
            url: "/RolesAndBudget",
            templateUrl: "views/Administrator/RolesAndBudget.html",
            data: {
                pageTitle: 'Roles And Budget',
                roles: [InsuranceAdmin]
            },
            controller: "BusinessRulesController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            //controller
                            'views/Administrator/BusinessRulesController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Administrator/BusinessRuleService.js'
                        ]
                    });
                }]
            }
        })
        .state('PaymentTerms', {
            url: "/PaymentTerms",
            templateUrl: "views/Administrator/PaymentTerms.html",
            data: {
                pageTitle: 'Payment Terms',
                roles: [InsuranceAdmin]
            },
            controller: "PaymentTermsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            //controller
                            'views/Administrator/PaymentTermsController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Administrator/BusinessRuleService.js'
                        ]
                    });
                }]
            }
        })
        .state('PaymentOptions', {
            url: "/PaymentOptions",
            templateUrl: "views/Administrator/PaymentOption.html",
            data: {
                pageTitle: 'Payment Options',
                roles: [InsuranceAdmin]
            },
            controller: "PaymentOptionController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            //controller
                            'views/Administrator/PaymentOptionController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Administrator/BusinessRuleService.js'
                        ]
                    });
                }]
            }
        })
        .state('StateTaxes', {
            url: "/StateTaxes",
            templateUrl: "views/Administrator/StateTaxes.html",
            data: {
                pageTitle: 'State Taxes',
                roles: [InsuranceAdmin]
            },
            controller: "StateTaxController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            //controller
                            'views/Administrator/StateTaxController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Administrator/BusinessRuleService.js'
                        ]
                    });
                }]
            }
        })
        .state('ClaimTimes', {
            url: "/ClaimTimes",
            templateUrl: "views/Administrator/ClaimTimes.html",
            data: {
                pageTitle: 'Claim Times',
                roles: [InsuranceAdmin]
            },
            controller: "ClaimTimesController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            //controller
                            'views/Administrator/ClaimTimesController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Administrator/ClaimTimesService.js'
                        ]
                    });
                }]
            }
        })



        //Business Rules end
        //Environment Setting start
        .state('ContentCategories', {
            url: "/ContentCategories",
            templateUrl: "views/Administrator/EnvironmentContentCategories.html",
            data: {
                pageTitle: 'Content Categories',
                roles: [InsuranceAdmin]
            },
            controller: "EnvironmentContentCategoriesController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            //js
                            'views/Administrator/EnvironmentContentCategoriesController.js',
                            'views/Administrator/AddSubCategoryController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Administrator/CategoryService.js',
                            'js/Services/Administrator/AddSubCategoryService.js'
                        ]
                    });
                }]
            }
        })
        .state('HomeOwnersPolicies', {
            url: "/HomeOwnersPolicies",
            templateUrl: "views/Administrator/EnvironmentHomeOwnersPolicies.html",
            data: {
                pageTitle: 'Home Owner Policy',
                roles: [InsuranceAdmin]
            },
            controller: "EnvironmentHomeOwnersPoliciesController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            //services
                            'views/Administrator/EnvironmentHomeOwnersPoliciesController.js',
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Administrator/HomeOwenerPolicyService.js'

                        ]
                    });
                }]
            }
        })
        .state('ClaimForms', {
            url: "/ClaimForms",
            templateUrl: "views/Administrator/EnvironmentClaimForm.html",
            data: {
                pageTitle: 'ContentCategories',
                roles: [InsuranceAdmin]
            },
            controller: "EnvironmentClaimFormController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            //services
                            'views/Administrator/EnvironmentClaimFormController.js',
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Administrator/ClaimFormService.js'
                        ]
                    });
                }]
            }
        })
        .state('EmailTemplate', {
            url: "/EmailTemplate",
            templateUrl: "views/Administrator/EnvironmentEmailTemplate.html",
            data: {
                pageTitle: 'Email templates',
                roles: [InsuranceAdmin]
            },
            controller: "EnvironmentEmailTempalteController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            //services
                            'views/Administrator/EnvironmentEmailTempalteController.js',
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Administrator/EnvironmentSettingsService.js',
                        ]
                    });
                }]
            }
        })
        //Environment Setting end
        // User Administration start
        .state('Users', {
            url: "/Users",
            templateUrl: "views/Administrator/Users.html",
            data: {
                pageTitle: 'Users',
                roles: [InsuranceAdmin]
            },
            controller: "UserController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            //controller
                            'views/Administrator/UserController.js',
                            'Contants/ReportingManagerRoleMapConstants.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Administrator/UserAdminstrationService.js'
                        ]
                    });
                }]
            }
        })
        .state('SecurityControls', {
            url: "/SecurityControls",
            templateUrl: "views/Administrator/SecurityControls.html",
            data: {
                pageTitle: 'Security Controls',
                roles: [InsuranceAdmin]
            },
            controller: "SecurityController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            //controller
                            'views/Administrator/SecurityController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Administrator/UserAdminstrationService.js'

                        ]
                    });
                }]
            }
        })
        // User Administration end
        //Admin Roles and Permisssion  Mapping
        .state('RolesAndPermissionMapping', {
            url: "/RolesAndPermissionMapping",
            templateUrl: "views/Administrator/RolesAndPermissionMapping.html",
            data: {
                pageTitle: 'Roles And Permission Mapping',
                roles: [InsuranceAdmin]
            },
            controller: "RolesAndPermissionMappingController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'views/Administrator/RolesAndPermissionMappingController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Administrator/RolesAndPermissionMappingService.js'
                        ]
                    });
                }]
            }
        })
        //Profile start
        .state('UserProfile', {
            url: "/UserProfile",
            templateUrl: "views/Profile/UserProfile.html",
            data: {
                pageTitle: 'Profile',
                roles: [SupervisorRole, InsuranceAdmin, 'INSURANCE AGENT', 'UNDERWRITER', AdjusterRole, claimManager, 'INSURANCE ACCOUNT MANAGER', Policyholder]
            },
            controller: "MyProfileController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'views/Profile/MyProfileController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Profile/MyProfileService.js',
                            'js/commonUtility/utilityMethods.js'

                        ]
                    });
                }]
            }
        })

        //Security
        .state('Security', {
            url: "/Security",
            templateUrl: "views/Profile/Security.html",
            data: {
                pageTitle: 'Security',
                roles: [SupervisorRole, InsuranceAdmin, AdjusterRole, claimManager, 'INSURANCE AGENT', 'UNDERWRITER', 'INSURANCE ACCOUNT MANAGER', 'POLICYHOLDER']
            },
            controller: "MyProfileController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'views/Profile/MyProfileController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Profile/MyProfileService.js',
                            'js/commonUtility/utilityMethods.js'

                        ]
                    });
                }]
            }
        })
        //End Security

        //ResetPassword Added By Vinod
        .state('ResetPassword', {
            url: "/ResetPassword",
            templateUrl: "views/ResetPassword/resetPassword.html",
            data: {
                pageTitle: 'ResetPassword',
                roles: [SupervisorRole, InsuranceAdmin, AdjusterRole, claimManager, 'INSURANCE AGENT', 'UNDERWRITER', 'INSURANCE ACCOUNT MANAGER', 'POLICYHOLDER']
            },
            controller: "ResetPasswordController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',

                            //Controller
                            'views/ResetPassword/resetPasswordController.js',

                            //services
                            'js/Services/ResetPassword/resetPasswordService.js',
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/commonUtility/utilityMethods.js'

                        ]
                    });
                }]
            }
        })

        //SecurityQuestion Added By Vinod
        .state('SecurityQuestion', {
            url: "/SecurityQuestion",
            templateUrl: "views/SecurityQuestion/SecurityQuestion.html",
            data: {
                pageTitle: 'SecurityQuestion',
                roles: [SupervisorRole, InsuranceAdmin, AdjusterRole, claimManager, 'INSURANCE AGENT', 'UNDERWRITER', 'INSURANCE ACCOUNT MANAGER', 'POLICYHOLDER']
            },
            controller: "SecurityQuestionController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'views/Profile/MyProfileController.js',

                            //Controller
                            'views/SecurityQuestion/SecurityQuestionController.js',

                            //services
                            'js/Services/Profile/MyProfileService.js',
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/commonUtility/utilityMethods.js'

                        ]
                    });
                }]
            }
        })

        .state('NewBranch', {
            url: "/NewBranch",
            templateUrl: "views/Administrator/NewOffice.html",
            data: {
                pageTitle: 'New Branch',
                roles: [InsuranceAdmin]
            },
            controller: "NewOfficeController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            //'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',

                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',

                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',


                            'views/Administrator/NewOfficeController.js',
                            //'views/Office/MemberContactController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Administrator/NewBranchService.js'
                        ]
                    });
                }]
            }
        })
        .state('NewEmployee', {
            url: "/NewEmployee",
            templateUrl: "views/Administrator/NewEmployee.html",
            data: {
                pageTitle: 'New Employee',
                roles: [InsuranceAdmin]
            },
            controller: "NewEmployeeController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',

                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',

                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',


                            'views/Administrator/NewEmployeeController.js',
                            //'views/Office/MemberContactController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Administrator/NewBranchService.js'
                        ]
                    });
                }]
            }
        })
        //Office
        .state('Office', {
            url: "/Office",
            templateUrl: "views/Office/Office.html",
            data: { pageTitle: 'Office' },
            controller: "OfficeController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'views/Office/MemberContactController.js',
                            'views/Office/NewBranchController.js',
                            'views/Office/OfficeSummaryController.js',
                            'views/Office/OfficeController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Office/OfficeNewBranchService.js',
                            'js/Services/Office/OfficeService.js',
                            'js/Services/Office/OfficeSummaryService.js'
                        ]
                    });
                }]
            }
        })
        // Edit Member
        .state('AdminstrationsEditMember', {
            url: "/AdminstrationsEditMember",
            templateUrl: "views/Company/EditMemberAdminstrations.html",
            data: { pageTitle: 'Member Details' },
            controller: "EditMemberAdminstrationsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'views/Company/EditMemberAdminstrationsController.js',
                            'views/Company/AssignRoleToMemberController.js',

                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Company/CompanyEditMemberAdministrationService.js',
                            'js/Services/Company/CompanyAssignRoleToMemberService.js'


                        ]
                    });
                }]
            }
        })
        .state('UploadItemsFromCSV', {
            url: "/UploadItemsFromCSV",
            templateUrl: "views/UploadPostLossItem/UploadItemsFromCSV.html",
            data: {
                pageTitle: 'Upload Post Loss Items',
                roles: [SupervisorRole, AdjusterRole, Policyholder]
            },
            controller: "UploadItemsFromCSVController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'views/UploadPostLossItem/UploadItemsFromCSVController.js',

                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/UploadPostLossItem/UploadItemsFromCSVService.js'
                        ]
                    });
                }]
            }
        })
        .state('BillsAndPayments', {
            url: "/BillsAndPayments",
            templateUrl: "views/Adjuster/BillsAndPayment.html",
            data: {
                pageTitle: 'Bills And Payment',
                roles: [AdjusterRole, SupervisorRole, claimManager]
            },
            controller: "BillsAndPaymentController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'views/Adjuster/BillsAndPaymentController.js',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Adjuster/AddEditThirdPartyInventoryService.js',
                            'js/Services/Adjuster/BillsAndPaymentService.js',
                            'js/commonUtility/CommonUtils.js',
                            'Contants/CommonConstants.js'
                        ]
                    });
                }]
            }
        })

        .state('Payable', {
            url: "/Payable",
            templateUrl: "views/Adjuster/AccountPayable.html",
            data: {
                pageTitle: 'Account Payable',
                roles: [AdjusterRole, SupervisorRole, claimManager]
            },
            controller: "AccountPayableController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'views/Adjuster/AccountPayableController.js',
                            //datePicker
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Adjuster/AddEditThirdPartyInventoryService.js',
                            'js/Services/Adjuster/AccountPayableService.js',
                            'js/commonUtility/CommonUtils.js',
                            'Contants/CommonConstants.js'
                        ]
                    });
                }]
            }
        })

        .state('PayableDetails', {
            url: "/PayableDetails",
            templateUrl: "views/Adjuster/AccountPayableDetails.html",
            data: {
                pageTitle: 'Account Payable Details',
                roles: [AdjusterRole, SupervisorRole, claimManager]
            },
            controller: "AccountPayableDetailsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'views/Adjuster/AccountPayableDetailsController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Adjuster/AccountPayableService.js',
                            'views/Contract/ContractPopupController.js',

                            // kendo pdf js
                            'assets/global/plugins/kendo/css/kendo.common.min.css',
                            'assets/global/plugins/kendo/css/kendo.default.min.css',
                            'assets/global/plugins/kendo/js/jszip.min.js',
                            'assets/global/plugins/kendo/js/kendo.all.min.js'
                        ]
                    });
                }]
            }
        })
        //Invite third party vendor  Need to check
        .state('InviteThirdPartyVendor', {
            url: "/InviteThirdPartyVendor",
            templateUrl: "views/Administrator/InviteThirdPartyVendor.html",
            data: { pageTitle: '' },
            controller: "InviteThirdPartyVendorController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [


                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',

                            'views/Administrator/InviteThirdPartyVendorController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Administrator/InviteThirdPartyVendorService.js'
                        ]
                    });
                }]
            }
        })
        //Supervisor
        .state('SupervisorDashboard', {
            url: "/SupervisorDashboard",
            templateUrl: "views/ClaimsSupervisor/SupervisorDashboard.html",
            data: {
                pageTitle: 'Dashboard',
                roles: [SupervisorRole]
            },
            controller: "SuperVisorDashboardController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',

                            //Controller
                            'views/ClaimsSupervisor/SuperVisorDashboardController.js',
                            'views/ClaimsSupervisor/SupervisorAssignClaimController.js',
                            'views/CommonTemplates/DashboardAlertsController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ClaimSupervisor/SupervisorDashboardService.js',
                            'js/Services/ClaimSupervisor/AssignClaimForAdjusterService.js',
                            'js/Services/CommonServices/DashboardAlertsService.js'

                        ]
                    });
                }]
            }
        })


        //Supervisor My Team
        .state('SupervisorMyTeam', {
            url: "/SupervisorMyTeam",
            templateUrl: "views/ClaimsSupervisor/SupervisorMyTeam.html",
            data: {
                pageTitle: 'MyTeam',
                roles: [SupervisorRole]
            },
            controller: "SupervisorMyTeamConroller",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [


                            'views/ClaimsSupervisor/SupervisorMyTeamConroller.js',
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ClaimSupervisor/SupervisorMyTeamService.js',

                            //Common
                            'views/CommonTemplates/DashboardAlertsController.js',
                            'js/Services/CommonServices/DashboardAlertsService.js'



                        ]
                    });
                }]
            }
        })

        //Supervisor My Invoices
        .state('SupervisorMyInvoices', {
            url: "/SupervisorMyInvoices",
            templateUrl: "views/ClaimsSupervisor/SupervisorMyInvoices.html",
            data: {
                pageTitle: 'MyInvoices',
                roles: [SupervisorRole]
            },
            controller: "SupervisorMyInvoicesConroller",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [


                            'views/ClaimsSupervisor/SupervisorMyInvoicesConroller.js',
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ClaimSupervisor/SupervisorMyInvoicesService.js',

                            //Common
                            'views/CommonTemplates/DashboardAlertsController.js',
                            'js/Services/CommonServices/DashboardAlertsService.js'

                        ]
                    });
                }]
            }
        })


        .state('SupervisorAddItem', {
            url: "/SupervisorAddItem",
            templateUrl: "views/Adjuster/AddItem.html",
            data: {
                pageTitle: 'Add Item',
                roles: [SupervisorRole]
            },
            controller: "SupervisorClaimDetailsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/fullcalendar.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            // Controllers
                            'views/ClaimsSupervisor/SupervisorClaimDetailsController.js',
                            'views/ClaimsSupervisor/AddNewVendorController.js',
                            'views/ClaimsSupervisor/ShowNotesAttachmentController.js',
                            'views/ClaimsSupervisor/ShowClaimAttachmentController.js',
                            'views/ClaimsSupervisor/AddNotePopupController.js',
                            'views/Adjuster/AddEventPopupController.js',
                            'views/Adjuster/NewClaimFormPopupController.js',
                            'views/Adjuster/EventDetailsController.js',

                            // Services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ClaimSupervisor/SupervisorClaimDetailsService.js',
                            'js/Services/Adjuster/NewClaimFormPopupService.js',
                            'js/Services/Adjuster/EventService.js',
                            'views/CommonTemplates/AddNotePopupController.js',
                            'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js',
                            'js/Services/Adjuster/NewClaimService.js',
                            // For note details
                            'views/AllNotes/NoteDetailsController.js',

                            //Factory
                            'js/factory/LineItemsFactory.js'
                        ]
                    });
                }]
            }
        })
        .state('SupervisorClaimDetails', {
            url: "/SupervisorClaimDetails",
            templateUrl: "views/ClaimsSupervisor/SupervisorClaimDetails.html",
            data: {
                pageTitle: 'Claim Details',
                roles: [SupervisorRole]
            },
            controller: "SupervisorClaimDetailsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [

                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/fullcalendar.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            //controllers
                            'views/ClaimsSupervisor/SupervisorClaimDetailsController.js',
                            'views/ClaimsSupervisor/AddNewVendorController.js',
                            'views/ClaimsSupervisor/ShowNotesAttachmentController.js',
                            'views/ClaimsSupervisor/ShowClaimAttachmentController.js',
                            'views/Adjuster/AddEventPopupController.js',
                            'views/Adjuster/NewClaimFormPopupController.js',
                            'views/Adjuster/EventDetailsController.js',
                            'views/Adjuster/InvoicePaymentPopupController.js',
                            'views/Reports/ReportController.js',
                            'views/Adjuster/AdjusterReAssignController.js',
                            'views/ActivityLog/ActivityLogController.js',
                            'views/Adjuster/AddRequestPopupController.js',
                            'views/Adjuster/RequestDetailsController.js',
                            'views/Policy/PolicyDetailsController.js',
                            'views/CommonTemplates/CategoryChangePopUpController.js',
                            'views/CommonTemplates/StatusChangePopUpController.js',
                            'views/Adjuster/ConversationController.js',
                            'views/ActivityLog/AddCustomActivityLogController.js',

                            //CTB-2689
                            'views/AllReplQuotesSupervisor/AllReplQuotesSupervisorController.js',
                            'views/CommonTemplates/ClaimDocumentsController.js',
                            'views/CommonTemplates/AddNotePopupController.js',
                            'views/CommonTemplates/AddItemPopupController.js',
                            //Services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ClaimSupervisor/SupervisorClaimDetailsService.js',
                            'js/Services/Adjuster/NewClaimFormPopupService.js',
                            'js/Services/Adjuster/EventService.js',
                            'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js',
                            'js/Services/Report/ReportService.js',
                            'js/Services/ClaimSupervisor/AdjusterListService.js',
                            'js/Services/ActivityLog/ActivityLogService.js',
                            'js/Services/Adjuster/RequestService.js',
                            'js/Services/Policy/PolicyDetailsService.js',
                            'js/Services/Adjuster/NewClaimService.js',
                            'js/Services/CommonServices/LineItemService.js',
                            'js/Services/ClaimDocuments/ClaimDocumentsService.js',
                            'js/Services/Adjuster/ReceiptMapperService.js',
                            //CSS
                            'Css/claims/propertyClaims.css',
                            //For note details
                            'views/AllNotes/NoteDetailsController.js',
                            'js/factory/LineItemsFactory.js',
                            'js/Services/Adjuster/AdjusterLineItemDetailsService.js',
                            'js/commonUtility/utilityMethods.js',
                            'Contants/StatusConstants.js',
                            //CTB-2689
                            'js/Services/AllReplQuotes/AllReplQuotesService.js',
                        ]
                    });
                }]
            }
        })


        .state('SupervisorAssignPostLostItem', {
            url: "/SupervisorAssignPostLostItem",
            templateUrl: "views/ClaimsSupervisor/AssignPostLostItem.html",
            data: {
                pageTitle: 'Assign Line Items',
                roles: [SupervisorRole]
            },
            controller: "AssignPostLostItemController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',

                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',

                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

                            'views/Adjuster/AdjusterPropertyClaimDetails.js',
                            'views/Adjuster/AdjusterListController.js',
                            'views/ClaimCenterManager/NewItemDamageLostController.js',
                            'views/Adjuster/AddNewLostDamageItemDetailsController.js',
                            //'views/Adjuster/AddNewVendorController.js',
                            //'views/Adjuster/ItemValueController.js',
                            //'views/Adjuster/ItemPayoutController.js',
                            'views/ClaimsSupervisor/AssignPostLostItemController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ClaimSupervisor/SupervisorClaimDetailsService.js',
                            'js/Services/ClaimSupervisor/AdjusterListService.js',
                            //'js/Services/Adjuster/AdjusterItemPayoutService.js',
                            //'js/Services/Adjuster/AdjusterItemValueService.js',
                            'js/Services/ClaimCenterManager/NewItemDamageLostService.js'

                        ]
                    });
                }]
            }
        })
        .state('SupervisorAllClaim', {
            url: "/SupervisorAllClaim",
            templateUrl: "views/ClaimsSupervisor/SuperVisorAllClaim.html",
            data: {
                pageTitle: 'Dashboard',
                roles: [SupervisorRole]
            },
            controller: "SuperVisorAllClaimController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            //Controller
                            'views/ClaimsSupervisor/SuperVisorAllClaimController.js',
                            'js/commonUtility/CommonUtils.js',
                            'Contants/CommonConstants.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ClaimSupervisor/SupervisorAllClaimsService.js'

                        ]
                    });
                }]
            }
        })

        .state('Performance', {
            url: "/Performance",
            templateUrl: "views/ClaimsSupervisor/Performance.html",
            data: {
                pageTitle: 'Adjuster Performance',
                roles: [SupervisorRole]
            },
            controller: "PerformanceController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/fullcalendar.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            //controllers
                            'views/ClaimsSupervisor/PerformanceController.js',
                            //Services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ClaimSupervisor/SupervisorDashboardService.js',

                        ]
                    });
                }]
            }
        })
        .state('SupervisorServiceRequest', {
            url: "/SupervisorServiceRequest",
            templateUrl: "views/ClaimsSupervisor/SuperVisorServiceRequest.html",
            data: {
                pageTitle: 'Dashboard',
                roles: [SupervisorRole]
            },
            controller: "SuperVisorServiceRequestController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            //Controller
                            'views/ClaimsSupervisor/SuperVisorServiceRequestController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ClaimSupervisor/SuperVisorServiceRequestService.js'

                        ]
                    });
                }]
            }
        })
        .state('SuperVisorServiceRequestEdit', {
            url: "/SuperVisorServiceRequestEdit",
            templateUrl: "views/ClaimsSupervisor/SuperVisorServiceRequestEdit.html",
            data: {
                pageTitle: 'Dashboard',
                roles: [SupervisorRole]
            },
            controller: "SuperVisorServiceRequestEditController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            //Controller
                            'views/ClaimsSupervisor/SuperVisorServiceRequestEditController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ClaimSupervisor/SuperVisorServiceRequestService.js'

                        ]
                    });
                }]
            }
        })
        .state('SuperVisorAssignServiceRequest', {
            url: "/SuperVisorAssignServiceRequest",
            templateUrl: "views/ClaimsSupervisor/SuperVisorAssignServiceRequest.html",
            data: {
                pageTitle: 'Dashboard',
                roles: [SupervisorRole]
            },
            controller: "SuperVisorAssignServiceRequestController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            //Controller
                            'views/ClaimsSupervisor/SuperVisorAssignServiceRequestController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ClaimSupervisor/SuperVisorServiceRequestService.js'
                        ]
                    });
                }]
            }
        })
        .state('SupervisorGlobalSearch', {
            url: "/SupervisorGlobalSearch",
            templateUrl: "views/ClaimsSupervisor/SupervisorGlobalSearch.html",
            data: {
                pageTitle: 'Search Result',
                roles: [SupervisorRole]
            },
            controller: "SupervisorGlobalSearchController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',

                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',

                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'views/ClaimsSupervisor/SupervisorGlobalSearchController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ClaimSupervisor/SupervisorDashboardService.js'
                        ]
                    });
                }]
            }
        })
        .state('SupervisorLineItemDetails', {
            url: "/SupervisorLineItemDetails",
            templateUrl: "views/ClaimsSupervisor/SupervisorLineItemDetails.html",
            data: {
                pageTitle: 'Line Item Deatils',
                roles: [SupervisorRole]
            },
            controller: "SupervisorLineItemDetailsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/pages/scripts/ui-bootstrap-tpls-0.13.0.js',
                            
                            //Controller
                            'views/ClaimsSupervisor/SupervisorLineItemDetailsController.js',
                            'views/Adjuster/ItemValueController.js',
                            'views/Salvage/SalvageDetailsController.js',
                            'views/ActivityLog/ActivityLogController.js',
                            'views/ComparableFilter/ComparableFilerController.js',
                            'views/Adjuster/ConversationController.js',
                            'views/CommonTemplates/AddNotePopupController.js',
                            'views/CommonTemplates/AddItemNotePopupController.js',
                            'views/Adjuster/AddCustomItemPopupController.js',
                            'views/CommonTemplates/PolicyholderSMSReviewPopupController.js',
                            'views/CommonTemplates/PolicyholderEmailReviewPopupController.js',
                            'views/CommonTemplates/JewelryPolicyHolderReviewController.js',
                            'views/CommonTemplates/JewelryCustomComparableController.js',                            

                            //services
                            'js/Services/CustomJewelryComparable/JewelryCustomComparableService.js',
                            'js/Services/PolicyHolder/PolicyHolderClaimDetailsService.js',
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ClaimSupervisor/SupervisorLineItemService.js',
                            'js/Services/Adjuster/AdjusterLineItemDetailsService.js',
                            'js/Services/Salvage/SalvageService.js',
                            'js/Services/Adjuster/ItemValueService.js',
                            'js/Services/ActivityLog/ActivityLogService.js',
                            'js/Services/ComparableService/ComparableFilterService.js',
                            'js/Services/ContractService/ContractService.js',
                            'js/Services/CommonServices/LineItemService.js',
                            'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js',
                            'js/Services/CommonServices/ItemDetailService.js',

                            'js/scripts/html2canvas.min.js',
                            // 'assets/global/plugins/kendo/css/kendo.common.min.css',
                            // 'assets/global/plugins/kendo/css/kendo.default.min.css',
                            'assets/global/plugins/kendo/js/jszip.min.js',
                            // 'assets/global/plugins/kendo/js/kendo.all.min.js',
                            'js/factory/LineItemsFactory.js',
                            'js/commonUtility/utilityMethods.js',
                            //Constants
                            'Contants/StatusConstants.js',
                        ]
                    });
                }]
            }
        })
        .state('SupervisorInvoiceDetails',
            {
                url: "/SupervisorInvoiceDetails",
                templateUrl: "views/ClaimsSupervisor/SuperVisorInvoiceDetails.html",
                data: {
                    pageTitle: 'Vendor Invoice',
                    roles: [SupervisorRole]
                },
                controller: "SuperVisorInvoiceDetailsController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',

                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'views/ClaimsSupervisor/SuperVisorInvoiceDetailsController.js',

                                //services
                                'js/Services/CommonServices/AuthHeaderService.js',
                                'js/Services/ClaimSupervisor/SuperVisorInvoiceDetailsService.js',
                                'js/Services/ClaimSupervisor/SupervisorClaimDetailsService.js'
                            ]
                        });
                    }]
                }
            })
        .state('CreateServiceInvoice', {
            url: "/CreateServiceInvoice",
            templateUrl: "views/ClaimsSupervisor/CreateServiceInvoice.html",
            data: { pageTitle: 'New Invoice' },
            controller: "CreateServiceInvoiceController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [

                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',


                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',

                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

                            'views/ClaimsSupervisor/CreateServiceInvoiceController.js',
                            //'views/ClaimsSupervisor/ShowNotesAttachmentController.js',


                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ClaimSupervisor/CreateServiceInvoiceService.js',
                            //'js/Services/Adjuster/AdjusterListService.js',
                            //'js/Services/Adjuster/AdjusterItemPayoutService.js',
                            //'js/Services/Adjuster/AdjusterItemValueService.js',
                            //'js/Services/ClaimCenterManager/NewItemDamageLostService.js'
                        ]
                    });
                }]
            }
        })
        //added sub menu bill pay
        .state('BillPay',
            {
                url: "/BillPay",
                templateUrl: "views/PolicyHolder/BillPay.html",
                data: { pageTitle: 'Bill Pay' },
                controller: "MyPaymentController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',

                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'views/PolicyHolder/MyPaymentController.js',
                                'views/PolicyHolder/AddBankAccountController.js',
                                'views/PolicyHolder/AddCardController.js',
                                'views/PolicyHolder/NumericValidator.js',
                                'views/PolicyHolder/YourAgentController.js',

                                //services
                                'js/Services/CommonServices/AuthHeaderService.js',
                                'js/Services/PolicyHolder/MyPaymentService.js',
                                'js/Services/PolicyHolder/MyPaymentService.js',

                            ]
                        });
                    }]
                }
            })
        //added sub menu Payment History
        .state('PaymentHistory',
            {
                url: "/PaymentHistory",
                templateUrl: "views/PolicyHolder/PaymentHistory.html",
                data: { pageTitle: 'Payment History' },
                controller: "MyPaymentController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',

                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'views/PolicyHolder/MyPaymentController.js',
                                'views/PolicyHolder/AddBankAccountController.js',
                                'views/PolicyHolder/AddCardController.js',
                                'views/PolicyHolder/NumericValidator.js',
                                'views/PolicyHolder/YourAgentController.js',

                                //services
                                'js/Services/CommonServices/AuthHeaderService.js',
                                'js/Services/PolicyHolder/MyPaymentService.js',
                                'js/Services/PolicyHolder/MyPaymentService.js',

                            ]
                        });
                    }]
                }
            })
        //added sub menu Bill History
        .state('BillHistory',
            {
                url: "/BillHistory",
                templateUrl: "views/PolicyHolder/BillHistory.html",
                data: { pageTitle: 'Bill History' },
                controller: "MyPaymentController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',

                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'views/PolicyHolder/MyPaymentController.js',
                                'views/PolicyHolder/AddBankAccountController.js',
                                'views/PolicyHolder/AddCardController.js',
                                'views/PolicyHolder/NumericValidator.js',
                                'views/PolicyHolder/YourAgentController.js',

                                //services
                                'js/Services/CommonServices/AuthHeaderService.js',
                                'js/Services/PolicyHolder/MyPaymentService.js',
                                'js/Services/PolicyHolder/MyPaymentService.js',

                            ]
                        });
                    }]
                }
            })
        //added sub menu Payment Method
        .state('PaymentMethods',
            {
                url: "/PaymentMethods",
                templateUrl: "views/PolicyHolder/PaymentMethods.html",
                data: { pageTitle: 'Payment Methods' },
                controller: "MyPaymentController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',

                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'views/PolicyHolder/MyPaymentController.js',
                                'views/PolicyHolder/AddBankAccountController.js',
                                'views/PolicyHolder/AddCardController.js',
                                'views/PolicyHolder/NumericValidator.js',
                                'views/PolicyHolder/YourAgentController.js',

                                //services
                                'js/Services/CommonServices/AuthHeaderService.js',
                                'js/Services/PolicyHolder/MyPaymentService.js',
                                'js/Services/PolicyHolder/MyPaymentService.js',

                            ]
                        });
                    }]
                }
            })
        //added sub menu Recurring Payment
        .state('RecurringPayment',
            {
                url: "/RecurringPayment",
                templateUrl: "views/PolicyHolder/RecurringPayment.html",
                data: { pageTitle: 'Recurring Payment' },
                controller: "MyPaymentController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',

                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'views/PolicyHolder/MyPaymentController.js',
                                'views/PolicyHolder/AddBankAccountController.js',
                                'views/PolicyHolder/AddCardController.js',
                                'views/PolicyHolder/NumericValidator.js',
                                'views/PolicyHolder/YourAgentController.js',

                                //services
                                'js/Services/CommonServices/AuthHeaderService.js',
                                'js/Services/PolicyHolder/MyPaymentService.js',
                                'js/Services/PolicyHolder/MyPaymentService.js',

                            ]
                        });
                    }]
                }
            })
        //Added For Sub Menu User Profile
        .state('AlertsSettings', {
            url: "/AlertsSettings",
            templateUrl: "views/Profile/AlertsSettings.html",
            data: {
                pageTitle: 'Alerts Settings',
                roles: [SupervisorRole, InsuranceAdmin, 'INSURANCE AGENT', 'UNDERWRITER', AdjusterRole, 'INSURANCE ACCOUNT MANAGER']
            },
            controller: "AlertsSettingsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'views/Profile/AlertsSettingsController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Profile/MyProfileService.js',

                        ]
                    });
                }]
            }
        })
        .state('PolicyholderHome',
            {
                url: "/PolicyholderHome",
                templateUrl: "views/PolicyHolder/PolicyHolderHome.html",
                data: {
                    pageTitle: 'PolicyHolder Home',
                    roles: [Policyholder]
                },
                controller: "PolicyHolderHomeController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',

                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'views/PolicyHolder/PolicyHolderHomeController.js',
                                'views/PolicyHolder/YourAgentController.js',

                                //services
                                'js/Services/CommonServices/AuthHeaderService.js',
                                'js/Services/PolicyHolder/MyPaymentService.js',
                                'js/Services/PolicyHolder/PolicyHolderHomeService.js',
                            ]
                        });
                    }]
                }
            })

        .state('PolicyholderMyClaims',
            {
                url: "/PolicyholderMyClaims",
                templateUrl: "views/PolicyHolder/PolicyHolderMyClaim.html",
                data: {
                    pageTitle: 'My Claim',
                    roles: [Policyholder]
                },
                controller: "PolicyHolderMyClaimController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',

                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',

                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'views/PolicyHolder/PolicyHolderMyClaimController.js',

                                //services
                                'js/Services/CommonServices/AuthHeaderService.js',
                                'js/Services/PolicyHolder/PolicyHolderMyClaimService.js',

                            ]
                        });
                    }]
                }
            })
        .state('PolicyholderClaimDetails', {
            url: "/PolicyholderClaimDetails",
            templateUrl: "views/PolicyHolder/PolicyHolderClaimDetails.html",
            data: {
                pageTitle: 'Claim Details',
                roles: [Policyholder]
            },
            controller: "PolicyHolderClaimDetailsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [

                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/fullcalendar.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',

                            //Controllers
                            'views/PolicyHolder/PolicyHolderClaimDetailsController.js',
                            'views/Adjuster/AdjusterPropertyClaimDetails.js',
                            'views/ActivityLog/ActivityLogController.js',
                            'views/Reports/ReportController.js',
                            'views/Policy/PolicyDetailsController.js',
                            'views/CommonTemplates/ClaimDocumentsController.js',
                            'views/PolicyHolder/CompleteTaskPopupController.js',
                            //For note details
                            'views/AllNotes/NoteDetailsController.js',
                            'views/Adjuster/ShowNotesAttachmentController.js',

                            'views/Adjuster/ShowClaimAttachmentController.js',
                            'views/CommonTemplates/AddNotePopupController.js',
                            'views/Adjuster/AddEventPopupController.js',
                            'views/Adjuster/AddRequestPopupController.js',
                            'views/Adjuster/EventDetailsController.js',
                            'views/Adjuster/RequestDetailsController.js',
                            'views/Adjuster/AddNewVendorController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/PolicyHolder/PolicyHolderClaimDetailsService.js',
                            'js/Services/Adjuster/AdjusterLineItemDetailsService.js',
                            'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js',
                            'js/Services/ActivityLog/ActivityLogService.js',
                            'js/Services/Report/ReportService.js',
                            'js/Services/Policy/PolicyDetailsService.js',
                            'js/Services/Adjuster/EventService.js',
                            'js/Services/Adjuster/RequestService.js',
                            'js/Services/ClaimDocuments/ClaimDocumentsService.js',
                            //CSS
                            'Css/claims/propertyClaims.css',
                            //Factory
                            'js/factory/PolicyInfoFactory.js'
                        ]
                    });
                }]
            }
        })

        .state('PolicyCoverage', {
            url: "/PolicyCoverage",
            templateUrl: "views/Policy/PolicyDetails.html",
            data: {
                pageTitle: 'PolicyCoverage',
                roles: [Policyholder]
            },
            controller: "PolicyDetailsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [

                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/fullcalendar.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',

                            //Controllers
                            'views/PolicyHolder/PolicyHolderClaimDetailsController.js',
                            'views/Adjuster/AdjusterPropertyClaimDetails.js',
                            'views/ActivityLog/ActivityLogController.js',
                            'views/Reports/ReportController.js',
                            'views/Policy/PolicyDetailsController.js',
                            'views/CommonTemplates/ClaimDocumentsController.js',
                            //For note details
                            'views/AllNotes/NoteDetailsController.js',
                            'views/Adjuster/ShowNotesAttachmentController.js',

                            'views/Adjuster/ShowClaimAttachmentController.js',
                            'views/CommonTemplates/AddNotePopupController.js',
                            'views/Adjuster/AddEventPopupController.js',
                            'views/Adjuster/AddRequestPopupController.js',
                            'views/Adjuster/EventDetailsController.js',
                            'views/Adjuster/RequestDetailsController.js',
                            'views/Adjuster/AddNewVendorController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/PolicyHolder/PolicyHolderClaimDetailsService.js',
                            'js/Services/Adjuster/AdjusterLineItemDetailsService.js',
                            'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js',
                            'js/Services/ActivityLog/ActivityLogService.js',
                            'js/Services/Report/ReportService.js',
                            'js/Services/Policy/PolicyDetailsService.js',
                            'js/Services/Adjuster/EventService.js',
                            'js/Services/Adjuster/RequestService.js',
                            'js/Services/ClaimDocuments/ClaimDocumentsService.js',

                            //CSS
                            'Css/claims/propertyClaims.css',

                            //Factory
                            'js/factory/LineItemsFactory.js'
                        ]
                    });
                }]
            }
        })
        .state('ActivityLog', {
            url: "/ActivityLog",
            templateUrl: "views/ActivityLog/ActivityLog.html",
            data: {
                pageTitle: 'ActivityLog',
                roles: [Policyholder]
            },
            controller: "ActivityLogController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [

                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/fullcalendar.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',

                            //Controllers
                            'views/PolicyHolder/PolicyHolderClaimDetailsController.js',
                            'views/ActivityLog/ActivityLogController.js',
                            'views/Reports/ReportController.js',
                            'views/Policy/PolicyDetailsController.js',



                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/PolicyHolder/PolicyHolderClaimDetailsService.js',
                            'js/Services/ActivityLog/ActivityLogService.js',
                            'js/Services/Policy/PolicyDetailsService.js',

                            //CSS
                            'Css/claims/propertyClaims.css',

                            //Factory
                            'js/factory/LineItemsFactory.js'
                        ]
                    });
                }]
            }
        })
        .state('PolicyholderClaimTask', {
            url: "/PolicyholderClaimTask",
            templateUrl: "views/PolicyHolder/PolicyholderTaskDetails.html",
            data: {
                pageTitle: 'Claim Tasks',
                roles: [Policyholder]
            },
            controller: "PolicyholderTaskDetailsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before',
                        files: [
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/fullcalendar.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            //controller
                            'views/PolicyHolder/PolicyHolderClaimDetailsController.js',
                            'views/PolicyHolder/PolicyholderTaskDetailsController.js',
                            'views/PolicyHolder/CompleteTaskPopupController.js',
                            //services
                            'js/Services/PolicyHolder/PolicyHolderClaimDetailsService.js'
                        ]
                    })
                }]
            }
        })
        .state('PolicyholderClaimParticipants', {
            url: "/PolicyholderClaimParticipants",
            templateUrl: "views/PolicyHolder/PolicyholderClaimParticipants.html",
            data: {
                pageTitle: 'Claim Participants',
                roles: [Policyholder]
            },
            controller: "PolicyholderClaimParticipantsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before',
                        files: [
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/fullcalendar.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            //controller
                            'views/PolicyHolder/PolicyholderClaimParticipantsController.js',
                            'views/CommonTemplates/AddNotePopupController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/PolicyHolder/PolicyHolderClaimDetailsService.js',
                            'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js',
                        ]
                    });
                }]
            }
        })
        .state('PolicyholderItemDetails', {
            url: "/PolicyholderItemDetails",
            templateUrl: "views/PolicyHolder/PolicyHolderItemDetails.html",
            data: {
                pageTitle: 'Line Item Details',
                roles: [Policyholder]
            },
            controller: "PolicyHolderItemDetailsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',

                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',

                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                            'assets/layouts/layout4/scripts/IPadResolution.js',
                            //start switch css-
                            'assets/global/plugins/bootstrap-switch/css/bootstrap-switch.min.css',
                            //end switch css-
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/global/plugins/jquery-multi-select/css/multi-select.css',

                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/jquery-multi-select/js/jquery.multi-select.js',

                            //start switch js-
                            'assets/global/plugins/bootstrap-switch/js/bootstrap-switch.min.js',
                            //end switch js
                            'views/PolicyHolder/PolicyHolderItemDetailsController.js',
                            'views/Adjuster/AdjusterComparablesListController.js',
                            'js/Services/PolicyHolder/AddNoteEventService.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/PolicyHolder/PolicyHolderItemDetailsService.js',
                            'js/Services/Adjuster/AdjusterComparablesListService.js',
                            'js/Services/Adjuster/AssignLineItem.js',

                            //Factory
                            'js/factory/LineItemsFactory.js',
                            //Utility
                            'js/commonUtility/utilityMethods.js',
                            //Constants
                            'Contants/StatusConstants.js',
                        ]
                    });
                }]
            }
        })

        .state('PolicyholderAddItem', {
            url: "/Policyholder_Add_Item",
            templateUrl: "views/Adjuster/AddItem.html",
            data: {
                pageTitle: 'Add Item',
                roles: [Policyholder]
            },
            controller: "PolicyHolderClaimDetailsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [

                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/fullcalendar.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            //Controllers
                            'views/PolicyHolder/PolicyHolderClaimDetailsController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/PolicyHolder/PolicyHolderClaimDetailsService.js',
                            'js/Services/Adjuster/AdjusterLineItemDetailsService.js',

                            //Factory
                            'js/factory/LineItemsFactory.js'
                        ]
                    });
                }]
            }
        })

        .state('ClaimItems', {
            url: "/ClaimItems",
            templateUrl: "views/PolicyHolder/ClaimItems.html",
            data: {
                pageTitle: 'Claim ITems',
                roles: [Policyholder]
            },
            controller: "ClaimItemsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [

                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/fullcalendar.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            //Controllers
                            'views/PolicyHolder/ClaimitemsController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/PolicyHolder/PolicyHolderClaimDetailsService.js',
                            'js/Services/PolicyHolder/ClaimItemsService.js',

                            //Factory
                            'js/factory/LineItemsFactory.js',
                            //Constants
                            'Contants/StatusConstants.js'
                        ]
                    });
                }]
            }
        })

        .state('DetailedInventory', {
            url: "/detailed_inventory",
            templateUrl: "views/PolicyHolder/DetailedInventory.html",
            data: {
                pageTitle: 'Detailed Inventory',
                roles: [Policyholder]
            },
            controller: "DetailedInventoryController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',

                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',

                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/layouts/layout4/scripts/IPadResolution.js',
                            //start switch css-
                            'assets/global/plugins/bootstrap-switch/css/bootstrap-switch.min.css',
                            //end switch css-
                            'assets/global/plugins/jquery-multi-select/css/multi-select.css',
                            'assets/global/plugins/jquery-multi-select/js/jquery.multi-select.js',
                            //Controller
                            'views/PolicyHolder/DetailedInventoryController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/PolicyHolder/DetailedInventoryService.js',
                            //CSS
                            'Css/claims/propertyClaims.css',
                            //Constants
                            'Contants/StatusConstants.js',
                            //Factory
                            'js/factory/PolicyInfoFactory.js'
                        ]
                    });
                }]
            }
        })

        .state('Room', {
            url: "/room/:id",
            templateUrl: "views/PolicyHolder/RoomDetails.html",
            data: {
                pageTitle: 'Detailed Inventory',
                roles: [Policyholder]
            },
            controller: "RoomDetailsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            //end switch css-
                            'assets/global/plugins/jquery-multi-select/css/multi-select.css',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/global/plugins/jquery-multi-select/js/jquery.multi-select.js',

                            //Controller
                            'views/PolicyHolder/RoomDetailsController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/PolicyHolder/DetailedInventoryService.js',
                            'js/Services/Adjuster/AdjusterLineItemDetailsService.js',
                            //Utility
                            'js/commonUtility/utilityMethods.js',
                            //Factory
                            'js/factory/LineItemsFactory.js',
                            'js/factory/PolicyInfoFactory.js',
                            //Constants
                            'Contants/StatusConstants.js',
                            //CSS
                            'Css/claims/propertyClaims.css',
                        ]
                    });
                }]
            }
        })

        //Added by Dilip UnderWriter
        .state('UnderWriter', {
            url: "/UnderWriter",
            templateUrl: "views/UnderWriter/UnderWriter.html",
            data: {
                pageTitle: 'Dashboard',
                roles: ['UNDERWRITER']
            },
            controller: "UnderWriterController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/fullcalendar.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            'assets/pages/scripts/ui-bootstrap-tpls-0.13.0.js',
                            // Controllers
                            'views/UnderWriter/UnderWriterController.js',
                            'views/UnderWriter/Dashboard/DashboardController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/UnderWriter/UnderWriterDashboardService.js',
                        ]
                    });
                }]
            }
        })

        // Approved Appraisal list for underwriter
        .state('AllAppraisals', {
            url: "/AllAppraisals",
            templateUrl: "views/UnderWriter/AllAppraisals/AllAppraisals.html",
            data: {
                pageTitle: 'All Appraisals',
                roles: ['UNDERWRITER']
            },
            controller: "AllAppraisalsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/fullcalendar.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            'assets/global/plugins/kendo/css/kendo.common-material.min.css',
                            'assets/global/plugins/kendo/css/kendo.material.min.css',
                            'assets/global/plugins/kendo/css/kendo.material.mobile.min.css',
                            'assets/pages/scripts/kendo.all.min.js',
                            // Controllers
                            'views/UnderWriter/AllAppraisals/AllAppraisalsController.js',
                            'js/commonUtility/CalendarUtility.js',
                            'js/commonUtility/CommonUtils.js',
                            'Contants/CommonConstants.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/InsuranceReports/InsuranceReportService.js',
                            'js/Services/UnderWriter/UnderWriterDashboardService.js',
                            'js/Services/InsuranceInvoices/InsuranceInvoicesService.js',
                            'js/commonUtility/utilityMethods.js',
                            'js/commonUtility/utility.js',                            


                        ]
                    });
                }]
            }
        })

        // New insurance request list for underwriter
        .state('NewInsuranceRequests', {
            url: "/NewInsuranceRequests",
            templateUrl: "views/UnderWriter/NewInsuranceRequests/NewInsuranceRequests.html",
            data: {
                pageTitle: 'New Insurance Requests',
                roles: ['UNDERWRITER']
            },
            controller: "NewInsuranceRequestsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/fullcalendar.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            // Controllers
                            'views/UnderWriter/NewInsuranceRequests/NewInsuranceRequestsController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/UnderWriter/UnderWriterDashboardService.js'

                        ]
                    });
                }]
            }
        })

        // Auto insurance requests list for underwriter
        .state('AutoInsuranceRequests', {
            url: "/AutoInsuranceRequests",
            templateUrl: "views/UnderWriter/AutoInsuranceRequests/AutoInsuranceRequests.html",
            data: {
                pageTitle: 'Auto Insurance Requests',
                roles: ['UNDERWRITER']
            },
            controller: "AutoInsuranceRequestsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/fullcalendar.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            // Controllers
                            'views/UnderWriter/AutoInsuranceRequests/AutoInsuranceRequestsController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/UnderWriter/UnderWriterDashboardService.js'

                        ]
                    });
                }]
            }
        })

        // Auto Mobile Insurance  Appraisal for Underwriter - added by vinod ->
        .state('UnderwriterAutoInsuranceRequestDetails', {
            url: "/UnderwriterAutoInsuranceRequestDetails",
            templateUrl: "views/UnderWriter/AutoInsuranceRequests/UnderwriterAutoInsuranceRequestDetails.html",
            data: {
                pageTitle: 'UnderwriterAutoInsuranceRequestDetails',
                roles: ['UNDERWRITER']
            },
            controller: "UnderwriterAutoInsuranceRequestDetailsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/fullcalendar.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            'assets/pages/scripts/ui-bootstrap-tpls-0.13.0.js',

                            // Controllers
                            'views/UnderWriter/AutoInsuranceRequests/UnderwriterAutoInsuranceRequestDetailsController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/UnderWriter/UnderWriterDashboardService.js',
                        ]
                    });
                }]
            }
        })


        // Added by Dilip Underwriter Dashboard -> appraisal
        .state('UnderwriterAppraisal', {
            url: "/UnderwriterAppraisal",
            templateUrl: "views/UnderWriter/Dashboard/Appraisal/Appraisal.html",
            data: {
                pageTitle: 'Appraisal',
                roles: ['UNDERWRITER', 'INSURANCE AGENT', 'INSURANCE ACCOUNT MANAGER']
            },
            controller: "AppraisalController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/fullcalendar.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            'assets/pages/scripts/ui-bootstrap-tpls-0.13.0.js',

                            // Controllers
                            'views/UnderWriter/Dashboard/Appraisal/AppraisalController.js',
                            'views/UnderWriter/Dashboard/Appraisal/AppraisalDetailsController.js',
                            'views/CommonTemplates/EmailPopupController.js',
                            'views/AppraisalNotes/NotesController.js',
                            'views/AppraisalNotes/AddItemNotePopupController.js',
                            'views/CommonTemplates/InsuranceAgentReviewPopupController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js',
                            'js/Services/Adjuster/AdjusterLineItemDetailsService.js',
                            'js/Services/Appraisals/AppraisalService.js',
                            'js/Services/AppraisalNotes/AppraisalNotesService.js',
                            'js/Services/InsuranceAgent/InsuranceAgentHomeService.js',
                            'js/Services/InsuranceAgentReview/InsuranceAgentReviewService.js'

                        ]
                    });
                }]
            }
        })

        //Added by Dilip for InsuranceAllAppraisals
        .state('InsuranceAllAppraisals', {
            url: "/InsuranceAllAppraisals",
            templateUrl: "views/InsuranceAllAppraisals/AllAppraisals.html",
            data: {
                pageTitle: 'InsuranceAllAppraisals',
                roles: ['INSURANCE AGENT', 'UNDERWRITER', 'INSURANCE ACCOUNT MANAGER']
            },
            controller: "AllAppraisalsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/kendo/css/kendo.common-material.min.css',
                            'assets/global/plugins/kendo/css/kendo.material.min.css',
                            'assets/global/plugins/kendo/css/kendo.material.mobile.min.css',
                            'assets/pages/scripts/kendo.all.min.js',
                            'js/scripts/dateFilter.js',

                            //Controllers
                            'views/InsuranceAllAppraisals/AllAppraisalsController.js',
                            //services
                            'js/Services/InsuranceAccountManager/InsuranceAccountManagerDashboardService.js',
                            'js/Services/InsuranceReports/InsuranceReportService.js',
                            'js/Services/InsuranceReports/ExportReportService.js',
                            'js/Services/AddPolicy/AddPolicyService.js',
                            'js/commonUtility/CalendarUtility.js',
                            'js/commonUtility/utility.js',
                            'js/commonUtility/utilityMethods.js',
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/InsuranceInvoices/InsuranceInvoicesService.js',
                            'js/commonUtility/CommonUtils.js',
                            'Contants/CommonConstants.js',

                        ]
                    });
                }]
            }
        })

        //Added by Dilip for InsuranceReports
        .state('InsuranceReports', {
            url: "/InsuranceReports",
            templateUrl: "views/InsuranceReports/AgentReports.html",
            data: {
                pageTitle: 'InsuranceReports',
                roles: ['INSURANCE AGENT', 'UNDERWRITER', 'INSURANCE ACCOUNT MANAGER']
            },
            controller: "AgentReportsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',

                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/kendo/css/kendo.common-material.min.css',
                            'assets/global/plugins/kendo/css/kendo.material.min.css',
                            'assets/global/plugins/kendo/css/kendo.material.mobile.min.css',
                            'assets/pages/scripts/kendo.all.min.js',
                            'js/scripts/dateFilter.js',

                            //Controllers
                            'views/InsuranceReports/AgentReportsController.js',
                            'views/GlobalSearch/DocumentDetailsController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/InsuranceAccountManager/InsuranceAccountManagerDashboardService.js',
                            'js/Services/InsuranceReports/InsuranceReportService.js',
                            'js/Services/InsuranceReports/ExportReportService.js',
                            'js/Services/AddPolicy/AddPolicyService.js',

                            'js/commonUtility/CalendarUtility.js',
                            'js/commonUtility/CommonUtils.js',
                            'Contants/CommonConstants.js',

                            'js/scripts/alasql.min.js',
                            'js/scripts/xlsx.core.min.js',
                            'js/scripts/html2canvas.min.js',
                            'js/scripts/canvg.min.js',
                            'js/scripts/jspdf.debug.js',
                            'js/commonUtility/utility.js',
                            'js/commonUtility/utilityMethods.js',
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/InsuranceInvoices/InsuranceInvoicesService.js',

                        ]
                    });
                }]
            }
        })

        //Added by Dilip for InsuranceInvoices
        .state('InsuranceInvoices', {
            url: "/InsuranceInvoices",
            templateUrl: "views/InsuranceInvoices/InsuranceInvoices.html",
            data: {
                pageTitle: 'InsuranceInvoices',
                roles: ['INSURANCE AGENT', 'INSURANCE ACCOUNT MANAGER']
            },
            controller: "InsuranceInvoicesController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',

                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'js/commonUtility/utilityMethods.js',
                            'assets/global/plugins/kendo/css/kendo.common-material.min.css',
                            'assets/global/plugins/kendo/css/kendo.material.min.css',
                            'assets/global/plugins/kendo/css/kendo.material.mobile.min.css',
                            'assets/pages/scripts/kendo.all.min.js',
                            'js/scripts/dateFilter.js',
                            

                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            //end switch css-
                            'assets/global/plugins/jquery-multi-select/css/multi-select.css',
                            'assets/global/plugins/jquery-multi-select/js/jquery.multi-select.js',
                            //Controllers
                            'views/InsuranceInvoices/InsuranceInvoicesController.js',

                            'js/commonUtility/CalendarUtility.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/InsuranceInvoices/InsuranceInvoicesService.js',
                            'js/Services/AddPolicy/AddPolicyService.js',
                            'js/Services/ContractService/ContractService.js',
                            'js/commonUtility/utility.js',
                            'js/commonUtility/CommonUtils.js',
                            'Contants/CommonConstants.js',

                        ]
                    });
                }]
            }
        })


        //Added by Dilip for InsuranceInvoiceDetails
        .state('InsuranceInvoiceDetails', {
            url: "/InsuranceInvoiceDetails",
            templateUrl: "views/InsuranceInvoices/InsuranceInvoiceDetails.html",
            data: {
                pageTitle: 'InsuranceInvoiceDetails',
                roles: ['INSURANCE AGENT', 'INSURANCE ACCOUNT MANAGER']
            },
            controller: "InsuranceInvoiceDetailsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',

                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'js/commonUtility/utilityMethods.js',

                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            //end switch css-
                            'assets/global/plugins/jquery-multi-select/css/multi-select.css',
                            'assets/global/plugins/jquery-multi-select/js/jquery.multi-select.js',
                            //Controllers
                            'views/InsuranceInvoices/InsuranceInvoiceDetailsController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/InsuranceInvoices/InsuranceInvoicesService.js'

                        ]
                    });
                }]
            }
        })


        // Addded By Saurabh
        .state('UnderwriterReports', {
            url: "/UnderwriterReports",
            templateUrl: "views/UnderwriterReports/UnderWriterReports.html",
            data: {
                pageTitle: 'UnderwriterReports',
                roles: ['INSURANCE AGENT', 'UNDERWRITER', 'INSURANCE ACCOUNT MANAGER']
            },
            controller: "UnderWriterReportsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',

                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/kendo/css/kendo.common-material.min.css',
                            'assets/global/plugins/kendo/css/kendo.material.min.css',
                            'assets/global/plugins/kendo/css/kendo.material.mobile.min.css',
                            'assets/pages/scripts/kendo.all.min.js',

                            //Controllers
                            'views/UnderwriterReports/UnderWriterReportsController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/InsuranceAccountManager/InsuranceAccountManagerDashboardService.js',
                            'js/Services/InsuranceReports/InsuranceReportService.js',
                            'js/Services/AddPolicy/AddPolicyService.js',
                            'js/Services/InsuranceReports/ExportReportService.js',
                            'js/Services/InsuranceReports/InsuranceReportService.js',
                            'js/Services/InsuranceInvoices/InsuranceInvoicesService.js',
                            'js/commonUtility/utilityMethods.js',
                            'js/commonUtility/utility.js',

                            'js/commonUtility/CalendarUtility.js',
                            'js/commonUtility/CommonUtils.js',
                            'Contants/CommonConstants.js',

                            'js/scripts/alasql.min.js',
                            'js/scripts/xlsx.core.min.js',
                            'js/scripts/html2canvas.min.js',
                            'js/scripts/canvg.min.js',
                            'js/scripts/jspdf.debug.js'

                        ]
                    });
                }]
            }
        })

        //Added by Dilip InsuranceAccountManager
        .state('/InsuranceAccountManagerMarkup', {
            url: "/InsuranceAccountManagerMarkup",
            templateUrl: "views/InsuranceAccountManager/InsuranceAccountManagerMarkup.html",
            data: {
                pageTitle: '%Markup',
                roles: ['INSURANCE ACCOUNT MANAGER']
            },
            controller: "InsuranceAccountManagerMarkupController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/fullcalendar.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            // Controllers
                            'views/InsuranceAccountManager/InsuranceAccountManagerMarkupController.js',
                            'views/InsuranceAccountManager/Dashboard/DashboardController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/InsuranceReports/InsuranceReportService.js',
                            'js/Services/InsuranceAccountManager/InsuranceAccountManagerDashboardService.js',
                            'js/Services/InsuranceReports/ExportReportService.js',

                            'js/scripts/Chart.bundle.js',
                            'js/scripts/angular-chart.js',
                            'js/scripts/Chart.Piecelabel.min.js',

                            'js/scripts/alasql.min.js',
                            'js/scripts/xlsx.core.min.js',
                            'js/scripts/html2canvas.min.js',
                            'js/scripts/canvg.min.js',
                            'js/scripts/jspdf.debug.js'

                        ]
                    });
                }]
            }
        })

        //Added by Shreenidhi InsuranceAccountManager
        .state('InsuranceAccountManager', {
            url: "/InsuranceAccountManager",
            templateUrl: "views/InsuranceAccountManager/InsuranceAccountManager.html",
            data: {
                pageTitle: 'Dashboard',
                roles: ['INSURANCE ACCOUNT MANAGER']
            },
            controller: "InsuranceAccountManagerController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/fullcalendar.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            // Controllers
                            'views/InsuranceAccountManager/InsuranceAccountManagerController.js',
                            'views/InsuranceAccountManager/Dashboard/DashboardController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/InsuranceReports/InsuranceReportService.js',
                            'js/Services/InsuranceAccountManager/InsuranceAccountManagerDashboardService.js',
                            'js/Services/InsuranceReports/ExportReportService.js',

                            'js/scripts/Chart.bundle.js',
                            'js/scripts/angular-chart.js',
                            'js/scripts/Chart.Piecelabel.min.js',

                            'js/scripts/alasql.min.js',
                            'js/scripts/xlsx.core.min.js',
                            'js/scripts/html2canvas.min.js',
                            'js/scripts/canvg.min.js',
                            'js/scripts/jspdf.debug.js'

                        ]
                    });
                }]
            }
        })


        //Added by Vinod Application Settings in InsuranceAccountManager
        .state('ApplicationSettings', {
            url: "/ApplicationSettings",
            templateUrl: "views/InsuranceAccountManager/ApplicationSettings/InsuranceAccountManagerApplicationSettings.html",
            data: {
                pageTitle: 'ApplicationSettings',
                roles: ['INSURANCE ACCOUNT MANAGER']
            },
            controller: "InsuranceAccountManagerApplicationSettingsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/fullcalendar.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',

                            // Controllers
                            'views/InsuranceAccountManager/ApplicationSettings/InsuranceAccountManagerApplicationSettingsController.js',

                            //services
                            'js/Services/InsuranceAccountManager/ApplicationSettings/ApplicationSettingsService.js'

                        ]
                    });
                }]
            }
        })

        //Added by Vinod Premium Values in InsuranceAccountManager
        .state('PremiumValues', {
            url: "/PremiumValues",
            templateUrl: "views/InsuranceAccountManager/PremiumValues/InsuranceAccountManagerPremiumValues.html",
            data: {
                pageTitle: 'PremiumValues',
                roles: ['INSURANCE ACCOUNT MANAGER']
            },
            controller: "InsuranceAccountManagerPremiumValuesController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/fullcalendar.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',

                            // Controllers
                            'views/InsuranceAccountManager/PremiumValues/InsuranceAccountManagerPremiumValuesController.js',

                            //services
                            'js/Services/Administrator/BusinessRuleService.js',
                            'js/Services/InsuranceAccountManager/PremiumValues/EditPremiumValueService.js',
                            'js/Services/InsuranceAccountManager/PremiumValues/UploadZipCodeAndPremiumsService.js'

                        ]
                    });
                }]
            }
        })

        //Added by Vinod Edit Premium Values in InsuranceAccountManager
        .state('EditPremiumValuesSettings', {
            url: "/EditPremiumValuesSettings",
            templateUrl: "views/InsuranceAccountManager/PremiumValues/EditPremiumValuesSettings.html",
            data: {
                pageTitle: 'EditPremiumValuesSettings',
                roles: ['INSURANCE ACCOUNT MANAGER']
            },
            controller: "EditPremiumValuesSettingsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/fullcalendar.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',

                            // Controllers
                            'views/InsuranceAccountManager/PremiumValues/EditPremiumValuesSettingsController.js',
                            'views/InsuranceAccountManager/PremiumValues/AddNewZipCodePopUpController.js',

                            //services
                            'js/Services/Administrator/BusinessRuleService.js',
                            'js/Services/InsuranceAccountManager/PremiumValues/EditPremiumValueService.js'
                        ]
                    });
                }]
            }
        })


        //Added by Dilip Insurance AppraisalDueUpdateReports
        .state('InsAppraisalDueUpdateReports', {
            url: "/InsAppraisalDueUpdateReports",
            templateUrl: "views/InsAppraisalDueUpdateReports/InsAppraisalDueUpdateReports.html",
            data: {
                pageTitle: 'InsAppraisalDueUpdateReports',
                roles: ['INSURANCE ACCOUNT MANAGER']
            },
            controller: "InsAppraisalDueUpdateReportsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/fullcalendar.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            // Controllers
                            'views/InsAppraisalDueUpdateReports/InsAppraisalDueUpdateReportsController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/InsuranceAccountManager/InsuranceAccountManagerDashboardService.js'
                        ]
                    });
                }]
            }
        })

        //Added by Dilip Insurance Manager Reports
        .state('InsManagerReports', {
            url: "/InsuranceManagerReports",
            templateUrl: "views/InsuranceReports/ManagerReports.html",
            data: {
                pageTitle: 'ManagerReports',
                roles: ['INSURANCE ACCOUNT MANAGER']
            },
            controller: "ManagerReportsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/fullcalendar.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            // Controllers
                            'views/InsuranceReports/ManagerReportsController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/InsuranceAccountManager/InsuranceAccountManagerDashboardService.js',
                            'js/Services/InsuranceReports/InsuranceReportService.js',
                            'js/Services/AddPolicy/AddPolicyService.js',
                            'js/Services/InsuranceReports/ExportReportService.js',

                            'js/commonUtility/CalendarUtility.js',

                            'js/scripts/alasql.min.js',
                            'js/scripts/xlsx.core.min.js',
                            'js/scripts/html2canvas.min.js',
                            'js/scripts/canvg.min.js',
                            'js/scripts/jspdf.debug.js',
                            'js/commonUtility/CommonUtils.js',
                            'Contants/CommonConstants.js'
                        ]
                    });
                }]
            }
        })


        .state('InsuranceAccManagerAppraisal', {
            url: "/InsuranceManagerAppraisal",
            templateUrl: "views/UnderWriter/Dashboard/Appraisal/Appraisal.html",
            data: {
                pageTitle: 'Appraisal',
                roles: ['INSURANCE ACCOUNT MANAGER']
            },
            controller: "AppraisalController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/fullcalendar.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            // Controllers
                            'views/UnderWriter/Dashboard/Appraisal/AppraisalController.js',
                            'views/UnderWriter/Dashboard/Appraisal/AppraisalDetailsController.js',
                            'views/CommonTemplates/EmailPopupController.js',
                            'views/UnderWriter/Dashboard/Notes/NotesController.js',
                            'views/UnderWriter/Dashboard/Notes/AddItemNotePopupController.js',
                            'views/CommonTemplates/InsuranceAgentReviewPopupController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js',
                            'js/Services/Adjuster/AdjusterLineItemDetailsService.js',
                            'js/Services/Appraisals/AppraisalService.js',
                            'js/Services/InsuranceAgent/InsuranceAgentHomeService.js',
                            'js/Services/InsuranceAgentReview/InsuranceAgentReviewService.js'
                        ]
                    });
                }]
            }
        })

        // AdditionalInsurance Appraisal for Underwriter - added by Dilip ->
        .state('UnderwriterAddlAppraisal', {
            url: "/UnderwriterAddlAppraisal",
            templateUrl: "views/UnderWriter/Dashboard/AddlAppraisal/AddlAppraisal.html",
            data: {
                pageTitle: 'AdditionalAppraisal',
                roles: ['UNDERWRITER']
            },
            controller: "AddlAppraisalController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/fullcalendar.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            'assets/pages/scripts/ui-bootstrap-tpls-0.13.0.js',
                            'assets/global/plugins/kendo/css/kendo.common-material.min.css',
                            'assets/global/plugins/kendo/css/kendo.material.min.css',
                            'assets/global/plugins/kendo/css/kendo.material.mobile.min.css',
                            'assets/pages/scripts/kendo.all.min.js',

                            // Controllers
                            'views/UnderWriter/Dashboard/AddlAppraisal/AddlAppraisalController.js',
                            'views/UnderWriter/Dashboard/AddlAppraisal/AddlAppraisalDetailsController.js',
                            'views/CommonTemplates/EmailPopupController.js',
                            'views/AppraisalNotes/NotesController.js',
                            'views/AppraisalNotes/AddItemNotePopupController.js',
                            'views/CommonTemplates/InsuranceAgentReviewPopupController.js',
                            'views/InsuranceAgent/Appraisals/AddAppraisalController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/UnderWriter/UnderWriterDashboardService.js',
                            'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js',
                            'js/Services/Adjuster/AdjusterLineItemDetailsService.js',
                            'js/Services/Appraisals/AppraisalService.js',
                            'js/Services/AppraisalNotes/AppraisalNotesService.js',
                            'js/Services/InsuranceAgent/InsuranceAgentHomeService.js',
                            'js/Services/InsuranceAgentReview/InsuranceAgentReviewService.js'

                        ]
                    });
                }]
            }
        })

        .state('UnderWriterItemDetails', {
            url: "/UnderWriterItemDetails",
            templateUrl: "views/UnderWriter/UnderwriterItemDetails.html",
            data: { pageTitle: 'Dashboard' },
            controller: "UnderwriterItemDetailsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'views/UnderWriter/UnderwriterItemDetailsController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            //  'js/Services/UnderWriter/UnderWriterDashboardService.js'
                        ]
                    });
                }]
            }
        })
        .state('UnderWriterFineArt', {
            url: "/UnderWriterFineArt",
            templateUrl: "views/UnderWriter/UnderWriterFineArt.html",
            data: { pageTitle: 'FineArt' },
            controller: "UnderWriterFineArtController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'views/UnderWriter/UnderWriterFineArtController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            //  'js/Services/UnderWriter/UnderWriterDashboardService.js'
                        ]
                    });
                }]
            }
        })
        .state('UnderWriterWine', {
            url: "/UnderWriterWine",
            templateUrl: "views/UnderWriter/UnderWriterWine.html",
            data: { pageTitle: 'Wine' },
            controller: "UnderWriterWineController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'views/UnderWriter/UnderWriterWineController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            //  'js/Services/UnderWriter/UnderWriterDashboardService.js'
                        ]
                    });
                }]
            }
        })
        .state('UnderWriterDecorativeArt', {
            url: "/UnderWriterDecorativeArt",
            templateUrl: "views/UnderWriter/UnderWriterDecorativeArt.html",
            data: { pageTitle: 'Decorative Art' },
            controller: "UnderWriterDecorativeArtController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'views/UnderWriter/UnderWriterDecorativeArtController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            //  'js/Services/UnderWriter/UnderWriterDashboardService.js'
                        ]
                    });
                }]
            }
        })
        .state('UnderWriterGeneric', {
            url: "/UnderWriterGeneric",
            templateUrl: "views/UnderWriter/UnderWriterGeneric.html",
            data: { pageTitle: 'Generic' },
            controller: "UnderWriterGenericController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'views/UnderWriter/UnderWriterGenericController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            //  'js/Services/UnderWriter/UnderWriterDashboardService.js'
                        ]
                    });
                }]
            }
        })
        .state('AllEvents', {
            url: "/AllEvents",
            templateUrl: "views/AllEvents/AllEvents.html",
            data: {
                pageTitle: 'Report',
                roles: [SupervisorRole, AdjusterRole]
            },
            controller: "AllEventsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [

                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            //Controllers
                            'views/Adjuster/EventDetailsController.js',
                            'views/Adjuster/AddEventPopupController.js',
                            'views/AllEvents/AllEventsController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/AllEvents/AllEventsService.js',
                            'js/Services/Adjuster/EventService.js',
                            'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js'

                        ]
                    });
                }]
            }
        })

        .state('AllRequests', {
            url: "/AllRequests",
            templateUrl: "views/AllRequests/AllRequests.html",
            data: {
                pageTitle: 'Report',
                roles: [SupervisorRole, AdjusterRole]
            },
            controller: "AllRequestsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [

                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            //Controllers
                            'views/Adjuster/RequestDetailsController.js',
                            'views/Adjuster/AddRequestPopupController.js',
                            'views/AllRequests/AllRequestsController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/AllRequests/AllRequestsService.js',
                            'js/Services/Adjuster/RequestService.js',
                            'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js'

                        ]
                    });
                }]
            }
        })
        .state('AllNotes', {
            url: "/AllNotes",
            templateUrl: "views/AllNotes/AllNotes.html",
            data: {
                pageTitle: 'AllNotes',
                roles: [SupervisorRole, AdjusterRole, Policyholder]
            },
            controller: "AllNotesController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'views/AllNotes/AllNotesController.js',
                            'views/CommonTemplates/AddNotePopupController.js',
                            //services
                            'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js',
                            'js/Services/CommonServices/AuthHeaderService.js'
                        ]
                    });
                }]
            }
        })
        .state('AllTasks', {
            url: "/AllTasks",
            templateUrl: "views/Adjuster/AllTasks.html",
            data: {
                pageTitle: 'AllTasks',
                roles: [SupervisorRole, AdjusterRole, Policyholder]
            },
            controller: "AdjusterPropertyClaimController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            //end switch css-
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/global/plugins/jquery-multi-select/css/multi-select.css',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/jquery-multi-select/js/jquery.multi-select.js',
                            //controllers
                            'views/Adjuster/AdjusterPropertyClaimDetails.js',
                            'views/Adjuster/AdjusterListController.js',
                            'views/Adjuster/AdjusterReAssignController.js',
                            'views/ClaimCenterManager/NewItemDamageLostController.js',
                            'views/Adjuster/AddNewLostDamageItemDetailsController.js',
                            'views/Adjuster/AddNewVendorController.js',
                            'views/Adjuster/ItemValueController.js',
                            'views/Adjuster/ItemPayoutController.js',
                            'views/Adjuster/AssignPostLostItemController.js',
                            'views/Adjuster/ShowNotesAttachmentController.js',
                            'views/Adjuster/ShowClaimAttachmentController.js',
                            'views/CommonTemplates/AddNotePopupController.js',
                            'views/Adjuster/AddEventPopupController.js',
                            'views/Adjuster/AddRequestPopupController.js',
                            'views/Adjuster/NewClaimFormPopupController.js',
                            'views/Adjuster/EventDetailsController.js',
                            'views/Adjuster/RequestDetailsController.js',
                            'views/Adjuster/InvoicePaymentPopupController.js',
                            'views/ClaimFormDetails/ClaimFormDetailsController.js',
                            'views/Reports/ReportController.js',
                            'views/ActivityLog/ActivityLogController.js',
                            'views/Policy/PolicyDetailsController.js',
                            'views/CommonTemplates/CategoryChangePopUpController.js',
                            'views/CommonTemplates/AddItemPopupController.js',
                            'views/AllReplQuotes/AllReplQuotesController.js',
                            'views/CommonTemplates/ClaimDocumentsController.js',
                            'views/Adjuster/ConversationController.js',
                            'views/PolicyHolder/CompleteTaskPopupController.js',
                            'views/Adjuster/itemAssignmentPopUpController.js',
                            'views/Adjuster/AssignmentRatingPopUpController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Adjuster/AdjusterPropertyClaimDetailsService.js',
                            'js/Services/Adjuster/AdjusterListService.js',
                            'js/Services/Adjuster/AdjusterItemPayoutService.js',
                            'js/Services/Adjuster/AdjusterItemValueService.js',
                            'js/Services/Adjuster/NewClaimFormPopupService.js',
                            'js/Services/ClaimCenterManager/NewItemDamageLostService.js',
                            'js/Services/Adjuster/EventService.js',
                            'js/Services/Adjuster/RequestService.js',
                            'js/Services/Report/ReportService.js',
                            'js/Services/ActivityLog/ActivityLogService.js',
                            'js/Services/Policy/PolicyDetailsService.js',
                            'js/Services/CommonServices/LineItemService.js',
                            'js/Services/AllReplQuotes/AllReplQuotesService.js',
                            'js/Services/ClaimDocuments/ClaimDocumentsService.js',
                            'js/Services/PolicyHolder/PolicyHolderClaimDetailsService.js',
                            //CSS
                            'Css/claims/propertyClaims.css',
                            //For note details
                            'views/AllNotes/NoteDetailsController.js',
                            'js/Services/Adjuster/AdjusterLineItemDetailsService.js',
                            'js/commonUtility/utilityMethods.js',
                            //Factory
                            'js/factory/LineItemsFactory.js',
                            //Constants
                            'Contants/StatusConstants.js',
                            'views/CommonTemplates/CheckPopupController.js'
                        ]
                    });
                }]
            }
        })
        .state('UploadVendorDetails', {
            url: "/UploadVendorDetails",
            templateUrl: "views/UploadVendorDetails/UploadVendorDetails.html",
            data: {
                pageTitle: 'Upload Vendor Details',
                roles: [InsuranceAdmin]
            },
            controller: "UploadVendorDetailsContoller",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/UploadVendorDetails/UploadVendorDetailsService.js',
                            'views/UploadVendorDetails/UploadVendorDetailsContoller.js',
                        ]
                    });
                }]
            }
        })
        .state('UserDetailsUpload', {
            url: "/UserDetailsUpload",
            templateUrl: "views/UserDetailsUpload/UserDetailsUpload.html",
            data: {
                pageTitle: 'Upload User Details',
                roles: [InsuranceAdmin]
            },
            controller: "UserDetailsUploadContoller",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/UserDetailsUpload/UserDetailsUploadService.js',
                            'views/UserDetailsUpload/UserDetailsUploadController.js',
                        ]
                    });
                }]
            }
        })
        .state('UploadZipCodeAndPremiums', {
            url: "/UploadZipCodeAndPremiums",
            templateUrl: "views/InsuranceAccountManager/PremiumValues/UploadZipCodeAndPremiums.html",
            data: {
                pageTitle: 'Upload ZipCodes And Premiums',
                roles: ['INSURANCE ACCOUNT MANAGER']
            },
            controller: "UploadZipCodeAndPremiumsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/InsuranceAccountManager/PremiumValues/UploadZipCodeAndPremiumsService.js',
                            'views/InsuranceAccountManager/PremiumValues/UploadZipCodeAndPremiumsController.js',
                        ]
                    });
                }]
            }
        })
        .state('ThirdPartyContentService', {
            url: "/ThirdPartyContentService",
            templateUrl: "views/ThirdPartyVendor/ThirdPartyContentService.html",
            data: { pageTitle: 'Content Service' },
            controller: "ThirdPartyContentServiceController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'js/Services/CommonServices/AuthHeaderService.js',

                            'js/Services/ThirdPartyVendor/ThirdPartyContentService.js',
                            'views/ThirdPartyVendor/ThirdPartyContentServiceController.js',
                        ]
                    });
                }]
            }
        })
        .state('ThirdPartyNewContentService', {
            url: "/ThirdPartyNewContentService",
            templateUrl: "views/ThirdPartyVendor/ThirdPartyNewContentService.html",
            data: { pageTitle: 'Content Service' },
            controller: "ThirdPartyNewContentServiceController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ThirdPartyVendor/ThirdPartyContentService.js',
                            'views/ThirdPartyVendor/ThirdPartyNewContentServiceController.js',
                        ]
                    });
                }]
            }
        })
        .state('PolicyDetails',
            {
                url: "/PolicyDetails",
                templateUrl: "views/GlobalSearch/PolicyDetails.html",
                data: {
                    pageTitle: 'PolicyDetails',
                    roles: [AdjusterRole, SupervisorRole]
                },
                controller: "PolicyDetailsController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',

                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'views/GlobalSearch/PolicyDetailsController.js',

                                //services
                                'js/Services/CommonServices/AuthHeaderService.js',


                            ]
                        });
                    }]
                }
            })

        .state('PeopleDetails',
            {
                url: "/PeopleDetails",
                templateUrl: "views/GlobalSearch/PeopleDetails.html",
                data: {
                    pageTitle: 'People Details',
                    roles: [AdjusterRole]
                },
                controller: "PeopleDetailsController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',

                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'views/GlobalSearch/PeopleDetailsController.js',
                                'js/Services/Adjuster/AdjusterDashboardService.js',
                                //services
                                'js/Services/CommonServices/AuthHeaderService.js',


                            ]
                        });
                    }]
                }
            })
        .state('Contracts',
            {
                url: "/Contracts",
                templateUrl: "views/ThirdPartyVendor/Contracts.html",
                data: { pageTitle: 'Contracts Details' },
                controller: "ContractsController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',

                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'views/ThirdPartyVendor/ContractsController.js',
                                //services
                                'js/Services/CommonServices/AuthHeaderService.js',
                                'js/Services/Adjuster/ThirdPartyContractService.js'
                            ]
                        });
                    }]
                }
            })
        .state('AssociateReport',
            {
                url: "/AssociateReport",
                templateUrl: "views/ThirdPartyVendor/AssociateReport.html",
                data: { pageTitle: 'Contracts Details' },
                controller: "AssociateReportController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'views/ThirdPartyVendor/AssociateReportController.js',
                                //services
                                'js/Services/CommonServices/AuthHeaderService.js',
                                'js/Services/ThirdPartyVendor/AssociateReportService.js'
                            ]
                        });
                    }]
                }
            })
        .state('VendorInfo', {
            url: "/VendorInfo",
            templateUrl: "views/GlobalSearch/VendorInfo.html",
            data: {
                pageTitle: 'Vendor Details',
                roles: [AdjusterRole, SupervisorRole]
            },
            controller: "VendorInfoController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'views/GlobalSearch/VendorInfoController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Adjuster/AdjusterDashboardService.js'
                        ]
                    });
                }]
            }
        })
        .state('AddCustomItem', {
            url: "/AddCustomItem",
            templateUrl: "views/Adjuster/AddCustomItem.html",
            data: {
                pageTitle: 'Add Custom Item',
                roles: [AdjusterRole, SupervisorRole]
            },
            controller: "AddCustomItemController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/pages/scripts/components-date-time-pickers.min.js',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'views/Adjuster/AddCustomItemController.js',
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Adjuster/AdjusterLineItemDetailsService.js',
                            'views/Adjuster/AddNewCustomItemController.js'
                        ]
                    });
                }]
            }
        })

        //3rd party accounting administrator
        .state('ClaimBills', {
            url: "/ClaimBills",
            templateUrl: "views/ThirdPartyAccountingAdministrator/ClaimBills.html",
            data: { pageTitle: 'Claim Bills' },
            controller: "ClaimBillsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'views/ThirdPartyAccountingAdministrator/ClaimBillsController.js',
                            'js/Services/ThirdPartyAccountingAdministrator/ClaimBillsService.js',
                        ]
                    });
                }]
            }
        })
        //3rd party shipping administrator
        .state('Orders', {
            url: "/Orders",
            templateUrl: "views/ThirdPartyShipingAdministartor/Orders.html",
            data: { pageTitle: 'Orders' },
            controller: "OrdersController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'views/ThirdPartyShipingAdministartor/OrdersController.js',
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/ThirdPartyShipingAdministartor/OrdersService.js',
                        ]
                    });
                }]
            }
        })
        .state('MER', {
            url: "/MER",
            templateUrl: "views/Adjuster/MER.html",
            data: {
                pageTitle: 'MER',
                roles: [SupervisorRole, AdjusterRole]
            },
            controller: "MERController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'views/Adjuster/MERController.js',
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Adjuster/AdjusterLineItemDetailsService.js',

                        ]
                    });
                }]
            }
        })
        .state('ContractedVendor', {
            url: "/ContractedVendor",
            templateUrl: "views/Administrator/ContractedVendors.html",
            data: {
                pageTitle: 'ContractedVendor',
                roles: [InsuranceAdmin]
            },
            controller: "ContractedVendorController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'views/Administrator/ContractedVendorController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Administrator/VendorRegistrationService.js',


                        ]
                    });
                }]
            }
        })
        .state('VendorsList', {
            url: "/VendorsList",
            templateUrl: "views/Administrator/VendorsList.html",
            data: {
                pageTitle: 'VendorsList',
                roles: [InsuranceAdmin]
            },
            controller: "VendorsListController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'views/Administrator/VendorsListController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/Administrator/VendorRegistrationService.js',


                        ]
                    });
                }]
            }
        })
        //Add Policy
        .state('AddPolicy', {
            url: "/AddPolicy",
            templateUrl: "views/Policy/AddPolicy.html",
            data: {
                pageTitle: 'AddPolicy',
                roles: ['INSURANCE AGENT']
            },
            controller: "AddPolicyController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',

                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            //Controller
                            'views/Policy/AddPolicyController.js',

                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/AddPolicy/AddPolicyService.js',
                            
                            'js/commonUtility/CalendarUtility.js'
                        ]
                    });
                }]
            }
        })

        //Agent global search
        .state('InsuranceGlobalSearch', {
            url: "/InsuranceGlobalSearch",
            templateUrl: "views/InsuranceGlobalSearch/InsuranceGlobalSearch.html",
            data: {
                pageTitle: 'Global Search',
                roles: ['INSURANCE AGENT', 'UNDERWRITER', 'INSURANCE ACCOUNT MANAGER']
            },
            controller: "InsuranceGlobalSearchController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',

                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',

                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'views/InsuranceGlobalSearch/InsuranceGlobalSearchController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/InsuranceAgent/InsuranceAgentHomeService.js',
                            'views/GlobalSearch/DocumentDetailsController.js'
                        ]
                    });
                }]
            }
        })

        //Policy holder details page
        .state('PolicyHolderDetails',
            {
                url: "/PolicyHolderDetails",
                templateUrl: "views/GlobalSearch/PolicyHolderDetails.html",
                data: {
                    pageTitle: 'Policy Holder Details',
                    roles: ['INSURANCE AGENT']
                },
                controller: "PolicyHolderDetailsController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',

                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'views/GlobalSearch/PolicyHolderDetailsController.js',
                                'js/Services/InsuranceAgent/InsuranceAgentHomeService.js',
                                //services
                                'js/Services/CommonServices/AuthHeaderService.js'
                            ]
                        });
                    }]
                }
            })

        .state('PolicyHolderReview', {
            url: "/PolicyHolderReview",
            templateUrl: "views/CommonTemplates/PolicyholderMobileView.html",
            data: { pageTitle: 'Policyholder Review' },
            controller: "PolicyHolderReviewController",
            resolve: {
                id: ['$stateParams', function ($stateParams) {
                    return $stateParams.id;
                }],
                //added to resolve the dependency
                appraisalData: function () { },
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                            'assets/layouts/layout4/scripts/IPadResolution.js',
                            'assets/global/plugins/bootstrap-switch/css/bootstrap-switch.min.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/global/plugins/jquery-multi-select/css/multi-select.css',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/jquery-multi-select/js/jquery.multi-select.js',
                            'assets/global/plugins/bootstrap-switch/js/bootstrap-switch.min.js',

                            'views/CommonTemplates/PolicyHolderReviewController.js',
                            //services
                            'js/Services/Appraisals/AppraisalService.js'
                        ]
                    });
                }]
            }
        })
        .state('AdjusterSalvageReports', {
            url: "/AdjusterSalvageReports",
            templateUrl: "views/Adjuster/SalvageReports.html",
            data: {
                pageTitle: 'Salvage Reports',
                roles: [SupervisorRole, claimManager, AdjusterRole]
            },
            controller: "SalvageReportsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/kendo/css/kendo.common-material.min.css',
                            'assets/global/plugins/kendo/css/kendo.material.min.css',
                            'assets/global/plugins/kendo/css/kendo.material.mobile.min.css',
                            'assets/pages/scripts/kendo.all.min.js',
                            'js/scripts/dateFilter.js',

                            'views/Adjuster/SalvageReportsController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/AllClaims/AllClaimsServices.js',
                            'js/Services/Adjuster/AdjusterDashboardService.js',
                            'js/Services/Adjuster/SalvageReportsService.js',
                            'js/commonUtility/utilityMethods.js',
                            'js/commonUtility/CommonUtils.js',
                            'Contants/CommonConstants.js',
                            'js/commonUtility/utility.js',
                            

                        ]
                    });
                }]
            }
        })

        .state('ClaimReports', {
            url: "/ClaimReports",
            templateUrl: "views/ClaimReports/ClaimReports.html",
            data: {
                pageTitle: 'Claim Reports',
                roles: [SupervisorRole, claimManager, AdjusterRole]
            },
            controller: "ClaimReportsController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            'assets/global/plugins/kendo/css/kendo.common-material.min.css',
                            'assets/global/plugins/kendo/css/kendo.material.min.css',
                            'assets/global/plugins/kendo/css/kendo.material.mobile.min.css',
                            'assets/pages/scripts/kendo.all.min.js',
                            'js/scripts/dateFilter.js',

                            'views/Adjuster/SalvageReportsController.js',
                            'views/ClaimReports/ClaimReportsController.js',
                            'views/ClaimReports/ExportsPopUpController.js',
                            //services
                            'js/Services/CommonServices/AuthHeaderService.js',
                            'js/Services/AllClaims/AllClaimsServices.js',
                            'js/Services/Adjuster/AdjusterDashboardService.js',
                            'js/Services/Adjuster/SalvageReportsService.js',
                            'js/Services/ClaimReport/ClaimReportsService.js',
                            'js/commonUtility/utilityMethods.js',
                            'js/commonUtility/utility.js',
                            'js/commonUtility/CommonUtils.js',
                            'Contants/CommonConstants.js'
                        ]
                    });
                }]
            }
        })

        .state('HelpAndFrequentlyAskedQuestions', {
            url: "/helpAndfrequentlyaskedquestions",
            templateUrl: "views/HelpAndFAQ/HelpAndFAQ.html",
            data: {
                pageTitle: 'Salvage Reports',
                roles: ['ADJUSTER', 'Adjuster', 'Insurance Adjuster']
            },
            controller: "FAQController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',

                            //Controller
                            'views/HelpAndFAQ/FAQController.js'
                        ]
                    });
                }]
            }
        })

        .state('cliamlifecyclefaq', {
            url: "/cliamlifecyclefaq",
            templateUrl: "views/HelpAndFAQ/ClaimLifeCycleFAQ.html",
            data: {
                pageTitle: 'Salvage Reports',
                roles: ['ADJUSTER', 'Adjuster', 'Insurance Adjuster']
            },
            controller: "ClaimLifeCycleFAQController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',

                            //Controller
                            'views/HelpAndFAQ/ClaimLifeCycleFAQController.js'
                        ]
                    });
                }]
            }
        })

        .state('useradmistrationfaq', {
            url: "/useradmistrationfaq",
            templateUrl: "views/HelpAndFAQ/UserAdminstationFAQ.html",
            data: {
                pageTitle: 'Salvage Reports',
                roles: ['ADJUSTER', 'Adjuster', 'Insurance Adjuster']
            },
            controller: "UserAdmistrationFAQController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',

                            //Controller
                            'views/HelpAndFAQ/UserAdmistrationFAQController.js'
                        ]
                    });
                }]
            }
        })

        .state('billingandpaymentsfaq', {
            url: "/billingandpaymentsfaq",
            templateUrl: "views/HelpAndFAQ/BillingsAndPaymentsFAQ.html",
            data: {
                pageTitle: 'Salvage Reports',
                roles: ['ADJUSTER', 'Adjuster', 'Insurance Adjuster']
            },
            controller: "BillingsAndPaymentsFAQController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            'assets/global/plugins/select2/css/select2.min.css',
                            'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            'assets/global/plugins/select2/js/select2.full.js',
                            'assets/pages/scripts/components-bootstrap-select.min.js',
                            'assets/pages/scripts/components-select2.min.js',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',

                            //Controller
                            'views/HelpAndFAQ/BillingsAndPaymentsFAQController.js'
                        ]
                    });
                }]
            }
        })
        .state('ReportSettings',
            {
                url: "/ReportSettings",
                templateUrl: "views/Administrator/ReportSettings.html",
                data: {
                    pageTitle: 'Report Settings',
                    roles: [InsuranceAdmin]
                },
                controller: "ReportSettingsController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                //Controller
                                'views/Administrator/ReportSettingsController.js',
                                //services
                                'js/Services/Administrator/ReportSettingsService.js',
                                'js/Services/CommonServices/AuthHeaderService.js',
                            ]
                        });
                    }]
                }
            })

            .state('JewelryPolicyHolderReview', {
                url: "/JewelryPolicyHolderReview",
                templateUrl: "views/CommonTemplates/JewelryPolicyHolderMER.html",
                data: { pageTitle: 'Policyholder Review' },
                controller: "JewelryPolicyHolderReviewController",
                    resolve: {
                        id: ['$stateParams', function ($stateParams) {
                            return $stateParams.id;
                        }],
                        //added to resolve the dependency
                        appraisalData: function () { },
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.standalone.css',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                                'assets/layouts/layout4/scripts/IPadResolution.js',
                                'assets/global/plugins/bootstrap-switch/css/bootstrap-switch.min.css',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/global/plugins/jquery-multi-select/css/multi-select.css',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
                                'assets/global/plugins/jquery-multi-select/js/jquery.multi-select.js',
                                'assets/global/plugins/bootstrap-switch/js/bootstrap-switch.min.js',
    
                                'views/CommonTemplates/JewelryPolicyHolderReviewController.js',
                                'views/CustomJewelryComparable/JewelryCustomComparableController.js',
                                'views/Adjuster/AdjusterLineItemDetailsController.js',
                                //services
                                'js/Services/Adjuster/AdjusterLineItemDetailsService.js',
                                'js/Services/Appraisals/AppraisalService.js',
                                'js/Services/CustomJewelryComparable/JewelryCustomComparableService.js',
                                'js/Services/LoginService.js'
                                
                            ]
                        });
                    }]
                }
            })
            .state('SamlCallback', {
                url: "/SamlCallback",
                templateUrl: "views/User/SamlLogin/SamlCallback.html",
                data: {
                    pageTitle: 'SamlCallback'
                },
                controller: "SamlCallbackController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
    
                                'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                                'assets/global/plugins/select2/css/select2.min.css',
                                'assets/global/plugins/select2/css/select2-bootstrap.min.css',
                                'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                                'assets/global/plugins/select2/js/select2.full.js',
                                'assets/pages/scripts/components-bootstrap-select.min.js',
                                'assets/pages/scripts/components-select2.min.js',
    
                                // controller
                                'views/User/SamlLogin/SamlCallbackController.js',
                                'js/Services/CommonServices/AuthHeaderService.js',
                                'js/Services/SamlCallbackService.js'
    
                            ]
                        });
                    }]
                }
            })
            .state('SamlSuccess', {
                url: "/SamlSuccess",
                templateUrl: "views/User/SamlLogin/SamlSuccess.html",
                data: {
                    pageTitle: 'SamlSuccess',
                },
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before',
                           });
                    }]
                }
            })
            .state('SamlFailure', {
                url: "/SamlFailure",
                templateUrl: "views/User/SamlLogin/SamlFailure.html",
                data: {
                    pageTitle: 'SamlFailure',
                },
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before',
                           });
                    }]
                }
            })

    $urlRouterProvider.otherwise("/login");
}]);


/* Init global settings and run the app */
MetronicApp
    .run(["$rootScope", "settings", "$state", "$location", "RoleBasedService","HeaderService", "Keepalive", "Idle", "$window","UserService", function ($rootScope,settings, $state, $location, RoleBasedService, HeaderService,Keepalive, Idle, $window, UserService) {
        $rootScope.$state = $state; // state to be accessed from view
        $rootScope.$settings = settings; // state to be accessed from view
        
        $rootScope.$on('IdleStart', function() { console.log("IdleTimeout started...") });
        $rootScope.$on('IdleTimeout', function() { 
            console.log("Application is going to logout..."); 
            resetSessionData();            
        });

        // Clearing existing data and resetting session         
        function resetSessionData() {
                var myE2 = angular.element(document.querySelector('.page-wrapper'));
                myE2.removeClass('wrapBoxShodow');
                //document.body.style.backgroundColor = "#364150";
                $(".wrapBoxShodow").css("box-shadow", "0px 1px 16px 1px #364150");
                var APIURL = sessionStorage.getItem("apiurl")
                var ReceiptURL = sessionStorage.getItem("receipturl");
                var ExportURL = sessionStorage.getItem("ExportUrl");
                var Xoriginator = sessionStorage.getItem("Xoriginator");
                var ClaimTemplate = sessionStorage.getItem("ClaimTemplate");
                var ItemTemplate = sessionStorage.getItem("ItemTemplate");
                var VendorDetailsTemplate = sessionStorage.getItem("VendorDetailsTemplate");
                var UserDetailsTemplate = sessionStorage.getItem("UserDetailsTemplate");
                var claimProfile = sessionStorage.getItem("claimProfile");
                var serviceRequests = sessionStorage.getItem("serviceRequests");
                var googleShoppingDropdown = sessionStorage.getItem("googleShoppingDropdown");
                var jewelryVendor = sessionStorage.getItem("jewelryVendor");
                var AdminApiurl = sessionStorage.getItem("AdminApiurl");
                var hideCaptcha = sessionStorage.getItem("hideCaptcha");
                var disableSerpWow = sessionStorage.getItem("disableSerpWow");
                var token = sessionStorage.getItem("AccessToken");
                var userid = sessionStorage.getItem("UserId");
                var loginWithSSO = sessionStorage.getItem("loginWithSSO");
                var loginWithSAML = sessionStorage.getItem("loginWithSAML");
                var isCoreLogic = sessionStorage.getItem("isCoreLogic");
                
                // Clear session data
                sessionStorage.clear();
                UserService.removeUserDetails();                
                // window.localStorage.clear();
                

                sessionStorage.setItem("apiurl", APIURL)
                sessionStorage.setItem("receipturl", ReceiptURL);
                sessionStorage.setItem("ExportUrl", ExportURL);
                sessionStorage.setItem("Xoriginator", Xoriginator);
                sessionStorage.setItem("ClaimTemplate", ClaimTemplate);
                sessionStorage.setItem("ItemTemplate", ItemTemplate);
                sessionStorage.setItem("VendorDetailsTemplate", VendorDetailsTemplate);
                sessionStorage.setItem("UserDetailsTemplate", UserDetailsTemplate);
                sessionStorage.setItem("jewelryVendor", jewelryVendor);
                sessionStorage.setItem("claimProfile", claimProfile);
                sessionStorage.setItem("serviceRequests", serviceRequests);
                sessionStorage.setItem("googleShoppingDropdown", googleShoppingDropdown);
                sessionStorage.setItem("AdminApiurl", AdminApiurl);
                sessionStorage.setItem("hideCaptcha", hideCaptcha);
                sessionStorage.setItem("disableSerpWow", disableSerpWow);
                sessionStorage.setItem("IdleTimeout", "true");
                sessionStorage.getItem("AccessToken",token);
                sessionStorage.setItem("loginScreen", $location.absUrl())
                sessionStorage.setItem("UserId",userid);
                sessionStorage.setItem("loginWithSSO", loginWithSSO);
                sessionStorage.setItem("loginWithSAML",loginWithSAML);
                sessionStorage.setItem("isCoreLogic",isCoreLogic);
                

                if (isCoreLogic)
                {
                    bootbox.alert({
                        title: "Session timed out",
                        closeButton:false,
                        message: "Please start again from Artigem Contents URL on Claims Connect Application to continue",
                        callback: function() 
                        {
                $location.url('/login');
                //$location.path("/login");
                $window.location.reload();
                            $window.close();
                        }
                        });
                }
                else
                {
                    $location.url('/login');
                    //$location.path("/login");
                    $window.location.reload();
                }
        }


        function getUrlParameter(name) {
            name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
            var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
            var results = regex.exec(location.href);
            return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
        };
        var commonClaimObj;
        function redirectClaim() {
            commonClaimObj = {
                "claimNumber": getUrlParameter('claim_number'),
                "claimId": getUrlParameter('id'),
                "itemId": getUrlParameter('item'),
                "tab": getUrlParameter("tab"),
                "redirect": getUrlParameter("redirect"),
                "assignmentNumber": getUrlParameter("assignment_number")
            }
            sessionStorage.setItem("ClaimNo", commonClaimObj.claimNumber);
            sessionStorage.setItem("ClaimId", commonClaimObj.claimId);
            sessionStorage.setItem("ForwardTab", commonClaimObj.tab);
            sessionStorage.setItem("assignmentNumber",commonClaimObj.assignmentNumber);
            sessionStorage.setItem("apiurl", window.localStorage.getItem("apiurl"));
            if (sessionStorage.getItem("RoleList") === 'ADJUSTER'){
                sessionStorage.setItem("AdjusterPostLostItemId", commonClaimObj.itemId);
                sessionStorage.setItem("redirect","AdjusterPropertyClaimDetails");
                $location.url('/AdjusterPropertyClaimDetails');
            }
            else if (sessionStorage.getItem("RoleList") === 'CLAIM SUPERVISOR'){
                sessionStorage.setItem("SupervisorPostLostItemId", commonClaimObj.itemId);
                sessionStorage.setItem("claimDetailsCurrentTab","Contents");
                $location.url('/SupervisorClaimDetails');

            }
            if (commonClaimObj && commonClaimObj.redirect === 'all_notes') {
                sessionStorage.setItem("AllNoteClaimNumber", commonClaimObj.claimNumber);
                sessionStorage.setItem("AllNoteClaimId", commonClaimObj.claimId);
            }
        };

        function redirectClaimCoreLogic(claimNumber,claimId,role) {
            commonClaimObj = {
                "claimNumber": claimNumber,
                "claimId": claimId
            }
            sessionStorage.setItem("ClaimNo", commonClaimObj.claimNumber);
            sessionStorage.setItem("ClaimId", commonClaimObj.claimId);
            if (role === 'ADJUSTER'){
                sessionStorage.setItem("AdjusterPostLostItemId", commonClaimObj.itemId);
                sessionStorage.setItem("redirect","AdjusterPropertyClaimDetails");
                sessionStorage.setItem("claimDetailsCurrentTab","Contents");
                $location.url('/CorelogicAdjusterPropertyClaimDetails');
            }
            else if (role === 'CLAIM SUPERVISOR'){
                sessionStorage.setItem("SupervisorPostLostItemId", commonClaimObj.itemId);
                $location.url('/SupervisorClaimDetails');

            }
        };

        function getUrlParameterfromURL(name,url) {
            name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
            var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
            var results = regex.exec(url);
            return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
        };

        function getCipherEncryptedText(text) {
            var aesUtil = new AesUtil(128, 1000);
            iv = CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex);
            salt = CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex);
            passPhrase = CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex);
            if (text != null || text != '')
                return (iv + "::" + aesUtil.encrypt(salt, iv, passPhrase, text) + "::" + salt + "::" + passPhrase);
        }
    

        var commonItemObj;
        function redirectItem() {
            commonItemObj = {
                "claimNumber": getUrlParameter('claim_number'),
                "claimId": getUrlParameter('id'),
                "itemId": getUrlParameter('item_id'),
                "tab": getUrlParameter("tab"),
                "redirect": getUrlParameter("redirect")
            }
            sessionStorage.setItem("ClaimNo", commonItemObj.claimNumber);
            sessionStorage.setItem("ClaimId", commonItemObj.claimId);
            sessionStorage.setItem("ForwardTab", commonItemObj.tab);
            sessionStorage.setItem("apiurl", window.localStorage.getItem("apiurl"));
            //sessionStorage.setItem("AssignmentNumber", commonClaimObj.assignment);
            //sessionStorage.setItem("tab", commonClaimObj.tab);
            //if (sessionStorage.getItem("RoleList") === 'VENDOR ASSOCIATE') {
                if (sessionStorage.getItem("RoleList") === 'ADJUSTER'){
                sessionStorage.setItem("AdjusterPostLostItemId",  commonItemObj.itemId);
                $location.url('/AdjusterLineItemDetails');
                }
            else if (sessionStorage.getItem("RoleList") === 'CLAIM SUPERVISOR'){
                sessionStorage.setItem("SupervisorPostLostItemId",  commonItemObj.itemId);
                $location.url('/SupervisorLineItemDetails');
            }
            if ( commonItemObj &&  commonItemObj.redirect === 'all_notes') {
                sessionStorage.setItem("AllNoteClaimNumber",  commonItemObj.claimNumber);
                sessionStorage.setItem("AllNoteClaimId",  commonItemObj.claimId);
            //}
        }
        // $location.url('/AdjusterLineItemDetails');
    }
    var commonItemObj;
    function redirectCustomComparable() {
        commonItemObj = {
            "claimNumber": getUrlParameter('claim_number'),
            "claimId": getUrlParameter('id'),
            "itemId": getUrlParameter('item_id'),
            "assignment": getUrlParameter('assignment'),
            "tab": getUrlParameter("tab"),
            "redirect": getUrlParameter("redirect")
        }
        sessionStorage.setItem("ClaimNo", commonItemObj.claimNumber);
        sessionStorage.setItem("ClaimId", commonItemObj.claimId);
        sessionStorage.setItem("ForwardTab", commonItemObj.tab);
        sessionStorage.setItem("apiurl", window.localStorage.getItem("apiurl"));
        if (sessionStorage.getItem("RoleList") === 'ADJUSTER'){
            sessionStorage.setItem("AdjusterPostLostItemId",  commonItemObj.itemId);
            $location.url('/AdjusterLineItemDetails');
        }
        else if (sessionStorage.getItem("RoleList") === 'CLAIM SUPERVISOR'){
            sessionStorage.setItem("SupervisorPostLostItemId",  commonItemObj.itemId);
            $location.url('/SupervisorLineItemDetails');
        }
    }


        function redirectInvoice() {
            var ObjDetails = {
                "InvoiceNo": getUrlParameter('invoice_no'),
                "ClaimNo": "",
                "isServiceRequestInvoice": false,
                "PageName": "BillsAndPayments"
            };
            sessionStorage.setItem("Details", JSON.stringify(ObjDetails))
            if (sessionStorage.getItem("RoleList") === 'ADJUSTER' || sessionStorage.getItem("RoleList") === 'CLAIM SUPERVISOR')
                $location.url('/VendorInvoiceDetails');
        };
        function redirectViewQuote(){
            var ObjDetails = {
                "quoteNumber" : getUrlParameter('quote_number'),
                "assignmentNumber" : getUrlParameter('assignment')
            };
            sessionStorage.setItem("assignmentNumber", ObjDetails.assignmentNumber);
            sessionStorage.setItem("quoteNumber",ObjDetails.quoteNumber);
            if(sessionStorage.getItem("RoleList") === 'ADJUSTER' || sessionStorage.getItem("RoleList") === 'CLAIM SUPERVISOR')
                $location.url('/ViewQuote');
        }

       function captureIdentifier() {
            var param = {
                "userToken":getUrlParameter('user')
            };
            var saveGemGuideUserToken = HeaderService.saveGemGuideUserToken(param);
            saveGemGuideUserToken.then(function (success) {
                if (success.data.status === 200) {
                    $location.url('gemlabKeySuccess'); 
                }
            }, function (error) {
                // if (error != null) {
                //     $scope.ErrorMessage = error.data.errorMessage;
                // }
    
            });
            
           sessionStorage.setItem("gemlabUniqueID", getUrlParameter('user'));
           
        }

        if (sessionStorage.getItem("IsLogined") === "true")
            //          Idle.watch();
            $rootScope.$on('$stateChangeStart', function (event, next, current) {
                var count = 0;
                var CurrentRole = sessionStorage.getItem("RoleList")
                //Validating whether the current user has access to screen or not( With each routing we set "role")
                angular.forEach(next.data.roles, function (curRole) {
                    if (CurrentRole.toUpperCase() == curRole.toUpperCase()) {
                        count++;
                    }
                });
                //If Does't have access to screen then count==0
                if (count == 0) {
                    var path = $location.path();
                    if (path != "/login") {
                        // For unauthenticated users
                        var loginStatus = sessionStorage.getItem("IsLogined");
                        if (angular.isDefined(loginStatus) && loginStatus != null) {
                            toastr.remove();
                            toastr.error("Access Denied", "Error");
                            $location.path("/login");
                        }
                        //If user logged out automatically using Idle state
                        else {
                            $location.path("/login");
                        }

                    }
                }
            });

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            var isFirstTimelogin = sessionStorage.getItem("isResetPassword");
            var isForgotPassword = sessionStorage.getItem("ForgotPassword");
            var isSecurityExists = sessionStorage.getItem("isSQExists");

            if (isFirstTimelogin == "true") {
                $location.url("/Security");
            }

            if (isForgotPassword == "true" && isSecurityExists === "false") {
                $location.url("/Security");
            }

            if (isForgotPassword == "true" && isSecurityExists === "true") {
                $location.url("/ResetPassword");
            }

            if (isSecurityExists === "false" && isFirstTimelogin === "false" && isForgotPassword === "false") {
                $location.url("/SecurityQuestion");
            }

            if(next.includes("code") && next.includes("state") && $location.path().length>0)
            {
             var startIndex = $location.absUrl().indexOf('=');
             var endIndex = $location.absUrl().indexOf('&');
             var code = $location.absUrl().slice(startIndex+1,endIndex);
             sessionStorage.setItem("OktaAuthorizationCode",code);
             var indexOfHash =  $location.absUrl().indexOf('#');
             var Baseurl =  $location.absUrl().slice(0,indexOfHash+2);
            //  var Baseurl = $location.absUrl().split("?")[0];
             var finalUrl = Baseurl+"login"
             window.location.replace(finalUrl)
            }

            if(next.includes("coreLogicRedirection") && $location.path().length>0)
            {
               var content = getUrlParameterfromURL('content',next);
                let data = {
                    "ssoAccessToken": content,
                }
                let Xoriginator = window.location.protocol+"//"+$location.host()+window.location.pathname.slice(0,-1);
                // Xoriginator = "http://45.79.5.228:8080/evolution"
                var url = window.location.protocol+"//"+window.location.host + "/ArtigemRS-FI/api/web/coreLogic/authenticate"
                // url = window.location.protocol+"//"+"localhost:8081" + "/ArtigemRS-FI/api/web/coreLogic/authenticate"
                var response = HeaderService.authenticate(url,data,Xoriginator);
                response.then((success)=>{
                    var LoginResponse = success.data.data;//Later used while checking user is first time logginn in or not
                    console.log(LoginResponse);
                    var errormsg = '';
                    //Added for new page
                    var myE2 = angular.element(document.querySelector('.page-wrapper'));
                    myE2.addClass('wrapBoxShodow');
                    //end
                    var myEl = angular.element(document.querySelector('.page-on-load'));
                    myEl.addClass('div_MainBody');
                    var result = UserService.initUserDetails(success.data, null,null);
                    //$http.defaults.headers.common['X-Auth-Token'] = success.data.data.token;
                    var RolePermission = success.data.data.role;
                    sessionStorage.setItem("IsVendorLogIn", undefined);
                    sessionStorage.setItem("loginCount", LoginResponse.loginCount);
                    //Make single list of screen and its permission stored in session uisng RolebasedService
                    var ScreenList = [];
                    var RoleList = [];
                    var accessComparable = false;
                    for (var i = 0; i < RolePermission.length; i++) {
                        //Simply get the screen access list screen code and stored it in list and chek wheather the code is present in list or not
                        if ((angular.isDefined(RolePermission[i].roleName)) && (RolePermission[i].roleName !== null)) {
                            //Get Role List
                            RoleList.push(RolePermission[i].roleName);
                        }


                        angular.forEach(RolePermission[i].permissions, function (item) {
                            if (item.name && item.name == 'COMPARABLE SEARCH')
                                accessComparable = item.canSearch ? item.canSearch : false;
                        });
                        sessionStorage.setItem("accessComparable", accessComparable)
                        
                        // routing to default new UI
                        var claimNumber,claimId;
                        claimNumber = LoginResponse.claimsOnHand[0].claimNumber;
                        claimId = LoginResponse.claimsOnHand[0].id;
                        
                        //Get screen list form Role BasedMenu service
                        if (ScreenList !== null && angular.isDefined(ScreenList) && ScreenList.length > 0) {
                            ScreenList = ScreenList.concat(RoleBasedService.GetUserScreenList(RolePermission[i].roleName));
                        }
                        else {
                            var Rolelist = RolePermission[i].roleName;
                            var AllRoleslist = [];
                            var list = [];

                            ScreenList = RoleBasedService.GetUserScreenList();
                            ScreenList.then(function (success) {
                                AllRoleslist = success.data;
                                var Flag = 0;
                                angular.forEach(AllRoleslist.RoleList, function (roleList) {
                                    if (Flag == 0) {
                                        angular.forEach(roleList.Roles, function (role) {
                                            if (Flag == 0) {
                                                if (role === Rolelist) {
                                                    list = roleList.Screens;
                                                    sessionStorage.setItem("HomeScreen", roleList.Home);
                                                    window.localStorage.setItem("HomeScreen", roleList.Home);
                                                    Flag++;
                                                }
                                            }
                                        });
                                    }
                                });




                                // sessionStorage.setItem("ForgotPassword", LoginResponse.forgotPassword);
                                sessionStorage.setItem("ScreenList", JSON.stringify(list));
                                window.localStorage.setItem("ScreenList", JSON.stringify(list));

                                if (LoginResponse.resetPassword) {
                                    $location.url("/Security");
                                }

                                else {
                                    if (sessionStorage.getItem("redirectTo") === "Appraisal") {
                                        if (Rolelist == 'UNDERWRITER') {
                                            $location.path('/UnderwriterAppraisal');
                                        }
                                        else
                                            $location.path(sessionStorage.getItem("redirectTo"));
                                    }
                                    else if (sessionStorage.getItem("redirectTo") === "Claim") {
                                        let commonClaimObj = JSON.parse(sessionStorage.getItem("redirectionParams"));
                                        if (sessionStorage.getItem("RoleList") === 'ADJUSTER' || sessionStorage.getItem("RoleList") === 'CLAIM SUPERVISOR') {
                                            if (commonClaimObj && commonClaimObj.tab === 'notes') {
                                                if (sessionStorage.getItem("RoleList") === 'ADJUSTER') {
                                                    sessionStorage.setItem("AdjusterPostLostItemId", commonClaimObj.itemId);
                                                    $location.url("/AdjusterLineItemDetails");
                                                }
                                                else if (sessionStorage.getItem("RoleList") === 'CLAIM SUPERVISOR') {
                                                    sessionStorage.setItem("SupervisorPostLostItemId", commonClaimObj.itemId);
                                                    $location.url("/SupervisorLineItemDetails");
                                                }
                                            } else
                                                $location.url(commonClaimObj && commonClaimObj.redirect === 'all_notes' ? "/AllNotes" : (sessionStorage.getItem("RoleList") === 'ADJUSTER' ? "/AdjusterPropertyClaimDetails" : "/SupervisorClaimDetails"));
                                        }
                                        else
                                            $location.url('AdjusterLineItemDetails');
                                    }
                                    else if (sessionStorage.getItem("ClaimObj")) {
                                        $location.path("/AllRequests");
                                    }
                                    // else if(sessionStorage.getItem("RoleList") === 'POLICY HOLDER' ){
                                    //     $location.path('http://localhost:8080/fist_app/index.html');
                                    // }
                                    else if(sessionStorage.getItem("RoleList") === "POLICYHOLDER" ){
                                        window.localStorage.setItem("loginScreen", $location.absUrl());
                                        $location.path('http://localhost:8080/claim');
                                        
                                    }
                                    else
                                        redirectClaimCoreLogic(claimNumber,claimId,RoleList[0]);

                                    // window.setTimeout(()=>$location.path(RoleBasedService.GetHomePageForUser()),2000);
                                }
                            });
                        }
                    }
                    //Set Role of user
                    var flagIsvendor = false;
                    angular.forEach(RoleList, function (item) {
                        if (item === "VENDOR") {
                            flagIsvendor = true;
                        }
                    });
                    RoleBasedService.SetUserRoles(RoleList[0]);
                    //Get set Home page for each role  RoleBasedService.SetHomePageForUser($scope.RoleList); to save multiple row
                    // init core components
                    Layout.init();
                    App.initComponents();

                    // Starting idle timeout watch after login
                    if (sessionStorage.getItem("IsLogined") === "true"){
                        console.log("If user is logged in, Idle.watch() is started...");
                        Idle.watch();
                    }
               $(".page-spinner-bar").addClass("hide");
                }, function (error) {
               $(".page-spinner-bar").addClass("hide");
                    if (error !== null) {
                        if (error.data !== null) {
                            errormsg = error.data.errorMessage;
                        }
                        else {
                            errormsg = "Invalid userid or password..";
                        }
                    }
                    else {
                        errormsg = "Invalid userid or password..";

                    }
                    getCaptcha();
                   
                
                });
                $(".page-spinner-bar").addClass("hide");
            }

            if ((next.toLowerCase()).indexOf('register') !== -1 || (next.toLowerCase()).indexOf('forgotpassword') !== -1 || (next.toLowerCase()).indexOf('newvendorregistration') !== -1
                || (next.toLowerCase()).indexOf('vendorlogin') !== -1 || (next.toLowerCase()).indexOf('vendorregistration') !== -1 || (next.toLowerCase()).indexOf('submitnewclaimjewelry') !== -1
                || (next.toLowerCase()).indexOf('submitnewclaimcontents') !== -1
                || (next.toLowerCase()).indexOf('samlcallback') !== -1
                || (next.toLowerCase()).indexOf('samlsuccess') !== -1
                || (next.toLowerCase()).indexOf('samlfailure') !== -1) {
            }
            
            else {
                var checkPath = $location.path();
                if (sessionStorage.getItem("IsLogined") === "true") {
                    // Idle.watch();
                    var paramPath = $location.path();

                    $rootScope.IsLoginedUser = true;
                    document.body.style.backgroundColor = "white";
                    $(".wrapBoxShodow").css("box-shadow", "0px 1px 16px 1px #364150");
                    //var myElement = document.querySelector(".page-wrapper .page-wrapper-middle");
                    // myElement.style.backgroundColor = "#eff3f8";
                    var myEl = angular.element(document.querySelector('.page-on-load'));
                    myEl.addClass('div_MainBody');
                    var path = $location.path();
                    if (path && path.includes("requestEmail")) {
                        var s = path.split("requestEmail/")[1];
                        var s1 = s.split("/");

                        var ClaimObj = {
                            "IsClaimEvent": true,
                            "ClaimNumber": s1[1],
                            "ClaimId": s1[0]
                        }
                        sessionStorage.setItem("ClaimObj", JSON.stringify(ClaimObj));
                        $location.path("/AllRequests");
                    }

                    //Redirect to login page if path is undefined OR Login
                    if (angular.isUndefined(path) || path == "/" || path == "/login") {
                        $rootScope.IsLoginedUser = false;
                        $location.path("/login");
                    }

                    if (path == "/http://localhost:8080/claim") {
                        // $rootScope.IsLoginedUser = false;
                        //$location.path("http://localhost:8080/fist_app/index.html");
                        var token = sessionStorage.getItem("AccessToken");
                        sessionStorage.setItem('X-Auth-Token',token)
                        window.location.replace("../policyholder")
                    }
                    //If url is not redirecting to login check whether
                    else {
                        //var count = 0;
                        //path=path.replace("/","");
                        //var screenList = JSON.parse(sessionStorage.getItem("ScreenList"));
                        //angular.forEach(screenList, function (screen) {
                        //    if(screen.URL == path)
                        //    {
                        //        count++;
                        //    }
                        //});

                        //if(count==0)
                        //{
                        //    toastr.remove();
                        //    toastr.error("Invalid URL", "Error");
                        //    $location.path("/login");
                        //}
                    }
                    if (paramPath && (paramPath.includes("mailClaim"))) {
                        redirectClaim();
                    }
                    if (path && path.includes("mailItem")) {
                        redirectItem();
                    }
                    if (paramPath && paramPath.includes("mailInvoice")){
                        redirectInvoice();
                    }
                    if(path && path.includes("mailQuote")){
                        redirectViewQuote();
                    }
                    if (paramPath && paramPath.includes("/gemlab/sucess_callback")){
                        setTimeout(function () {
                            captureIdentifier()       
                        }, 1000);
                    }
                    if(paramPath && paramPath.includes("mailCustomComparable")){
                        redirectCustomComparable();
                    }


                }
                else if (window.localStorage.getItem("IsLogined") === "true" && !window.location.hash.includes("#/PolicyHolderReview?id") && !window.location.hash.includes("#/JewelryPolicyHolderReview?id")) {
                    // Idle.watch();
                    $rootScope.IsLoginedUser = true;
                    document.body.style.backgroundColor = "white";
                    sessionStorage.setItem("AccessToken", window.localStorage.getItem("AccessToken"));
                    sessionStorage.setItem("UserName", window.localStorage.getItem("UserName"));
                    sessionStorage.setItem("UserLastName", window.localStorage.getItem("UserLastName"));
                    sessionStorage.setItem("Name", window.localStorage.getItem("Name"));
                    sessionStorage.setItem("Office", window.localStorage.getItem("Office"));
                    sessionStorage.setItem("UserId", window.localStorage.getItem("UserId"));
                    sessionStorage.setItem("ScreenList", window.localStorage.getItem("ScreenList"));
                    sessionStorage.setItem("CRN", window.localStorage.getItem("CRN"));
                    if (window.localStorage.getItem("BranchCode") != null) {
                        sessionStorage.setItem("BranchCode", window.localStorage.getItem("BranchCode"));
                        sessionStorage.setItem("BranchId", window.localStorage.getItem("BranchId"));
                    } else {
                        sessionStorage.setItem("BranchCode", null);
                        sessionStorage.setItem("BranchId", null);
                    }
                    if (window.localStorage.getItem("InsuranceCompanyName") != null && angular.isDefined(window.localStorage.getItem("InsuranceCompanyName"))) {
                        sessionStorage.setItem("InsuranceCompanyName", window.localStorage.getItem("InsuranceCompanyName"));
                    }

                    RoleBasedService.SetUserRoles(window.localStorage.getItem("RoleList"));
                    //sessionStorage.setItem("Password", password);
                    sessionStorage.setItem("UserType", window.localStorage.getItem("UserType"));
                    sessionStorage.setItem("CompanyId", window.localStorage.getItem("CompanyId"));
                    sessionStorage.setItem("IsLogined", true);
                    if (window.localStorage.getItem("VendorId") !== null && window.localStorage.getItem("VendorId") !== undefined)
                        sessionStorage.setItem("VendorId", window.localStorage.getItem("VendorId"));
                    else
                        sessionStorage.setItem("VendorId", null);

                    sessionStorage.setItem("SpeedCheckApiurl", window.localStorage.getItem("SpeedCheckApiurl"));
                    sessionStorage.setItem("bestbuyUrl", window.localStorage.getItem("bestbuyUrl"));

                    sessionStorage.setItem("apiurl", window.localStorage.getItem("apiurl"));
                    sessionStorage.setItem("hideCaptcha", window.localStorage.getItem("hideCaptcha"));
                    sessionStorage.setItem("disableSerpWow", window.localStorage.getItem("disableSerpWow"));

                    sessionStorage.setItem("Xoriginator", window.localStorage.getItem("Xoriginator"));

                    sessionStorage.setItem("loginWithSSO", window.localStorage.getItem("loginWithSSO")); 
                    sessionStorage.setItem("loginWithSAML",window.localStorage.getItem("loginWithSAML"));                   
                    sessionStorage.setItem("isCoreLogic",window.localStorage.getItem("isCoreLogic"));                  

                    var paramPath = $location.path();
                    if (paramPath && paramPath.includes("mailAppraisal")) {
                        var s1 = [];
                        var s = paramPath.split("Appraisal/")[1];
                        if (s) {
                            s1 = s.split("/");
                            sessionStorage.setItem("appraisalId", s1[0]);
                            sessionStorage.setItem("AppraisalNo", s1[1]);
                            sessionStorage.setItem("policyId", s1[2]);
                            sessionStorage.setItem("policyNumber", s1[3]);
                            sessionStorage.setItem("primaryPolicyHolderFname", s1[4]);
                            sessionStorage.setItem("primaryPolicyHolderLname", s1[5]);
                        }
                    }
                    sessionStorage.setItem("refferer", "HOME");
                    sessionStorage.setItem("EditAppraisal", "true");
                    sessionStorage.setItem("notifications", true);

                    if (paramPath && paramPath.includes("mailClaim")) {
                        redirectClaim();
                    }
                    if (path && path.includes("mailItem")) {
                        redirectItem();
                    
                    }
                    if (paramPath && paramPath.includes("mailInvoice"))
                        redirectInvoice();
                    if(path && path.includes("mailQuote")){
                        redirectViewQuote();
                    }
                    if(paramPath && paramPath.includes("mailCustomComparable")){
                        redirectCustomComparable();
                    }
                    $(".wrapBoxShodow").css("box-shadow", "0px 1px 16px 1px #364150");
                    //var myElement = document.querySelector(".page-wrapper .page-wrapper-middle");
                    // myElement.style.backgroundColor = "#eff3f8";
                    var myEl = angular.element(document.querySelector('.page-on-load'));
                    myEl.addClass('div_MainBody');
                    // var path = paramPath.split("Appraisal/")[0]+"Appraisal/";

                    //Redirect to login page if path is undefined OR Login

                    if (paramPath && paramPath.includes("mailAppraisal")) {
                        if (sessionStorage.getItem("RoleList") == 'UNDERWRITER')
                            $location.path("/UnderwriterAppraisal");
                        else
                            $location.path("/Appraisal");

                    } else if (paramPath && paramPath.includes("requestEmail")) {
                        var s = paramPath.split("requestEmail/")[1];
                        var s1 = s.split("/");

                        var ClaimObj = {
                            "IsClaimEvent": true,
                            "ClaimNumber": s1[1],
                            "ClaimId": s1[0]
                        }
                        sessionStorage.setItem("ClaimObj", JSON.stringify(ClaimObj));
                        $location.path("/AllRequests");
                    }
                    else if (paramPath && paramPath.includes("mailClaim")) {
                        //Redirection to Adjuster /  claim supervisor
                        if (sessionStorage.getItem("RoleList") === 'ADJUSTER' || sessionStorage.getItem("RoleList") === 'CLAIM SUPERVISOR') {
                            if (commonClaimObj && commonClaimObj.tab === 'notes') {
                                $location.url(sessionStorage.getItem("RoleList") === 'ADJUSTER' ? "/AdjusterLineItemDetails" : "/SupervisorLineItemDetails");
                            } else
                                $location.url(commonClaimObj && commonClaimObj.redirect === 'all_notes' ? "/AllNotes" : (sessionStorage.getItem("RoleList") === 'ADJUSTER' ? "/AdjusterPropertyClaimDetails" : "/SupervisorClaimDetails"));
                        }
                        else
                            $location.url('AdjusterLineItemDetails');
                    }
                    else if(paramPath && paramPath.includes("mailInvoice")){
                        if (sessionStorage.getItem("RoleList") === 'ADJUSTER' || sessionStorage.getItem("RoleList") === 'INSURANCE COMPANY ADMINISTRATOR'){
                            redirectInvoice();
                        }
                    }
                    else if (sessionStorage.getItem("RoleList") === "POLICYHOLDER") {
                        $location.path('http://localhost:8080/claim');
                    }
                    else if(paramPath && paramPath.includes("mailItem"))
                    {
                        if (sessionStorage.getItem("RoleList") === 'ADJUSTER' || sessionStorage.getItem("RoleList") === 'CLAIM SUPERVISOR') {
                            redirectItem();
                        }
                    }
                    else if(path && path.includes("mailQuote")){
                        redirectViewQuote();
                    }
                    else if(paramPath && paramPath.includes("mailCustomComparable")){
                        redirectCustomComparable();
                    }
                    else
                        $location.path(window.localStorage.getItem("HomeScreen"));
                }
                else {
                    //document.body.style.backgroundColor = "#364150";
                    $(".wrapBoxShodow").css("box-shadow", "0px 1px 16px 1px #364150");
                    $rootScope.IsLoginedUser = false;
                    $rootScope.IsLoginedUserPolicyHolder = false;
                    if (window.location.href.indexOf("JewelryPolicyHolderReview") > -1){
                        var jewelryMerId = window.location.href.split('=');
                        sessionStorage.setItem("smsUrlForJewelryPH", window.location.href);
                        sessionStorage.setItem("smsIdForJewelryPH", jewelryMerId[1]);
                        var jewelryMerClaimItemId = jewelryMerId[1].split('*');
                        
                        sessionStorage.setItem("claimNumberForJewelryPH", jewelryMerClaimItemId[0]);
                        sessionStorage.setItem("claimIdForJewelryPH", jewelryMerClaimItemId[1]);
                        sessionStorage.setItem("itemIdForJewelryPH", jewelryMerClaimItemId[2]);
                    } else {
                        var appraisalId = window.location.href.split('=');
                        sessionStorage.setItem("smsUrlForPH", window.location.href);
                        sessionStorage.setItem("smsAppraisalIdForPH", appraisalId[1]);
                    }
                    
                    if ($rootScope.IsLoginedUser === false) {
                        if (window.location.href.indexOf("JewelryPolicyHolderReview") > -1 && window.location.hash === ("#/JewelryPolicyHolderReview?id=" + jewelryMerId[1])) {
                            $location.path("/JewelryPolicyHolderReview");
                        } else if (window.location.hash === ("#/PolicyHolderReview?id=" + appraisalId[1])) {
                            $rootScope.IsLoginedUserPolicyHolder = true;
                            $location.path("/PolicyHolderReview");
                        }
                        else {
                            var path = $location.path();
                            if (path && path.includes("mailAppraisal")) {
                                var s1 = [];
                                var s = path.split("Appraisal/")[1];
                                if (s) {
                                    s1 = s.split("/");
                                    sessionStorage.setItem("appraisalId", s1[0]);
                                    sessionStorage.setItem("AppraisalNo", s1[1]);
                                    sessionStorage.setItem("policyId", s1[2]);
                                    sessionStorage.setItem("policyNumber", s1[3]);
                                    sessionStorage.setItem("primaryPolicyHolderFname", s1[4]);
                                    sessionStorage.setItem("primaryPolicyHolderLname", s1[5]);
                                    sessionStorage.setItem("redirectTo", "Appraisal");
                                    sessionStorage.setItem("refferer", "HOME");
                                    sessionStorage.setItem("EditAppraisal", "true");
                                    sessionStorage.setItem("notifications", true);
                                    sessionStorage.setItem("SpeedCheckApiurl", window.localStorage.getItem("SpeedCheckApiurl"));
                                    sessionStorage.setItem("apiurl", window.localStorage.getItem("apiurl"));
                                }
                            }
                            if (path && path.includes("requestEmail")) {
                                var s = path.split("requestEmail/")[1];
                                var s1 = s.split("/");
                                var ClaimObj = {
                                    "IsClaimEvent": true,
                                    "ClaimNumber": s1[1],
                                    "ClaimId": s1[0]
                                }
                                sessionStorage.setItem("ClaimObj", JSON.stringify(ClaimObj));
                            }
                            if (path && path.includes("mailClaim")) {
                                redirectClaim();
                                sessionStorage.setItem("redirectionParams", JSON.stringify(commonClaimObj));
                                sessionStorage.setItem("redirectTo", "Claim");
                            }
                            else  if (path && path.includes("mailItem")) {
                                redirectItem();
                                sessionStorage.setItem("redirectionParams", JSON.stringify(commonItemObj));
                                sessionStorage.setItem("redirectTo", "ItemDetails");
                            }
                            else  if (path && path.includes("mailInvoice")) {
                                redirectInvoice();
                            }
                            else if(path && path.includes("mailQuote")){
                                redirectViewQuote();
                            }
                            else if(paramPath && paramPath.includes("mailCustomComparable")){
                                redirectCustomComparable();
                            }
                            
                            $location.path("/login");
                        }
                    } else {
                        $location.path("/login");
                    }
                }
            }
        });

        $rootScope.online = navigator.onLine;
        $window.addEventListener("online", function () {
            $rootScope.$apply(function () {
                $rootScope.online = true;
                toastr.remove();
                toastr.success("Now Connected");
            });
        }, false);

        $window.addEventListener("offline", function () {
            $rootScope.$apply(function () {
                $rootScope.online = false;
                toastr.remove();
                toastr.warning("Could not connect to server. Please check your network connection", "Warning");
            });
        }, false);

        $window.addEventListener("storage", function () {
            $rootScope.$apply(function (event) {
                if (!window.localStorage.getItem("IsLogined") || window.localStorage.length < 2) {

                    $location.path("/login");
                }

            });
        }, false);
    }]
    );
