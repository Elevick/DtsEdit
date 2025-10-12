import { 
  Cpu,
  DataLine, 
  Monitor,
  Setting,
  Link
} from '@element-plus/icons-vue'
import type { Category, DeviceTreeComponentsConfig } from '@/types/deviceTree'
import deviceTreeComponentsConfig from '@/config/deviceTreeComponents.json'

// 图标映射
const iconMap: Record<string, any> = {
  'Cpu': Cpu,
  'DataLine': DataLine,
  'Monitor': Monitor,
  'Setting': Setting,
  'Link': Link
}

/**
 * 加载设备树组件配置
 */
export function loadDeviceTreeComponents(): Category[] {
  // 从JSON文件加载配置
  const config = deviceTreeComponentsConfig as DeviceTreeComponentsConfig
  
  // 转换图标字符串为实际的图标组件
  return config.categories.map(category => ({
    ...category,
    icon: iconMap[category.icon] || Cpu,
    items: category.items.map(item => ({
      ...item,
      icon: iconMap[item.icon] || Cpu
    }))
  }))
}

/**
 * 热重载配置（用于开发环境动态更新配置）
 */
export function reloadDeviceTreeComponents(): Category[] {
  // 强制重新加载配置
  return loadDeviceTreeComponents()
}

/**
 * 根据类型获取组件配置
 */
export function getComponentByType(type: string) {
  const categories = loadDeviceTreeComponents()
  for (const category of categories) {
    const item = category.items.find(item => item.type === type)
    if (item) {
      return item
    }
  }
  return null
}

/**
 * 获取所有组件类型
 */
export function getAllComponentTypes(): string[] {
  const categories = loadDeviceTreeComponents()
  const types: string[] = []
  for (const category of categories) {
    for (const item of category.items) {
      types.push(item.type)
    }
  }
  return types
}

// 以下是旧的硬编码配置（已废弃，保留作为参考）
/*
const hardcodedConfig: DeviceTreeComponentsConfig = {
    "categories": [
      {
        "key": "soc",
        "label": "SOC",
        "icon": "Cpu",
        "color": "#409eff",
        "items": [
          {
            "type": "soc-main",
            "label": "主SOC",
            "icon": "Cpu",
            "category": "soc",
            "inputs": [],
            "outputs": [
              { "id": "cpu-bus", "name": "CPU总线" },
              { "id": "memory-bus", "name": "内存总线" },
              { "id": "peripheral-bus", "name": "外设总线" }
            ],
            "description": "系统级芯片主控制器"
          },
          {
            "type": "soc-cpu",
            "label": "CPU核心",
            "icon": "Cpu",
            "category": "soc",
            "inputs": [
              { "id": "cpu-bus", "name": "CPU总线" }
            ],
            "outputs": [],
            "description": "中央处理器核心"
          },
          {
            "type": "soc-memory",
            "label": "内存控制器",
            "icon": "Cpu",
            "category": "soc",
            "inputs": [
              { "id": "memory-bus", "name": "内存总线" }
            ],
            "outputs": [
              { "id": "dram", "name": "DRAM" },
              { "id": "sram", "name": "SRAM" }
            ],
            "description": "内存控制器"
          }
        ]
      },
      {
        "key": "cpu",
        "label": "CPU",
        "icon": "Setting",
        "color": "#67c23a",
        "items": [
          {
            "type": "cpu-arm",
            "label": "ARM核心",
            "icon": "Setting",
            "category": "cpu",
            "inputs": [
              { "id": "cpu-bus", "name": "CPU总线" }
            ],
            "outputs": [
              { "id": "cache", "name": "缓存" },
              { "id": "mmu", "name": "MMU" }
            ],
            "description": "ARM架构处理器核心"
          },
          {
            "type": "cpu-riscv",
            "label": "RISC-V核心",
            "icon": "Setting",
            "category": "cpu",
            "inputs": [
              { "id": "cpu-bus", "name": "CPU总线" }
            ],
            "outputs": [
              { "id": "cache", "name": "缓存" },
              { "id": "mmu", "name": "MMU" }
            ],
            "description": "RISC-V架构处理器核心"
          }
        ]
      },
      {
        "key": "i2c-bridge",
        "label": "I2C桥接",
        "icon": "Link",
        "color": "#e6a23c",
        "items": [
          {
            "type": "i2c-controller",
            "label": "I2C控制器",
            "icon": "Link",
            "category": "i2c-bridge",
            "inputs": [
              { "id": "peripheral-bus", "name": "外设总线" }
            ],
            "outputs": [
              { "id": "i2c-bus", "name": "I2C总线" }
            ],
            "description": "I2C总线控制器"
          },
          {
            "type": "i2c-mux",
            "label": "I2C多路复用器",
            "icon": "Link",
            "category": "i2c-bridge",
            "inputs": [
              { "id": "i2c-bus", "name": "I2C总线" }
            ],
            "outputs": [
              { "id": "i2c-channel-0", "name": "I2C通道0" },
              { "id": "i2c-channel-1", "name": "I2C通道1" },
              { "id": "i2c-channel-2", "name": "I2C通道2" },
              { "id": "i2c-channel-3", "name": "I2C通道3" }
            ],
            "description": "I2C多路复用器"
          }
        ]
      },
      {
        "key": "channel",
        "label": "通道",
        "icon": "DataLine",
        "color": "#f56c6c",
        "items": [
          {
            "type": "i2c-channel",
            "label": "I2C通道",
            "icon": "DataLine",
            "category": "channel",
            "inputs": [
              { "id": "i2c-bus", "name": "I2C总线" }
            ],
            "outputs": [
              { "id": "sda", "name": "SDA" },
              { "id": "scl", "name": "SCL" }
            ],
            "description": "I2C通信通道"
          },
          {
            "type": "spi-channel",
            "label": "SPI通道",
            "icon": "DataLine",
            "category": "channel",
            "inputs": [
              { "id": "spi-bus", "name": "SPI总线" }
            ],
            "outputs": [
              { "id": "mosi", "name": "MOSI" },
              { "id": "miso", "name": "MISO" },
              { "id": "sclk", "name": "SCLK" },
              { "id": "cs", "name": "CS" }
            ],
            "description": "SPI通信通道"
          },
          {
            "type": "uart-channel",
            "label": "UART通道",
            "icon": "DataLine",
            "category": "channel",
            "inputs": [
              { "id": "uart-bus", "name": "UART总线" }
            ],
            "outputs": [
              { "id": "tx", "name": "TX" },
              { "id": "rx", "name": "RX" }
            ],
            "description": "UART串口通道"
          }
        ]
      },
      {
        "key": "sensor",
        "label": "传感器",
        "icon": "Monitor",
        "color": "#909399",
        "items": [
          {
            "type": "sensor-temp",
            "label": "温度传感器",
            "icon": "Monitor",
            "category": "sensor",
            "inputs": [
              { "id": "i2c-bus", "name": "I2C总线" },
              { "id": "power", "name": "电源" }
            ],
            "outputs": [
              { "id": "data", "name": "数据" },
              { "id": "interrupt", "name": "中断" }
            ],
            "description": "温度测量传感器"
          },
          {
            "type": "sensor-humidity",
            "label": "湿度传感器",
            "icon": "Monitor",
            "category": "sensor",
            "inputs": [
              { "id": "i2c-bus", "name": "I2C总线" },
              { "id": "power", "name": "电源" }
            ],
            "outputs": [
              { "id": "data", "name": "数据" },
              { "id": "interrupt", "name": "中断" }
            ],
            "description": "湿度测量传感器"
          },
          {
            "type": "sensor-pressure",
            "label": "压力传感器",
            "icon": "Monitor",
            "category": "sensor",
            "inputs": [
              { "id": "i2c-bus", "name": "I2C总线" },
              { "id": "power", "name": "电源" }
            ],
            "outputs": [
              { "id": "data", "name": "数据" },
              { "id": "interrupt", "name": "中断" }
            ],
            "description": "压力测量传感器"
          },
          {
            "type": "sensor-accelerometer",
            "label": "加速度计",
            "icon": "Monitor",
            "category": "sensor",
            "inputs": [
              { "id": "i2c-bus", "name": "I2C总线" },
              { "id": "power", "name": "电源" }
            ],
            "outputs": [
              { "id": "data", "name": "数据" },
              { "id": "interrupt", "name": "中断" }
            ],
            "description": "三轴加速度传感器"
          }
        ]
      }
    ]
  }
*/
