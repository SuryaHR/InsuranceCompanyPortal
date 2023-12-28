angular.module('MetronicApp').controller('LoginController', function ($rootScope,$window, UserService, LoginService, $scope, $http, $location, $cookies, $timeout, $state, $translate,
    $translatePartialLoader, RoleBasedService, AuthHeaderService, $filter, Idle) {

    $scope.hideCaptcha = (sessionStorage.getItem("hideCaptcha") != null && sessionStorage.getItem("hideCaptcha") != 'null') ? sessionStorage.getItem("hideCaptcha") == 'true' : true;
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    //set language
    $translatePartialLoader.addPart('Login');
    $translate.refresh();
    $scope.errormsg = "";
    $scope.username = "";
    $scope.password = "";
    $scope.errormsg = "";
    $scope.RememberMe = false;
    $scope.registerUser = {};
    $scope.companyInfo = {
        "name": sessionStorage.getItem("insuranceCarrier")
    }
    //as per the task speed-883
    $scope.showNewUserForm = false;
    //initialise AES-256
    var iv = '';
    var salt = '';
    var passPhrase = '';
    $scope.backgroundImages=[];
    $scope.loginWithSSO = sessionStorage.getItem("loginWithSSO");

    $scope.loginWithSAML = sessionStorage.getItem("loginWithSAML");

    $scope.showPassword = false;


    $scope.isIdleTimeout= sessionStorage.getItem("IdleTimeout") =="true" ? "true" : "false";
    $scope.idleTimeoutMsg= "You have been signed out due to inactivity for 8 hours. Please login again.";
    getReturnUrl();
    // Removeing existing data and resetting session 
    $scope.removeSessionData = removeSessionData;
    function removeSessionData() {
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
            
    }

    ////Implement auto login if remember me clicked
    // AutoLogIn();
    // GetCompanyBackgroundImages();

    $scope.AutoLogIn = AutoLogIn;
    function AutoLogIn() {
        var flag = $cookies.get("UserName");

        var currentPath = window.location.href;    
        if((!angular.isDefined(flag)) && currentPath && currentPath.includes("login")){            
            // Checking logout is idle
            if($scope.isIdleTimeout=="true"){
                sessionStorage.setItem("IdleTimeout","false");
            }
            
            removeSessionData(); 
            console.log("LoginController init() - Cleared Existing Session Data and session reset to default");
        }

        if (angular.isDefined(flag)) {
            $scope.username = $cookies.get("UserName");
            $scope.password = $cookies.get("Password");
            LogIn();
        }
        $scope.todaysDate = new Date();
        $timeout(function () {
            $scope.hideCaptcha = (sessionStorage.getItem("hideCaptcha") != null && sessionStorage.getItem("hideCaptcha") != 'null') ? sessionStorage.getItem("hideCaptcha") == 'true' : true;
            getReturnUrl();
        }, 300);
    }

    $scope.LogIn = LogIn;
    function LogIn(ev) {
        $(".page-spinner-bar").removeClass("hide");
        $scope.errormsg = '';
        var data;
        if (($scope.username !== null && angular.isDefined($scope.username) || $scope.username !== "") || ($scope.password !== null && angular.isDefined($scope.password) && $scope.password !== "")) {
            delete $http.defaults.headers.common['X-Auth-Token'];
            $scope.token = "";
            var encryptedPassword = getCipherEncryptedText($scope.password);
            var encryptedUsername = getCipherEncryptedText($scope.username);
        if(angular.isDefined($scope.password)&& $scope.password.length>0){
         data = {
            "username": btoa(encryptedUsername),
            "password": btoa(encryptedPassword),
            "captchCode": $scope.captchCode,
            "isHideCaptcha": $scope.hideCaptcha
        };
    }else{
        data = {
            "ssoAccessToken": sessionStorage.getItem("OktaAuthorizationCode"),
            "username": btoa(encryptedUsername),
            "isHideCaptcha": "true",
            "captchCode": "true"
        }
}

            // generateJSONData();
            getVendorDetails();
            //Code to bypass the login
            if ($scope.RememberMe) {
                //Get hard code data
                var success = { data: UserService.DummyData($scope.username) };

                $scope.errormsg = '';
                //Added for new page
                var myE2 = angular.element(document.querySelector('.page-wrapper'));
                //  myE2.addClass('wrapBoxShodow');
                //end
                var myEl = angular.element(document.querySelector('.page-on-load'));
                myEl.addClass('div_MainBody');
                var result = UserService.initUserDetails(success.data, $scope.password, $scope.RememberMe);
                $http.defaults.headers.common['X-Auth-Token'] = success.data.data.token;
                $scope.RolePermission = success.data.data.role;
                sessionStorage.setItem("IsVendorLogIn", undefined);
                $scope.ScreenList = [];
                $scope.RoleList = [];

                for (var i = 0; i < $scope.RolePermission.length; i++) {

                    if ((angular.isDefined($scope.RolePermission[i].roleName)) && ($scope.RolePermission[i].roleName !== null)) {
                        $scope.RoleList.push($scope.RolePermission[i].roleName);
                    }

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
                            sessionStorage.setItem("ScreenList", JSON.stringify(list));
                            if (LoginResponse.resetPassword) {
                                $location.url("/Security");
                            }
                            else {
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

                //if (flagIsvendor === true)
                //    RoleBasedService.SetHomePageForUser("VENDOR");
                //else
                //    RoleBasedService.SetHomePageForUser($scope.RoleList[0]);

                //set screen list of logged in user
                //RoleBasedService.SetUserScreenList($scope.ScreenList);

                $location.path(RoleBasedService.GetHomePageForUser());
                // init core components
                Layout.init();
                App.initComponents();

                // Starting idle timeout watch after login
                if (sessionStorage.getItem("IsLogined") === "true"){
                    console.log("If user is logged in, Idle.watch() is started...");
                    Idle.watch();
                }
            }
            //End code to bypass the login
            else {
                var response = LoginService.LogIn(data);
                response.then(function (success) {
                    var LoginResponse = success.data.data;//Later used while checking user is first time logginn in or not
                    $scope.errormsg = '';
                    //Added for new page
                    var myE2 = angular.element(document.querySelector('.page-wrapper'));
                    myE2.addClass('wrapBoxShodow');
                    //end
                    var myEl = angular.element(document.querySelector('.page-on-load'));
                    myEl.addClass('div_MainBody');
                    var result = UserService.initUserDetails(success.data, $scope.password, $scope.RememberMe);
                    //$http.defaults.headers.common['X-Auth-Token'] = success.data.data.token;
                    $scope.RolePermission = success.data.data.role;
                    sessionStorage.setItem("IsVendorLogIn", undefined);
                    sessionStorage.setItem("loginCount", LoginResponse.loginCount);
                    //Make single list of screen and its permission stored in session uisng RolebasedService
                    $scope.ScreenList = [];
                    $scope.RoleList = [];
                    var accessComparable = false;
                    var accessReport = false;
                    for (var i = 0; i < $scope.RolePermission.length; i++) {
                        //Simply get the screen access list screen code and stored it in list and chek wheather the code is present in list or not
                        if ((angular.isDefined($scope.RolePermission[i].roleName)) && ($scope.RolePermission[i].roleName !== null)) {
                            //Get Role List
                            $scope.RoleList.push($scope.RolePermission[i].roleName);
                        }


                        angular.forEach($scope.RolePermission[i].permissions, function (item) {
                            if (item.name && item.name == 'COMPARABLE SEARCH')
                                accessComparable = item.canSearch ? item.canSearch : false;
                            if(item.name && item.name == 'REPORTS')
                                accessReport = item.canCreate ? item.canCreate : false;
                        });
                        sessionStorage.setItem("accessComparable", accessComparable)
                        sessionStorage.setItem("accessReport",accessReport)
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
                }, function (error) {
               $(".page-spinner-bar").addClass("hide");
                    if (error !== null) {
                        if (error.data !== null) {
                            $scope.errormsg = error.data.errorMessage;
                        }
                        else {
                            $scope.errormsg = "Invalid userid or password..";
                        }
                    }
                    else {
                        $scope.errormsg = "Invalid userid or password..";

                    }
                    getCaptcha();
                    window.setTimeout(()=>{
                    if($location.absUrl().includes("code")){
                        var Baseurl = $location.absUrl().split("?")[0];
                        var finalUrl = Baseurl.slice(0,-1)+"#"+$location.path();
                        window.location.replace(finalUrl)
                        }
                    },3000);
                });
               $(".page-spinner-bar").addClass("hide");

            }
        }
    }

    $scope.getCipherEncryptedText = getCipherEncryptedText;
    function getCipherEncryptedText(text) {
        var aesUtil = new AesUtil(128, 1000);
        iv = CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex);
        salt = CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex);
        passPhrase = CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex);
        if (text != null || text != '')
            return (iv + "::" + aesUtil.encrypt(salt, iv, passPhrase, text) + "::" + salt + "::" + passPhrase);
    }

    $scope.RegisterUserForm = RegisterUserForm;
    function RegisterUserForm(event) {
        $location.path('/register');
    }
    $scope.ForgotPasswordForm = ForgotPasswordForm;
    function ForgotPasswordForm(event) {
        sessionStorage.setItem("IsVendorLogIn", undefined);
        $location.path('/forgotpassword');
    }

    // Links to submit new claim form without login
    // $scope.OpenSubmitClaimJewelry = OpenSubmitClaimJewelry;
    // function OpenSubmitClaimJewelry(event) {
    //     sessionStorage.setItem("IsVendorLogIn", undefined);
    //     $location.path('/submitnewclaimjewelry');
    // }

    // $scope.OpenSubmitClaimContents = OpenSubmitClaimContents;
    // function OpenSubmitClaimContents(event) {
    //     sessionStorage.setItem("IsVendorLogIn", undefined);
    //     $location.path('/submitnewclaimcontents');
    // }
    //Added for ne wpage
    $scope.EmptyError = function () {
        $scope.errormsg = '';
    }//end
    //To get Artigem Version Number

    $scope.GetVersionNumber = GetVersionNumber;
    function GetVersionNumber() {
        var Getversion = GetVersionNumberData();//LoginService.GetVersionNumber();
        Getversion.then(function (success) {
            $scope.versionData = success.data.data;
        },
            function (error) {
                toastr.remove();
                toastr.error(error.data ? error.data.errorMessage : "", "Error");
            })
    }
    function getReturnUrl() {
        // Checking logout is idle
        if($scope.isIdleTimeout=="true" || $scope.isIdleTimeout==true){
            sessionStorage.setItem("IdleTimeout","false");
        }

        var GetReturnUrl = AuthHeaderService.ReturnURL();
        GetReturnUrl.then(function (success) {
            $scope.URLData = success.data.data;
            $scope.GetVersionNumber();
            getCaptcha();
            getCompanyDetails();
            GetCompanyBackgroundImages();
            checkAccessDeniedWarning();
        },
        function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
        })
    }

    function GetVersionNumberData() {
        var response = $http({
            method: "Get",
            url: $scope.URLData.serverAddress + "" + $scope.URLData.apiurl + "application/buildinfo",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-originator": $scope.URLData.Xoriginator
            }
        });
        return response;
    }

    $scope.Register = Register;
    function Register() {
        delete $http.defaults.headers.common['X-Auth-Token'];
        var param = {
            "firstName": $scope.registerUser.firstName,
            "lastName": $scope.registerUser.lastName,
            "email": $scope.registerUser.email,
            "cellPhone": $scope.registerUser.phone,
            "branchDetails": {
                "branchName": $scope.registerUser.Branch
            },
            "designation": {
                "name": $scope.registerUser.Designation
            },
            "reportingManagerFirstName": $scope.registerUser.reportingManagerFirstName,
            "reportingManagerLastName": $scope.registerUser.reportingManagerLastName
        }
        var promis = LoginService.registerUser(param);
        promis.then(function (success) {
            $scope.NewUserDetails = success.data.data;
            toastr.remove();
            toastr.success(success.data.data, "Confirmation");
            //$scope.registerUser = {};
        }, function (error) {
            toastr.remove();
            if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                toastr.error(error.data.errorMessage, "Error")
            }
            else {
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
            }
        });
    }

    $scope.getCaptcha = getCaptcha;
    function getCaptcha() {
        var getCaptchaDetails = LoginService.getCaptchaDetails();
        getCaptchaDetails.then(function (success) {
            $scope.captchCode = "";
            $scope.captcha = success.data.data;
            //console.log($scope.captcha.captchaCode);
            //$scope.GetVersionNumber();
        },
            function (error) {
                toastr.remove();
                toastr.error(error.data ? error.data.errorMessage : "", "Error");
            })
    }

    function getCompanyDetails() {
        var company = LoginService.getCompanyDetails();
        company.then(function (success) {
            var res = success.data.data;
            if (res && res.url === sessionStorage.getItem("Xoriginator")) {
                $scope.companyInfo = res;
                sessionStorage.setItem("companyLogo", res.logo);
                sessionStorage.setItem("CompanyId",1);
            }
        },
            function (error) {
                toastr.remove();
                toastr.error(error.data ? error.data.errorMessage : "", "Error");
            })
    }

    function GetCompanyBackgroundImages()
    {
        var CompanyId = {
            "id": sessionStorage.getItem("CompanyId")
        };
        var getCompanyDetails = LoginService.GetCompanyBackgroundImages(CompanyId);
        getCompanyDetails.then(function (success) {
            var backgroundImages = success.data.data;
            if(backgroundImages!=null){
                backgroundImages.attachments.map((image)=>{
                    var backgroundImage =
                    {
                        "FileName": null,
                        "FileExtension": null,
                        "FileType": null,
                        "Image": image.url === null ? "assets/global/img/no-image.png" : image.url,
                        "File": null,
                        "Description" : image.description
                    };
                    $scope.backgroundImages.push(backgroundImage);
                 });
            }
            
         if($scope.backgroundImages && $scope.backgroundImages!=null && $scope.backgroundImages.length>0)
         {
             var time = new Date().getMinutes()%10;
             var index;
             if($scope.backgroundImages.length ===1)
                index=0;
             else if($scope.backgroundImages.length ===2)
                index= time%3==0 ? 1 : 0
             else{
                 if("157".includes(time.toString()))
                 {
                     index = 0
                 }
                 else if("2480".includes(time.toString()))
                 {
                     index = 1
                 }
                 else
                 {
                     index = 2
                 }
             }
            $scope.backgroundImage = $scope.backgroundImages[index];
            document.getElementById('maindiv').style.backgroundImage = "url('"+$scope.backgroundImage.Image.toString()+"')";
         }
      });
    }


    $scope.getVendorDetails = getVendorDetails;
    function getVendorDetails(){
            var data ={
                "registrationNumber": sessionStorage.getItem("jewelryVendor")
            };
            var vendorDetails = LoginService.getVendorDetails(data);
            vendorDetails.then(function (success) {
                $scope.vendorDetails = success.data.data;
                sessionStorage.setItem("vendorLogo",$scope.vendorDetails.logo.url);
                sessionStorage.setItem("vendorAddress",$scope.vendorDetails.address.completeAddress);
                localStorage.setItem("vendorLogo",$scope.vendorDetails.logo.url);
                localStorage.setItem("vendorAddress",$scope.vendorDetails.address.completeAddress);
            }, function (error) {
                toastr.remove();
                if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                    toastr.error(error.data.errorMessage, "Error")
                }
                else {
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
                }
            });
    }

    // Enter key login action
    document.onkeydown = function (evt) {
        var page = window.location.href;
        if (page.includes("login")) {
            var keyCode = evt ? (evt.which ? evt.which : evt.keyCode) : event.keyCode;
            if (keyCode == 13) {
                $scope.LogIn(evt);
            }
        }
    }

    // Okta Signin work
   $scope.oktaConfigData = {
    issuer: localStorage.getItem("OktaBaseURL"),
    clientId: localStorage.getItem("OktaClientId"),
    redirectUri: localStorage.getItem("OktaRedirectionURL"),
    end_session_redirect_uri:localStorage.getItem("OktaEndSessionRedirectionURL"),
    responseType: "code",
    devMode: localStorage.getItem("SSODevMode"),
    pkce:true
  }
//   if(sessionStorage.getItem("loginWithSSO")=="true")
//     var authClient = new OktaAuth($scope.oktaConfigData);
  //    authClient.start();
    //  $scope.oktaSignin = oktaSignin;
    // async function oktaSignin() {
    //       localStorage.setItem('loginviasso',1);
    //      if (authClient.isLoginRedirect()) {
    //          try {
    //            await authClient.handleLoginRedirect();
    //          } catch (e) {
    //            // log or display error details
    //            console.log('Exception - '+e);
    //          }
    //        } else if (!await authClient.isAuthenticated()) {
    //          // Start the browser based oidc flow, then parse tokens from the redirect callback url
    //          console.log('signInWithRedirect - ');
    //          authClient.signInWithRedirect();
    //           // User is authenticated
    //           console.log('authenticated - ');
             
    //        } else {
    //          // User is authenticated
    //          console.log('authenticated - ');
    //          Promise.all([
    //            authClient.tokenManager.get('idToken')
    //          ])
    //          .then(([idTokenObject]) => {
    //              console.log("idTokenObject",idTokenObject);
    //            localStorage.setItem("username", idTokenObject['claims']['name']);
    //            $scope.username = localStorage.getItem("username");
    //            console.log($scope.username);
    //          //   return authClient.token.getUserInfo(accessTokenObject, idTokenObject);
    //          });
    //        }

    //  }
   
    //   if(localStorage.getItem("loginviasso")==1){
        // if(sessionStorage.getItem("loginWithSSO")=="true")
        //      handleAuthentication();
    //   }
    if(sessionStorage.getItem("loginWithSSO")=="true" && sessionStorage.getItem("OktaAuthorizationCode"))
         LogIn();

    //  var idTokenHint ='';
    //  var oktaAccessToken='';
    //  var oktaUserData='';
    //  var oktaLoginAPiData={};
    //  $scope.handleAuthentication = handleAuthentication;
    //   function handleAuthentication(){
    //       $scope.oktaUserData = authClient.token.parseFromUrl();
    //       $scope.oktaUserData.then(userData=>{
    //           idTokenHint = userData.tokens.idToken;
    //           oktaAccessToken = userData.tokens.accessToken;
    //           oktaUserData =  userData.tokens.idToken.claims;
    //           // localStorage.setItem("oktaAccessToken", JSON.stringify(oktaAccessToken));
    //           localStorage.setItem("oktaIdToken", JSON.stringify(idTokenHint));
    //           localStorage.setItem("oktaAccessToken", JSON.stringify(oktaAccessToken));
    //           localStorage.setItem("oktaUserName", JSON.stringify(oktaUserData?.sub));
    //           sessionStorage.setItem('oktaUserDetails', JSON.stringify(oktaUserData));
    //           var userDetails = JSON.parse(localStorage.getItem("oktaAccessToken"));
    //           console.log("userDetails",userDetails?.claims?.sub);
    //           $scope.username = userDetails?.claims?.sub;
    //           LogIn(); 
    //       });
        
    //  }

    $scope.AuthorizeSSO = AuthorizeSSO
    function AuthorizeSSO(){
        var Uri;
        if($scope.loginWithSAML=="true")
        {
            var response = LoginService.getSAMLRedirectionURL();
            response.then(function (success) {
               Uri = success.data.data;
               window.location.replace(Uri);

            }, function (error) {
                toastr.remove();
                if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                    toastr.error(error.data.errorMessage, "Error")
                }
                else {
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
                }
            });

        }
        else{
       var baseUri = localStorage.getItem("OktaBaseURL");
       var clientId = localStorage.getItem("OktaClientId");
       var clientSecret = localStorage.getItem("OktaClientSecret");
       var redirectUri= localStorage.getItem("OktaRedirectionURL");

       Uri = baseUri+"oauth2/v1/authorize?client_id="+clientId+
       "&response_type=code&response_mode=fragment&scope=openid&redirect_uri="+redirectUri+"&state=ArtigemStreamline&nonce=ed24ec3f-f724-4ce2-a9c2-8af860e7d3f6";
       window.location.replace(Uri);
        }
    } 


    // Check for Access Denied warning for 401 / 403
    function checkAccessDeniedWarning(){
        // Check Access Denied errors
        if(sessionStorage.getItem("AccessDenied")==="true"){
            sessionStorage.setItem("AccessDenied","false");
            window.setTimeout(function () {
                toastr.remove();
                toastr.warning("You have been signed out due to inactivity for 8 hours. Please login again.", "Alert");
            }, 500);            
        }
    }   

});
