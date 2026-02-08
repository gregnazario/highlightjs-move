/// Test module demonstrating Move syntax highlighting.
///
/// Covers: modules, structs, enums, functions, control flow,
/// pattern matching, lambdas, generics, abilities, attributes,
/// spec blocks, addresses, strings, numbers, and global storage.
module module_addr::short {
    use std::vector;
    use std::string::String;
    use std::option::{Self, Option};

    // ---- Constants ----
    const E_INVALID: u64 = 1;
    const MAX_VALUE: u128 = 1_000_000u128;
    const SIGNED_VAL: i64 = -100i64;

    // ---- Structs ----
    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    /// A single lockup, which has the same lockup period for all of them.
    ///
    /// These are stored on objects, which map to the appropriate escrows.
    struct TestStruct<phantom T> has drop {
        v1: u8,
        v2: u16,
    }

    /// Public struct with key ability.
    public struct PublicStruct has key {
        inner: u8,
    }

    // ---- Enums ----
    enum TestEnum<phantom T> has key, drop {
        A {
            v1: u8,
            v2: u16,
        }
        B {
            v1: u8,
            v2: u16,
            v3: bool,
        }
    }

    enum Ordering {
        Equal,
        Greater,
        Less,
    }

    enum Color has copy, drop {
        Red,
        Green,
        Blue,
    }

    // ---- Friend declarations ----
    friend module_addr::other;

    // ---- Functions ----
    public fun test_fun() {
        let enum1 = TestEnum::A<u8> {
            v1: 0,
            v2: 1,
        };

        match (&enum1) {
            /* Block comment inside match */
            _ => {}
        };

        let TestEnum::A {
            v1,
            v2,
        } = enum1;

        let enum2 = TestEnum::B<u8> {
            v1,
            v2,
            v3: true,
        };

        match (&enum2) {
            B { v1, v2, v3 } => {
                if (true) 0 else 1;
            }
            _ => {}
        };

        // Partial patterns with ..
        let TestEnum::B {
            v1: _bv1,
            v3: _,
            ..
        } = enum2;

        let str = TestStruct<u8> {
            v1,
            v2,
        };
        let TestStruct { v1: _tsv1, .. } = str;

        let var: u8 = 0;
        let ref = &mut var;
        *ref = 1;

        let (_num, _b) = tuple(true);
    }

    public fun tuple(input: bool): (u8, bool) {
        let (num, b) = if (input) {
            (5, false)
        } else {
            (2, true)
        };
        (num, b)
    }

    native public fun compare<T>(first: &T, second: &T): Ordering;

    /// Receiver-style function using `self`.
    public fun is_eq(self: &Ordering): bool {
        self is Ordering::Equal
    }

    /// Function values with abilities.
    struct Funcs {
        f: |u64| u64 has drop + copy,
    }

    /// Lambda with type.
    fun do_something(): vector<u8> {
        let vec = vector[0, 1, 2];
        vec.map_ref(|val: &u8| {
            *val
        })
    }

    /// For loop example.
    fun sum_range(n: u64): u64 {
        let sum = 0u64;
        for (i in 0..n) {
            sum = sum + i;
        };
        sum
    }

    /// While and loop with break/continue.
    fun loop_examples(n: u64): u64 {
        let i = 0;
        while (i < n) {
            i = i + 1;
            if (i % 10 == 0) continue;
        };

        let counter = 0;
        loop {
            counter = counter + 1;
            if (counter >= n) break;
        };
        counter
    }

    /// Ownership: move and copy.
    fun ownership() {
        let x: u64 = 42;
        let y = copy x;
        let z = move x;
        let _ = y + z;
    }

    /// Global storage operators.
    fun storage_example(account: &signer, addr: address) acquires PublicStruct {
        if (!exists<PublicStruct>(addr)) {
            move_to(account, PublicStruct { inner: 0 });
        };
        let r = borrow_global<PublicStruct>(addr);
        let _ = r.inner;
        let r_mut = borrow_global_mut<PublicStruct>(addr);
        r_mut.inner = 1;
    }

    /// String and address literals.
    fun literals() {
        let byte_str = b"hello world\n";
        let hex_str = x"DEADBEEF";
        let addr1 = @0x1;
        let addr2 = @aptos_framework;
        let num1 = 0xCAFE_BABEu64;
        let num2 = 1_000_000u128;
        let signed = -42i64;
    }

    /// Assert macro.
    fun check(x: u64) {
        assert!(x > 0, E_INVALID);
        if (x == 0) abort E_INVALID;
    }

    // ---- Inline and package functions ----
    inline fun double(x: u64): u64 { x * 2 }
    package fun internal(): u64 { 0 }

    // ---- Generics with constraints ----
    fun identity<T: copy + drop>(x: T): T { copy x }

    // ---- Test attributes ----
    #[test]
    fun test_1_func_semicolon() {
        do_something();
    }

    #[test_only]
    inline fun comparison_test(
        repeats: u64,
        inner_max_degree: u16,
        leaf_max_degree: u16,
        reuse_slots: bool,
        next_1: || u64,
        next_2: || u64,
    ): u64 {
        next_1() + next_2()
    }

    #[expected_failure(abort_code = E_INVALID)]
    #[test]
    fun test_failure() {
        abort E_INVALID
    }

    #[view]
    public fun view_fn(): u64 { 0 }

    // ---- Self receiver function ----
    fun self_functions(self: &Funcs, num: u64): u64 {
        // In Move, put parens around function value to call it
        (self.f)(num)
    }

    // ---- Spec blocks ----
    spec check {
        pragma aborts_if_is_partial = true;
        aborts_if x == 0;
        ensures result == x;
    }

    spec module {
        invariant forall addr: address where exists<PublicStruct>(addr):
            global<PublicStruct>(addr).inner <= 255;
    }

    spec schema ValidConfig {
        addr: address;
        requires exists<PublicStruct>(addr);
    }

    /*
    Block comment with nesting.
    /* This is a nested comment. */
    Still inside the outer comment.
    */
}
