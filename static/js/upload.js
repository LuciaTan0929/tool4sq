// 数据上传页面逻辑
const UploadPage = {
    professionalFileContent: null,
    currentRenameId: null,

    init() {
        this.bindEvents();
        this.loadUploadedData();
    },

    bindEvents() {
        // 专业格式文件上传
        document.getElementById('professionalUploadBtn').addEventListener('click', () => {
            document.getElementById('professionalFile').click();
        });

        document.getElementById('professionalFile').addEventListener('change', (e) => {
            this.handleProfessionalFileSelect(e.target.files[0]);
        });

        document.getElementById('professionalSubmitBtn').addEventListener('click', () => {
            this.handleProfessionalSubmit();
        });

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

        // 重命名模态框
        const modal = document.getElementById('renameModal');
        const closeBtn = document.querySelector('.modal-close');
        const cancelBtn = document.getElementById('renameCancelBtn');
        const confirmBtn = document.getElementById('renameConfirmBtn');

        // 关闭模态框
        closeBtn.addEventListener('click', () => this.closeRenameModal());
        cancelBtn.addEventListener('click', () => this.closeRenameModal());

        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeRenameModal();
            }
        });

        // 确认重命名
        confirmBtn.addEventListener('click', () => this.confirmRename());

        // 按Enter键确认
        document.getElementById('renameModel').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.confirmRename();
            }
        });
    },

    handleProfessionalFileSelect(file) {
        if (!file) return;

        const fileNameDisplay = document.getElementById('professionalFileName');
        const submitBtn = document.getElementById('professionalSubmitBtn');
        const normalizationDiv = document.querySelector('.professional-normalization');

        fileNameDisplay.textContent = `已选择: ${file.name}`;
        submitBtn.style.display = 'block';
        normalizationDiv.style.display = 'block';

        const reader = new FileReader();
        reader.onload = (e) => {
            this.professionalFileContent = e.target.result;
        };
        reader.readAsText(file);
    },

    async handleProfessionalSubmit() {
        if (!this.professionalFileContent) {
            this.showProfessionalMessage('请先选择文件', 'error');
            return;
        }

        try {
            // 获取归一化选项
            const normalization = document.getElementById('professionalNormalization').value;

            // 使用专业格式解析器（获取原始数据）
            const parsedData = DataManager.parseProfessionalFormat(this.professionalFileContent, false); // false = 不自动归一化

            // 检测是单个耳机还是多个耳机
            const headphonesArray = Array.isArray(parsedData) ? parsedData : [parsedData];

            // 显示进度信息
            this.showProfessionalMessage(`开始上传 ${headphonesArray.length} 个耳机的数据...`, 'success');

            // 批量上传
            const uploadResults = [];
            for (const headphone of headphonesArray) {
                // 处理归一化
                let processedFreqData = headphone.frequencyResponse;
                let originalFreqData = null;

                if (normalization === 'normalize-keep' || normalization === 'normalize-only') {
                    originalFreqData = headphone.frequencyResponse; // 保存原始数据
                    processedFreqData = this.normalizeFrequencyData(headphone.frequencyResponse);

                    if (normalization === 'normalize-only') {
                        originalFreqData = null; // 不保留原始数据
                    }
                }

                // 添加类型（默认为头戴式）
                headphone.type = 'over-ear';
                headphone.frequencyResponse = processedFreqData;
                headphone.originalFrequencyResponse = originalFreqData;

                try {
                    await DataManager.add(headphone);
                    uploadResults.push({
                        success: true,
                        brand: headphone.brand,
                        model: headphone.model,
                        freqCount: headphone.frequencyResponse.length,
                        thdCount: headphone.thd.length,
                        rnbCount: headphone.rnb.length
                    });
                } catch (error) {
                    uploadResults.push({
                        success: false,
                        brand: headphone.brand,
                        model: headphone.model,
                        error: error.message
                    });
                }
            }

            // 生成上传报告
            const successCount = uploadResults.filter(r => r.success).length;
            const failCount = uploadResults.length - successCount;

            let reportMessage = `\n📊 上传完成: 成功 ${successCount} 个`;
            if (failCount > 0) {
                reportMessage += `, 失败 ${failCount} 个`;
            }
            reportMessage += '\n\n';

            uploadResults.forEach(result => {
                if (result.success) {
                    reportMessage += `✅ ${result.brand} ${result.model}: 频响(${result.freqCount}点), THD(${result.thdCount}点), R&B(${result.rnbCount}点)\n`;
                } else {
                    reportMessage += `❌ ${result.brand} ${result.model}: ${result.error}\n`;
                }
            });

            this.showProfessionalMessage(reportMessage, successCount > 0 ? 'success' : 'error');

            // 重置
            document.getElementById('professionalFile').value = '';
            document.getElementById('professionalFileName').textContent = '';
            document.getElementById('professionalSubmitBtn').style.display = 'none';
            this.professionalFileContent = null;

            // 刷新已上传列表
            this.loadUploadedData();

        } catch (error) {
            this.showProfessionalMessage('解析失败: ' + error.message, 'error');
            console.error('解析错误:', error);
        }
    },

    showProfessionalMessage(text, type) {
        const messageDiv = document.getElementById('professionalMessage');
        // 保留换行符
        messageDiv.innerHTML = text.replace(/\n/g, '<br>');
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';

        // 10秒后自动隐藏（批量上传内容较多，给更多时间阅读）
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 10000);
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

    async handleSubmit() {
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

        // 获取归一化选项
        const normalization = document.querySelector('input[name="normalization"]:checked').value;

        // 处理归一化
        let processedFreqData = frequencyData;
        let originalFreqData = null;

        if (normalization === 'normalize-keep' || normalization === 'normalize-only') {
            // 归一化数据
            processedFreqData = this.normalizeFrequencyData(frequencyData);

            if (normalization === 'normalize-keep') {
                // 保留原始数据
                originalFreqData = frequencyData;
            }
        }
        // 如果是 no-normalize，则不做任何处理

        // 构建数据对象
        const headphoneData = {
            brand,
            model,
            type,
            frequencyResponse: processedFreqData,
            originalFrequencyResponse: originalFreqData,
            thd: thdData,
            rnb: rnbData
        };

        try {
            // 保存数据
            await DataManager.add(headphoneData);
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

    // 归一化频响数据（以1kHz为0dB参考）
    normalizeFrequencyData(data) {
        if (data.length === 0) return [];

        // 找到最接近1kHz的点作为参考
        let referenceValue = null;
        let closestFreq = null;
        let minDistance = Infinity;

        for (const [freq, val] of data) {
            if (freq >= 900 && freq <= 1100) {
                const distance = Math.abs(freq - 1000);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestFreq = freq;
                    referenceValue = val;
                }
            }
        }

        // 如果没找到1kHz附近的点，使用中间值
        if (referenceValue === null) {
            referenceValue = data[Math.floor(data.length / 2)][1];
        }

        console.log(`[Normalize] Reference: ${closestFreq}Hz = ${referenceValue}dB`);

        // 转换为相对dB
        return data.map(([freq, val]) => [freq, val - referenceValue]);
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

    async loadUploadedData() {
        const container = document.getElementById('uploadedList');
        const allData = await DataManager.getAllData();

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
                <button class="rename-btn" data-id="${headphone.id}" title="重命名">✏️</button>
                <button class="delete-btn" data-id="${headphone.id}" title="删除">🗑</button>
            `;

            const deleteBtn = item.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => this.deleteData(headphone.id));

            const renameBtn = item.querySelector('.rename-btn');
            renameBtn.addEventListener('click', () => this.openRenameModal(headphone.id, headphone.brand, headphone.model, headphone.type));

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

    async deleteData(id) {
        if (confirm('确定要删除这条数据吗?')) {
            const success = await DataManager.delete(id);
            if (success) {
                this.showMessage('删除成功', 'success');
                this.loadUploadedData();
            } else {
                this.showMessage('删除失败', 'error');
            }
        }
    },

    // 打开重命名模态框
    openRenameModal(id, currentBrand, currentModel, currentType) {
        this.currentRenameId = id;

        // 填充当前值
        document.getElementById('renameBrand').value = currentBrand;
        document.getElementById('renameModel').value = currentModel;
        document.getElementById('renameType').value = currentType || 'over-ear';

        // 清空错误消息
        const messageDiv = document.getElementById('renameMessage');
        messageDiv.style.display = 'none';

        // 显示模态框
        const modal = document.getElementById('renameModal');
        modal.classList.add('show');

        // 聚焦到品牌输入框
        setTimeout(() => {
            document.getElementById('renameBrand').focus();
        }, 100);
    },

    // 关闭重命名模态框
    closeRenameModal() {
        const modal = document.getElementById('renameModal');
        modal.classList.remove('show');
        this.currentRenameId = null;

        // 清空输入
        document.getElementById('renameBrand').value = '';
        document.getElementById('renameModel').value = '';

        // 清空消息
        const messageDiv = document.getElementById('renameMessage');
        messageDiv.style.display = 'none';
    },

    // 确认重命名
    async confirmRename() {
        const newBrand = document.getElementById('renameBrand').value.trim();
        const newModel = document.getElementById('renameModel').value.trim();
        const newType = document.getElementById('renameType').value;

        if (!newBrand || !newModel) {
            this.showRenameMessage('请填写品牌和型号', 'error');
            return;
        }

        if (!this.currentRenameId) {
            this.showRenameMessage('未找到要重命名的耳机', 'error');
            return;
        }

        try {
            const result = await DataManager.rename(this.currentRenameId, newBrand, newModel, newType);

            if (result.success) {
                this.showMessage(`成功更新耳机: ${newBrand} ${newModel}`, 'success');
                this.closeRenameModal();
                this.loadUploadedData();
            } else {
                this.showRenameMessage(result.error || '更新失败', 'error');
            }
        } catch (error) {
            this.showRenameMessage('更新失败: ' + error.message, 'error');
        }
    },

    // 在重命名模态框中显示消息
    showRenameMessage(text, type) {
        const messageDiv = document.getElementById('renameMessage');
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
    }
};

// 初始化上传页面
document.addEventListener('DOMContentLoaded', () => {
    UploadPage.init();
});
