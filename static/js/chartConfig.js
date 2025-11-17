// 图表配置管理
const ChartConfig = {
    axisLocks: {
        frequency: { xLocked: false, yLocked: false, yStepLocked: false },
        thd: { xLocked: false, yLocked: false, yStepLocked: false },
        rnb: { xLocked: false, yLocked: false, yStepLocked: false }
    },

    init() {
        this.bindAxisControls();
        this.bindOriginalDataToggle();
    },

    bindAxisControls() {
        // 频响图表控件
        this.setupAxisControl('freq', 'frequency');
        // THD图表控件
        this.setupAxisControl('thd', 'thd');
        // R&B图表控件
        this.setupAxisControl('rnb', 'rnb');
    },

    setupAxisControl(prefix, chartKey) {
        const xLockBtn = document.getElementById(`${prefix}XLock`);
        const yLockBtn = document.getElementById(`${prefix}YLock`);
        const yStepLockBtn = document.getElementById(`${prefix}YStepLock`);
        const resetBtn = document.getElementById(`${prefix}Reset`);

        const xMinInput = document.getElementById(`${prefix}XMin`);
        const xMaxInput = document.getElementById(`${prefix}XMax`);
        const yMinInput = document.getElementById(`${prefix}YMin`);
        const yMaxInput = document.getElementById(`${prefix}YMax`);
        const yStepInput = document.getElementById(`${prefix}YStep`);

        // X轴锁定/解锁
        xLockBtn.addEventListener('click', () => {
            this.axisLocks[chartKey].xLocked = !this.axisLocks[chartKey].xLocked;
            xLockBtn.textContent = this.axisLocks[chartKey].xLocked ? '🔒 固定' : '🔓 自动';
            xLockBtn.classList.toggle('locked', this.axisLocks[chartKey].xLocked);
            if (App && App.charts[chartKey]) {
                App.updateChart(chartKey);
            }
        });

        // Y轴锁定/解锁
        yLockBtn.addEventListener('click', () => {
            this.axisLocks[chartKey].yLocked = !this.axisLocks[chartKey].yLocked;
            yLockBtn.textContent = this.axisLocks[chartKey].yLocked ? '🔒 固定' : '🔓 自动';
            yLockBtn.classList.toggle('locked', this.axisLocks[chartKey].yLocked);
            if (App && App.charts[chartKey]) {
                App.updateChart(chartKey);
            }
        });

        // Y轴刻度单位锁定/解锁
        yStepLockBtn.addEventListener('click', () => {
            this.axisLocks[chartKey].yStepLocked = !this.axisLocks[chartKey].yStepLocked;
            yStepLockBtn.textContent = this.axisLocks[chartKey].yStepLocked ? '🔒 固定' : '🔓 自动';
            yStepLockBtn.classList.toggle('locked', this.axisLocks[chartKey].yStepLocked);
            if (App && App.charts[chartKey]) {
                App.updateChart(chartKey);
            }
        });

        // 输入框变化时重绘图表
        [xMinInput, xMaxInput, yMinInput, yMaxInput, yStepInput].forEach(input => {
            input.addEventListener('change', () => {
                if (App && App.charts[chartKey]) {
                    App.updateChart(chartKey);
                }
            });
        });

        // 重置按钮
        resetBtn.addEventListener('click', () => {
            this.axisLocks[chartKey] = { xLocked: false, yLocked: false, yStepLocked: false };
            xLockBtn.textContent = '🔓 自动';
            yLockBtn.textContent = '🔓 自动';
            yStepLockBtn.textContent = '🔓 自动';
            xLockBtn.classList.remove('locked');
            yLockBtn.classList.remove('locked');
            yStepLockBtn.classList.remove('locked');

            // 重置输入值
            const defaults = this.getDefaultAxisValues(chartKey);
            xMinInput.value = defaults.xMin;
            xMaxInput.value = defaults.xMax;
            yMinInput.value = defaults.yMin;
            yMaxInput.value = defaults.yMax;
            yStepInput.value = defaults.yStep;

            if (App && App.charts[chartKey]) {
                App.updateChart(chartKey);
            }
        });
    },

    getDefaultAxisValues(chartKey) {
        const defaults = {
            frequency: { xMin: 20, xMax: 20000, yMin: -10, yMax: 10, yStep: 2 },
            thd: { xMin: 20, xMax: 20000, yMin: 0, yMax: 1, yStep: 0.1 },
            rnb: { xMin: 20, xMax: 20000, yMin: 70, yMax: 100, yStep: 5 }
        };
        return defaults[chartKey] || { xMin: 0, xMax: 100, yMin: 0, yMax: 100, yStep: 10 };
    },

    getAxisConfig(chartKey, prefix) {
        const xMin = parseFloat(document.getElementById(`${prefix}XMin`).value);
        const xMax = parseFloat(document.getElementById(`${prefix}XMax`).value);
        const yMin = parseFloat(document.getElementById(`${prefix}YMin`).value);
        const yMax = parseFloat(document.getElementById(`${prefix}YMax`).value);
        const yStep = parseFloat(document.getElementById(`${prefix}YStep`).value);

        return {
            x: {
                min: this.axisLocks[chartKey].xLocked ? xMin : undefined,
                max: this.axisLocks[chartKey].xLocked ? xMax : undefined
            },
            y: {
                min: this.axisLocks[chartKey].yLocked ? yMin : undefined,
                max: this.axisLocks[chartKey].yLocked ? yMax : undefined,
                stepSize: this.axisLocks[chartKey].yStepLocked ? yStep : undefined
            }
        };
    },

    bindOriginalDataToggle() {
        const toggle = document.getElementById('showOriginalData');
        if (toggle) {
            console.log('[ChartConfig] Binding original data toggle event listener');
            toggle.addEventListener('change', () => {
                console.log('[ChartConfig] Toggle changed! Checked:', toggle.checked);
                if (App && App.compare) {
                    console.log('[ChartConfig] Calling App.compare()');
                    App.compare();
                } else {
                    console.error('[ChartConfig] App or App.compare not found!');
                }
            });
        } else {
            console.error('[ChartConfig] showOriginalData toggle not found!');
        }
    },

    // 检查是否有耳机包含原始数据
    hasOriginalData(headphonesData) {
        return headphonesData.some(h => h.originalFrequencyResponse && h.originalFrequencyResponse.length > 0);
    },

    // 显示或隐藏原始数据切换开关
    updateOriginalDataToggle(headphonesData) {
        const toggleContainer = document.getElementById('originalDataToggle');
        const toggle = document.getElementById('showOriginalData');

        console.log('[ChartConfig] Checking for original data...');
        console.log('[ChartConfig] Headphones count:', headphonesData.length);

        // 详细检查每个耳机
        headphonesData.forEach((h, idx) => {
            const hasOriginal = h.originalFrequencyResponse && h.originalFrequencyResponse.length > 0;
            console.log(`[ChartConfig] ${idx}: ${h.brand} ${h.model} - Has original:`, hasOriginal,
                        'Length:', h.originalFrequencyResponse ? h.originalFrequencyResponse.length : 0);
        });

        const hasAnyOriginal = this.hasOriginalData(headphonesData);
        console.log('[ChartConfig] Has any original data:', hasAnyOriginal);

        if (hasAnyOriginal) {
            console.log('[ChartConfig] Showing original data toggle');
            toggleContainer.style.display = 'flex';
            // 不要重置复选框状态，保留用户的选择
            // 只在首次显示时设置为 false
            if (toggle.dataset.initialized !== 'true') {
                toggle.checked = false;
                toggle.dataset.initialized = 'true';
            }
        } else {
            console.log('[ChartConfig] Hiding original data toggle');
            toggleContainer.style.display = 'none';
            toggle.checked = false;
            toggle.dataset.initialized = 'false';
        }
    }
};

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    ChartConfig.init();
});
