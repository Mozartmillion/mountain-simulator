// 山地垂直自然带计算模块
export class MountainZoneCalculator {
    constructor() {
        // 纬度带配置
        this.latitudeConfigs = {
            tropical: {
                name: '热带地区 (0°-25°)',
                tempGradient: 0.6, // 温度递减率 °C/100m
                zones: [
                    { name: '热带雨林', minHeight: 0, maxHeight: 1000, color: '#006400' },
                    { name: '亚热带常绿阔叶林', minHeight: 1000, maxHeight: 2000, color: '#228B22' },
                    { name: '针阔混交林', minHeight: 2000, maxHeight: 3000, color: '#6B8E23' },
                    { name: '针叶林', minHeight: 3000, maxHeight: 3800, color: '#4A7C59' },
                    { name: '高山草甸', minHeight: 3800, maxHeight: 4500, color: '#90C090' },
                    { name: '高山灌丛', minHeight: 4500, maxHeight: 5200, color: '#A8B9A5' },
                    { name: '高山荒漠', minHeight: 5200, maxHeight: 6000, color: '#C4A676' },
                    { name: '冰雪带', minHeight: 6000, maxHeight: 10000, color: '#E8F4F8' }
                ]
            },
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
        
        // 特殊情况：基准温度小于等于0°C时，整个山体都是冰雪带
        if (baseTemp <= 0) {
            const snowZoneColor = config.zones.find(z => z.name === '冰雪带')?.color || '#E8F4F8';
            return {
                zones: [{
                    name: '冰雪带',
                    minHeight: 0,
                    maxHeight: mountainHeight,
                    color: snowZoneColor,
                    imageUrl: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&q=80',
                    tempAtBottom: baseTemp,
                    tempAtTop: this.calculateTemperature(mountainHeight, baseTemp, config.tempGradient)
                }],
                snowline: 0,
                gradient: config.tempGradient,
                latitudeName: config.name
            };
        }
        
        // 过滤出在山体高度范围内的自然带
        let activeZones = config.zones
            .filter(zone => zone.minHeight < mountainHeight)
            .map(zone => ({
                ...zone,
                maxHeight: Math.min(zone.maxHeight, mountainHeight),
                tempAtBottom: this.calculateTemperature(zone.minHeight, baseTemp, config.tempGradient),
                tempAtTop: this.calculateTemperature(Math.min(zone.maxHeight, mountainHeight), baseTemp, config.tempGradient)
            }))
            .filter(zone => zone.maxHeight > zone.minHeight);

        // 关键修复：如果存在雪线且雪线在山体范围内，则雪线以上只能是冰雪带
        if (snowline > 0 && snowline < mountainHeight) {
            activeZones = activeZones.map(zone => {
                // 如果自然带跨越雪线
                if (zone.minHeight < snowline && zone.maxHeight > snowline) {
                    // 非冰雪带：截断到雪线位置
                    if (zone.name !== '冰雪带') {
                        return {
                            ...zone,
                            maxHeight: snowline,
                            tempAtTop: this.calculateTemperature(snowline, baseTemp, config.tempGradient)
                        };
                    }
                }
                // 如果自然带完全在雪线以上
                else if (zone.minHeight >= snowline) {
                    // 非冰雪带：移除
                    if (zone.name !== '冰雪带') {
                        return null;
                    }
                    // 冰雪带：从雪线开始
                    else {
                        return {
                            ...zone,
                            minHeight: snowline,
                            tempAtBottom: this.calculateTemperature(snowline, baseTemp, config.tempGradient)
                        };
                    }
                }
                return zone;
            }).filter(zone => zone !== null && zone.maxHeight > zone.minHeight);

            // 确保有冰雪带（从雪线到山顶）
            const hasSnowZone = activeZones.some(zone => zone.name === '冰雪带');
            if (!hasSnowZone && snowline < mountainHeight) {
                // 找到冰雪带的颜色
                const snowZoneColor = config.zones.find(z => z.name === '冰雪带')?.color || '#E8F4F8';
                activeZones.push({
                    name: '冰雪带',
                    minHeight: snowline,
                    maxHeight: mountainHeight,
                    color: snowZoneColor,
                    tempAtBottom: this.calculateTemperature(snowline, baseTemp, config.tempGradient),
                    tempAtTop: this.calculateTemperature(mountainHeight, baseTemp, config.tempGradient)
                });
            }
        }

        // 按海拔高度排序（从低到高）
        activeZones.sort((a, b) => a.minHeight - b.minHeight);

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