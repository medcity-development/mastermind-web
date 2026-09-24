export function normalizeQuestions(
    questions
  ) {
    if (
      !Array.isArray(
        questions
      )
    ) {
      return [];
    }
  
    return questions.map(
      (item) => ({
        id:
          item?.id,
  
        question:
          item?.question,
  
        questionAlias:
          item?.question_alias,
  
        qtype:
          item?.qtype,
  
        attached:
          item?.attached,
  
        option1:
          item?.option1,
  
        option2:
          item?.option2,
  
        option3:
          item?.option3,
  
        option4:
          item?.option4,
  
        answer:
          item?.answer,
  
        answerkey:
          item?.answerkey,
  
        comment:
          item?.comment,
  
        commentAttach:
          item?.comment_attach,
  
        order:
          item?.orders,
      })
    );
  }
  
  export function formatExamArray(
    values
  ) {
    if (
      !Array.isArray(
        values
      )
    ) {
      return "[]";
    }
  
    return `[${values.join(
      ", "
    )}]`;
  }