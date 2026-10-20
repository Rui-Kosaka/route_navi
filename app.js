'use strict';

// ============================================================
// 駅間ルートナビ — 駅データ・経路探索・UI
// ============================================================

// ---------- 路線データ ----------
const LINES = [
  {
    id:'yamanote', name:'JR山手線', short:'山手線', color:'#80C241', type:'JR', circular:true,
    stations:['東京','神田','秋葉原','御徒町','上野','鶯谷','日暮里','西日暮里','田端','駒込','巣鴨','大塚','池袋','目白','高田馬場','新大久保','新宿','代々木','原宿','渋谷','恵比寿','目黒','五反田','大崎','品川','高輪ゲートウェイ','田町','浜松町','新橋','有楽町'],
    times:[2,2,2,2,2,2,1,2,2,2,2,3,2,2,2,2,2,2,2,2,3,2,3,3,2,2,3,2,2,2]
  },
  {
    id:'chuo', name:'JR中央線快速', short:'中央線', color:'#F15A22', type:'JR',
    stations:['東京','神田','御茶ノ水','四ツ谷','新宿','中野','高円寺','阿佐ヶ谷','荻窪','吉祥寺','三鷹'],
    times:[2,2,5,5,5,2,2,2,4,2]
  },
  {
    id:'sobu', name:'JR中央・総武線各駅停車', short:'総武線', color:'#FFD400', type:'JR',
    stations:['中野','東中野','大久保','新宿','代々木','千駄ケ谷','信濃町','四ツ谷','市ヶ谷','飯田橋','水道橋','御茶ノ水','秋葉原','浅草橋','両国','錦糸町','亀戸','平井','新小岩','小岩','市川','本八幡','下総中山','西船橋','船橋'],
    times:[2,2,2,2,2,2,2,2,2,2,2,3,2,2,3,2,2,3,3,3,2,2,3,3]
  },
  {
    id:'keihin', name:'JR京浜東北線', short:'京浜東北線', color:'#00B2E5', type:'JR',
    stations:['大宮','さいたま新都心','浦和','南浦和','蕨','西川口','川口','赤羽','東十条','王子','上中里','田端','西日暮里','日暮里','鶯谷','上野','御徒町','秋葉原','神田','東京','有楽町','新橋','浜松町','田町','高輪ゲートウェイ','品川','大井町','大森','蒲田'],
    times:[3,4,2,3,2,2,3,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,3,2,2,3,3,3]
  },
  {
    id:'ginza', name:'東京メトロ銀座線', short:'銀座線', color:'#FF9500', type:'東京メトロ',
    stations:['渋谷','表参道','外苑前','青山一丁目','赤坂見附','溜池山王','虎ノ門','新橋','銀座','京橋','日本橋','三越前','神田','末広町','上野広小路','上野','稲荷町','田原町','浅草'],
    times:[2,2,2,2,2,2,2,2,2,1,2,1,2,2,1,2,1,2]
  },
  {
    id:'marunouchi', name:'東京メトロ丸ノ内線', short:'丸ノ内線', color:'#F62E36', type:'東京メトロ',
    stations:['荻窪','南阿佐ヶ谷','新高円寺','東高円寺','新中野','中野坂上','西新宿','新宿','新宿三丁目','四谷三丁目','四ツ谷','赤坂見附','国会議事堂前','霞ケ関','銀座','東京','大手町','淡路町','御茶ノ水','本郷三丁目','後楽園','茗荷谷','新大塚','池袋'],
    times:[2,2,1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,1,2,2,2,2,3]
  },
  {
    id:'hibiya', name:'東京メトロ日比谷線', short:'日比谷線', color:'#9CAEB7', type:'東京メトロ',
    stations:['中目黒','恵比寿','広尾','六本木','神谷町','虎ノ門ヒルズ','霞ケ関','日比谷','銀座','東銀座','築地','八丁堀','茅場町','人形町','小伝馬町','秋葉原','仲御徒町','上野','入谷','三ノ輪','南千住','北千住'],
    times:[2,2,3,2,1,2,1,1,2,2,2,1,2,2,2,1,2,2,2,2,3]
  },
  {
    id:'tozai', name:'東京メトロ東西線', short:'東西線', color:'#009BBF', type:'東京メトロ',
    stations:['中野','落合','高田馬場','早稲田','神楽坂','飯田橋','九段下','竹橋','大手町','日本橋','茅場町','門前仲町','木場','東陽町','南砂町','西葛西','葛西','浦安','南行徳','行徳','妙典','原木中山','西船橋'],
    times:[3,2,3,2,1,2,2,2,1,2,2,2,2,3,3,2,2,2,2,2,2,3]
  },
  {
    id:'chiyoda', name:'東京メトロ千代田線', short:'千代田線', color:'#00A650', type:'東京メトロ',
    stations:['代々木上原','代々木公園','明治神宮前','表参道','乃木坂','赤坂','国会議事堂前','霞ケ関','日比谷','二重橋前','大手町','新御茶ノ水','湯島','根津','千駄木','西日暮里','町屋','北千住','綾瀬','北綾瀬'],
    times:[1,2,2,2,2,2,1,1,2,2,2,2,1,1,2,3,2,3,4]
  },
  {
    id:'yurakucho', name:'東京メトロ有楽町線', short:'有楽町線', color:'#C1A470', type:'東京メトロ',
    stations:['和光市','地下鉄成増','地下鉄赤塚','平和台','氷川台','小竹向原','千川','要町','池袋','東池袋','護国寺','江戸川橋','飯田橋','市ヶ谷','麹町','永田町','桜田門','有楽町','銀座一丁目','新富町','月島','豊洲','辰巳','新木場'],
    times:[2,2,2,2,2,2,1,3,2,2,2,2,2,2,2,1,2,1,2,2,2,2,3]
  },
  {
    id:'hanzomon', name:'東京メトロ半蔵門線', short:'半蔵門線', color:'#8F76D6', type:'東京メトロ',
    stations:['渋谷','表参道','青山一丁目','永田町','半蔵門','九段下','神保町','大手町','三越前','水天宮前','清澄白河','住吉','錦糸町','押上'],
    times:[2,2,2,2,2,2,2,2,2,3,2,3,3]
  },
  {
    id:'namboku', name:'東京メトロ南北線', short:'南北線', color:'#00ADA9', type:'東京メトロ',
    stations:['目黒','白金台','白金高輪','麻布十番','六本木一丁目','溜池山王','永田町','四ツ谷','市ヶ谷','飯田橋','後楽園','東大前','本駒込','駒込','西ヶ原','王子','王子神谷','志茂','赤羽岩淵'],
    times:[2,2,2,2,2,2,3,2,2,2,2,2,1,3,2,2,2,2]
  },
  {
    id:'fukutoshin', name:'東京メトロ副都心線', short:'副都心線', color:'#9C5E31', type:'東京メトロ',
    stations:['和光市','地下鉄成増','地下鉄赤塚','平和台','氷川台','小竹向原','千川','要町','池袋','雑司が谷','西早稲田','東新宿','新宿三丁目','北参道','明治神宮前','渋谷'],
    times:[2,2,2,2,2,2,1,3,2,2,2,2,2,2,2]
  },
  {
    id:'asakusa', name:'都営浅草線', short:'浅草線', color:'#E85298', type:'都営地下鉄',
    stations:['西馬込','馬込','中延','戸越','五反田','高輪台','泉岳寺','三田','大門','新橋','東銀座','宝町','日本橋','人形町','東日本橋','浅草橋','蔵前','浅草','押上'],
    times:[2,2,2,2,2,2,2,2,2,1,2,1,2,2,2,2,2,3]
  },
  {
    id:'mita', name:'都営三田線', short:'三田線', color:'#0079C2', type:'都営地下鉄',
    stations:['目黒','白金台','白金高輪','三田','芝公園','御成門','内幸町','日比谷','大手町','神保町','水道橋','春日','白山','千石','巣鴨','西巣鴨','新板橋','板橋区役所前','板橋本町','本蓮沼','志村坂上','志村三丁目','蓮根','西台','高島平','新高島平','西高島平'],
    times:[2,2,2,2,2,1,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1,2,1,2,1,2]
  },
  {
    id:'shinjuku_line', name:'都営新宿線', short:'新宿線', color:'#6CBB5A', type:'都営地下鉄',
    stations:['新宿','新宿三丁目','曙橋','市ヶ谷','九段下','神保町','小川町','岩本町','馬喰横山','浜町','森下','菊川','住吉','西大島','大島','東大島','船堀','一之江','瑞江','篠崎','本八幡'],
    times:[1,2,2,2,2,2,2,2,2,1,2,2,3,1,2,3,2,2,2,3]
  },
  {
    id:'oedo', name:'都営大江戸線', short:'大江戸線', color:'#B6007A', type:'都営地下鉄', circular:true,
    stations:['都庁前','新宿西口','東新宿','若松河田','牛込柳町','牛込神楽坂','飯田橋','春日','本郷三丁目','上野御徒町','新御徒町','蔵前','両国','森下','清澄白河','門前仲町','月島','勝どき','築地市場','汐留','大門','赤羽橋','麻布十番','六本木','青山一丁目','国立競技場','代々木','新宿'],
    times:[2,3,2,1,2,2,2,2,2,2,3,2,2,2,2,2,2,2,2,2,2,2,2,2,3,2,2,2]
  },
  {
    id:'odakyu_odawara', name:'小田急小田原線', short:'小田急線', color:'#2288CC', type:'小田急電鉄',
    stations:['新宿','南新宿','参宮橋','代々木八幡','代々木上原','東北沢','下北沢','世田谷代田','梅ヶ丘','豪徳寺','経堂','千歳船橋','祖師ヶ谷大蔵','成城学園前','喜多見','狛江','和泉多摩川','登戸'],
    times:[2,2,2,2,2,2,2,2,2,3,2,3,3,2,2,2,3]
  },
  {
    id:'keio', name:'京王線', short:'京王線', color:'#DD0077', type:'京王電鉄',
    stations:['新宿','笹塚','明大前','下高井戸','桜上水','上北沢','八幡山','芦花公園','千歳烏山','仙川','つつじヶ丘','柴崎','国領','布田','調布'],
    times:[5,4,2,2,2,2,2,2,3,2,2,2,2,3]
  },
  {
    id:'keio_inokashira', name:'京王井の頭線', short:'井の頭線', color:'#00A0E9', type:'京王電鉄',
    stations:['渋谷','神泉','駒場東大前','池ノ上','下北沢','新代田','東松原','明大前','永福町','西永福','浜田山','高井戸','富士見ヶ丘','久我山','三鷹台','井の頭公園','吉祥寺'],
    times:[2,2,2,2,2,2,2,3,2,2,2,2,2,2,2,2]
  },
  {
    id:'tokyu_toyoko', name:'東急東横線', short:'東横線', color:'#DA2128', type:'東急電鉄',
    stations:['渋谷','代官山','中目黒','祐天寺','学芸大学','都立大学','自由が丘','田園調布','多摩川','新丸子','武蔵小杉'],
    times:[2,2,3,2,2,3,3,2,2,2]
  },
  {
    id:'tokyu_denentoshi', name:'東急田園都市線', short:'田園都市線', color:'#00A040', type:'東急電鉄',
    stations:['渋谷','池尻大橋','三軒茶屋','駒沢大学','桜新町','用賀','二子玉川'],
    times:[2,2,2,3,2,3]
  },
  {
    id:'tokyu_meguro', name:'東急目黒線', short:'目黒線', color:'#009CD2', type:'東急電鉄',
    stations:['目黒','不動前','武蔵小山','西小山','洗足','大岡山','奥沢','田園調布','多摩川','新丸子','武蔵小杉'],
    times:[2,2,2,2,2,2,2,2,2,2]
  },
  {
    id:'keikyu_main', name:'京急本線', short:'京急線', color:'#E60012', type:'京浜急行電鉄',
    stations:['品川','北品川','新馬場','青物横丁','鮫洲','立会川','大森海岸','平和島','大森町','梅屋敷','京急蒲田'],
    times:[2,2,2,2,2,2,2,2,2,2]
  },
  {
    id:'seibu_shinjuku', name:'西武新宿線', short:'西武新宿線', color:'#0068B7', type:'西武鉄道',
    stations:['西武新宿','高田馬場','下落合','中井','新井薬師前','沼袋','野方','都立家政','鷺ノ宮'],
    times:[2,2,2,2,2,2,2,2]
  }
];

// ---------- 乗り換えグループ ----------
// 同一駅・隣接駅で乗り換え可能な組み合わせ
// entries: [[lineId, stationName], ...], time: 乗り換え所要分
const TRANSFER_GROUPS = [
  // 渋谷
  {entries:[['yamanote','渋谷'],['ginza','渋谷'],['hanzomon','渋谷'],['fukutoshin','渋谷']], time:5},
  // 表参道
  {entries:[['ginza','表参道'],['chiyoda','表参道'],['hanzomon','表参道']], time:3},
  // 青山一丁目
  {entries:[['ginza','青山一丁目'],['hanzomon','青山一丁目'],['oedo','青山一丁目']], time:4},
  // 赤坂見附 ↔ 永田町
  {entries:[['ginza','赤坂見附'],['marunouchi','赤坂見附'],['yurakucho','永田町'],['hanzomon','永田町'],['namboku','永田町']], time:5},
  // 溜池山王 ↔ 国会議事堂前
  {entries:[['ginza','溜池山王'],['namboku','溜池山王'],['marunouchi','国会議事堂前'],['chiyoda','国会議事堂前']], time:4},
  // 霞ケ関
  {entries:[['marunouchi','霞ケ関'],['hibiya','霞ケ関'],['chiyoda','霞ケ関']], time:4},
  // 虎ノ門 ↔ 虎ノ門ヒルズ
  {entries:[['ginza','虎ノ門'],['hibiya','虎ノ門ヒルズ']], time:5},
  // 新橋
  {entries:[['yamanote','新橋'],['ginza','新橋'],['asakusa','新橋']], time:4},
  // 銀座
  {entries:[['ginza','銀座'],['marunouchi','銀座'],['hibiya','銀座']], time:3},
  // 銀座 ↔ 銀座一丁目
  {entries:[['ginza','銀座'],['marunouchi','銀座'],['hibiya','銀座'],['yurakucho','銀座一丁目']], time:5},
  // 日比谷 ↔ 有楽町
  {entries:[['yamanote','有楽町'],['chiyoda','日比谷'],['mita','日比谷'],['hibiya','日比谷'],['yurakucho','有楽町']], time:5},
  // 東京
  {entries:[['yamanote','東京'],['chuo','東京'],['keihin','東京'],['marunouchi','東京']], time:4},
  // 大手町
  {entries:[['marunouchi','大手町'],['tozai','大手町'],['chiyoda','大手町'],['hanzomon','大手町'],['mita','大手町']], time:5},
  // 東京 ↔ 大手町（徒歩連絡）
  {entries:[['yamanote','東京'],['chuo','東京'],['marunouchi','東京'],['tozai','大手町'],['chiyoda','大手町'],['hanzomon','大手町'],['mita','大手町']], time:7},
  // 日本橋
  {entries:[['ginza','日本橋'],['tozai','日本橋'],['asakusa','日本橋']], time:4},
  // 三越前
  {entries:[['ginza','三越前'],['hanzomon','三越前']], time:3},
  // 神田
  {entries:[['yamanote','神田'],['ginza','神田'],['chuo','神田'],['keihin','神田']], time:3},
  // 上野
  {entries:[['yamanote','上野'],['ginza','上野'],['hibiya','上野'],['keihin','上野']], time:4},
  // 御徒町エリア
  {entries:[['yamanote','御徒町'],['keihin','御徒町'],['hibiya','仲御徒町'],['ginza','上野広小路'],['oedo','上野御徒町']], time:5},
  // 秋葉原 ↔ 岩本町
  {entries:[['yamanote','秋葉原'],['hibiya','秋葉原'],['keihin','秋葉原'],['shinjuku_line','岩本町']], time:5},
  // 総武線（各駅停車）の乗り換え
  {entries:[['sobu','秋葉原'],['yamanote','秋葉原'],['keihin','秋葉原'],['hibiya','秋葉原']], time:3},
  {entries:[['sobu','秋葉原'],['shinjuku_line','岩本町']], time:6},
  {entries:[['sobu','御茶ノ水'],['chuo','御茶ノ水']], time:1},
  {entries:[['sobu','御茶ノ水'],['marunouchi','御茶ノ水'],['chiyoda','新御茶ノ水']], time:4},
  {entries:[['sobu','錦糸町'],['hanzomon','錦糸町']], time:3},
  {entries:[['sobu','両国'],['oedo','両国']], time:4},
  {entries:[['sobu','浅草橋'],['asakusa','浅草橋']], time:3},
  {entries:[['sobu','水道橋'],['mita','水道橋']], time:3},
  {entries:[['sobu','飯田橋'],['tozai','飯田橋'],['yurakucho','飯田橋'],['namboku','飯田橋'],['oedo','飯田橋']], time:5},
  {entries:[['sobu','市ヶ谷'],['yurakucho','市ヶ谷'],['namboku','市ヶ谷'],['shinjuku_line','市ヶ谷']], time:4},
  {entries:[['sobu','四ツ谷'],['chuo','四ツ谷']], time:2},
  {entries:[['sobu','四ツ谷'],['marunouchi','四ツ谷'],['namboku','四ツ谷']], time:4},
  {entries:[['sobu','代々木'],['yamanote','代々木'],['oedo','代々木']], time:3},
  {entries:[['sobu','新宿'],['yamanote','新宿'],['chuo','新宿']], time:3},
  {entries:[['sobu','新宿'],['marunouchi','新宿'],['shinjuku_line','新宿'],['oedo','新宿'],['oedo','新宿西口']], time:5},
  {entries:[['sobu','中野'],['chuo','中野'],['tozai','中野']], time:3},
  {entries:[['sobu','本八幡'],['shinjuku_line','本八幡']], time:4},
  {entries:[['sobu','西船橋'],['tozai','西船橋']], time:3},
  // 池袋
  {entries:[['yamanote','池袋'],['marunouchi','池袋'],['yurakucho','池袋'],['fukutoshin','池袋']], time:5},
  // 新宿
  {entries:[['yamanote','新宿'],['chuo','新宿'],['marunouchi','新宿'],['shinjuku_line','新宿'],['oedo','新宿']], time:5},
  // 新宿三丁目
  {entries:[['marunouchi','新宿三丁目'],['fukutoshin','新宿三丁目'],['shinjuku_line','新宿三丁目']], time:3},
  // 飯田橋
  {entries:[['tozai','飯田橋'],['yurakucho','飯田橋'],['namboku','飯田橋'],['oedo','飯田橋']], time:5},
  // 九段下
  {entries:[['tozai','九段下'],['hanzomon','九段下'],['shinjuku_line','九段下']], time:4},
  // 市ヶ谷
  {entries:[['yurakucho','市ヶ谷'],['namboku','市ヶ谷'],['shinjuku_line','市ヶ谷']], time:4},
  // 後楽園 ↔ 春日
  {entries:[['marunouchi','後楽園'],['namboku','後楽園'],['mita','春日'],['oedo','春日']], time:4},
  // 目黒
  {entries:[['yamanote','目黒'],['namboku','目黒'],['mita','目黒']], time:3},
  // 白金台
  {entries:[['namboku','白金台'],['mita','白金台']], time:2},
  // 白金高輪
  {entries:[['namboku','白金高輪'],['mita','白金高輪']], time:2},
  // 麻布十番
  {entries:[['namboku','麻布十番'],['oedo','麻布十番']], time:4},
  // 六本木
  {entries:[['hibiya','六本木'],['oedo','六本木']], time:5},
  // 大門 ↔ 浜松町
  {entries:[['yamanote','浜松町'],['keihin','浜松町'],['asakusa','大門'],['oedo','大門']], time:4},
  // 三田 ↔ 田町
  {entries:[['yamanote','田町'],['keihin','田町'],['asakusa','三田'],['mita','三田']], time:4},
  // 恵比寿
  {entries:[['yamanote','恵比寿'],['hibiya','恵比寿']], time:3},
  // 茅場町
  {entries:[['hibiya','茅場町'],['tozai','茅場町']], time:3},
  // 人形町
  {entries:[['hibiya','人形町'],['asakusa','人形町']], time:3},
  // 門前仲町
  {entries:[['tozai','門前仲町'],['oedo','門前仲町']], time:4},
  // 清澄白河
  {entries:[['hanzomon','清澄白河'],['oedo','清澄白河']], time:3},
  // 住吉
  {entries:[['hanzomon','住吉'],['shinjuku_line','住吉']], time:3},
  // 押上
  {entries:[['hanzomon','押上'],['asakusa','押上']], time:3},
  // 北千住
  {entries:[['hibiya','北千住'],['chiyoda','北千住']], time:3},
  // 西日暮里
  {entries:[['yamanote','西日暮里'],['keihin','西日暮里'],['chiyoda','西日暮里']], time:3},
  // 明治神宮前 ↔ 原宿
  {entries:[['chiyoda','明治神宮前'],['fukutoshin','明治神宮前'],['yamanote','原宿']], time:5},
  // 神保町
  {entries:[['hanzomon','神保町'],['mita','神保町'],['shinjuku_line','神保町']], time:3},
  // 東銀座
  {entries:[['hibiya','東銀座'],['asakusa','東銀座']], time:3},
  // 月島
  {entries:[['yurakucho','月島'],['oedo','月島']], time:3},
  // 森下
  {entries:[['shinjuku_line','森下'],['oedo','森下']], time:3},
  // 本郷三丁目
  {entries:[['marunouchi','本郷三丁目'],['oedo','本郷三丁目']], time:4},
  // 蔵前
  {entries:[['asakusa','蔵前'],['oedo','蔵前']], time:6},
  // 高田馬場
  {entries:[['yamanote','高田馬場'],['tozai','高田馬場']], time:3},
  // 中野
  {entries:[['chuo','中野'],['tozai','中野']], time:3},
  // 四ツ谷
  {entries:[['chuo','四ツ谷'],['marunouchi','四ツ谷'],['namboku','四ツ谷']], time:4},
  // 御茶ノ水 ↔ 新御茶ノ水
  {entries:[['chuo','御茶ノ水'],['marunouchi','御茶ノ水'],['chiyoda','新御茶ノ水']], time:4},
  // 淡路町 ↔ 小川町
  {entries:[['marunouchi','淡路町'],['shinjuku_line','小川町']], time:4},
  // 駒込
  {entries:[['yamanote','駒込'],['namboku','駒込']], time:3},
  // 巣鴨
  {entries:[['yamanote','巣鴨'],['mita','巣鴨']], time:3},
  // 代々木
  {entries:[['yamanote','代々木'],['oedo','代々木']], time:3},
  // 東新宿
  {entries:[['fukutoshin','東新宿'],['oedo','東新宿']], time:3},
  // 五反田
  {entries:[['yamanote','五反田'],['asakusa','五反田']], time:4},
  // 日暮里
  {entries:[['yamanote','日暮里'],['keihin','日暮里']], time:2},
  // 鶯谷
  {entries:[['yamanote','鶯谷'],['keihin','鶯谷']], time:2},
  // 田端
  {entries:[['yamanote','田端'],['keihin','田端']], time:2},
  // 王子
  {entries:[['keihin','王子'],['namboku','王子']], time:4},
  // 赤羽
  {entries:[['keihin','赤羽'],['namboku','赤羽岩淵']], time:8},
  // 品川
  {entries:[['yamanote','品川'],['keihin','品川']], time:3},
  // 大崎（JRのみなので省略）
  // 東日本橋 ↔ 馬喰横山
  {entries:[['asakusa','東日本橋'],['shinjuku_line','馬喰横山']], time:3},
  // 泉岳寺 ↔ 高輪ゲートウェイ (距離あるが一応)
  {entries:[['asakusa','泉岳寺'],['yamanote','高輪ゲートウェイ'],['keihin','高輪ゲートウェイ']], time:6},
  // 新宿西口 ↔ 新宿
  {entries:[['oedo','新宿西口'],['yamanote','新宿'],['chuo','新宿'],['marunouchi','新宿']], time:5},
  // 汐留 ↔ 新橋
  {entries:[['oedo','汐留'],['yamanote','新橋'],['ginza','新橋'],['asakusa','新橋']], time:5},
  // 私鉄との乗り換え
  {entries:[['odakyu_odawara','新宿'],['yamanote','新宿'],['chuo','新宿'],['sobu','新宿'],['marunouchi','新宿'],['shinjuku_line','新宿'],['oedo','新宿']], time:5},
  {entries:[['odakyu_odawara','代々木上原'],['chiyoda','代々木上原']], time:3},
  {entries:[['odakyu_odawara','下北沢'],['keio_inokashira','下北沢']], time:3},
  {entries:[['keio','新宿'],['yamanote','新宿'],['chuo','新宿'],['sobu','新宿'],['marunouchi','新宿'],['shinjuku_line','新宿'],['oedo','新宿']], time:5},
  {entries:[['keio','明大前'],['keio_inokashira','明大前']], time:3},
  {entries:[['keio_inokashira','渋谷'],['yamanote','渋谷'],['ginza','渋谷'],['hanzomon','渋谷'],['fukutoshin','渋谷']], time:5},
  {entries:[['keio_inokashira','吉祥寺'],['chuo','吉祥寺']], time:4},
  {entries:[['tokyu_toyoko','渋谷'],['yamanote','渋谷'],['ginza','渋谷'],['hanzomon','渋谷'],['fukutoshin','渋谷']], time:5},
  {entries:[['tokyu_toyoko','中目黒'],['hibiya','中目黒']], time:3},
  {entries:[['tokyu_toyoko','田園調布'],['tokyu_meguro','田園調布']], time:3},
  {entries:[['tokyu_toyoko','多摩川'],['tokyu_meguro','多摩川']], time:2},
  {entries:[['tokyu_toyoko','新丸子'],['tokyu_meguro','新丸子']], time:2},
  {entries:[['tokyu_toyoko','武蔵小杉'],['tokyu_meguro','武蔵小杉']], time:3},
  {entries:[['tokyu_denentoshi','渋谷'],['yamanote','渋谷'],['ginza','渋谷'],['hanzomon','渋谷'],['fukutoshin','渋谷']], time:5},
  {entries:[['tokyu_meguro','目黒'],['yamanote','目黒'],['namboku','目黒'],['mita','目黒']], time:4},
  {entries:[['keikyu_main','品川'],['yamanote','品川'],['keihin','品川']], time:5},
  {entries:[['seibu_shinjuku','高田馬場'],['yamanote','高田馬場'],['tozai','高田馬場']], time:4},
];

// ---------- 路線図用 駅座標（スケマティック） ----------
// viewBox 0 0 600 480 に対応する [x, y]
const STATION_POS = {
  // ===== 山手線（ループ形状）=====
  '東京':[398,210],'神田':[393,178],'秋葉原':[388,152],'御徒町':[378,128],
  '上野':[370,108],'鶯谷':[358,88],'日暮里':[345,72],'西日暮里':[335,62],
  '田端':[318,52],'駒込':[296,46],'巣鴨':[272,50],'大塚':[248,55],
  '池袋':[218,62],'目白':[198,78],'高田馬場':[178,98],'新大久保':[158,128],
  '新宿':[142,162],'代々木':[147,195],'原宿':[152,225],'渋谷':[158,258],
  '恵比寿':[178,290],'目黒':[192,318],'五反田':[212,342],'大崎':[232,362],
  '品川':[268,378],'高輪ゲートウェイ':[298,368],'田町':[322,348],
  '浜松町':[348,322],'新橋':[378,288],'有楽町':[396,252],
  // ===== 中央の主要駅 =====
  '大手町':[384,196],'銀座':[396,248],'日比谷':[382,258],'霞ケ関':[342,262],
  '国会議事堂前':[312,258],'赤坂見附':[278,242],'永田町':[272,250],
  '溜池山王':[316,250],'虎ノ門':[362,278],'虎ノ門ヒルズ':[352,282],
  // ===== 銀座線 =====
  '表参道':[202,262],'外苑前':[222,258],'青山一丁目':[242,252],
  '京橋':[405,228],'三越前':[400,188],'末広町':[385,142],
  '上野広小路':[376,122],'稲荷町':[368,100],'田原町':[368,88],'浅草':[412,78],
  // ===== 日比谷線 =====
  '中目黒':[172,294],'広尾':[222,292],'六本木':[272,292],'神谷町':[332,286],
  '東銀座':[402,258],'築地':[418,262],'八丁堀':[428,242],'茅場町':[422,218],
  '人形町':[416,195],'小伝馬町':[406,168],'仲御徒町':[380,130],
  '入谷':[376,88],'三ノ輪':[392,68],'南千住':[412,52],'北千住':[432,35],
  // ===== 南北線 =====
  '白金台':[212,338],'白金高輪':[242,342],'麻布十番':[282,312],
  '六本木一丁目':[302,282],'四ツ谷':[232,212],'市ヶ谷':[252,188],
  '飯田橋':[282,158],'後楽園':[312,132],'東大前':[326,108],'本駒込':[318,78],
  '西ヶ原':[312,58],'王子':[332,38],'王子神谷':[348,25],'志茂':[362,18],'赤羽岩淵':[378,12],
  // ===== 丸ノ内線 =====
  '荻窪':[28,178],'南阿佐ヶ谷':[42,178],'新高円寺':[55,178],'東高円寺':[68,178],
  '新中野':[82,178],'中野坂上':[98,172],'西新宿':[122,165],
  '新宿三丁目':[158,172],'四谷三丁目':[218,218],
  '御茶ノ水':[368,172],'本郷三丁目':[348,148],'茗荷谷':[298,102],
  '新大塚':[262,78],'淡路町':[392,182],
  // ===== 千代田線 =====
  '代々木上原':[108,238],'代々木公園':[128,235],'明治神宮前':[152,238],
  '乃木坂':[228,272],'赤坂':[278,262],'二重橋前':[388,238],
  '新御茶ノ水':[372,168],'湯島':[362,132],'根津':[352,112],'千駄木':[342,88],
  '町屋':[372,52],'綾瀬':[452,28],'北綾瀬':[472,18],
  // ===== 東西線 =====
  '中野':[72,192],'落合':[148,108],'早稲田':[212,132],'神楽坂':[258,148],
  '九段下':[312,188],'竹橋':[368,198],'日本橋':[408,198],
  '門前仲町':[448,218],'木場':[462,222],'東陽町':[478,228],
  '南砂町':[495,232],'西葛西':[520,238],'葛西':[538,242],
  '浦安':[555,246],'南行徳':[562,248],'行徳':[568,250],'妙典':[574,252],
  '原木中山':[580,254],'西船橋':[590,258],
  // ===== 有楽町線 =====
  '和光市':[145,2],'地下鉄成増':[152,12],'地下鉄赤塚':[158,22],
  '平和台':[165,32],'氷川台':[172,42],'小竹向原':[180,52],
  '千川':[192,56],'要町':[205,60],
  '東池袋':[232,68],'護国寺':[258,82],'江戸川橋':[272,112],
  '麹町':[268,232],'桜田門':[342,252],'銀座一丁目':[406,252],
  '新富町':[422,258],'月島':[438,248],'豊洲':[462,258],
  '辰巳':[478,262],'新木場':[498,268],
  // ===== 半蔵門線 =====
  '半蔵門':[282,232],'神保町':[332,182],'水天宮前':[432,198],
  '清澄白河':[452,188],'住吉':[468,178],'錦糸町':[478,158],'押上':[482,128],
  // ===== 副都心線 =====
  '雑司が谷':[208,78],'西早稲田':[182,102],'東新宿':[168,142],
  '北参道':[155,218],
  // ===== 都営浅草線 =====
  '西馬込':[178,425],'馬込':[192,405],'中延':[208,385],'戸越':[215,368],
  '高輪台':[258,362],'泉岳寺':[278,368],'三田':[312,348],
  '大門':[358,322],'宝町':[408,238],'東日本橋':[428,178],
  '浅草橋':[422,122],'蔵前':[415,102],
  // ===== 都営三田線 =====
  '芝公園':[318,342],'御成門':[338,312],'内幸町':[368,272],
  '水道橋':[318,162],'春日':[308,138],'白山':[308,92],'千石':[288,68],
  '西巣鴨':[260,42],'新板橋':[248,32],'板橋区役所前':[238,22],
  '板橋本町':[228,12],'本蓮沼':[218,5],
  // ===== 都営新宿線 =====
  '曙橋':[192,188],'小川町':[388,178],'岩本町':[402,158],
  '馬喰横山':[418,172],'浜町':[438,172],'森下':[448,158],
  '菊川':[458,168],'西大島':[478,172],'大島':[488,175],
  '東大島':[498,178],'船堀':[515,182],'一之江':[532,186],
  '瑞江':[548,190],'篠崎':[562,194],'本八幡':[582,198],
  // ===== 都営大江戸線 =====
  '都庁前':[122,152],'新宿西口':[132,157],
  '若松河田':[198,138],'牛込柳町':[228,142],'牛込神楽坂':[258,148],
  '上野御徒町':[378,118],'新御徒町':[388,102],
  '両国':[442,132],'勝どき':[428,272],'築地市場':[412,282],
  '汐留':[388,298],'赤羽橋':[322,322],'国立競技場':[188,218],
  // ===== 目的地 =====
  '麻布台ヒルズ':[318,298],
  // ===== JR京浜東北線（山手線と重複が多いので追加分のみ）=====
  '大宮':[320,0],'さいたま新都心':[322,0],'浦和':[324,0],'南浦和':[326,0],
  '蕨':[328,0],'西川口':[330,0],'川口':[332,0],'赤羽':[370,8],
  '東十条':[345,20],'上中里':[335,35],
  '大井町':[248,390],'大森':[238,405],'蒲田':[228,420],
  // ===== JR中央線（追加分）=====
  '高円寺':[52,188],'阿佐ヶ谷':[40,185],'吉祥寺':[15,185],'三鷹':[5,185],
  // ===== JR中央・総武線各駅停車（追加分）=====
  '東中野':[98,182],'大久保':[120,172],'千駄ケ谷':[175,205],'信濃町':[200,210],
  '亀戸':[495,160],'平井':[510,165],'新小岩':[528,170],'小岩':[548,178],
  '市川':[565,188],'下総中山':[586,225],'船橋':[596,268],
  // ===== その他（追加漏れ対応）=====
  '志村坂上':[210,0],'志村三丁目':[200,0],'蓮根':[190,0],'西台':[180,0],
  '高島平':[170,0],'新高島平':[160,0],'西高島平':[150,0],
  // ===== 私鉄（主要乗換駅・終点）=====
  '下北沢':[120,250],'登戸':[20,290],
  '笹塚':[115,205],'明大前':[100,225],'調布':[20,235],
  '代官山':[165,275],'祐天寺':[155,305],'学芸大学':[145,322],
  '都立大学':[150,340],'自由が丘':[160,358],'田園調布':[175,370],
  '多摩川':[190,382],'新丸子':[205,390],'武蔵小杉':[220,398],
  '池尻大橋':[140,270],'三軒茶屋':[125,285],'駒沢大学':[112,300],
  '桜新町':[98,315],'用賀':[84,330],'二子玉川':[70,345],
  '不動前':[205,335],'武蔵小山':[200,350],'西小山':[195,362],
  '洗足':[190,374],'大岡山':[185,384],'奥沢':[175,365],
  '西武新宿':[132,148],'鷺ノ宮':[40,115],
  // ===== 京急本線 =====
  '北品川':[276,392],'新馬場':[278,406],'青物横丁':[274,420],
  '鮫洲':[270,434],'立会川':[266,448],'大森海岸':[262,462],
  '平和島':[258,476],'大森町':[254,490],'梅屋敷':[250,504],
  '京急蒲田':[246,518],
};

// 座標補間：定義のない駅は同一路線上の前後から線形補間
function getStationPos(stationName, lineId) {
  if (STATION_POS[stationName]) return STATION_POS[stationName];
  const line = lineMap[lineId];
  if (!line) return null;
  const idx = lineStationIdx[lineId]?.[stationName];
  if (idx == null) return null;
  let before = null, after = null;
  for (let i = idx - 1; i >= 0; i--) {
    if (STATION_POS[line.stations[i]]) { before = { pos:STATION_POS[line.stations[i]], idx:i }; break; }
  }
  for (let i = idx + 1; i < line.stations.length; i++) {
    if (STATION_POS[line.stations[i]]) { after = { pos:STATION_POS[line.stations[i]], idx:i }; break; }
  }
  if (before && after) {
    const t = (idx - before.idx) / (after.idx - before.idx);
    return [before.pos[0] + t * (after.pos[0] - before.pos[0]), before.pos[1] + t * (after.pos[1] - before.pos[1])];
  }
  return before ? before.pos : after ? after.pos : null;
}

// SVG要素生成ヘルパー
const SVG_NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) el.setAttribute(k, v);
  return el;
}

// 路線図SVGを生成
function createRouteMapSVG(segments, destination, departure) {
  const W = 600, H = 540;
  const svg = svgEl('svg', { viewBox:`0 0 ${W} ${H}`, class:'route-map-svg' });

  // defs（グローアニメ用）
  const defs = svgEl('defs', {});
  defs.innerHTML = `
    <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <radialGradient id="dest-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#e74c3c" stop-opacity=".5"/>
      <stop offset="100%" stop-color="#e74c3c" stop-opacity="0"/>
    </radialGradient>`;
  svg.appendChild(defs);

  // 1) 背景路線（薄く描画）
  const bgGroup = svgEl('g', { opacity:'0.13' });
  LINES.forEach(line => {
    const pts = [];
    line.stations.forEach(s => {
      const p = STATION_POS[s];
      if (p) pts.push(p);
    });
    if (line.circular && pts.length > 2) {
      const first = STATION_POS[line.stations[0]];
      if (first) pts.push(first);
    }
    if (pts.length < 2) return;
    bgGroup.appendChild(svgEl('polyline', {
      points: pts.map(p => p.join(',')).join(' '),
      fill:'none', stroke:line.color, 'stroke-width':'3',
      'stroke-linecap':'round', 'stroke-linejoin':'round'
    }));
  });
  svg.appendChild(bgGroup);

  // 2) 経路ハイライト — ルートの各 rail セグメントを太く描画
  const routeGroup = svgEl('g', {});
  const routePoints = []; // アニメ用の全座標リスト
  const railSegs = segments.filter(s => s.type === 'rail');

  railSegs.forEach(seg => {
    const line = lineMap[seg.lineId];
    if (!line) return;
    const segPts = [];
    seg.stations.forEach(s => {
      const p = getStationPos(s, seg.lineId);
      if (p) segPts.push(p);
    });
    if (segPts.length < 2) return;

    // ルート線（太め + 半透明の光彩）
    routeGroup.appendChild(svgEl('polyline', {
      points: segPts.map(p=>p.join(',')).join(' '),
      fill:'none', stroke:line.color, 'stroke-width':'8',
      'stroke-linecap':'round', 'stroke-linejoin':'round',
      opacity:'0.25'
    }));
    routeGroup.appendChild(svgEl('polyline', {
      points: segPts.map(p=>p.join(',')).join(' '),
      fill:'none', stroke:line.color, 'stroke-width':'4',
      'stroke-linecap':'round', 'stroke-linejoin':'round'
    }));

    // 駅ドットを追加
    segPts.forEach((p, i) => {
      const isTerminal = (i === 0 || i === segPts.length - 1);
      routeGroup.appendChild(svgEl('circle', {
        cx:p[0], cy:p[1], r: isTerminal ? '5' : '2.5',
        fill: isTerminal ? '#fff' : line.color,
        stroke: line.color, 'stroke-width': isTerminal ? '2.5' : '0'
      }));
    });

    segPts.forEach(p => routePoints.push(p));
  });

  // 到着駅マーカー
  const destPos = getStationPos(destination, railSegs[railSegs.length - 1]?.lineId);
  if (destPos) {
    routePoints.push(destPos);
    // パルスリング
    const pulse = svgEl('circle', { cx:destPos[0], cy:destPos[1], r:'6', fill:'none', stroke:'#c0392b', 'stroke-width':'2', opacity:'0.8' });
    const anim1 = svgEl('animate', { attributeName:'r', from:'6', to:'18', dur:'1.5s', repeatCount:'indefinite' });
    const anim2 = svgEl('animate', { attributeName:'opacity', from:'0.8', to:'0', dur:'1.5s', repeatCount:'indefinite' });
    pulse.appendChild(anim1); pulse.appendChild(anim2);
    routeGroup.appendChild(pulse);
    routeGroup.appendChild(svgEl('circle', { cx:destPos[0], cy:destPos[1], r:'5', fill:'#c0392b' }));
    // ラベル
    const lbl = svgEl('text', { x:destPos[0]+10, y:destPos[1]+4, 'font-size':'11', 'font-weight':'600', fill:'#c0392b', 'font-family':'Noto Sans JP, sans-serif' });
    lbl.textContent = destination;
    routeGroup.appendChild(lbl);
  }

  // 出発駅ラベル
  const depPos = STATION_POS[departure] || getStationPos(departure, railSegs[0]?.lineId);
  if (depPos) {
    routeGroup.appendChild(svgEl('circle', { cx:depPos[0], cy:depPos[1], r:'5', fill:'#2563eb' }));
    const depLbl = svgEl('text', { x:depPos[0]+10, y:depPos[1]+4, 'font-size':'11', 'font-weight':'600', fill:'#2563eb', 'font-family':'Noto Sans JP, sans-serif' });
    depLbl.textContent = departure;
    routeGroup.appendChild(depLbl);
  }

  // 乗り換え駅ラベル
  railSegs.forEach((seg, i) => {
    if (i === 0) return;
    const name = seg.stations[0];
    const p = getStationPos(name, seg.lineId);
    if (!p) return;
    const tLbl = svgEl('text', { x:p[0]+8, y:p[1]-6, 'font-size':'9', fill:'#5f6b80', 'font-family':'Noto Sans JP, sans-serif' });
    tLbl.textContent = name;
    routeGroup.appendChild(tLbl);
  });

  svg.appendChild(routeGroup);

  // 3) アニメーション走行ドット
  if (routePoints.length >= 2) {
    const pathD = 'M' + routePoints.map(p => p.join(',')).join('L');
    const path = svgEl('path', { d:pathD, fill:'none', stroke:'none', id:'_routePath' });
    svg.appendChild(path);

    const dot = svgEl('circle', { r:'5', fill:'#fff', stroke:'#2563eb', 'stroke-width':'2.5', filter:'url(#glow)' });
    const motion = svgEl('animateMotion', { dur:'3s', repeatCount:'indefinite' });
    const mpath = svgEl('mpath', {});
    mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#_routePath');
    motion.appendChild(mpath);
    dot.appendChild(motion);
    svg.appendChild(dot);
  }

  return svg;
}

// ---------- ルックアップ構築 ----------
const lineMap = {};          // lineId -> line object
const lineStationIdx = {};   // lineId -> { stationName -> index }
LINES.forEach(l => {
  lineMap[l.id] = l;
  const idx = {};
  l.stations.forEach((s,i) => idx[s] = i);
  lineStationIdx[l.id] = idx;
});

// 全駅名（重複排除・ソート済み）
const allStationNames = [...new Set(LINES.flatMap(l => l.stations))].sort((a,b) => a.localeCompare(b,'ja'));

// 駅名 → その駅を通る路線 ID リスト
const stationLines = {};
LINES.forEach(l => {
  l.stations.forEach(s => {
    if (!stationLines[s]) stationLines[s] = [];
    stationLines[s].push(l.id);
  });
});

// ---------- グラフ構築 ----------
function nodeId(lineId, station) { return lineId + ':' + station; }

function buildGraph() {
  const G = {};
  const ensure = n => { if (!G[n]) G[n] = []; };

  // 路線内エッジ（隣接駅間）
  LINES.forEach(line => {
    const st = line.stations;
    for (let i = 0; i < st.length - 1; i++) {
      const a = nodeId(line.id, st[i]);
      const b = nodeId(line.id, st[i+1]);
      const t = line.times[i];
      ensure(a); ensure(b);
      G[a].push({ to:b, time:t, type:'rail', lineId:line.id });
      G[b].push({ to:a, time:t, type:'rail', lineId:line.id });
    }
    // 環状線：末尾→先頭
    if (line.circular) {
      const a = nodeId(line.id, st[st.length-1]);
      const b = nodeId(line.id, st[0]);
      const t = line.times[st.length-1] || line.times[line.times.length-1];
      ensure(a); ensure(b);
      G[a].push({ to:b, time:t, type:'rail', lineId:line.id });
      G[b].push({ to:a, time:t, type:'rail', lineId:line.id });
    }
  });

  // 乗り換えエッジ
  TRANSFER_GROUPS.forEach(group => {
    const entries = group.entries;
    for (let i = 0; i < entries.length; i++) {
      for (let j = i+1; j < entries.length; j++) {
        const a = nodeId(entries[i][0], entries[i][1]);
        const b = nodeId(entries[j][0], entries[j][1]);
        if (!G[a] || !G[b]) continue; // ノードが存在しない場合スキップ
        G[a].push({ to:b, time:group.time, type:'transfer', lineId:null });
        G[b].push({ to:a, time:group.time, type:'transfer', lineId:null });
      }
    }
  });

  return G;
}

const graph = buildGraph();

// ---------- Dijkstra ----------
function dijkstra(start, goals) {
  const dist = {};
  const prev = {};
  const prevEdge = {};
  const visited = new Set();

  dist[start] = 0;
  const queue = [[0, start]];

  while (queue.length > 0) {
    queue.sort((a,b) => a[0] - b[0]);
    const [d, u] = queue.shift();
    if (visited.has(u)) continue;
    visited.add(u);

    // 全ゴールに到達したら早期終了
    if (goals.every(g => visited.has(g))) break;

    const edges = graph[u] || [];
    for (const edge of edges) {
      const nd = d + edge.time;
      if (nd < (dist[edge.to] ?? Infinity)) {
        dist[edge.to] = nd;
        prev[edge.to] = u;
        prevEdge[edge.to] = edge;
        queue.push([nd, edge.to]);
      }
    }
  }
  return { dist, prev, prevEdge };
}

// ---------- 経路探索 ----------
function findRoutes(departureStation, destinationStation) {
  if (departureStation === destinationStation) {
    return [{ segments:[], totalTime:0, sameStation:true }];
  }

  // 仮想スタートノードを追加
  const startNode = '__start__';
  const startEdges = [];
  const lines = stationLines[departureStation] || [];
  lines.forEach(lid => {
    const nid = nodeId(lid, departureStation);
    if (graph[nid]) {
      startEdges.push({ to:nid, time:0, type:'start', lineId:lid });
    }
  });
  // 一時的にグラフに追加
  graph[startNode] = startEdges;

  // 到着駅を通るすべての路線をゴールにする
  const goalNodes = (stationLines[destinationStation] || []).map(lid => nodeId(lid, destinationStation));
  const { dist, prev, prevEdge } = dijkstra(startNode, goalNodes);

  // グラフから仮想ノードを除去
  delete graph[startNode];

  const routes = goalNodes
    .filter(node => dist[node] != null && dist[node] !== Infinity)
    .map(goalNode => {
      const path = [];
      let cur = goalNode;
      while (cur && cur !== startNode) {
        path.unshift({ node:cur, edge:prevEdge[cur] });
        cur = prev[cur];
      }
      return { segments:buildSegments(path), totalTime:dist[goalNode] };
    })
    .sort((a, b) => a.totalTime - b.totalTime);

  return deduplicateRoutes(routes).slice(0, 3);
}

// パスをセグメント（路線ごとのまとまり）に変換
function buildSegments(path) {
  const segments = [];
  let current = null;

  for (const step of path) {
    const [lineId, station] = step.node.split(':');
    const edge = step.edge;

    if (!edge) {
      // スタートノードからの最初のステップ
      current = { lineId, stations:[station], time:0, type:'rail' };
      continue;
    }

    if (edge.type === 'rail' && current && current.lineId === lineId) {
      // 同じ路線を継続
      current.stations.push(station);
      current.time += edge.time;
    } else if (edge.type === 'transfer') {
      // 乗り換え
      if (current) segments.push(current);
      segments.push({
        type:'transfer',
        fromStation: current ? current.stations[current.stations.length-1] : '',
        fromLine: current ? current.lineId : '',
        toStation: station,
        toLine: lineId,
        time: edge.time
      });
      current = { lineId, stations:[station], time:0, type:'rail' };
    } else {
      // 路線が変わった（startからの遷移）
      if (current && current.stations.length > 0) segments.push(current);
      current = { lineId, stations:[station], time: edge.time || 0, type:'rail' };
    }
  }
  if (current && current.stations.length > 0) segments.push(current);
  return segments;
}

// 重複経路の除去
function deduplicateRoutes(routes) {
  const seen = new Set();
  return routes.filter(r => {
    const key = r.segments.filter(s => s.type === 'rail').map(s => s.lineId).join(',');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ---------- 方面表示 ----------
function getDirection(lineId, fromStation, toStation) {
  const line = lineMap[lineId];
  if (!line) return '';
  const idx = lineStationIdx[lineId];
  const fi = idx[fromStation];
  const ti = idx[toStation];
  if (fi == null || ti == null) return '';

  if (line.circular && line.id === 'yamanote') {
    // 山手線の場合
    const n = line.stations.length;
    const cwDist = (ti - fi + n) % n;
    const ccwDist = (fi - ti + n) % n;
    return cwDist <= ccwDist ? '外回り' : '内回り';
  }

  if (line.circular) {
    // 大江戸線などの環状線
    const n = line.stations.length;
    const cwDist = (ti - fi + n) % n;
    const ccwDist = (fi - ti + n) % n;
    if (cwDist <= ccwDist) {
      return line.stations[line.stations.length - 1] + '方面';
    } else {
      return line.stations[0] + '方面';
    }
  }

  // 非環状線
  if (ti > fi) {
    return line.stations[line.stations.length - 1] + '方面';
  } else {
    return line.stations[0] + '方面';
  }
}

// ---------- 乗り換え回数 ----------
function countTransfers(segments) {
  return segments.filter(s => s.type === 'transfer').length;
}

// ---------- UI ----------
document.addEventListener('DOMContentLoaded', () => {
  const departureInput = document.getElementById('departure-input');
  const departureSuggestions = document.getElementById('departure-suggestions');
  const departureClearBtn = document.getElementById('departure-clear-btn');
  const destinationInput = document.getElementById('destination-input');
  const destinationSuggestions = document.getElementById('destination-suggestions');
  const destinationClearBtn = document.getElementById('destination-clear-btn');
  const searchBtn = document.getElementById('search-btn');
  const resultsEl = document.getElementById('results');

  setupStationInput(departureInput, departureSuggestions, departureClearBtn);
  setupStationInput(destinationInput, destinationSuggestions, destinationClearBtn);

  function setupStationInput(input, suggestions, clearBtn) {
    let focusedIdx = -1;

    input.addEventListener('input', () => {
      const value = input.value.trim();
      suggestions.innerHTML = '';
      focusedIdx = -1;
      if (!value) { suggestions.classList.remove('open'); return; }

      const matches = allStationNames.filter(name => name.includes(value)).slice(0, 12);
      if (matches.length === 0) { suggestions.classList.remove('open'); return; }

      matches.forEach(name => {
        const item = document.createElement('li');
        item.dataset.station = name;
        item.textContent = name;
        const types = [...new Set((stationLines[name] || []).map(lineId => lineMap[lineId]?.type))].join(' / ');
        if (types) {
          const type = document.createElement('span');
          type.className = 'suggestion-type';
          type.textContent = types;
          item.appendChild(type);
        }
        item.addEventListener('mousedown', event => {
          event.preventDefault();
          input.value = name;
          suggestions.classList.remove('open');
        });
        suggestions.appendChild(item);
      });
      suggestions.classList.add('open');
    });

    input.addEventListener('focus', () => {
      if (suggestions.children.length > 0) suggestions.classList.add('open');
    });
    input.addEventListener('blur', () => {
      setTimeout(() => suggestions.classList.remove('open'), 150);
    });
    clearBtn.addEventListener('click', () => {
      input.value = '';
      input.focus();
      resultsEl.innerHTML = '';
    });
    input.addEventListener('keydown', event => {
      const items = suggestions.querySelectorAll('li');
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        focusedIdx = Math.min(focusedIdx + 1, items.length - 1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        focusedIdx = Math.max(focusedIdx - 1, 0);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (focusedIdx >= 0 && items[focusedIdx]) {
          input.value = items[focusedIdx].dataset.station;
          suggestions.classList.remove('open');
          focusedIdx = -1;
        } else {
          doSearch();
        }
        return;
      } else {
        focusedIdx = -1;
      }
      items.forEach((item, index) => item.classList.toggle('focused', index === focusedIdx));
      if (items[focusedIdx]) items[focusedIdx].scrollIntoView({block:'nearest'});
    });
  }

  // 検索実行
  searchBtn.addEventListener('click', doSearch);

  function doSearch() {
    const departure = departureInput.value.trim();
    const destination = destinationInput.value.trim();
    if (!departure) {
      showError('出発駅を入力してください');
      return;
    }
    if (!destination) {
      showError('到着駅を入力してください');
      return;
    }
    if (!allStationNames.includes(departure) || !allStationNames.includes(destination)) {
      showError('出発駅・到着駅は候補から選択してください。');
      return;
    }
    const routes = findRoutes(departure, destination);
    renderResults(routes, departure, destination);
  }

  function showError(msg) {
    resultsEl.innerHTML = '<div class="error-msg">' + msg + '</div>';
  }

  // ---------- 結果表示 ----------
  function renderResults(routes, departure, destination) {
    resultsEl.innerHTML = '';

    if (routes.length === 0) {
      showError('経路が見つかりませんでした');
      return;
    }

    // 路線図マップ（最短ルートを表示）
    const bestRoute = routes[0];
    if (!bestRoute.sameStation) {
      const mapCard = document.createElement('div');
      mapCard.className = 'route-card route-map-card';
      const mapHeader = document.createElement('div');
      mapHeader.className = 'route-map-header';
      mapHeader.textContent = '路線図';
      mapCard.appendChild(mapHeader);
      const mapSvg = createRouteMapSVG(bestRoute.segments, destination, departure);
      mapCard.appendChild(mapSvg);

      if (routes.length > 1) {
        const switcher = document.createElement('div');
        switcher.className = 'map-switcher';
        routes.forEach((route, index) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'map-switch-btn' + (index === 0 ? ' active' : '');
          button.textContent = (index === 0 ? '最短 ' : 'ルート ' + (index + 1) + ' ') + route.totalTime + '分';
          button.addEventListener('click', () => {
            mapCard.querySelector('.route-map-svg')?.remove();
            const selectedMap = createRouteMapSVG(route.segments, destination, departure);
            mapCard.insertBefore(selectedMap, switcher);
            switcher.querySelectorAll('.map-switch-btn').forEach(item => item.classList.remove('active'));
            button.classList.add('active');
          });
          switcher.appendChild(button);
        });
        mapCard.appendChild(switcher);
      }
      resultsEl.appendChild(mapCard);
    }

    // ルートカードのラッパー
    const cardsList = document.createElement('div');
    cardsList.className = 'route-cards-list';

    routes.forEach((route, idx) => {
      const card = document.createElement('div');
      card.className = 'route-card';

      // ヘッダー
      const header = document.createElement('div');
      header.className = 'route-header';

      const badge = document.createElement('span');
      badge.className = 'route-badge';
      badge.textContent = idx === 0 ? '最短' : 'ルート ' + (idx + 1);
      if (idx === 0) badge.classList.add('fastest');

      const time = document.createElement('span');
      time.className = 'route-time';
      time.innerHTML = '<strong>' + route.totalTime + '</strong>分';

      const transfers = document.createElement('span');
      transfers.className = 'route-transfers';
      if (route.sameStation) {
        transfers.textContent = '同じ駅です';
      } else {
        const tc = countTransfers(route.segments);
        transfers.textContent = tc === 0 ? '乗り換えなし' : '乗り換え ' + tc + ' 回';
      }

      header.appendChild(badge);
      header.appendChild(time);
      header.appendChild(transfers);
      card.appendChild(header);

      // タイムライン
      const timeline = document.createElement('div');
      timeline.className = 'timeline';

      if (route.sameStation) {
        appendTimelineStation(timeline, departure, null, true);
      } else {
        // 通常ルート
        const railSegs = route.segments.filter(s => s.type === 'rail');

        route.segments.forEach((seg, si) => {
          if (seg.type === 'rail') {
            const line = lineMap[seg.lineId];
            const isFirst = si === 0;
            // 出発駅
            if (isFirst) {
              appendTimelineStation(timeline, seg.stations[0], line, true);
            }

            // 路線セグメント
            const fromSt = seg.stations[0];
            const toSt = seg.stations[seg.stations.length - 1];
            const dir = seg.stations.length > 1 ? getDirection(seg.lineId, fromSt, toSt) : '';
            appendTimelineRail(timeline, line, dir, seg.time, seg.stations.length - 1);

            // 到着駅
            appendTimelineStation(timeline, toSt, line, false, si === route.segments.length - 1);
          } else if (seg.type === 'transfer') {
            appendTimelineTransfer(timeline, seg.time);
            const nextSeg = route.segments[si + 1];
            if (nextSeg && nextSeg.type === 'rail') {
              const nextLine = lineMap[nextSeg.lineId];
              appendTimelineStation(timeline, nextSeg.stations[0], nextLine, true);
            }
          }
        });

      }

      card.appendChild(timeline);
      cardsList.appendChild(card);
    });
    resultsEl.appendChild(cardsList);
  }

  function appendTimelineStation(container, name, line, isDeparture, isDestination) {
    const el = document.createElement('div');
    el.className = 'tl-station';
    if (isDeparture) el.classList.add('tl-departure');
    if (isDestination) el.classList.add('tl-destination');

    const dot = document.createElement('div');
    dot.className = 'tl-dot';
    if (line) dot.style.borderColor = line.color;
    if (isDestination) dot.classList.add('tl-dot-dest');

    const label = document.createElement('div');
    label.className = 'tl-station-name';
    label.textContent = name;

    if (line && isDeparture) {
      const lineBadge = document.createElement('span');
      lineBadge.className = 'tl-line-badge';
      lineBadge.style.backgroundColor = line.color;
      lineBadge.textContent = line.short;
      label.appendChild(lineBadge);
    }

    el.appendChild(dot);
    el.appendChild(label);
    container.appendChild(el);
  }

  function appendTimelineRail(container, line, direction, time, stationCount) {
    const el = document.createElement('div');
    el.className = 'tl-rail';

    const bar = document.createElement('div');
    bar.className = 'tl-bar';
    bar.style.backgroundColor = line.color;

    const info = document.createElement('div');
    info.className = 'tl-rail-info';
    info.innerHTML = '<span class="tl-rail-dir">' + direction + '</span>' +
      '<span class="tl-rail-time">' + time + '分' +
      (stationCount > 0 ? '（' + stationCount + '駅）' : '') + '</span>';

    el.appendChild(bar);
    el.appendChild(info);
    container.appendChild(el);
  }

  function appendTimelineTransfer(container, time) {
    const el = document.createElement('div');
    el.className = 'tl-transfer';

    const bar = document.createElement('div');
    bar.className = 'tl-bar tl-bar-transfer';

    const info = document.createElement('div');
    info.className = 'tl-transfer-info';
    info.textContent = '乗り換え ' + time + '分';

    el.appendChild(bar);
    el.appendChild(info);
    container.appendChild(el);
  }

  function appendTimelineWalk(container, time, exitInfo) {
    const el = document.createElement('div');
    el.className = 'tl-walk';

    const bar = document.createElement('div');
    bar.className = 'tl-bar tl-bar-walk';

    const info = document.createElement('div');
    info.className = 'tl-walk-info';
    info.innerHTML = '徒歩 ' + time + '分' +
      (exitInfo ? '<span class="tl-exit">' + exitInfo + '</span>' : '');

    el.appendChild(bar);
    el.appendChild(info);
    container.appendChild(el);
  }
});
