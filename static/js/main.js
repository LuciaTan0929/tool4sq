// 主应用逻辑
const App = {
    selectedHeadphones: new Set(),
    selectedHeadphonesData: new Map(), // 缓存已加载的耳机数据
    charts: {},

    init() {
        this.bindEvents();
        this.loadInitialData();
    },

    bindEvents() {
        // 搜索按钮
        document.getElementById('searchBtn').addEventListener('click', () => this.search());

        // 搜索框回车
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.search();
        });

        // 对比按钮
        document.getElementById('compareBtn').addEventListener('click', () => this.compare());

        // 清除按钮
        document.getElementById('clearBtn').addEventListener('click', () => this.clearSelection());

        // 目标曲线复选框
        document.querySelectorAll('.target-curve').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                if (this.selectedHeadphones.size > 0) {
                    this.compare();
                }
            });
        });
    },

    loadInitialData() {
        // 显示所有数据
        this.search();
    },

    async search() {
        const query = document.getElementById('searchInput').value;
        const results = await DataManager.search(query);
        this.displaySearchResults(results);
    },

    displaySearchResults(results) {
        const container = document.getElementById('searchResults');
        container.innerHTML = '';

        if (results.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">未找到相关耳机</p>';
            return;
        }

        results.forEach(headphone => {
            const card = document.createElement('div');
            card.className = 'headphone-card';
            if (this.selectedHeadphones.has(headphone.id)) {
                card.classList.add('selected');
            }

            card.innerHTML = `
                <div class="headphone-brand">${headphone.brand}</div>
                <div class="headphone-model">${headphone.model}</div>
                <div class="headphone-type">${this.getTypeDisplayName(headphone.type)}</div>
            `;

            card.addEventListener('click', () => this.toggleSelection(headphone.id));
            container.appendChild(card);
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

    toggleSelection(id) {
        if (this.selectedHeadphones.has(id)) {
            this.selectedHeadphones.delete(id);
            this.selectedHeadphonesData.delete(id);
        } else {
            this.selectedHeadphones.add(id);
        }

        this.updateSelectedDisplay();
        this.search(); // 刷新搜索结果显示
    },

    async updateSelectedDisplay() {
        const container = document.getElementById('selectedHeadphones');
        const count = document.getElementById('selectedCount');
        const compareBtn = document.getElementById('compareBtn');

        container.innerHTML = '';
        count.textContent = `(${this.selectedHeadphones.size})`;

        for (const id of this.selectedHeadphones) {
            const headphone = await DataManager.getById(id);
            if (!headphone) continue;

            // 缓存数据
            this.selectedHeadphonesData.set(id, headphone);

            const tag = document.createElement('div');
            tag.className = 'selected-tag';
            tag.innerHTML = `
                <span>${headphone.brand} ${headphone.model}</span>
                <button class="remove-tag">×</button>
            `;

            tag.querySelector('.remove-tag').addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSelection(id);
            });

            container.appendChild(tag);
        }

        compareBtn.disabled = this.selectedHeadphones.size === 0;
    },

    clearSelection() {
        this.selectedHeadphones.clear();
        this.selectedHeadphonesData.clear();
        this.updateSelectedDisplay();
        this.search();

        // 隐藏对比区域
        document.getElementById('comparisonSection').style.display = 'none';
    },

    async compare() {
        if (this.selectedHeadphones.size === 0) return;

        // 显示对比区域
        document.getElementById('comparisonSection').style.display = 'block';

        // 收集数据 - 从缓存中获取
        const headphonesData = Array.from(this.selectedHeadphonesData.values());

        // 获取选中的目标曲线
        const selectedTargets = Array.from(document.querySelectorAll('.target-curve:checked')).map(cb => cb.value);

        // 绘制图表
        this.drawFrequencyChart(headphonesData, selectedTargets);
        this.drawTHDChart(headphonesData);
        this.drawRnBChart(headphonesData);

        // 滚动到对比区域
        document.getElementById('comparisonSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    drawFrequencyChart(headphonesData, selectedTargets) {
        const ctx = document.getElementById('frequencyChart');

        // 销毁旧图表
        if (this.charts.frequency) {
            this.charts.frequency.destroy();
        }

        const datasets = [];

        // 添加耳机数据
        const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0'];

        headphonesData.forEach((headphone, index) => {
            datasets.push({
                label: `${headphone.brand} ${headphone.model}`,
                data: headphone.frequencyResponse.map(point => ({ x: point[0], y: point[1] })),
                borderColor: colors[index % colors.length],
                backgroundColor: colors[index % colors.length] + '20',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 5
            });
        });

        // 添加目标曲线
        const targetColors = {
            'harman': '#ff6b6b',
            'ief': '#4ecdc4',
            'freefield': '#95e1d3',
            'diffusefield': '#f38181'
        };

        selectedTargets.forEach(target => {
            const curve = TargetCurves.getCurve(target);
            if (curve.length > 0) {
                datasets.push({
                    label: TargetCurves.getDisplayName(target),
                    data: curve.map(point => ({ x: point[0], y: point[1] })),
                    borderColor: targetColors[target],
                    backgroundColor: targetColors[target] + '10',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 5
                });
            }
        });

        this.charts.frequency = new Chart(ctx, {
            type: 'line',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} dB`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'logarithmic',
                        title: {
                            display: true,
                            text: '频率 (Hz)'
                        },
                        ticks: {
                            callback: function(value) {
                                if (value === 20 || value === 50 || value === 100 || value === 200 ||
                                    value === 500 || value === 1000 || value === 2000 ||
                                    value === 5000 || value === 10000 || value === 20000) {
                                    return value;
                                }
                                return '';
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '增益 (dB)'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                }
            }
        });
    },

    drawTHDChart(headphonesData) {
        const ctx = document.getElementById('thdChart');

        if (this.charts.thd) {
            this.charts.thd.destroy();
        }

        const datasets = [];
        const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0'];

        headphonesData.forEach((headphone, index) => {
            if (headphone.thd && headphone.thd.length > 0) {
                datasets.push({
                    label: `${headphone.brand} ${headphone.model}`,
                    data: headphone.thd.map(point => ({ x: point[0], y: point[1] })),
                    borderColor: colors[index % colors.length],
                    backgroundColor: colors[index % colors.length] + '20',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 5
                });
            }
        });

        if (datasets.length === 0) {
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
            return;
        }

        this.charts.thd = new Chart(ctx, {
            type: 'line',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'logarithmic',
                        title: {
                            display: true,
                            text: '频率 (Hz)'
                        },
                        ticks: {
                            callback: function(value) {
                                if (value === 20 || value === 50 || value === 100 || value === 200 ||
                                    value === 500 || value === 1000 || value === 2000 ||
                                    value === 5000 || value === 10000 || value === 20000) {
                                    return value;
                                }
                                return '';
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '失真 (%)'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                }
            }
        });
    },

    drawRnBChart(headphonesData) {
        const ctx = document.getElementById('rnbChart');

        if (this.charts.rnb) {
            this.charts.rnb.destroy();
        }

        const datasets = [];
        const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0'];

        headphonesData.forEach((headphone, index) => {
            if (headphone.rnb && headphone.rnb.length > 0) {
                datasets.push({
                    label: `${headphone.brand} ${headphone.model}`,
                    data: headphone.rnb.map(point => ({ x: point[0], y: point[1] })),
                    borderColor: colors[index % colors.length],
                    backgroundColor: colors[index % colors.length] + '20',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 5
                });
            }
        });

        if (datasets.length === 0) {
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
            return;
        }

        this.charts.rnb = new Chart(ctx, {
            type: 'line',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'logarithmic',
                        title: {
                            display: true,
                            text: '频率 (Hz)'
                        },
                        ticks: {
                            callback: function(value) {
                                if (value === 20 || value === 50 || value === 100 || value === 200 ||
                                    value === 500 || value === 1000 || value === 2000 ||
                                    value === 5000 || value === 10000 || value === 20000) {
                                    return value;
                                }
                                return '';
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'R&B 值'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                }
            }
        });
    }
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
