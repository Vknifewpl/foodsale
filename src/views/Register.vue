<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <div class="header-icon">
          <i class="el-icon-s-custom"></i>
        </div>
        <div class="header-text">
          <h2>用户注册</h2>
          <p>创建新账号</p>
        </div>
      </div>
      <el-form ref="form" :model="form" :rules="rules" label-width="0">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" prefix-icon="el-icon-lock"></el-input>
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请确认密码" prefix-icon="el-icon-lock"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleRegister" style="width: 100%">注册</el-button>
        </el-form-item>
      </el-form>
      <div class="tips">
        已有账号？<router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Register',
  data() {
    const validateConfirm = (rule, value, callback) => {
      if (value !== this.form.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }
    return {
      form: {
        username: '',
        password: '',
        confirmPassword: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { validator: validateConfirm, trigger: 'blur' }
        ]
      },
      loading: false
    }
  },
  methods: {
    handleRegister() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        
        this.loading = true
        try {
          const { data } = await this.$axios.post('/user/register', {
            username: this.form.username,
            password: this.form.password
          })
          if (data.code === 200) {
            this.$message.success('注册成功，请登录')
            this.$router.push('/login')
          } else {
            this.$message.error(data.msg)
          }
        } catch (error) {
          this.$message.error('注册失败，请重试')
        }
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 50%, #a0cfff 100%);
}

.register-box {
  width: 100%;
  max-width: 440px;
  padding: 64px 48px;
  background: #fff;
  border-radius: 32px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.04);
  text-align: center;
}

.register-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.header-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff, #66b1ff, #a0cfff);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.header-icon i {
  font-size: 36px;
  color: white;
}

.header-text h2 {
  margin: 0 0 8px;
  font-size: 26px;
  font-weight: 700;
  color: #1d1d1f;
}

.header-text p {
  margin: 0;
  color: #86868b;
  font-size: 15px;
  font-weight: 500;
}

.el-form {
  margin-top: 20px;
}

.register-box >>> .el-input__inner {
  height: 56px;
  border-radius: 16px;
  background: #f5f5f7;
  border: 2px solid transparent;
  padding-left: 44px;
  font-size: 16px;
  color: #1d1d1f;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}
.register-box >>> .el-input__inner:focus {
  background: #fff;
  border-color: #0071e3;
  box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.1);
}

.register-box >>> .el-input__prefix {
  left: 16px;
  display: flex;
  align-items: center;
  color: #86868b;
  font-size: 18px;
}

.register-box >>> .el-button {
  height: 56px;
  border-radius: 980px;
  font-size: 18px;
  font-weight: 600;
  margin-top: 16px;
  background: linear-gradient(135deg, #409eff, #66b1ff, #a0cfff);
  border: none;
  box-shadow: 0 4px 14px rgba(64, 158, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}
.register-box >>> .el-button:hover {
  background: linear-gradient(135deg, #66b1ff, #409eff);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.3);
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
  .register-box {
    margin: 16px;
    padding: 48px 32px;
  }
}
</style>
