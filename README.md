# highlightjs-move

[Highlight.js](https://highlightjs.org/) grammar definition for the
[Move](https://aptos.dev/build/smart-contracts/book) programming language on
[Aptos](https://aptos.dev).

Supports Move 2.x features including enums, pattern matching, lambdas, function
values, signed integers, and the Move Specification Language.

## Installation

### npm

```bash
npm install highlightjs-move highlight.js
```

### CDN (unpkg)

```html
<script src="https://unpkg.com/highlightjs-move"></script>
```

## Usage

Both ESM (`import`) and CommonJS (`require`) are supported out of the box.

### Node.js (ESM)

```js
import hljs from 'highlight.js/lib/core';
import move from 'highlightjs-move';

hljs.registerLanguage('move', move);

const code = `
module 0x1::example {
    public fun hello(): u64 { 42 }
}
`;

const highlighted = hljs.highlight(code, { language: 'move' });
console.log(highlighted.value);
```

### Node.js (CommonJS)

```js
const hljs = require('highlight.js/lib/core');
const move = require('highlightjs-move');

hljs.registerLanguage('move', move);
```

### Browser

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<script src="https://unpkg.com/highlightjs-move"></script>
<script>
  hljs.registerLanguage('move', hljsDefineMove);
  hljs.highlightAll();
</script>

<pre><code class="language-move">
module 0x1::coin {
    struct Coin&lt;phantom CoinType&gt; has key, store {
        value: u64,
    }
}
</code></pre>
```

### Highlight.js v10

A v10-compatible build is available for projects that haven't upgraded to v11 yet.
It uses the v10 grammar API (`className` instead of `scope`, etc.) but supports
all the same Move language features.

```js
// ESM
import hljs from 'highlight.js/lib/core';
import move from 'highlightjs-move/v10';

hljs.registerLanguage('move', move);
```

```js
// CommonJS
const hljs = require('highlight.js/lib/core');
const move = require('highlightjs-move/v10');

hljs.registerLanguage('move', move);
```

## Language Aliases

The grammar registers with the canonical name `Move` and the following aliases:

- `move`
- `aptos-move`
- `move-on-aptos`
- `move-lang`

Any of these can be used in fenced code blocks (e.g., `` ```move ``) or in
`class="language-move"` attributes.

## Supported Syntax

### Keywords

Declarations, visibility modifiers, control flow, ownership, and more:

`module` `script` `struct` `enum` `fun` `const` `use` `spec` `schema`
`public` `entry` `native` `inline` `friend` `package`
`if` `else` `while` `loop` `for` `in` `match` `break` `continue` `return` `abort`
`let` `mut` `move` `copy` `has` `acquires` `as` `Self` `phantom` `is`

### Specification Language

`pragma` `invariant` `ensures` `requires` `aborts_if` `aborts_with`
`include` `assume` `assert` `modifies` `emits` `apply` `axiom`
`forall` `exists` `choose` `old` `global` `with`

### Built-in Types

Unsigned integers: `u8` `u16` `u32` `u64` `u128` `u256`

Signed integers (Move 2.3+): `i8` `i16` `i32` `i64` `i128` `i256`

Other: `bool` `address` `signer` `vector`

### Built-in Functions & Macros

`assert!` `move_to` `move_from` `borrow_global` `borrow_global_mut` `freeze`

### Syntax Modes

| Feature | Examples |
|---|---|
| Doc comments | `/// documentation` |
| Line comments | `// comment` |
| Block comments | `/* ... */` (nested) |
| Byte strings | `b"hello\n"` |
| Hex strings | `x"DEADBEEF"` |
| Number literals | `42u64`, `0xCAFE`, `1_000_000u128`, `-1i8` |
| Address literals | `@0x1`, `@aptos_framework` |
| Attributes | `#[test]`, `#[resource_group_member(...)]` |
| Module declarations | `module 0x1::name { ... }` |
| Function declarations | `public entry fun name(...)` |
| Struct/Enum declarations | `struct Coin<T> has key { ... }` |
| Abilities (contextual) | `has copy, drop, key, store` |
| Module paths | `0x1::module::function` |
| Lambda expressions | `\|x\| x + 1`, `\|val: &u8\| { *val }` |
| vector constructor | `vector[1, 2, 3]` |
| `self` receiver | `fun method(self: &T)` |
| Function invocations | `foo()`, `obj.method()` |

## Development

```bash
git clone https://github.com/gregnazario/highlightjs-move.git
cd highlightjs-move
npm install
```

Test files are located in `test/`:
- `test/detect/move/default.txt` -- comprehensive detection test
- `test/markup/move/short.move` -- markup/rendering test

## References

- [Aptos Documentation](https://aptos.dev)
- [The Move Book](https://aptos.dev/build/smart-contracts/book)
- [Move Specification Language](https://aptos.dev/build/smart-contracts/prover/spec-lang)
- [Highlight.js Language Definition Guide](https://highlightjs.readthedocs.io/en/latest/language-guide.html)

## License

[MIT](LICENSE)
