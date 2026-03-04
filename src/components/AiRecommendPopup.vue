<template>
  <transition name="ai-slide">
    <div class="ai-recommend-popup" v-if="visible">
      <div class="ai-card">
        <!-- 关闭按钮 -->
        <div class="close-btn" @click="close">
          <i class="el-icon-close"></i>
        </div>

        <!-- AI头像与标题 -->
        <div class="ai-header">
          <div class="ai-avatar">
            <span>AI</span>
          </div>
          <div class="ai-title">智能助手推荐</div>
        </div>

        <!-- 推荐内容 -->
        <div class="ai-body" v-if="food">
          <div class="recommend-food">
            <img :src="getImageUrl(food.image)" :alt="food.name" class="food-img" />
            <div class="food-detail">
              <div class="food-name">{{ food.name }}</div>
              <div class="food-price">¥{{ food.price }}</div>
            </div>
          </div>
          <div class="ai-reason">{{ reason }}</div>
        </div>

        <!-- 操作按钮 -->
        <div class="ai-actions">
          <el-button size="small" round @click="close">不了，谢谢</el-button>
          <el-button size="small" round type="primary" @click="accept">
            <i class="el-icon-shopping-cart-2"></i> 加入购物车
          </el-button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'AiRecommendPopup',
  props: {
    visible: { type: Boolean, default: false },
    food: { type: Object, default: null },
    reason: { type: String, default: '' }
  },
  methods: {
    close() {
      this.$emit('update:visible', false)
    },
    accept() {
      this.$emit('accept', this.food)
      this.$emit('update:visible', false)
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
.ai-recommend-popup {
  position: fixed;
  bottom: 100px;
  right: 32px;
  z-index: 2000;
}

.ai-card {
  width: 320px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  padding: 20px;
  position: relative;
  animation: ai-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes ai-bounce {
  0% { transform: translateY(30px) scale(0.9); opacity: 0; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #86868b;
  border-radius: 50%;
  transition: all 0.2s;
}
.close-btn:hover {
  background: #f5f5f7;
  color: #1d1d1f;
}

.ai-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.ai-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  margin-right: 10px;
  flex-shrink: 0;
}

.ai-title {
  font-size: 15px;
  font-weight: 700;
  color: #1d1d1f;
}

.recommend-food {
  display: flex;
  align-items: center;
  background: #f5f5f7;
  border-radius: 14px;
  padding: 12px;
  margin-bottom: 12px;
}

.food-img {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  object-fit: cover;
  margin-right: 12px;
  flex-shrink: 0;
}

.food-detail {
  flex: 1;
}

.food-name {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.food-price {
  font-size: 16px;
  font-weight: 700;
  color: #ff6723;
}

.ai-reason {
  font-size: 14px;
  color: #6366f1;
  line-height: 1.5;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: rgba(99, 102, 241, 0.06);
  border-radius: 10px;
  border-left: 3px solid #6366f1;
}

.ai-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.ai-actions >>> .el-button--primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
}
.ai-actions >>> .el-button--primary:hover {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
}

/* 进出动画 */
.ai-slide-enter-active {
  animation: ai-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.ai-slide-leave-active {
  animation: ai-bounce 0.3s ease reverse;
}
</style>
