/*
 * Backend getUserExamsList requires exam_type.
 *
 * Keep backend-supported exam types in one place.
 *
 * If backend later provides an exam-type-list API,
 * replace this function with that API call only.
 */

export function getExamHistoryTypes() {
    return [
        "mock",
        "pqp",
        "scert",
        "topicwise",
        "studyplan",
    ];
}