<template>
  <div class="statistics-page">
    <div class="page-header">
      <h3>数据统计</h3>
    </div>
    
    <!-- 概览卡片 -->
    <div class="stats-overview">
      <el-row :gutter="20">
        <el-col :span="6">
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
        
        <el-col :span="6">
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
        
        <el-col :span="6">
          <div class="stat-card">
            <div class="card-icon bg-orange">
              <i class="el-icon-dish"></i>
            </div>
            <div class="card-content">
              <div class="stat-number">{{ totalFoods }}</div>
              <div class="stat-label">菜品总数</div>
            </div>
          </div>
        </el-col>

        <el-col :span="6">
          <div class="stat-card">
            <div class="card-icon bg-purple">
              <i class="el-icon-user"></i>
            </div>
            <div class="card-content">
              <div class="stat-number">{{ totalUsers }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
    
    <!-- ECharts 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="24">
        <!-- 菜品销量排行 -->
        <el-col :span="12">
          <div class="chart-card">
            <h4>🔥 爆款菜品 TOP10</h4>
            <div ref="hotChart" class="chart-container"></div>
          </div>
        </el-col>
        <!-- 冷门菜品 -->
        <el-col :span="12">
          <div class="chart-card">
            <h4>❄️ 冷门菜品 TOP10</h4>
            <div ref="coldChart" class="chart-container"></div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="24" style="margin-top: 24px;">
        <!-- 分类销量占比 -->
        <el-col :span="12">
          <div class="chart-card">
            <h4>📊 分类销量占比</h4>
            <div ref="categoryChart" class="chart-container"></div>
          </div>
        </el-col>
        <!-- 好评率排行 -->
        <el-col :span="12">
          <div class="chart-card">
            <h4>⭐ 菜品好评率 TOP10</h4>
            <div ref="praiseChart" class="chart-container"></div>
          </div>
        </el-col>
      </el-row>
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
        hotTop10: []
      },
      allFoods: [],
      totalUsers: 0,
      // ECharts 实例
      hotChartInstance: null,
      coldChartInstance: null,
      categoryChartInstance: null,
      praiseChartInstance: null
    }
  },
  computed: {
    totalFoods() {
      return this.allFoods.length
    }
  },
  created() {
    this.fetchAllData()
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    // 销毁图表实例，防止内存泄漏
    this.hotChartInstance?.dispose()
    this.coldChartInstance?.dispose()
    this.categoryChartInstance?.dispose()
    this.praiseChartInstance?.dispose()
  },
  methods: {
    async fetchAllData() {
      await Promise.all([
        this.fetchStats(),
        this.fetchFoods(),
        this.fetchUsers()
      ])
      this.$nextTick(() => {
        this.initCharts()
      })
    },
    async fetchStats() {
      try {
        const res = await this.$axios.get('/admin/stat')
        if (res.data.code === 200) {
          this.stats = res.data.data || { totalOrders: 0, totalSales: 0, hotTop10: [] }
        }
      } catch (e) {
        console.error('获取统计数据失败')
      }
    },
    async fetchFoods() {
      try {
        const res = await this.$axios.get('/food/list')
        if (res.data.code === 200) {
          this.allFoods = res.data.data || []
        }
      } catch (e) {
        console.error('获取菜品数据失败')
      }
    },
    async fetchUsers() {
      try {
        const res = await this.$axios.get('/admin/user/count')
        if (res.data.code === 200) {
          this.totalUsers = res.data.data || 0
        }
      } catch (e) {
        // 如果没有此接口，采用默认值
        this.totalUsers = '-'
      }
    },

    initCharts() {
      this.initHotChart()
      this.initColdChart()
      this.initCategoryChart()
      this.initPraiseChart()
    },

    /** 爆款菜品柱状图 */
    initHotChart() {
      const sorted = [...this.allFoods].sort((a, b) => b.orderCount - a.orderCount).slice(0, 10)
      const chart = echarts.init(this.$refs.hotChart)
      this.hotChartInstance = chart
      chart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: 80, right: 24, top: 16, bottom: 32 },
        xAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#eee' } } },
        yAxis: {
          type: 'category',
          data: sorted.map(f => f.name).reverse(),
          axisLabel: { fontSize: 13, color: '#1d1d1f' }
        },
        series: [{
          type: 'bar',
          data: sorted.map(f => f.orderCount).reverse(),
          barWidth: 18,
          itemStyle: {
            borderRadius: [0, 8, 8, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#ff9f0a' },
              { offset: 1, color: '#ff6723' }
            ])
          }
        }]
      })
    },

    /** 冷门菜品柱状图 */
    initColdChart() {
      const sorted = [...this.allFoods].sort((a, b) => a.orderCount - b.orderCount).slice(0, 10)
      const chart = echarts.init(this.$refs.coldChart)
      this.coldChartInstance = chart
      chart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: 80, right: 24, top: 16, bottom: 32 },
        xAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#eee' } } },
        yAxis: {
          type: 'category',
          data: sorted.map(f => f.name).reverse(),
          axisLabel: { fontSize: 13, color: '#1d1d1f' }
        },
        series: [{
          type: 'bar',
          data: sorted.map(f => f.orderCount).reverse(),
          barWidth: 18,
          itemStyle: {
            borderRadius: [0, 8, 8, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#64d2ff' },
              { offset: 1, color: '#0071e3' }
            ])
          }
        }]
      })
    },

    /** 分类销量占比饼图 */
    initCategoryChart() {
      // 按分类汇总销量
      const categoryMap = {}
      this.allFoods.forEach(f => {
        const name = f.categoryName || '未分类'
        categoryMap[name] = (categoryMap[name] || 0) + f.orderCount
      })
      const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

      const chart = echarts.init(this.$refs.categoryChart)
      this.categoryChartInstance = chart
      chart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c}单 ({d}%)' },
        legend: { bottom: 0, textStyle: { fontSize: 12, color: '#86868b' } },
        color: ['#0071e3', '#34c759', '#ff9f0a', '#ff453a', '#af52de', '#5ac8fa', '#ffcc00', '#ff6723'],
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 3 },
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 14, fontWeight: 'bold' }
          },
          data: pieData
        }]
      })
    },

    /** 好评率排行 */
    initPraiseChart() {
      const withRate = this.allFoods
        .filter(f => f.orderCount > 0)
        .map(f => ({
          name: f.name,
          rate: Math.round((f.praiseCount / f.orderCount) * 100)
        }))
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 10)

      const chart = echarts.init(this.$refs.praiseChart)
      this.praiseChartInstance = chart
      chart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}: {c}%' },
        grid: { left: 80, right: 40, top: 16, bottom: 32 },
        xAxis: { type: 'value', max: 100, splitLine: { lineStyle: { type: 'dashed', color: '#eee' } }, axisLabel: { formatter: '{value}%' } },
        yAxis: {
          type: 'category',
          data: withRate.map(f => f.name).reverse(),
          axisLabel: { fontSize: 13, color: '#1d1d1f' }
        },
        series: [{
          type: 'bar',
          data: withRate.map(f => f.rate).reverse(),
          barWidth: 18,
          itemStyle: {
            borderRadius: [0, 8, 8, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#34c759' },
              { offset: 1, color: '#30d158' }
            ])
          }
        }]
      })
    },

    handleResize() {
      this.hotChartInstance?.resize()
      this.coldChartInstance?.resize()
      this.categoryChartInstance?.resize()
      this.praiseChartInstance?.resize()
    }
  }
}
</script>

<style scoped>
.statistics-page {
  padding: 32px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #1d1d1f;
}

/* 概览卡片 */
.stats-overview {
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.02);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  margin-right: 16px;
  flex-shrink: 0;
}

.bg-blue { background: #0071e3; }
.bg-green { background: #34c759; }
.bg-orange { background: #ff9f0a; }
.bg-purple { background: #af52de; }

.card-content { flex: 1; }

.stat-number {
  font-size: 26px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.5px;
}

.stat-label {
  font-size: 13px;
  font-weight: 500;
  color: #86868b;
  margin-top: 2px;
}

/* ECharts 图表 */
.chart-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.02);
}

.chart-card h4 {
  margin: 0 0 16px 0;
  font-size: 17px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.3px;
}

.chart-container {
  width: 100%;
  height: 360px;
}
</style>
