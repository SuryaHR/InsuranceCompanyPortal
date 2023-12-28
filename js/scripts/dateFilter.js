angular.module('MetronicApp').filter('DateFilter', ['$filter', function ($filter) {
    return function (input) {
        if (input == null) { return ""; }
        return $filter('date')(new Date(getDateOUrFormat(input)), 'dd-MM-yyyy');
    };
}]);
angular.module('MetronicApp').filter('TimeFilter', ['$filter', function ($filter) {
    return function (input) {
        if (input == null) { return ""; }
        return $filter('date')(new Date(getDateOUrFormat(input)), 'HH:mm:ss');
    };
}]);
angular.module('MetronicApp').filter('TimeFilterHHmm', ['$filter', function ($filter) {
    return function (input) {
        if (input == null) { return ""; }
        return $filter('date')(new Date(getDateOUrFormat(input)), 'HH:mm');
    };
}]);
angular.module('MetronicApp').filter('TimeFilterAMPM', ['$filter', function ($filter) {
    return function (input) {
        if (input == null) { return ""; }
        return $filter('date')(new Date(getDateOUrFormat(input)), 'hh:mma');
    };
}]);
angular.module('MetronicApp').filter('DateTimeFilter', ['$filter', function ($filter) {
    return function (input) {
        if (input == null) { return ""; }
        var _date = $filter('date')(new Date(getDateOUrFormat(input)), 'dd-MM-yyyy hh:mm');
        return _date;
    };
}]);
angular.module('MetronicApp').filter('DateTimeFilterAMPM', ['$filter', function ($filter) {
    return function (input) {
        if (input == null) { return ""; }
        var _date = $filter('date')(new Date(getDateOUrFormat(input)), 'dd-MM-yyyy hh:mma');
        return _date;
    };
}]);
angular.module('MetronicApp').filter('MediumDateFilter', function ($filter) {
    return function (input) {
        if (input == null) { return ""; }
        return $filter('date')(new Date(getDateOUrFormat(input)), 'EEE MMM dd yyyy hh:mm a');
    };
});
angular.module('MetronicApp').filter('formatDate', function ($filter) {
    return function (input) {
        if (input === null || input === "" || angular.isUndefined(input)) { return ""; }
        if (input.indexOf(':') > -1) {
            // input = (input.split('-')[2]).split('T')[0] + '-' + input.split('-')[0] + '-' + input.split('-')[1] + 'T' + (input.split('-')[2]).split('T')[1];
            var a = input.split('T');
            var localDate = new Date(a[0]);
            var dt = new Date(localDate);
            return $filter('date')(dt, "MM/dd/yyyy");
        }
        else {
            var localDate = new Date(input);
            var dt = new Date(localDate);
            return $filter('date')(dt, "MM/dd/yyyy");
        }
    };
});

//Convert date and time in acceptable format
function getDateOUrFormat(input) {
    var datetemp = input.split('T')[0];
    var dt = new Date(datetemp);
    var year = dt.getFullYear();
    var date = dt.getDate();
    if (parseInt(date) < 10)
        date = '0' + date;
    var month = parseInt(dt.getMonth()) + 1;
    if (parseInt(month) < 10)
        month = '0' + month;
    var time = (input.split('T')[1]).split('Z')[0];
    // time = time + '.000Z';
    return year + '-' + month + '-' + date + 'T' + time;
}

angular.module('MetronicApp').filter('DatabaseDateFormat', ['$filter', function ($filter) {
    return function (input) {
        if (input == null || input === "") { return "00-00-1971T00:00:00Z"; }
        if (input.indexOf('-') > -1) {
            input = input.split('-')[2] + '-' + input.split('-')[1] + '-' + input.split('-')[0];
        }
        else {
            input = input.split('/')[2] + '-' + input.split('/')[1] + '-' + input.split('/')[0];
        }
        var dt = new Date(input);
        var year = dt.getFullYear();
        var date = dt.getDate();
        if (parseInt(date) < 10)
            date = '0' + date;
        var month = parseInt(dt.getMonth()) + 1;
        if (parseInt(month) < 10)
            month = '0' + month;
        return month + '-' + date + '-' + year + 'T' + '00:00:00Z';
    };
}]);

//use to send as parameter for database
angular.module('MetronicApp').filter('DatabaseDateFormatMMddyyyy', ['$filter', function ($filter) {
    return function (input) {
        try {
            if (input === null || input === "" || angular.isUndefined(input)) { return null; }
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
                return month + '-' + date + '-' + year + 'T' + '00:00:00Z';
            }

            //if (input.indexOf('-') > -1) {
            //    input = input.split('-')[2] + '-' + input.split('-')[0] + '-' + input.split('-')[1];
            //}
            //else {
            //    input = input.split('/')[2] + '-' + input.split('/')[0] + '-' + input.split('/')[1];
            //}
        } catch (error) {
            console.log(error);
        }

    };
}]);

// to get only date from databse date
angular.module('MetronicApp').filter('DateFormatMMddyyyy', function ($filter) {
    return function (input) {
        if (input === null || input === "" || angular.isUndefined(input)) { return ""; }
        if (input.indexOf('-') > -1) {
            input = (input.split('-')[2]).split('T')[0] + '-' + input.split('-')[0] + '-' + input.split('-')[1] + 'T' + (input.split('-')[2]).split('T')[1];
            var localDate = new Date(input);
            return $filter('date')(localDate, "MM/dd/yyyy");
        }
    };
});
// to get date and time from databse date
angular.module('MetronicApp').filter('DateFormatMMddyyyyHHmm', function ($filter) {
    return function (input) {
        if (input === null || input === "" || angular.isUndefined(input)) { return ""; }
        if (input.indexOf('-') > -1) {
            // console.log(input);
            //UTC Time
            let localDate = (input.split('-')[2]).split('T')[0] + '-' + input.split('-')[0] + '-' + input.split('-')[1]
                + 'T' + (input.split('-')[2]).split('T')[1];
            // var time = input.split('T')[1];
            // var localDate = new Date((input.split('-')[2]).split('T')[0],parseInt(input.split('-')[0])-1,
            // input.split('-')[1],time.split(':')[0],time.split(':')[1],time.split(':')[2].slice(0,-1));
            ///var dt = new Date(localDate.toLocaleString());
            return $filter('date')(localDate, "MM/dd/yyyy hh:mm a");
            //return $filter('date')(dt, "MM/dd/yyyy hh:mm:ss");
        }
    };
});

// to get date and time from databse date
angular.module('MetronicApp').filter('DateFormatMMddyyyyHHmmZoneLess', function ($filter) {
    return function (input) {
        if (input === null || input === "" || angular.isUndefined(input)) { return ""; }
        if (input.indexOf('-') > -1) {
            let localDate = (input.split('-')[2]).split('T')[0] + '-' + input.split('-')[0] + '-' + input.split('-')[1]
                + 'T' + (input.split('-')[2]).split('T')[1];
            return $filter('date')(localDate.slice(0, -1), "MM/dd/yyyy hh:mm a");
        }
    };
});


// to get time from databse date
angular.module('MetronicApp').filter('DateFormatTime', ['$filter', function ($filter) {
    return function (input) {
        if (input === null || input === "" || angular.isUndefined(input)) { return ""; }
        if (input.indexOf('-') > -1) {
            input = (input.split('-')[2]).split('T')[0] + '-' + input.split('-')[0] + '-' + input.split('-')[1] + 'T' + (input.split('-')[2]).split('T')[1];
            var localDate = new Date(input);
            return $filter('date')(localDate, "hh:mm a");
        }

    };
}]);

//Todays date
angular.module('MetronicApp').filter('TodaysDate', ['$filter', function ($filter) {
    return function () {
        var dt = new Date();
        var year = dt.getFullYear();
        var date = dt.getDate();
        if (parseInt(date) < 10)
            date = '0' + date;
        var month = parseInt(dt.getMonth()) + 1;
        if (parseInt(month) < 10)
            month = '0' + month;
        return month + '/' + date + '/' + year;
    }
}]);
angular.module('MetronicApp').filter('TodaysDateCal', ['$filter', function ($filter) {
    return function () {
        var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];;
        var dt = new Date();
        var year = dt.getFullYear();
        var date = dt.getDate();
        if (parseInt(date) < 10)
            date = '0' + date;

        return date + '/' + monthNames[dt.getMonth()] + '/' + year;
    }
}]);

// Date format for get time for event details
angular.module('MetronicApp').filter('DateFormatMMddyyyyHHmmTime', ['$filter', function ($filter) {
    return function (input) {
        if (input === null || input === "" || angular.isUndefined(input)) { return ""; }
        if (input.indexOf('-') > -1) {
            input = (input.split('-')[2]).split('T')[0] + '-' + input.split('-')[0] + '-' + input.split('-')[1] + 'T' + (input.split('-')[2]).split('T')[1];
            var localDate = new Date(input);
            var dt = new Date(localDate.toLocaleString());
            //return $filter('date')(dt, "MM/dd/yyyy h:mma");
            return $filter('date')(dt, "MM/dd/yyyy HH:mm:ss");
        }

    };
}]);

// Date format for calender
angular.module('MetronicApp').filter('DateFormatyyyyMMddHHmmTime', ['$filter', function ($filter) {
    return function (input) {
        if (input === null || input === "" || angular.isUndefined(input)) { return ""; }
        if (input.indexOf('-') > -1) {
            // input = (input.split('-')[2]).split('T')[0] + '-' + input.split('-')[0] + '-' + input.split('-')[1] + 'T' + (input.split('-')[2]).split('T')[1];
            var time = input.split('T')[1];
            var localDate = new Date((input.split('-')[2]).split('T')[0], parseInt(input.split('-')[0]) - 1,
                input.split('-')[1], time.split(':')[0], time.split(':')[1]);
            // var dt = new Date(localDate.toLocaleString());
            //return $filter('date')(dt, "MM/dd/yyyy h:mma");
            return $filter('date')(localDate, "yyyy-MM-dd HH:mm:ss");
        }

    };
}]);

angular.module('MetronicApp').filter('DateFormatMMddyyyyTime', ['$filter', function ($filter) {
    return function (input) {
        if (input === null || input === "" || angular.isUndefined(input)) { return ""; }
        if (input.indexOf('-') > -1) {
            input = (input.split('-')[2]).split('T')[0] + '-' + input.split('-')[0] + '-' + input.split('-')[1] + 'T' + (input.split('-')[2]).split('T')[1];
            // var time = input.split('T')[1];
            // var localDate = new Date((input.split('-')[2]).split('T')[0],parseInt(input.split('-')[0])-1,
            // input.split('-')[1],time.split(':')[0],time.split(':')[1]);
            // var dt = new Date(localDate.toLocaleString());
            //return $filter('date')(dt, "MM/dd/yyyy h:mma");
            return $filter('date')(input, "yyyy-MM-dd HH:mm:ss");
        }

    };
}]);
angular.module('MetronicApp').filter('DateFormatyyyyMMdd', ['$filter', function ($filter) {
    return function (input) {
        if (input === null || input === "" || angular.isUndefined(input)) { return ""; }
        if (input.indexOf('-') > -1) {
            input = (input.split('-')[2]).split('T')[0] + '-' + input.split('-')[0] + '-' + input.split('-')[1] + 'T' + (input.split('-')[2]).split('T')[1];
            // var time = input.split('T')[1];
            // var localDate = new Date((input.split('-')[2]).split('T')[0],parseInt(input.split('-')[0])-1,
            // input.split('-')[1],time.split(':')[0],time.split(':')[1]);
            // var dt = new Date(localDate.toLocaleString());
            //return $filter('date')(dt, "MM/dd/yyyy h:mma");
            return $filter('date')(input, "yyyy-MM-dd");
        }

    };
}]);

//Consider date format from server if of format 02-18-2021T22:04:18Z (MM-dd-yyyyT---Z)
//Which contains Z - Zone. Using new Date() will auto convert given
//input to browsers time zone automatically
angular.module('MetronicApp').filter('DateFormatmedium', ['$filter', function ($filter) {
    return function (input) {
        if (input === null || input === "" || angular.isUndefined(input)) { return ""; }
        if (input.indexOf('-') > -1) {
            input = (input.split('-')[2]).split('T')[0] + '-' + input.split('-')[0] + '-' + input.split('-')[1] + 'T' + (input.split('-')[2]).split('T')[1];
            let localDate = new Date(input);
            return $filter('date')(localDate, 'EEE, MMM d, y h:mm a');
        }
    };
}]);

//Consider date format from server if of format 02-18-2021T22:04:18Z (MM-dd-yyyyT---Z)
//Which contains Z - Zone. Using new Date() will auto convert given
//input to browsers time zone
angular.module('MetronicApp').filter('DateTimeFormatShort', ['$filter', function ($filter) {
    return function (input) {
        if (input === null || input === "" || angular.isUndefined(input)) { return ""; }
        if (input.indexOf('-') > -1) {
            input = (input.split('-')[2]).split('T')[0] + '-' + input.split('-')[0] + '-' + input.split('-')[1] + 'T' + (input.split('-')[2]).split('T')[1];
            let localDate = new Date(input);
            return $filter('date')(localDate, 'MMM d, y h:mm a');
        }
    };
}]);
angular.module('MetronicApp').filter('DateTimeFormatMMMdyyyy', ['$filter', function ($filter) {
    return function (input) {
        if (input === null || input === "" || angular.isUndefined(input)) { return ""; }
        if (input.indexOf('-') > -1) {
            input = (input.split('-')[2]).split('T')[0] + '-' + input.split('-')[0] + '-' + input.split('-')[1] + 'T' + (input.split('-')[2]).split('T')[1];
            let localDate = new Date(input);
            return $filter('date')(localDate, 'MMM d, y');
        }
    };
}]);
//Consider date format from server if of format 02-18-2021T22:04:18Z (MM-dd-yyyyT---Z)
//Which contains Z - Zone. Using new Date() will auto convert given
//input to browsers time zone automatically
angular.module('MetronicApp').filter('DateTimeDiff', ['$filter', function ($filter) {
    return function (input) {
        let now = new Date();
        if (input === null || input === "" || angular.isUndefined(input)) { return ""; }
        if (input.indexOf('-') > -1) {
            input = (input.split('-')[2]).split('T')[0] + '-' + input.split('-')[0] + '-' + input.split('-')[1] + 'T' + (input.split('-')[2]).split('T')[1];
            let localDate = new Date(input);
            if ($filter('date')(localDate, 'MM/dd/yyyy') === $filter('date')(now, 'MM/dd/yyyy'))
                return $filter('date')(localDate, 'h:mm a');
            else
                return $filter('date')(localDate, 'MMM d, h:mm a');
        }
    };
}]);

//Consider date format from server is a UTC datetime 02-18-2021T22:04:18Z (of format MM-dd-yyyyT---Z)
//Which contains Z - Zone. Using new Date() will auto convert given
//input to browsers time zone automatically
angular.module('MetronicApp').filter('DateTimeMMddyyyyhmmTime', ['$filter', function ($filter) {
    return function (input) {
        if (input === null || input === "" || angular.isUndefined(input)) { return ""; }
        if (input.indexOf('-') > -1) {
            input = (input.split('-')[2]).split('T')[0] + '-' + input.split('-')[0] + '-' + input.split('-')[1] + 'T' + (input.split('-')[2]).split('T')[1];
            let localDate = new Date(input);
            return $filter('date')(localDate, 'MM/dd/yyyy h:mm a');
        }
    };
}]);

// Client side - date format according to time zone
//Input is of type timestamp
angular.module('MetronicApp').filter('formatDateTimezone', ['$filter', function ($filter) {
    return function (input) {
        var formattedTime = new Date(input);
        return $filter('date')(formattedTime,'dd MMM yyyy hh:mm a')
    };
}])

//Filter to convert user date time input to UTC to save in DB
angular.module('MetronicApp').filter('DatabaseDateFormatMMddyyyyTimeUTC', ['$filter', function ($filter) {
    return function (input) {
        if (input == null || input === "") { return "00-00-1971T00:00:00Z"; }
        var dt = new Date(input).toUTCString();
        var ISODate = new Date(dt).toISOString();
        if (ISODate.indexOf('-') > -1)
            return ISODate.split('-')[1] + '-' + (ISODate.split('-')[2]).split('T')[0] + '-' + ISODate.split('-')[0]
                + 'T' + (ISODate.split('T')[1]).split('Z')[0].split('.')[0] + 'Z';
    };
}]);

angular.module('MetronicApp').filter('DateTimeFormatMMMDDT', ['$filter', function ($filter) {
    return function (input) {
        if (input === null || input === "" || angular.isUndefined(input)) { return ""; }
            var localDate = new Date(input);
           return $filter('date')(localDate,'MMM dd yyyy hh:mm a');
            // var d = localDate.format('MMM DD');
            // d = d + lettersForDate(localDate.format('DD'));
            // return d + ' ' + localDate.format('hh:mmA') +' ' +'CST';

    };
}]);

angular.module('MetronicApp').filter('fullDate', function ($filter) {
    return function (input) {
        if (input === null || input === "" || angular.isUndefined(input)) { return ""; }
        if (input.indexOf('-') > -1) {
            input = (input.split('-')[2]).split('T')[0] + '-' + input.split('-')[0] + '-' + input.split('-')[1] + 'T' + (input.split('-')[2]).split('T')[1];
            var localDate = new Date(input);
            ///var dt = new Date(localDate.toLocaleString());
            const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };

            return localDate.toLocaleDateString("en-us",options);
            //return $filter('date')(dt, "MM/dd/yyyy hh:mm:ss");
        }

    };
});

angular.module('MetronicApp').filter('UTCDateTimeTOLocalTimeZone', ['$filter', function ($filter) {
    return function (input) {
        var delimiter = "/";
        if (input === null || input === "" || angular.isUndefined(input)) { return ""; }
            var localDate = new Date(input);
            var month = (localDate.getMonth() + 1) < 10 ? '0' + (localDate.getMonth() + 1) : (localDate.getMonth() + 1);
            var date =  localDate.getDate() < 10 ? '0' + localDate.getDate() : localDate.getDate();
           return month + delimiter + date + delimiter + localDate.getFullYear();
            // var d = localDate.format('MMM DD');
            // d = d + lettersForDate(localDate.format('DD'));
            // return d + ' ' + localDate.format('hh:mmA') +' ' +'CST';

    };
}]);

function lettersForDate (number) {
  if (isNaN(number) || number < 1){
        return '';
    } else if (number % 100 == 11 || number % 100 == 12) {
        return 'th';
    } else {
        var lastDigit = number % 10;
        if (lastDigit === 1) {
            return 'st';
        } else if (lastDigit === 2) {
            return 'nd';
        } else if (lastDigit === 3) {
            return 'rd';
        } else if (lastDigit > 3) {
            return 'th';
        }
    }

}

