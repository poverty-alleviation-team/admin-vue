<!--
 * @Author: jakey@17pkmj.com
 * @Date: 2019-05-16 10:50:08
 * @LastEditors: jakey
 * @LastEditTime: 2019-05-16 10:50:08
 * @Description: 
-->
<template>
  <div style="width: 100%;height:auto; " v-loading="pageLoading" element-loading-text="正在加载...">
    <el-tabs type="border-card">
      <el-tab-pane :label="pageTitle">
        <el-form :inline="true" class="demo-form-inline">
          <el-form-item label="选择日期范围:">
            <el-date-picker
              v-model="searchdate"
              type="daterange"
              unlink-panels
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
              :picker-options="pickerOptions">
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSearch">查询</el-button>
          </el-form-item>
        </el-form>
        <el-row>
          <el-col :span="24">
            <el-table stripe :data="tableData" style="width: 100%;height:auto;" border>
              <el-table-column prop="id" label="编号" align="center" width="60"></el-table-column>
              <el-table-column prop="user_id" label="老师编号" width="80" align="center"></el-table-column>
              <el-table-column prop="user_name" label="老师姓名" width="80" align="center"></el-table-column>
              <el-table-column prop="student_id" label="学生编号" width="80" align="center"></el-table-column>
              <el-table-column prop="student_name" label="学生姓名" width="80" align="center"></el-table-column>
              <el-table-column prop="class_name" label="班级名称" width="180" align="center"></el-table-column>
              <el-table-column prop="course_name" label="课程体系名称" align="center"></el-table-column>
              <el-table-column prop="lesson_name" label="课次名称" align="center"></el-table-column>
              <el-table-column prop="price" label="单价" width="80" align="center"></el-table-column>
              <el-table-column prop="status" label="上课状态" width="100" align="center" :filters="[{ text: '正常上课', value: 1 }, { text: '请假', value: 0 }]"
                :filter-method="filterTag"
                filter-placement="bottom-end">
                <template slot-scope="scope">
                  <el-tag
                    :type="scope.row.status === 0 ? 'danger' : 'success'"
                    disable-transitions>{{scope.row.status>0 ? '正常上课' : '请假'}}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="create_time" :formatter="dataFormatter" label="创建时间" width="160" align="center"></el-table-column>
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
  </div>
</template>

<script>
import Util from "../../util.js";
export default {
  data() {
    return {
      // pagination
      pageLoading:false,
      pagination: {
        total: 0,
        pagesize:10
      },
      tableData:[],
      pageTitle: "学生上课记录",
      searchdate:[],
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }]
      }
    }
  },
  methods: {
    onSearch() {
      this.getData(1);
    },
    dataFormatter(row,column){
      return Util.dataFormatter(row,column.property);
    },
    filterTag(value, row) {
      return row.status === value;
    },
    // 获取数据
    getData(currentPage) {
      var that = this;
      that.pageLoading = true;
      let postData = {
        currentPage: currentPage,
        pageSize: that.pagination.pagesize
      };
      if(that.searchdate){
        postData['startTime'] = that.searchdate[0]+' 00:00:00';
        postData['endTime'] = that.searchdate[1]+' 23:59:59.999';
      }
      that.$newpost({
        url: 'getStudentClassLog',
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
    //this.getData(1);
  },
  components: {//引用自定义模板
  }
};
</script>
<style scoped>
@import url("../../assets/css/tableComm.css");
</style>