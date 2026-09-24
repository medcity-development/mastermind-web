function appendFormValue(
    formData,
    key,
    value
  ) {
    if (
      value !== undefined &&
      value !== null
    ) {
      formData.append(
        key,
        String(value)
      );
    }
  }
  
  async function sendExamAttempt(
    endpoint,
    payload
  ) {
    const formData =
      new FormData();
  
    formData.append(
      "api",
      process.env.PSC_API_KEY
    );
  
    Object.entries(
      payload
    ).forEach(
      ([key, value]) => {
        appendFormValue(
          formData,
          key,
          value
        );
      }
    );
  
    const response =
      await fetch(
        `${process.env.PSC_API_BASE_URL}/${endpoint}`,
        {
          method: "POST",
          body: formData,
          cache: "no-store",
        }
      );
  
    if (!response.ok) {
      throw new Error(
        `${endpoint} failed: ${response.status}`
      );
    }
  
    return response.json();
  }
  
  /* =========================================================
     CREATE FIRST EXAM ATTEMPT
  ========================================================= */
  
  export async function createUserExamAttempt(
    payload
  ) {
    try {
      return await sendExamAttempt(
        "setNewUserExams",
        payload
      );
    } catch (error) {
      console.error(
        "createUserExamAttempt:",
        error
      );
  
      return {
        status: false,
        message:
          "Unable to save exam",
      };
    }
  }
  
  /* =========================================================
     UPDATE EXISTING EXAM ATTEMPT
  ========================================================= */
  
  export async function updateUserExamAttempt(
    payload
  ) {
    try {
      return await sendExamAttempt(
        "setUpdateUserExams",
        payload
      );
    } catch (error) {
      console.error(
        "updateUserExamAttempt:",
        error
      );
  
      return {
        status: false,
        message:
          "Unable to update exam",
      };
    }
  }