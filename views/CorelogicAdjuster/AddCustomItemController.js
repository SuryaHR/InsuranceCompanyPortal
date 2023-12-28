angular
    .module("MetronicApp")
    .controller("AddCustomItemController", function (
        $translate,
        $translatePartialLoader,
        $rootScope,
        $log,
        $scope,
        $window,
        settings,
        $http,
        $timeout,
        $uibModal,
        $location,
        $filter,
        AdjusterLineItemDetailsService
    ) {
        $translatePartialLoader.addPart("AddCustomItem");
        $translate.refresh();

        $scope.CustomItem = {};
        $scope.CustomItemList = [];
        $scope.CustomSubItem = [];
        $scope.CustomSubItemTotalCost = 0.0;
        $scope.NewCustomItem = false;
        $scope.IncidentImages = [];
        $scope.attachmentListEdit = [];
        $scope.attachmentList = [];
        function init() {
            $scope.CommonObj = {
                ItemId: sessionStorage.getItem("ItemId"),
                ItemNumber: sessionStorage.getItem("ItemNumber"),
                ItemUID: sessionStorage.getItem("ItemUId"),
                ClaimNo: sessionStorage.getItem("ClaimNo"),
                ClaimId: sessionStorage.getItem("ClaimId"),
                PolicyHolder: sessionStorage.getItem("Policyholder"),
                Page: sessionStorage.getItem("Page"),
                ReplacementDesc: sessionStorage.getItem("ReplacementDesc"),
                ReplacementCost: sessionStorage.getItem("ReplacementCost")
            };

            var GetGlobaldata = $http.get("Config/Configuration.json");
            GetGlobaldata.then(function (success) {
                ConfigSettings = success.data.data;
                $scope.serverAddress = ConfigSettings.serverAddress;
            });
            $scope.CustomItem.description = $scope.CommonObj.ReplacementDesc;
            $scope.CustomItem.replacementCost = $scope.CommonObj.ReplacementCost;

            var param = {
                itemId: $scope.CommonObj.ItemId
            };

            var getItemDetailsOnId = AdjusterLineItemDetailsService.gteItemDetails(
                param
            );
            getItemDetailsOnId.then(
                function (success) {
                    $scope.ItemDetails = success.data.data;
                    $scope.CommonObj.ItemUID = $scope.ItemDetails.itemUID;
                    sessionStorage.setItem("ItemUId", $scope.ItemDetails.itemUID);
                },
                function (error) {
                    toastr.remove();
                    toastr.error(error.data.errorMessage, "Error");
                }
            );

            GetCustomItems();
        }
        init();

        $scope.GetCustomItems = GetCustomItems;
        function GetCustomItems() {
            var param = {
                lineItem: {
                    itemId: $scope.CommonObj.ItemId
                },
                claim: {
                    claimId: $scope.CommonObj.ClaimId
                }
            };

            var getCustomId = AdjusterLineItemDetailsService.GetCustomItemsList(
                param
            );
            getCustomId.then(
                function (success) {
                    $scope.CustomItemList = success.data.data;
                },
                function (error) {
                    toastr.remove();
                    toastr.error(error.data.errorMessage, "Error");
                }
            );
        }

        $scope.goToDashboard = function () {
            $location.url(sessionStorage.getItem("HomeScreen"));
        };

        $scope.goBack = goBack;
        function goBack(e) {
            if ($scope.CommonObj.Page == "AdjusterLineItemDetails") {
                $location.url("AdjusterPropertyClaimDetails");
            } 
            else {
                $location.url("SupervisorClaimDetails");
            }
            
        }
        /*$scope.NewItem = NewItem;
        function NewItem() {
            $scope.CustomSubItemTotalCost = 0;
            $scope.NewCustomItem = true;
        }*/

       /* $scope.NewItemPopup = NewItemPopup;
        function NewItemPopup(ev) {
            if(!$scope.CustomSubItem)
            $scope.CustomSubItem = [];
            $scope.animationsEnabled = true;
            var out = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "views/Adjuster/AddNewCustomItem.html",
                controller: "AddNewCustomItemController",
                backdrop: "static",
                keyboard: false,
                resolve: {
                    objClaim: function () {
                        return "";
                    }
                }
            });
            out.result.then(
                function (value) {
                    //Call Back Function success
                    if (angular.isDefined(value) && value != null) {
                        $scope.CustomSubItem.push(value);
                        $scope.CustomSubItemTotalCost = 0;
                        angular.forEach($scope.CustomSubItem, function (item) {
                            $scope.CustomSubItemTotalCost += parseInt(item.totalCost);
                        });
                        $scope.CustomItem.replacementCost = $scope.CustomSubItemTotalCost;
                    }
                },
                function (res) {
                    //Call Back Function close
                }
            );
            return {
                open: open
            };
            //}
        }*/
        //End item popup

        $scope.AddUpdateCustomItem = AddUpdateCustomItem;
        function AddUpdateCustomItem(status) {
            $(".page-spinner-bar").removeClass("hide");
            //EDIT
            if (
                angular.isDefined($scope.CustomItem.id) &&
                $scope.CustomItem.id != null
            ) {
                $scope.CustomItems = [];
                angular.forEach($scope.CustomSubItem, function (subitem) {
                    $scope.CustomItems.push({
                        id:
                            angular.isDefined(subitem.id) && subitem.id != null
                                ? subitem.id
                                : null,
                        description: subitem.description,
                        unitPrice: subitem.unitPrice,
                        quantity: subitem.quantity,
                        taxRate: subitem.taxRate,
                        totalCost: subitem.totalCost
                    });
                });

                var param = new FormData();
                var count = 0;
                var Filedetails = [];
                angular.forEach($scope.CustomSubItem, function (subitem, key) {
                    if (
                        angular.isDefined(subitem.attachment) &&
                        subitem.attachment !== null &&
                        subitem.attachment.length > 0
                    ) {
                        angular.forEach(subitem.attachment, function (attachment) {
                            if (subitem.id == null) {
                                count++;
                                Filedetails.push({
                                    fileName: attachment.name,
                                    fileType: attachment.FileType,
                                    extension: attachment.FileExtension,
                                    filePurpose: "CUSTOM_SUB_ITEM",
                                    customSubItemIndex: key,
                                    isDelete: false
                                });
                                param.append("file", attachment.File);
                            }
                        });
                    }
                });
                if (count > 0) {
                    param.append("filesDetails", JSON.stringify(Filedetails));
                }

               
                if ($scope.attachmentList && $scope.attachmentList.length > 0) {
                    angular.forEach($scope.attachmentList, function (attachment) {
                         count++;
                        
                            Filedetails.push({
                                mediaFileId:attachment.id,
                                fileName: attachment.fileName,
                                fileType: attachment.FileType,
                                extension: attachment.FileExtension,
                                filePurpose: "CUSTOM_ITEM",
                                customSubItemIndex: Filedetails.length + 1,
                                isDelete:attachment.isDelete
                            });

                            if(attachment.File)
                            param.append("file", attachment.File);
                        
                    });
                    param.append("filesDetails", JSON.stringify(Filedetails));
                }
                if (count == 0) {
                    param.append("filesDetails", null);
                    // param.append("file", null);
                }
                param.append(
                    "customItem",
                    JSON.stringify({
                        id: $scope.CustomItem.id,
                        customItemFlag: true,
                        itemStatus: status,
                        replacementCost: $scope.CustomItem.replacementCost,
                        description: $scope.CustomItem.description,
                        claim: {
                            claimId: $scope.CommonObj.ClaimId
                        },
                        item: {
                            itemUID: $scope.CommonObj.ItemUID
                        },
                        supplierName: null,
                        supplierWebsite: $scope.CustomItem.supplierWebsite,
                        totalCost: $scope.CustomSubItemTotalCost,
                        sku: null,
                        registrationNumber: sessionStorage.getItem("CompanyCRN"),
                        customItemType: {
                            id: sessionStorage.getItem("customItemType")
                        },
                        customSubItem: $scope.CustomItems
                    })
                );
            }
            //ADD NEW
            else {
                $scope.CustomItems = [];
                angular.forEach($scope.CustomSubItem, function (subitem) {
                    $scope.CustomItems.push({
                        id: null,
                        description: subitem.description,
                        unitPrice: subitem.unitPrice,
                        quantity: subitem.quantity,
                        taxRate: subitem.taxRate,
                        totalCost: subitem.totalCost
                    });
                });
                var param = new FormData();
                var count = 0;
                var Filedetails = [];
                var files = []
                angular.forEach($scope.CustomSubItem, function (subitem, key) {
                    if (
                        angular.isDefined(subitem.attachment) &&
                        subitem.attachment !== null &&
                        subitem.attachment.length > 0
                    ) {
                        angular.forEach(subitem.attachment, function (attachment) {
                            if (angular.isUndefined(attachment.url)) {
                                count++;
                                Filedetails.push({
                                    fileName: attachment.name,
                                    fileType: attachment.FileType,
                                    extension: attachment.FileExtension,
                                    filePurpose: "CUSTOM_SUB_ITEM",
                                    customSubItemIndex: key
                                });

                                param.append("file", attachment.File);
                            }
                        });
                    }
                });

                if (count > 0) {
                    param.append("filesDetails", JSON.stringify(Filedetails));
                }

                if (!$scope.CustomSubItem || $scope.CustomSubItem.length == 0 || count == 0) {
                    Filedetails = [];
                }

                if ($scope.attachmentList && $scope.attachmentList.length > 0) {
                    angular.forEach($scope.attachmentList, function (attachment) {

                            Filedetails.push({
                                fileName: attachment.FileName,
                                fileType: attachment.FileType,
                                extension: attachment.FileExtension,
                                filePurpose: "CUSTOM_ITEM",
                                customSubItemIndex: Filedetails.length + 1,
                                isDelete:attachment.isDelete
                            });

                            param.append("file", attachment.File);
                        
                    });
                }
                param.append("filesDetails", JSON.stringify(Filedetails));
                param.append(
                    "customItem",
                    JSON.stringify({
                        id: null, // for update
                        customItemFlag: true,
                        itemStatus: status,
                        description: $scope.CustomItem.description,
                        replacementCost:
                            $scope.CustomItem.replacementCost !== null &&
                                angular.isDefined($scope.CustomItem.replacementCost)
                                ? $scope.CustomItem.replacementCost
                                : null,
                        claim: {
                            claimId: $scope.CommonObj.ClaimId
                        },
                        item: {
                            itemUID: $scope.CommonObj.ItemUID
                        },
                        supplierName: null,
                        supplierWebsite: $scope.CustomItem.supplierWebsite,
                        totalCost: $scope.CustomSubItemTotalCost,
                        registrationNumber: sessionStorage.getItem("CompanyCRN"),
                        customItemType: {
                            id: sessionStorage.getItem("customItemType")
                        },
                        sku: null,
                        customSubItem: $scope.CustomItems
                    })
                );
            }

            //Add/Update custom item
            var getItemDetailsOnId = AdjusterLineItemDetailsService.AddCustomItem(
                param
            );
            getItemDetailsOnId.then(
                function (success) {
                    toastr.remove();
                    toastr.success(success.data.message, "Confirmation");
                    $(".page-spinner-bar").addClass("hide");
                    $scope.GetCustomItems();
                    $scope.CustomItem = {};
                    $scope.NewCustomItem = false;
                },
                function (error) {
                    $(".page-spinner-bar").addClass("hide");
                    toastr.remove();
                    toastr.error(error.data.errorMessage, "Error");
                }
            );
        }

        $scope.Draft = Draft;
        function Draft() { }

        $scope.GotoDetails = GotoDetails;
        function GotoDetails(customitem) {
            $scope.CustomItem = angular.copy(customitem);
            $scope.CustomSubItem = angular.copy(customitem.customSubItem);
            $scope.NewCustomItem = true;
            if (customitem.attachments && customitem.attachments.length > 0) {
                $scope.attachmentList = customitem.attachments && customitem.attachments.length > 0 ? customitem.attachments : [];
                angular.forEach($scope.attachmentList, function (item) {
                    item.fileName = item.name;
                    item.Image = item.url;
                    item.FileType = item.purpose
                })
            }
            $scope.CustomSubItemTotalCost = 0;
            angular.forEach($scope.CustomSubItem, function (item) {
                $scope.CustomSubItemTotalCost += parseInt(item.totalCost);
            });
        }

        $scope.Cancel = Cancel;
        function Cancel() {
            $scope.CustomItem.description = "";
            $scope.CustomSubItem = [];
            $scope.NewCustomItem = false;
        }

        $scope.RemoveSubItem = RemoveSubItem;
        function RemoveSubItem(item, index) {
            if (angular.isDefined(item.id) && item.id !== null) {
                $scope.DeleteCustomSubItem(item);
            } else {
                $scope.CustomSubItem.splice(index, 1);
            }
        }

        $scope.DeleteCustomItem = DeleteCustomItem;
        function DeleteCustomItem(item) {
            
            bootbox.confirm({
                size: "",
                title: "Delete Custom Item",
                message: "Are you sure want to delete custom item?",
                closeButton: false,
                className: "modalcustom",
                buttons: {
                    confirm: {
                        label: "Yes",
                        className: "btn-success"
                    },
                    cancel: {
                        label: "No", //$translate.instant('ClaimDetails_Delete.BtnNo'),
                        className: "btn-danger"
                    }
                },
                callback: function (result) {

                    if (result) {
                        $(".page-spinner-bar").removeClass("hide");
                        if (angular.isDefined(item.id) && item.id !== null) {
                            var param = [
                                {
                                    id: item.id
                                }
                            ];
                            var DeleteItem = AdjusterLineItemDetailsService.DeleteCustomItem(
                                param
                            );
                            DeleteItem.then(
                                function (success) {
                                    toastr.remove();
                                    $(".page-spinner-bar").addClass("hide");

                                    toastr.success(success.data.message, "Confirmation");
                                    $scope.GetCustomItems();
                                    $scope.NewCustomItem = false;
                                },
                                function (error) {
                                    $(".page-spinner-bar").addClass("hide");
                                    toastr.remove();
                                    toastr.error(error.data.errorMessage, "Error");
                                }
                            );
                        }
                    }
                }
            });
        }

        $scope.AddToComparable = AddToComparable;
        function AddToComparable(customitem) {
            $(".page-spinner-bar").removeClass("hide");
            $scope.CustomItem = angular.copy(customitem);
            var param = {
                id: $scope.CustomItem.id,
                registrationNumber: sessionStorage.getItem("CompanyCRN"),
                itemStatus: "Comparable",
                claim: {
                    claimId: parseInt($scope.CommonObj.ClaimId)
                },
                item: {
                    itemId: parseInt($scope.CommonObj.ItemId)
                }
            };

            //Add/Update custom item
            var getItemDetailsOnId = AdjusterLineItemDetailsService.ChangeStatusOfCustomItem(
                param
            );
            getItemDetailsOnId.then(
                function (success) {
                    toastr.remove();
                    toastr.success(success.data.message, "Confirmation");
                    $(".page-spinner-bar").addClass("hide");s
                    $scope.GetCustomItems();
                    $scope.NewCustomItem = false;
                },
                function (error) {
                    toastr.remove();
                    $(".page-spinner-bar").addClass("hide");
                    toastr.error(error.data.errorMessage, "Error");
                }
            );
        }

        $scope.DeleteCustomSubItem = DeleteCustomSubItem;
        function DeleteCustomSubItem(item) {
            bootbox.confirm({
                size: "",
                title: "Delete Sub Item",
                message: "Are you sure want to delete sub item?",
                closeButton: false,
                className: "modalcustom",
                buttons: {
                    confirm: {
                        label: "Yes",
                        className: "btn-success"
                    },
                    cancel: {
                        label: "No", //$translate.instant('ClaimDetails_Delete.BtnNo'),
                        className: "btn-danger"
                    }
                },
                callback: function (result) {
                    if (result) {
                        if (angular.isDefined(item.id) && item.id !== null) {
                            var param = [
                                {
                                    id: item.id
                                }
                            ];
                            var DeleteItem = AdjusterLineItemDetailsService.DeleteCustomSubItem(
                                param
                            );
                            DeleteItem.then(
                                function (success) {
                                    toastr.remove();
                                    toastr.success(success.data.message, "Confirmation");
                                    $scope.GetCustomItems();
                                    $scope.NewCustomItem = false;
                                },
                                function (error) {
                                    toastr.remove();
                                    toastr.error(error.data.errorMessage, "Error");
                                }
                            );
                        }
                    }
                }
            });
        }

        $scope.goItemPage = goItemPage;
        function goItemPage() {
            sessionStorage.setItem("ClaimNo", $scope.CommonObj.ClaimNo);
            sessionStorage.setItem("ClaimId", $scope.CommonObj.ClaimId);
            sessionStorage.setItem(
                "AdjusterPostLostItemId",
                $scope.CommonObj.ItemId
            );
            sessionStorage.setItem("Policyholder", " ");
            $location.url($scope.CommonObj.Page);
        }
        $scope.FireUploadEvent = FireUploadEvent;
        function FireUploadEvent() {
            angular.element("#FileUpload").trigger("click");
        }

        $scope.attachmentList = [];
        $scope.uploadImage = uploadImage;
        function uploadImage(event) {
            var files = event.target.files;
            $scope.filed = event.target.files;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var reader = new FileReader();
                reader.file = file;
                reader.fileName = files[i].name;
                reader.fileType = files[i].type;
                reader.fileExtension = files[i].name.substr(
                    files[i].name.lastIndexOf(".")
                );
                reader.onload = $scope.imageIsLoaded;
                reader.readAsDataURL(file);
            }
        }
        $scope.imageIsLoaded = function (e) {
            $scope.$apply(function () {
                $scope.IncidentImages.push({
                    name: e.target.fileName,
                    FileExtension: e.target.fileExtension,
                    FileType: e.target.fileType,
                    Image: e.target.result,
                    File: e.target.file
                });
            });
        };
        $scope.RemoveImage = RemoveImage;
        function RemoveImage(item) {
            var index = $scope.IncidentImages.indexOf(item);

            if (index > -1) {
                $scope.IncidentImages.splice(index, 1);
            }
        }
        //Function to covert base64 data to blob.
        function b64toBlob(b64Data, contentType, sliceSize) {
            contentType = contentType || "";
            sliceSize = sliceSize || 512;
            var byteCharacters = atob(b64Data);
            var byteArrays = [];
            for (
                var offset = 0;
                offset < byteCharacters.length;
                offset += sliceSize
            ) {
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

        $scope.isPdf = function (fileName) {
            if (/\.(pdf|PDF)$/i.test(fileName)) {
                return true;
            }
        };

        $scope.isExcel = function (fileName) {
            if (/\.(xls|xlsx)$/i.test(fileName)) {
                return true;
            }
        };

        $scope.isImage = function (fileName) {
            if (/\.(jpe?g|png|gif|bmp)$/i.test(fileName)) {
                return true;
            }
        };

        //Fuction to download uploaded files.
        $scope.getAttachements = function (data) {
            fetch(data.url).then(function (t) {
                return t.blob().then(b => {
                    var a = document.createElement("a");
                    a.href = URL.createObjectURL(b);
                    a.setAttribute("download", data.FileName);
                    a.click();
                });
            });
        };

        //File Upload for attachment
        $scope.AddAttachment = function () {
            angular.element("#FileUpload").trigger("click");
        };
        $scope.displayAddImageButton = false;
        $scope.getAttachmentDetails = function (e) {
            $scope.displayAddImageButton = true;
            $scope.$apply(function () {
                var files = event.target.files;
                $scope.filed = event.target.files;
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    var reader = new FileReader();
                    reader.file = file;
                    reader.fileName = files[i].name;
                    reader.fileType = files[i].type;
                    reader.fileExtension = files[i].name.substr(
                        files[i].name.lastIndexOf(".")
                    );
                    reader.onload = $scope.LoadFileInList;
                    reader.readAsDataURL(file);
                }
            });
        };
        $scope.LoadFileInList = function (e) {
            $scope.$apply(function () {
                $scope.attachmentList.push({
                    FileName: e.target.fileName,
                    FileExtension: e.target.fileExtension,
                    FileType: e.target.fileType,
                    Image: e.target.result,
                    File: e.target.file,
                    isLocal: true,
                    isDelete: false,
                    fileName: e.target.fileName,

                });
            });
        };

        $scope.RemoveAttachment = RemoveAttachment;
        function RemoveAttachment(index) {
            if ($scope.attachmentList.length > 0) {
                // $scope.attachmentList.splice(index, 1);
                if ($scope.attachmentList[index])
                    $scope.attachmentList[index].isDelete = true;
                angular.element("#FileUpload").val(null);
            }
        }

        //Attachments preview
        $scope.GetDocxDetails = function (item) {
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
                var host = item.url;
                $scope.DocxDetails.url = host;
            }
            $scope.ReceiptList = $scope.DocxDetails.url;
            $scope.pdfUrl = $scope.ReceiptList;
            var pdf = ["pdf", "application/pdf"];
            var img = [
                "image",
                "application/image",
                "image/png",
                "image/jpeg",
                "image/gif",
                "png",
                "jpg",
                "jpeg",
                "gif",
                "image",
                "PNG",
                "JPEG",
                "GIF",
                "JPG"
            ];
            $scope.imgDiv = true;
            if (pdf.indexOf($scope.DocxDetails.FileType.toLowerCase()) > -1) {
                $scope.isPDF = 1;
            } else if (img.indexOf($scope.DocxDetails.FileType.toLowerCase()) > -1) {
                $scope.isPDF = 2;
            } else {
                $scope.isPDF = 0;
                var downloadLink = angular.element("<a></a>");
                downloadLink.attr("href", $scope.DocxDetails.url);
                downloadLink.attr("target", "_self");
                downloadLink.attr(
                    "download",
                    $scope.DocxDetails.FileName != null &&
                        angular.isDefined($scope.DocxDetails.FileName) &&
                        $scope.DocxDetails.FileName !== ""
                        ? $scope.DocxDetails.FileName
                        : "Document"
                );
                downloadLink[0].click();
            }
            window.setTimeout(function () {
                $("#img_preview")
                    .css({
                        right: $(".page-wrapper-middle").offset().left + "px"
                    })
                    .show();
                // $("#img_preview").show();
            }, 100);
        };

        $scope.close = function () {
            $("#img_preview").hide();
        };

        var zoomFactor = 100;
        $scope.largeMe = largeMe;
        function largeMe() {
            zoomFactor += 5;
            document.getElementById("imagepre").style.zoom = zoomFactor + "%";
        }

        $scope.smallMe = smallMe;
        function smallMe() {
            zoomFactor -= 5;
            document.getElementById("imagepre").style.zoom = zoomFactor + "%";
        }

        $scope.deteteClaimAttachment = deteteClaimAttachment;
        function deteteClaimAttachment(document) {
            bootbox.confirm({
                size: "",
                closeButton: false,
                title: "Delet media file",
                message:
                    "Are you sure you want to delete this Media " +
                    document.FileName +
                    "? <b>Please Confirm!",
                className: "modalcustom",
                buttons: {
                    confirm: {
                        label: "Yes",
                        className: "btn-success"
                    },
                    cancel: {
                        label: "No",
                        className: "btn-danger"
                    }
                },
                callback: function (result) {
                    //if (result)  call delet function
                    if (result) {
                        $(".page-spinner-bar").removeClass("hide");
                        document.url =
                            $scope.serverAddress +
                            "/" +
                            document.url.substr(
                                document.url.indexOf("ArtigemRS"),
                                document.url.length
                            );
                        var param = [
                            {
                                id: document.id,
                                url: document.url,
                                companyRegistrationNumber: sessionStorage.getItem("CompanyCRN")
                            }
                        ];
                        var promis = AdjusterLineItemDetailsService.deleteMediaFile(
                            param
                        );
                        promis.then(
                            function (success) {
                                $scope.imgDiv = false;
                                //$scope.refresh();
                                toastr.remove();
                                toastr.success(
                                    success.data.message,
                                    $translate.instant("SuccessHeading")
                                );
                                $(".page-spinner-bar").addClass("hide");
                            },
                            function (error) {
                                toastr.remove();
                                toastr.error(
                                    error.data.errorMessage,
                                    $translate.instant("ErrorHeading")
                                );
                                $(".page-spinner-bar").addClass("hide");
                            }
                        );
                    }
                }
            });
        }

    });
