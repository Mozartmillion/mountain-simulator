// 山地垂直自然带可视化渲染模块
export class MountainRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.lastZoneData = null;
        this.lastMountainHeight = null;
        
        // 初始化画布大小
        this.resizeCanvas();
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            // 如果有数据，重新渲染
            if (this.lastZoneData && this.lastMountainHeight) {
                this.render(this.lastZoneData, this.lastMountainHeight);
            }
        });
    }

    // 调整画布大小
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // 确保尺寸有效
        if (width > 0 && height > 0) {
            this.canvas.width = width;
            this.canvas.height = height;
        }
    }

    // 渲染山地垂直带模型
    render(zoneData, mountainHeight) {
        // 保存数据用于resize时重新渲染
        this.lastZoneData = zoneData;
        this.lastMountainHeight = mountainHeight;
        
        const { zones, snowline } = zoneData;
        
        // 确保画布尺寸正确
        if (this.canvas.width === 0 || this.canvas.height === 0) {
            this.resizeCanvas();
        }
        
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 计算绘图参数
        const padding = 80;
        const drawWidth = this.canvas.width - padding * 2;
        const drawHeight = this.canvas.height - padding * 2;
        const startX = padding;
        const startY = padding;
        
        // 绘制自然带
        zones.forEach(zone => {
            this.drawZone(zone, mountainHeight, startX, startY, drawWidth, drawHeight);
        });
        
        // 绘制海拔刻度
        this.drawAltitudeScale(mountainHeight, startX, startY, drawHeight);
        
        // 绘制温度标注
        this.drawTemperatureLabels(zones, mountainHeight, startX, startY, drawWidth, drawHeight);
        
        // 绘制雪线标注
        if (snowline > 0 && snowline < mountainHeight) {
            this.drawSnowline(snowline, mountainHeight, startX, startY, drawWidth, drawHeight);
        }
    }

    // 绘制单个自然带
    drawZone(zone, mountainHeight, startX, startY, drawWidth, drawHeight) {
        const bottomY = startY + drawHeight - (zone.minHeight / mountainHeight) * drawHeight;
        const topY = startY + drawHeight - (zone.maxHeight / mountainHeight) * drawHeight;
        const zoneHeight = bottomY - topY;
        
        // 绘制自然带矩形
        this.ctx.fillStyle = zone.color;
        this.ctx.fillRect(startX, topY, drawWidth, zoneHeight);
        
        // 绘制分界线
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(startX, topY);
        this.ctx.lineTo(startX + drawWidth, topY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // 绘制自然带名称标签
        if (zoneHeight > 30) {
            const labelY = topY + zoneHeight / 2;
            this.drawLabel(zone.name, startX + drawWidth / 2, labelY);
        }
    }

    // 绘制标签
    drawLabel(text, x, y) {
        this.ctx.save();
        
        // 测量文本宽度
        this.ctx.font = 'bold 14px Microsoft YaHei';
        const metrics = this.ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = 20;
        
        // 绘制标签背景
        const padding = 8;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(
            x - textWidth / 2 - padding,
            y - textHeight / 2 - padding / 2,
            textWidth + padding * 2,
            textHeight + padding
        );
        
        // 绘制标签边框
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(
            x - textWidth / 2 - padding,
            y - textHeight / 2 - padding / 2,
            textWidth + padding * 2,
            textHeight + padding
        );
        
        // 绘制文本
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x, y);
        
        this.ctx.restore();
    }

    // 绘制海拔刻度
    drawAltitudeScale(mountainHeight, startX, startY, drawHeight) {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Microsoft YaHei';
        this.ctx.lineWidth = 1;
        
        // 计算刻度间隔
        const interval = this.calculateScaleInterval(mountainHeight);
        const scaleCount = Math.ceil(mountainHeight / interval);
        
        // 绘制左侧刻度
        for (let i = 0; i <= scaleCount; i++) {
            const height = i * interval;
            if (height > mountainHeight) break;
            
            const y = startY + drawHeight - (height / mountainHeight) * drawHeight;
            
            // 绘制刻度线
            this.ctx.beginPath();
            this.ctx.moveTo(startX - 10, y);
            this.ctx.lineTo(startX, y);
            this.ctx.stroke();
            
            // 绘制刻度文本
            this.ctx.textAlign = 'right';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(`${height}米`, startX - 15, y);
        }
        
        // 绘制右侧刻度
        const rightX = startX + (this.canvas.width - startX * 2);
        for (let i = 0; i <= scaleCount; i++) {
            const height = i * interval;
            if (height > mountainHeight) break;
            
            const y = startY + drawHeight - (height / mountainHeight) * drawHeight;
            
            // 绘制刻度线
            this.ctx.beginPath();
            this.ctx.moveTo(rightX, y);
            this.ctx.lineTo(rightX + 10, y);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }

    // 计算合适的刻度间隔
    calculateScaleInterval(mountainHeight) {
        if (mountainHeight <= 2000) return 500;
        if (mountainHeight <= 4000) return 1000;
        if (mountainHeight <= 6000) return 1000;
        return 2000;
    }

    // 绘制温度标注
    drawTemperatureLabels(zones, mountainHeight, startX, startY, drawWidth, drawHeight) {
        this.ctx.save();
        this.ctx.fillStyle = '#00e5ff';
        this.ctx.font = 'bold 12px Microsoft YaHei';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        
        const rightX = startX + drawWidth + 20;
        
        // 在关键位置显示温度
        const displayZones = zones.filter((zone, index) => {
            // 显示第一个、最后一个和中间的几个
            return index === 0 || index === zones.length - 1 || index % 2 === 0;
        });
        
        displayZones.forEach(zone => {
            const y = startY + drawHeight - ((zone.minHeight + zone.maxHeight) / 2 / mountainHeight) * drawHeight;
            const temp = ((zone.tempAtBottom + zone.tempAtTop) / 2).toFixed(1);
            this.ctx.fillText(`${temp}°C`, rightX, y);
        });
        
        this.ctx.restore();
    }

    // 绘制雪线标注
    drawSnowline(snowline, mountainHeight, startX, startY, drawWidth, drawHeight) {
        const y = startY + drawHeight - (snowline / mountainHeight) * drawHeight;
        
        this.ctx.save();
        
        // 绘制雪线虚线
        this.ctx.strokeStyle = '#00e5ff';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(startX, y);
        this.ctx.lineTo(startX + drawWidth, y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // 绘制雪线标签
        this.ctx.fillStyle = '#00e5ff';
        this.ctx.font = 'bold 13px Microsoft YaHei';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillText(`雪线 (${snowline}米)`, startX + drawWidth / 2, y - 5);
        
        this.ctx.restore();
    }
}

// 导出渲染器类
export default MountainRenderer;