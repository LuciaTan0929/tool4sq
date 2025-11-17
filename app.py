"""
耳机音质对比工具 - Flask Web应用
运行此文件启动本地服务器
"""

from flask import Flask, render_template, jsonify, request
import json
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'headphone-comparison-tool'

# 数据存储文件路径
DATA_FILE = 'headphone_data.json'


def load_data():
    """加载耳机数据"""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    else:
        # 返回默认示例数据
        return get_sample_data()


def save_data(data):
    """保存耳机数据"""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def get_sample_data():
    """获取示例数据"""
    return [
        {
            'id': 'sony-wh1000xm5',
            'brand': 'Sony',
            'model': 'WH-1000XM5',
            'type': 'over-ear',
            'frequencyResponse': [
                [20, -2], [30, -1], [40, 0], [50, 1], [60, 1], [70, 2], [80, 2],
                [90, 2], [100, 3], [200, 3], [300, 2], [400, 2], [500, 1],
                [600, 1], [700, 0], [800, 0], [900, -1], [1000, -1], [2000, 0],
                [3000, 2], [4000, 3], [5000, 2], [6000, 1], [7000, 0],
                [8000, -2], [9000, -3], [10000, -4], [15000, -6], [20000, -8]
            ],
            'thd': [
                [20, 0.5], [30, 0.4], [40, 0.3], [50, 0.3], [60, 0.2],
                [70, 0.2], [80, 0.2], [90, 0.2], [100, 0.15], [200, 0.1],
                [500, 0.08], [1000, 0.05], [2000, 0.04], [5000, 0.06],
                [10000, 0.08], [15000, 0.1], [20000, 0.15]
            ],
            'rnb': [
                [20, 75], [30, 78], [40, 80], [50, 82], [60, 83], [70, 84],
                [80, 85], [90, 85], [100, 86], [200, 88], [500, 90],
                [1000, 92], [2000, 93], [5000, 91], [10000, 88], [15000, 85], [20000, 82]
            ]
        },
        {
            'id': 'apple-airpods-pro2',
            'brand': 'Apple',
            'model': 'AirPods Pro 2',
            'type': 'in-ear',
            'frequencyResponse': [
                [20, -3], [30, -2], [40, -1], [50, 0], [60, 1], [70, 2], [80, 2],
                [90, 3], [100, 3], [200, 3], [300, 2], [400, 1], [500, 1],
                [600, 0], [700, 0], [800, -1], [900, -1], [1000, -2], [2000, -1],
                [3000, 3], [4000, 4], [5000, 3], [6000, 2], [7000, 1],
                [8000, -1], [9000, -2], [10000, -3], [15000, -5], [20000, -7]
            ],
            'thd': [
                [20, 0.6], [30, 0.5], [40, 0.4], [50, 0.3], [60, 0.3],
                [70, 0.25], [80, 0.2], [90, 0.2], [100, 0.18], [200, 0.12],
                [500, 0.1], [1000, 0.06], [2000, 0.05], [5000, 0.07],
                [10000, 0.09], [15000, 0.12], [20000, 0.18]
            ],
            'rnb': [
                [20, 73], [30, 76], [40, 78], [50, 80], [60, 81], [70, 82],
                [80, 83], [90, 84], [100, 85], [200, 87], [500, 89],
                [1000, 91], [2000, 92], [5000, 90], [10000, 87], [15000, 84], [20000, 80]
            ]
        },
        {
            'id': 'sennheiser-hd800s',
            'brand': 'Sennheiser',
            'model': 'HD 800 S',
            'type': 'over-ear',
            'frequencyResponse': [
                [20, -1], [30, 0], [40, 1], [50, 1], [60, 2], [70, 2], [80, 2],
                [90, 2], [100, 2], [200, 2], [300, 1], [400, 0], [500, 0],
                [600, -1], [700, -1], [800, -2], [900, -2], [1000, -3], [2000, -2],
                [3000, 1], [4000, 2], [5000, 4], [6000, 5], [7000, 3],
                [8000, 1], [9000, -1], [10000, -2], [15000, -4], [20000, -6]
            ],
            'thd': [
                [20, 0.3], [30, 0.25], [40, 0.2], [50, 0.15], [60, 0.12],
                [70, 0.1], [80, 0.08], [90, 0.08], [100, 0.06], [200, 0.04],
                [500, 0.03], [1000, 0.02], [2000, 0.02], [5000, 0.03],
                [10000, 0.04], [15000, 0.06], [20000, 0.08]
            ],
            'rnb': [
                [20, 80], [30, 82], [40, 84], [50, 85], [60, 86], [70, 87],
                [80, 88], [90, 88], [100, 89], [200, 91], [500, 93],
                [1000, 95], [2000, 96], [5000, 94], [10000, 92], [15000, 89], [20000, 86]
            ]
        },
        {
            'id': 'bose-qc45',
            'brand': 'Bose',
            'model': 'QuietComfort 45',
            'type': 'over-ear',
            'frequencyResponse': [
                [20, -1], [30, 0], [40, 1], [50, 2], [60, 2], [70, 3], [80, 3],
                [90, 3], [100, 3], [200, 3], [300, 2], [400, 2], [500, 1],
                [600, 1], [700, 0], [800, 0], [900, -1], [1000, -1], [2000, 1],
                [3000, 2], [4000, 3], [5000, 2], [6000, 1], [7000, 0],
                [8000, -2], [9000, -3], [10000, -4], [15000, -6], [20000, -8]
            ],
            'thd': [
                [20, 0.45], [30, 0.35], [40, 0.3], [50, 0.25], [60, 0.2],
                [70, 0.18], [80, 0.15], [90, 0.15], [100, 0.12], [200, 0.09],
                [500, 0.07], [1000, 0.04], [2000, 0.03], [5000, 0.05],
                [10000, 0.07], [15000, 0.09], [20000, 0.12]
            ],
            'rnb': [
                [20, 76], [30, 79], [40, 81], [50, 83], [60, 84], [70, 85],
                [80, 86], [90, 86], [100, 87], [200, 89], [500, 91],
                [1000, 93], [2000, 94], [5000, 92], [10000, 89], [15000, 86], [20000, 83]
            ]
        }
    ]


@app.route('/')
def index():
    """主页 - 搜索和对比"""
    return render_template('index.html')


@app.route('/upload')
def upload():
    """数据上传页面"""
    return render_template('upload.html')


@app.route('/api/headphones', methods=['GET'])
def get_headphones():
    """获取所有耳机数据"""
    data = load_data()

    # 支持搜索
    query = request.args.get('q', '').lower()
    if query:
        data = [h for h in data if query in h['brand'].lower() or query in h['model'].lower()]

    return jsonify(data)


@app.route('/api/headphones/<headphone_id>', methods=['GET'])
def get_headphone(headphone_id):
    """获取单个耳机数据"""
    data = load_data()
    headphone = next((h for h in data if h['id'] == headphone_id), None)

    if headphone:
        return jsonify(headphone)
    else:
        return jsonify({'error': 'Headphone not found'}), 404


@app.route('/api/headphones', methods=['POST'])
def add_headphone():
    """添加新耳机数据"""
    try:
        new_data = request.json

        # 生成ID
        headphone_id = f"{new_data['brand'].lower()}-{new_data['model'].lower()}".replace(' ', '-')

        # 构建数据对象
        headphone = {
            'id': headphone_id,
            'brand': new_data['brand'],
            'model': new_data['model'],
            'type': new_data.get('type', 'over-ear'),
            'frequencyResponse': new_data.get('frequencyResponse', []),
            'thd': new_data.get('thd', []),
            'rnb': new_data.get('rnb', [])
        }

        # 如果有原始频响数据，也保存
        if 'originalFrequencyResponse' in new_data:
            headphone['originalFrequencyResponse'] = new_data['originalFrequencyResponse']

        # 加载现有数据
        data = load_data()

        # 检查是否已存在，更新或添加
        existing_index = next((i for i, h in enumerate(data) if h['id'] == headphone_id), None)
        if existing_index is not None:
            data[existing_index] = headphone
        else:
            data.append(headphone)

        # 保存数据
        save_data(data)

        return jsonify({'success': True, 'data': headphone}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/headphones/<headphone_id>', methods=['DELETE'])
def delete_headphone(headphone_id):
    """删除耳机数据"""
    data = load_data()
    data = [h for h in data if h['id'] != headphone_id]
    save_data(data)

    return jsonify({'success': True})


@app.route('/api/headphones/<headphone_id>/rename', methods=['PATCH'])
def rename_headphone(headphone_id):
    """重命名耳机（修改品牌、型号和类型）"""
    try:
        request_data = request.json
        new_brand = request_data.get('brand', '').strip()
        new_model = request_data.get('model', '').strip()
        new_type = request_data.get('type', '').strip()

        if not new_brand or not new_model:
            return jsonify({'error': '品牌和型号不能为空'}), 400

        # 加载数据
        data = load_data()

        # 查找要修改的耳机
        headphone = next((h for h in data if h['id'] == headphone_id), None)

        if not headphone:
            return jsonify({'error': '未找到该耳机'}), 404

        # 生成新的ID
        new_id = f"{new_brand.lower()}-{new_model.lower()}".replace(' ', '-')

        # 检查新ID是否与其他耳机冲突
        if new_id != headphone_id and any(h['id'] == new_id for h in data):
            return jsonify({'error': '该品牌和型号已存在，请使用不同的名称'}), 400

        # 更新品牌、型号和ID
        headphone['brand'] = new_brand
        headphone['model'] = new_model
        headphone['id'] = new_id

        # 如果提供了类型，也更新类型
        if new_type:
            headphone['type'] = new_type

        # 保存数据
        save_data(data)

        return jsonify({'success': True, 'data': headphone})

    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    import sys
    # 设置输出编码为UTF-8
    if sys.platform == 'win32':
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
        sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

    # 初始化数据文件
    if not os.path.exists(DATA_FILE):
        save_data(get_sample_data())
        print("✅ 已创建示例数据文件")

    # 从环境变量获取配置，支持本地开发和生产部署
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    host = os.environ.get('HOST', '0.0.0.0')

    print("=" * 60)
    print("🎧 耳机音质对比工具")
    print("=" * 60)
    print(f"服务器启动中... (端口: {port}, 调试模式: {debug})")
    if debug:
        print(f"请在浏览器中访问: http://127.0.0.1:{port}")
    print("按 Ctrl+C 停止服务器")
    print("=" * 60)

    app.run(debug=debug, host=host, port=port)
