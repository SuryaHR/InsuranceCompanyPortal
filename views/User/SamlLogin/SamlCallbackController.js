angular.module('MetronicApp')
    .controller('SamlCallbackController', function ($http, $scope, $window, $translate, $translatePartialLoader,$location, UserService, RoleBasedService, Idle, SamlCallbackService) {

        $scope.ShowHeader = true;
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });
        //set language
        //$translatePartialLoader.addPart('InsuranceAgentHome');
        $translate.refresh();  

        //$scope.UserType = sessionStorage.getItem('RoleList');        
        //sessionStorage.setItem('GetPolicyAlerts', 'true');
        //var userId = sessionStorage.getItem("UserId");
        $scope.token = "";

        
        function init() {
            $(".page-spinner-bar").removeClass("hide");
            /*
            http://localhost:3001/#/SamlCallback?token=eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZGp1c3RlckBzYWtoYWdsb2JhbC5jb20iLCJhdWRpZW5jZSI6IndlYiIsImNyZWF0ZWQiOjE2OTU5NzMyNjk4MjgsImV4cCI6MTY5NjU3ODA2OX0.kg5L1BxVqymcL0JcQ4TFkKsCOhEAPjfdeMY42Iue2hN6Ox85vHlUzBC7zV4-WjVELJK2QSb9NvyOMDbUmmY2Ow
            */

            // Get all the params from QueryParam
            var params = $location.search();
            $scope.token = params.token;
            console.log("token",$scope.token);

            // Remove query params from URL
            if($location.absUrl().includes("token")){
                sessionStorage.setItem("AccessToken", $scope.token);

                var Baseurl = $location.absUrl().split("?")[0];
                console.log(Baseurl);
                window.location.replace(Baseurl);

                // Get the company details based on token
                getLoginDetails();

            }
        }
        init();

        // Get the internal login response details
        function getLoginDetails() {  
            var loginDetails = SamlCallbackService.getLoginDetails();
            loginDetails.then(function (success) {                
                  var respData = success.data;
                  respData.data.token=$scope.token;
                  // Auto Login internally based on SAML Response Data
                  autoLogin(respData);

            });
        }

        // Internal login based on login response data
        function autoLogin(respData) {            
            var LoginResponse = respData.data;//Later used while checking user is first time logginn in or not
            
            $scope.errormsg = '';            
            //Added for new page
            var myE2 = angular.element(document.querySelector('.page-wrapper'));
            myE2.addClass('wrapBoxShodow');
            //end
            var myEl = angular.element(document.querySelector('.page-on-load'));
            myEl.addClass('div_MainBody');
            var result = UserService.initUserDetails(respData, $scope.password, $scope.RememberMe);
            //$http.defaults.headers.common['X-Auth-Token'] = success.data.data.token;
            $scope.RolePermission = respData.data.role;
            sessionStorage.setItem("IsVendorLogIn", undefined);
            sessionStorage.setItem("loginCount", LoginResponse.loginCount);
            //Make single list of screen and its permission stored in session uisng RolebasedService
            $scope.ScreenList = [];
            $scope.RoleList = [];
            var accessComparable = false;
            for (var i = 0; i < $scope.RolePermission.length; i++) {
                //Simply get the screen access list screen code and stored it in list and chek wheather the code is present in list or not
                if ((angular.isDefined($scope.RolePermission[i].roleName)) && ($scope.RolePermission[i].roleName !== null)) {
                    //Get Role List
                    $scope.RoleList.push($scope.RolePermission[i].roleName);
                }

                angular.forEach($scope.RolePermission[i].permissions, function (item) {
                    if (item.name && item.name == 'COMPARABLE SEARCH')
                        accessComparable = item.canSearch ? item.canSearch : false;
                });
                sessionStorage.setItem("accessComparable", accessComparable)
                //Get screen list form Role BasedMenu service
                if ($scope.ScreenList !== null && angular.isDefined($scope.ScreenList) && $scope.ScreenList.length > 0) {
                    $scope.ScreenList = $scope.ScreenList.concat(RoleBasedService.GetUserScreenList($scope.RolePermission[i].roleName));
                }
                else {
                    var Rolelist = $scope.RolePermission[i].roleName;
                    var AllRoleslist = [];
                    var list = [];

                    $scope.ScreenList = RoleBasedService.GetUserScreenList();
                    $scope.ScreenList.then(function (success) {
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
                                $location.path(RoleBasedService.GetHomePageForUser());
                        }
                    });
                }
            }
            //Set Role of user
            var flagIsvendor = false;
            angular.forEach($scope.RoleList, function (item) {
                if (item === "VENDOR") {
                    flagIsvendor = true;
                }
            });
            RoleBasedService.SetUserRoles($scope.RoleList[0]);
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
        }

        
    });
