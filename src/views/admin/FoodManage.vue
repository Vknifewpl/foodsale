<template>
  <div class="food-manage-page">
    <div class="page-header">
      <h3>鑿滃搧绠＄悊</h3>
      <div class="header-actions">
        <el-select v-model="filterCategoryId" placeholder="鍏ㄩ儴鍒嗙被" clearable @change="currentPage = 1" style="width: 160px; margin-right: 12px;">
          <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id"></el-option>
        </el-select>
        <el-button type="primary" @click="showAddDialog">鏂板鑿滃搧</el-button>
      </div>
    </div>
    
    <div class="page-content" v-loading="loading">
      <el-table :data="filteredFoods" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="鑿滃搧鍚嶇О" width="160"></el-table-column>
        <el-table-column label="鑿滃搧鍥剧墖" width="120">
          <template slot-scope="scope">
            <el-image 
              :src="getImageUrl(scope.row.image)" 
              :preview-src-list="[getImageUrl(scope.row.image)]"
              style="width: 80px; height: 60px; object-fit: cover;"
              fit="cover"
            ></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="鍒嗙被" width="110"></el-table-column>
        <el-table-column prop="price" label="浠锋牸" width="90" sortable>
          <template slot-scope="scope">楼{{ scope.row.price }}</template>
        </el-table-column>
        <el-table-column prop="orderCount" label="閿€閲? width="90" sortable></el-table-column>
        <el-table-column prop="praiseCount" label="濂借瘎鏁? width="90" sortable></el-table-column>
        <!-- 骞冲潎鏄熺骇鍒?-->
        <el-table-column label="骞冲潎璇勫垎" width="160">
          <template slot-scope="scope">
            <div class="rating-cell">
              <el-rate
                :value="avgRatingMap[scope.row.id] || 0"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value}"
                :allow-half="true"
              ></el-rate>
              <span v-if="!(avgRatingMap[scope.row.id])" class="no-rating">鏆傛棤璇勪环</span>
            </div>
          </template>
        </el-table-column>
        <!-- 鎿嶄綔鍒?-->
        <el-table-column label="鎿嶄綔" width="240">
          <template slot-scope="scope">
            <el-button size="mini" @click="editFood(scope.row)">缂栬緫</el-button>
            <el-button size="mini" type="primary" plain @click="openReviews(scope.row)">璇勪环鍒楄〃</el-button>
            <el-button size="mini" type="danger" @click="deleteFood(scope.row.id)">鍒犻櫎</el-button>
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
    
    <!-- 鏂板/缂栬緫鑿滃搧寮圭獥 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%">
      <el-form :model="foodForm" :rules="foodRules" ref="foodForm" label-width="100px">
        <el-form-item label="鑿滃搧鍚嶇О" prop="name">
          <el-input v-model="foodForm.name" placeholder="璇疯緭鍏ヨ彍鍝佸悕绉?></el-input>
        </el-form-item>
        
        <el-form-item label="鑿滃搧鍒嗙被" prop="categoryId">
          <el-select v-model="foodForm.categoryId" placeholder="璇烽€夋嫨鍒嗙被">
            <el-option 
              v-for="category in categories" 
              :key="category.id" 
              :label="category.name" 
              :value="category.id"
            ></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="鑿滃搧浠锋牸" prop="price">
          <el-input-number v-model="foodForm.price" :min="0" :step="0.01" placeholder="璇疯緭鍏ヤ环鏍?></el-input-number>
        </el-form-item>
        
        <el-form-item label="鑿滃搧鎻忚堪">
          <el-input 
            type="textarea" 
            :rows="3" 
            v-model="foodForm.description" 
            placeholder="璇疯緭鍏ヨ彍鍝佹弿杩?
          ></el-input>
        </el-form-item>
        
        <el-form-item label="鑿滃搧鍥剧墖">
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
          <div class="upload-tip">鍙兘涓婁紶JPG/PNG/GIF/WEBP绛夊浘鐗囨牸寮忥紝鏃犲ぇ灏忛檺鍒?/div>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">鍙?娑?/el-button>
        <el-button type="primary" @click="saveFood">纭?瀹?/el-button>
      </div>
    </el-dialog>

    <!-- 璇勪环鍒楄〃寮圭獥 -->
    <el-dialog
      :title="`銆?{currentFoodName}銆嬭瘎浠峰垪琛╜"
      :visible.sync="reviewDialogVisible"
      width="680px"
      top="6vh"
    >
      <div v-if="reviewLoading" class="review-loading">
        <i class="el-icon-loading"></i> 鍔犺浇涓€?
      </div>
      <div v-else-if="reviewList.length === 0" class="review-empty">
        <i class="el-icon-chat-dot-round"></i>
        <p>璇ヨ彍鍝佹殏鏃犺瘎浠?/p>
      </div>
      <div v-else>
        <!-- 姹囨€讳俊鎭?-->
        <div class="review-summary">
          <div class="summary-score">{{ currentAvgRating }}</div>
          <div class="summary-right">
            <el-rate :value="parseFloat(currentAvgRating)" disabled :allow-half="true" text-color="#ff9900"></el-rate>
            <span class="summary-count">鍏?{{ reviewList.length }} 鏉¤瘎浠?/span>
          </div>
        </div>
        <!-- 璇勪环鍒楄〃 -->
        <div class="review-list">
          <div class="review-item" v-for="r in reviewList" :key="r.id">
            <div class="review-header">
              <span class="reviewer-name">{{ r.username || '鍖垮悕鐢ㄦ埛' }}</span>
              <el-rate :value="r.rating" disabled :allow-half="false" text-color="#ff9900" style="margin-left:8px;"></el-rate>
              <span class="review-time">{{ formatTime(r.createTime) }}</span>
            </div>
            <div class="review-content">{{ r.content || '鐢ㄦ埛鏈～鍐欒瘎浠峰唴瀹? }}</div>
          </div>
        </div>
      </div>
      <div slot="footer">
        <el-button @click="reviewDialogVisible = false">鍏?闂?/el-button>
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
          { required: true, message: '璇疯緭鍏ヨ彍鍝佸悕绉?, trigger: 'blur' }
        ],
        categoryId: [
          { required: true, message: '璇烽€夋嫨鑿滃搧鍒嗙被', trigger: 'change' }
        ],
        price: [
          { required: true, message: '璇疯緭鍏ヨ彍鍝佷环鏍?, trigger: 'blur' },
          { type: 'number', min: 0, message: '浠锋牸蹇呴』澶т簬绛変簬0', trigger: 'blur' }
        ]
      },
      // 璇勪环鐩稿叧
      avgRatingMap: {},      // { [foodId]: avgRating }
      reviewDialogVisible: false,
      reviewLoading: false,
      reviewList: [],
      currentFoodName: '',
      currentAvgRating: '0.0'
    }
  },
  computed: {
    dialogTitle() {
      return this.isEdit ? '缂栬緫鑿滃搧' : '鏂板鑿滃搧'
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
          // 鍔犺浇瀹岃彍鍝佸悗鎵归噺鍔犺浇骞冲潎璇勫垎
          this.fetchAllAvgRatings()
        } else {
          this.$message.error(res.data.msg || '鑾峰彇鑿滃搧鍒楄〃澶辫触')
        }
      } catch (e) {
        this.$message.error('缃戠粶閿欒锛岃閲嶈瘯')
      } finally {
        this.loading = false
      }
    },

    /** 骞跺彂鎷夊彇姣忛亾鑿滅殑璇勮锛岃绠楀钩鍧囨槦绾?*/
    async fetchAllAvgRatings() {
      const map = {}
      await Promise.all(
        this.foods.map(async food => {
          try {
            const res = await this.$axios.get('/comment/food', { params: { foodId: food.id } })
            if (res.data.code === 200 && res.data.data && res.data.data.length > 0) {
              const list = res.data.data
              const avg = list.reduce((sum, c) => sum + c.rating, 0) / list.length
              map[food.id] = Math.round(avg * 10) / 10
            }
          } catch (_) { /* 涓埆澶辫触涓嶅奖鍝嶆暣浣?*/ }
        })
      )
      this.avgRatingMap = { ...map }
    },

    async fetchCategories() {
      try {
        const res = await this.$axios.get('/category/list')
        if (res.data.code === 200) {
          this.categories = res.data.data || []
        }
      } catch (e) {
        console.log('鑾峰彇鍒嗙被鍒楄〃澶辫触')
      }
    },

    /** 鎵撳紑璇勪环鍒楄〃寮圭獥 */
    async openReviews(food) {
      this.currentFoodName = food.name
      this.reviewList = []
      this.currentAvgRating = '0.0'
      this.reviewDialogVisible = true
      this.reviewLoading = true
      try {
        const res = await this.$axios.get('/comment/food', { params: { foodId: food.id } })
        if (res.data.code === 200) {
          this.reviewList = res.data.data || []
          if (this.reviewList.length > 0) {
            const avg = this.reviewList.reduce((s, c) => s + c.rating, 0) / this.reviewList.length
            this.currentAvgRating = avg.toFixed(1)
          }
        } else {
          this.$message.error(res.data.msg || '鑾峰彇璇勪环澶辫触')
        }
      } catch (e) {
        this.$message.error('缃戠粶閿欒锛岃閲嶈瘯')
      } finally {
        this.reviewLoading = false
      }
    },

    /** 鏍煎紡鍖栨椂闂?*/
    formatTime(t) {
      if (!t) return ''
      return t.replace('T', ' ').substring(0, 16)
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
              this.$message.success(this.isEdit ? '缂栬緫鎴愬姛' : '鏂板鎴愬姛')
              this.dialogVisible = false
              this.fetchFoods()
            } else {
              this.$message.error(res.data.msg || (this.isEdit ? '缂栬緫澶辫触' : '鏂板澶辫触'))
            }
          } catch (e) {
            this.$message.error('缃戠粶閿欒锛岃閲嶈瘯')
          }
        } else {
          return false
        }
      }).catch(() => {})
    },
    async deleteFood(id) {
      this.$confirm('姝ゆ搷浣滃皢姘镐箙鍒犻櫎璇ヨ彍鍝? 鏄惁缁х画?', '鎻愮ず', {
        confirmButtonText: '纭畾',
        cancelButtonText: '鍙栨秷',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await this.$axios.post('/food/delete', { id })
          if (res.data.code === 200) {
            this.$message.success('鍒犻櫎鎴愬姛')
            this.fetchFoods()
          } else {
            this.$message.error(res.data.msg || '鍒犻櫎澶辫触')
          }
        } catch (e) {
          this.$message.error('缃戠粶閿欒锛岃閲嶈瘯')
        }
      }).catch(() => {})
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchFoods()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchFoods()
    },
    handleAvatarSuccess(res, file) {
      if (res.code === 200) {
        this.foodForm.image = res.data.url
        this.$message.success('鍥剧墖涓婁紶鎴愬姛')
      } else {
        this.$message.error(res.msg || '鍥剧墖涓婁紶澶辫触')
      }
    },
    beforeAvatarUpload(file) {
      const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif' || file.type === 'image/webp'

      if (!isImage) {
        this.$message.error('鍙兘涓婁紶鍥剧墖鏂囦欢(JPG/PNG/GIF/WEBP绛夋牸寮?!')
      }
      return isImage
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

/* 骞冲潎璇勫垎鍒?*/
.rating-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}
.no-rating {
  font-size: 12px;
  color: #c0c4cc;
}

/* 鎸夐挳鍦嗚浼樺寲 */
.food-manage-page >>> .el-table .el-button {
  border-radius: 980px;
  padding: 6px 12px;
  font-weight: 500;
}

/* 涓婁紶鐩稿叧 */
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

/* ===== 璇勪环寮圭獥鏍峰紡 ===== */
.review-loading,
.review-empty {
  text-align: center;
  padding: 40px 0;
  color: #86868b;
  font-size: 15px;
}

.review-empty i {
  font-size: 48px;
  color: #c0c4cc;
  display: block;
  margin-bottom: 12px;
}

.review-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #fff9ec 0%, #fff3d8 100%);
  border-radius: 16px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 153, 0, 0.15);
}

.summary-score {
  font-size: 48px;
  font-weight: 700;
  color: #ff9900;
  line-height: 1;
  min-width: 64px;
  text-align: center;
}

.summary-right {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-count {
  font-size: 13px;
  color: #86868b;
  margin-top: 2px;
}

.review-list {
  max-height: 420px;
  overflow-y: auto;
  padding-right: 4px;
}

.review-item {
  padding: 16px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.reviewer-name {
  font-weight: 600;
  font-size: 14px;
  color: #1d1d1f;
  min-width: 80px;
}

.review-time {
  margin-left: auto;
  font-size: 12px;
  color: #c0c4cc;
  white-space: nowrap;
}

.review-content {
  font-size: 14px;
  color: #48484a;
  line-height: 1.6;
  padding-left: 2px;
  word-break: break-all;
}
</style>

