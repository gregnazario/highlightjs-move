/*
Language: Move
Author: Greg Nazario <greg@gnazar.io>
Website: https://aptos.dev
*/

module.exports = function (hljs) {
  //Does not support unicode characters (should be replaced by \p{L} when possible)

  const regex = hljs.regex;

  const KEYWORDS = [
	  "abort",
	  "acquires",
	  "as",
	  "const",
	  "friend",
	  "use",
	  "break",
	  "continue",
	  "for",
	  "if",
	  "else",
	  "in",
	  "let",
	  "match",
	  "module",
	  "public",
	  "package",
	  "return",
	  "has",
	  "self",
	  "u8",
	  "u16",
	  "u32",
	  "u64",
	  "u128",
	  "u256",
	  "bool",
	  "address",
	  "vector",
	  "i8",
	  "i16",
	  "i32",
	  "i64",
	  "i128",
	  "i256",
	  "aborts_if",
	  "assert!",
	  "include",
	  "ensures",
	  "native",
  ];

  return {
    unicodeRegex: true,
    aliases: ['move', 'Move', 'aptos-move', 'move-on-aptos', 'move-lang'],
    keywords: KEYWORDS,
    contains: [
    ]
  };
}
