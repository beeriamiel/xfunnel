export const TLD_CONFIG = {
  // Common single-level TLDs
  singleLevel: new Set([
    'com', 'org', 'net', 'ai', 'io', 'xyz', 'co', 'app', 
    'dev', 'cloud', 'me', 'info', 'biz', 'tech', 'site',
    'online', 'store', 'shop', 'app', 'blog', 'edu', 'gov',
    'mil', 'int', 'eu', 'us', 'uk', 'de', 'fr', 'jp', 'cn',
    'ru', 'br', 'in', 'au', 'ca'
  ]),

  // Multi-level TLDs
  multiLevel: new Set([
    'co.uk', 'co.jp', 'co.il', 'co.in', 'co.za', 'co.nz',
    'com.au', 'com.br', 'com.cn', 'com.mx', 'com.sg',
    'edu.au', 'edu.cn', 'edu.hk', 'edu.sg',
    'gov.uk', 'gov.au', 'gov.cn',
    'org.uk', 'org.au', 'org.nz',
    'net.au', 'net.cn', 'net.nz'
  ])
}; 