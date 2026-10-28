
import "server-only";

import { getStudentSession } from "@/lib/auth/getStudentSession";
import { getActivePlans, getPackageDetails } from "@/lib/packagesHelper";

function isEnabled(value) {
  return ["1", "active", "true", "yes"].includes(
    String(value ?? "").trim().toLowerCase()
  );
}

function getExpiryTimestamp(value) {
  const expiry = String(value ?? "").trim();

  if (!expiry) return null;

  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(expiry)
      ? `${expiry}T23:59:59.999+05:30`
      : expiry.replace(" ", "T") +
        (/Z$|[+-]\d{2}:\d{2}$/.test(expiry) ? "" : "+05:30")
  );

  return Number.isNaN(date.getTime())
    ? null
    : date.getTime();
}

export function isCurrentPlan(plan, now = Date.now()) {
  if (!isEnabled(plan?.status)) {
    return false;
  }

  const premiumStatus =
    plan?.premium_status ?? plan?.premiumStatus;

  if (
    premiumStatus !== undefined &&
    premiumStatus !== null &&
    premiumStatus !== "" &&
    !isEnabled(premiumStatus)
  ) {
    return false;
  }

  const startValue =
    plan?.starting_date ??
    plan?.start_date ??
    plan?.valid_from;

  if (startValue) {
    const text = String(startValue).trim();
    const start = new Date(
      /^\d{4}-\d{2}-\d{2}$/.test(text)
        ? `${text}T00:00:00+05:30`
        : text.replace(" ", "T") +
          (/Z$|[+-]\d{2}:\d{2}$/.test(text) ? "" : "+05:30")
    ).getTime();

    if (!Number.isFinite(start) || start > now) {
      return false;
    }
  }

  const expiry = getExpiryTimestamp(
    plan?.expiry_date ??
      plan?.expiryDate ??
      plan?.valid_until ??
      plan?.validity_date
  );

  return expiry !== null && expiry >= now;
}

function getPackageId(plan) {
  const id = Number(
    plan?.pid ??
      plan?.package_id ??
      plan?.packageId
  );

  return Number.isSafeInteger(id) && id > 0
    ? id
    : null;
}

function normalizeCourseName(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getCourseId(value) {
  const id = Number(value);

  return Number.isSafeInteger(id) && id > 0
    ? String(id)
    : "";
}

export function packageIncludesExam(packageDetails, exam) {
  const courses = Array.isArray(packageDetails?.courses)
    ? packageDetails.courses
    : [];

  const packageCourseIds = new Set();
  const packageCourseNames = new Set();

  for (const course of courses) {
    const id = getCourseId(course?.id);
    const name = normalizeCourseName(
      course?.exam ?? course?.title
    );

    if (id) packageCourseIds.add(id);
    if (name) packageCourseNames.add(name);
  }

  const examCourseIds = [
    exam?.subexamid,
    exam?.subExamId,
    exam?.sub_exam_id,
    exam?.course_id,
    exam?.courseId,
    exam?.courseid,
    exam?.subcourse_id,
    exam?.subcourseId,
    exam?.sub_course_id,
    exam?.course,
  ]
    .map(getCourseId)
    .filter(Boolean);

  if (examCourseIds.length) {
    // A display-name match must not override an explicit unrelated course ID.
    return examCourseIds.some((id) => packageCourseIds.has(id));
  }

  const examCourseNames = [
    exam?.course,
    exam?.course_name,
    exam?.courseName,
    exam?.subcourse,
    exam?.sub_course,
    exam?.subcourse_name,
  ]
    .map(normalizeCourseName)
    .filter(Boolean);

  return examCourseNames.some((name) =>
    packageCourseNames.has(name)
  );
}

// This cache deduplicates server requests.
// It is not a payment ledger or proof of payment.
const cacheKey = Symbol.for("mastermind.packageAccess");
const accessCache = (globalThis[cacheKey] ??= new Map());

function cachedAccess(key, load) {
  const now = Date.now();
  const existing = accessCache.get(key);

  if (existing && existing.until > now) {
    return existing.promise;
  }

  for (const [entryKey, entry] of accessCache) {
    if (entry.until <= now) {
      accessCache.delete(entryKey);
    }
  }

  if (accessCache.size >= 500) {
    accessCache.delete(accessCache.keys().next().value);
  }

  const entry = { until: now + 5_000 };

  entry.promise = Promise.resolve()
    .then(load)
    .catch((error) => {
      entry.until = Date.now() + 3_000;
      throw error;
    });

  accessCache.set(key, entry);

  return entry.promise;
}

export function invalidatePackageAccess(uid, cid) {
  const prefix = `${Number(uid)}:${Number(cid)}:`;

  for (const key of accessCache.keys()) {
    if (key.startsWith(prefix)) {
      accessCache.delete(key);
    }
  }
}

export async function getOwnedPackages(uid, cid) {
  const userId = Number(uid);
  const categoryId = Number(cid);

  if (
    !Number.isSafeInteger(userId) ||
    userId <= 0 ||
    !Number.isSafeInteger(categoryId) ||
    categoryId <= 0
  ) {
    return [];
  }

  const packages = await cachedAccess(
    `${userId}:${categoryId}:packages`,
    () => loadOwnedPackages(userId, categoryId)
  );

  return packages.filter(({ plan }) => isCurrentPlan(plan));
}

async function loadOwnedPackages(uid, cid) {
  const activePlans = await getActivePlans({ uid, cid });

  if (!Array.isArray(activePlans)) {
    throw new Error("Invalid active plans response.");
  }

  const currentPlans = activePlans
    .filter(
      (plan) =>
        isCurrentPlan(plan) &&
        (
          plan?.cid === undefined ||
          plan?.cid === null ||
          plan?.cid === "" ||
          Number(plan.cid) === Number(cid)
        )
    )
    .map((plan) => ({
      plan,
      pid: getPackageId(plan),
    }))
    .filter(({ pid }) => pid !== null);

  const purchasedPackages = await Promise.all(
    currentPlans.map(async ({ pid, plan }) => {
      const details = await getPackageDetails({
        uid,
        cid,
        pid,
      });

      if (!details) {
        throw new Error(
          `Unable to verify package details for active package ${pid}.`
        );
      }

      return { pid, details, plan };
    })
  );

  return purchasedPackages;
}

async function readAccessData(endpoint, fields) {
  const baseUrl = String(
    process.env.PSC_API_BASE_URL ?? ""
  ).trim();

  const apiKey = String(
    process.env.PSC_API_KEY ?? ""
  ).trim();

  if (!baseUrl || !apiKey) {
    throw new Error("PSC API configuration is missing.");
  }

  const form = new FormData();

  for (const [key, value] of Object.entries({
    api: apiKey,
    ...fields,
  })) {
    form.set(key, String(value));
  }

  const response = await fetch(
    `${baseUrl.replace(/\/+$/, "")}/${endpoint}`,
    {
      method: "POST",
      body: form,
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to verify course content (${response.status}).`
    );
  }

  const result = await response.json();

  if (result?.status !== true) {
    throw new Error("Unable to verify course content.");
  }

  return result;
}

async function getOwnedCourseTopics(
  uid,
  cid,
  { studyPlan = false, subjectIds = [] } = {}
) {
  const packages = await getOwnedPackages(uid, cid);

  const courseIds = [
    ...new Set(
      packages.flatMap(({ details }) =>
        (details.courses || [])
          .map((course) => getCourseId(course.id))
          .filter(Boolean)
      )
    ),
  ];

  const topics = [];
  const requestedSubjectIds = new Set(subjectIds.map(String));

  for (const courseId of courseIds) {
    const categories = await cachedAccess(
      `${Number(uid)}:${Number(cid)}:subjects:${courseId}`,
      async () => {
        const result = await readAccessData(
          "getSubExamDetailsLatest",
          {
            uid,
            cid,
            subexamid: courseId,
            type: "topic",
            offset: 0,
          }
        );

        if (!Array.isArray(result.items)) {
          throw new Error("Invalid course subjects.");
        }

        return result.items;
      }
    );

    const selected = categories.filter((category) => {
      const isStudyPlan = /^study\s*plan$/i.test(
        String(category.subject || category.title || "").trim()
      );
      // A study-plan day combines chapters from other subjects. Their subject
      // IDs do not identify the day itself, so also search the Study Plan list.
      return isStudyPlan || (!studyPlan && requestedSubjectIds.has(String(category.id)));
    });

    for (const category of selected) {
      const items = await cachedAccess(
        `${Number(uid)}:${Number(cid)}:topics:${courseId}:${category.id}`,
        async () => {
          const result = await readAccessData(
            "getTopicListNew",
            {
              uid,
              cid,
              subexamid: courseId,
              subid: category.id,
            }
          );

          if (!Array.isArray(result.data)) {
            throw new Error("Invalid course topics.");
          }

          return result.data;
        }
      );

      topics.push(...items);
    }
  }

  return topics;
}

export async function hasOwnedTopicAccess(
  uid,
  cid,
  topicId,
  chapters
) {
  if (!Array.isArray(chapters)) {
    return false;
  }

  // Subject hints come from backend chapters,
  // not user-supplied course claims.
  const subjectIds = [
    ...new Set(
      chapters
        .map((item) => item.subjectid ?? item.subjectId)
        .filter(Boolean)
    ),
  ];

  const topics = await getOwnedCourseTopics(uid, cid, {
    subjectIds,
  });

  return topics.some(
    (topic) => String(topic.id) === String(topicId)
  );
}

// Older test records may have subexamid=null.
// Verify membership using the course-specific backend list.
export async function getOwnedExamIds(
  uid,
  cid,
  type = "mock"
) {
  if (type === "studyplan") {
    const topics = await getOwnedCourseTopics(uid, cid, {
      studyPlan: true,
    });

    return new Set(
      topics
        .map((topic) =>
          getCourseId(
            topic.examid ??
              topic.exam_id ??
              topic.mocktest
          )
        )
        .filter(Boolean)
    );
  }

  const packages = await getOwnedPackages(uid, cid);

  const courseIds = [
    ...new Set(
      packages.flatMap(({ details }) =>
        (details.courses || [])
          .map((course) => getCourseId(course.id))
          .filter(Boolean)
      )
    ),
  ];

  const ids = new Set();

  for (const courseId of courseIds) {
    const courseTests = await cachedAccess(
      `${Number(uid)}:${Number(cid)}:tests:${type}:${courseId}`,
      async () => {
        const collected = [];
        const offsets = new Set();
        let offset = 0;

        while (!offsets.has(offset)) {
          if (offsets.size >= 100) {
            throw new Error(
              "Course test list pagination exceeded its limit."
            );
          }

          offsets.add(offset);

          const result = await readAccessData(
            "getSubExamDetailsLatest",
            {
              uid,
              cid,
              subexamid: courseId,
              type,
              offset,
            }
          );

          if (!Array.isArray(result.items)) {
            throw new Error("Invalid course test list.");
          }

          collected.push(
            ...result.items
              .map((item) => getCourseId(item.id))
              .filter(Boolean)
          );

          const next = Number(
            result.nextoffset ?? result.nextOffset
          );

          if (
            !result.items.length ||
            !Number.isSafeInteger(next) ||
            next <= offset
          ) {
            break;
          }

          offset = next;
        }

        return collected;
      }
    );

    courseTests.forEach((id) => ids.add(id));
  }

  return ids;
}

// Ownership is resolved from the authenticated session,
// never a caller-supplied user ID.
export async function applyPackageAccess(
  result,
  fields = {}
) {
  if (!fields.cid) {
    return result;
  }

  function hasPaidContent(value) {
    if (!value || typeof value !== "object") {
      return false;
    }

    if (
      [value.access, value.type].some(
        (flag) =>
          String(flag).trim().toLowerCase() === "paid"
      )
    ) {
      return true;
    }

    return Object.values(value).some(hasPaidContent);
  }

  if (
    !fields.courseListing &&
    !fields.subexamid &&
    !hasPaidContent(result)
  ) {
    return result;
  }

  const session = await getStudentSession();

  if (!session?.uid) {
    return result;
  }

  let packages;

  try {
    packages = await getOwnedPackages(
      Number(session.uid),
      Number(fields.cid)
    );
  } catch (error) {
    // Never unlock paid content when ownership
    // verification is unavailable.
    console.error(
      "Unable to load package access:",
      error
    );

    return result;
  }

  const includes = (item) =>
    packages.some(({ details }) =>
      packageIncludesExam(details, item)
    );

  const parentCovered =
    includes({ subexamid: fields.subexamid }) ||
    (
      fields.topicid &&
      Array.isArray(result?.data) &&
      packages.length > 0
        ? await hasOwnedTopicAccess(
            session.uid,
            fields.cid,
            fields.topicid,
            result.data
          )
        : false
    );

  let examIds = new Set();

  if (
    !parentCovered &&
    fields.contentType &&
    packages.length
  ) {
    examIds = await getOwnedExamIds(
      session.uid,
      fields.cid,
      fields.contentType
    );
  }

  function visit(value, inherited = false) {
    if (Array.isArray(value)) {
      return value.map((item) =>
        visit(item, inherited)
      );
    }

    if (!value || typeof value !== "object") {
      return value;
    }

    const covered =
      inherited ||
      includes(value) ||
      (
        value.access != null &&
        examIds.has(getCourseId(value.id))
      ) ||
      (
        fields.courseListing === true &&
        includes({ course_id: value.id })
      );

    const next = Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        visit(item, covered),
      ])
    );

    if (covered) {
      next.packageAccess = true;
      // Existing test/video clients use these flags to choose the start action.
      // This is set only after server-side subscription and course verification.
      for (const flag of ["access", "type"]) {
        if (String(next[flag] ?? "").trim().toLowerCase() === "paid") {
          next[flag] = "free";
        }
      }
    }

    return next;
  }

  return visit(result, Boolean(parentCovered));
}
