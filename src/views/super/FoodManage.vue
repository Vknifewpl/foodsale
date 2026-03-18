<template>
  <div>
    <div class="toolbar">
      <div class="search-area">
        <el-input v-model="keyword" placeholder="搜索菜品名" clearable @input="loadData" style="width: 220px" />
        <el-select v-model="categoryId" placeholder="分类筛选" clearable @change="loadData" style="width: 150px">
          <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
      </div>
      <el-button type="primary" icon="el-icon-plus" @click="openAdd">新增菜品</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column label="图片" width="90">
        <template #default="{ row }">
          <el-image :src="getImg(row.image)" style="width:56px;height:56px;border-radius:8px" fit="cover" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="菜品名" />
      <el-table-column prop="categoryId" label="分类" width="120">
        <template #default="{ row }">{{ getCategoryName(row.categoryId) }}</template>
      </el-table-column>
      <el-table-column prop="price" label="价格(¥)" width="100" />
      <el-table-column prop="orderCount" label="销量" width="80" />
      <el-table-column prop="praiseCount" label="好评" width="80" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button size="mini" @click="openEdit(row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination class="pagination" :current-page="page" :page-size="size" :total="total"
      layout="total, prev, pager, next" @current-change="(p) => { page = p; loadData() }" />

    <el-dialog :title="isAdd ? '新增菜品' : '编辑菜品'" :visible.sync="dialogVisible" width="480px">
      <el-form :model="form" :rules="rules" ref="form" label-width="80px">
        <el-form-item label="菜品名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="form.categoryId" style="width:100%">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :precision="2" :min="0" style="width:100%" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="菜品图片">
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            :headers="uploadHeaders"
            name="file"
          >
            <img v-if="form.image" :src="getImg(form.image)" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
          <div class="upload-tip">只能上传JPG/PNG/GIF/WEBP等图片格式，无大小限制</div>
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
  name: 'SuperFoodManage',
  data() {
    return {
      keyword: '', categoryId: null, loading: false, submitting: false,
      tableData: [], page: 1, size: 10, total: 0,
      categories: [],
      dialogVisible: false, isAdd: true, editId: null,
      form: { name: '', categoryId: null, price: 0, description: '', image: '' },
      rules: {
        name: [{ required: true, message: '请输入菜品名', trigger: 'blur' }],
        categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
        price: [{ required: true, message: '请输入价格', trigger: 'blur' }]
      }
    }
  },
  computed: {
    uploadHeaders() {
      return {
        Authorization: `Bearer ${localStorage.getItem('super_token') || ''}`
      }
    },
    uploadUrl() {
      return process.env.VUE_APP_UPLOAD_URL || 'http://localhost:8089/file/upload'
    }
  },
  created() {
    const superToken = localStorage.getItem('super_token')
    if (!superToken) {
      this.$message.warning('请先登录')
      this.$router.push('/super/login')
      return
    }
    this.loadCategories()
    this.loadData()
  },
  methods: {
    async loadCategories() {
      const { data } = await this.$axios.get('/category/list')
      if (data.code === 200) this.categories = data.data
    },
    async loadData() {
      this.loading = true
      const params = { page: this.page, size: this.size }
      if (this.keyword) params.keyword = this.keyword
      if (this.categoryId) params.categoryId = this.categoryId
      const { data } = await this.$axios.get('/super/foods', { params })
      if (data.code === 200) { this.tableData = data.data.records; this.total = data.data.total }
      this.loading = false
    },
    getCategoryName(id) { return this.categories.find(c => c.id === id)?.name ?? '-' },
    getImg(img) {
      if (!img) return require('@/assets/default-food.png')
      return img.startsWith('http') ? img : 'http://localhost:8089' + img
    },
    openAdd() {
      this.isAdd = true; this.editId = null
      this.form = { name: '', categoryId: null, price: 0, description: '', image: '' }
      this.dialogVisible = true
    },
    openEdit(row) {
      this.isAdd = false; this.editId = row.id
      this.form = { name: row.name, categoryId: row.categoryId, price: Number(row.price), description: row.description, image: row.image }
      this.dialogVisible = true
    },
    async submitForm() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return
        this.submitting = true
        try {
          const url = this.isAdd ? '/super/foods' : `/super/foods/${this.editId}`
          const method = this.isAdd ? 'post' : 'put'
          const { data } = await this.$axios[method](url, this.form)
          if (data.code === 200) { this.$message.success('操作成功'); this.dialogVisible = false; this.loadData() }
          else this.$message.error(data.msg)
        } finally { this.submitting = false }
      })
    },
    handleDelete(row) {
      this.$confirm(`确定删除菜品「${row.name}」吗？`, '警告', { type: 'warning' }).then(async () => {
        const { data } = await this.$axios.delete(`/super/foods/${row.id}`)
        if (data.code === 200) { this.$message.success('删除成功'); this.loadData() }
        else this.$message.error(data.msg)
      }).catch(() => {}).finally(() => {
        this.$nextTick(() => {
          const active = document.activeElement
          if (active && typeof active.blur === 'function') active.blur()
        })
      })
    },
    handleAvatarSuccess(res, file) {
      if (res.code === 200) {
        this.form.image = res.data.url
        this.$message.success('图片上传成功')
      } else {
        this.$message.error(res.msg || '图片上传失败')
      }
    },
    beforeAvatarUpload(file) {
      const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif' || file.type === 'image/webp'
      if (!isImage) {
        this.$message.error('只能上传图片文件(JPG/PNG/GIF/WEBP等格式)!')
      }
      return isImage
    }
  }
}
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.search-area { display: flex; gap: 12px; }
.pagination { margin-top: 20px; text-align: right; }

.avatar-uploader .el-upload {
  border: 2px dashed rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  background: #f5f5f7;
}

.avatar-uploader .el-upload:hover {
  border-color: #0071e3;
  background: rgba(0, 113, 227, 0.04);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #86868b;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.upload-tip {
  font-size: 13px;
  color: #86868b;
  margin-top: 8px;
  font-weight: 500;
}
</style>
