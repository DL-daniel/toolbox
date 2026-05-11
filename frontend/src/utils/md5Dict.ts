// 常见密码/字符串列表（用于 MD5 逆向查找）
// 约 230 条常见弱口令和常用字符串
export const COMMON_PASSWORDS: string[] = [
  // 纯数字
  '123456', '12345678', '123456789', '1234567890', '1234567',
  '123123', '111111', '000000', '666666', '888888', '999999',
  '1234', '12345', '121212', '654321', '112233', '11111111',
  '123321', '10086', '10010', '5201314', '147258', '369369',
  // 键盘顺序
  'qwerty', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm', 'qwerty123',
  '1q2w3e4r', '1qaz2wsx', 'qwe123', 'asdfgh', 'zxcvbn',
  'qwertyuiop[]', 'asdfghjkl;\'', 'zxcvbnm,./',
  '1qazxsw2', 'zaq12wsx', '!@#$%^&*', 'qazwsx',
  // 常见单词
  'password', 'passw0rd', 'admin', 'root', 'login',
  'master', 'access', 'guest', 'temp', 'test',
  'demo', 'default', 'manager', 'server', 'system',
  'hello', 'world', 'welcome', 'monkey', 'dragon',
  'shadow', 'sunshine', 'princess', 'baseball', 'football',
  'starwars', 'trustno1', 'letmein', 'whatever', 'nothing',
  'batman', 'superman', 'michael', 'jennifer', 'thomas',
  'jordan', 'hunter', 'ranger', 'killer', 'pepper',
  'summer', 'winter', 'spring', 'autumn', 'october',
  'november', 'december', 'january', 'february', 'march',
  'april', 'mayday', 'june', 'july', 'august',
  'september', 'thursday', 'friday', 'saturday', 'sunday',
  'monday', 'tuesday', 'wednesday',
  // 中文拼音相关
  'zhangsan', 'lisi', 'wangwu', 'zhaoliu',
  'beijing', 'shanghai', 'nanjing', 'hangzhou',
  'shenzhen', 'guangzhou', 'chengdu', 'wuhan',
  // 常见英文名
  'alex', 'bob', 'charlie', 'david', 'edward',
  'frank', 'george', 'henry', 'ivan', 'jack',
  'kevin', 'leo', 'mike', 'nick', 'oscar',
  'peter', 'queen', 'rose', 'sam', 'tom',
  'william', 'xavier', 'york', 'zack',
  'alice', 'betty', 'cindy', 'diana', 'emma',
  'fiona', 'grace', 'helen', 'iris', 'julia',
  'kate', 'linda', 'mary', 'nancy', 'olivia',
  // 常见组合
  'pass123', 'admin123', 'test123', 'demo123',
  'abc123', 'abc123456', 'abcd1234', 'a123456',
  'love123', 'iloveyou', 'lovely', 'forever',
  'sunny', 'happy', 'crystal', 'butterfly',
  'chocolate', 'rainbow', 'princess1',
  // 常见框架/技术相关
  'vue', 'react', 'angular', 'nodejs', 'typescript',
  'javascript', 'python', 'java', 'golang', 'rust',
  'docker', 'kubernetes', 'mysql', 'redis', 'nginx',
  'localhost', '127.0.0.1', 'debug', 'release',
  // 常见占位/默认
  'changeme', 'changethis', 'pleasechange',
  'P@ssw0rd', 'p@ssw0rd', 'Passw0rd',
  'secret', 'secret123', 'topsecret', 'classified',
  'password1', 'password123', 'password!',
  '1', '12',
  '0', '01', '012', '0123', '01234', '012345', '0123456', '01234567', '012345678',
  // 中文拼音常见密码
  'woaini', 'aini1314',
  'zhanghao', 'mima', 'yonghu', 'denglu',
  'shebei', 'guanli', 'xiangmu', 'gongsi',
]
