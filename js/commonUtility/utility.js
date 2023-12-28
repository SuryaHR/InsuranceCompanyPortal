angular.module('MetronicApp').factory('utility', ['$http', '$rootScope', function () {

var search = 
function search(list,prop,keyword,checkedlist,selectAllid)
{
    var arr=  list.filter((obj)=>{
        if(obj[prop].toString().toLowerCase().match(keyword.toLowerCase())!=null)
        return true
        else
        return false
    });

    var ele = document.getElementById(selectAllid);
    if(arr.length <= checkedlist.length)
    {
      ele.checked = true;   
    }
    else
    {
      ele.checked = false;
    }

    return arr;
  
}

var handleChange =
function handleChange(event,list,id,dropdownlist,selectAllid)
{
    if(event.target.checked)
    {
      
        list.push(event.target.value.toString())   
        // var ele = document.getElementById(id);
        // ele.checked = true;

    }
    else
    {
        
        list =list.filter((element)=> element!=event.target.value)   
        var ele = document.getElementById(id);
        ele.checked = false;
    }
    var ele = document.getElementById(selectAllid);
    if(dropdownlist.length <=list.length)
    {
      ele.checked = true;   
    }
    else
    {
      ele.checked = false;
    }
    return list;
}

 var handleSelectAll =
function handleSelectAll(event,totallist,dropdownlist,prop,idName)
{
    var resultList = [];
    var id;
    var selectAllid = event.target.id;
    if(event.target.checked)
    {
        totallist.forEach(value => {
        id = idName+value[prop];
      handleChange({target: {"value": value[prop].toString(), checked:true}},dropdownlist,id,totallist,selectAllid)
    })
    // var elements = document.getElementsByClassName(className);
    // angular.forEach(elements,(ele)=>{ ele.checked=true;})

    resultList = totallist.map((x)=>x[prop])
  }
  else
  {
    totallist.forEach(value => {
      id = idName+value[prop];
      handleChange({target: {"value":value[prop].toString(), checked:false}},dropdownlist,id,totallist,selectAllid)
      })
    //   var elements = document.getElementsByClassName(className);
    //   angular.forEach(elements,(ele)=>{ ele.checked=false;})
 }
 return resultList;
}

var find = 
function find(keyword,list,searchProp,resProp)
{
    if(list && list!=null){
      var a= list.filter((element)=> element[searchProp]==keyword);
      return a[0][resProp];
    }
    return null;
}

var clear = 
function clear(value,list,id,totallist,selectAllid)
{
    changeCheck(false,id);
    if(list.includes(value))
    {
        list =list.filter((ele)=> ele!=value)   
    }

    var ele = document.getElementById(selectAllid);
    if(list.length == totallist.length)
    {
      ele.checked = true;   
    }
    else
    {
      ele.checked = false;
    }

    return list;


}

var clearAll = 
function clearAll(totallist,dropdownlist,prop,idName,selectAllid)
{
  var list =  handleSelectAll({target:{checked:false , id :selectAllid}},totallist,dropdownlist,prop,idName)
  dropdownlist.forEach(value=>{
    id = idName+value;
    changeCheck(false,id);
  });
  return list;
}

var changeCheck =
function changeCheck(check,id)
{
    var element = document.getElementById(id);
    element.checked = check;
}

var checkValues = 
function checkValues(value,list)
{
  return list.includes(value);
}

return {
    search : search,
    handleChange : handleChange,
    handleSelectAll : handleSelectAll,
    find : find,
    clear : clear,
    clearAll : clearAll,
    checkValues : checkValues
};
}]);
