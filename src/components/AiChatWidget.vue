<template>
  <div class="ai-chat-widget">
    <!-- 可拖拽悬浮图标 -->
    <div class="chat-fab-wrapper"
         :style="fabStyle"
         @mousedown="startDrag"
         @touchstart.prevent="startDrag"
         @selectstart.prevent>
      <!-- 气泡提示 -->
      <transition name="bubble-fade">
        <div class="bubble-tip" v-if="showBubble && !chatOpen" @click="openChat">
          <span>{{ currentTip }}</span>
          <div class="bubble-arrow"></div>
        </div>
      </transition>
      <!-- 图标按钮 -->
      <div class="chat-fab" @click="handleFabClick" :class="{ active: chatOpen }">
        <img v-if="!chatOpen" src="@/assets/ai-chef.png" alt="AI助手" class="fab-img" @dragstart.prevent />
        <i v-else class="el-icon-close"></i>
      </div>
    </div>

    <!-- 聊天窗口 -->
    <transition name="chat-pop">
      <div class="chat-window" v-show="chatOpen">
        <div class="chat-header">
          <div class="header-left">
            <img src="@/assets/ai-chef.png" alt="AI" class="header-avatar" />
            <div>
              <div class="header-name">智味助手</div>
              <div class="header-sub">AI 点餐推荐</div>
            </div>
          </div>
          <div class="header-close" @click="chatOpen = false">
            <i class="el-icon-close"></i>
          </div>
        </div>

        <div class="chat-messages" ref="msgContainer">
          <div v-for="(msg, idx) in messages" :key="idx"
               class="msg-row" :class="msg.role">
            <!-- AI消息 -->
            <template v-if="msg.role === 'ai'">
              <img src="@/assets/ai-chef.png" alt="AI" class="msg-avatar" />
              <div class="msg-bubble ai-bubble">
                <div class="msg-text">{{ msg.text }}</div>
                <!-- 推荐卡片 -->
                <div class="recommend-card" v-if="msg.food && !msg.dismissed">
                  <img :src="getImageUrl(msg.food.image)" class="rc-img" />
                  <div class="rc-info">
                    <div class="rc-name">{{ msg.food.name }}</div>
                    <div class="rc-price">¥{{ msg.food.price }}</div>
                  </div>
                  <div class="rc-actions">
                    <div class="rc-add" @click="addFoodToCart(msg.food)">
                      <i class="el-icon-shopping-cart-2"></i> 加购
                    </div>
                    <div class="rc-dismiss" @click="dismissFood(idx)">不要</div>
                  </div>
                </div>
              </div>
            </template>
            <!-- 用户消息 -->
            <template v-else>
              <div class="msg-bubble user-bubble">{{ msg.text }}</div>
            </template>
          </div>
          <!-- AI正在输入 -->
          <div class="msg-row ai" v-if="aiTyping">
            <img src="@/assets/ai-chef.png" alt="AI" class="msg-avatar" />
            <div class="msg-bubble ai-bubble typing">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>
          </div>
        </div>

        <div class="chat-input">
          <el-input
            v-model="inputText"
            placeholder="想吃什么？问问AI..."
            @keyup.enter.native="sendMessage"
            :disabled="aiTyping"
            size="small"
          ></el-input>
          <div class="send-btn" @click="sendMessage" :class="{ disabled: aiTyping || !inputText.trim() }">
            <i class="el-icon-position"></i>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'AiChatWidget',
  props: {
    allFoods: { type: Array, default: () => [] }
  },
  data() {
    return {
      chatOpen: false,
      inputText: '',
      aiTyping: false,
      messages: [
        { role: 'ai', text: '你好呀！我是智味助手 🍽️ 告诉我你想吃什么口味，我来帮你推荐搭配～', food: null }
      ],
      // 拖拽相关
      fabX: window.innerWidth - 88,
      fabY: window.innerHeight - 88,
      dragging: false,
      hasMoved: false,
      dragOffsetX: 0,
      dragOffsetY: 0,
      // 气泡提示相关
      showBubble: false,
      bubbleTimer: null,
      currentTip: '',
      tips: [
        '不知道吃啥？来问我吧！',
        '今天想尝点新口味吗？',
        '让我帮你搭配一顿美餐～',
        '点我聊聊，推荐好菜给你！',
        '选择困难？交给AI就好～'
      ],
      tipIndex: 0
    }
  },
  computed: {
    fabStyle() {
      return {
        left: this.fabX + 'px',
        top: this.fabY + 'px',
        transition: this.dragging ? 'none' : 'left 0.3s ease'
      }
    }
  },
  mounted() {
    // 初始位置：右下角
    this.fabX = window.innerWidth - 88
    this.fabY = window.innerHeight - 120
    // 启动气泡定时器
    this.startBubbleTimer()
    // 首次3秒后显示
    setTimeout(() => this.showTipBubble(), 3000)
  },
  beforeDestroy() {
    if (this.bubbleTimer) clearInterval(this.bubbleTimer)
  },
  methods: {
    // ---- 拖拽相关 ----
    startDrag(e) {
      this.dragging = true
      this.hasMoved = false
      const event = e.touches ? e.touches[0] : e
      this.dragOffsetX = event.clientX - this.fabX
      this.dragOffsetY = event.clientY - this.fabY

      document.addEventListener('mousemove', this.onDrag)
      document.addEventListener('mouseup', this.stopDrag)
      document.addEventListener('touchmove', this.onDrag)
      document.addEventListener('touchend', this.stopDrag)
    },
    onDrag(e) {
      if (!this.dragging) return
      const event = e.touches ? e.touches[0] : e
      const newX = event.clientX - this.dragOffsetX
      const newY = event.clientY - this.dragOffsetY
      // 检测是否真的移动了（超过5px视为拖拽)
      if (Math.abs(newX - this.fabX) > 5 || Math.abs(newY - this.fabY) > 5) {
        this.hasMoved = true
      }
      // 限制在窗口范围内
      this.fabX = Math.max(0, Math.min(window.innerWidth - 64, newX))
      this.fabY = Math.max(0, Math.min(window.innerHeight - 64, newY))
    },
    stopDrag() {
      this.dragging = false
      document.removeEventListener('mousemove', this.onDrag)
      document.removeEventListener('mouseup', this.stopDrag)
      document.removeEventListener('touchmove', this.onDrag)
      document.removeEventListener('touchend', this.stopDrag)
      // 松手后吸附到最近的左/右边缘
      if (this.hasMoved) {
        const mid = window.innerWidth / 2
        this.fabX = this.fabX + 30 < mid ? 8 : window.innerWidth - 72
      }
    },
    handleFabClick() {
      // 如果是拖拽行为则不触发点击
      if (this.hasMoved) return
      this.toggleChat()
    },

    // ---- 气泡提示 ----
    startBubbleTimer() {
      this.bubbleTimer = setInterval(() => {
        if (!this.chatOpen) {
          this.showTipBubble()
        }
      }, 30000)
    },
    showTipBubble() {
      this.currentTip = this.tips[this.tipIndex % this.tips.length]
      this.tipIndex++
      this.showBubble = true
      // 5秒后自动消失
      setTimeout(() => { this.showBubble = false }, 5000)
    },

    // ---- 聊天相关 ----
    toggleChat() {
      this.chatOpen = !this.chatOpen
      this.showBubble = false
      if (this.chatOpen) {
        this.$nextTick(() => this.scrollToBottom())
      }
    },
    openChat() {
      this.showBubble = false
      this.chatOpen = true
      this.$nextTick(() => this.scrollToBottom())
    },
    async sendMessage() {
      const text = this.inputText.trim()
      if (!text || this.aiTyping) return

      this.messages.push({ role: 'user', text })
      this.inputText = ''
      this.scrollToBottom()

      this.aiTyping = true
      try {
        const cartFoodIds = this.$store.state.cart.map(item => item.foodId)
        const { data } = await this.$axios.post('/ai/chat', {
          message: text,
          cartFoodIds
        })

        let aiReply = '抱歉，我没有听懂，再说一遍吧～'
        let recommendFood = null

        if (data.code === 200 && data.data) {
          aiReply = data.data.reply || aiReply
          const recId = data.data.recommendFoodId
          if (recId) {
            recommendFood = this.allFoods.find(f => f.id === recId) || null
          }
        }

        this.messages.push({ role: 'ai', text: aiReply, food: recommendFood })
      } catch (e) {
        this.messages.push({ role: 'ai', text: '网络开小差了，稍后再试试吧～', food: null })
      } finally {
        this.aiTyping = false
        this.scrollToBottom()
      }
    },
    addFoodToCart(food) {
      if (!food) return
      this.$store.dispatch('addToCart', {
        foodId: food.id,
        foodName: food.name,
        foodImage: food.image,
        price: food.price
      })
      this.$message.success(`已将「${food.name}」加入购物车`)
    },
    dismissFood(msgIndex) {
      this.$set(this.messages[msgIndex], 'dismissed', true)
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.msgContainer
        if (container) container.scrollTop = container.scrollHeight
      })
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
/* 悬浮图标容器（可拖拽） */
.chat-fab-wrapper {
  position: fixed;
  z-index: 2001;
  user-select: none;
}

/* 气泡提示 */
.bubble-tip {
  position: absolute;
  bottom: 72px;
  right: 0;
  background: #fff;
  color: #1d1d1f;
  font-size: 13px;
  font-weight: 500;
  padding: 10px 16px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  white-space: nowrap;
  cursor: pointer;
  animation: bubble-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.bubble-arrow {
  position: absolute;
  bottom: -6px;
  right: 20px;
  width: 12px;
  height: 12px;
  background: #fff;
  transform: rotate(45deg);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.06);
}
@keyframes bubble-bounce {
  0% { transform: translateY(8px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
.bubble-fade-enter-active { animation: bubble-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.bubble-fade-leave-active { transition: opacity 0.3s; }
.bubble-fade-leave-to { opacity: 0; }

/* 悬浮按钮 */
.chat-fab {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.3s, transform 0.2s;
  overflow: hidden;
}
.chat-fab:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}
.chat-fab:active {
  cursor: grabbing;
}
.chat-fab.active {
  background: #1d1d1f;
  color: #fff;
  font-size: 22px;
}
.fab-img {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  object-fit: cover;
}

/* 聊天窗口 */
.chat-window {
  position: fixed;
  bottom: 100px;
  right: 32px;
  width: 380px;
  height: 520px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 2000;
}

.chat-header {
  padding: 14px 18px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.header-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
}
.header-name {
  font-size: 15px;
  font-weight: 700;
}
.header-sub {
  font-size: 11px;
  opacity: 0.8;
}
.header-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}
.header-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 消息区域 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f9fafb;
}

.msg-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 14px;
}
.msg-row.user {
  justify-content: flex-end;
}

.msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-right: 8px;
  object-fit: cover;
}

.msg-bubble {
  max-width: 260px;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
}
.ai-bubble {
  background: #fff;
  color: #1d1d1f;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-top-left-radius: 4px;
}
.user-bubble {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border-top-right-radius: 4px;
}

/* 推荐卡片 */
.recommend-card {
  display: flex;
  align-items: center;
  background: #f5f3ff;
  border-radius: 12px;
  padding: 10px;
  margin-top: 10px;
}
.rc-img {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 10px;
}
.rc-info { flex: 1; }
.rc-name {
  font-size: 13px;
  font-weight: 600;
  color: #1d1d1f;
}
.rc-price {
  font-size: 14px;
  font-weight: 700;
  color: #6366f1;
}
.rc-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}
.rc-add {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
  white-space: nowrap;
  cursor: pointer;
}
.rc-add:hover { opacity: 0.85; }
.rc-dismiss {
  font-size: 12px;
  color: #86868b;
  text-align: center;
  cursor: pointer;
  padding: 2px 0;
}
.rc-dismiss:hover { color: #e30000; }

/* 打字动画 */
.typing {
  display: flex;
  gap: 4px;
  padding: 12px 18px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6366f1;
  animation: bounce 1.4s infinite ease-in-out;
}
.dot:nth-child(1) { animation-delay: 0s; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* 输入区域 */
.chat-input {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  gap: 8px;
}
.chat-input >>> .el-input__inner {
  border-radius: 20px;
  background: #f5f5f7;
  border: 1px solid transparent;
}
.chat-input >>> .el-input__inner:focus {
  border-color: #6366f1;
  background: #fff;
}
.send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  font-size: 16px;
  transition: all 0.2s;
}
.send-btn:hover { transform: scale(1.1); }
.send-btn.disabled {
  opacity: 0.4;
  pointer-events: none;
}

/* 动画 */
.chat-pop-enter-active {
  animation: pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.chat-pop-leave-active {
  animation: pop-in 0.25s ease reverse;
}
@keyframes pop-in {
  0% { transform: translateY(20px) scale(0.9); opacity: 0; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}
</style>
