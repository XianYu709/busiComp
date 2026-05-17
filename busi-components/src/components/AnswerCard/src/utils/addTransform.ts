import { SnowflakeIdGenerator } from "@sjjb/utils";

export const calcTotalScore = (item: any) => {
  const questions = item.groups.map(g => g.questionList).flat();

  switch (item.fixedData.params.type) {
    case "ChoiceQuestion":
      return questions.reduce((sum, q) => {
        return sum + (Number(q.score) || 0);
      }, 0);

    case "FillBlankQuestion":
      return questions.reduce((sum, q) => {
        if (Array.isArray(q.block)) {
          return sum + q.block.reduce((s, b) => s + (Number(b.score) || 0), 0);
        }
        return sum;
      }, 0);

    case "BriefQuestion":
      return questions.reduce((sum, q) => {
        if (Array.isArray(q.childs)) {
          return sum + q.childs.reduce((s, b) => s + (Number(b.score) || 0), 0);
        }
        if (Array.isArray(q.block)) {
          // 兼容旧数据
          return sum + q.block.reduce((s, b) => s + (Number(b.score) || 0), 0);
        }
        return sum;
      }, 0);

    case "ArticleQuestion":
      return Number(item?.articleSetting?.score) || Number(item?.score) || 0;

    default:
      return 0;
  }
};

export const transform = (item: any, id: string, nextPage: number) => {
  let res = {};
  const totalScore = calcTotalScore(item);
  switch (item.fixedData.params.type) {
    case "ChoiceQuestion":
      res = {
        id,
        type: "ChoiceQuestion",
        model: {
          title: item.bigQuestionNumber + "、" + item.questionName,
          bigQuestionNumber: item.bigQuestionNumber,
          questionName: item.questionName,
          group: 5,
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
                isOneProb: it.isOneProb,
              };
            }),
          totalScore,
        },
        pageOf: nextPage,
        rawOptions: { ...item, id },
        info: [],
      };
      break;
    case "FillBlankQuestion":
      res = {
        id,
        type: "FillBlankQuestion",
        model: {
          data: "",
          title: item.bigQuestionNumber + "、" + item.questionName,
          childs: item.groups.map(group => group.questionList).flat(),
          scoreBoxList: [],
          totalScore,
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
    case "BriefQuestion":
      res = {
        id,
        type: "BriefQuestion",
        model: {
          data: {},
          title: item.bigQuestionNumber + "、" + item.questionName,
          childs: item.groups.map(group => group.questionList).flat(),
          totalScore,
        },
        pageOf: nextPage,
        rawOptions: { ...item, id },
        info: [],
      };
      break;
    case "ArticleQuestion":
      res = {
        id,
        type: "ArticleQuestion",
        model: {
          title: item.bigQuestionNumber + "、" + item.questionName,
          bigQuestionNumber: item.bigQuestionNumber,
          questionName: item.questionName,
          articleSetting: item.articleSetting,
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

  switch (item.fixedData.params.type) {
    case "ChoiceQuestion": {
      return {
        ...base,
        type: "ChoiceQuestion",
        group: 5,
        infoList: [{ x0: 0, y0: 0, x1: 0, y1: 0, pageOf: 0 }],
        childs: getChildQuestions().map(it => {
          it.questionTypeLabel = it.questionTypeName;
          it.length = it.optionLength;
          it.contentList = it.optionList;
          it.answerKey = Array.isArray(it.answer) ? it.answer.join(",") : it.answer;
          it.answer = Array.isArray(it.answer) ? it.answer.join(",") : it.answer;
          return it;
        }),
      };
    }

    case "FillBlankQuestion": {
      return {
        ...base,
        type: "FillBlankQuestion",
        data: "",
        infoList: [{ x0: 0, y0: 0, x1: 0, y1: 0, pageOf: 0 }],
        scoreBoxList: [],
        childs: getChildQuestions(),
      };
    }

    case "BriefQuestion": {
      return {
        ...base,
        type: "BriefQuestion",
        data: {},
        infoList: [{ x0: 0, y0: 0, x1: 0, y1: 0, pageOf: 0 }],
        props: {},
        childs: getChildQuestions(),
      };
    }

    case "ArticleQuestion": {
      const id = SnowflakeIdGenerator.generateId();
      const child = {
        id,
        questionId: id,
        ...item.articleSetting,
        bigQuestionNumber: item.bigQuestionNumber,
        questionName: item.questionName,
        prefix: item.questionName,
      };

      return {
        ...base,
        type: "ArticleQuestion",
        childs: [child],
        infoList: [{ x0: 0, y0: 0, x1: 0, y1: 0, pageOf: 0 }],
        totalScore,
      };
    }

    default:
      return base;
  }
};
