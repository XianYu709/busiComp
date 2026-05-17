
//选择题
export const addChoiceQuestionsFun = (choiceQuestionDiv:any,choiceQuestionTop:any,choiceQuestionContent:any,paperHeight:any,questionsContent:any,startNumber:any,endNumber:any,itemNumber:any,selectedOptionsLabel:any,defaultOptionsLabel:any,selectedOptionsValue:any,fractionNumber:any,totalScore:any,defaultOptionsValue:any,optionsNumber:any)=>{
    choiceQuestionDiv = document.createElement('div');
    //choiceQuestionDiv.style.marginTop = '24px';
    choiceQuestionDiv.id = 'choiceQuestionDiv';
    //choiceQuestionDiv.className = 'choiceQuestionDiv';

    //选择题的顶部
    choiceQuestionTop = document.createElement('div');
    //choiceQuestionTop.textContent = defaultOptionsLabel.value+'('+totalScore.value+'分)'
    //choiceQuestionTop.id = 'choiceQuestionTop';
    choiceQuestionTop.style.lineHeight = '35px';
    //choiceQuestionTop.style.textAlign = 'center';
    choiceQuestionTop.style.width = '1030px';
    choiceQuestionTop.style.height = '40px';
    //choiceQuestionTop.style.background = '#E8E8E8';
    //choiceQuestionTop.style.borderRadius = '0px 0px 0px 0px';
    //choiceQuestionTop.style.border = '1px solid #E8E8E8';
    choiceQuestionDiv.appendChild(choiceQuestionTop);

    //const hasChildChoiceQuestion = choiceQuestionDiv.querySelector('#choiceQuestionTop');
    //console.log(hasChildChoiceQuestion);
    //添加选择题  判断是否已经创建头，如果有头，直接创建内容，没有头的话全都创建

    //创建单选题的一整个大框

    //题目在这个div里创建  根据选择的选择题类型创建对应的选项


    choiceQuestionContent = document.createElement('div');
    choiceQuestionContent.id = 'choiceQuestionContent';
    //choiceQuestionContent.style.width = '1030px';
    //choiceQuestionContent.style.height='121px';
    //choiceQuestionContent.style.background = '#F5F6F7';
    choiceQuestionContent.style.borderRadius = '0px 0px 0px 0px';
    choiceQuestionContent.style.border = '1px solid #000000';
    //choiceQuestionContent.style.display = 'flex';

    choiceQuestionContent.style.display = 'grid'
    choiceQuestionContent.style.gap = '0px'
    choiceQuestionContent.style.margin = '0 auto'
    //choiceQuestionContent.style.width = 'fit-content'
    if(defaultOptionsValue.value === 'chunkingQuestions'){
        choiceQuestionContent.style.gridTemplateColumns = `repeat(3, 343px)`;
    }else{
        choiceQuestionContent.style.gridTemplateColumns = `repeat(5, 206px)`;
    }
    choiceQuestionContent.style.padding = '10px 10px';

    choiceQuestionDiv.appendChild(choiceQuestionContent);

    questionsContent.appendChild(choiceQuestionDiv);

    if(choiceQuestionContent != null){
        //循环创建内容
        const count = endNumber.value - startNumber.value + 1
        //判断count 5个一组放到一个div里 div
        //每次存放后剩余的数量
        let countSy = count;
        //根据count创建div数量
        if(countSy > 5) {
            for (let m = 0; m < Math.floor(count / 5); m++) {
                if (countSy < 5) break;
                const choiceQuestionsDiv = document.createElement('div');
                choiceQuestionsDiv.id = 'choiceQuestionGroupDiv';
                choiceQuestionsDiv.className = 'choiceQuestionGroupDiv';
                //choiceQuestionsDiv.style.display = 'flex';
                choiceQuestionDiv.style.justifyContent = 'center';
                //choiceQuestionsDiv.style.width = '210px';
                //在这个div里创建p存放小题号 和选项
                for (let i = 0; i < 5; i++) {
                    const choiceQuestionsItems = document.createElement('p')
                    choiceQuestionsItems.className = 'objective-question';
                    choiceQuestionsItems.style.height = '13px';
                    //choiceQuestionsItems.style.marginLeft = '28px';

                    const choiceQuestionSpan1 = document.createElement('span');
                    choiceQuestionSpan1.style.display = 'inline-block';
                    choiceQuestionSpan1.style.width = '25px';
                    const choiceQuestionSpan2 = document.createElement('span');
                    choiceQuestionSpan2.className = 'choiceQuestionSpan';
                    choiceQuestionSpan1.textContent = itemNumber
                    //choiceQuestionsItems.
                    console.log(defaultOptionsValue.value)
                    if (defaultOptionsValue.value === 'singleChoiceQuestion' || defaultOptionsValue.value === 'multipleChoiceQuestions' || defaultOptionsValue.value === 'multipleChoiceQuestionsOneOrMore') {
                        //在这里根据optionsNumberMax动态的生成对应个数的选项
                        for (let j = 65; j < 65 + optionsNumber.value; j++) {
                            //console.log(String.fromCharCode(j)+j)
                            choiceQuestionSpan2.textContent = choiceQuestionSpan2.textContent + ' [ ' + String.fromCharCode(j) + ' ]'
                        }
                        if(defaultOptionsValue.value === 'singleChoiceQuestion'){
                            choiceQuestionsItems.className = 'objective-question singleChoiceQuestion';
                            choiceQuestionDiv.className = 'singleChoiceQuestionDiv';
                        }
                        if(defaultOptionsValue.value === 'multipleChoiceQuestions'){
                            choiceQuestionsItems.className = 'objective-question multipleChoiceQuestions';
                            choiceQuestionDiv.className = 'multipleChoiceQuestionsDiv';
                        }
                        if(defaultOptionsValue.value === 'multipleChoiceQuestionsOneOrMore'){
                            choiceQuestionsItems.className = 'objective-question multipleChoiceOneOrMore';
                            choiceQuestionDiv.className = 'multipleChoiceOneOrMoreDiv';
                        }
                    } else if (defaultOptionsValue.value === 'TorFQuestions') {
                        choiceQuestionSpan2.textContent = '[ T ][ F ]'
                        choiceQuestionsItems.className = 'objective-question TorFQuestions';
                        choiceQuestionDiv.className = 'TorFQuestionsDiv';
                    } else if (defaultOptionsValue.value === 'chunkingQuestions') {
                        //断句题最多20
                        for (let j = 65; j < 65 + optionsNumber.value; j++) {
                            choiceQuestionSpan2.textContent = choiceQuestionSpan2.textContent + '[ ' + String.fromCharCode(j) + ' ]'
                        }
                        choiceQuestionsItems.className = 'objective-question chunkingQuestions';
                        choiceQuestionDiv.className = 'chunkingQuestionsDiv';
                    }
                    choiceQuestionsItems.appendChild(choiceQuestionSpan1)
                    choiceQuestionsItems.appendChild(choiceQuestionSpan2);
                    choiceQuestionsDiv.appendChild(choiceQuestionsItems)
                    choiceQuestionContent.appendChild(choiceQuestionsDiv)
                    itemNumber++
                }
                countSy = countSy - 5;
            }
            if(countSy < 5){
                const choiceQuestionsDiv = document.createElement('div');
                choiceQuestionsDiv.className = 'choiceQuestionGroupDiv';
                //在这个div里创建p存放小题号 和选项

                //console.log('创建的题目数量:' + countSy)
                for (let n = 0; n < countSy; n++) {
                    const choiceQuestionsItems = document.createElement('p')
                    choiceQuestionsItems.className = 'objective-question';
                    choiceQuestionsItems.style.height = '13px';
                    //choiceQuestionsItems.style.marginLeft = '28px';

                    const choiceQuestionSpan1 = document.createElement('span');
                    choiceQuestionSpan1.style.display = 'inline-block';
                    choiceQuestionSpan1.style.width = '25px';
                    const choiceQuestionSpan2 = document.createElement('span');
                    choiceQuestionSpan2.className = 'choiceQuestionSpan';
                    choiceQuestionSpan1.textContent = itemNumber
                    //choiceQuestionsItems.
                    if (defaultOptionsValue.value === 'singleChoiceQuestion' || defaultOptionsValue.value === 'multipleChoiceQuestions' || defaultOptionsValue.value === 'multipleChoiceQuestionsOneOrMore') {
                        //在这里根据optionsNumberMax动态的生成对应个数的选项
                        for (let j = 65; j < 65 + optionsNumber.value; j++) {
                            //console.log(String.fromCharCode(j)+j)
                            choiceQuestionSpan2.textContent = choiceQuestionSpan2.textContent + '[ ' + String.fromCharCode(j) + ' ]'
                        }
                        if(defaultOptionsValue.value === 'singleChoiceQuestion'){
                            choiceQuestionsItems.className = 'objective-question singleChoiceQuestion';
                            choiceQuestionDiv.className = 'singleChoiceQuestionDiv';
                        }
                        if(defaultOptionsValue.value === 'multipleChoiceQuestions'){
                            choiceQuestionsItems.className = 'objective-question multipleChoiceQuestions';
                            choiceQuestionDiv.className = 'multipleChoiceQuestionsDiv';
                        }
                        if(defaultOptionsValue.value === 'multipleChoiceQuestionsOneOrMore'){
                            choiceQuestionsItems.className = 'objective-question multipleChoiceOneOrMore';
                            choiceQuestionDiv.className = 'multipleChoiceOneOrMoreDiv';
                        }
                    } else if (defaultOptionsValue.value === 'TorFQuestions') {
                        choiceQuestionSpan2.textContent = itemNumber + '[ T ][ F ]'
                        choiceQuestionsItems.className = 'objective-question TorFQuestions';
                        choiceQuestionDiv.className = 'TorFQuestionsDiv';
                    } else if (defaultOptionsValue.value === 'chunkingQuestions') {
                        //断句题最多20
                        for (let j = 65; j < 65 + optionsNumber.value; j++) {
                            choiceQuestionSpan2.textContent = choiceQuestionSpan2.textContent + '[ ' + String.fromCharCode(j) + ' ]'
                        }
                        choiceQuestionsItems.className = 'objective-question chunkingQuestions';
                        choiceQuestionDiv.className = 'chunkingQuestionsDiv';

                    }
                    choiceQuestionsItems.appendChild(choiceQuestionSpan1)
                    choiceQuestionsItems.appendChild(choiceQuestionSpan2);
                    choiceQuestionsDiv.appendChild(choiceQuestionsItems)
                    choiceQuestionContent.appendChild(choiceQuestionsDiv)
                    itemNumber++
                }
            }

        }else{
            const choiceQuestionsDiv = document.createElement('div');
            choiceQuestionsDiv.className = 'choiceQuestionGroupDiv';
            //choiceQuestionsDiv.style.width = '190px';
            //在这个div里创建p存放小题号 和选项

            //console.log('创建的题目数量:' + count)
            for (let i = 0; i < count; i++) {
                const choiceQuestionsItems = document.createElement('p')
                choiceQuestionsItems.className = 'objective-question';
                choiceQuestionsItems.style.height = '13px';
                //choiceQuestionsItems.style.marginLeft = '10px';

                const choiceQuestionSpan1 = document.createElement('span');
                choiceQuestionSpan1.style.display = 'inline-block';
                choiceQuestionSpan1.style.width = '25px';
                const choiceQuestionSpan2 = document.createElement('span');
                choiceQuestionSpan2.className = 'choiceQuestionSpan';
                choiceQuestionSpan1.textContent = itemNumber
                //choiceQuestionsItems.
                if (defaultOptionsValue.value === 'singleChoiceQuestion' || defaultOptionsValue.value === 'multipleChoiceQuestions' || defaultOptionsValue.value === 'multipleChoiceQuestionsOneOrMore') {
                    //在这里根据optionsNumberMax动态的生成对应个数的选项
                    for (let j = 65; j < 65 + optionsNumber.value; j++) {
                        choiceQuestionSpan2.textContent = choiceQuestionSpan2.textContent + '[ ' + String.fromCharCode(j) + ' ]'
                    }
                    if(defaultOptionsValue.value === 'singleChoiceQuestion'){
                        choiceQuestionsItems.className = 'objective-question singleChoiceQuestion';
                        choiceQuestionDiv.className = 'singleChoiceQuestionDiv';
                    }
                    if(defaultOptionsValue.value === 'multipleChoiceQuestions'){
                        choiceQuestionsItems.className = 'objective-question multipleChoiceQuestions';
                        choiceQuestionDiv.className = 'multipleChoiceQuestionsDiv';
                    }
                    if(defaultOptionsValue.value === 'multipleChoiceQuestionsOneOrMore'){
                        choiceQuestionsItems.className = 'objective-question multipleChoiceOneOrMore';
                        choiceQuestionDiv.className = 'multipleChoiceOneOrMoreDiv';
                    }
                } else if (defaultOptionsValue.value === 'TorFQuestions') {
                    choiceQuestionSpan2.textContent =  '[ T ][ F ]'
                    choiceQuestionsItems.className = 'objective-question TorFQuestions';
                    choiceQuestionDiv.className = 'TorFQuestionsDiv';
                } else if (defaultOptionsValue.value === 'chunkingQuestions') {
                    //断句题最多20
                    for (let j = 65; j < 65 + optionsNumber.value; j++) {
                        //console.log(String.fromCharCode(j)+j)
                        choiceQuestionSpan2.textContent = choiceQuestionSpan2.textContent + '[ ' + String.fromCharCode(j) + ' ]'
                    }
                    choiceQuestionsItems.className = 'objective-question chunkingQuestions';
                    choiceQuestionDiv.className = 'chunkingQuestionsDiv';
                }
                choiceQuestionsItems.appendChild(choiceQuestionSpan1)
                choiceQuestionsItems.appendChild(choiceQuestionSpan2);
                choiceQuestionsDiv.appendChild(choiceQuestionsItems)
                choiceQuestionContent.appendChild(choiceQuestionsDiv)
                itemNumber++
            }
        }
        //右侧设置答题卡里总分创建内容
        const totalScoreDiv = document.getElementById('totalScoreDiv');
        const addDiv = document.createElement('div')
        addDiv.id = 'ChoiceQuestionsTotalScoreDiv';
        addDiv.style.height = '25px';
        addDiv.style.marginLeft = '25px';
        addDiv.style.marginTop = '20px';
        const addDivSpan = document.createElement('span');

        addDivSpan.style.width = '119px';
        addDivSpan.style.height = '22px';
        addDivSpan.style.fontFamily = 'Source Han Sans:any, Source Han Sans';
        addDivSpan.style.fontWeight = '400';
        addDivSpan.style.fontSize = '14px';
        addDivSpan.style.color = '#333333';
        addDivSpan.style.lineHeight = '22px';
        addDivSpan.style.textAlign = 'left';
        addDivSpan.style.fontStyle = 'normal';
        addDivSpan.style.textTransform = 'none';
        addDivSpan.textContent = `${selectedOptionsLabel.value}、${defaultOptionsLabel.value}（${startNumber.value}-${endNumber.value}）`;

        const addDivBtnDiv = document.createElement('div')
        //addDivBtnDiv.style.width = '100%';
        addDivBtnDiv.style.display = 'inline-block';
        addDivBtnDiv.style.float = 'right';

        const addEditBtn = document.createElement('button')
        addEditBtn.textContent = '编辑';
        addEditBtn.addEventListener('click',()=>{
            //点击编辑
            //显示dialog，根据传过来的信息去赋值显示值
            //console.log(`大题号：${selectedOptionsValue.value}，题目名称：${defaultOptionsLabel.value}，下拉框的值，startNumber：${startNumber.value},endNumber：${endNumber.value},`);
        })
        addEditBtn.style.width = '50px';
        addEditBtn.style.height = '20px';
        addEditBtn.style.border = 'none';
        addEditBtn.style.fontSize = '14px';
        addEditBtn.style.cursor = 'pointer';
        addEditBtn.style.backgroundColor = '#fff';
        addEditBtn.style.color = '#0E5FC7';
        addDivBtnDiv.appendChild(addEditBtn)

        const addLine = document.createElement('span')
        addLine.textContent = '/';
        addLine.style.color = '#c0c4cc';
        //addLine.style.margin = '0 4px';
        addDivBtnDiv.appendChild(addLine)

        const addDelBtn = document.createElement('button')
        addDelBtn.addEventListener('click', function(){
            //删除元素
            delQuestionsFun('choiceQuestionDiv');
            //删除右侧
            let element = document.getElementById('ChoiceQuestionsTotalScoreDiv');
            element.parentNode.removeChild(element);
            //重新计算分数
            totalScore.value = totalScore.value - score;
            //小题号
            itemNumber = itemNumber - count;
            startNumber.value = startNumber.value - count;
            endNumber.value = startNumber.value - count;
            //大题号
            //selectedOptionsValue.value--
        })
        addDelBtn.textContent = '删除';
        addDelBtn.style.width = '50px';
        addDelBtn.style.height = '20px';
        addDelBtn.style.border = 'none';
        addDelBtn.style.fontSize = '14px';
        addDelBtn.style.cursor = 'pointer';
        addDelBtn.style.backgroundColor = '#fff';
        addDelBtn.style.color = '#0E5FC7';

        addDivBtnDiv.appendChild(addDelBtn)

        addDiv.appendChild(addDivSpan)
        addDiv.appendChild(addDivBtnDiv)
        if(totalScoreDiv) {
            totalScoreDiv.appendChild(addDiv)
        }
        //添加完了内容后，从第几题的数量往后累加
        selectedOptionsValue.value++
        startNumber.value = endNumber.value + 1;
        endNumber.value = startNumber.value
        //endNumber.value = startNumber.value;
        //计算这个题的总分
        const score = count * fractionNumber.value;
        choiceQuestionTop.textContent = `${selectedOptionsLabel.value}、${defaultOptionsLabel.value}（${score}分）`;
        totalScore.value = totalScore.value + score
        //console.log('总分：',totalScore.value)
    }
    //获取创建的选择题区块的坐标位置信息

    /*const choicePosition = getElementPosition(choiceQuestionDiv);
    //左上角相对坐标
    const upperLeftCorner = {x:choicePosition.x,y:choicePosition.y};
    //右上角
    const upperRightCorner = {x:choicePosition.x+choicePosition.w,y:choicePosition.y};
    //左下角
    const lowerLeftCorner = {x:choicePosition.x,y:choicePosition.y+choicePosition.h};
    //右下角
    const lowerRightCorner = {x:choicePosition.x+choicePosition.w,y:choicePosition.y+choicePosition.h};*/
    //console.log(upperLeftCorner,upperRightCorner,lowerLeftCorner,lowerRightCorner);
    const res = getPosition(choiceQuestionDiv)
    const num = itemNumber
    //return itemNumber;
    return {
        num,...res
    }
}
const getPosition = (dom)=>{
    const choicePosition = getElementPosition(dom);
    //左上角相对坐标
    const upperLeftCorner = {x:choicePosition.x,y:choicePosition.y};
    //右上角
    const upperRightCorner = {x:choicePosition.x+choicePosition.w,y:choicePosition.y};
    //左下角
    const lowerLeftCorner = {x:choicePosition.x,y:choicePosition.y+choicePosition.h};
    //右下角
    const lowerRightCorner = {x:choicePosition.x+choicePosition.w,y:choicePosition.y+choicePosition.h};
    //console.log(upperLeftCorner,upperRightCorner,lowerLeftCorner,lowerRightCorner);
    //const num = itemNumber

    //return itemNumber;
    return {
        upperLeftCorner,upperRightCorner,lowerLeftCorner,lowerRightCorner
    }
}

//填空题
export const addBlankFillingQuestionsFun = (blankFillingQuestionsDiv:any,blankFillingQuestionsTop:any,blankFillingQuestionsContent:any,paperHeight:any,questionsContent:any,startNumber:any,endNumber:any,itemNumber:any,selectedOptionsLabel:any,defaultOptionsLabel:any,selectedOptionsValue:any,fractionNumber:any,totalScore:any,spaceLength:any,spaceCount:any)=>{
    blankFillingQuestionsDiv = document.createElement('div')
    //blankFillingQuestionsDiv.style.marginTop = '24px';
    blankFillingQuestionsDiv.id = 'blankFillingQuestionsDiv';
    blankFillingQuestionsDiv.className = 'blankFillingQuestionsDiv';

    blankFillingQuestionsTop = document.createElement('div');
    //blankFillingQuestionsTop.textContent = defaultOptionsLabel.value+'(30分)'
    blankFillingQuestionsTop.style.lineHeight = '35px';
    //blankFillingQuestionsTop.style.textAlign = 'center';
    blankFillingQuestionsTop.style.width = '1030px';
    blankFillingQuestionsTop.style.height = '40px';
    //blankFillingQuestionsTop.style.background = '#E8E8E8';
    //blankFillingQuestionsTop.style.borderRadius = '0px 0px 0px 0px';
    //blankFillingQuestionsTop.style.border = '1px solid #E8E8E8';
    blankFillingQuestionsDiv.appendChild(blankFillingQuestionsTop);

    //题目在这个div里创建
    blankFillingQuestionsContent = document.createElement('div');
    blankFillingQuestionsContent.id = 'blankFillingQuestionsContent';
    blankFillingQuestionsContent.style.width = '1030px';
    //blankFillingQuestionsContent.style.background = '#F5F6F7';
    blankFillingQuestionsContent.style.borderRadius = '0px 0px 0px 0px';
    blankFillingQuestionsContent.style.border = '1px solid #000000';
    blankFillingQuestionsContent.style.paddingTop = '30px';
    blankFillingQuestionsContent.style.paddingBottom = '15px';
    blankFillingQuestionsDiv.appendChild(blankFillingQuestionsContent);

    questionsContent.appendChild(blankFillingQuestionsDiv)

    if(spaceLength.value == '1/5'){
        spaceCount.value = 5;
    }else if(spaceLength.value == '1/4'){
        spaceCount.value = 4;
    }else if(spaceLength.value == '1/3'){
        spaceCount.value = 3;
    }else if(spaceLength.value == '1/2'){
        spaceCount.value = 2;
    }else if(spaceLength.value == '1/1'){
        spaceCount.value = 1;
    }

    if(blankFillingQuestionsContent!=null){
        const count = endNumber.value - startNumber.value + 1
        //console.log('要创建span个数'+count,spaceCount.value)
        //每行添加后剩余的个数
        let countSy = count;
        let spanId = 1
        let itemId = 1
        if(countSy > spaceCount.value){
            //在这里根据选择的个数创建span，每次循环div时向div里append spaceCount.value 个span
            //定义个变量存放剩下未放进div里的span数量，当这个数量<0就直接放进去
            for (let i = 0; i < Math.floor(count / spaceCount.value); i++) {
                if(countSy < spaceCount.value){break}
                let blankFillingQuestionsItems = document.createElement('div');
                blankFillingQuestionsItems.style.display = 'flex';
                blankFillingQuestionsItems.style.marginLeft = '28px';
                blankFillingQuestionsItems.style.marginRight = '28px';
                //blankFillingQuestionsItems.style.width = '100%';
                blankFillingQuestionsItems.id = 'blankFillingQuestionItems'+itemId;
                blankFillingQuestionsItems.className = 'blankFillingQuestionItems';
                for(let j = 0; j < spaceCount.value; j++) {
                    let blankFillingQuestionsP = document.createElement('p');
                    blankFillingQuestionsP.style.display = 'flex';
                    blankFillingQuestionsP.style.alignItems = 'center';

                    let blankFillingQuestionsSpan1 = document.createElement('span');
                    blankFillingQuestionsSpan1.style.display = 'inline-block';
                    blankFillingQuestionsSpan1.textContent = itemNumber + '.';
                    let blankFillingQuestionsSpan2 = document.createElement('span');
                    blankFillingQuestionsSpan2.className = 'blankFillingQuestionsSpan';
                    blankFillingQuestionsSpan2.style.display = 'inline-block';
                    blankFillingQuestionsSpan2.style.width = '80%';
                    blankFillingQuestionsSpan2.style.height = '23px';
                    blankFillingQuestionsSpan2.style.border = 'none';
                    blankFillingQuestionsSpan2.style.borderBottom = '1px solid #000';
                    blankFillingQuestionsSpan2.style.marginLeft = '5px';
                    blankFillingQuestionsSpan2.style.color = '#000';
                    blankFillingQuestionsP.appendChild(blankFillingQuestionsSpan1)
                    blankFillingQuestionsP.appendChild(blankFillingQuestionsSpan2)
                    if(spaceCount.value == 5){
                        blankFillingQuestionsP.style.width = '20%';
                    }else if(spaceCount.value == 4){
                        blankFillingQuestionsP.style.width = '25%';
                    }else if(spaceCount.value == 3){
                        blankFillingQuestionsP.style.width = '33%';
                    }else if(spaceCount.value == 2){
                        blankFillingQuestionsP.style.width = '50%';
                    }else if(spaceCount.value == 1){
                        blankFillingQuestionsP.style.width = '100%';
                    }
                    blankFillingQuestionsItems.appendChild(blankFillingQuestionsP);
                    blankFillingQuestionsContent.appendChild(blankFillingQuestionsItems)
                    itemNumber++
                    spanId++
                }
                itemId++
                countSy = countSy - spaceCount.value;
            }
            if(countSy < spaceCount.value){
                let blankFillingQuestionsItems = document.createElement('div');
                blankFillingQuestionsItems.style.display = 'flex';
                blankFillingQuestionsItems.style.marginLeft = '28px';
                blankFillingQuestionsItems.style.marginRight = '28px';
                //blankFillingQuestionsItems.style.width = '100%';
                blankFillingQuestionsItems.id = 'blankFillingQuestionItems'+itemId;
                blankFillingQuestionsItems.className = 'blankFillingQuestionItems';
                for(let j = 0; j < countSy; j++) {
                    let blankFillingQuestionsP = document.createElement('p');
                    blankFillingQuestionsP.style.display = 'flex';
                    blankFillingQuestionsP.style.alignItems = 'center';
                    let blankFillingQuestionsSpan1 = document.createElement('span');
                    blankFillingQuestionsSpan1.style.display = 'inline-block';
                    blankFillingQuestionsSpan1.textContent = itemNumber + '.';
                    let blankFillingQuestionsSpan2 = document.createElement('span');
                    blankFillingQuestionsSpan2.className = 'blankFillingQuestionsSpan';
                    blankFillingQuestionsSpan2.style.display = 'inline-block';
                    //blankFillingQuestionsSpan.style.marginLeft = '5px';
                    blankFillingQuestionsSpan2.style.width = '80%';
                    blankFillingQuestionsSpan2.style.height = '23px';
                    blankFillingQuestionsSpan2.style.border = 'none';
                    blankFillingQuestionsSpan2.style.borderBottom = '1px solid #000';
                    //blankFillingQuestionsSpan.style.marginRight = '10px';
                    blankFillingQuestionsSpan2.style.marginLeft = '5px';
                    blankFillingQuestionsSpan2.style.color = '#000';
                    blankFillingQuestionsP.appendChild(blankFillingQuestionsSpan1)
                    blankFillingQuestionsP.appendChild(blankFillingQuestionsSpan2)
                    if(spaceCount.value == 5){
                        blankFillingQuestionsP.style.width = '20%';
                    }else if(spaceCount.value == 4){
                        blankFillingQuestionsP.style.width = '25%';
                    }else if(spaceCount.value == 3){
                        blankFillingQuestionsP.style.width = '33%';
                    }else if(spaceCount.value == 2){
                        blankFillingQuestionsP.style.width = '50%';
                    }else if(spaceCount.value == 1){
                        blankFillingQuestionsP.style.width = '100%';
                    }
                    blankFillingQuestionsItems.appendChild(blankFillingQuestionsP);
                    blankFillingQuestionsContent.appendChild(blankFillingQuestionsItems);
                    itemNumber++
                    spanId++
                }
            }
        }else{
            let blankFillingQuestionsItems = document.createElement('div');
            blankFillingQuestionsItems.style.display = 'flex';
            blankFillingQuestionsItems.style.marginLeft = '28px';
            blankFillingQuestionsItems.style.marginRight = '28px';
            blankFillingQuestionsItems.id = 'blankFillingQuestionItems'+itemId;
            blankFillingQuestionsItems.className = 'blankFillingQuestionItems';
            //每个div里创建span
            for(let j = 0; j < count; j++) {
                let blankFillingQuestionsP = document.createElement('p');
                blankFillingQuestionsP.style.display = 'flex';
                blankFillingQuestionsP.style.alignItems = 'center';
                let blankFillingQuestionsSpan1 = document.createElement('span');
                blankFillingQuestionsSpan1.style.display = 'inline-block';
                blankFillingQuestionsSpan1.textContent = itemNumber + '.';
                let blankFillingQuestionsSpan2 = document.createElement('span');
                blankFillingQuestionsSpan2.className = 'blankFillingQuestionsSpan';
                blankFillingQuestionsSpan2.style.display = 'inline-block';
                //blankFillingQuestionsSpan.style.marginLeft = '5px';
                blankFillingQuestionsSpan2.style.width = '80%';
                blankFillingQuestionsSpan2.style.height = '23px';
                blankFillingQuestionsSpan2.style.border = 'none';
                blankFillingQuestionsSpan2.style.borderBottom = '1px solid #000';
                //blankFillingQuestionsSpan.style.marginRight = '10px';
                blankFillingQuestionsSpan2.style.marginLeft = '5px';
                blankFillingQuestionsSpan2.style.color = '#000';
                blankFillingQuestionsP.appendChild(blankFillingQuestionsSpan1)
                blankFillingQuestionsP.appendChild(blankFillingQuestionsSpan2)
                if(spaceCount.value == 5){
                    blankFillingQuestionsP.style.width = '20%';
                }else if(spaceCount.value == 4){
                    blankFillingQuestionsP.style.width = '25%';
                }else if(spaceCount.value == 3){
                    blankFillingQuestionsP.style.width = '33%';
                }else if(spaceCount.value == 2){
                    blankFillingQuestionsP.style.width = '50%';
                }else if(spaceCount.value == 1){
                    blankFillingQuestionsP.style.width = '100%';
                }
                blankFillingQuestionsItems.appendChild(blankFillingQuestionsP);
                blankFillingQuestionsContent.appendChild(blankFillingQuestionsItems);
                itemNumber++
                spanId++
            }
        }

        //右侧设置答题卡里总分创建内容
        const totalScoreDiv = document.getElementById('totalScoreDiv')
        const addDiv = document.createElement('div');
        addDiv.id = 'blankFillingQuestionsTotalScoreDiv';
        addDiv.style.height = '25px';
        addDiv.style.marginLeft = '25px';
        addDiv.style.marginTop = '20px';
        const addDivSpan = document.createElement('span');
        //const beginIndex = startNumber.value;
        //const endIndex = endNumber.value;

        addDivSpan.style.width = '119px';
        addDivSpan.style.height = '22px';
        addDivSpan.style.fontFamily = 'Source Han Sans, Source Han Sans';
        addDivSpan.style.fontWeight = '400';
        addDivSpan.style.fontSize = '14px';
        addDivSpan.style.color = '#333333';
        addDivSpan.style.lineHeight = '22px';
        addDivSpan.style.textAlign = 'left';
        addDivSpan.style.fontStyle = 'normal';
        addDivSpan.style.textTransform = 'none';
        addDivSpan.textContent = `${selectedOptionsLabel.value}、${defaultOptionsLabel.value}（${startNumber.value}-${endNumber.value}）`;
        selectedOptionsValue.value++


        const addDivBtnDiv = document.createElement('div')
        //addDivBtnDiv.style.width = '100%';
        addDivBtnDiv.style.display = 'inline-block';
        addDivBtnDiv.style.float = 'right';

        const addEditBtn = document.createElement('button')
        addEditBtn.textContent = '编辑';
        addEditBtn.style.width = '50px';
        addEditBtn.style.height = '20px';
        addEditBtn.style.border = 'none';
        addEditBtn.style.fontSize = '14px';
        addEditBtn.style.cursor = 'pointer';
        addEditBtn.style.backgroundColor = '#fff';
        addEditBtn.style.color = '#0E5FC7';
        addDivBtnDiv.appendChild(addEditBtn)

        const addLine = document.createElement('span')
        addLine.textContent = '/';
        addLine.style.color = '#c0c4cc';
        //addLine.style.margin = '0 4px';
        addDivBtnDiv.appendChild(addLine)

        const addDelBtn = document.createElement('button');
        addDelBtn.addEventListener('click', function(){
            //删除元素
            delQuestionsFun('blankFillingQuestionsDiv');
            //删除右侧
            let element = document.getElementById('blankFillingQuestionsTotalScoreDiv');
            element.parentNode.removeChild(element);
            //重新计算分数
            totalScore.value = totalScore.value - score;
            //小题号
            itemNumber = itemNumber - count;
            startNumber.value = startNumber.value - count;
            endNumber.value = startNumber.value - count;

        })
        addDelBtn.textContent = '删除';
        addDelBtn.style.width = '50px';
        addDelBtn.style.height = '20px';
        addDelBtn.style.border = 'none';
        addDelBtn.style.fontSize = '14px';
        addDelBtn.style.cursor = 'pointer';
        addDelBtn.style.backgroundColor = '#fff';
        addDelBtn.style.color = '#0E5FC7';
        addDivBtnDiv.appendChild(addDelBtn)

        addDiv.appendChild(addDivSpan)
        addDiv.appendChild(addDivBtnDiv)
        totalScoreDiv.appendChild(addDiv)
        //添加完了内容后，从第几题的数量往后累加
        startNumber.value = endNumber.value + 1;
        endNumber.value = startNumber.value
        //endNumber.value = startNumber.value;
        //计算这个题的总分
        const score = count * fractionNumber.value;
        blankFillingQuestionsTop.textContent = `${selectedOptionsLabel.value}、${defaultOptionsLabel.value}（${score}分）`;
        totalScore.value = totalScore.value + score
        //console.log('总分：',totalScore.value)
    }
    //获取创建的填空题区块的坐标位置信息

    //return itemNumber;
    const res = getPosition(blankFillingQuestionsDiv)
    const num = itemNumber
    //return itemNumber;
    return {
        num,...res
    }
}
//非选择题
export const addNonChoiceQuestionsFun = (nonChoiceQuestionsDiv:any,nonChoiceQuestionsTop:any,nonChoiceQuestionsContent:any,pageDiv:any,paperHeight:any,questionsContent:any,startNumber:any,endNumber:any,itemNumber:any,selectedOptionsLabel:any,defaultOptionsLabel:any,selectedOptionsValue:any,fractionNumber:any,totalScore:any,cardFooter:any)=>{
    nonChoiceQuestionsDiv = document.createElement('div')
    //nonChoiceQuestionsDiv.style.marginTop = '24px';
    nonChoiceQuestionsDiv.id = 'nonChoiceQuestionsDiv';

    nonChoiceQuestionsTop = document.createElement('div')
    //nonChoiceQuestionsTop.textContent = defaultOptionsLabel.value+'(30分)'
    nonChoiceQuestionsTop.style.lineHeight = '35px'
    //nonChoiceQuestionsTop.style.textAlign = 'center'
    nonChoiceQuestionsTop.style.width='1030px'
    nonChoiceQuestionsTop.style.height='40px'
    //nonChoiceQuestionsTop.style.background='#E8E8E8'
    ////nonChoiceQuestionsTop.style.borderRadius='0px 0px 0px 0px'
    //nonChoiceQuestionsTop.style.border= '1px solid #E8E8E8'
    nonChoiceQuestionsDiv.appendChild(nonChoiceQuestionsTop)

    //题目在这个div里创建
    nonChoiceQuestionsContent = document.createElement('div')
    nonChoiceQuestionsContent.style.width = '1030px';
    //choiceQuestionContent.style.height='121px';
    //nonChoiceQuestionsContent.style.background = '#F5F6F7';
    nonChoiceQuestionsContent.style.borderRadius = '0px 0px 0px 0px';
    nonChoiceQuestionsContent.style.border = '1px solid #000000';
    nonChoiceQuestionsDiv.appendChild(nonChoiceQuestionsContent)

    questionsContent.appendChild(nonChoiceQuestionsDiv)

    if(nonChoiceQuestionsContent != null){
        const count = endNumber.value - startNumber.value + 1
        //console.log('创建的题目数量:'+count)

        //循环创建内容
        for (let i = 0; i < count; i++) {
            const nonChoiceQuestionsItems = document.createElement('div')
            if(i != count-1){
                nonChoiceQuestionsItems.style.borderBottom = '1px solid #000';
            }

            const nonChoiceQuestionsP = document.createElement('p')

            nonChoiceQuestionsItems.style.height = '320px';
            nonChoiceQuestionsItems.style.pageBreakInside = 'avoid';

            nonChoiceQuestionsP.style.marginLeft='28px'
            nonChoiceQuestionsP.textContent = itemNumber + '.'
            nonChoiceQuestionsItems.appendChild(nonChoiceQuestionsP)
            nonChoiceQuestionsContent.appendChild(nonChoiceQuestionsItems)
            itemNumber++


            //console.log("创建的非选择题的高度："+nonChoiceQuestionsDivHeight+"   paperHeight:"+paperHeight.value)
            //下次创建如果大于纸张高度的话另外创建一个新的纸张盒子去添加
            const nonChoiceQuestionsPosition = getElementPosition(nonChoiceQuestionsDiv);
            const tipBottomPosition = getElementPosition(document.getElementById('tipBottom'));
            const cardFooterPosition = getElementPosition(cardFooter);
            //page的信息
            const pagePosition = getElementPosition(pageDiv);
            const topHeight = nonChoiceQuestionsPosition.y-pagePosition.y
            //console.log('非选择题距离纸张顶部的距离：',topHeight);
            if(topHeight + nonChoiceQuestionsPosition.h + nonChoiceQuestionsItems.getBoundingClientRect().height+tipBottomPosition.h+cardFooterPosition.h > paperHeight.value){
                //console.log('有剩下的'+(count-1-i))
                createNewPage('nonChoiceQuestion',pageDiv,count-1-i,paperHeight.value,itemNumber,320)
                break;
                //再去创建新的纸张 存放剩下的小题

            }

        }
        //右侧设置答题卡里总分创建内容
        const totalScoreDiv = document.getElementById('totalScoreDiv')
        const addDiv = document.createElement('div');
        addDiv.id  = 'nonChoiceQuestionsTotalScoreDiv';
        addDiv.style.height = '25px';
        addDiv.style.marginLeft = '25px';
        addDiv.style.marginTop = '20px';
        const addDivSpan = document.createElement('span');
        const beginIndex = startNumber.value;
        const endIndex = endNumber.value;
        addDivSpan.style.width = '119px';
        addDivSpan.style.height = '22px';
        addDivSpan.style.fontFamily = 'Source Han Sans, Source Han Sans';
        addDivSpan.style.fontWeight = '400';
        addDivSpan.style.fontSize = '14px';
        addDivSpan.style.color = '#333333';
        addDivSpan.style.lineHeight = '22px';
        addDivSpan.style.textAlign = 'left';
        addDivSpan.style.fontStyle = 'normal';
        addDivSpan.style.textTransform = 'none';
        addDivSpan.textContent = `${selectedOptionsLabel.value}、${defaultOptionsLabel.value}（${beginIndex}-${endIndex}）`;
        selectedOptionsValue.value++


        const addDivBtnDiv = document.createElement('div')
        //addDivBtnDiv.style.width = '100%';
        addDivBtnDiv.style.display = 'inline-block';
        addDivBtnDiv.style.float = 'right';

        const addEditBtn = document.createElement('button')
        addEditBtn.textContent = '编辑';
        addEditBtn.style.width = '50px';
        addEditBtn.style.height = '20px';
        addEditBtn.style.border = 'none';
        addEditBtn.style.fontSize = '14px';
        addEditBtn.style.cursor = 'pointer';
        addEditBtn.style.backgroundColor = '#fff';
        addEditBtn.style.color = '#0E5FC7';
        addDivBtnDiv.appendChild(addEditBtn)

        const addLine = document.createElement('span')
        addLine.textContent = '/';
        addLine.style.color = '#c0c4cc';
        //addLine.style.margin = '0 4px';
        addDivBtnDiv.appendChild(addLine)

        const addDelBtn = document.createElement('button');
        addDelBtn.addEventListener('click', function(){
            //删除元素
            delQuestionsFun('nonChoiceQuestionsDiv');
            //删除右侧
            let element = document.getElementById('nonChoiceQuestionsTotalScoreDiv');
            element.parentNode.removeChild(element);
            //重新计算分数
            totalScore.value = totalScore.value - score;
            //小题号
            itemNumber = itemNumber - count;
            startNumber.value = startNumber.value - count;
            endNumber.value = startNumber.value - count;

        })
        addDelBtn.textContent = '删除';
        addDelBtn.style.width = '50px';
        addDelBtn.style.height = '20px';
        addDelBtn.style.border = 'none';
        addDelBtn.style.fontSize = '14px';
        addDelBtn.style.cursor = 'pointer';
        addDelBtn.style.backgroundColor = '#fff';
        addDelBtn.style.color = '#0E5FC7';
        addDivBtnDiv.appendChild(addDelBtn)

        addDiv.appendChild(addDivSpan)
        addDiv.appendChild(addDivBtnDiv)
        totalScoreDiv.appendChild(addDiv)
        //添加完了内容后，从第几题的数量往后累加
        startNumber.value = endNumber.value + 1;
        endNumber.value = startNumber.value
        //endNumber.value = startNumber.value;
        //计算这个题的总分
        const score = count * fractionNumber.value;
        nonChoiceQuestionsTop.textContent = `${selectedOptionsLabel.value}、${defaultOptionsLabel.value}（${score}分）`;
        totalScore.value = totalScore.value + score
        //console.log('总分：',totalScore.value)
    }
    //获取创建的非选择题区块的坐标位置信息


    //return itemNumber;
    const res = getPosition(nonChoiceQuestionsDiv)
    const num = itemNumber
    //return itemNumber;
    return {
        num,...res
    }
}
//有多余的题目的话创建一个新的page存放
//type:什么类型的题 pageDiv:新的页面,count:剩余题的数量,paperHeight:page的高度,itemNumber:小题的题号,itemHeight:小题的高度
const createNewPage = (type:any,pageDiv:any,count:any,paperHeight:any,itemNumber:any,itemHeight:any,mmkkl:any)=>{
    //console.log(paperHeight)
    const newPage = document.createElement('div')
    newPage.className = 'page';
    newPage.id = 'page';
    newPage.style.pageBreakAfter = 'always';
    newPage.style.marginBottom = '100px';
    //newPage.style.height = paperHeight+'px';
    newPage.style.marginBottom = '100px';
    newPage.style.paddingTop = '20px';
    //在这个content里循环添加剩下的小题
    const content = document.createElement('div')
    content.id = 'cardContent2';
    content.className = 'card-container';
    content.style.height = paperHeight+'px';
    content.style.position = 'relative';
    const questionsContent = document.createElement('div');
    questionsContent.className = 'card-content-sheet-content';
    questionsContent.style.width = '1030px';
    questionsContent.style.marginTop = '10px';
    questionsContent.style.marginLeft = '24px';


    //解答题
    if(type == 'problemSolvingQuestion'){
        const problemSolvingQuestionDiv = document.createElement('div');
        //nonChoiceQuestionsDiv.style.width = '1030px';
        //problemSolvingQuestionDiv.style.background = 'rgb(245, 246, 247)';
        //nonChoiceQuestionsDiv.style.borderRadius = '0px';
        problemSolvingQuestionDiv.style.border = '1px solid #000000';
        for (let i = 0; i < count; i++) {
            const problemSolvingQuestionItems = document.createElement('div');
            if(i != count-1){
                problemSolvingQuestionItems.style.borderBottom = '1px solid #000';
            }
            const problemSolvingQuestionP = document.createElement('p')

            problemSolvingQuestionItems.style.height = '500px'
            //problemSolvingQuestionItems.style.background = '#E8E8E8';

            problemSolvingQuestionP.style.marginLeft='28px'
            problemSolvingQuestionP.textContent = itemNumber + '.'
            problemSolvingQuestionItems.appendChild(problemSolvingQuestionP)
            problemSolvingQuestionDiv.appendChild(problemSolvingQuestionItems)
            questionsContent.appendChild(problemSolvingQuestionDiv);
            content.appendChild(questionsContent)
            newPage.appendChild(content)
            itemNumber++
        }
    }
    //创建省下非选择题并放进content
    if(type == 'nonChoiceQuestion'){
        const nonChoiceQuestionsDiv = document.createElement('div');
        //nonChoiceQuestionsDiv.style.width = '1030px';
        //nonChoiceQuestionsDiv.style.background = 'rgb(245, 246, 247)';
        //nonChoiceQuestionsDiv.style.borderRadius = '0px';
        nonChoiceQuestionsDiv.style.border = '1px solid #000000';
        for (let i = 0; i < count; i++) {
            const nonChoiceQuestionsItems = document.createElement('div')
            if(i != count-1){
                nonChoiceQuestionsItems.style.borderBottom = '1px solid #000';
            }

            const nonChoiceQuestionsP = document.createElement('p')

            nonChoiceQuestionsItems.style.height = itemHeight+'px';
            nonChoiceQuestionsItems.style.pageBreakInside = 'avoid';

            nonChoiceQuestionsP.style.marginLeft='28px'
            nonChoiceQuestionsP.textContent = itemNumber + '.'
            nonChoiceQuestionsItems.appendChild(nonChoiceQuestionsP)
            const nonChoiceQuestionsContent2 = document.createElement('div')
            nonChoiceQuestionsContent2.appendChild(nonChoiceQuestionsItems)
            //nonChoiceQuestionsContent2.style.width = '1030px';
            //nonChoiceQuestionsContent2.style.background = '#F5F6F7';
            nonChoiceQuestionsContent2.style.borderRadius = '0px 0px 0px 0px';
            nonChoiceQuestionsContent2.style.border = '1px solid #E8E8E8';

            nonChoiceQuestionsDiv.appendChild(nonChoiceQuestionsContent2);
            questionsContent.appendChild(nonChoiceQuestionsDiv);
            content.appendChild(questionsContent)
            newPage.appendChild(content)
            itemNumber++

        }
    }
    //英语作文
    if(type == 'EnglishComposition'){
        console.log('英语作文剩余部分开始添加')
        const EnglishCompositionArea = document.createElement('div')
        //EnglishCompositionArea.style.width = '1030px';
        //EnglishCompositionArea.style.background = 'rgb(245, 246, 247)';
        //EnglishCompositionArea.style.borderRadius = '0px';
        EnglishCompositionArea.style.border = '1px solid #000000';
        EnglishCompositionArea.style.paddingBottom = '20px';
        const compositionItems = document.createElement('div')
        console.log('要添加的：'+count)
        for (let i = 0; i < count; i++) {
            const line = document.createElement('p')
            line.className = 'English-composition-line';
            line.style.height = '50px';
            line.style.width = '95%';
            line.style.border = 'none';
            line.style.borderBottom = '1px solid #000';
            line.style.margin = '0 auto'

            compositionItems.appendChild(line)
            EnglishCompositionArea.appendChild(compositionItems)
            questionsContent.appendChild(EnglishCompositionArea);
            content.appendChild(questionsContent)
            newPage.appendChild(content)
        }
        itemNumber++
    }
    //作文
    if(type == 'composition'){
        console.log('还剩:'+count)
        const compositionArea = document.createElement('div');
        compositionArea.style.width = '1030px';
        compositionArea.style.background = 'rgb(245, 246, 247)';
        compositionArea.style.borderRadius = '0px';
        compositionArea.style.border = '1px solid #000000';
        const compositionItems = document.createElement('div');
        compositionItems.innerHTML = '';

        compositionItems.style.display = 'grid'
        compositionItems.style.gap = '0px'
        compositionItems.style.margin = '0 auto'
        compositionItems.style.width = 'fit-content'
        compositionItems.style.gridTemplateColumns = `repeat(22, 45px)`;

        for (let i = 0; i < count; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.style.marginBottom = '10px'
            //cell.style.width = '40px'
            cell.style.height = '45px'
            cell.style.border = '1px solid #a0aec0'
            cell.style.backgroundColor = 'white'
            cell.style.display = 'flex'
            cell.style.alignItems = 'center'
            cell.style.justifyContent = 'center'
            cell.style.position = 'relative'
            if(i == mmkkl){
                const wordCou = document.createElement('p');
                const wordSpan = document.createElement('span')
                wordCou.style.borderLeft = '5px solid transparent';
                wordCou.style.borderRight = '5px solid transparent';
                wordCou.style.borderBottom = '8px solid #000';
                wordCou.style.position = 'absolute'
                wordCou.style.top = '62%'
                wordCou.style.left = '50%'
                wordCou.style.transform = 'translateX(-50%)'

                wordSpan.style.position = 'absolute'
                wordSpan.style.top = '90%'
                wordSpan.style.left = '60%'
                wordSpan.style.fontSize = '10px';
                wordSpan.textContent = '800'
                cell.appendChild(wordCou)
                cell.appendChild(wordSpan)

            }

            compositionItems.appendChild(cell);
            compositionArea.appendChild(compositionItems)
            questionsContent.appendChild(compositionArea)
            content.appendChild(questionsContent)
            newPage.appendChild(content)
        }

    }

    addTipBottom(content)


    const cardFotter = document.createElement('div')
    cardFotter.className = 'card_footer';
    cardFotter.textContent = '第 2 页  共 2 页';
    cardFotter.style.textAlign = 'center';
    cardFotter.style.lineHeight = '24px';
    cardFotter.style.fontSize = '14px';
    newPage.appendChild(content);
    newPage.appendChild(cardFotter);
    pageDiv.parentNode.appendChild(newPage)

    return itemNumber
}
//作文
export const addCompositionFun = (compositionDiv:any,compositionTop:any,compositionContent:any,paperHeight:any,questionsContent:any,startNumber:any,endNumber:any,itemNumber:any,selectedOptionsLabel:any,defaultOptionsLabel:any,selectedOptionsValue:any,fractionNumber:any,totalScore:any,compositionWordCount:any,wordCountRadio:any,wordCount:any,pageDiv:any,cardFooter:any)=>{

    compositionDiv = document.createElement('div')
    //compositionDiv.style.marginTop = '24px';
    compositionDiv.id = 'compositionDiv';

    compositionTop = document.createElement('div')
    //compositionTop.textContent = defaultOptionsLabel.value+'(30分)'
    compositionTop.style.lineHeight = '35px'
    //compositionTop.style.textAlign = 'center'
    compositionTop.style.width = '1030px'
    compositionTop.style.height = '40px'
    //compositionTop.style.background = '#E8E8E8'
    //compositionTop.style.borderRadius = '0px 0px 0px 0px'
    //compositionTop.style.border = '1px solid #E8E8E8'
    compositionDiv.appendChild(compositionTop)

    //题目在这个div里创建
    compositionContent = document.createElement('div')
    compositionContent.style.width = '1030px';
    //compositionContent.style.height='121px';
    //compositionContent.style.background = '#F5F6F7';
    compositionContent.style.borderRadius = '0px 0px 0px 0px';
    compositionContent.style.border = '1px solid #000000';
    compositionDiv.appendChild(compositionContent)

    questionsContent.appendChild(compositionDiv)


    if(compositionContent != null){
        const compositionArea = document.createElement('div')
        const compositionTitleDiv = document.createElement('div')
        const compositionItems = document.createElement('div')
        const count = endNumber.value - startNumber.value + 1;
        //console.log(endNumber.value,startNumber.value)

        compositionTitleDiv.style.marginLeft = '15px'
        //compositionTitleDiv.style.marginTop = '17px'
        compositionTitleDiv.style.marginBottom = '17px'
        //compositionTitleDiv.textContent = itemNumber + '.'
        const xh = document.createElement('p')
        xh.textContent = itemNumber + '.'

        const compositionTitle = document.createElement('span')
        compositionTitle.textContent = '题目：'
        compositionTitle.style.display = 'inline-block';

        const compositionTitleLine = document.createElement('span')
        compositionTitleLine.className = 'compositionTitleLine';
        compositionTitleLine.style.display = 'inline-block';
        compositionTitleLine.style.width = '93%';
        compositionTitleLine.style.marginTop = '10px'
        compositionTitleLine.style.border = 'none'
        compositionTitleLine.style.borderBottom = '1px solid #000'
        compositionTitleDiv.appendChild(xh)
        compositionTitleDiv.appendChild(compositionTitle)
        compositionTitleDiv.appendChild(compositionTitleLine)


        compositionItems.innerHTML = '';

        compositionItems.style.display = 'grid'
        compositionItems.style.gap = '0px'
        compositionItems.style.margin = '0 auto'
        compositionItems.style.width = 'fit-content'
        compositionItems.style.gridTemplateColumns = `repeat(22, 45px)`;
        compositionArea.appendChild(compositionTitleDiv)

        const tipBottomPosition = getElementPosition(document.getElementById('tipBottom'));
        const cardFooterPosition = getElementPosition(cardFooter);

        let cellCount = (Math.floor(compositionWordCount.value / 22) + 5)*22;
        console.log(cellCount,compositionWordCount.value,wordCount.value)
        /*if(wordCountRadio.value == 1){
            console.log((Math.floor(compositionWordCount.value / 22) + 5)*22)
            cellCount =
        }else{
            cellCount = compositionWordCount.value
        }*/
        console.log('总格子数：'+cellCount)
        // 生成格子
        for (let i = 0; i < cellCount; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.style.marginBottom = '10px'
            //cell.style.width = '40px'
            cell.style.height = '45px'
            cell.style.border = '1px solid #a0aec0'
            cell.style.backgroundColor = 'white'
            cell.style.display = 'flex'
            cell.style.alignItems = 'center'
            cell.style.justifyContent = 'center'
            cell.style.position = 'relative'

            //1代表每wordCount个字生成一个下标符号
            if(wordCountRadio.value == 1){
                if((i+1) % wordCount.value == 0){
                    const wordCou = document.createElement('p');
                    const wordSpan = document.createElement('span')
                    wordCou.style.borderLeft = '5px solid transparent';
                    wordCou.style.borderRight = '5px solid transparent';
                    wordCou.style.borderBottom = '8px solid #000';
                    wordCou.style.position = 'absolute'
                    wordCou.style.top = '62%'
                    wordCou.style.left = '50%'
                    wordCou.style.transform = 'translateX(-50%)'

                    wordSpan.style.position = 'absolute'
                    wordSpan.style.top = '90%'
                    wordSpan.style.left = '60%'
                    wordSpan.style.fontSize = '10px'

                    if(i!=0){
                        wordSpan.textContent = i+1+''
                        cell.appendChild(wordCou)
                        cell.appendChild(wordSpan)
                    }

                }
            }else{
                console.log(cellCount - i)
                //2代表最少处生成一个
                if(i == compositionWordCount.value-1){
                    const wordCou = document.createElement('p');
                    const wordSpan = document.createElement('span')
                    wordCou.style.borderLeft = '5px solid transparent';
                    wordCou.style.borderRight = '5px solid transparent';
                    wordCou.style.borderBottom = '8px solid #000';
                    wordCou.style.position = 'absolute'
                    wordCou.style.top = '62%'
                    wordCou.style.left = '50%'
                    wordCou.style.transform = 'translateX(-50%)'

                    wordSpan.style.position = 'absolute'
                    wordSpan.style.top = '90%'
                    wordSpan.style.left = '60%'
                    wordSpan.style.fontSize = '10px'
                    wordSpan.textContent = compositionWordCount.value
                    cell.appendChild(wordCou)
                    cell.appendChild(wordSpan)
                }
            }
            compositionItems.appendChild(cell);
            compositionArea.appendChild(compositionItems)


            if(i% 22==0){
                const compositionPosition = getElementPosition(compositionDiv);
                //page的信息
                const pagePosition = getElementPosition(pageDiv);
                const topHeight = compositionPosition.y-pagePosition.y
                //console.log('作文距离纸张顶部的距离：',topHeight);
                //console.log(topHeight ,compositionPosition.h , cell.getBoundingClientRect().height,tipBottomPosition.h,cardFooterPosition.h )
                if( topHeight + compositionPosition.h + cell.getBoundingClientRect().height +tipBottomPosition.h+cardFooterPosition.h > paperHeight.value){
                    //判断如果盛不开了就把生成的这个cell删掉
                    cell.parentNode?.removeChild(cell);
                    console.log('生成了：'+(i))
                    createNewPage('composition',pageDiv,cellCount-i,paperHeight.value,itemNumber,50,compositionWordCount.value - i)
                    break;
                    //再去创建新的纸张 存放剩下的小题
                }
                compositionContent.appendChild(compositionArea)
            }

        }

        itemNumber++

        //右侧设置答题卡里总分创建内容
        const totalScoreDiv = document.getElementById('totalScoreDiv');
        const addDiv = document.createElement('div')
        addDiv.id = 'compositionTotalScoreDiv';
        addDiv.style.height = '25px';
        addDiv.style.marginLeft = '25px';
        addDiv.style.marginTop = '20px';
        const addDivSpan = document.createElement('span');
        //const beginIndex = startNumber.value;
        //const endIndex = beginIndex;

        addDivSpan.style.width = '119px';
        addDivSpan.style.height = '22px';
        addDivSpan.style.fontFamily = 'Source Han Sans, Source Han Sans';
        addDivSpan.style.fontWeight = '400';
        addDivSpan.style.fontSize = '14px';
        addDivSpan.style.color = '#333333';
        addDivSpan.style.lineHeight = '22px';
        addDivSpan.style.textAlign = 'left';
        addDivSpan.style.fontStyle = 'normal';
        addDivSpan.style.textTransform = 'none';
        addDivSpan.textContent = `${selectedOptionsLabel.value}、${defaultOptionsLabel.value}（${startNumber.value}-${endNumber.value}）`;
        selectedOptionsValue.value++


        const addDivBtnDiv = document.createElement('div')
        //addDivBtnDiv.style.width = '100%';
        addDivBtnDiv.style.display = 'inline-block';
        addDivBtnDiv.style.float = 'right';

        const addEditBtn = document.createElement('button')
        addEditBtn.textContent = '编辑';
        addEditBtn.style.width = '50px';
        addEditBtn.style.height = '20px';
        addEditBtn.style.border = 'none';
        addEditBtn.style.fontSize = '14px';
        addEditBtn.style.cursor = 'pointer';
        addEditBtn.style.backgroundColor = '#fff';
        addEditBtn.style.color = '#0E5FC7';
        addDivBtnDiv.appendChild(addEditBtn)

        const addLine = document.createElement('span')
        addLine.textContent = '/';
        addLine.style.color = '#c0c4cc';
        //addLine.style.margin = '0 4px';
        addDivBtnDiv.appendChild(addLine)

        const addDelBtn = document.createElement('button')
        addDelBtn.addEventListener('click', function(){
            //删除元素
            delQuestionsFun('compositionDiv');
            //删除右侧
            let element = document.getElementById('compositionTotalScoreDiv');
            element.parentNode.removeChild(element);
            //重新计算分数
            totalScore.value = totalScore.value - score;
            //小题号
            itemNumber = itemNumber - count;
            startNumber.value = startNumber.value - count;
            endNumber.value = startNumber.value - count;
        })
        addDelBtn.textContent = '删除';
        addDelBtn.style.width = '50px';
        addDelBtn.style.height = '20px';
        addDelBtn.style.border = 'none';
        addDelBtn.style.fontSize = '14px';
        addDelBtn.style.cursor = 'pointer';
        addDelBtn.style.backgroundColor = '#fff';
        addDelBtn.style.color = '#0E5FC7';

        addDivBtnDiv.appendChild(addDelBtn)

        addDiv.appendChild(addDivSpan)
        addDiv.appendChild(addDivBtnDiv)
        if(totalScoreDiv) {
            totalScoreDiv.appendChild(addDiv)
        }
        //添加完了内容后，从第几题的数量往后累加
        startNumber.value = endNumber.value + 1;
        endNumber.value = startNumber.value
        //endNumber.value = startNumber.value;
        //计算这个题的总分
        //console.log(endNumber.value, startNumber.value)
        const score = (endNumber.value - startNumber.value +1) * fractionNumber.value;
        compositionTop.textContent = `${selectedOptionsLabel.value}、${defaultOptionsLabel.value}（${score}分）`;
        totalScore.value = totalScore.value + score
        //console.log('总分：',totalScore.value)

    }
    //获取创建的作文区块的坐标位置信息

    //return itemNumber;
    const res = getPosition(compositionDiv)
    const num = itemNumber
    //return itemNumber;
    return {
        num,...res
    }
}
//添加页脚
export const addTipBottom = (content:any)=>{
    const contentTip = document.createElement('div');
    contentTip.className = 'container-tip';
    contentTip.className = 'tip-bottom';
    contentTip.id = 'tipBottom'
    contentTip.textContent = ' 请在各题目的答题区域作答，超出答题区域的答案无效 ';
    contentTip.style.bottom = '0';
    contentTip.style.position = 'absolute';
    contentTip.style.width = '100%';
    contentTip.style.textAlign = 'center';
    contentTip.style.lineHeight = '36px';

    content.appendChild(contentTip)
}
//英语作文
export const addEnglishPositionFun = (EnglishCompositionDiv:any,EnglishCompositionTop:any,EnglishCompositionContent:any,paperHeight:any,questionsContent:any,startNumber:any,endNumber:any,itemNumber:any,selectedOptionsLabel:any,defaultOptionsLabel:any,selectedOptionsValue:any,fractionNumber:any,totalScore:any,cardFooter:any,lineNumber:any,pageDiv:any)=>{
    EnglishCompositionDiv = document.createElement('div')
    //EnglishCompositionDiv.style.marginTop = '24px';
    EnglishCompositionDiv.id = 'compositionDiv';

    EnglishCompositionTop = document.createElement('div')
    //EnglishCompositionTop.textContent = defaultOptionsLabel.value+'(30分)'
    EnglishCompositionTop.style.lineHeight = '35px'
    //EnglishCompositionTop.style.textAlign = 'center'
    EnglishCompositionTop.style.width = '1030px'
    EnglishCompositionTop.style.height = '40px'
    //EnglishCompositionTop.style.background = '#E8E8E8'
    //EnglishCompositionTop.style.borderRadius = '0px 0px 0px 0px'
    //EnglishCompositionTop.style.border = '1px solid #E8E8E8'
    EnglishCompositionDiv.appendChild(EnglishCompositionTop)

    //题目在这个div里创建
    EnglishCompositionContent = document.createElement('div')
    EnglishCompositionContent.style.width = '1030px';
    //compositionContent.style.height='121px';
    //EnglishCompositionContent.style.background = '#F5F6F7';
    EnglishCompositionContent.style.borderRadius = '0px 0px 0px 0px';
    EnglishCompositionContent.style.border = '1px solid #000000';
    EnglishCompositionContent.style.paddingBottom = '30px';
    EnglishCompositionDiv.appendChild(EnglishCompositionContent)

    questionsContent.appendChild(EnglishCompositionDiv)
    if(EnglishCompositionContent != null){
        const EnglishCompositionArea = document.createElement('div')

        const xh = document.createElement('p')
        xh.style.marginLeft = '20px';
        xh.textContent = itemNumber + '.'

        const compositionItems = document.createElement('div')
        //compositionItems.style.justifyItems = 'center'
        const count = endNumber.value - startNumber.value + 1;
        //console.log(endNumber.value,startNumber.value)
        const tipBottomPosition = getElementPosition(document.getElementById('tipBottom'));
        const cardFooterPosition = getElementPosition(cardFooter);


        console.log('英语作文行数：'+lineNumber.value);
        for (let i = 0; i < lineNumber.value; i++) {
            const line = document.createElement('p')
            line.className = 'English-composition-line';
            line.style.height = '50px';
            line.style.width = '95%';
            line.style.border = 'none';
            line.style.borderBottom = '1px solid #000';
            line.style.margin = '0 auto'

            compositionItems.appendChild(line)
            EnglishCompositionArea.appendChild(xh)
            EnglishCompositionArea.appendChild(compositionItems)

            EnglishCompositionContent.appendChild(EnglishCompositionArea)


            //console.log("创建的非选择题的高度："+nonChoiceQuestionsDivHeight+"   paperHeight:"+paperHeight.value)
            //下次创建如果大于纸张高度的话另外创建一个新的纸张盒子去添加
            const EnglishCompositionPosition = getElementPosition(EnglishCompositionDiv);
            //page的信息
            const pagePosition = getElementPosition(pageDiv);
            const topHeight = EnglishCompositionPosition.y-pagePosition.y
            console.log('英语作文距离纸张顶部的距离：',topHeight);
            console.log(topHeight ,EnglishCompositionPosition.h , line.getBoundingClientRect().height,tipBottomPosition.h,cardFooterPosition.h )
            if( topHeight + EnglishCompositionPosition.h + line.getBoundingClientRect().height +tipBottomPosition.h+cardFooterPosition.h > paperHeight.value){
                console.log('有剩下的'+(lineNumber.value-1-i))
                createNewPage('EnglishComposition',pageDiv,lineNumber.value-1-i,paperHeight.value,itemNumber,50)
                break;
                //再去创建新的纸张 存放剩下的小题
            }
        }




        itemNumber++

        //右侧设置答题卡里总分创建内容
        const totalScoreDiv = document.getElementById('totalScoreDiv');
        const addDiv = document.createElement('div')
        addDiv.id = 'compositionTotalScoreDiv';
        addDiv.style.height = '25px';
        addDiv.style.marginLeft = '25px';
        addDiv.style.marginTop = '20px';
        const addDivSpan = document.createElement('span');
        //const beginIndex = startNumber.value;
        //const endIndex = beginIndex;

        addDivSpan.style.width = '119px';
        addDivSpan.style.height = '22px';
        addDivSpan.style.fontFamily = 'Source Han Sans, Source Han Sans';
        addDivSpan.style.fontWeight = '400';
        addDivSpan.style.fontSize = '14px';
        addDivSpan.style.color = '#333333';
        addDivSpan.style.lineHeight = '22px';
        addDivSpan.style.textAlign = 'left';
        addDivSpan.style.fontStyle = 'normal';
        addDivSpan.style.textTransform = 'none';
        addDivSpan.textContent = `${selectedOptionsLabel.value}、${defaultOptionsLabel.value}（${startNumber.value}-${endNumber.value}）`;
        selectedOptionsValue.value++


        const addDivBtnDiv = document.createElement('div')
        //addDivBtnDiv.style.width = '100%';
        addDivBtnDiv.style.display = 'inline-block';
        addDivBtnDiv.style.float = 'right';

        const addEditBtn = document.createElement('button')
        addEditBtn.textContent = '编辑';
        addEditBtn.style.width = '50px';
        addEditBtn.style.height = '20px';
        addEditBtn.style.border = 'none';
        addEditBtn.style.fontSize = '14px';
        addEditBtn.style.cursor = 'pointer';
        addEditBtn.style.backgroundColor = '#fff';
        addEditBtn.style.color = '#0E5FC7';
        addDivBtnDiv.appendChild(addEditBtn)

        const addLine = document.createElement('span')
        addLine.textContent = '/';
        addLine.style.color = '#c0c4cc';
        //addLine.style.margin = '0 4px';
        addDivBtnDiv.appendChild(addLine)

        const addDelBtn = document.createElement('button')
        addDelBtn.addEventListener('click', function(){
            //删除元素
            delQuestionsFun('compositionDiv');
            //删除右侧
            let element = document.getElementById('compositionTotalScoreDiv');
            element.parentNode.removeChild(element);
            //重新计算分数
            totalScore.value = totalScore.value - score;
            //小题号
            itemNumber = itemNumber - count;
            startNumber.value = startNumber.value - count;
            endNumber.value = startNumber.value - count;
        })
        addDelBtn.textContent = '删除';
        addDelBtn.style.width = '50px';
        addDelBtn.style.height = '20px';
        addDelBtn.style.border = 'none';
        addDelBtn.style.fontSize = '14px';
        addDelBtn.style.cursor = 'pointer';
        addDelBtn.style.backgroundColor = '#fff';
        addDelBtn.style.color = '#0E5FC7';

        addDivBtnDiv.appendChild(addDelBtn)

        addDiv.appendChild(addDivSpan)
        addDiv.appendChild(addDivBtnDiv)
        if(totalScoreDiv) {
            totalScoreDiv.appendChild(addDiv)
        }
        //添加完了内容后，从第几题的数量往后累加
        startNumber.value = endNumber.value + 1;
        endNumber.value = startNumber.value
        //endNumber.value = startNumber.value;
        //计算这个题的总分
        //console.log(endNumber.value, startNumber.value)
        const score = (endNumber.value - startNumber.value +1) * fractionNumber.value;
        EnglishCompositionTop.textContent = `${selectedOptionsLabel.value}、${defaultOptionsLabel.value}（${score}分）`;
        totalScore.value = totalScore.value + score
        //console.log('总分：',totalScore.value)

    }

    //return itemNumber;
    const res = getPosition(EnglishCompositionDiv)
    const num = itemNumber
    //return itemNumber;
    return {
        num,...res
    }
}
//混合题
export const addMixedQuestionsFun = (mixedQuestionsDiv:any,mixedQuestionsTop:any,mixedQuestionsContent:any,paperHeight:any,questionsContent:any,startNumber:any,endNumber:any,itemNumber:any,selectedOptionsLabel:any,defaultOptionsLabel:any,selectedOptionsValue:any,fractionNumber:any,totalScore:any,isMixChoiceQuestions:any,defaultOptionsValueMix:any,defaultOptionsLabelMix:any,optionsMixNumber:any,pageDiv:any,cardFooter:any)=>{
    mixedQuestionsDiv = document.createElement('div');
    //mixedQuestionsDiv.style.marginTop = '24px';
    mixedQuestionsDiv.id = 'mixedQuestionsDiv';

    mixedQuestionsTop = document.createElement('div');
    //mixedQuestionsTop.textContent = defaultOptionsLabel.value+'(30分)';
    mixedQuestionsTop.style.lineHeight = '35px';
    //mixedQuestionsTop.style.textAlign = 'center';
    mixedQuestionsTop.style.width = '1030px';
    mixedQuestionsTop.style.height = '40px';
    //mixedQuestionsTop.style.background = '#E8E8E8';
    //mixedQuestionsTop.style.borderRadius = '0px 0px 0px 0px';
    //mixedQuestionsTop.style.border = '1px solid #E8E8E8';
    mixedQuestionsDiv.appendChild(mixedQuestionsTop);

    //题目在这个div里创建
    mixedQuestionsContent = document.createElement('div');
    mixedQuestionsContent.style.width = '1030px';
    //choiceQuestionContent.style.height='121px';
    //mixedQuestionsContent.style.background = '#F5F6F7';
    mixedQuestionsContent.style.borderRadius = '0px 0px 0px 0px';
    mixedQuestionsContent.style.border = '1px solid #000000';
    mixedQuestionsDiv.appendChild(mixedQuestionsContent)

    questionsContent.appendChild(mixedQuestionsDiv)

    if(mixedQuestionsContent!=null){
        const count = endNumber.value - startNumber.value + 1;
        //计算这个题的总分
        const score = count * fractionNumber.value;
        if(!isMixChoiceQuestions.value){
            for (let i = 0; i < count; i++) {
                const mixedQuestionsItems = document.createElement('div')
                if(i != count-1){
                    mixedQuestionsItems.style.borderBottom = '1px solid #000';
                }
                const mixedQuestionsP = document.createElement('p');
                mixedQuestionsP.className = 'objective-questions';

                mixedQuestionsItems.style.height = '320px';

                mixedQuestionsP.style.marginLeft = '28px';
                mixedQuestionsP.textContent = itemNumber + '.';
                mixedQuestionsItems.appendChild(mixedQuestionsP);
                mixedQuestionsTop.textContent = `${selectedOptionsLabel.value}、${defaultOptionsLabel.value}（${score}分）`;
                mixedQuestionsContent.appendChild(mixedQuestionsItems);
                itemNumber++;

                const mixedQuestionsPosition = getElementPosition(mixedQuestionsDiv);
                const tipBottomPosition = getElementPosition(document.getElementById('tipBottom'));
                const cardFooterPosition = getElementPosition(cardFooter);
                //page的信息
                const pagePosition = getElementPosition(pageDiv);
                const topHeight = mixedQuestionsPosition.y-pagePosition.y
                //console.log('非选择题距离纸张顶部的距离：',topHeight);
                if(topHeight + mixedQuestionsPosition.h + mixedQuestionsItems.getBoundingClientRect().height+tipBottomPosition.h+cardFooterPosition.h > paperHeight.value){
                    //console.log('有剩下的'+(count-1-i))
                    createNewPage('nonChoiceQuestion',pageDiv,count-1-i,paperHeight.value,itemNumber,320)
                    break;
                    //再去创建新的纸张 存放剩下的小题

                }
            }
        }else {
            for (let i = 0; i < count; i++) {
                const mixChoiceQuestionsItems = document.createElement('p')
                mixChoiceQuestionsItems.style.marginLeft = '28px'

                if (defaultOptionsValueMix.value === 'singleChoiceQuestion' || defaultOptionsValueMix.value === 'multipleChoiceQuestions' || defaultOptionsValueMix.value === 'multipleChoiceQuestionsOneOrMore') {
                    //在这里根据optionsNumberMax动态的生成对应个数的选项
                    for (let j = 65; j < 65 + optionsMixNumber.value; j++) {
                        //console.log(String.fromCharCode(j)+j)
                        mixChoiceQuestionsItems.textContent = mixChoiceQuestionsItems.textContent + '【' + String.fromCharCode(j) + '】'
                    }
                    if(defaultOptionsValueMix.value === 'singleChoiceQuestion'){
                        mixChoiceQuestionsItems.className = 'objective-question singleChoiceQuestion';
                    }
                    if(defaultOptionsValueMix.value === 'multipleChoiceQuestions'){
                        mixChoiceQuestionsItems.className = 'objective-question multipleChoiceQuestions';
                    }
                    if(defaultOptionsValueMix.value === 'multipleChoiceQuestionsOneOrMore'){
                        mixChoiceQuestionsItems.className = 'objective-question multipleChoiceOneOrMore';
                    }
                    //mixChoiceQuestionsItems.textContent = itemNumber + '【A】【B】【C】【D】'
                    mixChoiceQuestionsItems.textContent = itemNumber + mixChoiceQuestionsItems.textContent
                } else if (defaultOptionsValueMix.value === 'TorFQuestions') {
                    mixChoiceQuestionsItems.textContent = itemNumber + '【T】【F】'
                    mixChoiceQuestionsItems.className = 'objective-question TorFQuestions';
                } else if (defaultOptionsValueMix.value === 'chunkingQuestions') {
                    //断句题最多20
                    for (let j = 65; j < 65 + optionsMixNumber.value; j++) {
                        //console.log(String.fromCharCode(j)+j)
                        mixChoiceQuestionsItems.textContent = mixChoiceQuestionsItems.textContent + '【' + String.fromCharCode(j) + '】'
                    }
                    mixChoiceQuestionsItems.className = 'objective-question chunkingQuestions';
                    //mixChoiceQuestionsItems.textContent = itemNumber + '【A】【B】【C】【D】'
                    mixChoiceQuestionsItems.textContent = itemNumber + mixChoiceQuestionsItems.textContent
                    //mixChoiceQuestionsItems.textContent = itemNumber + '【A】【B】【C】【D】【E】【F】【G】【H】'
                }
                mixedQuestionsContent.appendChild(mixChoiceQuestionsItems)
                mixedQuestionsTop.textContent = `${selectedOptionsLabel.value}、${defaultOptionsLabelMix.value}（${score}分）`;
                itemNumber++
            }
        }
        //右侧设置答题卡里总分创建内容
        const totalScoreDiv = document.getElementById('totalScoreDiv')
        const addDiv = document.createElement('div')
        addDiv.id = 'mixedQuestionsTotalScoreDiv';
        addDiv.style.height = '25px';
        addDiv.style.marginLeft = '25px';
        addDiv.style.marginTop = '20px';
        const addDivSpan = document.createElement('span');
        const beginIndex = startNumber.value;
        const endIndex = endNumber.value;

        addDivSpan.style.width = '119px';
        addDivSpan.style.height = '22px';
        addDivSpan.style.fontFamily = 'Source Han Sans, Source Han Sans';
        addDivSpan.style.fontWeight = '400';
        addDivSpan.style.fontSize = '14px';
        addDivSpan.style.color = '#333333';
        addDivSpan.style.lineHeight = '22px';
        addDivSpan.style.textAlign = 'left';
        addDivSpan.style.fontStyle = 'normal';
        addDivSpan.style.textTransform = 'none';
        addDivSpan.textContent = `${selectedOptionsLabel.value}、${defaultOptionsLabel.value}（${beginIndex}-${endIndex}）`;
        selectedOptionsValue.value++


        const addDivBtnDiv = document.createElement('div')
        //addDivBtnDiv.style.width = '100%';
        addDivBtnDiv.style.display = 'inline-block';
        addDivBtnDiv.style.float = 'right';

        const addEditBtn = document.createElement('button')
        addEditBtn.textContent = '编辑';
        addEditBtn.style.width = '50px';
        addEditBtn.style.height = '20px';
        addEditBtn.style.border = 'none';
        addEditBtn.style.fontSize = '14px';
        addEditBtn.style.cursor = 'pointer';
        addEditBtn.style.backgroundColor = '#fff';
        addEditBtn.style.color = '#0E5FC7';
        addDivBtnDiv.appendChild(addEditBtn)

        const addLine = document.createElement('span')
        addLine.textContent = '/';
        addLine.style.color = '#c0c4cc';
        //addLine.style.margin = '0 4px';
        addDivBtnDiv.appendChild(addLine)

        const addDelBtn = document.createElement('button')
        addDelBtn.addEventListener('click', function(){
            //删除元素
            delQuestionsFun('mixedQuestionsDiv');
            //删除右侧
            let element = document.getElementById('mixedQuestionsTotalScoreDiv');
            element.parentNode.removeChild(element);
            //重新计算分数
            totalScore.value = totalScore.value - score;
            //小题号
            itemNumber = itemNumber - count;
            startNumber.value = startNumber.value - count;
            endNumber.value = startNumber.value - count;
        })
        addDelBtn.textContent = '删除';
        addDelBtn.style.width = '50px';
        addDelBtn.style.height = '20px';
        addDelBtn.style.border = 'none';
        addDelBtn.style.fontSize = '14px';
        addDelBtn.style.cursor = 'pointer';
        addDelBtn.style.backgroundColor = '#fff';
        addDelBtn.style.color = '#0E5FC7';
        addDivBtnDiv.appendChild(addDelBtn)

        addDiv.appendChild(addDivSpan)
        addDiv.appendChild(addDivBtnDiv)
        totalScoreDiv.appendChild(addDiv)
        //添加完了内容后，从第几题的数量往后累加
        startNumber.value = endNumber.value + 1;
        endNumber.value = startNumber.value
        //endNumber.value = startNumber.value;

        totalScore.value = totalScore.value + score
        //console.log('总分：', totalScore.value)
    }
    //获取创建的混合题区块的坐标位置信息

    //return itemNumber;
    const res = getPosition(mixedQuestionsDiv)
    const num = itemNumber
    //return itemNumber;
    return {
        num,...res
    }
}
//解答题
export const addProblemSolvingQuestionFun = (problemSolvingQuestionDiv:any,problemSolvingQuestionTop:any,problemSolvingQuestionContent:any,paperHeight:any,questionsContent:any,startNumber:any,endNumber:any,itemNumber:any,selectedOptionsLabel:any,defaultOptionsLabel:any,selectedOptionsValue:any,fractionNumber:any,totalScore:any,pageDiv:any,cardFooter:any)=>{

    problemSolvingQuestionDiv = document.createElement('div')
    //problemSolvingQuestionDiv.style.marginTop = '24px';
    problemSolvingQuestionDiv.id = 'problemSolvingQuestionDiv';

    problemSolvingQuestionTop = document.createElement('div')
    //problemSolvingQuestionTop.textContent = defaultOptionsLabel.value+'(30分)'
    problemSolvingQuestionTop.style.lineHeight = '35px'
    //problemSolvingQuestionTop.style.textAlign = 'center'
    problemSolvingQuestionTop.style.width='1030px'
    problemSolvingQuestionTop.style.height='40px'
    //problemSolvingQuestionTop.style.background='#E8E8E8'
    //problemSolvingQuestionTop.style.borderRadius='0px 0px 0px 0px'
    //problemSolvingQuestionTop.style.border= '1px solid #E8E8E8'
    problemSolvingQuestionDiv.appendChild(problemSolvingQuestionTop)

    //题目在这个div里创建
    problemSolvingQuestionContent = document.createElement('div')
    problemSolvingQuestionContent.style.width='1030px';
    //choiceQuestionContent.style.height='121px';
    //problemSolvingQuestionContent.style.background='#F5F6F7';
    problemSolvingQuestionContent.style.borderRadius='0px 0px 0px 0px';
    problemSolvingQuestionContent.style.border='1px solid #000000';
    problemSolvingQuestionDiv.appendChild(problemSolvingQuestionContent)

    questionsContent.appendChild(problemSolvingQuestionDiv)

    if(problemSolvingQuestionContent != null){
        const count = endNumber.value - startNumber.value + 1

        for(let i = 0; i < count; i++){
            const problemSolvingQuestionItems = document.createElement('div');
            if(i != count-1){
                problemSolvingQuestionItems.style.borderBottom = '1px solid #000';
            }
            const problemSolvingQuestionP = document.createElement('p')

            problemSolvingQuestionItems.style.height = '500px'

            problemSolvingQuestionP.style.marginLeft='28px'
            problemSolvingQuestionP.textContent = itemNumber + '.'
            problemSolvingQuestionItems.appendChild(problemSolvingQuestionP)
            problemSolvingQuestionContent.appendChild(problemSolvingQuestionItems)
            itemNumber++

            const problemSolvingQuestionPosition = getElementPosition(problemSolvingQuestionDiv);
            const tipBottomPosition = getElementPosition(document.getElementById('tipBottom'));
            const cardFooterPosition = getElementPosition(cardFooter);
            //page的信息
            const pagePosition = getElementPosition(pageDiv);
            const topHeight = problemSolvingQuestionPosition.y-pagePosition.y
            //console.log('非选择题距离纸张顶部的距离：',topHeight);
            if(topHeight + problemSolvingQuestionPosition.h + problemSolvingQuestionItems.getBoundingClientRect().height+tipBottomPosition.h+cardFooterPosition.h > paperHeight.value){
                //console.log('有剩下的'+(count-1-i))
                createNewPage('problemSolvingQuestion',pageDiv,count-1-i,paperHeight.value,itemNumber,320)
                break;
                //再去创建新的纸张 存放剩下的小题

            }

        }
        //右侧设置答题卡里总分创建内容
        const totalScoreDiv = document.getElementById('totalScoreDiv')
        const addDiv = document.createElement('div')
        addDiv.id = 'problemSolvingQuestionTotalScoreDiv';
        addDiv.style.height = '25px';
        addDiv.style.marginLeft = '25px';
        addDiv.style.marginTop = '20px';
        const addDivSpan = document.createElement('span');
        const beginIndex = startNumber.value;
        const endIndex = endNumber.value;

        addDivSpan.style.width = '119px';
        addDivSpan.style.height = '22px';
        addDivSpan.style.fontFamily = 'Source Han Sans, Source Han Sans';
        addDivSpan.style.fontWeight = '400';
        addDivSpan.style.fontSize = '14px';
        addDivSpan.style.color = '#333333';
        addDivSpan.style.lineHeight = '22px';
        addDivSpan.style.textAlign = 'left';
        addDivSpan.style.fontStyle = 'normal';
        addDivSpan.style.textTransform = 'none';
        addDivSpan.textContent = `${selectedOptionsLabel.value}、${defaultOptionsLabel.value}（${beginIndex}-${endIndex}）`;
        selectedOptionsValue.value++


        const addDivBtnDiv = document.createElement('div')
        //addDivBtnDiv.style.width = '100%';
        addDivBtnDiv.style.display = 'inline-block';
        addDivBtnDiv.style.float = 'right';

        const addEditBtn = document.createElement('button')
        addEditBtn.textContent = '编辑';
        addEditBtn.style.width = '50px';
        addEditBtn.style.height = '20px';
        addEditBtn.style.border = 'none';
        addEditBtn.style.fontSize = '14px';
        addEditBtn.style.cursor = 'pointer';
        addEditBtn.style.backgroundColor = '#fff';
        addEditBtn.style.color = '#0E5FC7';
        addDivBtnDiv.appendChild(addEditBtn)

        const addLine = document.createElement('span')
        addLine.textContent = '/';
        addLine.style.color = '#c0c4cc';
        //addLine.style.margin = '0 4px';
        addDivBtnDiv.appendChild(addLine)

        const addDelBtn = document.createElement('button');
        addDelBtn.addEventListener('click', function(){
            //删除元素
            delQuestionsFun('problemSolvingQuestionDiv');
            //删除右侧
            let element = document.getElementById('problemSolvingQuestionTotalScoreDiv');
            element.parentNode.removeChild(element);
            //重新计算分数
            totalScore.value = totalScore.value - score;
            //小题号
            itemNumber = itemNumber - count;
            startNumber.value = startNumber.value - count;
            endNumber.value = startNumber.value - count;
        })
        addDelBtn.textContent = '删除';
        addDelBtn.style.width = '50px';
        addDelBtn.style.height = '20px';
        addDelBtn.style.border = 'none';
        addDelBtn.style.fontSize = '14px';
        addDelBtn.style.cursor = 'pointer';
        addDelBtn.style.backgroundColor = '#fff';
        addDelBtn.style.color = '#0E5FC7';
        addDivBtnDiv.appendChild(addDelBtn)

        addDiv.appendChild(addDivSpan)
        addDiv.appendChild(addDivBtnDiv)
        totalScoreDiv.appendChild(addDiv)
        //添加完了内容后，从第几题的数量往后累加
        startNumber.value = endNumber.value + 1;
        endNumber.value = startNumber.value
        //endNumber.value = startNumber.value;
        //计算这个题的总分
        const score = count * fractionNumber.value;
        problemSolvingQuestionTop.textContent = `${selectedOptionsLabel.value}、${defaultOptionsLabel.value}（${score}分）`;
        totalScore.value = totalScore.value + score
        //console.log('总分：',totalScore.value)
    }
    //获取创建的解答题区块的坐标位置信息

    //return itemNumber;
    const res = getPosition(problemSolvingQuestionDiv)
    const num = itemNumber
    //return itemNumber;
    return {
        num,...res
    }
}
//选做题
export const addOptionalExerciseFun = (optionalExerciseDiv:any,optionalExerciseTop:any,optionalExerciseContent:any,paperHeight:any,questionsContent:any,startNumber:any,endNumber:any,itemNumber:any,selectedOptionsLabel:any,defaultOptionsLabel:any,selectedOptionsValue:any,fractionNumber:any,totalScore:any)=>{
    optionalExerciseDiv = document.createElement('div')
    //optionalExerciseDiv.style.marginTop = '24px';
    optionalExerciseDiv.id = 'optionalExerciseDiv';

    optionalExerciseTop = document.createElement('div')
    //nonChoiceQuestionsTop.textContent = defaultOptionsLabel.value+'(30分)'
    optionalExerciseTop.style.lineHeight = '35px'
    //optionalExerciseTop.style.textAlign = 'center'
    optionalExerciseTop.style.width='1030px'
    optionalExerciseTop.style.height='40px'
    //optionalExerciseTop.style.background='#E8E8E8'
    //optionalExerciseTop.style.borderRadius='0px 0px 0px 0px'
    //optionalExerciseTop.style.border= '1px solid #E8E8E8'
    optionalExerciseDiv.appendChild(optionalExerciseTop)

    //题目在这个div里创建
    optionalExerciseContent = document.createElement('div')
    optionalExerciseContent.style.width = '1030px';
    optionalExerciseContent.style.height = '500px';
    //optionalExerciseContent.style.background = '#F5F6F7';
    optionalExerciseContent.style.borderRadius = '0px 0px 0px 0px';
    optionalExerciseContent.style.border = '1px solid #000000';
    optionalExerciseDiv.appendChild(optionalExerciseContent)

    questionsContent.appendChild(optionalExerciseDiv)

    if(optionalExerciseContent != null){
        const count = endNumber.value - startNumber.value + 1
        //console.log('创建的题目数量:'+count)

        const optionalExerciseP1 = document.createElement('p');
        //optionalExerciseP1.style.paddingTop = '10px';
        optionalExerciseP1.style.paddingLeft = '20px';
        optionalExerciseP1.style.paddingRight = '20px';
        const optionalExerciseP2 = document.createElement('p');
        optionalExerciseP2.style.paddingLeft = '20px'
        optionalExerciseP2.textContent = `我选的题号`
        let nums = '';
        let myChoice = ''
        //console.log("创建选做题，从"+startNumber.value,endNumber.value)
        //循环创建内容
        for (let i = startNumber.value; i < endNumber.value+1; i++) {
            nums = nums + i;

            if(i != endNumber.value) {
                nums = nums + '、';
            }
            const optionalExerciseSpan = document.createElement('span');
            optionalExerciseSpan.style.marginLeft = '20px';
            optionalExerciseSpan.textContent = i + ' 【  】';
            optionalExerciseP2.appendChild(optionalExerciseSpan);


            //optionalExerciseSpan.style.marginLeft='28px'
            //optionalExerciseP2.textContent = itemNumber + '【 】';
            optionalExerciseContent.appendChild(optionalExerciseP1)
            optionalExerciseContent.appendChild(optionalExerciseP2)
            itemNumber++

        }
        optionalExerciseP1.textContent = `请考生在第${nums}大题中任选一题作答，注意：作答时必须用2B铅笔在答题卡上把所选大题号涂黑。如果多涂，则按所做第一题计分。`
        //optionalExerciseP2.textContent = `我选的题号   ${myChoice}`

        //console.log(nums)

        //右侧设置答题卡里总分创建内容
        const totalScoreDiv = document.getElementById('totalScoreDiv')
        const addDiv = document.createElement('div')
        addDiv.id = 'optionalExerciseTotalScoreDiv';
        addDiv.style.height = '25px';
        addDiv.style.marginLeft = '25px';
        addDiv.style.marginTop = '20px';
        const addDivSpan = document.createElement('span');
        const beginIndex = startNumber.value;
        const endIndex = endNumber.value;

        addDivSpan.style.width = '119px';
        addDivSpan.style.height = '22px';
        addDivSpan.style.fontFamily = 'Source Han Sans, Source Han Sans';
        addDivSpan.style.fontWeight = '400';
        addDivSpan.style.fontSize = '14px';
        addDivSpan.style.color = '#333333';
        addDivSpan.style.lineHeight = '22px';
        addDivSpan.style.textAlign = 'left';
        addDivSpan.style.fontStyle = 'normal';
        addDivSpan.style.textTransform = 'none';
        addDivSpan.textContent = `${selectedOptionsLabel.value}、${defaultOptionsLabel.value}（${beginIndex}-${endIndex}）`;
        selectedOptionsValue.value++


        const addDivBtnDiv = document.createElement('div')
        //addDivBtnDiv.style.width = '100%';
        addDivBtnDiv.style.display = 'inline-block';
        addDivBtnDiv.style.float = 'right';

        const addEditBtn = document.createElement('button')
        addEditBtn.textContent = '编辑';
        addEditBtn.style.width = '50px';
        addEditBtn.style.height = '20px';
        addEditBtn.style.border = 'none';
        addEditBtn.style.fontSize = '14px';
        addEditBtn.style.cursor = 'pointer';
        addEditBtn.style.backgroundColor = '#fff';
        addEditBtn.style.color = '#0E5FC7';
        addDivBtnDiv.appendChild(addEditBtn)

        const addLine = document.createElement('span')
        addLine.textContent = '/';
        addLine.style.color = '#c0c4cc';
        //addLine.style.margin = '0 4px';
        addDivBtnDiv.appendChild(addLine)

        const addDelBtn = document.createElement('button');
        addDelBtn.addEventListener('click', function(){
            //删除元素
            delQuestionsFun('optionalExerciseDiv');
            //删除右侧
            let element = document.getElementById('optionalExerciseTotalScoreDiv');
            element.parentNode.removeChild(element);
            //重新计算分数
            totalScore.value = totalScore.value - score;
            //小题号
            itemNumber = itemNumber - count;
            startNumber.value = startNumber.value - count;
            endNumber.value = startNumber.value - count;
        })
        addDelBtn.textContent = '删除';
        addDelBtn.style.width = '50px';
        addDelBtn.style.height = '20px';
        addDelBtn.style.border = 'none';
        addDelBtn.style.fontSize = '14px';
        addDelBtn.style.cursor = 'pointer';
        addDelBtn.style.backgroundColor = '#fff';
        addDelBtn.style.color = '#0E5FC7';
        addDivBtnDiv.appendChild(addDelBtn)

        addDiv.appendChild(addDivSpan)
        addDiv.appendChild(addDivBtnDiv)
        totalScoreDiv.appendChild(addDiv)
        //添加完了内容后，从第几题的数量往后累加
        startNumber.value = endNumber.value + 1;
        endNumber.value = startNumber.value
        //endNumber.value = startNumber.value;
        //计算这个题的总分 选做题选一个
        const score = 1 * fractionNumber.value;
        optionalExerciseTop.textContent = `${selectedOptionsLabel.value}、${defaultOptionsLabel.value}（${score}分）`;
        totalScore.value = totalScore.value + score
        //console.log('总分：',totalScore.value)
    }
    //获取创建的区块的坐标位置信息

    //return itemNumber;
    const res = getPosition(optionalExerciseDiv)
    const num = itemNumber
    //return itemNumber;
    return {
        num,...res
    }
}

//删除
const delQuestionsFun = (divId:string)=>{
    //console.log('删除：'+divId)
    const element = document.getElementById(divId);
    element.parentNode.removeChild(element);
}

//获取元素位置 dom:要获取位置的元素
export const getElementPosition = (dom)=>{
    //左侧答题卡的位置信息
    const pageRect = document.getElementById('card-content-sheet').getBoundingClientRect();
    //console.log(pageRect)
    //获取dom的高度
    const position = dom.getBoundingClientRect()
    console.log(position)

    return {
        x: position.left - pageRect.left,
        y: position.top - pageRect.top,
        w: position.width,
        h: position.height,
    }
}