// 主控制模块 - 整合所有功能
import { calculator } from './calculator.js';
import MountainRenderer from './renderer.js';

class MountainSimulator {
    constructor() {
        // 初始化渲染器
        this.renderer = new MountainRenderer('mountain-canvas');
        
        // 获取DOM元素
        this.elements = {
            latitudeSelect: document.getElementById('latitude-select'),
            baseTempSlider: document.getElementById('base-temp'),
            tempValue: document.getElementById('temp-value'),
            mountainHeightSlider: document.getElementById('mountain-height'),
            heightValue: document.getElementById('height-value'),
            paramLatitude: document.getElementById('param-latitude'),
            paramTemp: document.getElementById('param-temp'),
            paramHeight: document.getElementById('param-height'),
            paramGradient: document.getElementById('param-gradient'),
            paramSnowline: document.getElementById('param-snowline')
        };
        
        // 当前参数
        this.currentParams = {
            latitude: 'subtropical',
            baseTemp: 15,
            mountainHeight: 7800
        };
        
        // 绑定事件
        this.bindEvents();
        
        // 初始渲染
        this.updateVisualization();
    }

    // 绑定事件监听
    bindEvents() {
        // 纬度带选择变化
        this.elements.latitudeSelect.addEventListener('change', (e) => {
            this.currentParams.latitude = e.target.value;
            this.updateVisualization();
        });
        
        // 基准温度滑动条变化
        this.elements.baseTempSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.currentParams.baseTemp = value;
            this.elements.tempValue.textContent = value;
            this.updateVisualization();
        });
        
        // 山体高度滑动条变化
        this.elements.mountainHeightSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.currentParams.mountainHeight = value;
            this.elements.heightValue.textContent = value;
            this.updateVisualization();
        });
    }

    // 更新可视化
    updateVisualization() {
        const { latitude, baseTemp, mountainHeight } = this.currentParams;
        
        // 获取自然带分布数据
        const zoneData = calculator.getZoneDistribution(latitude, baseTemp, mountainHeight);
        
        // 更新参数显示
        this.updateParamDisplay(zoneData);
        
        // 渲染可视化
        this.renderer.render(zoneData, mountainHeight);
    }

    // 更新参数显示
    updateParamDisplay(zoneData) {
        const { latitude, baseTemp, mountainHeight } = this.currentParams;
        const { snowline, gradient, latitudeName } = zoneData;
        
        this.elements.paramLatitude.textContent = latitudeName;
        this.elements.paramTemp.textContent = `${baseTemp}°C`;
        this.elements.paramHeight.textContent = `${mountainHeight}米`;
        this.elements.paramGradient.textContent = `${gradient}°C/100米`;
        
        if (snowline > 0 && snowline < mountainHeight) {
            this.elements.paramSnowline.textContent = `${snowline}米`;
        } else if (snowline >= mountainHeight) {
            this.elements.paramSnowline.textContent = `>${mountainHeight}米`;
        } else {
            this.elements.paramSnowline.textContent = '无雪线';
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new MountainSimulator();
});