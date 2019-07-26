<template>
  <div id="app" v-loading="pageLoading" element-loading-text="正在加载...">
  <el-container id="adminHome" :style="pageConfig.adminIndexHeight">
    <el-menu
      id="adminAside"
      class="el-menu-vertical-demo"
      :background-color="env != 'master'? '#4d4030' :'#2e4053'"
      text-color="#fff"
      active-text-color="#ffd04b"
      :collapse="isCollapse"
      :default-active="activeMenuIndex"
    >
      <template v-for="(menuInfo,menuIndex) in menuLists"> 
        <router-link v-if="!menuInfo.children" :to="menuInfo.path" >
          <el-menu-item :url="menuInfo.path" :index="menuInfo.path">
            <i :class="menuInfo.icon"></i>
            <span slot="title">{{menuInfo.name}}</span>
          </el-menu-item>
        </router-link>
        <el-submenu :index="menuIndex+''" v-else>
          <template slot="title" v-if="menuInfo.children && menuInfo.children.length > 0">
            <i :class="menuInfo.icon"></i>
            <span>{{menuInfo.name}}</span>
          </template>
          <router-link v-for="(children, k) in menuInfo.children" :key="k" :to="children.path">
            <el-menu-item :index="children.path">{{children.name}}</el-menu-item>
          </router-link>
        </el-submenu>
      </template>
    </el-menu>
    <el-container>
      <el-header id="adminHeader">
        <el-row type="flex" justify="end">
          <el-col :span="1" style="text-align:left;padding-top:5px;">
            <i class="el-icon-menu" @click="isCollapse=!isCollapse"></i>
          </el-col>
          <el-col :span="7" style="padding-top:10px;text-align:left;"><i class="scratch_logo"></i></el-col>
          <el-col :span="16"  style="text-align:right;">
            <div class="user-profile-body">
              <img class="user-avatar" src="https://img.alicdn.com/tfs/TB1ONhloamWBuNjy1XaXXXCbXXa-200-200.png">
              <span class="user-name">{{userName}}</span>&nbsp;&nbsp;| &nbsp;&nbsp;
              <el-tag @click="logout" >退出</el-tag>
            </div>
          </el-col>
        </el-row>
      </el-header>
      <el-main><router-view></router-view></el-main>
    </el-container>
  </el-container>
  </div>
</template>

<script>
import Menus from "./config/menu/menu.js";
import Util from "./util.js";
export default {
  components: {},
  data() {
    return {
      pageLoading:false,
      pageConfig:{adminIndexHeight:{height:window.innerHeight + 'px'}},
      isCollapse:false,//默认菜单展开
      menuLists: [],
      campusOption:Util.campusOption,
      userRoles:0,
      activeMenuIndex:'0',
      env:this.$getenv(),
      userName:'码丽'
    };
  },
  methods: {
    checkUser(){
        var maliAdminInfo = localStorage['mali_admin_info2'];
        if (maliAdminInfo && maliAdminInfo.length > 0) {
          let val = JSON.parse(maliAdminInfo);
          this.activeMenuIndex = this.$route.path;
          this.userRoles = val.roles;
          this.userName = val.userName;
          this.getMenuList();
          this.getDictionary();
        }
    },
    logout(){
      var that = this;
      that.$confirm('确定退出管理系统?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        that.$newpost({
            url: 'adminLogout',
            data: {from:'ADMINSYS'},
            success: function(reData,reMsg) {
            },
            error: function(data) {
            }
          });
          localStorage.removeItem('mali_admin_info2');
          that.$router.push({ path:'/login'});
      }).catch(() => {     
            
      });
    },
    getCampusList() {
      var that = this;
      if(that.campusOption.length === 0){
        that.pageLoading = true;
        that.$newpost({
          url: 'getAllCampus',
          data: {},
          checkToken:true,
          success: function(reData,reMsg) {
            that.pageLoading = false;
            Util.campusOption = reData;
            var campusMap = {};
            reData.forEach(row => {
              campusMap[row.id] = row.name;
            });
            Util.maliDictionaryMap[6].subMap = campusMap;
          },
          error: function(data) {
            that.pageLoading = false;
            if(data.code){
              that.$message({
                type: "error",
                message: '['+data.code+']'+data.msg
              });
            }
          }
        });
      } else {
        var campusMap = {};
        that.campusOption.forEach(row => {
          campusMap[row.id] = row.name;
        });
        Util.maliDictionaryMap[6].subMap = campusMap;
      }
    },
    getDictionary(){
      var that = this;
      var maliDictionary = localStorage["mali_dictionary2"];

      if (maliDictionary && maliDictionary.length > 0) {
          Util.maliDictionaryMap = JSON.parse(maliDictionary);
          that.getCampusList();
      } else {
        that.pageLoading = true;
          that.$newpost({
            url: "getDictionaryMap",
            data: {},
            success: function(reData) {
              that.pageLoading = false;
              if(reData){
                let dictionary = {};
                reData.forEach(function(subTypeitem, index){
                    let subMap = {};
                    dictionary[subTypeitem.type] = subTypeitem;
                    subTypeitem.list.forEach(function(listInfo){
                        subMap[listInfo.value] = listInfo.name;
                    })
                    dictionary[subTypeitem.type]['subMap'] = subMap;
                })
                localStorage.setItem('mali_dictionary2',JSON.stringify(dictionary));
                Util.maliDictionaryMap = dictionary;
                that.getCampusList();
              }
            },
            error: function(data) {
              that.pageLoading = false;
              that.$message({
                type: "error",
                message: "失败:" +  data.msg
              });
            }
          });
      }
    },
    getMenuList() {
      var that = this;
      that.pageLoading = true;
      that.$newpost({
        url: "getAllMenu",
        data: {type:'M'},
        success: function(reData) {
          that.pageLoading = false;
          that.menuLists = reData;
        },
        error: function(data) {
          that.pageLoading = false;
          that.$message({
            type: "error",
            message: "失败:" +  data.msg
          });
        }
      });
    }
  },
  created: function() {
    this.checkUser();
  }
};
</script>
<style scoped>
.el-main {
    padding: 5px !important;
}
.el-submenu .el-menu-item{
  min-width:0px !important;
}
.ionion {
  vertical-align: middle;
  margin-right: 5px;
  width: 24px;
  text-align: center;
  display: inline-block;
}
#adminAside i{
  font-size: 24px;
}
.el-icon-menu{
  color:#242f42;
  font-size:30px;
  font-weight:bold;
}
.is-active {
  color: rgb(255, 208, 75);
  background-color: rgb(84, 92, 100);
}
.scratch_logo {
    width: 199px;
    height: 32px;
    display: block;
    background: url(https://cdn.scratch.codemali.com/maliangSite/third-agent/i/scratch_logo.png) 0 0 no-repeat;
    background-size: 100% 100%;
    position: relative;
    z-index: 222;
}
#adminHome .asideS{
  width:50px !important;
  overflow-x:hidden;
}
#adminHome .asideW{
  width:210px !important;
  overflow-x:hidden;
}
a {
  text-decoration: none;
}
.el-container {
  height: 100%;
}
.el-header {
  background-color: #E9EEF3;
  color: #333;
  line-height: 60px;
}
#adminHeader .user-profile-body {
  position: relative;
  flex-direction: row;
  align-items: center;
  justify-content: end;
  text-align: right;
  padding-right: 14px;
}
#adminHeader .user-avatar {
  width: 24px;
  height: 24px;
  margin: 0 8px 0 12px;
  border-radius: 4px;
}
#adminHeader .user-name {
  color: rgba(0,0,0,.65);
  font-size:14px;
  font-weight:bold;
}
#adminHeader .user-department {
  font-size: 12px;
  color: rgba(102, 102, 102, 0.65);
}
</style>
