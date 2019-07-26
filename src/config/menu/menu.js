/*
 * @Author: jakey@17pkmj.com
 * @Date: 2019-05-16 10:50:08
 * @LastEditors: jakey
 * @LastEditTime: 2019-05-16 10:50:08
 * @Description: 
 * 本地使用, 线上需要配置
 */
let menus = [
  {
    name: "校区管理",
    path: "/campus",
    icon: "el-icon-s-home",
    sort: "1",
    children: []
  },
  {
    name: "员工管理",
    path: "/employee",
    icon: "el-icon-s-custom",
    sort: "1",
    children: []
  },
  {
    name: "学生管理",
    path: "/student",
    icon: "el-icon-user-solid",
    sort: "1",
    children: []
  },
  {
    name: "班级管理",
    path: "/class",
    icon: "el-icon-school",
    sort: "1",
    children: []
  },
  {
    name: "课程体系管理",
    path: "/course",
    icon: "icon ion-md-keypad ionion",
    sort: "1",
    children: []
  },
  {
    name: "课次管理",
    path: "/lesson",
    icon: "icon ion-md-book ionion",
    sort: "1",
    children: []
  },
  {
    name: "耗课记录",
    path: "",
    icon: "el-icon-receiving",
    sort: "1",
    children: [
      {
        name: "老师上课记录",
        path: "/classLog/teacherClassLog",
        icon: "",
        sort: "1-1"
      },
      {
        name: "学生上课记录",
        path: "/classLog/studentClassLog",
        icon: "",
        sort: "1-2"
      }
    ]
  },
  {
    name: "统计",
    path: "",
    icon: "el-icon-s-data",
    sort: "1",
    children: [
      {
        name: "学生统计",
        path: "/statistics/studentStatusLog",
        icon: "",
        sort: "1-1"
      },
      {
        name: "转换率统计",
        path: "/statistics/studentStatusChangeLog",
        icon: "",
        sort: "1-2"
      },
      {
        name: "耗课统计",
        path: "/statistics/teacherConsumeLog",
        icon: "",
        sort: "1-3"
      },
    ]
  },
  {
    name: "日志管理",
    path: "",
    icon: "icon ion-md-paper ionion",
    sort: "1",
    children: [
      {
        name: "操作日志",
        path: "/log/operationLog",
        icon: "",
        sort: "1-1"
      }
    ]
  },
  {
    name: "岗位权限模板配置",
    path: "/role",
    icon: "el-icon-s-tools",
    sort: "1",
    children: []
  }
];

export default menus;
