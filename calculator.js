// 山地垂直自然带计算模块
export class MountainZoneCalculator {
    constructor() {
        // 纬度带配置
        this.latitudeConfigs = {
            subtropical: {
                name: '亚热带地区 (25°-35°)',
                tempGradient: 0.6, // 温度递减率 °C/100m
                zones: [
                    { name: '亚热带常绿阔叶林', minHeight: 0, maxHeight: 1200, color: '#228B22' },
                    { name: '针叶林', minHeight: 1200, maxHeight: 2000, color: '#4A7C59' },
                    { name: '针阔混交林', minHeight: 2000, maxHeight: 2800, color: '#6B8E23' },
                    { name: '高山草甸', minHeight: 2800, maxHeight: 3500, color: '#90C090' },
                    { name: '高山灌丛', minHeight: 3500, maxHeight: 4500, color: '#A8B9A5' },
                    { name: '高山荒漠', minHeight: 4500, maxHeight: 5500, color: '#C4A676' },
                    { name: '冰雪带', minHeight: 5500, maxHeight: 10000, color: '#E8F4F8' }
                ]
            },
            temperate: {
                name: '温带地区 (35°-50°)',
                tempGradient: 0.55,
                zones: [
                    { name: '温带阔叶林', minHeight: 0, maxHeight: 800, color: '#7CB342' },
                    { name: '针阔混交林', minHeight: 800, maxHeight: 1800, color: '#6B8E23' },
                    { name: '针叶林', minHeight: 1800, maxHeight: 2800, color: '#4A7C59' },
                    { name: '高山草甸', minHeight: 2800, maxHeight: 3600, color: '#90C090' },
                    { name: '高山灌丛', minHeight: 3600, maxHeight: 4500, color: '#A8B9A5' },
                    { name: '高山荒漠', minHeight: 4500, maxHeight: 5200, color: '#C4A676' },
                    { name: '冰雪带', minHeight: 5200, maxHeight: 10000, color: '#E8F4F8' }
                ]
            },
            'cold-temperate': {
                name: '寒温带地区 (50°-60°)',
                tempGradient: 0.5,
                zones: [
                    { name: '温带草原', minHeight: 0, maxHeight: 600, color: '#9ACD32' },
                    { name: '针叶林', minHeight: 600, maxHeight: 1500, color: '#4A7C59' },
                    { name: '高山灌丛', minHeight: 1500, maxHeight: 2500, color: '#A8B9A5' },
                    { name: '高山草甸', minHeight: 2500, maxHeight: 3200, color: '#90C090' },
                    { name: '高山荒漠', minHeight: 3200, maxHeight: 4000, color: '#C4A676' },
                    { name: '冰雪带', minHeight: 4000, maxHeight: 10000, color: '#E8F4F8' }
                ]
            },
            frigid: {
                name: '高寒带地区 (>60°)',
                tempGradient: 0.45,
                zones: [
                    { name: '高山灌丛', minHeight: 0, maxHeight: 500, color: '#A8B9A5' },
                    { name: '高山草甸', minHeight: 500, maxHeight: 1200, color: '#90C090' },
                    { name: '高山荒漠', minHeight: 1200, maxHeight: 2000, color: '#C4A676' },
                    { name: '冰雪带', minHeight: 2000, maxHeight: 10000, color: '#E8F4F8' }
                ]
            }
        };
    }

    // 计算指定海拔的温度
    calculateTemperature(height, baseTemp, gradient) {
        return baseTemp - (height * gradient / 100);
    }

    // 计算雪线高度
    calculateSnowline(baseTemp, gradient) {
        if (baseTemp <= 0) return 0;
        return Math.round((baseTemp / gradient) * 100);
    }

    // 获取当前参数下的自然带分布
    getZoneDistribution(latitudeType, baseTemp, mountainHeight) {
        const config = this.latitudeConfigs[latitudeType];
        const snowline = this.calculateSnowline(baseTemp, config.tempGradient);
        
        // 过滤出在山体高度范围内的自然带
        const activeZones = config.zones
            .filter(zone => zone.minHeight < mountainHeight)
            .map(zone => ({
                ...zone,
                maxHeight: Math.min(zone.maxHeight, mountainHeight),
                tempAtBottom: this.calculateTemperature(zone.minHeight, baseTemp, config.tempGradient),
                tempAtTop: this.calculateTemperature(Math.min(zone.maxHeight, mountainHeight), baseTemp, config.tempGradient)
            }))
            .filter(zone => zone.maxHeight > zone.minHeight);

        return {
            zones: activeZones,
            snowline: snowline,
            gradient: config.tempGradient,
            latitudeName: config.name
        };
    }
}

// 导出计算器实例
export const calculator = new MountainZoneCalculator();