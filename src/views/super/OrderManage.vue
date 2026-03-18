<template>
  <div>
    <div class="toolbar">
      <div class="search-area">
        <el-input v-model="keyword" placeholder="搜索订单号" clearable @input="loadData" style="width: 220px" />
        <el-select v-model="statusFilter" placeholder="状态筛选" clearable @change="loadData" style="width: 150px">
          <el-option label="待支付" :value="0" />
          <el-option label="已支付" :value="1" />
          <el-option label="已完成" :value="2" />
          <el-option label="申请退款" :value="3" />
          <el-option label="已退款" :value="4" />
        </el-select>
      </div>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="orderNo" label="订单号" width="200" />
      <el-table-column prop="userId" label="用户ID" width="90" />
      <el-table-column prop="totalAmount" label="金额(¥)" width="100" />
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="orderTime" label="下单时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-select v-model="row._newStatus" size="mini" style="width:110px" placeholder="修改状态">
            <el-option label="待支付" :value="0" />
            <el-option label="已支付" :value="1" />
            <el-option label="已完成" :value="2" />
            <el-option label="申请退款" :value="3" />
            <el-option label="已退款" :value="4" />
          </el-select>
          <el-button size="mini" type="primary" style="margin-left:6px" @click="updateStatus(row)">确定</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination class="pagination" :current-page="page" :page-size="size" :total="total"
      layout="total, prev, pager, next" @current-change="(p) => { page = p; loadData() }" />
  </div>
</template>

<script>
export default {
  name: 'SuperOrderManage',
  data() {
    return {
      keyword: '', statusFilter: null, loading: false,
      tableData: [], page: 1, size: 10, total: 0
    }
  },
  created() { this.loadData() },
  methods: {
    async loadData() {
      this.loading = true
      const params = { page: this.page, size: this.size }
      if (this.keyword) params.keyword = this.keyword
      if (this.statusFilter !== null && this.statusFilter !== '') params.status = this.statusFilter
      const { data } = await this.$axios.get('/super/orders', { params })
      if (data.code === 200) {
        this.tableData = data.data.records.map(o => ({ ...o, _newStatus: o.status }))
        this.total = data.data.total
      }
      this.loading = false
    },
    statusLabel(s) { return ['待支付','已支付','已完成','申请退款','已退款'][s] ?? '未知' },
    statusType(s) { return [' warning','success','','danger','info'][s] ?? '' },
    async updateStatus(row) {
      if (row._newStatus === null || row._newStatus === undefined) return
      const { data } = await this.$axios.put(`/super/orders/${row.orderNo}/status`, { status: row._newStatus })
      if (data.code === 200) { this.$message.success('状态已更新'); this.loadData() }
      else this.$message.error(data.msg)
    }
  }
}
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.search-area { display: flex; gap: 12px; }
.pagination { margin-top: 20px; text-align: right; }
</style>
