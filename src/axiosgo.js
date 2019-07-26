import MD5 from "./md5";
import axios from "axios";
const USER_INFO_KEY = "mali_admin_info2";
const apiMap = {
  adminLogin: "/sso/auth/login", //用户登录
  adminLogout: "/sso/auth/logout", //用户退出
  getOssToken: "/common/oss/token", //oss token

  getAllMenu: "/public/menu/listsSelf", //获取登录用户的显示菜单

  getMenuList: "/public/menu/lists", //获取角色获取权限树
  getMenuIdsByRoleId: "/public/menu/getIdsOfRoleId", //获取角色获取权限集合
  postMenuUpdate: "public/menu/createOrEdit", //创建编辑菜单

  getAllCampus: "/public/campus/lists", //获取所有校区
  getAllCourse: "/teach/course/list", //获取所有课程体系
  getAllLesson: "/teach/lesson/list", //获取所有课次
  getAllJob: "/public/department/getSubJobs", //获取所有岗位
  getDictionaryMap: "/public/dictionary/lists", //获取数据词典

  getCampusSelect: "/public/campus/listsByPage", //校区查询
  deleteCampusDel: "/public/campus/delete", //校区删除
  putCampusUpdate: "/public/campus/createOrEdit", //校区创建及编辑
  getEmployeeSelect: "/user/user/list", //员工查询
  deleteEmployeeDel: "/user/user/delete", //员工删除
  postEmployeeAdd: "/user/user/add", //员工添加
  putEmployeeUpdate: "/user/user/update", //员工修改
  postResetEmployeePwd: "/user/user/restpassword", //员工密码修改
  getEmployeeListByCampusId: "/user/user/listByCampusId", //根据校区查询用户列表
  getEmployeeListByClassId: "/user/user/listByClassId", //根据校区查询用户列表
  getStudentSelect: "/student/user/listsByPage", //学生查询
  deleteStudentDel: "/student/user/delete", //学生删除
  putStudentUpdate: "/student/user/createOrEdit", //学生创建及修改
  postStudentSignUp: "/student/signUp/AddSign", //学生报名缴费
  postStudentCreateAccount: "/student/user/updateStatus", //生成学生账号
  getStudentListByCampusId: "/student/user/listsByPage", //根据校区查询学生列表
  getStudentListByClassId: "/student/user/listsOfClass", //根据班级查询学生列表
  getStudentSignUpList: "/student/signUp/getList", //根据学生获取合同列表

  getClassSelect: "/teach/class/listsByPage", //班级查询
  deleteClassDel: "/teach/class/delete", //班级删除
  putClassUpdate: "/teach/class/createOrEdit", //班级创建及修改
  postStudentToClass: "/teach/class/bindStudentId", //分配学生
  getClassLessonListByClassId: "/teach/class/listOfLession", //班级获取对应课次信息
  getClassCourseListByClassId: "teach/class/listOfCourse", //班级获取对应课程信息
  deleteClassCourseLesson: "/teach/class/removeLesson", //删除班级对应课程及这是课次
  postCreateClassLessons: "teach/class/createLessons", //创建班级课程及课次
  getCourseSelect: "/teach/course/listsByPage", //课程查询
  deleteCourseDel: "/teach/course/delete", //课程删除
  putCourseUpdate: "/teach/course/createOrEdit", //课程创建及修改
  deleteQuoteLesson: "/teach/lesson/delete", //删除课程课次记录
  getLessonSelect: "/teach/lesson/listsByPage", //课次查询
  deleteLessonDel: "/teach/lesson/delete", //课次删除
  putLessonUpdate: "/teach/lesson/createOrEdit", //课次修改
  postLessonRollbackList: "/teach/lesson/rollbackList", //课次回滚列表
  postLessonRollback: "/teach/lesson/rollback", //课次回滚


  postLessonToCourse: "/teach/lesson/bindCourseLesson", //批量引用课次
  updateClassLesson: "/teach/lesson/updateClassLessonById", //更新班级对应课次的信息
  getLessonTask: "/teach/task/list", //获取课次作业
  postLessonTaskUpdate: "/teach/task/createOrEdit", //创建编辑课次作业
  getRoleSelect: "/right/role/list", //角色查询
  putRoleUpdate: "/right/role/update", //角色权限树修改
  getTeacherClassLog: "/log/teach/class/listsByPage", //老师上课记录查询
  getStudentClassLog: "/log/student/class/listsByPage", //学生上课记录查询
  getOperationLog: "/log/operation/listsByPage", //操作日志查询
  statisticsStudentTypes: "/static/student/status", //学生状态统计
  statisticsStudentChange: "/admin/student/status", //学生转换率统计
  statisticsTeacherConsume: "/static/teach/consume" //耗课统计
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

var goApiUrl = "";
switch (env) {
  case "local":
    goApiUrl = "http://127.0.0.1:8099";
    break;
  case "prerelease":
    goApiUrl = "http://admin-test-api.codemali.com";
    break;
  case "master":
    goApiUrl = "http://admin-api.codemali.com"; // todo
    break;
  default:
    goApiUrl = "http://admin-api.codemali.com"; // todo
    break;
}
function getenv() {
  return env;
}
// 获取环境变量 end
function newpost(params) {
  var maliAdminInfo = localStorage[USER_INFO_KEY];
  if (maliAdminInfo && maliAdminInfo.length > 0) {
    let val = JSON.parse(maliAdminInfo);
    axios.defaults.headers.Authorization2 = "Bearer " + val.access_token;
  }
  axios({
    baseURL: goApiUrl,
    method: "POST",
    url: apiMap[params.url],
    data: params.data,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    transformRequest: [
      function(data) {
        let ret = "";
        for (let it in data) {
          ret +=
            encodeURIComponent(it) + "=" + encodeURIComponent(data[it]) + "&";
        }
        return ret.substr(0, ret.length - 1);
      }
    ]
  })
    .then(res => {
      let result = res.data;
      if (result.code === -999) {
        localStorage.removeItem("mali_admin_info");
        localStorage.removeItem("mali_admin_info2");
        this.$router.push({ path: "/login" });
        return false;
      }
      if (result.code === 0) {
        params.success(result.data, result.msg);
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

export default { newpost: newpost, getenv: getenv };
