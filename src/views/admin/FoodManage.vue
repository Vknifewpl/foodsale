<template>
  <div class="food-manage-page">
    <div class="page-header">
      <h3>菜品管理</h3>
      <el-button type="primary" @click="showAddDialog">新增菜品</el-button>
    </div>
    
    <div class="page-content" v-loading="loading">
      <el-table :data="foods" stripe style="width: 100%">
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
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%" :before-close="handleClose">
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
            action="http://localhost:8080/file/upload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
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
          this.total = this.foods.length
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
      return 'http://localhost:8080' + image
    }
  }
}
</script>

<style scoped>
.food-manage-page {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
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
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}
</style>
