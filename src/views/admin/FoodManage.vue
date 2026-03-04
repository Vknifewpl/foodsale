<template>
  <div class="food-manage-page">
    <div class="page-header">
      <h3>菜品管理</h3>
      <div class="header-actions">
        <el-select v-model="filterCategoryId" placeholder="全部分类" clearable @change="currentPage = 1" style="width: 160px; margin-right: 12px;">
          <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id"></el-option>
        </el-select>
        <el-button type="primary" @click="showAddDialog">新增菜品</el-button>
      </div>
    </div>
    
    <div class="page-content" v-loading="loading">
      <el-table :data="filteredFoods" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="菜品名称" width="200"></el-table-column>
        <el-table-column label="菜品图片" width="120">
          <template slot-scope="scope">
            <el-image 
              :src="getImageUrl(scope.row.image)" 
              :preview-src-list="[getImageUrl(scope.row.image)]"
              style="width: 80px; height: 60px; object-fit: cover;"
              fit="cover"
            ></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="分类" width="120"></el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template slot-scope="scope">¥{{ scope.row.price }}</template>
        </el-table-column>
        <el-table-column prop="orderCount" label="销量" width="100"></el-table-column>
        <el-table-column prop="praiseCount" label="好评数" width="100"></el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button size="mini" @click="editFood(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="deleteFood(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        style="margin-top: 20px; text-align: right;"
      ></el-pagination>
    </div>
    
    <!-- 新增/编辑菜品弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%">
      <el-form :model="foodForm" :rules="foodRules" ref="foodForm" label-width="100px">
        <el-form-item label="菜品名称" prop="name">
          <el-input v-model="foodForm.name" placeholder="请输入菜品名称"></el-input>
        </el-form-item>
        
        <el-form-item label="菜品分类" prop="categoryId">
          <el-select v-model="foodForm.categoryId" placeholder="请选择分类">
            <el-option 
              v-for="category in categories" 
              :key="category.id" 
              :label="category.name" 
              :value="category.id"
            ></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="菜品价格" prop="price">
          <el-input-number v-model="foodForm.price" :min="0" :step="0.01" placeholder="请输入价格"></el-input-number>
        </el-form-item>
        
        <el-form-item label="菜品描述">
          <el-input 
            type="textarea" 
            :rows="3" 
            v-model="foodForm.description" 
            placeholder="请输入菜品描述"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="菜品图片">
          <el-upload
            class="avatar-uploader"
            action="http://localhost:8089/file/upload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            :headers="uploadHeaders"
            name="file"
          >
            <img v-if="foodForm.image" :src="getImageUrl(foodForm.image)" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
          <div class="upload-tip">只能上传jpg/png文件，且不超过2MB</div>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveFood">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'FoodManage',
  data() {
    return {
      loading: false,
      foods: [],
      filterCategoryId: '',
      currentPage: 1,
      pageSize: 10,
      total: 0,
      dialogVisible: false,
      isEdit: false,
      foodForm: {
        id: null,
        name: '',
        categoryId: '',
        price: 0,
        description: '',
        image: ''
      },
      categories: [],
      foodRules: {
        name: [
          { required: true, message: '请输入菜品名称', trigger: 'blur' }
        ],
        categoryId: [
          { required: true, message: '请选择菜品分类', trigger: 'change' }
        ],
        price: [
          { required: true, message: '请输入菜品价格', trigger: 'blur' },
          { type: 'number', min: 0, message: '价格必须大于等于0', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.isEdit ? '编辑菜品' : '新增菜品'
    },
    filteredFoods() {
      if (!this.filterCategoryId) return this.foods
      return this.foods.filter(f => f.categoryId === this.filterCategoryId)
    },
    uploadHeaders() {
      return {
        Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`
      }
    }
  },
  created() {
    this.fetchFoods()
    this.fetchCategories()
  },
  methods: {
    async fetchFoods() {
      this.loading = true
      try {
        const res = await this.$axios.get('/food/list')
        if (res.data.code === 200) {
          this.foods = res.data.data || []
          this.total = this.filteredFoods.length
        } else {
          this.$message.error(res.data.msg || '获取菜品列表失败')
        }
      } catch (e) {
        this.$message.error('网络错误，请重试')
      } finally {
        this.loading = false
      }
    },
    async fetchCategories() {
      try {
        const res = await this.$axios.get('/category/list')
        if (res.data.code === 200) {
          this.categories = res.data.data || []
        }
      } catch (e) {
        console.log('获取分类列表失败')
      }
    },
    showAddDialog() {
      this.isEdit = false
      this.foodForm = {
        id: null,
        name: '',
        categoryId: '',
        price: 0,
        description: '',
        image: ''
      }
      this.dialogVisible = true
    },
    editFood(row) {
      this.isEdit = true
      this.foodForm = { ...row }
      this.dialogVisible = true
    },
    async saveFood() {
      this.$refs.foodForm.validate(async (valid) => {
        if (valid) {
          try {
            let res
            if (this.isEdit) {
              res = await this.$axios.post('/food/update', this.foodForm)
            } else {
              res = await this.$axios.post('/food/add', this.foodForm)
            }
            
            if (res.data.code === 200) {
              this.$message.success(this.isEdit ? '编辑成功' : '新增成功')
              this.dialogVisible = false
              this.fetchFoods()
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
    async deleteFood(id) {
      this.$confirm('此操作将永久删除该菜品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await this.$axios.post('/food/delete', { id })
          if (res.data.code === 200) {
            this.$message.success('删除成功')
            this.fetchFoods()
          } else {
            this.$message.error(res.data.msg || '删除失败')
          }
        } catch (e) {
          this.$message.error('网络错误，请重试')
        }
      })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchFoods()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchFoods()
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {})
    },
    handleAvatarSuccess(res, file) {
      if (res.code === 200) {
        this.foodForm.image = res.data.url
        this.$message.success('图片上传成功')
      } else {
        this.$message.error(res.msg || '图片上传失败')
      }
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
    getImageUrl(image) {
      if (!image) return require('@/assets/default-food.png')
      if (image.startsWith('http')) return image
      return 'http://localhost:8089' + image
    }
  }
}
</script>

<style scoped>
.food-manage-page {
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

.header-actions {
  display: flex;
  align-items: center;
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

.food-manage-page >>> .el-table {
  border-radius: 16px;
  overflow: hidden;
}

.food-manage-page >>> .el-table th, .food-manage-page >>> .el-table tr {
  background-color: transparent !important;
}

.food-manage-page >>> .el-table th {
  background-color: #f5f5f7 !important;
  color: #86868b;
  font-weight: 600;
  border-bottom: none !important;
  padding: 16px 0;
}

.food-manage-page >>> .el-table td {
  border-bottom: 1px solid rgba(0, 0, 0, 0.04) !important;
  padding: 16px 0;
  color: #1d1d1f;
}

.food-manage-page >>> .el-table::before {
  display: none;
}

.food-manage-page >>> .el-table--striped .el-table__body tr.el-table__row--striped td {
  background: rgba(0, 0, 0, 0.01) !important;
}

.food-manage-page >>> .el-image {
  border-radius: 12px;
}

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

/* 按钮圆角优化 */
.food-manage-page >>> .el-table .el-button {
  border-radius: 980px;
  padding: 8px 16px;
  font-weight: 500;
}
</style>
