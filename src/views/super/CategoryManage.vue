<template>
  <div>
    <div class="toolbar">
      <el-input v-model="keyword" placeholder="搜索分类名" clearable @input="loadData" style="width: 220px" />
      <el-button type="primary" icon="el-icon-plus" @click="openAdd">新增分类</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="分类名称" />
      <el-table-column prop="sort" label="排序" width="100" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button size="mini" @click="openEdit(row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination class="pagination" :current-page="page" :page-size="size" :total="total"
      layout="total, prev, pager, next" @current-change="(p) => { page = p; loadData() }" />

    <el-dialog :title="isAdd ? '新增分类' : '编辑分类'" :visible.sync="dialogVisible" width="380px">
      <el-form :model="form" :rules="rules" ref="form" label-width="80px">
        <el-form-item label="分类名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="排序值">
          <el-input-number v-model="form.sort" :min="0" style="width:100%" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'SuperCategoryManage',
  data() {
    return {
      keyword: '', loading: false, submitting: false,
      tableData: [], page: 1, size: 10, total: 0,
      dialogVisible: false, isAdd: true, editId: null,
      form: { name: '', sort: 0 },
      rules: { name: [{ required: true, message: '请输入分类名', trigger: 'blur' }] }
    }
  },
  created() { this.loadData() },
  methods: {
    async loadData() {
      this.loading = true
      const params = { page: this.page, size: this.size }
      if (this.keyword) params.keyword = this.keyword
      const { data } = await this.$axios.get('/super/categories', { params })
      if (data.code === 200) { this.tableData = data.data.records; this.total = data.data.total }
      this.loading = false
    },
    openAdd() {
      this.isAdd = true; this.editId = null; this.form = { name: '', sort: 0 }; this.dialogVisible = true
    },
    openEdit(row) {
      this.isAdd = false; this.editId = row.id; this.form = { name: row.name, sort: row.sort }; this.dialogVisible = true
    },
    async submitForm() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return
        this.submitting = true
        try {
          const url = this.isAdd ? '/super/categories' : `/super/categories/${this.editId}`
          const method = this.isAdd ? 'post' : 'put'
          const { data } = await this.$axios[method](url, this.form)
          if (data.code === 200) { this.$message.success('操作成功'); this.dialogVisible = false; this.loadData() }
          else this.$message.error(data.msg)
        } finally { this.submitting = false }
      })
    },
    handleDelete(row) {
      this.$confirm(`确定删除分类「${row.name}」吗？`, '警告', { type: 'warning' }).then(async () => {
        const { data } = await this.$axios.delete(`/super/categories/${row.id}`)
        if (data.code === 200) { this.$message.success('删除成功'); this.loadData() }
        else this.$message.error(data.msg)
      }).catch(() => {}).finally(() => {
        this.$nextTick(() => {
          const active = document.activeElement
          if (active && typeof active.blur === 'function') active.blur()
        })
      })
    }
  }
}
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.pagination { margin-top: 20px; text-align: right; }
</style>
