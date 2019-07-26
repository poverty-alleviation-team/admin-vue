<!--
 * @Author: jakey@17pkmj.com
 * @Date: 2019-05-16 10:50:08
 * @LastEditors: jakey
 * @LastEditTime: 2019-05-16 10:50:08
 * @Description: 
-->
<template>
  <div style="width: 100%;height:auto;"   v-loading="pageLoading" element-loading-text="正在加载...">
    <el-divider content-position="left"><el-button type="primary" icon="el-icon-s-data" plain>{{pageTitle}}</el-button></el-divider>
    <el-row>
      <el-col :span="22" :offset="1">
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
            <el-select v-model="campusId" filterable placeholder="请选择">
              <el-option
                key="0"
                label="全部"
                :value="0">
              </el-option>
              <el-option
                v-for="item in campusOption"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSearch">查询</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <el-divider><i class="el-icon-caret-bottom"></i></el-divider>
    <div id="container" style="height:500px"></div>
  </div>
</template>
<script>
import Util from "../../util.js";
import Echarts from "echarts";
export default {
  data() {
    return {
      pageLoading:false,
      myChartObj:'',
      pageTitle: "耗课统计",
      searchdate:[],
      campusId:0,
      campusOption:Util.campusOption,
      campusMap:{},
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
    getCampusList() {
      var that = this;
      if(that.campusOption.length === 0){
        that.pageLoading = true;
        that.$newpost({
          url: 'getAllCampus',
          data: {},
          success: function(reData,reMsg) {
            that.pageLoading = false;
            Util.campusOption = reData;
            that.campusOption = reData;
            let campusMap = {};
            reData.forEach(row => {
              campusMap[row.id] = row.name;
            });
            that.campusMap = campusMap;
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
        that.campusMap = campusMap;
      }
    },
    // 获取数据
    getData(currentPage) {
      
      var that = this;
      that.pageLoading = true;
      let postData = {
        'campus_id':that.campusId
      };
      if(that.searchdate.length>0){
        postData['start_time'] = that.searchdate[0]+' 00:00:00';;
        postData['end_time'] = that.searchdate[1]+' 23:59:59.999';;
      } else {
        const dateNow = new Date();
        postData['start_time'] = Util.formatDateFtt("yyyy-MM-dd",dateNow)+' 00:00:00';;
        postData['end_time'] = Util.formatDateFtt("yyyy-MM-dd",dateNow)+' 23:59:59.999';;
      }
      that.$newpost({
        url: 'statisticsTeacherConsume',
        data: postData,
        checkToken:true,
        success: function(reData,reMsg) {
          that.pageLoading = false;
          if(reData){
            that.containerData = reData;
            var consumeCountData = {};
            var consumeGoldData = {};
            var countData = {};

            var consumeCountDataNum = 0;
            var consumeGoldDataNum = 0;
            var countDataNum = 0;

            var legendData = [];
            var xAxisData = [];
            var seriesData = [];

            for (let i = 0; i < that.containerData.length; i++) {
              const element = that.containerData[i];
              const elementDate = element.create_date.substring(0, 10);
              consumeCountDataNum += element.teach_count;
              consumeGoldDataNum += element.par_total;
              countDataNum += element.student_count;

              consumeCountData[elementDate] = consumeCountData[elementDate] ? consumeCountData[elementDate] : {};//初始化某校区数据对象
              consumeCountData[elementDate][element.campus_id] = consumeCountData[elementDate][element.campus_id] ? consumeCountData[elementDate][element.campus_id] + element.teach_count : element.teach_count;
              consumeGoldData[elementDate] = consumeGoldData[elementDate] ? consumeGoldData[elementDate] : {};//初始化某校区数据对象
              consumeGoldData[elementDate][element.campus_id] = consumeGoldData[elementDate][element.campus_id] ? consumeGoldData[elementDate][element.campus_id] + element.par_total : element.par_total;
              countData[elementDate] = countData[elementDate] ? countData[elementDate] : {};//初始化某校区数据对象
              countData[elementDate][element.campus_id] = countData[elementDate][element.campus_id] ? countData[elementDate][element.campus_id] + element.student_count : element.student_count;
              if(that.campusId === 0){
                consumeCountData[elementDate][0] = consumeCountData[elementDate][0] ? consumeCountData[elementDate][0] + element.teach_count : element.teach_count;
                consumeGoldData[elementDate][0] = consumeGoldData[elementDate][0] ? consumeGoldData[elementDate][0] + element.par_total : element.par_total;
                countData[elementDate][0] = countData[elementDate][0] ? countData[elementDate][0] + element.student_count : element.student_count;
              }
              xAxisData.push(elementDate);
            }
            
            xAxisData.sort();
            console.log(legendData);
            var teachCountData = [];
            var goldTotalData = [];
            var studentCountData = [];
            xAxisData.forEach(rowDate => {
              if(consumeCountData[rowDate]){//老师上课次数
                  Object.keys(consumeCountData[rowDate]).forEach((campusId) => {
                    teachCountData[campusId] = teachCountData[campusId] ? teachCountData[campusId] : [];
                    teachCountData[campusId].push(consumeCountData[rowDate][campusId]);
                  });
              }
              if(consumeGoldData[rowDate]){//学生总耗课数
                  Object.keys(consumeGoldData[rowDate]).forEach((campusId) => {
                    goldTotalData[campusId] = goldTotalData[campusId] ? goldTotalData[campusId] : [];
                    goldTotalData[campusId].push(consumeGoldData[rowDate][campusId]);
                  });
              }
              if(countData[rowDate]){//学生总耗课金额
                  Object.keys(countData[rowDate]).forEach((campusId) => {
                    studentCountData[campusId] = studentCountData[campusId] ? studentCountData[campusId] : [];
                    studentCountData[campusId].push(countData[rowDate][campusId])
                  });
              }
            });
            Object.keys(teachCountData).forEach((campusId) => {
              let consumeCountDataObj = {
                name:'老师上课次数',
                type:'line',
                stack: '总量',
                data:teachCountData[campusId]
              }
              if(campusId > 0){
                consumeCountDataObj.name = that.campusMap[campusId]+consumeCountDataObj.name;
              }
              let teachCountSum = 0;
              teachCountData[campusId].forEach((cnt) => {
                  teachCountSum += cnt;
              });
              legendData.push(consumeCountDataObj.name+'['+teachCountSum+']');
              seriesData.push(consumeCountDataObj);
            });
            Object.keys(goldTotalData).forEach((campusId) => {
              let consumeGoldDataObj = {
                name:'学生总耗课金额',
                type:'line',
                stack: '总量',
                data:goldTotalData[campusId]
              }
              if(campusId > 0){
                consumeGoldDataObj.name = that.campusMap[campusId]+consumeGoldDataObj.name;
              } 
              let goldTotalSum = 0;
              goldTotalData[campusId].forEach((cnt) => {
                  goldTotalSum += cnt;
              });
              legendData.push(consumeGoldDataObj.name+'['+goldTotalSum+']');
              seriesData.push(consumeGoldDataObj);
            });
            Object.keys(studentCountData).forEach((campusId) => {
              let countDataObj = {
                name:'学生总耗课数',
                type:'line',
                stack: '总量',
                data:studentCountData[campusId]
              }
              if(campusId > 0){
                countDataObj.name = that.campusMap[campusId]+countDataObj.name;
              } 
              let studentCountSum = 0;
              studentCountData[campusId].forEach((cnt) => {
                  studentCountSum += cnt;
              });
              legendData.push(countDataObj.name+'['+studentCountSum+']');
              seriesData.push(countDataObj);
            });
          }
          var optionTitle = '耗课统计';
          if(that.campusId>0){
            optionTitle = that.campusMap[that.campusId]+optionTitle;
          }
          const option = {
            title: {
                text: optionTitle
            },
            tooltip : {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6a7985'
                    }
                }
            },
            legend: {
                formatter:  function(name){
                  let newName = name;
                  legendData.forEach((legenName) => {
                      if(legenName.indexOf(name) != -1){
                          newName = legenName;
                      }
                  });
                  return newName;
                }
            },
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis : [
                {
                    type : 'category',
                    boundaryGap : false,
                    data : xAxisData
                }
            ],
            yAxis : [
                {
                    type : 'value'
                }
            ],
            series : seriesData
          };
          console.log(option);
          that.myChartObj.setOption(option, true);
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
  sortKey(array,key){
    return array.sort(function(a,b){
     var x = a[key];
     var y = b[key];
     return ((x<y)?-1:(x>y)?1:0)
    })
  },
  beforeMount() {//挂载前
  },
  mounted() {//挂载完成
    this.getCampusList();
    var dom = document.getElementById("container");
    this.myChartObj = Echarts.init(dom);
  },
  created(){//创建完成
  },
  components: {//引用自定义模板
  }
};
</script>

<style scoped>
@import url("../../assets/css/ChartComm.css");
</style>

