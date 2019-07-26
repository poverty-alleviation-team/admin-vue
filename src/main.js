import Vue from "vue";
import Axios from "./axios";
import Axiosgo from "./axiosgo";
import ElementUI from "element-ui";
import router from "./config/router";
import Util from "./util";
import "element-ui/lib/theme-chalk/index.css";
import "./assets/iconfont.css";
import { Message } from "element-ui";

Vue.use(ElementUI);

Vue.config.productionTip = false;
Vue.prototype.$post = Axios.post;
Vue.prototype.$get = Axios.get;
Vue.prototype.$mothodAx = Axios.mothodAx;
Vue.prototype.$postFile = Axios.postFile;
Vue.prototype.$newpost = Axiosgo.newpost;
Vue.prototype.$getenv = Axiosgo.getenv;
Vue.prototype.$checkAdminInfo = Axios.checkAdminInfo;
Vue.prototype.imgGet = Util.getImgUrl;
Vue.prototype.getCampusOption = Util.getCampusOption;
Vue.prototype.success = Message.success;
Vue.prototype.error = Message.error;
Vue.prototype.info = Message.info;

/* eslint-disable no-new */
const adminMain = new Vue({
  router
}).$mount("#adminMain");
