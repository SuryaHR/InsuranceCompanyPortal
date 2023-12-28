angular.module('MetronicApp').controller('AttachmentMappingController', function ($rootScope, $uibModal, $scope, $timeout,
    $location, $translate, $filter, $translatePartialLoader, $compile, $interval, $q, $anchorScroll, DocumentMappingService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });


    $scope.ClaimDetails = JSON.parse(sessionStorage.getItem("claimDetails"));

    $scope.ClaimParticipantsList = $scope.ClaimDetails.ParticipantList;
    $scope.SelectedParticipants = [];
    $scope.Comments = [];
    $scope.IsEdit = false;
    $scope.rect = {};
    var canvas = {};
    var context = {};
    var pdfDoc = "";
    $scope.PDFPageNumber = 1;
    $scope.command = "create";
    $scope.User = sessionStorage.getItem("Name");
    $scope.CommonObject = {
        particiapnt: []
    }
    function init() {
        $scope.CommentId = null;
        getAllComments();
        var host = location.host;
        $scope.ClaimDetails.Attachment.url = "http://" + host + "/" + $scope.ClaimDetails.Attachment.url.substr($scope.ClaimDetails.Attachment.url.indexOf("ArtigemRS"), $scope.ClaimDetails.Attachment.url.length);
        console.log($scope.ClaimDetails.Attachment.url);
    }
    init();
    $scope.getAllComments = getAllComments;
    function getAllComments() {
        var param =
            {
                "id": $scope.ClaimDetails.Attachment.id
            };

        var promisePost = DocumentMappingService.GetComments(param);
        promisePost.then(function (success) {
            $scope.Comments = success.data.data;
            $scope.DrawMapping();
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        });
    }
    // $scope.ClaimNumber = sessionStorage.getItem('ClaimNumber');
    $scope.Selected = {
        Id: null,
        Comment: '',
        UserName: $scope.User,
    };

    $translatePartialLoader.addPart('ReceiptMapperHome');

    $translate.refresh();
    $scope.GotoDashboard = function () {
        $location.url(sessionStorage.getItem('HomeScreen'));
    };
    $scope.GoBack = function () {
        $location.url('AdjusterPropertyClaimDetails');
    };
    $scope.isShowPopup = false;

    //=========================PDF Region Start================================================

    //$scope.pdfUrl = '/views/ClaimFormDetails/CPD-VendorClaimManagement.pdf';
    $scope.currentPDFUrl = $scope.pdfUrl;
    $scope.pageToDisplay = 1;
    $scope.pageNum = 1;
    $scope.ReceiptIndex = 0;
    $scope.loading = "Loading....."

    if ($scope.ClaimDetails.Attachment.type == 'application/pdf') {
        $scope.ReceiptList = [{ "path": $scope.ClaimDetails.Attachment.url }];
        $scope.pdfUrl = $scope.ReceiptList[0].path;
    }
    else {
        $scope.ReceiptList = [];
    }


    $scope.Mapping = [];
    var scale = 1;

    function renderPage(page) {
        scale = 1;
        //context.clearRect(0, 0, canvas.width, canvas.height);
        var viewport = page.getViewport(scale);
        canvas = document.getElementById("pdf");
        $scope.rect.width = canvas.width;
        context = canvas.getContext('2d');
        var renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        page.render(renderContext);

    }
    $scope.onError = function (error) {
        console.log(error);
    };

    $scope.onLoad = function () {
        $scope.loading = '';

    };

    $scope.OffsetX;
    $scope.OffsetY;

    //Dispaly pop up
    $scope.ShowPopUp = function (Id, event, x, y) {

        var loopPromises = [];

        angular.forEach($scope.CommonObject.particiapnt, function (particiapnt) {
                var deferred = $q.defer();
                loopPromises.push(deferred.promise);
                $timeout(function () {
                    deferred.resolve();
                }, 10);
            });
            $scope.CommentId = Id;
            $q.all(loopPromises).then(function () {
                $scope.CommonObject.particiapnt = [];
                angular.element('#select2insidemodal').select2({});
            });

        if (!$scope.isPopupExists) {
            $scope.Selected = {
                Id: null,
                Comment: '',
                UserName: $scope.User,
            };
            if (event != null) {
                $scope.CommonObject.particiapnt = [];
                angular.element('#select2insidemodal').select2({});
                $scope.OffsetX = event.offsetX;;
                $scope.OffsetY = event.offsetY
            }
            else {

                $scope.OffsetX = x;
                $scope.OffsetY = y;
            }
            $scope.IsEdit = false;
            document.getElementById("popUp").style.display = "block";
            var mapItem = document.getElementById("popUp");
            mapItem.style.left = $scope.OffsetX + "px";
            mapItem.style.top = $scope.OffsetY + "px";
            $('.itemMapped').draggable({
                start: function () {
                    $scope.getCoordinates($(this));
                },
                stop: function () {
                    $scope.getCoordinates($(this));
                }
            });

            //if (Id != null) {
            //    $scope.IsEdit = true;

            //    $scope.CommonObject.particiapnt = [];
            //    var list=[];
            //    angular.forEach($scope.Comments, function (comment) {
            //        if(comment.id==Id)
            //        {
            //            list.push(comment);
            //        }
            //    });
            //    var loopPromises = [];
            //    $scope.Selected.Id = list[0].id;
            //    $scope.Selected.Comment = list[0].commentDescription;
            //    $scope.Selected.UserName = list[0].createdBy.firstName + " " + list[0].createdBy.lastName;
            //    angular.forEach(list[0].participants, function (particiapnt) {
            //        var deferred = $q.defer();
            //        $scope.CommonObject.particiapnt.push(particiapnt.participantId);
            //        loopPromises.push(deferred.promise);
            //        $timeout(function () {
            //            deferred.resolve();
            //        }, 10);
            //    });
            //    $scope.CommentId = Id;
            //    $q.all(loopPromises).then(function () {
            //        angular.element('#select2insidemodal').select2({});
            //    });

            //    $location.hash(Id);
            //    $anchorScroll();
            //}

            $scope.isShowPopup = true;
            $scope.isPopupExists = true;


        }

    };


    $scope.ShowEditPopUp = ShowEditPopUp;
    function ShowEditPopUp(Id, event, x, y)
    {

       $scope.OffsetX = x;
       $scope.OffsetY = y;

    $scope.IsEdit = true;
    document.getElementById("popUp").style.display = "block";
    var mapItem = document.getElementById("popUp");
    mapItem.style.left = $scope.OffsetX + "px";
    mapItem.style.top = $scope.OffsetY + "px";
    $('.itemMapped').draggable({
        start: function () {
            $scope.getCoordinates($(this));
        },
        stop: function () {
            $scope.getCoordinates($(this));
        }
    });

        if (Id != null) {
            $scope.IsEdit = true;

            $scope.CommonObject.particiapnt = [];
            var list=[];
            angular.forEach($scope.Comments, function (comment) {
                if(comment.id==Id)
                {
                    list.push(comment);
                }
            });
            var loopPromises = [];
            $scope.Selected.Id = list[0].id;
            $scope.Selected.Comment = list[0].commentDescription;
            $scope.Selected.UserName = list[0].createdBy.firstName + " " + list[0].createdBy.lastName;
            angular.forEach(list[0].participants, function (particiapnt) {
                var deferred = $q.defer();
                $scope.CommonObject.particiapnt.push(particiapnt.participantId);
                loopPromises.push(deferred.promise);
                $timeout(function () {
                    deferred.resolve();
                }, 10);
            });
            $scope.CommentId = Id;
            $q.all(loopPromises).then(function () {
                angular.element('#select2insidemodal').select2({});
            });

            $location.hash(Id);
            $anchorScroll();
        }

        $scope.isShowPopup = true;
        $scope.isPopupExists = true;

    }


    //Get values if popup is location changed by dragging it
    $scope.getCoordinates = function (element) {

        $scope.OffsetX = element.position().left;
        $scope.OffsetY = element.position().top;


    }


    $scope.HidePopUp = function (e) {

        $scope.isShowPopup = false;
        $scope.isPopupExists = false;
        $scope.CommentId = null;

        $scope.Selected = {};
        e.stopPropagation();



    };


    $scope.clearMapping = clearMapping;
    function clearMapping() {
        var list = []
        list = $filter('filter')($scope.Comments, { documentPageNumber: $scope.PDFPageNumber });
        angular.forEach(list, function (comment) {
            document.getElementById(comment.id).remove();
        });
    }
    //Filtering comments to get page specific comments
    $scope.DrawMapping = DrawMapping;
    function DrawMapping() {

        var list = []
        list = $filter('filter')($scope.Comments, { documentPageNumber: $scope.PDFPageNumber });
        angular.forEach(list, function (comment) {
            drawItemBox(comment.id, comment.commentDescription, comment.xCoordinate, comment.yCoordinate);
        });
    }

    //Add Comment New comment
    $scope.SaveValues = SaveValues;
    function SaveValues(event) {
        var participants = [];

        if ($scope.IsEdit == true)//Edit comment
        {


           var list=[]
            angular.forEach($scope.Comments, function (comment) {
                if(comment.id==$scope.Selected.Id)
                {
                    list.push(comment);
                }

            });

            if (list.length > 0)
            {
                angular.forEach(list[0].participants, function (particiapnt) {
                    var count = 0
                    angular.forEach($scope.CommonObject.particiapnt, function (id) {
                        if (particiapnt.participantId == id) {
                            count++;
                        }
                    });
                    if (count == 0) {
                        participants.push({ "participantId": particiapnt.participantId, "isDelete": true, })
                    }
                });

                angular.forEach($scope.CommonObject.particiapnt, function (id) {
                    participants.push({ "participantId": id });
                });
            }

            var param = {
                "id": $scope.Selected.Id,  // comment id
                "commentDescription": $scope.Selected.Comment,
                "documentPageNumber": ($scope.ClaimDetails.Attachment.type == 'application/pdf') ? $scope.PDFPageNumber : 1,
                "xCoordinate": $scope.OffsetX,
                "yCoordinate": $scope.OffsetY,
                "document": {
                    "id": $scope.ClaimDetails.Attachment.id
                },
                "participants": participants
            };

            var promisePost = DocumentMappingService.UpdateComment(param);
            promisePost.then(function (success) {
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");
                $scope.clearMapping();
                $scope.getAllComments();
                $scope.reset();
                $scope.CommentId = $scope.Id;
                $scope.isShowPopup = false;
                $scope.isPopupExists = false;


            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
            });
        }
        else if ($scope.IsEdit == false) //Add new Comments
        {

            angular.forEach($scope.CommonObject.particiapnt, function (id) {
                participants.push({ "participantId": id })
            });
            var param = {

                "commentDescription": $scope.Selected.Comment,
                "documentPageNumber": ($scope.ClaimDetails.Attachment.type == 'application/pdf') ? $scope.PDFPageNumber : 1,
                "xCoordinate": $scope.OffsetX,
                "yCoordinate": $scope.OffsetY,
                "document": {
                    "id": $scope.ClaimDetails.Attachment.id
                },
                "participants": participants
            };

            var promisePost = DocumentMappingService.SaveDocumentComment(param);
            promisePost.then(function (success) {
                //drawItemBox(success.data.data.id, success.data.data.commentDescription, success.data.data.xCoordinate, success.data.data.yCoordinate);
                var list = []
                list = $filter('filter')($scope.Comments, { documentPageNumber: $scope.PDFPageNumber });
                angular.forEach(list, function (comment) {
                    document.getElementById(comment.id).remove();
                });
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");
                $scope.getAllComments();
                $scope.reset();
                $scope.CommentId = $scope.Id;
                $scope.isShowPopup = false;
                $scope.isPopupExists = false;

            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
            });
        }



        event.stopPropagation();

    };

    //Delete Comment and Mapping
    $scope.DeleteMapping = DeleteMapping;
    function DeleteMapping(e) {

        bootbox.confirm({
            size: "",
            title: 'Delete Comment',
            message: 'Are you sure want to delete this comment?', closeButton: false,
            className: "modalcustom", buttons: {
                confirm: {
                    label: $translate.instant('Yes'),
                    className: 'btn-success'
                },
                cancel: {
                    label: $translate.instant('No'),
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                if (result) {

                    var param = {

                        "id": $scope.Selected.Id

                    }
                    var promisePost = DocumentMappingService.DeleteComment(param);
                    promisePost.then(function (success) {

                        $scope.isShowPopup = false;
                        $scope.isPopupExists = false;
                        document.getElementById($scope.Selected.Id).remove();
                        $scope.getAllComments();
                        toastr.remove();

                        toastr.success(((success.data.message != null) ? success.data.message : "Comment deleted successfully"), "Confirmation");
                    }, function (error) {
                        toastr.remove();
                        toastr.error(error.data.errorMessage, "Error");
                    });


                }
            }
        });
        e.stopPropagation();
    };

    //Reset All the values
    $scope.reset = function () {
        $scope.CommonObject.particiapnt = [];
        angular.element('#select2insidemodal').select2({});
        $scope.Selected = {};
        $scope.CommentId = null;
    }

    //Draw mapping dynamically
    function drawItemBox(id, comment, offsetX, offsetY) {

        // $scope.EditObject = item;
        var newMapItem = $(document.createElement('div'))
            .attr("id", id).attr("class", "plotbox itemBorder");
        newMapItem.css({ "top": offsetY + "px", "width": "90%", "border": "1px solid red", "height": 35 });
        newMapItem.after().html('<div class="mapItem" style="left:' + offsetX + 'px; background-color:#32c5d2;color:#f9f3f3;line-height:25px;height:100%;font-weight:bold;">' +
            '' + comment + '</div>' +
            '<div class="actions_btns"><i class="fa fa-edit fa-2x text-success" aria-hidden="true" ng-click="ShowEditPopUp(' + id + ',null,' + offsetX + ',' + offsetY + ')" title="Edit/View"></i></div>');
        //newMapItem.appendTo("#mapItemsGroup");
        var content = $compile(newMapItem)($scope);
        content.appendTo("#mapItemsGroup");
    };


    $scope.goPreviousPage = function (event) {


        pdfDoc = $scope.ClaimDetails.Attachment.url;
        PDFJS.getDocument(pdfDoc).then(function (pdfDoc) {
            if ($scope.PDFPageNumber == 1) {
                event.stopPropagation();
            }
            else {

                var list = []
                list = $filter('filter')($scope.Comments, { documentPageNumber: $scope.PDFPageNumber });
                angular.forEach(list, function (comment) {
                    document.getElementById(comment.id).remove();
                });
                $scope.PDFPageNumber -= 1;
                pdfDoc.getPage($scope.PDFPageNumber).then(renderPage);
                $scope.DrawMapping();
            }
        });
    };


    $scope.goNextPage = function (event) {



        pdfDoc = $scope.ClaimDetails.Attachment.url;
        PDFJS.getDocument(pdfDoc).then(function (pdfDoc) {
            $scope.TotalPages = pdfDoc.numPages;
            debugger
            if ($scope.PDFPageNumber == $scope.TotalPages) {
                event.stopPropagation();
            }
            else {

                var list = []
                list = $filter('filter')($scope.Comments, { documentPageNumber: $scope.PDFPageNumber });
                angular.forEach(list, function (comment) {
                    document.getElementById(comment.id).remove();
                });
                $scope.PDFPageNumber += 1;
                pdfDoc.getPage($scope.PDFPageNumber).then(renderPage);
                $scope.DrawMapping();

            }
        });

    };


    $scope.RedirectToMapping = RedirectToMapping;
    function RedirectToMapping(comment) {
        $scope.isShowPopup = false;
        $scope.isPopupExists = false;
        $scope.CommentId = null;

        $scope.Selected = {};

        if ($scope.ClaimDetails.Attachment.type == 'application/pdf') {
            pdfDoc = $scope.ClaimDetails.Attachment.url;
            PDFJS.getDocument(pdfDoc).then(function (pdfDoc) {


                var list = []
                list = $filter('filter')($scope.Comments, { documentPageNumber: $scope.PDFPageNumber });
                angular.forEach(list, function (comment) {
                    document.getElementById(comment.id).remove();
                });
                $scope.PDFPageNumber = comment.documentPageNumber;
                pdfDoc.getPage($scope.PDFPageNumber).then(renderPage);
                $scope.DrawMapping();
                $scope.ShowEditPopUp(comment.id, null, comment.xCoordinate, comment.yCoordinate);
            });

        }
        else {

            $scope.ShowEditPopUp(comment.id, null, comment.xCoordinate, comment.yCoordinate);


        }

    }

});
