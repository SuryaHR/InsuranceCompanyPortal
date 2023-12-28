angular.module('MetronicApp').service('ScreenURLMappingService', ['$http', '$rootScope', '$filter', function ($http, $rootScope, $filter) {
    //attach auth header to all the calls by calling this property  
    this.UrlWithCode =
    [{ "ScreenCode": "ClaimManagerDashboard", "URL": "ManagerDashboard" }, { "ScreenCode": "ClaimManagerMyClaim", "URL": "ClaimCenterAllClaims" }];

    this.getIsAccessScreen = function (screenCode) {
        var list = $filter('filter')(this.UrlWithCode, { ScreenCode: screenCode });
        if (list !== null)
            return true;
        else
            return false;
    }

    this.getIsAccessURL=function(url)
    {
        var list = $filter('filter')(this.UrlWithCode, { URL: url});
        if (list !== null)
            return true;
        else
            return false;
    }
}]);