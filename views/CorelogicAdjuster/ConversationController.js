angular.module('MetronicApp').controller('ConversationController', function ($rootScope, $scope, $translate, $uibModal, $filter,
    AuthHeaderService,AdjusterLineItemDetailsService,AdjusterPropertyClaimDetailsService, objMsg, $timeout, $location) {

      $scope.isAllNotes = true;
      $scope.zindex = ["10", "9", "8", "7", "6", "5", "4", "3", "2", "1"];
      $scope.color = ["#C9F1FD", "#FFEBCD", "#3BB9FF", "#f7bec5", "#bdb9f7", "#85f7cb", "#f4d28d", "#f78a74", "#abef97", "#f9f17a"];
      $scope.reply = {
          "message": null,
          "uploadedMessageFiles": []
      };
      $scope.left = ["0px", "-60px", "-60px", "-60px", "-60px", "-60px", "-60px", "-60px", "-60px", "-60px"];
      $scope.NoteDetails = JSON.parse(sessionStorage.getItem("selectedMessageGrp"));
      $scope.tab = 'Notes';
     // GetMessages();
      $scope.itemDescription = objMsg.description;
      function init() {
          $scope.objMsg = {
              "claimNumber": sessionStorage.getItem("AllNoteClaimNumber"),
              "ClaimId": sessionStorage.getItem("AllNoteClaimId"),
              "UserId": sessionStorage.getItem("UserId"),
              "AssignmentNumber": sessionStorage.getItem("AssignmentNumber")
          };
          GetNoteDetails();
      }
      init();

      //Cancel
      $scope.cancel = function () {
          $scope.$close("Cancel");
      };


      $scope.GotoAllNotes = GotoAllNotes;
      function GotoAllNotes(message) {
          if ((objMsg.ClaimId !== null && angular.isDefined(objMsg.ClaimId)) && (objMsg.ClaimNumber !== null && angular.isDefined(objMsg.ClaimNumber))) {
              sessionStorage.setItem("AllNoteClaimId",objMsg.ClaimId);
              sessionStorage.setItem("AllNoteClaimNumber", objMsg.ClaimNumber);
              if (message)
                  sessionStorage.setItem("selectedMessageGrp", JSON.stringify({ groupId: message.noteGroupId }));
              $location.url('AllNotes');
          }
      }

      function GetMessages(event) {
          if (event && event === 'refresh')
              $(".note_refresh_spinner").addClass("fa-spin");
          else
              $(".page-spinner-bar").removeClass("hide");
          var param = {
              "itemId": objMsg.ItemId
          };
          var getpromise = AdjusterLineItemDetailsService.getItemNotes(param);
          getpromise.then(function (success) {
              //var Notes = $filter('orderBy')(success.data && success.data.data ? success.data.data : null, 'updateDate', true);
              var Notes = success.data && success.data.data ? success.data.data : null;
              $scope.Notes = [];
              var idx = 0;
              var selIdx = 0;
              angular.forEach(Notes, function (item, index) {
                  // if (item.groupTitle != null) {
                      var tooltip = '';
                      var count = 0;
                      if ($scope.NoteDetails && $scope.NoteDetails.groupId == item.groupId) {
                          selIdx = idx;
                      } else {
                          idx++;
                      }
                      angular.forEach(item.participants, function (participant) {
                          if (count == item.participants.length - 1) {
                              tooltip += participant.name;
                          } else {
                              tooltip += participant.name + "\n";
                          }
                          count++;
                      });
                      // map messages attachments within group
                      angular.forEach(item.messages, function (message) {
                          angular.forEach(message.attachments, function (attachment) {
                              attachment.FileType = attachment.claimFileType;
                              attachment.FileName = attachment.name;
                              attachment.addedByUser = {
                                  "id": message.addedBy.id
                              };
                              attachment.message = {
                                  "id": message.noteId
                              };
                          });
                      });
                      item.tooltipText = tooltip;
                      $scope.Notes.push(item);
                      console.log($scope.Notes);
                  // }
              });
              if ($scope.Notes !== null && $scope.Notes.length > 0) {
                  $scope.NoteDetails = $scope.Notes[selIdx];
                  $scope.NoteIndex = selIdx;
              }
              if (event && event === 'refresh')
                  $(".note_refresh_spinner").removeClass("fa-spin");
              else
                  $(".page-spinner-bar").addClass("hide");
          }, function (error) {
              $scope.ErrorMessage = error.data.errorMessage;
              $(".note_refresh_spinner").removeClass("fa-spin");
              $(".page-spinner-bar").addClass("hide");
          });
      }

      //Add Note popup
      $scope.AddNotePopup = AddNotePopup;
      function AddNotePopup(message, operation) {
          var obj = {
              "claimId": objMsg.ClaimId,
              "ClaimNumber": objMsg.ClaimNumber,
              "ParticipantList": objMsg.ParticipantList,
              "ItemId": objMsg.ItemId,
              "ItemUID": objMsg.ItemUID,
          };
          $scope.animationsEnabled = true;
          var out = $uibModal.open(
              {
                  animation: $scope.animationsEnabled,
                  templateUrl: "views/CommonTemplates/AddNotePopup.html",
                  controller: "AddNotePopupController",
                  backdrop: 'static',
                  keyboard: false,
                  resolve:
                  {
                      objClaim: function () {
                          return obj;
                      }
                  }
              });
          out.result.then(function (value) {
              //Call Back Function success
              if (value === "Success") {
                  if (operation)
                      supervisorReview(operation);
                  $scope.claimMessages = [];
                  $scope.getMessages();
              }
              if (value === "Cancel") {
                  $scope.defaultRecepients = [];
              }
          }, function (res) {
              //Call Back Function close
          });
          return {
              open: open
          };
          // }
      }
      //End add note popup

      //Get message Details
      $scope.GetNoteDetails = GetNoteDetails;
      function GetNoteDetails(item, ind) {
          $scope.tab = 'Notes';
          $scope.NoteIndex = ind;
          var param = {
            "item": {
                "itemUID": objMsg.ItemUID,
                "itemId": objMsg.ItemId
            }
        }

        var getpromise = AdjusterLineItemDetailsService.getItemComments(param);
        getpromise.then(function (success) {
            console.log(success.data);
            $scope.Comments = success.data.data;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            $(".note_refresh_spinner").removeClass("fa-spin");
            $(".page-spinner-bar").addClass("hide");
        })
         
          $timeout(function () {
              var $id = $("#chat_history");
              //$id.scrollTop($id[0].scrollHeight);
              $id.scrollTop($(document).height());
          }, 1000);
         // $scope.reply.messageForm.$setUntouched();
      };

      $scope.showMessages = showMessages;
      function showMessages() {
          var role = sessionStorage.getItem("RoleList");
          $(".page-spinner-bar").removeClass("hide");
          sessionStorage.setItem("ActiveTab", "Notes");
          if(role === "CLAIM SUPERVISOR"){
            $location.url('SupervisorLineItemDetails');
          } else if (role === "ADJUSTER"){
            $location.url('AdjusterLineItemDetails');
          }
          $scope.$close("Success");
          $(".page-spinner-bar").addClass("hide");
      }

      

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
        //   if ($scope.DocxDetails.isLocal) {
        //       $scope.showDownload = false;
        //       $scope.DocxDetails.url = item.Image;
        //   } else {
        //       if (objMsg.UserId != item.addedByUser.id)
        //           $scope.showDelete = false;
        //   }
          $scope.ReceiptList = $scope.DocxDetails.url;
          $scope.pdfUrl = $scope.ReceiptList;
          var pdf = ["pdf", "application/pdf"];
          var img = ["image", "application/image", "image/png", "image/jpeg", "image/gif", "png", "jpg", "jpeg", "gif", "image", "PNG", "JPEG", "GIF", "JPG"];
          $scope.imgDiv = true;
          if (pdf.indexOf(($scope.DocxDetails.fileType.toLowerCase())) > -1) {
              $scope.isPDF = 1;
          }
          else if (img.indexOf(($scope.DocxDetails.fileType.toLowerCase())) > -1) {
              $scope.isPDF = 2;
          }
          else {
              $scope.isPDF = 0;
              $scope.imgDiv = false;
              var downloadLink = angular.element('<a></a>');
              downloadLink.attr('href', $scope.DocxDetails.url);
            //   downloadLink.attr('target', '_self');
            //   downloadLink.attr('download', ($scope.DocxDetails.name != null && angular.isDefined($scope.DocxDetails.name) && $scope.DocxDetails.name !== "") ? $scope.DocxDetails.name : "Document");
            downloadLink.attr('download', "porallllda.docs");
              
              downloadLink[0].click();
          }
        //   window.setTimeout(function () {
        //       $("#img_preview").css({
        //           'center': $('.page-wrapper-middle').offset().left + 'px'
        //       }).show();
        //       // $("#img_preview").show();
        //   }, 100);

      }
      $scope.close = function () {
          $scope.imgDiv = false;
          $scope.newImageIndex = null;
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

      $scope.deleteMessageAttachment = deleteMessageAttachment;
      function deleteMessageAttachment(document) {
          bootbox.confirm({
              size: "",
              closeButton: false,
              title: "Delete '" + document.FileName + "",
              message: "Are you sure you want to delete this attachment? <b>Please Confirm!",
              className: "modalcustom", buttons: {
                  confirm: {
                      label: 'Yes',
                      className: 'btn-outline green'
                  },
                  cancel: {
                      label: 'No',
                      className: 'btn-outline red'
                  }
              },
              callback: function (result) {
                  //if (result)  call delet function
                  if (result) {
                      $(".page-spinner-bar").removeClass("hide");
                      var param = [{
                          id: angular.isUndefined(document.id) ? (angular.isUndefined(document.imageId) ? null : document.imageId) : document.id
                      }]
                      var promis = AdjusterPropertyClaimDetailsService.deleteMediaFile(param);
                      $scope.imgDiv = false;
                      promis.then(function (success) {
                          var message = $scope.NoteDetails.messages.find(message => message.noteId === document.message.id);
                          if (message) {
                              var attachmentIndex = message.attachments.findIndex(attachment => attachment.imageId === document.imageId);
                              if (attachmentIndex > -1)
                                  message.attachments.splice(attachmentIndex, 1);
                          }
                          toastr.remove()
                          toastr.success(success.data.message, "Success");
                          $(".page-spinner-bar").addClass("hide");
                      }, function (error) {
                          toastr.remove()
                          toastr.error(error.data.errorMessage, "Error");
                          $(".page-spinner-bar").addClass("hide");
                      });

                  }
              }
          });
      }

      // Delete message
      $scope.deleteMessage = deleteMessage;
      function deleteMessage(item, participants) {
          bootbox.confirm({
              size: "",
              // title: "Delete Message",
              message: "Are you sure want to delete the message?", closeButton: false,
              className: "modalcustom", buttons: {
                  confirm: {
                      label: "Yes",
                      className: 'btn-outline green'
                  },
                  cancel: {
                      label: "No", //$translate.instant('ClaimDetails_Delete.BtnNo'),
                      className: 'btn-outline red'
                  }
              },
              callback: function (result) {
                  if (result) {
                      if (angular.isDefined(item.noteUID) && item.noteUID !== null) {
                          $(".page-spinner-bar").removeClass("hide");
                          var param = {
                              "noteUID": item.noteUID
                          };
                          var promis = AdjusterPropertyClaimDetailsService.deleteMessage(param);
                          promis.then(function (success) {
                              $(".page-spinner-bar").addClass("hide");
                              GetMessages(null);
                              toastr.remove();
                              toastr.success(success.data.message, "Confirmation");
                          },
                              function (error) {
                                  toastr.remove();
                                  if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                                      toastr.error(error.data.errorMessage, "Error")
                                  }
                                  else {
                                      toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
                                  }
                                  $(".page-spinner-bar").addClass("hide");
                              });
                      };
                  }
              }
          });
      };

      //---- Start upload message attachment -----//
      $scope.selectMessageAttachments = function () {
          angular.element('#messageFileUpload').trigger('click');
      }
      $scope.getMessageAttachmentDetails = function (e) {
          $scope.$apply(function () {
              var files = event.target.files;
              for (var i = 0; i < files.length; i++) {
                  var file = files[i];
                  var reader = new FileReader();
                  reader.file = file;
                  reader.fileName = files[i].name;
                  reader.fileType = files[i].type;
                  reader.fileExtension = files[i].name.substr(files[i].name.lastIndexOf('.'));
                  //20 MB
                  if (reader.file.size > 20000000) {
                      $scope.invalidAttachment = true;
                      return false;
                  } else {
                      $scope.invalidAttachment = false;
                  }
                  reader.onload = $scope.imageIsLoaded;
                  reader.readAsDataURL(file);
              }
          });
          angular.element("#messageFileUpload").val(null);
      };
    $scope.reply.uploadedMessageFiles = [];
    
    function getFileExtension(filename){
        const extension = filename.substring(filename.lastIndexOf('.') + 1, filename.length) || filename;
        return extension;
    }

      $scope.imageIsLoaded = function (e) {
          if ($scope.reply.uploadedMessageFiles.length === 10) {
              toastr.remove();
              toastr.warning("Can't add more than 10 files", "Warning");
              return false;
          } else {
              var isFileExist = false;
              angular.forEach($scope.reply.uploadedMessageFiles, function (file) {
                  if (e.target.fileName === file.FileName)
                      isFileExist = true
              });
              if (isFileExist) {
                  toastr.remove();
                  toastr.warning("Attachment with name '" + e.target.fileName + "' already exists");
              }
              else {
                  $scope.$apply(function () {
                      $scope.reply.uploadedMessageFiles.push(
                          {
                              "FileName": e.target.fileName, "FileExtension":getFileExtension(e.target.fileName),
                              "FileType": e.target.fileType,
                              "Image": e.target.result, "File": e.target.file, "isLocal": true
                          })
                  });
              }
          }
      }

      $scope.removeMessageFile = function (item) {
          var index = $scope.reply.uploadedMessageFiles.indexOf(item);
          if (index > -1) {
              $scope.reply.uploadedMessageFiles.splice(index, 1);
          }
          $scope.close();
      }
      //------ Upload attachment End -----//

      // Reply message
      $scope.replyMessage = function (comment) {
          $(".page-spinner-bar").removeClass("hide");
          var commenttData = new FormData();
          var FileDetails = [];
          if ($scope.reply.uploadedMessageFiles.length > 0) {
              angular.forEach($scope.reply.uploadedMessageFiles, function (item) {
                  FileDetails.push({
                      "fileName": item.FileName, "fileType": item.FileType,
                      "extension": item.FileExtension,
                      "filePurpose": "NOTE", "latitude": null, "longitude": null
                  });
                  commenttData.append("file", item.File);
              });
              commenttData.append("mediaFilesDetail", JSON.stringify(FileDetails));
          }
          else {
            commenttData.append("mediaFilesDetail", null);
            commenttData.append("file", null);
          }
  
          var param = {
            "comment": comment,
            "item": {
                "itemUID": objMsg.ItemUID,
                "itemId": objMsg.ItemId
            },
            "commentedBy": {
                "id": sessionStorage.getItem("UserId")
            }
          }
          commenttData.append("commentData",JSON.stringify(param));

          var getpromise = AdjusterLineItemDetailsService.addItemComments(commenttData);
          getpromise.then(function (success) {
            $scope.reply.uploadedMessageFiles = []
              console.log(success.data);
              $scope.Comments = success.data.data;
              $scope.comment = '';
              $(".page-spinner-bar").addClass("hide");
          }, function (error) {
              $scope.ErrorMessage = error.data.errorMessage;
              $(".note_refresh_spinner").removeClass("fa-spin");
              $(".page-spinner-bar").addClass("hide");
          })
          


          /*
          var data = new FormData();
          var FileDetails = [];
          if ($scope.reply.uploadedMessageFiles.length > 0) {
              angular.forEach($scope.reply.uploadedMessageFiles, function (item) {
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
              data.append("mediaFilesDetail", null);
              data.append("file", null);
          }
          var registrationNumber = NoteDetails.isAddedByVendor ? NoteDetails.vendorURN : null;
          data.append("noteDetail", JSON.stringify(
              {
                  "isPublicNote": NoteDetails.isPublicNote,
                  "registrationNumber": registrationNumber,
                  "sender": sessionStorage.getItem("CRN"),
                  "itemUID": NoteDetails && NoteDetails.itemUID ? NoteDetails.itemUID : null,            // if it is item level note
                  "serviceRequestNumber": null,
                  "isInternal": angular.isDefined(registrationNumber) && registrationNumber != "" ? false : true,
                  "claimNumber": objMsg.ClaimNumber,
                  "message": $scope.reply.message,
                  "groupDetails":
                      { "groupId": NoteDetails.groupId, "groupNumber": NoteDetails.groupNumber }
              }))
          var getpromise = AdjusterPropertyClaimDetailsService.ReplyClaimNote(data);
          getpromise.then(function (success) {
              $scope.Status = success.data.status;
              if ($scope.Status == 200) {
                  $scope.resetReply();
                  GetMessages(NoteDetails.groupId);
                  toastr.remove();
                  toastr.success(success.data.message, "Confirmation");
                  $(".page-spinner-bar").addClass("hide");
              }
          }, function (error) {
              toastr.remove();
              toastr.error(error.data.errorMessage, "Error");
              $scope.ErrorMessage = error.data.errorMessage;
              $(".page-spinner-bar").addClass("hide");
          });*/
      };

      $scope.resetReply = function () {
          $scope.reply.message = null;
          $scope.reply.messageForm.$setUntouched();
          $scope.reply.uploadedMessageFiles = [];
          angular.element("input[type='file']").val(null);
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
      $scope.isPdf = function (fileName) {
          if (/\.(pdf|PDF)$/i.test(fileName)) {
              return true;
          }
      }
      $scope.isImage = function (fileName) {
          if (/\.(jpe?g|png|gif|bmp)$/i.test(fileName)) {
              return true;
          }
      }
      $scope.isExcel = function (fileName) {
          if (/\.(xls|xlsx)$/i.test(fileName)) {
              return true;
          }
      }
      $scope.isDocx = function (fileName) {
          if (/\.(docx|doc)$/i.test(fileName)) {
              return true;
          }
      }
});
