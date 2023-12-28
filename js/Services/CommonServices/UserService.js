angular.module('MetronicApp').service('UserService', ['$rootScope', '$cookies', '$http', function ($rootScope, $cookies, $http) {
    this.initUserDetails = function (response, password, RememberMe) {
        sessionStorage.setItem("IsLogined", "true");
        $rootScope.IsLoginedUser = true;
        sessionStorage.setItem("AccessToken", response.data.token);
        sessionStorage.setItem("UserName", response.data.email);
        sessionStorage.setItem("UserLastName", response.data.lastName);
        sessionStorage.setItem("Name", response.data.lastName + ", " + response.data.firstName);
        var profilePicture = {
            "fileName": response.data.displayPicture ? response.data.displayPicture.fileName : null,
            "filePurpose": response.data.displayPicture ? response.data.displayPicture.filePurpose : null,
            "fileType": response.data.displayPicture ? response.data.displayPicture.fileType : null,
            "fileUrl": response.data.displayPicture ? response.data.displayPicture.fileUrl : null,
            "mediaFileId": response.data.displayPicture ? response.data.displayPicture.mediaFileId : null
        }
        sessionStorage.setItem("ProfilePicture", JSON.stringify(profilePicture));
        sessionStorage.setItem("Office", response.data.office);
        sessionStorage.setItem("UserId", response.data.userId);
        if (response.data.branchDetails != null) {
            sessionStorage.setItem("BranchCode", response.data.branchDetails.branchCode);
            //sessionStorage.setItem("BranchId", response.data.branchDetails.branchId);
            sessionStorage.setItem("BranchId", response.data.branchDetails.id);
        } else {
            sessionStorage.setItem("BranchCode", null);
            sessionStorage.setItem("BranchId", null);
        }
        if (response.data.companyDetails != null && angular.isDefined(response.data.companyDetails)) {
            sessionStorage.setItem("InsuranceCompanyName", response.data.companyDetails.name);
        }


        //sessionStorage.setItem("Password", password);
        sessionStorage.setItem("UserType", response.data.loggedinUserType);
        sessionStorage.setItem("CompanyId", response.data.companyDetails ? response.data.companyDetails.id:"");
        sessionStorage.setItem("CRN", response.data.companyDetails ? response.data.companyDetails.crn:"");
        if (response.data.vendorDetails !== null && response.data.vendorDetails !== undefined)
            sessionStorage.setItem("VendorId", response.data.vendorDetails.vendorId);
        else
            sessionStorage.setItem("VendorId", null);
        if (RememberMe) {
            $cookies.put('UserName', response.data.email);
            $cookies.put('Password', password);
        }

        sessionStorage.setItem("isResetPassword", response.data.resetPassword);
        sessionStorage.setItem("ForgotPassword", response.data.forgotPassword);
        sessionStorage.setItem("isSQExists", response.data.securityQuestionsExists);

        window.localStorage.setItem("IsLogined", "true");
        window.localStorage.setItem("AccessToken", response.data.token);
        window.localStorage.setItem("UserName", response.data.email);
        window.localStorage.setItem("UserLastName", response.data.lastName);
        window.localStorage.setItem("Name", response.data.lastName + ", " + response.data.firstName);
        window.localStorage.setItem("Office", response.data.office);
        window.localStorage.setItem("UserId", response.data.userId);
        window.localStorage.setItem("CRN", sessionStorage.getItem("CRN"));


        if (response.data.branchDetails != null) {
            window.localStorage.setItem("BranchCode", response.data.branchDetails.branchCode);
            window.localStorage.setItem("BranchId", response.data.branchDetails.branchId);
        } else {
            window.localStorage.setItem("BranchCode", null);
            window.localStorage.setItem("BranchId", null);
        }
        if (response.data.companyDetails != null && angular.isDefined(response.data.companyDetails)) {
            window.localStorage.setItem("InsuranceCompanyName", response.data.companyDetails.name);
        }


        //sessionStorage.setItem("Password", password);
        window.localStorage.setItem("UserType", response.data.loggedinUserType);
        window.localStorage.setItem("CompanyId", response.data.companyDetails ? response.data.companyDetails.id:"");
        window.localStorage.setItem("CRN", response.data.companyDetails ? response.data.companyDetails.crn:"");
        if (response.data.vendorDetails !== null && response.data.vendorDetails !== undefined)
            window.localStorage.setItem("VendorId", response.data.vendorDetails.vendorId);
        else
            window.localStorage.setItem("VendorId", null);

        //Add username and user id to rootscope
        $rootScope.userName = angular.copy(response.data.email);
        $rootScope.userId = angular.copy(response.data.userId);

        return true;
    }
    this.removeUserDetails = function () {
        sessionStorage.clear();
        var oktaidToken = localStorage.getItem("oktaIdToken");
        var oktaacessToken = localStorage.getItem("oktaAccessToken");
        var oktaUserName = localStorage.getItem("oktaUserName");
        var oktaClientId = localStorage.getItem("OktaClientId");
        var OktaBaseURL = localStorage.getItem("OktaBaseURL");
        var OktaEndSessionRedirectionURL = localStorage.getItem("OktaEndSessionRedirectionURL");
        var OktaRedirectionURL = localStorage.getItem("OktaRedirectionURL");
        window.localStorage.clear();
        localStorage.setItem("oktaIdToken", oktaidToken);
        localStorage.setItem("oktaAccessToken",oktaacessToken);
        localStorage.setItem("oktaUserName",oktaUserName);
        localStorage.setItem("OktaClientId",oktaClientId);
        localStorage.setItem("OktaRedirectionURL",OktaRedirectionURL);
        localStorage.setItem("OktaBaseURL",OktaBaseURL);
        localStorage.setItem("OktaEndSessionRedirectionURL",OktaEndSessionRedirectionURL);
        $cookies.remove('UserName');
        $cookies.remove('Password');
        $rootScope.IsLoginedUser = false;
        return true;
    }

    this.DummyData = function (Username) {
        var data = {
            "userId": 1,
            "accountStatus": true,
            "authorities": "ADMIN",
            "cellPhone": "9998887776",
            "designationId": null,
            "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJnYXVyYXZrQGNoZXR1LmNvbSIsImF1ZGllbmNlIjoid2ViIiwiY3JlYXRlZCI6MTUxMjM4MDI1OTQ0OCwiZXhwIjoxNTEyMzk4MjU5fQ.egoS0HkQmceZA5G40nDZCq4GAVX9KG6kYGlfdrIU6n3AfXd3kquw3VYi48boUeh77Z9PsXT6zs10y2paz3ol3Q",
            "lastLogin": "12-04-2017T05:39:21Z",
            "reportingManager": null,
            "reportingManagerId": null,
            "companyId": 1,
            "companyName": "ONE IC Corp",
            "dayTimePhone": "9998887776",
            "designation": "SYSTEM ADMIN",
            "email": Username,
            "eveningTimePhone": "9998887776",
            "faxNumber": "9998887776",
            "firstName": "User",
            "lastName": "User",
            "loggedinUserType": "COMPANY_USER",
            "memberSince": null,
            "role": [
                {
                    "roleId": 1000,
                    "roleName": "COMPANY ADMIN",
                    "permissions": [

                    ]
                }
            ],
            "userName": Username,
            "branchOffice": null,
            "address": null
        };


        if (Username == "claimmanager@artigem.com") {
            data.firstName = "Claim",
                data.lastName = "Manager",
                data.role[0].roleName = "Claim Center Manager";
        }
        else if (Username == "underwriter@artigem.com") {
            data.firstName = "Under",
                data.lastName = "Writer",
                data.role[0].roleName = "Insurance Underwriter";
        }
        else if (Username == "adjuster@artigem.com") {
            data.firstName = "Adjuster",
                data.lastName = "Artigem",
                data.role[0].roleName = "Insurance Adjuster";
        }
        else if (Username == "specialist@artigem.com") {
            data.firstName = "Pricing",
                data.lastName = "Specialist",
                data.role[0].roleName = "Pricing Specialist";
        }
        else if (Username == "supervisor@artigem.com") {
            data.firstName = "Super",
                data.lastName = "Visor",
                data.role[0].roleName = "Insurance Claims Supervisor";
        }
        else if (Username == "insuranceadmin@artigem.com") {
            data.firstName = "Insurance",
                data.lastName = "Admin",
                data.role[0].roleName = "INSURANCE ADMIN";
        }

        var d = {
            "data": data
        };
        return d;
    }
}]);