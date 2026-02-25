<template>
  <div class="order-manage-page">
    <div class="page-header">
      <h3>订单管理</h3>
    </div>
    
    <div class="filter-section">
      <el-form :inline="true" :model="filters">
        <el-form-item label="订单状态">
          <el-select v-model="filters.status" placeholder="请选择状态" @change="fetchOrders">
            <el-option label="全部" value=""></el-option>
            <el-option label="待支付" value="0"></el-option>
            <el-option label="已支付" value="1"></el-option>
            <el-option label="已完成" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchOrders">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <div class="page-content" v-loading="loading">
      <el-table :data="orders" stripe style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" width="200"></el-table-column>
        <el-table-column prop="userId" label="用户ID" width="100"></el-table-column>
        <el-table-column prop="totalAmount" label="订单金额" width="120">
          <template slot-scope="scope">¥{{ scope.row.totalAmount }}</template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="orderTime" label="下单时间" width="180">
          <template slot-scope="scope">
            {{ formatTime(scope.row.orderTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="payTime" label="支付时间" width="180">
          <template slot-scope="scope">
            {{ scope.row.payTime ? formatTime(scope.row.payTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button size="mini" @click="viewOrderDetails(scope.row)">查看详情</el-button>
            <el-button 
              size="mini" 
              type="primary" 
              @click="updateOrderStatus(scope.row)" 
              :disabled="scope.row.status !== 1"
            >
              完成订单
            </el-button>
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
    
    <!-- 订单详情弹窗 -->
    <el-dialog title="订单详情" :visible.sync="detailDialogVisible" width="60%" :before-close="closeDetailDialog">
      <div class="order-detail-content" v-if="currentOrder">
        <div class="basic-info">
          <h4>基本信息</h4>
          <div class="info-row">
            <span class="label">订单号:</span>
            <span class="value">{{ currentOrder.orderNo }}</span>
          </div>
          <div class="info-row">
            <span class="label">用户ID:</span>
            <span class="value">{{ currentOrder.userId }}</span>
          </div>
          <div class="info-row">
            <span class="label">订单状态:</span>
            <span class="value">
              <el-tag :type="getStatusType(currentOrder.status)">
                {{ getStatusText(currentOrder.status) }}
              </el-tag>
            </span>
          </div>
          <div class="info-row">
            <span class="label">订单金额:</span>
            <span class="value">¥{{ currentOrder.totalAmount }}</span>
          </div>
          <div class="info-row">
            <span class="label">下单时间:</span>
            <span class="value">{{ formatTime(currentOrder.orderTime) }}</span>
          </div>
          <div class="info-row" v-if="currentOrder.payTime">
            <span class="label">支付时间:</span>
            <span class="value">{{ formatTime(currentOrder.payTime) }}</span>
          </div>
          <div class="info-row" v-if="currentOrder.completeTime">
            <span class="label">完成时间:</span>
            <span class="value">{{ formatTime(currentOrder.completeTime) }}</span>
          </div>
        </div>
        
        <div class="order-items">
          <h4>订单明细</h4>
          <el-table :data="currentOrder.orderItems" stripe>
            <el-table-column prop="foodName" label="菜品名称" width="200"></el-table-column>
            <el-table-column label="菜品图片" width="100">
              <template slot-scope="scope">
                <el-image 
                  :src="getImageUrl(scope.row.foodImage)" 
                  style="width: 60px; height: 45px; object-fit: cover;"
                  fit="cover"
                ></el-image>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="单价">
              <template slot-scope="scope">¥{{ scope.row.price }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量"></el-table-column>
            <el-table-column prop="subtotal" label="小计">
              <template slot-scope="scope">¥{{ scope.row.subtotal }}</template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDetailDialog">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'OrderManage',
  data() {
    return {
      loading: false,
      orders: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      filters: {
        status: ''
      },
      detailDialogVisible: false,
      currentOrder: null
    }
  },
  created() {
    this.fetchOrders()
  },
  methods: {
    async fetchOrders() {
      this.loading = true
      try {
        const status = this.filters.status === '' ? null : parseInt(this.filters.status)
        const res = await this.$axios.get('/admin/order/list', {
          params: { status }
        })
        if (res.data.code === 200) {
          this.orders = res.data.data || []
          this.total = this.orders.length
        } else {
          this.$message.error(res.data.msg || '获取订单列表失败')
        }
      } catch (e) {
        this.$message.error('网络错误，请重试')
      } finally {
        this.loading = false
      }
    },
    getStatusText(status) {
      const statusMap = {
        0: '待支付',
        1: '已支付',
        2: '已完成'
      }
      return statusMap[status] || '未知'
    },
    getStatusType(status) {
      const typeMap = {
        0: 'warning',
        1: 'primary',
        2: 'success'
      }
      return typeMap[status] || 'info'
    },
    formatTime(time) {
      if (!time) return ''
      return new Date(time).toLocaleString()
    },
    viewOrderDetails(order) {
      this.currentOrder = order
      this.detailDialogVisible = true
    },
    closeDetailDialog() {
      this.detailDialogVisible = false
      this.currentOrder = null
    },
    async updateOrderStatus(order) {
      this.$confirm(`确定将订单 ${order.orderNo} 的状态改为已完成吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await this.$axios.post('/admin/order/update', {
            orderNo: order.orderNo,
            status: 2
          })
          if (res.data.code === 200) {
            this.$message.success('订单状态更新成功')
            this.fetchOrders()
          } else {
            this.$message.error(res.data.msg || '订单状态更新失败')
          }
        } catch (e) {
          this.$message.error('网络错误，请重试')
        }
      })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchOrders()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchOrders()
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
.order-manage-page {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.page-header {
  margin-bottom: 20px;
}

.page-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.filter-section {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f5f5f5;
}

.info-row:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.label {
  width: 100px;
  color: #999;
  font-size: 14px;
}

.value {
  flex: 1;
  color: #333;
  font-size: 14px;
}

.order-items {
  margin-top: 20px;
}

.order-items h4 {
  margin-bottom: 15px;
  font-size: 16px;
  color: #333;
}
</style>
