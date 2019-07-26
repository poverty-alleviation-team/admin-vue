<template>
  <div style="width:90%;padding:20px;">
    <h3 class="heading-mosaic"><i class="el-icon-bell"></i>欢迎来到码丽教育管理系统!</h3>
    <template>
      <el-carousel :interval="4000" type="card" height="500px">
        <el-carousel-item>
          <img src="https://cdn.scratch.codemali.com/course/image/10/lesson/23/icon/%E6%A0%91%E7%B2%BE%E9%AD%94%E6%96%B9.jpg">
        </el-carousel-item>
        <el-carousel-item>
          <img src="https://cdn.scratch.codemali.com/course/image/lesson/239/icon/%E5%B0%81%E5%9B%BE(3).jpg">
        </el-carousel-item>
        <el-carousel-item>
          <img src="https://cdn.scratch.codemali.com/course/image/16/lesson/44/icon/%E5%BC%BA%E7%9B%97%E5%93%AA%E9%87%8C%E9%80%83.jpg">
        </el-carousel-item>
        <el-carousel-item>
          <img src="https://cdn.scratch.codemali.com/course/image/14/lesson/29/icon/%E7%82%BC%E4%B8%B9%E7%82%89.jpg">
        </el-carousel-item>
        <el-carousel-item>
          <img src="https://cdn.scratch.codemali.com/course/image/14/lesson/75/icon/%E5%B0%81%E9%9D%A2.jpg">
        </el-carousel-item>
      </el-carousel>
    </template>
  </div>
</template>
<style>
.el-carousel__item{
    color: #475669;
    font-size: 14px;
    opacity: 0.75;
    line-height: 200px;
    margin: 0;
  }
  .el-carousel__item img{
      width:100%;
  }
  
  .el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
  }
  
  .el-carousel__item:nth-child(2n+1) {
    background-color: #d3dce6;
  }

</style>