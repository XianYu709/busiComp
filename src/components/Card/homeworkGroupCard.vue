<!--作业组卷答题卡-->
<template>
  <div class="card-top">
    <div class="card-top-back">
      <div @click="goBackBtn">
        <img src="./images/back.png">
        <span>返回上一步</span>
      </div>
    </div>
    <div class="card-top-title">

      <span class="card-top-title-t">作业组卷答题卡</span>
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
        <div class="exam-title"><h3>XXX作业组卷答题卡</h3></div>
        <!-- 基本信息 -->
        <div class="page" id="page">
          <div id="cardContent" class="card-container" :style="{height: paperHeight+'px'}">
            <div class="card-content-sheet-top">
              <div class="card-content-sheet-top-basic-information" id="cardInfo">

                <div class="information" >
                  <span class="span1">姓名：</span>
                  <p class="span2"></p>
                </div>
                <div class="information" >
                  <span class="span1">班级：</span>
                  <p class="span2"></p>
                </div>
                <div class="information">
                  <span class="span1">考号：</span>
                  <p class="span2"></p>
                </div>
              </div>
              <div class="card-content-sheet-top-card-information">
                <div class="card-content-sheet-top-card-information-content">
                  <div id="examNumber" v-if="boolFill">
                    <p v-for="item in HOME_NUMBER" :key="item.id" class="">{{item.label}}</p>
                  </div>
                  <div v-if="boolPaste" style="display: flex;">
                    <div class="paste-box">
                      <h3>贴条形码区</h3>
                    </div>
                  </div>
                </div>
              </div>
              <!--二维码图片-->
              <div style="width: 195px;height: 195px"><img :src="qrcodeUrl" class="card-content-sheet-top-img" id="cardContentSheetTopImg"></div>
            </div>

            <!-- 答题卡内容 -->
            <div class="card-content-sheet-content" id="questionsContent">
              <!--在这里添加题-->
              <div v-if="isPureQuestionCard">
                <!-- 这里是纯题卡（无题目） -->
                <div>
                  <p style="font-weight: 700">一、选择题<span v-if="isShowScore">({{score}}分)</span></p>
                  <div style="width: 1030px;height: 40px;border:1px solid #000000;border-radius: 0 0 0 0">

                  </div>
                </div>
                <div>
                  <p style="font-weight: 700">二、填空题<span v-if="isShowScore">({{score}}分)</span></p>
                  <div style="width: 1030px;height: 40px;border:1px solid #000000;border-radius: 0 0 0 0">

                  </div>
                </div>
              </div>

              <div v-if="!isPureQuestionCard">
                <!--这里是题卡合一的内容-->
                <div>替卡合一</div>

              </div>
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
        <div class="new-layout">
          <el-collapse v-model="activeNames">
            <el-collapse-item title="基本信息" name="1" >
              <template #title >
                <div class="card-title">基本信息</div>
              </template>
              <template #icon="{ isActive }">
                <span class="card-title icon-ele">
                  {{ isActive ? '收起' : '展开' }}
                </span>
              </template>
              <div class="card-conten">
                <div>
                  <span>题卡样式：</span>
                  <el-radio-group v-model="cardType" style="width: 250px;height: 50px">
                    <el-radio :value="1" >纯题卡（无题目）</el-radio>
                    <el-radio :value="2" >题卡合一</el-radio>
                  </el-radio-group>
                </div>
                <div><span>页面布局：</span>

                    <span>{{ layoutPaperSize }} / {{ layoutGradingMethod }}</span>
                    <el-button type="primary" style="float: right" text @click="modifyPageLayout">修改</el-button>

                </div>
                <div v-if="!isPureQuestionCard">
                  <span>显示内容：</span>
                  <el-radio-group v-model="radio" style="width: 220px;height: 50px">
                    <el-radio :value="1" >题目+段落</el-radio>
                    <el-radio :value="2" >仅题目</el-radio>
                  </el-radio-group>
                </div>
                <div style="display: flex;justify-content: space-between">
                  <div style="display: inline-block">
                    <span>字号：</span>
                    <el-select style="width: 100px" v-model="defaultFontSize" >
                      <el-option v-for="item in FONT_SIZE_LIST" :key="item.id" :label="item.content" :value="item.value"/>
                    </el-select>
                  </div>
                  <div style="display: inline-block">
                    <span>行高：</span>
                    <el-input-number
                        v-model="lineHeight"
                        :min="4"
                        controls-position="right"
                        :step="1"
                        style="width: 110px"
                    >
                      <template #suffix>
                        <span style="color: #999;">mm</span>
                      </template>
                    </el-input-number>
                  </div>
                </div>
                <div>
                  <span>考号板式：</span>
                  <el-radio-group v-model="radio" style="width: 220px;height: 50px">
                    <el-radio :value="3" @change="onChangeExamNumber('fill')">填涂</el-radio>
                    <el-radio :value="6" @change="onChangeExamNumber('paste')">条形码</el-radio>
                    <el-radio :value="9" @change="onChangeExamNumber('handwriting')">手写</el-radio>
                  </el-radio-group>
                </div>
                <div>
                  <span>题目排序：</span>
                  <el-radio-group v-model="radio" style="height: 50px">
                    <el-radio :value="1" >全部小题接排</el-radio>
                    <el-radio :value="2" >按大题单独接排</el-radio>
                  </el-radio-group>
                </div>
                <div v-if="!isPureQuestionCard">
                  <span>客观题作答方式：</span>
                  <el-radio-group v-model="objectiveQuestionAnsweringMethod" style="width: 200px;height: 50px">
                    <el-radio :value="1" style="width: 100px">填涂</el-radio>
                    <el-radio :value="2" >手写</el-radio>
                  </el-radio-group>
                  <el-checkbox v-if="isChecked1" v-model="checked1Val" style="margin-left: 105px" label="客观题集中填涂" size="large" />
                </div>
                <div class="card-content-config-layout-box">
                  <el-checkbox v-model="isRed" label="红色答题卡" size="large" @change="changeCardColor"/>
                  <el-checkbox v-model="checked3" label="是否显示答题卡ID" size="large" />
                  <el-checkbox v-model="checked3" label="显示制卡信息" size="large" />
                  <el-checkbox v-model="checked6" label=""  size="large" >主观题小题集中批阅
                    <el-tooltip
                        class="box-item"
                        effect="dark"
                        content="1.勾选后，题目下的已拆分小题，在线批阅时，集中在一个页面分别赋分；2、不勾选时，按已拆分小题分别赋分。"
                        placement="top"
                    ><img src="./images/306.svg" style="width: 13px;height: 13px">
                    </el-tooltip>
                  </el-checkbox>
                  <el-checkbox v-model="isVertical" label="文本加粗" size="large" @change="changeVertical"/>
                </div>
              </div>

            </el-collapse-item>
          </el-collapse>
        </div>
        <div class="score-sheet">
          <p style="font-weight: 700;position: relative;display: grid;grid-template-columns: 230px 150px;">
            <span>分数设置</span>
            <span style="position: static;font-size: 14px;">满分：<span style="color: #1c84c6">{{1}}</span>分</span>
          </p>
          <div>
            <!--在这里循环组卷的题型，每个题型下的小题-->
            <div style="">
              <span>一、选择题（共1小题，共1分）</span>
              <el-input-number
                v-model="fractionNumber"
                :min="0.5"
                controls-position="right"
                :precision="1"
                :step="0.5"
                style="width: 75px"
            />分
            </div>
            <div>
              <span>二、填空题（共1小题，共1分）</span>
              <el-input-number
                  v-model="fractionNumber"
                  :min="0.5"
                  controls-position="right"
                  :precision="1"
                  :step="0.5"
                  style="width: 75px"
              />分
            </div>
            <div>
              <span>二、填空题（共1小题，共1分）</span>
              <el-input-number
                  v-model="fractionNumber"
                  :min="0.5"
                  controls-position="right"
                  :precision="1"
                  :step="0.5"
                  style="width: 75px"
              />分
            </div>
          </div>
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
      <p style="font-weight: 600">题卡样式</p>
      <el-radio-group v-model="gradingMethod" style="margin-left: 20px">
        <el-radio style="width: 150px" v-for="item in STYLE_ASTYPE" :key="item.id" :value="item.content">{{ item.content }}</el-radio>
      </el-radio-group>
    </div>
    <div>
      <p style="font-weight: 600">纸张大小</p>
      <div>

      </div>
      <el-radio-group v-model="paperSize" style="display: flex;flex-wrap: wrap;gap: 15px;">
        <el-radio v-for="item in paperSizeList" :key="item.id" :value="item.value" :label="item.label" class="paper-size-item">
          <div class="icon-wrapper">
            <img :src="getIconPath(item.value)" alt="纸张样式" class="paper-icon"/>
          </div>
          <span class="paper-label">{{ item.label }}</span>
        </el-radio>

      </el-radio-group>
    </div>
    <div>
      <p style="font-weight: 600">阅卷方式</p>
      <el-radio-group v-model="gradingMethod" style="margin-left: 20px">
        <el-radio style="width: 150px" v-for="item in LAYOUT_ASTYPE" :key="item.id" :value="item.content">{{ item.content }}</el-radio>
      </el-radio-group>
    </div>
    <div style="margin-left: 20px">
      <el-checkbox v-model="isRed" label="设为默认，下次不再显示" size="large" />
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="pageLayout = false" style="width: 80px">取消</el-button>
        <el-button type="primary" style="width: 80px" @click="updatePageLayout">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>


  <!-- 预览图片的dialog -->
  <CardViewDialog v-model="anchorPoint" :capturedImage="capturedImage"/>
</template>

<script setup lang="ts">
  import {ref, watch} from 'vue'
  import QRCode from 'qrcode';
  import html2canvas from "html2canvas";
  import {useRoute} from "vue-router";
  import {
    paperSizeList,
    HOME_NUMBER,
    PAGE_HEIGHT,
    QUESTION_NUMBERS,
    LAYOUT_ASTYPE,
    STYLE_ASTYPE, FONT_SIZE_LIST, PRECAUTIONS
  } from './models/base.ts';

  import CardViewDialog from "./dialog/cardViewDialog.vue";
  const activeNames = ref(['1'])
  //定位点
  const anchorPoint = ref(false)
  //根据这个生成二维码
  const sourceObj = {
    number:1,
    xuehao:'20170513006'
  }
  const qrcodeUrl = ref('')
  const score = ref(0);
  const isShowScore = ref(false);

  // 生成二维码的函数
  const generateQRCode = async () => {
    try {
      // 1. 将对象转换为字符串
      const jsonString = JSON.stringify(sourceObj);
      // 2. 生成二维码的Data URL
      const url = await QRCode.toDataURL(jsonString, {
        width: 190,        // 二维码宽度
        height: 190,       // 二维码高度
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
  //题卡样式
  const cardType = ref(1)
  //是纯题卡
  const isPureQuestionCard = ref(true)
  watch(()=>cardType.value, (newVal) => {
    if (newVal == 1) {
      isPureQuestionCard.value = true;
    }else{
      isPureQuestionCard.value = false;
    }
  })
  const defaultFontSize = ref('11px')
  const lineHeight = ref(5)
  //客观题作答方式
  const objectiveQuestionAnsweringMethod = ref(1)
  watch(()=>objectiveQuestionAnsweringMethod.value,(newVal)=>{
    console.log(newVal)
    if(newVal == 2) {
      //kegua
      isChecked1.value = false
    }else{
      isChecked1.value = true
    }
  })
  //客观题集中填涂
  const isChecked1 = ref(true);
  const checked1Val = ref(true)

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
  const questionCardStyle = ref(1)
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
  //客观题竖向排列
  const changeVertical = (val:any)=>{
    const parentDiv = document.getElementsByClassName('choiceQuestionGroupDiv')
    const objectiveQuestions = document.getElementsByClassName('objective-question');
    if(val){
      for(let i = 0; i < parentDiv.length; i++) {
        parentDiv[i].style.display = 'flex';
      }
      for (let objectiveQuestion of objectiveQuestions) {
        objectiveQuestion.style.width = '30px';
        objectiveQuestion.style.height = '100%';
        //objectiveQuestion.style.marginLeft = '0';
        objectiveQuestion.getElementsByTagName('span')[0].style.textAlign = 'center';
        objectiveQuestion.getElementsByTagName('span')[0].style.width = '100%';
        objectiveQuestion.getElementsByTagName('span')[1].style.lineHeight = '35px';
      }

      //获取到客观题，在这里是点击了竖向排列
    }else{
      for(let i = 0; i < parentDiv.length; i++) {
        parentDiv[i].style.display = '';
      }
      for (let objectiveQuestion of objectiveQuestions) {
        objectiveQuestion.style.width = '';
        objectiveQuestion.style.height = '13px';
        objectiveQuestion.style.marginLeft = '28px';
        objectiveQuestion.getElementsByTagName('span')[0].style.textAlign = '';
        objectiveQuestion.getElementsByTagName('span')[0].style.width = '15px';
        objectiveQuestion.getElementsByTagName('span')[0].style.display = 'inline-block';
        objectiveQuestion.getElementsByTagName('span')[1].style.lineHeight = '35px';

      }
    }
  }

  const checked2 = ref(false)
  const checked3 = ref(false)
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

  //创建题卡内容的区域块
  let questionsContent:any = null
  onMounted(()=>{
    //挂载后获取到题目区域块
    questionsContent = document.getElementById('questionsContent')

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
*{margin:0;padding: 0}
/*右侧上方基本信息*/
.new-layout{
  padding: 0;
}
.score-sheet{
  height: 48px;
  line-height: 48px;
  border-radius: 8px 8px 0 0;
  background-color: #f9fafe;
  padding: 0 10px;
  color: #333;

  font-size: 16px;
  margin: 0;
  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  justify-content: space-between;
}

.card-title{
  height: 48px;
  line-height: 48px;
  background-color: #f9fafe;
  padding: 0 16px;
  color: #333;
  font-weight: 700;
  font-size: 16px;
  margin: 0;
}
.icon-ele {
  float: right;
  margin: 0 8px 0 auto;
  color: #409eff;
  font-size: 12px;
}
.card-conten{
  padding: 0 10px;
  padding-bottom: 9px;
  border-radius: 0 0 var(--jby-border-radius-base-2) var(--jby-border-radius-base-2);
  /*border: 1px solid #e2ebff;*/
}


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
.exam-title{
  display: flex;
  justify-content: center;
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
  justify-content: space-between;
}
.card-content-sheet-top-img{
/*  width: 196px;
  height: 196px;*/

}
.card-content-sheet-top-basic-information {
  width: 400px;
  height: 195px;
  border: 1px solid #000000;
}
.top-info-d{
  margin-left: 30px;
  width: 94%;
  display: flex;
}
.top-info{
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  p{
    width: 80%;
    height: 70%;
    border-bottom: 1px solid #000000
  }
}
.information{
  width: 100%;
  height: 34%;
  display: flex;
  align-items: center;
  justify-content: center;
  p{
    height: 50%;
    width: 60%;
    border-bottom: 1px solid #000;
  }
}

.card-content-sheet-top-basic-information-l{
  height: 65px;
}
.card-content-sheet-top-basic-information-l,.card-content-sheet-top-basic-information-r{
  //background: #F5F6F7;
  text-align: center;
  line-height:65px;
  border-radius: 0px 0px 0px 0px;
  border: 1px solid #E8E8E8;
}

.card-content-sheet-top-card-information{
  width: 400px;
  height: 195px;
}

.card-content-sheet-top-card-information-content{
  width: 100%;
  height: 195px;
  //background: #F5F6F7;
  border-radius: 0px 0px 0px 0px;
  border: 1px solid #000000;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  p{
    line-height: 12px;
    margin:12px
  }
}
.paste-box{
  //margin:30px auto;
  line-height:60px;
  width: 300px;
  height: 100px;
  border:2px dashed  #000000;
  border-radius: 15px;
  position: relative;
  //display: flex;
  //justify-content: center;
  //align-items: center;
}
.paste-box::before {
  content: "请注意粘贴范围";
  position: absolute;
  top: -30px; /* 根据需要调整 */
  left: 50%;
  height: 50px;
  line-height: 50px;
  transform: translateX(-50%);
  background-color: #ffffff; /* 与背景相同以隐藏背景 */
  padding: 0 5px; /* 根据需要调整 */
}
.paste-box::after {
  content: "请注意粘贴范围";
  position: absolute;
  top: 65px; /* 根据需要调整 */
  left: 50%;
  height: 50px;
  line-height: 50px;
  transform: translateX(-50%);
  background-color: #ffffff; /* 与背景相同以隐藏背景 */
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
  grid-template-columns: repeat(2, 150px);
}

.question-structure-items{
  width: 90px;
  margin : 0 0 0 0;
  justify-content: flex-start;
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