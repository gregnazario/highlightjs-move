const test = require('node:test');
const assert = require('node:assert/strict');
const hljs = require('highlight.js-v10/lib/core');
const move = require('../src/languages/move.v10.js');

hljs.registerLanguage('move', move);

function tokensIn(html) {
  const matches = html.matchAll(/class="hljs-([a-z0-9_-]+(?: [a-z0-9_-]+)*)"[^>]*>([^<]*)</g);
  return Array.from(matches, (m) => ({ kind: m[1], text: m[2] }));
}

function highlight(code) {
  return hljs.highlight(code, { language: 'move' });
}

function textsOfKind(value, kind) {
  // hljs renders sub-scopes like `title.function` as `class="hljs-title function_"`,
  // so accept either the exact name or the same name with a `_` suffix.
  return tokensIn(value)
    .filter((t) => {
      const parts = t.kind.split(' ');
      return parts.includes(kind) || parts.includes(`${kind}_`);
    })
    .map((t) => t.text);
}

test('[v10] exports a function', () => {
  assert.equal(typeof move, 'function');
});

test('[v10] language definition shape', () => {
  const def = move(hljs);
  assert.equal(def.name, 'Move');
  // v10 stores keywords as a space-separated string (v10 API)
  assert.equal(typeof def.keywords.keyword, 'string');
  const words = def.keywords.keyword.split(/\s+/);
  for (const w of ['module', 'fun', 'enum', 'is']) {
    assert.ok(words.includes(w), `expected ${w} in keyword list`);
  }
  assert.deepEqual(def.aliases, ['move', 'aptos-move', 'move-on-aptos', 'move-lang']);
});

test('[v10] registers under all aliases', () => {
  for (const alias of ['move', 'aptos-move', 'move-on-aptos', 'move-lang']) {
    assert.ok(hljs.getLanguage(alias), `alias not registered: ${alias}`);
  }
});

// ---------- Keywords ----------

test('[v10] highlights declaration keywords', () => {
  // v10's ENUM_DECLARATION end pattern doesn't include `;`, so a bare
  // `enum;` would swallow the rest of the line. Put enum at the end with
  // a `{}` so its decl mode closes properly.
  const { value } = highlight('module; fun; struct; const; use; friend; public; package; native; inline; entry; script; spec; schema; enum E { A }');
  const kw = textsOfKind(value, 'keyword');
  for (const expected of ['module', 'fun', 'struct', 'enum', 'const', 'use', 'friend', 'public', 'package', 'native', 'inline', 'entry', 'script', 'spec', 'schema']) {
    assert.ok(kw.includes(expected), `expected keyword ${expected}, got ${kw.join(',')}`);
  }
});

test('[v10] highlights control-flow keywords', () => {
  const { value } = highlight('if else return break continue for in match abort while loop');
  const kw = textsOfKind(value, 'keyword');
  for (const expected of ['if', 'else', 'return', 'break', 'continue', 'for', 'in', 'match', 'abort', 'while', 'loop']) {
    assert.ok(kw.includes(expected), `expected keyword ${expected}, got ${kw.join(',')}`);
  }
});

test('[v10] highlights ownership and reference keywords', () => {
  const { value } = highlight('let mut move copy phantom acquires is as Self');
  const kw = textsOfKind(value, 'keyword');
  for (const expected of ['let', 'mut', 'move', 'copy', 'phantom', 'acquires', 'is', 'as', 'Self']) {
    assert.ok(kw.includes(expected), `expected keyword ${expected}, got ${kw.join(',')}`);
  }
});

test('[v10] highlights spec language keywords', () => {
  const { value } = highlight('pragma invariant ensures requires aborts_if aborts_with include assume assert modifies emits apply axiom forall exists choose old global with');
  const kw = textsOfKind(value, 'keyword');
  for (const expected of ['pragma', 'invariant', 'ensures', 'requires', 'aborts_if', 'aborts_with', 'include', 'assume', 'assert', 'modifies', 'emits', 'apply', 'axiom', 'forall', 'exists', 'choose', 'old', 'global', 'with']) {
    assert.ok(kw.includes(expected), `expected keyword ${expected}, got ${kw.join(',')}`);
  }
});

test('[v10] Self is keyword but self is variable.language', () => {
  const { value } = highlight('Self self');
  assert.ok(textsOfKind(value, 'keyword').includes('Self'));
  assert.ok(textsOfKind(value, 'variable').includes('self'));
});

// ---------- Types ----------

test('[v10] highlights primitive types', () => {
  const { value } = highlight('u8 u16 u32 u64 u128 u256 i8 i16 i32 i64 i128 i256 bool address signer vector');
  const types = textsOfKind(value, 'type');
  for (const expected of ['u8','u16','u32','u64','u128','u256','i8','i16','i32','i64','i128','i256','bool','address','signer','vector']) {
    assert.ok(types.includes(expected), `expected type ${expected}, got ${types.join(',')}`);
  }
});

// ---------- Literals ----------

test('[v10] highlights true and false as literals', () => {
  const { value } = highlight('true false');
  const lits = textsOfKind(value, 'literal');
  assert.ok(lits.includes('true'));
  assert.ok(lits.includes('false'));
});

// ---------- Built-ins ----------

test('[v10] highlights global storage and macro built-ins', () => {
  const { value } = highlight('assert! move_to move_from borrow_global borrow_global_mut freeze');
  const builtins = textsOfKind(value, 'built_in');
  for (const expected of ['assert!', 'move_to', 'move_from', 'borrow_global', 'borrow_global_mut', 'freeze']) {
    assert.ok(builtins.includes(expected), `expected built_in ${expected}, got ${builtins.join(',')}`);
  }
});

test('[v10] abilities after `has` are built_in', () => {
  const { value } = highlight('struct Foo has copy, drop, key, store { x: u64 }');
  const builtins = textsOfKind(value, 'built_in');
  for (const expected of ['copy', 'drop', 'key', 'store']) {
    assert.ok(builtins.includes(expected), `expected built_in ${expected}, got ${builtins.join(',')}`);
  }
});

// ---------- Numbers ----------

test('[v10] highlights decimal numbers with and without suffix', () => {
  const { value } = highlight('let x = 42; let y = 1_000_000u64; let z = 7u128; let s = 5i32;');
  const nums = textsOfKind(value, 'number');
  assert.ok(nums.includes('42'));
  assert.ok(nums.includes('1_000_000u64'));
  assert.ok(nums.includes('7u128'));
  assert.ok(nums.includes('5i32'));
});

test('[v10] highlights hex numbers with suffix and underscores', () => {
  const { value } = highlight('0xFF 0xDEAD_BEEF 0x1A_F2u256');
  const nums = textsOfKind(value, 'number');
  assert.ok(nums.includes('0xFF'));
  assert.ok(nums.includes('0xDEAD_BEEF'));
  assert.ok(nums.includes('0x1A_F2u256'));
});

// ---------- Strings ----------

test('[v10] highlights byte strings and hex strings', () => {
  const { value } = highlight('let b = b"bytes\\n"; let h = x"DEADBEEF";');
  const strs = textsOfKind(value, 'string');
  assert.ok(strs.some((s) => s.includes('bytes')), `got: ${strs.join('|')}`);
  assert.ok(strs.some((s) => s.includes('DEADBEEF')), `got: ${strs.join('|')}`);
});

// ---------- Address literals ----------

test('[v10] highlights address literals', () => {
  const { value } = highlight('let a = @0x1; let b = @aptos_framework;');
  const syms = textsOfKind(value, 'symbol');
  assert.ok(syms.includes('@0x1'));
  assert.ok(syms.includes('@aptos_framework'));
});

// ---------- Comments ----------

test('[v10] highlights line and block comments (block is nestable)', () => {
  const { value } = highlight('// a line\n/* outer /* inner */ still outer */ let x = 1;');
  const comments = textsOfKind(value, 'comment');
  assert.ok(comments.some((c) => c.includes('a line')));
  assert.ok(comments.some((c) => c.includes('outer')));
});

test('[v10] highlights /// doc comments with doctags', () => {
  const { value } = highlight('/// outer @param x the value\nlet x = 1;');
  const comments = textsOfKind(value, 'comment');
  assert.ok(comments.some((c) => c.includes('outer')), `got: ${comments.join('|')}`);
  const doctags = textsOfKind(value, 'doctag');
  assert.ok(doctags.some((d) => d.includes('@param')), `expected @param doctag, got: ${doctags.join('|')}`);
});

// ---------- Attributes ----------

test('[v10] highlights attributes as meta', () => {
  const { value } = highlight('#[test]\n#[expected_failure(abort_code = 1)]\n#[view]\nfun foo() {}');
  const metas = textsOfKind(value, 'meta');
  assert.ok(metas.length >= 3, `expected at least 3 meta tokens, got ${metas.length}: ${metas.join('|')}`);
});

test('[v10] attribute name inside #[...] is highlighted as keyword', () => {
  // Main's grammar scopes the inner attribute name as `keyword` inside the meta block.
  const { value } = highlight('#[test_only] fun f() {}');
  // The attribute block exists
  assert.ok(textsOfKind(value, 'meta').length >= 1);
  // And the inner name is tagged as keyword
  assert.ok(textsOfKind(value, 'keyword').includes('test_only'),
    `expected test_only as keyword inside meta, got keywords: ${textsOfKind(value, 'keyword').join(',')}`);
});

// ---------- Title classification ----------

// v10 emits plain `hljs-title` rather than the v11 sub-scopes
// (`title.function` / `title.class`), so these tests filter on `title`.

test('[v10] classifies function name after fun as title', () => {
  const { value } = highlight('public fun do_thing(x: u64): u64 { x }');
  const titles = textsOfKind(value, 'title');
  assert.ok(titles.includes('do_thing'), `expected do_thing as title, got: ${titles.join(',')}`);
});

test('[v10] classifies struct and enum names (must be uppercase)', () => {
  const { value } = highlight('struct MyStruct { x: u64 } enum MyEnum { A, B }');
  const titles = textsOfKind(value, 'title');
  assert.ok(titles.includes('MyStruct'), `expected MyStruct as title, got: ${titles.join(',')}`);
  assert.ok(titles.includes('MyEnum'), `expected MyEnum as title, got: ${titles.join(',')}`);
});

test('[v10] classifies module path including address', () => {
  const { value } = highlight('module 0x1::shapes { }');
  const titles = textsOfKind(value, 'title');
  assert.ok(titles.some((c) => c.includes('0x1::shapes')),
    `expected module path as title, got: ${titles.join(',')}`);
});

test('[v10] classifies qualified path like addr::module::Item', () => {
  const { value } = highlight('let x = aptos_framework::coin::CoinStore;');
  const titles = textsOfKind(value, 'title');
  assert.ok(titles.some((c) => c.includes('aptos_framework::coin::CoinStore')),
    `expected qualified path as title, got: ${titles.join(',')}`);
});

// ---------- Negative ----------

test('[v10] non-keywords are not highlighted as keywords', () => {
  const { value } = highlight('my_var; another_thing; camelCase;');
  const kw = textsOfKind(value, 'keyword');
  assert.deepEqual(kw, []);
});

test('[v10] keyword inside identifier is not matched', () => {
  const { value } = highlight('module_name');
  const kw = textsOfKind(value, 'keyword');
  assert.deepEqual(kw, []);
});

// ---------- End-to-end Move 2 snippet ----------

test('[v10] Move 2 snippet: enum + match + is + attributes + assert!', () => {
  const snippet = [
    'module 0x1::shapes {',
    '    /// A shape variant',
    '    enum Shape has drop {',
    '        Circle { radius: u64 },',
    '        Rectangle { width: u64, height: u64 },',
    '    }',
    '',
    '    #[view]',
    '    public fun area(self: &Shape): u64 {',
    '        match (self) {',
    '            Circle { radius } => *radius * *radius * 3,',
    '            Rectangle { width, height } => *width * *height,',
    '        }',
    '    }',
    '',
    '    #[test]',
    '    fun test_is_circle() {',
    '        let s = Shape::Circle { radius: 2 };',
    '        assert!(s is Shape::Circle, 0);',
    '    }',
    '}',
  ].join('\n');

  const { value, language, errorRaised } = highlight(snippet);
  assert.equal(language, 'move');
  assert.equal(errorRaised, undefined);

  const kw = textsOfKind(value, 'keyword');
  for (const expected of ['module', 'enum', 'fun', 'public', 'match', 'is', 'let', 'has']) {
    assert.ok(kw.includes(expected), `expected keyword ${expected}, got: ${kw.join(',')}`);
  }
  assert.ok(textsOfKind(value, 'type').includes('u64'));
  assert.ok(textsOfKind(value, 'built_in').includes('drop'), 'expected `drop` ability as built_in');
  assert.ok(textsOfKind(value, 'built_in').includes('assert!'), 'expected `assert!` as built_in');
  assert.ok(textsOfKind(value, 'variable').includes('self'), 'expected `self` as variable.language');
  assert.ok(textsOfKind(value, 'comment').some((c) => c.includes('A shape variant')));
  assert.ok(textsOfKind(value, 'meta').length >= 2, 'expected at least 2 attribute meta blocks');
});
