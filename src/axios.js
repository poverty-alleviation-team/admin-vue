import MD5 from "./md5";
import axios from "axios";
import qs from 'qs'
const USER_INFO_KEY = 'mali_admin_info';
const MALI_DICTIONARY = 'mali_dictionary';
const apiMap = {
  adminLogin: "/admin/login",//用户登录
  getMenuList: "/admin/menu/getMenuListByRoles",//获取菜单
  getMenuListByRoleId:"/admin/menu/getMenuListByRoleId",//获取登录角色的菜单列表
  getAllMenu:"/admin/menu/getAllMenu",//获取所有菜单权限树
  getAllCampus: "/admin/campus/getAllCampus",//获取所有校区
  getAllCourse: "/admin/course/getAllCourse",//获取所有课程体系
  getAllLesson: "/admin/lesson/getAllLesson",//获取所有课次
  getAllJob: "/admin/dictionary/getAllJob",//获取所有岗位
  postOssUpload: "/admin/oss/upload",//OSS资源上传
  getDictionaryMap: "/admin/dictionary/getDictionaryMap",//获取数据词典
  getCampusSelect:"/admin/campus/select",//校区查询
    deleteCampusDel:"/admin/campus/delete",//校区删除
    postCampusAdd:"/admin/campus/add",//校区添加
    putCampusUpdate:"/admin/campus/update",//校区修改
  getEmployeeSelect:"/admin/employee/select",//员工查询
    deleteEmployeeDel:"/admin/employee/delete",//员工删除
    postEmployeeAdd:"/admin/employee/add",//员工添加
    putEmployeeUpdate:"/admin/employee/update",//员工修改
    postResetEmployeePwd:"/admin/employee/createEmployeeAccount",//员工密码修改
    getMarketerListByCampusId:"/admin/employee/getMarketerListByCampusId", //根据校区查询市场列表
    getCourseListByCampusId:"/admin/employee/getCourseListByCampusId",//根据校区查询课程顾问列表
    getTeacherListByCampusId:"/admin/employee/getTeacherListByCampusId",//根据校区查询老师列表
    getHeadTeacherListByCampusId:"/admin/employee/getHeadTeacherListByCampusId",//根据校区查询班主任列表
  getStudentSelect:"/admin/student/select",//学生查询
    deleteStudentDel:"/admin/student/delete",//学生删除
    postStudentAdd:"/admin/student/add",//学生添加
    putStudentUpdate:"/admin/student/update",//学生修改
    postStudentSignUp:"/admin/signUp",//学生报名缴费
    postStudentCreateAccount:"/admin/student/createAccount",//生成学生账号
    getStudentListByCampusId:"/admin/student/getStudentListByCampusId",//根据校区查询学生列表
  getClassSelect:"/admin/class/select",//班级查询
    deleteClassDel:"/admin/class/delete",//班级删除
    postClassAdd:"/admin/class/add",//班级添加
    putClassUpdate:"/admin/class/update",//班级修改
    postStudentToClass:"/admin/class/addStudentToClass",//分配学生
    getClassLessonListByClassId:"/admin/classLesson/getClassLessonListByClassId",//班级获取对应课次信息
  getCourseSelect:"/admin/course/select",//课程查询
    deleteCourseDel:"/admin/course/delete",//课程删除
    postCourseAdd:"/admin/course/add",//课程添加
    putCourseUpdate:"/admin/course/update",//课程修改
    getLessonsByCourseId:"/admin/course/lessons/getLessonsByCourseId",//获取课程体系的课次信息
    deleteQuoteLesson:"/admin/lesson/deleteQuoteLesson",//删除课程课次记录
  getLessonSelect:"/admin/lesson/select",//课次查询
    deleteLessonDel:"/admin/lesson/delete",//课次删除
    postLessonAdd:"/admin/lesson/add",//课次添加
    putLessonUpdate:"/admin/lesson/update",//课次修改
    postLessonToCourse:"/admin/lesson/addLessonIds",//批量引用课次
    updateClassLesson:"/admin/classLesson/updateClassLesson",//更新班级对应课次的信息
  getRoleSelect:"/admin/role/select",//岗位查询
    deleteRoleDel:"/admin/role/delete",//岗位删除
    postRoleAdd:"/admin/role/add",//岗位添加
    putRoleUpdate:"/admin/role/update",//岗位修改
  getTeacherClassLog:"/admin/classLog/teacherClassLog/select",//老师上课记录查询
  getStudentClassLog:"/admin/classLog/studentClassLog/select",//学生上课记录查询
  getOperationLog:"/admin/log/operationLog/select",//操作日志查询
  statisticsStudentTypes:"/admin/statistics/studentStatusLog/select",//学生分类统计
  statisticsStudentChange:"/admin/statistics/studentStatusChangeLog/select",//学生状态统计
  statisticsTeacherConsume:"/admin/statistics/teacherConsumeLog/select",//耗课统计
};
// 获取环境变量
var env = localStorage["app_env"];

if (env && env.length > 0) {
} else {
  var getEnv = function(name) {
    var req = new XMLHttpRequest();
    req.open("GET", window.location.href, false);
    req.send(null);
    var env = req.getResponseHeader(name) || "local";
    return env.toLowerCase();
  };
  env = localStorage["app_env"] = getEnv("SY_APPLICATION_ENV");
}

var baseUrl = "";
switch (env) {
  case "local":
    baseUrl = "http://localhost:8088";
    break;
  case "prerelease":
    baseUrl = "http://admin-test.codemali.com:8088";
    break;
  case "master":
    baseUrl = "http://admin.codemali.com:8088"; // todo
    break;
  default:
    baseUrl = "http://admin.codemali.com:8088"; // todo
    break;
}
// 获取环境变量 end

axios.defaults.baseURL = baseUrl;
function formatUrl(url) {
  let appData = [];
  let stringA = apiMap[url] + "?";
  let signString = "";
  let keyArr = [];
  let i = 0;
  appData["sid"] = localStorage["sid"];
  appData["debug"] = 1;
  appData["nonce_str"] = generateNonceString(10);
  appData["nonce_time"] = Date.parse(new Date()) / 1000;
  for (let info in appData) {
    keyArr[i] = info;
    i++;
  }
  keyArr = keyArr.sort();
  for (var index in keyArr) {
    if (
      appData[keyArr[index]] !== undefined &&
      appData[keyArr[index]] !== "undefined"
    ) {
      stringA =
        stringA +
        keyArr[index] +
        "=" +
        ajaxUrlEncode(appData[keyArr[index]]) +
        "&";
      signString =
        signString +
        keyArr[index] +
        "=" +
        ajaxUrlEncode(appData[keyArr[index]]) +
        "&";
    }
  }
  let stringSignTemp = signString + "key=19xxx06250bxxx9247ec02edce69f6a2d"; //注：key为商户平台设置的密钥key
  let sign = MD5.hex_md5(stringSignTemp).toUpperCase(); //注：MD5签名方式
  stringA = stringA + "sign=" + sign;
  return stringA;
}
function ajaxUrlEncode(string) {
  string = string + "";
  string = encodeURIComponent(string);
  string = string.replace(/%20/g, "+");
  let asciiStr = "~'";
  let encodeStr = "%7e%27";
  for (var i = 0; i < asciiStr.length; i++) {
    let replaceStr = asciiStr.substr(i, 1);
    let changeStr = encodeStr.substr(i * 3, 3);
    string = string.replace(new RegExp(replaceStr, "g"), changeStr);
  }
  return string;
}

function cleanArray(actual) {
  const newArray = [];
  for (let i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i]);
    }
  }
  return newArray;
}
// 将一个对象转成QueryString
function toQueryString(obj) {
  if (!obj) return "";
  return cleanArray(
    Object.keys(obj).map(key => {
      if (obj[key] === undefined) return "";
        return encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]);
    })
  ).join("&");
}
function get(params) {
  if(params.url != 'adminLogin'){
    const cr = checkAdminInfo();
    if(cr === false){
      this.$router.push({ path:'/login'});
    }
  }
  axios
    .get(apiMap[params.url], {
      params: params.data
    })
    .then(res => {
      let result = res.data;
      if (result.code === 0) {
        params.success(result.data,result.msg);
      } else {
        params.error(result);
      }
    })
    .catch(res => {
      if(res.response.status === 403 || res.response.status === 500){
        const data = {code:403,msg:res.response.data.message,data:false};
        params.error(data);
        return false;
      }
      if (params.error) {
        params.error(res);
      }
    });
}

function post(params) {
  if(params.url != 'adminLogin'){
    const cr = checkAdminInfo();
    if(cr === false){
      this.$router.push({ path:'/login'});
    }
  }
  
  axios({
    method: "POST",
    url: apiMap[params.url],
    data: params.data
  })
  .then(res => {
    let result = res.data;
    if (result.code === 0) {
      params.success(result.data,result.msg);
    } else {
      params.error(result);
    }
  })
  .catch(res => {
    if(res.response.status === 403 || res.response.status === 500){
      const data = {code:403,msg:res.response.data.message,data:false};
      params.error(data);
      return false;
    }
    if (params.error) {
      params.error(res);
    }
  });
}
function postFile(params) {
  let config = {
    //添加请求头
    headers: { "Content-Type": "multipart/form-data" },
    //添加上传进度监听事件
    onUploadProgress: e => {
      var completeProgress = ((e.loaded / e.total * 100) | 0) + "%";
      this.progress = completeProgress;
    }
  };
  axios({
    method: "POST",
    url: apiMap[params.url],
    data: params.data,
    config:config,
  })
  .then(res => {
    let result = res.data;
    if (result.code === 0) {
      params.success(result.data,result.msg);
    } else {
      params.error(result);
    }
  })
  .catch(res => {
    if (params.error) {
      params.error(res);
    }
  });
}
function mothodAx(params,method) {
  if(params.url != 'adminLogin'){
    const cr = checkAdminInfo();
    if(cr === false){
      this.$router.push({ path:'/login'});
    }
  }
  const axiosObj = {
    method: method,
    url: apiMap[params.url],
    data: params.data
  }
  if (method === 'DELETE') {
    axiosObj.params = params.data;
    axiosObj.paramsSerializer =  params => {
      return qs.stringify(params, {indices: false});
    };
  }
  axios(axiosObj)
  .then(res => {
    let result = res.data;
    if (result.code === 0) {
      params.success(result.data,result.msg);
    } else {
      params.error(result);
    }
  })
  .catch(res => {
    if(res.response.status === 403 || res.response.status === 500){
      const data = {code:403,msg:res.response.data.message,data:false};
      params.error(data);
      return false;
    }
    if (params.error) {
      params.error(res);
    }
  });
}

function checkAdminInfo(){
  var maliAdminInfo = localStorage[USER_INFO_KEY];
  if (maliAdminInfo && maliAdminInfo.length > 0) {
      let val = JSON.parse(maliAdminInfo);
      if((Date.now()-val.time)/1000>val.expire){
        localStorage.removeItem(USER_INFO_KEY);
        localStorage.removeItem(MALI_DICTIONARY);
        return false;
      } else {
        axios.defaults.headers.Authorization =   'Bearer ' + val.access_token;
        return val;
      }
  } else {
      return false;
  }
}
// 获取一次性字符串
function generateNonceString(length) {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var maxPos = chars.length;
  var noceStr = "";
  for (var i = 0; i < (length || 32); i++) {
    noceStr += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return noceStr;
}

export default { post, get,postFile, checkAdminInfo,mothodAx};
