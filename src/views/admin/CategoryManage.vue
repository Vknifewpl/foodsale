<template>
  <div class="category-manage-page">
    <div class="page-header">
      <h3>分类管理</h3>
      <el-button type="primary" @click="showAddDialog">新增分类</el-button>
    </div>
    
    <div class="page-content" v-loading="loading">
      <el-table :data="categories" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="分类名称" width="200"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="200">
          <template slot-scope="scope">
            {{ formatTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button size="mini" @click="editCategory(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="deleteCategory(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 新增/编辑分类弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="400px">
      <el-form :model="categoryForm" :rules="categoryRules" ref="categoryForm" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称"></el-input>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveCategory">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'CategoryManage',
  data() {
    return {
      loading: false,
      categories: [],
      dialogVisible: false,
      isEdit: false,
      categoryForm: {
        id: null,
        name: ''
      },
      categoryRules: {
        name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在1到50个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.isEdit ? '编辑分类' : '新增分类'
    }
  },
  created() {
    this.fetchCategories()
  },
  methods: {
    async fetchCategories() {
      this.loading = true
      try {
        const res = await this.$axios.get('/category/list')
        if (res.data.code === 200) {
          this.categories = res.data.data || []
        } else {
          this.$message.error(res.data.msg || '获取分类列表失败')
        }
      } catch (e) {
        this.$message.error('网络错误，请重试')
      } finally {
        this.loading = false
      }
    },
    showAddDialog() {
      this.isEdit = false
      this.categoryForm = {
        id: null,
        name: ''
      }
      this.dialogVisible = true
    },
    editCategory(row) {
      this.isEdit = true
      this.categoryForm = { ...row }
      this.dialogVisible = true
    },
    async saveCategory() {
      this.$refs.categoryForm.validate(async (valid) => {
        if (valid) {
          try {
            let res
            if (this.isEdit) {
              res = await this.$axios.post('/category/update', this.categoryForm)
            } else {
              res = await this.$axios.post('/category/add', { name: this.categoryForm.name })
            }
            
            if (res.data.code === 200) {
              this.$message.success(this.isEdit ? '编辑成功' : '新增成功')
              this.dialogVisible = false
              this.fetchCategories()
            } else {
              this.$message.error(res.data.msg || (this.isEdit ? '编辑失败' : '新增失败'))
            }
          } catch (e) {
            this.$message.error('网络错误，请重试')
          }
        } else {
          return false
        }
      })
    },
    async deleteCategory(id) {
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await this.$axios.post('/category/delete', { id })
          if (res.data.code === 200) {
            this.$message.success('删除成功')
            this.fetchCategories()
          } else {
            this.$message.error(res.data.msg || '删除失败')
          }
        } catch (e) {
          this.$message.error('网络错误，请重试')
        }
      })
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {})
    },
    formatTime(time) {
      if (!time) return ''
      return new Date(time).toLocaleString()
    }
  }
}
</script>

<style scoped>
.category-manage-page {
  padding: 40px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #1d1d1f;
}

.page-header >>> .el-button {
  border-radius: 980px;
  padding: 12px 24px;
  font-weight: 600;
  background: #0071e3;
  border: none;
  box-shadow: 0 4px 14px rgba(0, 113, 227, 0.2);
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.page-header >>> .el-button:hover {
  background: #0077ed;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 113, 227, 0.3);
}

.category-manage-page >>> .el-table {
  border-radius: 16px;
  overflow: hidden;
}

.category-manage-page >>> .el-table th, .category-manage-page >>> .el-table tr {
  background-color: transparent !important;
}

.category-manage-page >>> .el-table th {
  background-color: #f5f5f7 !important;
  color: #86868b;
  font-weight: 600;
  border-bottom: none !important;
  padding: 16px 0;
}

.category-manage-page >>> .el-table td {
  border-bottom: 1px solid rgba(0, 0, 0, 0.04) !important;
  padding: 16px 0;
  color: #1d1d1f;
}

.category-manage-page >>> .el-table::before {
  display: none;
}

.category-manage-page >>> .el-table--striped .el-table__body tr.el-table__row--striped td {
  background: rgba(0, 0, 0, 0.01) !important;
}

.category-manage-page >>> .el-table .el-button {
  border-radius: 980px;
  padding: 8px 16px;
  font-weight: 500;
}
</style>
