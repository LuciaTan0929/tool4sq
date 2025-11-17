// 数据管理模块
const DataManager = {
    // 本地存储键名
    STORAGE_KEY: 'headphone_data',

    // 示例数据
    sampleData: [
        {
            id: 'sony-wh1000xm5',
            brand: 'Sony',
            model: 'WH-1000XM5',
            type: 'over-ear',
            frequencyResponse: [
                [20, -2], [30, -1], [40, 0], [50, 1], [60, 1], [70, 2], [80, 2],
                [90, 2], [100, 3], [200, 3], [300, 2], [400, 2], [500, 1],
                [600, 1], [700, 0], [800, 0], [900, -1], [1000, -1], [2000, 0],
                [3000, 2], [4000, 3], [5000, 2], [6000, 1], [7000, 0],
                [8000, -2], [9000, -3], [10000, -4], [15000, -6], [20000, -8]
            ],
            thd: [
                [20, 0.5], [30, 0.4], [40, 0.3], [50, 0.3], [60, 0.2],
                [70, 0.2], [80, 0.2], [90, 0.2], [100, 0.15], [200, 0.1],
                [500, 0.08], [1000, 0.05], [2000, 0.04], [5000, 0.06],
                [10000, 0.08], [15000, 0.1], [20000, 0.15]
            ],
            rnb: [
                [20, 75], [30, 78], [40, 80], [50, 82], [60, 83], [70, 84],
                [80, 85], [90, 85], [100, 86], [200, 88], [500, 90],
                [1000, 92], [2000, 93], [5000, 91], [10000, 88], [15000, 85], [20000, 82]
            ]
        },
        {
            id: 'apple-airpods-pro2',
            brand: 'Apple',
            model: 'AirPods Pro 2',
            type: 'in-ear',
            frequencyResponse: [
                [20, -3], [30, -2], [40, -1], [50, 0], [60, 1], [70, 2], [80, 2],
                [90, 3], [100, 3], [200, 3], [300, 2], [400, 1], [500, 1],
                [600, 0], [700, 0], [800, -1], [900, -1], [1000, -2], [2000, -1],
                [3000, 3], [4000, 4], [5000, 3], [6000, 2], [7000, 1],
                [8000, -1], [9000, -2], [10000, -3], [15000, -5], [20000, -7]
            ],
            thd: [
                [20, 0.6], [30, 0.5], [40, 0.4], [50, 0.3], [60, 0.3],
                [70, 0.25], [80, 0.2], [90, 0.2], [100, 0.18], [200, 0.12],
                [500, 0.1], [1000, 0.06], [2000, 0.05], [5000, 0.07],
                [10000, 0.09], [15000, 0.12], [20000, 0.18]
            ],
            rnb: [
                [20, 73], [30, 76], [40, 78], [50, 80], [60, 81], [70, 82],
                [80, 83], [90, 84], [100, 85], [200, 87], [500, 89],
                [1000, 91], [2000, 92], [5000, 90], [10000, 87], [15000, 84], [20000, 80]
            ]
        },
        {
            id: 'sennheiser-hd800s',
            brand: 'Sennheiser',
            model: 'HD 800 S',
            type: 'over-ear',
            frequencyResponse: [
                [20, -1], [30, 0], [40, 1], [50, 1], [60, 2], [70, 2], [80, 2],
                [90, 2], [100, 2], [200, 2], [300, 1], [400, 0], [500, 0],
                [600, -1], [700, -1], [800, -2], [900, -2], [1000, -3], [2000, -2],
                [3000, 1], [4000, 2], [5000, 4], [6000, 5], [7000, 3],
                [8000, 1], [9000, -1], [10000, -2], [15000, -4], [20000, -6]
            ],
            thd: [
                [20, 0.3], [30, 0.25], [40, 0.2], [50, 0.15], [60, 0.12],
                [70, 0.1], [80, 0.08], [90, 0.08], [100, 0.06], [200, 0.04],
                [500, 0.03], [1000, 0.02], [2000, 0.02], [5000, 0.03],
                [10000, 0.04], [15000, 0.06], [20000, 0.08]
            ],
            rnb: [
                [20, 80], [30, 82], [40, 84], [50, 85], [60, 86], [70, 87],
                [80, 88], [90, 88], [100, 89], [200, 91], [500, 93],
                [1000, 95], [2000, 96], [5000, 94], [10000, 92], [15000, 89], [20000, 86]
            ]
        },
        {
            id: 'bose-qc45',
            brand: 'Bose',
            model: 'QuietComfort 45',
            type: 'over-ear',
            frequencyResponse: [
                [20, -1], [30, 0], [40, 1], [50, 2], [60, 2], [70, 3], [80, 3],
                [90, 3], [100, 3], [200, 3], [300, 2], [400, 2], [500, 1],
                [600, 1], [700, 0], [800, 0], [900, -1], [1000, -1], [2000, 1],
                [3000, 2], [4000, 3], [5000, 2], [6000, 1], [7000, 0],
                [8000, -2], [9000, -3], [10000, -4], [15000, -6], [20000, -8]
            ],
            thd: [
                [20, 0.45], [30, 0.35], [40, 0.3], [50, 0.25], [60, 0.2],
                [70, 0.18], [80, 0.15], [90, 0.15], [100, 0.12], [200, 0.09],
                [500, 0.07], [1000, 0.04], [2000, 0.03], [5000, 0.05],
                [10000, 0.07], [15000, 0.09], [20000, 0.12]
            ],
            rnb: [
                [20, 76], [30, 79], [40, 81], [50, 83], [60, 84], [70, 85],
                [80, 86], [90, 86], [100, 87], [200, 89], [500, 91],
                [1000, 93], [2000, 94], [5000, 92], [10000, 89], [15000, 86], [20000, 83]
            ]
        }
    ],

    // 初始化数据
    init() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.sampleData));
        }
    },

    // 获取所有数据
    getAllData() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    // 搜索数据
    search(query) {
        const allData = this.getAllData();
        if (!query) return allData;

        const lowerQuery = query.toLowerCase();
        return allData.filter(item =>
            item.brand.toLowerCase().includes(lowerQuery) ||
            item.model.toLowerCase().includes(lowerQuery)
        );
    },

    // 根据ID获取数据
    getById(id) {
        const allData = this.getAllData();
        return allData.find(item => item.id === id);
    },

    // 添加新数据
    add(data) {
        const allData = this.getAllData();

        // 生成ID
        const id = `${data.brand.toLowerCase()}-${data.model.toLowerCase()}`.replace(/\s+/g, '-');

        // 检查是否已存在
        const existingIndex = allData.findIndex(item => item.id === id);

        const newData = {
            id,
            brand: data.brand,
            model: data.model,
            type: data.type || 'over-ear',
            frequencyResponse: data.frequencyResponse || [],
            thd: data.thd || [],
            rnb: data.rnb || []
        };

        if (existingIndex >= 0) {
            // 更新现有数据
            allData[existingIndex] = newData;
        } else {
            // 添加新数据
            allData.push(newData);
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allData));
        return newData;
    },

    // 删除数据
    delete(id) {
        const allData = this.getAllData();
        const filteredData = allData.filter(item => item.id !== id);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredData));
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
    }
};

// 初始化数据管理器
DataManager.init();
