export interface CityInfo {
  id: string
  nameZh: string
  nameEn: string
  timezone: string
  region: string
}

export const EAST_ASIA = 'eastAsia'
export const SOUTHEAST_ASIA = 'southeastAsia'
export const SOUTH_ASIA = 'southAsia'
export const MIDDLE_EAST = 'middleEast'
export const EUROPE_WEST = 'europeWest'
export const EUROPE_CENTRAL = 'europeCentral'
export const EUROPE_EAST = 'europeEast'
export const NORTH_AMERICA_EAST = 'northAmericaEast'
export const NORTH_AMERICA_CENTRAL = 'northAmericaCentral'
export const NORTH_AMERICA_WEST = 'northAmericaWest'
export const SOUTH_AMERICA = 'southAmerica'
export const OCEANIA = 'oceania'
export const AFRICA = 'africa'

const cities: CityInfo[] = [
  // East Asia
  { id: 'beijing', nameZh: '北京', nameEn: 'Beijing', timezone: 'Asia/Shanghai', region: EAST_ASIA },
  { id: 'tokyo', nameZh: '东京', nameEn: 'Tokyo', timezone: 'Asia/Tokyo', region: EAST_ASIA },
  { id: 'seoul', nameZh: '首尔', nameEn: 'Seoul', timezone: 'Asia/Seoul', region: EAST_ASIA },
  { id: 'taipei', nameZh: '台北', nameEn: 'Taipei', timezone: 'Asia/Taipei', region: EAST_ASIA },
  { id: 'hongkong', nameZh: '香港', nameEn: 'Hong Kong', timezone: 'Asia/Hong_Kong', region: EAST_ASIA },

  // Southeast Asia
  { id: 'singapore', nameZh: '新加坡', nameEn: 'Singapore', timezone: 'Asia/Singapore', region: SOUTHEAST_ASIA },
  { id: 'bangkok', nameZh: '曼谷', nameEn: 'Bangkok', timezone: 'Asia/Bangkok', region: SOUTHEAST_ASIA },
  { id: 'kualalumpur', nameZh: '吉隆坡', nameEn: 'Kuala Lumpur', timezone: 'Asia/Kuala_Lumpur', region: SOUTHEAST_ASIA },
  { id: 'manila', nameZh: '马尼拉', nameEn: 'Manila', timezone: 'Asia/Manila', region: SOUTHEAST_ASIA },
  { id: 'jakarta', nameZh: '雅加达', nameEn: 'Jakarta', timezone: 'Asia/Jakarta', region: SOUTHEAST_ASIA },
  { id: 'hanoi', nameZh: '河内', nameEn: 'Hanoi', timezone: 'Asia/Ho_Chi_Minh', region: SOUTHEAST_ASIA },
  { id: 'yangon', nameZh: '仰光', nameEn: 'Yangon', timezone: 'Asia/Yangon', region: SOUTHEAST_ASIA },

  // South Asia
  { id: 'mumbai', nameZh: '孟买', nameEn: 'Mumbai', timezone: 'Asia/Kolkata', region: SOUTH_ASIA },
  { id: 'kolkata', nameZh: '加尔各答', nameEn: 'Kolkata', timezone: 'Asia/Kolkata', region: SOUTH_ASIA },
  { id: 'dhaka', nameZh: '达卡', nameEn: 'Dhaka', timezone: 'Asia/Dhaka', region: SOUTH_ASIA },
  { id: 'colombo', nameZh: '科伦坡', nameEn: 'Colombo', timezone: 'Asia/Colombo', region: SOUTH_ASIA },

  // Middle East
  { id: 'dubai', nameZh: '迪拜', nameEn: 'Dubai', timezone: 'Asia/Dubai', region: MIDDLE_EAST },
  { id: 'abudhabi', nameZh: '阿布扎比', nameEn: 'Abu Dhabi', timezone: 'Asia/Dubai', region: MIDDLE_EAST },
  { id: 'riyadh', nameZh: '利雅得', nameEn: 'Riyadh', timezone: 'Asia/Riyadh', region: MIDDLE_EAST },
  { id: 'doha', nameZh: '多哈', nameEn: 'Doha', timezone: 'Asia/Qatar', region: MIDDLE_EAST },
  { id: 'tehran', nameZh: '德黑兰', nameEn: 'Tehran', timezone: 'Asia/Tehran', region: MIDDLE_EAST },
  { id: 'telaviv', nameZh: '特拉维夫', nameEn: 'Tel Aviv', timezone: 'Asia/Jerusalem', region: MIDDLE_EAST },
  { id: 'istanbul', nameZh: '伊斯坦布尔', nameEn: 'Istanbul', timezone: 'Europe/Istanbul', region: MIDDLE_EAST },

  // Europe (Western)
  { id: 'london', nameZh: '伦敦', nameEn: 'London', timezone: 'Europe/London', region: EUROPE_WEST },
  { id: 'dublin', nameZh: '都柏林', nameEn: 'Dublin', timezone: 'Europe/Dublin', region: EUROPE_WEST },
  { id: 'lisbon', nameZh: '里斯本', nameEn: 'Lisbon', timezone: 'Europe/Lisbon', region: EUROPE_WEST },

  // Europe (Central)
  { id: 'paris', nameZh: '巴黎', nameEn: 'Paris', timezone: 'Europe/Paris', region: EUROPE_CENTRAL },
  { id: 'berlin', nameZh: '柏林', nameEn: 'Berlin', timezone: 'Europe/Berlin', region: EUROPE_CENTRAL },
  { id: 'rome', nameZh: '罗马', nameEn: 'Rome', timezone: 'Europe/Rome', region: EUROPE_CENTRAL },
  { id: 'madrid', nameZh: '马德里', nameEn: 'Madrid', timezone: 'Europe/Madrid', region: EUROPE_CENTRAL },
  { id: 'amsterdam', nameZh: '阿姆斯特丹', nameEn: 'Amsterdam', timezone: 'Europe/Amsterdam', region: EUROPE_CENTRAL },
  { id: 'brussels', nameZh: '布鲁塞尔', nameEn: 'Brussels', timezone: 'Europe/Brussels', region: EUROPE_CENTRAL },
  { id: 'vienna', nameZh: '维也纳', nameEn: 'Vienna', timezone: 'Europe/Vienna', region: EUROPE_CENTRAL },
  { id: 'stockholm', nameZh: '斯德哥尔摩', nameEn: 'Stockholm', timezone: 'Europe/Stockholm', region: EUROPE_CENTRAL },
  { id: 'zurich', nameZh: '苏黎世', nameEn: 'Zurich', timezone: 'Europe/Zurich', region: EUROPE_CENTRAL },
  { id: 'copenhagen', nameZh: '哥本哈根', nameEn: 'Copenhagen', timezone: 'Europe/Copenhagen', region: EUROPE_CENTRAL },
  { id: 'prague', nameZh: '布拉格', nameEn: 'Prague', timezone: 'Europe/Prague', region: EUROPE_CENTRAL },

  // Europe (Eastern)
  { id: 'moscow', nameZh: '莫斯科', nameEn: 'Moscow', timezone: 'Europe/Moscow', region: EUROPE_EAST },
  { id: 'athens', nameZh: '雅典', nameEn: 'Athens', timezone: 'Europe/Athens', region: EUROPE_EAST },
  { id: 'helsinki', nameZh: '赫尔辛基', nameEn: 'Helsinki', timezone: 'Europe/Helsinki', region: EUROPE_EAST },
  { id: 'kyiv', nameZh: '基辅', nameEn: 'Kyiv', timezone: 'Europe/Kyiv', region: EUROPE_EAST },
  { id: 'bucharest', nameZh: '布加勒斯特', nameEn: 'Bucharest', timezone: 'Europe/Bucharest', region: EUROPE_EAST },
  { id: 'warsaw', nameZh: '华沙', nameEn: 'Warsaw', timezone: 'Europe/Warsaw', region: EUROPE_EAST },

  // North America (East)
  { id: 'newyork', nameZh: '纽约', nameEn: 'New York', timezone: 'America/New_York', region: NORTH_AMERICA_EAST },
  { id: 'toronto', nameZh: '多伦多', nameEn: 'Toronto', timezone: 'America/Toronto', region: NORTH_AMERICA_EAST },
  { id: 'washington', nameZh: '华盛顿', nameEn: 'Washington DC', timezone: 'America/New_York', region: NORTH_AMERICA_EAST },
  { id: 'miami', nameZh: '迈阿密', nameEn: 'Miami', timezone: 'America/New_York', region: NORTH_AMERICA_EAST },
  { id: 'boston', nameZh: '波士顿', nameEn: 'Boston', timezone: 'America/New_York', region: NORTH_AMERICA_EAST },
  { id: 'atlanta', nameZh: '亚特兰大', nameEn: 'Atlanta', timezone: 'America/New_York', region: NORTH_AMERICA_EAST },

  // North America (Central)
  { id: 'chicago', nameZh: '芝加哥', nameEn: 'Chicago', timezone: 'America/Chicago', region: NORTH_AMERICA_CENTRAL },
  { id: 'dallas', nameZh: '达拉斯', nameEn: 'Dallas', timezone: 'America/Chicago', region: NORTH_AMERICA_CENTRAL },
  { id: 'houston', nameZh: '休斯顿', nameEn: 'Houston', timezone: 'America/Chicago', region: NORTH_AMERICA_CENTRAL },
  { id: 'mexicocity', nameZh: '墨西哥城', nameEn: 'Mexico City', timezone: 'America/Mexico_City', region: NORTH_AMERICA_CENTRAL },

  // North America (West)
  { id: 'losangeles', nameZh: '洛杉矶', nameEn: 'Los Angeles', timezone: 'America/Los_Angeles', region: NORTH_AMERICA_WEST },
  { id: 'sanfrancisco', nameZh: '旧金山', nameEn: 'San Francisco', timezone: 'America/Los_Angeles', region: NORTH_AMERICA_WEST },
  { id: 'vancouver', nameZh: '温哥华', nameEn: 'Vancouver', timezone: 'America/Vancouver', region: NORTH_AMERICA_WEST },
  { id: 'seattle', nameZh: '西雅图', nameEn: 'Seattle', timezone: 'America/Los_Angeles', region: NORTH_AMERICA_WEST },
  { id: 'denver', nameZh: '丹佛', nameEn: 'Denver', timezone: 'America/Denver', region: NORTH_AMERICA_WEST },
  { id: 'phoenix', nameZh: '凤凰城', nameEn: 'Phoenix', timezone: 'America/Phoenix', region: NORTH_AMERICA_WEST },

  // South America
  { id: 'saopaulo', nameZh: '圣保罗', nameEn: 'São Paulo', timezone: 'America/Sao_Paulo', region: SOUTH_AMERICA },
  { id: 'buenosaires', nameZh: '布宜诺斯艾利斯', nameEn: 'Buenos Aires', timezone: 'America/Argentina/Buenos_Aires', region: SOUTH_AMERICA },
  { id: 'santiago', nameZh: '圣地亚哥', nameEn: 'Santiago', timezone: 'America/Santiago', region: SOUTH_AMERICA },
  { id: 'lima', nameZh: '利马', nameEn: 'Lima', timezone: 'America/Lima', region: SOUTH_AMERICA },
  { id: 'bogota', nameZh: '波哥大', nameEn: 'Bogotá', timezone: 'America/Bogota', region: SOUTH_AMERICA },

  // Oceania
  { id: 'sydney', nameZh: '悉尼', nameEn: 'Sydney', timezone: 'Australia/Sydney', region: OCEANIA },
  { id: 'melbourne', nameZh: '墨尔本', nameEn: 'Melbourne', timezone: 'Australia/Melbourne', region: OCEANIA },
  { id: 'auckland', nameZh: '奥克兰', nameEn: 'Auckland', timezone: 'Pacific/Auckland', region: OCEANIA },
  { id: 'wellington', nameZh: '惠灵顿', nameEn: 'Wellington', timezone: 'Pacific/Auckland', region: OCEANIA },
  { id: 'perth', nameZh: '珀斯', nameEn: 'Perth', timezone: 'Australia/Perth', region: OCEANIA },
  { id: 'brisbane', nameZh: '布里斯班', nameEn: 'Brisbane', timezone: 'Australia/Brisbane', region: OCEANIA },

  // Africa
  { id: 'cairo', nameZh: '开罗', nameEn: 'Cairo', timezone: 'Africa/Cairo', region: AFRICA },
  { id: 'johannesburg', nameZh: '约翰内斯堡', nameEn: 'Johannesburg', timezone: 'Africa/Johannesburg', region: AFRICA },
  { id: 'nairobi', nameZh: '内罗毕', nameEn: 'Nairobi', timezone: 'Africa/Nairobi', region: AFRICA },
  { id: 'lagos', nameZh: '拉各斯', nameEn: 'Lagos', timezone: 'Africa/Lagos', region: AFRICA },
  { id: 'casablanca', nameZh: '卡萨布兰卡', nameEn: 'Casablanca', timezone: 'Africa/Casablanca', region: AFRICA },
  { id: 'capetown', nameZh: '开普敦', nameEn: 'Cape Town', timezone: 'Africa/Johannesburg', region: AFRICA },
]

export const REGION_META: Record<string, { nameZh: string; nameEn: string }> = {
  [EAST_ASIA]: { nameZh: '东亚', nameEn: 'East Asia' },
  [SOUTHEAST_ASIA]: { nameZh: '东南亚', nameEn: 'Southeast Asia' },
  [SOUTH_ASIA]: { nameZh: '南亚', nameEn: 'South Asia' },
  [MIDDLE_EAST]: { nameZh: '中东', nameEn: 'Middle East' },
  [EUROPE_WEST]: { nameZh: '西欧', nameEn: 'Western Europe' },
  [EUROPE_CENTRAL]: { nameZh: '中欧', nameEn: 'Central Europe' },
  [EUROPE_EAST]: { nameZh: '东欧', nameEn: 'Eastern Europe' },
  [NORTH_AMERICA_EAST]: { nameZh: '北美(东部)', nameEn: 'North America (East)' },
  [NORTH_AMERICA_CENTRAL]: { nameZh: '北美(中部)', nameEn: 'North America (Central)' },
  [NORTH_AMERICA_WEST]: { nameZh: '北美(西部)', nameEn: 'North America (West)' },
  [SOUTH_AMERICA]: { nameZh: '南美', nameEn: 'South America' },
  [OCEANIA]: { nameZh: '大洋洲', nameEn: 'Oceania' },
  [AFRICA]: { nameZh: '非洲', nameEn: 'Africa' },
}

export default cities
