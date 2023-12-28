angular.module('MetronicApp').service('AddNoteEventService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    //Add note against claim with participant
    this.addClaimNoteWithParticipant = function (param) {
        var Addnote = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/private/note",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return Addnote;
    }
    //add claim notes API #120
    this.addClaimNoteWithOptionalAttachment = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/push/note",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    };

    this.AddNewEvent = function (param) {
        
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "customer/schedule/event",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
}]);