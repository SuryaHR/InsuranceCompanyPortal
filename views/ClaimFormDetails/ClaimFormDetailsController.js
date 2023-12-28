angular.module('MetronicApp').controller('ClaimFormDetailsController', function ($rootScope, $log, $scope,
    settings, $http, $timeout, $uibModal, $location, $translate, $translatePartialLoader, $compile, uiCalendarConfig, $filter) {

    //set language
    $translatePartialLoader.addPart('ClaimFormDetails');
    $translate.refresh();
    $scope.Message = "This is test";
    $scope.CurrentImage = "";
    $scope.Cancel = function () {
        $scope.$close();
    };
    //================================Slider Region Start================================================ 
    /**
         * @param {Array} args
         * @return {undefined}
         */
    function render(args) {
        /** @type {number} */
        var i = 0;
        /** @type {number} */
        var valuesLen = values.length;
        for (; i < valuesLen; i++) {

            values[i].id = args.pop();
        }
    }
    /**
     * @return {?}
     */
    function compiler() {
        /** @type {Array} */
        var e = [];
        /** @type {number} */
        var n = 0;
        for (; n < l; ++n) {
            /** @type {number} */
            e[n] = n;
        }
        return next(e);
    }
    /**
     * @param {Array} result
     * @return {?}
     */
    function next(result) {
        var value;
        var key;
        var index = result.length;
        if (index) {
            for (; --index;) {
                /** @type {number} */
                key = Math.floor(Math.random() * (index + 1));
                value = result[key];
                result[key] = result[index];
                result[index] = value;
            }
        }
        return result;
    }
    /** @type {number} */
    $scope.myInterval = 5E3;
    /** @type {boolean} */
    $scope.noWrapSlides = false;
    /** @type {number} */
    $scope.active = 0;
    /** @type {Array} */
    var values = $scope.slides = [];
    /** @type {number} */
    var l = 0;
    /**
     * @return {undefined}
     */

    var textarray = [];
    $scope.addSlide = function (i) {
        /** @type {number} */
        //var newWidth = 600 + values.length + 1;
        textarray[i] = "Image" + i;
        values.push(
    {
        //image: "http://lorempixel.com/" + newWidth + "/300",
        image: "assets/global/img/no-image.png",
        text: textarray[values.length % 4],
        // text: "Image" + l[values.length % 4],
        id: l++,
        active: false
    });

    };
    /**
     * @return {undefined}
     */
    $scope.randomize = function () {
        var typePattern = compiler();
        render(typePattern);
    };
    /** @type {number} */
    var i = 0;
    for (; i < 4; i++) {
        $scope.addSlide(i);
    };

    //================================Slider Region End================================================ 

    
    //=========================PDF Region Start================================================
    //$scope.pdfUrl = '/views/ClaimFormDetails/CPD-VendorClaimManagement.pdf';
    $scope.currentPDFUrl = $scope.pdfUrl;
    $scope.pageToDisplay = 1;
    $scope.pageNum = 1;
    $scope.ReceiptIndex = 0;
    $scope.loading="Loading....."
    $scope.ReceiptList = [{ "path": "/views/ClaimFormDetails/CPD-VendorClaimManagement.pdf" }, { "path": "/views/ClaimFormDetails/Contents-Web-Portal.pdf" }, { "path": "/views/ClaimFormDetails/CPD-Vendor.pdf" }];
    $scope.pdfUrl = $scope.ReceiptList[0].path;
  
    function renderPage(page) {
        //context.clearRect(0, 0, canvas.width, canvas.height);
        var viewport = page.getViewport(scale);
        canvas = document.getElementById("pdf");
        $scope.rect.width = canvas.width;
        context = canvas.getContext('2d');
        var renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        //canvas.height = viewport.height;
        //canvas.width = viewport.width;
        page.render(renderContext);

    }
    $scope.onError = function (error) {
        console.log(error);
    };

    $scope.onLoad = function () {
        $scope.loading = '';
       
    };


    //Go to previous Receipt PDF in the list
    $scope.PreviousReceipt = PreviousReceipt;
    function PreviousReceipt() {
        
        if ($scope.ReceiptIndex> 0)
        {
            $scope.ReceiptIndex--;
            $scope.pdfUrl = $scope.ReceiptList[$scope.ReceiptIndex].path;
        }
        
    }

    //Go to next Receipt PDF in the list
    $scope.NextReceipt = NextReceipt;
    function NextReceipt() {
        
        if ($scope.ReceiptIndex < $scope.ReceiptList.length-1) {
            $scope.ReceiptIndex++;
            $scope.pdfUrl = $scope.ReceiptList[$scope.ReceiptIndex].path;
        }
    }

    ////Go to next page of the pdf
    //$scope.goNextPage = function () {
       

    //}
    ////Go to previous page of the pdf
    //$scope.goPreviousPage = function () {
        
    //}
    //zoomin pdf page
    //$scope.zoomInPage = function () {
    //    pdfDoc = $scope.currentPDFUrl;
    //    scale = scale + .2;
    //    PDFJS.getDocument(pdfDoc).then(function (pdfDoc) {
    //        pdfDoc.getPage($scope.PDFPageNumber).then(renderPage);
    //    });
    //}
    //zoomout pdf page
    //$scope.zoomOutPage = function () {
    //    pdfDoc = $scope.currentPDFUrl;
    //    scale = scale - .2;
    //    PDFJS.getDocument(pdfDoc).then(function (pdfDoc) {
    //        pdfDoc.getPage($scope.PDFPageNumber).then(renderPage);
    //    });
    //}

    //fit page to 100% size
    //$scope.fitPage = function () {
    //    pdfDoc = $scope.currentPDFUrl;
    //    scale = 1;
    //    PDFJS.getDocument(pdfDoc).then(function (pdfDoc) {
    //        pdfDoc.getPage($scope.PDFPageNumber).then(renderPage);
    //    });
    //}
});
//.directive('onCarouselChange', function ($parse) {
//    return {
//        require: 'carousel',
//        link: function (scope, element, attrs, carouselCtrl) {
//            var fn = $parse(attrs.onCarouselChange);
//            var origSelect = carouselCtrl.select;
//            carouselCtrl.select = function (nextSlide, direction) {
//                if (nextSlide !== this.currentSlide) {
//                    fn(scope, {
//                        nextSlide: nextSlide,
//                        direction: direction,
//                    });
//                }
//                return origSelect.apply(this, arguments);
//            };
//        }
//    };
//});