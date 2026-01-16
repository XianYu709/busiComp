// 答题卡高度
export const PAGE_HEIGHT = 1457
export const HOME_NUMBER = [
    {id:1,label:'[ 0 ][ 1 ][ 2 ][ 3 ][ 4 ][ 5 ][ 6 ][ 7 ][ 8 ][ 9 ]'},
    {id:2,label:'[ 0 ][ 1 ][ 2 ][ 3 ][ 4 ][ 5 ][ 6 ][ 7 ][ 8 ][ 9 ]'},
    {id:3,label:'[ 0 ][ 1 ][ 2 ][ 3 ][ 4 ][ 5 ][ 6 ][ 7 ][ 8 ][ 9 ]'},
    {id:4,label:'[ 0 ][ 1 ][ 2 ][ 3 ][ 4 ][ 5 ][ 6 ][ 7 ][ 8 ][ 9 ]'},
    {id:5,label:'[ 0 ][ 1 ][ 2 ][ 3 ][ 4 ][ 5 ][ 6 ][ 7 ][ 8 ][ 9 ]'},
]
//注意事项
export const PRECAUTIONS = [
    '答题前请将个人信息填写清楚并认真填涂考号。',
    '客观题必须使用2B铅笔填涂,修改时用橡皮擦干净。',
    '主观题必须使用黑色签字笔书写。',
    '请在答题区域内作答，超出答题区域书写无效。',
    '保持卡面清洁，不折叠，不破损。'
]
// 页面布局
export const LAYOUT_COLUMNS = [
    { id: 1, content: '一栏', pid: 'A4' },
    { id: 2, content: '两栏', pid: 'A3' },
    { id: 3, content: '三栏', pid: 'A3' },
]
// 纸张大小
export const LAYOUT_SIZE = [
    { id: 'A4', content: 'A4纸' },
    { id: 'A3', content: 'A3纸' },
]
export const paperSizeList = [
    {id:0,value:'A5',label:'A5'},
    {id:1,value:'A4',label:'A4'},
    {id:2,value:'A3(双栏)',label:'A3(双栏)'},
    {id:3,value:'A3(三栏)',label:'A3(三栏)'},
    {id:4,value:'16K',label:'16K'},
    {id:5,value:'8K(双栏)',label:'8K(双栏)'},
    {id:6,value:'8K(三栏)',label:'8K(三栏)'},
    {id:7,value:'B5',label:'B5'},
    {id:8,value:'B4(双栏)',label:'B4(双栏)'},
    {id:9,value:'B4(三栏)',label:'B4(三栏)'},
]
// 阅卷方式
export const LAYOUT_ASTYPE = [
    { id: 1, content: '先扫后阅' },
    { id: 2, content: '先阅后扫(支持线上+线下阅卷)' },
]
// 题卡样式
export const STYLE_ASTYPE = [
    { id: 1, content: '纯题卡(无题目)' },
    { id: 2, content: '题卡合一' },
]
export const FONT_SIZE_LIST = [
    { id: 1, content: '默认', value: '11px' },
    { id: 2, content: '六号', value: '10px' },
    { id: 3, content: '小五', value: '12px' },
    { id: 4, content: '五号', value: '14px' },
    { id: 5, content: '小四', value: '16px' },
    { id: 6, content: '四号', value: '18px' },
    { id: 7, content: '小三', value: '20px' },
    { id: 8, content: '三号', value: '21px' },
]

// 语文key值
export const LANGUAGE_KEY = [1,10,26]

// 英语key值
export const ENGLISH_KEY = [3,12,28]

// 英语题号
export const AREA_NUMBERS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]

// 大题号
export const QUESTION_NUMBERS = [
    {value: 1, label: '一'},
    {value: 2, label: '二'},
    {value: 3, label: '三'},
    {value: 4, label: '四'},
    {value: 5, label: '五'},
    {value: 6, label: '六'},
    {value: 7, label: '七'},
    {value: 8, label: '八'},
    {value: 9, label: '九'},
    {value: 10, label: '十'},
    {value: 11, label: '十一'},
    {value: 12, label: '十二'},
    {value: 13, label: '十三'},
    {value: 14, label: '十四'},
    {value: 15, label: '十五'},
    {value: 16, label: '十六'},
    {value: 17, label: '十七'},
    {value: 18, label: '十八'},
    {value: 19, label: '十九'},
    {value: 20, label: '二十'},
    {value: 21, label: '二十一'},
    {value: 22, label: '二十二'},
    {value: 23, label: '二十三'},
    {value: 24, label: '二十四'},
    {value: 25, label: '二十五'}
]

// 选择题页签
export const CHOICE_QUESTION = [
    {id:1,value:'singleChoiceQuestion',label:'单选题'},
    {id:2,value:'TorFQuestions',label:'判断题'},
    {id:3,value:'chunkingQuestions',label:'断句题'},
    {id:4,value:'multipleChoiceQuestions',label:'选择题'},
    {id:5,value:'multipleChoiceQuestionsOneOrMore',label:'不定项选择题'},
]
//判断题页签
export const TorF_QUESTION = [
    {id:1,value:'blankFillingQuestions',label:'填空题'}
]
//非选择题页签
export const NONCHOICE_QUESTION = [
    {id:1,value:'nonChoiceQuestions',label:'非选择题'},
    {id:2,value:'dictation',label:'名篇名句默写'},
    {id:3,value:'sentenceExpression',label:'语句表达'},
    {id:4,value:'wholeBookReading',label:'整本书阅读'},
    {id:5,value:'argumentativeTextReading',label:'议论性文本阅读'},
    {id:6,value:'shortAnswerQuestions',label:'简答题'}
]
//作文页签
export const COMPOSITION = [
    {id:1,value:'writing',label:'写作'},
    {id:2,value:'composition',label:'作文'}
]
//混合题页签
export const MIXED_QUESTION = [
    {id:1,value:'argumentativeReading',label:'论述类文本阅读'},
    {id:2,value:'practicalReading',label:'实用类文本阅读'},
    {id:3,value:'informationalTextReading',label:'信息类文本阅读'},
    {id:4,value:'literaryTextReading',label:'文学类文本阅读'},
    {id:5,value:'classicalChineseReading',label:'文言文阅读'},
    {id:6,value:'modernAndContemporaryPoetryReading',label:'现当代诗歌阅读'},
    {id:7,value:'ancientPoetryReading',label:'古代诗歌阅读'},
    {id:8,value:'languageAndWritingApplication',label:'语言文字运用'},
    {id:9,value:'dramaReading',label:'戏剧阅读'},
    {id:10,value:'classicReading',label:'名著阅读'}
]
//解答题页签
export const PROBLEMSOLVING_QUESTION = [
    {id:1,value:'problemSolvingQuestion',label:'解答题'},
    {id:2,value:'optionalExercise',label:'选做题'}
]
//选做题页签
export const MULTIPLE_QUESTION = [
    {id:1,value:'problemSolving',label:'解答题'},
    {id:2,value:'optionalExercise',label:'选做题'}
]
//填空题
export const MULTIPLE_NUMBER = [
    {id:1,value:2,label:'2选1'},
    {id:2,value:3,label:'3选1'},
    {id:3,value:4,label:'4选1'},
    {id:4,value:5,label:'5选1'}
]
//填空题每个长度
export const spaceLengthOptions = [
    {id:1,value:'1/5',label:'1/5行'},
    {id:2,value:'1/4',label:'1/4行'},
    {id:3,value:'1/3',label:'1/3行'},
    {id:4,value:'1/2',label:'1/2行'},
    {id:5,value:'1/1',label:'1/1行'},
];
//英语作文页签
export const compositionEnglish = [
    {id:1,value:'写作',label:'写作'},
    {id:2,value:'WrittenComposition',label:'书面表达'},
    {id:3,value:'SummaryWriting',label:'概要写作'},
    {id:4,value:'literaryTextReading',label:'应用文写作'},
    {id:5,value:'PracticalWriting',label:'单句写作'},
    {id:6,value:'MicroWriting',label:'微写作'},
    {id:7,value:'continuationWriting',label:'读后续写'},
    {id:8,value:'composition',label:'作文'}
]