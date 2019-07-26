const campusMap = [];
function getCampusMap() {
  var that = this;
  if(that.campusOption.length === 0){
    that.pageLoading = true;
    that.$get({
      url: 'getAllCampus',
      data: {data:1},
      checkToken:true,
      success: function(reData,reMsg) {
        that.pageLoading = false;
        Util.campusOption = reData;
        var campusMap = {};
        reData.forEach(row => {
          campusMap[row.campusId] = row.campusName;
        });
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
      campusMap[row.campusId] = row.campusName;
    });
    Util.maliDictionaryMap[6].subMap = campusMap;
  }
}
export default {
  getCampusMap: getCampusMap,
  campusMap: campusMap
};
