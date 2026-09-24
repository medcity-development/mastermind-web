// src/lib/pyqDetailsHelper.js

function createExamFormData({
    uid = 0,
    cid = 1,
    examId,
    type = "pqp",
  }) {
    const formData =
      new FormData();
  
    formData.append(
      "api",
      process.env.PSC_API_KEY
    );
  
    formData.append(
      "uid",
      String(uid)
    );
  
    formData.append(
      "cid",
      String(cid)
    );
  
    formData.append(
      "examid",
      String(examId)
    );
  
    formData.append(
      "type",
      String(type)
    );
  
    return formData;
  }
  
  /* =========================================================
     EXAM DETAILS
  ========================================================= */
  
  export async function getPyqExamDetails({
    uid = 0,
    cid = 1,
    examId,
    type = "pqp",
  } = {}) {
    if (!examId) {
      return {
        status: false,
        view: "",
        exam: null,
        instructions: [],
        paused: [],
      };
    }
  
    try {
      const formData =
        createExamFormData({
          uid,
          cid,
          examId,
          type,
        });
  
      const response =
        await fetch(
          `${process.env.PSC_API_BASE_URL}/getMockTestDetails`,
          {
            method: "POST",
            body: formData,
            cache: "no-store",
          }
        );
  
      if (!response.ok) {
        throw new Error(
          `getMockTestDetails failed: ${response.status}`
        );
      }
  
      const result =
        await response.json();
  
      const exam =
        Array.isArray(result?.exam)
          ? result.exam[0] ?? null
          : null;
  
      const instructions =
        Array.isArray(result?.data)
          ? result.data
          : [];
  
      const paused =
        Array.isArray(result?.paused)
          ? result.paused
          : [];
  
      return {
        status:
          result?.status ?? false,
  
        view:
          result?.view ?? "",
  
        exam,
  
        instructions,
  
        paused,
      };
    } catch (error) {
      console.error(
        "getPyqExamDetails:",
        error
      );
  
      return {
        status: false,
        view: "",
        exam: null,
        instructions: [],
        paused: [],
      };
    }
  }
  
  /* =========================================================
     EXAM QUESTIONS
  ========================================================= */
  
  export async function getPyqQuestions({
    uid = 21,
    cid = 1,
    examId,
    examType = "pqp",
  } = {}) {
    if (!examId) {
      return {
        status: false,
        imagePath: "",
        data: [],
      };
    }
  
    try {
      const formData =
        new FormData();
  
      formData.append(
        "api",
        process.env.PSC_API_KEY
      );
  
      formData.append(
        "cid",
        String(cid)
      );
  
      formData.append(
        "uid",
        String(uid)
      );
  
      formData.append(
        "examid",
        String(examId)
      );
  
      formData.append(
        "examtype",
        String(examType)
      );
  
      const response =
        await fetch(
          `${process.env.PSC_API_BASE_URL}/getMockTestQuestions`,
          {
            method: "POST",
            body: formData,
            cache: "no-store",
          }
        );
  
      if (!response.ok) {
        throw new Error(
          `getMockTestQuestions failed: ${response.status}`
        );
      }
  
      const result =
        await response.json();
  
      console.log(
        "getMockTestQuestions:",
        result
      );
  
      return {
        status:
          result?.status ?? false,
  
        imagePath:
          result?.img_path ?? "",
  
        data:
          Array.isArray(result?.data)
            ? result.data
            : [],
      };
    } catch (error) {
      console.error(
        "getPyqQuestions:",
        error
      );
  
      return {
        status: false,
        imagePath: "",
        data: [],
      };
    }
  }