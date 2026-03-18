<template>
  <div class="admin-login-container">
    <div class="login-form">
      <div class="form-header">
        <h2>管理员登录</h2>
        <p>欢迎使用餐饮管理系统</p>
      </div>
      
      <el-form :model="form" :rules="rules" ref="form" @submit.native.prevent>
        <el-form-item prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名" 
            prefix-icon="el-icon-user"
            size="large"
          ></el-input>
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码" 
            prefix-icon="el-icon-lock"
            size="large"
          ></el-input>
        </el-form-item>

        <!-- 验证码 -->
        <el-form-item prop="captchaCode">
          <div class="captcha-row">
            <el-input 
              v-model="form.captchaCode" 
              placeholder="请输入验证码" 
              prefix-icon="el-icon-key"
              size="large"
              @keyup.enter.native="handleLogin"
            ></el-input>
            <img class="captcha-img" :src="captchaImage" alt="验证码" @click="loadCaptcha" title="点击刷新验证码">
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            @click="handleLogin" 
            :loading="loading"
            style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p>提示：仅限管理员账号登录</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminLogin',
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
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ],
        captchaCode: [
          { required: true, message: '请输入验证码', trigger: 'blur' }
        ]
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
    async handleLogin() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return
        
        this.loading = true
        try {
          const res = await this.$axios.post('/admin/login', {
            username: this.form.username,
            password: this.form.password,
            captchaKey: this.captchaKey,
            captchaCode: this.form.captchaCode
          })
          if (res.data.code === 200) {
            const data = res.data.data
            localStorage.setItem('admin_token', data.token)
            localStorage.setItem('admin_user', JSON.stringify({
              id: data.userId,
              username: data.username
            }))
            this.$message.success('登录成功')
            this.$router.push('/admin/food')
          } else {
            this.$message.error(res.data.msg || '登录失败')
            this.loadCaptcha()
            this.form.captchaCode = ''
          }
        } catch (e) {
          this.$message.error('网络错误，请重试')
          this.loadCaptcha()
          this.form.captchaCode = ''
        } finally {
          this.loading = false
        }
      })
    }
  }
}
</script>

<style scoped>
.admin-login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('@/assets/back.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.login-form {
  width: 100%;
  max-width: 480px;
  background: #fff;
  padding: 64px 48px;
  border-radius: 32px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.04);
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-header h2 {
  margin: 0 0 12px 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #1d1d1f;
}

.form-header p {
  margin: 0;
  color: #86868b;
  font-size: 15px;
  font-weight: 500;
}

.el-form {
  margin-top: 20px;
}

.login-form >>> .el-input__inner {
  height: 56px;
  border-radius: 16px;
  background: #f5f5f7;
  border: 2px solid transparent;
  padding-left: 44px;
  font-size: 16px;
  color: #1d1d1f;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}
.login-form >>> .el-input__inner:focus {
  background: #fff;
  border-color: #0071e3;
  box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.1);
}

.login-form >>> .el-input__prefix {
  left: 16px;
  display: flex;
  align-items: center;
  color: #86868b;
  font-size: 18px;
}

.login-form >>> .el-button {
  height: 56px;
  border-radius: 980px;
  font-size: 18px;
  font-weight: 600;
  margin-top: 16px;
  background: #1d1d1f;
  border: none;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}
.login-form >>> .el-button:hover {
  background: #333336;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
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

.login-footer {
  text-align: center;
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.login-footer p {
  margin: 0;
  color: #86868b;
  font-size: 14px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .login-form {
    margin: 16px;
    padding: 48px 32px;
  }
}
</style>
