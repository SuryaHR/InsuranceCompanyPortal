angular.module('MetronicApp').controller('AddCustomItemPopupController', function ($translate, $translatePartialLoader,utilityMethods, $rootScope, $scope, LineItemService, objClaim) {

    $translatePartialLoader.addPart('AddCustomItem');
    $translate.refresh();
    $scope.NoImagePath = $rootScope.$settings.NoImagePath;
    $scope.editCustomItem = false;

    $scope.CommonObj = {
        "ClaimId": objClaim.ClaimId,
        "itemUID": angular.isDefined(objClaim.itemUID) ? objClaim.itemUID : null,
        "CustomItemType": objClaim.CustomItemType,
        "applyTax" : objClaim.applyTax,
        "taxRate" : objClaim.TaxRate,
        "quantity" : objClaim.quantity
    };

    $scope.cancel = function () {
        $scope.$close();
    };
   
    $scope.Base64Image=""
    $scope.addCustomItem = addCustomItem;
    function addCustomItem(isReplacement) {
        $(".page-spinner-bar").removeClass("hide");
        
        var realData;
        // var form = document.getElementById("AddItem");

        // var image = document.getElementById("customImage").src;
        // var block = image.split(";");      
        // var contentType = block[0].split(":")[1];// In this case "image/gif"     
        // var realData = block[1].split(",")[1];// In this case "R0lGODlhPQBEAPeoAJosM...."  
        // $scope.Base64Image = block[1].split(",")[1];// In this case "R0lGODlhPQBEAPeoAJosM...."
         var param = new FormData();        
        //Request to add quick custom item
        param.append("customItem", JSON.stringify({
            "id": null,
            "customItemFlag": true,
            "description": $scope.ItemDetails.ItemDescription && $scope.ItemDetails.ItemDescription!="" ? encodeURIComponent($scope.ItemDetails.ItemDescription):"",
            "itemStatus": "Comparable",
            "replacementCost": $scope.ItemDetails.unitPrice,
            "supplierName": $scope.ItemDetails.supplier,
            "supplier": $scope.ItemDetails.supplier,
            "quantity": $scope.ItemDetails.ItemQuantity,
            "supplierWebsite": $scope.ItemDetails.SupplierWebsite,
            "registrationNumber": sessionStorage.getItem("CompanyCRN"),
            "sku": null,
            "claim": {
                "claimId": $scope.CommonObj.ClaimId
            },
            "item": {
                "itemUID": $scope.CommonObj.itemUID
            },
            "customItemType": {
                id: $scope.CommonObj.CustomItemType,
            },
            "customSubItem": null,
            // "base64images": [realData],
            "isReplacementItem":isReplacement,
        }));

        if ($scope.attachmentList && $scope.attachmentList.File) {
            var fileDetaills = [{
                "extension": $scope.attachmentList.FileExtension,
                "fileName": $scope.attachmentList.FileName,
                "filePurpose": "CUSTOM_ITEM",
                "fileType": $scope.attachmentList.FileType
            }];
            param.append('filesDetails', JSON.stringify(fileDetaills));
            param.append('file', $scope.attachmentList.File);
        } else {
            param.append('filesDetails', []);
            param.append('file', []);
        }
      
       
        //Add/Update quick addcustom item
        var getItemDetailsOnId = LineItemService.AddCustomItem(param);
        getItemDetailsOnId.then(function (success) {
            $(".page-spinner-bar").addClass("hide");
            $scope.$close("Success");
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
            //$scope.GetCustomItems();
            //$scope.CustomItem = {};
            //$scope.NewCustomItem = false;
            
            }, function (error) {
                $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
           // $scope.$close("Success");
        });

    };

     //File Upload for attachment
     $scope.AddAttachment = function () {
        angular.element('#FileUpload').trigger('click');
    }
    $scope.displayAddImageButton = false;
    $scope.getAttachmentDetails = function (e) {
        $scope.displayAddImageButton = true;
        $scope.$apply(function () {
            var files = event.target.files;
            $scope.filed = event.target.files;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var fileExtension = file.name.substr(file.name.lastIndexOf('.'));
                var size = file.size;
                if(['.jpeg','.png','.svg','.webp','.zip','.jpg'].includes(fileExtension))
                {              
                    if(size <= 20000000)
                    {
                        var reader = new FileReader();
                        reader.file = file;
                        reader.fileName = files[i].name;
                        reader.fileType = files[i].type;
                        reader.fileExtension = files[i].name.substr(files[i].name.lastIndexOf('.'));
                        reader.onload = $scope.LoadFileInList;
                        reader.readAsDataURL(file);
            
                        angular.element("#FileUpload").val(null);

                    }
                    else
                    {
                        toastr.remove()
                        toastr.error("file size exceeded . Please upload image below 20Mb", $translate.instant("ErrorHeading")); 
                    }
                }
                else
                {
                    toastr.remove()
                    toastr.error("Only image with jpeg,jpg,svg,png,webp and zip format is supported", $translate.instant("ErrorHeading")); 
                }
            }
        });
        //$scope.itemForm.contents.$setDirty();
    };
     //Item form object
     $scope.itemForm = {};
    $scope.attachmentList = undefined;
    $scope.LoadFileInList = function (e) {
        var isFileExist = false;
        angular.forEach($scope.attachmentList, function (file) {
            if (e.target.fileName === file.FileName)
                isFileExist = true
        });
        // angular.forEach($scope.attachmentListEdit, function (file) {
        //     if (e.target.fileName === file.FileName)
        //         isFileExist = true
        // });
        if (isFileExist) {
            toastr.remove();
            toastr.warning("Attachment with name '" + e.target.fileName + "' already exists");
        }
        else {
            $scope.$apply(function () {
                $scope.attachmentList=
                    {
                        "FileName": e.target.fileName, "FileExtension": e.target.fileExtension, "FileType": e.target.fileType,
                        "Image": e.target.result, "File": e.target.file, "isLocal": true
                }
                $scope.attachmentListEdit = {}
                $scope.CreateCustomItem.$pristine = false;
            });
        }
    }
    $scope.isPdf = function (fileName) {
        if (/\.(pdf|PDF)$/i.test(fileName)) {
            return true;
        }
    }

    $scope.isExcel = function (fileName) {
        if (/\.(xls|xlsx)$/i.test(fileName)) {
            return true;
        }
    }

    $scope.isImage = function (fileName) {
        if (/\.(jpe?g|png|gif|bmp)$/i.test(fileName)) {
            return true;
        }
    }


    //Attachments preview
    $scope.GetDocxDetails = function (item) {
        $scope.showDownload = true;
        $scope.showDelete = true;
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
        // else
        //     $scope.showDelete = true;
        $scope.ReceiptList = $scope.DocxDetails.url;
        $scope.pdfUrl = $scope.ReceiptList;
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
            $("#img_preview").css({
                'right': $('.page-wrapper-middle').offset().left + 'px'
            }).show();
            // $("#img_preview").show();
        }, 100);

    }

    $scope.close = function () {
        $("#img_preview").hide();
    }

    // Remove attachment
    $scope.removeAttachments = removeAttachments;
    function removeAttachments() {
        var removeAttachmentDetails = ThirdPartyLineItemDetailsService.removeAttachments($scope.attachmentsRmvd);
        removeAttachmentDetails.then(function (success) {
            toastr.remove()
            toastr.success(success.data.message, $translate.instant("ItemEditSuccessHeading"));
            getAttachment();
            $scope.cancelAttachment();

        }, function (error) {
            toastr.remove()
            toastr.error(error.data.errorMessage, $translate.instant("ErrorHeading"));
        });
    }

    $scope.getAttachment = getAttachment;
    function getAttachment(attachments) {
        $scope.attachmentListEdit = [];
        angular.forEach(attachments, function (ItemFile) {
            $scope.attachmentListEdit.push(
                {
                    "id": ItemFile.id, "FileName": ItemFile.name, "FileType": ItemFile.type, "url": ItemFile.url,
                    "uploadDate": ItemFile.uploadDate
                });
        });
    }

    $scope.RemoveAttachment = RemoveAttachment;
    function RemoveAttachment(index) {
        if ($scope.attachmentList.length > 0) {
            $scope.attachmentList.splice(index, 1);
            angular.element("#FileUpload").val(null);
        }
        $scope.imgDiv = false;
    }

    $scope.attachmentsRmvd = [];
    $scope.RemoveEditAttachment = RemoveEditAttachment;
    function RemoveEditAttachment(index) {
        $scope.attachmentList = {}
    }
    $scope.RemoveEditImage = RemoveEditImage;
    function RemoveEditImage() {
        $scope.attachmentListEdit = []
    }

    

    $scope.update = function (isReplacement) {
        var param = new FormData();        
        param.append("customItem", JSON.stringify({
            "id": $scope.ItemDetails.id,
            "customItemFlag": true,
            "description": $scope.ItemDetails.ItemDescription && $scope.ItemDetails.ItemDescription!="" ? encodeURIComponent($scope.ItemDetails.ItemDescription):"",
            "itemStatus": "Comparable",
            "replacementCost": $scope.ItemDetails.unitPrice,
            "quantity": $scope.ItemDetails.ItemQuantity,
            "supplierName": $scope.ItemDetails.supplier,
            "supplier": $scope.ItemDetails.supplier,
            "supplierWebsite": $scope.ItemDetails.SupplierWebsite,
            "registrationNumber": sessionStorage.getItem("CompanyCRN"),
            "sku": null,
            "claim": {
                "claimId": $scope.CommonObj.ClaimId
            },
            "item": {
                "itemUID": $scope.CommonObj.itemUID
            },
            "customItemType": {
                id: $scope.CommonObj.CustomItemType,
            },
            "customSubItem": null,
            // "base64images": [realData],
            "isReplacementItem":isReplacement,
        }));

        if ($scope.attachmentList && $scope.attachmentList.File) {
            var fileDetaills = [{
                "extension": $scope.attachmentList.FileExtension,
                "fileName": $scope.attachmentList.FileName,
                "filePurpose": "CUSTOM_ITEM",
                "fileType": $scope.attachmentList.FileType
            }];
            param.append('filesDetails', JSON.stringify(fileDetaills));
            param.append('file', $scope.attachmentList.File);
        } else {
            param.append('filesDetails', []);
            param.append('file', []);
        }
      
       if($scope.attachmentListEdit && $scope.updateWithRemove){
       
        LineItemService.deleteMediaFile($scope.ItemDetails.id);
       }
        //Add/Update quick addcustom item
        var getItemDetailsOnId = LineItemService.updateCustomItem(param);
        getItemDetailsOnId.then(function (success) {
            $scope.$close("Success");
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
            //$scope.GetCustomItems();
            //$scope.CustomItem = {};
            //$scope.NewCustomItem = false;
            
            }, function (error) {
               
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
           // $scope.$close("Success");
        });

    }

    $scope.deleteItemAttachment = deleteItemAttachment;
    function deleteItemAttachment() {
                    $scope.attachmentListEdit = [];
                    $scope.updateWithRemove = true;
                    $scope.CreateCustomItem.$pristine = false;
    }

    $scope.CalculateRCV = CalculateRCV;
    function CalculateRCV(){
        $scope.ItemDetails.ItemQuantity = !!$scope.ItemDetails.ItemQuantity?$scope.ItemDetails.ItemQuantity:1;
        var rcv =  utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.unitPrice *$scope.ItemDetails.ItemQuantity);
        var taxRate = 0;
        if($scope.CommonObj.applyTax)
          taxRate = $scope.CommonObj.taxRate;  
        
        var taxAmt = utilityMethods.parseFloatWithFixedDecimal(rcv* taxRate/100);
        var rcvTotal = rcv +taxAmt;
        $scope.ItemDetails.ItemPrice = utilityMethods.parseFloatWithFixedDecimal(rcvTotal);
        $scope.ItemDetails.taxAmount = taxAmt;
    }

    function init() {
        $scope.ItemDetails ={
        "taxRate" : $scope.CommonObj.taxRate,
        "ItemQuantity" : $scope.CommonObj.quantity
        }
        if (objClaim && objClaim.CustomItem) {
            $scope.updateWithRemove = false;
            $scope.editCustomItem = true;
            $scope.ItemDetails = {}
            $scope.ItemDetails.ItemDescription = objClaim.CustomItem.description;
            $scope.ItemDetails.id = objClaim.CustomItem.id;
            $scope.ItemDetails.taxRate = $scope.CommonObj.taxRate;
            // $scope.ItemDetails.ItemPrice = objClaim.CustomItem.price;
            $scope.ItemDetails.ItemQuantity = objClaim.CustomItem.quantity;
            $scope.ItemDetails.unitPrice =objClaim.CustomItem.price;
            CalculateRCV();debugger;
            $scope.ItemDetails.supplier = objClaim.CustomItem?.supplier;
            $scope.ItemDetails.SupplierWebsite = objClaim.CustomItem?.buyURL;
            $scope.attachmentListEdit = []
            $scope.attachmentListEdit.push(objClaim.CustomItem?.imageURL);
        }
    } init();
});