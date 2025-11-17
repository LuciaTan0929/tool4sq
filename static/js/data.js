// 数据管理模块 - 使用Flask API
const DataManager = {
    // API基础路径
    API_BASE: '/api/headphones',

    // 获取所有数据
    async getAllData() {
        try {
            const response = await fetch(this.API_BASE);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('获取数据失败:', error);
            return [];
        }
    },

    // 搜索数据
    async search(query) {
        try {
            const url = query ? `${this.API_BASE}?q=${encodeURIComponent(query)}` : this.API_BASE;
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('搜索失败:', error);
            return [];
        }
    },

    // 根据ID获取数据
    async getById(id) {
        try {
            const response = await fetch(`${this.API_BASE}/${id}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('获取数据失败:', error);
            return null;
        }
    },

    // 添加新数据
    async add(data) {
        try {
            const response = await fetch(this.API_BASE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                return result.data;
            } else {
                throw new Error(result.error || '上传失败');
            }
        } catch (error) {
            console.error('添加数据失败:', error);
            throw error;
        }
    },

    // 删除数据
    async delete(id) {
        try {
            const response = await fetch(`${this.API_BASE}/${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('删除数据失败:', error);
            return false;
        }
    },

    // 重命名耳机（修改品牌、型号和类型）
    async rename(id, newBrand, newModel, newType) {
        try {
            const requestBody = {
                brand: newBrand,
                model: newModel
            };

            // 如果提供了类型，也包含在请求中
            if (newType) {
                requestBody.type = newType;
            }

            const response = await fetch(`${this.API_BASE}/${id}/rename`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();

            if (response.ok) {
                return { success: true, data: result.data };
            } else {
                throw new Error(result.error || '更新失败');
            }
        } catch (error) {
            console.error('更新失败:', error);
            return { success: false, error: error.message };
        }
    },

    // 解析CSV数据
    parseCSV(text) {
        const lines = text.trim().split('\n');
        const data = [];

        for (const line of lines) {
            const parts = line.split(',').map(p => p.trim());
            if (parts.length >= 2) {
                const freq = parseFloat(parts[0]);
                const value = parseFloat(parts[1]);
                if (!isNaN(freq) && !isNaN(value)) {
                    data.push([freq, value]);
                }
            }
        }

        return data;
    },

    // 解析专业声学测试格式（制表符分隔的多列数据）
    // 支持单个或多个耳机数据
    // autoNormalize: 是否自动归一化（默认true以保持向后兼容）
    parseProfessionalFormat(text, autoNormalize = true) {
        const lines = text.trim().split('\n');

        if (lines.length < 2) {
            throw new Error('文件格式错误：至少需要2行数据');
        }

        // 跳过第一行Comment
        // 第二行包含参数类型和耳机型号信息
        const headerLine = lines[1];
        const headers = headerLine.split('\t').map(h => h.trim());

        // 查找所有包含 s/n: 的列，提取耳机信息
        const headphonesInfo = [];

        for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            if (header.includes('s/n:') || header.includes('S/N:')) {
                const match = header.match(/s\/n:\s*(.+)/i);
                if (match) {
                    const fullName = match[1].trim();

                    // 尝试分割品牌和型号
                    const parts = fullName.split(/\s+/);
                    let brand = 'Unknown';
                    let model = 'Unknown';

                    if (parts.length >= 1) {
                        brand = parts[0];
                        model = parts.slice(1).join(' ') || parts[0];
                    }

                    // 判断参数类型
                    let paramType = 'unknown';
                    if (header.toLowerCase().includes('response')) {
                        paramType = 'response';
                    } else if (header.toLowerCase().includes('thd')) {
                        paramType = 'thd';
                    } else if (header.toLowerCase().includes('rub') || header.toLowerCase().includes('buzz')) {
                        paramType = 'rnb';
                    }

                    // 查找或创建该耳机的记录
                    let headphoneRecord = headphonesInfo.find(h => h.brand === brand && h.model === model);
                    if (!headphoneRecord) {
                        headphoneRecord = {
                            brand,
                            model,
                            responseCol: -1,
                            thdCol: -1,
                            rnbCol: -1,
                            responseData: [],
                            thdData: [],
                            rnbData: []
                        };
                        headphonesInfo.push(headphoneRecord);
                    }

                    // 记录该参数的列位置（数据在下一列）
                    if (paramType === 'response') {
                        headphoneRecord.responseCol = i + 1;
                    } else if (paramType === 'thd') {
                        headphoneRecord.thdCol = i + 1;
                    } else if (paramType === 'rnb') {
                        headphoneRecord.rnbCol = i + 1;
                    }
                }
            }
        }

        if (headphonesInfo.length === 0) {
            throw new Error('未找到耳机型号信息（需要包含 "s/n:" 标识）');
        }

        // 从第3行开始解析数据
        for (let i = 2; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const cols = line.split('\t');

            // 为每个耳机解析数据
            for (const headphone of headphonesInfo) {
                // Response数据：频率列 + 值列
                if (headphone.responseCol > 0 && cols.length > headphone.responseCol) {
                    const freqCol = headphone.responseCol - 1;
                    const valCol = headphone.responseCol;

                    const freq = parseFloat(cols[freqCol]);
                    const val = parseFloat(cols[valCol]);
                    if (!isNaN(freq) && !isNaN(val)) {
                        headphone.responseData.push([freq, val]);
                    }
                }

                // THD数据
                if (headphone.thdCol > 0 && cols.length > headphone.thdCol) {
                    const freqCol = headphone.thdCol - 1;
                    const valCol = headphone.thdCol;

                    const freq = parseFloat(cols[freqCol]);
                    const val = parseFloat(cols[valCol]);
                    if (!isNaN(freq) && !isNaN(val)) {
                        headphone.thdData.push([freq, val]);
                    }
                }

                // Rub & Buzz数据
                if (headphone.rnbCol > 0 && cols.length > headphone.rnbCol) {
                    const freqCol = headphone.rnbCol - 1;
                    const valCol = headphone.rnbCol;

                    const freq = parseFloat(cols[freqCol]);
                    const val = parseFloat(cols[valCol]);
                    if (!isNaN(freq) && !isNaN(val)) {
                        headphone.rnbData.push([freq, val]);
                    }
                }
            }
        }

        // 频响数据转换为相对dB（仅在autoNormalize为true时）
        const convertToRelativeDB = (data) => {
            if (data.length === 0 || !autoNormalize) return data;

            // 找到最接近1kHz的点作为参考
            let referenceValue = 94; // 默认参考值
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

            console.log(`[Professional Format Normalize] Reference: ${closestFreq}Hz = ${referenceValue}dB`);

            // 转换为相对dB
            return data.map(([freq, val]) => [freq, val - referenceValue]);
        };

        // 构建返回结果
        const results = headphonesInfo.map(h => ({
            brand: h.brand,
            model: h.model,
            frequencyResponse: convertToRelativeDB(h.responseData),
            thd: h.thdData,
            rnb: h.rnbData
        }));

        // 如果只有一个耳机，返回单个对象；多个则返回数组
        return results.length === 1 ? results[0] : results;
    }
};
