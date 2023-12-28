angular.module('MetronicApp')
    // Date format to MM/dd/yyy
    .filter('formatDate', function ($filter) {
        var localDate = "";
        return function (input) {
            if (input === null || input === "" || angular.isUndefined(input)) { return ""; }
            if (input.indexOf(':') > -1) {
                // input = (input.split('-')[2]).split('T')[0] + '-' + input.split('-')[0] + '-' + input.split('-')[1] + 'T' + (input.split('-')[2]).split('T')[1];
                var a = input.split('T');
                localDate = new Date(a[0]);
            }
            else
                localDate = new Date(input);
            var dt = new Date(localDate);
            return $filter('date')(dt, "MM/dd/yyyy");
        };
    })
    // Format input title case
    .filter('titleCase', function ($filter) {
        return function (input) {
            input = input || '';
            if (input === 'WAITING ON PH APPRAISAL') {
                return 'Waiting on PH Appraisal';
            } else {
                return input.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
            }
        };
    })
    .filter('startFrom', function ($filter) {
        return function (input, start) {
            if (input != undefined && input.length > 0) {
                start = +start; //parse to int
                return input.slice(start);
            }
        };
    })
    //Filter to Construct name from first name and last name
    .filter('constructName', function ($filter) {
        return function (firstName, lastName) {
            if ((firstName == null || firstName == "" || firstName == 'undefined') && (lastName == null || lastName == "" || lastName == 'undefined')) {
                return "";
            }
            else if (firstName != null && lastName != null) {
                return lastName + ", " + firstName;
            }
            else if (firstName == null || firstName == "" || firstName == 'undefined') {
                return lastName;
            }
            else if (lastName == null || lastName == "" || lastName == 'undefined') {
                return firstName;
            }
        };
    })
    // US Currency with $ Format
    .filter('USCurrencyFormat', function () {
        return function (num) {
            if (num)
                return '$ ' + num.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
            else
                return '$ 0.00';
        };
    })
    //use to send as parameter for database
    .filter('DatabaseDateFormatMMddyyyyTime', function ($filter) {
        return function (input) {
            if (input === null || input === "" || angular.isUndefined(input)) { return "00-00-1971T00:00:00Z"; }
            else {
                var dt = new Date(input);
                var ISODate = new Date(dt.toISOString());
                var year = ISODate.getFullYear();
                var date = ISODate.getDate();
                if (parseInt(date) < 10)
                    date = '0' + date;
                var month = parseInt(ISODate.getMonth()) + 1;
                if (parseInt(month) < 10)
                    month = '0' + month;
                return month + '-' + date + '-' + year;
            }
        };
    })
    // Date format for get time for event details
    .filter('DateFormatMMddyyyyHHmmTimeGMT', ['$filter', function ($filter) {
        return function (input) {
            if (input === null || input === "" || angular.isUndefined(input)) { return ""; }
            if (input.indexOf('-') > -1) {
                input = (input.split('-')[2]).split('T')[0] + '-' + input.split('-')[0] + '-' + input.split('-')[1] + 'T' + (input.split('-')[2]).split('T')[1];
                // input = 2019-05-31T11:09:21Z
                var dateSp = input.split('T');
                var timeSp = dateSp[1].split("Z");
                var dateStr = dateSp[0] + " " + timeSp[0];
                var localDate = new Date(dateStr);
                var dateWithoutGMT = localDate.toString().split("GMT");
                return dateWithoutGMT[0];
            }

        };
    }])
    .filter('GenerateFileType', function ($filter) {
        return function (input) {
            switch (fileExtension.toLowerCase()) {
                case "doc":
                case "docx":
                    $scope.FileType = "application/msword";
                    break;
                case "xls":
                case "xlsx":
                    $scope.FileType = "application/vnd.ms-excel";
                    break;
                case "pps":
                case "ppt":
                    $scope.FileType = "application/vnd.ms-powerpoint";
                    break;
                case "txt":
                    $scope.FileType = "text/plain";
                    break;
                case "rtf":
                    $scope.FileType = "application/rtf";
                    break;
                case "pdf":
                    $scope.FileType = "application/pdf";
                    break;
                case "msg":
                case "eml":
                    $scope.FileType = "application/vnd.ms-outlook";
                    break;
                case "gif":
                case "bmp":
                case "png":
                case "jpg":
                    $scope.FileType = "image/JPEG";
                    break;
                case "dwg":
                    $scope.FileType = "application/acad";
                    break;
                case "zip":
                    $scope.FileType = "application/x-zip-compressed";
                    break;
                case "rar":
                    $scope.FileType = "application/x-rar-compressed";
                    break;
            }
            return $scope.FileType;
        };
    })
    //percentage
    .filter('percentage', ['$filter', function ($filter) {
        return function (input, decimals) {
            return $filter('number')(input * 1, decimals) + '%';
        };
    }])   
    // unique filter - filter out duplicates when using the ng-repeat directive
    .filter("unique", function () {
        // we will return a function which will take in a collection
        // and a keyname
        return function (collection, keyname) {
            // we define our output and keys array;
            var output = [],
                keys = [];
            // we utilize angular's foreach function
            // this takes in our original collection and an iterator function
            angular.forEach(collection, function (item) {
                // we check to see whether our object exists
                var key = item[keyname];
                // if it's not already part of our keys array
                if (keys.indexOf(key) === -1) {
                    // add it to our keys array
                    keys.push(key);
                    // push this item to our final output array
                    output.push(item);
                }
            });
            // return our array which should be devoid of
            // any duplicates
            return output;
        };
    })
    .filter("trustUrl", function($sce) {
        return function(Url) {        
            return $sce.trustAsResourceUrl(Url);
        };
    })
    .filter('DateFormatMMddyyyy', function ($filter) {
        return function (input) {
            if (input === null || input === "" || angular.isUndefined(input)) { return ""; }
            if (input.indexOf('-') > -1) {
                input = (input.split('-')[2]).split('T')[0] + '-' + input.split('-')[0] + '-' + input.split('-')[1] + 'T' + (input.split('-')[2]).split('T')[1];
                var localDate = new Date(input);
                ///var dt = new Date(localDate.toLocaleString());
                return $filter('date')(localDate, "MM/dd/yyyy");
                //return $filter('date')(dt, "MM/dd/yyyy hh:mm:ss");
            }
    
        };
    });
