<template>
  <div>
    <div class="toolbar">
      <div class="search-area">
        <el-input
          v-model="keyword"
          placeholder="搜索菜品"
          clearable
          @input="handleFilterChange"
          style="width: 220px"
        />
        <el-select
          v-model="foodIdFilter"
          placeholder="选择菜品"
          clearable
          filterable
          @change="handleFilterChange"
          style="width: 220px"
        >
          <el-option v-for="f in foodOptions" :key="f.id" :label="f.name" :value="f.id" />
        </el-select>
      </div>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="username" label="用户名称" width="140" />
      <el-table-column prop="foodName" label="菜品名称" width="160" />
      <el-table-column prop="content" label="评论内容" show-overflow-tooltip />
      <el-table-column label="评分" width="180">
        <template #default="{ row }">
          <el-rate :value="Number(row.rating) || 0" disabled :max="5" text-color="#ff9500" />
          <span class="rating-number">{{ Number(row.rating) || 0 }}分</span>
        </template>
      </el-table-column>
      <el-table-column label="评论时间" width="190">
        <template #default="{ row }">
          {{ formatTime(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button size="mini" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="pagination"
      :current-page="page"
      :page-size="size"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="(p) => { page = p; loadData() }"
    />
  </div>
</template>

<script>
export default {
  name: 'SuperCommentManage',
  data() {
    return {
      keyword: '',
      foodIdFilter: null,
      loading: false,
      tableData: [],
      page: 1,
      size: 10,
      total: 0,
      foodOptions: []
    }
  },
  created() {
    this.loadFoods()
    this.loadData()
  },
  methods: {
    handleFilterChange() {
      this.page = 1
      this.loadData()
    },
    async loadFoods() {
      try {
        const { data } = await this.$axios.get('/food/list')
        if (data.code === 200) {
          this.foodOptions = data.data || []
        }
      } catch (e) {
        this.foodOptions = []
      }
    },
    async loadData() {
      this.loading = true
      try {
        const params = { page: this.page, size: this.size }
        if (this.keyword) params.keyword = this.keyword
        if (this.foodIdFilter) params.foodId = this.foodIdFilter
        const { data } = await this.$axios.get('/super/comments', { params })
        if (data.code === 200) {
          this.tableData = data.data.records || []
          this.total = data.data.total || 0
        } else {
          this.$message.error(data.msg || '加载评论失败')
        }
      } catch (e) {
        this.$message.error('加载评论失败')
      } finally {
        this.loading = false
      }
    },
    formatTime(value) {
      if (!value) return '-'
      const d = new Date(value)
      if (Number.isNaN(d.getTime())) {
        return String(value).replace('T', '-').replace(' ', '-')
      }
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    },
    handleDelete(row) {
      this.$confirm('确定删除该评论吗？', '警告', { type: 'warning' }).then(async () => {
        const { data } = await this.$axios.delete(`/super/comments/${row.id}`)
        if (data.code === 200) {
          this.$message.success('删除成功')
          this.loadData()
        } else {
          this.$message.error(data.msg)
        }
      }).catch(() => {}).finally(() => {
        this.$nextTick(() => {
          const active = document.activeElement
          if (active && typeof active.blur === 'function') active.blur()
        })
      })
    }
  }
}
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.search-area { display: flex; gap: 12px; }
.pagination { margin-top: 20px; text-align: right; }
.rating-number { margin-left: 8px; color: #999; font-size: 12px; }
</style>