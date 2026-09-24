import {
    NextResponse,
  } from "next/server";
  
  const PSC_API_BASE_URL =
    process.env.PSC_API_BASE_URL;
  
  export async function GET(request) {
    try {
      const {
        searchParams,
      } = new URL(request.url);
  
      const cid =
        searchParams.get("cid") ||
        "1";
  
      const uid =
        searchParams.get("uid") ||
        "21";
  
      const offset =
        searchParams.get(
          "offset"
        ) || "0";
  
      const apiKey =
        process.env.PSC_API_KEY;
  
      if (
        !PSC_API_BASE_URL ||
        !apiKey
      ) {
        return NextResponse.json(
          {
            status: false,
            message:
              "PSC API configuration is missing.",
            months: [],
            nextoffset: null,
          },
          {
            status: 500,
          }
        );
      }
  
      const formData =
        new FormData();
  
      formData.append(
        "api",
        apiKey
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
        "offset",
        String(offset)
      );
  
      const response =
        await fetch(
          `${PSC_API_BASE_URL}/getBulletinMonths`,
          {
            method: "POST",
            body: formData,
            cache: "no-store",
          }
        );
  
      const rawText =
        await response.text();
  
      let result = null;
  
      try {
        result =
          rawText
            ? JSON.parse(
                rawText
              )
            : null;
      } catch (error) {
        console.error(
          "Invalid bulletin API response:",
          rawText
        );
  
        return NextResponse.json(
          {
            status: false,
            message:
              "Bulletin API returned invalid data.",
            months: [],
            nextoffset: null,
          },
          {
            status: 502,
          }
        );
      }
  
      if (!response.ok) {
        return NextResponse.json(
          {
            status: false,
            message:
              result?.message ||
              "Unable to fetch bulletin months.",
            months: [],
            nextoffset: null,
          },
          {
            status:
              response.status,
          }
        );
      }
  
      const months =
        Array.isArray(
          result?.months
        )
          ? result.months
          : [];
  
      return NextResponse.json(
        {
          status:
            result?.status ===
            true,
  
          premium:
            result?.premium ??
            "false",
  
          months:
            months.map(
              (item) => ({
                id:
                  item?.id ??
                  null,
  
                month:
                  item?.month ||
                  "",
  
                year:
                  item?.year ||
                  "",
  
                monthorder:
                  item?.monthorder ||
                  "",
  
                access:
                  item?.access ||
                  "",
  
                quiz:
                  Number(
                    item?.quiz ||
                      0
                  ),
              })
            ),
  
          nextoffset:
            result?.nextoffset ??
            null,
        },
        {
          status: 200,
        }
      );
    } catch (error) {
      console.error(
        "Bulletin months route error:",
        error
      );
  
      return NextResponse.json(
        {
          status: false,
          message:
            "Failed to load bulletin months.",
          months: [],
          nextoffset: null,
        },
        {
          status: 500,
        }
      );
    }
  }