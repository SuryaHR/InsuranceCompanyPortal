angular.module('MetronicApp').controller('submitNewClaimController', function ($rootScope, settings, $scope, $http,  $location, $translatePartialLoader, $state, $translate,utilityMethods, submitNewClaimService ) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('Login');
    $translatePartialLoader.addPart('NewClaim');
    $translatePartialLoader.addPart('UploadItemsFromCSV');
    $scope.items = [];
    $translate.refresh();
    $scope.LoginPage = LoginPage;
    $scope.errormsg = false;
    $scope.ContentList = [];
    $scope.TemplateURL = angular.isDefined(sessionStorage.getItem("ItemTemplate")) && sessionStorage.getItem("ItemTemplate") != null ? sessionStorage.getItem("ItemTemplate") : null;
    
    init()
    function init() {
        $scope.errormsg = false;
        $scope.successPageJewelry = false;
        $scope.successPageContents = false;
    }

    function LoginPage(event) {
        if (angular.isDefined(sessionStorage.getItem("IsVendorLogIn")) && (sessionStorage.getItem("IsVendorLogIn") === "True")) {
            sessionStorage.setItem("IsVendorLogIn", undefined);
            $location.path('/VendorLogin');
        }
        else {
            sessionStorage.setItem("IsVendorLogIn", undefined);
            $location.path('/');
        }
    }
    
    $scope.AddAttachment = function () {
        angular.element('#FileUpload').trigger('click');
    }

    $scope.AddContentList = function () {
        angular.element('#FileUploadexcel').trigger('click');
    }

    $scope.removeItemattachment = removeItemattachment;
    function removeItemattachment(list, index) {
        list.splice(index, 1);
    };
    

    $scope.removeItemContentList = removeItemContentList;
    function removeItemContentList(list, index) {
        list.splice(index, 1);
    };

    $scope.attachmentList = [];
    $scope.getAttachmentDetails = function (event) {
        $scope.$apply(function () {
            var files = event.target.files;
            $scope.filed = event.target.files;
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
                reader.onload = $scope.LoadFileInList;
                reader.readAsDataURL(file);
            }
            angular.element("#FileUpload").val(null);
        });
    };

    var randomId = Math.floor((Math.random() * 100) + 1);
    $scope.LoadFileInList = function (e) {
        var isFileExist = false;
        angular.forEach($scope.attachmentList, function (file) {
            if (e.target.fileName === file.FileName)
                isFileExist = true
        });
        if (isFileExist) {
            toastr.remove();
            toastr.warning("Attachment with name '" + e.target.fileName + "' already exists");
        }
        else {
            $scope.$apply(function () {
                $scope.attachmentList.push(
                    {
                        "FileName": e.target.fileName, "FileExtension": e.target.fileExtension, "FileType": e.target.fileType,
                        "Image": e.target.result, "File": e.target.file, "isLocal": true,
                        "imageId": "LOC_" + randomId++
                    })
            });
        }
    }


    
    $scope.getContentListDetails = function (event) {
        $scope.$apply(function () {
            var files = event.target.files;
            $scope.filed = event.target.files;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var reader = new FileReader();
                reader.file = file;
                reader.fileName = files[i].name;
                reader.fileType = files[i].type;
                reader.fileExtension = files[i].name.substr(files[i].name.lastIndexOf('.'));
                reader.onload = $scope.LoadContentFileInList;
                reader.readAsDataURL(file);
            }
            angular.element("#FileUploadexcel").val(null);
        });
    };

    var contRandomId = Math.floor((Math.random() * 100) + 1);
    $scope.LoadContentFileInList = function (e) {
        var isFileExist = false;
        angular.forEach($scope.ContentList, function (file) {
            if (e.target.fileName === file.FileName)
                isFileExist = true
        });
        if (isFileExist) {
            toastr.remove();
            toastr.warning("Attachment with name '" + e.target.fileName + "' already exists");
        }
        else {
            $scope.$apply(function () {
                $scope.ContentList.push(
                    {
                        "FileName": e.target.fileName, "FileExtension": e.target.fileExtension, "FileType": e.target.fileType,
                        "Image": e.target.result, "File": e.target.file, "isLocal": true,
                        "imageId": "LOC_" + contRandomId++
                    })
            });
        }
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
        }
        var pdf = ["pdf", "application/pdf"];
        var img = ["image", "application/image", "image/png", "image/jpeg", "image/gif", "png", "jpg", "jpeg", "gif", "image", "PNG", "JPEG", "GIF", "JPG"];
        $scope.imgDiv = true;
        if (pdf.indexOf(($scope.DocxDetails.FileType.toLowerCase())) > -1) {
            $scope.isPDF = 1;
        }
        else if (img.indexOf(($scope.DocxDetails.FileType.toLowerCase())) > -1) {
            $scope.isPDF = 2;
        }
        else {
            $scope.isPDF = 0;
            var downloadLink = angular.element('<a></a>');
            downloadLink.attr('href', $scope.DocxDetails.url);
            downloadLink.attr('target', '_self');
            downloadLink.attr('download', (($scope.DocxDetails.FileName != null && angular.isDefined($scope.DocxDetails.FileName) && $scope.DocxDetails.FileName !== "") ? $scope.DocxDetails.FileName : "Document"));
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

    $scope.CheckAllFormValidationJewelry = CheckAllFormValidationJewelry;
        function CheckAllFormValidationJewelry(formName) {
            
                if ($scope.JewelryClaimForm.$invalid || $scope.JewelryClaimForm.$pristine) {
                    utilityMethods.validateForm($scope.JewelryClaimForm);
                }
                else {
                    $scope.JewelryClaimForm.$setPristine(true);
                    $scope.JewelryClaimForm.$setUntouched(true);
                    $scope.submitNewClaimJewelry()
                }
            $(document).ready(function () {
                $(this).scrollTop(0);
            });
        };

        $scope.CheckAllFormValidationContent = CheckAllFormValidationContent;
        function CheckAllFormValidationContent(formName) {
            
                if ($scope.ContentClaimForm.$invalid || $scope.ContentClaimForm.$pristine) {
                    utilityMethods.validateForm($scope.ContentClaimForm);
                }
                else {
                    $scope.ContentClaimForm.$setPristine(true);
                    $scope.ContentClaimForm.$setUntouched(true);
                    $scope.submitNewClaimContents()
                }
            $(document).ready(function () {
                $(this).scrollTop(0);
            });
        };

    $scope.submitNewClaimJewelry = submitNewClaimJewelry;
    function submitNewClaimJewelry() {
        $(".page-spinner-bar").removeClass("hide"); 
        if(document.getElementById('itemslist1').value != null){
            $scope.items.push(document.getElementById('itemslist1').value);
        }
        if(document.getElementById('itemslist2').value != null){
            $scope.items.push(document.getElementById('itemslist2').value);
        }
        if(document.getElementById('itemslist3').value != null){
            $scope.items.push(document.getElementById('itemslist3').value);
        }
        if(document.getElementById('itemslist4').value != null){
            $scope.items.push(document.getElementById('itemslist4').value);
        }
        if(document.getElementById('itemslist5').value != null){
            $scope.items.push(document.getElementById('itemslist5').value);
        }

        var param = new FormData();
        $scope.filesDetails = [];
        $scope.contentfilesDetails = [];
        param.append("details",
            JSON.stringify(
                {
            "adjusterFname" : document.getElementById("adjusterfname").value, "adjusterLname" : document.getElementById("adjusterlname").value, "adjusterEmail" : document.getElementById("adjusteremail").value,
            "adjusterPnumber" : document.getElementById("adjusterphone").value, "agencyName" : document.getElementById("agencyname").value, "claimNumber" : document.getElementById("claimreference").value,
            "claimDtae" : document.getElementById("claimdate").value, "policyholderFname": document.getElementById("policyholderfname").value, "policyholderLname": document.getElementById("policyholderlname").value,
            "state":document.getElementById("statelist").value,"zipCode":document.getElementById("zipcode").value, "policyLimits":document.getElementById("policylimits").value, "individualLimit":document.getElementById("idividuallimits").value,
            "noteForArtigem":document.getElementById("note").value, "itemsList":$scope.items, "claimProfile":"Jewelry", "serviceRequired":document.getElementById("servicerequired").value
        }
        ));


        angular.forEach($scope.ContentList, function (ItemFileCont) {
            $scope.contentfilesDetails.push({
                "fileName": ItemFileCont.FileName, "fileType": ItemFileCont.FileType, "extension": ItemFileCont.FileExtension, "filePurpose": "ITEM", "latitude": null, "longitude": null, "footNote": null
            });
            param.append('contentfile', ItemFileCont.File);

        });
        param.append('contentfilesDetails', JSON.stringify($scope.contentfilesDetails));
        if ($scope.ContentList.length == 0 || $scope.ContentList == null) {
            param.append('contentfilesDetails', null);
            param.append('contentfile', null);
        };
        angular.forEach($scope.attachmentList, function (ItemFile) {
            $scope.filesDetails.push({
                "fileName": ItemFile.FileName, "fileType": ItemFile.FileType, "extension": ItemFile.FileExtension, "filePurpose": "ITEM", "latitude": null, "longitude": null, "footNote": null
            });
            param.append('file', ItemFile.File);

        });
        param.append('filesDetails', JSON.stringify($scope.filesDetails));
        if ($scope.attachmentList.length == 0 || $scope.attachmentList == null) {
            param.append('filesDetails', null);
            param.append('file', null);
        };

        var response = submitNewClaimService.submitnewclaim(param);
        response.then(function (success) {
            $(".page-spinner-bar").addClass("hide");
            // toastr.remove();
            // toastr.success("claim details submitted successfully");
            $scope.successPageJewelry = true;
            $scope.errormsg = false;

            document.getElementById("JewelryClaimForm").reset();
            $scope.ContentList = [];
            $scope.attachmentList = [];
            document.getElementById("statelist").reset();
        },
            function (error) {
                $(".page-spinner-bar").addClass("hide");
                $scope.errormsg = true;
                toastr.error("error");
            });
    }
    

    $scope.submitNewClaimContents = submitNewClaimContents;
    function submitNewClaimContents() {   
        $(".page-spinner-bar").removeClass("hide");     
        var param = new FormData();
        $scope.filesDetails = [];
        $scope.contentfilesDetails = [];
        param.append("details",
            JSON.stringify(
                {
                "adjusterFname":document.getElementById("adjusterfname").value,
                 "adjusterLname" : document.getElementById("adjusterlname").value, "adjusterEmail" : document.getElementById("adjusteremail").value,
            "adjusterPnumber" : document.getElementById("adjusterphone").value, "agencyName" : document.getElementById("agencyname").value, "claimNumber" : document.getElementById("claimreference").value,
            "claimDtae" : document.getElementById("claimdate").value, "policyholderFname": document.getElementById("policyholderfname").value, "policyholderLname": document.getElementById("policyholderlname").value,
            "state":document.getElementById("statelist").value,"zipCode":document.getElementById("zipcode").value, "policyLimits":document.getElementById("policylimits").value, "specialLimits":document.getElementById("speciallimits").value,
            "minItemPrice":document.getElementById("minitemprice").value, "summaryformate":document.querySelector('input[name="exportMethod"]:checked').value ,"noteForArtigem":document.getElementById("note").value,
            "claimProfile":"Contents"
                }
        ));

        angular.forEach($scope.ContentList, function (ItemFileCont) {
            $scope.contentfilesDetails.push({
                "fileName": ItemFileCont.FileName, "fileType": ItemFileCont.FileType, "extension": ItemFileCont.FileExtension, "filePurpose": "ITEM", "latitude": null, "longitude": null, "footNote": null
            });
            param.append('contentfile', ItemFileCont.File);

        });
        param.append('contentfilesDetails', JSON.stringify($scope.contentfilesDetails));
        if ($scope.ContentList.length == 0 || $scope.ContentList == null) {
            param.append('contentfilesDetails', null);
            param.append('contentfile', null);
        };
        angular.forEach($scope.attachmentList, function (ItemFile) {
            $scope.filesDetails.push({
                "fileName": ItemFile.FileName, "fileType": ItemFile.FileType, "extension": ItemFile.FileExtension, "filePurpose": "ITEM", "latitude": null, "longitude": null, "footNote": null
            });
            param.append('file', ItemFile.File);

        });
        param.append('filesDetails', JSON.stringify($scope.filesDetails));
        if ($scope.attachmentList.length == 0 || $scope.attachmentList == null) {
            param.append('filesDetails', null);
            param.append('file', null);
        };
   
        var response = submitNewClaimService.submitnewclaim(param);
        response.then(function (success) {
            $(".page-spinner-bar").addClass("hide");
            // toastr.remove();
            // toastr.success("claim details submitted successfully");
            $scope.successPageContents = true;
            $scope.errormsg = false;

            document.getElementById("ContentClaimForm").reset();
            $scope.ContentList = [];
            $scope.attachmentList = [];
            document.getElementById("statelist").reset();
        },
            function (error) {
                $(".page-spinner-bar").addClass("hide");
                $scope.errormsg = true;
                toastr.error("error");
            });
    }

    $scope.goBackToJewelryClaimSubmit = goBackToJewelryClaimSubmit;
    function goBackToJewelryClaimSubmit() {
        $scope.successPageJewelry = false;
    }

    $scope.goBackToContentClaimSubmit = goBackToContentClaimSubmit;
    function goBackToContentClaimSubmit() {
        $scope.successPageContents = false;
    }
});