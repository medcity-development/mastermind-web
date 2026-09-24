import {
    NextResponse,
  } from "next/server";
  
  export async function GET(request) {
    try {
      const { searchParams } =
        new URL(request.url);
  
      const cid =
        searchParams.get("cid");
  
      const uid =
        searchParams.get("uid");
  
      const offset =
        searchParams.get("offset");
  
      const filter =
        searchParams.get("filter");
  
      const type =
        searchParams.get("type");
  
      const subId =
        searchParams.get("subId");
  
      if (!subId) {
        return NextResponse.json(
          {
            status: false,
            message:
              "subId is required.",
            data: [],
          },
          {
            status: 400,
          }
        );
      }
  
      const formData =
        new FormData();
  
      formData.append(
        "api",
        process.env.PSC_API_KEY
      );
  
      if (cid != null) {
        formData.append(
          "cid",
          String(cid)
        );
      }
  
      if (uid != null) {
        formData.append(
          "uid",
          String(uid)
        );
      }
  
      if (offset != null) {
        formData.append(
          "offset",
          String(offset)
        );
      }
  
      if (filter != null) {
        formData.append(
          "filter",
          String(filter)
        );
      }
  
      if (type != null) {
        formData.append(
          "type",
          String(type)
        );
      }
  
      formData.append(
        "sub_id",
        String(subId)
      );
  
      const response =
        await fetch(
          `${process.env.PSC_API_BASE_URL}/getMockTestListbyOffset`,
          {
            method: "POST",
            body: formData,
            cache: "no-store",
          }
        );
  
      const result =
        await response.json();
  
      return NextResponse.json(
        result,
        {
          status: response.ok
            ? 200
            : response.status,
        }
      );
    } catch (error) {
      console.error(
        "Level mock tests:",
        error
      );
  
      return NextResponse.json(
        {
          status: false,
          message:
            "Failed to load level mock tests.",
          data: [],
        },
        {
          status: 500,
        }
      );
    }
  }