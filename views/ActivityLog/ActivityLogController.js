angular.module('MetronicApp').controller('ActivityLogController', function ($rootScope, $scope, $location, $uibModal, $translate, $translatePartialLoader, settings, $filter, ActivityLogService, AuthHeaderService) {
    //set language
    $translatePartialLoader.addPart('ActivityLog');
    $translate.refresh();
    $scope.pagesize = $rootScope.settings.pagesize;
    //Serch models

    // $scope.ActivityEvents = [];
    $scope.ClaimLog = true;
    $scope.CurrentTab = 'ItemSummary';
    $scope.desclimit = 200;
    $scope.descMoreShown = false;
    $scope.logs =[{"date":"novenber-18","noteDetails":[]}];
    $scope.toggle=[];

    function init() {
        // getActivityEvents();
        $scope.LogList = [];
        $scope.logs = [];
        $scope.role = sessionStorage.getItem("RoleList");
        if (sessionStorage.getItem("BackPage") == "SupervisorClaimDetails") {
            getClaimLog();
        } else if (sessionStorage.getItem("BackPage") == "AdjusterPropertyClaimDetails" || sessionStorage.getItem("BackPage") == "CorelogicAdjusterPropertyClaimDetails"
        || sessionStorage.getItem("BackPage") == "PolicyholderClaimDetails" || sessionStorage.getItem("RoleList") == 'POLICYHOLDER') {
            //if (sessionStorage.getItem("BackPage") == "SupervisorClaimDetails" || sessionStorage.getItem("BackPage") == "SupervisorLineItemDetails")
            //SupervisorClaimDetails || SupervisorLineItemDetails
            getClaimLog();
            getClaimItemsLog();
        } else {
            $scope.ClaimLog = false;
            getItemLog();
        }
        
    };

    init();
    //GoBack
    $scope.Back = Back;
    function Back() {
        sessionStorage.setItem("ReportClaimNo", null);
        window.history.back();
    };
    //Go to Home
    $scope.GoToHome = function () {
        $location.url(sessionStorage.getItem('HomeScreen'));
    };

    //Sorting
    $scope.sortKey = 'updatedDate';
    //$scope.reverse = true;
    $scope.SortClaimForm = function (keyname) {
        $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false;
        $scope.sortKey = keyname;
    };

    $scope.getClaimLog = getClaimLog;
    function getClaimLog() {
        //Get Claim Log Details
        $(".page-spinner-bar").removeClass("hide");
        var param = { "claimId": $scope.role =='POLICYHOLDER'?sessionStorage.getItem("PolicyHolderClaimId"): sessionStorage.getItem("ClaimId") };
        var getLogDetailsDetails = ActivityLogService.GetClaimLog(param);
        getLogDetailsDetails.then(function (success) {
            //$(".page-spinner-bar").addClass("hide");
            if (success.data.data != null)
            {
                $scope.LogList = $scope.LogList.concat(success.data.data.status);
                $scope.LogList = $filter('orderBy')($scope.LogList, 'updatedDate');
                // $scope.logs = [{ "date": "novenber-18", "noteDetails": $scope.LogList }];
                // console.log($scope.logs);
                // $scope.logs = [{
                //     "date": "November-19", "noteDetails": [{ "actionTaken": "Aniruddh Kumar changed the status of the claim to Created.", "updatedDate": "Friday, Jan 15, 2021 17:55 PM", "updatedBy": { "name": "Aniruddh Kumar" } }, { "actionTaken": "Aniruddh Kumar changed the status of the claim to Created.", "updatedDate": "Friday, Jan 15, 2021 17:55 PM", "updatedBy": { "name": "Aniruddh Kumar" } }]
                // }, {
                //     "date": "November-18", "noteDetails": [{ "actionTaken": "Aniruddh Kumar changed the status of the claim to Created.", "updatedDate": "Friday, Jan 15, 2021 17:55 PM", "updatedBy": { "name": "Aniruddh Kumar" } }, { "actionTaken": "Aniruddh Kumar changed the status of the claim to Created.", "updatedDate": "Friday, Jan 16, 2021 17:55 PM", "updatedBy": { "name": "Aniruddh Kumar" } }]
                // }];

                //$scope.ClaimLog = true;
                $scope.logs= success.data.data;
                $(".page-spinner-bar").addClass("hide");
            }
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.error((angular.isDefined(error.data) && angular.isDefined(error.data.errorMessage) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage()), "Error");

        });

    };

    $scope.getClaimItemsLog = getClaimItemsLog;
    function getClaimItemsLog(){
         //Get Item Log Details
         $(".page-spinner-bar").removeClass("hide");
         var param = { "claimId":$scope.role =='POLICYHOLDER'?sessionStorage.getItem("PolicyHolderClaimId"): sessionStorage.getItem("ClaimId") };
         var getLogDetailsDetails = ActivityLogService.GetClaimItemsLog(param);
         getLogDetailsDetails.then(function (success) {
             $(".page-spinner-bar").addClass("hide");
             if (success.data.data != null) {
                 $scope.LogList =  $scope.LogList.concat(success.data.data.status);
                 $scope.LogList = $filter('orderBy')($scope.LogList, 'updatedDate');
                 //$scope.ClaimLog = false;
             }             
         }, function (error) {
             $(".page-spinner-bar").addClass("hide");
             toastr.remove();
             toastr.error((angular.isDefined(error.data) && angular.isDefined(error.data.errorMessage) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage()), "Error");
         });
    };

    $scope.getItemLog = getItemLog;
    function getItemLog() {
        //Get Item Log Details
        $(".page-spinner-bar").removeClass("hide");
        var param = { "itemId": sessionStorage.getItem("AdjusterPostLostItemId") }
        var getLogDetailsDetails = ActivityLogService.GetItemLog(param);
        getLogDetailsDetails.then(function (success) {
            $(".page-spinner-bar").addClass("hide");
            if (success.data.data != null) {
                $scope.LogList =  $scope.LogList.concat(success.data.data.status);
                $scope.LogList = $filter('orderBy')($scope.LogList, 'updatedDate');
                $scope.ClaimLog = false;
                $scope.logs = success.data.data.status;
                $scope.logs.map((x)=>x.createdDate = $filter("fullDate")(x.updatedDate));
                console.log($scope.logs);
            }
            
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.error((angular.isDefined(error.data) && angular.isDefined(error.data.errorMessage) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage()), "Error")
        });

    };

    $scope.exportLogPdf = exportLogPdf;
    function exportLogPdf(){
        var param = { "claimId":  $scope.role =='POLICYHOLDER'?sessionStorage.getItem("PolicyHolderClaimId"):sessionStorage.getItem("ClaimId") };
       var claimLogPdfBytes = ActivityLogService.getClaimLogPdf(param);
       claimLogPdfBytes.then(function(response) {
              var blob = response.data;
              startBlobDownload(blob, "ActivityLog.pdf");
            });
           function startBlobDownload(dataBlob, suggestedFileName) {
              if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                 // for IE
                 window.navigator.msSaveOrOpenBlob(dataBlob, suggestedFileName);
              } else {
                 // for Non-IE (chrome, firefox etc.)
                 var urlObject = URL.createObjectURL(dataBlob);
           
                 var downloadLink = angular.element('<a>Download</a>');
                 downloadLink.css('display','none');
                 downloadLink.attr('href', urlObject);
                 downloadLink.attr('download', suggestedFileName);
                 angular.element(document.body).append(downloadLink);
                 downloadLink[0].click();
           
                 // cleanup
                 downloadLink.remove();
                 URL.revokeObjectURL(urlObject);
             }
           }
    }

    // $scope.getActivityEvents = getActivityEvents;
    // function getActivityEvents(){
    //     var getActivityEvents = ActivityLogService.getActivityEvents();
    //     getActivityEvents.then(function (success) {
    //         $scope.ActivityEvents = success.data.data;

    //     },function (error) {
    //         $(".page-spinner-bar").addClass("hide");
    //         toastr.remove();
    //         toastr.error((angular.isDefined(error.data) && angular.isDefined(error.data.errorMessage) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage()), "Error");

    //     });
    // };

    //Add Custom Activity popup
  $scope.AddCustomActivityPopup = AddCustomActivityPopup;
  function AddCustomActivityPopup(ev) { 
      var obj = {
          "ClaimId": $scope.CommonObj.ClaimId,
          "ParticipantList": $scope.ClaimParticipantsList,
        //   "ActivityEventsList": $scope.ActivityEvents,
      };
      $scope.animationsEnabled = true;
      var out = $uibModal.open(
          {
              size: "md",
              animation: $scope.animationsEnabled,
              templateUrl: "views/ActivityLog/AddCustomActivityLogPopup.html",
              controller: "AddCustomActivityLogController",
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
          //$scope.ItemDetails.CustomItemType = "";
          //Call Back Function success
          if (value === "Success") {   
                init();    
                toastr.remove();
                toastr.success("The custom activity was published successfully", "Confirmation"); 
          }

      }, function (res) {
          //Call Back Function close

      });

      return {
          open: open
      };
  }

$scope.newImageIndex = null;
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
    if ($scope.DocxDetails.isLocal) {
        $scope.showDownload = false;
        $scope.DocxDetails.url = item.Image;
    } else {
        $scope.showDelete = false;
    }
    $scope.ReceiptList = $scope.DocxDetails.url;
    $scope.pdfUrl = $scope.ReceiptList;
    var pdf = ["pdf", "application/pdf"];
    var img = ["image", "application/image", "image/png", "image/jpeg", "image/gif", "png", "jpg", "jpeg", "gif", "image", "PNG", "JPEG", "GIF", "JPG"];
    $scope.imgDiv = true;
    if (pdf.indexOf(($scope.DocxDetails.claimFileType.toLowerCase())) > -1) {
        $scope.isPDF = 1;
    }
    else if (img.indexOf(($scope.DocxDetails.claimFileType.toLowerCase())) > -1) {
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
        $("#img_preview")
            .css({
                'right': $('.page-wrapper-middle').offset().left + 'px'
            })
            .show();
        // $("#img_preview").show();
    }, 100);
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
    if (/\.(pdf)$/i.test(fileName.toLowerCase())) {
        return true;
    }
}
$scope.isImage = function (fileName) {
    if (/\.(jpe?g|png|gif|bmp)$/i.test(fileName.toLowerCase())) {
        return true;
    }
}
$scope.isExcel = function (fileName) {
    if (/\.(xls|xlsx)$/i.test(fileName.toLowerCase())) {
        return true;
    }
}
$scope.isDocx = function (fileName) {
    if (/\.(docx|doc)$/i.test(fileName.toLowerCase())) {
        return true;
    }
}
$scope.isVideo = function (fileName) {
    if (/\.(mp4|flv|ogg|3gp|webm)$/i.test(fileName.toLowerCase())) {
        return true;
    }
}

$scope.toggleAction = toggleAction
function toggleAction(params){
    $scope.toggle[params] = !$scope.toggle[params];
}

$scope.scrollToTop=scrollToTop;
function scrollToTop(){
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
   
});