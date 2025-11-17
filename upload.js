// 数据上传页面逻辑
const UploadPage = {
    init() {
        this.bindEvents();
        this.loadUploadedData();
    },

    bindEvents() {
        // 表单提交
        document.getElementById('uploadForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // 文件上传处理
        document.getElementById('frequencyFile').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0], 'frequencyData');
        });

        document.getElementById('thdFile').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0], 'thdData');
        });

        document.getElementById('rnbFile').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0], 'rnbData');
        });
    },

    handleFileUpload(file, targetTextareaId) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            document.getElementById(targetTextareaId).value = content;
        };
        reader.readAsText(file);
    },

    handleSubmit() {
        const brand = document.getElementById('brandInput').value.trim();
        const model = document.getElementById('modelInput').value.trim();
        const type = document.getElementById('typeInput').value;

        if (!brand || !model) {
            this.showMessage('请填写品牌和型号', 'error');
            return;
        }

        // 解析数据
        const frequencyData = this.parseTextareaData('frequencyData');
        const thdData = this.parseTextareaData('thdData');
        const rnbData = this.parseTextareaData('rnbData');

        if (frequencyData.length === 0) {
            this.showMessage('请至少输入频响数据', 'error');
            return;
        }

        // 构建数据对象
        const headphoneData = {
            brand,
            model,
            type,
            frequencyResponse: frequencyData,
            thd: thdData,
            rnb: rnbData
        };

        try {
            // 保存数据
            DataManager.add(headphoneData);
            this.showMessage(`成功上传 ${brand} ${model} 的数据!`, 'success');

            // 重置表单
            document.getElementById('uploadForm').reset();

            // 清空文件输入
            document.getElementById('frequencyFile').value = '';
            document.getElementById('thdFile').value = '';
            document.getElementById('rnbFile').value = '';

            // 刷新已上传列表
            this.loadUploadedData();
        } catch (error) {
            this.showMessage('上传失败: ' + error.message, 'error');
        }
    },

    parseTextareaData(textareaId) {
        const textarea = document.getElementById(textareaId);
        const text = textarea.value.trim();

        if (!text) return [];

        return DataManager.parseCSV(text);
    },

    showMessage(text, type) {
        const messageDiv = document.getElementById('uploadMessage');
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;

        // 3秒后自动隐藏
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    },

    loadUploadedData() {
        const container = document.getElementById('uploadedList');
        const allData = DataManager.getAllData();

        if (allData.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">暂无已上传的数据</p>';
            return;
        }

        container.innerHTML = '';

        allData.forEach(headphone => {
            const item = document.createElement('div');
            item.className = 'uploaded-item';

            const hasFreq = headphone.frequencyResponse && headphone.frequencyResponse.length > 0;
            const hasThd = headphone.thd && headphone.thd.length > 0;
            const hasRnb = headphone.rnb && headphone.rnb.length > 0;

            item.innerHTML = `
                <h4>${headphone.brand} ${headphone.model}</h4>
                <p>类型: ${this.getTypeDisplayName(headphone.type)}</p>
                <p>数据: ${hasFreq ? '✅ 频响' : '❌ 频响'} | ${hasThd ? '✅ THD' : '❌ THD'} | ${hasRnb ? '✅ R&B' : '❌ R&B'}</p>
                <button class="delete-btn" data-id="${headphone.id}">🗑</button>
            `;

            const deleteBtn = item.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => this.deleteData(headphone.id));

            container.appendChild(item);
        });
    },

    getTypeDisplayName(type) {
        const typeMap = {
            'over-ear': '头戴式',
            'in-ear': '入耳式',
            'on-ear': '耳挂式'
        };
        return typeMap[type] || type;
    },

    deleteData(id) {
        if (confirm('确定要删除这条数据吗?')) {
            DataManager.delete(id);
            this.showMessage('删除成功', 'success');
            this.loadUploadedData();
        }
    }
};

// 初始化上传页面
document.addEventListener('DOMContentLoaded', () => {
    UploadPage.init();
});
