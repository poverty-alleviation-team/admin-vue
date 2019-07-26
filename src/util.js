const maliDictionaryMap = [];
const campusOption = [];
const jobOption = [];
const courseOption = [];
const lessonOption = [];
const cdnUrl = 'https://cdn.scratch.codemali.com/';
var serverUrl = 'http://admin.codemali.com:8088/';
function getOssData(reData, file, rename = 0) {
  var ossData = new FormData();
  var date = new Date();
  var suffix = file.file.name.split(".")[1]; //后缀名
  var fileName = file.file.name.split(".")[0]; //后缀名
  var s = date.getTime();
  var ss = date.getMilliseconds();
  var filepathName = reData.dir + "/" + s + ss + "." + suffix;

  if (rename && rename > 0) {
    filepathName = reData.dir + "/" + fileName + '_' + s + "." + suffix;
  }

  ossData.append("name", file.file.name);
  ossData.append("key", filepathName);
  ossData.append("policy", reData.policy);
  ossData.append("OSSAccessKeyId", reData.accessid);
  ossData.append("success_action_status", 201);
  ossData.append("signature", reData.signature);
  ossData.append("file", file.file, file.file.name);
  return { ossData: ossData, filepathName: filepathName };
}

function getOssDataBlob(reData, filePath) {
  var ossData = new FormData();
  var date = new Date();
  var suffix = filePath.split(".")[1]; //后缀名
  var fileName = filePath.split("/").pop(); //后缀名
  var s = date.getTime();
  var ss = date.getMilliseconds();
  var filepathName = reData.dir + "/" + suffix + s + ss + "." + suffix;
  ossData.append("name", fileName);
  ossData.append("key", filepathName);
  ossData.append("policy", reData.policy);
  ossData.append("OSSAccessKeyId", reData.accessid);
  ossData.append("success_action_status", 201);
  ossData.append("signature", reData.signature);
  ossData.append("file", file.file, fileName);
  return { ossData: ossData, filepathName: filepathName };
}

function videoPlayBox(that, videoUrl) {
  that
    .$confirm(
      '<video id="videoPlayBox" controls="" autoplay="" name="media"><source src="' +
        videoUrl +
        '" type="audio/mp3"></video>',
      "音频播放器",
      {
        dangerouslyUseHTMLString: true,
        distinguishCancelAndClose: true,
        showConfirmButton: false,
        showCancelButton: false,
        type: "success"
      }
    )
    .catch(function(action) {
      var myVideo = document.querySelector("#videoPlayBox");
      if (!myVideo.paused) {
        myVideo.pause();
      }
    });
}

function getImgUrl(path) {
  return "http://hello-chinese.oss-cn-hangzhou.aliyuncs.com/" + path + "-w";
}

function formatDateTime(timeStamp) {
  var date = new Date();
  date.setTime(timeStamp * 1000);
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? "0" + m : m;
  var d = date.getDate();
  d = d < 10 ? "0" + d : d;
  var h = date.getHours();
  h = h < 10 ? "0" + h : h;
  var minute = date.getMinutes();
  var second = date.getSeconds();
  minute = minute < 10 ? "0" + minute : minute;
  second = second < 10 ? "0" + second : second;
  return y + "-" + m + "-" + d + " " + h + ":" + minute + ":" + second;
}
function formatDateFtt(fmt,date){
  var o = {   
    "M+" : date.getMonth()+1,                 //月份   
    "d+" : date.getDate(),                    //日   
    "h+" : date.getHours(),                   //小时   
    "m+" : date.getMinutes(),                 //分   
    "s+" : date.getSeconds(),                 //秒   
    "q+" : Math.floor((date.getMonth()+3)/3), //季度   
    "S"  : date.getMilliseconds()             //毫秒   
  };   
  if(/(y+)/.test(fmt))   
    fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));   
  for(var k in o)   
    if(new RegExp("("+ k +")").test(fmt))   
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
  return fmt;   
}
function dataFormatter(row,subkey){
  var reg=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{2}:\d{2}$/;   /*定义验证表达式*/
  if(reg.test(row[subkey]) === true){
    var date = new Date(row[subkey]).toJSON();
    var newDate=new Date(+new Date(date)+8*3600*1000).toISOString().replace(/T/g,' ').replace(/\.[\d]{3}Z/,'');
    row[subkey] = newDate;
  }
  return row[subkey];
}
function dataRowFormatter(row){
  var reg=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{2}:\d{2}$/;   /*定义验证表达式*/
  for(var subkey in row){
    if(reg.test(row[subkey]) === true){
      var date = new Date(row[subkey]).toJSON();
      var newDate=new Date(+new Date(date)+8*3600*1000).toISOString().replace(/T/g,' ').replace(/\.[\d]{3}Z/,'');
      row[subkey] = newDate;
    }
  }
  return row;
}
export default {
  getOssData: getOssData,
  videoPlayBox: videoPlayBox,
  getImgUrl: getImgUrl,
  time2str: formatDateTime,
  dataFormatter:dataFormatter,
  dataRowFormatter:dataRowFormatter,
  formatDateFtt: formatDateFtt,
  maliDictionaryMap: maliDictionaryMap,
  campusOption: campusOption,
  jobOption: jobOption,
  courseOption:courseOption,
  lessonOption:lessonOption,
  cdnUrl:cdnUrl,
  serverUrl:serverUrl,
};
