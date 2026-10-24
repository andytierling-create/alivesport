import assert from "node:assert/strict";
import { test } from "node:test";
import { hashPassword, isHashedPassword, verifyPassword } from "./password";

test("a hashed password verifies and does not store the original", () => {
  const stored = hashPassword("play");
  assert.equal(isHashedPassword(stored), true);
  assert.equal(stored.includes("play"), false);
  assert.equal(verifyPassword("play", stored), true);
  assert.equal(verifyPassword("list", stored), false);
});

test("a leftover plaintext password still verifies until it is upgraded", () => {
  assert.equal(isHashedPassword("play"), false);
  assert.equal(verifyPassword("play", "play"), true);
  assert.equal(verifyPassword("list", "play"), false);
});
