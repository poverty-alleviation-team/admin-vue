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
      pageTitle: "转换率统计",
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
    // 获取数据
    getData(currentPage) {
      var that = this;
      that.pageLoading = true;
      let postData = {
      };
      if(that.searchdate){
        postData['start_time'] = that.searchdate+' 00:00:00';;
        postData['end_time'] = that.searchdate+' 23:59:59.999';;
      } else {
        const dateNow = new Date();
        postData['start_time'] = Util.formatDateFtt("yyyy-MM-dd",dateNow)+' 00:00:00';;
        postData['end_time'] = Util.formatDateFtt("yyyy-MM-dd",dateNow)+' 23:59:59.999';;
      }
      that.$get({
        url: 'statisticsStudentChange',
        data: postData,
        checkToken:true,
        success: function(reData,reMsg) {
          that.pageLoading = false;
          console.log(reData);
          if(reData.records !=  null){
            that.containerData = reData.records;
            var legendData = [];
            var seriesData = [];
            var indicatorData = [];
            var maxPv = 0;
            legendData.push(Util.maliDictionaryMap[3].name);
            for (let i = 0; i < that.containerData.length; i++) {
              const element = that.containerData[i];
              const name = Util.maliDictionaryMap[3].subMap[element.action];
              if(element.pv>maxPv){
                maxPv = element.pv;
              }
              
              seriesData.push(element.pv);
              indicatorData.push({
                  name: name+'['+element.pv+']',
                  max: maxPv
              });
            }
          }
          const option = {
            title: {
                text: '转换率统计'
            },
            tooltip: {},
            legend: {
                data:legendData
            },
            radar: {
              name: {
                  textStyle: {
                      color: '#fff',
                      backgroundColor: '#999',
                      borderRadius: 3,
                      padding: [3, 5]
                  }
              },
              indicator: indicatorData
            },
            series: [
                {
                    type: 'radar',
                    data: [
                        {
                            value: seriesData,
                            name: Util.maliDictionaryMap[3].name
                        }
                    ]
                }
            ]
        };
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
  beforeMount() {//挂载前
  },
  mounted() {//挂载完成
    console.log(Util.maliDictionaryMap);
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
