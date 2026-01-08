<template>
	<view class="productSort copy-data" :style="{ height: pageHeight }">
		<!-- 搜索框 -->
		<view class="header acea-row row-center-wrapper">
			<view class="acea-row row-between-wrapper input">
				<text class="iconfont icon-sousuo"></text>
				<input
					type="text"
					:placeholder="$t('搜索商品名称')"
					@confirm="searchSubmitValue"
					confirm-type="search"
					name="search"
					placeholder-class="placeholder"
				/>
			</view>
		</view>

		<!-- 顶部一级分类横向滚动导航 -->
		<view class="top-category-nav">
			<scroll-view scroll-x="true" class="category-scroll" :scroll-into-view="scrollIntoView">
				<view class="category-list">
					<view
						v-for="(item, index) in productList"
						:key="index"
						:id="'cat-' + index"
						class="category-item"
						:class="{ active: navActive === index }"
						@click="switchCategory(index)"
					>
						<view class="category-icon">
							<image
								v-if="item.pic"
								:src="item.pic"
								mode="aspectFill"
							/>
							<text v-else class="iconfont icon-shangpinzhongxin"></text>
						</view>
						<view class="category-name">{{ $t(item.cate_name) }}</view>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 二级分类纯文字列表 -->
		<view class="subcategory-container">
			<scroll-view scroll-y="true" class="subcategory-scroll" style="height: 100%">
				<!-- 全部商品入口 -->
				<view class="subcategory-section" v-if="currentCategory">
					<navigator
						hover-class="none"
						:url="'/pages/goods/goods_list/index?cid=' + currentCategory.id + '&title=' + currentCategory.cate_name"
						class="subcategory-item all-products"
					>
						<text class="item-name">{{ $t('全部') }}{{ $t(currentCategory.cate_name) }}</text>
						<text class="iconfont icon-jiantou"></text>
					</navigator>
				</view>

				<!--
					TODO: 拼音首字母分组功能（暂缓实现）
					后续可在此处添加按拼音首字母分组的逻辑：
					1. 引入 pinyin 库或从后端获取拼音字段
					2. 将 children 按首字母分组
					3. 渲染分组标题如 [A]、[B]、[C] 等
					示例结构：
					<view v-for="group in groupedChildren" :key="group.letter">
						<view class="group-header">[{{ group.letter }}]</view>
						<view v-for="item in group.items">...</view>
					</view>
				-->

				<!-- 二级分类列表（当前为简单列表，未分组） -->
				<view class="subcategory-section" v-if="currentCategory && currentCategory.children">
					<navigator
						v-for="(child, childIndex) in currentCategory.children"
						:key="childIndex"
						hover-class="none"
						:url="'/pages/goods/goods_list/index?sid=' + child.id + '&title=' + child.cate_name"
						class="subcategory-item"
					>
						<text class="item-name">{{ $t(child.cate_name) }}</text>
						<text class="iconfont icon-jiantou"></text>
					</navigator>
				</view>

				<!-- 无数据提示 -->
				<view class="empty-tip" v-if="currentCategory && (!currentCategory.children || currentCategory.children.length === 0)">
					<text>{{ $t('暂无子分类') }}</text>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
import { getCategoryList } from '@/api/store.js';
import { mapState } from 'vuex';

const app = getApp();

export default {
	name: 'goodsCate4',
	props: {
		isNew: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			productList: [], // 一级分类列表
			navActive: 0, // 当前选中的一级分类索引
			scrollIntoView: '', // 滚动定位
			pageHeight: '100%'
		};
	},
	computed: {
		...mapState({
			cartNum: (state) => state.indexData.cartNum
		}),
		// 当前选中的一级分类
		currentCategory() {
			return this.productList[this.navActive] || null;
		}
	},
	mounted() {
		let that = this;
		// #ifdef H5
		uni.getSystemInfo({
			success: function (res) {
				that.pageHeight = res.windowHeight + 'px';
			}
		});
		// #endif
		// #ifdef APP-PLUS
		this.pageHeight = app.globalData.windowHeight;
		// #endif

		this.getAllCategory();

		// 监听分类数据更新事件
		uni.$on('uploadCatData', () => {
			this.getAllCategory();
		});
	},
	beforeDestroy() {
		uni.$off('uploadCatData');
	},
	methods: {
		// 获取分类数据
		getAllCategory() {
			let that = this;
			const cachedData = uni.getStorageSync('CAT4_DATA');

			if (!cachedData) {
				getCategoryList().then((res) => {
					uni.setStorageSync('CAT4_DATA', res.data);
					that.productList = res.data;
				});
			} else {
				that.productList = cachedData;
			}
		},

		// 切换一级分类
		switchCategory(index) {
			this.navActive = index;
			this.scrollIntoView = 'cat-' + index;
		},

		// 搜索提交
		searchSubmitValue(e) {
			if (this.$util.trim(e.detail.value).length > 0) {
				uni.navigateTo({
					url: '/pages/goods/goods_list/index?searchValue=' + e.detail.value
				});
			} else {
				return this.$util.Tips({
					title: this.$t('搜索商品名称')
				});
			}
		}

		/*
		 * TODO: 拼音分组功能（暂缓实现）
		 *
		 * // 按拼音首字母分组
		 * groupByPinyin(children) {
		 *     // 引入 pinyin 库: import pinyin from 'pinyin'
		 *     const groups = {};
		 *     children.forEach(item => {
		 *         const firstLetter = this.getFirstLetter(item.cate_name);
		 *         if (!groups[firstLetter]) {
		 *             groups[firstLetter] = [];
		 *         }
		 *         groups[firstLetter].push(item);
		 *     });
		 *
		 *     // 转换为数组并排序
		 *     return Object.keys(groups)
		 *         .sort()
		 *         .map(letter => ({
		 *             letter,
		 *             items: groups[letter]
		 *         }));
		 * },
		 *
		 * // 获取中文拼音首字母
		 * getFirstLetter(str) {
		 *     // 使用 pinyin 库获取首字母
		 *     // const py = pinyin(str, { style: pinyin.STYLE_FIRST_LETTER });
		 *     // return py[0][0].toUpperCase();
		 *     return str.charAt(0).toUpperCase();
		 * }
		 */
	}
};
</script>

<style scoped lang="scss">
.productSort {
	display: flex;
	flex-direction: column;
	background-color: #f7f7f7;

	// #ifdef MP
	height: calc(100vh - var(--window-top)) !important;
	// #endif
	// #ifndef MP
	height: 100vh;
	// #endif
}

/* 搜索框 */
.header {
	width: 100%;
	height: 96rpx;
	background-color: #fff;
	border-bottom: 1rpx solid #f5f5f5;
	flex-shrink: 0;

	.input {
		width: 700rpx;
		height: 60rpx;
		background-color: #f5f5f5;
		border-radius: 50rpx;
		box-sizing: border-box;
		padding: 0 25rpx;

		.iconfont {
			font-size: 35rpx;
			color: #555;
		}

		.placeholder {
			color: #999;
		}

		input {
			font-size: 26rpx;
			height: 100%;
			width: 597rpx;
		}
	}
}

/* 顶部一级分类横向滚动导航 */
.top-category-nav {
	width: 100%;
	background-color: #fff;
	border-bottom: 1rpx solid #eee;
	flex-shrink: 0;

	.category-scroll {
		width: 100%;
		white-space: nowrap;
	}

	.category-list {
		display: inline-flex;
		padding: 20rpx 10rpx;
	}

	.category-item {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		padding: 10rpx 25rpx;
		margin: 0 5rpx;
		border-radius: 12rpx;
		transition: all 0.2s;

		&.active {
			background-color: var(--view-theme-light-color, #fff5f5);

			.category-name {
				color: var(--view-theme, #e93323);
				font-weight: bold;
			}

			.category-icon {
				border-color: var(--view-theme, #e93323);
			}
		}

		.category-icon {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			overflow: hidden;
			display: flex;
			align-items: center;
			justify-content: center;
			background-color: #f8f8f8;
			border: 2rpx solid transparent;
			margin-bottom: 10rpx;

			image {
				width: 100%;
				height: 100%;
			}

			.iconfont {
				font-size: 40rpx;
				color: #666;
			}
		}

		.category-name {
			font-size: 24rpx;
			color: #333;
			max-width: 120rpx;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			text-align: center;
		}
	}
}

/* 二级分类纯文字列表 */
.subcategory-container {
	flex: 1;
	overflow: hidden;
	background-color: #fff;
	margin-top: 16rpx;

	.subcategory-scroll {
		height: 100%;
	}

	.subcategory-section {
		padding: 0 30rpx;
	}

	.subcategory-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx 0;
		border-bottom: 1rpx solid #f5f5f5;

		&.all-products {
			.item-name {
				font-weight: bold;
				color: var(--view-theme, #e93323);
			}
		}

		.item-name {
			font-size: 28rpx;
			color: #333;
			flex: 1;
		}

		.iconfont {
			font-size: 24rpx;
			color: #ccc;
		}

		&:active {
			background-color: #f9f9f9;
		}
	}

	/*
	 * TODO: 拼音分组样式（暂缓实现）
	 *
	 * .group-header {
	 *     padding: 20rpx 30rpx;
	 *     font-size: 26rpx;
	 *     color: #999;
	 *     background-color: #f7f7f7;
	 *     font-weight: bold;
	 * }
	 */
}

/* 空数据提示 */
.empty-tip {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 100rpx 0;
	color: #999;
	font-size: 28rpx;
}
</style>
