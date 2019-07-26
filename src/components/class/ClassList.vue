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
          <el-form-item label="班级名称:">
            <el-input v-model="searchName" v-on:keyup.enter.native="onSearch"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSearch">查询</el-button>
          </el-form-item>
        </el-form>
        <el-row>
          <el-col :span="24">
            <el-button type="success" @click="onEdit('classForm',boxFormModel.classDefForm,false)" round icon="el-icon-circle-plus" size="mini" >新增</el-button>
            <el-button type="danger" :disabled="multipleSelection.length>0 ? false : true" @click="onDeleteAll()" round icon="el-icon-delete" size="mini">删除</el-button>
            <el-button type="primary" :disabled="multipleSelection.length>0 ?  false : true" round icon="el-icon-error" size="mini" @click="toggleSelection()">清空选中</el-button>
          </el-col>
        </el-row>
        <el-divider><i class="el-icon-caret-bottom"></i></el-divider>
        <el-row>
          <el-col :span="24">
            <el-table ref="multipleTable" stripe :data="tableData" style="width: 100%;height:auto;" @selection-change="handleSelectionChange" border>
              <el-table-column prop="id" label="编号" width="50"></el-table-column>
              <el-table-column prop="name" label="名称" width="180"></el-table-column>
              <el-table-column label="类型" width="180">
                <template slot-scope="scope">
                  <span style="margin-left: 10px">{{ classTypeMap[scope.row.type]}}</span>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="描述"></el-table-column>
              <el-table-column label="校区" width="120">
                <template slot-scope="scope">
                  <span style="margin-left: 10px">{{ campusMap[scope.row.campus_id]}}</span>
                </template>
              </el-table-column>
              <el-table-column prop="create_time" :formatter="dataFormatter" label="创建日期" width="175"></el-table-column>
              <el-table-column prop="last_time" :formatter="dataFormatter" label="最后一次上课时间" width="175"></el-table-column>
              <el-table-column label="操作" fixed="right" width="330">
                <template slot-scope="scope">
                  <el-button size="mini" icon="el-icon-edit" @click="onEdit('classForm',scope.row,true,scope.$index)">编辑</el-button>
                  <el-button size="mini" icon="el-icon-delete-solid" type="danger" @click="onDelete(scope.$index, scope.row, scope.row.name)">删除</el-button>
                  <el-button size="mini" icon="el-icon-postcard" type="success" @click="onStudentToClass(scope.row)">分配学生</el-button>
                  <el-button size="mini" icon="el-icon-view" type="success" @click="onShowCourseList('courseListBox',scope.row.id)">课程信息</el-button>
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
    <el-dialog title="创建/编辑班级" :visible.sync="boxVisibleConfig.classForm" width="40%" v-loading="pageLoading" element-loading-text="正在请求,请稍等......">
      <el-form
        :model="boxFormModel.classForm"
        :rules="classFormRules"
        ref="classForm"
        label-width="140px"
        class="demo-ruleForm"
        size="mini"
      >
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="boxFormModel.classForm.name"></el-input>
        </el-form-item>
        <el-form-item label="班级类型" prop="type">
          <el-select v-model="boxFormModel.classForm.type" filterable placeholder="请选择">
            <el-option
              v-for="(val, key) in classTypeMap"
              :key="key"
              :label="val"
              :value="key*1">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="班级描述" prop="description">
          <el-input type="textarea" v-model="boxFormModel.classForm.description"></el-input>
        </el-form-item>
        <el-form-item label="所属校区" prop="campus_id">
          <el-select v-model="boxFormModel.classForm.campus_id" filterable placeholder="请选择" :disabled="editFormBtn">
            <el-option
              v-for="(val, key) in campusMap"
              :key="key"
              :label="val"
              :value="key*1">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="editFormBtn" label="任课老师">
          <el-transfer
            filterable
            :filter-method="filterMethod"
            filter-placeholder="请输入老师姓名"
            v-model="boxFormModel.classForm.teacher_ids"
            :titles="['老师列表', '已分配老师']"
            :button-texts="['移出分配区', '到已分配区']"
            :data="teacherListByCampusId">
          </el-transfer>
        </el-form-item>
        <el-form-item v-if="editFormBtn" label="班主任">
          <el-transfer
            filterable
            :filter-method="filterMethod"
            filter-placeholder="请输入班主任姓名"
            v-model="boxFormModel.classForm.head_teacher_ids"
            :titles="['班主任列表', '已分配班主任']"
            :button-texts="['移出分配区', '到已分配区']"
            :data="headTeacherListByCampusId">
          </el-transfer>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-show="!editFormBtn" type="primary" @click="onSubmit('classForm','putClassUpdate','POST',true)">添加</el-button>
        <el-button v-show="editFormBtn" type="danger" @click="onSubmit('classForm','putClassUpdate','PUT')">保存</el-button>
        <el-button @click="boxVisibleConfig.classForm = false">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog title="分配学生" :visible.sync="boxVisibleConfig.studentToClassForm" width="40%" v-loading="pageLoading" element-loading-text="正在请求,请稍等......">
      <el-form
        :model="boxFormModel.studentToClassForm"
        ref="studentToClassForm"
        label-width="150px"
        class="demo-ruleForm"
      >
        <el-transfer
          filterable
          :filter-method="filterMethod"
          filter-placeholder="请输入学生姓名"
          v-model="boxFormModel.studentToClassForm.studentIds"
          :titles="['学生列表', '已分配学生']"
          :button-texts="['移出分配区', '到已分配区']"
          :data="studentListByCampusId">
        </el-transfer>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button  type="primary" @click="onSubmit('studentToClassForm','postStudentToClass','POST')">确定</el-button>
        <el-button  @click="boxVisibleConfig.studentToClassForm = false">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog title="课程体系配置" :visible.sync="boxVisibleConfig.courseListBox" width="40%" v-loading="pageLoading" element-loading-text="正在请求,请稍等......">
      <el-row>
        <el-col :span="12">
          <el-button type="success" @click="onClassCourseAdd('classCourseAddForm')" round icon="el-icon-circle-plus" size="mini" >添加已有课程体系</el-button>
        </el-col>
        <el-col :span="12" v-if="courseListViewData && courseListViewData.length>0" style="text-align:right;">
          <el-button size="mini" type="primary" icon="el-icon-view" @click="onShowLessonList('lessonListBox',masterClassId)">查看课次信息</el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-table ref="multipleTable" stripe :data="courseListViewData" style="width: 100%;height:auto;" border>
            <el-table-column prop="name" label="课程名称" width="240" align="left"></el-table-column>
            <el-table-column prop="start_time" :formatter="dataFormatter"  label="开课时间" width="180" align="left"></el-table-column>
            <el-table-column prop="duration_time" label="上课时长" width="100" align="left"></el-table-column>
            <el-table-column label="操作" fixed="right" width="120">
              <template slot-scope="scope">
                <el-button size="mini" icon="el-icon-delete-solid" type="danger" @click="onDeleteClassCourse(scope.$index, scope.row, scope.row.name)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click="boxVisibleConfig.courseListBox = false">关闭</el-button>
      </div>
    </el-dialog>
    <el-dialog title="添加已有的课程体系" :visible.sync="boxVisibleConfig.classCourseAddForm" width="40%" v-loading="pageLoading" element-loading-text="正在请求,请稍等......">
      <el-form
        :model="boxFormModel.classCourseAddForm"
        :rules="classCourseAddFormRules"
        ref="classCourseAddForm"
        label-width="150px"
        class="demo-ruleForm"
      >
        <el-form-item label="课程体系" prop="course_id">
          <el-select v-model="boxFormModel.classCourseAddForm.course_id"  placeholder="请选择">
            <el-option
              v-for="(val, key) in courseOption"
              :key="key"
              :label="val.name"
              :value="val.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="首次上课时间"  prop="start_time">
          <el-date-picker type="datetime" placeholder="选择日期时间"  value-format="yyyy-MM-dd HH:mm:ss"  v-model="boxFormModel.classCourseAddForm.start_time"></el-date-picker>
        </el-form-item>
        <el-form-item label="上课时长(分钟)"  prop="duration_time">
          <el-input type="number"  v-model.number="boxFormModel.classCourseAddForm.duration_time"></el-input>
        </el-form-item>
      </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="danger" @click="onSubmit('classCourseAddForm','postCreateClassLessons','POST',true)">保存</el-button>
          <el-button @click="boxVisibleConfig.classCourseAddForm = false">取消</el-button>
        </div>
    </el-dialog>
    <el-dialog title="课次时间管理" :visible.sync="boxVisibleConfig.lessonListBox" width="40%" v-loading="pageLoading" element-loading-text="正在请求,请稍等......">
      <el-row>
        <el-col :span="24">
          <el-table ref="multipleTable" stripe :data="lessonListViewData" style="width: 100%;height:auto;" border>
            <el-table-column prop="course_name" label="课程体系名称" width="220" align="center"></el-table-column>
            <el-table-column prop="lesson_name" label="课次名称" align="left"></el-table-column>
            <el-table-column prop="start_time" :formatter="dataFormatter"  label="开课时间" width="180" align="left"></el-table-column>
            <el-table-column prop="duration_time" label="上课时长" width="100" align="left"></el-table-column>
            <el-table-column label="操作" fixed="right" width="120">
              <template slot-scope="scope">
                <el-button v-if="scope.row.status === 2 || scope.row.status === 1" size="mini" disabled="disabled">已上</el-button>
                <el-button v-if="scope.row.status !== 2 && scope.row.status !== 1" size="mini" icon="el-icon-edit" type="danger" @click="onEdit('editStartTimeForm',scope.row,true,scope.$index)">修改</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click="boxVisibleConfig.lessonListBox = false">关闭</el-button>
      </div>
    </el-dialog>
    <el-dialog title="修改上课时间" :visible.sync="boxVisibleConfig.editStartTimeForm" width="40%" v-loading="pageLoading" element-loading-text="正在请求,请稍等......">
      <el-form
        :model="boxFormModel.editStartTimeForm"
        :rules="editStartTimeFormRules"
        ref="editStartTimeForm"
        label-width="140px"
        class="demo-ruleForm"
        size="mini"
      >
        <el-form-item label="首次上课时间" prop="start_time">
          <el-date-picker type="datetime" placeholder="选择日期时间"  value-format="yyyy-MM-dd HH:mm:ss" v-model="boxFormModel.editStartTimeForm.start_time"></el-date-picker>
        </el-form-item>
        <el-form-item label="上课时长(分钟)" prop="duration_time">
          <el-input type="number" v-model.number="boxFormModel.editStartTimeForm.duration_time"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="onSubmit('editStartTimeForm','updateClassLesson','POST')">保存</el-button>
        <el-button @click="boxVisibleConfig.editStartTimeForm = false">关闭</el-button>
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
      pageTitle: "班级管理",
      searchName:'',
      tableDelUrlKey:'deleteClassDel',
      courseOption:Util.courseOption,
      courseTransfer:[],
      studentListByCampusId:[],
      teacherListByCampusId:[],
      headTeacherListByCampusId:[],
      classTypeMap:Util.maliDictionaryMap[5].subMap,
      campusMap:Util.maliDictionaryMap[6].subMap,
      campusOption:Util.campusOption,
      masterClassId:0,
      multipleSelection: [],
      courseListViewData:[],
      courseListViewIndex:0,
      lessonListViewData:[],
      lessonListViewIndex:0,
      boxVisibleConfig:{classForm:false,studentToClassForm:false,lessonListBox:false,courseListBox:false,editStartTimeForm:false,classCourseAddForm:false},
      editFormBtn:false,
      boxFormModel:{
        studentToClassDefForm:{ids:[],classId:''},
        studentToClassForm:{},
        editStartTimeForm:{},
        classDefForm:{id:0,name:'',description:'',campus_id:'',type:''},
        classCourseAddForm:{class_id:0,course_id:''},
        classFormBak:{},
        classForm:{'head_teacher_ids':[],'teacher_ids':[]}
      },
      classFormRules:{
        name: [
          { required: true, message: '请输入校区名称', trigger: 'blur' },
          { min: 2, max: 12, message: '长度在 2 到 12个字符', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入描述信息', trigger: 'blur' },
        ],
        campus_id: [
           { required: true, message: '请选择校区', trigger: 'change' }
        ],
        type: [
          { required: true, message: '请选择班级类型', trigger: 'change' }
        ],
      },
      classCourseAddFormRules:{
        course_id: [
           { required: true, message: '请选择课程体系', trigger: 'change' }
        ],
        start_time:[
          { required: true, message: '请选择首次上课时间', trigger: 'change' }
        ],
        duration_time:[
          { required: true, message: '请输入上课时长(分钟)', trigger: 'blur' }
        ],
      },
      editStartTimeFormRules:{
        start_time:[
          { required: true, message: '请选择首次上课时间', trigger: 'change' }
        ],
        duration_time:[
          { required: true, message: '请输入上课时长(分钟)', trigger: 'blur' }
        ],
      }
    };
  },
  methods: {
    filterMethod(query, item) {
      return item.label.indexOf(query) > -1;
    },
    dataFormatter(row,column){
      return Util.dataFormatter(row,column.property);
    },
    getCourseList() {
      var that = this;
      if(that.courseOption.length === 0){
        that.pageLoading = true;
        that.$newpost({
          url: 'getAllCourse',
          data: {data:1},
          success: function(reData,reMsg) {
            Util.courseOption = reData;
            that.courseOption = reData;
            const courseTransfer = [];
            reData.forEach((info, index) => {
              courseTransfer.push({
                label: info.name,
                key: info.id
              });
            });
            that.courseTransfer = courseTransfer;
            that.pageLoading = false;
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
        const courseTransfer = [];
        that.courseOption.forEach((info, index) => {
          courseTransfer.push({
            label: info.name,
            key: info.id
          });
        });
        that.courseTransfer = courseTransfer;
      }
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
            Util.campusOption = reData;
            that.campusOption = reData;
            var campusMap = {};
            reData.forEach(row => {
              campusMap[row.id] = row.name;
            });
            that.campusMap = campusMap;
            Util.maliDictionaryMap[6].subMap = campusMap;
            that.pageLoading = false;
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
        url: 'getClassSelect',
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
    getHeadTeacherListByCampusId(id){
      var that = this;
      if(id){
        that.pageLoading = true;
        that.$newpost({
          url: 'getEmployeeListByCampusId',
          data: {campus_id:id,job:9},
          success: function(reData,reMsg) {
            that.pageLoading = false;
            const headTeacherList = [];
            if(reData.length>0){
              reData.forEach((info, index) => {
                headTeacherList.push({
                  label: info.name,
                  key: info.id
                });
              });
            }
            that.headTeacherListByCampusId = headTeacherList;
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
    getTeacherListByCampusId(id){
      var that = this;
      if(id){
        that.pageLoading = true;
        that.$newpost({
          url: 'getEmployeeListByCampusId',
          data: {campus_id:id,jobs:'6,7'},
          success: function(reData,reMsg) {
            that.pageLoading = false;
            const teacherList = [];
            if(reData.length>0){
              reData.forEach((info, index) => {
                teacherList.push({
                  label: info.name,
                  key: info.id
                });
              });
            }
            that.teacherListByCampusId = teacherList;
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
    getHeadTeacherListByClassId(id){
      var that = this;
      if(id){
        that.pageLoading = true;
        that.$newpost({
          url: 'getEmployeeListByClassId',
          data: {class_id:id,job:9},
          success: function(reData,reMsg) {
            const headTeacherList = [];
            if(reData.length>0){
              reData.forEach((info, index) => {
                headTeacherList.push(info.id);
              });
            }
            console.log(headTeacherList);
            that.boxFormModel.classForm['head_teacher_ids'] = headTeacherList
            that.pageLoading = false;
            console.log(that.boxFormModel.classForm);
            console.log(that.teacherListByCampusId);
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
    getTeacherListByClassId(id){
      var that = this;
      if(id){
        that.pageLoading = true;
        that.$newpost({
          url: 'getEmployeeListByClassId',
          data: {class_id:id,jobs:'6,7'},
          success: function(reData,reMsg) {
            const teacherList = [];
            if(reData.length>0){
              reData.forEach((info, index) => {
                teacherList.push(info.id);
              });
            }
            console.log(teacherList);
            that.boxFormModel.classForm['teacher_ids'] = teacherList;
            console.log(that.boxFormModel.classForm);
            console.log(that.teacherListByCampusId);
            that.pageLoading = false;
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
    getStudentListByCampusId(id){
      var that = this;
      if(id){
        that.pageLoading = true;
        let postData = {
          currentPage: 1,
          pageSize: 500,
          campusId:id
        };
        that.$newpost({
          url: 'getStudentListByCampusId',
          data: postData,
          success: function(reData,reMsg) {
            const studentList = [];
            if(reData.records.length>0){
              reData.records.forEach((info, index) => {
                studentList.push({
                  label: info.name,
                  key: info.id
                });
              });
            }
            that.studentListByCampusId = studentList;
            that.pageLoading = false;
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
    getStudentListByClassId(id){
      var that = this;
      if(id){
        that.pageLoading = true;
        let postData = {
          class_id: id
        };
        that.$newpost({
          url: 'getStudentListByClassId',
          data: postData,
          success: function(reData,reMsg) {
            that.pageLoading = false;
            const studentList = [];
            if(reData.records && reData.records.length>0){
              reData.records.forEach((info, index) => {
                studentList.push(info.id);
              });
            }
            that.boxFormModel.studentToClassForm = {id:id,studentIds:studentList};
            that.boxVisibleConfig.studentToClassForm = true;
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
    onEdit(formName,obj,isedit,index = 0) {
      obj = Util.dataRowFormatter(obj);
      this.editFormBtn = isedit;
      if(formName == 'classForm'){
        this.boxFormModel['classFormBak'] = JSON.parse(JSON.stringify(obj));
        this.tableIndex = index;
      } else {
        this.boxFormModel[formName] = JSON.parse(JSON.stringify(obj));
      }
      if(formName == 'editStartTimeForm'){
        this.lessonListViewIndex = index;
      }
      this.boxVisibleConfig[formName] = true;
      if(isedit){
        if(formName == 'classForm'){
          this.headTeacherListByCampusId = [];
          this.teacherListByCampusId = [];
          this.boxFormModel['classFormBak']['head_teacher_ids'] = [];
          this.boxFormModel['classFormBak']['teacher_ids'] = [];
          console.log(this.boxFormModel.classFormBak);
          this.boxFormModel.classForm = JSON.parse(JSON.stringify(this.boxFormModel['classFormBak']));
          console.log(this.boxFormModel.classForm);
        }
        this.getHeadTeacherListByClassId(obj.id);
        this.getTeacherListByClassId(obj.id);
        this.getHeadTeacherListByCampusId(obj.campus_id);
        this.getTeacherListByCampusId(obj.campus_id);
      }
    },
    onClassCourseAdd(formName){
        this.boxVisibleConfig[formName] = true;
        this.getCourseList();
        this.boxFormModel[formName] = {class_id:this.masterClassId,course_id:''};
    },
    onShowLessonList(formName,id){
      var that = this;
      if(id){
        that.boxVisibleConfig[formName] = true;
        that.lessonListViewData = [];
        that.pageLoading = true;
        that.$newpost({
          url: 'getClassLessonListByClassId',
          data: {class_id:id},
          success: function(reData,reMsg) {
            that.pageLoading = false;
            that.lessonListViewData = reData;
          },
          error: function(data) {
            that.pageLoading = false;
            if(data.code){
              that.$message({
                type: "error",
                message: data.msg
              });
            }
          }
        });
      }
    },
    onShowCourseList(formName,id){
      var that = this;
      if(id){
        that.masterClassId = id;
        that.boxVisibleConfig[formName] = true;
        that.courseListViewData = [];
        that.pageLoading = true;
        that.$newpost({
          url: 'getClassCourseListByClassId',
          data: {class_id:id},
          success: function(reData,reMsg) {
            that.pageLoading = false;
            that.courseListViewData = reData;
          },
          error: function(data) {
            that.pageLoading = false;
            if(data.code){
              that.$message({
                type: "error",
                message: data.msg
              });
            }
          }
        });
      }
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
    onDeleteClassCourse(index, row, rowName) {
      var that = this;
      that.$confirm("此操作将删除["+rowName+"], 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          that.$newpost({
            url: 'deleteClassCourseLesson',
            data: {
              class_id: row.class_id,
              course_id: row.course_id,
            },
            success: function(data) {
              that.courseListViewData.splice(index, 1);
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
          if(submitUrlKey == 'postStudentToClass'){//分配学生参数结构非数据记录结构需要重构提交结构
            putObj = {ids:putObj.studentIds,classId:putObj.id};
          }
          that.pageLoading = true;
          that.$newpost({
            url: submitUrlKey,
            data: putObj,
            success: function(reData) {
              that.$message({
                type: "success",
                message: "success"
              });
              if (push && formName == 'classForm') {
                if(that.tableData.length>0){
                  that.tableData.unshift(reData);
                } else {
                  that.tableData.push(reData);
                }
              } else if(formName == 'classForm'){
                that.$set(that.tableData,that.tableIndex,putObj);
              } else if(formName == 'editStartTimeForm'){
                that.$set(that.lessonListViewData,that.lessonListViewIndex,putObj);
              }
              if(formName == 'classCourseAddForm'){
                that.courseListViewData=reData;
              }
              that.boxVisibleConfig[formName] = false;
              that.pageLoading = false;
            },
            error: function(data) {
              that.pageLoading = false;
              console.log(data);
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
    onStudentToClass(row){
      this.studentListByCampusId = [];
      this.getStudentListByCampusId(row.campus_id);
      this.getStudentListByClassId(row.id);
    }
  },
  beforeMount() {//挂载前
  },
  mounted() {//挂载完成
    this.getData(1);
  },
  created(){//创建完成
    this.getCampusList();
  },
  components: {//引用自定义模板
  }
};
</script>
<style scoped>
@import url("../../assets/css/tableComm.css");
</style>
