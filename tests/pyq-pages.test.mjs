import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
const require = createRequire(import.meta.url);
const babel = require("next/dist/compiled/babel/core");
const root = '../src/app/(student)/dashboard/[governmentExamsSlug]/previous-questions/[examId]/';

async function pageModule(file, { details, access, accessError, questions, sessionUid = 7 } = {}) {
  const source = await readFile(new URL(root + file, import.meta.url), 'utf8');
  const { code } = babel.transformSync(source, {
    filename: file, babelrc: false, configFile: false,
    presets: [require('next/dist/compiled/babel/preset-react')],
    plugins: [require('next/dist/compiled/babel/plugin-transform-modules-commonjs')],
  });
  const requests = [];
  const props = { params: Promise.resolve({ governmentExamsSlug: 'kerala-psc', examId: '792' }), searchParams: Promise.resolve({ uid: '999', cid: '99', type: 'mock' }) };
  const deps = {
    'react': { cache: fn => {
      const cache = new Map();
      return (...args) => {
        const key = JSON.stringify(args);
        if (!cache.has(key)) cache.set(key, fn(...args));
        return cache.get(key);
      };
    } },
    'next/navigation': { notFound: () => { throw new Error('NOT_FOUND'); }, redirect: url => { throw new Error(`REDIRECT:${url}`); } },
    '@/lib/pyqDetailsHelper': {
      getPyqExamDetails: async args => { requests.push(args); return details ?? { status: true, exam: { id: 792, access: 'free' } }; },
      getPyqQuestions: async () => questions ?? { status: true, data: [{ id: 1 }] },
    },
    '@/lib/governmentExamConfig': { getGovernmentExamConfig: () => ({ cid: 1, name: 'Kerala PSC' }) },
    '@/lib/auth/getStudentSession': { getStudentSession: async () => ({ uid: sessionUid }) },
    '@/lib/premiumExamAccess': { checkPremiumExamAccess: async () => { if (accessError) throw accessError; return access ?? { hasAccess: true }; } },
  };
  const exports = {};
  vm.runInNewContext(code, {
    exports, React: { createElement: (type, props, ...children) => ({ type, props, children }) },
    require: id => {
      if (deps[id]) return deps[id];
      if (id.includes('/components/')) return id.split('/').at(-1);
      throw new Error(`Unexpected import ${id}`);
    },
  });
  return { exports, requests, props };
}

for (const file of ['page.jsx', 'start/page.jsx']) {
  test(`${file}: renders a valid exam using session and course identity`, async () => {
    const { exports, props, requests } = await pageModule(file);
    const tree = await exports.default(props);
    assert.equal(tree.type, 'main');
    assert.equal(requests[0].uid, 7);
    assert.equal(requests[0].cid, 1);
    assert.equal(requests[0].type, 'pqp');
  });
  test(`${file}: backend rate limiting offers retry instead of 404`, async () => {
    const { exports, props } = await pageModule(file, { details: { exam: null, httpStatus: 429, retryAfter: 60 } });
    const tree = await exports.default(props);
    assert.equal(tree.type, 'ExamLoadError');
    assert.equal(tree.props.retryAfter, 60);
  });
  test(`${file}: ownership failures do not crash or unlock the exam`, async () => {
    const { exports, props } = await pageModule(file, { details: { exam: { id: 792, access: 'paid' } }, accessError: { retryAfter: 30 } });
    const tree = await exports.default(props);
    assert.equal(tree.type, 'ExamLoadError');
    assert.equal(tree.props.retryAfter, 30);
  });
  test(`${file}: unowned paid exam returns to packages`, async () => {
    const { exports, props } = await pageModule(file, { details: { exam: { id: 792, access: 'paid' } }, access: { hasAccess: false } });
    await assert.rejects(exports.default(props), /REDIRECT:.*showPackages=1/);
  });
  test(`${file}: confirmed missing exams retain 404 behavior`, async () => {
    const { exports, props } = await pageModule(file, { details: { exam: null, httpStatus: 404 } });
    await assert.rejects(exports.default(props), /NOT_FOUND/);
  });
}

test('metadata and page share the exam details read within a render', async () => {
  const { exports, props, requests } = await pageModule('page.jsx');
  await exports.generateMetadata(props);
  await exports.default(props);
  assert.equal(requests.length, 1);
});

test('question loading failures remain retryable', async () => {
  const { exports, props } = await pageModule('start/page.jsx', { questions: { data: [], retryAfter: 45 } });
  const tree = await exports.default(props);
  assert.equal(tree.type, 'ExamLoadError');
  assert.equal(tree.props.retryAfter, 45);
});
