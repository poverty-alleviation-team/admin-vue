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
        <el-form :inline="true" class="demo-form-inline">
          <el-form-item label="员工姓名:">
            <el-input v-model="searchName" v-on:keyup.enter.native="onSearch"></el-input>
          </el-form-item>
          <el-form-item label="岗位:">
            <el-select v-model="jobId" filterable placeholder="请选择">
              <el-option key="" label="全部" value="">
              </el-option>
              <el-option
                v-for="(val, key) in jobOption"
                :key="key"
                :label="val"
                :value="key">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSearch">查询</el-button>
          </el-form-item>
        </el-form>
        <el-row>
          <el-col :span="24">
            <el-button type="success" @click="createForm('employeeForm',boxFormModel.employeeDefForm)" round icon="el-icon-circle-plus" size="mini" >新增</el-button>
            <el-button type="danger" :disabled="multipleSelection.length>0 ? false : true" @click="onDeleteAll()" round icon="el-icon-delete" size="mini">删除</el-button>
            <el-button type="primary" :disabled="multipleSelection.length>0 ?  false : true" round icon="el-icon-error" size="mini" @click="toggleSelection()">清空选中</el-button>
          </el-col>
        </el-row>
        <el-divider><i class="el-icon-caret-bottom"></i></el-divider>
        <el-row>
          <el-col :span="24">
            <el-table ref="multipleTable" stripe :data="tableData" style="width: 100%;height:auto;" @selection-change="handleSelectionChange" border>
              <el-table-column prop="id" label="编号" width="60"></el-table-column>
              <el-table-column prop="name" label="姓名" width="120"></el-table-column>
              <el-table-column label="性别" width="80">
                <template slot-scope="scope">
                  <span style="margin-left: 10px">{{ sexMap[scope.row.sex && scope.row.sex != null ? scope.row.sex : 0]}}</span>
                </template>
              </el-table-column>
              <el-table-column label="所属校区">
                <template slot-scope="scope">
                  <el-tag v-for="val in scope.row.campus" :key="val.id">{{val.name}}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="岗位">
                <template slot-scope="scope">
                  <span style="margin-left: 10px">{{ jobMap[scope.row.job]}}</span>
                </template>
              </el-table-column>
              <el-table-column prop="phone" label="手机号" width="140"></el-table-column>
              <el-table-column prop="create_time" :formatter="dataFormatter" label="入职日期" ></el-table-column>
              <el-table-column label="操作" fixed="right" width="280">
                <template slot-scope="scope">
                  <el-button size="mini" icon="el-icon-edit" @click="onEdit(scope.$index, scope.row,'employeeForm',true)">编辑</el-button>
                  <el-button size="mini" icon="el-icon-s-tools" type="warning" @click="onEdit(scope.$index, {id:scope.row.id,name:scope.row.name,password:''},'resetPwdForm')">重置密码</el-button>
                  <el-button size="mini" icon="el-icon-delete-solid" type="danger" @click="onDelete(scope.$index, scope.row, scope.row.name)">删除</el-button>
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
    </el-tabs>
    <el-dialog title="重置员工密码" :visible.sync="boxVisibleConfig.resetPwdForm" width="40%" v-loading="pageLoading" element-loading-text="正在重置...">
      <el-form
        :model="boxFormModel.resetPwdForm"
        :rules="resetPwdFormRules"
        ref="resetPwdForm"
        label-width="120px"
        class="demo-ruleForm"
      >
        <el-form-item label="编号" prop="id">
          <el-tag>{{boxFormModel.resetPwdForm.id}}</el-tag>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-tag>{{boxFormModel.resetPwdForm.name}}</el-tag>
        </el-form-item>
        <el-form-item label="密码">
          <el-input placeholder="请输入密码" v-model="boxFormModel.resetPwdForm.password" show-password></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="resetSubmit('resetPwdForm')">确定</el-button>
        <el-button @click="boxVisibleConfig.resetPwdForm = false">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog title="创建/编辑员工信息" :visible.sync="boxVisibleConfig.employeeForm" width="40%" v-loading="pageLoading" element-loading-text="正在请求,请稍等......">
      <el-form
        :model="boxFormModel.employeeForm"
        :rules="employeeFormRules"
        ref="employeeForm"
        label-width="120px"
        class="demo-ruleForm"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="boxFormModel.employeeForm.name"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-select v-model="boxFormModel.employeeForm.sex" filterable placeholder="请选择">
            <el-option
              v-for="(val, key) in sexMap"
              :key="key"
              :label="val"
              :value="key*1">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input v-model.number="boxFormModel.employeeForm.age"></el-input>
        </el-form-item>
        <el-form-item label="所属校区" prop="campus">
          <el-select v-model="boxFormModel.employeeForm.campus" :disabled="editFormCampusBtn" multiple :multiple-limit="1*1" placeholder="请选择">
            <el-option
              v-for="(val, key) in campusMap"
              :key="key*1"
              :label="val"
              :value="key*1">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="岗位" prop="job">
          <el-select v-model="boxFormModel.employeeForm.job" filterable placeholder="请选择">
            <el-option
              v-for="(val, key) in jobOption"
              :key="key"
              :label="val"
              :value="key*1">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="boxFormModel.employeeForm.phone"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="onSubmit('employeeForm')">确定</el-button>
        <el-button @click="boxVisibleConfig.employeeForm = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Util from "../../util.js";
export default {
  data() {
    return {
      pageLoading:false,
      currentPage:1,
      pagination: {
        total: 0,
        pagesize:10
      },
      tableData:[],
      tableIndex:0,
      editFormBtn:false,
      editFormCampusBtn:false,
      pageTitle: "员工管理",
      tableDelUrlKey:'deleteEmployeeDel',
      resetPwdUrlKey:'postResetEmployeePwd',
      submitUrlKey:'putEmployeeUpdate',
      searchName:'',
      jobId:'',
      jobMap:Util.maliDictionaryMap[2].subMap,
      jobOption:Util.jobOption,
      sexMap:Util.maliDictionaryMap[1].subMap,
      campusMap:Util.maliDictionaryMap[6].subMap,
      campusOption:Util.campusOption,
      multipleSelection: [],
      boxVisibleConfig:{employeeForm:false,resetPwdForm:false},
      boxFormModel:{
        employeeDefForm:{id: 0, name: '', phone: '', sex: '', campus: '', job: '', age: 0},
        employeeForm:{},
        resetPwdForm:{},
      },
      resetPwdFormRules:{
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 5,required: true, message: '密码长度不得小于5位', trigger: 'blur' },
        ],
      },
      employeeFormRules:{
        name: [
          { required: true, message: '请输入校区名称', trigger: 'blur' },
          { min: 2, max: 12, message: '长度在 2 到 12个字符', trigger: 'blur' }
        ],
        age: [
          { required: true, message: '请输入校年龄', trigger: 'blur' },
          { min: 1,type:'number',required: true, message: '请输入合法年龄', trigger: 'blur' },
        ],
        sex: [
          { required: true, message: '请选择性别', trigger: 'change' }
        ],
        job: [
          { required: true, message: '请选择岗位', trigger: 'change' }
        ],
        campus: [
          { required: true, message: '请选择校区', trigger: 'change' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { min: 11, min: 11, message: '请输入11位手机号', trigger: 'blur' }
        ],
      }
    };
  },
  methods: {
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
    dataFormatter(row,column){
      return Util.dataFormatter(row,column.property);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    resetSubmit(formName){//提交重置密码
      var that = this;
      this.$refs[formName].validate(valid => {
        if (valid) {
          var dataObj = {};
          dataObj = that.boxFormModel[formName];
          that.pageLoading = true;
          that.$newpost({
            url: that.resetPwdUrlKey,
            data: dataObj,
            success: function(reData) {
              that.$message({
                type: "success",
                message: "success"
              });
              that.pageLoading = false;
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
    onSubmit(formName) {
      //提交BOX表单
      var that = this;
      this.$refs[formName].validate(valid => {
        if (valid) {
          var dataObj = {};
          dataObj = that.boxFormModel[formName];
          if(dataObj.id === 0){
              that.submitUrlKey = "postEmployeeAdd";
          } else {
              that.submitUrlKey = "putEmployeeUpdate";
          }
          that.pageLoading = true;
          that.$newpost({
            url: that.submitUrlKey,
            data: dataObj,
            success: function(reData) {
              that.$message({
                type: "success",
                message: "success"
              });
              that.pageLoading = false;
              if (dataObj.id === 0) {
                if(that.tableData.length>0){
                  that.tableData.unshift(reData);
                } else {
                  that.tableData.push(reData);
                }
              } else {
                that.$set(that.tableData,that.tableIndex,reData);
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
    onEdit(index, row, formName,isedit = false) {
      var that = this;
      that.editFormBtn = isedit;
      that.boxVisibleConfig[formName] = true;
      if(formName == 'employeeForm'){
        const rowData = JSON.parse(JSON.stringify(row));
        if(rowData.campus && rowData.campus.length>0){
          let campus = [];
          rowData.campus.forEach(function(element){
              campus.push(element.id);
          })
          rowData.campus = campus;
          that.editFormCampusBtn = true;
        }
        that.boxFormModel[formName] = JSON.parse(JSON.stringify(rowData));
      } else {
        that.boxFormModel[formName] = JSON.parse(JSON.stringify(row));
      }
      that.tableIndex = index;
    },
    onDelete(index, row,rowName) {
      var that = this;
      that
        .$confirm("此操作将["+rowName+"]删除, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          that.pageLoading = true;
          that.$newpost({
            url: that.tableDelUrlKey,
            data: {
              id: row.id
            },
            success: function(data) {
              that.pageLoading = false;
              that.tableData.splice(index, 1);
              that.$message({
                type: "success",
                message: "删除成功!"
              });
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
          var ids = [];
          that.multipleSelection.forEach(function (obj) {
            ids.push(obj.id);
          });
          that.pageLoading = true;
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
            that.campusOption = reData;
            var campusMap = {};
            reData.forEach(row => {
              campusMap[row.id] = row.name;
            });
            that.campusMap = campusMap;
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
    getAllJob(){
      var that = this;
      if(that.jobOption.length === 0){
        that.pageLoading = true;
        that.$newpost({
          url: 'getAllJob',
          data: {},
          success: function(reData,reMsg) {
            that.pageLoading = false;
            var jobMap = {};
            reData.forEach(row => {
              jobMap[row.value] = row.name;
            });
            Util.jobOption = jobMap;
            that.jobOption = jobMap;
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
    // 获取数据
    getData(currentPage) {
      var that = this;
      that.pageLoading = true;
      that.currentPage = currentPage;
      let postData = {
        name: that.searchName,
        currentPage: currentPage,
        pageSize: that.pagination.pagesize,
        job:that.jobId
      };
      that.$newpost({
        url: 'getEmployeeSelect',
        data: postData,
        checkToken:true,
        success: function(reData,reMsg) {
          that.pageLoading = false;
          that.pagination.total = reData.allCount;
          that.tableData = reData.records;
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
    createForm(formName,obj) {
      this.editFormBtn = false;
      this.boxFormModel[formName] = JSON.parse(JSON.stringify(obj));
      this.boxVisibleConfig[formName] = true;
    }
  },
  beforeMount() {//挂载前
  },
  mounted() {//挂载完成
    this.getData(1);
  },
  created(){//创建完成
    this.getCampusList();
    this.getAllJob();
  },
  components: {//引用自定义模板
  }
};
</script>
<style scoped>
@import url("../../assets/css/tableComm.css");
</style>