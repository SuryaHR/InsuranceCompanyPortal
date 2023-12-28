
angular.module('MetronicApp').service('AppraisalNotesService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    //Speedcheck Appraisal - Add note against Appraisal with participant
    this.addAppraisalNoteWithParticipant = function (param) {
        var Addnote = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "appraisal/notes/save",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return Addnote;
    }

    //get Appraisal notes
    this.getAppraisalNotes = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "appraisal/notes/list",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //Speedcheck Appraisal - Reply note 
    this.ReplyAppraisalNote = function (param) {
        var Addnote = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "appraisal/notes/save",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return Addnote;
    };

    //Speedcheck Appraisal - Delete note 
    this.DeleteNote = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "appraisal/notes/delete",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //get participants against appraisal
    this.getParticipantsListAgainstAppraisal = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "appraisal/notes/paticipants/list",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

}]);
