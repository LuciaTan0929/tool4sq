# GitHub Pages 部署指南

## 📦 静态网站部署

本项目现已配置为静态网站，可以直接部署到 GitHub Pages。

## 🚀 启用 GitHub Pages

### 步骤1：访问仓库设置

1. 打开你的GitHub仓库：https://github.com/LuciaTan0929/tool4sq
2. 点击 **Settings**（设置）标签页
3. 在左侧菜单找到 **Pages**

### 步骤2：配置GitHub Pages

在 **GitHub Pages** 页面：

1. **Source（来源）**：
   - 选择：**Deploy from a branch**

2. **Branch（分支）**：
   - 分支：选择 `main`
   - 文件夹：选择 `/ (root)`

3. 点击 **Save**（保存）

### 步骤3：等待部署完成

- GitHub会自动构建并部署网站
- 大约1-2分钟后，页面会显示网站URL
- 网站地址格式：`https://luciatan0929.github.io/tool4sq/`

## 📝 更新耳机数据

### 方法：直接在GitHub上编辑

1. 访问：https://github.com/LuciaTan0929/tool4sq/blob/main/headphone_data.json
2. 点击右上角的 **铅笔图标**（Edit this file）
3. 编辑JSON数据：
   - 添加新耳机
   - 修改现有数据
   - 删除耳机
4. 点击 **Commit changes**（提交更改）
5. 填写提交说明，点击 **Commit changes**

**数据会在1-2分钟后自动更新到网站！**

## 📊 数据格式

```json
{
  "id": "unique-id",
  "brand": "品牌名",
  "model": "型号",
  "type": "over-ear|in-ear|on-ear",
  "frequencyResponse": [[20, -2], [30, -1], ...],
  "thd": [[20, 0.5], [30, 0.4], ...],
  "rnb": [[20, 75], [30, 78], ...]
}
```

## ✨ 功能说明

### 用户功能
- ✅ 搜索耳机（按品牌或型号）
- ✅ 选择多款耳机对比
- ✅ 查看频响曲线、THD、R&B图表
- ✅ 对比目标曲线（哈曼、IEF等）
- ✅ 调整坐标轴范围

### 数据管理（仅你）
- ✅ 在GitHub上直接编辑JSON文件
- ✅ 更改自动同步到网站
- ✅ 完整的版本控制历史

## 🔧 本地测试

如果要在本地测试：

```bash
# 使用Python的简单HTTP服务器
python -m http.server 8000

# 或使用Node.js
npx http-server -p 8000
```

然后访问：http://localhost:8000

## 📱 分享网站

网站部署后，你可以把URL分享给任何人：
```
https://luciatan0929.github.io/tool4sq/
```

任何人都可以访问和使用，但只有你可以修改数据！

## ⚠️ 注意事项

1. **数据保存在Git历史中**：所有修改都有记录，可以随时回滚
2. **更新延迟**：修改数据后，网站更新需要1-2分钟
3. **浏览器缓存**：如果看不到更新，尝试刷新页面（Ctrl+F5）
