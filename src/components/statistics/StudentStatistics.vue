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
        <el-form :inline="true" class="demo-form-inline" >
          <el-form-item label="选择日期:">
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
      pageTitle: "学生分类统计",
      searchdate:'',
      containerData:'',
      myChartObj:'',
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
    // 获取数据
    getData(currentPage) {
      var that = this;
      that.pageLoading = true;
      let postData = {
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
        url: 'statisticsStudentTypes',
        data: postData,
        checkToken:true,
        success: function(reData,reMsg) {
          that.pageLoading = false;
          if(reData){
            var legendData = ['product'];
            var seriesData = [];
            var sourceData = [];
            var seriesListData = [];
            reData.forEach((recodeInfo)=>{
              legendData.push(recodeInfo.date);
              recodeInfo.records.forEach((recode)=>{
                seriesData[recode.status] = seriesData[recode.status] ? seriesData[recode.status] : [Util.maliDictionaryMap[3].subMap[recode.status]];
                seriesData[recode.status].push(recode.count && recode.count>0 ? recode.count : 0);
              });
            });
            sourceData.push(legendData);
            seriesData.forEach((dataInfo)=>{
              sourceData.push(dataInfo);
              seriesListData.push({type: 'line', smooth: true, seriesLayoutBy: 'row'});
            });
            seriesListData.push({
                type: 'pie',
                id: 'pie',
                radius: '30%',
                center: ['50%', '25%'],
                label: {
                    formatter: '{b}: {@'+legendData[1]+'} ({d}%)'
                },
                encode: {
                    itemName: 'product',
                    value: legendData[1],
                    tooltip: legendData[1]
                }
            });
            console.log(sourceData);
            console.log(seriesListData);
            let option = {
                legend: {},
                tooltip: {
                    trigger: 'axis',
                    showContent: false
                },
                dataset: {
                    source: sourceData
                },
                xAxis: {type: 'category'},
                yAxis: {gridIndex: 0},
                grid: {top: '55%'},
                series: seriesListData
            };
            that.myChartObj.on('updateAxisPointer', function (event) {
                var xAxisInfo = event.axesInfo[0];
                if (xAxisInfo) {
                    var dimension = xAxisInfo.value + 1;
                    that.myChartObj.setOption({
                        series: {
                            id: 'pie',
                            label: {
                                formatter: '{b}: {@[' + dimension + ']} ({d}%)'
                            },
                            encode: {
                                value: dimension,
                                tooltip: dimension
                            }
                        }
                    });
                }
            });
            that.myChartObj.setOption(option, true);
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
  beforeMount() {//挂载前
  },
  mounted() {//挂载完成
    var dom = document.getElementById("container");
    this.myChartObj = Echarts.init(dom);
  },
  created(){//创建完成
    console.log(444)
  },
  components: {//引用自定义模板
  }
};
</script>

<style scoped>
@import url("../../assets/css/ChartComm.css");
</style>
