angular.module('MetronicApp').controller('NotesController', function ($rootScope, $scope, $location, $translate, $translatePartialLoader,$uibModal, $filter, AppraisalNotesService) {
    //set language
    $translatePartialLoader.addPart('AppraisalNotes');
    $translate.refresh();

    $scope.Notes = [];
    $scope.NoteDetails;
    $scope.NoteIndex;
    $scope.ItemDetails = {};
    $scope.appraisalParticipantsList = [];
    $scope.ParticipantName = "";

    $scope.policyStatus = sessionStorage.getItem('status');

    $scope.UserType = sessionStorage.getItem('RoleList');
    
    function init() {
        $scope.CommonObj = {
            appraisalNumber: sessionStorage.getItem("AppraisalNo"),
            appraisalId: sessionStorage.getItem("appraisalId")
        };
        GetNotes();
        GetParticipantsList();     
        
        $scope.isAppraisalActive = sessionStorage.getItem('isAppraisalActive');
        if($scope.isAppraisalActive == 'false' || $scope.policyStatus == 'InActive')
        document.getElementById("appraisalNoteId").disabled = true;

    } 

    /* Start- onClick of "Notes" tab below functions invoked */
    var noteInitEvent = $rootScope.$on("CallNotesInitMethod", function(){
        $scope.NoteDetails = [];
        $scope.NoteList = [];
        init();        
    });
    $scope.$on('$destroy', function() {
        noteInitEvent();
    });
    /* End */

    /*Get Note against Appraisal with NoteGroup details*/
    function GetNotes() {
        var param = {
            "appraisalId": $scope.CommonObj.appraisalId,
            "appraisalNumber": $scope.CommonObj.appraisalNumber,
            "userId" : sessionStorage.getItem("UserId")
        };
        var getpromise = AppraisalNotesService.getAppraisalNotes(param);
        getpromise.then(function (success) {
            $scope.NoteList = success.data.data;            
            console.log($scope.NoteList);
            
            /*var urlSplit=null;
            angular.forEach($scope.NoteList, function (note) {                
                angular.forEach(note.messages, function (msgDetails) {
                      angular.forEach(msgDetails.attachments, function (attachment) {
                            if(attachment.url!=null && attachment.url!=""){
                                urlSplit = attachment.url.split('/');
                                attachment.url = window.location.origin+"/"+ urlSplit[3] +"/"+ urlSplit[4] +"/"+ urlSplit[5]+"/"+ urlSplit[6];
                            }
                     });
                });
            });*/

            $scope.NoteList = $filter('orderBy')($scope.NoteList, 'createDate', true);
            if ($scope.NoteList!==null && $scope.NoteList.length > 0) {
                $scope.NoteDetails = $scope.NoteList[0];
                $scope.NoteIndex = 0;
            }
           
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            $(".page-spinner-bar").addClass("hide");
        });
    }
    
    $scope.GoBack=GoBack;
    function GoBack()
    {
        sessionStorage.setItem("AllNoteClaimId", null);
        sessionStorage.setItem("AllNoteClaimNumber", null);
        window.history.back();
    }
    
    //Get Note Details
    $scope.GetNoteDetails = GetNoteDetails;
    function GetNoteDetails(item,ind)
    {
       $scope.NoteIndex = ind;        
       $scope.NoteDetails = item;  
       //console.log($scope.NoteDetails);      
    }
    
    /*Get active ParticipantsList for the Appraisal*/
    $scope.GetParticipantsList = GetParticipantsList;
    function GetParticipantsList()
    {
        var param = { 
                        "appraisalNumber": $scope.CommonObj.appraisalNumber,
                        "isPrivateParticipants": false
                    };
        var getpromise = AppraisalNotesService.getParticipantsListAgainstAppraisal(param);
        getpromise.then(function (success) {
            $scope.AppraisalParticipantsList = success.data.data;
            angular.forEach($scope.AppraisalParticipantsList, function (participant) {
                if (participant.firstName == null) {
                    participant.firstName = " ";
                }
                if (participant.lastName == null) {
                    participant.lastName = " ";
                }
            });
            $(".page-spinner-bar").addClass("hide");
        }, function (error) { 
            $scope.ErrorMessage = error.data.errorMessage;
            $(".page-spinner-bar").addClass("hide");
         });
    }
    $scope.PraticipantIdList = [];
    
    var NoteUser = [];
    var internal = true;
    var registration = null;
        
    /* Add New Note against Appraisal */
    $scope.AddNotePopup = AddNotePopup;
    function AddNotePopup(ev) {
        var obj = {
            "appraisalNumber": $scope.CommonObj.appraisalNumber,
            "ParticipantList": $scope.AppraisalParticipantsList
        };
        $scope.animationsEnabled = true;
        var out = $uibModal.open(
        {
            animation: $scope.animationsEnabled,
            templateUrl: "views/AppraisalNotes/AddNotePopup.html",
            controller: "AddItemNotePopupController",
            backdrop: 'static',
            keyboard: false,
            resolve:{
                objClaim: function () {
                    objClaim = obj;
                    return objClaim;
                }
            }
        });
        out.result.then(function (value) {
            //Call Back Function success
            if (value === "Success") {
                GetNotes();
            }

        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };

    };
    
    $scope.GoToHome=function()
    {
        $location.url(sessionStorage.getItem("HomeScreen"));
    }
       
    $scope.fileName = null;
    $scope.FileType = null;
    $scope.FileExtension = null;
    $scope.files = [];
    //for note attachment
    $scope.SelectNoteFile = SelectNoteFile;
    function SelectNoteFile() {
        angular.element('#NoteFileUpload').trigger('click');
    }
    $scope.filed;
    $scope.getNoteFileDetails = getNoteFileDetails;
    function getNoteFileDetails(event) {       
        var files = event.target.files;
        $scope.filed = event.target.files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.file = file;
            reader.fileName = files[i].name;
            reader.fileType = files[i].type;
            reader.fileExtension = files[i].name.substr(files[i].name.lastIndexOf('.'));
            reader.onload = $scope.imageIsLoaded;
            reader.readAsDataURL(file);
        }
    }
    $scope.imageIsLoaded = function (e) {
        $scope.$apply(function () {
            $scope.files.push({ "FileName": e.target.fileName, "FileExtension": e.target.fileExtension, "FileType": e.target.fileType, "Image": e.target.result, "File": e.target.file })
        });
    }
    $scope.RemoveImage = RemoveImage;
    function RemoveImage(item) {
        var index = $scope.files.indexOf(item);
        if (index > -1) {
            $scope.files.splice(index, 1);
        }
    }

    /* Reply Note to particular group note*/
    $scope.ReplyToNote = function (e) {
        $(".page-spinner-bar").removeClass("hide");
        var data = new FormData();
        if ($scope.files.length > 0) {
            var FileDetails = [];
            angular.forEach($scope.files, function (item) {            
                FileDetails.push({
                    "fileName": item.FileName, "fileType": item.FileType,
                    "extension": item.FileExtension,
                    "filePurpose": "NOTE", "latitude": null, "longitude": null
                });
                data.append("file", item.File);
            });
            data.append("mediaFilesDetail", JSON.stringify(FileDetails));
        }
        else {
            data.append("mediaFilesDetail", JSON.stringify(null));
            data.append("file", JSON.stringify(null));
        }

        
        var regNumber ='';
        var isPrivate = false;
        if($scope.NoteDetails !=null){
            regNumber = $scope.NoteDetails.isPublicNote ? sessionStorage.getItem("speedCheckVendor") : sessionStorage.getItem("CRN");
            isPrivate = $scope.NoteDetails.isPublicNote == true ? false : true;
            NoteUser = $scope.NoteDetails.participants;
            
        }

      data.append("noteDetail", JSON.stringify({
                "appraisalNumber": $scope.CommonObj.appraisalNumber,
                "isPrivateParticipants": isPrivate,
                "registrationNumber": regNumber,
                "sender": sessionStorage.getItem("CRN"),
                "message": $scope.CommonObj.appraisalNote,
                "groupDetails":{ 
                                "groupId": $scope.NoteDetails.groupId,
                                "groupNumber": $scope.NoteDetails.groupNumber,
                                "groupTitle": $scope.NoteDetails.groupTitle,
                                "createDate": $scope.NoteDetails.createDate,
                                "noteParticipants": []
                               }
            }
        ))

        var getpromise = AppraisalNotesService.ReplyAppraisalNote(data);
        getpromise.then(function (success) {
            $scope.Status = success.data.status;
            if ($scope.Status == 200) {                
                $scope.CommonObj.appraisalNote ="";
                GetNotes();                
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");                

                $(".page-spinner-bar").addClass("hide");
            }
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
            $scope.ErrorMessage = error.data.errorMessage;
            $(".page-spinner-bar").addClass("hide");
        });
    }

    /* Function to preview uploaded Documents */
    //Attachments preview
    $scope.GetDocxDetails = function (item, index) {
        $scope.showDownload = true;
        $scope.showDelete = true;
        if (index != undefined && index != null) {
            $scope.newImageIndex = index;
        }
        $scope.pdf = true;
        $scope.currentPDFUrl = $scope.pdfUrl;
        $scope.pageToDisplay = 1;
        $scope.pageNum = 1;
        $scope.isPDF = 0;
        $scope.DocxDetails = item;
        var type = $scope.DocxDetails.name.split(".");
        $scope.DocxDetails.FileType = type[1];
        if ($scope.DocxDetails.isLocal) {
            $scope.showButton = false;
            $scope.DocxDetails.url = item.Image;
        } else {
            $scope.showButton = true;
        }

        // if ($scope.DocxDetails.isLocal) {
        //     $scope.showDownload = false;
        //     $scope.DocxDetails.url = item.Image;
        // } else {
        //     if ($scope.CommonObj.UserId != item.addedByUser.id)
        //         $scope.showDelete = false;
        // }
        $scope.ReceiptList = $scope.DocxDetails.url;
        $scope.pdfUrl = $scope.ReceiptList;
        var pdf = ["pdf", "application/pdf", "PDF"];
        var img = ["image", "application/image", "image/jpg", "image/png", "image/jpeg",
            "image/gif", "png", "jpg", "jpeg", "gif",
            "image/bmp", "bmp"];
        var video = ["video/mp4", "video/ogg", "video/3gpp", "video/webm"];
        var docs = ["doc", "docx", "application/msword"]
        $scope.imgDiv = true;
        let fileType = ($scope.DocxDetails.FileType ? $scope.DocxDetails.FileType : $scope.DocxDetails.type).toLowerCase();
        if (pdf.indexOf(fileType) > -1) {
            $scope.isPDF = 1;
        }
        else if (img.indexOf(fileType) > -1) {
            $scope.isPDF = 2;
        }
        else if (video.indexOf(fileType) > -1) {
            $scope.isPDF = 3;
            let videoElm = $('#video-attachment').get(0);
            if (videoElm)
                videoElm.src = $filter('trustUrl')($scope.DocxDetails.url);
        }
        else {
            $scope.isPDF = 0;
            if (!$scope.DocxDetails.isLocal)
                $scope.downloadFile($scope.DocxDetails);
        }
        window.setTimeout(function () {
            $("#img_preview").css({
                'center': $('.page-wrapper-middle').offset().left + 'px'
            }).show();
            // $("#img_preview").show();
        }, 100);

    }

    //Fuction to download uploaded files.
    $scope.downloadAttachment = function (data) {
        fetch(data.url).then(function (t) {
            return t.blob().then((b) => {
                var a = document.createElement("a");
                a.href = URL.createObjectURL(b);
                a.setAttribute("download", data.name);
                a.click();
            }
            );
        });
    }

    $scope.GetDocxDetailsOld = function (item) {
        $scope.pdf = true;
        $scope.currentPDFUrl = $scope.pdfUrl;
        $scope.pageToDisplay = 1;
        $scope.pageNum = 1;
        $scope.isPDF = 0;
        $scope.DocxDetails = item;
        if ($scope.DocxDetails.isLocal) {
            $scope.showButton = false;
            $scope.DocxDetails.url = item.Image;
        } else {
            $scope.showButton = true;
        }
        $scope.ReceiptList = $scope.DocxDetails.url;
        $scope.pdfUrl = $scope.ReceiptList;
        var type = $scope.DocxDetails.name.split(".");

        var pdf = ["pdf", "application/pdf"];
        var img = ["image", "application/image", "image/png", "image/jpeg", "image/gif", "png", "jpg", "jpeg", "gif", "image", "PNG", "JPEG", "GIF", "JPG"];
        $scope.imgDiv = true;
        if (pdf.indexOf((type[1].toLowerCase())) > -1) {
            $scope.isPDF = 1;
        }
        else if (img.indexOf((type[1].toLowerCase())) > -1) {
            $scope.isPDF = 2;
        }
        else {
            $scope.isPDF = 0;
            var downloadLink = angular.element('<a></a>');
            downloadLink.attr('href', $scope.DocxDetails.url);
            downloadLink.attr('target', '_self');
            downloadLink.attr('download', (($scope.DocxDetails.name != null && angular.isDefined($scope.DocxDetails.name) && $scope.DocxDetails.name !== "") ? $scope.DocxDetails.name : "Document"));
            downloadLink[0].click();
        }
        window.setTimeout(function () {
            $("#img_preview").css({
                'right': $('.page-wrapper-middle').offset().left + 'px'
            }).show();
        }, 100);

    }

    //Function to covert base64 data to blob.
    function b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;
        var byteCharacters = atob(b64Data);
        var byteArrays = [];
        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);
            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        var blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }

    //Fuction to download uploaded files.
    $scope.getAttachements = function (data) {
        var b64Data = data;
        var contentType = 'application/octet-stream';
        var blob = b64toBlob(b64Data, contentType);
        var url = window.URL.createObjectURL(blob);
        var downloadLink = angular.element('<a></a>');
        downloadLink.attr('href', url);
        downloadLink.attr('target', '_self');
        downloadLink.attr('download', (($scope.DocxDetails.name != null && angular.isDefined($scope.DocxDetails.name) && $scope.DocxDetails.name !== "") ? $scope.DocxDetails.name : "Document"));
        downloadLink[0].click();
    }
    
    /* Close attachment preview window */
    $scope.close = function () {
        $("#img_preview").hide();
    }

    var zoomFactor = 100;
    $scope.largeMe = largeMe;
    function largeMe() {
        zoomFactor += 5;
        document.getElementById('imagepre').style.zoom = zoomFactor + "%";
    }

    $scope.smallMe = smallMe;
    function smallMe() {
        zoomFactor -= 5;
        document.getElementById('imagepre').style.zoom = zoomFactor + "%";
    }

    /* Delete particular Note from note list */
    $scope.DeletNote = DeletNote;
    function DeletNote()
    {
        // Yet to TODO
    }
    
});