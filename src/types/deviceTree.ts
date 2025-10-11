export interface ConnectionPoint {
  id: string
  name: string
}

export interface PaletteItem {
  type: string
  label: string
  icon: string
  category: string
  inputs: ConnectionPoint[]
  outputs: ConnectionPoint[]
  description?: string
}

export interface Category {
  key: string
  label: string
  icon: string
  color: string
  items: PaletteItem[]
}

export interface DeviceTreeComponentsConfig {
  categories: Category[]
}
