<!--空答题卡
1.样式按照蓝湖，逻辑可以参考新教育
2.右侧题卡设置
2.1设置答题卡  页面布局（点击先显示对话框选择纸张大小和阅卷方式）   考号板式（点击切换答题卡的板式）    显示方式（点击切换对应的排版）    题目结构（添加题目）
2.2最下面显示设置的总分、设置的题目数
2.3题目结构  点击添加的题型，显示dialog，选择大题号、题目名称、-->
<template>
  <div class="card-top">
    <div class="card-top-back">
      <div @click="goBackBtn">
        <img src="./images/back.png">
        <span>返回上一步</span>
      </div>
    </div>
    <div class="card-top-title">

      <span class="card-top-title-t">作业空答题卡</span>
      <span class="card-top-title-b">制作答题卡</span>
    </div>
    <div class="card-top-right">
        <img src="./images/218.png" class="card-top-right-btn-view" title="预览" @click="cardView" >
        <img src="./images/218(1).png" class="card-top-right-btn-menu" title="保存">
        <el-button type="primary" class="card-top-right-btn-download" @click="downloadBtn">下载</el-button>
    </div>

  </div>
  <div class="card-content">
    <div class="card-content-sheet" id="card-content-sheet">
      <el-scrollbar>
        <!-- 基本信息 -->
        <div class="page" id="page">
          <div id="cardContent" class="card-container" :style="{height: paperHeight+'px'}">
            <div class="card-content-sheet-top">
              <div class="card-content-sheet-top-basic-information">
                <el-row class=" row" >
                  <el-col class="card-content-sheet-top-basic-information-title" :span="24"> 基本信息</el-col>
                </el-row>
                <el-row >
                  <el-col :span="8" class="card-content-sheet-top-basic-information-l ">姓名</el-col>
                  <el-col :span="16" class="card-content-sheet-top-basic-information-r"></el-col>
                </el-row>
                <el-row >
                  <el-col :span="8" class="card-content-sheet-top-basic-information-l">班级</el-col>
                  <el-col :span="16" class="card-content-sheet-top-basic-information-r"></el-col>
                </el-row>
                <el-row >
                  <el-col :span="8" class="card-content-sheet-top-basic-information-l">学号</el-col>
                  <el-col :span="16" class="card-content-sheet-top-basic-information-r"></el-col>
                </el-row>
              </div>
              <div class="card-content-sheet-top-card-information">
                <div class="card-content-sheet-top-card-information-title"><span>答题卡信息</span></div>
                <div class="card-content-sheet-top-card-information-content">
                  <div id="examNumber" v-if="boolFill">
                    <p v-for="item in HOME_NUMBER" :key="item.id" >{{item.label}}</p>
                  </div>
                  <div v-if="boolPaste" style="display: flex;">
                    <div class="paste-box">
                      <h3>贴条形码区</h3>
                    </div>
                  </div>
                </div>
              </div>
            <!--二维码图片-->
              <img :src="qrcodeUrl" class="card-content-sheet-top-img" id="cardContentSheetTopImg">
            </div>
            <!-- 缺考标记 -->
            <div v-if="isAbsent" class="absent" >
              <div style="display: inline-block;width: 140px;height: 40px;background: #E8E8E8;text-align: center;line-height: 40px;border-right: 1px solid #E8E8E8;">此栏考生禁填</div>
              <div style="display: inline-block;padding-left: 10px">缺考标记：【 &nbsp;&nbsp;】&nbsp;&nbsp; 缺考考生由监考员填涂考号，并用2B铅笔填涂缺考标记</div>
            </div>
            <!-- 答题卡内容 -->
            <div class="card-content-sheet-content" id="questionsContent">
            </div>
<!--            <div class="container-tip tip-bottom" id="tipBottom" v-if="isShow">
              请在各题目的答题区域作答，超出答题区域的答案无效
            </div>-->
          </div>

          <div class="card_footer" id="cardFooter">
            第 1 页  共 1 页
          </div>
<!--          <div class="anchor-point" v-if="anchorPoint">
            <div style="width: 50px;height: 20px;background-color: #000000;display: inline-block;margin-left: 15px;margin-bottom: 20px"></div>
            <div style="width: 50px;height: 20px;background-color: #000000;display: inline-block;margin-right: 15px;margin-bottom: 20px;float: right"></div>
          </div>-->
        </div>
<!--        <div class="page" :style="{height: paperHeight+'px'}">
          <div class="card-container">
            <div class="container-tip tip-top" v-if="isShow">
              请在各题目的答题区域作答，超出答题区域的答案无效
            </div>
          </div>

          <div class="card_footer" >
            第 2 页  共 2 页
          </div>
        </div>-->

        <!--定位点-->

      </el-scrollbar>
    </div>
<!-- 右侧答题卡设置 -->
    <div class="card-content-config">
      <el-scrollbar ref="scrollbarRef">
        <div id="totalScoreDiv">
          <el-collapse v-model="activeNames">
            <p class="card-content-config-title">设置答题卡</p>
            <el-collapse-item name="1" style="width: 97%">
              <template #title>
                <span class="card-content-config-layout">页面布局</span>
              </template>
              <div class="card-content-config-layout-paper">
                <span>{{ layoutPaperSize }} / {{ layoutGradingMethod }}</span>
                <el-button type="primary" text @click="modifyPageLayout">修改</el-button>
              </div>
            </el-collapse-item>
            <el-collapse-item name="2" style="width: 97%">
              <template #title>
                <span class="card-content-config-layout">考号板式</span>
              </template>
              <div>
                <el-radio-group v-model="radio" style="margin-left: 20px">
                  <el-radio :value="3" @change="onChangeExamNumber('fill')">填涂</el-radio>
                  <el-radio :value="6" @change="onChangeExamNumber('paste')">条形码</el-radio>
                  <el-radio :value="9" @change="onChangeExamNumber('handwriting')">手写</el-radio>
                </el-radio-group>
              </div>
            </el-collapse-item>
            <el-collapse-item name="3" style="width: 97%">
              <template #title>
                <span class="card-content-config-layout">显示方式</span>
              </template>
              <div class="card-content-config-layout-box" style="margin-left: 10px ">
                <el-checkbox v-model="isVertical" label="客观题竖向排列" size="large" @change="changeVertical"/>
                <el-checkbox v-model="isMerge" label="客观题合并" size="large" @change="changeMerge"/>
                <el-checkbox v-model="isBlankMerge" label="填空题合并批阅" size="large" @change="changeBlankMerge"/>
                <el-checkbox v-model="isRed" label="红色答题卡" size="large" @change="changeCardColor"/>
                <el-checkbox v-model="isDashed" label="虚线" size="large" @change="changeLineStyle"/>
                <el-checkbox v-model="checked6" label=""  size="large" >主观题小题合并批阅
                  <el-tooltip
                      class="box-item"
                      effect="dark"
                      content="1.勾选后，题目下的已拆分小题，在线批阅时，集中在一个页面分别赋分；2、不勾选时，按已拆分小题分别赋分。"
                      placement="top"
                  ><img src="./images/306.svg" style="width: 13px;height: 13px">
                  </el-tooltip>
                </el-checkbox>
              </div>
            </el-collapse-item>
            <el-collapse-item name="4" style="width: 97%">
              <template #title>
                <span class="card-content-config-layout">题目结构</span>
              </template>
              <div class="question-structure">
                <el-button type="primary" class="question-structure-items" text @click="addQuestions('addChoiceQuestions')">
                  <img src="./images/add.png" alt="" class="add-type">  &nbsp;选择题
                </el-button>
                <el-button type="primary" class="question-structure-items" text @click="addQuestions('addBlankFillingQuestions')">
                  <img src="./images/add.png" alt="" class="add-type">  &nbsp;填空题
                </el-button>
                <el-button type="primary" class="question-structure-items" text @click="addQuestions('addNonChoiceQuestions')">
                  <img src="./images/add.png" alt="" class="add-type">  &nbsp;非选择题
                </el-button>
                <el-button type="primary" class="question-structure-items" text @click="addQuestions('addComposition')">
                  <img src="./images/add.png" alt="" class="add-type">  &nbsp;作文
                </el-button>
                <el-button type="primary" class="question-structure-items" text @click="addQuestions('addEnglishComposition')">
                  <img src="./images/add.png" alt="" class="add-type">  &nbsp;英语作文
                </el-button>
                <el-button type="primary" class="question-structure-items" text @click="addQuestions('addMixedQuestions')">
                  <img src="./images/add.png" alt="" class="add-type">  &nbsp;混合题
                </el-button>
                <el-button type="primary" class="question-structure-items" text @click="addQuestions('addProblemSolvingQuestion')">
                  <img src="./images/add.png" alt="" class="add-type">  &nbsp;解答题
                </el-button>
                <el-button type="primary" class="question-structure-items" text @click="addQuestions('addOptionalExercise')">
                  <img src="./images/add.png" alt="" class="add-type">  &nbsp;选做题
                </el-button>
              </div>
            </el-collapse-item>
            <el-checkbox v-model="isAbsent" label="缺考标记" size="large" />
          </el-collapse>
          <span class="total-score">总分值</span>
          <span class="score">{{ totalScore }}</span>
          <span class="fen">分</span>
          <!--在这里创建结构盒子-->
        </div>
      </el-scrollbar>
    </div>
  </div>
<!-- 答题卡布局 -->
  <el-dialog
      v-model="pageLayout"
      title="答题卡布局"
      width="760"
      custom-class="my-dialog"
  >
    <div>
      <p>纸张大小</p>
      <div>

      </div>
      <el-radio-group v-model="paperSize" style="  display: flex;flex-wrap: wrap;gap: 15px;">
        <el-radio v-for="item in paperSizeList" :key="item.id" :value="item.value" :label="item.label" class="paper-size-item">
          <div class="icon-wrapper">
            <img :src="getIconPath(item.value)" alt="纸张样式" class="paper-icon"/>
          </div>
          <span class="paper-label">{{ item.label }}</span>
        </el-radio>

      </el-radio-group>
    </div>
    <div>
      <p>阅卷方式</p>
      <el-radio-group v-model="gradingMethod" style="margin-left: 20px">
        <el-radio v-for="item in LAYOUT_ASTYPE" :key="item.id" :value="item.content">{{ item.content }}</el-radio>
      </el-radio-group>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="pageLayout = false">取消</el-button>
        <el-button type="primary" @click="updatePageLayout">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
<!-- 添加题目dialog -->
  <el-dialog
      v-model="isAddQuestion"
      title="添加题目"
      width="65%"
  >
    <el-form  label-width="120px"  size="large">
      <el-form-item label="大题号：" >
        <el-select style="width: 300px" v-model="selectedOptionsLabel">
          <el-option v-for="item in QUESTION_NUMBERS" :key="item.value" :label="item.label" :value="item.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="题目名称：" >
        <el-input style="width: 300px" v-model="questionTitleInput" placeholder="请输入题目名称"></el-input>
      </el-form-item>
      <el-select style="width: 300px" v-model="defaultOptionsLabel" @change="onChangeXZT">
        <el-option v-for="item in multipleChoiceQuestions" :key="item.id" :label="item.label" :value="item.value" />
      </el-select>
      <div style="display: inline-block;margin-left: 50px">
        <div style="display: inline-block;" v-if="idAddOptionalExercise">
          选做规则
          <el-select style="width: 100px;margin-right: 30px" v-model="defaultOptionalRule" @change="onChangeOptionalRules">
            <el-option v-for="item in optionalRules" :label="item.label" :value="item.value" :key="item.id"/>
<!--            <el-option label="是" :value="true "/>-->
          </el-select>
        </div>
        从
        <el-input-number
            v-model="startNumber"
            :min="1"
            controls-position="right"
            style="width: 90px"
            @change="onChangeStartNumber"
        />
        题到
        <el-input-number
            v-model="endNumber"
            :min="startNumber"
            controls-position="right"
            style="width: 90px"
        />
        题，
        <span v-if="isAddChoiceQuestions">
          每题
        <el-input-number
            v-model="optionsNumber"
            :min="1"
            :max="optionsNumberMax"
            controls-position="right"
            style="width: 90px"
            :disabled="isTorFQuestions"
        />
        个选项，

        </span>

        每题
        <el-input-number
            v-model="fractionNumber"
            :min="0.5"
            controls-position="right"
            :precision="1"
            :step="0.5"
            style="width: 90px"
        />
        分
        <span v-if="isAddBlankFillingQuestions">
            ,空格长度
          <el-radio-group v-model="spaceLength" size="large" fill="#6cf">
            <el-radio-button v-for="item in spaceLengthOptions" :label="item.label" :value="item.value" :key="item.id" />
          </el-radio-group>
        </span>
      </div>
      <div style="margin-left: 20px;border: 1px solid #E8E8E8;padding-right: 30px" v-if="isChoiceQuestionsView">
        是否选择题：
        <el-select style="width: 100px;margin-right: 30px" v-model="isMixChoiceQuestions">
          <el-option label="否" :value="false" />
          <el-option label="是" :value="true "/>
        </el-select>
        <el-select style="width: 200px" v-model="defaultOptionsValueMix" v-if="isMixChoiceQuestions" @change="onChangeMixXZT">
          <el-option v-for="item in choiceQuestionsList" :key="item.id" :label="item.label" :value="item.value" />
        </el-select>
        <div style="display: inline-block;float: right">
          <div style="display: inline-block;" v-show="isMixChoiceQuestions">
            <el-input-number
                v-model="optionsMixNumber"
                :min="2"
                :max="optionsMixNumberMax"
                controls-position="right"
                style="width: 90px"
            />
            个选项，
          </div>
          <div style="display: inline-block;">
            <el-input-number
                v-model="fractionNumber"
                :min="0.5"
                controls-position="right"
                :precision="1"
                :step="0.5"
                style="width: 90px"
            />
            分
          </div>
        </div>
      </div>
      <div style="margin-top: 20px;display: flex;justify-content: center">
        <el-button @click="isAddQuestion = false" style="width: 150px">取 消</el-button>
        <el-button type="primary" @click="confirmAddQuestions" style="width: 150px">确 认</el-button>
      </div>
    </el-form>
  </el-dialog>
<!-- 添加作文的dialog -->
  <el-dialog
      v-model="isAddComposition"
      title="设置"
      width="40%"
  >
    <el-form  label-width="120px"  size="large">
      <el-form-item label="题目名称：" >
        <el-input style="width: 300px" v-model="questionTitleInput" placeholder="请输入题目名称"></el-input>
      </el-form-item>
      <el-form-item label="选择题型：" >
        <el-select style="width: 300px" v-model="defaultOptionsLabel" @change="onChangeXZT">
          <el-option v-for="item in multipleChoiceQuestions" :key="item.id" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="小题题号：" >
        <el-input-number
            v-model="startNumber"
            :min="1"
            controls-position="right"
            style="width: 100px"
            @change="onChangeStartNumber"
        />
        <span style="margin-left: 5px">题</span>
      </el-form-item>
      <el-form-item label="分数：" >
        <el-input-number
            v-model="fractionNumber"
            :min="0.5"
            controls-position="right"
            :precision="1"
            :step="0.5"
            style="width: 100px"
        />
        <span style="margin-left: 5px">分</span>
      </el-form-item>
      <el-form-item label="字数最少：" v-if="!isEnglishComposition">
        <el-input-number
            v-model="compositionWordCount"
            :min="0.5"
            controls-position="right"
            :step="1"
            style="width: 100px"
        />
        <span style="margin-left: 5px">字</span>
      </el-form-item>
      <el-form-item label="字数标记：" v-if="!isEnglishComposition">
        <el-radio-group v-model="wordCountRadio" style="margin-left: 20px">
          <el-radio :value="1" @change="onChangeWordCount('fill')">
            每
            <el-select style="width: 80px" v-model="wordCount">
              <el-option v-for="item in wordCountList" :key="item.id" :label="item.value" :value="item.value"/>
            </el-select>
            字显示一个字数标记</el-radio>
          <el-radio :value="2" @change="onChangeWordCount('paste')">最少字数处显示一个字数标记</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="作文行数：" v-if="isEnglishComposition">
        <el-input-number
            v-model="lineNumber"
            :min="0"
            controls-position="right"
            :step="1"
            style="width: 100px"
        />
        <span style="margin-left: 5px">字</span>
      </el-form-item>
      <div style="margin-top: 20px;display: flex;justify-content: center">
        <el-button @click="isAddComposition = false" style="width: 150px">取 消</el-button>
        <el-button type="primary" @click="confirmAddQuestions" style="width: 150px">确 认</el-button>
      </div>
    </el-form>
  </el-dialog>
  <!-- 预览图片的dialog -->
  <CardViewDialog v-model="anchorPoint" :capturedImage="capturedImage"/>
</template>

<script setup lang="ts">
  import {ref, watch} from 'vue'
  import QRCode from 'qrcode';
  import html2canvas from "html2canvas";
  import {useRoute} from "vue-router";
  import {paperSizeList, spaceLengthOptions,HOME_NUMBER, PAGE_HEIGHT, QUESTION_NUMBERS, CHOICE_QUESTION, TorF_QUESTION, NONCHOICE_QUESTION, COMPOSITION, MIXED_QUESTION, PROBLEMSOLVING_QUESTION, MULTIPLE_QUESTION, MULTIPLE_NUMBER, LAYOUT_ASTYPE, compositionEnglish} from './models/base.ts';
  import {
    addChoiceQuestionsFun,
    addBlankFillingQuestionsFun,
    addNonChoiceQuestionsFun,
    addCompositionFun,
    addEnglishPositionFun,
    addMixedQuestionsFun,
    addProblemSolvingQuestionFun,
    addOptionalExerciseFun,
    addTipBottom,
    getElementPosition
  } from "./addFun/addQuestions.ts";
  import {downloadSingleResource} from '../../../../utils/src/download/downloadUtils.ts'
  import CardViewDialog from "./dialog/cardViewDialog.vue";

  //定位点
  const anchorPoint = ref(false)
  //根据这个生成二维码
  const sourceObj = {
    number:1,
    xuehao:'20170513006'
  }
  const qrcodeUrl = ref('')

  // 生成二维码的函数
  const generateQRCode = async () => {
    try {
      // 1. 将对象转换为字符串
      const jsonString = JSON.stringify(sourceObj);
      // 2. 生成二维码的Data URL
      const url = await QRCode.toDataURL(jsonString, {
        width: 150,        // 二维码宽度
        height: 150,       // 二维码高度
        margin: 1,         // 二维码边距
        colorDark: '#000000', // 二维码颜色
        colorLight: '#FFFFFF' // 背景色
      });
      // 3. 将生成的URL赋值给响应式变量
      qrcodeUrl.value = url;
    } catch (error) {
      console.error('生成二维码时出错:', error);
    }
  };
  generateQRCode()
  const route = useRoute()
  console.log(route.query.name)

  const cardType = ref('chinese')
  //是否英语作文
  const isEnglishComposition = ref(false)
  //答题卡底部文字提示
  const isShow = ref(false)
  //答题卡高度
  const paperHeight = ref(PAGE_HEIGHT)
  //考号板式
  const onChangeExamNumber = (type:string)=>{
    //填涂
    if(type == 'fill'){
      boolFill.value = true
      boolPaste.value = false
      boolHandwriting.value = false
    }else if(type == 'paste'){
      boolFill.value = false
      boolPaste.value = true
      boolHandwriting.value = false
    }else if(type == 'handwriting'){
      boolFill.value = false
      boolPaste.value = false
      boolHandwriting.value = true
    }
  }

  //添加题
  const isAddQuestion = ref(false);
  //选择题下内容显示控制
  const isAddChoiceQuestions = ref(false)
  //填空题
  const isAddBlankFillingQuestions = ref(false)
  //选做题
  const idAddOptionalExercise = ref(false)
  //作文
  const isAddComposition = ref(false)
  //缺考标记
  const isAbsent = ref(false)
  //要添加的题目类型
  const questionType = ref('')

  //大题号默认
  const selectedOptionsValue = ref(QUESTION_NUMBERS[0].value);
  const selectedOptionsLabel = ref(QUESTION_NUMBERS[0].label);
  //监听
  watch(()=>selectedOptionsValue.value,(newValue)=>{
    QUESTION_NUMBERS.forEach(item=>{
      if(item.value === newValue){
        selectedOptionsLabel.value = item.label;
      }
    })
  })
  //dialog里题目名称
  const questionTitleInput = ref('')
  //dialog里显示的内容的列表
  const multipleChoiceQuestions = ref<questionsList[]>([]);
  //列表默认显示的内容
  const defaultOptionsLabel = ref('');
  const defaultOptionsValue = ref('');
  //是否是判断题 判断题的话 禁用选项数量
  const isTorFQuestions = ref(false);
  //小题号
  let itemNumber = 1
  //从这个题
  const startNumber = ref(1)
  //到这个题
  let endNumber = ref(1)

  //选择题 选项的个数
  const optionsNumber = ref(4)
  //选项的最大个数
  const optionsNumberMax = ref(7)
  //混合题里选择题每个题选项的个数 默认4
  const optionsMixNumber = ref(4)
  //混合题里选项的最大个数
  const optionsMixNumberMax = ref(7)
  //作文字数 默认800
  const compositionWordCount = ref(800)
  //作文字数标记单选框 1每多少字数显示一个  2 最少字数处显示一个
  const wordCountRadio = ref(1)
  //作文字数标记
  const wordCount = ref(100)
  const wordCountList = ref([{id:1,value:100}, {id:1,value: 200}, {id:3,value: 300}])
  //每题的分数
  const fractionNumber = ref(0);
  const defaultOptionalRule = ref()
  const optionalRules = ref([])
  //英语作文行数
  const lineNumber = ref(10)

  //右侧设置的显示内容
  const activeNames = ref(['1','2','3','4'])
  //显示页面布局dialog
  const pageLayout = ref(false)
  const paperSize = ref('A4')
  watch(()=>paperSize.value,(newValue)=>{
    //console.log(newValue)
    switch (newValue){
      case 'A4':
        paperHeight.value = 1457;
        break;
      case 'A5':
        paperHeight.value = 1462;
        break;
      case 'A3(双栏)':
        paperHeight.value = 1457;
        break;
      case 'A3(三栏)':
        paperHeight.value = 2186;
        break;
      case '16K':
        paperHeight.value = 1448;
        break;
      case '8K(双栏)':
        paperHeight.value = 1448;
        break;
      case '8K(三栏)':
        paperHeight.value = 2177;
        break;
      case 'B5':
        paperHeight.value = 1463;
        break;
      case 'B4(双栏)':
        paperHeight.value = 1455;
        break;
      case 'B4(三栏)':
        paperHeight.value = 2182;
        break;
    }
  })

  const getIconPath = (value: string) => {
    const isSelected = paperSize.value === value
    let fileName = '';
    if (value.includes('双栏')) {
      fileName = isSelected ? 'doubleColumn-select.png' : 'doubleColumn-Unselected.png';
    } else if (value.includes('三栏')) {
      fileName = isSelected ? 'Sanlan-select.png' : 'Sanlan-Unselected.png';
    } else {
      fileName = isSelected ? 'singleColumn-select.png' : 'singleColumn-Unselected.png';
    }

    return new URL(`./images/${fileName}`, import.meta.url).href;
  };
  //阅卷方式
  const gradingMethod = ref('先扫后阅')
  //页面显示默认页面布局的内容
  const layoutPaperSize = ref('A4')
  const layoutGradingMethod = ref('先阅后扫')
  //考号板式 默认填涂
  const radio = ref(3)
  const boolFill = ref(true)
  const boolPaste = ref(false)
  const boolHandwriting = ref(false)
  //右侧显示方式的内容控制
  const isVertical = ref(false)
  const changeVertical = (val:any)=>{
    const parentDiv = document.getElementsByClassName('choiceQuestionGroupDiv')
    const objectiveQuestions = document.getElementsByClassName('objective-question');
    if(val){
      for(let i = 0; i < parentDiv.length; i++) {
        parentDiv[i].style.display = 'flex';
        parentDiv[i].style.justifyContent = 'center';
      }
      for (let objectiveQuestion of objectiveQuestions) {
        objectiveQuestion.style.width = '30px';
        objectiveQuestion.style.height = '100%';
        objectiveQuestion.style.marginLeft = '';
        objectiveQuestion.getElementsByTagName('span')[0].style.textAlign = 'center';
        objectiveQuestion.getElementsByTagName('span')[0].style.width = '100%';
        //objectiveQuestion.getElementsByTagName('span')[1].style.lineHeight = '35px';
      }

      //获取到客观题，在这里是点击了竖向排列
    }else{
      for(let i = 0; i < parentDiv.length; i++) {
        parentDiv[i].style.display = '';
      }
      for (let objectiveQuestion of objectiveQuestions) {
        objectiveQuestion.style.width = '';
        objectiveQuestion.style.height = '13px';
        //objectiveQuestion.style.marginLeft = '28px';
        objectiveQuestion.getElementsByTagName('span')[0].style.textAlign = '';
        objectiveQuestion.getElementsByTagName('span')[0].style.width = '25px';
        objectiveQuestion.getElementsByTagName('span')[0].style.display = 'inline-block';
        //objectiveQuestion.getElementsByTagName('span')[1].style.lineHeight = '35px';

      }
    }
  }
  //客观题合并
  const isMerge = ref(false)
  const changeMerge = (val)=>{
    //客观题合并
    //获取到所有的客观题，根据类型创建对应的group盒子，
    //获取所有的选择题
    const objectiveQuestions = document.getElementsByClassName('objective-question');
    //存放选择题的区域
    const choiceQuestionContent = document.getElementById('choiceQuestionContent');

    //choiceQuestionContent.removeChild(choiceQuestionContent.firstChild)

    let choiceQuestionsDivList;
    if(val){
      choiceQuestionContent.style.gridTemplateColumns = `repeat(3, 343px)`;

      let singleChoiceQuestionGroupDiv = document.createElement('div');
      singleChoiceQuestionGroupDiv.className = 'singleChoiceQuestionGroupDiv';
      let multipleChoiceQuestionsGroupDiv = document.createElement('div');
      multipleChoiceQuestionsGroupDiv.className = 'multipleChoiceQuestionsGroupDiv';
      let multipleChoiceQuestionsOneOrMoreGroupDiv = document.createElement('div');
      multipleChoiceQuestionsOneOrMoreGroupDiv.className = 'multipleChoiceOneOrMoreGroupDiv';
      let TorFQuestionsGroupDiv = document.createElement('div');
      TorFQuestionsGroupDiv.className = 'TorFQuestionsGroupDiv';
      let chunkingQuestionsGroupDiv = document.createElement('div');
      chunkingQuestionsGroupDiv.style.width = '300px';
      chunkingQuestionsGroupDiv.className = 'chunkingQuestionsGroupDiv';
      for (let i = 0; i < objectiveQuestions.length; i++) {
        /*if(objectiveQuestions[i].className.includes('singleChoiceQuestion')){

          singleChoiceQuestionGroupDiv.append(objectiveQuestions[i]);
          choiceQuestionContent.appendChild(singleChoiceQuestionGroupDiv)

          //隐藏对应的盒子
          const choiceQuestionsDivList = document.getElementsByClassName('singleChoiceQuestionDiv')
          console.log(choiceQuestionsDivList)
          for (let j = 0; j < choiceQuestionsDivList.length; j++) {
            //if(j != 0){
            choiceQuestionsDivList[j].style.display = 'none'
            // }
          }
        }*/

        if(objectiveQuestions[i].className.includes('multipleChoiceQuestions')){
          multipleChoiceQuestionsGroupDiv.append(objectiveQuestions[i])
          choiceQuestionContent.appendChild(multipleChoiceQuestionsGroupDiv)
          //隐藏对应的盒子
          choiceQuestionsDivList = document.getElementsByClassName('multipleChoiceQuestionsDiv')
          //console.log(choiceQuestionsDivList)
          for (let j = 0; j < choiceQuestionsDivList.length; j++) {
            choiceQuestionsDivList[j].style.display = 'none'
          }
        }
        if(objectiveQuestions[i].className.includes('multipleChoiceOneOrMore')){
          multipleChoiceQuestionsOneOrMoreGroupDiv.append(objectiveQuestions[i])
          choiceQuestionContent.appendChild(multipleChoiceQuestionsOneOrMoreGroupDiv)
          //隐藏对应的盒子
          choiceQuestionsDivList = document.getElementsByClassName('multipleChoiceOneOrMoreDiv')
          //console.log(choiceQuestionsDivList)
          for (let j = 0; j < choiceQuestionsDivList.length; j++) {
            choiceQuestionsDivList[j].style.display = 'none'
          }
        }
        if(objectiveQuestions[i].className.includes('TorFQuestions')){
          TorFQuestionsGroupDiv.append(objectiveQuestions[i])
          choiceQuestionContent.appendChild(TorFQuestionsGroupDiv)
          //隐藏对应的盒子
          choiceQuestionsDivList = document.getElementsByClassName('TorFQuestionsDiv')
          //console.log(choiceQuestionsDivList)
          for (let j = 0; j < choiceQuestionsDivList.length; j++) {
            choiceQuestionsDivList[j].style.display = 'none'
          }
        }
        if(objectiveQuestions[i].className.includes('chunkingQuestions')){
          chunkingQuestionsGroupDiv.append(objectiveQuestions[i])
          choiceQuestionContent.appendChild(chunkingQuestionsGroupDiv)
          //隐藏对应的盒子
          choiceQuestionsDivList = document.getElementsByClassName('chunkingQuestionsDiv')
          //console.log(choiceQuestionsDivList)
          for (let j = 0; j < choiceQuestionsDivList.length; j++) {
            choiceQuestionsDivList[j].style.display = 'none'
          }
        }
        //choiceQuestionContent.appendChild(objectiveQuestions[i])
      }

    }else{
      choiceQuestionContent.style.gridTemplateColumns = `repeat(5, 206px)`;
      //const choiceQuestionsGroupList = document.getElementById('choiceQuestionContent')
      for (let j = 0; j < choiceQuestionContent.children.length; j++) {
        if(j != 0){
          /*if(choiceQuestionContent.children[j].className == 'singleChoiceQuestionGroupDiv'){
            choiceQuestionsDivList = document.getElementsByClassName('singleChoiceQuestionDiv')
            choiceQuestionsDivList[0].style.display = ''
            choiceQuestionsDivList[0].childNodes[1].childNodes[0].appendChild(choiceQuestionContent.children[j])
          }*/
          if(choiceQuestionContent.children[j].className == 'TorFQuestionsGroupDiv'){
            choiceQuestionsDivList = document.getElementsByClassName('TorFQuestionsDiv')
            choiceQuestionsDivList[0].style.display = ''
            choiceQuestionsDivList[0].childNodes[1].childNodes[0].appendChild(choiceQuestionContent.children[j])
          }
          if(choiceQuestionContent.children[j].className == 'chunkingQuestionsGroupDiv'){
            choiceQuestionsDivList = document.getElementsByClassName('chunkingQuestionsDiv')
            choiceQuestionsDivList[0].style.display = ''
            choiceQuestionsDivList[0].childNodes[1].childNodes[0].appendChild(choiceQuestionContent.children[j])
          }
          if(choiceQuestionContent.children[j].className == 'multipleChoiceQuestionsGroupDiv'){
            choiceQuestionsDivList = document.getElementsByClassName('multipleChoiceQuestionsDiv')
            choiceQuestionsDivList[0].style.display = ''
            choiceQuestionsDivList[0].childNodes[1].childNodes[0].appendChild(choiceQuestionContent.children[j])
          }
          if(choiceQuestionContent.children[j].className == 'multipleChoiceOneOrMoreGroupDiv'){
            choiceQuestionsDivList = document.getElementsByClassName('multipleChoiceOneOrMoreDiv')
            choiceQuestionsDivList[0].style.display = ''
            choiceQuestionsDivList[0].childNodes[1].childNodes[0].appendChild(choiceQuestionContent.children[j])
          }
        }
      }
    }
  }
  //填空题合并
  const isBlankMerge = ref(false)
  const changeBlankMerge = (val:any)=>{
    //填空题合并
    //获取所有的填空题
    const allBlank = document.getElementsByClassName('blankFillingQuestionItems');
    const allBlankDiv = document.getElementsByClassName('blankFillingQuestionsDiv');
    let blankFillingQuestionsContent;

    //合并后放到这个区域
    blankFillingQuestionsContent = document.getElementById('blankFillingQuestionsContent')
    if(val){
      for(let i = 0; i < allBlank.length; i++){
        blankFillingQuestionsContent.appendChild(allBlank[i])
      }
      for (let j = 0; j < allBlankDiv.length; j++) {
        if(j!=0){
          allBlankDiv[j].style.display = 'none'
        }
      }
    }else{
      //console.log(blankFillingQuestionsContent.children.length)
      //通过blankFillingQuestionsDiv获取到所有的填空题大盒子，取第0个的第一个下的填空题数量
      for (let i = 0; i < allBlank.length; i++) {
        if(i!=0){
          allBlankDiv[1].children[1].appendChild(allBlank[i])
        }
        //console.log(blankFillingQuestionsContent.children[i])
      }

      //console.log(allBlank.length)
      for (let j = 0; j < allBlankDiv.length; j++) {
        if(j!=0){
          allBlankDiv[j].style.display = ''
        }
      }
      /*console.log(allBlankDiv[0].children[1].children.length)
      //除了第一个框里剩下的填空题数量
      for(let i = 0; i < allBlank.length; i++){
        if(i<allBlankDiv[0].children[1].children.length){
          break;
        }
        console.log(allBlank[i])
        allBlankDiv[1].children[1].appendChild(allBlank[i])
        //allBlankDiv[1].style.display = ''
        //blankFillingQuestionsContent.append(allBlank[i])
      }*/

      //allBlank.length - allBlankDiv[0].children[1].firstChild.childNodes.length
    }
  }
  //红色
  const isRed = ref(false)
  //点进切换答题卡颜色
  const changeCardColor = (value:any)=>{
    //先拿到所有改变颜色的元素
    //考号
    const examNumber = document.getElementById('examNumber');
    console.log(examNumber)
    console.log(value,boolFill.value)
    if(examNumber){
      if(value){
        examNumber.style.color = 'red'
      }else{
        examNumber.style.color = 'black'
      }
    }
    //选择题
    const choiceSpans = document.getElementsByClassName('choiceQuestionSpan')
    //再去判断是否改变红色
    if(choiceSpans.length > 0){
      for (let i = 0; i < choiceSpans.length; i++) {
        if(value){
          choiceSpans[i].style.color = 'red';
        }else{
          choiceSpans[i].style.color = 'black';
        }
      }
    }
    //填空题
    const spanList = document.getElementsByClassName('blankFillingQuestionsSpan');
    if(spanList.length > 0){
      for (let i = 0; i < spanList.length; i++) {
        if(value){
          spanList[i].style.borderColor = 'red';
        }else{
          spanList[i].style.borderColor = 'black';
        }
      }
    }
    //作文横线
    const compositionTitleLine = document.getElementsByClassName('compositionTitleLine');
    if(compositionTitleLine){
      for (let i = 0; i < compositionTitleLine.length; i++) {
        if(value){
          compositionTitleLine[i].style.borderColor = 'red';
        }else{
          compositionTitleLine[i].style.borderColor = 'black';
        }
      }
    }
    //英语作文横线
    const EnglishCompositionLine = document.getElementsByClassName('English-composition-line');
    if(EnglishCompositionLine){
      for (let i = 0; i < EnglishCompositionLine.length; i++) {
        if(value){
          EnglishCompositionLine[i].style.borderColor = 'red';
        }else{
          EnglishCompositionLine[i].style.borderColor = 'black';
        }
      }
    }
  }
  //虚线
  const isDashed = ref(false)
  const checked6 = ref(false)
  //右侧总分
  const totalScore = ref(0)

  //点击切换虚实线
  const changeLineStyle = (value:any)=>{
    //先获取填空题的横线
    const spanList = document.getElementsByClassName('blankFillingQuestionsSpan');
    for (let i = 0; i < spanList.length; i++) {
      if(value){
        spanList[i].style.borderBottom = '1px dashed #000';
      }else{
        spanList[i].style.borderBottom = '1px solid #000';
      }
    }
    //英语作文
    const EnglishLine = document.getElementsByClassName('English-composition-line');
    for (let i = 0; i < EnglishLine.length; i++) {
      if(value){
        EnglishLine[i].style.borderBottom = '1px dashed #000';
      }else{
        EnglishLine[i].style.borderBottom = '1px solid #000';
      }
    }
  }
  interface questionsList {
    id:number,
    value:string,
    label:string,
  }
  //input默认显示的东西
  //返回上一页
  const goBackBtn = () => {
    window.history.back();
  };
  //预览
  const capturedImage = ref()
  const cardView = ()=>{
    anchorPoint.value = true;
    toImg()
  }
  //添加定位点
  const addPoint = ()=>{
    const page = document.getElementById('page')
    const cardContent = document.getElementById('cardContent');
    const anchorPoint1 = document.createElement('div');
    const point1 = document.createElement('div');
    point1.style.width = '50px';
    point1.style.height = '20px';
    point1.style.backgroundColor = '#000000';
    point1.style.display = 'inline-block';
    point1.style.marginLeft = '15px';
    point1.style.marginTop = '20px';
    anchorPoint1.appendChild(point1);
    const point2 = document.createElement('div');
    point2.style.width = '50px';
    point2.style.height = '20px';
    point2.style.backgroundColor = '#000000';
    point2.style.display = 'inline-block';
    point2.style.marginRight = '15px';
    point2.style.marginTop = '20px';
    point2.style.float = 'right';
    anchorPoint1.appendChild(point2);
    page.insertBefore(anchorPoint1,cardContent);
    const anchorPoint2 = document.createElement('div');
    const point3 = document.createElement('div');
    point3.style.width = '50px';
    point3.style.height = '20px';
    point3.style.backgroundColor = '#000000';
    point3.style.display = 'inline-block';
    point3.style.marginLeft = '15px';
    point3.style.marginTop = '20px';
    anchorPoint2.appendChild(point3);
    const point4 = document.createElement('div');
    point4.style.width = '50px';
    point4.style.height = '20px';
    point4.style.backgroundColor = '#000000';
    point4.style.display = 'inline-block';
    point4.style.marginRight = '15px';
    point4.style.marginTop = '20px';
    point4.style.float = 'right';
    anchorPoint2.appendChild(point4);
    page.appendChild(anchorPoint2);
  }
  const toImg = async ()=>{
    const page = document.getElementById('page')
    addPoint()
    const canvas = await html2canvas(page,{
      //scrollY: -window.scrollY,
      scale:3,
      windowWidth: 20,
      windowHeight: 20,
      useCORS: true,
      backgroundColor: '#ffffff'
    })
    capturedImage.value = canvas.toDataURL('image/png')
    //删除页面上的定位点
    page.removeChild(page.firstChild)
    page.removeChild(page.lastChild)
  }
  //下载
  const downloadBtn = () => {
    //downloadSingleResource(1)
    const link = document.createElement('a');
    link.href = capturedImage.value;
    link.download = '我的图片.png'; // 设置下载文件名
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }


  //打开添加题目的框
  const addQuestions = (type:string)=>{
    questionType.value = type
    //console.log(questionType.value)

    //选择题
    if(type == 'addChoiceQuestions'){
      multipleChoiceQuestions.value = CHOICE_QUESTION;
      document.getElementById('')
      questionTitleInput.value = '选择题'
      //添加的是选择题
      isAddQuestion.value = true
      isAddChoiceQuestions.value = true
      isAddBlankFillingQuestions.value = false
      idAddOptionalExercise.value = false
      isAddComposition.value = false
      isChoiceQuestionsView.value = false
      defaultOptionsLabel.value = multipleChoiceQuestions.value[0].label
      defaultOptionsValue.value = multipleChoiceQuestions.value[0].value
    }
    //填空题
    if(type == 'addBlankFillingQuestions'){
      multipleChoiceQuestions.value = TorF_QUESTION;
      questionTitleInput.value = '填空题'
      isAddQuestion.value = true
      isAddChoiceQuestions.value = false
      isAddBlankFillingQuestions.value = true
      idAddOptionalExercise.value = false
      isAddComposition.value = false
      isChoiceQuestionsView.value = false
      defaultOptionsLabel.value = multipleChoiceQuestions.value[0].label
      defaultOptionsValue.value = multipleChoiceQuestions.value[0].value
    }
    //非选择题
    if(type == 'addNonChoiceQuestions'){
      multipleChoiceQuestions.value = NONCHOICE_QUESTION;
      questionTitleInput.value = '非选择题'
      isAddQuestion.value = true
      isAddChoiceQuestions.value = false
      isAddBlankFillingQuestions.value = false
      idAddOptionalExercise.value = false
      isAddComposition.value = false
      isChoiceQuestionsView.value = false
      defaultOptionsLabel.value = multipleChoiceQuestions.value[0].label
      defaultOptionsValue.value = multipleChoiceQuestions.value[0].value
    }
    //作文
    if(type == 'addComposition'){
      multipleChoiceQuestions.value = COMPOSITION;
      questionTitleInput.value = '作文';
      isAddChoiceQuestions.value = false;
      isAddBlankFillingQuestions.value = false;
      idAddOptionalExercise.value = false;
      isAddComposition.value = true
      isChoiceQuestionsView.value = false
      isEnglishComposition.value = false
      defaultOptionsLabel.value = multipleChoiceQuestions.value[0].label
      defaultOptionsValue.value = multipleChoiceQuestions.value[0].value
      endNumber.value = startNumber.value
    }
    //英语作文
    if(type == 'addEnglishComposition'){
      multipleChoiceQuestions.value = compositionEnglish;
      questionTitleInput.value = '作文';
      isAddChoiceQuestions.value = false;
      isAddBlankFillingQuestions.value = false;
      idAddOptionalExercise.value = false;
      isAddComposition.value = true
      isChoiceQuestionsView.value = false
      isEnglishComposition.value = true
      defaultOptionsLabel.value = multipleChoiceQuestions.value[0].label
      defaultOptionsValue.value = multipleChoiceQuestions.value[0].value
      endNumber.value = startNumber.value
    }
    //混合题
    if(type == 'addMixedQuestions'){
      multipleChoiceQuestions.value = MIXED_QUESTION;
      choiceQuestionsList.value = CHOICE_QUESTION
      questionTitleInput.value = '混合题';
      isAddQuestion.value = true
      isAddChoiceQuestions.value = false;
      isAddBlankFillingQuestions.value = false;
      idAddOptionalExercise.value = false;
      isAddComposition.value = false
      defaultOptionsLabel.value = multipleChoiceQuestions.value[0].label;
      defaultOptionsValue.value = multipleChoiceQuestions.value[0].value;
      defaultOptionsLabelMix.value = choiceQuestionsList.value[0].label;
      defaultOptionsValueMix.value = choiceQuestionsList.value[0].value;
    }
    //解答题
    if(type == 'addProblemSolvingQuestion'){
      multipleChoiceQuestions.value = PROBLEMSOLVING_QUESTION;
      questionTitleInput.value = '解答题'
      questionTitleInput.value = '选做题'
      isAddQuestion.value = true
      isAddChoiceQuestions.value = false
      isAddBlankFillingQuestions.value = false
      idAddOptionalExercise.value = false
      isAddComposition.value = false
      isChoiceQuestionsView.value = false
      defaultOptionsLabel.value = multipleChoiceQuestions.value[0].label
      defaultOptionsValue.value = multipleChoiceQuestions.value[0].value
    }
    //选做题
    if(type == 'addOptionalExercise'){
      multipleChoiceQuestions.value = MULTIPLE_QUESTION;
      optionalRules.value = MULTIPLE_NUMBER;
      questionTitleInput.value = '选做题'
      isAddQuestion.value = true
      isAddChoiceQuestions.value = false
      isAddBlankFillingQuestions.value = false
      idAddOptionalExercise.value = true
      isAddComposition.value = false
      isChoiceQuestionsView.value = false
      defaultOptionalRule.value = optionalRules.value[0].value;
      defaultOptionsLabel.value = multipleChoiceQuestions.value[0].label
      defaultOptionsValue.value = multipleChoiceQuestions.value[0].value
      //console.log(startNumber.value + defaultOptionalRule.value - 1)
      endNumber.value = startNumber.value + defaultOptionalRule.value - 1
    }
  }

  //填空题 空格长度
  const spaceLength = ref(spaceLengthOptions[0].value);
  //选择题 选择类型 单选、判断。。。
  const onChangeXZT = (val:string)=>{
    //console.log( val)
    //如果选择的是判断题，每题的选项禁用，默认2
    if(val == 'TorFQuestions'){
      optionsNumber.value = 2
      isTorFQuestions.value = true
    }else if(val == 'chunkingQuestions'){
      //断句题 默认8
      optionsNumber.value = 8
      //选项最多20
      optionsNumberMax.value = 20
      isTorFQuestions.value = false
    }else{
      //其他类型选择题默认4
      optionsNumber.value = 4
      //其他类型的最多7
      optionsNumberMax.value = 7
      isTorFQuestions.value = false
    }
    multipleChoiceQuestions.value.forEach((item)=>{
      if(val === item.value){
        questionTitleInput.value = item.label
        defaultOptionsLabel.value = item.label
        defaultOptionsValue.value = item.value
        //console.log(defaultOptionsValue.value,defaultOptionsLabel.value)
        return;
      }
    })
  }
  //混合题中如果是选择题 改变内容时
  const onChangeMixXZT = (val:string)=>{
    //console.log( val)

    //如果选择的是判断题，每题的选项禁用，默认2
    if(val == 'TorFQuestions'){
      optionsMixNumber.value = 2
    }else if(val == 'chunkingQuestions'){
      //断句题 默认8
      optionsMixNumber.value = 8
      //选项最多20
      optionsMixNumberMax.value = 20

    }else{
      //其他类型选择题默认4
      optionsMixNumber.value = 4
      //其他类型的最多7
      optionsMixNumberMax.value = 7
    }
    choiceQuestionsList.value.forEach((item)=>{
      if(val === item.value){
        //console.log(item)
        questionTitleInput.value = item.label
        defaultOptionsLabelMix.value = item.label
        defaultOptionsValueMix.value = item.value
        //console.log(defaultOptionsValueMix.value,defaultOptionsLabelMix.value)
        return;
      }
    })
  }
  //选做题 规则改变时
  const onChangeOptionalRules = (val:any)=>{
    endNumber.value = val + startNumber.value - 1;
  }
  //作文里字数标记改变
  const onChangeWordCount = (val:any)=>{

  }
  //选做题 start 变化
  const onChangeStartNumber = (val:any)=>{
    //console.log(val,defaultOptionalRule.value)
    endNumber.value = val + defaultOptionalRule.value - 1;
  }
  //确认添加按钮
  const confirmAddQuestions = async ()=>{
    console.log('确认添加按钮：',defaultOptionsValue.value,defaultOptionsLabel.value)
    console.log(questionType)
    //添加题目后显示出底部的文字
    //isShow.value = true
    //page
    const pageDiv = document.getElementById('page')
    //const tipBottom = document.getElementById('tipBottom')

    addTipBottom(document.getElementById('cardContent'))

    const cardFooter = document.getElementById('cardFooter');

    if(questionType.value == 'addChoiceQuestions'){
      isAddQuestion.value = false
      //如果是点击的选择题
      console.log('添加单选题',questionType.value)
      let choiceQuestionDiv:any = null;
      let choiceQuestionTop:any = null;
      let choiceQuestionContent:any = null;
      //console.log(defaultOptionsValue.value)
      const {num,upperLeftCorner,upperRightCorner,lowerLeftCorner,lowerRightCorner} = addChoiceQuestionsFun(choiceQuestionDiv,choiceQuestionTop,choiceQuestionContent,paperHeight,questionsContent,startNumber,endNumber,itemNumber,selectedOptionsLabel,defaultOptionsLabel,selectedOptionsValue,fractionNumber,totalScore,defaultOptionsValue,optionsNumber)
      //console.log(itemNumber)
      console.log(num,upperLeftCorner)
      itemNumber = num

    }
    if(questionType.value == 'addBlankFillingQuestions'){
      isAddQuestion.value = false
      //添加填空题
      console.log('添加填空题',questionType.value)
      //每行创建的个数，默认5
      const spaceCount = ref(5);
      //确认添加填空题
      let blankFillingQuestionsDiv:any = null;
      let blankFillingQuestionsTop:any = null;
      let blankFillingQuestionsContent:any = null;
      const {num,upperLeftCorner,upperRightCorner,lowerLeftCorner,lowerRightCorner} = addBlankFillingQuestionsFun(blankFillingQuestionsDiv,blankFillingQuestionsTop,blankFillingQuestionsContent,paperHeight,questionsContent,startNumber,endNumber,itemNumber,selectedOptionsLabel,defaultOptionsLabel,selectedOptionsValue,fractionNumber,totalScore,spaceLength,spaceCount)
      itemNumber = num
    }
    if(questionType.value == 'addNonChoiceQuestions'){
      isAddQuestion.value = false
      //添加非选择题
      let nonChoiceQuestionsDiv:any = null;
      let nonChoiceQuestionsTop:any = null;
      let nonChoiceQuestionsContent:any = null;
      const {num,upperLeftCorner,upperRightCorner,lowerLeftCorner,lowerRightCorner} = addNonChoiceQuestionsFun(nonChoiceQuestionsDiv,nonChoiceQuestionsTop,nonChoiceQuestionsContent,pageDiv,paperHeight,questionsContent,startNumber,endNumber,itemNumber,selectedOptionsLabel,defaultOptionsLabel,selectedOptionsValue,fractionNumber,totalScore,cardFooter)
      itemNumber = num
    }
    if(questionType.value == 'addComposition'){
      isAddComposition.value = false
      //添加作文
      let compositionContent:any = null
      let compositionDiv:any = null
      let compositionTop:any = null
      const {num,upperLeftCorner,upperRightCorner,lowerLeftCorner,lowerRightCorner} = addCompositionFun(compositionDiv,compositionTop,compositionContent,paperHeight,questionsContent,startNumber,endNumber,itemNumber,selectedOptionsLabel,defaultOptionsLabel,selectedOptionsValue,fractionNumber,totalScore,compositionWordCount,wordCountRadio,wordCount,pageDiv,cardFooter)
      itemNumber = num
    }
    if(questionType.value == 'addEnglishComposition'){
      isAddComposition.value = false
      //添加英语作文
      let EnglishCompositionDiv:any = null
      let EnglishCompositionTop:any = null
      let EnglishCompositionContent:any = null
      const {num,upperLeftCorner,upperRightCorner,lowerLeftCorner,lowerRightCorner} = addEnglishPositionFun(EnglishCompositionDiv,EnglishCompositionTop,EnglishCompositionContent,paperHeight,questionsContent,startNumber,endNumber,itemNumber,selectedOptionsLabel,defaultOptionsLabel,selectedOptionsValue,fractionNumber,totalScore,cardFooter,lineNumber,pageDiv)
      itemNumber = num
    }
    if(questionType.value == 'addMixedQuestions'){
      isAddQuestion.value = false
      //添加混合题
      let mixedQuestionsDiv:any = null;
      let mixedQuestionsTop:any = null;
      let mixedQuestionsContent:any = null;
      const {num,upperLeftCorner,upperRightCorner,lowerLeftCorner,lowerRightCorner} = addMixedQuestionsFun(mixedQuestionsDiv,mixedQuestionsTop,mixedQuestionsContent,paperHeight,questionsContent,startNumber,endNumber,itemNumber,selectedOptionsLabel,defaultOptionsLabel,selectedOptionsValue,fractionNumber,totalScore,isMixChoiceQuestions,defaultOptionsValueMix,defaultOptionsLabelMix,optionsMixNumber,pageDiv,cardFooter)
      itemNumber = num
    }
    if(questionType.value == 'addProblemSolvingQuestion'){
      isAddQuestion.value = false
      //添加解答题
      let problemSolvingQuestionDiv:any = null;
      let problemSolvingQuestionTop:any = null;
      let problemSolvingQuestionContent:any = null;
      const {num,upperLeftCorner,upperRightCorner,lowerLeftCorner,lowerRightCorner} = addProblemSolvingQuestionFun(problemSolvingQuestionDiv,problemSolvingQuestionTop,problemSolvingQuestionContent,paperHeight,questionsContent,startNumber,endNumber,itemNumber,selectedOptionsLabel,defaultOptionsLabel,selectedOptionsValue,fractionNumber,totalScore,pageDiv,cardFooter)
      itemNumber = num
    }
    if(questionType.value == 'addOptionalExercise'){
      isAddQuestion.value = false
      //添加选做题
      let optionalExerciseDiv:any = null;
      let optionalExerciseTop:any = null;
      let optionalExerciseContent:any = null;
      const {num,upperLeftCorner,upperRightCorner,lowerLeftCorner,lowerRightCorner} = addOptionalExerciseFun(optionalExerciseDiv,optionalExerciseTop,optionalExerciseContent,paperHeight,questionsContent,startNumber,endNumber,itemNumber,selectedOptionsLabel,defaultOptionsLabel,selectedOptionsValue,fractionNumber,totalScore)
      itemNumber = num
    }


  }

  //创建题卡内容的区域块
  let questionsContent:any = null
  onMounted(()=>{
    //挂载后获取到题目区域块
    questionsContent = document.getElementById('questionsContent')

  })


  const getHeight = ()=>{
    console.log('getHeight');
    //A4  1030  1457
    //A5  1030  1462
    //A3  420   297
    //B5  176   250
    //B4  250   352
    //16K 18.5  26
    const position = document.getElementById('cardContent').getBoundingClientRect();
    console.log(position.height)
    if(position.height > 1457){

    }
  }

  //混合题，填写结束的题号的时候，显示出来是否是选择
  const isChoiceQuestionsView = ref(false);
  //点击混合题进来，是否是选择题
  const isMixChoiceQuestions = ref(false);

  const choiceQuestionsList = ref<questionsList[]>([])
  //默认选中第一个
  const defaultOptionsLabelMix = ref('');
  const defaultOptionsValueMix = ref('');

  watch(()=>endNumber.value,(newValue)=>{
    if(questionType.value == 'addMixedQuestions'){
      isChoiceQuestionsView.value = true
    }
    if(!newValue){
      isChoiceQuestionsView.value = false
    }
  })


  //修改页面布局确认按钮
  const updatePageLayout = ()=>{
    pageLayout.value = false;

    layoutPaperSize.value = paperSize.value;
    layoutGradingMethod.value = gradingMethod.value;

  }

  //修改页面布局
  const modifyPageLayout = ()=>{
    pageLayout.value = true;
  }


</script>

<style scoped lang="scss">
.paper-icon {
  width: 60px;
  height: 50px;
  object-fit: contain;
}
.paper-label {
  font-size: 12px;
  color: #666;
}
.paper-size-item {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
  width: 100px;
  height: 100px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}
.paper-size-item:hover {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.paper-size-item.is-checked {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.paper-size-item.is-checked .paper-icon {
  filter: brightness(1.2);
}

.paper-size-item.is-checked .paper-label {
  color: #409eff;
}
/* 作文格子样式 */
.composition-grid {
  display: grid;
  gap: 2px;
  margin: 0 auto;
  width: fit-content;
}

.grid-cell {
  border: 1px solid #a0aec0;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.slash {
  color: #c0c4cc;
  margin: 0 4px;
}
  .card-top {
    width: 1440px;
    height: 84px;
    background: #FFFFFF;
    box-shadow: 0px 2px 6px 0px rgba(0,0,0,0.2);
    border-radius: 10px 10px 0px 0px;

    margin-left: 240px;
    /*margin-top: 164px;*/
    display: flex;
    justify-content: center;
/*    padding-top: 26px;
    padding-bottom: 26px;
    padding-left: 20px;*/
  }
.card-top-back{
  float: left;
  width: 30%;
  cursor: pointer;
  margin-top: 26px;
  margin-left: 21px;
  margin-bottom: 26px;
  flex: 1;
  div{
    width: 120px;
    height: 32px;
    background: #E8E8E8;
    border-radius: 4px 4px 4px 4px;

    float: left;
    display: flex;
    img{
      width: 24px;
      height: 24px;
      margin-top: 4px;
      margin-left: 8px;
    }
    span{
      width: 70px;
      height: 24px;
      font-family: DM Sans, DM Sans;
      font-weight: 700;
      font-size: 14px;
      color: #171717;
      line-height: 24px;
      text-align: left;
      font-style: normal;
      text-transform: none;
      margin-top: 5px;
    }
  }
}
.card-top-title{
  float: left;
  width: auto;
  flex: 1;
  margin-top: 16px;
  display: grid;
  place-items: center;
}
.card-top-title-t{
  width: 191px;
  height: 26px;
  font-family: Source Han Sans, Source Han Sans;
  font-weight: 500;
  font-size: 18px;
  color: #333333;
  line-height: 26px;
  text-align: left;
  font-style: normal;
  text-transform: none;
}
.card-top-title-b{
  width: 70px;
  height: 22px;
  font-family: Source Han Sans, Source Han Sans;
  font-weight: 400;
  font-size: 14px;
  color: #666666;
  line-height: 22px;
  text-align: left;
  font-style: normal;
  text-transform: none;
}
.card-top-right{
  text-align: right;
  flex: 1;
  padding-top: 30px;

  img{
    width: 24px;
    height: 24px;
    border-style: dashed;
    border-color: #cccccc;
  }
}
.card-top-right-btn-view{
  cursor: pointer;
  margin-right: 20px;


}
.card-top-right-btn-menu{
  cursor: pointer;
  margin-right: 28px;

}
.card-top-right-btn-download{

  width: 120px;
  height: 32px;
  background: #0052D9;
  border-radius: 4px 4px 4px 4px;
  margin-top: -18px;
  margin-right: 20px;
}
  .card-content{
    margin-top: 20px;
    margin-left: 240px;
    margin-right: 240px;
    display: flex;
  }
.card-content-sheet{
  width: 1080px;
  height: 804px;
  /*height: 1528px;*/
  background: #FFFFFF;
  box-shadow: 0px 2px 10px 0px rgba(0,0,0,0.1);
  border-radius: 0px 0px 0px 0px;
}
.card-content-sheet-top {
  margin-top: 4px;
  margin-left: 24px;
  margin-right: 24px;
  display: flex;
}
.card-content-sheet-top-img{
  width: 196px;
  height: 196px;

}
.card-content-sheet-top-basic-information {
  width: 400px;
  height: 196px;
}
.card-content-sheet-top-basic-information-title{
  line-height:40px;
  /*height: 40px;*/
  text-align: center;
  align-items: center;
  background: #E8E8E8;
  border-radius: 0px 0px 0px 0px;
  border: 1px solid #E8E8E8;
}
.card-content-sheet-top-basic-information-l{
  height: 52px;
}
.card-content-sheet-top-basic-information-l,.card-content-sheet-top-basic-information-r{
  background: #F5F6F7;
  text-align: center;
  line-height:52px;
  border-radius: 0px 0px 0px 0px;
  border: 1px solid #E8E8E8;
}

.card-content-sheet-top-card-information{
  width: 435px;
  height: 196px;
}
.card-content-sheet-top-card-information-title{
  width: 435px;
  height: 40px;
  background: #E8E8E8;
  border-radius: 0px 0px 0px 0px;
  border: 1px solid #E8E8E8;
  text-align: center;
  line-height:40px;
  span{
    width: 80px;
    height: 22px;
    font-family: Source Han Sans, Source Han Sans;
    font-weight: 400;
    font-size: 16px;
    color: #333333;
    line-height: 22px;
    text-align: left;
    font-style: normal;
    text-transform: none;
  }
}
.card-content-sheet-top-card-information-content{
  width: 437px;
  height: 154px;
  background: #F5F6F7;
  border-radius: 0px 0px 0px 0px;
  border: 1px solid #E8E8E8;
  text-align: center;
  p{
    line-height: 12px;
  }
}
.paste-box{
  margin:30px auto;
  line-height:60px;
  width: 300px;
  height: 100px;
  border:2px dashed  #000000;
  border-radius: 15px;
  position: relative;
}
.paste-box::before {
  content: "请注意粘贴范围";
  position: absolute;
  top: -30px; /* 根据需要调整 */
  left: 50%;
  transform: translateX(-50%);
  background-color: #F5F6F7; /* 与背景相同以隐藏背景 */
  padding: 0 5px; /* 根据需要调整 */
}
.paste-box::after {
  content: "请注意粘贴范围";
  position: absolute;
  top: 65px; /* 根据需要调整 */
  left: 50%;
  transform: translateX(-50%);
  background-color: #F5F6F7; /* 与背景相同以隐藏背景 */
  padding: 0 5px; /* 根据需要调整 */
}
.card-content-sheet-content{
  width: 1031px;
  /*height: 196px;*/
  margin-top: 10px;
  margin-left: 24px;
  /*background-color: #8cc5ff;*/
}

.page{
  page-break-after: always;
  margin-bottom: 100px;
  padding-top: 20px;
}
.card-container{
  position: relative
}
.absent{
  margin:20px 24px 0 24px;background: #F5F6F7;
}
.tip-top{
  top: 0;
  position: absolute;
  width: 100%;
  text-align: center;
  line-height: 36px
}
.tip-bottom{
  bottom: 0;
  position: absolute;
  width: 100%;
  text-align: center;
  line-height: 36px
}
.card_footer{
  text-align: center;
  line-height: 24px;
  font-size: 14px;
}
.card-content-config{
  width: 338px;
  height: 804px;
  background: #FFFFFF;
  box-shadow: 0px 2px 10px 0px rgba(0,0,0,0.1);
  border-radius: 0px 0px 0px 0px;
  margin-left: 23px;
}
.card-content-config-title{
  width: 80px;
  height: 24px;
  font-family: Source Han Sans, Source Han Sans;
  font-weight: 500;
  font-size: 16px;
  color: #333333;
  line-height: 24px;
  text-align: left;
  font-style: normal;
  text-transform: none;
  margin-top: 16px;
  margin-left: 24px;
}
.card-content-config-layout{
  width: 64px;
  height: 24px;
  font-family: Source Han Sans, Source Han Sans;
  font-weight: 500;
  font-size: 16px;
  color: #333333;
  line-height: 24px;
  text-align: left;
  font-style: normal;
  text-transform: none;
  margin-top: 23px;
  margin-left: 24px;
}
.card-content-config-layout-box{
  display: grid;
  grid-template-columns: repeat(2, 140px);
}

.question-structure-items{
  width: 90px;
  margin : 0 0 0 0;
  justify-content: flex-start;
}
.card-content-config-layout-paper{
  width: 289px;
  height: 32px;
  border-radius: 4px 4px 4px 4px;
  border: 1px solid #E8E8E8;
  margin-top:10px;
  margin-left: 25px;
  display: flex;
  span{
    width: 156px;
    height: 20px;
    font-family: Source Han Sans, Source Han Sans;
    font-weight: 400;
    font-size: 14px;
    color: #333333;
    line-height: 20px;
    text-align: left;
    font-style: normal;
    text-transform: none;
    flex: 1;
  }

}
.add-type{
  width: 16px;
  height: 16px;
}
.total-score{
  width: 42px;
  height: 24px;
  font-family: Source Han Sans, Source Han Sans;
  font-weight: 400;
  font-size: 14px;
  color: #333333;
  line-height: 24px;
  text-align: left;
  font-style: normal;
  text-transform: none;
  margin-top: 18px;
  margin-left: 25px;
}
.score{
  width: 28px;
  height: 36px;
  font-family: Source Han Sans, Source Han Sans;
  font-weight: 500;
  font-size: 24px;
  color: #EB1919;
  line-height: 36px;
  text-align: left;
  font-style: normal;
  text-transform: none;
  margin-left: 12px;
  margin-top: 12px;
}
.fen{
  width: 14px;
  height: 24px;
  font-family: Source Han Sans, Source Han Sans;
  font-weight: 400;
  font-size: 14px;
  color: #333333;
  line-height: 24px;
  text-align: left;
  font-style: normal;
  text-transform: none;
  margin-top: 18px;
  margin-left: 12px;
}
.add-div{
  margin-left: 25px;
  margin-top: 20px;
}
.add-div-span {
  width: 119px;
  height: 22px;
  font-family: Source Han Sans, Source Han Sans;
  font-weight: 400;
  font-size: 14px;
  color: #333333;
  line-height: 22px;
  text-align: left;
  font-style: normal;
  text-transform: none;
}
</style>
<style>
.el-dialog__footer {
  text-align: center;
}
</style>