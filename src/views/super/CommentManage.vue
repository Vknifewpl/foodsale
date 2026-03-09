<template>
  <div>
    <div class="toolbar">
      <div class="search-area">
        <el-input v-model="keyword" placeholder="搜索评论内容" clearable @input="loadData" style="width: 220px" />
        <el-input v-model="foodIdFilter" placeholder="菜品ID筛选" clearable @input="loadData" style="width: 150px" type="number" />
      </div>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="userId" label="用户ID" width="90" />
      <el-table-column prop="foodId" label="菜品ID" width="90" />
      <el-table-column prop="content" label="评论内容" show-overflow-tooltip />
      <el-table-column label="评分" width="80">
        <template #default="{ row }">
          <el-rate :value="row.rating" disabled show-score text-color="#ff9500" score-template="{value}" />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="评论时间" width="180" />
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button size="mini" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination class="pagination" :current-page="page" :page-size="size" :total="total"
      layout="total, prev, pager, next" @current-change="(p) => { page = p; loadData() }" />
  </div>
</template>

<script>
export default {
  name: 'SuperCommentManage',
  data() {
    return {
      keyword: '', foodIdFilter: '', loading: false,
      tableData: [], page: 1, size: 10, total: 0
    }
  },
  created() { this.loadData() },
  methods: {
    async loadData() {
      this.loading = true
      const params = { page: this.page, size: this.size }
      if (this.keyword) params.keyword = this.keyword
      if (this.foodIdFilter) params.foodId = Number(this.foodIdFilter)
      const { data } = await this.$axios.get('/super/comments', { params })
      if (data.code === 200) { this.tableData = data.data.records; this.total = data.data.total }
      this.loading = false
    },
    handleDelete(row) {
      this.$confirm(`确定删除该评论吗？`, '警告', { type: 'warning' }).then(async () => {
        const { data } = await this.$axios.delete(`/super/comments/${row.id}`)
        if (data.code === 200) { this.$message.success('删除成功'); this.loadData() }
        else this.$message.error(data.msg)
      })
    }
  }
}
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.search-area { display: flex; gap: 12px; }
.pagination { margin-top: 20px; text-align: right; }
</style>
