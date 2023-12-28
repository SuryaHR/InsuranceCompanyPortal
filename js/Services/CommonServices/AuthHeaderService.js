angular.module('MetronicApp').service('AuthHeaderService', ['$http', '$rootScope', function ($http, $rootScope) {

    //To set all configuration settings
    var ConfigSettings = {};
    function GetGolbalData() {
        var GetGlobaldata = $http.get('Config/Configuration.json');
        GetGlobaldata.then(function (success) {
            ConfigSettings = success.data.data;
            sessionStorage.setItem("insuranceCarrier", ConfigSettings.insuranceCarrier);
            sessionStorage.setItem("apiurl", ConfigSettings.serverAddress + "" + ConfigSettings.apiurl);

            sessionStorage.setItem("AdminApiurl", ConfigSettings.serverAddress + "" + ConfigSettings.AdminApiurl);
            sessionStorage.setItem("receipturl", ConfigSettings.serverAddress + "" + ConfigSettings.receipturl);
            sessionStorage.setItem("ExportUrl", ConfigSettings.serverAddress + "" + ConfigSettings.ExportUrl);
            sessionStorage.setItem("ClaimTemplate", ConfigSettings.serverAddress + "" + ConfigSettings.ClaimTemplate);
            sessionStorage.setItem("ItemTemplate", ConfigSettings.serverAddress + "" + ConfigSettings.ItemTemplate);
            sessionStorage.setItem("VendorDetailsTemplate", ConfigSettings.serverAddress + "" + ConfigSettings.VendorDetailsTemplate);
            sessionStorage.setItem("UserDetailsTemplate", ConfigSettings.serverAddress + "" + ConfigSettings.UserDetailsTemplate);
            sessionStorage.setItem("zipcodeAndPremiumTemplate", ConfigSettings.serverAddress + "" + ConfigSettings.zipcodesAndPremiumTemplate);
            sessionStorage.setItem("Xoriginator", ConfigSettings.Xoriginator);
            sessionStorage.setItem("claimProfile", ConfigSettings.claimProfile);
            sessionStorage.setItem("serviceRequests", ConfigSettings.serviceRequests);
            sessionStorage.setItem("jewelryVendor", ConfigSettings.jewelryVendor);
            sessionStorage.setItem("speedCheckVendor", ConfigSettings.speedCheckVendor);
            sessionStorage.setItem("SpeedCheckApiurl", ConfigSettings.SpeedCheckApiurl);
            sessionStorage.setItem("bestbuyUrl", ConfigSettings.bestbuyUrl);            
            sessionStorage.setItem("hideCaptcha",ConfigSettings.hideCaptcha)
            sessionStorage.setItem("disableSerpWow",ConfigSettings.disableSerpWow);
            sessionStorage.setItem("gemGuideApi",ConfigSettings.gemGuideApi);
            sessionStorage.setItem("ThirdPartyAdjusting",ConfigSettings.ThirdPartyAdjusting);
            sessionStorage.setItem("googleShoppingDropdown", ConfigSettings.googleShoppingDropdown);

            sessionStorage.setItem("loginWithSSO", ConfigSettings.loginWithSSO);
            sessionStorage.setItem("loginWithSAML",ConfigSettings.loginWithSAML);
            sessionStorage.setItem("isCoreLogic",ConfigSettings.isCoreLogic);
            
            window.localStorage.setItem("Xoriginator", ConfigSettings.Xoriginator);
            window.localStorage.setItem("SpeedCheckApiurl", ConfigSettings.SpeedCheckApiurl);
            window.localStorage.setItem("apiurl", ConfigSettings.serverAddress + "" + ConfigSettings.apiurl);
            window.localStorage.setItem("bestbuyUrl", ConfigSettings.bestbuyUrl);
            window.localStorage.setItem("hideCaptcha",ConfigSettings.hideCaptcha);
            window.localStorage.setItem("disableSerpWow",ConfigSettings.disableSerpWow);
            window.localStorage.setItem("ThirdPartyAdjusting",ConfigSettings.ThirdPartyAdjusting);
            window.localStorage.setItem("OktaClientId",ConfigSettings.OktaClientId);
            window.localStorage.setItem("OktaRedirectionURL",ConfigSettings.OktaRedirectionURL);
            window.localStorage.setItem("loginWithSSO",ConfigSettings.loginWithSSO);
            window.localStorage.setItem("loginWithSAML",ConfigSettings.loginWithSAML);
            window.localStorage.setItem("isCoreLogic",ConfigSettings.isCoreLogic);
            window.localStorage.setItem("OktaBaseURL",ConfigSettings.OktaBaseURL);
            window.localStorage.setItem("OktaEndSessionRedirectionURL",ConfigSettings.OktaEndSessionRedirectionURL);
            





        }, function (error) { ConfigSettings = {}; });
    };
    GetGolbalData();
    this.ReturnURL = function () {
        var Data = $http.get('Config/Configuration.json');
        Data.then(function (success) {
            ConfigSettings = success.data.data;
            sessionStorage.setItem("insuranceCarrier", ConfigSettings.insuranceCarrier);
            sessionStorage.setItem("apiurl", ConfigSettings.serverAddress + "" + ConfigSettings.apiurl);

            sessionStorage.setItem("AdminApiurl", ConfigSettings.serverAddress + "" + ConfigSettings.AdminApiurl);
            sessionStorage.setItem("receipturl", ConfigSettings.serverAddress + "" + ConfigSettings.receipturl);
            sessionStorage.setItem("ExportUrl", ConfigSettings.serverAddress + "" + ConfigSettings.ExportUrl);
            sessionStorage.setItem("ClaimTemplate", ConfigSettings.serverAddress + "" + ConfigSettings.ClaimTemplate);
            sessionStorage.setItem("ItemTemplate", ConfigSettings.serverAddress + "" + ConfigSettings.ItemTemplate);
            sessionStorage.setItem("VendorDetailsTemplate", ConfigSettings.serverAddress + "" + ConfigSettings.VendorDetailsTemplate);
            sessionStorage.setItem("UserDetailsTemplate", ConfigSettings.serverAddress + "" + ConfigSettings.UserDetailsTemplate);
            sessionStorage.setItem("zipcodeAndPremiumTemplate", ConfigSettings.serverAddress + "" + ConfigSettings.zipcodesAndPremiumTemplate);
            sessionStorage.setItem("Xoriginator", ConfigSettings.Xoriginator);
            sessionStorage.setItem("claimProfile", ConfigSettings.claimProfile);
            sessionStorage.setItem("serviceRequests", ConfigSettings.serviceRequests);
            sessionStorage.setItem("jewelryVendor", ConfigSettings.jewelryVendor);
            sessionStorage.setItem("speedCheckVendor", ConfigSettings.speedCheckVendor);
            sessionStorage.setItem("SpeedCheckApiurl", ConfigSettings.SpeedCheckApiurl);
            sessionStorage.setItem("bestbuyUrl", ConfigSettings.bestbuyUrl);
            sessionStorage.setItem("hideCaptcha",ConfigSettings.hideCaptcha);
            sessionStorage.setItem("disableSerpWow",ConfigSettings.disableSerpWow);
            sessionStorage.setItem("ThirdPartyAdjusting",ConfigSettings.ThirdPartyAdjusting);
            sessionStorage.setItem("googleShoppingDropdown",ConfigSettings.googleShoppingDropdown);
            
            sessionStorage.setItem("loginWithSSO", ConfigSettings.loginWithSSO);
            sessionStorage.setItem("loginWithSAML",ConfigSettings.loginWithSAML);
            sessionStorage.setItem("isCoreLogic",ConfigSettings.isCoreLogic);

            window.localStorage.setItem("Xoriginator", ConfigSettings.Xoriginator);
            window.localStorage.setItem("SpeedCheckApiurl", ConfigSettings.SpeedCheckApiurl);
            window.localStorage.setItem("apiurl", ConfigSettings.serverAddress + "" + ConfigSettings.apiurl);
            window.localStorage.setItem("bestbuyUrl", ConfigSettings.bestbuyUrl);
            window.localStorage.setItem("hideCaptcha",ConfigSettings.hideCaptcha);
            window.localStorage.setItem("disableSerpWow",ConfigSettings.disableSerpWow);
            window.localStorage.setItem("ThirdPartyAdjusting",ConfigSettings.ThirdPartyAdjusting);
            window.localStorage.setItem("loginWithSSO",ConfigSettings.loginWithSSO)
            window.localStorage.setItem("loginWithSAML",ConfigSettings.loginWithSAML);
            window.localStorage.setItem("isCoreLogic",ConfigSettings.isCoreLogic);



        }, function (error) { ConfigSettings = {}; });
        ConfigSettings = Data;
        return Data;
    };

    //attach auth header to all the calls by calling this property
    this.getHeader = function () {
        return {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-Auth-Token": sessionStorage.getItem("AccessToken"),
            "X-originator": sessionStorage.getItem("Xoriginator"),
            "Time-Zone": Intl.DateTimeFormat().resolvedOptions().timeZone
        }
    };

    this.getFileHeader = function () {
        return {
            'Content-Type': undefined,
            "X-Auth-Token": sessionStorage.getItem("AccessToken"),
            "X-originator": sessionStorage.getItem("Xoriginator")
        }
    };

    this.getCaptchHeaders = function () {
        return {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-Auth-Token": sessionStorage.getItem("AccessToken"),
            "X-originator": sessionStorage.getItem("Xoriginator"),
            "Pragma": 'no-cache'
        }
    };

    this.getHeaderWithoutToken = function () {
        return {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-originator": sessionStorage.getItem("Xoriginator")
        }
    };

    this.getHeaderWithoutTokenAndOriginator = function () {
        return {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    };

    this.getInsuranceCarrier = function () {
        var insuranceCarrier = sessionStorage.getItem("insuranceCarrier");
        return insuranceCarrier;
    };

    this.getApiURL = function () {
        var apiurl = sessionStorage.getItem("apiurl");
        return apiurl;
    };

    this.getAdminApiURL = function () {
        var apiurl = sessionStorage.getItem("AdminApiurl");
        return apiurl;
    };
    this.getReceiptURL = function () {
        var receipturl = sessionStorage.getItem("receipturl");
        return receipturl;
    };
    this.getExportUrl = function () {
        var ExportUrl = sessionStorage.getItem("ExportUrl");
        return ExportUrl;

    };

    this.genericErrorMessage = function () {
        return "An error has occurred due to the connection. Please try again later."
    };

    this.getSpeedCheckApiURL = function () {
        var apiurl = sessionStorage.getItem("SpeedCheckApiurl");
        return apiurl;
    };
}]);
