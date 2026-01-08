<template>
	<view class="spec-selector" :style="colorStyle" v-if="attr.productAttr && attr.productAttr.length">
		<!-- 规格列表 -->
		<view class="spec-group" v-for="(item, indexw) in attr.productAttr" :key="indexw">
			<view class="spec-title">{{ $t(item.attr_name) }}</view>
			<view class="spec-list acea-row row-middle">
				<view
					class="spec-item"
					:class="{ 'on': item.index === itemn.attr }"
					v-for="(itemn, indexn) in item.attr_value"
					:key="indexn"
					@click="tapAttr(indexw, indexn)"
				>
					<image v-if="itemn.pic" class="spec-img" :src="itemn.pic" mode="aspectFill" />
					<text>{{ $t(itemn.attr) }}</text>
				</view>
			</view>
		</view>

		<!-- 数量选择器 -->
		<view class="spec-quantity acea-row row-between-wrapper" v-if="showQuantity">
			<view class="quantity-title">{{ $t(`数量`) }}</view>
			<view class="quantity-box acea-row row-middle">
				<text class="limit-tip" v-if="limitNum">{{ $t(`限购`) }}{{ limitNum }}{{ unitName }}</text>
				<text class="limit-tip" v-if="limitNum && minQty > 1"> | </text>
				<text class="limit-tip" v-if="minQty > 1">{{ $t(`起购`) }}{{ minQty }}{{ unitName }}</text>
				<view class="quantity-ctrl acea-row row-middle">
					<view
						class="quantity-btn minus"
						:class="{ 'disabled': attr.productSelect.cart_num <= minQty }"
						@click="handleCartNumDes"
					>
						<text class="iconfont icon-shangpinshuliang-jian"></text>
					</view>
					<input
						type="number"
						class="quantity-input"
						:value="attr.productSelect.cart_num"
						@input="handleInput"
						@blur="handleBlur"
					/>
					<view
						class="quantity-btn plus"
						:class="{ 'disabled': isMaxQuantity }"
						@click="handleCartNumAdd"
					>
						<text class="iconfont icon-shangpinshuliang-jia"></text>
					</view>
				</view>
			</view>
		</view>

		<!-- 选中规格信息展示 -->
		<view class="spec-info acea-row row-between-wrapper">
			<view class="selected-text">
				{{ $t(`已选`) }}：{{ selectedText }}
			</view>
			<view class="stock-text">
				{{ $t(`库存`) }}：{{ stockValue }}{{ unitName }}
			</view>
		</view>
	</view>
</template>

<script>
import colors from "@/mixins/color";

export default {
	name: 'SpecSelector',
	mixins: [colors],
	props: {
		attr: {
			type: Object,
			required: true,
			default: () => ({
				productAttr: [],
				productSelect: {}
			})
		},
		showQuantity: {
			type: Boolean,
			default: true
		},
		minQty: {
			type: Number,
			default: 1
		},
		limitNum: {
			type: Number,
			default: 0
		},
		unitName: {
			type: String,
			default: ''
		},
		// 活动类型：seckill, combination, presell, integral
		type: {
			type: String,
			default: ''
		}
	},
	computed: {
		// 已选规格文本
		selectedText() {
			if (!this.attr.productAttr || !this.attr.productAttr.length) {
				return this.$t('请选择');
			}
			const selected = this.attr.productAttr.map(item => item.index).filter(Boolean);
			return selected.length ? selected.join(',') : this.$t('请选择');
		},
		// 库存值（根据活动类型取不同字段）
		stockValue() {
			if (!this.attr.productSelect) return 0;
			if (this.type === 'seckill' || this.type === 'combination' || this.type === 'presell') {
				return this.attr.productSelect.quota || 0;
			}
			if (this.type === 'integral') {
				return this.attr.productSelect.stock || 0;
			}
			return this.attr.productSelect.stock || 0;
		},
		// 最大可购买数量
		maxQuantity() {
			let max = this.stockValue;
			if (this.limitNum && this.limitNum > 0) {
				max = Math.min(max, this.limitNum);
			}
			// 秒杀单次限购
			if (this.type === 'seckill' && this.attr.productSelect.once_num) {
				max = Math.min(max, this.attr.productSelect.once_num);
			}
			return max;
		},
		// 是否达到最大数量
		isMaxQuantity() {
			return this.attr.productSelect.cart_num >= this.maxQuantity;
		}
	},
	methods: {
		// 选择规格
		tapAttr(indexw, indexn) {
			this.$emit('attrVal', { indexw, indexn });
			this.$set(this.attr.productAttr[indexw], 'index', this.attr.productAttr[indexw].attr_values[indexn]);
			const value = this.getCheckedValue().join(',');
			this.$emit('ChangeAttr', value);
		},
		// 获取已选中的规格值
		getCheckedValue() {
			if (!this.attr.productAttr) return [];
			let value = [];
			for (let i = 0; i < this.attr.productAttr.length; i++) {
				for (let j = 0; j < this.attr.productAttr[i].attr_values.length; j++) {
					if (this.attr.productAttr[i].index === this.attr.productAttr[i].attr_values[j]) {
						value.push(this.attr.productAttr[i].attr_values[j]);
					}
				}
			}
			return value;
		},
		// 数量减少
		handleCartNumDes() {
			if (this.attr.productSelect.cart_num <= this.minQty) return;
			this.$emit('ChangeCartNum', false);
		},
		// 数量增加
		handleCartNumAdd() {
			if (this.isMaxQuantity) return;
			this.$emit('ChangeCartNum', true);
		},
		// 数量输入
		handleInput(e) {
			this.$emit('iptCartNum', e.detail.value);
		},
		// 输入框失焦时校验
		handleBlur(e) {
			let num = parseInt(e.detail.value) || this.minQty;
			num = Math.max(this.minQty, Math.min(num, this.maxQuantity));
			this.$emit('iptCartNum', num);
		}
	}
}
</script>

<style scoped lang="scss">
.spec-selector {
	background: #fff;
	padding: 30rpx;
	margin-top: 20rpx;
}

.spec-group {
	margin-bottom: 30rpx;

	&:last-of-type {
		margin-bottom: 0;
	}
}

.spec-title {
	font-size: 28rpx;
	color: #666;
	margin-bottom: 20rpx;
}

.spec-list {
	flex-wrap: wrap;
}

.spec-item {
	display: flex;
	align-items: center;
	padding: 14rpx 30rpx;
	margin: 0 20rpx 20rpx 0;
	background: #f5f5f5;
	border-radius: 8rpx;
	border: 2rpx solid transparent;
	font-size: 26rpx;
	color: #333;
	transition: all 0.2s;

	&.on {
		background: var(--view-minorColorT, rgba(232, 51, 35, 0.1));
		border-color: var(--view-theme, #e83323);
		color: var(--view-theme, #e83323);
	}

	&.disabled {
		background: #f5f5f5;
		color: #ccc;
		text-decoration: line-through;
		pointer-events: none;
	}
}

.spec-img {
	width: 40rpx;
	height: 40rpx;
	margin-right: 10rpx;
	border-radius: 4rpx;
}

.spec-quantity {
	padding: 30rpx 0;
	border-top: 1rpx solid #eee;
	margin-top: 10rpx;
}

.quantity-title {
	font-size: 28rpx;
	color: #666;
}

.quantity-box {
	flex: 1;
	justify-content: flex-end;
}

.limit-tip {
	font-size: 22rpx;
	color: #999;
	margin-right: 20rpx;
}

.quantity-ctrl {
	background: #f5f5f5;
	border-radius: 8rpx;
	overflow: hidden;
}

.quantity-btn {
	width: 60rpx;
	height: 54rpx;
	display: flex;
	align-items: center;
	justify-content: center;

	.iconfont {
		font-size: 24rpx;
		color: #333;
	}

	&.disabled {
		.iconfont {
			color: #ccc;
		}
	}
}

.quantity-input {
	width: 80rpx;
	height: 54rpx;
	text-align: center;
	font-size: 28rpx;
	background: #f5f5f5;
	border: none;
}

.spec-info {
	padding-top: 20rpx;
	border-top: 1rpx solid #eee;
	margin-top: 10rpx;
	font-size: 24rpx;
}

.selected-text {
	color: #333;
	flex: 1;
}

.stock-text {
	color: #999;
}
</style>
