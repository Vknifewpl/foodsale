<template>
  <div class="admin-layout">
    <Sidebar />
    
    <el-container>
      <el-header class="admin-header">
        <div class="header-content">
          <h2>{{ pageTitle }}</h2>
          <div class="user-info">
            <el-dropdown @command="handleCommand">
              <span class="el-dropdown-link">
                {{ currentUser.username }} <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="profile">
                  <i class="el-icon-user"></i> 个人资料
                </el-dropdown-item>
                <el-dropdown-item command="password">
                  <i class="el-icon-lock"></i> 修改密码
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <i class="el-icon-switch-button"></i> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      
      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>

    <!-- 个人资料弹窗 -->
    <el-dialog title="个人资料" :visible.sync="profileDialogVisible" width="400px">
      <div class="profile-info">
        <div class="profile-avatar">
          <i class="el-icon-user-solid"></i>
        </div>
        <div class="profile-item">
          <span class="profile-label">用户名</span>
          <span class="profile-value">{{ currentUser.username }}</span>
        </div>
        <div class="profile-item">
          <span class="profile-label">角色</span>
          <span class="profile-value">管理员</span>
        </div>
      </div>
      <div slot="footer">
        <el-button @click="profileDialogVisible = false">关 闭</el-button>
      </div>
    </el-dialog>

    <!-- 修改密码弹窗 -->
    <el-dialog title="修改密码" :visible.sync="passwordDialogVisible" width="420px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordForm" label-width="90px">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入旧密码" show-password></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="passwordDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitChangePassword" :loading="pwdLoading">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'

export default {
  name: 'AdminLayout',
  components: {
    Sidebar
  },
  data() {
    // 确认密码校验器
    const validateConfirm = (rule, value, callback) => {
      if (value !== this.passwordForm.newPassword) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }
    return {
      currentUser: {},
      profileDialogVisible: false,
      passwordDialogVisible: false,
      pwdLoading: false,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordRules: {
        oldPassword: [
          { required: true, message: '请输入旧密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 3, message: '密码长度不能少于3位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入新密码', trigger: 'blur' },
          { validator: validateConfirm, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    pageTitle() {
      const routeTitleMap = {
        '/admin/food': '菜品管理',
        '/admin/category': '分类管理',
        '/admin/order': '订单管理',
        '/admin/stat': '数据统计'
      }
      return routeTitleMap[this.$route.path] || '后台管理'
    }
  },
  created() {
    this.loadCurrentUser()
  },
  methods: {
    loadCurrentUser() {
      const userStr = localStorage.getItem('admin_user')
      if (userStr) {
        this.currentUser = JSON.parse(userStr)
      }
    },
    handleCommand(command) {
      if (command === 'logout') {
        this.logout()
      } else if (command === 'profile') {
        this.profileDialogVisible = true
      } else if (command === 'password') {
        this.passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' }
        this.passwordDialogVisible = true
        this.$nextTick(() => {
          this.$refs.passwordForm && this.$refs.passwordForm.clearValidate()
        })
      }
    },
    logout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        this.$message.success('已退出登录')
        this.$router.push('/admin/login')
      })
    },
    submitChangePassword() {
      this.$refs.passwordForm.validate(async (valid) => {
        if (!valid) return
        this.pwdLoading = true
        try {
          const res = await this.$axios.post('/admin/password', {
            username: this.currentUser.username,
            oldPassword: this.passwordForm.oldPassword,
            newPassword: this.passwordForm.newPassword
          })
          if (res.data.code === 200) {
            this.$message.success('密码修改成功，请重新登录')
            this.passwordDialogVisible = false
            // 修改密码后自动退出登录
            localStorage.removeItem('admin_token')
            localStorage.removeItem('admin_user')
            this.$router.push('/admin/login')
          } else {
            this.$message.error(res.data.msg || '密码修改失败')
          }
        } catch (e) {
          this.$message.error('网络错误，请重试')
        } finally {
          this.pwdLoading = false
        }
      })
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  background-image: url('@/assets/back.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
}

.admin-layout > .el-container {
  margin-left: 240px;
  width: calc(100% - 240px);
  display: flex;
  flex-direction: column;
}

.admin-header {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 0 40px;
  height: 72px !important;
  line-height: 72px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.admin-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.5px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.el-dropdown-link {
  cursor: pointer;
  color: #1d1d1f;
  font-size: 15px;
  font-weight: 600;
  transition: color 0.3s ease;
}

.el-dropdown-link:hover {
  color: #0071e3;
}

.admin-main {
  padding: 40px;
  flex: 1;
}

/* 个人资料弹窗 */
.profile-info {
  text-align: center;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0071e3, #64d2ff);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.profile-avatar i {
  font-size: 40px;
  color: #fff;
}

.profile-item {
  display: flex;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.profile-item:last-child {
  border-bottom: none;
}

.profile-label {
  color: #86868b;
  font-size: 14px;
  font-weight: 500;
}

.profile-value {
  color: #1d1d1f;
  font-size: 14px;
  font-weight: 600;
}
</style>
