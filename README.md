# 🎧 耳机音质对比工具

一个基于Flask的Web应用，用于快速便利地搜索、对比不同品牌不同型号耳机的音质性能参数。

## ✨ 功能特性

### 1. 搜索与对比功能
- 🔍 **智能搜索**: 通过品牌或型号快速查找耳机
- ✅ **多选对比**: 同时选择多款耳机进行对比
- 📊 **可视化图表**:
  - 频响曲线 (Frequency Response)
  - 总谐波失真 (THD)
  - R&B 参数
- 🎯 **目标曲线**: 支持与常见目标频响曲线对比
  - 哈曼曲线 (Harman Target)
  - IEF Target
  - 自由场 (Free Field)
  - 扩散场 (Diffuse Field)

### 2. 数据共创功能
- 📤 **数据上传**: 用户可上传自己测得的耳机数据
- 💾 **持久化存储**: 数据保存在服务器本地JSON文件
- 📋 **数据管理**: 查看和删除已上传的数据
- 📁 **专业格式支持**: 支持声学测试软件导出的制表符分隔格式
- ⚡ **批量上传**: 一个文件可包含多个耳机数据，自动识别并批量上传
- ✍️ **手动输入**: 也支持手动输入或CSV文件上传

## 🚀 快速开始

### 环境要求
- Python 3.7+
- pip

### 安装步骤

1. **克隆或下载项目到本地**
   ```bash
   cd D:\Tool4SQ
   ```

2. **安装依赖**
   ```bash
   pip install -r requirements.txt
   ```

3. **运行应用**
   ```bash
   python app.py
   ```

4. **访问应用**

   打开浏览器访问: http://127.0.0.1:5000

   你将看到如下输出:
   ```
   ============================================================
   🎧 耳机音质对比工具
   ============================================================
   服务器启动中...
   请在浏览器中访问: http://127.0.0.1:5000
   按 Ctrl+C 停止服务器
   ============================================================
   ```

## 📁 项目结构

```
Tool4SQ/
├── app.py                      # Flask主应用文件
├── requirements.txt            # Python依赖
├── headphone_data.json         # 数据存储文件（自动生成）
├── README.md                   # 项目说明文档
│
├── templates/                  # HTML模板
│   ├── index.html             # 主页 - 搜索对比
│   └── upload.html            # 数据上传页面
│
└── static/                     # 静态资源
    ├── css/
    │   └── style.css          # 样式文件
    └── js/
        ├── data.js            # 数据管理模块（API交互）
        ├── targetCurves.js    # 目标曲线数据
        ├── main.js            # 主应用逻辑
        └── upload.js          # 上传页面逻辑
```

## 📖 使用说明

### 搜索和对比耳机

1. 在主页搜索框输入品牌或型号（如: Sony, WH-1000XM5）
2. 点击耳机卡片将其添加到对比列表
3. 选择多款耳机后，点击"开始对比"
4. 查看频响、THD、R&B等参数的对比图表
5. 可选择勾选目标曲线进行参考对比

### 上传耳机数据

#### 方法一：专业格式快速上传（推荐）

1. 点击导航栏的"数据上传"
2. 在"快速上传"区域点击"📁 选择专业格式文件"
3. 选择声学测试软件导出的 .txt 文件
   - 支持单个耳机数据文件
   - **支持包含多个耳机的批量数据文件**
4. 点击"✅ 确认上传"
5. 系统自动识别并解析所有耳机数据
6. 显示上传报告，包括每个耳机的数据统计

**文件格式要求：**
- 制表符分隔的多列数据
- 第2行包含 `s/n:` 标识，后跟品牌和型号
- 包含 Response、THD、Rub & Buzz 三种参数
- 支持一个文件包含多个耳机（多组列）

#### 方法二：手动输入

1. 在"手动输入数据"区域填写
2. 输入品牌、型号和类型
3. 输入测量数据（频响、THD、R&B）
   - 手动输入格式: `频率(Hz),值`，每行一组
   - 或上传CSV文件
4. 点击"上传数据"保存
5. 数据将保存到服务器，可在主页搜索使用

### 数据格式示例

#### CSV格式（手动输入）
```csv
20,-5
30,-3
40,-2
50,0
100,2
200,3
500,1
1000,0
2000,1
5000,2
10000,-2
20000,-6
```

#### 专业格式示例
```
Comment: 	Comment: 		Comment: 	Comment:
Response Left s/n: sony xm6	20000	100	THD Left s/n: sony xm6	20	0	Rub & Buzz L s/n: sony xm6	20	0
	19000	88		21	0		21	0
	18000	99		22	0		22	0
...
```

#### 批量上传示例
一个文件包含多个耳机，每个耳机占据不同的列组：
```
Comment: 	...		Comment: 	...
Response Left s/n: sc3062	...	THD Left s/n: sc3062	...	Response Left s/n: sony xm6	...	THD Left s/n: sony xm6	...
```
系统会自动识别所有 `s/n:` 标识，并分别解析每个耳机的数据。

## 🎨 预置数据

应用包含以下示例耳机数据:
- Sony WH-1000XM5 (头戴式)
- Apple AirPods Pro 2 (入耳式)
- Sennheiser HD 800 S (头戴式)
- Bose QuietComfort 45 (头戴式)

## 🛠️ API接口

### 获取所有耳机
```
GET /api/headphones
GET /api/headphones?q=sony  # 搜索
```

### 获取单个耳机
```
GET /api/headphones/<id>
```

### 添加/更新耳机
```
POST /api/headphones
Content-Type: application/json

{
  "brand": "Sony",
  "model": "WH-1000XM5",
  "type": "over-ear",
  "frequencyResponse": [[20, -2], [30, -1], ...],
  "thd": [[20, 0.5], [30, 0.4], ...],
  "rnb": [[20, 75], [30, 78], ...]
}
```

### 删除耳机
```
DELETE /api/headphones/<id>
```

## 🔧 配置

### 修改端口
编辑 `app.py` 最后一行:
```python
app.run(debug=True, host='127.0.0.1', port=5000)  # 修改port参数
```

### 修改数据存储位置
编辑 `app.py` 中的 `DATA_FILE` 变量:
```python
DATA_FILE = 'headphone_data.json'  # 修改为你想要的路径
```

## 🎯 技术栈

- **后端**: Python Flask 3.0
- **前端**: 原生 JavaScript (ES6+)
- **图表**: Chart.js
- **样式**: 纯CSS（响应式设计）
- **数据存储**: JSON文件

## 📝 注意事项

1. **数据持久化**: 数据保存在`headphone_data.json`文件中，请勿删除
2. **浏览器兼容性**: 推荐使用现代浏览器（Chrome, Firefox, Edge）
3. **本地运行**: 仅在本地运行，不适合直接部署到生产环境
4. **数据安全**: 目前没有用户认证，请勿在公网环境使用

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可

MIT License

## 🔗 相关资源

- [Flask 文档](https://flask.palletsprojects.com/)
- [Chart.js 文档](https://www.chartjs.org/)
- [Harman Target Curve](https://www.soundguys.com/harman-target-curve-explained-25519/)

---

**Enjoy! 🎵**
