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
          <el-form-item label="课次名称">
            <el-input v-model="searchName" v-on:keyup.enter.native="onSearch"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSearch">查询</el-button>
          </el-form-item>
        </el-form>
        <el-row>
          <el-col :span="24">
            <el-button type="success" @click="onEdit('lessonForm',boxFormModel.lessonDefForm,false)" round icon="el-icon-circle-plus" size="mini" >新增</el-button>
            <el-button v-if="delRoleShow"  type="danger" :disabled="multipleSelection.length>0 ? false : true" @click="onDeleteAll()" round icon="el-icon-delete" size="mini">删除</el-button>
            <el-button v-if="delRoleShow" type="primary" :disabled="multipleSelection.length>0 ?  false : true" round icon="el-icon-error" size="mini" @click="toggleSelection()">清空选中</el-button>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-table ref="multipleTable" stripe :data="tableData" style="width: 100%;height:auto;" @selection-change="handleSelectionChange" border>
              <el-table-column v-if="delRoleShow" type="selection" width="50" align="center"></el-table-column>
              <el-table-column prop="id" label="课次编号"  align="center"></el-table-column>
              <el-table-column prop="name" label="课次名称" align="center"></el-table-column>
              <el-table-column prop="create_time" :formatter="dataFormatter" label="创建日期" align="center"></el-table-column>
              <el-table-column label="操作" fixed="right" width="240">
                <template slot-scope="scope">
                  <el-button size="mini" icon="el-icon-edit" @click="onEdit('lessonForm',scope.row,true,scope.$index)">编辑</el-button>
                  <el-button size="mini" type="primary" icon="el-icon-edit" @click="onGetLessonTask('taskForm',scope.row.id)">作业</el-button>
                  <el-button size="mini" type="warning" icon="el-icon-refresh" @click="onGetHistoryList('historyForm',scope.row.id,scope.$index)">版本记录</el-button>
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
    </el-tabs>
    <el-dialog title="版本信息" :visible.sync="boxVisibleConfig.historyForm" width="50%" v-loading="pageLoading" element-loading-text="正在请求,请稍等......">
      <el-row>
        <el-col :span="24">
          <el-table ref="multipleTable" stripe :data="boxFormModel.historyList" style="width: 100%;height:auto;" border>
            <el-table-column prop="file" label="视频文件" align="left"></el-table-column>
            <el-table-column prop="whole_sb_url" label="完整模板文件" align="left"></el-table-column>
            <el-table-column prop="class_sb_url" label="上课模板文件"  align="left"></el-table-column>
            <el-table-column prop="dateline" :formatter="dataFormatter" label="版本时间" width="180" align="left"></el-table-column>
            <el-table-column label="操作" fixed="right" width="200">
              <template slot-scope="scope">
                <el-button  style="margin:auto" icon="el-icon-refresh-left" type="danger" @click="onRollback(scope.row)">回退至当前版本</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click="boxVisibleConfig.historyForm = false">关闭</el-button>
      </div>
    </el-dialog>
    <el-dialog title="创建/编辑课次" :visible.sync="boxVisibleConfig.lessonForm" width="50%" v-loading="pageLoading" element-loading-text="正在请求,请稍等......">
      <el-form
        :model="boxFormModel.lessonForm"
        :rules="lessonFormRules"
        ref="lessonForm"
        label-width="150px"
        label-suffix=":"
        class="demo-ruleForm"
        size="mini"
      >
        <el-tabs type="border-card">
          <el-tab-pane label="课次信息">
            <el-row>
              <el-col :span="11">
                <el-form-item label="课次名称" prop="name">
                  <el-input v-model="boxFormModel.lessonForm.name"></el-input>
                </el-form-item>
                <el-form-item v-if="editFormBtn" label="课程主图">
                  <el-upload
                    class="avatar-uploader"
                    action="#"
                    :show-file-list="false"
                    :http-request="lessonIconUpload"
                    :before-upload="beforeAvatarUpload"
                    >
                    <img v-if="boxFormModel.lessonForm.icon" :src="cdnUrl+boxFormModel.lessonForm.icon" class="avatar">
                    <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                  </el-upload>
                  <el-progress
                    v-show="showProgress.lessonIcon"
                    :text-inside="true"
                    :stroke-width="15"
                    :percentage="uploadPercent.lessonIcon"
                  ></el-progress>
                </el-form-item>
              </el-col>
              <el-col :span="13" v-if="editFormBtn">
                <el-form-item label="学生上课模板(sb2)" prop="class_sb_url">
                  <el-upload
                    class="upload-demo"
                    action="#"
                    :file-list="boxFormModel.lessonForm.classSb2List"
                    :limit="1"
                    :on-remove="handleRemoveClassSb"
                    :before-remove="beforeRemoveSb2"
                    :http-request="lessonClassSbUpload"
                    :before-upload="beforeAvatarSb2Upload">
                    <el-button v-show="!boxFormModel.lessonForm.class_sb_url" size="small" type="primary">点击上传</el-button>
                    <div slot="tip" class="el-upload__tip">只能上传sb2文件，且不超过50M</div>
                  </el-upload>
                  <el-progress
                    v-show="showProgress.classSb2"
                    :text-inside="true"
                    :stroke-width="15"
                    :percentage="uploadPercent.classSb2"
                  ></el-progress>
                </el-form-item>
                <el-form-item label="老师上课模板(sb2)" prop="whole_sb_url">
                  <el-upload
                    class="upload-demo"
                    action="#"
                    :file-list="boxFormModel.lessonForm.wholeSb2List"
                    :limit="1"
                    :on-remove="handleRemoveWholeSb"
                    :before-remove="beforeRemoveSb2"
                    :http-request="lessonWholeSbUpload"
                    :before-upload="beforeAvatarSb2Upload">
                    <el-button v-show="!boxFormModel.lessonForm.whole_sb_url" size="small" type="primary">点击上传</el-button>
                    <div slot="tip" class="el-upload__tip">只能上传sb2文件，且不超过50M</div>
                  </el-upload>
                   <el-progress
                      v-show="showProgress.wholeSb2"
                      :text-inside="true"
                      :stroke-width="15"
                      :percentage="uploadPercent.wholeSb2"
                    ></el-progress>
                </el-form-item>
                <el-form-item label="课次课件(webm)">
                  <el-upload
                    class="upload-demo"
                    action="#"
                    :file-list="boxFormModel.lessonForm.webmList"
                    :limit="1"
                    :on-remove="handleRemoveWebm"
                    :before-remove="beforeRemoveWebm"
                    :http-request="lessonWebmUpload"
                    :before-upload="beforeAvatarWebmUpload">
                    <el-button v-show="!boxFormModel.lessonForm.file" size="small" type="primary">点击上传</el-button>
                    <div slot="tip" class="el-upload__tip">只能上传webm文件，且不超过100M</div>
                  </el-upload>
                    <el-progress
                      v-show="showProgress.lessonWebm"
                      :text-inside="true"
                      :stroke-width="15"
                      :percentage="uploadPercent.lessonWebm"
                    ></el-progress>
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-show="!editFormBtn" type="primary" @click="onSubmit('lessonForm','putLessonUpdate','POST',true)">添加</el-button>
        <el-button v-show="editFormBtn" type="danger" @click="onSubmit('lessonForm','putLessonUpdate','PUT')">保存</el-button>
        <el-button @click="boxVisibleConfig.lessonForm = false">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog title="创建/编辑作业" :visible.sync="boxVisibleConfig.taskForm" width="50%" v-loading="pageLoading" element-loading-text="正在请求,请稍等......">
      <el-form
        :model="boxFormModel.taskForm"
        ref="taskForm"
        label-width="150px"
        label-suffix=":"
        class="demo-ruleForm"
        size="mini"
      >
        <el-tabs type="border-card">
          <el-tab-pane label="作业信息">
            <el-row>
              <el-col :span="11">
                <el-form-item label="作业名称" prop="name">
                  <el-input v-model="boxFormModel.taskForm.name"></el-input>
                </el-form-item>
                <el-form-item label="备注" prop="description">
                  <el-input type="textarea" v-model="boxFormModel.taskForm.description"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="13">
                <el-form-item label="作业主图" prop="icon">
                  <el-upload
                    class="avatar-uploader"
                    action="#"
                    :show-file-list="false"
                    :http-request="lessonTaskIconUpload"
                    :before-upload="beforeAvatarUpload"
                    >
                    <img v-if="boxFormModel.taskForm.icon" :src="cdnUrl+boxFormModel.taskForm.icon" class="avatar">
                    <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                  </el-upload>
                  <el-progress
                    v-show="showProgress.taskIcon"
                    :text-inside="true"
                    :stroke-width="15"
                    :percentage="uploadPercent.taskIcon"
                  ></el-progress>
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="onSubmit('taskForm','postLessonTaskUpdate','PUT')">保存</el-button>
        <el-button @click="boxVisibleConfig.taskForm = false">取消</el-button>
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
      delRoleShow:false,
      pagination: {
        total: 0,
        pagesize:10
      },
      tableData:[],
      tableIndex:0,
      pageTitle: "课次管理",
      searchName:'',
      cdnUrl:Util.cdnUrl,
      fileUploadUrlKey:Util.serverUrl+'/admin/oss/upload',
      tableDelUrlKey:'deleteLessonDel',
      multipleSelection: [],
      boxVisibleConfig:{lessonForm:false,taskForm:false,historyForm:false},
      editFormBtn:false,
      masterLessonId:0,
      boxFormModel:{
        lessonDefForm:{id:0,name:'',taskInfo:{name:'',description:''},classSb2List:[],wholeSb2List:[],webmList:[],class_sb_url:'',whole_sb_url:'',file:''},
        lessonForm:{id:0,name:'',taskInfo:{name:'',description:''},classSb2List:[],wholeSb2List:[],webmList:[],class_sb_url:'',whole_sb_url:'',file:''},
        taskForm:{},
        lessonFormBak:{},
        historyList:[]
      },
      lessonFormRules:{
        name: [
          { required: true, message: '请输入校区名称', trigger: 'blur' },
          { min: 2, max: 12, message: '长度在 2 到 12个字符', trigger: 'blur' }
        ],
        class_sb_url:[
          { required: true, message: '请上传学生上课模板', trigger: 'blur' },
          { min: 3, message: '请上传学生上课模板', trigger: 'blur' }
        ],
        whole_sb_url:[
          { required: true, message: '请上传老师上课模板', trigger: 'blur' },
          { min: 3, message: '请上传老师上课模板', trigger: 'blur' }
        ],
      },
      xhr: new XMLHttpRequest(), //初始化HTTP
      uploadPercent: {
        lessonIcon: 0,
        taskIcon:0,
        classSb2:0,
        wholeSb2:0,
        lessonWebm:0,
      }, //阿里云资源上传进度配置
      uploadPercentKey:'',
      showProgress: {
        lessonIcon: false,
        taskIcon:false,
        classSb2:false,
        wholeSb2:false,
        lessonWebm:false,
      } //阿里云资源上传进度条显示配置
    };
  },
  methods: {
    handleRemoveWholeSb(file, fileList) {
      this.boxFormModel.lessonForm.wholeSb2List = [];
      this.boxFormModel.lessonForm.whole_sb_url = '';
      this.uploadPercent.wholeSb2 = 0;
      this.showProgress.wholeSb2 = false;
    },
    handleRemoveClassSb(file, fileList) {
      this.boxFormModel.lessonForm.classSb2List = [];
      this.boxFormModel.lessonForm.class_sb_url = '';
      this.uploadPercent.classSb2 = 0;
      this.showProgress.classSb2 = false;
    },
    handleRemoveWebm(file, fileList) {
      this.boxFormModel.lessonForm.webmList = [];
      this.boxFormModel.lessonForm.file = '';
      this.uploadPercent.lessonWebm = 0;
      this.showProgress.lessonWebm = false;
    },
    dataFormatter(row,column){
      return Util.dataFormatter(row,column.property);
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${ file.name }？`);
    },
    beforeRemoveSb2(file, fileList) {
       const confimRe = this.beforeAvatarSb2Upload(file);
       if(confimRe){
         return this.$confirm(`确定移除 ${ file.name }？`);
       } else {
         return true;
       }
    },
    beforeRemoveWebm(file, fileList) {
       const confimRe = this.beforeAvatarWebmUpload(file);
       if(confimRe){
         return this.$confirm(`确定移除 ${ file.name }？`);
       } else {
         return true;
       }
    },
    lessonTaskIconUpload(file){
      this.fileUpload(file,'lessonVue/'+this.masterLessonId+'/task','taskForm','icon','taskIcon');
    },
    lessonIconUpload(file){
      this.fileUpload(file,'lessonVue/'+this.boxFormModel.lessonForm.id+'/icon','lessonForm','icon','lessonIcon');
    },
    lessonClassSbUpload(file){
      this.fileUpload(file,'lessonVue/'+this.boxFormModel.lessonForm.id+'/sb','lessonForm','class_sb_url','classSb2');
    },
    lessonWholeSbUpload(file){
      this.fileUpload(file,'lessonVue/'+this.boxFormModel.lessonForm.id+'/sb','lessonForm','whole_sb_url','wholeSb2');
    },
    lessonWebmUpload(file){
      this.fileUpload(file,'lessonVue/'+this.boxFormModel.lessonForm.id+'/sb','lessonForm','file','lessonWebm');
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
          var reOssData = Util.getOssData(reData, file, 1);
          that.xhr.open("post", reData.host, true);
          that.uploadPercentKey = listtype;
          that.xhr.upload.onprogress = that.progressFunction;
          that.xhr.onload = () => {
            that.$message({
              type: "success",
              message: "上传完成"
            });
            if(attrName == 'whole_sb_url' || attrName == 'class_sb_url'){
              that.$set(that.boxFormModel[formName],attrName, that.cdnUrl+reOssData.filepathName);
              if(attrName == 'whole_sb_url'){
                that.$set(that.boxFormModel[formName],'wholeSb2List', that.newFileRowData(that.cdnUrl+reOssData.filepathName));
              } else {
                that.$set(that.boxFormModel[formName],'classSb2List', that.newFileRowData(that.cdnUrl+reOssData.filepathName));
              }
            } else {
              if(attrName === 'file'){
                that.$set(that.boxFormModel[formName],'webmList', that.newFileRowData(reOssData.filepathName));
              }
              that.$set(that.boxFormModel[formName],attrName, reOssData.filepathName);
            }
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
    beforeAvatarSb2Upload(file) {
      const fileName = file.name.lastIndexOf(".");//获取到文件名开始到最后一个“.”的长度。
      const fileFormat = file.name.substring(fileName + 1);//截取后缀名
      const isJPG = (fileFormat === 'sb2');
      const isLt2M = file.size / 1024 / 1024 < 50;

      if (!isJPG) {
        this.$message.error('上传文件类型只能是[sb2]格式!');
      }
      if (!isLt2M && file.size) {
        this.$message.error('上传文件大小不能超过 50MB!');
      }
      return isJPG && isLt2M;
    },
    beforeAvatarWebmUpload(file) {
      const fileName = file.name.lastIndexOf(".");//获取到文件名开始到最后一个“.”的长度。
      const fileFormat = file.name.substring(fileName + 1);//截取后缀名
      const isJPG = (fileFormat === 'webm');
      const isLt2M = file.size / 1024 / 1024 < 100;

      if (!isJPG) {
        this.$message.error('上传文件类型只能是[webm]格式!');
      }
      if (!isLt2M && file.size) {
        this.$message.error('上传文件大小不能超过 100MB!');
      }
      return isJPG && isLt2M;
    },
    beforeAvatarUpload(file) {
      const isJPG = (file.type === 'image/jpeg' || file.type === 'image/png');
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('上传文件类型只能是[JPG/PNG]格式!');
      }
      if (!isLt2M && file.size) {
        this.$message.error('上传文件大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
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
        url: 'getLessonSelect',
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
    newFileRowData(fileUrl){//重构文件行数据格式2019年05月29日
      if(fileUrl){
        const fileplace   = fileUrl.lastIndexOf("/");
        const fileName = fileUrl.substring(fileplace + 1);
        return [{name:fileName,url:fileUrl}];
      } else {
        return [];
      }
    },
    onRollback(rowInfo){
      var that = this;
      that.$confirm("此操作将回退至["+rowInfo.dateline+"]的版本, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
      })
      .then(() => {
        that.pageLoading = true;
        that.$newpost({
          url: 'postLessonRollback',
          data: {
            lesson_id: that.masterLessonId,
            lesson_version_id:rowInfo.id
          },
          success: function(data) {
            that.$message({
              type: "success",
              message: "回退成功!"
            });
            const reViewData = that.tableData[that.tableIndex];
            reViewData.file = rowInfo.file;
            reViewData.class_sb_url = rowInfo.class_sb_url;
            reViewData.whole_sb_url = rowInfo.whole_sb_url;
            that.$set(that.tableData,that.tableIndex,reViewData);
            that.pageLoading = false;
          },
          error: function(data) {
            that.$message({
              type: "error",
              message: "回退失败:" + data.msg
            });
             that.pageLoading = false;
          }
        });
      })
      .catch(() => {
        that.$message({
          type: "info",
          message: "已取消回退"
        });
      });
    },
    onGetHistoryList(formName,lessonId,index){
      var that = this;
      that.masterLessonId = lessonId;
      that.tableIndex = index;
      that.pageLoading = true;
      that.$newpost({
        url: 'postLessonRollbackList',
        data: {
          lesson_id: lessonId
        },
        success: function(data) {
          that.boxFormModel.historyList = data;
          that.boxVisibleConfig[formName] = true;
          that.pageLoading = false;
        },
        error: function(data) {
          that.$message({
            type: "error",
            message: "失败:" + data.msg
          });
          that.pageLoading = false;
        }
      });
    },
    onGetLessonTask(formName,lessonId){
      var that = this;
      that.uploadPercent.taskIcon=0;
      that.showProgress.taskIcon=false;
      that.masterLessonId = lessonId;
      that.pageLoading = true;
      that.$newpost({
        url: 'getLessonTask',
        data: {
          lesson_id: lessonId
        },
        success: function(data) {
          that.boxFormModel.taskForm = {lesson_id:lessonId};
          if(data && data.id>0){
            that.boxFormModel.taskForm = data;
          }
          that.boxVisibleConfig[formName] = true;
          that.pageLoading = false;
        },
        error: function(data) {
          that.$message({
            type: "error",
            message: "失败:" + data.msg
          });
          that.pageLoading = false;
        }
      });
    },
    onEdit(formName,obj,isedit,index = 0) {
      this.boxFormModel[formName] = JSON.parse(JSON.stringify(obj));
      this.editFormBtn = isedit;
      this.tableIndex = index;
      if(isedit){
        this.boxFormModel[formName].classSb2List = this.newFileRowData(this.boxFormModel[formName].class_sb_url);
        this.boxFormModel[formName].wholeSb2List = this.newFileRowData(this.boxFormModel[formName].whole_sb_url);
        this.boxFormModel[formName].webmList = this.newFileRowData(this.boxFormModel[formName].file);
      }
      this.uploadPercent= {
        lessonIcon: 0,
        classSb2:0,
        wholeSb2:0,
        lessonWebm:0,
      }
      this.showProgress={
        lessonIcon: false,
        classSb2:false,
        wholeSb2:false,
        lessonWebm:false,
      }
      this.boxVisibleConfig[formName] = true;
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
              id: row.id
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
              if (push && formName == 'lessonForm') {
                if(that.tableData.length>0){
                  that.tableData.unshift(reData);
                } else {
                  that.tableData.push(reData);
                }
              } else if(formName == 'lessonForm') {
                that.$set(that.tableData,that.tableIndex,putObj);
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
    }
  },
  beforeMount() {//挂载前
  },
  mounted() {//挂载完成
    //this.lessonForm = this.lessonDefForm;
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