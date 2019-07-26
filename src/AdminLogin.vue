<style>
body{
    background: rgb(240, 242, 245);
    font-size:16px;
}
.scratch_logo {
    width: 199px;
    height: 32px;
    display: block;
    background: url(https://cdn.scratch.codemali.com/maliangSite/third-agent/i/scratch_logo.png) 0 0 no-repeat;
    background-size: 100% 100%;
    margin: auto;
    position: relative;
    z-index: 222;
}
#adminLoginForm .el-row {
    margin-top: 25px;
}
</style>
<template>
  <div id="app">
      <el-container>
        <el-main id="adminLoginForm">
          <el-row justify="center" align="middle" style="padding-top:150px;">
            <el-col :span="24"><i class="scratch_logo"></i></el-col>
          </el-row>
          <el-row justify="center" align="middle">
            <el-col :span="12" :offset="6" style="text-align:center;font-weight:bold;">后台管理系统</el-col>
          </el-row>
          <el-row justify="center" align="middle">
            <el-col :span="6" :offset="9" style="text-align:center">
            <el-form ref="adminLoginForm" :model="adminLoginForm" :rules="adminLoginFormRules">
              <el-form-item prop="username">
                <el-input
                  placeholder="请输入用户名"
                  prefix-icon="el-icon-user"
                  v-model="adminLoginForm.username"
                  v-on:keyup.enter.native="sendLogin()"
                >
                </el-input>
              </el-form-item>
              <el-form-item prop="password">
                  <el-input
                    placeholder="请输入密码"
                    prefix-icon="el-icon-key"
                    show-password
                    v-model="adminLoginForm.password"
                    v-on:keyup.enter.native="sendLogin()"
                  >
                  </el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" size="medium" icon="el-icon-thumb" style="width:100%" @click="sendLogin()">登录</el-button>
              </el-form-item>
            </el-form>
            </el-col>
          </el-row>
        </el-main>
      </el-container>
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      adminLoginForm: {
        username: "",
        password: "",
        from:'ADMINSYS'
      },
      adminLoginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 5, max: 12, message: '长度在 5 到 12 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '输入密码', trigger: 'blur' },
          { min: 5, max: 12, message: '长度在 5 到 18 个字符', trigger: 'blur' }
        ],
      }
    };
  },
  methods: {
    sendLogin() {
      var that = this;
      that.$refs['adminLoginForm'].validate((valid) => {
        if (valid) {
          that.$newpost({
            url: 'adminLogin',
            data: that.adminLoginForm,
            success: function(reData,reMsg) {
              that.$message({
                type: "success",
                message: reMsg
              });
              var obj = {
                userId:reData['id'],
                userName:reData['name'],
                access_token:reData['token'],
                roles:reData['roles']
              }
              localStorage.setItem('mali_admin_info2',JSON.stringify(obj));
              that.$router.push({ path:'/'});
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
        } else {
          return false;
        }
      });
    }
  },
  created: function() {
  }
};
</script>
