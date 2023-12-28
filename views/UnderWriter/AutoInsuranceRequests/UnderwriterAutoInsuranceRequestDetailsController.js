angular.module('MetronicApp')
    .directive('ngFileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var model = $parse(attrs.ngFileModel);
                var isMultiple = attrs.multiple;
                var modelSetter = model.assign;
                element.bind('change', function () {
                    var values = [];
                    angular.forEach(element[0].files, function (item) {
                        var value = {
                            // File Name
                            name: item.name,
                            //File Size
                            size: item.size,
                            //File URL to view
                            url: URL.createObjectURL(item),
                            // File Input Value
                            _file: item
                        };
                        values.push(value);
                    });
                    scope.$apply(function () {
                        if (isMultiple) {
                            modelSetter(scope, values);
                        } else {
                            modelSetter(scope, values[0]);
                        }
                    });
                });
            }
        };
    }])    
    /* Directive for File Drag and Drop */
    .directive('filedropzone', ['$log', function ($log) {
        return {
            restrict: 'A',
            scope: {
                dropfiles: '=' //One way to return your drop file data to your controller
            },
            link: function (scope, element, attrs) {
                var processDragOverOrEnter;
                processDragOverOrEnter = function (event) {
                    if (event != null) {
                        event.preventDefault();
                    }
                    return false;
                }
                element.bind('dragover', processDragOverOrEnter);
                element.bind('dragenter', processDragOverOrEnter);
                return element.bind('drop', function (event) {
                    if (event != null) {
                        event.preventDefault();
                    }
                    var fileObjectArray = [];
                    angular.forEach(event.originalEvent.dataTransfer.files, function (file) {
                        var reader = new FileReader();
                        reader.onload = function (event) {
                            scope.$apply(function () {
                                var base64 = event.target.result;
                                var fileName = file.name;
                                var type = file.type;
                                var extension = fileName.substring(fileName.lastIndexOf('.'));
                                var fileObject = {
                                    File: file,
                                    fileName: fileName,
                                    type: type,
                                    Image: base64,
                                    FileExtension: extension,
                                    isLocal: true
                                }
                                scope.dropfiles.push(fileObject);
                            });
                        }

                        reader.readAsDataURL(file);
                    });

                });

            }
        }
    }])

    .directive('disablearrows', function () {
        function disableArrows(event) {
            if (event.keyCode === 38 || event.keyCode === 40) {
                event.preventDefault();
            }
        }
        return {
            link: function (scope, element, attrs) {
                element.on('keydown', disableArrows);
            }
        };
    })

    .directive('stringToNumber', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function (value) {
                    return '' + value;
                });
                ngModel.$formatters.push(function (value) {
                    if (value == '0.0') {
                        return value = null;
                    } else {
                        return parseFloat(value, 100);
                    }
                });
            }
        };
    })

    .controller('UnderwriterAutoInsuranceRequestDetailsController', function ($http, $rootScope, $scope, settings, $location, $translate, $translatePartialLoader, $window,
        $filter, $timeout, UnderWriterDashboardService, AuthHeaderService, $uibModal, $timeout) {

        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        //set language
        $translatePartialLoader.addPart('AutoInsuranceRequests');
        $translate.refresh();

        $scope.attachmentList = [];
        init()
        function init() {
            getAutoInsuranceRequestDetailsById(sessionStorage.getItem("vinId"));
        }

        $scope.getAutoInsuranceRequestDetailsById = getAutoInsuranceRequestDetailsById;
        function getAutoInsuranceRequestDetailsById(vinId) {
            $(".page-spinner-bar").removeClass("hide");
            var getAutoInsDetails = UnderWriterDashboardService.getAutoInsDetails(vinId);
            getAutoInsDetails.then(function (success) {

                $scope.vehicleDetails = success.data && success.data.data ? success.data.data : null;
                $scope.policyNumber = $scope.vehicleDetails.vin;
                console.log('Attachments Details', $scope.vehicleDetails);
                $scope.primaryPolicyHolderFullName = $filter('constructName')($scope.vehicleDetails.adjusterBaseDTO.firstName, $scope.vehicleDetails.adjusterBaseDTO.lastName);

                //FileExtension
                $scope.attachmentList = [];
                angular.forEach($scope.vehicleDetails.itemImagesDTOs, function (ItemFile) {
                    var fileType = ItemFile.name.split('.').pop();
                    var filename = ItemFile.name;
                    $scope.attachmentList.push({ "fileName": filename, "imageId": ItemFile.imageId, "url": ItemFile.url, "type": fileType });
                });

                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                toastr.remove();
                if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                    toastr.error(error.data.errorMessage, "Error")
                }
                else {
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
                }
                $(".page-spinner-bar").addClass("hide");
            });
        }


        //Upload Attachments
        $scope.AddAttachment = function () {
            $scope.isUpload = true;
            angular.element('#FileUpload1').trigger('click');
        }


        $scope.getAttachmentDetails = function (e) {
            $scope.$apply(function () {
                if (e.files.length > 0) {
                    var files = event.target.files;
                    $scope.filed = event.target.files;
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        var reader = new FileReader();
                        reader.file = file;
                        reader.fileName = files[i].name;
                        reader.fileType = files[i].type;
                        reader.fileExtension = files[i].name.substr(files[i].name.lastIndexOf('.'));
                        reader.onload = $scope.LoadFileInList;
                        reader.readAsDataURL(file);
                        $scope.showAttachmentErro = false;
                    }
                }
                else {
                    $scope.showAttachmentErro = true;
                }
            });
        };

        $scope.LoadFileInList = function (e) {
            $scope.$evalAsync(function () {

                $scope.attachmentList.push(
                    {
                        "fileName": e.target.fileName, "FileExtension": e.target.fileExtension, "type": e.target.fileType,
                        "Image": e.target.result, "File": e.target.file, "isLocal": true
                    })
                console.log('Attachments List', $scope.attachmentList);
            });
        }

        //Remove Attachments
        $scope.RemoveAttachment = RemoveAttachment;
        function RemoveAttachment(index) {
            if ($scope.attachmentList.length > 0) {

                var deleted = $scope.attachmentList[index];

                if (angular.isDefined(deleted.url)) {
                    $scope.deletedAttachmentList.push(deleted.url);
                }
                $scope.attachmentList.splice(index, 1);

            }
        };

        $scope.updateVehicalAppraisal = updateVehicalAppraisal;
        function updateVehicalAppraisal() {
            $(".page-spinner-bar").removeClass("hide");
            var details = {
                'id': !(isNullData($scope.vehicleDetails.id)) ? $scope.vehicleDetails.id : null,
                'vin': !(isNullData($scope.vehicleDetails.vin)) ? $scope.vehicleDetails.vin : null,
                'purchaseDate': !(isNullData($scope.vehicleDetails.purchaseDate)) ? $filter('DatabaseDateFormatMMddyyyy')($scope.vehicleDetails.purchaseDate) : null,
                'door': !(isNullData($scope.vehicleDetails.door)) ? $scope.vehicleDetails.door : null,
                'make': !(isNullData($scope.vehicleDetails.make)) ? $scope.vehicleDetails.make : null,
                'manufacturer': !(isNullData($scope.vehicleDetails.manufacturer)) ? $scope.vehicleDetails.manufacturer : null,
                'mileage': !(isNullData($scope.vehicleDetails.mileage)) ? $scope.vehicleDetails.mileage : null,
                'model': !(isNullData($scope.vehicleDetails.model)) ? $scope.vehicleDetails.model : null,
                'modelYear': !(isNullData($scope.vehicleDetails.modelYear)) ? $scope.vehicleDetails.modelYear : null,
                'trim': !(isNullData($scope.vehicleDetails.trim)) ? $scope.vehicleDetails.trim : null,
                'series': !(isNullData($scope.vehicleDetails.series)) ? $scope.vehicleDetails.series : null,
                'vehicleRating': !(isNullData($scope.vehicleDetails.vehicleRating)) ? $scope.vehicleDetails.vehicleRating : null,
                'bodyClass': !(isNullData($scope.vehicleDetails.bodyClass)) ? $scope.vehicleDetails.bodyClass : null,
                'vehicleType': !(isNullData($scope.vehicleDetails.vehicleType)) ? $scope.vehicleDetails.vehicleType : null,
                'createdBy': !(isNullData($scope.vehicleDetails.adjusterBaseDTO.id)) ? $scope.vehicleDetails.adjusterBaseDTO.id : null,
                'purchasePrice': !(isNullData($scope.vehicleDetails.purchasePrice)) ? $scope.vehicleDetails.purchasePrice : null
            }

            console.log('updated vehicle details', details);

            var data = new FormData();
            angular.forEach($scope.attachmentList, function (ItemFile) {
                data.append('filesDetails', ItemFile.File ? ItemFile.File:null);
            });

            data.append("autoMobileDetails", angular.toJson(details));

            var responsePromise = UnderWriterDashboardService.updateVehicleAppraisal(data);
            responsePromise.then(function (success) {
                $scope.attachmentList = [];
                toastr.remove();
                toastr.success("The vin # " + sessionStorage.getItem("vinNumber") + " was successfully updated", "Confirmation");
                $timeout(function () {
                    $scope.getAutoInsuranceRequestDetailsById(sessionStorage.getItem("vinId"));
                }, 200);
            }, function (error) {
                $scope.attachmentList = [];
                toastr.remove();
                if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                    toastr.error('Please enter all mandatory fields.', "Error")
                }
                else {
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                }
                $(".page-spinner-bar").addClass("hide");
            });
        }

        //Goto AutoInsRequestPage
        $scope.goToAutoInsuranceRequests = goToAutoInsuranceRequests;
        function goToAutoInsuranceRequests(params) {
            sessionStorage.setItem("EditAppraisal", false);
            $location.path('/AutoInsuranceRequests');
        }


        // Null Check
        function isNullData(objData) {
            if (objData == null || objData == 'null' || objData == '' || objData == 'undefined') {
                return true;
            } else {
                return false;
            }
        }

        /* Select & Activate - New Insurance Request tab for Additional Appraisal Details page  */
        $timeout(function () {
            $(document).ready(function () {
                $rootScope.$broadcast('updateActiveTab', 'autoinsreq');
            });
        }, 200);


        //Attachments Preview
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
            }
            $scope.ReceiptList = $scope.DocxDetails.url;
            $scope.pdfUrl = $scope.ReceiptList;
            var pdf = ["pdf", "application/pdf"];
            var img = ["image", "application/image", "image/png", "image/jpeg", "image/gif", "png", "jpg", "jpeg", "gif", "image", "PNG", "JPEG", "GIF", "JPG"];
            $scope.imgDiv = true;
            if (pdf.indexOf(($scope.DocxDetails.type.toLowerCase())) > -1) {
                $scope.isPDF = 1;
            }
            else if (img.indexOf(($scope.DocxDetails.type.toLowerCase())) > -1) {
                $scope.isPDF = 2;
            }
            else {
                $scope.isPDF = 0;
                var downloadLink = angular.element('<a></a>');
                downloadLink.attr('href', $scope.DocxDetails.url);
                downloadLink.attr('target', '_self');
                downloadLink.attr('download', (($scope.DocxDetails.fileName != null && angular.isDefined($scope.DocxDetails.fileName) && $scope.DocxDetails.fileName !== "") ? $scope.DocxDetails.fileName : "Document"));
                downloadLink[0].click();
            }
            window.setTimeout(function () {
                $("#img_preview").css({
                    'right': $('.page-wrapper-middle').offset().left + 'px'
                }).show();
            }, 100);

        }

        $scope.close = function () {
            $("#img_preview").hide();
        }

        /* Delete attachements */
        $scope.DeleteAttachement = DeleteAttachement;
        function DeleteAttachement() {
            var msg = "";
            msg = "Are you sure you want to delete the attachment " + $scope.DocxDetails.fileName + "?";
            bootbox.confirm({
                size: "",
                title: "Delete Attachement?",
                message: msg, closeButton: false,
                className: "modalcustom", buttons: {
                    confirm: {
                        label: "Delete",
                        className: 'btn-success'
                    },
                    cancel: {
                        label: "Cancel", //$translate.instant('ClaimDetails_Delete.BtnNo'),
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    if (result) {
                        if ($scope.DocxDetails) {
                            var url = $scope.DocxDetails.url;
                            var promiseResponse = AppraisalService.deteleAttachment(url);
                            promiseResponse.then(function (data) {
                                toastr.remove();
                                $scope.imgDiv = false;
                                toastr.success("The attachment " + $scope.DocxDetails.fileName + " was deleted successfully.", "Confirmation");
                                location.reload();
                            }, function (error) {
                                $(".page-spinner-bar").addClass("hide");
                                toastr.remove();
                                toastr.error('Error while downloading attachment.', "Error");
                            });
                        }
                    }
                }
            });
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
         $scope.getAttachements = function (data) {
            var b64Data = data;
            var contentType = 'application/octet-stream';
            var blob = b64toBlob(b64Data, contentType);
            var url = window.URL.createObjectURL(blob);
            var downloadLink = angular.element('<a></a>');
            downloadLink.attr('href', url);
            downloadLink.attr('target', '_self');
            downloadLink.attr('download', (($scope.DocxDetails.fileName != null && angular.isDefined($scope.DocxDetails.fileName) && $scope.DocxDetails.fileName !== "") ? $scope.DocxDetails.fileName : "Document"));
            downloadLink[0].click();
        }



    });