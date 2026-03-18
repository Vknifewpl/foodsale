<template>
  <div class="super-login-page">
    <div class="login-card">
      <div class="login-icon">
        <i class="el-icon-s-custom"></i>
      </div>
      <h1>超级管理端</h1>
      <p class="subtitle">Super Admin Console</p>

      <el-form :model="form" :rules="rules" ref="form" @submit.native.prevent="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="超级管理员账号" prefix-icon="el-icon-user" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="el-icon-lock" show-password />
        </el-form-item>
        <el-button type="danger" class="login-btn" :loading="loading" @click="handleLogin">登 录</el-button>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SuperLogin',
  data() {
    return {
      loading: false,
      form: { username: '', password: '' },
      rules: {
        username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      }
    }
  },
  methods: {
    handleLogin() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return
        this.loading = true
        try {
          const { data } = await this.$axios.post('/super/login', this.form)
          if (data.code === 200) {
            localStorage.setItem('super_token', data.data.token)
            localStorage.setItem('super_user', JSON.stringify(data.data))
            this.$message.success('登录成功')
            this.$router.push('/super/users')
          } else {
            this.$message.error(data.msg || '登录失败')
          }
        } catch (e) {
          this.$message.error('网络错误，请重试')
        } finally {
          this.loading = false
        }
      })
    }
  }
}
</script>

<style scoped>
.super-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2c0000 0%, #8b0000 50%, #c0392b 100%);
}
.login-card {
  background: white;
  border-radius: 24px;
  padding: 48px 40px;
  width: 400px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}
.login-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b0000, #c0392b);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}
.login-icon i { font-size: 36px; color: white; }
h1 { margin: 0 0 8px; font-size: 26px; font-weight: 700; color: #1d1d1f; }
.subtitle { color: #86868b; font-size: 14px; margin-bottom: 32px; }
.el-form-item { margin-bottom: 16px; }
.login-btn { width: 100%; height: 48px; font-size: 16px; font-weight: 600; border-radius: 12px; margin-top: 8px; }
</style>
