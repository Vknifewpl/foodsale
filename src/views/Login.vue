<template>
  <div class="login-container">
    <div class="login-box">
      <h2>登录</h2>
      <el-form ref="form" :model="form" :rules="rules" label-width="0">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" prefix-icon="el-icon-lock" @keyup.enter.native="handleLogin"></el-input>
        </el-form-item>
        <!-- 验证码 -->
        <el-form-item prop="captchaCode">
          <div class="captcha-row">
            <el-input v-model="form.captchaCode" placeholder="请输入验证码" prefix-icon="el-icon-key" @keyup.enter.native="handleLogin"></el-input>
            <img class="captcha-img" :src="captchaImage" alt="验证码" @click="loadCaptcha" title="点击刷新验证码">
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin" style="width: 100%">登录</el-button>
        </el-form-item>
      </el-form>
      <div class="tips">
        还没有账号？<router-link to="/register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      form: {
        username: '',
        password: '',
        captchaCode: ''
      },
      captchaKey: '',
      captchaImage: '',
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        captchaCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
      },
      loading: false,
      captchaTimer: null
    }
  },
  created() {
    this.loadCaptcha()
    this.startCaptchaTimer()
  },
  beforeDestroy() {
    this.stopCaptchaTimer()
  },
  methods: {
    startCaptchaTimer() {
      this.stopCaptchaTimer()
      this.captchaTimer = setInterval(() => {
        this.loadCaptcha()
      }, 60000)
    },
    stopCaptchaTimer() {
      if (this.captchaTimer) {
        clearInterval(this.captchaTimer)
        this.captchaTimer = null
      }
    },
    /** 获取验证码 */
    async loadCaptcha() {
      try {
        const { data } = await this.$axios.get('/captcha')
        if (data.code === 200) {
          this.captchaKey = data.data.captchaKey
          this.captchaImage = data.data.captchaImage
        }
      } catch (error) {
        console.error('获取验证码失败', error)
      }
    },
    handleLogin() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        
        this.loading = true
        try {
          const { data } = await this.$axios.post('/user/login', {
            username: this.form.username,
            password: this.form.password,
            captchaKey: this.captchaKey,
            captchaCode: this.form.captchaCode
          })
          if (data.code === 200) {
            const userData = data.data
            this.$store.dispatch('login', userData)
            this.$message.success('登录成功')
            // 根据角色跳往不同端，并同步隔离存储不同端的token
            const role = Number(userData.role)
            if (role === 2) {
              // 超级管理员
              localStorage.setItem('super_token', userData.token)
              localStorage.setItem('super_user', JSON.stringify({ id: userData.userId, username: userData.username }))
              this.$router.push('/super/users')
            } else if (role === 1) {
              // 商家管理员
              localStorage.setItem('admin_token', userData.token)
              localStorage.setItem('admin_user', JSON.stringify({ id: userData.userId, username: userData.username }))
              this.$router.push('/admin/food')
            } else {
              // 普通用户
              this.$router.push('/')
            }
          } else {
            this.$message.error(data.msg)
            // 登录失败刷新验证码
            this.loadCaptcha()
            this.form.captchaCode = ''
          }
        } catch (error) {
          this.$message.error('登录失败，请重试')
          this.loadCaptcha()
          this.form.captchaCode = ''
        }
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('@/assets/back.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.login-box {
  width: 100%;
  max-width: 440px;
  padding: 64px 48px;
  background: #fff;
  border-radius: 32px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.04);
}

.login-box h2 {
  text-align: center;
  margin: 0 0 40px 0;
  color: #1d1d1f;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.login-box >>> .el-input__inner {
  height: 56px;
  border-radius: 16px;
  background: #f5f5f7;
  border: 2px solid transparent;
  padding-left: 44px;
  font-size: 16px;
  color: #1d1d1f;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}
.login-box >>> .el-input__inner:focus {
  background: #fff;
  border-color: #0071e3;
  box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.1);
}

.login-box >>> .el-input__prefix {
  left: 16px;
  display: flex;
  align-items: center;
  color: #86868b;
  font-size: 18px;
}

.login-box >>> .el-button {
  height: 56px;
  border-radius: 980px;
  font-size: 18px;
  font-weight: 600;
  margin-top: 16px;
  background: #0071e3;
  border: none;
  box-shadow: 0 4px 14px rgba(0, 113, 227, 0.2);
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}
.login-box >>> .el-button:hover {
  background: #0077ed;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 113, 227, 0.3);
}

/* 验证码行 */
.captcha-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.captcha-row .el-input {
  flex: 1;
}
.captcha-img {
  height: 56px;
  border-radius: 16px;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.3s;
}
.captcha-img:hover {
  opacity: 0.7;
}

.tips {
  text-align: center;
  color: #86868b;
  margin-top: 32px;
  font-size: 15px;
}

.tips a {
  color: #0071e3;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}
.tips a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-box {
    margin: 16px;
    padding: 48px 32px;
  }
}
</style>
