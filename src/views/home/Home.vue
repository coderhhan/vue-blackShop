<template>
  <el-container class="home-container">
    <!--头部-->
    <el-header>
      <div>
        <img src="~assets/logo.png" alt="">
        <span>电商管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!--内容-->
    <el-container>
      <!--侧边栏-->
      <el-aside :width="isCollapse? '64px' : '200px'">
        <div class="toggle-btn" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#2F9BFF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activeStatus">
          <el-submenu :index="item.id+''"
                      v-for="item in menuLists"
                      :key="item.id"
                      >
            <!--一级菜单模板区-->
              <template slot="title">
                <!--菜单图标-->
                <i :class="icons[item.id]"></i>
                <!--菜单文本-->
                <span>{{item.authName}}</span>
              </template>
              <!--二级菜单-->
              <el-menu-item :index="'/'+secondItem.path"
                            v-for="secondItem in item.children"
                            :key="secondItem._id"
                            @click="saveActiveStatus('/'+secondItem.path)">
                <template slot="title">
                  <!--菜单图标-->
                  <i class="el-icon-menu"></i>
                  <!--菜单文本-->
                  <span>{{secondItem.authName}}</span>
               </template>
              </el-menu-item>
            </el-submenu>
        </el-menu>

      </el-aside>
      <!--主内容区-->
      <el-main>
        <!--路由占位符-->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { request } from '../../network/request'
export default {
  name: 'Home',
  data () {
    return {
      icons: {
        '5e68454044fab7039846017e': 'iconfont icon-users',
        '5e68454044fab70398460180': 'iconfont icon-tijikongjian',
        '5e68454044fab70398460183': 'iconfont icon-shangpin',
        '5e68454044fab70398460187': 'iconfont icon-danju',
        '5e68454044fab70398460189': 'iconfont icon-baobiao'
      },
      menuLists: [],
      isCollapse: false,
      activeStatus: ''
    }
  },
  created () {
    this.menuList()
    this.activeStatus = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout () {
      // 清空token
      window.sessionStorage.clear()
      // 跳转到登录页
      this.$router.push('/login')
    },
    menuList () {
      request({
        url: 'menu/list?api_hash=' + new Date().getTime() // 防止ie缓存
      }).then(res => {
        this.menuLists = res.data
      })
    },
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    saveActiveStatus (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activeStatus = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.home-container{
  height: 100%;
  @color: white;
  .el-header{
    background-color: #333744;
    color: @color;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 10px;
    font-size: 20px;
    >div {
      display: flex;
      justify-content: space-between;
      align-items: center;
      span {
        margin-left: 15px;
      }
    }
    img{
      height: 30px;
      width: 30px;
    }
  }
  .el-main{
    background-color: #edeaf1;
  }
  .el-aside{
    background-color: #333744;
    color: @color;
    .el-menu {
      border-right: none;
    }
  }
}
.iconfont{
  padding-right: 5px;
}
  .toggle-btn{
    text-align: center;
    line-height: 24px;
    font-size: 10px;
    letter-spacing: 0.2em;
    background-color: #475163;
  }
</style>
