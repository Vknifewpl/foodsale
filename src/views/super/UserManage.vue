<template>
  <div>
    <!-- 搜索栏 -->
    <div class="toolbar">
      <div class="search-area">
        <el-input v-model="keyword" placeholder="搜索用户名" clearable @input="loadData" style="width: 220px" />
        <el-select v-model="roleFilter" placeholder="角色筛选" clearable @change="loadData" style="width: 140px">
          <el-option label="用户" :value="0" />
          <el-option label="商家管理员" :value="1" />
          <el-option label="超级管理员" :value="2" />
        </el-select>
      </div>
      <el-button type="primary" icon="el-icon-plus" @click="openAdd">新增用户</el-button>
    </div>

    <!-- 用户表格 -->
    <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column label="角色" width="130">
        <template #default="{ row }">
          <el-tag :type="roleTagType(row.role)">{{ roleLabel(row.role) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="新用户" width="90">
        <template #default="{ row }">
          <el-tag :type="row.isNewUser === 1 ? 'warning' : 'success'" size="small">
            {{ row.isNewUser === 1 ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="注册时间" width="180" />
      <el-table-column label="操作" width="300" fixed="right">
        <template #default="{ row }">
          <el-button size="mini" @click="openEdit(row)">编辑</el-button>
          <el-button size="mini" type="warning" @click="openResetPwd(row)">重置密码</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="pagination"
      :current-page="page" :page-size="size" :total="total"
      layout="total, prev, pager, next"
      @current-change="(p) => { page = p; loadData() }"
    />

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="420px" @close="resetForm">
      <el-form :model="form" :rules="formRules" ref="form" label-width="90px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="isAdd">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" style="width: 100%">
            <el-option label="用户（role=0）" :value="0" />
            <el-option label="商家管理员（role=1）" :value="1" />
            <el-option label="超级管理员（role=2）" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 重置密码弹窗 -->
    <el-dialog title="重置密码" :visible.sync="pwdDialogVisible" width="380px">
      <el-form :model="pwdForm" :rules="pwdRules" ref="pwdForm" label-width="90px">
        <el-form-item label="新密码" prop="password">
          <el-input v-model="pwdForm.password" type="password" show-password placeholder="不少于6位" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="pwdDialogVisible = false">取消</el-button>
        <el-button type="warning" :loading="submitting" @click="submitResetPwd">确定重置</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'SuperUserManage',
  data() {
    return {
      keyword: '', roleFilter: null, loading: false, submitting: false,
      tableData: [], page: 1, size: 10, total: 0,
      dialogVisible: false, isAdd: true, editId: null,
      form: { username: '', password: '', role: 0 },
      formRules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, min: 6, message: '密码不少于6位', trigger: 'blur' }],
        role: [{ required: true, message: '请选择角色', trigger: 'change' }]
      },
      pwdDialogVisible: false, pwdUserId: null,
      pwdForm: { password: '' },
      pwdRules: { password: [{ required: true, min: 6, message: '密码不少于6位', trigger: 'blur' }] }
    }
  },
  computed: {
    dialogTitle() { return this.isAdd ? '新增用户' : '编辑用户' }
  },
  created() { this.loadData() },
  methods: {
    async loadData() {
      this.loading = true
      const params = { page: this.page, size: this.size }
      if (this.keyword) params.keyword = this.keyword
      if (this.roleFilter !== null && this.roleFilter !== '') params.role = this.roleFilter
      const { data } = await this.$axios.get('/super/users', { params })
      if (data.code === 200) {
        this.tableData = data.data.records
        this.total = data.data.total
      }
      this.loading = false
    },
    roleLabel(role) { return { 0: '用户', 1: '商家管理员', 2: '超级管理员' }[role] ?? '未知' },
    roleTagType(role) { return { 0: '', 1: 'warning', 2: 'danger' }[role] ?? 'info' },
    openAdd() {
      this.isAdd = true; this.editId = null
      this.form = { username: '', password: '', role: 0 }
      this.dialogVisible = true
    },
    openEdit(row) {
      this.isAdd = false; this.editId = row.id
      this.form = { username: row.username, role: row.role }
      this.dialogVisible = true
    },
    resetForm() { this.$refs.form && this.$refs.form.clearValidate() },
    async submitForm() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return
        this.submitting = true
        try {
          const url = this.isAdd ? '/super/users' : `/super/users/${this.editId}`
          const method = this.isAdd ? 'post' : 'put'
          const { data } = await this.$axios[method](url, this.form)
          if (data.code === 200) {
            this.$message.success(this.isAdd ? '新增成功' : '修改成功')
            this.dialogVisible = false
            this.loadData()
          } else { this.$message.error(data.msg) }
        } finally { this.submitting = false }
      })
    },
    openResetPwd(row) {
      this.pwdUserId = row.id; this.pwdForm.password = ''
      this.pwdDialogVisible = true
    },
    async submitResetPwd() {
      this.$refs.pwdForm.validate(async (valid) => {
        if (!valid) return
        this.submitting = true
        try {
          const { data } = await this.$axios.put(`/super/users/${this.pwdUserId}/password`, this.pwdForm)
          if (data.code === 200) {
            this.$message.success('密码重置成功')
            this.pwdDialogVisible = false
          } else { this.$message.error(data.msg) }
        } finally { this.submitting = false }
      })
    },
    handleDelete(row) {
      this.$confirm(`确定删除用户「${row.username}」吗？`, '警告', { type: 'warning' }).then(async () => {
        const { data } = await this.$axios.delete(`/super/users/${row.id}`)
        if (data.code === 200) { this.$message.success('删除成功'); this.loadData() }
        else this.$message.error(data.msg)
      })
    }
  }
}
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.search-area { display: flex; gap: 12px; }
.pagination { margin-top: 20px; text-align: right; }
</style>
