<template>
   <div class="login_container">
     <div class="login_box">
       <!--图标-->
       <div class="avatar_box">
         <img src="@/assets/logo.png" alt="">
       </div>
       <!--登录框-->
       <el-form :model ="loginForm"
                label-width ="0px"
                class ="login_form"
                :rules ="loginFormRules"
                ref = 'loginFormRef'
       >
         <!--用户名-->
         <el-form-item label="" prop="username">
           <el-input v-model="loginForm.username"  prefix-icon="iconfont icon-user" placeholder="请输入用户名"></el-input>
         </el-form-item>
          <!--密码-->
         <el-form-item label="" prop="password">
           <el-input v-model="loginForm.password"
                     prefix-icon="iconfont icon-3702mima"
                     placeholder="请输入密码"
                     type="password"></el-input>
         </el-form-item>
         <el-form-item class="btns">
           <el-button type="primary" @click="login"  round>登录</el-button>
           <el-button type="info" @click="resetForm" round>重置</el-button>
         </el-form-item>
       </el-form>
     </div>
   </div>
</template>

<script>
import { loginRequest } from '../network/request'
export default {
  name: 'Login',
  data () {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 5, max: 10, message: '长度在 5 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '长度大于 5', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetForm () {
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return false
        const { data: res } = await loginRequest(
          {
            url: 'login',
            data: this.loginForm,
            method: 'POST'
          }
        )
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('账号或密码错误')
        } else {
          this.$message.success('登录成功')
          // 登录成功之后将数据中的token 保存到sessionStorage中，localStorage会一致存在，sessionStorage当前会话存在
          // 注册登录接口以外的接口都需要携带token发起请求
          window.sessionStorage.setItem('token', res.data.token)
          // 通过代码跳转路由
          this.$router.push('/home')
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container{
  height:100%;
  color: white;
  background-color: #2b4b6b;
  display: flex;
  justify-content: center;
  align-items: center;
  .login_box{
    width: 55vh;
    height:45vh;
    background-color: white;
    border-radius: 1vh;
    position: absolute;
    /*position: absolute;*/
    /*top:50%;*/
    /*left: 50%;*/
    /*transform:translate(-50%,-50%);*/
    .avatar_box{
      height:18vh;
      width:18vh;
      border:1px solid #eee;
      border-radius: 50%;
      padding: 2vh;
      box-shadow: 0 0 10px #eee;
      position: absolute;
      left: 50%;
      background-color: white;
      transform: translate(-50%,-50%);
      img{
        height:100%;
        width:100%;
        border-radius: 50%;
        background-color: #eee;
    }
    }
  }
}
   .login_form{
    position: absolute;
     bottom: 0;
     width: 100%;
     padding:6vh 5vh;
     box-sizing: border-box;
   }
    .btns{
      display: flex;
      justify-content: flex-end;
    }
</style>
