# 部署指南 - go.anker-launch.com

## 📦 部署准备

### 1. 所需文件清单

确保以下文件存在于项目根目录：

```
Tool4SQ/
├── app.py                  # Flask 应用主文件
├── requirements.txt        # Python 依赖
├── runtime.txt            # Python 版本声明
├── Procfile              # 进程启动配置
├── headphones_data.json  # 数据文件（可选）
├── templates/            # HTML 模板
│   ├── index.html
│   └── upload.html
└── static/              # 静态资源
    ├── css/
    │   └── style.css
    └── js/
        ├── data.js
        ├── main.js
        ├── mainExtensions.js
        ├── chartConfig.js
        ├── targetCurves.js
        └── upload.js
```

### 2. 打包为 ZIP 文件

#### Windows 方法：
1. 进入 `Tool4SQ` 文件夹
2. 选择以下文件和文件夹：
   - `app.py`
   - `requirements.txt`
   - `runtime.txt`
   - `Procfile`
   - `templates/` 文件夹
   - `static/` 文件夹
   - `headphones_data.json`（如果存在）
3. 右键 → 发送到 → 压缩(zipped)文件夹
4. 命名为 `Tool4SQ.zip`

**⚠️ 重要**: 不要把整个 `Tool4SQ` 文件夹打包，而是打包文件夹**内部**的内容！

#### 命令行方法：
```bash
cd D:\Tool4SQ
powershell Compress-Archive -Path app.py,requirements.txt,runtime.txt,Procfile,templates,static,headphones_data.json -DestinationPath Tool4SQ.zip
```

### 3. 在 go.anker-launch.com 部署

1. 访问 https://go.anker-launch.com
2. 登录你的账号
3. 选择 **"上传应用"** 或 **"新建应用"**
4. 选择 **"Python"** 作为应用类型
5. 上传 `Tool4SQ.zip` 文件
6. 等待部署完成
7. 访问生成的 URL

### 4. 环境变量配置（可选）

如果平台支持，可以设置以下环境变量：

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | 5000 | 服务器端口（通常由平台自动设置）|
| `DEBUG` | False | 调试模式（生产环境建议 False）|
| `HOST` | 0.0.0.0 | 监听地址 |

## 🔧 本地测试

在部署前，建议本地测试：

```bash
cd D:\Tool4SQ

# 安装依赖
pip install -r requirements.txt

# 启动应用
python app.py
```

访问 http://127.0.0.1:5000 确认功能正常。

## 📋 部署后检查清单

- [ ] 访问首页能正常显示
- [ ] 搜索功能正常
- [ ] 图表显示正常
- [ ] 上传页面可访问
- [ ] 可以上传新数据
- [ ] 可以重命名耳机
- [ ] 坐标轴控制功能正常
- [ ] 原始数据切换功能正常

## ⚠️ 常见问题

### 问题 1: 部署后无法访问
**解决**: 检查 Procfile 文件内容是否正确：
```
web: gunicorn app:app --bind 0.0.0.0:$PORT
```

### 问题 2: 静态文件 404
**解决**: 确保 ZIP 文件包含完整的 `static/` 和 `templates/` 文件夹。

### 问题 3: 应用启动失败
**解决**:
1. 检查 `requirements.txt` 是否包含所有依赖
2. 检查 `runtime.txt` Python 版本是否支持
3. 查看平台的部署日志

### 问题 4: 数据无法保存
**说明**: 应用会在启动时检查 `headphones_data.json` 文件：
- 如果文件不存在，会自动创建示例数据
- 生产环境中，数据会保存到容器文件系统（重启后可能丢失）
- 建议定期导出备份重要数据

## 🔄 更新部署

如需更新应用：
1. 修改本地代码
2. 重新打包 ZIP 文件
3. 在 go.anker-launch.com 重新上传
4. 等待重新部署完成

## 📞 技术支持

如遇到问题，请检查：
1. ZIP 文件结构是否正确
2. 所有依赖文件是否齐全
3. Python 版本是否兼容
4. go.anker-launch.com 平台文档
