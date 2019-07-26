import Vue from "vue";
import VueRouter from "vue-router";
import AdminIndex from "../../AdminIndex.vue";
import AdminLogin from "../../AdminLogin.vue";
import Welcome from "../../components/Welcome.vue";
import CampusList from "../../components/campus/CampusList.vue";
import EmployeeList from "../../components/employee/EmployeeList.vue";
import StudentList from "../../components/student/StudentList.vue";
import ClassList from "../../components/class/ClassList.vue";
import CourseList from "../../components/course/CourseList.vue";
import LessonList from "../../components/lesson/LessonList.vue";
import TeacherClassLog from "../../components/classlog/TeacherClassLog.vue";
import StudentClassLog from "../../components/classlog/StudentClassLog.vue";
import OperationLog from "../../components/log/OperationLog.vue";
import StudentStatistics from "../../components/statistics/StudentStatistics.vue";
import StudentChange from "../../components/statistics/StudentChange.vue";
import TeacherConsume from "../../components/statistics/TeacherConsume.vue";
import RoleList from "../../components/role/RoleList.vue";

Vue.use(VueRouter);

export default new VueRouter({
  routes: [
    {
      path: "/",
      name: "AdminIndex",
      component: AdminIndex,
      children: [
        { name: "欢迎页", path: "/", component: Welcome },
        { name: "校区管理", path: "/campus", component: CampusList },
        { name: "员工管理", path: "/employee", component: EmployeeList },
        { name: "学生管理", path: "/student", component: StudentList },
        { name: "班级管理", path: "/class", component: ClassList },
        { name: "课程体系管理", path: "/course", component: CourseList },
        { name: "课次管理", path: "/lesson", component: LessonList },
        { name: "老师上课记录", path: "/log/teach/class/listsByPage", component: TeacherClassLog },
        { name: "学生上课记录", path: "/log/student/class/listsByPage", component: StudentClassLog },
        { name: "操作日志", path: "/log/operation/listsByPage", component: OperationLog },
        { name: "学生统计", path: "/static/student/status", component: StudentStatistics },
        { name: "转换率统计", path: "/statistics/studentStatusChangeLog", component: StudentChange },
        { name: "耗课统计", path: "/static/teach/consume", component: TeacherConsume },
        { name: "岗位权限模板控制", path: "/role", component: RoleList },
      ]
    },
    {
      path: "/login",
      name: "AdminLogin",
      component: AdminLogin
    }
  ]
});
