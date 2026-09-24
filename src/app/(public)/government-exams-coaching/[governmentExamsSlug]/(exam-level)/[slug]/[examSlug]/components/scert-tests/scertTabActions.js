"use server";

import {
  getScertFolders,
  getScertTestsByClassId,
} from "@/lib/scertHelper";

/* =========================================================
   GET SCERT CLASSES
========================================================= */

export async function getScertTabFolders({
  uid = 0,
  cid = 1,
} = {}) {
  try {
    const result =
      await getScertFolders({
        uid,
        cid,
        offset: 0,
      });

    return {
      status:
        Boolean(
          result?.status
        ),

      data:
        Array.isArray(
          result?.data
        )
          ? result.data
          : [],
    };
  } catch (error) {
    console.error(
      "getScertTabFolders:",
      error
    );

    return {
      status: false,
      data: [],
    };
  }
}

/* =========================================================
   GET TESTS FOR CLASS
========================================================= */

export async function getScertTabTests({
  uid = 0,
  classId,
} = {}) {
  try {
    if (!classId) {
      return {
        status: false,
        data: [],
      };
    }

    const result =
      await getScertTestsByClassId({
        uid,
        classId,
        filter: 0,
      });

    return {
      status:
        Boolean(
          result?.status
        ),

      data:
        Array.isArray(
          result?.data
        )
          ? result.data
          : [],
    };
  } catch (error) {
    console.error(
      "getScertTabTests:",
      error
    );

    return {
      status: false,
      data: [],
    };
  }
}