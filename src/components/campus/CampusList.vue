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
          <el-form-item label="校区名称">
            <el-input v-model="searchName" v-on:keyup.enter.native="onSearch"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSearch">查询</el-button>
          </el-form-item>
        </el-form>
        <el-row>
          <el-col :span="24">
            <el-button type="success" @click="createForm('campusForm',boxFormModel.campusDefForm)" round icon="el-icon-circle-plus" size="mini" >新增</el-button>
            <el-button type="danger" :disabled="multipleSelection.length>0 ? false : true" @click="onDeleteAll()" round icon="el-icon-delete" size="mini">删除</el-button>
            <el-button type="primary" :disabled="multipleSelection.length>0 ?  false : true" round icon="el-icon-error" size="mini" @click="toggleSelection()">清空选中</el-button>
          </el-col>
        </el-row>
        <el-divider><i class="el-icon-caret-bottom"></i></el-divider>
        <el-row>
          <el-col :span="24">
            <el-table ref="multipleTable" stripe :data="tableData" style="width: 100%;height:auto;" @selection-change="handleSelectionChange" border>
              <el-table-column prop="id" label="校区编号" width="80" align="center"></el-table-column>
              <el-table-column prop="name" label="校区名称" width="100" align="center"></el-table-column>
              <el-table-column prop="organization_name" label="校区机构公司名称" align="center"></el-table-column>
              <el-table-column prop="head_master_name" label="校长名称" width="120" align="center"></el-table-column>
              <el-table-column prop="phone" label="机构联系电话" width="110" align="center"></el-table-column>
              <el-table-column prop="price" label="学生单次耗课金额" width="140" align="center"></el-table-column>
              <el-table-column prop="gold" label="校区余额(元)" width="120" align="center"></el-table-column>
              <el-table-column prop="consume_gold" label="耗课总金额(元)" width="120" align="center"></el-table-column>
              <el-table-column prop="frozen_gold" label="校区冻结金额(元)" width="140" align="center"></el-table-column>
              <el-table-column prop="create_time" :formatter="dataFormatter" label="创建日期" align="center"></el-table-column>
              <el-table-column label="操作" fixed="right" width="150">
                <template slot-scope="scope">
                  <el-button size="mini" icon="el-icon-edit" @click="onEdit(scope.$index, scope.row,'campusForm')">编辑</el-button>
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
    <el-dialog title="创建/编辑校区" :visible.sync="boxVisibleConfig.campusForm" width="40%">
      <el-form
        :model="boxFormModel.campusForm"
        :rules="campusFormRules"
        ref="campusForm"
        label-width="150px"
        class="demo-ruleForm"
      >
        <el-form-item label="校区名称" prop="name">
          <el-input v-model="boxFormModel.campusForm.name"></el-input>
        </el-form-item>
        <el-form-item label="校区机构公司名称" prop="organization_name">
          <el-input v-model="boxFormModel.campusForm.organization_name"></el-input>
        </el-form-item>
        <el-form-item label="机构联系电话" prop="phone">
          <el-input v-model="boxFormModel.campusForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="学生单次耗课金额" prop="price">
          <el-input v-model.number="boxFormModel.campusForm.price"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="onSubmit('campusForm')">确定</el-button>
        <el-button @click="boxVisibleConfig.campusForm = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Util from "../../util.js";
export default {
  data() {
    return {
      currentPage:1,
      pageLoading:false,
      pagination: {
        total: 0,
        pagesize:10
      },
      tableData:[],
      tableIndex:0,
      pageTitle: "校区管理",
      tableDelUrlKey:'deleteCampusDel',
      submitUrlKey:'putCampusUpdate',
      searchName:'',
      multipleSelection: [],
      boxVisibleConfig:{campusForm:false},
      boxFormModel:{
        campusDefForm:{id:0,name:'',organization_name:'',phone:'',price:10},
        campusForm:{}
      },
      campusFormRules:{
        name: [
          { required: true, message: '请输入校区名称', trigger: 'blur' },
          { min: 2, max: 12, message: '长度在 2 到 12个字符', trigger: 'blur' }
        ],
        organization_name: [
          { required: true, message: '请输入校区机构公司名称', trigger: 'blur' },
        ],
        price: [
          { required: true, message: '请输入学生单次耗课金额', trigger: 'blur' },
          { min: 1,type:'number',required: true, message: '单次金额不得少于1', trigger: 'blur' },
        ],
        phone: [
          { required: true, message: '请输入机构联系电话', trigger: 'blur' },
          { min: 8, message: '电话长度最少8位', trigger: 'blur' }
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
    getCampusList() {
      var that = this;
      that.pageLoading = true;
      that.$newpost({
        url: 'getAllCampus',
        data: {},
        checkToken:true,
        success: function(reData,reMsg) {
          that.pageLoading = false;
          Util.campusOption = reData;
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
    onSubmit(formName) {
      //提交BOX表单
      var that = this;
      this.$refs[formName].validate(valid => {
        if (valid) {
          var dataObj = {};
          dataObj = that.boxFormModel[formName];
          that.$newpost({
            url: 'putCampusUpdate',
            data: dataObj,
            success: function(reData) {
              that.$message({
                type: "success",
                message: "success"
              });
              if (dataObj.id == 0) {
                if(that.tableData.length>0){
                  that.tableData.unshift(reData);
                } else {
                  that.tableData.push(reData);
                }
              } else {
                that.$set(that.tableData,that.tableIndex,dataObj);
              }
              Util.maliDictionaryMap[6].subMap[reData.id] = reData.name;
              that.boxVisibleConfig[formName] = false;
              that.getCampusList();
            },
            error: function(data) {
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
    onEdit(index, row, formName) {
      var that = this;
      that.boxVisibleConfig[formName] = true;
      that.boxFormModel[formName] = JSON.parse(JSON.stringify(row));
      that.tableIndex = index;
    },
    onDelete(index, row, rowName) {
      var that = this;
      that.$confirm("此操作将删除["+rowName+"], 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          that.$newpost({
            url: that.tableDelUrlKey,
            data: {
              ids: row.id
            },
            success: function(data) {
              that.tableData.splice(index, 1);
              delete Util.maliDictionaryMap[6].subMap[row.id];
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
          });
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
    createForm(formName,obj) {
      this.boxFormModel[formName] = JSON.parse(JSON.stringify(obj));
      this.boxVisibleConfig[formName] = true;
    },
    // 获取数据
    getData(currentPage) {
      var that = this;
      that.currentPage = currentPage;
      that.pageLoading = true;
      let postData = {
        name: that.searchName,
        currentPage: currentPage,
        pageSize: that.pagination.pagesize
      };
      that.$newpost({
        url: 'getCampusSelect',
        data: postData,
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
    }
  },
  beforeMount() {//挂载前
  },
  mounted() {//挂载完成
  },
  created(){//创建完成
    this.getData(1);
  },
  components: {//引用自定义模板
  }
};
</script>
<style scoped>
@import url("../../assets/css/tableComm.css");
</style>
