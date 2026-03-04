<template>
  <div class="statistics-page">
    <div class="page-header">
      <h3>数据统计</h3>
    </div>
    
    <div class="stats-overview">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="stat-card">
            <div class="card-icon bg-blue">
              <i class="el-icon-document"></i>
            </div>
            <div class="card-content">
              <div class="stat-number">{{ stats.totalOrders || 0 }}</div>
              <div class="stat-label">总订单数</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="stat-card">
            <div class="card-icon bg-green">
              <i class="el-icon-wallet"></i>
            </div>
            <div class="card-content">
              <div class="stat-number">¥{{ stats.totalSales || 0 }}</div>
              <div class="stat-label">总销售额</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="stat-card">
            <div class="card-icon bg-orange">
              <i class="el-icon-dish"></i>
            </div>
            <div class="card-content">
              <div class="stat-number">{{ stats.hotTop10?.length || 0 }}</div>
              <div class="stat-label">热销菜品数</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
    
    <div class="hot-foods-section">
      <h3>热销菜品TOP10</h3>
      <el-table :data="stats.hotTop10" stripe style="width: 100%">
        <el-table-column type="index" label="#" width="50"></el-table-column>
        <el-table-column prop="name" label="菜品名称" width="200"></el-table-column>
        <el-table-column prop="categoryName" label="分类" width="120"></el-table-column>
        <el-table-column prop="orderCount" label="销量" width="100"></el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template slot-scope="scope">¥{{ scope.row.price }}</template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Statistics',
  data() {
    return {
      stats: {
        totalOrders: 0,
        totalSales: 0,
        hotTop10: []
      }
    }
  },
    created() {
    this.fetchStats()
  },
  methods: {
    async fetchStats() {
      try {
        const res = await this.$axios.get('/admin/stat')
        if (res.data.code === 200) {
          this.stats = res.data.data || {
            totalOrders: 0,
            totalSales: 0,
            hotTop10: []
          }
        } else {
          this.$message.error(res.data.msg || '获取统计数据失败')
        }
      } catch (e) {
        this.$message.error('网络错误，请重试')
      }
    },
  }
}
</script>

<style scoped>
.statistics-page {
  padding: 40px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
}

.page-header {
  margin-bottom: 32px;
}

.page-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #1d1d1f;
}

.stats-overview {
  margin-bottom: 48px;
}

.stat-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  height: 120px;
  border: 1px solid rgba(0, 0, 0, 0.02);
  transition: transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
}

.card-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 32px;
  margin-right: 24px;
}

.bg-blue {
  background: #0071e3;
}

.bg-green {
  background: #34c759;
}

.bg-orange {
  background: #ff9f0a;
}

.card-content {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 4px;
  letter-spacing: -1px;
}

.stat-label {
  font-size: 15px;
  font-weight: 500;
  color: #86868b;
}

.hot-foods-section {
  margin-bottom: 30px;
}

.hot-foods-section h3 {
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.5px;
}

/* 表格全局覆写 */
.statistics-page >>> .el-table {
  border-radius: 16px;
  overflow: hidden;
}

.statistics-page >>> .el-table th, .statistics-page >>> .el-table tr {
  background-color: transparent !important;
}

.statistics-page >>> .el-table th {
  background-color: #f5f5f7 !important;
  color: #86868b;
  font-weight: 600;
  border-bottom: none !important;
  padding: 16px 0;
}

.statistics-page >>> .el-table td {
  border-bottom: 1px solid rgba(0, 0, 0, 0.04) !important;
  padding: 16px 0;
  color: #1d1d1f;
}

.statistics-page >>> .el-table::before {
  display: none;
}

.statistics-page >>> .el-table--striped .el-table__body tr.el-table__row--striped td {
  background: rgba(0, 0, 0, 0.01) !important;
}
</style>
