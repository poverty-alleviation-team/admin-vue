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
          <el-form-item label="姓名:">
            <el-input v-model="searchName" v-on:keyup.enter.native="onSearch"></el-input>
          </el-form-item>
          <el-form-item label="状态:">
            <el-select v-model="statusId" filterable placeholder="请选择">
              <el-option
                v-for="(val, key) in statusMap"
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
            <el-button type="success" @click="createForm('studentAddForm',boxFormModel.studentAddDefForm)" round icon="el-icon-circle-plus" size="mini" >新增</el-button>
            <el-button type="danger" :disabled="multipleSelection.length>0 ? false : true" @click="onDeleteAll()" round icon="el-icon-delete" size="mini">删除</el-button>
            <el-button type="primary" :disabled="multipleSelection.length>0 ?  false : true" round icon="el-icon-error" size="mini" @click="toggleSelection()">清空选中</el-button>
          </el-col>
        </el-row>
        <el-divider><i class="el-icon-caret-bottom"></i></el-divider>
        <el-row>
          <el-col :span="24">
            <el-table ref="multipleTable" stripe :data="tableData" style="width: 100%;height:auto;" @selection-change="handleSelectionChange" border>
              <el-table-column prop="id" label="编号" width="60"></el-table-column>
              <el-table-column prop="name" label="姓名" width="100"></el-table-column>
              <el-table-column label="性别" width="60">
                <template slot-scope="scope">
                  <span style="margin-left: 10px">{{ sexMap[scope.row.sex && scope.row.sex != null ? scope.row.sex : 0]}}</span>
                </template>
              </el-table-column>
              <el-table-column prop="age" label="年龄" width="80"></el-table-column>
              <el-table-column prop="school" label="学校"></el-table-column>
              <el-table-column prop="address" label="家庭住址"></el-table-column>
              <el-table-column prop="phone" label="家庭联系电话" width="140"></el-table-column>
              <el-table-column label="状态" width="160">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.status > 3  ? 'success' : 'warning'">{{ statusMap[scope.row.status]}}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="所属校区" width="160">
                <template slot-scope="scope">
                  <span style="margin-left: 10px">{{ campusMap[scope.row.campus_id]}}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" fixed="right" width="320">
                <template slot-scope="scope">
                  <el-button size="mini" icon="el-icon-view" @click="onEdit(scope.$index, scope.row,'studentViewForm')">详情</el-button>
                  <el-button size="mini" icon="el-icon-postcard" type="success" @click="onSignUp(scope.$index,scope.row,boxFormModel.studentSignUpDefForm,'studentSignUpForm')">报名缴费</el-button>
                  <el-button size="mini" icon="el-icon-s-claim" type="primary" @click="onShowSignList('signListBox',scope.row.id)">合同信息</el-button>
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
    <el-dialog title="合同信息" :visible.sync="boxVisibleConfig.signListBox" width="65%" v-loading="pageLoading" element-loading-text="正在请求,请稍等......">
      <el-row>
        <el-col :span="24">
          <el-table ref="multipleTable" stripe :data="signUpListViewData" style="width: 100%;height:auto;" border>
            <el-table-column prop="organization_name" label="机构名称" width="240" align="left"></el-table-column>
            <el-table-column prop="unit_price" label="原价" width="80" align="left"></el-table-column>
            <el-table-column prop="real_price" label="实际金额" width="100" align="left"></el-table-column>
            <el-table-column prop="lesson_package" label="课时包" width="100" align="left"></el-table-column>
            <el-table-column prop="valid_time" :formatter="dataFormatter" label="上课程有效期" width="180" align="left"></el-table-column>
            <el-table-column prop="create_time" :formatter="dataFormatter" label="合同时间" width="180" align="left"></el-table-column>
            <el-table-column label="操作" fixed="right" width="270">
              <template slot-scope="scope">
                <a :href="scope.row.previewUrl" target="_blank"><el-button  style="margin:auto" icon="el-icon-view" type="primary">浏览合同</el-button></a>
                <a :href="scope.row.fileUrl" target="_blank"><el-button  style="margin:auto" icon="el-icon-download" type="success">下载合同</el-button></a>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click="boxVisibleConfig.signListBox = false">关闭</el-button>
      </div>
    </el-dialog>
    <el-dialog title="学生信息详情" :visible.sync="boxVisibleConfig.studentViewForm" width="40%" v-loading="pageLoading" :close-on-click-modal="false" element-loading-text="正在请求,请稍等......">
      <el-form
        :model="boxFormModel.studentViewForm"
        :rules="studentAddFormRules"
        ref="studentViewForm"
        label-width="140px"
        class="demo-ruleForm"
        size="mini"
      >
        <el-tabs type="border-card">
          <el-tab-pane label="基本信息">
            <el-row>
              <el-col :span="10">
                <el-form-item label="姓名" prop="name">
                  <el-input v-model="boxFormModel.studentViewForm.name" :disabled="editStudentBtn"></el-input>
                </el-form-item>
                <el-form-item label="性别" prop="sex">
                  <el-select v-model="boxFormModel.studentViewForm.sex" :disabled="editStudentBtn" filterable placeholder="请选择">
                    <el-option
                      v-for="(val, key) in sexMap"
                      :key="key"
                      :label="val"
                      :value="key*1">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="年龄" prop="age">
                  <el-input v-model.number="boxFormModel.studentViewForm.age" :disabled="editStudentBtn"></el-input>
                </el-form-item>
                <el-form-item label="学校" prop="school">
                  <el-input v-model="boxFormModel.studentViewForm.school" :disabled="editStudentBtn"></el-input>
                </el-form-item>
                <el-form-item label="年级" prop="grade">
                  <el-input v-model="boxFormModel.studentViewForm.grade" :disabled="editStudentBtn"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="14">
                <el-form-item label="家庭住址" prop="address">
                  <el-input type="textarea" v-model="boxFormModel.studentViewForm.address" :disabled="editStudentBtn"></el-input>
                </el-form-item>
                <el-form-item label="家庭联系电话" prop="phone">
                  <el-input v-model="boxFormModel.studentViewForm.phone" :disabled="editStudentBtn"></el-input>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                  <el-select v-model="boxFormModel.studentViewForm.status" :disabled="editStudentBtn" filterable placeholder="请选择">
                    <el-option
                      v-for="(val, key) in statusMap"
                      :key="key"
                      :label="val"
                      :value="key*1">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="培训校区" prop="campus_id">
                  <el-select v-model="boxFormModel.studentViewForm.campus_id" :disabled="true" filterable placeholder="请选择">
                    <el-option
                      v-for="(val, key) in campusMap"
                      :key="key"
                      :label="val"
                      :value="key*1">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="渠道">
                  <el-select v-model="boxFormModel.studentViewForm.channel" :disabled="editStudentBtn" filterable placeholder="请选择">
                    <el-option
                      v-for="(val, key) in channelMap"
                      :key="key"
                      :label="val"
                      :value="key*1">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="更多信息">
            <el-row>
              <el-col :span="10">
                <el-form-item label="体验课谁陪同">
                  <el-input v-model="boxFormModel.studentViewForm.trialClass_escort" :disabled="editStudentBtn"></el-input>
                </el-form-item>
                <el-form-item label="有无基础">
                  <el-select v-model="boxFormModel.studentViewForm.is_has_basis" :disabled="editStudentBtn" filterable placeholder="请选择">
                    <el-option
                      v-for="(val, key) in yesNoMap"
                      :key="key"
                      :label="val"
                      :value="key*1">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="性格特点">
                  <el-input v-model="boxFormModel.studentViewForm.characteristics" :disabled="editStudentBtn"></el-input>
                </el-form-item>
                <el-form-item label="电脑操作情况">
                  <el-input v-model="boxFormModel.studentViewForm.computer_skills" :disabled="editStudentBtn"></el-input>
                </el-form-item>
                <el-form-item label="逻辑思维能力">
                  <el-input v-model="boxFormModel.studentViewForm.logical_capability" :disabled="editStudentBtn"></el-input>
                </el-form-item>
                <el-form-item label="录入时间">
                  {{boxFormModel.studentViewForm.create_time}}
                </el-form-item>
                <el-form-item label="备注">
                  <el-input type="textarea" v-model="boxFormModel.studentAddForm.description" :disabled="editStudentBtn"></el-input>
                </el-form-item>
                
              </el-col>
              <el-col :span="14">
                <el-form-item label="是否引导爸妈一起">
                  <el-select v-model="boxFormModel.studentViewForm.is_guide_escort" :disabled="editStudentBtn" filterable placeholder="请选择">
                    <el-option
                      v-for="(val, key) in yesNoMap"
                      :key="key"
                      :label="val"
                      :value="key*1">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="家长关注点">
                  <el-input v-model="boxFormModel.studentViewForm.parents_concern" :disabled="editStudentBtn"></el-input>
                </el-form-item>
                <el-form-item label="学习谁负责">
                  <el-input v-model="boxFormModel.studentViewForm.study_principal" :disabled="editStudentBtn"></el-input>
                </el-form-item>
                <el-form-item label="表达能力">
                  <el-input v-model="boxFormModel.studentViewForm.expression_ability" :disabled="editStudentBtn"></el-input>
                </el-form-item>
                <el-form-item label="学习习惯">
                  <el-input v-model="boxFormModel.studentViewForm.study_habit" :disabled="editStudentBtn"></el-input>
                </el-form-item>
                <el-form-item label="其它辅导班情况">
                  <el-input v-model="boxFormModel.studentViewForm.other_tutorial_class_situation" :disabled="editStudentBtn"></el-input>
                </el-form-item>
                <el-form-item label="上体验课时间">
                  <el-date-picker
                    v-model="boxFormModel.studentViewForm.tutorial_class_time"
                    :disabled="editStudentBtn"
                    type="date"
                    value-format="yyyy-MM-dd">
                  </el-date-picker>
                </el-form-item>
                
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-show="editStudentBtn" type="primary" @click="editStudentBtn=false">编辑</el-button>
        <el-button v-show="!editStudentBtn" type="danger" @click="onSubmit('studentViewForm','putStudentUpdate','PUT')">保存</el-button>
        <el-button @click="boxVisibleConfig.studentViewForm = false">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog title="报名缴费信息" :visible.sync="boxVisibleConfig.studentSignUpForm" width="40%" v-loading="pageLoading" element-loading-text="正在请求,请稍等......">
      <el-form
        :model="boxFormModel.studentSignUpForm"
        :rules="studentSignUpFormRules"
        ref="studentSignUpForm"
        label-width="150px"
        class="demo-ruleForm"
        v-if="boxFormModel.studentSignUpForm.docShow === 0"
      >
        <el-form-item label="机构名称" prop="organizationName">
          <el-input v-model="boxFormModel.studentSignUpForm.organizationName"></el-input>
        </el-form-item>
        <el-form-item label="校区电话" prop="campusPhone">
          <el-input v-model="boxFormModel.studentSignUpForm.campusPhone"></el-input>
        </el-form-item>
        <el-form-item label="原价" prop="unitPrice">
          <el-input type="number" v-model.number="boxFormModel.studentSignUpForm.unitPrice"></el-input>
        </el-form-item>
        <el-form-item label="实际付款" prop="realPrice">
          <el-input type="number" v-model.number="boxFormModel.studentSignUpForm.realPrice"></el-input>
        </el-form-item>
        <el-form-item label="优惠说明" prop="preferentialDescription">
          <el-input type="textarea" v-model="boxFormModel.studentSignUpForm.preferentialDescription"></el-input>
        </el-form-item>
        <el-form-item label="课时包(次)" prop="lessonPackage">
          <el-input type="number" v-model.number="boxFormModel.studentSignUpForm.lessonPackage"></el-input>
        </el-form-item>
        <el-form-item label="购买学科类型" prop="buyCourse">
          <el-select v-model="boxFormModel.studentSignUpForm.buyCourse" filterable placeholder="请选择">
            <el-option
              v-for="(val, key) in courseMap"
              :key="key"
              :label="val"
              :value="key*1">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="额外赠送学科" prop="giveCourse">
          <el-select v-model="boxFormModel.studentSignUpForm.giveCourse" filterable placeholder="请选择">
            <el-option
              v-for="(val, key) in courseMap"
              :key="key"
              :label="val"
              :value="key*1">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="课程有效截止时间" prop="validTime">
          <el-date-picker
            v-model="boxFormModel.studentSignUpForm.validTime"
            type="datetime"
            placeholder="选择日期时间"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
      <el-row v-if="boxFormModel.studentSignUpForm.docShow>0" justify="center">
        <el-col style="text-align:center;" :span="8" :offset="8"><a :href="boxFormModel.studentSignUpForm.previewUrl" target="_blank"><el-button  style="margin:auto" icon="el-icon-view" type="primary">浏览合同</el-button></a></el-col>
        <el-col style="text-align:center;" :span="8"><a :href="boxFormModel.studentSignUpForm.fileUrl" target="_blank"><el-button  style="margin:auto" icon="el-icon-download" type="success">下载合同</el-button></a></el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button v-if="boxFormModel.studentSignUpForm.docShow === 0" type="primary" @click="onSignUpSubmit('studentSignUpForm','postStudentSignUp')">确定</el-button>
        <el-button v-if="boxFormModel.studentSignUpForm.docShow === 0" @click="boxVisibleConfig.studentSignUpForm = false">取消</el-button>
        <el-button v-if="boxFormModel.studentSignUpForm.docShow > 0" @click="boxVisibleConfig.studentSignUpForm = false">关闭</el-button>
      </div>
    </el-dialog>
    <el-dialog title="添加学生" :visible.sync="boxVisibleConfig.studentAddForm" width="40%" v-loading="pageLoading" element-loading-text="正在请求,请稍等......">
      <el-form
        :model="boxFormModel.studentAddForm"
        :rules="studentAddFormRules"
        ref="studentAddForm"
        label-width="150px"
        class="demo-ruleForm"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="boxFormModel.studentAddForm.name"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-select v-model="boxFormModel.studentAddForm.sex" filterable placeholder="请选择">
            <el-option
              v-for="(val, key) in sexMap"
              :key="key"
              :label="val"
              :value="key*1">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input v-model.number="boxFormModel.studentAddForm.age"></el-input>
        </el-form-item>
        <el-form-item label="学校" prop="school">
          <el-input v-model="boxFormModel.studentAddForm.school"></el-input>
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-input v-model="boxFormModel.studentAddForm.grade"></el-input>
        </el-form-item>
        <el-form-item label="家庭住址" prop="address">
          <el-input type="textarea" v-model="boxFormModel.studentAddForm.address"></el-input>
        </el-form-item>
        <el-form-item label="家庭联系电话" prop="phone">
          <el-input v-model="boxFormModel.studentAddForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="boxFormModel.studentAddForm.status" filterable placeholder="请选择">
            <el-option
              v-for="(val, key) in statusMap"
              :key="key"
              :label="val"
              :value="key">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属校区" prop="campus_id">
          <el-select v-model="boxFormModel.studentAddForm.campus_id" filterable placeholder="请选择">
            <el-option
              v-for="(val, key) in campusMap"
              :key="key"
              :label="val"
              :value="key*1">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="onSubmit('studentAddForm','putStudentUpdate','POST',true)">确定</el-button>
        <el-button @click="boxVisibleConfig.studentAddForm = false">取消</el-button>
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
      pageTitle: "学生管理",
      searchName:'',
      statusId:'',
      cdnUrl:Util.cdnUrl,
      multipleSelection: [],
      sexMap:Util.maliDictionaryMap[1].subMap,
      statusMap:Util.maliDictionaryMap[3].subMap,
      channelMap:Util.maliDictionaryMap[4].subMap,
      courseMap:Util.maliDictionaryMap[5].subMap,
      campusMap:Util.maliDictionaryMap[6].subMap,
      campusOption:Util.campusOption,
      yesNoMap:{1:'是',0:'否'},
      boxVisibleConfig:{studentAddForm:false,studentSignUpForm:false,studentViewForm:false,signListBox:false},
      editStudentBtn:true,
      signUpUrlKey:'postStudentSignUp',
      createAccountUrlKey:'postStudentCreateAccount',
      tableDelUrlKey:'deleteStudentDel',
      signUpListViewData:[],
      boxFormModel:{
        studentAddForm:{},
        studentAddDefForm:{
          id: 0, name: '', sex: '', age: 0, school: '', grade: '', address:'', phone: '', status: '',  campus_id: ''
        },
        studentViewForm:{},
        studentSignUpForm:{},
        studentSignUpDefForm:{
          studentId:0,organizationName:'',campusPhone:'',unitPrice:'',realPrice:'',preferentialDescription:'',buyCourse:'',
          giveCourse:'',lessonPackage:'',validTime:'',docShow:0,previewUrl:'',fileUrl:''
        },
        studentViewForm:{}
      },
      studentSignUpFormRules:{
        organizationName: [
          { required: true, message: '请输入机构名称', trigger: 'blur' },
          { min: 2, max: 12, message: '长度在 2 到 12个字', trigger: 'blur' }
        ],
        campusPhone: [
          { required: true, message: '请输入校区电话', trigger: 'blur' },
        ],
        unitPrice: [
          { required: true, message: '请输入原价', trigger: 'blur' },
        ],
        realPrice: [
          { required: true, message: '请输入实际付款', trigger: 'blur' },
        ],
        preferentialDescription: [
          { required: true, message: '请输入优惠说明', trigger: 'blur' },
        ],
        lessonPackage: [
          { required: true, message: '请输入课时包(次)', trigger: 'blur' },
        ],
        buyCourse: [
          { required: true, message: '请选择购买课程体系', trigger: 'change' }
        ],
        giveCourse: [
          { required: true, message: '请选择额外赠送课程', trigger: 'change' }
        ],
        validTime: [
          { required: true, message: '请选择课程有效截止时间', trigger: 'change' }
        ],
      },
      studentAddFormRules:{
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 2, max: 12, message: '长度在 2 到 12个字', trigger: 'blur' }
        ],
        sex: [
          { required: true, message: '请选择性别', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ],
        campus_id: [
          { required: true, message: '请选择校区', trigger: 'change' }
        ],
        age: [
          { required: true, message: '请输入年龄', trigger: 'blur' },
          { min: 1,max:200, type:'number',message: '年龄范围1~200', trigger: 'blur' }
        ],
        school: [
          { required: true, message: '请输入学校', trigger: 'blur' },
        ],
        grade: [
          { required: true, message: '请输入班级', trigger: 'blur' },
        ],
        address: [
          { required: true, message: '请输入家庭地址', trigger: 'blur' },
        ],
        phone: [
          { required: true, message: '请输入家庭联系电话', trigger: 'blur' },
          { min: 8,message: '电话长度最少8位', trigger: 'blur' }
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
    onEdit(index, obj, formName) {
      var that = this;
      obj = Util.dataRowFormatter(obj);
      that.boxVisibleConfig[formName] = true;
      that.boxFormModel[formName] = JSON.parse(JSON.stringify(obj));
      that.tableIndex = index;
      that.editStudentBtn = true;
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
          var dataObj = {};
          var putObj = {};
          dataObj = that.boxFormModel[formName];
          putObj = that.boxFormModel[formName];
          if(dataObj.tutorialClassTime){
            putObj.tutorialClassTime = dataObj.tutorialClassTime+' 00:00:00';
          }
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
              } else {
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
    },
    onSignUpSubmit(formName,submitUrlKey) {
      var that = this;
      this.$refs[formName].validate(valid => {
        if (valid) {
          var dataObj = {};
          dataObj = that.boxFormModel[formName];
          const putObj = {
            studentId:dataObj.studentId,
            organizationName:dataObj.organizationName,
            campusPhone:dataObj.campusPhone,
            unitPrice:dataObj.unitPrice,
            realPrice:dataObj.realPrice,
            preferentialDescription:dataObj.preferentialDescription,
            buyCourse:dataObj.buyCourse, 
            giveCourse:dataObj.giveCourse,
            lessonPackage:dataObj.lessonPackage,
            validTime:Util.formatDateFtt("yyyy-MM-dd hh:mm:ss",dataObj.validTime),
          };
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
              that.boxFormModel[formName].docShow = 1;
              that.boxFormModel[formName].fileUrl = reData.fileUrl;
              that.boxFormModel[formName].previewUrl = reData.previewUrl;
              const reViewData = that.tableData[that.tableIndex];
              reViewData.status = 4;
              that.$set(that.tableData,that.tableIndex,reViewData);
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
    onSignUp(index,row, obj, formName){
      var that = this;
      that.boxVisibleConfig[formName] = true;
      obj.studentId = row.id;
      that.tableIndex = index;
      that.boxFormModel[formName] = JSON.parse(JSON.stringify(obj));
    },
    createForm(formName,obj) {
      this.boxFormModel[formName] = JSON.parse(JSON.stringify(obj));
      this.boxVisibleConfig[formName] = true;
    },
    onShowSignList(formName,id){
      var that = this;
      if(id){
        that.signUpListViewData = [];
        that.pageLoading = true;
        that.$newpost({
          url: 'getStudentSignUpList',
          data: {student_id:id},
          success: function(reData,reMsg) {
            that.pageLoading = false;
            that.signUpListViewData = reData;
            that.boxVisibleConfig[formName] = true;
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
    // 获取数据
    getData(currentPage) {
      var that = this;
      that.currentPage = currentPage;
      that.pageLoading = true;
      let postData = {
        name: that.searchName,
        currentPage: currentPage,
        pageSize: that.pagination.pagesize,
        status: that.statusId
      };
      if(that.statusId === null || that.statusId === ''){
          delete(postData.status);
      }
      that.$newpost({
        url: 'getStudentSelect',
        data: postData,
        success: function(reData,reMsg) {
          that.pageLoading = false;
          that.pagination.total = reData.allCount;
          that.tableData = reData.records;
        },
        error: function(data) {
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
    this.getData(1);
    this.getCampusList();
  },
  created(){//创建完成
    
  },
  components: {//引用自定义模板
  }
};
</script>
<style scoped>
@import url("../../assets/css/tableComm.css");
</style>
