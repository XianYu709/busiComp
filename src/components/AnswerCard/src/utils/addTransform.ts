export const calcTotalScore = (item: any) => {
  const label = item.fixedData.label;
  const questions = item.groups.map(g => g.questionList).flat();

  switch (label) {
    case "选择题":
      return questions.reduce((sum, q) => {
        return sum + (Number(q.score) || 0);
      }, 0);

    case "填空题":
      return questions.reduce((sum, q) => {
        if (Array.isArray(q.block)) {
          return sum + q.block.reduce((s, b) => s + (Number(b.score) || 0), 0);
        }
        return sum;
      }, 0);

    case "简答题":
      return questions.reduce((sum, q) => {
        if (Array.isArray(q.block)) {
          return sum + q.block.reduce((s, b) => s + (Number(b.score) || 0), 0);
        }
        return sum;
      }, 0);

    default:
      return 0;
  }
};

export const transform = (item: any, id: string, nextPage: number) => {
  let res = {};
  const totalScore = calcTotalScore(item);
  switch (item.fixedData.label) {
    case "选择题":
      res = {
        id,
        type: "ChoiceQuestion",
        model: {
          title: item.bigQuestionNumber + "、" + item.questionName,
          bigQuestionNumber: item.bigQuestionNumber,
          questionName: item.questionName,
          group: 5,
          props: {
            totalScore,
          },
          childs: item.groups
            .map(group => group.questionList)
            .flat()
            .map(it => {
              return {
                questionTypeId: it.questionTypeId,
                questionTypeLabel: it.questionTypeName,
                answerType: it.answerType,
                prefix: it.prefix,
                contentType: it.contentType,
                length: it.optionLength,
                score: it.score,
                contentList: it.optionList,
                scoreRule: it.scoreRule,
                answerKey: it.answer,
              };
            }),
        },
        pageOf: nextPage,
        rawOptions: { ...item, id },
        info: [],
      };
      break;
    case "填空题":
      res = {
        id,
        type: "FillBlankQuestion",
        model: {
          data: "",
          title: item.bigQuestionNumber + "、" + item.questionName,
          childs: item.groups.map(group => group.questionList).flat(),
          scoreBoxList: [],
        },
        props: {
          bigQuestionNumber: item.bigQuestionNumber,
          questionName: item.questionName,
          totalScore,
        },
        pageOf: nextPage,
        rawOptions: { ...item, id },
        info: [],
      };
      break;
    case "简答题":
      res = {
        id,
        type: "BriefQuestion",
        model: {
          data: [],
          title: item.bigQuestionNumber + "、" + item.questionName,
          childs: item.groups.map(group => group.questionList).flat(),
        },
        props: {
          totalScore,
        },
        pageOf: nextPage,
        rawOptions: { ...item, id },
        info: [],
      };
      break;
    case "作文":
      res = {
        id,
        type: "ArticleQuestion",
        model: {
          title: item.bigQuestionNumber + "、" + item.questionName,
          bigQuestionNumber: item.bigQuestionNumber,
          questionName: item.questionName,
          articleSetting: item.articleSetting,
        },
        props: {
          totalScore,
        },
        pageOf: nextPage,
        rawOptions: { ...item, id },
        info: [],
      };
      break;
    default:
      break;
  }
  return res;
};

export const transformToThin = (item: any, id: string, nextPage: number) => {
  const totalScore = calcTotalScore(item);

  const getChildQuestions = () =>
    item.groups
      .flatMap(group => group.questionList)
      .map(it => {
        it.bigQuestionNumber = item.bigQuestionNumber;
        it.infoIdList ||= [];
        return it;
      });

  const base = {
    id,
    title: `${item.bigQuestionNumber}、${item.questionName}`,
    bigQuestionNumber: item.bigQuestionNumber,
    questionName: item.questionName,
    pageOf: nextPage,
    rawOptions: { ...item, id },
    info: [],
    totalScore,
  };

  switch (item.fixedData.label) {
    case "选择题": {
      return {
        ...base,
        type: "ChoiceQuestion",
        group: 5,
        infoList: [{ x0: 0, y0: 0, x1: 0, y1: 0, pageOf: 0 }],
        childs: getChildQuestions().map(it => {
          it.questionTypeLabel = it.questionTypeName;
          it.length = it.optionLength;
          it.contentList = it.optionList;
          it.answerKey = it.answer;
          return it;
        }),
      };
    }

    case "填空题": {
      return {
        ...base,
        type: "FillBlankQuestion",
        data: "",
        infoList: [{ x0: 0, y0: 0, x1: 0, y1: 0, pageOf: 0 }],
        scoreBoxList: [],
        childs: getChildQuestions(),
      };
    }

    case "简答题": {
      return {
        ...base,
        type: "BriefQuestion",
        data: [],
        infoList: [{ x0: 0, y0: 0, x1: 0, y1: 0, pageOf: 0 }],
        props: {},
        childs: getChildQuestions(),
      };
    }

    case "作文": {
      const child = {
        ...item.articleSetting,
        bigQuestionNumber: item.bigQuestionNumber,
        questionName: item.questionName,
        prefix: item.questionName,
        infoIdList: [],
        infoList: [{ x0: 0, y0: 0, x1: 0, y1: 0, pageOf: 0 }],
      };

      return {
        ...base,
        type: "ArticleQuestion",
        childs: [child],
        totalScore: item.score,
      };
    }

    default:
      return base;
  }
};
