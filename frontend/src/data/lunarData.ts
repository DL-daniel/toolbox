// 农历数据 (1900-2100)
// 每项: [年份, 闰月(0=无), 农历月天数(二进制编码), 公历1月1日对应的农历月日...]
// 压缩格式: 每年用一个数字编码春节日期和各月大小
// 采用标准农历查找表
export interface LunarDate {
  year: number
  month: number
  day: number
  isLeap: boolean
}

// 1900-2100年农历数据
// 编码: 十六进制表示每年的农历月信息
// 前4位: 闰月月份 (0=无闰月)
// 中间位: 各月大小 (1=30天, 0=29天)
// 后4位: 春节所在公历日期
const lunarInfo = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, // 1900-1909
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, // 1910-1919
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, // 1920-1929
  0x06566, 0x0d4a0, 0x0ea50, 0x16a95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, // 1930-1939
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, // 1940-1949
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, // 1950-1959
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, // 1960-1969
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6, // 1970-1979
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, // 1980-1989
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0, // 1990-1999
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, // 2000-2009
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, // 2010-2019
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, // 2020-2029
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, // 2030-2039
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, // 2040-2049
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06aa0, 0x1a6c4, 0x0aae0, // 2050-2059
  0x092e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4, // 2060-2069
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, // 2070-2079
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160, // 2080-2089
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a4d0, 0x0d150, 0x0f252, // 2090-2099
  0x0d520, // 2100
];

const skyStems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const earthBranches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const zodiac = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
export function getLunarYearGanZhi(year: number): string {
  const idx = (year - 4) % 60;
  const gan = idx % 10;
  const zhi = idx % 12;
  return skyStems[gan] + earthBranches[zhi];
}

export function getZodiac(year: number): string {
  return zodiac[(year - 4) % 12];
}

export function solarToLunar(year: number, month: number, day: number): {
  lunarYear: number; lunarMonth: number; lunarDay: number; isLeap: boolean;
  ganZhi: string; zodiac: string;
} | null {
  const idx = year - 1900;
  if (idx < 0 || idx >= lunarInfo.length) return null;
  // 简化实现：返回基本干支和生肖信息
  const ganZhi = getLunarYearGanZhi(year);
  const zod = getZodiac(year);
  return { lunarYear: year, lunarMonth: month, lunarDay: day, isLeap: false, ganZhi, zodiac: zod };
}

// 老黄历宜忌数据
export interface AlmanacDay {
  dateStr: string
  lunarDate: string
  ganZhi: string
  zodiac: string
  yi: string[]
  ji: string[]
  chong: string
}

const yiAll = [
  '祭祀','求嗣','沐浴','理发','嫁娶','出行','移徙','入宅','安门','安床','合帐','冠笄','破土','安葬','立碑',
  '起基','动土','上梁','竖柱','开光','祈福','斋醮','出行','移徙','入宅','安机械','造车器','经络','酝酿',
  '造畜椆栖','修饰垣墙','平治道涂','伐木','捕捉','取渔','开池','开厕','结网','畋猎','牧养','纳畜','栽种',
  '开市','纳财','立券','交易','挂匾','开光','解除','伐木','破屋','坏垣','馀事勿取','入学','开工','开业',
  '开张','签约','订盟','纳采','裁衣','会亲友','进人口','装修','动土','搬家','安香','出火','归火','盖屋',
  '合脊','穿井','放水','开渠','筑堤','补垣','塞穴','取渔','入殓','移柩','启钻','谢土','修坟','成服',
  '除服','开生坟','合寿木','入殓','移柩','成服','除服','启钻','谢土','整手足甲','扫舍','求医','治病',
  '入学','求嗣','纳婿','解除','伐木','破屋','坏垣','烧香','诵经','设醮','酬神','探病','理发','沐浴',
];

const jiAll = [
  '出行','嫁娶','入宅','安葬','安门','安床','开市','动土','破土','上梁','盖屋','搬家','移徙','伐木',
  '作灶','造船','经络','酝酿','开池','开厕','结网','畋猎','捕捉','纳畜','取渔','栽种','放水','开渠',
  '筑堤','补垣','塞穴','修饰垣墙','平治道涂','破屋','坏垣','馀事勿取','祭祀','求嗣','祈福','开光',
  '解除','入学','求医','治病','开市','纳财','立券','交易','挂匾','入殓','移柩','启钻','合寿木',
  '谢土','修坟','成服','除服','探病','理发','沐浴','塑绘','斋醮','出行','移徙','入宅','安机械',
  '造车器','经络','酝酿','造畜椆栖','修饰垣墙','伐木','捕捉','取渔','开池','开厕','结网','畋猎',
  '牧养','纳畜','栽种','开市','纳财','立券','交易','挂匾','开光','解除','伐木','破屋','坏垣',
];

export function getRandomYiJi(): { yi: string[]; ji: string[] } {
  const yiCount = 3 + Math.floor(Math.random() * 6);
  const jiCount = 2 + Math.floor(Math.random() * 5);
  const shuffledYi = [...yiAll].sort(() => Math.random() - 0.5);
  const shuffledJi = [...jiAll].sort(() => Math.random() - 0.5);
  // Remove overlaps
  const filteredYi = shuffledYi.filter(x => !shuffledJi.slice(0, jiCount).includes(x));
  return {
    yi: filteredYi.slice(0, yiCount),
    ji: shuffledJi.slice(0, jiCount),
  };
}
