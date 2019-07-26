<!--
 * @Author: jakey@17pkmj.com
 * @Date: 2019-05-16 10:50:08
 * @LastEditors: jakey
 * @LastEditTime: 2019-05-16 10:50:08
 * @Description: 
-->
<template>
  <div style="width: 100%;height:auto;" v-loading="pageLoading" element-loading-text="正在加载...">
    <el-tabs type="border-card">
      <el-tab-pane :label="pageTitle">
        <!--el-form :inline="true" class="demo-form-inline">
          <el-form-item label="角色名称:">
            <el-input v-model="searchName" v-on:keyup.enter.native="onSearch"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSearch">查询</el-button>
          </el-form-item>
        </el-form-->
        <el-row  v-if="delRoleShow">
          <el-col :span="24">
            <el-button type="danger" :disabled="multipleSelection.length>0 ? false : true" @click="onDeleteAll()" round icon="el-icon-delete" size="mini">删除</el-button>
            <el-button type="primary" :disabled="multipleSelection.length>0 ?  false : true" round icon="el-icon-error" size="mini" @click="toggleSelection()">清空选中</el-button>
          </el-col>
        </el-row>
        <el-divider><i class="el-icon-caret-bottom"></i></el-divider>
        <el-row>
          <el-col :span="24">
            <el-table ref="multipleTable" stripe :data="tableData" style="width: 100%;height:auto;"  border>
              <el-table-column prop="id" label="编号" width="100" align="center"></el-table-column>
              <el-table-column prop="name" label="名称" align="center"></el-table-column>
              <el-table-column prop="value" label="角色码" align="center"></el-table-column>
              <el-table-column label="操作" fixed="right" width="240" align="center">
                <template slot-scope="scope">
                  <el-button size="mini" type="primary" icon="el-icon-edit" @click="onEdit('roleForm',scope.row,true)">编辑</el-button>
                  <el-button v-if="delRoleShow" size="mini" icon="el-icon-delete-solid" type="danger" @click="onDelete(scope.$index, scope.row, scope.row.name)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <hr>
            <el-pagination
              background
              layout="prev, pager, next"
              :page-size="pagination.pagesize"
              :total="pagination.total"
              @current-change="getData"
              @prev-click="getData"
              @next-click="getData"
            ></el-pagination>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane v-if="menuTabShow" label="菜单管理"  @click="getAllRoleMenu()">
        <el-row>
          <el-col :span="24">
            <el-button type="success" @click="onEditMenuForm('menuForm',boxFormModel.menuFormDef,false)" round icon="el-icon-circle-plus" size="mini" >新增菜单</el-button>
          </el-col>
        </el-row>
        <el-divider><i class="el-icon-caret-bottom"></i></el-divider>
        <el-row>
          <el-col :span="24">
            <el-table ref="menuTable" row-key="id" :data="roleTree" style="width: 100%;height:auto;"  border :tree-props="{children: 'children'}">
              <el-table-column prop="id" label="编号" width="100" align="center"></el-table-column>
              <el-table-column label="名称" align="left" width="180">
                <template slot-scope="scope">
                  <el-row v-if="scope.row.icon"><el-col :span="24"><i v-if="scope.row.icon" :class="scope.row.icon"></i>{{scope.row.name}}</el-col></el-row>
                  <el-row v-if="!scope.row.icon"><el-col :offset="4" :span="20" >{{scope.row.name}}</el-col></el-row>
                </template>
              </el-table-column>
              <el-table-column prop="type" label="类型" align="center"></el-table-column>
              <el-table-column prop="path" label="路由" align="center"></el-table-column>
              <el-table-column label="操作" fixed="right" width="240" align="center">
                <template slot-scope="scope">
                  <el-button size="mini" type="primary" icon="el-icon-edit" @click="onEditMenuForm('menuForm',scope.row,true,scope.$index)">编辑</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
    <el-dialog title="创建/编辑菜单" :visible.sync="boxVisibleConfig.menuForm" width="40%" v-loading="pageLoading" element-loading-text="正在请求,请稍等......">
      <el-form
        :model="boxFormModel.menuForm"
        :rules="menuFormRules"
        ref="menuForm"
        label-width="80px"
        class="demo-ruleForm"
        size="mini"
      >
        <el-form-item label="父级节点" prop="parent_id">
          <el-select v-model="boxFormModel.menuForm.parent_id" filterable placeholder="请选择">
            <el-option :key="0" label="根节点" :value="0"></el-option>
            <el-option
              v-for="(val) in roleTree"
              :key="val.id"
              :label="val.name"
              :value="val.id*1">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="boxFormModel.menuForm.name" ></el-input>
        </el-form-item>
         <el-form-item label="路由" prop="path">
          <el-input v-model="boxFormModel.menuForm.path" ></el-input>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="boxFormModel.menuForm.type"  filterable placeholder="请选择">
            <el-option key="0" label="Menu" value="M"></el-option>
            <el-option key="1" label="Button" value="B"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="图标类" prop="icon">
          <el-input v-model="boxFormModel.menuForm.icon" ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-show="!editFormBtn" type="primary" @click="onSubmitMenu('menuForm','postMenuUpdate',true)">添加</el-button>
        <el-button v-show="editFormBtn" type="danger" @click="onSubmitMenu('menuForm','postMenuUpdate')">保存</el-button>
        <el-button @click="boxVisibleConfig.menuForm = false">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog title="创建/编辑角色" :visible.sync="boxVisibleConfig.roleForm" width="40%" v-loading="pageLoading" element-loading-text="正在请求,请稍等......">
      <el-form
        :model="boxFormModel.roleForm"
        :rules="roleFormRules"
        ref="roleForm"
        label-width="80px"
        class="demo-ruleForm"
        size="mini"
      >
        <el-row>
          <el-col :span="8">
            <el-form-item label="编号:">
              {{boxFormModel.roleForm.id}}
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="名称:">
              {{boxFormModel.roleForm.name}}
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="角色码:">
              {{boxFormModel.roleForm.value}}
            </el-form-item>
          </el-col>
        </el-row>
        <el-input
          placeholder="输入关键字进行过滤"
          v-model="filterText">
        </el-input>
        <el-tree
          class="filter-tree"
          show-checkbox
          node-key="id"
          :data="roleTree"
          :props="{children: 'children'}"
          default-expand-all
          :filter-node-method="filterNode"
          :default-checked-keys="checkedRoleIds"
          ref="roletree">
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span>[{{ data.type }}]<i v-if="data.icon" :class="data.icon"></i>{{ data.name }}</span>
          </span>
        </el-tree>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-show="!editFormBtn" type="primary" @click="onSubmit('roleForm','putRoleUpdate','POST',true)">添加</el-button>
        <el-button v-show="editFormBtn" type="danger" @click="onSubmit('roleForm','putRoleUpdate','PUT')">保存</el-button>
        <el-button @click="boxVisibleConfig.roleForm = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Util from "../../util.js";
export default {
  watch: {
    filterText(val) {
      this.$refs.roletree.filter(val);
    }
  },
  data() {
    return {
      currentPage:1,
      pageLoading:false,
      delRoleShow:false,
      menuTabShow:false,
      pagination: {
        total: 0,
        pagesize:15
      },
      tableData:[],
      pageTitle: "角色管理",
      searchName:'',
      filterText:'',
      tableDelUrlKey:'deleteClassDel',
      menuTableIndex:0,
      roleTree:[],
      checkedRoleIds:[],
      multipleSelection: [],
      boxVisibleConfig:{roleForm:false,studentToroleForm:false,menuForm:false},
      editFormBtn:false,
      boxFormModel:{
        studentToClassDefForm:{ids:[],classId:''},
        studentToroleForm:{},
        menuForm:{},
        menuFormDef:{parent_id:0,name:'',path:'',icon:'',type:'M'},
        classDefForm:{id:0,name:'',description:'',campusId:'',type:''},
        roleForm:{}
      },
      roleFormRules:{
        name: [
          { required: true, message: '请输入校区名称', trigger: 'blur' },
          { min: 2, max: 12, message: '长度在 2 到 12个字符', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入描述信息', trigger: 'blur' },
        ],
        campusId: [
           { required: true, message: '请选择校区', trigger: 'change' }
        ],
        type: [
          { required: true, message: '请选择角色类型', trigger: 'change' }
        ],
      },
      menuFormRules:{
        name: [
          { required: true, message: '请输入菜单名称', trigger: 'blur' },
          { min: 2, max: 12, message: '长度在 2 到 12个字符', trigger: 'blur' }
        ],
        path: [
          { required: true, message: '请输入路由', trigger: 'blur' }
        ]
      }
    };
  },
  
  methods: {
    filterMethod(query, item) {
      return item.name.indexOf(query) > -1;
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    getData(currentPage) {
      var that = this;
      let postData = {
        name: that.searchName,
        currentPage: currentPage,
        pageSize: that.pagination.pagesize
      };
      that.currentPage = currentPage;
      that.pageLoading = true;
      that.$newpost({
        url: 'getRoleSelect',
        data: postData,
        success: function(reData,reMsg) {
          that.pageLoading = false;
          that.pagination.total = reData.length;
          that.tableData = reData;
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
    },
    getAllRoleMenu() {
      var that = this;
      if(that.roleTree.length === 0){
        that.pageLoading = true;
        that.$newpost({
          url: 'getMenuList',
          data: '',
          success: function(reData,reMsg) {
            that.pageLoading = false;
            that.roleTree = reData;
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
      }
    },
    getMenuListByRoleId(id){
      var that = this;
      that.checkedRoleIds = [];
      if(id){
        that.pageLoading = true;
        that.$newpost({
          url: 'getMenuIdsByRoleId',
          data: {role_id:id},
          success: function(reData,reMsg) {
            that.pageLoading = false;
            if(reData && reData.length>0){
              let menuIds = [];
              reData.forEach(function (obj) {
                menuIds.push(obj.id);
              });
              that.checkedRoleIds = menuIds;
              that.$refs.roletree.setCheckedKeys(menuIds);
            }
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
      }
    },
    onEdit(formName,obj,isedit) {
      this.boxVisibleConfig[formName] = true;
      this.boxFormModel[formName] = obj;
      this.editFormBtn = isedit;
      if(isedit){
        this.getAllRoleMenu();
        this.getMenuListByRoleId(obj.id);
      }
    },
    onEditMenuForm(formName,obj,isedit,index = 0) {
      this.editFormBtn = isedit;
      this.menuTableIndex = index;
      this.boxVisibleConfig[formName] = true;
      obj['parent_id'] = obj.parent_id ? obj.parent_id : 0;
      this.boxFormModel[formName] = obj;
      
      console.log(obj);
    },
    onDelete(index, row, rowName) {
      var that = this;
      that.$confirm("此操作将删除["+rowName+"], 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          that.$mothodAx({
            url: that.tableDelUrlKey,
            data: {
              ids: [row.id]
            },
            success: function(data) {
              that.tableData.splice(index, 1);
              that.$message({
                type: "success",
                message: "删除成功!"
              });
            },
            error: function(data) {
              that.$message({
                type: "error",
                message: "失败:" + data.msg
              });
            }
          },'DELETE');
        })
        .catch(() => {
          that.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    onDeleteAll(){
      var that = this;
      that.$confirm("此操作将批量删除选中行记录, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          that.pageLoading = true;
          var ids = [];
          that.multipleSelection.forEach(function (obj) {
            ids.push(obj.id);
          });
          that.$mothodAx({
            url: that.tableDelUrlKey,
            data: {
              ids: ids
            },
            success: function(data) {
              that.pageLoading = false;
              that.$message({
                type: "success",
                message: "删除成功!"
              });
              that.getData(that.currentPage);
            },
            error: function(data) {
              that.pageLoading = false;
              that.$message({
                type: "error",
                message: "失败:" + data.msg
              });
            }
          },'DELETE');
        })
        .catch(() => {
        });
    },
    onSearch() {
      this.getData(1);
    },
    onSubmit(formName,submitUrlKey,mothod,push = false) {
      //提交BOX表单
      var that = this;
      this.$refs[formName].validate(valid => {
        if (valid) {
          var dataObj = {};
          var putObj = {};
          dataObj = that.boxFormModel[formName];
          let subIds = that.$refs.roletree.getCheckedKeys();
          let pIds = that.$refs.roletree.getHalfCheckedKeys();
          putObj.ids = subIds.join(',');
          putObj.pids = pIds.join(',');
          putObj.role_id = dataObj.id;
          that.pageLoading = true;
          that.$newpost({
            url: submitUrlKey,
            data: putObj,
            success: function(reData) {
              that.pageLoading = false;
              that.$message({
                type: "success",
                message: "success"
              });
              if (push) {
                if(that.tableData.length>0){
                  that.tableData.unshift(reData);
                } else {
                  that.tableData.push(reData);
                }
              }
              that.boxVisibleConfig[formName] = false;
            },
            error: function(data) {
              that.pageLoading = false;
              that.$message({
                type: "error",
                message: data.msg
              });
            }
          });
        } else {
          return false;
        }
      });
    },
    onSubmitMenu(formName,submitUrlKey,push = false){
      //提交BOX表单
      var that = this;
      this.$refs[formName].validate(valid => {
        if (valid) {
          var putObj = {};
          putObj = that.boxFormModel[formName];
          that.pageLoading = true;
          that.$newpost({
            url: submitUrlKey,
            data: putObj,
            success: function(reData) {
              that.$message({
                type: "success",
                message: "success"
              });
              if(push){
                that.roleTree = [];
                that.getAllRoleMenu();
              }
              that.boxVisibleConfig[formName] = false;
              that.pageLoading = false;
            },
            error: function(data) {
              that.pageLoading = false;
              that.$message({
                type: "error",
                message: data.msg
              });
            }
          });
        } else {
          return false;
        }
      });
    }
  },
  beforeMount() {//挂载前
  },
  mounted() {//挂载完成
    this.getData(1);
    this.getAllRoleMenu();
  },
  created(){//创建完成
    var maliAdminInfo = localStorage['mali_admin_info2'];
    if (maliAdminInfo && maliAdminInfo.length > 0) {
        let val = JSON.parse(maliAdminInfo);
        if(val.userId === 1){
          this.menuTabShow = true;
        }
    }
  },
  components: {//引用自定义模板
  }
};
</script>
<style scoped>
@import url("../../assets/css/tableComm.css");
</style>
