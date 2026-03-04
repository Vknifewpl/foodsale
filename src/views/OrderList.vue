<template>
  <div class="order-list-page">
    <div class="page-header">
      <h2>我的订单</h2>
    </div>
    
    <div class="filter-tabs">
      <el-tabs v-model="activeStatus" @tab-click="handleTabClick">
        <el-tab-pane label="全部" name="all"></el-tab-pane>
        <el-tab-pane label="待支付" name="0"></el-tab-pane>
        <el-tab-pane label="已支付" name="1"></el-tab-pane>
        <el-tab-pane label="已完成" name="2"></el-tab-pane>
      </el-tabs>
    </div>
    
    <div class="order-list" v-loading="loading">
      <div class="order-item" v-for="order in orders" :key="order.id">
        <div class="order-header">
          <div class="header-left">
            <span class="order-no">订单号: {{ order.orderNo }}</span>
            <span class="toggle-items" @click="toggleItems(order)">
              商品列表 <i :class="order._expanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
            </span>
          </div>
          <span class="order-status" :class="'status-' + order.status">
            {{ getStatusText(order.status) }}
          </span>
        </div>
        
        <div class="order-body">
          <div class="order-items" v-show="order._expanded">
            <div class="order-item-detail" v-for="item in order.orderItems" :key="item.id">
              <div class="item-image">
                <img :src="getImageUrl(item.foodImage)" :alt="item.foodName" />
              </div>
              <div class="item-info">
                <h4>{{ item.foodName }}</h4>
                <p>¥{{ item.price }} × {{ item.quantity }} = ¥{{ item.subtotal }}</p>
              </div>
            </div>
          </div>
          
          <div class="order-summary">
            <div class="summary-row">
              <span>订单金额:</span>
              <span class="amount">¥{{ order.totalAmount }}</span>
            </div>
            <div class="summary-row">
              <span>下单时间:</span>
              <span>{{ formatTime(order.orderTime) }}</span>
            </div>
            <div class="summary-row" v-if="order.payTime">
              <span>支付时间:</span>
              <span>{{ formatTime(order.payTime) }}</span>
            </div>
          </div>
        </div>
        
        <div class="order-actions">
          <el-button 
            v-if="order.status == 0" 
            type="primary" 
            size="small"
            @click="payOrder(order.orderNo)"
          >
            立即支付
          </el-button>
          <el-button 
            v-if="order.status == 1" 
            type="success" 
            size="small"
            @click="showCommentDialog(order)"
          >
            去评价
          </el-button>
          <el-button 
            type="info" 
            size="small"
            @click="viewOrder(order.orderNo)"
          >
            查看详情
          </el-button>
        </div>
      </div>
      
      <el-empty v-if="!loading && orders.length === 0" description="暂无订单"></el-empty>
    </div>

    <!-- 评价弹窗 -->
    <el-dialog title="评价菜品" :visible.sync="commentDialogVisible" width="500px">
      <div v-if="commentOrder">
        <div class="comment-food-select">
          <el-select v-model="commentForm.foodId" placeholder="选择要评价的菜品" style="width: 100%">
            <el-option
              v-for="item in commentOrder.orderItems"
              :key="item.foodId"
              :label="item.foodName"
              :value="item.foodId"
            ></el-option>
          </el-select>
        </div>
        <div class="comment-rating" style="margin: 20px 0;">
          <span>评分：</span>
          <el-rate v-model="commentForm.rating"></el-rate>
        </div>
        <el-input
          type="textarea"
          :rows="4"
          v-model="commentForm.content"
          placeholder="请输入评价内容"
        ></el-input>
      </div>
      <div slot="footer">
        <el-button @click="commentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitComment" :loading="commentSubmitting">提交评价</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'OrderList',
  data() {
    return {
      loading: false,
      activeStatus: 'all',
      orders: [],
      commentDialogVisible: false,
      commentOrder: null,
      commentForm: {
        foodId: '',
        rating: 5,
        content: ''
      },
      commentSubmitting: false
    }
  },
  created() {
    this.fetchOrders()
  },
  methods: {
    async fetchOrders() {
      const token = localStorage.getItem('token')
      if (!token) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }

      this.loading = true
      try {
        const status = this.activeStatus === 'all' ? null : parseInt(this.activeStatus)
        
        const res = await this.$axios.get('/order/list', {
          params: { status }
        })
        
        if (res.data.code === 200) {
          // 为每个订单添加_expanded属性，默认收起商品列表
          this.orders = (res.data.data || []).map(o => ({ ...o, _expanded: false }))
        } else {
          this.$message.error(res.data.msg || '获取订单列表失败')
        }
      } catch (e) {
        this.$message.error('网络错误，请重试')
      } finally {
        this.loading = false
      }
    },
    handleTabClick() {
      this.fetchOrders()
    },
    toggleItems(order) {
      this.$set(order, '_expanded', !order._expanded)
    },
    getStatusText(status) {
      const statusMap = {
        0: '待支付',
        1: '已支付',
        2: '已完成'
      }
      return statusMap[status] || '未知'
    },
    getImageUrl(image) {
      if (!image) return require('@/assets/default-food.png')
      if (image.startsWith('http')) return image
      return 'http://localhost:8089' + image
    },
    formatTime(time) {
      if (!time) return ''
      return new Date(time).toLocaleString()
    },
    async payOrder(orderNo) {
      try {
        const res = await this.$axios.post('/order/pay', { orderNo })
        if (res.data.code === 200) {
          this.$message.success('支付成功')
          this.fetchOrders()
        } else {
          this.$message.error(res.data.msg || '支付失败')
        }
      } catch (e) {
        this.$message.error('网络错误，请重试')
      }
    },
    viewOrder(orderNo) {
      this.$router.push(`/order/${orderNo}`)
    },
    showCommentDialog(order) {
      this.commentOrder = order
      this.commentForm = {
        foodId: order.orderItems && order.orderItems.length > 0 ? order.orderItems[0].foodId : '',
        rating: 5,
        content: ''
      }
      this.commentDialogVisible = true
    },
    async submitComment() {
      if (!this.commentForm.foodId) {
        this.$message.warning('请选择要评价的菜品')
        return
      }
      if (!this.commentForm.content.trim()) {
        this.$message.warning('请输入评价内容')
        return
      }

      this.commentSubmitting = true
      try {
        const res = await this.$axios.post('/comment/add', {
          foodId: this.commentForm.foodId,
          orderId: this.commentOrder.id,
          content: this.commentForm.content,
          rating: this.commentForm.rating
        })
        if (res.data.code === 200) {
          this.$message.success('评价成功')
          this.commentDialogVisible = false
          this.fetchOrders()
        } else {
          this.$message.error(res.data.msg || '评价失败')
        }
      } catch (e) {
        this.$message.error('网络错误，请重试')
      } finally {
        this.commentSubmitting = false
      }
    }
  }
}
</script>

<style scoped>
.order-list-page {
  min-height: 100vh;
  padding-bottom: 80px;
}

.page-header {
  background: transparent;
  padding: 16px 0 24px 0;
  max-width: 1000px;
  margin: 0 auto;
}


.page-header h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #1d1d1f;
}

.filter-tabs {
  max-width: 1000px;
  margin: 0 auto 32px;
}

.filter-tabs >>> .el-tabs__header {
  margin: 0;
  border-bottom: none;
}
.filter-tabs >>> .el-tabs__nav-wrap::after {
  display: none;
}
.filter-tabs >>> .el-tabs__item {
  font-size: 16px;
  font-weight: 600;
  color: #86868b;
  transition: color 0.3s;
}
.filter-tabs >>> .el-tabs__item.is-active {
  color: #1d1d1f;
}
.filter-tabs >>> .el-tabs__active-bar {
  background-color: #1d1d1f;
  border-radius: 4px;
  height: 3px;
}

.order-list {
  max-width: 1000px;
  margin: 0 auto;
}

.order-item {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  transition: transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.order-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.06);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toggle-items {
  font-size: 14px;
  font-weight: 600;
  color: #0071e3;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: opacity 0.2s;
}

.toggle-items:hover {
  opacity: 0.7;
}

.toggle-items i {
  font-size: 14px;
  transition: transform 0.3s;
}

.order-no {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
}

.order-status {
  font-size: 13px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 980px;
}

.status-0 {
  background: rgba(227, 0, 0, 0.08);
  color: #e30000;
}

.status-1 {
  background: #f5f5f7;
  color: #55555a;
}

.status-2 {
  background: rgba(0, 113, 227, 0.08);
  color: #0071e3;
}

.order-body {
  display: flex;
  gap: 24px;
}

.order-items {
  flex: 1;
}

.order-item-detail {
  display: flex;
  gap: 20px;
  padding: 16px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
}

.order-item-detail:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  background: #f5f5f7;
  border-radius: 12px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.item-info p {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #86868b;
}

.order-summary {
  width: 240px;
  flex-shrink: 0;
  padding-left: 24px;
  border-left: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #86868b;
}

.amount {
  color: #1d1d1f;
  font-weight: 700;
  font-size: 20px;
  letter-spacing: -0.5px;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.order-actions >>> .el-button {
  padding: 10px 24px;
}

.comment-food-select {
  margin-bottom: 24px;
}

.comment-rating {
  display: flex;
  align-items: center;
  gap: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

@media (max-width: 768px) {
  .order-body {
    flex-direction: column;
    gap: 24px;
  }
  
  .order-summary {
    width: 100%;
    padding-left: 0;
    border-left: none;
    background: #f5f5f7;
    border-radius: 16px;
    padding: 24px;
  }
  
  .order-actions {
    justify-content: stretch;
  }
  
  .order-actions >>> .el-button {
    flex: 1;
  }
  
  .page-header, .filter-tabs, .order-list {
    padding: 0 16px;
  }
}
</style>
