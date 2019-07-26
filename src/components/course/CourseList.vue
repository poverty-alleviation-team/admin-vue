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
          <el-form-item label="课程名称">
            <el-input v-model="searchName" v-on:keyup.enter.native="onSearch"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSearch">查询</el-button>
          </el-form-item>
        </el-form>
        <el-row>
          <el-col :span="24">
            <el-button type="success" @click="onEdit('courseForm',boxFormModel.courseDefForm,false)" round icon="el-icon-circle-plus" size="mini" >新增</el-button>
            <el-button type="danger" :disabled="multipleSelection.length>0 ? false : true" @click="onDeleteAll()" round icon="el-icon-delete" size="mini">删除</el-button>
            <el-button type="primary" :disabled="multipleSelection.length>0 ?  false : true" round icon="el-icon-error" size="mini" @click="toggleSelection()">清空选中</el-button>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-table ref="multipleTable" stripe :data="tableData.masterTable" style="width: 100%;height:auto;" @selection-change="handleSelectionChange" border>
              <el-table-column prop="id" label="课程编号" width="80" align="center"></el-table-column>
              <el-table-column prop="name" label="课程名称" width="240" align="left"></el-table-column>
              <el-table-column label="课次总数" align="center" width="100">
                <template slot-scope="scope">
                  <span style="margin-left: 10px">{{scope.row.lession_count ? scope.row.lession_count :0}}</span>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="课程描述" align="left"></el-table-column>
              <el-table-column prop="create_time" :formatter="dataFormatter" lable="创建日期" align="center" width="200"></el-table-column>
              <el-table-column label="操作" fixed="right" width="240">
                <template slot-scope="scope">
                  <el-button size="mini" icon="el-icon-edit" @click="onEdit('courseForm',scope.row,true,scope.$index)">编辑</el-button>
                  <el-button size="mini" icon="el-icon-delete-solid" type="danger" @click="onDelete(scope.$index, scope.row, scope.row.name,'deleteCourseDel','masterTable')">删除</el-button>
                  <el-button size="mini" icon="el-icon-view" type="success" @click="onLessonList('lessonListBox',scope.row)">课次信息</el-button>
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
    <el-dialog title="创建/编辑课程" :visible.sync="boxVisibleConfig.courseForm" width="40%">
      <el-form
        :model="boxFormModel.courseForm"
        :rules="courseFormRules"
        ref="courseForm"
        label-width="150px"
        class="demo-ruleForm"
      >
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="boxFormModel.courseForm.name"></el-input>
        </el-form-item>
        <el-form-item label="课程描述" prop="description">
          <el-input type="textarea" v-model="boxFormModel.courseForm.description"></el-input>
        </el-form-item>
        <el-form-item v-if="editFormBtn" label="课程主图">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :http-request="courseIconUpload"
            :before-upload="beforeAvatarUpload"
            >
            <img v-if="boxFormModel.courseForm.icon" :src="cdnUrl+boxFormModel.courseForm.icon" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
          <el-progress
              v-show="showProgress.courseIcon"
              :text-inside="true"
              :stroke-width="15"
              :percentage="uploadPercent.courseIcon"
            ></el-progress>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-show="!editFormBtn" type="primary" @click="onSubmit('courseForm','putCourseUpdate','POST',true)">添加</el-button>
        <el-button v-show="editFormBtn" type="danger" @click="onSubmit('courseForm','putCourseUpdate','PUT')">保存</el-button>
        <el-button @click="boxVisibleConfig.courseForm = false">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog title="课次信息列表" :visible.sync="boxVisibleConfig.lessonListBox" width="40%" v-loading="pageLoading" element-loading-text="正在请求,请稍等......">
      <el-row>
        <el-col :span="24">
          <el-button type="success" @click="onEdit('courseSubLessonAddForm',boxFormModel.courseDefForm,false)" round icon="el-icon-circle-plus" size="mini" >添加已有课次</el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-table ref="multipleTable" stripe :data="tableData.courseSubLessonTable" style="width: 100%;height:auto;" border>
            <el-table-column prop="id" label="课次编号" width="80" align="center"></el-table-column>
            <el-table-column prop="name" label="课次名称" width="240" align="left"></el-table-column>
            <el-table-column label="操作" fixed="right" width="240">
              <template slot-scope="scope">
                <el-button size="mini" icon="el-icon-delete-solid" type="danger" @click="onDelete(scope.$index, scope.row, scope.row.name,'deleteQuoteLesson','courseSubLessonTable')">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click="boxVisibleConfig.lessonListBox = false">关闭</el-button>
      </div>
    </el-dialog>
    <el-dialog title="添加已有的课次" :visible.sync="boxVisibleConfig.courseSubLessonAddForm" width="40%" v-loading="pageLoading" element-loading-text="正在请求,请稍等......">
      <el-form
        :model="boxFormModel.courseSubLessonAddForm"
        ref="courseSubLessonAddForm"
        label-width="150px"
        class="demo-ruleForm"
      >
        <el-transfer
          filterable
          :filter-method="filterMethod"
          filter-placeholder="请输入课次名称"
          v-model="boxFormModel.courseSubLessonAddForm.lessonIds"
          :titles="['课次列表', '已分配课次']"
          :button-texts="['移出分配区', '到已分配区']"
          :data="lessonTransfer">
        </el-transfer>
      </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="danger" @click="onSubmit('courseSubLessonAddForm','postLessonToCourse','POST',true)">保存</el-button>
          <el-button @click="boxVisibleConfig.courseSubLessonAddForm = false">取消</el-button>
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
      tableData:{masterTable:[],courseSubLessonTable:[]},
      tableIndex:0,
      pageTitle: "课程体系管理",
      searchName:'',
      cdnUrl:Util.cdnUrl,
      fileUploadUrlKey:Util.serverUrl+'/admin/oss/upload',
      tableDelUrlKey:'deleteCourseDel',
      multipleSelection: [],
      lessonOption:[],
      lessonTransfer:[],
      boxVisibleConfig:{courseForm:false,lessonListBox:false,courseSubLessonAddForm:false},
      editFormBtn:false,
      boxFormModel:{
        lessonListBox:[],
        courseSubLessonAddForm:{courseId:0,lessonIds:[]},
        courseDefForm:{id:0,name:'',description:''},
        courseForm:{}
      },
      courseFormRules:{
        name: [
          { required: true, message: '请输入课程体系名称', trigger: 'blur' },
          { min: 2, max: 24, message: '长度在 2 到 24个字符', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入描述信息', trigger: 'blur' },
        ]
      },
      xhr: new XMLHttpRequest(), //初始化HTTP
      uploadPercentKey:'',
      uploadPercent: {
        courseIcon: 0,
      }, //阿里云资源上传进度配置
      showProgress: {
        courseIcon: false
      } //阿里云资源上传进度条显示配置
    };
  },
  methods: {
    filterMethod(query, item) {
      return item.label.indexOf(query) > -1;
    },
    handleAvatarSuccess(res, file) {
      this.boxFormModel.icon = URL.createObjectURL(file.raw);
      console.log(file);
      console.log(URL.createObjectURL(file.raw));
    },
    dataFormatter(row,column){
      return Util.dataFormatter(row,column.property);
    },
    beforeAvatarUpload(file) {
      const isJPG = (file.type === 'image/jpeg' || file.type === 'image/png');
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('上传课程主图只能是 JPG/PNG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传课程主图大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    courseIconUpload(file){
      this.fileUpload(file,'courseVue/'+this.boxFormModel.courseForm.id+'/icon','courseForm','icon','courseIcon');
    },
    progressFunction(event) {
      let progressName = this.uploadPercentKey;
      // 设置进度显示
      if (event.lengthComputable) {
        var percent = Math.floor((event.loaded / event.total) * 100);
        if (percent > 100) {
          percent = 100;
        }
        this.$set(this.uploadPercent,progressName,percent);
      }
      this.$set(this.showProgress,progressName,true);
    },
    fileUpload(file, pathDir,formName,attrName,listtype) {
      var that = this;
      that.pageLoading = true;
      that.$newpost({
        url: "getOssToken",
        data: {
          upload_dir: pathDir
        },
        success: function(reData) {
          reData = JSON.parse(atob(reData));
          var reOssData = Util.getOssData(reData, file);
          that.xhr.open("post", reData.host, true);
          that.uploadPercentKey = listtype;
          that.xhr.upload.onprogress = that.progressFunction;
          that.xhr.onload = () => {
            that.$message({
              type: "success",
              message: "上传完成"
            });
            that.boxFormModel[formName][attrName] = reOssData.filepathName;
            that.xhr.abort();
            that.pageLoading = false;
          };
          that.xhr.send(reOssData.ossData);
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
    onEdit(formName,obj,isedit,index = 0) {
      this.editFormBtn = isedit;
      this.tableIndex = index;
      if(formName == 'courseSubLessonAddForm'){
        this.getLessonList();
      } else {
        this.boxFormModel[formName] = JSON.parse(JSON.stringify(obj));
      }
      this.uploadPercent= {courseIcon: 0};
      this.showProgress={courseIcon: false};
      this.boxVisibleConfig[formName] = true;
    },
    onLessonList(formName,obj) {
      this.boxVisibleConfig[formName] = true;
      this.boxFormModel[formName] = obj;
      this.getLessonsByCourseId(obj.id);
      this.boxFormModel.courseSubLessonAddForm.courseId = obj.id;
    },
    onDelete(index, row, rowName, tableDelUrlKey, tableName) {
      var that = this;
      that.$confirm("此操作将删除["+rowName+"], 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          that.$newpost({
            url: tableDelUrlKey,
            data: {
              id: row.id
            },
            success: function(data) {
              that.tableData[tableName].splice(index, 1);
              that.$message({
                type: "success",
                message: "删除成功!"
              });
              if(tableName == 'courseSubLessonTable'){
                that.boxFormModel.courseSubLessonAddForm.lessonIds.splice(index, 1);
              }
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
          var putObj = {};
          putObj = that.boxFormModel[formName];
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
              if (push && formName == 'courseForm') {
                if(that.tableData.masterTable.length>0){
                  that.tableData.masterTable.unshift(reData);
                } else {
                  that.tableData.masterTable.push(reData);
                }
              } else if(formName == 'courseForm'){
                that.$set(that.tableData.masterTable,that.tableIndex,putObj);
              }
              if (push && formName == 'courseSubLessonAddForm') {
                if(reData.records){
                  reData.records.forEach((info, index) => {
                    that.tableData.courseSubLessonTable.push(info);
                  });
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
        url: 'getCourseSelect',
        data: postData,
        checkToken:true,
        success: function(reData,reMsg) {
          that.pageLoading = false;
          that.pagination.total = reData.allCount;
          that.tableData.masterTable = reData.records;
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
    getLessonsByCourseId(id){
      var that = this;
      if(id){
        that.pageLoading = true;
        that.$newpost({
          url: 'getAllLesson',
          data: {course_id:id},
          success: function(reData,reMsg) {
            that.pageLoading = false;
            if(reData){
              that.tableData.courseSubLessonTable = reData;
              let parentIds = [];
              reData.forEach((info, index) => {
                parentIds.push(info.parent_id);
              });
              that.boxFormModel.courseSubLessonAddForm.lessonIds = parentIds;
              console.log(that.boxFormModel.courseSubLessonAddForm.lessonIds);
            } else {
              that.tableData.courseSubLessonTable = []
              that.boxFormModel.courseSubLessonAddForm.lessonIds = []
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
    getLessonList() {
      var that = this;
      if(that.lessonOption.length === 0){
        that.pageLoading = true;
        that.$newpost({
          url: 'getAllLesson',
          data: {},
          checkToken:true,
          success: function(reData,reMsg) {
            that.pageLoading = false;
            that.lessonOption = reData;
            const lessonTransfer = [];
            reData.forEach((info, index) => {
              lessonTransfer.push({
                label: info.name,
                key: info.id,
                disabled: that.boxFormModel.courseSubLessonAddForm.lessonIds.indexOf(info.id) >= 0
              });
            });
            that.lessonTransfer = lessonTransfer;
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
        const lessonTransfer = [];
        that.lessonOption.forEach((info, index) => {
          lessonTransfer.push({
            label: info.name,
            key: info.id,
            disabled: that.boxFormModel.courseSubLessonAddForm.lessonIds.indexOf(info.id) >= 0
          });
        });
        that.lessonTransfer = lessonTransfer;
      }
    },
    
  },
  beforeMount() {//挂载前
  },
  mounted() {//挂载完成
  },
  created(){//创建完成
    this.getLessonList();
    this.getData(1);
  },
  components: {//引用自定义模板
  }
};
</script>
<style scoped>
@import url("../../assets/css/tableComm.css");
</style>