import {
    getStudyMaterials,
  } from "@/lib/studyMaterialsHelper";
  
  /* =========================================================
     GET
     /api/study-materials?uid=0&cid=1
  ========================================================= */
  
  export async function GET(
    request
  ) {
    try {
      const url =
        new URL(
          request.url
        );
  
      const uid =
        Number(
          url.searchParams.get(
            "uid"
          ) || 0
        );
  
      const cid =
        Number(
          url.searchParams.get(
            "cid"
          ) || 2
        );
  
      const result =
        await getStudyMaterials({
          uid,
          cid,
        });
  
      /*
       * Keep HTTP 200 here even when
       * backend returns no data.
       *
       * Frontend can inspect result.status.
       */
  
      return Response.json(
        result,
        {
          status: 200,
        }
      );
    } catch (error) {
      console.error(
        "STUDY MATERIAL ROUTE ERROR:",
        error
      );
  
      return Response.json(
        {
          status: false,
          filePath: "",
          data: [],
          total: 0,
          message:
            "Unable to load study materials",
        },
        {
          status: 500,
        }
      );
    }
  }