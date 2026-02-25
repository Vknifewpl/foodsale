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
              <div class="stat-number">{{ stats.hotFoods?.length || 0 }}</div>
              <div class="stat-label">热销菜品数</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
    
    <div class="hot-foods-section">
      <h3>热销菜品TOP10</h3>
      <el-table :data="stats.hotFoods" stripe style="width: 100%">
        <el-table-column type="index" label="#" width="50"></el-table-column>
        <el-table-column prop="name" label="菜品名称" width="200"></el-table-column>
        <el-table-column prop="categoryName" label="分类" width="120"></el-table-column>
        <el-table-column prop="orderCount" label="销量" width="100"></el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template slot-scope="scope">¥{{ scope.row.price }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button size="mini" type="text" @click="viewFoodDetail(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <div class="charts-section">
      <h3>销售趋势图</h3>
      <div id="sales-chart" style="height: 400px;"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'Statistics',
  data() {
    return {
      stats: {
        totalOrders: 0,
        totalSales: 0,
        hotFoods: []
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
            hotFoods: []
          }
        } else {
          this.$message.error(res.data.msg || '获取统计数据失败')
        }
      } catch (e) {
        this.$message.error('网络错误，请重试')
      }
    },
    viewFoodDetail(food) {
      this.$message.info(`菜品名称: ${food.name}\n分类: ${food.categoryName}\n销量: ${food.orderCount}\n价格: ¥${food.price}`)
    }
  }
}
</script>

<style scoped>
.statistics-page {
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

.stats-overview {
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  height: 100px;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  margin-right: 15px;
}

.bg-blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.bg-green {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.bg-orange {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.card-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #999;
}

.hot-foods-section {
  margin-bottom: 30px;
}

.hot-foods-section h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #333;
}

.charts-section h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #333;
}
</style>
