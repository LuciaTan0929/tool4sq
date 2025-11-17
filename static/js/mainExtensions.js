// 扩展App对象以支持新功能
(function() {
    // 保存原始的compare方法
    const originalCompare = App.compare;

    // 扩展compare方法
    App.compare = function() {
        if (this.selectedHeadphones.size === 0) return;

        // 显示对比区域
        document.getElementById('comparisonSection').style.display = 'block';

        // 收集数据
        const headphonesData = Array.from(this.selectedHeadphonesData.values());

        // 更新原始数据切换开关的显示
        if (typeof ChartConfig !== 'undefined') {
            ChartConfig.updateOriginalDataToggle(headphonesData);
        }

        // 获取选中的目标曲线
        const selectedTargets = Array.from(document.querySelectorAll('.target-curve:checked')).map(cb => cb.value);

        // 绘制图表
        this.drawFrequencyChart(headphonesData, selectedTargets);
        this.drawTHDChart(headphonesData);
        this.drawRnBChart(headphonesData);

        // 滚动到对比区域
        document.getElementById('comparisonSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // 添加updateChart方法
    App.updateChart = function(chartKey) {
        const headphonesData = Array.from(this.selectedHeadphonesData.values());
        const selectedTargets = Array.from(document.querySelectorAll('.target-curve:checked')).map(cb => cb.value);

        if (chartKey === 'frequency') {
            this.drawFrequencyChart(headphonesData, selectedTargets);
        } else if (chartKey === 'thd') {
            this.drawTHDChart(headphonesData);
        } else if (chartKey === 'rnb') {
            this.drawRnBChart(headphonesData);
        }
    };

    // 保存原始的drawFrequencyChart方法
    const originalDrawFrequencyChart = App.drawFrequencyChart;

    // 扩展drawFrequencyChart以支持原始数据和坐标轴配置
    App.drawFrequencyChart = function(headphonesData, selectedTargets) {
        const ctx = document.getElementById('frequencyChart');

        // 销毁旧图表
        if (this.charts.frequency) {
            this.charts.frequency.destroy();
        }

        const datasets = [];
        const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0'];

        // 检查是否显示原始数据
        const showOriginal = document.getElementById('showOriginalData')?.checked || false;
        console.log('[drawFrequencyChart] showOriginal:', showOriginal);

        // 添加耳机数据
        headphonesData.forEach((headphone, index) => {
            const color = colors[index % colors.length];
            const hasOriginal = headphone.originalFrequencyResponse && headphone.originalFrequencyResponse.length > 0;

            console.log(`[drawFrequencyChart] Processing ${headphone.brand} ${headphone.model}`);
            console.log(`[drawFrequencyChart] Has original data:`, hasOriginal);
            console.log(`[drawFrequencyChart] Will show original:`, showOriginal && hasOriginal);

            // 如果勾选了显示原始数据且存在原始数据，只显示原始数据
            if (showOriginal && hasOriginal) {
                console.log(`[drawFrequencyChart] Adding ORIGINAL data for ${headphone.brand} ${headphone.model}`);
                datasets.push({
                    label: `${headphone.brand} ${headphone.model} (原始数据)`,
                    data: headphone.originalFrequencyResponse.map(point => ({ x: point[0], y: point[1] })),
                    borderColor: color,
                    backgroundColor: color + '20',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 5
                });
            } else {
                // 否则显示归一化数据
                console.log(`[drawFrequencyChart] Adding NORMALIZED data for ${headphone.brand} ${headphone.model}`);
                datasets.push({
                    label: `${headphone.brand} ${headphone.model}`,
                    data: headphone.frequencyResponse.map(point => ({ x: point[0], y: point[1] })),
                    borderColor: color,
                    backgroundColor: color + '20',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 5
                });
            }
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

        // 获取坐标轴配置
        let axisConfig = {};
        if (typeof ChartConfig !== 'undefined') {
            axisConfig = ChartConfig.getAxisConfig('frequency', 'freq');
        }

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
                        min: axisConfig.x.min,
                        max: axisConfig.x.max,
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
                        min: axisConfig.y.min,
                        max: axisConfig.y.max,
                        ticks: {
                            stepSize: axisConfig.y.stepSize
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                }
            }
        });
    };

    // 扩展THD图表以支持坐标轴配置
    const originalDrawTHDChart = App.drawTHDChart;
    App.drawTHDChart = function(headphonesData) {
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

        let axisConfig = {};
        if (typeof ChartConfig !== 'undefined') {
            axisConfig = ChartConfig.getAxisConfig('thd', 'thd');
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
                        min: axisConfig.x.min,
                        max: axisConfig.x.max,
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
                        min: axisConfig.y.min,
                        max: axisConfig.y.max,
                        ticks: {
                            stepSize: axisConfig.y.stepSize
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                }
            }
        });
    };

    // 扩展R&B图表以支持坐标轴配置
    const originalDrawRnBChart = App.drawRnBChart;
    App.drawRnBChart = function(headphonesData) {
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

        let axisConfig = {};
        if (typeof ChartConfig !== 'undefined') {
            axisConfig = ChartConfig.getAxisConfig('rnb', 'rnb');
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
                        min: axisConfig.x.min,
                        max: axisConfig.x.max,
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
                        min: axisConfig.y.min,
                        max: axisConfig.y.max,
                        ticks: {
                            stepSize: axisConfig.y.stepSize
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                }
            }
        });
    };
})();
